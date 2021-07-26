import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, Observable, of, ReplaySubject, BehaviorSubject } from 'rxjs';
import { catchError, map, tap, shareReplay, switchMap } from 'rxjs/operators';
import { IRecipe, Recipe } from './recipe.model';
import { ProductService } from './product.service';
import { MatchingService } from './matching.service';
import { InfrastructureService } from './infrastructure.service';
import { Ingredient } from './ingredient.model';
import { IPricedProduct, IProduct } from './IProduct';

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
  private urlPrefix = this.infrastructureService.getURLPrefix();
  private recipeRetrieverURL: string = `${this.urlPrefix}backend/recipeRetriever.php/?`
  private recipeMethodRetrieverURL: string = `${this.urlPrefix}backend/recipeMethodRetriever.php/?`;
  constructor(
    private http: HttpClient,
    private productService: ProductService,
    private infrastructureService: InfrastructureService,
    private matchingService: MatchingService,
  ) {

    this.productService.currentLocation.subscribe((location: string) => {
      this.currentLocation = location;
      let exists: boolean = false;
      this.infrastructureService.checkIfCollectionExistsInMongoDB(this.currentLocation).toPromise().then((result) => exists = result).finally(() => {
        if (exists) {
          this.infrastructureService.downloadRecipeModels(this.currentLocation).subscribe((recipes: Recipe[]) => {
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
    this.recipesPriceRange.next([sortedRecipes[0].price, sortedRecipes[sortedRecipes.length - 1].price]);
    this.infrastructureService.setTierValues(sortedRecipes);
    this.recipePool = recipes.slice();
    // this.currentRecipes = of(sortedRecipes);
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
          console.time('all recipes');
          let recipes: Recipe[] = [];
          recipesData.forEach(recipeData => {
            this.recipeCount++;
            let newRecipe: Recipe = new Recipe(recipeData);
            newRecipe.totalCookTime = newRecipe.getTotalCookTimeInMinutes();
            newRecipe.diet = recipeData['diet'];
            newRecipe.servingSize = recipeData['servingsize'].match(/[\d]+/)[0];
            recipes.push(newRecipe);
          });
          // this.productService.productsProcessed.toPromise().finally(() => {
          console.log('promise broken')
          this.turnRecipesDataIntoRecipeModels(recipes);
          // });
          this.infrastructureService.recipeCount = this.recipeCount;
        }),
      ).subscribe();
  }

  private turnRecipeDataIntoRecipeModel(recipe: Recipe) {
    let unMatchedRecipes: Recipe[] = [];
    let unfinished = false;
    for (let i = 0; i < recipe.ingredients.length; i++) {
      recipe.ingredients[i].clearMatchedProducts();
      // recipe.ingredients[i] = this.matchingService.matchProducts(recipe.ingredients[i]);
      if (recipe.ingredients[i].currentProduct && Number(recipe.ingredients[i].currentProduct.purchasePrice)) {
        recipe.price += Number(recipe.ingredients[i].currentProduct.purchasePrice);
      }
      if (recipe.ingredients[i].currentProduct == null) {
        unfinished = true;
      }
    }
    this.infrastructureService.setPercentageOfRecipePriced(Math.ceil((this.recipePool.length / this.recipeCount) * 100));
    recipe.price = Number(recipe.price.toPrecision(4));
    if (unfinished == true) {
      unMatchedRecipes.push(recipe);
    }
    this.recipePool.push(recipe);
    this.addToCurrentRecipes();
  }

  private addToCurrentRecipes() {
    if (this.recipePool.length == this.recipeCount) {
      this.updateCurrentRecipes(this.recipePool);
    }
  }

  private turnRecipesDataIntoRecipeModels(recipesData: Recipe[]) {
    let unMatchedRecipes: Recipe[] = [];
    console.log(recipesData.length, 'recipe size');
    recipesData.forEach((recipe) => {
      let unfinished = false;
      if (recipe.ingredients.length !== recipe.getIngredientsText().length) {
        console.log(`text processing error for the ingredients of ${recipe.title}`);
      }
      for (let i = 0; i < recipe.ingredients.length; i++) {
        recipe.ingredients[i].clearMatchedProducts();
        // console.log('we get here alright');
        this.matchingService.matchProducts(recipe.ingredients[i]);
        // matchedProducts.forEach((product) => recipe.ingredients[i].addToMatchedProducts(product));
        // recipe.ingredients[i] = this.productService.matchProductsToIngredientUsing(recipe.ingredients[i]);
        if (recipe.ingredients[i].currentProduct && Number(recipe.ingredients[i].currentProduct.purchasePrice)) {
          recipe.price += Number(recipe.ingredients[i].currentProduct.purchasePrice);
        }
        if (recipe.ingredients[i].currentProduct == null) {
          // console.log(`${recipe.ingredients[i].parsedText}, null`);
          unfinished = true;
        }
      }
      this.infrastructureService.setPercentageOfRecipePriced(Math.ceil((recipesData.indexOf(recipe) / recipesData.length) * 100));
      recipe.price = Number(recipe.price.toPrecision(4));
      if (unfinished == true) {
        unMatchedRecipes.push(recipe);
      }
    });
    for (let recipe of unMatchedRecipes) {
      recipesData.splice(recipesData.indexOf(recipe), 1);
    }
    console.timeLog('all recipes');
    this.recipePool = recipesData;
    this.infrastructureService.uploadRecipeModels(this.currentLocation, recipesData).subscribe((result) => console.log(result));
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

  updateRecipePricesDatabase(ids: string[], prices: string[]): Observable<string> {
    let location = [];
    let currentLocation: string;
    this.productService.currentLocation.subscribe((location) => currentLocation = location);
    let databaseLocation = currentLocation.trim().replace(" ", "_").toLowerCase();
    for (let index = 0; index < ids.length; index++) {
      location.push(databaseLocation);
    }
    let combinedArray = {
      ids,
      prices,
      location
    };
    let updateRecipePricesDatabaseResult = this.http.post<any>('http://localhost/fromscratch/backend/recipePriceUpdater.php/', combinedArray);
    return updateRecipePricesDatabaseResult
      .pipe(
        tap((stringResult: any) => console.log(`added StringResult = ${stringResult}`)),
      );
  }

  updateCurrentRecipeFromData(newRecipe: Recipe) {
    this.productService.productsProcessed.toPromise().then().finally(() => {
      let ingredients = this.getRecipeIngredients(newRecipe, newRecipe.getIngredientsText());
      newRecipe.ingredients = ingredients;
      for (let i = 0; i < newRecipe.ingredients.length; i++) {
        this.matchingService.matchProducts(newRecipe.ingredients[i]);
      }
      newRecipe = this.calculateRecipePriceFromIngredients(newRecipe);
      newRecipe.price = Number(newRecipe.price.toPrecision(4));
      this.currentRecipe.next(newRecipe);
    });
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

  downloadRecipe(recipeTitle: string): Observable<Recipe> {
    let titleURL = recipeTitle.replace(/ /gi, '+');
    const url = `${this.recipeRetrieverURL}${titleURL}`;
    return this.http.get<Recipe>(url)
      .pipe(
        map(result => {
          let newRecipe: Recipe = new Recipe(result);
          newRecipe.totalCookTime = newRecipe.getTotalCookTimeInMinutes();
          newRecipe.diet = result['diet'];
          newRecipe.servingSize = result['servingsize'].match(/[\d]+/)[0];
          return newRecipe;
        }),
        tap(_ => console.log(`fetched recipe of title=${titleURL}`)),
      );
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



