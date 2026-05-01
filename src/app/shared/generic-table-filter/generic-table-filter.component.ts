import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';

@Component({
  selector: 'app-generic-table-filter',
  templateUrl: './generic-table-filter.component.html',
  styleUrls: ['./generic-table-filter.component.scss']
})
export class GenericTableFilterComponent implements OnInit, OnChanges {
  @Input() options: { id: any, name: string }[] = [];
  @Input() selectedOptions: any[] = [];
  @Output() selectedOptionsChange = new EventEmitter<any>();

  // old code 
  //  @Output() selectedOptionsChange = new EventEmitter<any[]>();

  @Input() fetchOptions?: (page: number, search: string) => Observable<{ results: any[], hasMore: boolean, totalCount?: number }>;

  filterSearchText: string = '';
  filteredOptions: { id: any, name: string }[] = [];
  infiniteScrollOptions: { id: any, name: string }[] = [];

  private searchSubject = new Subject<string>();
  private latestSearchTerm: string = '';
  private currentPage: number = 1;
  private hasMore: boolean = true;
  private loading: boolean = false;
  private menuOpened = false;
  selectAllValue: boolean | null = null;
  excludedIds: { id: any, name: string }[] = [];
  selectedCount: number = 0;
  private totalCount: number = 0;
  //Cache to prevent undefined issue after checkbox selection
  private stableFetchOptions?: (page: number, search: string) => Observable<{ results: any[], hasMore: boolean, totalCount?: number }>;

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(() => this.menuOpened), 
      filter((term: string) => term === '' || term.length >= 2)
    ).subscribe((search: string) => {
      this.latestSearchTerm = search;
      this.currentPage = 1;
      this.hasMore = true;
      this.loading = false;
      // console.log(search)
      this.fetchMoreOptions(search);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fetchOptions']?.currentValue) {
      this.stableFetchOptions = changes['fetchOptions'].currentValue;
    }

    if (changes['options']) {
      // Set totalCount to options length for static mode
      this.totalCount = this.options.length;
      this.filterOptions();
    }

    if (changes['selectedOptions']) {
      // old code 
      // this.selectedOptions = changes['selectedOptions'].currentValue || [];

      // new code 
       const value = changes['selectedOptions'].currentValue;
      if (Array.isArray(value)) {
        this.selectedOptions = value;
      } else {
        this.selectedOptions = value?.selectedOptions || [];
        this.selectAllValue = value?.selectAllValue ?? null;
        this.excludedIds = value?.excludedIds || [];
        // Capture totalCount if provided
        if (value?.totalCount) {
          this.totalCount = value.totalCount;
        }
      }
      // new code ends here
      this.updateSelectedCount();
      if (this.menuOpened &&(this.fetchOptions || this.stableFetchOptions)) {
        this.filterOptions();
      }
    }
  }

  onSearchInput(event: any): void {
    const value = event?.target?.value || '';
    this.filterSearchText = value;
    if (this.filterSearchText === '') {
      this.latestSearchTerm = '';
      this.currentPage = 1;
      this.hasMore = true;
    }
    this.searchSubject.next(this.filterSearchText);
  }

  onMenuOpened(): void {
    this.menuOpened = true;
    if ((this.fetchOptions || this.stableFetchOptions) && this.infiniteScrollOptions.length === 0) {
      this.searchSubject.next('');
    }
  }

  filterOptions(): void {
    if (this.fetchOptions || this.stableFetchOptions) {
      if (this.filterSearchText.length === 0 || this.filterSearchText.length >= 2) {
        this.searchSubject.next(this.filterSearchText);
      }
    } else {
      const lower = this.filterSearchText.toLowerCase();
      this.filteredOptions = this.options.filter(opt =>
        opt.name?.toLowerCase().includes(lower)
      );
    }
  }

  fetchMoreOptions(search: string): void {
    if (this.loading || !this.hasMore) return;

    const fetchFn = this.fetchOptions || this.stableFetchOptions;
    if (!fetchFn) {
      console.error('fetchOptions is not available!',this.options);
       const lower = search.toLowerCase();
    this.filteredOptions = this.options.filter(opt =>
      opt.name?.toLowerCase().includes(lower)
    );
    this.hasMore = false; // no pagination in static mode
    return;
      // return;
    }

    this.loading = true;

    fetchFn(this.currentPage, search).subscribe({
      next: (data) => {
        const newIds = new Set(data.results.map(r => r.id));

        if (this.currentPage === 1) {
          // // New search: keep only selected items, remove old non-selected ones
          // this.infiniteScrollOptions = this.infiniteScrollOptions.filter(opt =>
          //   this.selectedOptions.includes(opt.id)
          // );
          // // Capture total count on first page
          // this.totalCount = data.totalCount ?? 0;
          // this.updateSelectedCount();

          // 19th changes
          //  this.totalCount = data.totalCount ?? 0;
          
          // issue fixing
            if (!this.filterSearchText) {
              this.totalCount = data.totalCount ?? 0;
            }
            // IMp: update count AFTER totalCount update
            // if (this.selectAllValue === true || this.selectAllValue === false) {
            //   this.updateSelectedCount();
            // }
            this.updateSelectedCount();
            // this.selectedOptionsChange.emit({
            //   selectedOptions: this.selectedOptions,
            //   selectAllValue: this.selectAllValue,
            //   excludedIds: this.excludedIds,
            //   selectedCount: this.selectedCount,
            //   totalCount: this.totalCount
            // });
            this.infiniteScrollOptions = this.infiniteScrollOptions.filter(opt =>
              this.selectedOptions.some(sel => sel.id === opt.id)
            );

          // Note: not emitting selectedOptionsChange here — parent already gets
          // totalCount via updateFilterColumn. Emitting here would trigger table API call.
        }

        // Add new results, avoid duplicates
        this.infiniteScrollOptions = [
          ...this.infiniteScrollOptions,
          ...data.results.filter(r => !this.infiniteScrollOptions.some(o => o.id === r.id)),
        ];

        const totalLoaded = this.infiniteScrollOptions.length;
        this.hasMore = totalLoaded < (data.totalCount ?? totalLoaded);
        this.currentPage++;
        // if (this.selectAllValue === true) {
        //   const newItems = data.results.filter(r =>
        //     !this.selectedOptions.some(sel => sel.id === r.id)
        //   );

        //   this.selectedOptions = [...this.selectedOptions, ...newItems];
        //  // old code
        //   // this.selectedOptionsChange.emit(this.selectedOptions);
        //   this.selectedOptionsChange.emit({
        //     selectedOptions: this.selectedOptions,
        //     selectAllValue: this.selectAllValue,
        //      excludedIds: this.excludedIds
        //   });
        // }
      },
      error: (err) => {
        // console.error('API call failed:', err);
        this.hasMore = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  isSelected(id: any): boolean {
    // When selectAll is true or false (came from true): item is selected if NOT in excludedIds
    if (this.selectAllValue === true || (this.selectAllValue === false && this.excludedIds.length > 0)) {
      return !this.excludedIds.some(x => x.id === id);
    }

    // When selectAll is null: item is selected if it's in selectedOptions
    return Array.isArray(this.selectedOptions) && 
           this.selectedOptions.some(x => x.id === id);
  }

  private updateSelectedCount(): void {
    if (this.selectAllValue === true) {
      // When select all is true: count = total records
      this.selectedCount = this.totalCount;
    } else if (this.selectAllValue === false) {
      // When select all is false: count = total records - excluded count
      // 19th changes
      // this.selectedCount = this.totalCount - this.excludedIds.length;
      // issue fixing
      this.selectedCount = Math.max(
      this.totalCount - this.excludedIds.length, 0);
    } else {
      // When select all is null: count = selected options length (if > 0)
      this.selectedCount = this.selectedOptions.length > 0 ? this.selectedOptions.length : 0;
    }
  }

  toggleSelection(option: { id: any; name: string }): void {
    if (!Array.isArray(this.selectedOptions)) {
      this.selectedOptions = [];
    }

    if (this.selectAllValue === true) {
      // When selectAll is true and unchecking an item
      const isExcluded = this.excludedIds.some(x => x.id === option.id);
      if (isExcluded) {
        // Recheck (remove from excluded)
        this.excludedIds = this.excludedIds.filter(x => x.id !== option.id);
      } else {
        // Uncheck: change selectAll to false and add to excludedIds
        this.selectAllValue = false;
        this.excludedIds.push({ id: option.id, name: option.name });
      }
    } else if (this.selectAllValue === false) {
      // When selectAll is false (came from true), items are implicitly selected if not in excludedIds
      const isExcluded = this.excludedIds.some(x => x.id === option.id);
      if (isExcluded) {
        // Item is currently unchecked, clicking it will check (remove from excludedIds)
        this.excludedIds = this.excludedIds.filter(x => x.id !== option.id);
        
        // If all items are now selected (excludedIds is empty), set selectAll to true
        if (this.excludedIds.length === 0) {
          this.selectAllValue = true;
        }
      } else {
        // Item is currently checked, clicking it will uncheck (add to excludedIds)
        this.excludedIds.push({ id: option.id, name: option.name });

        // If all items are now excluded, reset to null (no selection)
        if (this.excludedIds.length >= this.totalCount && !this.filterSearchText) {
          this.selectAllValue = null;
          this.selectedOptions = [];
          this.excludedIds = [];
        }

      }
    } else {
      // When selectAllValue is null, toggle selectedOptions
      const inSelected = this.selectedOptions.some(x => x.id === option.id);
      if (inSelected) {
        // Unselect: remove from selectedOptions and add to excludedIds
        this.selectedOptions = this.selectedOptions.filter(x => x.id !== option.id);
        const isExcluded = this.excludedIds.some(x => x.id === option.id);
        if (!isExcluded) {
          this.excludedIds.push({ id: option.id, name: option.name });
        }
      } else {
        // Select: add to selectedOptions and remove from excludedIds if present
        this.selectedOptions = [...this.selectedOptions, option];
        this.excludedIds = this.excludedIds.filter(x => x.id !== option.id);

        // If all options are now selected, set selectAllValue to true and clear arrays
        if (this.selectedOptions.length === this.totalCount && this.totalCount > 0) {
          this.selectAllValue = true;
          this.selectedOptions = [];
          this.excludedIds = [];
        }
      }
    }

    this.updateSelectedCount();

    this.selectedOptionsChange.emit({
      selectedOptions: this.selectedOptions,
      selectAllValue: this.selectAllValue,
      excludedIds: this.excludedIds,
      selectedCount: this.selectedCount
    });

    setTimeout(() => {
      if (this.fetchOptions || this.stableFetchOptions) {
        this.searchSubject.next(this.filterSearchText || '');
      }
    }, 0);
  }

//   toggleSelection(option: { id: any; name: string }): void {
//   if (!Array.isArray(this.selectedOptions)) {
//     this.selectedOptions = [];
//   }

//   const exists = this.selectedOptions.some(x => x.id === option.id);

//   if (exists) {
//     this.selectedOptions = this.selectedOptions.filter(x => x.id !== option.id);
//   } else {
//     this.selectedOptions = [...this.selectedOptions, option];
//   }

//   this.selectedOptionsChange.emit(this.selectedOptions);

//   setTimeout(() => {
//     if (this.fetchOptions || this.stableFetchOptions) {
//       this.searchSubject.next(this.filterSearchText || '');
//     }
//   }, 0);
// }


  clearSearch(): void {
    this.filterSearchText = '';
    this.latestSearchTerm = '';
    this.currentPage = 1;
    this.hasMore = true;

    // Reset to only selected options, then fetch new data
    // this.infiniteScrollOptions = this.infiniteScrollOptions.filter(opt =>
    //   this.selectedOptions.includes(opt.id)
    // );
   if (this.selectAllValue !== true) {
    this.infiniteScrollOptions = this.infiniteScrollOptions.filter(opt =>
      this.selectedOptions.some(sel => sel.id === opt.id)
    );
  }
    if (this.selectAllValue === true) {
    this.selectedCount = 0;
  }
    this.searchSubject.next(this.filterSearchText);
  }

  get displayOptions(): { id: any, name: string }[] {
    const baseList = (this.fetchOptions || this.stableFetchOptions)
      ? this.infiniteScrollOptions
      : this.filteredOptions;

    // When selectAllValue is true, show all available options
    if (this.selectAllValue === true) {
      return baseList;
    }

    // When selectAllValue is null, show selected items + available items
    const selectedItems = (Array.isArray(this.selectedOptions) ? this.selectedOptions : []).map(sel => {
      return baseList.find(opt => opt.id === sel.id) ||
             this.options.find(opt => opt.id === sel.id) ||
             sel;
    });

    const combined = [
      ...selectedItems,
      ...baseList.filter(opt =>
        !this.selectedOptions.some(sel => sel.id === opt.id)
      )
    ];

    return Array.from(new Map(combined.map(opt => [opt.id, opt])).values());
  }

  onScroll(event: any): void {
    const target = event.target;
    const atBottom = target.offsetHeight + target.scrollTop >= target.scrollHeight - 10;
    if (atBottom && (this.fetchOptions || this.stableFetchOptions)) {
      this.fetchMoreOptions(this.latestSearchTerm);
    }
  }

  clearSelection(): void {
    this.selectedOptions = [];
    this.excludedIds = [];
    this.selectAllValue = null;
    this.updateSelectedCount();
    
    this.selectedOptionsChange.emit({
      selectedOptions: this.selectedOptions,
      selectAllValue: this.selectAllValue,
      excludedIds: this.excludedIds,
      selectedCount: this.selectedCount
    });

    this.filterSearchText = '';
    this.currentPage = 1;
    this.hasMore = true;
    this.fetchMoreOptions(this.filterSearchText); 
  }

selectAllFun() {
  if (this.filterSearchText) {
    return; //prevent logic during search
  }
  if (this.selectAllValue === true) {
    // Uncheck select all: selectAllValue becomes null, clear selectedOptions and excludedIds
    this.selectAllValue = null;
    this.selectedOptions = [];
    this.excludedIds = [];
  } else {
    // Check select all: selectAllValue becomes true, clear both arrays
    this.selectAllValue = true;
    this.selectedOptions = [];
    this.excludedIds = [];
  }

  this.updateSelectedCount();

  this.selectedOptionsChange.emit({
    selectedOptions: this.selectedOptions,
    selectAllValue: this.selectAllValue,
    excludedIds: this.excludedIds,
    selectedCount: this.selectedCount
  });
}



}









