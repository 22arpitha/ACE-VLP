import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class FilterStateService {

  private moduleKey = '';
  private stateSubject = new BehaviorSubject<any>(null);
  state$ = this.stateSubject.asObservable();

  constructor(private router: Router) {
    // Initial module
    this.moduleKey = this.extractModuleKey(this.router.url);

    // Load saved state for first load
    const initial = this.getSavedState();
    if (initial) this.stateSubject.next(initial);

    // WATCH FOR ROUTE CHANGES
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.checkModuleChange(event.urlAfterRedirects);
      }
    });
  }

  private extractModuleKey(url: string): string {
    const clean = url.split('?')[0].split('/');
    return clean[1] || ''; 
  }

  /** Triggered whenever route changes */
  private checkModuleChange(newUrl: string) {
    const newModule = this.extractModuleKey(newUrl);

    if (newModule !== this.moduleKey) {
      //  RESET OLD MODULE STATE when switching modules
      sessionStorage.removeItem(this.moduleKey + '_state');
      // sessionStorage.removeItem(this.getUserKey());

      //  dlear BehaviorSubject for this module
      this.stateSubject.next(null);

      //  Switch to new module
      this.moduleKey = newModule;

      //  Load new module state (if exists)
      const stored = this.getSavedState();
      if (stored) this.stateSubject.next(stored);
    }
  }

  /** SAVE STATE for the active module */
  saveState(state: any) {
    this.stateSubject.next(state);
    sessionStorage.setItem(this.moduleKey + '_state', JSON.stringify(state));
    // sessionStorage.setItem(this.getUserKey(), JSON.stringify(state));
  }

  /** LOAD STATE when component initializes */
  loadState(): any {
    const current = this.stateSubject.value;
    if (current) return current;

    const stored = this.getSavedState();
    if (stored) {
      this.stateSubject.next(stored);
      return stored;
    }

    return null;
  }
  
    private getUserKey(): string {
      const userId = sessionStorage.getItem('user_id') || 'guest';
      return `${this.moduleKey}_state_${userId}`;
    }

  private getSavedState() {
    const raw = sessionStorage.getItem(this.moduleKey + '_state');
    // const raw = sessionStorage.getItem(this.getUserKey())
    return raw ? JSON.parse(raw) : null;
  }
}
