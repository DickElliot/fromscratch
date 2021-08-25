// Angular
import { Component, OnInit } from '@angular/core';
// RxJs
import { ReplaySubject } from 'rxjs';
// Services
import { UtilitiesService } from '../../services/utilities.service';
// Loading Animation
import { loadingChange } from './loading-animation'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css',],
  animations: [
    loadingChange,
  ]
})

/**
 * Contains the price-tier components & filter component.
 * 
 */
export class DashboardComponent implements OnInit {
  priceTiers: ReplaySubject<number[][]> = new ReplaySubject<number[][]>();
  loadingState: string = 'start-state';
  loading: boolean = true;
  constructor(
    private UtilitiesService: UtilitiesService,
  ) {
  }

  /**
   * Initialization, Sets the header text & subscribes to any changes in the
   * price-tier layout, both through an instance RecipeService.
   */
  ngOnInit(): void {
    document.body.classList.remove('recipeBackground');
    this.UtilitiesService.setHeaderText('from scratch');
    this.priceTiers = this.UtilitiesService.getTierValues();
  }

  setLoading(loading: any): void {
    this.loading = loading;
  }

  animateLoading(event: any): void {
    setTimeout(() => {
      this.loadingState === 'start-state' ? this.loadingState = 'loop-state' : this.loadingState = 'start-state';
    }, 400);
  }
}
