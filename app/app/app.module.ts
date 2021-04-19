import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
// import '@angular/compiler';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AppComponent } from './app.component';
import { RecipeTitleComponent } from './recipe-title/recipe-title.component';
import { RecipeIngredientsComponent } from './recipe-ingredients/recipe-ingredients.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { RecipeSkeletonComponent } from './recipe-skeleton/recipe-skeleton.component';
import { PriceTierComponent } from './price-tier/price-tier.component';
import { SupermarketLocationComponent } from './supermarket-location/supermarket-location.component';
import { RecipeProductsComponent } from './recipe-products/recipe-products.component';
import { RecipeService } from './recipe.service';
import { ProductService } from './product.service';
import { InfrastructureService } from './infrastructure.service';
import { FilterComponent } from './filter/filter.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RecipePriceComponent } from './recipe-price/recipe-price.component';
import { TimerComponent } from './timer/timer.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { TimerDirective } from './timer.directive';
import { TimePipe } from './time.pipe';
import { AboutComponent } from './about/about.component';
import { RangeInputComponent } from './range-input/range-input.component';
import { HamburgerButtonComponent } from './hamburger-button/hamburger-button.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    RecipeTitleComponent,
    PriceTierComponent,
    SupermarketLocationComponent,
    RecipeProductsComponent,
    RecipeIngredientsComponent,
    RecipeSkeletonComponent,
    RecipePriceComponent,
    TimerComponent,
    FilterComponent,
    PageNotFoundComponent,
    TimerDirective,
    TimePipe,
    AboutComponent,
    RangeInputComponent,
    HamburgerButtonComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
  ],
  providers: [
    InfrastructureService,
    RecipeService,
    ProductService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
