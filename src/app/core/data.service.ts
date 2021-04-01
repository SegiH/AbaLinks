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

     getInstanceName() {
          return this.http.get<any>('https://mylinks-instances.hovav.org/?task=getInstanceName&InstanceURL=https://segilinks.hovav.org')
          .pipe(
               catchError(this.handleError)
          );     
     }

     getLinks(instance: string) {
          return this.http.get<any>('LinkData.php?task=fetchData&InstanceName=' + instance)
          .pipe(
               catchError(this.handleError)
          );
     }

     getTypes(instance: string) {
        const endPoint=(instance == "SegiLinks" ? "LinkData.php?task=fetchSegiTypes" : "LinkData.php?task=fetchTypes");

        return this.http.get<any>(endPoint)
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
