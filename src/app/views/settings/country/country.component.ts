import { Component, OnInit } from '@angular/core';
import { CommonServiceService } from '../../../service/common-service.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiserviceService } from '../../../service/apiservice.service';
import { environment } from '../../../../environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericDeleteComponent } from 'src/app/generic-delete/generic-delete.component';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss']
})
export class CountryComponent implements OnInit {
  BreadCrumbsTitle: any = 'Country';
  countryForm: FormGroup;
  isEditItem:boolean=false;
  selectedItemId:any
  allCountry = []
  sortValue: string = '';
  directionValue: string = '';
  arrowState: { [key: string]: boolean } = {
    department_name: false,
    created_datetime: false,
  };
  page = 1;
  count = 0;
  tableSize = 5;
  tableSizes = [5, 10, 25, 50, 100];
  currentIndex: any;
  term: any = '';

  constructor(
    private common_service: CommonServiceService, private fb: FormBuilder, private api: ApiserviceService,
    private modalService:NgbModal,
  ) { }

  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.intialForm();
    this.getAllCountryList(`?page=${1}&page_size=${5}`);
  }

  intialForm() {
    this.countryForm = this.fb.group({
      country_name: ['', Validators.required]
    })
  }
  get f() {
    return this.countryForm.controls;
  }
  getContinuousIndex(index: number): number {
    return (this.page - 1) * this.tableSize + index + 1;
  }
  arrow: boolean = false
  sort(direction: string, column: string) {
    Object.keys(this.arrowState).forEach(key => {
      this.arrowState[key] = false;
    });
    this.arrowState[column] = direction === 'asc';
    this.directionValue = direction;
    this.sortValue = column;
  }

  getAllCountryList(params: any) {
    this.api.getData(`${environment.live_url}/${environment.settings_country}/${params}`).subscribe(
      (res: any) => {
        console.log(res.results)
        this.allCountry = res.results;
        const noOfPages: number = res?.['total_pages']
        this.count = noOfPages * this.tableSize;
        this.count = res?.['total_no_of_record']
        this.page = res?.['current_page'];
      }
    )
  }
  filterSearch(event: any) {
    this.term = event.target.value?.trim();
    if (this.term && this.term.length >= 2) {
      this.page = 1;
      let query = this.getFilterBaseUrl()
      query += `&search=${this.term}`
      this.getAllCountryList(query);
    }
    else if (!this.term) {
      this.getAllCountryList(this.getFilterBaseUrl());
    }
  }
  getFilterBaseUrl(): string {
    return `?page=${this.page}&page_size=${this.tableSize}`;
  }

  onTableSizeChange(event: any): void {
    if (event) {
      this.page = 1;
      this.tableSize = Number(event.value);
      if (this.term) {
        let query = this.getFilterBaseUrl()
        query += `&search=${this.term}`
        // console.log(this.term)
        this.getAllCountryList(query);
      } else {
        // console.log(this.term,'no')
        this.getAllCountryList(this.getFilterBaseUrl());
      }
    }
  }

  onTableDataChange(event: any) {
    this.page = event;
    if (this.term) {
      let query = this.getFilterBaseUrl()
      query += `&search=${this.term}`
      // console.log(this.term)
      this.getAllCountryList(query);
    } else {
      // console.log(this.term,'no')
      this.getAllCountryList(this.getFilterBaseUrl());
    }
  }

  saveCountryDetails() {
    if (this.countryForm.invalid) {
      this.countryForm.markAllAsTouched();
    } else {
      if (this.isEditItem) {
        this.api.updateData(`${environment.live_url}/${environment.settings_country}/${this.selectedItemId}/`, this.countryForm.value).subscribe((respData: any) => {
          if (respData) {
            this.api.showSuccess(respData['message']);
            this.reset();
          }
        }, (error: any) => {
          this.api.showError(error?.error?.message);
        });
      } else {
        this.api.postData(`${environment.live_url}/${environment.settings_country}/`, this.countryForm.value).subscribe((respData: any) => {
          if (respData) {
            this.api.showSuccess(respData['message']);
            this.reset();
          }
        }, (error: any) => {
          this.api.showError(error?.error?.message);
        });
      }
    }
  }

  edit(item:any){
    this.selectedItemId = item?.id;
    this.isEditItem = true;
    this.getSelectedItemData(this.selectedItemId)
  }

  getSelectedItemData(id:any){
    this.api.getData(`${environment.live_url}/${environment.settings_country}/${id}/`).subscribe((respData:any)=>{
      this.countryForm.patchValue({'country_name':respData?.country_name});
      },(error:any)=>{
        this.api.showError(error?.error?.message);
      })
  }

  delete(id:any){
      if(id){
        const modelRef =   this.modalService.open(GenericDeleteComponent, {
          size: <any>'sm',
          backdrop: true,
          centered:true
        });
        modelRef.componentInstance.status.subscribe(resp => {
          if(resp == "ok"){
           this.deleteContent(id);
           modelRef.close();
          }
          else{
            modelRef.close();
          }
      })
    
    }
  }
  public deleteContent(id:any){
    this.api.delete(`${environment.live_url}/${environment.settings_country}/${id}/`).subscribe(async(data:any)=>{
      if(data){
        this.allCountry = []
        this.api.showSuccess(data.message)
        let query = `?page=${1}&page_size=${this.tableSize}`
        if(this.term){
          query +=`&search=${this.term}`
        }
        
        this.getAllCountryList(query)
      }
      
    },(error =>{
      this.api.showError(error?.error?.message)
    }))
  }

  reset(){
    this.countryForm.reset();
    this.isEditItem=false;
    this.countryForm.markAsPristine();
    this.countryForm.markAsUntouched();
    this.getAllCountryList(`?page=${1}&page_size=${5}`);
  }
}
