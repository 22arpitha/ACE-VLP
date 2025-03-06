import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page404',
  templateUrl: './page404.component.html',
  styleUrls: ['./page404.component.scss']
})
export class Page404Component {
  user_id: string;

  constructor(
    private router:Router) { }
  goBack(){
   this.router.navigate(['/login'])
  }
}
