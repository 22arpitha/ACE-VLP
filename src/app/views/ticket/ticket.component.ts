import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss'],
  standalone:false
})
export class TicketComponent implements OnInit {



  constructor(private router: Router) {
  console.log(this.router.config);
}

  ngOnInit(): void {
  }

}
