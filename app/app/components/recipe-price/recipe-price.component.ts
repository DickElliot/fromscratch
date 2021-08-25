// Angular
import { Component, OnInit, Input } from '@angular/core';
import { trigger, state, style, animate, transition, sequence } from '@angular/animations';
// RxJs
import { Observable } from 'rxjs';
// Classes
import { Recipe } from '../../classes/IRecipe';
// Services
import { RecipeService } from '../../services/recipe.service';


@Component({
  selector: 'app-recipe-price',
  animations: [
    trigger('newPrice', [
      state('change', style({
        opacity: 1,
        color: 'green',
        backgroundColor: 'gold'
      })),
      state('*', style({
        opacity: 0.9,
        color: 'gold',
      })),
      transition('* => *',
        sequence([
          animate('0.5s', style({
            opacity: 1,
            color: 'green',
            backgroundColor: 'gold'
          })),
          animate('2s 0.6s')
        ]),
      ),
    ])],
  templateUrl: './recipe-price.component.html',
  styleUrls: ['./recipe-price.component.css']
})
/** 
 * Container that displays the recipe price, updated
 * from the Skeleton component & then the current
 * recipe subscription from the Recipe Service.
 */
export class RecipePriceComponent implements OnInit {
  @Input() recipe: Recipe;
  recipePrice: number;
  currentRecipe: Observable<Recipe>;
  isShown: boolean = false;
  constructor(public recipeService: RecipeService) {
  }

  ngOnInit(): void {
    this.recipePrice = this.recipe.price;
    this.recipeService.currentRecipe.subscribe((recipe) => {
      if (this.recipePrice != recipe.price) {
        this.recipePrice = recipe.price;
      }
    });
  }
  toggleWidth() {
    this.isShown = !this.isShown;
  }
}
