import { Component, OnInit } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InfrastructureService } from '../infrastructure.service';

@Component({
  // changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css',],
})
/**
 * Contains the price-tier components & filter component, 
 * which in turn allow access to the recipes. 
 */
export class DashboardComponent implements OnInit {
  priceTiers: ReplaySubject<number[][]> = new ReplaySubject<number[][]>();
  recipeCount: number;
  displayLoading: string = 'auto';
  pricedRecipeCount: number = 0;
  countdown: number;
  recipePricePercentage: Observable<number> = new Observable<number>();
  constructor(
    private infrastructureService: InfrastructureService,
  ) { }

  /**
   * Initialization, Sets the header text & subscribes to any changes in the
   * price-tier layout, both through an instance RecipeService.
   */
  ngOnInit(): void {

    document.body.classList.remove('recipeBackground');
    this.infrastructureService.setHeaderText('from scratch');
    this.recipeCount = this.infrastructureService.recipeCount;
    this.priceTiers = this.infrastructureService.getTierValues();
    this.recipePricePercentage = this.infrastructureService.getPercentageOfRecipesPriced().pipe(tap((percent) => {
      if (percent == 100) {
        this.displayLoading = 'none';
      }
      this.pricedRecipeCount = percent;
    }));
  }


}
