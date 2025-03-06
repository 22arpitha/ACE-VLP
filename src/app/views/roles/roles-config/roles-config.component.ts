import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ApiserviceService } from 'src/app/service/apiservice.service';

@Component({
  selector: 'app-roles-config',
  templateUrl: './roles-config.component.html',
  styleUrls: ['./roles-config.component.scss']
})
export class RolesConfigComponent implements OnInit {
data:any = [
  {
  names:'Roles',
  rolesMenu:[ 
      { names: 'CREATE', value: 'CREATE', checked: false ,arrnames:'ROLES',module:'ROLES'},
      { names: 'UPDATE', value: 'UPDATE', checked: false ,arrnames:'ROLES',module:'ROLES'},
      { names: 'VIEW', value: 'VIEW', checked: false ,arrnames:'ROLES',module:'ROLES'},
      { names: 'DELETE', value: 'DELETE', checked: false,arrnames:'ROLES',module:'ROLES' }
    ]
  },
  {
  names:'Roles Accessbility',
  rolesAccessMenu:[ 
    { names: 'CREATE', value: 'CREATE', checked: false ,arrnames:'ROLES_ACCESSIBILITY',module:'ROLES'},
    { names: 'UPDATE', value: 'UPDATE', checked: false ,arrnames:'ROLES_ACCESSIBILITY',module:'ROLES'},
    { names: 'VIEW', value: 'VIEW', checked: false  ,arrnames:'ROLES_ACCESSIBILITY',module:'ROLES'},
    { names: 'NA', value: 'NA', checked: 'NA'  ,arrnames:'ROLES_ACCESSIBILITY',module:'ROLES'}
    ]
  }
  
  ]
userRole: string;
singleChecked: boolean = false;
id: string;
user_id: string;
permission:any ={};
permissionkeys: string[];
checkAll: boolean;
  orgId: string;
constructor(private api:ApiserviceService) { }
 
ngOnInit(): void {
  this.id = sessionStorage.getItem('designation_id')
  this.orgId = sessionStorage.getItem('org_id')
  this.userRole =sessionStorage.getItem('user_role_c_side') 
  this.getUserControls();
}

getUserControls() {
  this.api.getUserRoleById(`id=${this.id}&page_number=1&data_per_page=10&pagination=TRUE&organization_id=${this.orgId}`).subscribe(
    (res) => {
      if (res) {
        this.permission = res['data'];

        let allNonNAOptionsChecked = false; // Initialize the flag for non-'NA' options to true

        this.permission.forEach((item) => {
          item.permissions.forEach((permission) => {
            Object.keys(permission).forEach((key) => {
              permission[key].forEach((subPermission) => {
                this.data.forEach((dataItem) => {
                  Object.keys(dataItem).forEach((dataKey) => {
                    if (Array.isArray(dataItem[dataKey])) {
                      dataItem[dataKey].forEach((option) => {
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
        this.singleSelection('event','type','num')
      }
    },
    (error) => {
      this.api.showError(error.error.error.message);
    }
  );
}


checkAllOptions() {
  // this.checkAll = true
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
  this.singleChecked = false;
  ////console.log(this.data,"DATA SELECTED ALLL")
}
singleSelection(event, type, num) {
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
}

removePermissionsIfExists(selectedOptions) {
return this.permission.map((item) => {
  const permissionIndex = item.module_name.indexOf("ROLES");
  if (permissionIndex !== -1) {
    item.module_name.splice(permissionIndex, 1);
    item.permissions.splice(permissionIndex, 1);
    // Add ROLES to module_name array at index 0
    item.module_name.unshift("ROLES");

    // Add permissions object at index 0 in permissions array
    item.permissions.unshift(selectedOptions);
  }
  else{
     // Add ROLES to module_name array at index 0
     item.module_name.unshift("ROLES");

     // Add permissions object at index 0 in permissions array
     item.permissions.unshift(selectedOptions);
  }
  ////console.log(item,'item')
  return item;
});

}
UPDATE() {
const selectedOptions = {}; // create an empty object to store selected options

Object.values(this.data).forEach(item => {
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
this.removePermissionsIfExists(selectedOptions)
// //console.log(selectedOptions, 'SELECTED'); // log object of selected options

let data = {};
  data={
  update: "ACCESSIBILITY",   
  module_name:this.permission[0].module_name,
  permissions: this.permission[0].permissions,
  organization_id:this.orgId
  };
  

////console.log(data,'DATAPermissions--')
this.api.userAccessConfig(this.id, data).subscribe(res => {
  if (res) {
    this.api.showSuccess(res['result'].status)
    // this.router.navigate([`/role/roles-access/${this.id}`])
  }
  else {
    this.api.showError(res['error'])
  }
},(error =>{
  this.api.showError(error.error.error.message)
}))
}
}
