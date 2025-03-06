import { DatePipe } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import {
  Validators,
  FormBuilder,
  FormGroup,
  FormControl,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ApiserviceService } from '../../../service/apiservice.service';
import { Location } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { CommonServiceService } from '../../../service/common-service.service';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { MatSelectionListChange } from '@angular/material/list';
import { SubModuleService } from '../../../service/sub-module.service';
@Component({
  selector: 'app-leave-application',
  templateUrl: './leave-application.component.html',
  styleUrls: ['./leave-application.component.scss'],
})
export class LeaveApplicationComponent implements OnInit {
  leaveForm!: FormGroup;
  BreadCrumbsTitle: any = 'Apply';
  allLeave: any = [];
  leave: any;
  uploadFile: any;
  url: any;
  fileUrl: string | ArrayBuffer;
  user_id;
  userRole:string;
  accessPermissions:any = []
  balanceLeave: any;
  workingDays: number;
  min = new Date().toISOString().split('T')[0];
  ccSetting: {
    singleSelection: boolean;
    idField: string;
    textField: string;
    itemsShowLimit: number;
    allowSearchFilter: boolean;
  };
  allPeopleGroup: any;
  peopleId: any;
  leaveType: any = [];
  invalidDate: boolean = false;

  disableTextbox: boolean = true;
  disableTextbox2: boolean = true;

  leaveDetails: any = [];
  reservedDates: any = [];
  noLeaves: boolean = false;
  minDate: any;
  maxDate: any;
  orgId: any;
  fileDataUrl: string | ArrayBuffer | null = null;
  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild('ccTo') ccTo: ElementRef;
 // Dropdown data as array of objects
 
sessions = [
  { value: 'session1', viewValue: 'Session 1' },
  { value: 'session2', viewValue: 'Session 2' }
];
  leaveBalance: any;
  applyingDays: number;
  today: Date;
  allEmployees: any;
  filteredEmployees: any = [];
  searchTerm: any;
  selectedEmployees: any;
  isDropdownOpen: boolean = false;
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  selectedCC: any;
  ccToIds: any = [];
  adminlistData: any;
  constructor(
    private builder: FormBuilder,
    private api: ApiserviceService,
    private datepipe: DatePipe,
    private location: Location,
    private common_service: CommonServiceService,
    private accessControlService:SubModuleService
  ) { 
   
  }
  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
   
    // Add 
    if ((value || '').trim()) {
      if (!this.ccToList.includes(value)) {  // Assuming selectedEmployees is your list
        this.ccToList.push(value.trim());
      }
      
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

  }
   
  onSelectionChange(event: MatSelectionListChange): void {
    const selectedEmployee = event.option.value;
  
    // Check if the employee is already selected to avoid duplicates
    if (event.option.selected) {
      if (!this.ccToList.includes(selectedEmployee)) {  // Assuming selectedEmployees is your list
        this.add(selectedEmployee);
      }
    } else {
      this.remove(selectedEmployee);
    }
  }
  

  remove(employee: string): void {
    const index = this.ccToList.indexOf(employee);

    if (index >= 0) {
      this.ccToList.splice(index, 1);
      this.ccToIds.splice(index, 1);
      if(this.ccToIds.length === 0){
        this.leaveForm.patchValue({
          cc_to_input:'',
          cc_to: ''
        });
        this.leaveForm.markAllAsTouched()
        
      }
     
      this.isDropdownOpen = false;
    }
    
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.ccToList.push(event.option.value);
      this.ccInput.nativeElement.value = '';
      
      const selectedEmployee = this.allEmployees.find(
        (emp: any) => emp.user.first_name === event.option.value
      );
    
      if (selectedEmployee) {
        // Push both the name and ID to ccToList for easy access
        this.ccToIds.push({ name: selectedEmployee.user.first_name, id: selectedEmployee.user.id });
    
        // Clear input field and reset form control
        this.ccInput.nativeElement.value = '';
        
    
        // Get selected IDs (optional, if needed for other purposes)
        const selectedIDs = this.ccToIds.map(item => item.id);
     //   console.log('Selected IDs:', selectedIDs);
        this.leaveForm.patchValue({
          cc_to_input:'',
          cc_to: selectedIDs
        });
       }

  }

  onFileChange($event){}
 
  fruitCtrl = new FormControl();
  filteredFruits: Observable<string[]>;
  ccToList:any = [];


  @ViewChild('ccInput') ccInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  goBack(event) {
    event.preventDefault(); // Prevent default back button behavior
    this.location.back();
  }
  triggerFileInput() {
    this.fileInput?.nativeElement?.click();
  }
  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.user_id = JSON.parse(sessionStorage.getItem('user_id') || '');
    this.userRole = sessionStorage.getItem('user_role_name');
    this.today = new Date()
    this.orgId = sessionStorage.getItem('organization_id')
    //this.getPeopleGroup();
    this.getLeaveType();
    this.getAllEmployee();
    this.initForm();
   // this.enableDatepicker();
   this.getModuleAccess();
   this.getRecentAddedAdminlistData()
  }
  // Close dropdown and clear filter when clicking outside
  @HostListener('document:click', ['$event.target'])
  closeDropdown(target: HTMLElement): void {
    const isInsideClick = target.closest('.dropdown-container');
    if (!isInsideClick) {
      this.isDropdownOpen = false;
    }
  }
  removeToDate(){
    this.leaveForm.patchValue({
      leaveApplication_to_date:''
    })
  }
  getLeaveBalance(){
    this.api.getData(`${environment.live_url}/${environment.employee_leaves}/?employee-id=${this.user_id}&leave-type-id=${this.leaveForm.value.leave_type_id}`).subscribe((res:any)=>{
      if(res){
        this.leaveBalance = res?.[0]['total_number_of_leaves']
      }
    })
  }
  getAllleaveData() {
    let params = {
      pagination: 'FALSE',
    };
    let user_id = sessionStorage.getItem('user_id');
    this.api
      .getData(
        `${environment.live_url}/${environment.users_leave_details}?user_id=${user_id}&method=VIEW&menu=MY_LEAVES&module=LEAVE/HOLIDAY_LIST&page_number=1&data_per_page=2&pagination=${params.pagination}&organization_id=${this.orgId}`
      )
      .subscribe(
        (res: any) => {
          if (res.result.data) {
            this.leaveDetails = res.result.data;
            this.leaveDetails.forEach((element) => {
              // this.reservedDates.push({
              //   fromDate: this.datepipe.transform(element.leaveApplication_from_date * 1000, 'yyyy-MM-dd'),
              //   toDate: this.datepipe.transform(element.leaveApplication_to_date * 1000, 'yyyy-MM-dd')
              // });
              this.reservedDates.push(
                this.datepipe.transform(
                  element.leaveApplication_from_date * 1000,
                  'yyyy-MM-dd'
                )
              );
            });
          }

          //console.log(this.reservedDates,"FROMDATE")
        },
        (err) => {
          this.api.showError(err.error?.message);
        }
      );
  }
 
  toggleDisable(event) {
    if (event == 'from_date') {
      this.disableTextbox2 = false;
      this.leaveForm.patchValue({
        leaveApplication_to_date: '',
      });
      //this.invalidDate = false;
    } else if (event == "from1_session") {
      this.leaveForm.patchValue({
        leaveApplication_to_date: '',
        from1_session: ''
      })
    } else {
      this.disableTextbox2 = true;
      if (event == 'leave_type_id') {
        this.disableTextbox = false;
        this.leaveForm.patchValue({
          leaveApplication_from_date: '',
          leaveApplication_to_date: '',
          from1_session: '',
          to1_session: '',
          balance: '',
          days: '',
        });
        // this.disableTextbox2 = true;
      }
    }
  }
  getLeaveType() {
    
    this.api.getData(`${environment.live_url}/${environment.leave_master}/?employee-id=${this.user_id}&organization=${this.orgId}`).subscribe(
      (data: any) => {
        this.leaveType = data;
      },
      (error) => {
        this.api.showError(error?.error?.message);
      }
    );
  }
  endDateValidator(): any {
    const yearStartDate =
      new Date(
        this.leaveForm.get('leaveApplication_from_date')?.value
      ).getTime() /
      (1000 * 60);
    const yearEndDate =
      new Date(this.leaveForm.get('leaveApplication_to_date')?.value).getTime() /
      (1000 * 60);
    if (yearStartDate > yearEndDate) {
      this.invalidDate = true;
    } else {
      this.invalidDate = false;
    }
    this.leaveForm.patchValue({
      to1_session: '',
      balance: '',
      days: '',
    });
  }

  initForm() {
    this.leaveForm = this.builder.group({
      reason: ['', [Validators.pattern(/^\S.*$/), Validators.required]],
      leave_application_file_attachment: ['',this.fileFormatValidator],
      leaveApplication_from_date: ['', [Validators.required]],
      leaveApplication_to_date: ['', [Validators.required]],
      leave_type_id: ['', [Validators.required]],
      from1_session: ['', [Validators.required]],
      to1_session: ['', [Validators.required]],
      applying_to:['',[Validators.required]],
      cc_to_input:[''],
      cc_to:['',[Validators.required]],
    });
   
  }

  getModuleAccess(){
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe((access) => {
      if (access) {
        this.accessPermissions = access[0].operations;
        console.log('Access Permissions:', this.accessPermissions);
      } else {
        console.log('No matching access found.');
      }
    });
  }
  isPointerDisabled(): boolean {
    if (this.userRole === 'Admin') {
      return true;
    }
    if (this.userRole === 'Employee' && this.accessPermissions[0]?.create==true) {
      return true;
    }
    return false;
  }

  // Filtering method
  filterEmployees(): void {
    if(this.leaveForm.value.cc_to_input){
    this.filteredEmployees = this.allEmployees?.filter((employee:any) =>
      employee.user.first_name.toLowerCase().includes(this.leaveForm.value.cc_to_input.toLowerCase())
    );
    this.isDropdownOpen = true;
  }else{
    this.filteredEmployees = []
  }
  }
  

  

  calculateApplyingDays() {
    const fromDate = this.leaveForm.get('leaveApplication_from_date')?.value;
    const fromSession = this.leaveForm.get('from1_session')?.value;
    const toDate = this.leaveForm.get('leaveApplication_to_date')?.value;
    const toSession = this.leaveForm.get('to1_session')?.value;

    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);

      // Calculate the difference in days
      let diffInTime = to.getTime() - from.getTime();
      let diffInDays = diffInTime / (1000 * 3600 * 24);

      // If the fromDate and toDate are the same day
      if (from.getTime() === to.getTime()) {
        if (fromSession === '' && toSession === '' || fromSession === null && toSession === null) {
          this.applyingDays = 1;
        }else if (fromSession === toSession) {
          this.applyingDays = 0.5;
          // If sessions are the same on the same day, it counts as 0.5 days
        } else {
          // If sessions are different on the same day, it counts as 1 full day
          this.applyingDays = 1;
        }
      } else {
        // For different dates, adjust for sessions
        if (fromSession === 'session2') {
          // If starting with the afternoon session, subtract 0.5 day
          diffInDays -= 0.5;
        }

        if (toSession === 'session1') {
          // If ending with the morning session, subtract 0.5 day
          diffInDays -= 0.5;
        }
        
        // Set the number of applying days (add 1 to include the first day)
        this.applyingDays = diffInDays + 1;
      }
    }
  }


  submit(){
   
    
    const data = {
      leave_type: this.leaveForm.value.leave_type_id,
      number_of_leaves_applying_for: this.applyingDays,
      from_date: this.datepipe.transform(this.leaveForm.value.leaveApplication_from_date,'yyyy-MM-dd'),
      to_date: this.datepipe.transform(this.leaveForm.value.leaveApplication_to_date,'yyyy-MM-dd'),
      reporting_to: this.leaveForm.value.applying_to,
      cc: JSON.stringify(this.leaveForm.value.cc_to), 
      employee: this.user_id,
      attachment: this.fileUrl || null,
      message: this.leaveForm.value.reason,
      organization: Number(this.orgId)
    };
    if(this.leaveForm.invalid){
      this.leaveForm.markAllAsTouched()
    }else{
      if(this.applyingDays > this.leaveBalance){
        this.api.showWarning(`Applied leaves should not exceed the available leave balance`);
      }else{
        this.api.postData(`${environment.live_url}/${environment.apply_leave}/`,data).subscribe((res:any)=>{
          if(res){
            this.api.showSuccess('Leave application created successfully!')
            this.leaveForm.reset()
            this.applyingDays = 0
            this.leaveBalance = ""
            this.fileDataUrl = ""
            this.ccToList = []
          }
         },(error)=>{
          this.api.showError(error?.error?.message)
         })
      }
   
    }
  }
  getRecentAddedAdminlistData() {
   
    this.api.getData(`${environment.live_url}/${environment.user}/?role_id=2&organization_id=${this.orgId}`).subscribe((data: any) => {
      if(data){
        this.adminlistData = data;
      }
     
    }, ((error) => {
      this.api.showError(error?.error?.message)
    })
    )
  }
  fileFormatValidator(control: AbstractControl): ValidationErrors | null {
    const allowedFormats = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'];
    const file = control.value;
    if (file) {
      const fileExtension = file.substr(file.lastIndexOf('.')).toLowerCase();
      if (!allowedFormats.includes(fileExtension)) {
        return { accept: true };
      }
    }
    return null;
  }

  get f() {
    return this.leaveForm.controls;
  }
  uploadImageFile(event: any) {
    this.uploadFile = event.target.files[0];
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event: any) => {
        this.url = event.target.result;
        if (reader.result) {
          this.fileUrl = reader.result;
        }
        this.fileDataUrl = reader.result
        // this.leaveForm.patchValue({
        //   leave_application_file_attachment: this.fileUrl,
        // });
      };
    }
  }

  getBalance(workingdays) {
    let data = {
      leave_title: this.leaveForm.value.leave_type_id,
      description: this.leaveForm.value.reason,
      accrude_monthly: false,
      monthly_leaves: '',
      yearly_leaves: 20,
      carry_forward_per: '',
      gracefull_days: 2,
      encashment: false,
      max_encashments: '',
      leave_applicable_for: 1,
    };

    let params = {
      user_id: this.user_id,
      days: workingdays,
      leave_type_id: this.leaveForm.value.leave_type_id,
      from_date: this.leaveForm.value.leaveApplication_from_date,
      to_data: this.leaveForm.value.leaveApplication_to_date,
      from_session: this.leaveForm.value.from1_session,
      to_session: this.leaveForm.value.to1_session
    };
    this.api.getLeaveBalance(params, data).subscribe(
      (res) => {
        this.balanceLeave = res['result'].balance_days;
        this.noLeaves = false;
        this.leaveForm.patchValue({
          balance: this.balanceLeave ? this.balanceLeave : 0,
        });
      },
      (error: any) => {
        this.noLeaves = true;
        this.api.showError(error.error.message);
      }
    );
  }
  
  getAllEmployee(){
   
    this.api.getData(`${environment.live_url}/${environment.all_employee}/?organization_id=${this.orgId}`).subscribe((res:any)=>{
      if(res){
        this.allEmployees = res
      }
    },(error)=>{
      this.api.showError(error?.error?.message)
    })
  }
}
