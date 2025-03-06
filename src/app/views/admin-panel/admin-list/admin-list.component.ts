import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericDeleteComponent } from 'src/app/generic-delete/generic-delete.component';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { environment } from 'src/environments/environment';
import { SubscriptionAlertComponent } from '../subscription-alert/subscription-alert.component';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { query } from '@angular/animations';

@Component({
  selector: 'app-admin-list',
  templateUrl: './admin-list.component.html',
  styleUrls: ['./admin-list.component.scss']
})
export class AdminListComponent implements OnInit {

  breadCrumbsTitle: string = 'Manage Admins';
  organizationForm: FormGroup;
  uploadFile: any;
  orgData = {}
  url: any;
  type = 'url';
  fileUrl: string | ArrayBuffer;
  leaveForm: any;
  id: any;
  base64String: string;
  base64WithPrefix: any;
  eyeState: boolean = false;
  eyeIcon = 'bi bi-eye-slash'
  passwordType = "password";
  country: any = [];
  state: any = [];
  city: any = [];
  adminList: any = [];
  fileDataUrl:string;
  status:boolean = false;
  tableSize = 5;
  @ViewChild('fileInput') fileInput: ElementRef;
  adminForm: FormGroup;
  adminFormArray: FormArray;
  isAdminForm = false;
  logoImage: boolean = false;
  organization_id: any;
  tableSizes:any = [5,10,20,50,100];
  term: any;
  page: any = 1;
  count = 0
  constructor(private _fb: FormBuilder,
    private api: ApiserviceService, private route: ActivatedRoute,
    private common_service: CommonServiceService,
    private modalService:NgbModal) {
    this.id = this.route.snapshot.paramMap.get('id')
    this.initializeAdminFormArray()
  }

  ngOnInit(): void {
    this.common_service.setTitle(this.breadCrumbsTitle);
    // this.id = sessionStorage.getItem('user_id')
    this.organization_id = JSON.parse(sessionStorage.getItem('organization_id'))
    let query = `?page=1&page_size=5`
    // this.getOrgDetails(query);
    // this.openSubscription()
  }

 
  openAdminForm(){
    this.adminintForm();
    this.adminList.forEach((admin:string)=>admin['isEditing'] = false)
    this.isAdminForm=!this.isAdminForm 
  }
  onItemsPerPageChange(event){}
  onPageChange(event){}
  
  
   deleteAdmin(adminId,index: number) {
    
    this.adminFormArray.removeAt(index);
    this.adminList.splice(index, 1);
    const data = {
      admin_details: this.adminList // Use the admin list to submit the data
    };
    if(adminId){
      this.api.delete(`${environment.live_url}/${environment.user}/${adminId}/`, ).subscribe(
        res => {
          if (res) {
            this.api.showSuccess("Admin deleted successfully!");
            // this.organizationForm.reset();
            this.adminForm.reset();
            this.isAdminForm = true;
            this.adminList = []; // Clear the admin list after submission
            let query = `?page=${this.page}&page_size=${this.tableSize}`
            this.getOrgDetails(query); // Refresh the organization details
          }
        },
        error => {
          this.api.showError(error?.error?.message);
        }
      );
    }
   
  
  }
  
  
  adminintForm(){
    this.adminForm = this._fb.group({
      admin_name: ['', [Validators.pattern(/^[A-Za-z][A-Za-z\s]*$/),Validators.required]],
      admin_email_id: ['', [Validators.required, Validators.email,this.emailMatchValidator()]],
      admin_phone_number: ['', [Validators.required, this.phoneNumberLengthValidator()]],
      is_active: [true],
      isEditing:false,
      id:[]
    })
    this.isAdminForm = false
  }

  getAdminFormGroup(index: number): FormGroup {
    return this.adminFormArray.at(index) as FormGroup;
  }
  
  initializeAdminFormArray() {
    this.adminFormArray = this._fb.array(
      this.adminList.map(admin => this.createAdminFormGroup(admin,this.adminFormArray))
    );
  }
  
  // isSaveButtonDisabled(): boolean {
  //   // Check if the organization form is invalid
  //   if (this.organizationForm.invalid) {
  //     return true;
  //   }
  
  //   // Check if the admin form is invalid
  //   if (this.adminForm.invalid || this.adminForm.valid) {
  //     return true;
  //   }
  
  //   // Check if any admin form group in the admin list is invalid
  //   for (let i = 0; i < this.adminList.length; i++) {
  //     const adminFormGroup = this.getAdminFormGroup(i);
  //     if (adminFormGroup && adminFormGroup.invalid) {
  //       return true;
  //     }
  //   }
  
  //   // If all validations pass, return false (button is enabled)
  //   return false;
  // }
  
  
  saveAdmin(index: number) {
    const adminForm = this.getAdminFormGroup(index);
    
    if (this.adminFormArray.invalid) {
        // Mark all controls as touched to trigger validation messages
        this.adminFormArray.markAllAsTouched()
        adminForm.markAllAsTouched();
        // this.api.showError('Invalid admin form')
      
        }else{
          // If the form is valid, update the admin details
          const data = {
            admin_details: []  // Initialize adminList as an empty array or assign it directly
          };
          
          this.adminList[index] = {
            ...this.adminList[index],
            admin_name: adminForm.value.admin_name,
            admin_email_id: adminForm.value.admin_email_id,
            admin_phone_number: adminForm.value.admin_phone_number,
            is_active: adminForm.value.is_active,
            isEditing: adminForm.value.isEditing,
            id: adminForm.value.id
          };
          
          // Add the updated adminList to the data object
          data.admin_details = [...this.adminList]; 
        
          
          this.adminList[index].isEditing = false;
      this.api.updateData(`${environment.live_url}/${environment.organization}/${this.id}/`,data).subscribe(
        res => {
          if (res) {
            this.api.showSuccess("Admin details updated successfully!");
            // this.organizationForm.reset();
            this.adminForm.reset();
            this.isAdminForm=false;
            this.fileDataUrl = null;
            this.adminList = []; // Clear the admin list after submission
            let query = `?page=${this.page}&page_size=${this.tableSize}`
            this.getOrgDetails(query); // Refresh the organization details
          }
        },
        error => {
          this.api.showError(error?.error?.message);
        }
      );
        
    }
}

  
   addAdmin() {
   if (this.adminForm.valid) {
    const  data = {
      admin_name:this.adminForm?.value['admin_name'],
      admin_email_id:this.adminForm?.value['admin_email_id'],
      admin_phone_number:this.adminForm?.value['admin_phone_number'],
      is_active:this.adminForm?.value['is_active'],
      id:this.adminForm?.value['id']
    }
    
    this.adminList.forEach((admin:string)=>admin['isEditing'] = false)
    //this.adminList.push(data);
  
    //this.adminFormArray.push(this.createAdminFormGroup(data,this.adminFormArray));

   
    let newadmin = []
    newadmin.push(data)
    const addAdmin = {
      admin_details: newadmin
    };
    this.api.updateData(`${environment.live_url}/${environment.organization}/${this.organization_id}/`,addAdmin).subscribe(
      res => {
        if (res) {
          this.api.showSuccess("Admin details updated successfully!");
          // this.organizationForm.reset();
          this.adminForm.reset();
          this.isAdminForm=false;
          this.fileDataUrl = null;
          this.adminList = []; // Clear the admin list after submission
          let query = `?page=${this.page}&page_size=${this.tableSize}`
          this.getOrgDetails(query); // Refresh the organization details
        }
      },
      error => {
        this.api.showError(error?.error?.message);
      }
    );
    
    this.a['admin_name'].reset();
    this.a['admin_email_id'].reset();
    this.a['admin_phone_number'].reset();
    this.adminForm.patchValue({
      is_active: true
    })
    this.isAdminForm = !this.isAdminForm;


  }else{
    this.adminForm.markAllAsTouched()
  }
  }
  emailMatchValidator(): ValidatorFn {
    return (adminEmailControl: AbstractControl): { [key: string]: any } | null => {
      if (!adminEmailControl.value || !this.organizationForm.get('email').value) {
        return null;
      }
      return adminEmailControl.value === this.organizationForm.get('email').value
        ? { 'emailMatch': true }
        : null;
    };
  }
  phoneNumberLengthValidator() {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const phoneNumber: string = control.value;

      // Check if the input is a valid number and has a length of 10
      if (phoneNumber && !/^\d{10}$/.test(phoneNumber)) {
        return { 'phoneNumberLength': true };
      }

      return null;
    };
  }

  
  getOrgDetails(params) {
    this.api
      .getData(`${environment.live_url}/${environment.user}/${params}&role_id=2&organization_id=${this.organization_id}`)
      .subscribe(
        (res:any) => {
          if (res) {
            // Verify the structure of the response
            const admins = res['results']; // Ensure 'results' contains an array
            this.count = res?.['total_no_of_record'] 
            if (Array.isArray(admins)) {
              // Clear existing FormArray
              this.adminFormArray.clear();
  
              // Iterate and patch all data
              admins?.forEach((admin: any) => {
                const adminGroup = this._fb.group({
                  id: [admin.id],
                  admin_name: [admin.first_name, [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
                  admin_email_id: [admin.email, [Validators.required, Validators.email]],
                  admin_phone_number: [
                    admin.phone_number,
                    [Validators.required, Validators.minLength(10), Validators.maxLength(10)],
                  ],
                  is_active: [admin.is_active],
                  isEditing:false
                });
                this.adminList.push(adminGroup?.value)
                // Push each admin's data into the FormArray
                this.adminFormArray.push(adminGroup);
              });
            } 
          }
        },
        (error) => {
          this.api.showError(error?.error?.message);
        }
      );
  }
 
  originalAdminData: any[] = [];

  toggleFormControlState(index: number, isEditing: boolean): void {
    const adminFormGroup = this.getAdminFormGroup(index);
    if (isEditing) {
      // Store the initial values before editing
      this.originalAdminData[index] = adminFormGroup.value;
      this.adminList[index].isEditing = true;
    } else {
      // Revert to the original values when cancelling
      adminFormGroup.setValue(this.originalAdminData[index]);
      this.adminList[index].isEditing = false;
    }
  }
  createAdminFormGroup(admin,formArray?:FormArray): FormGroup {
    return this._fb.group({
      admin_name: [admin.admin_name, [Validators.required, Validators.pattern(/^[A-Za-z][A-Za-z\s]*$/)]],
      admin_email_id: [admin.admin_email_id, [Validators.required, Validators.email,this.emailMatchValidator(),this.duplicateEmailArrayValidator(formArray)]],
      admin_phone_number: [admin.admin_phone_number, [Validators.required,this.phoneNumberLengthValidator]],
      is_active: [admin.is_active],
      id:[admin.id]
    });
  }
  

 
  duplicateEmailArrayValidator(formArray: FormArray): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const currentEmail = control.value;
      // this.adminFormArray?.push(this.adminList)
     
      // Get all email values from the formArray, excluding the current control
      const emailExists = this.adminFormArray?.controls?.some(
        (group: AbstractControl) =>
          group !== control?.parent && // Exclude the current control being validated
          group.get('admin_email_id')?.value === currentEmail
      );
      
      // Return the validation error only if the email is a duplicate
      return emailExists ? { duplicateArrEmail: true } : null;
    };
  }
  

  
  // Custom validator to check for duplicate admin emails
duplicateEmailValidator(adminList: any[]): ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    const emailExists = adminList.some(admin => admin.admin_email_id === control.value);
    return emailExists ? { duplicateEmail: true } : null;
  };
}

filterSearch(event){
  const input = event?.target?.value?.trim() || ''; // Fallback to empty string if undefined
  if (input && input.length >= 3) {
    this.term = input;
    const query = `?page=1&page_size=${this.tableSize}&search=${this.term}`;
    this.getOrgDetails(query);
  } if(!input) {
    const query = `?page=${this.page}&page_size=${this.tableSize}`;
    
    this.getOrgDetails(query);
  }
}
onTableDataChange(event:any){
  if(event){
    this.adminList = []
    this.adminFormArray.clear()
  }
  this.page = event;
  let query = `?page=${this.page}&page_size=${this.tableSize}`
  if(this.term){
    query +=`&search=${this.term}`
  }
  this.getOrgDetails(query)
}  
onTableSizeChange(event:any): void {
  if(event){
  this.adminList = []
  this.adminFormArray.clear()
  this.tableSize = Number(event.value);
  let query = `?page=${1}&page_size=${this.tableSize}`
  if(this.term){
    query +=`&search=${this.term}`
  }
  
  this.getOrgDetails(query)
  }
} 
    
  
  get f() {
    return this.organizationForm.controls;
  }
  get a(){
    return this.adminForm.controls;
  }
 
 async open(adminId,index) {
  
  try {
    const modalRef = await this.modalService.open(GenericDeleteComponent, {
      size: 'sm',
      backdrop: 'static',
      centered: true
    });
    
    modalRef.componentInstance.status.subscribe(resp => {
      if (resp === 'ok') {
        this.deleteAdmin(adminId,index);
        modalRef.dismiss();
      } else {
        modalRef.dismiss();
      }
    });
  } catch (error) {
    console.error('Error opening modal:', error);
  }
  
  }
  openSubscription() {
   
    const modelRef =   this.modalService.open(SubscriptionAlertComponent, {
      size: <any>'sm',
      backdrop: true,
      centered:true
    });
   
    modelRef.componentInstance.status.subscribe(resp => {
      if(resp == "ok"){
      //  this.delete(content);
       modelRef.close();
      }
      else{
        modelRef.close();
      }
  })
}
}
