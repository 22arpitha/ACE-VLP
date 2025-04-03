import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, map } from 'rxjs';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { FormErrorScrollUtilityService } from '../../../service/form-error-scroll-utility-service.service';
import { environment } from '../../../../environments/environment';
import {urlToFile,fileToBase64} from '../../../shared/fileUtils.utils';

@Component({
  selector: 'app-job-kpi',
  templateUrl: './job-kpi.component.html',
  styleUrls: ['./job-kpi.component.scss']
})
export class JobKpiComponent implements OnInit {
    @ViewChildren('fileInput') fileInputs: QueryList<ElementRef>;
      @ViewChildren('crpfileInput') crpfileInputs: QueryList<ElementRef>;;
        @ViewChildren('mrpfileInput') mrpfileInputs: QueryList<ElementRef>;;
  BreadCrumbsTitle: any = 'KPI';
  job_id:any;
  isEditItem:boolean=false;
  allEmployeeList:any=[];
  accessPermissions:any=[];
@ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
jobKPIFormGroup:FormGroup;
pageSize = 10;
currentPage = 1;
user_role_name:any;
budgetFile: any=[];
mrpFile:  any=[];
crpFile:  any=[];
selectedBudgetFile:(File | null)[] = [];
selectedMrpFile:(File | null)[] = [];
selectedCrpFile:(File | null)[] = [];
defaultReviewingTime:any='000:00:00';
formData:any;
  constructor(private fb:FormBuilder,private activeRoute:ActivatedRoute,
          private common_service: CommonServiceService,
          private apiService: ApiserviceService,private router:Router,
          private formErrorScrollService:FormErrorScrollUtilityService) {
            this.user_role_name = sessionStorage.getItem('user_role_name');
            if(this.activeRoute.snapshot.paramMap.get('id')){
              this.common_service.setTitle('Update ' + this.BreadCrumbsTitle)
              this.job_id= this.activeRoute.snapshot.paramMap.get('id')
              this.getAllEmployeeList();
              this.getModuleAccess();
              this.getJobAndKPIDetails();
            }
           }

  ngOnInit(): void {
  this.intialForm();
  }
  public intialForm(){
    this.jobKPIFormGroup = this.fb.group({
      job: Number(this.job_id),
      data:this.fb.array([this.createEmployeeControl()]),
    })
  }
  public createEmployeeControl(): FormGroup {
    return this.fb.group({
      employee: ['', Validators.required],
      processing_time:['', Validators.required],
      review_time:['', Validators.required],
      budget_file:[null],
      mrp:['', [Validators.required,Validators.pattern(/^[0-9]{1,3}$/), Validators.maxLength(3), Validators.min(0), Validators.minLength(1)]],
      mrpFile:[null],
      crp:['', [Validators.required,Validators.pattern(/^[0-9]{1,3}$/), Validators.maxLength(3), Validators.min(0), Validators.minLength(1)]],
      crpFile:[null],
    });
  }

  public get f() {
    return this.jobKPIFormGroup.controls;
  }

 get employeeFormArray() {
  return this.jobKPIFormGroup.get('data') as FormArray;
}
  public getModuleAccess(){
    this.apiService.getData(`${environment.live_url}/${environment.user_access}/${sessionStorage.getItem('user_id')}/`).subscribe(
      (res:any)=>{
        console.log(res)
       res.access_list.forEach((access:any)=>{
          access.access.forEach((access_name:any)=>{
              if(access_name.name===sessionStorage.getItem('access-name')){
                console.log(access_name)
                this.accessPermissions = access_name.operations;
                // console.log('this.accessPermissions', this.accessPermissions);
              }
            })
       })
      }
    )
  }

  public getAllEmployeeList(){
    let queryparams:any = `?is_active=True&employee=True`;
    this.allEmployeeList =[];
    this.apiService.getData(`${environment.live_url}/${environment.employee}/${queryparams}`).subscribe((respData: any) => {
      this.allEmployeeList = respData;
      },(error => {
        this.apiService.showError(error?.error?.detail)
      }));
  }

  public getJobAndKPIDetails(){
    forkJoin([
      this.apiService.getData(`${environment.live_url}/${environment.jobs}/${this.job_id}/`),  // First API call for employee list
      this.apiService.getData(`${environment.live_url}/${environment.jobs_kpi}/?job-id=${this.job_id}`)  // Second API call for employee details
    ]).pipe(
  map(([jobDetailsResponse, kpiJobDetailsResponse]) => {
     jobDetailsResponse['employees'].forEach((emp:any) => {
      if(kpiJobDetailsResponse['data'] && kpiJobDetailsResponse['data'].length>=1){
        kpiJobDetailsResponse['data']?.forEach((kpiEmp:any) => {
          console.log('kpiEmp',kpiEmp);
          if(emp?.employee == kpiEmp.employee_id){
            emp['kpi']=kpiEmp;
          }
        });
      }
    });
    return jobDetailsResponse;
  })
).subscribe(combinedResult => {
  console.log('combinedResult',combinedResult);
  const [hours, minutes] = combinedResult['budget_time']?.split(":");
  const formattedbudget_time = `${hours}:${minutes}`;
  if (combinedResult['employees'] && Array.isArray(combinedResult['employees']) && combinedResult['employees']?.length >= 1) {
    const employeesDetailsArray = this.jobKPIFormGroup.get('data') as FormArray;
    employeesDetailsArray?.clear();
    combinedResult['employees']?.forEach((emp,index) => {
    const employeeForm = this.fb.group({
      employee: [{ value: emp?.employee, disabled: true}],
      processing_time: [{ value: emp?.kpi ? emp?.kpi?.processing_time:formattedbudget_time?.toString(), disabled: true}],
      review_time: [{ value: emp?.kpi ? emp?.kpi?.processing_time:this.defaultReviewingTime, disabled: true}],
      budget_file: [{ value: null, disabled: true}],
      mrp: [{ value: emp?.kpi ? emp?.kpi?.mrp:0, disabled: true}],
      mrpFile: [{ value: null, disabled: true}],
      crp: [{ value: emp?.kpi ? emp?.kpi?.crp:0, disabled: true}],
      crpFile: [{ value: null, disabled: true}],
    });
if(emp?.kpi){
  employeesDetailsArray?.at(index)?.get('budget_file')?.setErrors(null);
  // Budget File
  if(emp?.kpi?.budget_file){
    urlToFile(emp?.kpi?.budget_file, this.getFileName(emp?.kpi?.budget_file))
    .then(file => {
      console.log('1 File',file,this.budgetFile);
      this.budgetFile[index] = file;
      this.selectedBudgetFile[index] = this.budgetFile[index];
    }
    )
    .catch(error => console.error('Error:', error));
    }else{
      employeesDetailsArray?.at(index)?.patchValue({'budget_file':null});
    }
    // MRP File
    if(emp?.kpi?.mrpFile){
      employeesDetailsArray?.at(index)?.get('mrpFile')?.setErrors(null);
      urlToFile(emp?.kpi?.mrpFile, this.getFileName(emp?.kpi?.mrpFile))
      .then(file => {
        console.log('2 File',file,this.mrpFile);
        this.mrpFile[index] = file;
        this.selectedMrpFile[index] = this.mrpFile[index];
      }
      )
      .catch(error => console.error('Error:', error));
      }else{
        employeesDetailsArray?.at(index)?.patchValue({'mrpFile':null});
      }
      // CRP File
      if(emp?.kpi?.crpFile){
        employeesDetailsArray?.at(index)?.get('crpFile')?.setErrors(null);
        urlToFile(emp?.kpi?.crpFile, this.getFileName(emp?.kpi?.crpFile))
        .then(file => {
          console.log('3 File',file,this.crpFile);
          this.crpFile[index] = file;
          this.selectedCrpFile[index] = this.crpFile[index];
        }
        )
        .catch(error => console.error('Error:', error));
        }else{
          employeesDetailsArray?.at(index)?.patchValue({'crpFile':null});
        }
  }
    employeesDetailsArray.push(employeeForm);
  });
  }
});
  }

      public editJobKPIDetails(){
      this.isEditItem = !this.isEditItem;
      const employeesDetailsArray = this.jobKPIFormGroup.get('data') as FormArray;
      employeesDetailsArray.controls.forEach((controls)=>{
        controls.get('processing_time')?.enable();
        controls.get('review_time')?.enable();
        controls.get('budget_file')?.enable();
        controls.get('mrp')?.enable();
        controls.get('mrpFile')?.enable();
        controls.get('crp')?.enable();
        controls.get('crpFile')?.enable();
      })
        }

        public backBtnFunc(){
          this.router.navigate(['/jobs/update-job/',this.job_id]);
        }
     // Save JOB KPI
public saveJobKPIDetails(){
  if (this.jobKPIFormGroup.invalid) {
    this.jobKPIFormGroup.markAllAsTouched();
    this.formErrorScrollService.scrollToFirstError(this.jobKPIFormGroup);
  }else{
    let reqPayload:any={};
    reqPayload['job']=this.jobKPIFormGroup?.get('job')?.value;
    let empData:any = this.jobKPIFormGroup?.get('data')?.value;
    let updateEmpData = this.UpdateFileFieldData(empData).then((updatedData) => {
    reqPayload['data']=updatedData;
  }).catch((error) => {
    reqPayload['data']=[];
  });
    console.log('reqPayload',reqPayload,typeof reqPayload);
              this.apiService.postData(`${environment.live_url}/${environment.jobs_kpi}/`, reqPayload).subscribe((respData: any) => {
              if (respData) {
                this.apiService.showSuccess(respData['message']);
                // this.resetFormState();
                this.router.navigate(['/jobs/all-jobs']);
              }
            }, (error: any) => {
              this.apiService.showError(error?.error?.detail);
            });
  }
} 


public async UpdateFileFieldData(empData: any) {
  if (empData && empData.length >= 1) {
    // Use for...of to ensure we await properly inside the loop
    for (let index = 0; index < empData.length; index++) {
      // Handle each file type asynchronously
      if (this.budgetFile[index]) {
        empData[index].budget_file = await this.convertFileToBase64(this.budgetFile[index]);
      }
      if (this.mrpFile[index]) {
        empData[index].mrpFile = await this.convertFileToBase64(this.mrpFile[index]);
      }
      if (this.crpFile[index]) {
        empData[index].crpFile = await this.convertFileToBase64(this.crpFile[index]);
      }
    }
  }
  return empData;
}

private async convertFileToBase64(file: File): Promise<string | null> {
  try {
    const base64 = await fileToBase64(file);
    return base64;
  } catch (error) {
    console.error('Error converting file to base64', error);
    return null;
  }
}


   get currentPageRows() {
                    const startIndex = (this.currentPage - 1) * this.pageSize;
                    const endIndex = startIndex + this.pageSize;
                    return this.employeeFormArray.controls.slice(startIndex, endIndex);
}
   public getFileName(url:any){
      return url?.split('/')?.pop(); 
   }

public onPageChanged(event: any) {
                    this.currentPage = event.pageIndex + 1;  
                    this.pageSize = event.pageSize;
}
                
  public getContinuousIndex(index: number): number {
                    return (this.currentPage - 1) * this.pageSize + index + 1;
  }
  public onBudgetFileSelected(event: Event,index:any): void {
                  const input = event.target as HTMLInputElement;
                
                  if (input.files && input.files.length > 0) {
                    const selectedFile = input.files[0];
                
                    // Validate file type
                    if (
                      selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                      selectedFile.type === "application/vnd.ms-excel" ||
                      selectedFile.type === "application/msword" ||
                      selectedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                      selectedFile.type === "application/pdf"
                    ) {
                      this.budgetFile[index] = selectedFile;
                      this.selectedBudgetFile[index] = this.budgetFile[index];
                
                      // Reset input value after a slight delay to allow re-selection
                      setTimeout(() => {
                        input.value = "";
                      }, 100); // Small delay to ensure the selection is registered
                    } else {
                      this.apiService.showError("Invalid file type. Only xlsx, xls, doc, docx, pdf files are allowed.");
                      this.selectedBudgetFile[index] = null;
                    }
                  }
  }
 public onMrpFileSelected(event: Event,index:any): void {
                  const input = event.target as HTMLInputElement;
                
                  if (input.files && input.files.length > 0) {
                    const selectedFile = input.files[0];
                
                    // Validate file type
                    if (
                      selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                      selectedFile.type === "application/vnd.ms-excel" ||
                      selectedFile.type === "application/msword" ||
                      selectedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                      selectedFile.type === "application/pdf"
                    ) {
                      this.mrpFile[index] = selectedFile;
                      this.selectedMrpFile[index] = this.mrpFile[index];
                
                      // Reset input value after a slight delay to allow re-selection
                      setTimeout(() => {
                        input.value = "";
                      }, 100); // Small delay to ensure the selection is registered
                    } else {
                      this.apiService.showError("Invalid file type. Only xlsx, xls, doc, docx, pdf files are allowed.");
                      this.selectedMrpFile[index] = null;
                    }
                  }
 }
  public onCrpFileSelected(event: Event,index:any): void {
                  const input = event.target as HTMLInputElement;
                
                  if (input.files && input.files.length > 0) {
                    const selectedFile = input.files[0];
                
                    // Validate file type
                    if (
                      selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                      selectedFile.type === "application/vnd.ms-excel" ||
                      selectedFile.type === "application/msword" ||
                      selectedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                      selectedFile.type === "application/pdf"
                    ) {
                      this.crpFile[index] = selectedFile;
                      this.selectedCrpFile[index] = this.crpFile[index];
                
                      // Reset input value after a slight delay to allow re-selection
                      setTimeout(() => {
                        input.value = "";
                      }, 100); // Small delay to ensure the selection is registered
                    } else {
                      this.apiService.showError("Invalid file type. Only xlsx, xls, doc, docx, pdf files are allowed.");
                      this.selectedCrpFile[index] = null;
                    }
                  }
}
public triggerFileInput(index:any) {
  console.log('fileInputs',this.fileInputs);
  const fileInput = this.fileInputs?.toArray()[index];
  console.log('fileInput',fileInput);

  if (fileInput) {
    fileInput?.nativeElement?.click();
  }
 }
  public triggerMrpFileInput(index:any) {
   const fileInput = this.mrpfileInputs?.toArray()[index];
   console.log('fileInput',fileInput);

   if (fileInput) {
   fileInput?.nativeElement?.click();
   }
 }
 public triggerCrpFileInput(index:any) {
  const fileInput = this.crpfileInputs?.toArray()[index];
  console.log('fileInput',fileInput);
  if (fileInput) {
   fileInput?.nativeElement?.click();
  }
  }
 public formatProcessingTime(event: any): void {
let rawValue = event.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
            
 if (rawValue.length > 3) {
  rawValue = rawValue.slice(0, 3) + ':' + rawValue.slice(3); // Insert colon after 3rd digit
 }
}
 public formatReviewTime(event: any): void {
    let rawValue = event.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
   if (rawValue.length > 3) {
  rawValue = rawValue.slice(0, 3) + ':' + rawValue.slice(3); // Insert colon after 3rd digit
  }
 }
                public validateKeyPress(event: KeyboardEvent) {
                  // Get the key code of the pressed key
                  const keyCode = event.which || event.keyCode;
              
                  // Allow only digits (0-9), backspace, and arrow keys
                  if ((keyCode < 48 || keyCode > 57) && keyCode !== 8 && keyCode !== 37 && keyCode !== 39 && keyCode !== 46) {
                    event.preventDefault(); // Prevent the default action (i.e., entering the character)
                  }
                }                
}
