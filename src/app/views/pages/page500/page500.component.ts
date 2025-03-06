import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-page500',
  templateUrl: './page500.component.html',
  styleUrls: ['./page500.component.scss']
})
export class Page500Component {

  user_id: string;

  constructor(
    private router:Router) { }
  goBack(){
   this.router.navigate(['/login'])
  }
}
