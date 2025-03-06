import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appHypen]'
})
export class HypenDirective {

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event']) onInput(event: KeyboardEvent): void {
    const inputElement = this.el.nativeElement as HTMLInputElement;
    const inputValue = inputElement.value;
    inputElement.value = inputValue.replace(/-/g, ''); // Remove all hyphens
  }

}
