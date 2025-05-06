import { Component, ContentChildren, OnInit, QueryList } from '@angular/core';

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
    this.userRole = sessionStorage.getItem('user_role_name')
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
}
