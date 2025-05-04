import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-generic-table-filter',
  templateUrl: './generic-table-filter.component.html',
  styleUrls: ['./generic-table-filter.component.scss']
})
export class GenericTableFilterComponent implements OnInit {

  @Input() options: { id: any, name: string }[] = [];
  @Input() selectedOptions: any[] = [];
  @Output() selectedOptionsChange = new EventEmitter<any[]>();

  filterSearchText: string = '';
  filteredOptions: { id: any, name: string }[] = [];


  ngOnInit() {}
  ngOnChanges(event:SimpleChanges) {
    this.filteredOptions = [...this.options];
    this.filterOptions();
  }
  filterOptions() {
    const text = this.filterSearchText.toLowerCase();
    this.filteredOptions = this.options.filter(opt =>
      opt.name.toLowerCase().includes(text)
    );
  }

  clearSearch() {
    this.filterSearchText = '';
    this.filterOptions();
  }

  onSelectionChange() {
    this.selectedOptionsChange.emit(this.selectedOptions);
  }

}
