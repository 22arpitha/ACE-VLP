import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-user-guide-modal',
  templateUrl: './user-guide-modal.component.html',
  styleUrls: ['./user-guide-modal.component.scss']
})
export class UserGuideModalComponent implements OnInit {
  showIndicator = true;
  noWrapSlides = true;
  imageSlides: any = [
    { image: '../../../assets/images/screens/1_Step.jpg' },
          { image: '../../../assets/images/screens/2_Step.jpg' },
          { image: '../../../assets/images/screens/3_Step.jpg' },
          { image: '../../../assets/images/screens/4_Step.jpg' },
          { image: '../../../assets/images/screens/5_Step.jpg' },
          { image: '../../../assets/images/screens/6_Step.jpg' },
          { image: '../../../assets/images/screens/7_Step.jpg' },
          { image: '../../../assets/images/screens/8_Step.jpg' },
          { image: '../../../assets/images/screens/9_Step.jpg' },
          { image: '../../../assets/images/screens/10_Step.jpg' },
          { image: '../../../assets/images/screens/11_Step.jpg' },
          { image: '../../../assets/images/screens/12_Step.jpg' },
          { image: '../../../assets/images/screens/13_Step.jpg' },
          { image: '../../../assets/images/screens/14_Step.jpg' },
          { image: '../../../assets/images/screens/15_Step.jpg' },
          { image: '../../../assets/images/screens/16_Step.jpg' },
          { image: '../../../assets/images/screens/17_Step.jpg' },
          { image: '../../../assets/images/screens/18_Step.jpg' },
          { image: '../../../assets/images/screens/19_Step.jpg' },
          { image: '../../../assets/images/screens/20_Step.jpg' },
          { image: '../../../assets/images/screens/21_Step.jpg' },
          { image: '../../../assets/images/screens/22_Step.jpg' },
          { image: '../../../assets/images/screens/23_Step.jpg' },
          { image: '../../../assets/images/screens/24_Step.jpg' },
          { image: '../../../assets/images/screens/25_Step.jpg' },
          { image: '../../../assets/images/screens/26_Step.jpg' },
          { image: '../../../assets/images/screens/27_Step.jpg' },
          { image: '../../../assets/images/screens/28_Step.jpg' },
          { image: '../../../assets/images/screens/29_Step.jpg' },
          { image: '../../../assets/images/screens/30_Step.jpg' },
          { image: '../../../assets/images/screens/31_Step.jpg' },
          { image: '../../../assets/images/screens/32_Step.jpg' },
          { image: '../../../assets/images/screens/33_Step.jpg' },
          { image: '../../../assets/images/screens/34_Step.jpg' },
          { image: '../../../assets/images/screens/35_Step.jpg' },
          { image: '../../../assets/images/screens/36_Step.jpg' },
          { image: '../../../assets/images/screens/37_Step.jpg' },
          { image: '../../../assets/images/screens/38_Step.jpg' },
          { image: '../../../assets/images/screens/39_Step.jpg' },
          { image: '../../../assets/images/screens/40_Step.jpg' },
          { image: '../../../assets/images/screens/41_Step.jpg' },
          { image: '../../../assets/images/screens/42_Step.jpg' }
  ]
  constructor(
    public bsModalRef: BsModalRef
  ) { }

  ngOnInit(): void {
    // this.carouselImages();
  }
  carouselImages() {
    
      // this.imageSlides = [
      //     { image: '../../../assets/images/screens/1_Step.jpg' },
      //     { image: '../../../assets/images/screens/2_Step.jpg' },
      //     { image: '../../../assets/images/screens/3_Step.jpg' },
      //     { image: '../../../assets/images/screens/4_Step.jpg' },
      //     { image: '../../../assets/images/screens/5_Step.jpg' },
      //     { image: '../../../assets/images/screens/6_Step.jpg' },
      //     { image: '../../../assets/images/screens/7_Step.jpg' },
      //     { image: '../../../assets/images/screens/8_Step.jpg' },
      //     { image: '../../../assets/images/screens/9_Step.jpg' },
      //     { image: '../../../assets/images/screens/10_Step.jpg' },
      //     { image: '../../../assets/images/screens/11_Step.jpg' },
      //     { image: '../../../assets/images/screens/12_Step.jpg' },
      //     { image: '../../../assets/images/screens/13_Step.jpg' },
      //     { image: '../../../assets/images/screens/14_Step.jpg' },
      //     { image: '../../../assets/images/screens/15_Step.jpg' },
      //     { image: '../../../assets/images/screens/16_Step.jpg' },
      //     { image: '../../../assets/images/screens/17_Step.jpg' },
      //     { image: '../../../assets/images/screens/18_Step.jpg' },
      //     { image: '../../../assets/images/screens/19_Step.jpg' },
      //     { image: '../../../assets/images/screens/20_Step.jpg' },
      //     { image: '../../../assets/images/screens/21_Step.jpg' },
      //     { image: '../../../assets/images/screens/22_Step.jpg' },
      //     { image: '../../../assets/images/screens/23_Step.jpg' },
      //     { image: '../../../assets/images/screens/24_Step.jpg' },
      //     { image: '../../../assets/images/screens/25_Step.jpg' },
      //     { image: '../../../assets/images/screens/26_Step.jpg' },
      //     { image: '../../../assets/images/screens/27_Step.jpg' },
      //     { image: '../../../assets/images/screens/28_Step.jpg' },
      //     { image: '../../../assets/images/screens/29_Step.jpg' },
      //     { image: '../../../assets/images/screens/30_Step.jpg' },
      //     { image: '../../../assets/images/screens/31_Step.jpg' },
      //     { image: '../../../assets/images/screens/32_Step.jpg' },
      //     { image: '../../../assets/images/screens/33_Step.jpg' },
      //     { image: '../../../assets/images/screens/34_Step.jpg' },
      //     { image: '../../../assets/images/screens/35_Step.jpg' },
      //     { image: '../../../assets/images/screens/36_Step.jpg' },
      //     { image: '../../../assets/images/screens/37_Step.jpg' },
      //     { image: '../../../assets/images/screens/38_Step.jpg' },
      //     { image: '../../../assets/images/screens/39_Step.jpg' },
      //     { image: '../../../assets/images/screens/40_Step.jpg' },
      //     { image: '../../../assets/images/screens/41_Step.jpg' },
      //     { image: '../../../assets/images/screens/42_Step.jpg' }
      // ];
    
  }

  close(): void {
    this.bsModalRef.hide();
  }

}
