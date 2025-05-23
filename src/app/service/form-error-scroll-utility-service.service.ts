import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericRedirectionConfirmationComponent } from '../generic-components/generic-redirection-confirmation/generic-redirection-confirmation.component';

@Injectable({
  providedIn: 'root',
})
export class FormErrorScrollUtilityService {
  private _hasUnsavedChanges = false;
  constructor(private modalService:NgbModal) {
 }
 

  setUnsavedChanges(status: boolean) {
    this._hasUnsavedChanges = status;
  }

  get hasUnsavedChanges(): boolean {
    return this._hasUnsavedChanges;
  }

  resetHasUnsavedValue() {
    this._hasUnsavedChanges = false;
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

  isFormDirtyOrInvalidCheck(isFormChanged:boolean, formGroup: FormGroup): Observable<boolean> {
    const isDirtyOrInvalid = isFormChanged || (formGroup.touched && formGroup?.invalid);
    return isDirtyOrInvalid ? this.getConfirmationPopup() : of(true);
  }


  isTableRecordChecked(isItemSelected:boolean): Observable<boolean> {
    const isDirtyOrInvalid = isItemSelected;
    return isDirtyOrInvalid ? this.getConfirmationPopup() : of(true);
  }


  private getConfirmationPopup(): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      const modelRef = this.modalService.open(GenericRedirectionConfirmationComponent, {
        size: 'sm' as any,
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
