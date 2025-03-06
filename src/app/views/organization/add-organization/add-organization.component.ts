import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors, FormArray, ValidatorFn } from '@angular/forms';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { environment } from 'src/environments/environment';
import { Location } from '@angular/common';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { MatTableDataSource } from '@angular/material/table';
import { GenericDeleteComponent } from 'src/app/generic-delete/generic-delete.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-add-organization',
  templateUrl: './add-organization.component.html',
  styleUrls: ['./add-organization.component.scss']
})
export class AddOrganizationComponent implements OnInit {
  BreadCrumbsTitle: any = 'Create';
  BreadCrumbsSubTitle:any = 'Organization'
  photoUrl: string | null = null;
  @ViewChild('fileInput') fileInput: ElementRef;
  organizationForm: FormGroup;
  uploadFile: any;
  url: any;
  type = 'url';
  fileUrl: string | ArrayBuffer;
  leaveForm: any;
  id: any;
  base64String: string;
  eyeState: boolean = false;
  eyeIcon = 'bi bi-eye-slash'
  passwordType = "password";
  state: any = [];
  city: any = [];
  country: any = [];
  adminForm: FormGroup;
  dataSource = new MatTableDataSource();
  adminList: any = [];
  isAdminForm = true;
  
  adminFormArray: FormArray;
  constructor(private _fb: FormBuilder, private api: ApiserviceService, 
    private location: Location, 
    private common_service: CommonServiceService,
    private modalService:NgbModal) {
    this.initializeAdminFormArray();
    this.adminintForm();
   }

  fileDataUrl: string | ArrayBuffer | null = null; // Make sure this is declared in your component

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
          this.organizationForm.patchValue({ organization_image: this.fileDataUrl })
        }
       
      };
      reader.readAsDataURL(selectedFile);
    }
  }
  
  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.common_service.setSubTitle(this.BreadCrumbsSubTitle)
    this.id = sessionStorage.getItem('user_id')
    this.initform();
    this.getCountry()
   
  }
  createAdminFormGroup(admin,formArray?): FormGroup {
    return this._fb.group({
      admin_name: [admin.admin_name, [Validators.required, Validators.pattern(/^[A-Za-z][A-Za-z\s]*$/)]],
      admin_email_id: [admin.admin_email_id, [Validators.required, Validators.email,this.emailMatchValidator(),this.duplicateEmailArrayValidator(formArray)]],
      admin_phone_number: [admin.admin_phone_number, [Validators.required,this.phoneNumberLengthValidator]],
      is_active: [admin.is_active],
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
  initializeAdminFormArray() {
    this.adminFormArray = this._fb.array(
      this.adminList.map(admin => this.createAdminFormGroup(admin))
    );
  }
  
  getAdminFormGroup(index: number): FormGroup {
    return this.adminFormArray.at(index) as FormGroup;
  }
  adminintForm(){
    this.adminForm = this._fb.group({
      admin_name: ['', [Validators.pattern(/^[A-Za-z][A-Za-z\s]*$/),Validators.required]],
      admin_email_id: ['', [Validators.required, Validators.email, this.emailMatchValidator(),this.duplicateEmailValidator(this.adminList)]],
      admin_phone_number: ['', [Validators.required, this.phoneNumberLengthValidator]],
      is_active: [true],
    })
  }
//   {
//     "admin_name": "sandesh ek",
//     "admin_email_id_id": "sandesh@ekfrazo.in",
//     "admin_phone_number": 9999990188,
//     "is_active": true
// }
  

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
// Custom validator to check for duplicate admin emails
duplicateEmailValidator(adminList: any[]): ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    const emailExists = adminList.some(admin => admin.admin_email_id === control.value);
    return emailExists ? { duplicateEmail: true } : null;
  };
}



  addAdmin() {
   if (this.adminForm.invalid) {
    this.adminForm.markAllAsTouched()
    this.organizationForm.markAllAsTouched()
    this.api.showWarning("Please enter the mandatory fields")
    return;
  }else if((this.f['email']?.valid && this.f['email']?.value === this.adminForm?.value['admin_email_id'])){
    this.adminForm.markAllAsTouched();
    return;
  }else{
    const data = {
      admin_name:this.adminForm?.value['admin_name'],
      admin_email_id:this.adminForm?.value['admin_email_id'],
      admin_phone_number:this.adminForm?.value['admin_phone_number'],
      is_active:this.adminForm?.value['is_active'],
    }
    this.adminList.forEach((admin:string)=>admin['isEditing'] = false)
    this.adminList.push(data);
  
    this.adminFormArray.push(this.createAdminFormGroup(data,this.adminFormArray));

   

    this.a['admin_name'].reset();
    this.a['admin_email_id'].reset();
    this.a['admin_phone_number'].reset();
    this.adminForm.patchValue({
      is_active: true
    })
    this.isAdminForm = !this.isAdminForm;
  }
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
 
  saveAdmin(index: number) {
    const adminForm = this.getAdminFormGroup(index);
        if (this.adminFormArray.invalid || adminForm.invalid) {
          this.adminFormArray.markAllAsTouched()
          adminForm.markAllAsTouched();
        }
        else{
          // If the form is valid, update the admin details
          this.adminList[index] = {
            ...this.adminList[index],
            admin_name: adminForm.value.admin_name,
            admin_email_id: adminForm.value.admin_email_id,
            admin_phone_number: adminForm.value.admin_phone_number,
            is_active: adminForm.value.is_active,
          };
           
          // Show the success message
          // this.api.showSuccess("Admin details updated successfully!");
          this.adminList[index].isEditing = false;
        
    }
}
  openAdminForm(){
    this.adminList.forEach((admin:string)=>admin['isEditing'] = false)
    this.isAdminForm=!this.isAdminForm
  }
  triggerFileInput() {
    this.fileInput?.nativeElement?.click();
  }
  
  async clearImage() {
  await this.triggerFileInput();
    // this.fileDataUrl = null;
    // this.f['organization_image'].reset();
  }
  goBack(event) {
    event.preventDefault(); // Prevent default back button behavior
    this.location.back();

  }
  initform() {
    this.organizationForm = this._fb.group({
      org_qr_uniq_id: ['22121'],
      organization_name: ['', [Validators.pattern(/^[a-zA-Z0-9]+( [a-zA-Z0-9]+)*$/),Validators.required,Validators.maxLength(50)]],
      address: ['', [Validators.pattern(/^\S.*$/),Validators.maxLength(300)]],
      email: ['', [Validators.required, Validators.email]],
      org_phone: [''],
      org_mobile: [''],
      org_fax: [''],
      org_website: [''],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      country: ['', [Validators.required]],
      postal_code: [null,[Validators.pattern('^\\d{6}$')]],
      org_profile_updated_status: [''],
      org_default_currency_type: [''],    
      org_subscription_plan: [''],
      organization_image_path: [''],
      organization_image_base_url: [''],
      page: [''],
      organization_image: ['', [Validators.required, this.fileFormatValidator]],
    })

  }
  deleteAdmin(index: number) {
    this.adminList.splice(index, 1);
    if(!this.adminList.length){
      this.isAdminForm = !this.isAdminForm;
    }
  }
  resetForm(){
    this.isAdminForm=!this.isAdminForm;
   this.adminintForm()
    
  }
  phoneNumberLengthValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const phoneNumber = control.value;
    if (phoneNumber && !/^\d{10}$/.test(phoneNumber)) {
      return { 'phoneNumberLength': true };
    } else {
      return null;
    }
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
  

  onFocus() {
    this.type = 'file'
    this.f['organization_image'].markAsDirty()
    this.f['organization_image'].markAsTouched()
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
    if(event){
  
    this.api.getData(`${environment.live_url}/${environment.state}/?country_id=${this.organizationForm.value.country}`).subscribe((res: any) => {
      if(res){
      this.state = res
      this.fileDataUrl = null;
      // this.getCity(event);
      }
    }, ((error) => {
      this.api.showError(error.error.error.message)
    }))
  }
  }
  getCity(event) {
    this.api.getData(`${environment.live_url}/${environment.city}/?state_id=${this.organizationForm.value.state}`).subscribe((res: any) => {
      this.city = res
    }, ((error) => {
      this.api.showError(error.error.error.message)
    }))

  }
  organizationSubmit() {
    // Check if the organization form is invalid
    if (this.organizationForm.invalid && this.adminForm?.invalid) {
      this.organizationForm.markAllAsTouched();
      this.adminForm.markAllAsTouched();
      this.api.showError("Please enter the mandatory fields!");
      return;
    }
    // If admin form is invalid and no admins are added, show an error
    if (this.isAdminForm && this.adminForm?.invalid) {
      this.adminForm.markAllAsTouched();
      this.api.showError("Please enter the mandatory fields!");
      return;
    }
    // Check if the admin form is valid but no admins are added
    if (this.isAdminForm && this.adminForm?.valid) {
      this.api.showWarning("Please add the admin details before submitting the form");
      return;
    }
     // Check if the admin form is valid but no admins are added
     if (this.adminFormArray?.invalid) {
      this.api.showWarning("Please add the valid admin details.");
      return;
    }
  
    // Prepare data for submission
    const data = {
      organization_name: this.f['organization_name'].value,
      address: this.f['address'].value,
      email: this.f['email'].value,
      city: this.f['city'].value,
      state: this.f['state'].value,
      country: this.f['country'].value,
      postal_code: this.f['postal_code'].value,
      organization_image: this.f['organization_image'].value,
      admin_details: this.adminList
    };
  

    // If everything is valid, submit the form
    this.api.postData(`${environment.live_url}/${environment.organization}/`, data).subscribe(
      res => {
        if (res) {
          this.api.showSuccess("Organization created successfully!");
          this.organizationForm.reset();
          this.isAdminForm = true;
          this.fileDataUrl = null;
          this.adminList = []; // Clear the admin list after submission
        }
      },
      error => {
        this.api.showError(error.error.message);
      }
    );
  
  
  }
  
  
  get f() {
    return this.organizationForm.controls;
  }
  get a(){
    return this.adminForm.controls;
  }
  async open(index) {
  
    try {
      const modalRef = await this.modalService.open(GenericDeleteComponent, {
        size: 'sm',
        backdrop: 'static',
        centered: true
      });
      
      modalRef.componentInstance.status.subscribe(resp => {
        if (resp === 'ok') {
          this.deleteAdmin(index);
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
