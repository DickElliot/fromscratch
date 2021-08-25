// Angular
import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// Classes
import { Recipe } from '../../classes/IRecipe';
import { Ingredient } from '../../classes/IIngredient';
import { IPricedProduct, PricedProduct } from '../../classes/IProduct';
// Services
import { ProductService } from '../../services/product.service';
import { RecipeService } from '../../services/recipe.service';
import { ShoppingListService } from '../../services/shopping-list.service';


@Component({
  selector: 'app-recipe-products',
  templateUrl: './recipe-products.component.html',
  styleUrls: ['./recipe-products.component.css'],
})

/** 
 * Component that displays the current products matched for the 
 * recipe & allows user to choose select different products for 
 * each ingredient, adding them to a web-wide accessible 'Grocery list'. 
 */
export class RecipeProductsComponent implements OnInit {
  @Input() recipe: Recipe;
  productList: Ingredient[];
  shoppingListPrice: number;
  selectedProduct: IPricedProduct = null;
  titleText = 'Groceries';
  ingredientFormGroup: FormGroup;
  isShown: boolean = false;
  constructor(
    private productService: ProductService,
    private recipeService: RecipeService,
    private formBuilder: FormBuilder,
    private listService: ShoppingListService
  ) {
    this.ingredientFormGroup = formBuilder.group({
    });

  }

  /**
   * Creates the list through the input recipe, 
   * then updates it through a subscription to
   * the current recipe. 
   */
  ngOnInit(): void {
    console.log('recipe-products component');
    this.createProductList();
    for (let i = 0; i < this.recipe.ingredients.length; i++) {
      this.ingredientFormGroup.addControl(i.toString(), this.formBuilder.control('', [Validators.required]));
    }
    this.ingredientFormGroup.valueChanges.subscribe((result: any) => {
      let update = false;
      for (const [key, value] of Object.entries(result)) {
        if (value !== '') {
          update = true;
          let oldTitle = this.recipe.ingredients[key].currentProduct.title;
          let newTitle = result[key].title;
          let oldPrice: number = this.recipe.ingredients[key].currentProduct.purchasePrice;
          let newPrice: number = result[key].purchasePrice;
          if (oldTitle != newTitle && oldPrice != newPrice) {
            this.recipe.price = this.recipe.price - oldPrice + newPrice;
            this.shoppingListPrice = this.recipe.price;
            this.recipe.ingredients[key].currentProduct = result[key];
          }
        }
      }
      if (update) {
        console.log('updating current Recipe');
        this.recipeService.currentRecipe.next(this.recipe);
      };
    });
  }


  /** 
   * Creates the shopping list & price from the 
   * recipe ingredients current product property.
   */
  createProductList() {
    this.shoppingListPrice = 0;
    this.productList = [];
    for (let ingredient of this.recipe.ingredients) {
      if (ingredient.currentProduct) {
        console.log('createProductList');
        this.productList.push(ingredient);
        this.shoppingListPrice += Number(ingredient.currentProduct.purchasePrice);
      }
    }
  }

  /**
   * Sends the current shopping list & shopping list price to 
   * the Product Service, which then updates the website-wide
   * shopping list menu
   */
  addToShoppingList(): void {
    console.log('Product component addToShoppingList');
    let products: PricedProduct[] = [];
    this.productList.forEach((ingredient) => {
      products.push(ingredient.currentProduct);
    });
    this.listService.addToShoppingList(products, Number(this.recipe.servingSize), this.recipe.title);
  }

  thisChosen(product: IPricedProduct) {
    console.log(product.title);
  }
  /**
   *  Changes component title text 
   */
  hoverTitle(): void {
    this.titleText = 'Add to Shopping List';
  }
  /** 
    * Reverts component title text 
    */
  normalTitle(): void {
    this.titleText = 'Groceries';
  }

  toggleWidth() {
    this.isShown = !this.isShown;
  }


}

