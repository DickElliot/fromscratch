import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecipeSkeletonComponent } from './recipe-skeleton/recipe-skeleton.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SupermarketLocationComponent } from './supermarket-location/supermarket-location.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

const routes: Routes = [
  { path: 'store-choice', component: SupermarketLocationComponent },
  { path: 'recipe/:title', component: RecipeSkeletonComponent },
  { path: '', component: DashboardComponent },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
