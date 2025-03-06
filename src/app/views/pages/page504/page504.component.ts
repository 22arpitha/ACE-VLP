import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-page504',
  templateUrl: './page504.component.html',
  styleUrls: ['./page504.component.scss']
})
export class Page504Component implements OnInit {

  user_id: string;

  constructor(
    private router:Router) { }
  goBack(){
   this.router.navigate(['/login'])
  }
 ngOnInit(): void {
   
 }
}
