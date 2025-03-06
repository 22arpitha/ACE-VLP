import { Injectable } from '@angular/core';

declare var Razorpay: any; // Declare Razorpay as a global object

@Injectable({
  providedIn: 'root'
})
export class RazorpayService {

  constructor() {
    // Optionally check if Razorpay is already loaded
    if (typeof Razorpay === 'undefined') {
      console.error('Razorpay script not loaded.');
    }
  }

  initiatePayment(options: any): void {
    if (typeof Razorpay === 'undefined') {
      console.error('Razorpay script not loaded.');
      return; // Prevent further execution if Razorpay is not loaded
    }

    // Initialize Razorpay and open the payment window
    const rzp = new Razorpay(options);
    // console.log('checking razorpay',rzp.open())
    rzp.open();
  }
}