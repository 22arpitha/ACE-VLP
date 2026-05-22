import { Injectable } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { ErrorStateMatcher } from '@angular/material/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';

export interface PaginatedDropdownState {
  page: number;
  list: any[];
  search: string;
  totalPages: number;
  loading: boolean;
  initialized: boolean;
}

@Injectable({ providedIn: 'root' })
export class MatAutocompleteService {

  // ─── Display Functions ───────────────────────────────────────────────────────

  /**
   * @example
   *   // Single field
   *   displayClientFn = this.autoSvc.createDisplayFn('client_name');
   *
   *   // Multiple fallback fields
   *   displayEndClientFn = this.autoSvc.createDisplayFn(['client_name', 'end_client_name']);
   */
  createDisplayFn(displayFields: string | string[]): (item: any) => string {
    const fields = Array.isArray(displayFields) ? displayFields : [displayFields];
    // console.log('Creating display function for fields:', fields);
    return (item: any): string => {
      if (!item) return '';
      if (typeof item === 'string') return item;
      for (const field of fields) {
        if (item[field]) return item[field];
      }
      return '';
    };
  }

  // ─── Local (Non-paginated) Filtering ────────────────────────────────────────

  /**
   * Filters a pre-loaded list by a search string against one or more display fields.
   * Returns a copy of the full list when `searchText` is blank.
   *
   * @param list          Source array.
   * @param searchText    User-typed search string.
   * @param displayFields Field(s) to match against.
   */
  filterLocalList(list: any[], searchText: string, displayFields: string | string[]): any[] {
    const fields = Array.isArray(displayFields) ? displayFields : [displayFields];
    if (!searchText?.trim()) return [...list];
    const s = searchText.trim().toLowerCase();
    return list.filter(item =>
      fields.some(f => item[f]?.toString().toLowerCase().includes(s))
    );
  }

  /**
   * Convenience variant for employee / manager lists where the name field is fixed.
   *
   * @param list       Full employee/manager array.
   * @param searchText User-typed text.
   * @param nameField  Defaults to `'user__full_name'`.
   */
  filterByName(list: any[], searchText: string, nameField = 'user__full_name'): any[] {
    return this.filterLocalList(list, searchText, nameField);
  }

  // ─── Paginated State Factory ─────────────────────────────────────────────────

  /**
   * Creates a fresh `PaginatedDropdownState` with sensible defaults.
   * Call once per paginated dropdown field.
   */
  createDropdownState(): PaginatedDropdownState {
    return {
      page: 1,
      list: [],
      search: '',
      totalPages: 1,
      loading: false,
      initialized: false
    };
  }

  // ─── RxJS Subscription Helpers ───────────────────────────────────────────────

  /**
   * Wires up a debounced search subscription on a display `FormControl` for a
   * **paginated** autocomplete field.
   *
   * The `onSearch` callback is called with the trimmed string value every time
   * the user types (after the debounce delay), and also when the input is cleared.
   *
   * @param displayControl  The `FormControl` bound to the visible `<input>`.
   * @param onSearch        Callback receiving the current search string.
   * @param destroy$        Component's destroy subject for cleanup.
   * @param debounceMs      Debounce delay in ms (default 300).
   */
  setupPaginatedSearch(
    displayControl: FormControl,
    onSearch: (value: string) => void,
    destroy$: Subject<void>,
    debounceMs = 300
  ): void {
    displayControl.valueChanges.pipe(
      debounceTime(debounceMs),
      distinctUntilChanged(),
      filter(v => typeof v === 'string'),
      takeUntil(destroy$)
    ).subscribe(onSearch);
  }

  /**
   * Wires up a debounced filter subscription on a display `FormControl` for a
   * **non-paginated** (local) autocomplete field.
   *
   * Calls `onFilter` with the filtered results array.
   *
   * @param displayControl  The `FormControl` bound to the visible `<input>`.
   * @param getList         Getter that returns the full source array (captured lazily).
   * @param onFilter        Callback receiving the filtered result array.
   * @param displayFields   Field(s) to filter against.
   * @param destroy$        Component's destroy subject for cleanup.
   * @param debounceMs      Debounce delay in ms (default 200).
   */
  setupLocalFilter(
    displayControl: FormControl,
    getList: () => any[],
    onFilter: (results: any[]) => void,
    displayFields: string | string[],
    destroy$: Subject<void>,
    debounceMs = 200
  ): void {
    displayControl.valueChanges.pipe(
      debounceTime(debounceMs),
      distinctUntilChanged(),
      filter(v => typeof v === 'string'),
      takeUntil(destroy$)
    ).subscribe((value: string) => {
      onFilter(this.filterLocalList(getList(), value, displayFields));
    });
  }

  // ─── Infinite Scroll ─────────────────────────────────────────────────────────

  /**
   * Attaches a native scroll listener to a **paginated** `MatAutocomplete` panel
   * so more results are fetched when the user scrolls to the bottom.
   *
   * Must be called from `ngAfterViewInit` after the `@ViewChild` is resolved.
   *
   * @param autoRef     Reference to the `MatAutocomplete` directive.
   * @param state       The `PaginatedDropdownState` for this dropdown.
   * @param onLoadMore  Called when the panel reaches the bottom and more pages exist.
   * @param destroy$    Component's destroy subject for cleanup.
   */
  setupScrollListener(
    autoRef: MatAutocomplete,
    state: PaginatedDropdownState,
    onLoadMore: () => void,
    destroy$: Subject<void>
  ): void {
    if (!autoRef) return;
    autoRef.opened.pipe(takeUntil(destroy$)).subscribe(() => {
      setTimeout(() => {
        const panel = (autoRef as any).panel?.nativeElement as HTMLElement | undefined;
        if (!panel) return;
        panel.addEventListener('scroll', () => {
          const atBottom = panel.scrollHeight - panel.scrollTop <= panel.clientHeight + 5;
          if (atBottom && !state.loading && state.page < state.totalPages) {
            state.page++;
            onLoadMore();
          }
        });
      }, 0);
    });
  }

  // ─── Error State Matcher ──────────────────────────────────────────────────────

  /**
   * Creates a Material `ErrorStateMatcher` that delegates error visibility to
   * the **actual reactive form control** (not the display `FormControl`).
   *
   * This keeps the red border / error message in sync with the real form value.
   *
   * @param getControl  Getter returning the reactive `AbstractControl` to inspect.
   *
   * @example
   *   this.clientErrorMatcher = this.autoSvc.createErrorMatcher(
   *     () => this.jobFormGroup.get('client')
   *   );
   */
  createErrorMatcher(getControl: () => AbstractControl | null): ErrorStateMatcher {
    return {
      isErrorState: (_control: FormControl | null, _form: any): boolean => {
        const ctrl = getControl();
        return !!(ctrl?.invalid && (ctrl.dirty || ctrl.touched));
      }
    } as ErrorStateMatcher;
  }

  // ─── Focus Handler Helper ─────────────────────────────────────────────────────

  /**
   * Handles focus on a paginated autocomplete input.
   *
   * If the field already has a selected item, narrows the list to that item only
   * (so the selection is visible while keeping the panel useful).
   * Otherwise, triggers the first page load if not yet initialized.
   *
   * @param state         The `PaginatedDropdownState` for this field.
   * @param selectedItems Currently selected items for this field.
   * @param fetchFirstPage  Callback to fetch page 1 from the API.
   */
  onFocus(
    state: PaginatedDropdownState,
    selectedItems: any[],
    fetchFirstPage: () => void
  ): void {
    if (selectedItems.length > 0) {
      state.list = [...selectedItems];
      return;
    }
    if (!state.initialized || state.list.length === 0) {
      state.page = 1;
      fetchFirstPage();
      state.initialized = true;
    }
  }

  // ─── Display Value Sync (Employee / Manager rows) ────────────────────────────

  /**
   * Syncs display-value string arrays for employee/manager row-level autocomplete.
   *
   * After form data is patched (edit mode load, select-all, etc.) the visible
   * `[(ngModel)]` values must be refreshed from the actual form IDs.
   *
   * @param controls          FormArray controls (one per row).
   * @param allEmployees      Full employee list (to resolve IDs → names).
   * @param allManagers       Full manager list.
   * @param employeeIdKey     Form control key for employee ID (default `'employee'`).
   * @param managerIdKey      Form control key for manager ID (default `'manager'`).
   * @param empNameField      Display name field on employee objects (default `'user__full_name'`).
   * @param mgrNameField      Display name field on manager objects (default `'user__full_name'`).
   *
   * @returns `{ employeeDisplayValues, managerDisplayValues }` — parallel string arrays.
   */
  buildDisplayValues(
    controls: AbstractControl[],
    allEmployees: any[],
    allManagers: any[],
    employeeIdKey = 'employee',
    managerIdKey = 'manager',
    empNameField = 'user__full_name',
    mgrNameField = 'user__full_name'
  ): { employeeDisplayValues: (string | null)[]; managerDisplayValues: (string | null)[] } {
    const employeeDisplayValues: (string | null)[] = [];
    const managerDisplayValues: (string | null)[] = [];

    controls.forEach(control => {
      const raw = (control as any).getRawValue?.() ?? control.value;
      const emp = allEmployees.find(e => e.user_id === raw[employeeIdKey]);
      const mgr = allManagers.find(m => m.user_id === raw[managerIdKey]);
      employeeDisplayValues.push(emp?.[empNameField] ?? null);
      managerDisplayValues.push(mgr?.[mgrNameField] ?? null);
    });

    return { employeeDisplayValues, managerDisplayValues };
  }
}
