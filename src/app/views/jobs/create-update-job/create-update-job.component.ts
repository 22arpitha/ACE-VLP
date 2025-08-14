import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Editor, Toolbar } from 'ngx-editor';
import { Observable } from 'rxjs';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { environment } from '../../../../environments/environment';
import { GenericDeleteComponent } from '../../../generic-components/generic-delete/generic-delete.component';
import { FormErrorScrollUtilityService } from '../../../service/form-error-scroll-utility-service.service';
import { SubModuleService } from '../../../service/sub-module.service';
import { CanComponentDeactivate } from '../../../auth-guard/can-deactivate.guard';
import { MatMenuTrigger } from '@angular/material/menu';
import{GenericRedirectionConfirmationComponent} from '../../../generic-components/generic-redirection-confirmation/generic-redirection-confirmation.component'
import { MatSelect, MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-create-update-job',
  templateUrl: './create-update-job.component.html',
  styleUrls: ['./create-update-job.component.scss']
})
export class CreateUpdateJobComponent implements CanComponentDeactivate, OnInit, OnDestroy {
  BreadCrumbsTitle: any = 'Job';
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @Output() isEmployeeAdded:EventEmitter<boolean> = new EventEmitter<boolean>();
  jobFormGroup: FormGroup;
  allClientslist: any = [];
  endClientslists: any = [];
  groupslists: any = [];
  allServiceslist: any = [];
  allPeroidicitylist: any = [];
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
  searchJobTypeText: any;
  searchJobStatusText: any;
  searchEmployeeTextList: string[] = [];
  filteredEmployeeLists: any[][] = [];
  searchManagerTextList: string[] = [];
  filteredManagerLists: any[][] = [];
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
  jobDetails: any = []
  estimatedTime: any;
  editJobDetails: boolean = false;
  internalReviewOneIndex:any;
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
  jobAllocationCurrentDate: any = new Date().toISOString();
  initialFormValue: any;
  // Period Changes
  showSelection = true;
  year: number = new Date()?.getFullYear();
  yearDefault = new Date()?.getFullYear();
  yearRangeStart: number;
  selectedMonth: string | null = null;
  selectedQuarter: string | null = null;
  modeName: 'Monthly' | 'Quaterly' | 'Yearly'|'One off';
  months: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  quarters: { label: string, value: string; months: string[] }[] = [
    { label: 'Q1', value: 'Mar-Qtr', months: ['January', 'February', 'March'] },
    { label: 'Q2', value: 'Jun-Qtr', months: ['April', 'May', 'June'] },
    { label: 'Q3', value: 'Sep-Qtr', months: ['July', 'August', 'September'] },
    { label: 'Q4', value: 'Dec-Qtr', months: ['October', 'November', 'December'] }
  ];
  @ViewChild('trigger') menuTrigger!: MatMenuTrigger;
  constructor(private fb: FormBuilder, private activeRoute: ActivatedRoute, private accessControlService: SubModuleService,
    private common_service: CommonServiceService, private router: Router, private datepipe: DatePipe,
    private apiService: ApiserviceService, private modalService: NgbModal, private formErrorScrollService: FormErrorScrollUtilityService, private cdr: ChangeDetectorRef) {
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
    this.yearRangeStart = this.yearDefault - (this.yearDefault % 10);
    this.editor = new Editor();
    this.intialForm();
    this.getModuleAccess();
    this.jobFormGroup?.valueChanges?.subscribe(() => {
      const currentFormValue = this.jobFormGroup?.getRawValue();
      const isInvalid = this.jobFormGroup?.touched && this.jobFormGroup?.invalid;
      const isFormChanged: boolean = JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
      let unSavedChanges = isFormChanged || isInvalid;
      this.formErrorScrollService.setUnsavedChanges(unSavedChanges);
    });
  }

  ngOnDestroy(): void {
    // Destroy the editor to prevent memory leaks
    this.editor.destroy();
    this.formErrorScrollService.resetHasUnsavedValue();
  }

  public intialForm() {
    this.jobFormGroup = this.fb.group({
      job_name: ['', Validators.pattern(/^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+( [a-zA-Z0-9!@#$%^&*()_+{}\[\]:;"'<>,.?/\\|`~\-]+)*$/)],
      client: ['', Validators.required],
      end_client: ['', Validators.required],
      group: [null],
      service: ['', Validators.required],
      periodicity: ['', Validators.required],
      period: ['', Validators.required],
      job_type: ['', Validators.required],
      job_allocation_date: [this.jobAllocationCurrentDate, Validators.required],
      budget_time: ['', [Validators.required, Validators.pattern('^([0-9]{1,3}):([0-5]?[0-9])$')]],
      job_status: ['', Validators.required],
      percentage_of_completion: [Number, Validators.required],
      job_status_date: [this.currentDate, Validators.required],
      option: ['1', Validators.required],
      job_notes: [''],
      created_by: Number(this.user_id),
      updated_by: Number(this.user_id),
      is_allocated: [''],
      all_employees: [''],
      employees: this.fb.array([this.createEmployeeControl()]),
      add_employees: [''],
      only_admin_can_change_job_status: ['']
    });
    // this.initialFormValue = this.jobFormGroup?.getRawValue();
    this.filteredEmployeeLists[0] = [...this.allEmployeeList];
    this.filteredManagerLists[0] = [...this.allManagerList];
  }

  public getAllDropdownData() {

    // this.getJobUniqueNumber();
    this.getJobBillingOptions();
    // this.getAllActiveClients(); // added paginations
    this.getAllServices();
    this.getAllPeriodicity();
    // this.getAllJobType(); // added paginations
    this.getAllJobStatus();
    // this.getEmployees(`?is_active=True&employee=True`);
    if (!this.isEditItem) {
      this.getAllEmployeeList();
    }
    setTimeout(() => {
      this.getAllActiveManagerList();
    }, 1000);
  }
  shouldDisableFields: boolean = false;
  getModuleAccess() {
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe(
      (res: any) => {
        // console.log(res);
        this.accessPermissions = res[0].operations;
        // console.log('this.accessPermissions', this.accessPermissions)
        if (this.user_role_name != 'Admin') {
          if (this.job_id) {
            if(this.accessPermissions[0]?.['update']){
              this.editJobDetails = false;
            } else{
              this.editJobDetails = true;
            }
          } else {
             this.editJobDetails = false;
            this.shouldDisableFields = this.accessPermissions[0]?.['create'];
          }
        } else {
          if (this.job_id) {
            this.editJobDetails = false;
            this.shouldDisableFields = false;
          } else{
            this.editJobDetails = true;
            this.shouldDisableFields = true;
          }
        }
      }
    )
    // if(this.job_id){
    //       this.shouldDisableFields = this.accessPermissions[0]?.['update'];
    //     } else{
    //       this.shouldDisableFields = this.accessPermissions[0]?.['create'] };
  }
  public enableEdit() {
    if (this.user_role_name === 'Admin') {
      this.editJobDetails = true;
      this.shouldDisableFields = true;
    }
    else {
      this.editJobDetails = true;
      if(this.job_id){
         this.shouldDisableFields = this.accessPermissions[0]?.['update'];
      }
    }
    // this.router.navigate(['/jobs/update-kpi/', this.job_id]);
  }

  public get f() {
    return this.jobFormGroup.controls;
  }

  get employeeFormArray():FormArray {
    return this.jobFormGroup.get('employees') as FormArray;
  }

  createEmployeeControl(): FormGroup {
    return this.fb.group({
      employee: ['', Validators.required],
      manager: ['', Validators.required],
      is_primary: [this.user_role_name === 'Accountant' ? true : false],
    });
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
    let queryparams = `?is_active=True&employee=True`;
    const shouldAddQuery = this.selectOtherEmpFlag || this.selectAllEmpFlag;
    if (!shouldAddQuery) {
      if (this.user_role_name === 'Accountant' && !this.isEditItem) {
        queryparams += `&employee_id=${this.user_id}`;
      } else if (this.user_role_name === 'Manager') {
        queryparams += `&reporting_manager_id=${this.user_id}`;
      }
    }
    this.getEmployees(queryparams);
  }

  accountManagerId: any;
  public getEmployees(params) {
    this.allEmployeeList = [];
    this.apiService.getData(`${environment.live_url}/${environment.employee}/${params}`).subscribe((respData: any) => {
      this.allEmployeeList = respData;
     this.updateDropdownOptionlist();
      this.accountManagerId = this.allEmployeeList[0]?.reporting_manager_id;
      if (this.isEditItem && this.user_role_name === 'Admin' && this.allEmployeeList.length === this.jobDetails?.employees?.length) {
        this.selectAllEmpFlag = true;
      }
      // console.log('employee list', respData)
    }, (error => {
      this.apiService.showError(error?.error?.detail)
    }));
  }


  public getAllActiveManagerList() {
    let queryparams: any = `?is_active=True&employee=True&designation=manager`;
    const shouldAddQuery = this.selectOtherEmpFlag || this.selectAllEmpFlag;
    if (!shouldAddQuery) {
      if (this.user_role_name === 'Manager') {
        queryparams = `?is_active=True&employee=True&employee_id=${this.user_id}&is_manager=True`
      }
    }

    this.getManagers(queryparams);
  }

  public getManagers(queryparams: any) {
    this.allManagerList = [];
    this.apiService.getData(`${environment.live_url}/${environment.employee}/${queryparams}`).subscribe((respData: any) => {
      this.allManagerList = respData;
      this.updateDropdownOptionlist();
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
 filterEmployeeList(index: number): void {
  const search = this.searchEmployeeTextList[index]?.trim().toLowerCase() || '';
  const employees = [...this.allEmployeeList];

  this.filteredEmployeeLists[index] = search
    ? employees.filter(emp =>
        emp?.user__full_name?.toLowerCase().includes(search)
      )
    : employees;
}

onSelectOpened(opened: boolean, index: number): void {
  console.log(opened,'ojjj')
  if (opened && !this.filteredEmployeeLists[index]?.length) {
    this.filteredEmployeeLists[index] = [...this.allEmployeeList];
  }
}

filteredManagerList(index: number): void {
  const search = this.searchManagerTextList[index]?.trim().toLowerCase() || '';
  const employees = [...this.allManagerList];

  this.filteredManagerLists[index] = search
    ? employees.filter(emp =>
        emp?.user__full_name?.toLowerCase().includes(search)
      )
    : employees;
}

onManagerSelectOpened(opened: boolean, index: number): void {
  if (opened && !this.filteredManagerLists[index]?.length) {
    this.filteredManagerLists[index] = [...this.allManagerList];
  }
}

  public getAllActiveClients() {
    this.allClientslist = [];
    let query: any
    if (this.user_role_name === 'Admin') {
      query = '?status=True'
    } else {
      query = `?status=True&employee-id=${this.user_id}`
    }
    this.apiService.getData(`${environment.live_url}/${environment.clients}/${query}`).subscribe(
      (res: any) => {
        // this.allClientslist = res;
      }, (error: any) => {
        this.apiService.showError(error?.error?.detail);
      });
  }

  public onClientChange(event: any) {
    console.log(event)
    const client_id = event.value;
    this.jobFormGroup?.get('end_client')?.reset();
    this.jobFormGroup?.get('group')?.reset();
    this.jobFormGroup?.get('job_name')?.reset();
    this.dropdownState.end_client.initialized = false;
    if(this.isEditItem){
      this.selectedItemsMap['end_client'] = []
    }
    this.updateSelectedItems('client', event.value);
    // this.getClientBasedEndClient(client_id);
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
    this.getCombinationJobName();
    this.getEndClientBasedGroup(endClient_id);
    this.updateSelectedItems('end_client', event.value);
    // if (this.isEditItem) {
    //   this.getCombinationJobName();
    // }
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


  disablePeriodField:boolean = false;
  public onPeroidicityChange(event: any) {
    const peroidicityId = event.value;
    this.jobFormGroup.get('period')?.reset(null, { emitEvent: false });
    this.modeName = this.allPeroidicitylist.find((peroidicity: any) => peroidicity.id === peroidicityId)?.periodicty_name;
    this.checkthePerodicityName()
  }
  checkthePerodicityName(){
    const periodControl = this.jobFormGroup.get('period');
    if (this.modeName === 'One off') {
      this.disablePeriodField = true
      this.jobFormGroup.get('period')?.disable(); 
      periodControl?.clearValidators(); 
      periodControl?.setErrors(null);
      this.getCombinationJobName();
    } else {
      this.disablePeriodField = false;
      this.jobFormGroup.get('period')?.enable(); 
      periodControl?.setValidators([Validators.required]);  
    }
    periodControl?.updateValueAndValidity();
  }
  public onServiceChange(event: any) {
    // console.log('event', event);
    if (this.isEditItem) {
      this.getCombinationJobName();
    }
  }
  public onPeroidChange() {
    this.getCombinationJobName();
  }

  public getAllJobType() {
    this.allJobtypeList = [];
    this.apiService.getData(`${environment.live_url}/${environment.settings_job_type}/`).subscribe(
      (res: any) => {
        // this.allJobtypeList = res;
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
          this.internalReviewOneIndex = res.findIndex(status => status.status_name.toLowerCase() === 'internal review 1');
          // console.log('this.internalReviewOneIndex',this.internalReviewOneIndex)
          this.allJobStatusList = res.filter(job => {
            const status = job.status_name.toLowerCase();
            return status !== 'completed' && status !== 'cancelled';
          })
          let data = res.find(job => {
            const status = job?.status_name?.toLowerCase?.();
            return status === 'yet to start';
          });
          console.log(data)
          this.jobFormGroup.patchValue({ job_status: data[0]?.id })
          this.jobFormGroup.patchValue({ percentage_of_completion: data[0]?.percentage_of_completion })
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

  public clearSearch(key: any,i?:any) {
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
    } else if (key === 'job_type') {
      this.searchJobTypeText = '';
    } else if (key === 'emp') {
    if (i >= 0 && i < this.searchEmployeeTextList.length) {
      this.searchEmployeeTextList[i]='';
      this.filteredEmployeeLists[i]=[...this.allEmployeeList];
}
    }  else if (key === 'man') {
      if (i >= 0 && i < this.searchManagerTextList.length) {
      this.searchManagerTextList[i]='';
      this.filteredManagerLists[i]=[...this.allManagerList];
};
    }  else {
      this.searchJobStatusText = '';
    }
  }

  public getJobDetails(id: any) {
    this.apiService.getData(`${environment.live_url}/${environment.jobs}/${id}/`).subscribe((respData: any) => {
        console.log(respData)
      if (respData) {
        this.BreadCrumbsTitle = this.BreadCrumbsTitle + ` (${respData.job_number})`
        this.common_service.setTitle(this.BreadCrumbsTitle);
        this.jobDetails = respData;
        this.estimatedTime = respData?.estimated_time
        // new code
      this.patchDropdownValuesForEdit(respData);

        // this.getClientBasedEndClient(respData?.client);
        this.getEndClientBasedGroup(respData?.end_client);
        this.selectOtherEmpFlag = respData?.is_allocated,
          this.selectAllEmpFlag = respData?.all_employees,
          this.getAllEmployeeList();
        this.modeName = this.allPeroidicitylist.find((peroidicity: any) => peroidicity.id === Number(respData?.periodicity))?.periodicty_name;
        this.checkthePerodicityName()
        // this.getEndClientBasedGroup(respData?.end_client);
        this.jobFormGroup.patchValue({
          job_name: respData?.job_name,
          client: respData?.client,
          end_client: respData?.end_client,
          group: respData?.group,
          service: respData?.service,
          periodicity: Number(respData?.periodicity),
          period: respData?.period,
          job_type: respData?.job_type,
          job_allocation_date: respData?.job_allocation_date ? new Date(respData?.job_allocation_date)?.toISOString() : null,
          job_status_date: respData?.job_status_date ? new Date(respData?.job_status_date)?.toISOString() : null,
          job_status: respData?.job_status,
          percentage_of_completion: Number(respData?.percentage_of_completion),
          option: respData?.option?.toString(),
          job_notes: respData?.job_notes,
          created_by: respData?.created_by,
          updated_by: respData?.updated_by,
          is_allocated: respData?.is_allocated,
          all_employees: respData?.all_employees,
          add_employees: respData?.add_employees,
          only_admin_can_change_job_status: respData?.only_admin_can_change_job_status
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
          this.isEmployeeAdded.emit(true);
          const employeesDetailsArray = this.jobFormGroup.get('employees') as FormArray;
          employeesDetailsArray.clear();
          respData?.employees.forEach(({ employee, manager, is_primary }, index, array) => {
            this.filteredEmployeeLists[index] = [...this.allEmployeeList];
            this.filteredManagerLists[index] = [...this.allManagerList];
            const isLastItem = index === array.length - 1;
            const employeeForm = this.fb.group({
              employee: [{ value: employee, disabled: this.user_role_name === 'Accountant' ? true : !isLastItem }],
              manager: [{ value: manager, disabled: this.user_role_name === 'Accountant' ? true : !isLastItem }],
              is_primary: [{ value: is_primary, disabled: this.user_role_name === 'Accountant' ? true : !isLastItem }]
            });
            employeesDetailsArray.push(employeeForm);
          });
        }
      this.initialFormValue = this.jobFormGroup?.getRawValue();
      }
    }, (error: any) => {
      this.apiService.showError(error?.error?.detail);
    })
  } 
     public backBtnFunc(): void {
        if (this.isEditItem && this.hasUnsavedChanges()) {
          this.showConfirmationPopup().subscribe((confirmed: boolean) => {
            if (confirmed) {
              this.cleanupAndNavigate();
            }
          });
        } else {
          this.cleanupAndNavigate();
        }
      }
      
      public hasUnsavedChanges(): boolean {
        const currentFormValue = this.jobFormGroup.getRawValue();
        const isFormChanged = JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
        return isFormChanged || this.jobFormGroup.dirty;
      }
      
      private cleanupAndNavigate(): void {
        sessionStorage.removeItem("access-name")
    if (this.tempSelectedJobStatus === 'completed' || this.tempSelectedJobStatus === 'cancelled') {
      this.common_service.setjobStatusState(true);
    } else {
      this.common_service.setjobStatusState(false);
    }
    this.router.navigate(['/jobs/all-jobs']);
      }
      
      private showConfirmationPopup(): Observable<boolean> {
        return new Observable<boolean>((observer) => {
          const modalRef = this.modalService.open(GenericRedirectionConfirmationComponent, {
            size: 'sm' as any,
            backdrop: true,
            centered: true,
          });
      
          modalRef.componentInstance.status.subscribe((resp: any) => {
            observer.next(resp === 'ok');
            observer.complete();
            modalRef.close();
          });
        });
      }



  public joiningDateFun(event: any) {
    // console.log('event Date', event.value);
    if (this.user_role_name === 'Admin') {
      this.jobFormGroup.patchValue({ 'job_status_date': event.value });
    } else {
      this.jobFormGroup.patchValue({ 'job_status_date': this.currentDate });
    }

  }

  public statusDateFun(event: any) {
    // console.log('event Date',event.value);
  }
  addEmployee() {
    let lastItemIndex = this.employeeFormArray.length - 1;
    // console.log(this.employeeFormArray?.at(lastItemIndex).valid);
    // Disable the previous contact group before adding a new one
    if (this.employeeFormArray?.at(lastItemIndex)?.valid) {
      const contact = this.employeeFormArray.at(lastItemIndex);

      ['employee', 'manager', 'is_primary'].forEach(field => contact?.get(field)?.disable());
      this.employeeFormArray.markAllAsTouched();
      this.employeeFormArray.push(this.createEmployeeControl());
      const newIndex = this.employeeFormArray.length - 1;
      this.filteredEmployeeLists[newIndex] = this.allEmployeeList;
      this.filteredManagerLists[newIndex] = this.allManagerList;
    } else{
      this.employeeFormArray.markAllAsTouched();
    }
    this.checkAllEmployeeCheckbox();
  }


  removeEmployee(index: number) {
    if (this.employeeFormArray.length > 1) {
      this.selectAllEmpFlag = false;
      this.employeeFormArray.removeAt(index);
      if (this.searchEmployeeTextList && this.searchEmployeeTextList.length > index) {
    this.searchEmployeeTextList.splice(index, 1);
  }
  if (this.filteredEmployeeLists && this.filteredEmployeeLists.length > index) {
    this.filteredEmployeeLists.splice(index, 1);
  }
    if (this.searchManagerTextList && this.searchManagerTextList.length > index) {
    this.searchEmployeeTextList.splice(index, 1);
  }
  if (this.filteredManagerLists && this.filteredManagerLists.length > index) {
    this.filteredManagerLists.splice(index, 1);
  }
      const lastItemIndex = this.employeeFormArray.length - 1;
      const lastItem = this.employeeFormArray.at(lastItemIndex);
      if (lastItem) {
        ['employee', 'manager', 'is_primary'].forEach(field => lastItem.get(field)?.enable());
      }
    }
    this.checkAllEmployeeCheckbox();
  }

  tempSelectedJobStatus: any;
  x
  selectJobStatus(event: any) {
    // console.log(event)
    let data = this.allJobStatusList.find((x: any) => x.id === event.value)
    this.tempSelectedJobStatus = data.status_name.toLowerCase();
    this.jobFormGroup.patchValue({ percentage_of_completion: Number(data.percentage_of_completion) })
    // check the status
    const selectedIndex = this.allJobStatusList.findIndex(status => status.status_name.toLowerCase() === this.tempSelectedJobStatus.toLowerCase());
    const querySentIndex = this.allJobStatusList.findIndex(status => status.status_name.toLowerCase() === 'internal review 1');
    if (this.job_id && this.estimatedTime === '00:00' && selectedIndex >= querySentIndex) {
      this.apiService.showError('Please upadte the estimated time to change the status.');
      this.tempSelectedJobStatus = '';
      this.jobFormGroup.patchValue({ job_status: this.jobDetails?.job_status })
      // this.jobFormGroup.get('job_status')?.setValue(''); // Optionally reset the selection
    } 
  }

  shouldDisableStatus(statusName: string): boolean {
  if (this.estimatedTime !== '00:00') return false;

  const jobStatusList =  this.filteredJobStatusList(); // Or use the full list if needed
  const querySentIndex = jobStatusList.findIndex(item => item.status_name === 'Query sent');
  const currentIndex = jobStatusList.findIndex(item => item.status_name === statusName);

  return currentIndex >= querySentIndex;
}

  public saveJobDetails() {
    if (this.jobFormGroup.invalid) {
      this.jobFormGroup.markAllAsTouched();
      this.formErrorScrollService.setUnsavedChanges(true);
      this.formErrorScrollService.scrollToFirstError(this.jobFormGroup);
      console.log('this.jobFormGroup',this.jobFormGroup.controls)
    } else {
      if (this.isEditItem) {
        this.formData = this.createFromData();
        // console.log(this.formData)
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
    this.formData.set('budget_time', this.jobFormGroup?.get('budget_time')?.value);
    this.formData.set('job_status', this.jobFormGroup?.get('job_status')?.value);
    this.formData.set('percentage_of_completion', this.jobFormGroup?.get('percentage_of_completion')?.value);
    this.formData.set('job_status_date', this.datepipe.transform(this.jobFormGroup?.get('job_status_date')?.value, 'YYYY-MM-dd'));
    this.formData.set('option', this.jobFormGroup?.get('option')?.value.toString());
    this.formData.set('created_by', this.jobFormGroup?.get('created_by')?.value);
    this.formData.set('job_notes', this.jobFormGroup?.get('job_notes')?.value || '');
    this.formData.set('updated_by', this.jobFormGroup?.get('updated_by')?.value);
    this.formData.set("employees", JSON.stringify(this.jobFormGroup?.get('employees')?.getRawValue()) || []);
    this.formData.set("status", (this.tempSelectedJobStatus === 'cancelled' || this.tempSelectedJobStatus === 'completed') ? false : true);
    this.formData.set("is_allocated", this.jobFormGroup.get('is_allocated')?.value ? 'true' : 'false');
    this.formData.set("all_employees", this.jobFormGroup.get('all_employees')?.value ? 'true' : 'false');
    this.formData.set("add_employees", this.jobFormGroup.get('add_employees')?.value ? 'true' : 'false');
    this.formData.set("only_admin_can_change_job_status", this.jobFormGroup.get('only_admin_can_change_job_status')?.value ? 'true' : 'false');
    const json = this.formDataToJson(this.formData);

    return json;
  }

  public resetFormState() {
    this.formGroupDirective?.resetForm();
    this.formErrorScrollService.resetHasUnsavedValue();
    this.isEditItem = false;
    this.initialFormValue = this.jobFormGroup?.getRawValue();
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
        this.resetFormState();
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
    // console.log(typeof this.jobFormGroup?.value.is_allocated,this.jobFormGroup?.value.is_allocated)
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
    this.getManagers(managerQuery);
    this.updateDropdownOptionlist();

  }

updateDropdownOptionlist(){
  if(this.employeeFormArray && this.employeeFormArray.length>=1){
this.employeeFormArray.controls.forEach((controls:any,index:any)=>{
this.filteredEmployeeLists[index]=[...this.allEmployeeList];
this.filteredManagerLists[index]=[...this.allManagerList];
   });
  }

}

  public onSelectionAllEmployee(event: any) {
    if (event.checked === true) {
      this.selectAllEmpFlag = true;
      this.employeeFormArray.clear();
      this.allEmployeeList.forEach((element: any,index:any) => {
        // Check if the reporting_manager_id exists in the allManagerList
        this.filteredEmployeeLists[index] = [...this.allEmployeeList];
        this.filteredManagerLists[index] = [...this.allManagerList];
        const isManagerValid = this.allManagerList?.some((manager: any) => manager?.user_id === element?.reporting_manager_id);
        // let empData = this.fb.group({
        //   'employee': element?.user_id,
        //   'manager': isManagerValid ? element?.reporting_manager_id : '',
        //   'is_primary': this.user_role_name === 'Accountant' ? true : false
        // });
        let empData = this.fb.group({
          'employee': [element?.user_id, Validators.required],
          'manager': [isManagerValid ? element?.reporting_manager_id : '', Validators.required],
          'is_primary': [this.user_role_name === 'Accountant' ? true : false]
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
      this.filteredEmployeeLists[0] = [...this.allEmployeeList];
      this.filteredManagerLists[0] = [...this.allManagerList];
    }
    this.checkAllEmployeeCheckbox();
  }


  public editContact(index: number) {
    const empItem = this.employeeFormArray.at(index);
    empItem?.get('employee')?.enable();
    empItem?.get('manager')?.enable();
    empItem?.get('is_primary')?.enable();
  }

  saveChanges(index: number) {
    const empItem = this.employeeFormArray.at(index) as FormGroup;
    // console.log(empItem.valid)
    empItem.markAllAsTouched();
    empItem.updateValueAndValidity();
    
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
    let period_name = this.jobFormGroup?.get('period')?.value;
    if(this.modeName!='One off'){
    if (this.jobFormGroup?.get('end_client')?.valid && this.jobFormGroup?.get('service')?.valid && this.jobFormGroup?.get('period')?.valid) {
      let job_name = `${endClientName} ${service_name} ${period_name}`;
      this.jobFormGroup?.patchValue({ 'job_name': job_name });
      }
    }else{
     if (this.jobFormGroup?.get('end_client')?.valid && this.jobFormGroup?.get('service')?.valid) {
      let job_name = `${endClientName} ${service_name}`;
      this.jobFormGroup?.patchValue({ 'job_name': job_name });
      }
    }

  }

  private getSelectedEndClient(id: any) {
     const endClient :any = this.dropdownState.end_client.list.find((endClient: any) => endClient?.id === id) // new code
    // const endClient = this.endClientslists.find((endClient: any) => endClient?.id === id)
    return endClient?.client_name || '';
  }
  private getSelectedService(id: any) {
    const service = this.allServiceslist.find((service: any) => service?.id === id)
    return service?.service_name || '';
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
      } else if (value === 'true') {
        obj[key] = true;
      } else if (value === 'false') {
        obj[key] = false;
      }
      else {
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


  checkAllEmployeeCheckbox() {
    if (this.user_role_name === 'Admin' && this.employeeFormArray.length === this.allEmployeeList.length) {
      this.jobFormGroup.patchValue({ 'all_employees': true })
    } else {
      this.jobFormGroup.patchValue({ 'all_employees': false });
      this.jobFormGroup.patchValue({ 'add_employees': false })
    }
  }

  canDeactivate(): Observable<boolean> {
    const currentFormValue = this.jobFormGroup?.getRawValue();
    const isFormChanged: boolean = JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
    return this.formErrorScrollService.isFormDirtyOrInvalidCheck(isFormChanged, this.jobFormGroup);
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: BeforeUnloadEvent): void {
    const currentFormValue = this.jobFormGroup.getRawValue();
    const isFormChanged: boolean = JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue);
    if (isFormChanged || this.jobFormGroup.dirty) {
      $event.preventDefault();
    }
  }

  parseInput(val: string) {
    val = (val || '').toUpperCase().trim();

    if (this.modeName === 'Quaterly') {
      const match = val.match(/^Q([1-4])\s*(\d{4})?$/);
      if (match) {
        this.selectedQuarter = `Q${match[1]}`;
        this.year = +match[2] || this.year;
        this.emitValue(this.selectedQuarter);
      }
    } else if (this.modeName === 'Monthly') {
      const match = val.match(/^(January|February|March|April|May|June|July|August|September|October|November|December)\s*(\d{4})?$/i);
      if (match) {
        this.selectedMonth = match[1];
        this.year = +match[2] || this.year;
        this.emitValue(this.selectedMonth);
      }
    } else if (this.modeName === 'Yearly') {
      const match = val.match(/^\d{4}$/);
      if (match) {
        this.year = +match[0];
        this.emitValue(this.year.toString());
      }
    }
  }

  emitValue(period: string) {
    if (!this.year) return;
    if (this.modeName !== 'Yearly') {
      const newVal = `${period} ${this.year}`;
      this.jobFormGroup.get('period')?.patchValue(newVal, { emitEvent: false });
    } else {
      const newVal = `${this.year}`;
      this.jobFormGroup.get('period')?.patchValue(newVal, { emitEvent: false });
    }
    this.cdr.detectChanges();
    this.onPeroidChange();
  }

  finalSelectionMade(): boolean {
    if (this.modeName === 'Monthly') {
      return !!this.selectedMonth && !!this.year;
    }
    if (this.modeName === 'Quaterly') {
      return !!this.selectedQuarter && !!this.year;
    }
    if (this.modeName === 'Yearly') {
      return !!this.year;
    }
    return false;
  }

  select(period: string) {
    if (this.modeName === 'Monthly') {
      this.selectedMonth = period;
    } else if (this.modeName === 'Quaterly') {
      this.selectedQuarter = period;
    }

    if (this.finalSelectionMade()) {
      this.emitValue(period);
      this.showSelection = true;
      this.menuTrigger?.closeMenu();
    } else {

      this.showSelection = true;
      this.menuTrigger?.closeMenu();
    }
  }

  changeYear(val: number) {
    this.year = val;

    const currentPeriod =
      this.modeName === 'Monthly' ? this.selectedMonth :
        this.modeName === 'Quaterly' ? this.selectedQuarter :
          this.year.toString();
    this.showSelection = true;
    if (this.modeName === 'Yearly') {
      if (this.finalSelectionMade()) {
        this.emitValue(currentPeriod || '');
        this.menuTrigger?.closeMenu();
      }
    } else {
      this.menuTrigger?.openMenu();
    }
  }


  toggleView() {
    this.showSelection = !this.showSelection;
  }

  prevDecade() {
    this.yearRangeStart -= 10;
    this.showSelection = false;
    this.cdr.detectChanges();
  }

  nextDecade() {
    this.yearRangeStart += 10;
    this.showSelection = false;
    this.cdr.detectChanges();
  }

  dateClass = (date: Date) => {
  return date.getDay() === 0 ? 'sunday-highlight' : '';
};



// new code=================================================================
pageSizeDropdown = 10;

dropdownState = {
  client: {
    page: 1,
    list: [],
    search: '',
    totalPages: 1,
    loading: false,
    initialized: false
  },
   end_client: {
    page: 1,
    list: [],
    search: '',
    totalPages: 1,
    loading: false,
    initialized: false
  },
  job_type: {
    page: 1,
    list: [],
    search: '',
    totalPages: 1,
    loading: false,
    initialized: false
  }
};

dropdownEndpoints = {
  client: environment.clients,
  job_type: environment.settings_job_type,
  end_client: environment.end_clients
};

private scrollListeners: { [key: string]: (event: Event) => void } = {};

// Selected items for pagination dropdowns
selectedItemsMap: { [key: string]: any[] } = {
  client: [],
  employee: [],
  job_type:[]
};


removeScrollListener(key: string) {
  const panel = document.querySelector('.cdk-overlay-container .mat-select-panel');
  if (panel && this.scrollListeners[key]) {
    panel.removeEventListener('scroll', this.scrollListeners[key]);
    delete this.scrollListeners[key];
  }
}

onScroll(key: string, event: Event) {
  const target = event.target as HTMLElement;
  const state = this.dropdownState[key];
  const scrollTop = target.scrollTop;
  const scrollHeight = target.scrollHeight;
  const clientHeight = target.clientHeight;
  const atBottom = scrollHeight - scrollTop <= clientHeight + 5;
  if (atBottom && !state.loading && state.page < state.totalPages) {
    state.page++;
    this.fetchData(key, true);
  }
}

// Search input for pagination
onSearch(key: string, text: string) {
  const state = this.dropdownState[key];
  state.search = text.trim();
  state.page = 1;
  state.list = [];
  this.fetchData(key, false);
}

// Clear search input
clearSearchDropD(key: string) {
  this.dropdownState[key].search = '';
  this.dropdownState[key].page = 1;
  this.dropdownState[key].list = [];
  this.fetchData(key, false);
}

// Fetch data from API with pagination and search
fetchData(key: string, append = false) {
  const state = this.dropdownState[key];
  state.loading = true;

  let query = `page=${state.page}&page_size=${this.pageSizeDropdown}`;
  if (state.search) {
    query += `&search=${encodeURIComponent(state.search)}`;
  }
  if (key === 'client') {
    query += `&status=True`;
  }
  if(key === 'end_client'){
    query += `&client=${this.jobFormGroup.get('client')?.value}`
  }

  this.apiService.getData(`${environment.live_url}/${this.dropdownEndpoints[key]}/?${query}`)
    .subscribe((res: any) => {
      state.totalPages = Math.ceil(res.total_no_of_record / this.pageSizeDropdown);
      const selectedItems = this.selectedItemsMap[key] || [];
      const selectedIds = selectedItems.map(item => item.id);
      const filteredResults = res.results.filter(
        (item: any) => !selectedIds.includes(item.id)
      );
      if (append) {
        state.list = [...state.list, ...filteredResults];
      } else {
        state.list = [...selectedItems, ...filteredResults];
      }
      state.loading = false;
      this.cdr.detectChanges();
    }, () => {
      state.loading = false;
    });
}

// Update selectedItemsMap with full objects to keep selected at top & no duplicates
updateSelectedItems(key: string, selectedIds: any[]) {
  if (!Array.isArray(selectedIds)) {
    selectedIds = selectedIds != null ? [selectedIds] : [];
  }
  const state = this.dropdownState[key];
  let selectedItems = this.selectedItemsMap[key] || [];
  // removing the unselected datas
  selectedItems = selectedItems.filter(item => selectedIds.includes(item.id));
  selectedIds.forEach(id => {
    if (!selectedItems.some(item => item.id === id)) {
      const found = state.list.find(item => item.id === id);
      if (found) {
        selectedItems.push(found);
      } else {
        // if we want then fetch item from API if not found 
      }
    }
  });

  this.selectedItemsMap[key] = selectedItems;
}

// Return options with selected items on top, no duplicates
getOptionsWithSelectedOnTop(key: string) {
  const state = this.dropdownState[key];
  const selectedItems = this.selectedItemsMap[key] || [];
  const unselectedItems = state.list.filter(item =>
    !selectedItems.some(sel => sel.id === item.id)
  );
  return [...selectedItems, ...unselectedItems];
}


// Called when the dropdown opens or closes
onDropdownOpened(isOpen, key: string) {
  if (isOpen) {
    if (!this.dropdownState[key].initialized || this.dropdownState[key].list.length === 0) {
      this.dropdownState[key].page = 1;
      this.fetchData(key, false);     
      this.dropdownState[key].initialized = true;
    }
    setTimeout(() => {
      this.removeScrollListener(key);

      const panel = document.querySelector('.cdk-overlay-container .mat-select-panel');
      if (panel) {
        this.scrollListeners[key] = (event: Event) => this.onScroll(key, event);
        panel.addEventListener('scroll', this.scrollListeners[key]);
      }
    }, 0);
  } else {
    this.removeScrollListener(key);
  }
}


commonOnchangeFun(event, key){
  this.updateSelectedItems(key, event.value);
}


patchDropdownValuesForEdit(data: any) {
  const setDropdownValue = (key: string, idKey: string, nameKey: string) => {
    const idVal = data?.[idKey];
    const nameVal = data?.[nameKey];
    if (idVal != null) {
      const obj: any = { id: idVal, [nameKey]: nameVal ?? '' };
      this.selectedItemsMap[key] = [obj];
      this.jobFormGroup.get(key)?.patchValue(idVal);
      if (!this.dropdownState[key]) {
        this.dropdownState[key] = {
          page: 1,
          list: [],
          search: '',
          totalPages: 1,
          loading: false,
          initialized: false
        };
      }
      this.dropdownState[key].list = this.dropdownState[key].list.filter(
        (it: any) => it?.id !== idVal
      );
      this.dropdownState[key].list.unshift(obj);
    }
  };
  setDropdownValue('client', 'client', 'client_name');
  setDropdownValue('end_client', 'end_client', 'end_client_name');
  setDropdownValue('job_type', 'job_type', 'job_type_name');
  this.cdr.detectChanges();
}



}
