import { Component, OnInit } from '@angular/core';
import { ApiserviceService } from 'src/app/service/apiservice.service';

@Component({
  selector: 'app-timesheet-config',
  templateUrl: './timesheet-config.component.html',
  styleUrls: ['./timesheet-config.component.scss']
})
export class TimesheetConfigComponent implements OnInit {
 data:any =[
  {
    names:'People Timesheet',
    peopleTimesheet:[
     {names:'CREATE',value:'CREATE',checked:false,arrnames:'PEOPLE_TIMESHEET',module:'TIMESHEET',checkboxname:'timesheetcreate'},
     {names:'NA',value:'NA',checked:'NA',arrnames:'PEOPLE_TIMESHEET',module:'TIMESHEET',checkboxname:'timesheetupdate'},
     {names:'VIEW',value:'VIEW',checked:false,arrnames:'PEOPLE_TIMESHEET',module:'TIMESHEET',checkboxname:'timesheetview'},
     {names:'DELETE',value:'DELETE',checked:false,arrnames:'PEOPLE_TIMESHEET',module:'TIMESHEET',checkboxname:'timesheetdelete'},
     {names:'ACCEPT',value:'ACCEPT',checked:false,arrnames:'PEOPLE_TIMESHEET',module:'TIMESHEET',checkboxname:'timesheetaccept'},
     {names:'REJECT',value:'REJECT',checked:false,arrnames:'PEOPLE_TIMESHEET',module:'TIMESHEET',checkboxname:'timesheetreject'},
    //  {names:'NA',value:'NA',checked:'NA',arrnames:'PEOPLE_TIMESHEET',module:'TIMESHEET',checkboxname:'timesheetNA'},
    ]
  },
  {
    names:'People Timesheet Calendar',
    timesheetCalendar:[
      {names:'NA',value:'NA',checked:'NA',arrnames:'PEOPLE_TIMESHEET_CALENDER',module:'TIMESHEET',checkboxname:'calendercreate'},
      {names:'NA',value:'NA',checked:'NA',arrnames:'PEOPLE_TIMESHEET_CALENDER',module:'TIMESHEET',checkboxname:'calenderupdate'},
      {names:'VIEW',value:'VIEW',checked:false,arrnames:'PEOPLE_TIMESHEET_CALENDER',module:'TIMESHEET',checkboxname:'calenderview'},
      {names:'NA',value:'NA',checked:'NA',arrnames:'PEOPLE_TIMESHEET_CALENDER',module:'TIMESHEET',checkboxname:'calenderdelete'},
      {names:'NA',value:'NA',checked:'NA',arrnames:'PEOPLE_TIMESHEET_CALENDER',module:'TIMESHEET',checkboxname:'calenderaccept'},
      {names:'NA',value:'NA',checked:'NA',arrnames:'PEOPLE_TIMESHEET_CALENDER',module:'TIMESHEET',checkboxname:'calenderreject'},
      // {names:'NA',value:'NA',checked:'NA',arrnames:'PEOPLE_TIMESHEET_CALENDER',module:'TIMESHEET',checkboxname:'calenderNA'}
    ]
  },
  
 ]
 data2:any=[
  {names:'Todays Approval Timesheet',
  todaysApproval:[
    {names:'VIEW',value:'VIEW',checked:false,arrnames:'TODAY_APPROVAL_TIMESHEET',module:'TIMESHEET',checkboxname:'todayscreate'},
    {names:'ACCEPT',value:'ACCEPT',checked:false,arrnames:'TODAY_APPROVAL_TIMESHEET',module:'TIMESHEET',checkboxname:'todaysupdate'},
    {names:'REJECT',value:'REJECT',checked:false,arrnames:'TODAY_APPROVAL_TIMESHEET',module:'TIMESHEET',checkboxname:'todaysview'},
    // {names:'NA',value:'NA',checked:'NA',arrnames:'TODAY_APPROVAL_TIMESHEET',module:'TIMESHEET',checkboxname:'todaysdelete'},
    // {names:'NA',value:'NA',checked:'NA',arrnames:'TODAY_APPROVAL_TIMESHEET',module:'TIMESHEET',checkboxname:'todaysaccept'},
    // {names:'NA',value:'NA',checked:'NA',arrnames:'TODAY_APPROVAL_TIMESHEET',module:'TIMESHEET',checkboxname:'todaysreject'},
    // {names:'NA',value:'NA',checked:'NA',arrnames:'TODAY_APPROVAL_TIMESHEET',module:'TIMESHEET',checkboxname:'todaysNA'},
    // {names:'DEADLINECROSSED',value:'DEADLINECROSSED',checked:false,arrnames:'TODAY_APPROVAL_TIMESHEET'},
  ]
  },
  {
    names:'Month Approval Timesheet',
    monthApproval:[
      {names:'VIEW',value:'VIEW',checked:false,arrnames:'MONTH_APPROVAL_TIMESHEET',module:'TIMESHEET',checkboxname:'monthscreate'},
      {names:'ACCEPT',value:'ACCEPT',checked:false,arrnames:'MONTH_APPROVAL_TIMESHEET',module:'TIMESHEET',checkboxname:'monthupdate'},
      {names:'REJECT',value:'REJECT',checked:false,arrnames:'MONTH_APPROVAL_TIMESHEET',module:'TIMESHEET',checkboxname:'monthsview'},
      // {names:'NA',value:'NA',checked:'NA',arrnames:'MONTH_APPROVAL_TIMESHEET',module:'TIMESHEET',checkboxname:'monthsdelete'},
      // {names:'NA',value:'NA',checked:'NA',arrnames:'MONTH_APPROVAL_TIMESHEET',module:'TIMESHEET',checkboxname:'monthsaccept'},
      // {names:'NA',value:'NA',checked:'NA',arrnames:'MONTH_APPROVAL_TIMESHEET',module:'TIMESHEET',checkboxname:'monthreject'},
      // {names:'NA',value:'NA',checked:'NA',arrnames:'MONTH_APPROVAL_TIMESHEET',module:'TIMESHEET',checkboxname:'monthsNA'},
      // {names:'AUTO_APPROVE',value:'NA',checked:'NA',arrnames:'MONTH_APPROVAL_TIMESHEET',module:'TIMESHEET'},
      // {names:'DEADLINECROSSED',value:'DEADLINECROSSED',checked:false,arrnames:'MONTH_APPROVAL_TIMESHEET'},
    ]
  },
  {
    //ADD ARR NAMES----------------------------------------------------------
    names:'Dead Line Crossed',
    deadLineCrossed:[
      {names:'VIEW',value:'VIEW',checked:false,arrnames:'DEAD_LINE_CROSSED',module:'TIMESHEET',checkboxname:'deadlinecreate'},
      {names:'ACCEPT',value:'ACCEPT',checked:false,arrnames:'DEAD_LINE_CROSSED',module:'TIMESHEET',checkboxname:'deadlineupdate'},
      {names:'REJECT',value:'REJECT',checked:false,arrnames:'DEAD_LINE_CROSSED',module:'TIMESHEET',checkboxname:'deadlineview'},
      // {names:'NA',value:'NA',checked:'NA',arrnames:'DEAD_LINE_CROSSED',module:'TIMESHEET',checkboxname:'deadlinedelete'},
      // {names:'NA',value:'NA',checked:'NA',arrnames:'DEAD_LINE_CROSSED',module:'TIMESHEET',checkboxname:'deadlineaccept'},
      // {names:'NA',value:'NA',checked:'NA',arrnames:'DEAD_LINE_CROSSED',module:'TIMESHEET',checkboxname:'deadlinereject'},
      // {names:'NA',value:'NA',checked:'NA',arrnames:'DEAD_LINE_CROSSED',module:'TIMESHEET',checkboxname:'deadlineNA'},
      // {names:'AUTO_APPROVE',value:'NA',checked:'NA',arrnames:'MONTH_APPROVAL_TIMESHEET',module:'TIMESHEET'},
      // {names:'DEADLINECROSSED',value:'DEADLINECROSSED',checked:false,arrnames:'MONTH_APPROVAL_TIMESHEET'},
    ]
  },
  {
    //ADD ARR NAMES----------------------------------------------------------
    names:'Approval Configuration',
    approvalConfiguration:[
      {names:'VIEW',value:'VIEW',checked:false,arrnames:'APPROVAL_CONFIGURATION',module:'TIMESHEET',checkboxname:'approvalcofigcreate'},
      {names:'ACCEPT',value:'ACCEPT',checked:false,arrnames:'APPROVAL_CONFIGURATION',module:'TIMESHEET',checkboxname:'approvalcofigupdate'},
      {names:'REJECT',value:'REJECT',checked:false,arrnames:'APPROVAL_CONFIGURATION',module:'TIMESHEET',checkboxname:'approvalcofigdelete'},
      // {names:'NA',value:'NA',checked:'NA',arrnames:'APPROVAL_CONFIGURATION',module:'TIMESHEET',checkboxname:'approvalcofigview'},
      // {names:'NA',value:'NA',checked:'NA',arrnames:'APPROVAL_CONFIGURATION',module:'TIMESHEET',checkboxname:'approvalcofigaccept'},
      // {names:'NA',value:'NA',checked:'NA',arrnames:'APPROVAL_CONFIGURATION',module:'TIMESHEET',checkboxname:'approvalcofigreject'},
      // {names:'NA',value:'NA',checked:'NA',arrnames:'APPROVAL_CONFIGURATION',module:'TIMESHEET',checkboxname:'approvalcofigNa'},
      // {names:'AUTO_APPROVE',value:'NA',checked:'NA',arrnames:'MONTH_APPROVAL_TIMESHEET',module:'TIMESHEET'},
      // {names:'DEADLINECROSSED',value:'DEADLINECROSSED',checked:false,arrnames:'MONTH_APPROVAL_TIMESHEET'},
    ]
  }
 ]
  id: string;
  singleChecked: boolean = false;
  permission: any;
  userRole: string;
  checkAll:boolean;
  orgId: string;
  constructor(private api:ApiserviceService) { }

  ngOnInit(): void {
   this.id =  sessionStorage.getItem('designation_id')
   this.orgId = sessionStorage.getItem('org_id')
   this.userRole =sessionStorage.getItem('user_role_c_side') 
   this.getUserControls();
  }
  getUserControls(){
    this.api.getUserRoleById(`id=${this.id}&page_number=1&data_per_page=10&pagination=TRUE&organization_id=${this.orgId}`).subscribe(res=>{
      if (res) {
        //console.log(res, "RESPONSE")
        this.permission = res['data'];
      
        this.permission.forEach(item => {
          item.permissions.forEach(permission => {
            Object.keys(permission).forEach(key => {
              permission[key].forEach(subPermission => {
                this.data.forEach(dataItem => {
                  Object.keys(dataItem).forEach(dataKey => {
                    if (Array.isArray(dataItem[dataKey])) {
                      dataItem[dataKey].forEach(option => {
                        if (option.arrnames === key && option.names === subPermission) {
                          option.checked = true;
                        }
                      });
                    }
                  });
                });
              });
            });
          });
        });
        this.permission.forEach(item => {
          item.permissions.forEach(permission => {
            Object.keys(permission).forEach(key => {
              permission[key].forEach(subPermission => {
                this.data2.forEach(dataItem => {
                  Object.keys(dataItem).forEach(dataKey => {
                    if (Array.isArray(dataItem[dataKey])) {
                      dataItem[dataKey].forEach(option => {
                        if (option.arrnames === key && option.names === subPermission) {
                          option.checked = true;
                          
                        }
                      });
                    }
                  });
                });
              });
            });
          });
        });
        this.singleSelection() 
      }
      
    })
    }
  
    singleSelection() {
      this.singleChecked = true;
    // Check if 'data' is defined and is an array
    if (Array.isArray(this.data)) {
      // Find all checkboxes (except 'NA') in 'data'
      const allCheckboxes = this.data.flatMap(item => {
        const checkboxes = [];
        for (const key in item) {
          if (Array.isArray(item[key])) {
            checkboxes.push(...item[key]);
          }
        }
        return checkboxes;
      });
  
      // Check if all checkboxes (except 'NA') are checked
      const allChecked = allCheckboxes.every(
        checkbox => checkbox?.checked === true || checkbox?.checked === 'NA'
      );
  
      // Set 'this.checkAll' based on whether all checkboxes are checked or not
      this.checkAll = allChecked;
    } else {
      console.error("'data' is not defined or is not an array.");
    }
    if(Array.isArray(this.data2)){
      // Find all checkboxes (except 'NA') in 'data'
      const allCheckboxes = this.data2.flatMap(item => {
        const checkboxes = [];
        for (const key in item) {
          if (Array.isArray(item[key])) {
            checkboxes.push(...item[key]);
          }
        }
        return checkboxes;
      });

      // Check if all checkboxes (except 'NA') are checked
      const allChecked = allCheckboxes.every(
        checkbox => checkbox?.checked === true || checkbox?.checked === 'NA'
      );

      // Set 'this.checkAll' based on whether all checkboxes are checked or not
      this.checkAll = allChecked;
    }
    else {
      console.error("'data' is not defined or is not an array.");
    }
    }
    
  checkAllOptions() {
    this.data.map(item => {
      const keys = Object.keys(item);
      keys.forEach(key => {
        if (Array.isArray(item[key])) {
          item[key].map(option => {
           if(this.checkAll == true){
            option.checked = true
              }
              else{
                option.checked = false
              }
          }
          );
        }
      });
    });
    this.data2.map(item => {
      const keys = Object.keys(item);
      keys.forEach(key => {
        if (Array.isArray(item[key])) {
          item[key].map(option => {
           if(this.checkAll == true ){
            option.checked = true
              }
              else{
                option.checked = false
              }
          }
          );
        }
      });
    });
    this.singleChecked = false;
   // //console.log(this.data,"DATA SELECTED ALLL")
  }
  removePermissionsIfExists(selectedOptions) {
    return this.permission.map((item) => {
      const timesheetIndex = item.module_name.indexOf("TIMESHEET");
      if (timesheetIndex !== -1) {
        item.module_name.splice(timesheetIndex, 1);
        item.permissions.splice(timesheetIndex, 1);
        // Add "TIMESHEET" to module_name array at index 0
        item.module_name.unshift("TIMESHEET");
  
        // Add permissions object at index 0 in permissions array
        item.permissions.unshift(selectedOptions);
      }
      else{
        // Add "TIMESHEET" to module_name array at index 0
        item.module_name.unshift("TIMESHEET");
  
        // Add permissions object at index 0 in permissions array
        item.permissions.unshift(selectedOptions);
      }
      //console.log(item,'item')
      return item;
    });
   
  }
  UPDATE() {
   //console.log(this.permission)
    const selectedOptions = {}; // create an empty object to store selected options
  
    Object.values(this.data).forEach(item => {
      const keys = Object.keys(item);
  
      keys.forEach(key => {
        if (Array.isArray(item[key])) {
          item[key].forEach(option => {
            if (!selectedOptions[option.arrnames]) {
              selectedOptions[option.arrnames] = []; // create an empty array for new arrnames
            }
            if (option.checked == true && option.names !== 'NA' ) {
              selectedOptions[option.arrnames].push(option.names); // add name to arrnames array
            }
          });
        }
      });
    });
    
  
    Object.values(this.data2).forEach(item => {
      const keys = Object.keys(item);
  
      keys.forEach(key => {
        if (Array.isArray(item[key])) {
          item[key].forEach(option => {
            if (!selectedOptions[option.arrnames]) {
              selectedOptions[option.arrnames] = []; // create an empty array for new arrnames
            }
            if (option.checked == true && option.names !== 'NA') {
              selectedOptions[option.arrnames].push(option.names); // add name to arrnames array
            }
          });
        }
      });
    });
   ////console.log(selectedOptions, 'SELECTED'); // log object of selected options
  this.removePermissionsIfExists(selectedOptions)
  let data = {};
    data={
      update: "ACCESSIBILITY",   
      module_name:this.permission[0].module_name,
      permissions: this.permission[0].permissions,
      organization_id:this.orgId
   };
  //console.log(data['permissions'],"PERMission") 
    this.api.userAccessConfig(this.id, data).subscribe(res => {
      if (res) {
        this.api.showSuccess(res['result'].status)
      }
      else {
        this.api.showError(res['error'])
      }
    })
  }
}
