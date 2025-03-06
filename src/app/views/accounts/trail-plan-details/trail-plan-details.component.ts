import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonServiceService } from '../../../service/common-service.service';
import { BuyStandardplanComponent } from '../buy-standardplan/buy-standardplan.component';
import { ExistStandardPlanComponent } from '../exist-standard-plan/exist-standard-plan.component';
import { StandardSubscriptionComponent } from '../standard-subscription/standard-subscription.component';
import { ApiserviceService } from '../../../service/apiservice.service';
import { environment } from '../../../../environments/environment';
import { DatePipe } from '@angular/common';
import { TrialAlertComponent } from '../trial-alert/trial-alert.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';


@Component({
  selector: 'app-trail-plan-details',
  templateUrl: './trail-plan-details.component.html',
  styleUrls: ['./trail-plan-details.component.scss']
})
export class TrailPlanDetailsComponent implements OnInit {
BreadCrumbsTitle:any='Subscription plan';
@Input()data:any;
@Input()my_subscription:any;
  monthly: boolean = true;
  planDetails: any;
  monthlyAmount: any;
  yearlyAmount: any;
  discount: any;
  subscriptionData: any;
  organizationId: string | null;
  mySubscriptionData: any;
  tableSize = 5;
  tableSizes = [5,10,25,50,100];
  page: any;
  count: any;
  totalPeopleCount:number
  constructor(
    private common_service:CommonServiceService,
    private dialog:MatDialog,
    private api:ApiserviceService,
    private datePipe: DatePipe,
    private modalService:NgbModal,
    private router:Router
  ) { }
  ngOnChanges(){
    this.subscriptionData = this.data;
    this.mySubscriptionData = this.my_subscription
    this.getSubscription(this.subscriptionData);
    let query = `page=${1}&page_size=${5}`
    this.getTrialPlanDetails(query);
  }
  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.organizationId = sessionStorage.getItem('organization_id');
    this.subscriptionData = this.data;
    this.mySubscriptionData = this.my_subscription
    console.log('this.mySubscriptionData',this.mySubscriptionData)
    this.getSubscription(this.subscriptionData);
    let query = `page=${1}&page_size=${5}`
    this.getTrialPlanDetails(query);
    this.totalPeopleCount = this.mySubscriptionData[0].added_users
    // this.getPeopleCount(`?organization_id=${this.organizationId}&page=${1}&page_size=${10}`)
  }
  getSubscription(event) {
        // Iterate through subscription data
        event?.forEach((subscription) => {
          if (subscription.name === 'Standard' && subscription.plan_details) {
            subscription.plan_details.forEach((item) => {
              // Check for Monthly or Yearly plans and assign amounts accordingly
              if (item.yearly_or_monthly_name === 'Monthly') {
                this.monthlyAmount = item.amount;
              } else if (item.yearly_or_monthly_name === 'Yearly') {
                this.yearlyAmount = item.amount;
                this.discount = item.discount;
              }
            });
          }
        });
    
  }
  getTrialPlanDetails(query){
    if(this.organizationId){
    this.api.getData(`${environment.live_url}/${environment.transaction_history}/?organization=${this.organizationId}&${query}`).subscribe((res)=>{
      if (res && res?.['results']) {
        this.planDetails = res?.['results'].map((item: any, index: number) => ({
          slNo: index + 1,
          plan: item.subscribed_organization__subscription_type__name,
          users: item.subscribed_organization__added_users,
          totalAmount: item.total_amount,
          startDate: this.datePipe.transform(item.subscribed_organization__start_date, 'dd/MM/yyyy'),
          endDate: this.datePipe.transform(item.subscribed_organization__expiry_date, 'dd/MM/yyyy')
        }));
        this.count = res?.['total_no_of_record']
      }
    })
  }
  }
 
  setPaymentOption(option: boolean): void {
    this.monthly = option;
  }
  onTableDataChange(event:any){
    this.page = event;
    let query = `page=${this.page}&page_size=${this.tableSize}`
   
    this.getTrialPlanDetails(query)
  }  
  onTableSizeChange(event:any): void {
    if(event){
     
    this.tableSize = Number(event.value);
    let query = `page=${1}&page_size=${this.tableSize}`
    
    this.getTrialPlanDetails(query)
    }
  } 
  cancelSubscription(){}
  addNewUser(){
    const dialogRef = this.dialog.open(ExistStandardPlanComponent, {
      data: {planDetails:this.planDetails},
      panelClass: 'custom-dialog'
    });
    dialogRef.disableClose=true
  }
  
   openDialogue() {
      const modelRef = this.modalService.open(TrialAlertComponent, {
        size: <any>'sm',
        backdrop: true,
        centered: true
      });
      modelRef.componentInstance.title = `By subscribing to the Standard Plan, your Free Plan will be cancelled.`;
      modelRef.componentInstance.message = `Cancel Free Trail`;
      modelRef.componentInstance.buttonName = `Proceed`;
      modelRef.componentInstance.status.subscribe(resp => {
        if (resp == "ok") {
          this.renewSubscription()
          modelRef.close();
        }
        else {
          modelRef.close();
        }
      })
    }
    cancelTrialPlan(){

    }

  renewSubscription(){
    const dialogRef = this.dialog.open(BuyStandardplanComponent, {
      data: {selectedValue: this.monthly,'totalPeopleCount':this.totalPeopleCount},
      panelClass: 'custom-dialog'
    });
    dialogRef.disableClose=true
     
  }
  openStandardPlan(){
    const dialogRef = this.dialog.open(StandardSubscriptionComponent, {
      // data: {planDetails:this.planDetails},
      panelClass: 'custom-dialog'
    });
    dialogRef.disableClose=true
     
  }

  download(data:any){
    // this.router.navigate(['/accounts/invoice-data'])
  }

  roundAmount(amount: number): number {
    return Math.round(amount);
  }
  
  
}
