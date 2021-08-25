// Angular
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// RxJs
import { debounceTime, take } from 'rxjs/operators';
// Services
import { RecipeService } from '../../services/recipe.service';
import { ProductService } from '../../services/product.service';
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
  priceRangeForm: FormGroup;
  servingSizeForm: FormGroup;

  // Dummy values in price range for form initialization
  priceRange: number[] = [1, 120];
  minMax: number;
  priceRangeSelection: number[] = [1, 120];
  show: boolean = false;
  dietRestrictionSelection: string[] = ['', '', ''];
  private servingSizeSelection: string[] = [];
  // Options for the dietary restriction section of the form, to allow efficient checking
  private dietRestrictionOptions: string[] = ['Vegetarian', 'Vegan', 'GlutenFree'];
  supermarketLocation: string = '';
  urlPrefix = '';
  constructor(
    private recipeService: RecipeService,
    private productService: ProductService,
    private UtilitiesService: UtilitiesService,
    formBuilder: FormBuilder
  ) {
    this.urlPrefix = this.UtilitiesService.getURLPrefix();
    this.dietForm = formBuilder.group({
      Vegetarian: [false],
      Vegan: [false],
      GlutenFree: [false]
    });
    this.priceRangeForm = formBuilder.group({
      // priceFloor: [this.priceRange[0]],
      // priceCeiling: [this.priceRange[1]],
    })
    this.servingSizeForm = formBuilder.group({
      servingSize: [, { validators: [Validators.pattern(/\d+/)] }],
    });

  }
  /**
   * Initialization, records filter form results and corresponding affect
   * from their effect on recipes.
   */
  ngOnInit(): void {
    this.recipeService.recipesPriceRange.pipe(take(1)).subscribe((range) => {
      this.priceRange, this.priceRangeSelection = range;
      this.minMax = (this.priceRange[1] + this.priceRange[0]) / 2;
      this.priceRangeForm.setValue({ priceFloor: range[0], priceCeiling: range[1] });
    });
    // Includes shortcut & reminder of supermarket location
    this.productService.currentLocation.subscribe((location) => {
      this.supermarketLocation = location;
    });

    this.dietForm.valueChanges.subscribe((result) => {
      let newDietOptions: string[] = [];
      for (let restriction of this.dietRestrictionOptions) {
        if (result[restriction]) {
          newDietOptions.push(restriction);
        }
      }
      if (newDietOptions != this.dietRestrictionSelection) {
        this.dietRestrictionSelection = newDietOptions;
        this.recipeService.recipeRestrictions.next(this.dietRestrictionSelection);
      }
    });
    // Debounce to stop data flooding
    this.priceRangeForm.valueChanges.pipe(debounceTime(500)).subscribe((result) => {
      if (result['priceFloor'] != this.priceRangeSelection[0] || result['priceCeiling'] != this.priceRangeSelection[1]) {
        if (result['priceCeiling'] > result['priceFloor']) {
          this.priceRangeSelection = [result['priceFloor'], result['priceCeiling']];
          this.recipeService.setPriceRange(this.priceRangeSelection);
        }
      }
    });

    this.servingSizeForm.valueChanges.pipe(debounceTime(500)).subscribe((result) => {
      if (result['servingSize'] != this.servingSizeSelection) {
        console.log(`New serving size of ${result['servingSize']}`);
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
    if (filterContainer.style.height == '3vh') {
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

  updatePriceRange(value: string) {
    console.log(`new value: ${value}`);
  }
}
