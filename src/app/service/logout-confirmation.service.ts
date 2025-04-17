import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LogoutConfirmationService {
  private isLogoutConfirmed: boolean = false;

  setLogoutConfirmed(status: boolean): void {
    this.isLogoutConfirmed = status;
  }

  getLogoutConfirmed(): boolean {
    return this.isLogoutConfirmed;
  }

  resetLogoutConfirmed(): void {
    this.isLogoutConfirmed = false;
  }
}
