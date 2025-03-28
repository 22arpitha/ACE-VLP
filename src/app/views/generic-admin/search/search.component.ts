import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  searchTerm:any = '';
  @Output() search:any= new EventEmitter();

 
  constructor() { }

  ngOnInit(): void {
  }
  onSearch(event): void {
    this.search.emit(this.searchTerm);
  }
}
