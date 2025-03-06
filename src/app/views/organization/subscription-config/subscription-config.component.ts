import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CommonServiceService } from '../../../service/common-service.service';
import { ApiserviceService } from '../../../service/apiservice.service';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-subscription-config',
  templateUrl: './subscription-config.component.html',
  styleUrls: ['./subscription-config.component.scss']
})
export class SubscriptionConfigComponent implements OnInit {
  BreadCrumbsTitle:any='Subscription Configuration';
  pricingForm: FormGroup;
  subscriptionDetails: boolean = false;
  planType: any;

  constructor(
    private fb: FormBuilder,
    private common_service: CommonServiceService,
    private api: ApiserviceService) {
   
  }
  initializeForm(){
    this.pricingForm = this.fb.group({
      // Free Trial
      freeTrialUsers: [
        '',
        [Validators.required, Validators.pattern('^[0-9]*$'), Validators.maxLength(10)],
      ],
      freeTrialDuration: [
        '',
        [Validators.required, Validators.pattern('^[0-9]*$'), Validators.maxLength(10)],
      ],

      // Standard Plan - Monthly
      monthlyUsers: [
        '',
        [Validators.pattern('^[0-9]*$'), Validators.maxLength(10)],
      ],
      monthlyAmount:['',[Validators.required, Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$'), Validators.maxLength(10)]],
      monthlyDuration: [
        '',
        [Validators.required, Validators.pattern('^[0-9]*$'), Validators.maxLength(3)],
      ],

      // Standard Plan - Yearly
      yearlyUsers: [
        '',
        [Validators.pattern('^[0-9]*$'), Validators.maxLength(10)],
      ],
      yearlyAmount:['',[Validators.required, Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$'), Validators.maxLength(10)]],
      yearlyDuration: [
        '',
        [Validators.required, Validators.pattern('^[0-9]*$'), Validators.maxLength(3)],
      ],
      yearlyDiscount: [
        '',
        [Validators.required, Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$'), Validators.maxLength(6)],
      ],
      discounted_amount:[''],
      // GST Details
      cgstKarnataka: [
        '',
        [Validators.required, Validators.pattern('^[0-9]*$'), Validators.maxLength(3)],
      ],
      sgstKarnataka: [
        '',
        [Validators.required, Validators.pattern('^[0-9]*$'), Validators.maxLength(3)],
      ],
      igstOtherStates: [
        '',
        [Validators.required, Validators.pattern('^[0-9]*$'), Validators.maxLength(3)],
      ],
    });
    this.subscribeToYearlyCalculations();
  }

  subscribeToYearlyCalculations() {
    const yearlyAmountControl = this.pricingForm.get('yearlyAmount');
    const yearlyDiscountControl = this.pricingForm.get('yearlyDiscount');
  
    if (yearlyAmountControl && yearlyDiscountControl) {
      yearlyAmountControl.valueChanges.subscribe(() => this.calculateDiscountedAmount());
      yearlyDiscountControl.valueChanges.subscribe(() => this.calculateDiscountedAmount());
    }
  }
  
  calculateDiscountedAmount() {
   
    const yearlyAmount = +this.pricingForm.get('yearlyAmount')?.value ; // Get the yearly amount, default to 0
    const yearlyDiscount = +this.pricingForm.get('yearlyDiscount')?.value; // Get the discount as a percentage, default to 0
    if(yearlyAmount && yearlyDiscount){
      
    // Calculate the discounted amount
    const discountedAmount = yearlyAmount - (yearlyAmount * (yearlyDiscount / 100));
  
    // Always round up to the next whole number
    const roundedAmount = Math.ceil(discountedAmount);
  
    // Patch the calculated value into the form control
    this.pricingForm.patchValue({ discounted_amount: roundedAmount });
    }
  }
  
  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.initializeForm()
    this.getSubscriptionDetails()
  }
get f (){
  return this.pricingForm.controls;
}
  // On form submission
  onSubmit() {
    if (this.pricingForm.invalid) {
      return;
    }
    this.api.getData(`${environment.live_url}/${environment.plan_types}/`).subscribe((res: any) => {
      if (res?.data) {
        this.planType = this.swapKeysAndValues(res.data);
        const payload = this.preparePayload(this.planType);

  
    this.api.postData(`${environment.live_url}/${environment.configure_subscription}/`,payload).subscribe(
      (response) => {
        this.api.showSuccess('Subscription details saved successfully');
        this.getSubscriptionDetails();
      },
      (error) => {
        this.api.showError(error?.error?.message);
      }
    );
    }
  });
  }
  
  
getSubscriptionDetails() {
  this.api.getData(`${environment.live_url}/${environment.configure_subscription}/`).subscribe(
    (response) => {
      if (response?.['subscription_details']) {
        const subscriptionDetails = response['subscription_details'];

        // Find Free Trial details
        const freeTrial = subscriptionDetails.find(sub => sub.name === 'Free Trial');
        const freeTrialPlan = freeTrial?.plan_details?.find(plan => plan.yearly_or_monthly_name === 'Free Plan');

        // Find Standard Plan details
        const standardPlan = subscriptionDetails.find(sub => sub.name === 'Standard');
        const monthlyPlan = standardPlan?.plan_details?.find(plan => plan.yearly_or_monthly_name === 'Monthly');
        const yearlyPlan = standardPlan?.plan_details?.find(plan => plan.yearly_or_monthly_name === 'Yearly');

        // Patch the form values
        this.pricingForm.patchValue({
          // Free Trial
          freeTrialUsers: freeTrialPlan?.users ,
          freeTrialDuration: freeTrialPlan?.no_of_days,

          // Standard Plan - Monthly
          monthlyUsers: monthlyPlan?.users,
          monthlyAmount: monthlyPlan?.amount,
          monthlyDuration: monthlyPlan?.no_of_days,

          // Standard Plan - Yearly
          yearlyUsers: yearlyPlan?.users,
          yearlyAmount: yearlyPlan?.amount,
          yearlyDuration: yearlyPlan?.no_of_days,
          yearlyDiscount: yearlyPlan?.discount,

          // GST Details
          cgstKarnataka: standardPlan?.cgst,
          sgstKarnataka: standardPlan?.sgst,
          igstOtherStates: standardPlan?.igst
        });
      }
    },
    (error) => {
      this.api.showError(error?.error?.message);
    }
  );
}
getPlanDetails() {
 
  return this.planType;
}

swapKeysAndValues(obj: { [key: string]: any }): { [key: string]: any } {
  const swapped: { [key: string]: any } = {};
  Object.entries(obj).forEach(([key, value]) => {
    swapped[value as string] = key;
  });
  return swapped;
}

  // Map the form data to the payload structure
  preparePayload(event) {
    console.log(event)
    const formValues = this.pricingForm.value;
   
    return {
      subscription_details: [
        {
          name: 'Free Trial',
          plan_details: [
            {
              plan_type: event['Free Plan'],
              max_users: formValues.freeTrialUsers,
              no_of_days: formValues.freeTrialDuration,
              amount: 0
            }
          ]
        },
        {
          name: 'Standard',
          plan_details: [
            {
              plan_type: event['Monthly'],
              max_users: formValues.monthlyUsers || 0,
              no_of_days: formValues.monthlyDuration,
              amount: formValues.monthlyAmount  // Assuming amount is 30 for monthly
            },
            {
              plan_type: event['Yearly'],
              max_users: formValues.yearlyUsers || 0,
              no_of_days: formValues.yearlyDuration,
              amount: formValues.yearlyAmount,  // Assuming amount is 25 for yearly
              discount: formValues.yearlyDiscount,
              discounted_amount:formValues.discounted_amount
            }
          ]
        }
      ],
      cgst: formValues.cgstKarnataka,
      igst: formValues.igstOtherStates,  // Assuming IGST is null based on your structure
      sgst: formValues.sgstKarnataka
    };
  }

}
