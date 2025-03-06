import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { TrialAlertComponent } from '../trial-alert/trial-alert.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BuyStandardplanComponent } from '../buy-standardplan/buy-standardplan.component';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../../../../environments/environment';
import { ApiserviceService } from '../../../service/apiservice.service';
import { CommonServiceService } from '../../../service/common-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-plan-selection',
  templateUrl: './plan-selection.component.html',
  styleUrls: ['./plan-selection.component.scss']
})
export class PlanSelectionComponent implements OnInit {
  @Input()data:any;
  @Output()trailPlanStaus = new EventEmitter<any>();
  @Input()disabled:boolean;
  subscriptionData: any = [];
   BreadCrumbsTitle:any='Subscription plan';
   monthly: boolean = true; // Default to monthly
   monthlyAmount: any;
   yearlyAmount: any;
   organization_id: string | null;
  freeTrailDisable: boolean;
  firstPlanStandard: boolean = false;
   constructor(private api:ApiserviceService,
     private common_service : CommonServiceService,
     private modalService:NgbModal,
     private dialog: MatDialog,
     private router:Router) { }
 
     ngOnChanges(){
      this.subscriptionData = this.data.sort((a, b) => {
        if (a.name === 'Free Trial') return -1; // 'Free Trial' should come first
        if (b.name === 'Free Trial') return 1;
        return 0; // No change in order if neither is 'Free Trial'
      });
      this.freeTrailDisable = this.disabled
     }
   ngOnInit(): void {
     this.common_service.setTitle(this.BreadCrumbsTitle);
     this.organization_id = sessionStorage.getItem('organization_id');
     this.freeTrailDisable = this.disabled
     this.getPeopleCount(`?organization_id=${this.organization_id}&page=${1}&page_size=${10}`)
     this.getTransactionHistory()
   }
   setPaymentOption(option: boolean): void {
     this.monthly = option;
   }
   getTransactionHistory() {
    if (this.organization_id) {
      this.api.getData(`${environment.live_url}/${environment.transaction_history}/?organization=${this.organization_id}`).subscribe((res:any) => {
        if (res) {
          if (res && res?.length > 0) {
            const lastIndex = res[res?.length - 1]; // Get the last element
            const subscriptionName = lastIndex.subscribed_organization__subscription_type__name;
        
            if (subscriptionName) {
              if (subscriptionName === "Standard") {
                this.firstPlanStandard = true
              }
            }
          }
        }
      })
    }
  }
 
  
   buyStandardPlan() {
     const dialogRef = this.dialog.open(BuyStandardplanComponent, {
       data: {selectedValue: this.monthly,'totalPeopleCount':this.totalPeopleCount},
       panelClass: 'custom-dialog'
     });
     dialogRef.disableClose=true
   }
   openDialogue(subscription_id,event) {
    const modelRef = this.modalService.open(TrialAlertComponent, {
      size: <any>'sm',
      backdrop: true,
      centered: true,
    });
    modelRef.componentInstance.title = `Are you sure you want to activate the free trial plan?`;
    modelRef.componentInstance.message = `Free Trial Plan`;
    modelRef.componentInstance.buttonName = `Activate Free Trial`;
    
    modelRef.componentInstance.status.subscribe((resp) => {
      if (resp === "ok") {
        this.getTrailPlan(subscription_id,event,modelRef); // Pass the model reference
        modelRef.close();
      }else{
        modelRef.close();
      }
    });
  }
  
  async getTrailPlan(subscription_id,event,modelRef: any) {
    const data = {
      organization: this.organization_id,
      subscription_type: subscription_id,
      plan_type: event
    };
    
    this.api.postData(`${environment.live_url}/${environment.buy_subscription}/`, data).subscribe(
      async (res: any) => {
        if (res) {
          
          await this.common_service.subsctiptionState$.next(true)
          await this.trailPlanStaus.emit(true);
         await this.router.navigate(['/accounts/subscription']);
         this.api.showSuccess('You have successfully activated your free trial plan');
         modelRef.componentInstance.trailPlanStaus = true;
        }
      },
      (error) => {
        modelRef.componentInstance.trailPlanStaus = false;
        this.api.showError(error?.error?.message); // Optionally, show error message
      }
    );
  }
  
  roundAmount(amount: number): number {
    return Math.round(amount);
  }
   
  totalPeopleCount:number
  getPeopleCount(params:any) {
    this.api.getData(`${environment.live_url}/${environment.allEmployee}/${params}`).subscribe((data: any) => {
      // console.log(data)
      if( data?.['total_no_of_record']===0){
        this.totalPeopleCount = 1;
      } else{
        this.totalPeopleCount = data?.['total_no_of_record']+1;
      }
    }, ((error) => {
      this.api.showError(error.error.error.message)
    })
    )
  }

}
