import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-page503',
  templateUrl: './page503.component.html',
  styleUrls: ['./page503.component.scss']
})
export class Page503Component implements OnInit {

  user_id: string;

  constructor(
    private router:Router) { }
  goBack(){
   this.router.navigate(['/login'])
  }
 ngOnInit(): void {
   
 }
}
