import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit {
  @Input()itemsPerPage = 10;
  @Input()pageSizes;
  @Output() pageChange = new EventEmitter<number>();
  @Output() itemsPerPageChange = new EventEmitter<number>();
  tableSize = 5;
  tableSizes = [5,10,25,50,100];
  constructor() { }
  
  ngOnInit(): void {
  }
  onPageChange(event){}

  onTableSizeChange(event){}
}
