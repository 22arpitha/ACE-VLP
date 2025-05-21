import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { ApiserviceService } from 'src/app/service/apiservice.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent implements OnInit {
periodicityId:number | null = null;
userRole:any
period:{ year: string; month_list: string } = null;
employee:number | null = null;
resetFilter:boolean=false;
ondefaultSelection:boolean =true;
resetBtnDisable:boolean=false;
modeName:any;
tabs:string[] = ['Overall Productivity', 'Quantitative Productivity', 'Qualitative Productivity','Work Culture and Work Ethics',
   'Productive Hours','Non Billable Hours','Non Productive Hours' ];
  selectedTab: number = 0;
  commonFilterData:any={'employee_id':'','periodicity':'','period':''};
  user_id:any;
  allPeroidicitylist:any=[];
  selectTab(index: number): void {
    this.selectedTab = index;
    if(((this.userRole ==='Accountant' && !this.periodicityId && !this.period)||(!this.employee && !this.periodicityId && !this.period))){
      this.ondefaultSelection=true; 
      setTimeout(() => {
        this.applySearch();
      }, 300);
    }else{
      this.ondefaultSelection=false;
    }
  }
  constructor(private apiService: ApiserviceService) {
    this.userRole = sessionStorage.getItem('user_role_name');
    this.user_id = sessionStorage.getItem('user_id');
    this.getAllPeriodicity();
   }

  ngOnInit(): void {
    if(this.ondefaultSelection){
      setTimeout(() => this.applySearch(), 800);
    }
  }
  applySearch(){
    this.commonFilterData={'employee_id':this.employee,'periodicity':this.periodicityId,'period':this.period};
  }
  resetSearch(): void {
    this.resetBtnDisable=true;
    // Reset all filter-related data
    this.commonFilterData = {
      employee_id: '',
      periodicity: '',
      period: ''
    };
    this.periodicityId = null;
    this.period = null;
    this.employee = null;
  
    // Flags to manage UI state
    this.resetFilter = true;
    this.ondefaultSelection = false;
  
    // Determine if no filters are selected based on user role and current values
    const noFiltersSelected =
      !this.periodicityId && !this.period &&
      (this.userRole === 'Accountant' || !this.employee);  
    // Reset UI state and possibly re-apply search
    setTimeout(() => {
      this.resetFilter = false;
      if (noFiltersSelected) {
        this.ondefaultSelection = true;
        this.resetBtnDisable=false;
        // Apply the search with a slight delay
        setTimeout(() => {
          this.resetBtnDisable=false;
          this.applySearch()
        }, 300);
      }
    }, 100);
  }
  
  

  selectedEmployee(event:any){
this.employee=event;
  }
selectedPeriodicity(event:any){
  this.periodicityId=event;
  this.modeName = this.allPeroidicitylist.find((peroidicity:any)=>peroidicity.id=== this.periodicityId)?.periodicty_name;
}
selectedPeriod(event:{ year: string; month_list: string }){
this.period=event;
}

downloadExcel(){
 let query = `?productivity-type-for-all=Overall`;
  if(this.userRole === 'Admin' && !this.employee){
    query +=`&admin=True`
  }else{
    query += this.employee ? `&employee-id=${this.employee}` :`&employee-id=${this.user_id}`
  }
  if(this.period){
query +=`&period=${this.period}`
  }
  if(this.periodicityId){
query +=`&periodicity=${this.periodicityId}`
  }
      let apiUrl = `${environment.live_url}/${environment.download_excel}/${query}`;
      fetch(apiUrl)
      .then(res => res.blob())
      .then(blob => {
        //console.log('blob',blob);
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `productivity_reports.${'xlsx'}`;
        a.click();
      });
}

public getAllPeriodicity() {
    this.allPeroidicitylist = [];
    this.apiService.getData(`${environment.live_url}/${environment.settings_periodicty}/`).subscribe(
      (res: any) => {
        this.allPeroidicitylist = res;
      }, (error: any) => {
        this.apiService.showError(error?.error?.detail);
      });
  }
}
