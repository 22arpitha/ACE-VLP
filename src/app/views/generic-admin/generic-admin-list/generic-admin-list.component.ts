import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-generic-admin-list',
  templateUrl: './generic-admin-list.component.html',
  styleUrls: ['./generic-admin-list.component.scss']
})
export class GenericAdminListComponent implements OnInit {

  @Input() data: any=[];
  @Input() arrowState: { [key: string]: boolean } = {};
  @Output() edit = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();
  @Output() sort = new EventEmitter<{ direction: string; column: string }>();
  tableSize = 5;
  tableSizes = [5,10,25,50,100];
  count = this.data?.length * this.tableSize
  page = 1;
  
  adminData: any[];

  onSort(direction: string, column: string): void {
    this.sort.emit({ direction, column });
  }
  ngOnChanges(){
   this.adminData = this.data
  }
  constructor() { }

  ngOnInit(): void {
  }
  onEdit(id){
    this.edit.emit(id)
  }
  onDelete(id){}


  

}
