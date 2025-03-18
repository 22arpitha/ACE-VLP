import { Component, OnInit, ViewChild } from '@angular/core';
import {  Validators, FormBuilder,FormGroup, FormGroupDirective } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { GenericDeleteComponent } from 'src/app/generic-delete/generic-delete.component';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-create-client',
  templateUrl: './create-client.component.html',
  styleUrls: ['./create-client.component.scss']
})
export class CreateClientComponent implements OnInit {
  
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
  BreadCrumbsTitle: any = 'Employee';
  clientFormGroup:FormGroup;
  allCountry:any=[];
  allSource:any=[];
  allUserRoleList:any=[];
  allEmployeeList:any=[];
  selectedClient:any=[];
  isEditItem:boolean=false;
  employee_id:any;
  isActivelist:any=[{name:'In Active',is_active:false},{name:'Active',is_active:true}]
  editorContent:any;
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
      private common_service: CommonServiceService,private router:Router,
      private apiService: ApiserviceService,private modalService: NgbModal) { 
      this.common_service.setTitle(this.BreadCrumbsTitle)
      if(this.activeRoute.snapshot.paramMap.get('id')){
        this.employee_id= this.activeRoute.snapshot.paramMap.get('id')
        this.isEditItem = true;
        this.getEmployeeDetails(this.employee_id);
      }else{
        this.getClientUniqueNumber();
      }
    }
  
    ngOnInit(): void {
      this.intialForm();
      this.getCountryList();
      this.getSourceList();
      this.getAllEmployeeList();
    }
  
    public intialForm(){
  this.clientFormGroup = this.fb.group({
        client_number: ['',Validators.required],
        client_name: ['', [Validators.required, Validators.maxLength(50)]],
        email: ['', [Validators.required, Validators.email]],
        country: ['', Validators.required],
        address: ['', [Validators.required, Validators.maxLength(50)]],
        start_date: ['', Validators.required],
        end_date: ['', Validators.required],
      });
    }
    // To Get Unique Employee Number
    public getClientUniqueNumber(){
      this.apiService.getData(`${environment.live_url}/${environment.client}/?get-unique-number=true`).subscribe((respData: any) => {
        this.clientFormGroup.patchValue({'client_number': respData?.unique_id});
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
      this.apiService.getData(`${environment.live_url}/${environment.settings_source}`).subscribe((respData: any) => {
      this.allSource = respData;
      },(error => {
        this.apiService.showError(error?.error?.detail)
      }));
    }
// Get Reporting Manager 
public getAllEmployeeList(){
  this.allEmployeeList =[];
  this.apiService.getData(`${environment.live_url}/${environment.employee}/`).subscribe((respData: any) => {
this.allEmployeeList = respData;
  },(error => {
    this.apiService.showError(error?.error?.detail)
  }));
}
    // Get Employee Detials 
    public getEmployeeDetails(id:any){
  this.apiService.getData(`${environment.live_url}/${environment.client}/${id}/`).subscribe((respData: any) => {
      this.clientFormGroup.patchValue({
      client_number:respData?.client_number,
      client_name:respData?.client_name,
      email:respData?.email,
      country:respData?.country,
      address:respData?.address,
      start_date:respData?.start_date,
      end_date:respData?.end_date,
      source:respData?.source,
        });
      }, (error: any) => {
        this.apiService.showError(error?.error?.detail);
      })
    }
    public get f() {
      return this.clientFormGroup.controls;
    }
  
    public joiningDateFun(event: any) {
  
    }
  
    public backBtnFunc(){
      this.router.navigate(['/client/all-client']);
    }
  
    public deleteEmployee(){
      if (this.employee_id) {
        const modelRef = this.modalService.open(GenericDeleteComponent, {
          size: <any>'sm',
          backdrop: true,
          centered: true
        });
        modelRef.componentInstance.status.subscribe(resp => {
          if (resp == "ok") {
            this.deleteContent(this.employee_id);
            modelRef.close();
          }
          else {
            modelRef.close();
          }
        })
  
      }
    }
      public deleteContent(id: any) {
        this.apiService.delete(`${environment.live_url}/${environment.client}/${id}/`).subscribe(async (data: any) => {
          if (data) {
            this.selectedClient = [];
            this.apiService.showSuccess(data.message);
            this.router.navigate(['/client/all-client']);
          }
        }, (error => {
          this.apiService.showError(error?.error?.detail)
        }))
      }
  
      public saveEmployeeDetails(){
        if (this.clientFormGroup.invalid) {
          this.clientFormGroup.markAllAsTouched();
        } else {
          if (this.isEditItem) {
            this.apiService.updateData(`${environment.live_url}/${environment.settings_country}/${this.employee_id}/`, this.clientFormGroup.value).subscribe((respData: any) => {
              if (respData) {
                this.apiService.showSuccess(respData['message']);
                this.resetFormState();
                this.router.navigate(['/client/all-client']);
              }
            }, (error: any) => {
              this.apiService.showError(error?.error?.detail);
            });
          }else{
            this.apiService.postData(`${environment.live_url}/${environment.client}/`, this.clientFormGroup.value).subscribe((respData: any) => {
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
    this.formGroupDirective.resetForm();
    this.isEditItem = false;
  }
  }
