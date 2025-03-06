import { Component } from '@angular/core';
import { FooterComponent } from '@coreui/angular';
import { Location } from '@angular/common'

@Component({
  selector: 'app-default-footer',
  templateUrl: './default-footer.component.html',
  styleUrls: ['./default-footer.component.scss'],
})
export class DefaultFooterComponent extends FooterComponent {
  config:any;
  constructor(
    private location:Location
  ) {
    super();
    this.config = sessionStorage.getItem('user_role_name');
  }
   menuToggle=document.querySelector('.menuToggle');
   selectedTab: string = 'home';

  selectTab(tab: string) {
    this.selectedTab = tab;
    // Implement navigation or content switching logic here
  }
  goBack(event)
  {
    event.preventDefault(); // Prevent default back button behavior
  this.location.back();
  
  }
}
