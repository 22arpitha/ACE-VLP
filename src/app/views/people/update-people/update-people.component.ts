import { Component, OnInit } from '@angular/core';
import {  Validators, FormBuilder,FormGroup, FormControl, AbstractControl, ValidationErrors } from '@angular/forms';
import { ApiserviceService } from '../../../service/apiservice.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { Location } from '@angular/common';
import { CommonServiceService } from 'src/app/service/common-service.service';
@Component({
  selector: 'app-update-people',
  templateUrl: './update-people.component.html',
  styleUrls: ['./update-people.component.scss']
})
export class UpdatePeopleComponent implements OnInit {
  id:any;
  BreadCrumbsTitle:any='Update employee';
  mediaUrl = environment.media_url;
  allDepartment:any=[];
  department:any;

  allRole:any=[];
  role:any;

  allReportingManager:any=[];
  reportingManager:any;

  allCenter:any=[];
  center:any;

  allPrefix:any=[];
  prefix:any;

  allTag:any=[];
  tag:any;
  tagSetting = {};
  tagId:any=[]

  uploadFile:any;
  url:any;
  fileUrl:any;

  startDate:any
  date:any
  updateForm: FormGroup;
  page: string;
  tableSize: string;
  Status:any;
  m_status:any
  params ={
    pagination:"FALSE",
  }
  gender = ''
  maritalStatus = ''
  centerId:any;
  allCostCenter: any = [];
  type: string = 'url';
  base64StringWithoutPrefix: string;
  base64String: any;
  dateOfJoining: any;
  organizationList: any = [];
  user_id: string;
  org_id: string;
  
  changeYearStartDate(event:any){
    this.date = event  
  }
  constructor(
    private builder:FormBuilder, 
    private api: ApiserviceService, 
    private route:ActivatedRoute, 
    private router:Router,
    private datepipe:DatePipe,
    private location:Location,
    private common_service:CommonServiceService) { 
    this.id =this.route.snapshot.paramMap.get('id')
    this.page = this.route.snapshot.paramMap.get('page')
    this.tableSize = this.route.snapshot.paramMap.get('tableSize')
    this.org_id = sessionStorage.getItem('org_id')
  }
  initForm(){
    this.updateForm= this.builder.group({
      // prefix_suffix_id:['',[Validators.required]],
      u_email:['',[Validators.required, Validators.email]],
      department_id:['',Validators.required],
      u_first_name:['',[Validators.required,Validators.pattern(/^[a-zA-Z]+$/)]],
      user_role_id:['',[Validators.required]],
      org_role_id:[''],
      u_last_name:['',[Validators.required,Validators.pattern(/^[a-zA-Z]+$/)]],
      user_reporting_manager_ref_id:[''],
      u_gender:['',[Validators.required]],
      u_marital_status:['',[Validators.required]],
      u_designation:['',[Validators.required,Validators.pattern(/^\S.*$/)]],
      u_date_of_joining:['',Validators.required],
      // tags:['',[Validators.required]],
      profile_base64:['',[Validators.required,this.fileFormatValidator]],
   
      cost_center_id:['',Validators.required],
      
      center_id:['',Validators.required],
      u_org_code:['12345'],
      u_status:['',Validators.required],
    })
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
  
  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.initForm();
    this.getRole();
    this.getDepartment();
    this.getReportingManager();
    this.getCostCenter();
    this.getCenter()
    this.getPrefix();
    // this.getTag();
    this.user_id = sessionStorage.getItem('user_id')
   
   // this.getOrgDetails(`&page_number=1&data_per_page=2&pagination=FALSE&organization_id=${this.org_id}`)
    this.edit();
  }

  goBack(event)
  {
    event.preventDefault(); // Prevent default back button behavior
  this.location.back();
  
  }
  get f(){
    return this.updateForm.controls;
  }
  getSelectedImage(){
    
  }
  edit(){  
    let params = {
      page_number:this.page,
      data_per_page:this.tableSize,
      organization_id:this.org_id
     }
    this.api.getCurrentPeopleDetails(this.id,params).subscribe((data:any)=>{
      //this.url=`https://eztime.thestorywallcafe.com/media${ data.result.data[0].photo}` ;  
       this.url = data.result.data[0].u_profile_path
       let tags =[]
       this.dateOfJoining;
      
       this.dateOfJoining = new Date (data.result.data[0].u_date_of_joining)
     
       this.dateOfJoining == 'Invalid Date' ? this.dateOfJoining = this.datepipe.transform((data.result.data[0].u_date_of_joining*1000),"YYYY-MM-dd"): this.dateOfJoining = data.result.data[0].u_date_of_joining
       //typeof data.result.data[0].tags === 'string' ? tags.push(data.result.data[0].tags):tags = data.result.data[0].tags
       tags.push(data.result.data[0].tags)
      // window.alert(data.result.data[0].user_role_id)
       
       this.updateForm.patchValue({
        // prefix_suffix_id:data.result.data[0].prefix_suffix_id,
        u_email:data.result.data[0].u_email,
        department_id:data.result.data[0].department_id,
        u_first_name:data.result.data[0].u_first_name,
        user_role_id:data.result.data[0].user_role_id,
        org_role_id:data.result.data[0].organization_role_id,
        u_last_name:data.result.data[0].u_last_name,
        user_reporting_manager_ref_id:data.result.data[0].user_reporting_manager_ref_id,
        u_gender:data.result.data[0].u_gender,
        u_marital_status:data.result.data[0].u_marital_status,
        u_designation:data.result.data[0].u_designation,
        u_date_of_joining:this.dateOfJoining,
        // u_date_of_joining:this.datepipe.transform((data.result.data[0].u_date_of_joining*1000),"YYYY-MM-dd"),
        tags:data.result.data[0].tags,
        cost_center_id:data.result.data[0].cost_center_id,
        profile_base64:this.url,
        center_id:data.result.data[0].center_id,
        u_status:data.result.data[0].u_status,
        //organization_id:data.result.data[0].organization_id
      })
     
      //console.log( typeof data.result.data[0].tags,tags)
      //console.log(typeof data.result.data[0].u_date_of_joining,data.result.data[0].u_date_of_joining,"DOJ")
    })
   
  }
  getOrgDetails(pagination){
    this.api.getData(`${environment.live_url}/${environment.organization}?id=${this.user_id}${pagination}`).subscribe(res=>{
      if(res){
       this.organizationList = res['result']['data']
      // console.log(this.organizationList,"ORG LIST")
      
      }
    },(error =>{
      this.api.showError(error.error.error.message)
    }))
  }

  update(){
    let data ={}
    let tagId = []
    tagId = this.updateForm.value.tags
    let selectedId = []
    // tagId.forEach(res => {
    //   selectedId.push(Number(res.id))
    // })

   // console.log(tagId)
    //data = this.updateForm.value
   // data['u_date_of_joining'] = this.date
    if(this.updateForm.invalid || this.updateForm.value === null){
      this.api.showError("Invalid !")
      this.updateForm.markAllAsTouched()
      //console.log(this.updateForm.value)
    }
    else{
    //this.updateForm.value.tags=this.tagId
    // const selectedTagId = this.tagId.filter(f=> f.id)
    // console.log(selectedTagId,"selectedTagId")
    this.changeYearStartDate(this.updateForm.value.u_date_of_joining)
  //  this.date = this.updateForm.value.u_date_of_joining 
    if(this.type == 'url'){
      fetch(this.url)
      .then(response => response.blob())
      .then(blob => {
        // Create a FileReader to read the blob as a base64 string
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          // Extract the base64 string from the result
          const base64WithPrefix = reader.result?.toString();
          ////console.log(base64WithPrefix);
          this.updateForm.patchValue({
            profile_base64:this.url
          })
          this.base64String = base64WithPrefix
          //console.log(this.updateForm.value.profile_base64,"jhjjhkjk")
          //console.log(this.dateOfJoining,'this.date')
           data ={
            // prefix_suffix_id:this.updateForm.value.prefix_suffix_id,
            u_email:this.updateForm.value.u_email,
            department_id:this.updateForm.value.department_id,
            u_first_name:this.updateForm.value.u_first_name,
            user_role_id:this.updateForm.value.user_role_id,
            org_role_id:1,
            u_last_name:this.updateForm.value.u_last_name,
            user_reporting_manager_ref_id:this.updateForm.value.user_reporting_manager_ref_id,
            u_gender:this.updateForm.value.u_gender ,
            u_marital_status:this.updateForm.value.u_marital_status ,
            u_designation:this.updateForm.value.u_designation,
            u_date_of_joining:this.datepipe.transform(this.date,'dd/MM/yyyy'),
            // tags:selectedId,
            cost_center_id:this.updateForm.value.cost_center_id,
            profile_base64:this.base64String,
            center_id:this.updateForm.value.center_id,
            u_status:this.updateForm.value.u_status,
            u_org_code:this.updateForm.value.u_org_code,
            organization_id:this.org_id
          }
          //console.log(data['tags'],"TAGID----")
           this.api.updatePeople(this.id,data).subscribe(response=>{
          if(response){
            this.api.showSuccess('People updated successfully!');
            this.updateForm.reset();
            this.initForm()
           
            this.router.navigate(['/people/people-list'])
          }
          else{
           
            this.api.showError('Error!')
          }
        }
      )
        };
      });
     ////console.log(this.base64String);
    }
    else{
      data ={
        // prefix_suffix_id:this.updateForm.value.prefix_suffix_id,
        u_email:this.updateForm.value.u_email,
        department_id:this.updateForm.value.department_id,
        u_first_name:this.updateForm.value.u_first_name,
        user_role_id:this.updateForm.value.user_role_id,
        org_role_id:1,
        u_last_name:this.updateForm.value.u_last_name,
        user_reporting_manager_ref_id:this.updateForm.value.user_reporting_manager_ref_id,
        u_gender:this.updateForm.value.u_gender ,
        u_marital_status:this.updateForm.value.u_marital_status ,
        u_designation:this.updateForm.value.u_designation,
        u_date_of_joining:this.datepipe.transform(this.date,'dd/MM/yyyy'),
        tags:selectedId,
        cost_center_id:this.updateForm.value.cost_center_id,
        profile_base64:this.fileUrl,
        center_id:this.updateForm.value.center_id,
        u_status:this.updateForm.value.u_status,
        u_org_code:this.updateForm.value.u_org_code,
        organization_id:Number(this.updateForm.value.organization_id)
      }
      
       this.api.updatePeople(this.id,data).subscribe(response=>{
      if(response){
        this.api.showSuccess('People updated successfully!');
        this.updateForm.reset();
        this.initForm()
       
        this.router.navigate(['/people/people-list'])
      }
      else{
        this.api.showError('Error!')
      }
    }
    )
    }
    }
  }
  onFocus(){
    this.type = 'file';
    this.updateForm.get('profile_base64')?.reset();
  }


  uploadImageFile(event:any){
    //console.log(event,"EVENT")
    this.uploadFile =  event.target.files[0];
    if(event.target.files && event.target.files[0]){
      const reader =new FileReader();
      reader.readAsDataURL(event.target.files[0])
      reader.onload = (event:any)=>{
        this.url = event.target.result;
        this.fileUrl = reader.result
        this.updateForm.patchValue({profile_base64:this.fileUrl})
        //console.log(this.fileUrl)
      }
    }
  }
 
  getRole(){
    let params = `page_number=1&data_per_page=2&pagination=FALSE&organization_id=${this.org_id}`
     this.api.getUserAccess(params).subscribe((data:any)=>{
      if(data.result.data){
        const role = data.result.data
        const filteredRole = role.filter(role => role.role_status !== 'Inactive' && role.user_role_name!='ADMIN')
        this.allRole = filteredRole;
      }
    
     },(error:any)=>{
      this.api.showError(error.error.error.message)  
      //console.log(error,"ERROR")
    }
     )
   }
  getDepartment(){
    this.api.getDepartmentDetails(this.params,this.org_id).subscribe((data:any)=>{
      if(data){
        const department = data.result.data
        const filteredDepartment = department.filter(depart => !depart.od_status.includes('Inactive'))
        this.allDepartment= filteredDepartment;
        }
      },(error:any)=>{
        this.api.showError(error.error.error.message)  
        //console.log(error,"ERROR")
      }
    )
  }
  getReportingManager(){
    this.api.getManagerDetails(this.params,this.org_id).subscribe((data:any)=>{
      if(data.result.data){
        const reportingManager = data.result.data
        const filteredRepotingManager = reportingManager.filter(manager => !manager.u_status?.includes('Inactive'))
        this.allReportingManager = filteredRepotingManager;
      }
     
    },(error:any)=>{
      this.api.showError(error.error.error.message)  
      //console.log(error,"ERROR")
    }
    )
  }
  getCostCenter(){
    this.api.getCostCenterDetails(this.params).subscribe((data:any)=>{
      if(data.result.data){
        const costCenter = data.result.data
        const filterdCostCenter = costCenter.filter(cc => !cc.occ_status?.includes('Inactive'))
        this.allCostCenter = filterdCostCenter;
        }
       },(error:any)=>{
        this.api.showError(error.error.error.message)  
        //console.log(error,"ERROR")
      }
    )
  }
  getCenter(){
    this.api.getCenterDetails(this.params,this.org_id).subscribe((data:any)=>{
      if(data.result.data){
        const center = data.result.data;
        const filteredCenter = center.filter(center => !center.center_status?.includes('Inactive'))
        this.allCenter = filteredCenter;
        console.log(this.allCenter,"CENTER ID")
        }
    },(error:any)=>{
      this.api.showError(error.error.error.message)  
      //console.log(error,"ERROR")
    })
  }
  getPrefix(){
    this.api.getPrefixSuffixDetails(this.params,this.org_id).subscribe((data:any)=>{
      if(data.result.data){
        this.allPrefix= data.result.data;
      } 
    },(error:any)=>{
      this.api.showError(error.error.error.message)  
      //console.log(error,"ERROR")
    }
    )
  }
  onTagSelect(event: any) {
    //console.log(event)
    this.tagId.push(event.id)
    this.f['tags'].markAsUntouched()
  }
  onTagSelectAll(event: any) {
    event.forEach((element : any)  => {
      this.tagId.push(element.id)
    });
  }
  onItemDeSelect(item: any) {
    if(this.tagId.length >1){
    const index = this.tagId.indexOf(item.id)
    const newArr = this.tagId.splice(index,1)
    }
    else{
      this.tagId = []
      this.f['tags'].markAllAsTouched()
    }
 }
  onItemDeSelectAll(item:any){
    if(item){
      this.tagId = []
      this.f['tags'].markAllAsTouched()
    }  
  }
  getTag(){
    this.tagSetting = {
      singleSelection: false,
      idField: 'id',
      textField: 'tag_name',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
    this.api.getTagDetails(this.params,this.org_id).subscribe((data:any)=>{
      if(data.result.data){
        const tags = data.result.data
        const filteredTags = tags.filter(tags => !tags.tage_status.includes('Inactive'))
        this.allTag = filteredTags;
      }
    },(error:any)=>{
      this.api.showError(error.error.error.message)  
      //console.log(error,"ERROR")
    }
    )
  }

}
