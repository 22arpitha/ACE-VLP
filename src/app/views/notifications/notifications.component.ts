import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiserviceService } from '../../service/apiservice.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  displayedNotifications$: any[] = [];
  totalCount: any;
  user_id: any;
  page = 1;
  page_size = 10;
  listOfNotification:any=[];
  constructor(
    private modal: NgbModal,
    private api: ApiserviceService,
  ) {
    this.user_id = sessionStorage.getItem('user_id');
   }

  ngOnInit(): void {
    this.getNotification(this.page,'init')
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
        console.log(res);
        this.listOfNotification = res?.results;
        this.totalCount = res.total_no_of_record;
      },
      (error:any)=>{
        console.log(error)
      }
    )
  }

  async handleNotificationClick(notification: any) {
    // await this.markAsRead(notification); // Call only if not already seen
    // await this.checkUrlAvailabilty(notification?.text?.redirect_url)
  }
}
