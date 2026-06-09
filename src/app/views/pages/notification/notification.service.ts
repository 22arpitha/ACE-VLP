import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  notificationCount = new BehaviorSubject(0);

  setNotificationCount(count: number) {
    this.notificationCount.next(count);
  }
}
