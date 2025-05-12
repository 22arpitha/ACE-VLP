import { Component, ContentChildren, OnInit, QueryList } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent implements OnInit {
periodicityId:number | null = null;
userRole:any
period:number | null = null;
employee:number | null = null;
resetFilter:boolean=false;
ondefaultSelection:boolean =false;
tabs:string[] = ['Overall Productivity', 'Quantitative Productivity', 'Qualitative Productivity','Work Culture and Work Ethics',
   'Productive Hours','Non Billable Hours','Non Productive Hours' ];
  selectedTab: number = 0;
  commonFilterData:any={'employee_id':'','periodicity':'','period':''};
  user_id:any;
  selectTab(index: number): void {
    this.selectedTab = index;
    if(this.selectedTab ===  3 && ((this.userRole ==='Accountant' && !this.periodicityId && !this.period)||(!this.employee && !this.periodicityId && !this.period))){
      this.ondefaultSelection=true; 
      setTimeout(() => {
        this.applySearch();
      }, 300);
    }else{
      this.ondefaultSelection=false;
    }
  }
  constructor() {
    this.userRole = sessionStorage.getItem('user_role_name');
    this.user_id = sessionStorage.getItem('user_id');
   }

  ngOnInit(): void {
  }
  applySearch(){
    this.commonFilterData={'employee_id':this.employee,'periodicity':this.periodicityId,'period':this.period};
  console.log('this.commonFilterData',this.commonFilterData);
  }
  resetSearch(): void {
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
    // Check if the current tab is tab 3
    const isTab3 = this.selectedTab === 3;
  
    // Reset UI state and possibly re-apply search
    setTimeout(() => {
      this.resetFilter = false;
  
      if (isTab3 && noFiltersSelected) {
        this.ondefaultSelection = true;
  
        // Apply the search with a slight delay
        setTimeout(() => this.applySearch(), 300);
      }
    }, 100);
  }
  
  

  selectedEmployee(event:any){
this.employee=event;
  }
selectedPeriodicity(event:any){
  this.periodicityId=event;
}
selectedPeriod(event:any){
this.period=event;
}

downloadExcel(){
 let query = `?productivity-type-for-all=Overall`;
  if(this.userRole === 'Admin'){
    query +=`&admin=True`
  }else{
    query += this.employee ? `logged-in-user-id=${this.employee}` :`logged-in-user-id=${this.user_id}`
  }
  if(this.period){
query +=`&period=${this.period}&periodicity=${this.periodicityId}`
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
}
