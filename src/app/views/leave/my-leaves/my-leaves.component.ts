import { Component, OnInit } from '@angular/core';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-my-leaves',
  templateUrl: './my-leaves.component.html',
  styleUrls: ['./my-leaves.component.scss']
})
export class MyLeavesComponent implements OnInit {

  userRole:any = "";
  user_id:any;

  constructor(private apiService: ApiserviceService,) {
    this.userRole = sessionStorage.getItem('user_role_name');
    this.user_id = sessionStorage.getItem('user_id');
   }

   my_leaves:any = []

  ngOnInit(): void {
    this.getMyLeaves()
  }

  getMyLeaves(){
    this.apiService.getData(`${environment.live_url}/${environment.apply_leaves}/?leave_employee_id=${this.user_id}&page=1&page_size=10`).subscribe(
      (res:any)=>{
        console.log(res.results);
        this.my_leaves = res.results
        
      }
    )
  }

}
