import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiserviceService } from '../../../service/apiservice.service';
import { concat } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-access-to-modules',
  templateUrl: './access-to-modules.component.html',
  styleUrls: ['./access-to-modules.component.scss']
})
export class AccessToModulesComponent implements OnInit {
  @Output() dataEmitter: EventEmitter<string> = new EventEmitter<string>();
  @Output() SaveData: EventEmitter<object> = new EventEmitter<object>();
  @Input() data: any;
  designation_id: any;
  organization_id: any;
  buttonName: String;
  itemId: any;
  accessibility: any = [];
  storeAssessGivenData: any = [];
  disableAddOrUpdateBtn: boolean = false;
  acessgiven: boolean = false;
  showBackButton: boolean = false;
  errorMsg: boolean = false
  constructor(
    private activeRoute: ActivatedRoute,
    private api: ApiserviceService,
    private router: Router,
    private ngxService: NgxUiLoaderService,
  ) {
    this.designation_id = this.activeRoute.snapshot.paramMap.get('id')
  }

  ngOnChanges(): void {
    if (this.data?.access?.length > 0) {
      // console.log('got dataaaaa', this.data)
      this.getAccessForDesignation(this.designation_id);
    }
  }
  ngOnInit(): void {
    this.organization_id = sessionStorage.getItem('organization_id')
  }



  getAccessForDesignation(id: number):void {
     this.api.getData(`${environment.live_url}/${environment.roles_access}/?designation=${id}`).subscribe(
      (res: any) => {
        // console.log(res, 'designation id');
        this.buttonName =  res[0]?.id ? 'Update' : 'Add';
        
        this.storeAssessGivenData = JSON.parse(JSON.stringify( res[0]?.access_list || []));
        // console.log('access_given_name_name',this.storeAssessGivenData)
        this.itemId =  res[0]?.id;
        this.mergeAccessData();
        if (res.length > 0) {
          this.dataEmitter.emit( res[0]);
          if (res?.[0]?.access_list?.length > 0) {
            this.showBackButton = false;
            this.accessibility = [];
            const accessList =  res[0].access_list;
            accessList.forEach((element_list) => {
              let isMatched = false;
              if(this.data.name===element_list.name){
                // console.log('data matching',element_list)
                element_list.access.forEach((accessItem: any) => {
                  const matchedSubModule = this.data.access.find((module_name: any) => module_name.name === accessItem.name);
                  if (matchedSubModule) {
                    matchedSubModule['operations'] = accessItem.operations;
                    isMatched = true;
                  }
                });
              } 
              if (!isMatched) {
                this.accessibility.push(element_list);
              }
              // console.log('noooo matching',this.accessibility)
              this.checkSubModuleAccess(this.data, this.storeAssessGivenData);
            });
          } else {
            this.showBackButton = true;
            this.checkSubModuleAccess(this.data, this.storeAssessGivenData);
          }
        } 
        else {
          this.showBackButton = true;
          this.checkSubModuleAccess(this.data, this.storeAssessGivenData);
        }
      }
    );
  }

  mergeAccessData() {
    let temp_data: any = JSON.parse(JSON.stringify(this.data));
    this.storeAssessGivenData.forEach((access_given) => {
      if (access_given.name === temp_data.name) {
        let newAccessItems: any = [];
        temp_data.access.forEach((selected_sub_access) => {
          const isAlreadyPresent = access_given.access.some((sub_modules: any) => sub_modules.name === selected_sub_access.name);
          if (!isAlreadyPresent) {
            // console.log(selected_sub_access.name, 'added');
            newAccessItems.push(selected_sub_access);
          } else {
            // console.log(selected_sub_access.name, 'matching');
          }
        });
        // Push all new access items at once after checking
        if (newAccessItems.length > 0) {
          access_given.access.push(...newAccessItems);
        }
      }
    });
  }


  checkSubModuleAccess(data, api_data) {
    // console.log(data)
    if (api_data?.length === 1 && data?.name === api_data[0]?.name) {
      // console.log('data is there aor not')
      this.disableAddOrUpdateBtn = true;
      this.errorMsg = false;
      this.oneAccessValidation(data, api_data)
    }
    else if (api_data?.length === 1 && data?.name != api_data[0]?.name) {
      // console.log('2')
      this.errorMsg = false;
      this.showBackButton = false;
      // this.disableAddOrUpdateBtn = true;
      let hasTrueValue = false;
      for (const access of data.access) {
        for (const operation of access.operations) {
          if (Object.values(operation).includes(true)) {
            hasTrueValue = true;
            break;
          }
        }
        if (hasTrueValue) break;
      }
      this.disableAddOrUpdateBtn = !hasTrueValue;
    }
    else if (api_data?.length >= 2) {
      // console.log('3')
      this.errorMsg = false;
      this.showBackButton = false;
      this.disableAddOrUpdateBtn = true;
      this.oneAccessValidation(data, api_data)
  
    } else if (api_data?.length === 0) {
      // console.log('4')
      // this.disableAddOrUpdateBtn = false;
      this.showBackButton = true;
      this.disableAddOrUpdateBtn = true;
      this.errorMsg = true;
      for (const access of data.access) {
        for (const operation of access.operations) {
          if (Object.values(operation).includes(true)) {
            this.disableAddOrUpdateBtn = false;
            this.errorMsg = false
            return;
          }
        }
      }
    }
  }


  oneAccessValidation(data, api_data) {
    const hasMatchingModule = api_data.some((given_access) => {
      if (data.name === given_access.name) {
        // console.log("Module Name Matched:", data.name);
        const allOperationsFalse = data.access.every((selected_sub_access) =>
          selected_sub_access.operations.every((operation) => Object.values(operation).every(value => value === false))
        );

        if (allOperationsFalse && api_data?.length === 1) {
          // console.log("All operations are false.");
          this.errorMsg = true;
          this.disableAddOrUpdateBtn = true;
        } else {
          // Check if operations match exactly
          const allOperationsMatch = data.access.every((selected_sub_access) =>
            given_access.access.some(
              (given_sub_access) =>
                given_sub_access.name === selected_sub_access.name &&
                JSON.stringify(given_sub_access.operations || []) === JSON.stringify(selected_sub_access.operations || [])
            )
          );

          if (allOperationsMatch) {
            // If all operations match, disable update button and error message
            this.errorMsg = false; 
            this.disableAddOrUpdateBtn = true;
          } else {
            // If there are any changes in operations (apart from all false)
            this.errorMsg = false;
            this.disableAddOrUpdateBtn = false; 
          }
        }

        return true; //  module matches = Stop iteration
      }
      return false; // If module doesn't match= continue to the next iteration
    });

    if (!hasMatchingModule) {
      // console.log("No matching module found.");
      this.errorMsg = false;
      let hasTrueValue = data.access.some((access) =>
        access.operations.some((operation) => Object.values(operation).includes(true))
      );
      this.disableAddOrUpdateBtn = !hasTrueValue;
    }

  }

  modifyAccess(event: any, sub_module_name, access_name) {
    console.log(sub_module_name,'sub_module_namesub_module_name')
    this.data.access.forEach((element_sub_module: any) => {
      if (sub_module_name === element_sub_module.name) {
        if (event.target.checked && (access_name === 'create' || access_name === 'update' || access_name === 'delete')) {
          element_sub_module['operations'][0]['view'] = event.target.checked
          element_sub_module['operations'][0][access_name] = event.target.checked
          // console.log('true')
        } else if (!event.target.checked) {
          if (access_name === 'view') {
            element_sub_module['operations'][0]['create'] = event.target.checked
            element_sub_module['operations'][0]['update'] = event.target.checked
            element_sub_module['operations'][0]['delete'] = event.target.checked
            element_sub_module['operations'][0][access_name] = event.target.checked
            // console.log('false')
          }
          else if (access_name === 'create' || access_name === 'update' || access_name === 'delete') {
            element_sub_module['operations'][0][access_name] = event.target.checked;
            // console.log('false not view')
          }
        } else{
          element_sub_module['operations'][0][access_name] = event.target.checked
        }
      }
    });
    // console.log(this.data, this.storeAssessGivenData)
    this.checkSubModuleAccess(this.data, this.storeAssessGivenData);
  }

  selectAll(event) {
    this.data?.access.forEach(item => {
      item.operations[0]['create'] = event.target.checked;
      item.operations[0]['view'] = event.target.checked;
      item.operations[0]['update'] = event.target.checked;
      item.operations[0]['delete'] = event.target.checked;
    });
    this.checkSubModuleAccess(this.data, this.storeAssessGivenData);
  }
  get allSelected(): boolean {
    return this.data.access.every((item: any) =>
      Object.values(item.operations[0]).every((value: boolean) => value)
    );
  }





  addOrUpdate(text: any) {
    this.data.access.forEach(item => {
      delete item.icon;
      delete item.is_show;
    });
    const combinedData = this.accessibility.concat(this.data);
    let updated_access = {
      'designation': this.designation_id,
      // 'organization': this.organization_id,
      'access_list': this.filterAccessList(combinedData)
    }
    console.log('updated code', updated_access);
    this.SaveData.emit({ 'text': text, 'data': updated_access })
    if (text === 'Add') {
      this.addSubModuleAccess(updated_access);
    } else {
      this.updateSubModuleAccess(updated_access);
    }
  }


  filterAccessList(response: any[]): any[] {
    const filteredResponse = response
      .map((item) => {
        const filteredAccess = item.access.filter((accessItem: any) => {
          const hasValidOperation = accessItem.operations.some((operation: any) => {
            return operation.view || operation.create || operation.delete || operation.update;
          });
          return hasValidOperation;
        });

        if (filteredAccess.length > 0) {
          return { ...item, access: filteredAccess };
        }
        return null;
      })
      .filter((item) => item !== null); 
    return filteredResponse;
  }


  addSubModuleAccess(updated_access: any) {
    this.ngxService.stop();
    this.api.postData(`${environment.live_url}/${environment.roles_access}/`, updated_access).subscribe(
      (res) => {
        this.api.showSuccess(res['message']);
        setTimeout(() => {
          this.getAccessForDesignation(this.designation_id);
        }, 1000);
      },
      (error: any) => {
        this.api.showError(error.error.message);
      }
    )
  }
  updateSubModuleAccess(updated_access: any) {
    this.ngxService.stop();
    this.api.updateData(`${environment.live_url}/${environment.roles_access}/${this.itemId}/`,updated_access).subscribe(
      (res) => {
        this.api.showSuccess(res['message']);
        setTimeout(() => {
          this.getAccessForDesignation(this.designation_id);
        }, 1000);
      },
      (error: any) => {
        this.api.showError(error.error.message);
      }
    )
  }
  backToAllDesignations() {
    this.router.navigate(['/settings/roles'])
  }

}
