import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs/';
import { catchError} from 'rxjs/operators';

@Injectable()
export class DataService {
     readonly showDialogEmitter = new EventEmitter<{message: string}>();

     constructor(private http: HttpClient) { }

     deleteLink(ID: number) {
          return this.http.get<any>('LinkData.php?task=deleteRow&LinkID=' + ID)
          .pipe(
               catchError(this.handleError)
          );
     }

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

     insertRow(name: string,URL: string,TypeID: number) {
          return this.http.get<any>('LinkData.php?task=insertRow&Name=' + encodeURIComponent(name) + '&URL=' + encodeURIComponent(URL) + '&Type=' + encodeURIComponent(TypeID))
          .pipe(
               catchError(this.handleError)
          );
     }

     showDialog(message: string) {
          this.showDialogEmitter.emit({message});
     }

     updateLink(ID: number, columnName: string, columnValue: any) {
          return this.http.get<any>('LinkData.php?task=updateRow&rowID=' + ID + '&columnName=' + columnName + '&columnValue=' + encodeURIComponent(columnValue))
          .pipe(
               catchError(this.handleError)
          );
     }
}