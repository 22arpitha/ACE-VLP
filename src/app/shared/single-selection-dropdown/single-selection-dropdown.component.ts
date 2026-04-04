import {
  Component,
  Input,
  OnInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-single-selection-dropdown',
  templateUrl: './single-selection-dropdown.component.html',
})
export class SingleSelectionDropdownComponent implements OnInit {

  @Input() label: string = '';
  @Input() formControl!: FormControl;

  @Input() options: any[] = [];
  @Input() isApiBased: boolean = false;
  @Input() fetchFn!: (params: any) => Promise<any>;
  @Input() pageSize: number = 10;

  @Input() displayKey: string = '';
  @Input() valueKey: string = 'id';

  @ViewChild('panel') panel!: ElementRef;

  searchText: string = '';
  list: any[] = [];

  page = 1;
  hasMore = true;
  loading = false;

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    if (!this.isApiBased) {
      this.list = [...this.options];
    }

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.handleSearch(value);
    });
  }

  onDropdownOpen(opened: boolean) {
  if (opened) {

    setTimeout(() => {
      // ✅ focus input
      const input = document.querySelector('.search-box input') as HTMLElement;
      input?.focus();
    }, 100);

    if (this.isApiBased && this.list.length === 0) {
      this.loadData();

      setTimeout(() => {
        const panel = document.querySelector('.mat-select-panel') as HTMLElement;

        if (!panel) return;

        panel.addEventListener('scroll', this.onScroll.bind(this));
      });
    }
  }
}

  onSearch(value: string) {
    this.searchText = value;
    this.searchSubject.next(value);
  }

  handleSearch(value: string) {
    this.page = 1;

    if (this.isApiBased) {
      this.list = [];
      this.hasMore = true;
      this.loadData();
    } else {
      this.filterLocal();
    }
  }

  filterLocal() {
    this.list = this.options.filter(item =>
      item[this.displayKey]?.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  async loadData() {
    if (this.loading || !this.hasMore) return;

    this.loading = true;

    try {
      const res = await this.fetchFn({
        search: this.searchText,
        page: this.page,
        page_size: this.pageSize
      });

      this.list = this.page === 1
        ? res.results
        : [...this.list, ...res.results];

      this.hasMore = !!res.next;
      this.page++;

    } catch (e) {
      console.error(e);
    }

    this.loading = false;
  }

  onScroll(event: any) {
    const target = event.target;

    const atBottom =
      target.scrollTop + target.clientHeight >= target.scrollHeight - 10;

    if (atBottom) {
      this.loadData();
    }
  }
}