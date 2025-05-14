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
  @Input() periodicity_id: number | null = null;
  @Input() defaultSelection: boolean = false;
  @Input() resetFilterField: boolean = false;
  @Output() selectPeriod :EventEmitter<any> = new EventEmitter<any>();
  selectedPeriodVal:any;
  currentDate = new Date();
  monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  constructor(private apiService: ApiserviceService) { }
  
  ngOnChanges(changes: SimpleChanges): void {
   
   if (changes['resetFilterField'] && changes['resetFilterField']?.currentValue === true) {
    this.selectedPeriodVal=null;   
    this.peroidslist=[];
    this.searchPeroidText='';
      this.selectPeriod.emit(null); 
  }
  if(changes['defaultSelection'] && changes['defaultSelection']?.currentValue === true){
    this.defaultSelection = changes['defaultSelection']?.currentValue;
  }

  if(changes['periodicity_id'] && changes['periodicity_id']?.currentValue !=null){
    this.periodicity_id = changes['periodicity_id'].currentValue;
    if(this.periodicity_id){
      this.getPeroidicityBasedPeroid();  
    }
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
            this.selectedPeriodVal = this.peroidslist?.find((element):any => element.period_name === this.monthNames[this.currentDate.getMonth()-1])?.id; 
          }
          this.selectPeriod.emit(this.selectedPeriodVal);
        }, (error: any) => {
          this.apiService.showError(error?.error?.detail);
        });
    }

    public onPeroidChange(event:any){
      this.selectPeriod.emit(event.value);
    }

}
