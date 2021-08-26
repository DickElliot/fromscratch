import { Subject } from 'rxjs';
// Angular
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// RxJs
import { debounceTime, take } from 'rxjs/operators';
// Services
import { RecipeService } from '../../services/recipe.service';
import { UtilitiesService } from '../../services/utilities.service';


@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
/**
 * This component sits in the Dashboard. The user is able to
 * to filter the recipes according to dietary restrictions, 
 * serving size & price. 
 */
export class FilterComponent implements OnInit {
  dietForm: FormGroup;
  servingSizeForm: FormGroup;
  private currentPriceRange: Subject<number[]> = new Subject<number[]>();
  priceRange: number[] = [];
  ready: boolean = false;
  private servingSizeSelection: string[] = [];
  private dietRestrictions = {
    Vegetarian: false,
    Vegan: false,
    GlutenFree: false,
  }
  supermarketLocation: string = '';
  urlPrefix = '';
  constructor(
    private recipeService: RecipeService,
    private UtilitiesService: UtilitiesService,
    formBuilder: FormBuilder
  ) {
    this.urlPrefix = this.UtilitiesService.getURLPrefix();
    this.dietForm = formBuilder.group({
      Vegetarian: [false],
      Vegan: [false],
      GlutenFree: [false]
    });
    this.servingSizeForm = formBuilder.group({
      servingSize: [, { validators: [Validators.pattern(/\d+/)] }],
    });
  }
  /**
   * Initialization, records filter form results and corresponding affect
   * from their effect on recipes.
   */
  ngOnInit(): void {
    this.currentPriceRange.pipe(debounceTime(100)).subscribe((range) => {
      this.recipeService.setPriceRange(range);
    });
    this.recipeService.recipesPriceRange.pipe(take(1)).subscribe((range) => {
      this.priceRange = [Math.floor(range[0]), Math.ceil(range[1])];
      this.ready = true;
    });
    this.dietForm.valueChanges.subscribe((result) => {
      let newDietRestrictions: string[] = []
      for (let key in result) {
        if (this.dietRestrictions[key] !== result[key]) {
          newDietRestrictions.push(key);
          this.dietRestrictions[key] = result[key];
        }
      }
      if (newDietRestrictions.length > 0) {
        this.recipeService.recipeRestrictions.next(newDietRestrictions);
      }
    });
    this.servingSizeForm.valueChanges.pipe(debounceTime(500)).subscribe((result) => {
      if (result['servingSize'] !== this.servingSizeSelection) {
        this.servingSizeSelection = result['servingSize'];
        this.recipeService.setServingSizeRecipes(Number(this.servingSizeSelection));
      }
    });
  }

  /**
   * Uses CSS styling to expand the filter on hover
   */
  showFilter(): void {
    let filterContainer: HTMLElement = document.getElementById('filter-container');
    let filterForm: HTMLElement = document.getElementById('filter-content');
    const filterText: HTMLElement = document.getElementById('filter-icon');
    if (filterContainer.style.height === '3vh') {
      filterText.style.display = 'none';
      filterContainer.style.height = 'min-content';
      filterContainer.style.height = '-moz-min-content';
      filterForm.style.display = 'flex';
    } else {
      filterText.style.display = 'flex';
      filterContainer.style.height = '3vh';
      filterForm.style.display = 'none';
    }
  }

  onPriceRangeChange($event) {
    this.currentPriceRange.next($event);
  }

}
