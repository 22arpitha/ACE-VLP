import { Component, OnInit } from '@angular/core';
import { CommonServiceService } from '../../../service/common-service.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss']
})
export class CountryComponent implements OnInit {
  BreadCrumbsTitle:any='Country';
  countryForm:FormGroup

  constructor(
    private common_service:CommonServiceService, private fb:FormBuilder
  ) { }

  ngOnInit(): void {
    this.common_service.setTitle(this.BreadCrumbsTitle);
    this.intialForm();
  }

  intialForm(){
    this.countryForm = this.fb.group({
      country_name: ['',Validators.required]
    })
  }
}
