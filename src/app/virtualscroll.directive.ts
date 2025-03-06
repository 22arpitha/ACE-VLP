import { Directive, ElementRef, Input, Pipe, PipeTransform } from '@angular/core';

@Directive({
  selector: '[appVirtualScroll]'
})
export class VirtualScrollDirective {
  @Input() items: any[];
  viewport: any[];

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.viewport = this.items.slice(0, this.calculateItemsToDisplay());

    this.el.nativeElement.addEventListener('scroll', () => {
      this.viewport = this.items.slice(
        this.getStartIndex(),
        this.getEndIndex()
      );
    });
  }

  private calculateItemsToDisplay(): number {
    return Math.ceil(this.el.nativeElement.offsetHeight / 50);
  }

  private getStartIndex(): number {
    return Math.floor(this.el.nativeElement.scrollTop / 50);
  }

  private getEndIndex(): number {
    return this.getStartIndex() + this.calculateItemsToDisplay();
  }
}

@Pipe({
  name: 'virtualScroll'
})
export class VirtualScrollPipe implements PipeTransform {
  transform(items: any[], viewport: any[]): any[] {
    return viewport;
  }
}
