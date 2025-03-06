import { Component, OnInit } from '@angular/core';

import { TrialAlertComponent } from '../trial-alert/trial-alert.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BuyStandardplanComponent } from '../buy-standardplan/buy-standardplan.component';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../../../../environments/environment';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss']
})
export class SubscriptionComponent implements OnInit {
  subscriptionData: any = [];
  BreadCrumbsTitle:any='Subscription plan';
  monthly: boolean = true; // Default to monthly
  monthlyAmount: any;
  yearlyAmount: any;
  organization_id: string | null;
  mySubscriptionData: any = [];
  planDetails: any;
  constructor(private api:ApiserviceService,
    private common_service : CommonServiceService) { }

  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.organization_id = sessionStorage.getItem('organization_id');
    this.api.isComponentLoaded$.subscribe(status => {
      // console.log('Is Component Loaded:',status);
      if (status) {
        this.getSubscription()
        this.mySubscription()
      }
    });
    this.getSubscription()
    this.mySubscription()
    
  }
  shouldShowPlanSelection(): boolean {
    if (!this.mySubscriptionData || this.mySubscriptionData.length === 0) {
      // No subscription data: show Plan Selection
      return true;
    }
  
    // Check for active plans
    const hasActivePlan = this.mySubscriptionData.some(sub => sub.is_active);
  
    if (!hasActivePlan) {
      // If no active plan exists, show Plan Selection
      return true;
    }
  
    // If there’s an active plan (either Free Trial or Standard), do not show Plan Selection
    return false;
  }
  
  
  
  getSubscription(){
    this.api.getData(`${environment.live_url}/${environment.subscription_list}/`).subscribe((res)=>{
      if(res){
        this.subscriptionData = res;
        //console.log(this.subscriptionData,"Parent")
      }
    })
   
  }
 
  mySubscription(){
    if (this.organization_id) {
    this.api.getData(`${environment.live_url}/${environment.my_subscription}/?organization=${this.organization_id}`).subscribe((res)=>{
      if(res){
        this.mySubscriptionData = res?.['data']
        this.shouldShowPlanSelection()
      }
    })
  }
  }
  onTrailPlanStatus(event){
    if(event){
    this.getSubscription()
    this.mySubscription()
    }
  }
  
  
}
