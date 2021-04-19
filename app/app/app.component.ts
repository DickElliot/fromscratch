import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { ProductService } from './product.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Ingredient } from './ingredient.model';
import { InfrastructureService } from './infrastructure.service';
import { Router } from '@angular/router';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent implements OnInit, AfterViewChecked {
  shoppingList: Observable<Ingredient[]> = new Observable<Ingredient[]>();
  currentPageHeaderText: string;
  shoppingListPrice: Observable<number> = new Observable<number>();
  headerText: Observable<string> = new Observable<string>();
  supermarketLocation: string;
  navBarOpen: boolean = false;
  shoppingListOpen: boolean = false;
  supermarketSections = [
    'fruit-veg', 'meat-seafood', 'fridge-deli', 'pantry',
  ];
  constructor(private productService: ProductService,
    private infrastructureService: InfrastructureService,
    private router: Router,
  ) {
    this.supermarketLocation = this.productService.getDefaultLocation();
    this.productService.currentLocation.subscribe((location) => {
      this.supermarketLocation = location;
    });

  }
  ngOnInit(): void {
    this.headerText = this.infrastructureService.headerText;


  }

  ngAfterViewChecked(): void {
    this.shoppingList = this.productService.shoppingList.pipe(map((list) => list.sort((a, b) => {
      if (a.currentProduct.title < b.currentProduct.title) {
        return -1;
      }
      if (a.currentProduct.title > b.currentProduct.title) {
        return 1;
      }
      return 0;
    })));
    this.shoppingListPrice = this.productService.shoppingListPrice;
  }

  toggleOpen(element: string) {
    if (element == 'nav') {
      this.navBarOpen = !this.navBarOpen;
    }
    else if (element == 'list') {
      if (this.navBarOpen) this.navBarOpen = !this.navBarOpen;
      this.shoppingListOpen = !this.shoppingListOpen;
    }
  }

  prettifySection(section: string): string {
    const prettySections = ['Produce', 'Meat & Seafood', 'Fridge & Deli', 'Pantry'];
    let index = this.supermarketSections.indexOf(section);
    section = prettySections[index];
    console.log('section')
    return section
  }

  toggleSelected(i: number): void {
    const ingredientListItem = document.getElementById(i.toString());
    let oldPrice: number;
    let productPrice: number;
    this.productService.shoppingListPrice.subscribe((price) => oldPrice = price);
    this.productService.shoppingList.subscribe((list) => productPrice = list[i].currentProduct.purchasePrice);
    const chosen = ingredientListItem.style.textDecoration;
    if (chosen === 'line-through') {
      ingredientListItem.style.textDecoration = 'none';
      this.productService.shoppingListPrice.next(oldPrice + productPrice);
    } else {
      ingredientListItem.style.textDecoration = 'line-through';
      this.productService.shoppingListPrice.next(oldPrice - productPrice);
    }
  }

  showLocation(): void {
    this.currentPageHeaderText = document.getElementsByTagName('h1')[0].innerText;
    this.infrastructureService.setHeaderText('from scratch');
  }

  goTo(location: string) {
    this.toggleOpen('nav');
    this.router.navigate([`/${location}`], { skipLocationChange: true });
  }

  showTitle(): void {
    this.infrastructureService.setHeaderText(this.currentPageHeaderText);
  }

}

