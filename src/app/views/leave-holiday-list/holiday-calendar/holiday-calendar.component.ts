import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ApiserviceService } from 'src/app/service/apiservice.service';
import { environment } from 'src/environments/environment';
import { CommonServiceService } from 'src/app/service/common-service.service';
import { SubModuleService } from 'src/app/service/sub-module.service';
@Component({
  selector: 'app-holiday-calendar',
  templateUrl: './holiday-calendar.component.html',
  styleUrls: ['./holiday-calendar.component.scss']
})
export class HolidayCalendarComponent implements OnInit {
  BreadCrumbsTitle: any = 'Holiday Calendar';
  file: any;
  fileUpload;
  formData:any;
  organization_id: string;
  holidays: any = [];
  holidayListForm:FormGroup
  accessPermissions = [];
  userRole:string;
  user_id: any;
  reference = `${environment.live_url}/${environment.holiday_calender}/?export_sample_file=true`
  @ViewChild('fileInput') fileInput: ElementRef;
  fileDataUrl: any;
  
  constructor(
    private api:ApiserviceService,
    private fb:FormBuilder,
    private common_service:CommonServiceService,
    private accessControlService:SubModuleService
  ) { }

  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.organization_id = sessionStorage.getItem('organization_id') || '0';
    this.user_id = sessionStorage.getItem('user_id');
    this.userRole = sessionStorage.getItem('user_role_name') || '';
    this.getHolidayList()
    this.initForm();
    this.getModuleAccess();
  }

  getModuleAccess(){
    this.accessControlService.getAccessForActiveUrl(this.user_id).subscribe((access) => {
      if (access) {
        this.accessPermissions = access[0].operations;
        // console.log('Access Permissions:', access);
      } else {
        console.log('No matching access found.');
      }
    });
  }
 
  initForm(){
    this.holidayListForm = this.fb.group({
      file_attachment:['',[Validators.required,this.fileFormatValidator]]
    })
  }
  triggerFileInput() {
    this.fileInput?.nativeElement?.click();
  }
  selectedFile: File | null = null;

  // onFileSelected(event: Event): void {
  //   if(event){
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && input.files[0]) {
  //     this.file = input.files[0];
  //     this.fileDataUrl = input.files[0]
  //     // Validate file type (optional)
  //     if (this.file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || 
  //         this.file.type === "application/vnd.ms-excel") {
  //       this.selectedFile = this.file;
  //      // console.log('Selected file:', this.file);
  //     }
  //     //  else {
  //     //   this.api.showError('Invalid file type. Only Excel files are allowed.');
  //     //   this.selectedFile = null; // Reset if file type is invalid
  //     // }
  //   }
  // }
  // }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
  
    if (input.files && input.files.length > 0) {
      const selectedFile = input.files[0];
  
      // Validate file type
      if (
        selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        selectedFile.type === "application/vnd.ms-excel"
      ) {
        this.file = selectedFile;
        this.selectedFile = this.file;
  
        // Reset input value after a slight delay to allow re-selection
        setTimeout(() => {
          input.value = "";
        }, 100); // Small delay to ensure the selection is registered
      } else {
        this.api.showError("Invalid file type. Only Excel files are allowed.");
        this.selectedFile = null;
      }
    }
  }
  
  
  get f(){
    return this.holidayListForm.controls
  }
  // submit(){
  //   if(this.holidayListForm.invalid){
  //     this.holidayListForm.markAllAsTouched()
  //   }else{
  //     this.formData = new FormData();

  //     if (this.file) {
  //        this.formData.set('file',this.file);
  //        this.formData.set('organization_id',this.organization_id)
  //     }
  //     this.api.postData(`${environment.live_url}/${environment.holiday_calender}/`,this.formData).subscribe((res:any)=>{
  //      if(res){
  //        this.api.showSuccess(`Holiday list uploaded successfully!`)
  //        this.getHolidayList()
  //        this.holidayListForm.reset()
  //        this.fileDataUrl = ""
  //        this.selectedFile = null;
  //        this.file = ""
  //      }
  //     },(error:any)=>{
  //      this.api.showError(error?.error.message)
       
  //     })
  //   }
    
  // }
  submit() {
    if (this.holidayListForm.invalid) {
      this.holidayListForm.markAllAsTouched();
    } else {
      this.formData = new FormData();
  
      if (this.file) {
        this.formData.set("file", this.file);
        this.formData.set("organization_id", this.organization_id);
      }
  
      this.api.postData(`${environment.live_url}/${environment.holiday_calender}/`, this.formData).subscribe(
        (res: any) => {
          if (res) {
            this.api.showSuccess(`Holiday list uploaded successfully!`);
            this.getHolidayList();
            this.holidayListForm.reset();
  
            // Reset file references properly
            this.file = null;
            this.selectedFile = null;
  
            // Reset the file input field
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput) {
              fileInput.value = "";
            }
          }
        },
        (error: any) => {
          this.api.showError(error?.error.message);
        }
      );
    }
  }
  
  fileFormatValidator(control: AbstractControl): ValidationErrors | null {
    const allowedFormats = ['.xlsx','.xls'];
    const file = control.value;
    if (file) {
      const fileExtension = file.substr(file.lastIndexOf('.')).toLowerCase();
      if (!allowedFormats.includes(fileExtension)) {
        return { accept: true };
      }
    }
    return null;
  }
  getHolidayList(){
    this.api.getData(`${environment.live_url}/${environment.holiday_calender}/?organization_id=${this.organization_id}`).subscribe((res:any)=>{
      if(res){
       this.holidays = res
      }
     },(error:any)=>{
      this.api.showError(error?.error.message)
     })
  }
  downloadExcelSample() {
    setTimeout(() => {
      this.api.showSuccess(`Sample file downloaded successfully!`)  
    }, 5000);
    
  }
}
