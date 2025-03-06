import { ChangeDetectorRef, Component, Inject, Input, NgZone, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ApiserviceService } from '../../../service/apiservice.service';
import { environment } from '../../../../environments/environment';
import { TrialSuccessComponent } from '../trial-success/trial-success.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TransactionFailedComponent } from '../transaction-failed/transaction-failed.component';


declare var Razorpay: any;
@Component({
  selector: 'app-exist-standard-plan',
  templateUrl: './exist-standard-plan.component.html',
  styleUrls: ['./exist-standard-plan.component.scss']
})
export class ExistStandardPlanComponent implements OnInit {
  // @Inject(MAT_DIALOG_DATA) data: any;
 monthly: boolean = true;
  state:any = [];
  userForm!:FormGroup
  monthlyAmount: any;
  yearlyAmount: any;
  selectedType: string = '1';
  selectedAmount: any;

  planName:string;
  planAmount:number
  subscriptionData:any = [];
  igst: number;
  cgst: number = 0;
  sgst: number = 0;
  cgst_per:number;
  sgst_per:number;
  remainingDays = 0
  igst_per:number;
  discount:number;
  subtotal: number = 0;
  totalPayable: number = 0;
  renewalAndAddedUserAmount:number = 0
  is_renewed:boolean = false;
  renewalPlanData:any;
  position='left'
  constructor( @Inject(MAT_DIALOG_DATA) public data: any,
  private cdr: ChangeDetectorRef,
    private api:ApiserviceService,
    private fb:FormBuilder,
    private router :Router,
    private dialogue:MatDialog,
    private ngZone: NgZone,
    private modalService:NgbModal,
  ) { 
    // this.cdr.detectChanges();
  }
  

  ngOnInit(): void {
    this.initForm()
    this.getCountry() 
    this.getExistingPlanDetails()
  }
  getExistingPlanDetails(){
   // console.log(this.data)
    this.api.getData(`${environment.live_url}/${environment.my_subscription}/?id=${this.data.plan.id}`).subscribe(
      (res:any)=>{
     //   console.log('existing plan details',res);
       this.userForm.patchValue({state:res.data[0].state});
       this.planName = res.data[0].subscribed_for;
       this.cgst_per = res.data[0].cgst;
       this.sgst_per = res.data[0].sgst;
       this.igst_per = res.data[0].igst;
       this.remainingDays = res.data[0].remaining_number_of_days + 1
       if(res.data[0].subscribed_for==='Yearly'){
         this.discount = Math.round(res.data[0].discount);
         this.planAmount = Math.round(res.data[0].discount);
        } else{
          this.planAmount = Math.round(res.data[0].amount);
          this.discount = 0;
        }
        if(res.data[0].is_renewed==true && res.data[0].renewed_details.length!=0){
          this.is_renewed = res.data[0].is_renewed;
          this.renewalPlanData = res.data[0].renewed_details[0];
        } else{
          this.is_renewed = res.data[0].is_renewed;
        }
        this.calculateTotal();
      },(error)=>{
        //console.log(error)
      }
    )
  }
  getSubscription() {
    this.api.getData(`${environment.live_url}/${environment.subscription_list}/`).subscribe((res: any) => {
      if (res) {
        this.subscriptionData = res;
  
        // Iterate through subscription data
        this.subscriptionData.forEach((subscription) => {
          if (subscription.name === 'Standard' && subscription.plan_details) {
            subscription.plan_details.forEach((item) => {
              // Check for Monthly or Yearly plans and assign amounts accordingly
              if (item.yearly_or_monthly_name === 'Monthly') {
                this.monthlyAmount = item.amount;
              } else if (item.yearly_or_monthly_name === 'Yearly') {
                this.yearlyAmount = item.amount;
                // this.discount = item.discount;
              }
            });
          }
        });
      }
    });
  }
  initForm(){
    this.userForm = this.fb.group({
      noOfUsers: [
        1, 
        [
          Validators.required,
          Validators.min(1),
          Validators.max(10000),
          Validators.pattern(/^[1-9][0-9]*$/) // Regex for no spaces, no leading zeros, and only digits
        ]
      ],
      state:['',Validators.required]
    })
  }
  

  calculateTotal(): void {
    const amount = this.planAmount; // Monthly/Yearly price per user
    const noOfUsers = this.userForm.value.noOfUsers;
    const tempValue = (amount/30)*this.remainingDays*noOfUsers
    if( this.is_renewed===true){
      const renewedTotal = this.calculateRenewedTotal(this.renewalPlanData);
      const calculatedValue = Number(tempValue.toFixed(2)) + renewedTotal
      this.subtotal = Number(calculatedValue.toFixed(2))
     // console.log('add users + renewal',this.subtotal)
    } else{
      this.subtotal = Number(tempValue.toFixed(2))
     // console.log('add user',this.subtotal)
    }
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.cgst = 0;
      this.sgst = 0;
      this.totalPayable = 0;
    } else {
      if (this.userForm.get('state')?.value === 4026) {
        this.cgst = parseFloat((this.subtotal * (this.cgst_per/100)).toFixed(2)); // CGST with 2 decimal places
        this.sgst = parseFloat((this.subtotal * (this.sgst_per/100)).toFixed(2)); // SGST with 2 decimal places
        let temp_totalPayable = parseFloat((this.subtotal + this.cgst + this.sgst).toFixed(2));
        this.totalPayable = temp_totalPayable //Math.round(temp_totalPayable) // Total payable with 2 decimal places
      } else {
        this.igst = parseFloat((this.subtotal * (this.igst_per/100)).toFixed(2)); // IGST with 2 decimal places
        let temp_totalPayable  = parseFloat((this.subtotal + this.igst).toFixed(2)); 
        this.totalPayable = temp_totalPayable //Math.round(temp_totalPayable)// Total payable with 2 decimal places
      }
      }
  }
 
  renewalSubTotal:number;
  calculateRenewedTotal(data) {
    // const amount = this.selectedAmount || this.monthlyAmount; // Monthly/Yearly price per user
    const noOfUsers = this.userForm.value.noOfUsers;
    this.renewalSubTotal = 0
    if(data.subscribed_for==='Yearly'){
      let temp_subTotal = (data.discount/30)*365*noOfUsers;
     this.renewalSubTotal = Number(temp_subTotal.toFixed(2))
    } else{
      let temp_subTotal = noOfUsers * data.amount;
     this.renewalSubTotal = Number(temp_subTotal.toFixed(2))
    }
    return this.renewalSubTotal
  }

  onCancel(): void {
   this.dialogue.closeAll()
  }

  onMakePayment(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
    } else {
      let data = {
        'total_amount': this.totalPayable
      }
      // console.log(data.total_amount)
      this.api.getRazorpayFromData(data).subscribe(
        (res: any) => {
         // console.log(res)
          if (res) {
            this.openRazorpay(res);
          }
        },
        (error: any) => {
         // console.log('error', error)
        }
      )
    }
  }
  setPaymentOption(option: boolean,amount:number,type:string): void {
    this.monthly = option;
    this.selectedAmount = amount
    this.selectedType = type
    this.calculateTotal()
  }
  getCountry() {
    this.api.getData(`${environment.live_url}/${environment.country}/`).subscribe((res: any) => {
     // console.log(res,'country')
      let temp_country = res.find((country: any) => country.country_name === 'India');
      this.getState(temp_country.id)
    }, ((error) => {
      this.api.showError(error.error.error.message)
    }))
  }
getState(id:number) {
  this.api.getData(`${environment.live_url}/${environment.state}/?country_id=${id}`).subscribe((res: any) => {
    if (res) {
      this.state = res
    }
  }, ((error) => {
    this.api.showError(error?.error.message)
  }))

}
  openRazorpay(data: any) {
    this.dialogue.closeAll()
      const RazorpayOptions: any = {
        description: 'Sample Rozarpay demo',
        currency: 'INR',
        amount: data.amount,
        name: 'Project Ace',
        key: environment.Razorpay_test_key,
        //key:'rzp_test_Z6PoT6HRL71TiC',
        image: '../assets/images/logo.png',
        order_id: data.razor_pay_order_id,
        handler: function (response: any): any {
          if (response) {
            //console.log(response)
            successCallback(response)
          }
        },
        modal: {
          ondismiss: () => {
            this.ngZone.run(() => {
              this.transactionFailed();
            });
          }
        }
  
      }
      const successCallback = (response: any) => {
        this.ngZone.run(() => {
          const reqData: any = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          };
          this.addingNewUsers(reqData);
        });
      }
      const failureCallback = (e: any) => {
        if (e) {
          // this.btnEnable = false
        }
      }
  
      Razorpay.open(RazorpayOptions, successCallback)
    }

  addingNewUsers(datas:any){
    let data = {
      "organization": this.data.organization,
      "subscription_id": this.data.plan.id,
      "razorpay_payment_id": datas.razorpay_payment_id,
      "razorpay_order_id": datas.razorpay_order_id,
      "razorpay_signature": datas.razorpay_signature,
      "total_amount": this.totalPayable,
      "initial_amount": this.subtotal,
      "cgst": this.cgst != 0 ? this.cgst : null,
      "igst": this.igst != 0 ? this.igst : null,
      "sgst": this.sgst != 0 ? this.sgst : null,
      "discounted_amount": this.discount!= 0 ? this.discount : null,
      "added_users": Number(this.userForm.value.noOfUsers),
      "state": this.userForm.value.state
    }
    this.api.addUsersForExistingPlan(data).subscribe(
      (res: any) => {
        if (res) {
            this.ngZone.run(() => {
              this.openDialogue()
            });
        }
      }, 
      (error:any)=>{
       // console.log(error);
        this.api.showError(error);
      }
    )
  }

  openDialogue() {
      const modelRef = this.modalService.open(TrialSuccessComponent, {
        size: <any>'sm',
        backdrop: true,
        centered: true
      });
      modelRef.componentInstance.title = `New users added!`;
      modelRef.componentInstance.message = `Transaction Successful!`;
      modelRef.componentInstance.status.subscribe(async resp => {
        if (resp === "ok") {
         await this.api.setComponentLoadedStatus(true);
          modelRef.close();
        }
        else {
          modelRef.close();
        }
      })
    }

    async transactionFailed(){
        const modalRef = await this.modalService.open(TransactionFailedComponent, {
          size: <any>'sm',
          backdrop: true,
          centered: true,
        });
    
        modalRef.componentInstance.status.subscribe((resp: any) => {
          if (resp === "ok") {
            this.router.navigate(['/accounts/subscription']);
          }
          modalRef.close();
        });
      }
}
