import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-roles-access',
  templateUrl: './roles-access.component.html',
  styleUrls: ['./roles-access.component.scss']
})
export class RolesAccessComponent implements OnInit {
  // @Output() allChildrens = new EventEmitter<any>();
  BreadCrumbsTitle: any = 'Roles Accessibilty';
  rolesAccessForm: FormGroup
  designation_id: any;
  mainMenu: any = []
  show = true;
  role: string;
  user_id: any;
  organization_id: any;
  hasAccessData: boolean = false;
  allSelected: boolean = false;
  selectedLabelNames: any = [];
  itemId: any;
  buttonName: any;
  selectedTab: any = null;
  user_role: any
  constructor(private _fb: FormBuilder, private router: Router, private routes: ActivatedRoute, private common_service: CommonServiceService,
    private api: ApiserviceService,
  ) {
    this.user_id = sessionStorage.getItem('user_id')
    this.designation_id = this.routes.snapshot.paramMap.get('id')
    this.user_role = sessionStorage.getItem('user_role_name')
    
  }


  ngOnInit(): void {
    this.selectedLabelNames = [];
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.getDesignationNameFromDesignationId();
    this.allrolesList();
  }




  getDesignationNameFromDesignationId() {
    this.api.getData(`${environment.live_url}/${environment.settings_roles}/${this.designation_id}/`).subscribe((res: any) => {
      this.role = res.designation_name;
    })
  }

  // side bar module list
  allrolesList() {
    this.api.getData(`${environment.live_url}/${environment.user_access}/${this.user_id}/`).subscribe(
      (data: any) => {
        console.log('all list', data,)
        this.mainMenu = data.access_list.filter((module_name) => module_name.name != 'Subscription');
        this.getAccessbilitiesByDesignationId();
      },
      (error: any) => {
        console.log('error', error)
      }
    )
  }

  // get access given data
  getAccessbilitiesByDesignationId() {
    this.api.getData(`${environment.live_url}/${environment.roles_access}/?designation=${this.designation_id}`).subscribe(
      (res: any) => {
        console.log(res, 'sub modules')
        if (res.length == 0 || res[0].access_list.length == 0) {
          if (this.user_role === 'Admin') {
            let temp = this.mainMenu.find((module_name: any) => module_name.name === 'Company Policy');
            temp.access[0].operations[0].view = true;
            this.passingChildrenToTabel(temp)
            console.log(' this.passingChildrenToTabel')
          } 
          else {
            this.manualFuction();
          }
        } else if (res.length != 0 && res[0].access_list.length != 0){
          let temp_dataa: any = [];
          let menuMap = new Map(this.mainMenu.map((item: any) => [item.name, item]));
          res[0].access_list.forEach((res_data: any) => {
            let matchedItem:any = menuMap.get(res_data.name);

            if (matchedItem) {
              temp_dataa.push(res_data);

              let existingAccessNames = new Set(res_data.access.map((access: any) => access.name));

              matchedItem.access.forEach((list_access: any) => {
                if (!existingAccessNames.has(list_access.name)) {
                  res_data.access.push(list_access);
                }
              });
            }
          });

          if(temp_dataa.length>0){
            console.log('ccccccccc')
            this.passingChildrenToTabel(res[0].access_list[0])
          } else{
            console.log('nooooooooo')
            this.passingChildrenToTabel(this.mainMenu[0])
          }
        }
      },
      (error) => {
        console.log(error)
      }
    )

  }

  manualFuction() {
    let temp = JSON.parse(JSON.stringify(this.mainMenu[0]));
    temp?.access?.forEach(item => {
      if (item?.operations?.length) {
        Object.keys(item.operations[0]).forEach(key => {
          if (item.operations[0][key] === true) {
            item.operations[0][key] = false;
          }
        });
      }
    });
    temp.access[0].operations[0].view = true;
    this.selectedTab = temp.name;
    let access_temp = {
      'name': temp.name,
      'access': temp.access,
    }
    this.allChildrens = access_temp;
  }

  // getting data from child
  receiveDataFromChild(data: any) {
    console.log('from child', data)
    if (data) {
      this.mainMenu.forEach((access: any) => {
        const moduleMatch = data.access_list.find((module_name: any) => module_name.name === access.name);
        if (moduleMatch) {
          access['access_given'] = true;
        }
        if (!moduleMatch) {
          access['access_given'] = false;
        }
      });
      // console.log(this.mainMenu, 'this.mainMenu')
    }
  }

  allChildrens: any = []
  passingChildrenToTabel(data: any) {
    // console.log('dataaaaaa',data)
    this.selectedTab = data.name;
    let access_data = {
      'name': data.name,
      'access': data.access,
    }
    this.toggleAllTrueToFalse(access_data);
    this.allChildrens = access_data;
  }

  toggleAllTrueToFalse(data: any) {
    if (data.name != 'Company Policy') {
      data?.access?.forEach(item => {
        if (item?.operations?.length) {
          Object.keys(item.operations[0]).forEach(key => {
            if (item.operations[0][key] === true) {
              item.operations[0][key] = false;
            }
          });
        }
      });
    }
  }

  backToAllDesignations() {
    this.router.navigate(['/designation/list'])
  }
}
