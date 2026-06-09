import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiserviceService } from '../../service/apiservice.service';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../pages/notification/notification.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  displayedNotifications$: any[] = [];
  resDataList: any;
  user_id: any;
  page = 1;
  page_size = 10;
  listOfNotification:any=[];
  constructor(
    private modal: NgbModal,
    private api: ApiserviceService,
    private notificationService: NotificationService
  ) {
    this.user_id = sessionStorage.getItem('user_id');
   }

  ngOnInit(): void {
    this.getNotification(this.page,'init')
    setTimeout(() => {
          this.updateNotificationCount();
          // this.getUpdatedCount();
        }, 1000);
  }

  closeBtn() {
    // this.status.emit('ok');
    this.modal.dismissAll();
    // // Stop the auto-marking timer when closing modal
    // clearTimeout(this.timeoutId); 
  }

  getNotification(page_size: number, type: string) {
     if (type === 'viewmore') {
      console.log(page_size)
      this.page_size += page_size;
      // this.page++;
    }
    this.api.getData(`${environment.live_url}/${environment.vlp_notifications}/?user-id=${this.user_id}&page=${this.page}&page_size=${this.page_size}`).subscribe(
      (res:any)=>{
        this.listOfNotification = res?.results;
        this.resDataList = res;
      },
      (error:any)=>{
        console.log(error)
      }
    )
    
  }

  updateNotificationCount(){
    let data = {
     'user-id': this.user_id,
    } 
    if(this.resDataList?.unread_count > 0){
      this.api.postData(`${environment.live_url}/${environment.read_notification}/`, data).subscribe(
        (res:any)=>{
          this.getUpdatedCount();
        },
        (error:any)=>{
          console.log(error)
        }
      )
    }
  }
  getUpdatedCount() {
    this.api.getData(`${environment.live_url}/${environment.vlp_notifications}/?user-id=${this.user_id}&page=${this.page}&page_size=${this.page_size}`).subscribe(
      (res:any)=>{ 
        this.notificationService.setNotificationCount(res?.unread_count);
       },
       (error:any)=>{
          console.log(error)
       }
    )}

  async handleNotificationClick(notification: any) {
    // await this.markAsRead(notification); // Call only if not already seen
    // await this.checkUrlAvailabilty(notification?.text?.redirect_url)
  }
}
