import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericRedirectionConfirmationComponent } from '../generic-components/generic-redirection-confirmation/generic-redirection-confirmation.component';

@Injectable({
  providedIn: 'root',
})
export class FormErrorScrollUtilityService {
  constructor(private modalService:NgbModal) {
      
     }
  scrollToFirstError(formGroup: FormGroup): void {
    const firstInvalidControl = this.getFirstInvalidControl(formGroup);

    if (firstInvalidControl) {
      const controlName = this.getControlName(formGroup, firstInvalidControl);
      const firstInvalidElement = document?.querySelector(`[formControlName="${controlName}"]`);

      if (firstInvalidElement) {
        firstInvalidElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }
  private getFirstInvalidControl(formGroup: FormGroup): AbstractControl | null {
    return Object.keys(formGroup.controls)
      .map((key) => formGroup.get(key))
      .find((control) => control?.invalid) || null;
  }

  private getControlName(formGroup: FormGroup, control: AbstractControl): string | null {
    return Object.keys(formGroup.controls).find(
      (key) => formGroup.get(key) === control
    ) || null;
  }

  isFormDirtyOrInvalidCheck(formGroup: FormGroup):Observable<boolean>{
    return (formGroup?.dirty || formGroup.touched) && formGroup?.invalid
      ? this.getConfirmationPopup()
      : of(true);
  }


  private getConfirmationPopup(): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      const modelRef = this.modalService.open(GenericRedirectionConfirmationComponent, {
        size: 'md' as any,
        backdrop: true,
        centered: true
      });
  
      modelRef.componentInstance.status.subscribe((resp: any) => {
        observer.next(resp === 'ok');
        observer.complete();
        modelRef.close();
      });
    });
  }

}
