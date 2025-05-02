import { Component, ContentChildren, OnInit, QueryList } from '@angular/core';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent implements OnInit {
periodicityId:any;
userRole:any
period:any;
employee:any;
resetFilter:boolean=false;
ondefaultSelection:boolean =false;
tabs:string[] = ['Overall Productivity', 'Quantitative Productivity', 'Qualitative Productivity','Work Culture and Work Ethics',
   'Productive Hours','Non Billable Hours','Non Productive Hours' ];
  selectedTab: number = 0;
  commonFilterData:any={'employee_id':'','periodicity':'','period':''};
  selectTab(index: number): void {
    this.selectedTab = index;
    if(this.selectedTab ===  3 && !this.periodicityId && !this.employee && !this.period){
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
  }
  resetSearch(): void {
    this.commonFilterData = {
      employee_id: '',
      periodicity: '',
      period: ''
    };
    this.resetFilter = true;
    const noFiltersSelected = !this.periodicityId && !this.employee && !this.period;
    const isTab3 = this.selectedTab === 3;
    if (isTab3 && noFiltersSelected) {
      this.ondefaultSelection = true;
      setTimeout(() => this.applySearch(), 300);
    }
    setTimeout(() => {
      this.resetFilter = false;
      if (!this.resetFilter) {
        this.ondefaultSelection = isTab3 && noFiltersSelected;
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
