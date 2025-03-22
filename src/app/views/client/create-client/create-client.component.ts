import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {  Validators, FormBuilder,FormGroup, FormGroupDirective, AbstractControl, ValidationErrors, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { GenericDeleteComponent } from '../../../generic-delete/generic-delete.component';
import { environment } from '../../../../environments/environment';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-create-client',
  templateUrl: './create-client.component.html',
  styleUrls: ['./create-client.component.scss'],
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class CreateClientComponent implements OnInit {
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
  @ViewChild('fileInput') fileInput: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  file: any;
selectedFile: File | null = null;
  BreadCrumbsTitle: any = 'Client';
  clientFormGroup:FormGroup;
  allCountry:any=[];
  allSource:any=[];
  allUserRoleList:any=[];
  allEmployeeList:any=[];
  selectedEmployeeList:any=[];
  selectedClient:any=[];
  isEditItem:boolean=false;
  client_id:any;
  editorContent:any;
  user_role_name:any;
  isAdmin:boolean=false;
  pageSize = 5;
  currentPage = 1;
  selectedEmployee:any;
  formData:any;
  searchEmployeeText:any;
  searchCountryText:any;
  searchSourceText:any;
  toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],      // Toggle buttons
    ['blockquote', 'code-block'],                   // Block style

    [{ 'header': 1 }, { 'header': 2 }],              // Headers
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],   // Lists
    [{ 'script': 'sub' }, { 'script': 'super' }],    // Subscript/Superscript
    [{ 'indent': '-1' }, { 'indent': '+1' }],        // Indent
    [{ 'direction': 'rtl' }],                        // Text direction

    [{ 'size': ['small', false, 'large', 'huge'] }],  // Text size
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],        // Header levels

    [{ 'color': [] }, { 'background': [] }],          // Text color and background color
    [{ 'font': [] }],                                // Font family
    [{ 'align': [] }],                               // Text alignment

    ['link', 'image', 'video'],                       // Media
    ['clean']                                        // Clear formatting
  ];
    constructor(private fb:FormBuilder,private activeRoute:ActivatedRoute,
      private common_service: CommonServiceService,private router:Router,private datepipe:DatePipe,
      private apiService: ApiserviceService,private modalService: NgbModal) { 
      this.common_service.setTitle(this.BreadCrumbsTitle)
      this.user_role_name = sessionStorage.getItem('user_role_name');
      if(this.activeRoute.snapshot.paramMap.get('id')){
        this.common_service.setTitle('Update ' + this.BreadCrumbsTitle)
        this.client_id= this.activeRoute.snapshot.paramMap.get('id')
        this.isEditItem = true;
        this.getCountryList();
        this.getSourceList();
        this.getAllEmployeeList();
        this.getEmployeeDetails(this.client_id);
      }else{
        this.common_service.setTitle('Create ' + this.BreadCrumbsTitle)
        this.getClientUniqueNumber();
        this.getCountryList();
        this.getSourceList();
        this.getAllEmployeeList();
      }
    }
  
    ngOnInit(): void {
      this.intialForm();
    }
  
    public intialForm(){
  this.clientFormGroup = this.fb.group({
        client_number: ['',Validators.required],
        client_name: ['', [Validators.required, Validators.maxLength(50)]],
        email:['',[Validators.required,Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
        country: ['', Validators.required],
        source: ['', Validators.required],
        address: ['', [Validators.required, Validators.maxLength(50)]],
        service_start_date: ['', Validators.required],
        service_end_date: [null],
        client_file:[null],
        contact_details:this.fb.array([this.createContactGroup()]),
        employee_ids: this.fb.array([]),
        allow_sending_status_report_to_client:[false],
        practice_notes:[''],
      });
      this.addEmployee();
    }
    // To Get Unique Employee Number
    public getClientUniqueNumber(){
      this.apiService.getData(`${environment.live_url}/${environment.clients}/?get-client-number=true`).subscribe((respData: any) => {
        this.clientFormGroup.patchValue({'client_number': respData?.client_unique_number});
            },(error => {
              this.apiService.showError(error?.error?.detail)
            }));
    }
    
    // Get All Country List 
    public getCountryList(){
      this.allCountry=[];
      this.apiService.getData(`${environment.live_url}/${environment.settings_country}/`).subscribe((respData: any) => {
        this.allCountry = respData;
            },(error => {
              this.apiService.showError(error?.error?.detail)
            }));
    }
    // Get Role Based Designation
    public getSourceList(){
      this.apiService.getData(`${environment.live_url}/${environment.settings_source}/`).subscribe((respData: any) => {
      this.allSource = respData;
      },(error => {
        this.apiService.showError(error?.error?.detail)
      }));
    }
// Get Reporting Manager 
public getAllEmployeeList(){
  this.allEmployeeList =[];
  this.apiService.getData(`${environment.live_url}/${environment.employee}/?is_active=True&employee=True`).subscribe((respData: any) => {
this.allEmployeeList = respData;
  },(error => {
    this.apiService.showError(error?.error?.detail)
  }));
}

// search Employee   
filteredEmployeeList() {
  if (!this.searchEmployeeText) {
    return this.allEmployeeList;
  }
  return this.allEmployeeList.filter((emp:any) => 
    emp?.user__full_name?.toLowerCase()?.includes(this.searchEmployeeText?.toLowerCase())
  );
}
public clearSearch(key:any){
  if(key==='emp'){
    this.searchEmployeeText='';
  }else if(key==='con'){
    this.searchCountryText='';
  }else{
    this.searchSourceText='';
  }
}
// Search Country
filteredCountryList() {
  if (!this.searchCountryText) {
    return this.allCountry;
  }
  return this.allCountry.filter((con:any) => 
    con?.country_name?.toLowerCase()?.includes(this.searchCountryText?.toLowerCase())
  );
}

filteredSourceList() {
  if (!this.searchSourceText) {
    return this.allSource;
  }
  return this.allSource.filter((source:any) => 
    source?.source_name?.toLowerCase()?.includes(this.searchSourceText?.toLowerCase())
  );
}
    // Get Employee Detials 
    public getEmployeeDetails(id:any){
  this.apiService.getData(`${environment.live_url}/${environment.clients}/${id}/`).subscribe((respData: any) => {
      this.clientFormGroup.patchValue({
      client_number:respData?.client_number,
      client_name:respData?.client_name,
      email:respData?.email,
      country:respData?.country_id,
      address:respData?.address,
      service_start_date:respData?.service_start_date ? new Date(respData?.service_start_date)?.toISOString(): null,
      service_end_date:respData?.service_start_date ? new Date(respData?.service_start_date)?.toISOString():null,
      source:respData?.source_id,
      contact_details:respData?.contact_details,
      allow_sending_status_report_to_client:respData?.allow_sending_status_report_to_client,
      practice_notes:respData?.practice_notes,
        });
this.clientFormGroup?.get('client_file')?.setErrors(null);
if(respData?.client_file){
  urlToFile(respData?.client_file, this.getFileName(respData?.client_file))
.then(file => {
  this.file = file;
  this.selectedFile = this.file;
}
)
.catch(error => console.error('Error:', error));
}else{
  this.clientFormGroup?.patchValue({'client_file':null});
}
if(respData?.employee_details && respData?.employee_details?.length >=1){
  respData?.employee_details?.forEach((element:any) => {
    this.employeeFormArray.push(this.fb.control(element?.employee))
  });
}else{
  this.clientFormGroup?.patchValue({'employee_ids':[]});
}
      }, (error: any) => {
        this.apiService.showError(error?.error?.detail);
      })
    }
 
    public get f() {
      return this.clientFormGroup.controls;
    }
 
    get contactDetails(): FormArray {
      return this.clientFormGroup.get('contact_details') as FormArray;
    }

    get employeeFormArray() {
      return this.clientFormGroup.get('employee_ids') as FormArray;
    }
  
    createEmployeeControl(): FormControl {
      return this.fb.control(''); 
    }

    private createContactGroup(): FormGroup {
      return this.fb.group({
        name: ['', Validators.required],
        email:['',[Validators.required,Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
        phone_number:['',[Validators.required ,Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]],
      });
    }
  
    public joiningDateFun(event: any) {
  
    }
 
    public addContact() {
      if (this.contactDetails.length < 5) {
        this.contactDetails.push(this.createContactGroup());
      }
    }
  
    public deleteContact(index: number) {
      if (this.contactDetails.length > 1) {
        this.contactDetails.removeAt(index);
      }
    }

    public editContact(index: number) {
      const contact = this.contactDetails.at(index);
      contact.get('name').enable();
      contact.get('email').enable();
      contact.get('phone_number').enable();
    }

    validateKeyPress(event: KeyboardEvent) {
      // Get the key code of the pressed key
      const keyCode = event.which || event.keyCode;
  
      // Allow only digits (0-9), backspace, and arrow keys
      if ((keyCode < 48 || keyCode > 57) && keyCode !== 8 && keyCode !== 37 && keyCode !== 39) {
        event.preventDefault(); // Prevent the default action (i.e., entering the character)
      }
    }

   public triggerFileInput() {
      this.fileInput?.nativeElement?.click();
    }
    public fileFormatValidator(control: AbstractControl): Observable<ValidationErrors | null> {
      const allowedFormats = ['.xlsx','.xls','doc', 'docx', 'pdf'];;
      const maxSize = 10 * 1024 * 1024; // 10 MB in bytes
      const file = control.value;
  
      if (file) {
        console.log('file',file);
        const fileExtension = (/[.]/.exec(file)) ? file.split('.').pop()?.toLowerCase() : '';
        console.log('fileExtension',fileExtension);
        const fileSize = file.size;
  
          if (allowedFormats.includes(fileExtension)) {
              return of({ accept: false }); // Invalid file format
          }
  
          if (fileSize > maxSize) {
              return of({ maxSize: true }); // File size exceeds the limit
          }
      }
  
      return of(null);
  }

  public onFileSelected(event: Event): void {
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
        this.file = selectedFile;
        this.selectedFile = this.file;
  
        // Reset input value after a slight delay to allow re-selection
        setTimeout(() => {
          input.value = "";
        }, 100); // Small delay to ensure the selection is registered
      } else {
        this.apiService.showError("Invalid file type. Only xlsx, xls, doc, docx, pdf files are allowed.");
        this.selectedFile = null;
      }
    }
  }

    public backBtnFunc(){
      this.router.navigate(['/client/all-client']);
    }
  
    public deleteClient(){
      if (this.client_id) {
        const modelRef = this.modalService.open(GenericDeleteComponent, {
          size: <any>'sm',
          backdrop: true,
          centered: true
        });
        modelRef.componentInstance.status.subscribe(resp => {
          if (resp == "ok") {
            this.deleteContent(this.client_id);
            modelRef.close();
          }
          else {
            modelRef.close();
          }
        })
  
      }
    }
      public deleteContent(id: any) {
        this.apiService.delete(`${environment.live_url}/${environment.clients}/${id}/`).subscribe(async (data: any) => {
          if (data) {
            this.selectedClient = [];
            this.apiService.showSuccess(data.message);
            this.router.navigate(['/client/all-client']);
          }
        }, (error => {
          this.apiService.showError(error?.error?.detail)
        }))
      }
  
      public saveClientDetails(){
        console.log(this.clientFormGroup.value)
        if (this.clientFormGroup.invalid) {
          this.clientFormGroup.markAllAsTouched();
        } else {
          if (this.isEditItem) {
            this.formData = this.createFromData();
              this.apiService.updateData(`${environment.live_url}/${environment.clients}/${this.client_id}/`, this.formData).subscribe((respData: any) => {
              if (respData) {
                this.apiService.showSuccess(respData['message']);
                this.resetFormState();
                this.router.navigate(['/client/all-client']);
              }
            }, (error: any) => {
              this.apiService.showError(error?.error?.detail);
            });
          }else{
            this.formData = this.createFromData();
            this.apiService.postData(`${environment.live_url}/${environment.clients}/`, this.formData).subscribe((respData: any) => {
              if (respData) {
                this.apiService.showSuccess(respData['message']);
                this.resetFormState();
                this.router.navigate(['/client/all-client']);
              }
            }, (error: any) => {
              this.apiService.showError(error?.error?.detail);
            });
          }
      }
  }
  
  public resetFormState() {
    this.formGroupDirective?.resetForm();
    this.isEditItem = false;
  }

  public createFromData(){
    this.formData = new FormData();
    if (this.file) {
      this.formData.set("client_file", this.file || '');
    }else{
      this.formData.set("client_file", null);
    }
    let updatedStartDateValue = this.datepipe.transform(this.clientFormGroup?.get('service_start_date')?.value,'YYYY-MM-dd');
    let updatedEndDateValue = this.datepipe.transform(this.clientFormGroup?.get('service_end_date')?.value,'YYYY-MM-dd');  
    this.formData.set("client_number", this.clientFormGroup?.get('client_number')?.value);
      this.formData.set("client_name", this.clientFormGroup?.get('client_name')?.value);
      this.formData.set("email", this.clientFormGroup?.get('email')?.value);
      this.formData.set("country", this.clientFormGroup?.get('country')?.value);
      this.formData.set("address", this.clientFormGroup?.get('address')?.value);
      this.formData.set("service_start_date", updatedStartDateValue);
      this.formData.set("service_end_date", updatedEndDateValue || null);
      this.formData.set("source", this.clientFormGroup?.get('source')?.value);
      this.formData.set("employee_ids",JSON.stringify(this.clientFormGroup.get('employee_ids')?.value) || []);
      this.formData.set("practice_notes", this.clientFormGroup?.get('practice_notes')?.value || null);
      this.formData.set("allow_sending_status_report_to_client", this.clientFormGroup?.get('allow_sending_status_report_to_client')?.value || false);
      const result = this.clientFormGroup?.get('contact_details')?.value.map((item:any) => {
        return { 
          ...item, 
          phone_number: item?.phone_number.toString()
        };
      });
      this.formData.set("contact_details", JSON.stringify(result) || []);
      return this.formData;
  }

  addEmployee() {
    if (this.selectedEmployee) {
      this.employeeFormArray.push(this.createEmployeeControl());
      // Optionally, set the value for the newly added control
      this.employeeFormArray.at(this.employeeFormArray.length - 1).setValue(this.selectedEmployee);
      this.selectedEmployee = null; // Reset the selected employee after adding
    }
  }

  removeEmployee(index: number) {
    if (this.employeeFormArray.length > 1) {
      this.employeeFormArray.removeAt(index);
    }
  }

  getEmployeeName(userId: number): string {
    const employee = this.allEmployeeList.find((emp:any) => emp?.user_id === userId);
    return employee ? employee?.user__full_name : '';
  }

  get currentPageRows() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.employeeFormArray.controls.slice(startIndex, endIndex);
  }

  onPageChanged(event: any) {
    this.currentPage = event.pageIndex + 1;  // `pageIndex` is 0-based, so we add 1
    this.pageSize = event.pageSize;
  }

  public getContinuousIndex(index: number): number {
    return (this.currentPage - 1) * this.pageSize + index + 1;
  }
  public getFileName(url:any){
    return url?.split('/')?.pop(); 
  }
  }
  async function urlToFile(url: string, fileName: string): Promise<File> {
    let fullurl = environment.media_url+url;
    console.log('fullurl',fullurl);
    const response = await fetch(fullurl);
    const blob = await response.blob();
    const mimeType = blob.type || 'application/octet-stream';

    return new File([blob], fileName, { type: mimeType });
}