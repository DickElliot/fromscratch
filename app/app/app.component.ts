import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { InfrastructureService } from './infrastructure.service';
import { ShoppingListService } from './shopping-list.service';
import { ShoppingList } from './shopping-list';
import { Router } from '@angular/router';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent implements OnInit {
  shopList: ShoppingList;
  listUpdated: boolean = false;
  currentPageHeaderText: string;
  headerText: Observable<string> = new Observable<string>();
  supermarketLocation: string;
  navBarOpen: boolean = false;
  shoppingListOpen: boolean = false;
  supermarketSections: string[] = ['Fruit and Veg', 'Pantry', 'Fridge and Deli', 'Meat and Seafood'];
  constructor(
    // private productService: ProductService,
    private infrastructureService: InfrastructureService,
    private router: Router,
    private listService: ShoppingListService,
  ) {
  }
  ngOnInit(): void {
    this.shopList = this.listService.shoppingListObject;
    this.headerText = this.infrastructureService.headerText;
    this.listService.productsUpdated.subscribe((updated) => { this.listUpdated = updated });
  }


  /**
   * Displays the navigation elements i.e.
   * Navigation bar on the left, & shopping list on the right.
   * @param element 
   */
  toggleOpen(element: string) {
    if (element === 'nav') {
      this.navBarOpen = !this.navBarOpen;
    }
    else if (element === 'list') {
      if (this.navBarOpen) this.navBarOpen = !this.navBarOpen;
      this.shoppingListOpen = !this.shoppingListOpen;
      this.listUpdated = !this.listUpdated;
    }
  }

  /**
   * Buys shopping list product
   * @param product 
   */
  buyItem(item: string) {
    this.listService.buyItem(item);
  }

  showTitle(): void {
    this.infrastructureService.setHeaderText(this.currentPageHeaderText);
  }

  showLocation(): void {
    this.currentPageHeaderText = document.getElementsByTagName('h1')[0].innerText;
    this.infrastructureService.setHeaderText('from scratch');
  }

  goTo(location: string) {
    this.toggleOpen('nav');
    if (location === '') {
      this.infrastructureService.setHeaderText('from scratch');
    }
    this.router.navigate([`/${location}`], { skipLocationChange: true });
  }

}

