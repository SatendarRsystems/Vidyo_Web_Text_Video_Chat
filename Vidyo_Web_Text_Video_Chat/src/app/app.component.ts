import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  /**
  * Description: Constructor of app component
  * @param object  router
  */
  constructor(private router: Router) {
  }

  /**
  * Description: oninit of app component
  */
  ngOnInit() {
    this.router.navigate(['']);
  }
}
