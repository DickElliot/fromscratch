import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IShoppingListIngredient } from '../classes/IIngredient';
import { ShoppingList } from '../classes/ShoppingList';
import { PricedProduct } from '../classes/IProduct';

@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {
  shoppingListObject: ShoppingList = new ShoppingList();
  shoppingList: Subject<IShoppingListIngredient[]> = new Subject<IShoppingListIngredient[]>();
  productsUpdated: Subject<boolean> = new Subject<boolean>();
  constructor() {
    this.shoppingList.pipe(tap(() => console.log('shopping list updating')));
  }

  /**
   * Add ingredients to the shopping list with their corresponding serving size
   * @param productList 
   * @param servingSize 
   */
  addToShoppingList(productList: PricedProduct[], servingSize: number, recipe: string) {
    this.shoppingListObject.addProducts(productList, servingSize, recipe);
    this.productsUpdated.next(true);
  }

  buyItem(item: string) {
    this.shoppingListObject.buyItem(item);
  }

}
