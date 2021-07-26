import { Injectable } from '@angular/core';
import { Matcher } from './Matcher';
import { IProduct } from './IProduct';
import { Ingredient } from './ingredient.model';
import { Recipe } from './recipe.model';
@Injectable({
  providedIn: 'root'
})
export class MatchingService {
  private matcher: Matcher;
  constructor() {


  }

  setProducts(products: IProduct[]) {
    this.matcher = new Matcher(products);
  }

  matchProducts(input: Ingredient | Recipe | Recipe[]) {
    this.matcher.matchProducts(input);
  }

}
