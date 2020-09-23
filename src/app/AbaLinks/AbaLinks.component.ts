// DONE - Add saving to server
// DONE - add ability to cancel instead of save
// DONE - add validation before saving - all 3 fields are required
// DONE - Don't allow user to select All as a type. Its only used for searching
// DONE - after editing/adding new row, fetch data
// DONE - add add panel
// add search panel
// add ability to delete row
// maybe create android app

// Allow adding of types in edit mode
// allow for easy adding of new columns
// add confirmation before deleting

import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ModalDialogComponent } from '../modal-dialog/modal-dialog.component';
import { IAbaLink } from '../core/interfaces';
import { DataService } from '../core/data.service';
import { throwError } from 'rxjs/';

@Component({
     selector: 'app-abalinks',
     templateUrl: './AbaLinks.component.html',
     styleUrls: ['./AbaLinks.component.css']
})

export class AbaLinksComponent {
     addName: string;
     addURL: string;
     addType: number;
     AbaLinksColumns: string[] = ['Edit','ID','Name','URL','Type'];     
     AbaLinksPayload: IAbaLink[];
     AbaLinksDataSource: MatTableDataSource<any>;
     AbaLinksTypes: any = null;
     currentlyBeingEditedID : number = 0;
     deleteResponse: string;
     dialogRef: any;
     isAdding: boolean;

     
     constructor(private dataService: DataService,public snackBar: MatSnackBar,public dialog: MatDialog) {
          this.dataService.showDialogEmitter.subscribe(messageData => {
               const message=messageData.message;
               
               //  Listen for emit event called by data service
               this.dialogRef = this.dialog.open(ModalDialogComponent, {               
                    data: { message },
                    disableClose: true,
                    width: '450px',
               });
          })
     }

     ngOnInit() {
          //this.AbaLinksTypes=  {6 : "All",4 : "Document",5 : "Jokes",2 : "Song",1 : "Video",3 : "Website"};

          //this.AbaLinksPayload=[{ ID : 5, Name : "First Look at Yemenite Jews", URL: "https:\\\\www.haaretz.com\\israel-news\\MAGAZINE-first-ever-photos-of-yemen-s-jews-s",Type : "Website", Duration: "0:35"},{ ID : 5, Name : "First Look at Yemenite Jews", URL: "https:\\\\www.haaretz.com\\israel-news\\MAGAZINE-first-ever-photos-of-yemen-s-jews-s",Type : "Website", Duration: "0:35"}];

          //this.AbaLinksDataSource=new MatTableDataSource(this.AbaLinksPayload);

          this.getLinks();
     }

     addLinkButtonClick() {
          // Do not allow the user to add a new item if they are already editing an item
          const editcount=this.AbaLinksPayload.reduce((a,c) => {if(c.IsBeingEdited) { a++ }; return a}, 0)
          
          if (editcount != 0) {
               this.showSnackBarMessage("You cannot add a link while editing another link");
               return;
          }

          this.isAdding = true;
     }

     addNewLinkClick(isSaving) {
          if (isSaving) {
               //debugger;

               if (typeof this.addName === 'undefined' || this.addName === "") {
                    this.showSnackBarMessage("Please enter the name of the link");
                    return;
               }

               if (typeof this.addURL === 'undefined' || this.addURL === "") {
                    this.showSnackBarMessage("Please enter the URL");
                    return;
               }

               if (!this.addURL.startsWith("http://") && !this.addURL.startsWith("https://")) {
                    this.showSnackBarMessage("The URL that you entered does not appear to be valid");
                    return;
               }

               if (typeof this.addType === 'undefined') {
                    this.showSnackBarMessage("Please select the type");
                    return;
               }

               this.dataService.insertRow(this.addName,this.addURL,this.addType)
                    .subscribe((response: any[]) => {     
                         this.isAdding = false;
                         this.addName = null;
                         this.addURL = null;
                         this.addType = null;

                         // Reload data after adding new link
                         this.getLinks();
                    },
                    error => {
                         this.isAdding = false;
                         this.addName = null;
                         this.addURL = null;
                         this.addType = null;
                         throwError("An error occurred adding the link");
                    });               
          }
     }

     confirmDeleteLink(response) {

     }

     deleteLinkRowClick(element) {
          this.dataService.showDialog("Are you sure that you want to delete this link ?");

          // Wait for response
          this.dialogRef.afterClosed().subscribe(result => {
               if (result.response == false) 
                    return;

               // implement delete row here 
               
          });
     }

     editClicked(element,editclicked) {
          // Only allow editing of 1 item at a time
          const editcount=this.AbaLinksPayload.reduce((a,c) => {if(c.IsBeingEdited) { a++ }; return a}, 0)
          
          if (editcount > 0 && element.ID != this.currentlyBeingEditedID) {
               this.showSnackBarMessage("You cannot edit a link while editing another link");
               return;
          } else if (this.isAdding) {
               this.showSnackBarMessage("You cannot edit a link while adding a link");
               return;
          }

          const item=this.AbaLinksPayload.find(Item => Item.ID === element.ID);
          
          if (editclicked) {
               if (item.IsModified) {
                    // Save Item

                    // Validate that all items are filled in
                    if (item.Name == null || item.Name == "") {
                         this.showSnackBarMessage("Please enter the name");
                         return;
                    }

                    if (item.URL == null || item.URL == "") {
                         this.showSnackBarMessage("Please enter the URL");
                         return;
                    }

                    // Each field is saved separately
                    this.dataService.updateLink(item.ID,"Name",item.Name)
                    .subscribe((response: any[]) => {               
                    },
                    error => {
                         throwError("An error occurred updating the name");
                    });

                    this.dataService.updateLink(item.ID,"URL",item.URL)
                    .subscribe((response: any[]) => {               
                    },
                    error => {
                         throwError("An error occurred updating the URL");
                    });

                    this.dataService.updateLink(item.ID,"TypeID",item.TypeID)
                    .subscribe((response: any[]) => {        
                         // Reload data after edit
                         this.getLinks();       
                    },
                    error => {
                         throwError("An error occurred updating the type");
                    });

                    item.IsModified = false;
               } else {
                    // Save ID of item that is currently being edited
                    this.currentlyBeingEditedID=item.ID;

                    item.OriginalItem= Object.assign({},item); // Make shallow copy of current item in case the user clicks on cancel
               }
          } else {
               item.Name=item.OriginalItem.Name;
               item.URL=item.OriginalItem.URL;
               item.TypeID=item.OriginalItem.TypeID;
          }

          item.IsBeingEdited=!item.IsBeingEdited;
     }

     fieldChanged(element) {
          const item=this.AbaLinksPayload.find(Item => Item.ID === element.ID);

          item.IsModified=true;
     }

     getEditImage(isBeingEdited) {
          isBeingEdited=(typeof isBeingEdited != 'undefined' ? isBeingEdited : false);

          return "../assets/" + (!isBeingEdited ? "edit.png" : "save.png")
     }

     getLinks() {
          this.dataService.getTypes()
          .subscribe((types: any[]) => {
               this.AbaLinksTypes = types;

               this.dataService.getLinks()
               .subscribe((links: any[]) => {
                    this.AbaLinksPayload = links;

                    this.AbaLinksDataSource=new MatTableDataSource(this.AbaLinksPayload);
               },
               error => {
                    throwError("An error occurred getting the links");
               });
          },
          error => {
              throwError("An error occurred getting the types");
          });
     }

     // Show snackbar message
     showSnackBarMessage(message: string) {
          const config = new MatSnackBarConfig();
          config.duration = 3000;
          this.snackBar.open(message, 'OK', config);
     }
}
