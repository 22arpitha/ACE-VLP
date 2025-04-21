import { Component, ContentChildren, OnInit, QueryList } from '@angular/core';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent implements OnInit {


tabs:string[] = ['Overall Productivity', 'Quantitative Productivity', 'Qualitative Productivity','Work Culture and Work Ethics',
   'Productive Hours','Non Billable Hours','Non Productive Hours' ];
  selectedTab: number = 0;

  selectTab(index: number): void {
    this.selectedTab = index;
    // this.tabs.forEach((tab, i) => {
    //    i === index;
    // });
  }
  constructor() { }

  ngOnInit(): void {
  }
  applySearch(){}
}
