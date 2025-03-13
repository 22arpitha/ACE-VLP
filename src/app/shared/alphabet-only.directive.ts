import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appAlphabetOnly]'
})
export class AlphabetOnlyDirective {

  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent): boolean {
    const charCode = event.which || event.keyCode;
    // Allow A-Z (65-90), a-z (97-122), and space (32)
    if ((charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122) || charCode === 32) {
      return true;
    }
    event.preventDefault();
    return false;
  }
}
