import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, Observable, ReplaySubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { IRecipe, Recipe } from '../classes/IRecipe';
import { ProductService } from '../services/product.service';
import { MatchingService } from '../services/matching.service';
import { UtilitiesService } from '../services/utilities.service';
import { Ingredient } from '../classes/IIngredient';


@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  currentRecipe: Subject<Recipe> = new ReplaySubject<Recipe>(1);
  private recipePool: Recipe[] = [];
  currentRecipes: Subject<Recipe[]> = new ReplaySubject<Recipe[]>(1);
  private recipeCount: number = 0;
  recipeRestrictions: Subject<string[]> = new Subject<string[]>();
  recipesPriceRange: Subject<number[]> = new ReplaySubject<number[]>();
  private currentLocation: string;
  private urlPrefix = this.UtilitiesService.getURLPrefix();
  private recipeRetrieverURL: string = `${this.urlPrefix}backend/recipeRetriever.php/?`
  private recipeMethodRetrieverURL: string = `${this.urlPrefix}backend/recipeMethodRetriever.php/?`;
  constructor(
    private http: HttpClient,
    private productService: ProductService,
    private UtilitiesService: UtilitiesService,
    private matchingService: MatchingService,
  ) {

    this.productService.currentLocation.subscribe((location: string) => {
      this.currentLocation = location;
      let exists: boolean = false;
      this.UtilitiesService.checkIfCollectionExistsInMongoDB(this.currentLocation).toPromise().then((result) => exists = result).finally(() => {
        if (exists) {
          this.UtilitiesService.downloadRecipeModels(this.currentLocation).subscribe((recipes: Recipe[]) => {
            this.updateCurrentRecipes(recipes);
          });
        } else {
          this.downloadRecipes();
        }
      });
    });
  }

  updateCurrentRecipes(recipes: Recipe[]) {
    let sortedRecipes = recipes.sort((a, b) => a.price - b.price);
    this.recipesPriceRange.next([sortedRecipes[0].price, sortedRecipes[sortedRecipes.length - 2].price]);
    this.UtilitiesService.setTierValues(sortedRecipes);
    this.recipePool = recipes.slice();
    this.currentRecipes.next(sortedRecipes);
  }

  setServingSizeRecipes(servingSize: number) {
    let updatedRecipes: Recipe[] = this.recipePool.slice();
    for (let i = 0; i < updatedRecipes.length; i++) {
      if (servingSize.toString() !== updatedRecipes[i].servingSize) {
        updatedRecipes[i] = this.setServingSizeRecipe(servingSize, updatedRecipes[i]);
      }
    }
    this.updateCurrentRecipes(updatedRecipes);
  }

  setPriceRange(range: number[]) {
    let recipePoolCopy = this.recipePool.slice();
    let filteredRecipes = this.recipePool.slice();
    filteredRecipes = filteredRecipes.filter((recipe: Recipe) => (Math.floor(recipe.price) >= range[0] && Math.floor(recipe.price) < range[1]));
    if (filteredRecipes.length >= 4) this.updateCurrentRecipes(filteredRecipes);
    this.recipePool = recipePoolCopy;
  }

  setServingSizeRecipe(servingSize: number, recipe: Recipe): Recipe {
    let modifier = servingSize / Number(recipe.servingSize);
    for (let ingredient of recipe.ingredients) {
      let newQuantity = (Number(ingredient.quantity) * modifier).toPrecision(4);
      ingredient.setNewQuantity = (newQuantity);
    }
    recipe = this.calculateRecipePriceFromIngredients(recipe);
    recipe.servingSize = servingSize.toString();
    return recipe;
  }

  private downloadRecipes() {
    // Check if collection exists, use that. If not create recipes. 
    this.http.get<IRecipe[]>(`${this.recipeRetrieverURL}all_recipes`)
      .pipe(
        tap(recipesData => {
          let recipes: Recipe[] = [];
          recipesData.forEach(recipeData => {
            this.recipeCount++;
            let newRecipe: Recipe = new Recipe(recipeData);
            newRecipe.totalCookTime = newRecipe.getTotalCookTimeInMinutes();
            newRecipe.diet = recipeData['diet'];
            newRecipe.servingSize = recipeData['servingsize'].match(/[\d]+/)[0];
            recipes.push(newRecipe);
          });
          this.turnRecipesDataIntoRecipeModels(recipes);
          this.UtilitiesService.recipeCount = this.recipeCount;
        }),
      ).subscribe();
  }

  private turnRecipesDataIntoRecipeModels(recipesData: Recipe[]) {
    let unMatchedRecipes: Recipe[] = [];
    recipesData.forEach((recipe) => {
      let unfinished = false;
      for (let i = 0; i < recipe.ingredients.length; i++) {
        recipe.ingredients[i].clearMatchedProducts();
        this.matchingService.matchProducts(recipe.ingredients[i]);
        if (recipe.ingredients[i].currentProduct && Number(recipe.ingredients[i].currentProduct.purchasePrice)) {
          recipe.price += Number(recipe.ingredients[i].currentProduct.purchasePrice);
        }
        if (recipe.ingredients[i].currentProduct == null) {
          unfinished = true;
        }
      }
      recipe.price = Number(recipe.price.toPrecision(4));
      if (unfinished === true) {
        unMatchedRecipes.push(recipe);
      }
    });
    for (let recipe of unMatchedRecipes) {
      recipesData.splice(recipesData.indexOf(recipe), 1);
    }
    this.recipePool = recipesData;
    this.UtilitiesService.uploadRecipeModels(this.currentLocation, recipesData).subscribe((result) => console.log(result));
    this.updateCurrentRecipes(recipesData);
  }

  setRecipeRestriction(restrictions: string[]) {
    this.recipeRestrictions.next(restrictions);
  }

  setCurrentRecipe(recipe: Recipe): void {
    this.currentRecipe.next(recipe);
  }

  getRecipesWithinTier(tier: number[]): Observable<Recipe[]> {
    return this.currentRecipes.pipe(
      map((recipes: Recipe[]): Recipe[] => {
        return recipes.filter((recipe: Recipe) => (Math.floor(recipe.price) >= tier[0] && Math.floor(recipe.price) < tier[1]));
      })
    );
  }

  downloadRecipeMethod(recipeTitle: string): Observable<string[]> {
    let titleURL = encodeURI(recipeTitle.replace(/ /gi, '+'));
    const url = `${this.recipeMethodRetrieverURL}${titleURL}`;
    return this.http.get<string>(url).pipe(
      map((result) => {
        let methodAsArray = result.toLocaleString().trim().split(/\[\[[\d]+\]\]/);
        let index = methodAsArray.indexOf('');
        if (index !== -1) {
          methodAsArray.splice(index, 1);
        }
        return methodAsArray;
      }));
  }

  getRecipeIngredients(recipe: Recipe, ingredientsText: string[]): Ingredient[] {
    const recipeTitle: string = recipe.title;
    const ingredients: Ingredient[] = [];
    for (const ingredient of ingredientsText) {
      const ingredientObj = new Ingredient(ingredient, recipeTitle);
      ingredients.push(ingredientObj);
    }
    return ingredients;
  }

  calculateRecipePriceFromIngredients(recipe: Recipe): Recipe {
    recipe.price = 0;
    for (let i = 0; i < recipe.ingredients.length; i++) {
      if (recipe.ingredients[i].currentProduct && Number(recipe.ingredients[i].currentProduct.purchasePrice)) {
        recipe.price += recipe.ingredients[i].currentProduct.purchasePrice;
      }
    }
    return recipe;
  }
}



