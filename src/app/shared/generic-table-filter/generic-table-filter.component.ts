import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime,distinctUntilChanged  } from 'rxjs/operators';

@Component({
  selector: 'app-generic-table-filter',
  templateUrl: './generic-table-filter.component.html',
  styleUrls: ['./generic-table-filter.component.scss']
})
export class GenericTableFilterComponent implements OnInit, OnChanges {
  @Input() options: { id: any, name: string }[] = [];
  @Input() selectedOptions: any[] = [];
  @Output() selectedOptionsChange = new EventEmitter<any[]>();
 @Input() fetchOptions?: (page: number, search: string) => Promise<{ results: any[], hasMore: boolean, totalCount?: number }>;

  filterSearchText: string = '';
  filteredOptions: { id: any, name: string }[] = [];
  infiniteScrollOptions: { id: any, name: string }[] = [];
  private searchSubject = new Subject<string>();
  private latestSearchTerm: string = '';
  private currentPage: number = 1;
  private hasMore: boolean = true;
  private loading: boolean = false;
  ngOnInit(): void {
    this.searchSubject.pipe(
    debounceTime(300),
    distinctUntilChanged()
  ).subscribe((search:any) => {
     this.latestSearchTerm = search;
    this.currentPage = 1;
    this.infiniteScrollOptions = [];
    this.hasMore = true;
    this.fetchMoreOptions(search);
  });

  // ✅ Trigger initial fetch with empty search
  if (this.fetchOptions) {
    this.searchSubject.next('');
  } else {
    this.filterOptions(); // normal filter fallback
  }
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      this.filterOptions();
    }
  }

  filterOptions(): void {
    if (this.fetchOptions) {
      if (this.filterSearchText.length === 0 || this.filterSearchText.length >= 2) {
        this.searchSubject.next(this.filterSearchText);
      }
    } else {
      if (this.filterSearchText.length > 0 && this.filterSearchText.length < 2) {
        return;
      }
      const lower = this.filterSearchText.toLowerCase();
      this.filteredOptions = this.options.filter(opt =>
        opt.name.toLowerCase().includes(lower)
      );
    }
  }


  fetchMoreOptions(search: string): void {
  if (this.loading || !this.hasMore || !this.fetchOptions) return;

  this.loading = true;
  this.fetchOptions(this.currentPage, search).then(data => {
    this.infiniteScrollOptions = [...this.infiniteScrollOptions, ...data.results];

    const totalLoaded = this.infiniteScrollOptions.length;
    this.hasMore = totalLoaded < (data.totalCount ?? totalLoaded); // fallback to loaded

    this.currentPage++;
    this.loading = false;
  });
}
  isSelected(id: any): boolean {
    return this.selectedOptions.includes(id);
  }

  toggleSelection(id: any): void {
    const isAlreadySelected = this.selectedOptions.includes(id);
    const updated = isAlreadySelected
      ? this.selectedOptions.filter(optId => optId !== id)
      : [...this.selectedOptions, id];

    this.selectedOptions = updated;
    this.selectedOptionsChange.emit(this.selectedOptions);
  }

  clearSearch(): void {
    this.filterSearchText = '';
    this.filterOptions();
  }

  /** Combines filtered + selected to avoid selected options disappearing */
  get displayOptions(): { id: any, name: string }[] {
    const baseList = this.fetchOptions ? this.infiniteScrollOptions : this.filteredOptions;

    const selectedItems = this.options.filter(opt =>
      this.selectedOptions.includes(opt.id)
    );

    const combined = [...selectedItems, ...baseList.filter(opt =>
      !this.selectedOptions.includes(opt.id)
    )];

    const unique = new Map(combined.map(opt => [opt.id, opt]));
    return Array.from(unique.values());
  }

  onScroll(event: any): void {
    const target = event.target;
    const atBottom = target.offsetHeight + target.scrollTop >= target.scrollHeight - 10;

    if (atBottom && this.fetchOptions) {
      this.fetchMoreOptions(this.latestSearchTerm);
    }
  }
}
