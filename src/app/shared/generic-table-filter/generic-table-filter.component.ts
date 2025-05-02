import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-generic-table-filter',
  templateUrl: './generic-table-filter.component.html',
  styleUrls: ['./generic-table-filter.component.scss']
})
export class GenericTableFilterComponent implements OnInit {

  @Input() selectedOptions: string[] = [];
  @Output() selectedOptionsChange = new EventEmitter<string[]>(); // 🔧 Required for two-way binding

  @Input() options: string[] = [];

  filterSearchText = '';
  filteredOptions: string[] = [];

  ngOnInit() {

  }
  ngOnChanges(event:SimpleChanges) {
    this.filteredOptions = [...this.options];
    this.filterOptions();
  }
  filterOptions() {
    const text = this.filterSearchText.toLowerCase();
    this.filteredOptions = this.options.filter(opt =>
      opt.toLowerCase().includes(text)
    );
  }

  clearSearch() {
    this.filterSearchText = '';
    this.filterOptions();
  }

  onSelectionChange() {
    console.log('Selected:', this.selectedOptions);
    this.selectedOptionsChange.emit(this.selectedOptions);
  }

}
