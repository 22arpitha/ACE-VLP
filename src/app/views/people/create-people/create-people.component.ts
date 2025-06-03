import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Validators, FormBuilder, FormGroup, AbstractControl, ValidationErrors, FormControl } from '@angular/forms';
import { ApiserviceService } from '../../../service/apiservice.service';
import { DatePipe } from '@angular/common';
import { error } from 'console';
import { environment } from 'src/environments/environment';
import { Location } from '@angular/common';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { Router } from '@angular/router';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-create-people',
  templateUrl: './create-people.component.html',
  styleUrls: ['./create-people.component.scss']
})
export class CreatePeopleComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;
  BreadCrumbsTitle: any = 'Create Employee';
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
  fourthFormGroup: FormGroup;
  isEditable = false;
  registrationForm: FormGroup;
  submitted = false;
  gender: any = [];
  maritalStatus: any = []
  managerRoleId: any;
  userId: any;
  reportingManagerId: any = [];
  departmentList: any = [];
  employeeId: any
  firstButtonName: String;
  secondButtonName: String;
  params = {
    pagination: "FALSE"
  }
  allPrefix: any = [];
  allCenter: any = [];
  allDesignation: any = [];
  allRole: any = [];
  allCostCenter: any = [];
  uploadFile: any;
  profileimg = 'text'
  fileDataUrl: any = null;
  tempStoreProfileImage: any = null;
  url: any;
  fileUrl: string | ArrayBuffer;
  peopleForm: any;
  OrganizationAdded:boolean = false;
  eyeState: boolean = false;
  eyeIcon = 'visibility_off'
  passwordType = "password";
  orgId: any;
  status = [
    { value: true, viewValue: 'Active' },
    { value: false, viewValue: 'Inactive' },
  ];

  @ViewChild('fileInput') fileInput: ElementRef;
  constructor(
    private formBuilder: FormBuilder,
    private location: Location,
    private api: ApiserviceService,
    private common_service: CommonServiceService,
    private router: Router,
    private datePipe: DatePipe) {
  }

  ngOnInit() {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.userId = sessionStorage.getItem('user_id')
    this.orgId = JSON.parse(sessionStorage.getItem('organization_id'));
    this.employeeId = localStorage.getItem('employee_id');
    this.initStepper()
    this.getUserRole();
    this.getGenderList();
    this.getMritalStatus();
    this.getDepartment();
    setTimeout(() => {
      if (this.employeeId) {
        this.firstButtonName = 'Update & Proceed';
        this.getUserDetailsOfFirstStep(this.employeeId);
        // this.getEmployeeById(this.employeeId)
      } else {
        this.firstButtonName = 'Save & Proceed';
        this.secondButtonName = 'Save & Proceed';
        this.OrganizationAdded = false
      }
    }, 1000);

  }

  get uFirstNameControl(): FormControl {
    return this.firstFormGroup.get('first_name') as FormControl;
  }

  // gender list
  getGenderList() {
    this.api.getAllGenders().subscribe(
      (res: any) => {
        // console.log(res,'allgenders');
        this.gender = res;
      }
    )
  }

  // marital
  getMritalStatus() {
    this.api.getAllMaritalStatus().subscribe(
      (res: any) => {
        // console.log(res,'marital status');
        this.maritalStatus = res;
      }
    )
  }

  // Manager list
  getReportingManager() {
    this.api.getEmployeeList(`?${'organization_id'}=${this.orgId}&${'designation'}=${'manager'}`).subscribe((data: any) => {
      if (data) {
        // console.log('manager list', data)
        if (data.length == 0) {
          this.adminData();
        }
        else {
          let temp:any [];
          temp = data.map((element:any)=>element.user)
          // console.log('filtered',temp)
          this.reportingManagerId = temp;
        }
      }

    }, (error: any) => {
      this.api.showError(error.error.error.message)
      console.log(error, "ERROR")
    }

    )
  }
  adminData() {
    this.api.getProfileDetails(`?role_id=${2}&organization_id=${this.orgId}`).subscribe(
      (res: any) => {
        // console.log('admin',res);
        let data = [];
        // data.push({ 'first_name': res.first_name, 'id': res.id });
        res.forEach((element:any) => {
          data.push({ 'first_name': element.first_name, 'last_name': element?.last_name || '', 'id': element.id }); 
        });
        this.reportingManagerId = data;
      },
      (error: any) => {
        console.log('admin data error', error)
      }
    )
  }

  // Department list
  getDepartment() {
    this.api.getDepartmentList(`?${'organization_id'}=${this.orgId}`).subscribe((data: any) => {
      if (data) {
        // console.log('departments',data)
        this.departmentList = data;
      }
    }, (error: any) => {
      this.api.showError(error.error.error.message)
      //console.log(error,"ERROR")
    }
    )
  }

  // Roles
  getUserRole() {
    this.api.getAllRoles().subscribe((data: any) => {
      if (data) {
        const filteredRole = data.filter(role => role.role_name === 'Employee')
        this.allRole = filteredRole;
        this.firstFormGroup.patchValue({ role: this.allRole[0].id })
      }

    }, (error: any) => {
      this.api.showError(error.error.error.message)
    }
    )
  }

  // designation list
  getDesignations() {
    this.api.getDesignationList(`?${'organization_id'}=${this.orgId}`).subscribe((data: any) => {
      if (data) {
        // console.log('designations',data)
        this.allDesignation = data;
        this.getReportingManager();
      }

    }, (error: any) => {
      this.api.showError(error.error.error.message)
    }
    )
  }

  // get by id of employee
  getEmployeeById(id: any) {
    // console.log('id present', id);
    this.api.getEmployeeDetailsById(`${id}/`).subscribe(
      (res: any) => {
        // console.log('employee data', res)
        if (res.length != 0) {
          this.secondButtonName= 'Update & Proceed';
          this.OrganizationAdded = true;
          this.thirdFormGroup.patchValue({
            reporting_manager_id: res[0].reporting_manager_id,
            department: res[0].department,
            designation: res[0].designation,
            role: res[0].user.role,
            date_of_joining: res[0].user.date_joined,
            status: res[0].is_active,
            organization_id: res[0].organization
            // date_of_joining: this.datePipe.transform(res[0].date_of_joining, 'dd/MM/yyyy'),
          })
        } else {
          this.secondButtonName= 'Save & Proceed';
          this.OrganizationAdded = false;
        }
      },
      (error) => {
        console.log('employee data error', error)
      }
    )
  }
  getUserDetailsOfFirstStep(id: any) {
    this.api.getProfileDetails(`${id}/`).subscribe(
      (res: any) => {
        // console.log('only first step data', res);
        if (res.profile_image) {
          this.fileDataUrl = environment.media_url + res.profile_image
        } else{
          this.fileDataUrl = null;
        }
        this.firstFormGroup.patchValue({
          first_name: res.first_name,
          last_name: res.last_name,
          gender: res.gender,
          email: res.email,
          phone_number: res.phone_number,
          marital_status: res.marital_status,
          organization_id: this.orgId
          // profile_image:this.fileDataUrl
        })
        this.getEmployeeById(id);
      }
    )
  }

  initStepper() {
    // let passwordRegex = 
    this.firstFormGroup = this.formBuilder.group({
      profile_image: ['', [this.fileFormatValidator]],
      first_name: ['', [Validators.required, Validators.maxLength(50)]],
      last_name: ['', [Validators.required, Validators.maxLength(50)]],
      gender: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone_number: ['', [Validators.required, Validators.pattern('^\\d{10}$')]],
      marital_status: ['', Validators.required],
      role: ['', Validators.required],
      organization_id: this.orgId
    });
    // this.secondFormGroup = this.formBuilder.group({
    //   password: ['', [Validators.required]],

    // });
    this.thirdFormGroup = this.formBuilder.group({
      // org_code: ['', [Validators.required]],
      reporting_manager_id:['', Validators.required],
      department: ['', Validators.required],
      designation: ['', [Validators.pattern(/^\S.*$/), Validators.required]],
      date_of_joining: ['', Validators.required],
      status: ['', Validators.required],
      // role: ['', Validators.required],
      
      // prefix_suffix_id: ['', Validators.required],

    })
    this.fourthFormGroup = this.formBuilder.group({
      profile_image: this.firstFormGroup.value.profile_image,
      first_name: this.firstFormGroup.value.first_name,
      last_name: this.firstFormGroup.value.last_name,
      gender: this.firstFormGroup.value.gender,
      phone_number: this.firstFormGroup.value.phone_number,
      marital_status: this.firstFormGroup.value.marital_status,
      email: this.firstFormGroup.value.email,
      // password: this.secondFormGroup.value.password,
      // org_code: this.thirdFormGroup.value.org_code,
      reporting_manager_id: this.thirdFormGroup.value.reporting_manager_id,
      department: this.thirdFormGroup.value.department,
      designation: this.thirdFormGroup.value.designation,
      role: this.thirdFormGroup.value.role,
      date_of_joining: this.thirdFormGroup.value.date_of_joining,
      status: this.thirdFormGroup.value.status,
      // tags: ['', Validators.required],
      organization_id: this.orgId
    })
    this.getDesignations();
  }
  // onFocusProfileImg(){
  //   this.thirdFormGroup.get('profile_image')?.reset();
  // }
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

  triggerFileInput(text:any) {
    if(text=='Upload'){
      this.profileimg = 'file'
      this.fileInput?.nativeElement?.click();
    } 
    else{
      this.fileDataUrl = null;
      this.imageUploaded = true;
    }
  }

  temp: any;
  imageUploaded:boolean = false;
  uploadProflieImageFile(event: any) {
    const selectedFile = event.target.files[0];
    // console.log(event.target.files[0])
    if (selectedFile) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(selectedFile.type)) {
        this.imageUploaded = false;
        console.error('Invalid file type. Only .jpg, .jpeg, and .png files are allowed.');
        this.api.showError('Invalid file type, only .jpg, .jpeg, and .png files are allowed.')
        this.fileDataUrl = this.tempStoreProfileImage; // Clear any previously selected image
        this.firstFormGroup.patchValue({ profile_image: this.temp });
        return;
      } else {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.temp = this.firstFormGroup.value.profile_image;
          // console.log(this.temp)
          this.imageUploaded = true;
          this.fileDataUrl = e.target.result;
          this.tempStoreProfileImage = e.target.result;
        };
        reader.readAsDataURL(selectedFile);
      }
    }
    else{
      this.imageUploaded = false;
    }
  }

  validateKeyPress(event: KeyboardEvent) {
    const keyCode = event.which || event.keyCode;
    if ((keyCode < 48 || keyCode > 57) && keyCode !== 8 && keyCode !== 37 && keyCode !== 39) {
      event.preventDefault();
    }
  }
  joiningDateFun(event: any) {

  }

  patchingForthFormValue() {
    this.fourthFormGroup.patchValue({
      profile_image: '',
      first_name: this.firstFormGroup.value.first_name,
      last_name: this.firstFormGroup.value.last_name,
      gender: this.firstFormGroup.value.gender,
      phone_number: this.firstFormGroup.value.phone_number,
      marital_status: this.firstFormGroup.value.marital_status,
      email: this.firstFormGroup.value.email,
      role: this.firstFormGroup.value.role,
      // password: this.secondFormGroup.value.password,
      // org_code: this.thirdFormGroup.value.org_code,
      reporting_manager_id: this.thirdFormGroup.value.reporting_manager_id,
      department: this.thirdFormGroup.value.department,
      designation: this.thirdFormGroup.value.designation,
      date_of_joining: this.thirdFormGroup.value.date_of_joining,
      status: this.thirdFormGroup.value.status,
    })
    // console.log(' this.fourthFormGroup', this.fourthFormGroup.value)
  }
  setIndex(event) {
    // console.log(event,'index');
    this.patchingForthFormValue();
  }
  backToEmployeesTable() {
    localStorage.removeItem('employee_id');
    this.router.navigate(['./people/people-list'])
  }

  // uploadImageFile(event: any) {
  //   this.uploadFile = event.target.files[0];
  //   if (event.target.files && event.target.files[0]) {
  //     const reader = new FileReader();
  //     reader.readAsDataURL(event.target.files[0])
  //     reader.onload = (event: any) => {
  //       this.url = event.target.result;
  //       this.fileUrl = reader.result
  //       this.thirdFormGroup.patchValue({ profile_image: this.fileUrl })
  //     }
  //   }
  // }
  checkValidation(event,text:any) {
    if (event == 'step1') {
      this.handleStep1Validation(text);
    }
    else if (event == 'step2') {
      // console.log('step 2')
      this.patchingForthFormValue();
      this.handleStep2Validation(text);
    }
    else if (event == 'step3') {
      this.fourthFormGroup.markAllAsTouched()
      // console.log(this.fourthFormGroup.value);
    }
  }

  handleStep1Validation(text:any) {
    if (this.firstFormGroup.invalid) {
      this.firstFormGroup.markAllAsTouched();
    } else {
      let data = {
        first_name: this.firstFormGroup.value.first_name,
        last_name: this.firstFormGroup.value.last_name,
        gender: this.firstFormGroup.value.gender,
        marital_status: this.firstFormGroup.value.marital_status,
        phone_number: this.firstFormGroup.value.phone_number,
        email: this.firstFormGroup.value.email,
        role: this.firstFormGroup.value.role,
        organization_id: this.orgId
      }
      if (this.imageUploaded) {
        data['profile_image'] = this.fileDataUrl;
      } 
      // console.log(data,'before api')
      if(text==='add'){
        this.addFirstDetails(data);
      } else{
        this.updateFirstDetails(data);
      }
    }
  }

  addFirstDetails(data:any){
    this.api.postEmployee(data).subscribe(
      (res: any) => {
        // console.log('employee data added', res);
        localStorage.setItem('employee_id', res.user.id)
        this.employeeId = localStorage.getItem('employee_id')
        this.firstButtonName = 'Update & Proceed';
        this.api.showSuccess(res.message);
        this.stepper.next();
      },
      (error) => {
        console.log('employee post error', error);
        this.api.showError(error.error.email[0])
      }
    )
  }
  updateFirstDetails(data:any){
    // console.log('update 1st step',data)
    this.api.updateUserProfileDetails(this.employeeId,data).subscribe(
      (res: any) => {
        // console.log('employee data updated', res);
        this.firstButtonName = 'Update & Proceed';
        this.api.showSuccess(res.message);
        this.stepper.next();
      },
      (error) => {
        console.log('employee post error', error);
        this.api.showError(error.error.email[0])
      }
    )
  }
  handleStep2Validation(text:any) {
    if (this.thirdFormGroup.invalid) {
      this.thirdFormGroup.markAllAsTouched();
    }
    else {
      let data = {
        reporting_manager_id: this.thirdFormGroup.value.reporting_manager_id,
        department: this.thirdFormGroup.value.department,
        designation: this.thirdFormGroup.value.designation,
        // role: this.thirdFormGroup.value.role,
        date_of_joining: this.datePipe.transform(this.thirdFormGroup.value.date_of_joining, 'yyyy-MM-dd'),
        status: this.thirdFormGroup.value.status,
        created_by: this.userId,
        updated_by: this.userId
      }
      this.api.putOrganizationDataOfEmployee(data, this.employeeId).subscribe(
        (res: any) => {
          if(res){
          // console.log('organization details updated', res);
          this.api.showSuccess(res.message);
          this.secondButtonName= 'Update & Proceed';
          this.stepper.next();
          }
        },
        (error) => {
          console.log('employee post error', error)
        }
      )
    }
  }

  addSecondDetails(data:any){
    // console.log(data)
    this.api.postOrganizationDataOfEmployee(data, this.employeeId).subscribe(
      (res: any) => {
        if(res){
        // console.log('organization details added', res);
        this.api.showSuccess(res.message);
        this.secondButtonName= 'Update & Proceed';
        this.stepper.next();
        }
      },
      (error) => {
        console.log('employee post error', error)
      }
    )
  }
  updateSecondDetails(data:any){
    // console.log(data,'second')
    this.api.putOrganizationDataOfEmployee(data, this.employeeId).subscribe(
      (res: any) => {
        if(res){
        // console.log('organization details updated', res);
        this.api.showSuccess(res.message);
        this.secondButtonName= 'Update & Proceed';
        this.stepper.next();
        }
      },
      (error) => {
        console.log('employee post error', error)
      }
    )
  }

  checkUpdateValidation(event) {
    if (event == 'step1') {
      this.firstFormGroup.markAllAsTouched();
      // console.log('update', this.firstFormGroup.value)
      this.stepper.next();
    }
    else if (event == 'step2') {
      this.thirdFormGroup.markAllAsTouched();
      this.stepper.next();
    } else if (event == 'step3') {
      this.fourthFormGroup.markAllAsTouched()
      // console.log(this.fourthFormGroup.value);
    }
  }
  showPassword() {
    this.eyeState = !this.eyeState
    if (this.eyeState == true) {
      this.eyeIcon = 'visibility'
      this.passwordType = 'text'
    }
    else {
      this.eyeIcon = 'visibility_off'
      this.passwordType = 'password'
    }

  }

  onSubmit() {

    let data = {
      first_name: this.firstFormGroup.value.first_name,
      last_name: this.firstFormGroup.value.last_name,
      gender: this.firstFormGroup.value.gender,
      marital_status: this.firstFormGroup.value.marital_status,
      phone_number: this.firstFormGroup.value.phone_number,
      email: this.secondFormGroup.value.email,
      // password: this.secondFormGroup.value.password,
      org_code: this.secondFormGroup.value.org_code,
      designation: this.secondFormGroup.value.designation,
      date_of_joining: this.secondFormGroup.value.date_of_joining,
      center_id: this.thirdFormGroup.value.center_id,
      reporting_manager_id: this.thirdFormGroup.value.reporting_manager_id,
      profile_image: this.thirdFormGroup.value.profile_image,
      // prefix_suffix_id: this.thirdFormGroup.value.prefix_suffix_id,
      department: this.thirdFormGroup.value.department,
      role_id: this.thirdFormGroup.value.role_id,
      user_role_id: Number(this.fourthFormGroup.value.user_role_id),
      cost_center_id: this.fourthFormGroup.value.cost_center_id,
      // tags: [Number(this.fourthFormGroup.value.tags)],
      organization_id: this.orgId,
      status: this.fourthFormGroup.value.status
    }
    // stop here if form is invalid
    if (this.fourthFormGroup.invalid) {
      this.fourthFormGroup.markAllAsTouched()
      //console.log(this.fourthFormGroup.value,"FOURTH FORM")
      // if (this.fourthFormGroup.value.tags == null) {
      //   this.submitted = true
      // }
      this.api.showError('Invalid!')
    }
    else {
      this.api.register(data).subscribe((res: any) => {
        if (res) {
          if (res['result']) {
            this.api.showSuccess('People added successfully!!')
            setTimeout(() => {
              location.reload()
            }, 500);
            sessionStorage.setItem('centerId', res['result'].center_id)
          }
          else {
            if (res) {
              this.api.showError(res.error)
              //console.log(res,"ERROR") 
            }
          }
        }
      }, (error: any) => {
        this.api.showError(error.error.error.message)
        //console.log(error,"ERROR")
      })
    }


  }



  goBackPreviousPage() {
    this.location.back();
  }
}