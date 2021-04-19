import { Component, Input, OnInit } from '@angular/core';
import { RecipeService } from '../recipe.service';
import { Recipe } from '../recipe.model';
import { InfrastructureService } from '../infrastructure.service';

@Component({
  selector: 'app-recipe-title',
  templateUrl: './recipe-title.component.html',
  styleUrls: ['./recipe-title.component.css']
})
/** 
 * This component can be shown in the skeleton, 
 * however it's main use is to display details (e.g. 
 * diet, price, title) in a price-tier component.
 * These are asynchronous views of the recipes, allowing 
 * for component-external configuring. 
 */
export class RecipeTitleComponent implements OnInit {
  @Input() recipe: Recipe;
  totalCookTime = '';
  diets: string[] = [];
  urlPrefix = '';
  showDetails: boolean = false;
  constructor(
    private recipeService: RecipeService,
    private infrastructureService: InfrastructureService,
  ) {
    this.urlPrefix = this.infrastructureService.getURLPrefix();
  }

  ngOnInit() {
    this.totalCookTime = this.turnMinIntoHours(this.recipe.totalCookTime);
    this.getDiets();
  }

  /**
 * Generates the URL of diet images.
 * @param type of dietary restriction  
 * @returns url of dietary image
 */
  getDietImageUrl(type: string) {
    return `url(${this.urlPrefix}images/${type}.svg)`;
  }
  getClockImageUrl(): string {
    return `url(${this.urlPrefix}images/clock.svg)`;
  }
  getServingsizeImageUrl(): string {
    return `url(${this.urlPrefix}images/plate.svg)`;
  }

  toggleDetails() {
    this.showDetails = !this.showDetails;
  }
  /** 
   *  Turns the diet of a recipe into uniform codes, to also
   *  be used to source images.
   *  @return result the recipes dietary code
   */
  dietaryParser(): string {
    let result: string = '';
    if (this.recipe.diet.includes('Vegan')) {
      result = 'V';
    } else if (this.recipe.diet.includes('Vegetarian')) {
      result = 'Veg';
    } else if (this.recipe.diet.includes('GlutenFree')) {
      result = 'GF';
    }
    return result;
  }

  getDiets() {
    if (this.recipe.diet.includes('Vegan')) {
      this.diets.push('V');
    }
    if (this.recipe.diet.includes('Vegetarian')) {
      this.diets.push('Veg');
    }
    if (this.recipe.diet.includes('GlutenFree')) {
      this.diets.push('GF');
    }
  }

  /**
   * Allows access of Recipe away from component.
   */
  chooseRecipe(): void {
    this.recipeService.currentRecipe.next(this.recipe);
  }


  /**
   * Creates a uniform style of cooking-time.
   * @param time the Recipe's total (prep+cook) time
   * @return result Cooking-time
   */
  turnMinIntoHours(time: string): string {
    let result = '';
    let timeNum = Number(time);
    let hours = 0;
    let spareMinutes = 0;
    if (timeNum >= 60) {
      spareMinutes = timeNum % 60;
      hours = (timeNum - spareMinutes) / 60;
      if (spareMinutes == 0) {
        result = (hours + 'h');
      } else if (hours == 0) {
        result = spareMinutes + 'm';
      } else { result = (hours + 'h' + spareMinutes + 'm'); }
    } else { result = time + 'm'; }
    return result;
  }

  /**
   * Dynamic changing of the font-size.
   * @param title Recipe title
   */
  generateFontSize(title: string): number {
    let length = 2;
    let over: any = Math.max((title.length - 10) / 2, 1);
    over = over.toString().replace(over[0], over[0] + '.');
    length = length - Number(over);
    let em = Math.max(length, 0.8);
    return em;
  }

}
