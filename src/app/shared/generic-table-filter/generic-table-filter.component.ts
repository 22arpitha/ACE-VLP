import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-generic-table-filter',
  templateUrl: './generic-table-filter.component.html',
  styleUrls: ['./generic-table-filter.component.scss']
})
export class GenericTableFilterComponent implements OnInit, OnChanges {
  @Input() options: { id: any, name: string }[] = [];
  @Input() selectedOptions: any[] = [];
  @Output() selectedOptionsChange = new EventEmitter<any[]>();

  filterSearchText: string = '';
  filteredOptions: { id: any, name: string }[] = [];

  ngOnInit(): void {
    this.filterOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      this.filterOptions();
    }
  }

  filterOptions(): void {
    const lower = this.filterSearchText.toLowerCase();
    this.filteredOptions = this.options.filter(opt =>
      opt.name.toLowerCase().includes(lower)
    );
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
    const selectedItems = this.options.filter(opt =>
      this.selectedOptions.includes(opt.id)
    );

    const combined = [...selectedItems, ...this.filteredOptions.filter(opt =>
      !this.selectedOptions.includes(opt.id)
    )];

    // Optional: remove duplicates
    const unique = new Map(combined.map(opt => [opt.id, opt]));
    return Array.from(unique.values());
  }
}
