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
  imageSlides: any = []
  constructor(
    public bsModalRef: BsModalRef
  ) { }

  ngOnInit(): void {
    this.carouselImages();
  }
  carouselImages() {
    if (sessionStorage.getItem('user_role_name') === 'Admin') {
      this.imageSlides = [
        { image: '../../../assets/images/Screenshots/step 1.png' },
        { image: '../../../assets/images/Screenshots/step 2.png' },
        { image: '../../../assets/images/Screenshots/step 3.png' },
        { image: '../../../assets/images/Screenshots/step 4.png' },
        { image: '../../../assets/images/Screenshots/step 5.png' },
        { image: '../../../assets/images/Screenshots/step 6.png' },
        { image: '../../../assets/images/Screenshots/step 7.png' },
        { image: '../../../assets/images/Screenshots/step 8.png' },
        { image: '../../../assets/images/Screenshots/step 9.png' },
        { image: '../../../assets/images/Screenshots/step 10.png' },
        { image: '../../../assets/images/Screenshots/step 12.png' },
        { image: '../../../assets/images/Screenshots/step 13.png' },
        { image: '../../../assets/images/Screenshots/step 14.png' },
        { image: '../../../assets/images/Screenshots/step 15.png' },
        { image: '../../../assets/images/Screenshots/step 16.png' },
        { image: '../../../assets/images/Screenshots/step 17.png' },
        { image: '../../../assets/images/Screenshots/step 18-1.png' },
        { image: '../../../assets/images/Screenshots/step 18.png' },
        { image: '../../../assets/images/Screenshots/step 19.png' },
        { image: '../../../assets/images/Screenshots/step 20.png' },
        { image: '../../../assets/images/Screenshots/step 21.png' },
        { image: '../../../assets/images/Screenshots/step 22.png' }
      ];
    } else if (sessionStorage.getItem('user_role_name') === 'SuperAdmin') {
      this.imageSlides = [];
    }
    else if (sessionStorage.getItem('user_role_name') === 'Employee') {
      let designation:any = sessionStorage.getItem('designation');
      if (designation.toLowerCase().includes('manager')) {
        // console.log('The string contains "manager".');
        this.imageSlides = [
          { image: '../../../assets/images/Screenshots/projectslist.png' },
          { image: '../../../assets/images/Screenshots/CreateProjects.png' },
          { image: '../../../assets/images/Screenshots/step 12.png' },
          { image: '../../../assets/images/Screenshots/step 13.png' },
          { image: '../../../assets/images/Screenshots/step 14.png' },
          { image: '../../../assets/images/Screenshots/step 15.png' },
          { image: '../../../assets/images/Screenshots/step 16.png' },
          { image: '../../../assets/images/Screenshots/step 17.png' },
          { image: '../../../assets/images/Screenshots/step 18-1.png' },
          { image: '../../../assets/images/Screenshots/step 18.png' },
          { image: '../../../assets/images/Screenshots/step 19.png' },
          { image: '../../../assets/images/Screenshots/step 20.png' },
        ]
      } else {
        // console.log('The string does not contain "manager".');
        this.imageSlides = [
          { image: '../../../assets/images/Screenshots/projectslist.png' },
          { image: '../../../assets/images/Screenshots/CreateProjects.png' },
          { image: '../../../assets/images/Screenshots/step 12.png' },
          { image: '../../../assets/images/Screenshots/step 13.png' },
          { image: '../../../assets/images/Screenshots/step 14.png' },
          { image: '../../../assets/images/Screenshots/step 15.png' },
          { image: '../../../assets/images/Screenshots/step 16.png' },
          { image: '../../../assets/images/Screenshots/step 17.png' },
          { image: '../../../assets/images/Screenshots/step 18-1.png' },
        ]
      }
     
    }
  }

  close(): void {
    this.bsModalRef.hide();
  }

}
