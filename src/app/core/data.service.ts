import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IAbaLink } from '../core/interfaces';
import { throwError } from 'rxjs/';
import { catchError} from 'rxjs/operators';

@Injectable()
export class DataService {
    constructor(private http: HttpClient) { }

     getLinks() {
          return this.http.get<any>('LinkData.php?task=fetchData')
          .pipe(
               catchError(this.handleError)
          );
     }

     getTypes() {
        return this.http.get<any>('LinkData.php?task=fetchTypes')
        .pipe(
             catchError(this.handleError)
        );
     }

     private handleError(error: Response | any) {
          if (error.error instanceof Error) {
               const errMessage = error.error.message;

               return throwError(errMessage);
               // Use the following instead if using lite-server
               // return Observable.throw(err.text() || 'backend server error');
          }

          return throwError(error || 'Node.js server error');
     }

     updateLink(ID: number, columnName: string, columnValue: any) {
          //  fetch('/LinkData.php?task=updateRow&rowID=' + rowID + '&columnName=' + columnName + '&columnValue=' + encodeURIComponent(columnValue), {method: 'GET',dataType:'json'}).then(response => response.json()).then((response) =>
          return this.http.get<any>('LinkData.php?task=updateRow&rowID=' + ID + '&columnName=' + columnName + '&columnValue=' + encodeURIComponent(columnValue))
          .pipe(
               catchError(this.handleError)
          );
     }
}