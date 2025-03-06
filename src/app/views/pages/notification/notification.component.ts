import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiserviceService } from '../../../service/apiservice.service';
import { environment } from '../../../../environments/environment';
import { NotificationService } from './notification.service';
import { SubModuleService } from '../../../service/sub-module.service';
import { forkJoin, map, of } from 'rxjs';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  notes: any = [];
  page_size: number = 6;
  user_id: any;
  user_role_name: any;
  totalCount: any;
  @Output() status: EventEmitter<any> = new EventEmitter<any>();

  displayedNotifications$: any[] = [];
  disabledView: boolean = false;
  private timeoutId: any;
  isFetching: boolean ;
 // seenNotification: any = [];

  constructor(
    private modal: NgbModal,
    private api: ApiserviceService,
    private notificationService: NotificationService,
    private subModuleService:SubModuleService
  ) {
    this.user_id = sessionStorage.getItem('user_id');
    this.user_role_name = (sessionStorage.getItem('user_role_name'))?.toUpperCase();
  }

  
  closeBtn() {
    this.status.emit('ok');
    this.modal.dismissAll();
    // Stop the auto-marking timer when closing modal
    clearTimeout(this.timeoutId); 
  }

  ngOnInit() {
    this.getNotification(this.page_size, 'init');
    // Automatically mark unseen notifications (without redirect_url) as seen after 5 seconds
    this.timeoutId = setTimeout(() => {
      this.markUnseenWithoutRedirectAsSeen();
    }, 5000);
  }
  checkUrlAvailabilty(url: string) {
  if (url) {
    this.closeBtn();
  }
  }
  
   // Fetch notifications
   
  // getNotification(page_size: number, type: string) {
  //   if (type === 'viewmore') {
  //     this.page_size += page_size;
  //   }

  //   if (this.page_size > this.totalCount + 5) {
  //     this.disabledView = true;
  //     return;
  //   }

  //   let params = `${environment.live_url}/${environment.notification}/?user-id=${this.user_id}&page=1&page_size=${this.page_size}`;
  //   this.disabledView = false;

  //   this.api.getData(params).subscribe(
  //     (res: any) => {
  //       if (res.results) {
  //         this.displayedNotifications$ = res.results;
  //         // this.displayedNotifications$ = this.displayedNotifications$.map((n: any) => {
  //         //   n.text.redirect_url 
  //         // });
  //         // notification?.text?.redirect_url
  //         this.subModuleService.getAccessForActiveUrl(this.user_id,'/dashboard').subscribe((access: any) => {
  //           console.log(access)
  //         })
  //       }
  //     },
  //     (error: any) => {
  //       this.api.showError(error?.error?.message);
  //     }
  //   );
  // }

  // getNotification(page_size: number, type: string) {
  //   if (type === 'viewmore') {
  //     this.page_size += page_size;
  //   }
  
  //   if (this.page_size > this.totalCount + 5) {
  //     this.disabledView = true;
  //     return;
  //   }
  
  //   let params = `${environment.live_url}/${environment.notification}/?user-id=${this.user_id}&page=1&page_size=${this.page_size}`;
  //   this.disabledView = false;
  
  //   this.api.getData(params).subscribe(
  //     (res: any) => {
  //       if (res.results) {
  //          this.totalCount =res.total_no_of_record;
  //         if(this.user_role_name === 'EMPLOYEE'){

          
  //         let notifications = res.results;
 
  //         // Create an array of observables to check access for each notification's URL
  //         let accessChecks = notifications.map((notification: any) => {
  //           let redirectUrl = notification?.text?.redirect_url;
  //           if (redirectUrl) {
  //             return this.subModuleService.getAccessForActiveUrl(this.user_id, redirectUrl).pipe(
  //               map((access: any) => {
  //                 const hasViewAccess = access?.operations?.some((op: any) => op.view === true);
  //                 notification.text.redirect_url = hasViewAccess ? redirectUrl : null;
  //                 return notification;
  //               })
  //             );
  //           } else {
  //             return of(notification); // If no redirect_url, return as is
  //           }
  //         });
  
  //         // Execute all access checks and update notifications
  //         forkJoin(accessChecks).subscribe((updatedNotifications: any) => {
  //           this.displayedNotifications$ = updatedNotifications;
  //         });
  //       }else{
  //         this.displayedNotifications$ = res.results;
  //       }
  //     }
  //     },
  //     (error: any) => {
  //       this.api.showError(error?.error?.message);
  //     }
  //   );
  // }
  getNotification(page_size: number, type: string) {
    if (type === 'viewmore') {
      this.page_size += page_size;
    }
  
    let params = `${environment.live_url}/${environment.notification}/?user-id=${this.user_id}&page=1&page_size=${this.page_size}`;
    
    this.api.getData(params).subscribe(
      (res: any) => {
        if (res.results) {
          this.totalCount = res.total_no_of_record;
          this.notificationService.notificationCount.next(res?.seen_and_unseen_data?.total_is_not_seen)
          if (this.user_role_name === 'EMPLOYEE') {
            let notifications = res.results;
            
            // Extract unique redirect URLs (remove duplicates)
            let uniqueUrls:any = [...new Set(notifications.map(n => n?.text?.redirect_url).filter(url => !!url))];
  
            if (uniqueUrls.length > 0) {
              // Call access API for each unique URL and store results
              let accessRequests = uniqueUrls.map(url =>
                this.subModuleService.getAccessForActiveUrl(this.user_id, url).pipe(
                  map((access: any) => ({
                    url,
                    hasAccess: access?.operations?.some((op: any) => op.view === true)
                  }))
                )
              );
  
              // Execute all requests in parallel
              forkJoin(accessRequests).subscribe((accessResults: any) => {
                let accessMap = new Map<string, boolean>();
                accessResults.forEach(result => accessMap.set(result.url, result.hasAccess));
  
                // Update notifications with access check
                notifications.forEach(notification => {
                  let redirectUrl = notification?.text?.redirect_url;
                  if (redirectUrl) {
                    notification.text.redirect_url = accessMap.get(redirectUrl) ? redirectUrl : null;
                  }
                });
  
                this.displayedNotifications$ = notifications;
              
              });
            } else {
              // If no URLs exist, update notifications directly
              this.displayedNotifications$ = notifications;
              this.disabledView = false;
            }
          } else {
            this.displayedNotifications$ = res.results;
            this.disabledView = false;
          }
        }
      },
      (error: any) => {
        this.api.showError(error?.error?.message);
      }
    );
  }
  
 
   //* Mark a single notification as read
   
  markAsRead(notification: any) {
    if (notification.is_seen) return; // **Don't call API if already seen**
    const data = { is_seen: true, id: [notification.id],user_id: this.user_id };
    let params = `${environment.live_url}/${environment.update_notification}/`;

    this.api.postData(params, data).subscribe(
      (res:any) => {
        this.notificationService.notificationCount.next(res?.seen_and_unseen_data?.total_is_not_seen)
        // Update UI immediately without API call
        this.displayedNotifications$ = this.displayedNotifications$.map(n =>
          n.id === notification.id ? { ...n, is_seen: true } : n
        );
      },
      (error: any) => {
        this.api.showError(error?.error?.message);
      }
    );
  }

 
 // * Handle notification click (mark as read if required)
  
  async handleNotificationClick(notification: any) {
    await this.markAsRead(notification); // Call only if not already seen
    await this.checkUrlAvailabilty(notification?.text?.redirect_url)
  }

 
   //* Auto-mark unseen notifications **without** a redirect_url after 5 seconds
  
  markUnseenWithoutRedirectAsSeen() {
    const unseenNotifications = this.displayedNotifications$.filter(n => !n.is_seen && !n.text?.redirect_url);
    if (unseenNotifications.length === 0) return; // **Don't call API if all are already seen or have URLs**
    const ids = unseenNotifications.map(n => n.id);
   
    const data = { is_seen: true, id: ids,user_id: this.user_id};
    let params = `${environment.live_url}/${environment.update_notification}/`;

    this.api.postData(params, data).subscribe(
      (res: any) => {
        this.notificationService.notificationCount.next(res?.seen_and_unseen_data?.total_is_not_seen)
        // Update UI immediately without another API call
        this.displayedNotifications$ = this.displayedNotifications$.map(n =>
          !n.is_seen && !n.text?.redirect_url ? { ...n, is_seen: true } : n
        );
      },
      (error: any) => {
        this.api.showError(error?.error?.message);
      }
    );
  }
}
