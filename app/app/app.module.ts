// Modules
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// Components
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AppComponent } from './app.component';
import { RecipeTitleComponent } from './components/recipe-title/recipe-title.component';
import { RecipeIngredientsComponent } from './components/recipe-ingredients/recipe-ingredients.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { RecipeSkeletonComponent } from './components/recipe-skeleton/recipe-skeleton.component';
import { PriceTierComponent } from './components/price-tier/price-tier.component';
import { SupermarketLocationComponent } from './components/supermarket-location/supermarket-location.component';
import { RecipeProductsComponent } from './components/recipe-products/recipe-products.component';
import { FilterComponent } from './components/filter/filter.component';
import { RecipePriceComponent } from './components/recipe-price/recipe-price.component';
import { TimerComponent } from './components/timer/timer.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { HamburgerButtonComponent } from './components/hamburger-button/hamburger-button.component';
// Services
import { RecipeService } from './services/recipe.service';
import { ProductService } from './services/product.service';
import { UtilitiesService } from './services/utilities.service';
// Directives
import { TimerDirective } from './directives/timer.directive';
// Pipes
import { TimePipe } from './pipes/time.pipe';


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
    UtilitiesService,
    RecipeService,
    ProductService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
