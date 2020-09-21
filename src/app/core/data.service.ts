import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
}