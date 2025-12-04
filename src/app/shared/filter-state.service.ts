// import { Injectable } from '@angular/core';
// import { BehaviorSubject } from 'rxjs';
// import { Router } from '@angular/router';

// @Injectable({
//   providedIn: 'root'
// })
// export class FilterStateService {
//  getKey(url: string): string {
//     const module = url.split('/')[1];
//     return module + '_state';
//   }

//   saveState(url: string, state: any) {
//     const key = this.getKey(url);
//     localStorage.setItem(key, JSON.stringify(state));
//   }

//   loadState(url: string): any {
//     const key = this.getKey(url);
//     const raw = localStorage.getItem(key);
//     return raw ? JSON.parse(raw) : null;
//   }

//   clearState(url: string) {
//     const key = this.getKey(url);
//     localStorage.removeItem(key);
//   }
// }
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

  /** Extract module name: /jobs/create → "jobs" */
  private extractModuleKey(url: string): string {
    const clean = url.split('?')[0].split('/');
    return clean[1] || ''; 
  }

  /** Triggered whenever route changes */
  private checkModuleChange(newUrl: string) {
    const newModule = this.extractModuleKey(newUrl);

    if (newModule !== this.moduleKey) {
      // ✔ RESET OLD MODULE STATE when switching modules
      localStorage.removeItem(this.moduleKey + '_state');

      // ✔ Clear BehaviorSubject for this module
      this.stateSubject.next(null);

      // ✔ Switch to new module
      this.moduleKey = newModule;

      // ✔ Load new module state (if exists)
      const stored = this.getSavedState();
      if (stored) this.stateSubject.next(stored);
    }
  }

  /** SAVE STATE for the active module */
  saveState(state: any) {
    this.stateSubject.next(state);
    localStorage.setItem(this.moduleKey + '_state', JSON.stringify(state));
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

  private getSavedState() {
    const raw = localStorage.getItem(this.moduleKey + '_state');
    return raw ? JSON.parse(raw) : null;
  }
}
