import { Component, Inject, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiserviceService } from '../../../service/apiservice.service';
import { environment } from '../../../../environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RazorpayService } from '../../../service/razorpay.service'
import { TrialSuccessComponent } from '../trial-success/trial-success.component';
import { CommonServiceService } from '../../../service/common-service.service';
import { TransactionFailedComponent } from '../transaction-failed/transaction-failed.component';

declare var Razorpay: any;
@Component({
  selector: 'app-buy-standardplan',
  templateUrl: './buy-standardplan.component.html',
  styleUrls: ['./buy-standardplan.component.scss']
})
export class BuyStandardplanComponent implements OnInit {
  monthly: boolean = true;
  // @Inject(MAT_DIALOG_DATA) data: any;
  state: any = [];
  userForm!: FormGroup
  monthlyAmount: any;
  monthlyName: any;
  yearlyAmount: any;
  yearlyName: any;
  selectedTypeName: any;
  selectedDiscount:number = 0;
  igst: number;
  subscriptionData: any = [];
  selectedAmount: number
  selectedType: string = '1';
  orderId: any;
  discount: any;
  orgId: string;
  cgst_per:number;
  sgst_per:number;
  igst_per:number;
  minUsers:number  = 1;
  UserCount:number = 1
  constructor(
    private api: ApiserviceService,
    private fb: FormBuilder,
    private dialogue: MatDialog,
    private router: Router,
    private razorpay:RazorpayService,
    private modalService:NgbModal,
    private ngZone: NgZone,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private common_service:CommonServiceService
  ) { }
  ngOnInit(): void {
    this.orgId = sessionStorage.getItem('organization_id');
   // console.log(this.data)
    this.monthly = this.data?.selectedValue;
    this.minUsers = this.data.totalPeopleCount;
    if(this.data?.purchasedUsers){
      // console.log('dataaaaa',this.data?.purchasedUsers)
      this.UserCount = this.data?.purchasedUsers
    } else{
      this.UserCount = this.data.totalPeopleCount;
    }
    this.initForm()
    this.getCountry();
    this.getSubscription();
  }

  getSubscription() {
    this.api.getData(`${environment.live_url}/${environment.subscription_list}/`).subscribe((res: any) => {
      if (res) {
        console.log('selected plan', res)
        this.subscriptionData = res;
  
        // Iterate through subscription data
        this.subscriptionData.forEach((subscription) => {
          if (subscription.name === 'Standard' && subscription.plan_details) {
            this.cgst_per = subscription.cgst;
            this.sgst_per = subscription.sgst;
            this.igst_per = subscription.igst;
            subscription.plan_details.forEach((item) => {
              // Check for Monthly or Yearly plans and assign amounts accordingly
              if (item.yearly_or_monthly_name === 'Monthly') {
                this.monthlyAmount = Math.round(item.amount);
                if(this.monthly===true){
                  this.selectedAmount = this.monthlyAmount;
                  this.selectedTypeName = item.yearly_or_monthly_name;
                }
                // const amount = this.selectedAmount || this.monthlyAmount; // Monthly/Yearly price per user
                // const noOfUsers = this.userForm.value.noOfUsers;
                // this.subtotal = noOfUsers * amount;
                this.monthlyName = item.yearly_or_monthly_name;
              } else if (item.yearly_or_monthly_name === 'Yearly') {
                this.yearlyName = item.yearly_or_monthly_name
                let temp_year_amt = item.amount-item.discount/100*item.amount;
                this.yearlyAmount = Math.round(temp_year_amt)
                this.discount = Math.round(item.discount);
                if(this.monthly===false){
                  this.selectedAmount = this.yearlyAmount;
                  this.selectedDiscount = this.yearlyAmount;
                  this.selectedTypeName = item.yearly_or_monthly_name;
                }
              }
              this.calculateSubTotal();
            });
          }
        });
      }
    });
  }
  
  initForm() {
    this.userForm = this.fb.group({
      noOfUsers: [
        this.UserCount,
        [
          Validators.required,
          Validators.min(this.minUsers),
          Validators.max(10000),
          Validators.pattern(/^[1-9][0-9]*$/) // Regex for no spaces, no leading zeros, and only digits
        ]
      ],
      state: ['', Validators.required]
    })
  }

 
  noOfUsers: number = 0;
  subtotal: number = 0;
  cgst: number = 0;
  sgst: number = 0;
  totalPayable: number = 0;
  selectedState: string = 'Karnataka';

  calculateSubTotal(){
    const amount = this.selectedAmount || this.monthlyAmount; // Monthly/Yearly price per user
    const noOfUsers = this.userForm.value.noOfUsers;
    if(this.selectedTypeName==='Yearly'){
      let temp_subTotal = (amount/30)*365*noOfUsers;
      this.subtotal = Number(temp_subTotal.toFixed(2))
    } else{
      let temp_subTotal = noOfUsers * amount;
      this.subtotal = Number(temp_subTotal.toFixed(2))
    }
  }

  calculateTotal(): void {
    this.calculateSubTotal();
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      // this.subtotal = 0;
      this.cgst = 0;
      this.sgst = 0;
      this.totalPayable = 0;
    } else {
      
      if (this.userForm.get('state')?.value === 4026) {
        this.cgst = parseFloat((this.subtotal * (this.cgst_per/100)).toFixed(2)); // CGST with 2 decimal places
        this.sgst = parseFloat((this.subtotal * (this.sgst_per/100)).toFixed(2)); // SGST with 2 decimal places
        let temp_totalPayable = parseFloat((this.subtotal + this.cgst + this.sgst).toFixed(2));
        this.totalPayable = temp_totalPayable // Math.round(temp_totalPayable) // Total payable with 2 decimal places
      } else {
        this.igst = parseFloat((this.subtotal * (this.igst_per/100)).toFixed(2)); // IGST with 2 decimal places
        let temp_totalPayable  = parseFloat((this.subtotal + this.igst).toFixed(2)); 
        this.totalPayable = temp_totalPayable //Math.round(temp_totalPayable)// Total payable with 2 decimal places
      }
    }

  }


  onCancel(): void {
    this.dialogue.closeAll()
  }

  onMakePayment(): void {
    // console.log('Proceeding to payment...');
    // this.dialogue.closeAll()
    //this.payment()
    //this.router.navigate(['/accounts/standardplan-history'])
  }
  setPaymentOption(option: boolean, amount: number, type: string, typeName: string): void {
    this.monthly = option;
    this.selectedAmount = amount
    this.selectedType = type;
    this.selectedTypeName = typeName;
    if(this.selectedTypeName==='Yearly'){
      this.selectedDiscount = this.yearlyAmount;
    } else{
      this.selectedDiscount = 0;
    }
    this.calculateTotal()
  }
  getCountry() {
      this.api.getData(`${environment.live_url}/${environment.country}/`).subscribe((res: any) => {
        console.log(res,'country')
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
  razorpayTest() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
    } else {
      let data = {
        'total_amount': this.totalPayable
      }
      // console.log(data.total_amount)
      this.api.getRazorpayFromData(data).subscribe(
        (res: any) => {
        //  console.log(res)
          if (res) {
            this.openRazorpay(res);
          }
        },
        (error: any) => {
        //  console.log('error', error)
        }
      )
    }
  }

  // openRazorpay(data: any) {
  //   this.dialogue.closeAll()
  //   const RazorpayOptions: any = {
  //     description: 'Sample Rozarpay demo',
  //     currency: 'INR',
  //     amount: data.amount,
  //     name: 'Project Ace',
  //     key: environment.Razorpay_test_key,
  //     //key:'rzp_test_Z6PoT6HRL71TiC',
  //     image: '../assets/images/logo.png',
  //     order_id: data.razor_pay_order_id,
  //     handler: function (response: any): any {
  //       if (response) {
  //         //console.log(response)
  //         successCallback(response)
  //       }
  //     },
  //     modal: {
  //       ondismiss: () => {
  //         // console.log('dismissed')
  //         this.ngZone.run(() => {
  //           this.transactionFailed();
  //         });
  //       }
  //     }

  //   }
  //   const successCallback = (response: any) => {
  //     this.ngZone.run(() => {
  //       const reqData: any = {
  //         razorpay_payment_id: response.razorpay_payment_id,
  //         razorpay_order_id: response.razorpay_order_id,
  //         razorpay_signature: response.razorpay_signature,
  //       };
  //       this.buySubscription(reqData);
  //     });

  //   }
  //   const failureCallback = (e: any) => {
  //     if (e) {
  //       // this.btnEnable = false
  //     }
  //   }

  //   Razorpay.open(RazorpayOptions, successCallback)
  // }

  openRazorpay(data: any) {
    this.dialogue.closeAll();

    const RazorpayOptions: any = {
      description: 'Sample Razorpay Demo',
      currency: 'INR',
      amount: data.amount,
      name: 'Project Ace',
      key: environment.Razorpay_test_key, // Ensure you use rzp_live_xxxxx for production
      image: '../assets/images/logo.png',
      order_id: data.razor_pay_order_id,
      handler: (response: any) => {
        this.ngZone.run(() => {
          this.successCallback(response);
        });
      },
      modal: {
        ondismiss: () => {
          this.ngZone.run(() => {
            this.transactionFailed();
          });
        }
      }
    };

    const rzp1 = new Razorpay(RazorpayOptions);

    rzp1.on('payment.failed', (response: any) => {
      console.error('Payment Failed:', response);
    });

    rzp1.open();
  }

  successCallback(response: any) {
    this.ngZone.run(() => {
      const reqData: any = {
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
      };
      this.buySubscription(reqData);
    });
  }

  buySubscription(datas: any) {
    let subscription_type: number;
    let plan_type: number;
    this.subscriptionData?.forEach((item1: any) => {
      if (item1.name === 'Standard' && item1.plan_details) {
        subscription_type = item1.id;
        item1['plan_details'].forEach((item2: any) => {
          if (item2.yearly_or_monthly_name === this.selectedTypeName) {
         //   console.log(item2)
            plan_type = item2.id;
          }
        })

      }
    })
    let data = {
      "organization": this.orgId,
      "subscription_type": subscription_type,
      "plan_type": plan_type,
      "razorpay_payment_id": datas.razorpay_payment_id,
      "razorpay_order_id": datas.razorpay_order_id,
      "razorpay_signature": datas.razorpay_signature,
      "total_amount": this.totalPayable,
      "initial_amount": this.subtotal,
      "cgst": this.cgst != 0 ? this.cgst : null,
      "igst": this.igst != 0 ? this.igst : null,
      "sgst": this.sgst != 0 ? this.sgst : null,
      "discounted_amount": this.selectedDiscount!= 0 ? this.selectedDiscount : null,
      "added_users": this.userForm.value.noOfUsers,
      "state": this.userForm.value.state
    }
   // console.log(data)
    this.api.postStandardPlan(data).subscribe(
      (res: any) => {
        if (res) {
            this.ngZone.run(() => {
              this.openDialogue(res.message)
            });
        }
      }, 
      (error:any)=>{
       // console.log(error);
        this.api.showError(error.error.message);
      }
    )
  }

  openDialogue(msg) {
    const modelRef = this.modalService.open(TrialSuccessComponent, {
      size: <any>'sm',
      backdrop: true,
      centered: true
    });
    modelRef.componentInstance.title = `${msg}!`;
    modelRef.componentInstance.message = `Transaction Successful!`;
    modelRef.componentInstance.status.subscribe(resp => {
      if (resp === "ok") {
        this.common_service.subsctiptionState$.next(true)
        this.api.setComponentLoadedStatus(true);
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
