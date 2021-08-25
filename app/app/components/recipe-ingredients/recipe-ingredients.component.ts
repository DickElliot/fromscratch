// Angular
import { Input, Component, OnInit } from '@angular/core';
// Classes
import { Recipe } from "../../classes/IRecipe";
// Services
import { RecipeService } from '../../services/recipe.service';

@Component({
  selector: "app-recipe-ingredients",
  templateUrl: "./recipe-ingredients.component.html",
  styleUrls: ["./recipe-ingredients.component.css"],
})
/** 
* Container that displays ingredients, received from input,
* updated from Skeleton component. 
*/
export class RecipeIngredientsComponent implements OnInit {
  @Input() recipe: Recipe;
  constructor(private recipeService: RecipeService) { }

  ngOnInit() {
    this.recipeService.currentRecipe.subscribe((recipe) => {
      this.recipe = recipe;
    });
  }

  isItem(unit: string): boolean {
    let hide: boolean = false;
    if (unit == 'item') hide = true;
    return hide;
  }
}
