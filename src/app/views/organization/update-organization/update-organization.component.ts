import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { environment } from 'src/environments/environment';
import { Location } from '@angular/common';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { GenericDeleteComponent } from 'src/app/generic-delete/generic-delete.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-update-organization',
  templateUrl: './update-organization.component.html',
  styleUrls: ['./update-organization.component.scss']
})
export class UpdateOrganizationComponent implements OnInit {
  BreadCrumbsTitle: any = 'Update organization';
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
  @ViewChild('fileInput') fileInput: ElementRef;
  adminForm: FormGroup;
  adminFormArray: FormArray;
  isAdminForm = false;
  logoImage: boolean = false;
  submitted:boolean = false;
  constructor(private _fb: FormBuilder,
    private api: ApiserviceService, private route: ActivatedRoute,
    private router: Router, private location: Location, private common_service: CommonServiceService,
    private cdr: ChangeDetectorRef,
    private modalService:NgbModal) {
    this.id = this.route.snapshot.paramMap.get('id')
    this.initializeAdminFormArray()
  }

  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    // this.id = sessionStorage.getItem('user_id')
    this.initform();
    this.getCountry()
    this.getOrgDetails();
   
  }

 
  openAdminForm(){
    this.adminintForm();
    this.adminList.forEach((admin:string)=>admin['isEditing'] = false)
    this.isAdminForm=!this.isAdminForm 
  }
  
  goBack(event) {
    event.preventDefault(); // Prevent default back button behavior
    this.location.back();

  }
  
   deleteAdmin(adminId,index: number) {
    
    this.adminFormArray.removeAt(index);
    this.adminList.splice(index, 1);
    const data = {
      admin_details: this.adminList // Use the admin list to submit the data
    };
    if(adminId){
      this.api.delete(`${environment.live_url}/${environment.organization}/${this.id}/?admin_id=${adminId}`, ).subscribe(
        res => {
          if (res) {
            this.api.showSuccess("Admin deleted successfully!");
            // this.organizationForm.reset();
            this.adminForm.reset();
            this.isAdminForm = true;
            this.fileDataUrl = null;
            this.adminList = []; // Clear the admin list after submission
            this.getOrgDetails(); // Refresh the organization details
          }
        },
        error => {
          this.api.showError(error.error.error.message);
        }
      );
    }
   
  
  }
  initform() {
    this.organizationForm = this._fb.group({
      organization_name: ['', [ Validators.required,Validators.pattern(/^[a-zA-Z0-9]+( [a-zA-Z0-9]+)*$/),Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', [Validators.pattern(/^\S.*$/),Validators.maxLength(300)]],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      postal_code: [null,Validators.pattern('^\\d{6}$')],
      organization_image: [],
      logo:['']
    })

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
            this.getOrgDetails(); // Refresh the organization details
          }
        },
        error => {
          this.api.showError(error.error.error.message);
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
    this.adminList.push(data);
  
    this.adminFormArray.push(this.createAdminFormGroup(data,this.adminFormArray));

   
    let newadmin = []
    newadmin.push(data)
    const addAdmin = {
      admin_details: newadmin
    };
    this.api.updateData(`${environment.live_url}/${environment.organization}/${this.id}/`,addAdmin).subscribe(
      res => {
        if (res) {
          this.api.showSuccess("Admin details updated successfully!");
          // this.organizationForm.reset();
          this.adminForm.reset();
          this.isAdminForm=false;
          this.fileDataUrl = null;
          this.adminList = []; // Clear the admin list after submission
          this.getOrgDetails(); // Refresh the organization details
        }
      },
      error => {
        this.api.showError(error.error.message);
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
   getOrgDetails() {
    //this.api.getData(`${environment.live_url}/${environment.organization}?id=${this.id}&page_number=1&data_per_page=10`).subscribe(async res => {
      this.api.getData(`${environment.live_url}/${environment.organization}/${this.id}/`).subscribe(async res => {
      if (res) {
       
        let currentOrg:any = {}
       
        currentOrg = res
       
     if(currentOrg['organization_image']){
      this.logoImage = true
     }
      if(currentOrg['country_id']){
         
        await this.getState(currentOrg['country_id'])
        await this.getCity(currentOrg['state_id'])
        
      }
        const adminData = res['admin_details']
        // this.adminList = res['result']['data'][0].admin_details
        console.log(adminData)
      
        const transformedAdminDetails = adminData?.map(admin => ({
          id:admin.id,
          admin_name: admin.admin_name,
          admin_email_id: admin.admin_email_id,
          admin_phone_number: admin.admin_phone_number,
          is_active: admin.is_active ,
          isEditing:false
        }));
        this.adminList = transformedAdminDetails 
        console.log(currentOrg['organization_image'],"organization_image")
        this.initializeAdminFormArray();
        this.organizationForm.patchValue({
          
          organization_name: currentOrg['organization_name'],
          email: currentOrg['email'],
          address: currentOrg['address'],
          city: currentOrg['city_id'],
          state: currentOrg['state_id'],
          country: currentOrg['country_id'],
          postal_code: currentOrg['postal_code'],
          is_active: currentOrg['org_status'],
          organization_image_base_url: currentOrg['organization_image_base_url'],
          logo:currentOrg['organization_image']
          
        })
       
      
      }
    }, (error => {
      this.api.showError(error.error.error.message)
    }))
   
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

  onFocus() {
    this.type = 'file';
    this.organizationForm.get('organization_image')?.reset();
  }
  onFocusCountry() {
    this.organizationForm.patchValue({
      state: '',
      city: ''
    })
  }
  getCountry() {
    this.api.getData(`${environment.live_url}/${environment.country}/`).subscribe((res: any) => {
      this.country = res
    }, ((error) => {
      this.api.showError(error.error.error.message)
    }))
  }
  
  getState(event) {
    let country = event
    this.api.getData(`${environment.live_url}/${environment.state}/?country_id=${event}`).subscribe((res: any) => {
      if(res){
      this.state = res
      this.fileDataUrl = null;
      // this.getCity(event);
      }
    }, ((error) => {
      this.api.showError(error.error.error.message)
    }))
  
  }
  getCity(event) {
    let state =  event
    this.api.getData(`${environment.live_url}/${environment.city}/?state_id=${state}`).subscribe((res: any) => {
      this.city = res
    }, ((error) => {
      this.api.showError(error.error.error.message)
    }))

  }
  
  uploadImageFile(event: any) {
    const selectedFile = event.target.files[0];
  
    if (selectedFile) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(selectedFile.type)) {
        // Handle invalid file type
        console.error('Invalid file type. Only .jpg, .jpeg, and .png files are allowed.');
        this.fileDataUrl = null; // Clear any previously selected image
        return;
      }
  
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.fileDataUrl = e.target.result;
        if(reader.result){
          this.logoImage = true
          this.organizationForm.patchValue({ logo: this.fileDataUrl })
        }
       
      };
      reader.readAsDataURL(selectedFile);
    }
  }
  triggerFileInput() {
    this.fileInput?.nativeElement?.click();
  }
 
    
    organizationSubmit() {
      // Check if the admin form array is valid and has at least one admin
      //const isAdminFormValid = this.adminList.length > 0 && this.adminFormArray.valid;
    // Check if the organization form is valid
    this.getOrgDetails();
    if (this.organizationForm.invalid || this.f['logo'].value === '') {
      console.log(this.organizationForm.value)
      this.organizationForm.markAllAsTouched();
      this.submitted = true;
     // this.api.showError("Please enter the mandatory fields!");
    }else{
      const data = {
        organization_name: this.f['organization_name'].value,
        address: this.f['address'].value,
        email: this.f['email'].value,
        city: this.f['city'].value,
        state: this.f['state'].value,
        country: this.f['country'].value,
        postal_code: this.f['postal_code'].value,
        organization_image: this.fileDataUrl || this.f['logo'].value,
      };
      this.submitted = true;
      this.api.updateData(`${environment.live_url}/${environment.organization}/${this.id}/`, data).subscribe(
        res => {
          if (res) {
            this.api.showSuccess("Organization updated successfully!");
            // this.organizationForm.reset();
            // this.adminForm.reset();
            // this.isAdminForm=false;
           // this.fileDataUrl = null;
           // this.adminList = []; // Clear the admin list after submission
            this.getOrgDetails(); // Refresh the organization details
          }
        },
        error => {
          this.api.showError(error?.error?.message);
        }
      );
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

}
