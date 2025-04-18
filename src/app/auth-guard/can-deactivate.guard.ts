import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import {LogoutConfirmationService} from '../service/logout-confirmation.service';
export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}
@Injectable({
  providedIn: 'root',
})
export class CanDeactivateGuard implements CanDeactivate<CanComponentDeactivate> {
  constructor(private logoutConfirmationService: LogoutConfirmationService) {}
  canDeactivate(component: CanComponentDeactivate): Observable<boolean> | Promise<boolean> | boolean {
  // Check if logout is confirmed
  console.log(this.logoutConfirmationService.getLogoutConfirmed());
  if (this.logoutConfirmationService.getLogoutConfirmed()) {
    // If logout is confirmed, bypass the canDeactivate check
    return true;
  }

  // If logout is not confirmed, proceed with canDeactivate() check
  return component.canDeactivate ? component.canDeactivate() : true;
  }
}
