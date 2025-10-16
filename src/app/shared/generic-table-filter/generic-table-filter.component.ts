// import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core'
// import { Subject } from 'rxjs'
// import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators'

// @Component({
//   selector: 'app-generic-table-filter', templateUrl: './generic-table-filter.component.html',
//   styleUrls: ['./generic-table-filter.component.scss']
// })

// export class GenericTableFilterComponent implements OnInit, OnChanges {
//   @Input() options: { id: any, name: string }[] = [];
//   @Input() selectedOptions: any[] = [];
//   @Output() selectedOptionsChange = new EventEmitter<any[]>();
//   @Input() fetchOptions?: (page: number, search: string) => Promise<{ results: any[], hasMore: boolean, totalCount?: number }>;
// // @Input() fetchOptions?: (page: number, search: string);
//   filterSearchText: string = '';
//   filteredOptions: { id: any, name: string }[] = []
//   infiniteScrollOptions: { id: any, name: string }[] = [];
//   private searchSubject = new Subject<string>();
//   private latestSearchTerm: string = '';
//   private currentPage: number = 1;
//   private hasMore: boolean = true;
//   private loading: boolean = false;
//   pendingSearch: boolean = false;
  

//   ngOnInit(): void {
//     this.searchSubject.pipe(
//       debounceTime(300),
//       distinctUntilChanged(),
//       filter((term: string) => term === '' || term.length >= 2)
//     ).subscribe(async (search: any) => {
//       // if (search !== this.latestSearchTerm) {
//       //   this.latestSearchTerm = search;
//       //   this.currentPage = 1;
//       //   this.infiniteScrollOptions = [];
//       //   this.hasMore = true;
//       //    this.loading = false;
//       // }
//       // console.log('here it comes',this.fetchOptions)
//       this.pendingSearch = true;
//       this.latestSearchTerm = search;
//       this.currentPage = 1;
//       this.infiniteScrollOptions = [];
//       this.hasMore = true;
//       this.loading = false;

//       this.fetchMoreOptions(search);
//       this.pendingSearch = false;


//       // this.fetchMoreOptions(search);
//     });
//     //  if (this.fetchOptions) {
//     //   this.stableFetchOptions = this.fetchOptions;
//     // }
//   }

//   // ngOnChanges(changes: SimpleChanges): void {
//   //   if (changes) {
//   //     this.filterOptions();
//   //   }
//   // }
// ngOnChanges(changes: SimpleChanges): void {
//   if (changes['options'] || changes['fetchOptions']) {
//     this.filterOptions();
//     // console.log(this.fetchOptions,"foptions from timesheet");
    
//   }
// }


//   onSearchInput(event: any): void {
//     // console.log('search options =====>', this.fetchOptions)
//     const value = event?.target?.value || '';
//     this.filterSearchText = value;
//     if (this.filterSearchText === '') {
//       this.latestSearchTerm = '';
//       this.currentPage = 1;
//       this.infiniteScrollOptions = [];
//       this.hasMore = true;
//     }

//     this.searchSubject.next(this.filterSearchText);
//   }
//   onMenuOpened(): void {
//     if (this.fetchOptions && this.infiniteScrollOptions.length === 0) {
//       this.searchSubject.next('');
//     }

//   }

//   filterOptions(): void {
//     if (this.fetchOptions) {
//       if (this.filterSearchText.length === 0 || this.filterSearchText.length >= 2) {
//         this.searchSubject.next(this.filterSearchText);
//       }
//     } else {
//       // if (this.filterSearchText.length > 0 && this.filterSearchText.length < 2) {
//       //   return;
//       // }
//       const lower = this.filterSearchText.toLowerCase();
//       this.filteredOptions = this.options.filter(opt =>
//         opt.name.toLowerCase().includes(lower)
//       );
//     }
//   }

//   fetchMoreOptions(search: string): any{
//     // if (this.loading || !this.hasMore || !this.fetchOptions) return;
//     // this.loading = true;
//     // this.fetchOptions(this.currentPage, search).then(data => {
//     //   this.infiniteScrollOptions = [...this.infiniteScrollOptions, ...data.results];
//     //   const totalLoaded = this.infiniteScrollOptions.length;
//     //   this.hasMore = totalLoaded < (data.totalCount ?? totalLoaded); // fallback to loaded
//     //   this.currentPage++;
//     //   this.loading = false;
//     // });

//     // console.log('came here')
//     // console.log('this.fetchOptions',  this.fetchOptions)
//     if (this.loading || !this.hasMore || !this.fetchOptions) {
//       // console.log('resolve here')
//       return Promise.resolve();
//     }


//     this.loading = true;
//     // console.log('after.fetchOptions',  this.fetchOptions)
//     return this.fetchOptions(this.currentPage, search)
//       .then(data => {
//         // console.log('alsoooo here')
//         const newIds = new Set(data.results.map(r => r.id));
//         this.infiniteScrollOptions = [
//           ...this.infiniteScrollOptions.filter(opt => !newIds.has(opt.id)),
//           ...data.results,
//         ];
//         const totalLoaded = this.infiniteScrollOptions.length;
//         this.hasMore = totalLoaded < (data.totalCount ?? totalLoaded);
//         this.currentPage++;
//       })
//       .catch(err => {
//         // console.error('API call failed:', err);
//         this.hasMore = false;
//       })
//       .finally(() => {
//         this.loading = false;
//       });
//   }

//   isSelected(id: any): boolean {
//     return this.selectedOptions.includes(id);
//   }

//   toggleSelection(id: any): void {
//     const isAlreadySelected = this.selectedOptions.includes(id);
//     const updated = isAlreadySelected
//       ? this.selectedOptions.filter(optId => optId !== id)
//       : [...this.selectedOptions, id];
//     this.selectedOptions = updated;
//     this.selectedOptionsChange.emit(this.selectedOptions);
//     // if (this.fetchOptions && this.filterSearchText?.trim() !== '') {
//     //   this.fetchMoreOptions(this.filterSearchText);
//     // }
//     // console.log('toggle======>',this.fetchOptions)
//   }

//   clearSearch(): void {
//     this.filterSearchText = '';
//     this.searchSubject.next(this.filterSearchText);
//     this.filterOptions();
//   }

//   /** Combines filtered + selected to avoid selected options disappearing */
//   get displayOptions(): { id: any, name: string }[] {
//     const baseList = this.fetchOptions ? this.infiniteScrollOptions : this.filteredOptions;
//     const selectedItems = this.selectedOptions.map(id => {
//       return baseList.find(opt => opt.id === id) ||
//         this.options.find(opt => opt.id === id) ||
//         { id, name: '(Selected)' }; // fallback name if not found
//     });

//     // const selectedItems = this.options.filter(opt =>
//     //   this.selectedOptions.includes(opt.id)
//     // );

//     const combined = [...selectedItems, ...baseList.filter(opt =>
//       !this.selectedOptions.includes(opt.id)
//     )];
//     const unique = new Map(combined.map(opt => [opt.id, opt]));
//     return Array.from(unique.values());
//   }

//   onScroll(event: any): void {
//     const target = event.target;
//     const atBottom = target.offsetHeight + target.scrollTop >= target.scrollHeight - 10;
//     if (atBottom && this.fetchOptions) {
//       this.fetchMoreOptions(this.latestSearchTerm);
//     }
//   }


// }










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
  @Output() selectedOptionsChange = new EventEmitter<any[]>();

  @Input() fetchOptions?: (page: number, search: string) => Observable<{ results: any[], hasMore: boolean, totalCount?: number }>;

  filterSearchText: string = '';
  filteredOptions: { id: any, name: string }[] = [];
  infiniteScrollOptions: { id: any, name: string }[] = [];

  private searchSubject = new Subject<string>();
  private latestSearchTerm: string = '';
  private currentPage: number = 1;
  private hasMore: boolean = true;
  private loading: boolean = false;

  // ✅ Cache to prevent undefined issue after checkbox selection
  private stableFetchOptions?: (page: number, search: string) => Observable<{ results: any[], hasMore: boolean, totalCount?: number }>;

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter((term: string) => term === '' || term.length >= 2)
    ).subscribe((search: string) => {
      this.latestSearchTerm = search;
      this.currentPage = 1;
      this.hasMore = true;
      this.loading = false;
      console.log(search)
      this.fetchMoreOptions(search);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fetchOptions']?.currentValue) {
      this.stableFetchOptions = changes['fetchOptions'].currentValue;
    }

    if (changes['options']) {
      this.filterOptions();
    }

    if (changes['selectedOptions']) {
      this.selectedOptions = changes['selectedOptions'].currentValue || [];
      if (this.fetchOptions || this.stableFetchOptions) {
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
    console.log(fetchFn)
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
          // ✅ New search: keep only selected items, remove old non-selected ones
          this.infiniteScrollOptions = this.infiniteScrollOptions.filter(opt =>
            this.selectedOptions.includes(opt.id)
          );
        }

        // ✅ Add new results, avoid duplicates
        this.infiniteScrollOptions = [
          ...this.infiniteScrollOptions,
          ...data.results.filter(r => !this.infiniteScrollOptions.some(o => o.id === r.id)),
        ];

        const totalLoaded = this.infiniteScrollOptions.length;
        this.hasMore = totalLoaded < (data.totalCount ?? totalLoaded);
        this.currentPage++;
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
    return Array.isArray(this.selectedOptions) && this.selectedOptions.includes(id);
  }

  toggleSelection(id: any): void {
    if (!Array.isArray(this.selectedOptions)) {
      this.selectedOptions = [];
    }
    const isAlreadySelected = this.selectedOptions.includes(id);
    const updated = isAlreadySelected
      ? this.selectedOptions.filter(optId => optId !== id)
      : [...this.selectedOptions, id];

    this.selectedOptions = updated;
    this.selectedOptionsChange.emit(this.selectedOptions);

    setTimeout(() => {
      if (this.fetchOptions || this.stableFetchOptions) {
        this.searchSubject.next(this.filterSearchText || '');
      }
    }, 0);
  }

  clearSearch(): void {
    this.filterSearchText = '';
    this.latestSearchTerm = '';
    this.currentPage = 1;
    this.hasMore = true;

    // ✅ Reset to only selected options, then fetch new data
    this.infiniteScrollOptions = this.infiniteScrollOptions.filter(opt =>
      this.selectedOptions.includes(opt.id)
    );

    this.searchSubject.next(this.filterSearchText);
  }

  get displayOptions(): { id: any, name: string }[] {
    const baseList = (this.fetchOptions || this.stableFetchOptions)
      ? this.infiniteScrollOptions
      : this.filteredOptions;

    const selectedItems = this.selectedOptions.map(id => {
      return baseList.find(opt => opt.id === id) ||
        this.options.find(opt => opt.id === id) ||
        { id, name: '(Selected)' };
    });

    const combined = [...selectedItems, ...baseList.filter(opt =>
      !this.selectedOptions.includes(opt.id)
    )];

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
  this.selectedOptionsChange.emit([]);
  this.filterSearchText = '';
  this.currentPage = 1;
  this.hasMore = true;
  this.fetchMoreOptions(this.filterSearchText); 
}
}









