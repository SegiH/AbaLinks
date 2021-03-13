/* 
TO DO:

Hide main content and show loading screen while loading data
make URL column narrower
test editing
*/


import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ModalDialogComponent } from '../modal-dialog/modal-dialog.component';
import { IMyLink } from '../core/interfaces';
import { DataService } from '../core/data.service';
import { throwError } from 'rxjs/';

export interface PeriodicElement {
     name: string;
     position: number;
     weight: number;
     symbol: string;
   }

@Component({
     selector: 'app-mylinks',
     templateUrl: './MyLinks.component.html',
     styleUrls: ['./MyLinks.component.css','./MyLinksResizeableColumn.scss']
     //styleUrls: ['./MyLinksResizeableColumn.scss']
})

export class MyLinksComponent {
     addName: string;
     addURL: string;
     addType: number;
     MyLinksColumns: string[] = ['Edit','ID','Name','URL','Type'];
     MyLinksResizeableColumns: boolean[] = [false,false,true,true,true];
     //MyLinksColumns: string[] = ['Edit','ID','Name'];
     MyLinksPayload: IMyLink[];
     MyLinksDataSource: MatTableDataSource<any>;
     MyLinksTypes: any = null;
     currentlyBeingEditedID : number = 0;
     deleteResponse: string;
     dialogRef: any;
     isAdding: boolean;
     searchName: string;
     searchURL: string
     searchType: number;
     title: string     
     
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
          // Use this for offline debugging
          //this.MyLinksTypes=  {6 : "All",4 : "Document",5 : "Jokes",2 : "Song",1 : "Video",3 : "Website"};
          //this.MyLinksPayload=[{ ID : 5, Name : "First Look at Yemenite Jews", URL: "https:\\\\www.haaretz.com\\israel-news\\MAGAZINE-first-ever-photos-of-yemen-s-jews-s",Type : "Website", Duration: "0:35"},{ ID : 5, Name : "First Look at Yemenite Jews", URL: "https:\\\\www.haaretz.com\\israel-news\\MAGAZINE-first-ever-photos-of-yemen-s-jews-s",Type : "Website", Duration: "0:35"}];
          //this.MyLinksDataSource=new MatTableDataSource(this.MyLinksPayload);

          this.dataService.getInstanceName()
          .subscribe((response: any[]) => {  
               if (response.length > 0)
                    this.title=response[0].Name;
               else 
                    this.title="MyLinks";

               this.getLinks();
          },
          error => {
               throwError("An error occurred deleting the link");
          });
     }

     // Event when the user clicks on the button to add a new link
     addLinkButtonClick() {
          // Do not allow the user to add a new item if they are already editing an item
          const editcount=this.MyLinksPayload.reduce((a,c) => {if(c.IsBeingEdited) { a++ }; return a}, 0)
          
          if (editcount != 0) {
               this.showSnackBarMessage("You cannot add a new link while editing another link. Save the other link first");
               return;
          }

          this.isAdding = true;
     }

     // Event when the user clicks on the link to save the newly added link
     addNewLinkClick(isSaving) {
          if (isSaving) {
               // Validate all add fields
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

          this.isAdding = false;
     }

     applyFilter(filterValue: string) {
          this.MyLinksDataSource.filter = filterValue;

          this.createLinkFilter()
     }

     // Custom Material UI table filter function
     createLinkFilter() {          
          const delimiter: string = ":";

          let filterFunction = function (data: any, filter: string): boolean {
               let customSearch = () => {
                    let found = false;
               
                    // When searhing by type, the typ e id is returned. we do not want to match the url against this because it will match almost everything so 
                    // I added filter.length > 1 to fix this
                    if ((data.Name.trim() !== "" && data.Name.toLowerCase().includes(filter.toLowerCase()) === true) || (filter.length > 1 && data.URL.trim() !== "" && data.URL.toLowerCase().includes(filter.toLowerCase()) === true))
                         found=true;                    

                    if (data.TypeID==filter || (data.TypeID != filter && filter == "6")) // 6=All
                         found=true;
               
                    return found;
               }

               return customSearch();
          }

          return filterFunction;
     }

     deleteLinkRowClick(element : any) {
          this.dataService.showDialog("Are you sure that you want to delete this link ?");

          // Wait for response
          this.dialogRef.afterClosed().subscribe(result => {
               if (result.response == false) 
                    return;

               const item=this.MyLinksPayload.find(Item => Item.ID === element.ID);

               this.dataService.deleteLink(item.ID)
                    .subscribe((response: any[]) => {    
                         // After deleting the row, fetch the data
                         this.getLinks();        
                    },
                    error => {
                         throwError("An error occurred deleting the link");
                    });
          });
     }

     editClicked(element,editclicked) {
          // Only allow editing of 1 item at a time
          const editcount=this.MyLinksPayload.reduce((a,c) => {if(c.IsBeingEdited) { a++ }; return a}, 0)
          
          if (editcount > 0 && element.ID != this.currentlyBeingEditedID) {
               this.showSnackBarMessage("You cannot edit a link while editing another link");
               return;
          } else if (this.isAdding) {
               this.showSnackBarMessage("You cannot edit a link while adding a link");
               return;
          }

          const item=this.MyLinksPayload.find(Item => Item.ID === element.ID);
          
          if (editclicked) { // Edit button was clicked
               if (!item.IsModified) { // button was clicked when the button text is Edit
                     // Save ID of item that is currently being edited
                     this.currentlyBeingEditedID=item.ID;

                     item.OriginalItem= Object.assign({},item); // Make shallow copy of current item in case the user clicks on cancel
               } else { // Save was clicked
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
               }
          } else { // Cancel was clicked
               item.Name=item.OriginalItem.Name;
               item.URL=item.OriginalItem.URL;
               item.TypeID=item.OriginalItem.TypeID;
          }

          // toggle editing status for the individual item
          item.IsBeingEdited=!item.IsBeingEdited;
     }

     fieldChanged(element) {
          const item=this.MyLinksPayload.find(Item => Item.ID === element.ID);

          item.IsModified=true;
     }

     getEditImage(isBeingEdited) {
          isBeingEdited=(typeof isBeingEdited != 'undefined' ? isBeingEdited : false);

          return "../assets/" + (!isBeingEdited ? "edit.png" : "save.png")
     }

     getLinks() {
          this.dataService.getTypes(this.title)
          .subscribe((types: any[]) => {
               this.MyLinksTypes = types;

               this.dataService.getLinks(this.title)
               .subscribe((links: any[]) => {
                    this.MyLinksPayload = links;

                    this.MyLinksDataSource=new MatTableDataSource(this.MyLinksPayload);

                    // Assign custom filter function
                    this.MyLinksDataSource.filterPredicate = this.createLinkFilter();
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

     // Used to prevent the entire DOM tree from being re-rendered every time that there is a change
     trackByFn(index, item) {
          return index; // or item.id
     }
}