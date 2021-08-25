import { Injectable } from '@angular/core';
import { Matcher } from '../classes/Matcher';
import { IProduct } from '../classes/IProduct';
import { Ingredient } from '../classes/IIngredient';
import { Recipe } from '../classes/IRecipe';
@Injectable({
  providedIn: 'root'
})
export class MatchingService {
  private matcher: Matcher;
  constructor() { }

  setProducts(products: IProduct[]) {
    // products.forEach((product) => console.log(product["volumeSize"]));
    this.matcher = new Matcher(products);
  }

  matchProducts(input: Ingredient | Recipe | Recipe[]) {
    this.matcher.matchProducts(input);
  }

}
