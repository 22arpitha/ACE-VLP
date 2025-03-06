import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonServiceService } from '../../../service/common-service.service';
import { BuyStandardplanComponent } from '../buy-standardplan/buy-standardplan.component';
import { MatDialog } from '@angular/material/dialog';
import { ExistStandardPlanComponent } from '../exist-standard-plan/exist-standard-plan.component';
import { ApiserviceService } from '../../../service/apiservice.service';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { CancelSubscriptionComponent } from '../cancel-subscription/cancel-subscription.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { HelpTextComponent } from '../help-text/help-text.component';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';

@Component({
  selector: 'app-success-plan-details',
  templateUrl: './success-plan-details.component.html',
  styleUrls: ['./success-plan-details.component.scss']
})
export class SuccessPlanDetailsComponent implements OnInit {
  @ViewChild('invoiceTemplate', { static: false }) invoiceTemplate!: ElementRef;
  BreadCrumbsTitle: any = 'Subscription plan';
  subscriptionData: Object;
  @Input() data: any;
  @Input() my_subscription: any;
  @Input() selectedPlanDetails: any;
  @Output() successEmit = new EventEmitter<any>();
  monthlyAmount: any;
  totalPeopleCount:number
  yearlyAmount: any;
  discount: any;
  isLoading: boolean = true;
  transactionData: any;
  tableSize = 5;
  tableSizes = [5, 10, 25, 50, 100];
  page: any;
  count: any;
  organizationId: string;
  mySubscriptionData: any;
  showRenewalButton: boolean = false;
  disableCancelButton: boolean = false;
  disableAddButton: boolean = false;
  discounted_amount: any;
  constructor(
    private common_service: CommonServiceService,
    private dialog: MatDialog,
    private api: ApiserviceService,
    private router: Router,
    private modalService: NgbModal,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.organizationId = sessionStorage.getItem('organization_id')!;
    this.getSubscription(this.data);
    let query = `page=${1}&page_size=${this.tableSize}`
    this.getTransactionHistory(query)
    this.mySubscriptionData = this.my_subscription
    this.mySubscriptionData.forEach((element1) => {
      if (element1.subscription_type_name === 'Standard') {
        this.totalPeopleCount = element1.added_users
        this.expiryBtnValidation(element1.expiry_date,element1.remaining_number_of_days,element1.is_renewed);
      }
    });
  }
  ngOnChanges() {
    this.mySubscriptionData = this.my_subscription
    //console.log('freeeee', this.mySubscriptionData)

  }
  expiryBtnValidation(expiry_date, remaining_number_of_days,is_renewed) {
    // const endDate = this.datePipe.transform(expiry_date,'dd-MM-yyyy')
    // const currentDate = this.datePipe.transform(new Date(),'dd-MM-yyyy')
    //console.log(is_renewed)
    const endDate = new Date(expiry_date);
    const currentDate = new Date();
    endDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);
    // console.log(endDate, currentDate)
    if(is_renewed==true){
      this.disableCancelButton = false;
      this.disableAddButton = false;
      this.showRenewalButton = true;
    } else{
        if (endDate < currentDate) {
         // console.log('date expired')
          this.disableCancelButton = true;
          this.disableAddButton = true;
          this.showRenewalButton = false;
        } 
        else if (endDate.getTime() >= currentDate.getTime()){
          // const remainingDays = Math.ceil((new Date(expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          // const remainingDays = Math.ceil(diffInTime / (1000 * 60 * 60 * 24));

          if (remaining_number_of_days <= 5) {
           // console.log('less or equal to 5', remaining_number_of_days)
            this.disableCancelButton = false;
            this.disableAddButton = false;
            this.showRenewalButton = false;
          } else {
           // console.log('more than 5', remaining_number_of_days)
            this.disableCancelButton = false;
            this.disableAddButton = false;
            this.showRenewalButton = true;
          }
       }
      }
  }
  cancelSubscription(event) {
    const modelRef = this.modalService.open(CancelSubscriptionComponent, {
      size: <any>'sm',
      backdrop: true,
      centered: true
    });
    modelRef.componentInstance.title = `Are you sure about cancelling your subscription?`;
    modelRef.componentInstance.subtitle = `Suspending this account will also deactivate all associated user accounts.`;
    modelRef.componentInstance.message = `Subscription Cancellation`;
    modelRef.componentInstance.status.subscribe(resp => {
      if (resp == "ok") {
        this.cancelExistPlan(event)

        modelRef.close();
      }
      else {
        modelRef.close();
      }
    })
  }
  cancelExistPlan(subscription) {
    const data = {
      organization: this.organizationId,
      subscription_id: subscription.id
    }
    this.api.postData(`${environment.live_url}/${environment.cancel_my_subscription}/`, data).subscribe((res) => {
      if (res) {
        this.common_service.setSubscriptionStatus(true)
        this.successEmit.emit(true)
        this.api.showSuccess(`Subscription cancelled successfully`)

      }
    }, (err) => {
      this.api.showError(err?.error?.message)
    })
  }

  addNewUser(plan_data: any) {
    console.log(plan_data)
    const dialogRef = this.dialog.open(ExistStandardPlanComponent, {
      data: { plan: plan_data },
      panelClass: 'custom-dialog'
    });
    dialogRef.disableClose = true
    
  }
  async renewSubscription(plan: any) {
    const modalRef = await this.modalService.open(HelpTextComponent, {
              size: <any>'sm',
              backdrop: true,
              centered: true,
            });
        
            modalRef.componentInstance.status.subscribe((resp: any) => {
              if (resp === "ok") {
                const dialogRef = this.dialog.open(BuyStandardplanComponent, {
                data: {selectedValue: true,'totalPeopleCount':this.totalPeopleCount,'purchasedUsers':plan.max_user},
                panelClass: 'custom-dialog'
              });
              dialogRef.disableClose = true
              }
              modalRef.close();
            });

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
            this.discounted_amount = item.discounted_amount;
          }
        });
      }
    });

  }
  onTableDataChange(event: any) {
    this.page = event;
    let query = `page=${this.page}&page_size=${this.tableSize}`

    this.getTransactionHistory(query)
  }
  onTableSizeChange(event: any): void {
    if (event) {

      this.tableSize = Number(event.value);
      let query = `page=${1}&page_size=${this.tableSize}`

      this.getTransactionHistory(query)
    }
  }

  getTransactionHistory(query) {
    if (this.organizationId) {
      this.api.getData(`${environment.live_url}/${environment.transaction_history}/?organization=${this.organizationId}&${query}`).subscribe((res) => {
        if (res && res?.['results']) {
          this.transactionData = res?.['results']?.map((item, index) => ({
            slNo: index + 1,
            plan: item.subscribed_organization__subscription_type__name,
            term: item.terms,
            perUser:item.per_user_amount || 0,
            id: item.id,
            users: item.number_of_users || 'NA',
            totalAmount: item.total_amount,
            startDate: this.datePipe.transform(item.subscribed_organization__start_date, 'dd-MM-yyyy'),
            endDate: this.datePipe.transform(item.subscribed_organization__expiry_date, 'dd-MM-yyyy'),
          }));

          this.isLoading = false; // Stop loading state
          this.count = res?.['total_no_of_record']
        }
      })
    }
  }

  // selectedInvoiceData:any
  // downloadInvorice(data:any): void {
  //   const invoiceElement = document.getElementById('invoiceTemplate');
  //   console.log(data)
  //   this.selectedInvoiceData
  //   setTimeout(() => {
  //     if (invoiceElement) {
  //       invoiceElement.style.display = 'block';

  //       html2canvas(invoiceElement, {
  //         scale: 2,
  //         useCORS: true,
  //         logging: false,
  //       }).then((canvas) => {
  //         const imgData = canvas.toDataURL('image/png');
  //         const pdf = new jsPDF('p', 'mm', 'a4');
  //         const imgWidth = 210;
  //         const imgHeight = (canvas.height * imgWidth) / canvas.width;

  //         pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  //         pdf.save('invoice.pdf');
  //         invoiceElement.style.display = 'none';
  //       }).catch((error) => {
  //         console.error('Error generating PDF:', error);
  //       });
  //     } else {
  //       console.error('Invoice template not found!');
  //     }
  //   }, 1000);
  // }

  downloadInvoice(id:any){
    fetch(`${environment.live_url}/invoice/${id}/`)
    .then(res => res.blob())
    .then(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `invoice_${id}.pdf`;
      a.click();
    });
  }

}




