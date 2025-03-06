import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-no-internet',
  templateUrl: './no-internet.component.html',
  styleUrls: ['./no-internet.component.scss']
})
export class NoInternetComponent implements OnInit {
  user_id: string;
  imgUrl: any;
  noInternetImage: string | null;

  constructor(
    private router:Router) { }

  ngOnInit(): void {
    this.noInternetImage = sessionStorage.getItem('noInternetImage');
    if (this.noInternetImage) {
      this.preloadImage(this.noInternetImage);
    }
  }
  goBack(){
    this.router.navigate(['/login'])
  }
  preloadImage(url: string) {
    this.imgUrl = new Image();
    this.imgUrl['src'] = url;
  }

}
