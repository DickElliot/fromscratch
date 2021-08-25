// Angular
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
// RxJs
import { Observable, of, merge } from 'rxjs';
import { tap, map, switchMap } from 'rxjs/operators';
// Classes
import { Recipe } from '../../classes/IRecipe';
// Services
import { RecipeService } from '../../services/recipe.service';





@Component({
  selector: 'app-price-tier',
  templateUrl: './price-tier.component.html',
  styleUrls: ['./price-tier.component.css'],
})

/**
 * Component is input a range of prices and then requests the recipes
 * within that range. Achieved through RXJS allows configuration from 
 * services.
 */
export class PriceTierComponent implements OnInit {
  recipes$: Observable<Recipe[]> = new Observable<Recipe[]>();
  private restrictionsChange$: Observable<string[]>;
  private restrictions$: Observable<string[]>;
  selectedRecipe: string;
  display: boolean = true;
  @Input() tier: number[];
  @Output() loading = new EventEmitter<boolean>();
  constructor(
    private recipeService: RecipeService,
    private router: Router,
  ) {
    this.restrictionsChange$ = this.recipeService.recipeRestrictions;
    this.restrictions$ = of([]);
  }

  /**
   * Initialization, fetches the recipes within the price range & tracks the 
   * dietary changes, recipes are effected using CSS styles; allowing for quick
   * altering between hiding & showing.
   */
  ngOnInit(): void {
    // this.recipeService.getRecipesWithinTier(this.tier).pipe(take(1), tap((x) => console.log(`recipes being updated`))).subscribe((recipes) => this.recipes$ = of(recipes));
    this.recipes$ = this.recipeService.getRecipesWithinTier(this.tier).pipe(
      switchMap((recipes: Recipe[]) => {
        return merge(
          this.restrictions$,
          this.restrictionsChange$,
        ).pipe(
          map((restrictions: string[]) => {
            return recipes.filter(recipe => {
              return restrictions.every(restriction =>
                recipe.diet.includes(restriction)
              );
            });
          }),
          tap((recipes) => {
            this.loading.emit(false)
            if (recipes.length === 0) {
              this.display = false;
            }
          })
        );
      })
    );
  }

  /**
   * Allows loading of recipe from service
   * @param recipe recipe chosen
   */
  recipeWasChosen(recipe: Recipe): void {
    this.recipeService.currentRecipe.next(recipe);
    this.router.navigate(['/recipe', recipe.title.replace(/%20/g, '_')],
      { skipLocationChange: true }
    );
  }
}