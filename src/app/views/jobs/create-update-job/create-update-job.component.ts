import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Editor, Toolbar } from 'ngx-editor';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { environment } from '../../../../environments/environment';
import { GenericDeleteComponent } from '../../../generic-components/generic-delete/generic-delete.component';
import { FormErrorScrollUtilityService } from '../../../service/form-error-scroll-utility-service.service';
import { SubModuleService } from '../../../service/sub-module.service';

@Component({
  selector: 'app-create-update-job',
  templateUrl: './create-update-job.component.html',
  styleUrls: ['./create-update-job.component.scss']
})
export class CreateUpdateJobComponent implements OnInit, OnDestroy {
  BreadCrumbsTitle: any = 'Job';
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  jobFormGroup: FormGroup;
  allClientslist: any = [];
  endClientslists: any = [];
  groupslists: any = [];
  allServiceslist: any = [];
  allPeroidicitylist: any = [];
  peroidslist: any = [];
  allJobtypeList: any = [];
  allJobStatusList: any = [];
  allEmployeeList: any = [];
  allManagerList: any = [];
  jobBillingOption: { [key: string]: string } = {};
  searchClientText: any;
  searchEndClientText: any;
  searchGroupText: any;
  searchServicesText: any;
  searchPeroidicityText: any;
  searchPeroidText: any;
  searchJobTypeText: any;
  searchJobStatusText: any;
  searchEmployeeText: any;
  searchManagerText: any;
  job_id: any;
  isEditItem: boolean = false;
  pageSize = 10;
  currentPage = 1;
  accessPermissions: any = [];
  user_role_name: any;
  editor!: Editor;
  formData: any;
  selectAllEmpFlag: boolean = false;
  selectOtherEmpFlag: boolean = false;
  toolbar: Toolbar = [
    // default value
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    // or, set options for link:
    //[{ link: { showOpenInNewTab: false } }, 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
    ['horizontal_rule', 'format_clear',],
  ];
  user_id: any;
  currentDate: any = new Date().toISOString();
  constructor(private fb: FormBuilder, private activeRoute: ActivatedRoute, private accessControlService: SubModuleService,
    private common_service: CommonServiceService, private router: Router, private datepipe: DatePipe,
    private apiService: ApiserviceService, private modalService: NgbModal, private formErrorScrollService: FormErrorScrollUtilityService) {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.user_role_name = sessionStorage.getItem('user_role_name');
    this.user_id = sessionStorage.getItem('user_id');
    if (this.activeRoute.snapshot.paramMap.get('id')) {
      this.common_service.setTitle('Update ' + this.BreadCrumbsTitle)
      this.job_id = this.activeRoute.snapshot.paramMap.get('id')
      this.isEditItem = true;
      this.getAllDropdownData();
      this.getJobDetails(this.job_id);
    } else {
      this.common_service.setTitle('Create ' + this.BreadCrumbsTitle)
      this.getAllDropdownData()
    }
  }

  ngOnInit(): void {
    this.editor = new Editor();
    this.intialForm();
  }

  ngOnDestroy(): void {
    // Destroy the editor to prevent memory leaks
    this.editor.destroy();
  }

  public intialForm() {
    this.jobFormGroup = this.fb.group({
      job_number: ['', Validators.required],
      job_name: [''],
      client: ['', Validators.required],
      end_client: ['', Validators.required],
      group: [null],
      service: ['', Validators.required],
      periodicity: ['', Validators.required],
      period: ['', Validators.required],
      job_type: ['', Validators.required],
      job_allocation_date: ['', Validators.required],
      budget_time: ['', [Validators.required, Validators.pattern('^([0-9]{1,3}):([0-5]?[0-9])$')]],
      job_status: ['', Validators.required],
      percentage_of_completion: [Number, Validators.required],
      job_status_date: [this.currentDate, Validators.required],
      option: ['1', Validators.required],
      job_notes: [''],
      created_by: Number(this.user_id),
      updated_by: Number(this.user_id),
      employees: this.fb.array([this.createEmployeeControl()]),
    });
  }

  public getAllDropdownData() {
    this.getModuleAccess();
    this.getJobUniqueNumber();
    this.getJobBillingOptions();
    this.getAllActiveClients();
    this.getAllServices();
    this.getAllPeriodicity();
    this.getAllJobType();
    this.getAllJobStatus();
    this.getAllEmployeeList();
    setTimeout(() => {
      this.getAllActiveManagerList();
    }, 500);
  }
  getModuleAccess() {
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe(
      (res: any) => {
        console.log(res);
        this.accessPermissions = res[0].operations;
        // console.log('this.accessPermissions', this.accessPermissions)
        //  res.access_list.forEach((access:any)=>{
        //     access.access.forEach((access_name:any)=>{
        //         if(access_name.name===sessionStorage.getItem('access-name')){
        //           console.log(access_name)
        //           this.accessPermissions = access_name.operations;
        //           console.log('this.accessPermissions', this.accessPermissions);
        //         }
        //       })
        //  })
      }
    )
  }

  public get f() {
    return this.jobFormGroup.controls;
  }

  get employeeFormArray() {
    return this.jobFormGroup.get('employees') as FormArray;
  }

  createEmployeeControl(): FormGroup {
    return this.fb.group({
      employee: ['', Validators.required],
      manager: ['', Validators.required],
      is_primary: [this.user_role_name === 'Accountant' ? true : false],
    });
  }


  public getJobUniqueNumber() {
    this.apiService.getData(`${environment.live_url}/${environment.jobs}/?get-unique-id=true`).subscribe((respData: any) => {
      this.jobFormGroup.patchValue({ 'job_number': respData?.unique_id });
    }, (error => {
      this.apiService.showError(error?.error?.detail);
    }));
  }
  public getJobBillingOptions() {
    this.jobBillingOption = {};
    this.apiService.getData(`${environment.live_url}/${environment.jobs}/?get-options=True`).subscribe((respData: any) => {
      this.jobBillingOption = respData;
    }, (error: any) => {
      this.apiService.showError(error?.error?.detail);
    });
  }
  public getAllEmployeeList() {
    let queryparams: any;
    if (this.user_role_name === 'Admin') {
      queryparams = `?is_active=True&employee=True`;
    } else {
      if ((this.job_id && this.selectOtherEmpFlag) || (this.job_id && this.user_role_name === 'Accountant')) {
        queryparams = `?is_active=True&employee=True`;
      } else {
        if (this.user_role_name === 'Accountant') {
          queryparams = `?is_active=True&employee=True&employee_id=${this.user_id}`;

        } else {
          queryparams = `?is_active=True&employee=True&reporting_manager_id=${this.user_id}`;
          // queryparams = `?is_active=True&employee=True&employee_id=${this.user_id}&is_manager=True`;
        }
      }
    }
    this.getEmployees(queryparams);
  }

  accountManagerId:any;
  public getEmployees(params) {
    this.allEmployeeList = [];
    this.apiService.getData(`${environment.live_url}/${environment.employee}/${params}`).subscribe((respData: any) => {
      this.allEmployeeList = respData;
      this.accountManagerId = this.allEmployeeList[0]?.reporting_manager_id
      console.log('employee list', respData)
    }, (error => {
      this.apiService.showError(error?.error?.detail)
    }));
  }


  public getAllActiveManagerList() {
    this.allManagerList = [];
    let queryparams: any;
    if (this.user_role_name === 'Admin') {
      queryparams = `?is_active=True&employee=True&designation=manager`
    } else if(this.user_role_name === 'Manager') { 
      queryparams = `?is_active=True&employee=True&employee_id=${this.user_id}&is_manager=True`
    } else if(this.user_role_name === 'Accountant'){
      queryparams = `?is_active=True&employee=True&employee_id=${this.accountManagerId}`;
    }
   this.getManagers(queryparams)
    // old code
    // this.apiService.getData(`${environment.live_url}/${environment.employee}/?is_active=True&employee=True&designation=manager`).subscribe((respData: any) => {
    //   this.allManagerList = respData;
    //   if (this.user_role_name === 'Accountant' && !this.job_id) {
    //     console.log('accpont')
    //     const employeesDetailsArray = this.jobFormGroup.get('employees') as FormArray;
    //     employeesDetailsArray?.at(0)?.patchValue({ 'employee': this.allEmployeeList[0]?.user_id });
    //     if (this.allManagerList.length >= 1) {
    //       console.log('wwwwwwwwwww')
    //       employeesDetailsArray?.at(0)?.patchValue({ 'manager': this.allEmployeeList[0]?.reporting_manager_id });
    //     }
    //     employeesDetailsArray?.at(0)?.patchValue({ 'is_primary': true });
    //     employeesDetailsArray?.at(0)?.get('employee')?.disable();
    //     employeesDetailsArray?.at(0)?.get('manager')?.disable();
    //     employeesDetailsArray?.at(0)?.get('is_primary')?.disable();
    //   }
    // }, (error => {
    //   this.apiService.showError(error?.error?.detail)
    // }));
  }

 public getManagers(queryparams:any){
    this.apiService.getData(`${environment.live_url}/${environment.employee}/${queryparams}`).subscribe((respData: any) => {
      this.allManagerList = respData;
      if (this.user_role_name === 'Accountant' && !this.job_id) {
        const employeesDetailsArray = this.jobFormGroup.get('employees') as FormArray;
        employeesDetailsArray?.at(0)?.patchValue({ 'employee': this.allEmployeeList[0]?.user_id });
        if (this.allManagerList.length >= 1) {
          employeesDetailsArray?.at(0)?.patchValue({ 'manager': this.allEmployeeList[0]?.reporting_manager_id });
        }
        employeesDetailsArray?.at(0)?.patchValue({ 'is_primary': true });
        employeesDetailsArray?.at(0)?.get('employee')?.disable();
        employeesDetailsArray?.at(0)?.get('manager')?.disable();
        employeesDetailsArray?.at(0)?.get('is_primary')?.disable();
      }
    }, (error => {
      this.apiService.showError(error?.error?.detail)
    }));
  }
  // search Employee   
  filteredEmployeeList() {
    if (!this.searchEmployeeText) {
      return this.allEmployeeList;
    }
    return this.allEmployeeList.filter((emp: any) =>
      emp?.user__full_name?.toLowerCase()?.includes(this.searchEmployeeText?.toLowerCase())
    );
  }

  // search Employee   
  filteredManagerList() {
    if (!this.searchManagerText) {
      return this.allManagerList;
    }
    return this.allManagerList.filter((emp: any) =>
      emp?.user__full_name?.toLowerCase()?.includes(this.searchManagerText?.toLowerCase())
    );
  }

  public getAllActiveClients() {
    this.allClientslist = [];
    this.apiService.getData(`${environment.live_url}/${environment.clients}/?status=True`).subscribe(
      (res: any) => {
        this.allClientslist = res;
      }, (error: any) => {
        this.apiService.showError(error?.error?.detail);
      });
  }

  public onClientChange(event: any) {
    const client_id = event.value;
    this.jobFormGroup?.get('end_client')?.reset();
    this.jobFormGroup?.get('group')?.reset();
    this.jobFormGroup?.get('job_name')?.reset();
    this.getClientBasedEndClient(client_id);
  }

  private getClientBasedEndClient(id: any) {
    this.endClientslists = [];
    this.apiService.getData(`${environment.live_url}/${environment.end_clients}/?client=${id}`).subscribe(
      (res: any) => {
        this.endClientslists = res;
      }, (error: any) => {
        this.apiService.showError(error?.error?.detail);
      });
  }

  onEndClientChange(event: any) {
    const endClient_id = event.value;
    this.jobFormGroup?.get('group')?.reset();
    // this.getCombinationJobName();
    this.getEndClientBasedGroup(endClient_id);
  }

  private getEndClientBasedGroup(id: any) {
    this.groupslists = [];
    this.apiService.getData(`${environment.live_url}/${environment.clients_group}/?end_client=${id}`).subscribe(
      (res: any) => {
        this.groupslists = res;
        if (this.groupslists && this.groupslists.length > 0) {
          this.jobFormGroup.controls['group'].setValue(this.groupslists[0].id);  // Set the default value to the id of the first item
        } else {
          this.jobFormGroup.controls['group'].setValue(null);
        }
      }, (error: any) => {
        this.apiService.showError(error?.error?.detail);
      });
  }

  public getAllServices() {
    this.allServiceslist = [];
    this.apiService.getData(`${environment.live_url}/${environment.settings_service}/`).subscribe(
      (res: any) => {
        this.allServiceslist = res;
      }, (error: any) => {
        this.apiService.showError(error?.error?.detail);
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


  public onPeroidicityChange(event: any) {
    const peroidicity = event.value;
    this.jobFormGroup?.get('peroid')?.reset();
    this.getPeroidicityBasedPeroid(peroidicity);
  }
  public onServiceChange(event: any) {
    console.log('event', event);
    // this.getCombinationJobName();
  }
  public onPeroidChange(event: any) {
    console.log('event', event);
    this.getCombinationJobName();
  }

  private getPeroidicityBasedPeroid(id: any) {
    this.peroidslist = [];
    this.apiService.getData(`${environment.live_url}/${environment.settings_period}/?periodicity-id=${id}`).subscribe(
      (res: any) => {
        this.peroidslist = res;
      }, (error: any) => {
        this.apiService.showError(error?.error?.detail);
      });
  }

  public getAllJobType() {
    this.allJobtypeList = [];
    this.apiService.getData(`${environment.live_url}/${environment.settings_job_type}/`).subscribe(
      (res: any) => {
        this.allJobtypeList = res;
      }, (error: any) => {
        this.apiService.showError(error?.error?.detail);
      });
  }

  public getAllJobStatus() {
    this.allJobStatusList = [];
    this.apiService.getData(`${environment.live_url}/${environment.settings_job_status}/`).subscribe(
      (res: any) => {
        if (this.job_id) {
          this.allJobStatusList = res;
        } else {
          this.allJobStatusList = res.filter(job => {
            const status = job.status_name.toLowerCase();
            return status !== 'completed' && status !== 'cancelled';
          })
          let data = res.filter(job => {
            const status = job.status_name.toLowerCase();
            return status === 'yet to start';
          })
          this.jobFormGroup.patchValue({ job_status: data[0].id })
          this.jobFormGroup.patchValue({ percentage_of_completion: data[0].percentage_of_completion })
        }
      }, (error: any) => {
        this.apiService.showError(error?.error?.detail);
      });
  }

  public filteredClientList() {
    if (!this.searchClientText) {
      return this.allClientslist;
    }
    return this.allClientslist.filter((client: any) =>
      client?.client_name?.toLowerCase()?.includes(this.searchClientText?.toLowerCase())
    );
  }

  public filteredEndClientList() {
    if (!this.searchEndClientText) {
      return this.endClientslists;
    }
    return this.endClientslists.filter((endClient: any) =>
      endClient?.client_name?.toLowerCase()?.includes(this.searchEndClientText?.toLowerCase())
    );
  }

  public filteredGrpupList() {
    if (!this.searchGroupText) {
      return this.groupslists;
    }
    return this.groupslists.filter((group: any) =>
      group?.group_name?.toLowerCase()?.includes(this.searchGroupText?.toLowerCase())
    );
  }

  public filteredServiceList() {
    if (!this.searchServicesText) {
      return this.allServiceslist;
    }
    return this.allServiceslist.filter((service: any) =>
      service?.service_name?.toLowerCase()?.includes(this.searchServicesText?.toLowerCase())
    );
  }

  public filteredPeriodicityList() {
    if (!this.searchPeroidicityText) {
      return this.allPeroidicitylist;
    }
    return this.allPeroidicitylist.filter((peroidicity: any) =>
      peroidicity?.periodicty_name?.toLowerCase()?.includes(this.searchPeroidicityText?.toLowerCase())
    );
  }

  public filteredPeriodList() {
    if (!this.searchPeroidText) {
      return this.peroidslist;
    }
    return this.peroidslist.filter((peroid: any) =>
      peroid?.period_name?.toLowerCase()?.includes(this.searchPeroidText?.toLowerCase())
    );
  }

  public filteredJobTypeList() {
    if (!this.searchJobTypeText) {
      return this.allJobtypeList;
    }
    return this.allJobtypeList.filter((job_type: any) =>
      job_type?.job_type_name?.toLowerCase()?.includes(this.searchJobTypeText?.toLowerCase())
    );
  }
  public filteredJobStatusList() {
    if (!this.searchJobStatusText) {
      return this.allJobStatusList;
    }
    return this.allJobStatusList.filter((job_status: any) =>
      job_status?.status_name?.toLowerCase()?.includes(this.searchJobStatusText?.toLowerCase())
    );
  }

  public clearSearch(key: any) {
    if (key === 'client') {
      this.searchClientText = '';
    } else if (key === 'endClient') {
      this.searchEndClientText = '';
    } else if (key === 'group') {
      this.searchGroupText = '';
    } else if (key === 'service') {
      this.searchServicesText = '';
    } else if (key === 'periodicity') {
      this.searchPeroidicityText = '';
    } else if (key === 'period') {
      this.searchPeroidText = '';
    } else if (key === 'job_type') {
      this.searchJobTypeText = '';
    } else {
      this.searchJobStatusText = '';
    }
  }

  public getJobDetails(id: any) {
    this.apiService.getData(`${environment.live_url}/${environment.jobs}/${id}/`).subscribe((respData: any) => {
      if (respData) {
        this.getClientBasedEndClient(respData?.client);
        this.getEndClientBasedGroup(respData?.end_client);
        this.getPeroidicityBasedPeroid(respData?.periodicity);
        // this.getEndClientBasedGroup(respData?.end_client);
        this.jobFormGroup.patchValue({
          job_number: respData?.job_number,
          job_name: respData?.job_name,
          client: respData?.client,
          end_client: respData?.end_client,
          group: respData?.group,
          service: respData?.service,
          periodicity: Number(respData?.periodicity),
          period: Number(respData?.period),
          job_type: respData?.job_type,
          job_allocation_date: respData?.job_allocation_date ? new Date(respData?.job_allocation_date)?.toISOString() : null,
          job_status_date: respData?.job_status_date ? new Date(respData?.job_status_date)?.toISOString() : null,
          job_status: respData?.job_status,
          percentage_of_completion: Number(respData?.percentage_of_completion),
          option: respData?.option.toString(),
          job_notes: respData?.job_notes,
          created_by: respData?.created_by,
          updated_by: respData?.updated_by,
        });
        this.tempSelectedJobStatus = respData?.job_status_name.toLowerCase();
        if (respData?.budget_time) {
          const [hours, minutes] = respData?.budget_time?.split(":");
          const formattedbudget_time = `${hours}:${minutes}`;
          this.jobFormGroup.patchValue({ 'budget_time': formattedbudget_time.toString() });
        } else {
          this.jobFormGroup.patchValue({ 'budget_time': '' });
        }
        if (respData?.employees && Array.isArray(respData?.employees) && respData?.employees?.length >= 1) {
          const employeesDetailsArray = this.jobFormGroup.get('employees') as FormArray;
          employeesDetailsArray.clear();
          respData?.employees.forEach(({ employee, manager, is_primary }, index, array) => {
            const isLastItem = index === array.length - 1;
            const employeeForm = this.fb.group({
              employee: [{ value: employee, disabled: this.user_role_name === 'Accountant' ? true : !isLastItem }],
              manager: [{ value: manager, disabled: this.user_role_name === 'Accountant' ? true : !isLastItem }],
              is_primary: [{ value: is_primary, disabled: this.user_role_name === 'Accountant' ? true : !isLastItem }]
            });
            employeesDetailsArray.push(employeeForm);
          });
        }
      }
    }, (error: any) => {
      this.apiService.showError(error?.error?.detail);
    })
  } public backBtnFunc() {
    sessionStorage.removeItem("access-name")
    if (this.tempSelectedJobStatus === 'completed' || this.tempSelectedJobStatus === 'cancelled') {
      this.common_service.setjobStatusState(true);
    } else {
      this.common_service.setjobStatusState(false);
    }
    this.router.navigate(['/jobs/all-jobs']);
  }

  public openJobKPIDetails() {
    this.router.navigate(['/jobs/update-kpi/', this.job_id]);
  }

  public joiningDateFun(event: any) {
    if (this.user_role_name === 'Admin') {
      this.jobFormGroup.patchValue({ 'job_status_date': event.value });
    } else {
      this.jobFormGroup.patchValue({ 'job_status_date': this.currentDate });
    }

  }

  addEmployee() {
    let lastItemIndex = this.employeeFormArray.length - 1;
    console.log(this.employeeFormArray?.at(lastItemIndex).valid);
    // Disable the previous contact group before adding a new one
    if (this.employeeFormArray?.at(lastItemIndex)?.valid) {
      const contact = this.employeeFormArray.at(lastItemIndex);

      ['employee', 'manager', 'is_primary'].forEach(field => contact?.get(field)?.disable());
      this.employeeFormArray.markAllAsTouched();
      this.employeeFormArray.push(this.createEmployeeControl());
    }

  }


  removeEmployee(index: number) {
    if (this.employeeFormArray.length > 1) {
      this.selectAllEmpFlag = false;
      this.employeeFormArray.removeAt(index);
      const lastItemIndex = this.employeeFormArray.length - 1;
      const lastItem = this.employeeFormArray.at(lastItemIndex);
      if (lastItem) {
        ['employee', 'manager', 'is_primary'].forEach(field => lastItem.get(field)?.enable());
      }
    }
  }

  tempSelectedJobStatus: any
  selectJobStatus(event: any) {
    // console.log(event)
    let data = this.allJobStatusList.find((x: any) => x.id === event.value)
    this.tempSelectedJobStatus = data.status_name.toLowerCase();
    this.jobFormGroup.patchValue({ percentage_of_completion: Number(data.percentage_of_completion) })
  }

  public saveJobDetails() {
    if (this.jobFormGroup.invalid) {
      this.jobFormGroup.markAllAsTouched();
      this.formErrorScrollService.scrollToFirstError(this.jobFormGroup);
    } else {
      if (this.isEditItem) {
        this.formData = this.createFromData();
        this.apiService.updateData(`${environment.live_url}/${environment.jobs}/${this.job_id}/`, this.formData).subscribe((respData: any) => {
          if (respData) {
            this.apiService.showSuccess(respData['message']);
            if (this.tempSelectedJobStatus === 'completed' || this.tempSelectedJobStatus === 'cancelled') {
              this.common_service.setjobStatusState(true);
            } else {
              this.common_service.setjobStatusState(false);
            }
            this.resetFormState();
            sessionStorage.removeItem("access-name")
            this.router.navigate(['/jobs/all-jobs']);
          }
        }, (error: any) => {
          this.apiService.showError(error?.error?.detail);
        });
      } else {
        this.formData = this.createFromData();
        this.apiService.postData(`${environment.live_url}/${environment.jobs}/`, this.formData).subscribe((respData: any) => {
          if (respData) {
            this.apiService.showSuccess(respData['message']);
            this.resetFormState();
            sessionStorage.removeItem("access-name")
            this.router.navigate(['/jobs/all-jobs']);
          }
        }, (error: any) => {
          this.apiService.showError(error?.error?.detail);
        });
      }
    }
  }

  public createFromData() {
    this.formData = new FormData();
    this.formData.set('job_number', this.jobFormGroup?.get('job_number')?.value.toString());
    this.formData.set('job_name', this.jobFormGroup?.get('job_name')?.value.toString());
    this.formData.set('client', this.jobFormGroup?.get('client')?.value);
    this.formData.set('end_client', this.jobFormGroup?.get('end_client')?.value);
    this.formData.set('group', this.jobFormGroup?.get('group')?.value || null);
    this.formData.set('service', this.jobFormGroup?.get('service')?.value);
    this.formData.set('periodicity', this.jobFormGroup?.get('periodicity')?.value);
    this.formData.set('period', this.jobFormGroup?.get('period')?.value);
    this.formData.set('job_type', this.jobFormGroup?.get('job_type')?.value);
    this.formData.set('job_allocation_date', this.datepipe.transform(this.jobFormGroup?.get('job_allocation_date')?.value, 'YYYY-MM-dd'));
    this.formData.set('budget_time', this.jobFormGroup?.get('budget_time')?.value + ":00");
    this.formData.set('job_status', this.jobFormGroup?.get('job_status')?.value);
    this.formData.set('percentage_of_completion', this.jobFormGroup?.get('percentage_of_completion')?.value);
    this.formData.set('job_status_date', this.datepipe.transform(this.jobFormGroup?.get('job_status_date')?.value, 'YYYY-MM-dd'));
    this.formData.set('option', this.jobFormGroup?.get('option')?.value.toString());
    this.formData.set('created_by', this.jobFormGroup?.get('created_by')?.value);
    this.formData.set('job_notes', this.jobFormGroup?.get('job_notes')?.value || '');
    this.formData.set('updated_by', this.jobFormGroup?.get('updated_by')?.value);
    this.formData.set("employees", JSON.stringify(this.jobFormGroup?.get('employees')?.getRawValue()) || []);
    this.formData.set("status", (this.tempSelectedJobStatus === 'cancelled' || this.tempSelectedJobStatus === 'completed') ? false : true)
    const json = this.formDataToJson(this.formData);

    return json;
  }

  public resetFormState() {
    this.formGroupDirective?.resetForm();
    this.isEditItem = false;
  }

  public deleteJobs() {
    if (this.job_id) {
      const modelRef = this.modalService.open(GenericDeleteComponent, {
        size: <any>'sm',
        backdrop: true,
        centered: true
      });
      modelRef.componentInstance.status.subscribe(resp => {
        if (resp == "ok") {
          this.deleteContent(this.job_id);
          modelRef.close();
        }
        else {
          modelRef.close();
        }
      })

    }
  }
  public deleteContent(id: any) {
    this.apiService.delete(`${environment.live_url}/${environment.jobs}/${id}/`).subscribe(async (data: any) => {
      if (data) {
        this.apiService.showSuccess(data.message);
        this.router.navigate(['/jobs/all-jobs']);
      }
    }, (error => {
      this.apiService.showError(error?.error?.detail)
    }))
  }
  // Radio option
  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  public onSelectOtherEmployee(event: any) {
    let employeeQuery;
    let managerQuery;
    if (event.checked === true) {
      // get all employees and managers
      employeeQuery = `?is_active=True&employee=True`;
      managerQuery = `?is_active=True&employee=True&designation=manager`
    } else {
      // get logged in manager data and employees under him
      employeeQuery = `?is_active=True&employee=True&reporting_manager_id=${this.user_id}`;
      managerQuery = `?is_active=True&employee=True&employee_id=${this.user_id}&is_manager=True`
    }
    this.getEmployees(employeeQuery);
    this.getManagers(managerQuery)

    // old code
    // let queryparams;
    // if (event.cheked === true) {
    //   this.selectOtherEmpFlag = event.cheked;
    //   queryparams = `?is_active=True&employee=True`;
    // } else {
    //   this.selectOtherEmpFlag = event.cheked;
    //   queryparams = `?is_active=True&employee=True&employee_id=${this.user_id}&is_manager=True`;
    // }
    // this.getEmployees(queryparams);
  }

  public onSelectionAllEmployee(event: any) {
    if (event.checked === true) {
      this.selectAllEmpFlag = true;
      this.employeeFormArray.clear();

      this.allEmployeeList.forEach((element: any) => {
        // Check if the reporting_manager_id exists in the allManagerList
        const isManagerValid = this.allManagerList?.some((manager: any) => manager?.user_id === element?.reporting_manager_id);
        let empData = this.fb.group({
          'employee': element?.user_id,
          'manager': isManagerValid ? element?.reporting_manager_id : '',
          'is_primary': this.user_role_name === 'Accountant' ? true : false
        });

        this.employeeFormArray.push(empData);

        // Disable or enable fields based on reporting manager validity
        if (!isManagerValid) {
          // If reporting manager is invalid, enable and make the field empty
          empData.get('manager')?.enable();
          empData.get('manager')?.setValue('');  // Make the field empty
        } else {
          // If reporting manager is valid, disable the fields
          empData.get('employee')?.disable();
          empData.get('manager')?.disable();
          empData.get('is_primary')?.disable();
        }
      });
    } else {
      this.selectAllEmpFlag = false;
      this.employeeFormArray.clear();
      this.employeeFormArray.push(this.createEmployeeControl());
    }
  }


  public editContact(index: number) {
    const empItem = this.employeeFormArray.at(index);
    empItem?.get('employee')?.enable();
    empItem?.get('manager')?.enable();
    empItem?.get('is_primary')?.enable();
  }

  saveChanges(index: number) {
    const empItem = this.employeeFormArray.at(index);
    if (index <= this.allEmployeeList?.length && empItem.valid) {
      empItem?.get('employee')?.disable();
      empItem?.get('manager')?.disable();
      empItem?.get('is_primary')?.disable();
    }
  }
  // Is primary Checkbox
  public onEmployeeChange(event: any, i: any) {
    const formArray = this.employeeFormArray.controls;
    const isEmployeeDuplicate = formArray.some((control: any, index: number) => {
      return index !== i && control.get('employee')?.value === event.value; // Skip the current row (index !== i)
    });
    if (isEmployeeDuplicate) {
      this.employeeFormArray.at(i).get('employee')?.reset();
      this.employeeFormArray.at(i).get('manager')?.reset();
      this.employeeFormArray.at(i).get('is_primary')?.reset();
    } else {
      const selectedEmp = this.allEmployeeList.find((emp: any) => emp.user_id === event.value);
      this.employeeFormArray.at(i).patchValue({ 'employee': event.value });
      this.employeeFormArray.at(i).patchValue({ 'manager': selectedEmp?.reporting_manager_id });
      this.employeeFormArray.at(i).patchValue({ 'is_primary': this.user_role_name === 'Accountant' ? true : false });
    }

  }

  public isPrimarySelection(event: { checked: boolean }, selectedIndex: number): void {
    this.employeeFormArray.controls.forEach((control, index) => {
      if (event.checked && index !== selectedIndex) {
        control.get('is_primary')?.setValue(false, { emitEvent: false });
        control.get('is_primary')?.disable();
      } else {
        control.get('is_primary')?.enable();
      }
    });
  }


  get currentPageRows() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.employeeFormArray.controls.slice(startIndex, endIndex);
  }

  onPageChanged(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
  }

  public getContinuousIndex(index: number): number {
    return (this.currentPage - 1) * this.pageSize + index + 1;
  }

  public getCombinationJobName() {
    let endClientName = this.getSelectedEndClient(this.jobFormGroup?.get('end_client')?.value);
    let service_name = this.getSelectedService(this.jobFormGroup?.get('service')?.value);
    let period_name = this.getSelectedPeroid(this.jobFormGroup?.get('period')?.value);
    if (this.jobFormGroup?.get('end_client')?.valid && this.jobFormGroup?.get('service')?.valid && this.jobFormGroup?.get('period')?.valid) {
      let job_name = `${endClientName} ${service_name} ${period_name}`;
      this.jobFormGroup?.patchValue({ 'job_name': job_name });
    }


  }

  private getSelectedEndClient(id: any) {
    const endClient = this.endClientslists.find((endClient: any) => endClient?.id === id)
    return endClient?.client_name || '';
  }
  private getSelectedService(id: any) {
    const service = this.allServiceslist.find((service: any) => service?.id === id)
    return service?.service_name || '';
  }
  private getSelectedPeroid(id: any) {
    const peroid = this.peroidslist.find((period: any) => period?.id === id)
    return peroid?.period_name || '';
  }
  public formDataToJson(formData) {
    let obj = {};

    formData.forEach((value, key) => {
      // Check if the key is 'employees' and the value is a string that looks like a JSON
      if (key === 'employees' && typeof value === 'string') {
        try {
          obj[key] = JSON.parse(value);
        } catch (e) {
          obj[key] = value;
        }
      } else if (value === 'null') {
        obj[key] = null;
      } else {
        obj[key] = value;
      }
    });

    return obj;
  }

  // add colon 
  formatBudget(event: any): void {
    let rawValue = event.target.value.replace(/[^0-9]/g, '');

    if (rawValue.length > 3) {
      rawValue = rawValue.slice(0, 3) + ':' + rawValue.slice(3);
    }
    this.jobFormGroup.controls['budget_time'].setValue(rawValue, { emitEvent: false })
  }




}
