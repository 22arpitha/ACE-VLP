import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-client-contact-details-popup',
  templateUrl: './client-contact-details-popup.component.html',
  styleUrls: ['./client-contact-details-popup.component.scss']
})
export class ClientContactDetailsPopupComponent implements OnInit {
contact_details:any=[];
  constructor(public dialogRef: MatDialogRef<ClientContactDetailsPopupComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any){
        this.contact_details=data?.contact_details;
      }
    

  ngOnInit(): void {
  }

}
