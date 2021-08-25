import { Ingredient } from './IIngredient';

export interface IRecipe {
  id: number;
  title: string;
  diet?: string;
  servingSize?: string;
  prepTime: string;
  cookTime: string;
  method?: string[];
  ingredients?: Ingredient[];
  price?: number;
  totalCookTime?: string;
}
export interface IDisplay {
  display?: boolean;
}

export class Recipe implements IRecipe {
  id: number;
  title: string;
  diet?: string;
  servingSize?: string;
  prepTime: string;
  cookTime: string;
  method?: string[];
  ingredients?: Ingredient[];
  price?: number;
  totalCookTime?: string;
  constructor(obj?: any) {
    this.id = obj && obj.id || null;
    this.title = obj && obj.title || null;
    this.diet = obj && obj.diet || null;
    this.servingSize = obj && obj.servingsize || null;
    this.prepTime = obj && obj.preptime || null;
    this.cookTime = obj && obj.cooktime || null;
    this.method = obj && obj.method || null;
    this.ingredients = this.createIngredients(obj.ingredients);
    this.price = 0;
  }

  private createIngredients(recipeIngredientsText: string): Ingredient[] {
    let ingredients: Ingredient[] = [];
    let ingredientsText: string[] = recipeIngredientsText.toLocaleString().split(/\[\[\d+\]\]/);
    let index: number = ingredientsText.indexOf('', 0);
    if (index > -1) {
      ingredientsText.splice(index, 1);
    }
    for (let i = 0; i < ingredientsText.length; i++) {
      let ingredient: Ingredient = new Ingredient(ingredientsText[i], this.title);
      ingredients.push(ingredient);
    }
    return ingredients;
  }

  getIngredientsText(): string[] {
    let ingredientsText: string[] = [];
    for (let ingredient of this.ingredients) {
      ingredientsText.push(ingredient.originalText);
    }
    return ingredientsText;
  }

  getTotalCookTimeInMinutes(): string {
    let time: string;
    let prep: number = 0;
    let cook: number = 0;
    if (this.prepTime.includes(' minus ')) {
      let prepTimeArray = this.prepTime.split(' minus ');
      prep = this.stringToMinutes(prepTimeArray[0]) - this.stringToMinutes(prepTimeArray[1]);
    } else { prep = this.stringToMinutes(this.prepTime); }
    cook = this.stringToMinutes(this.cookTime);
    this.prepTime = prep.toString() + 'M';
    time = (prep + cook).toString();
    return time;
  }

  private stringToMinutes(time: string): number {
    let result: number = 0;
    let hourPattern: RegExp = /[\d]+H/gi;
    let minutePattern: RegExp = /[\d]+M/gi;
    if (hourPattern.test(time)) {
      let hours: RegExpMatchArray = time.match(hourPattern);
      for (let h of hours) {
        result += (Number(h.replace('H', '').trim()) * 60);
      }
    }
    if (minutePattern.test(time)) {
      let minutes: RegExpMatchArray = time.match(minutePattern);
      for (let m of minutes) {
        result += (Number(m.replace('M', '').trim()));
      }
    }
    return result;
  }

  updatePriceFromCurrentIngredients(): number {
    let price: number = 0;
    for (let i = 0; i < this.ingredients.length; i++) {
      price += this.ingredients[i].currentProduct.purchasePrice;
    }
    this.price = price;
    return this.price;
  }
}

