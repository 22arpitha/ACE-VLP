import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ApiserviceService } from 'src/app/service/apiservice.service';

@Component({
  selector: 'app-flagged',
  templateUrl: './flagged.component.html',
  styleUrls: ['./flagged.component.scss']
})
export class FlaggedComponent implements OnInit {
  slno:any;
  date:any;
  people:any;
  timesheet:any;
  time:any;
  savedon:any;
  status:any;
  action:any;
  term:any='';
  list:any = [];
  constructor(private builder:FormBuilder, private api:ApiserviceService) { }

  ngOnInit(): void {
    this.getList();
  }
  getList(){
    // this.api.getTimeSheetDetails().subscribe((data:any)=>{
    //   this.list= data.result.data;
    //   //console.log(data.result.data);
      
    // }
    // )
  }
  delete(id:any){
    // this.api.deleteTimeSheeteDetails(id).subscribe((data:any)=>{
    //   this.getList();
    //   this.api.showWarning('Declined Leave Deleted Successfully!')
    // },error=>{
    //   //console.log(error);
      
    // })
    
   }

}
