import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TrialSuccessComponent } from '../trial-success/trial-success.component';
import { Router } from '@angular/router';
import { ExistStandardPlanComponent } from '../exist-standard-plan/exist-standard-plan.component';
import { MatDialog } from '@angular/material/dialog';
import { BuyStandardplanComponent } from '../buy-standardplan/buy-standardplan.component';
import { CommonServiceService } from '../../../service/common-service.service';

@Component({
  selector: 'app-trial-alert',
  templateUrl: './trial-alert.component.html',
  styleUrls: ['./trial-alert.component.scss']
})
export class TrialAlertComponent implements OnInit {
  @Output() status: EventEmitter<any> = new EventEmitter<any>();
  @Input() title: any;
  @Input() message: any;
  @Input() buttonName: any;
  @Input()trailPlanStaus:any;
  
  modalStatus(data) {
    if (data === 'ok') {
      if(this.trailPlanStaus){
        this.openDialogue()
      }
     
    }else{
      this.dialog.closeAll()
    }
    this.status.emit(data)
  }
  constructor(private modalService: NgbModal,
    private router: Router,
    private dialog: MatDialog,
    private common_service:CommonServiceService
  ) { }

  ngOnInit(): void {
  }
  openDialogue() {
    if (this.message === 'Free Trial Plan') {
      const modelRef = this.modalService.open(TrialSuccessComponent, {
        size: <any>'sm',
        backdrop: true,
        centered: true
      });
      modelRef.componentInstance.title = `Your free trial plan is activated successfully!`;
      modelRef.componentInstance.message = `Successful`;
      modelRef.componentInstance.status.subscribe(resp => {
        if (resp == "ok") {
          this.common_service.subsctiptionState$.next(true)
          this.router.navigate(['/accounts/subscription']);
          modelRef.close();
        }
        else {
          modelRef.close();
        }
      })
    } 
  }

}


