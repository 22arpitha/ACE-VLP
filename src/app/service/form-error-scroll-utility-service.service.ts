import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class FormErrorScrollUtilityService {
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
}
