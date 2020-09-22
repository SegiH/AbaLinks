import { Component, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { IAbaLink } from '../core/interfaces';
import { DataService } from '../core/data.service';
import { throwError } from 'rxjs/';

@Component({
  selector: 'app-abalinks',
  templateUrl: './AbaLinks.component.html',
  styleUrls: ['./AbaLinks.component.css']
})

export class AbaLinksComponent {
     AbaLinksColumns: string[] = ['ID','Name','URL','Type'];     
     AbaLinksPayload: IAbaLink[];
     AbaLinksDataSource: MatTableDataSource<any>;
     AbaLinksTypes: {} = null;
     editMode = false;
     isBeingEdited = false;
     
     @ViewChild(MatSort, { }) sort: MatSort;

     constructor(private dataService: DataService) {}

     ngOnInit() {
          //this.AbaLinksTypes=  {6 : "All",4 : "Document",5 : "Jokes",2 : "Song",1 : "Video",3 : "Website"};

          //this.AbaLinksPayload=[{ ID : 5, Name : "First Look at Yemenite Jews", URL: "https:\\\\www.haaretz.com\\israel-news\\MAGAZINE-first-ever-photos-of-yemen-s-jews-s",Type : "Website", Duration: "0:35"},{ ID : 5, Name : "First Look at Yemenite Jews", URL: "https:\\\\www.haaretz.com\\israel-news\\MAGAZINE-first-ever-photos-of-yemen-s-jews-s",Type : "Website"}];

          //this.AbaLinksDataSource=new MatTableDataSource(this.AbaLinksPayload);

          this.getLinks();
     }

     getLinks() {
          this.dataService.getTypes()
          .subscribe((types: any[]) => {
               this.AbaLinksTypes = types;

               this.dataService.getLinks()
               .subscribe((links: any[]) => {
                    this.AbaLinksPayload = links;

                    this.AbaLinksDataSource=new MatTableDataSource(this.AbaLinksPayload);

                    this.AbaLinksDataSource.sort = this.sort;
               },
               error => {
                    throwError("An error occurred getting the links");
               });
          },
          error => {
              throwError("An error occurred getting the types");
          });
     }
}
