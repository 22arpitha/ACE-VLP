import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { startWith, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';

@Component({
  selector: 'app-leave-apply',
  templateUrl: './leave-apply.component.html',
  styleUrls: ['./leave-apply.component.scss']
})
export class LeaveApplyComponent implements OnInit {
user_id:any;
allleavetypeList: any = [];
BreadCrumbsTitle: any = 'Leave Request';
sessions:any = [
  { value: 'session1', label: 'Session 1' },
  { value: 'session2', label: 'Session 2' }
];  
separatorKeysCodes: number[] = [ENTER, COMMA];
  emailCtrl = new FormControl('');
  ccEmailsList: string[] = [];
  allEmployeeEmailsList:any = [];
  filteredEmails: any=[];
  reportinManagerDetails:any=[];
  fileDataUrl: string | ArrayBuffer | null = null;
  @ViewChild('fileInput') fileInput: ElementRef;
  uploadFile: any;
  url: any;
  fileUrl: string | ArrayBuffer;
  constructor(private apiService: ApiserviceService,private common_service: CommonServiceService,
  ) {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.user_id = sessionStorage.getItem('user_id');
    this.filteredEmails = this.allEmployeeEmailsList?.slice();
    this.emailCtrl.valueChanges?.pipe(
      startWith(''),
      map((value: string | null) => value ? this._filter(value) : this.allEmployeeEmailsList?.slice())
    ).subscribe(data => this.filteredEmails = data);
  }
  ngOnInit(): void {
  this.getAllLeaveTypes();
  this.getAllEmployeeList();
  }

  public getAllLeaveTypes() {
      this.allleavetypeList = [];
      this.apiService.getData(`${environment.live_url}/${environment.settings_leave_type}/`).subscribe((respData: any) => {
        this.allleavetypeList = respData;
      }, (error: any) => {
        this.apiService.showError(error?.error?.detail);
      })
    }

    public getAllEmployeeList(){
    this.allEmployeeEmailsList =[];
    this.apiService.getData(`${environment.live_url}/${environment.employee}/?is_active=True&employee=True`).subscribe((respData: any) => {
    this.allEmployeeEmailsList = respData;
    this.reportinManagerDetails = this.allEmployeeEmailsList.find((emp:any)=>emp.user_id===Number(this.user_id));
    console.log('this.reportinManagerDetails',this.user_id,this.reportinManagerDetails);
  },(error => {
    this.apiService.showError(error?.error?.detail);
  }));
}
triggerFileInput() {
    this.fileInput?.nativeElement?.click();
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
        this.fileDataUrl = reader.result;
      };
    }
  }

  addEmail(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value.trim();

    if (value && this._isValidEmail(value) && !this.ccEmailsList?.includes(value)) {
      this.ccEmailsList?.push(value);
    }

    if (input) {
      input.value = '';
    }

    this.emailCtrl.setValue(null);
  }

  removeEmail(email: string): void {
    const index = this.ccEmailsList?.indexOf(email);

    if (index >= 0) {
      this.ccEmailsList?.splice(index, 1);
    }
  }

  selectEmail(event: any): void {
    const email = event.option.value;
    if (email && !this.ccEmailsList?.includes(email)) {
      this.ccEmailsList?.push(email);
    }
    this.emailCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allEmployeeEmailsList?.filter((email:any) => email?.user__email?.toLowerCase()?.includes(filterValue));
  }

  private _isValidEmail(email: string): boolean {
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return EMAIL_REGEX.test(email);
  }

  

}
