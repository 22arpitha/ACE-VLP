import { Component, OnInit,Inject } from '@angular/core';
import { MAT_DIALOG_DATA,MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-pdf-view',
  templateUrl: './pdf-view.component.html',
  styleUrls: ['./pdf-view.component.scss']
})
export class PdfViewComponent implements OnInit {
  fileUrl: string;
  fileType: string;
  constructor(
    public dialogRef: MatDialogRef<PdfViewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.fileUrl = data.url;
    this.fileType = data.type;
    console.log(this.fileUrl,this.fileType)
  }
  src = 'https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf';
  ngOnInit(): void {
  }

}
