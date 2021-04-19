import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Recipe, IDisplay } from '../recipe.model';
import { combineLatest, Observable, of, Subject, merge } from 'rxjs';
import { tap, switchMap, map, concatMap, mapTo, single, take } from 'rxjs/operators';
import { RecipeService } from '../recipe.service';
import { Router, ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-price-tier',
  templateUrl: './price-tier.component.html',
  styleUrls: ['./price-tier.component.css'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
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
  @Input() tier: number[];

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
          })
        );
      })
    );

    /*     this.recipes$ = this.recipeService.getRecipesWithinTier(this.tier);
        this.recipeService.recipeRestrictions.subscribe((restrictions: string[]) => {
          console.log(`received new restrictions, ${this.recipes.length}`)
          this.recipes = this.fullRecipes.filter((recipe) => {
            restrictions.every(restriction =>
              recipe.diet.includes(restriction)
            );
          })
        }); */

  }

  hideCardWithHTMLElement(title: string) {
    let card = document.getElementById(`${title}card`);
    if (card.classList.contains('hidden')) {
      card.className = '';
    } else card.className = 'hidden';
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