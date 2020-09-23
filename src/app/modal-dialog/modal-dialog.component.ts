import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
     selector: 'app-modal-dialog',
     templateUrl: 'modal-dialog.component.html',
     styleUrls: ['./modal-dialog.component.css']
})

export class ModalDialogComponent {
     constructor(public dialogRef: MatDialogRef<ModalDialogComponent>, @Inject(MAT_DIALOG_DATA) public data) {}

     onDialogClick(response) {
          this.data.response=response;
     }
}
