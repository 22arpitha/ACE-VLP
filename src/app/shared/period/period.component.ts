import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiserviceService } from '../../service/apiservice.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-period',
  templateUrl: './period.component.html',
  styleUrls: ['./period.component.scss']
})
export class PeriodComponent implements OnInit,OnChanges {
  searchPeroidText:any;
  peroidslist:any=[];
  @Input() periodicity_id:any;
  @Input() defaultSelection:any;
  @Output() selectPeriod :EventEmitter<any> = new EventEmitter<any>();
  selectedPeriodVal:any;
  @Input() resetFilterField:any;
  currentDate = new Date();
  monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  constructor(private apiService: ApiserviceService) { }
  
  ngOnChanges(changes: SimpleChanges): void {
   if(changes && changes['periodicity_id']){
    this.periodicity_id = changes['periodicity_id'].currentValue;
    if(this.periodicity_id){
      this.getPeroidicityBasedPeroid();  
    }
   }
   if(changes['resetFilterField'] && changes['resetFilterField'].currentValue !== undefined){
    this.resetFilterField = changes['resetFilterField'].currentValue;
      this.selectedPeriodVal=null;   
      this.selectPeriod.emit(null); 
  }
  if(changes['defaultSelection'] && changes['defaultSelection'].currentValue !== undefined){
    this.defaultSelection = changes['defaultSelection'].currentValue;
  }
  }
  ngOnInit(): void {

  }

  public filteredPeriodList() {
    if (!this.searchPeroidText) {
      return this.peroidslist;
    }
    return this.peroidslist.filter((peroid: any) =>
      peroid?.period_name?.toLowerCase()?.includes(this.searchPeroidText?.toLowerCase())
    );
  }

  public clearSearch(){
    this.searchPeroidText ='';
  }

  private getPeroidicityBasedPeroid() {
      this.peroidslist = [];
      this.apiService.getData(`${environment.live_url}/${environment.settings_period}/?periodicity=${this.periodicity_id}`).subscribe(
        (res: any) => {
          this.peroidslist = res;
          if(this.defaultSelection){
            this.selectedPeriodVal = this.peroidslist?.find((element):any => element.period_name === this.monthNames[this.currentDate.getMonth()])?.id;
            this.selectPeriod.emit(this.selectedPeriodVal);
          }
        }, (error: any) => {
          this.apiService.showError(error?.error?.detail);
        });
    }

    public onPeroidChange(event:any){
      this.selectPeriod.emit(event.value);
    }

}
