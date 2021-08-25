// Angular
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-hamburger-button',
  templateUrl: './hamburger-button.component.html',
  styleUrls: ['./hamburger-button.component.css']
})

/**
 *  A button that looks like a burger.
 */
export class HamburgerButtonComponent implements OnInit {
  @Input() color;
  borderStyle: string;
  constructor() { }

  ngOnInit(): void {
    this.borderStyle = `2px solid ${this.color}`;

  }


}
