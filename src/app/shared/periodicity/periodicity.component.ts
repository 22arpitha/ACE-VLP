import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ApiserviceService } from '../../service/apiservice.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-periodicity',
  templateUrl: './periodicity.component.html',
  styleUrls: ['./periodicity.component.scss']
})
export class PeriodicityComponent implements OnInit,OnChanges {
  searchPeroidicityText:any;
  allPeroidicitylist:any=[];
  @Input() resetFilterField:any;
  @Input() defaultSelection:any;
  selectedPeriodicityVal:any;
  @Output() selectPeriodicity :EventEmitter<any> = new EventEmitter<any>();
  constructor(private apiService: ApiserviceService) { }

   ngOnChanges(changes: SimpleChanges): void {
    if(changes['resetFilterField'] && changes['resetFilterField'].currentValue !== undefined){
      this.resetFilterField = changes['resetFilterField'].currentValue
        this.selectedPeriodicityVal=null;
        this.selectPeriodicity.emit(null);
    }
    if(changes['defaultSelection'] && changes['defaultSelection'].currentValue !== undefined){
      console.log(changes['defaultSelection']);
      if(this.allPeroidicitylist && this.allPeroidicitylist?.length>=1){
        this.selectedPeriodicityVal = this.allPeroidicitylist?.find((element):any => element?.periodicty_name ==='Monthly')?.id;
        this.selectPeriodicity.emit(this.selectedPeriodicityVal);
      }else{
        this.selectedPeriodicityVal=null;
        this.selectPeriodicity.emit(null);
      }
        
    }

  }
  ngOnInit(): void {
    this.getAllPeriodicity();
  }


  public getAllPeriodicity() {
    this.allPeroidicitylist = [];
    this.apiService.getData(`${environment.live_url}/${environment.settings_periodicty}/`).subscribe(
      (res: any) => {
        this.allPeroidicitylist = res;
      }, (error: any) => {
        this.apiService.showError(error?.error?.detail);
      });
  }

  public onPeroidicityChange(event: any) {
    this.selectPeriodicity.emit(event.value);
  }

public clearSearch(){
  this.searchPeroidicityText='';
}

public filteredPeriodicityList() {
  if (!this.searchPeroidicityText) {
    return this.allPeroidicitylist;
  }
  return this.allPeroidicitylist.filter((peroidicity: any) =>
    peroidicity?.periodicty_name?.toLowerCase()?.includes(this.searchPeroidicityText?.toLowerCase())
  );
}

}
