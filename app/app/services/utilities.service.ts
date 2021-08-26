import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { Recipe } from '../classes/IRecipe';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class UtilitiesService {
  public headerText: Subject<string> = new BehaviorSubject<string>('from scratch');
  private recipePriceTiers: ReplaySubject<number[][]> = new ReplaySubject<number[][]>();
  private urlPrefix = this.getURLPrefix();
  private recipeModelDatabaseURL: string = `${this.urlPrefix}backend/recipeModelDatabase.php/?`;
  private recipeModelDatabaseCheckURL: string = `${this.urlPrefix}backend/recipeModelDatabaseCheck.php/?`;
  private getImageURL: string = `${this.urlPrefix}backend/getImage.php/?`;
  recipeCount: number;
  constructor(private http: HttpClient,
    private router: Router,
  ) { }

  /**
   * For switching between build & production
   * @returns url for back-end resources
   */
  getURLPrefix(): string {
    // server
    // let address = '';
    // local
    let address = 'http://localhost/fromscratch/';
    return address;
  }

  /**
   * Downloads recipe models with supermarket
   * @param supermarket current supermarket location
   */
  downloadRecipeModels(supermarket: string): Observable<Recipe[]> {
    let url = `${this.recipeModelDatabaseURL}${supermarket}`;
    return this.http.get<Recipe[]>(url);
  }

  /**
   * Checks if supermarket collection exists
   * @param supermarket current supermarket location
   */
  checkIfCollectionExistsInMongoDB(supermarket: string): Observable<boolean> {
    let supermarketURL = supermarket.replace(/ /gi, '_');
    let url = `${this.recipeModelDatabaseCheckURL}${supermarketURL}`;
    return this.http.get<boolean>(url);
  }

  /**
   * Uploads recipe models to supermarket
   * @param supermarket current supermarket location
   * @param recipes recipe models to upload
   */
  uploadRecipeModels(supermarket: string, recipes: Recipe[]): Observable<string> {
    let supermarketURL = supermarket.replace(/ /gi, '_');
    let url = `${this.recipeModelDatabaseURL}${supermarketURL}`;
    return this.http.post<any>(url, recipes);
  }

  setHeaderText(newText: string) {
    this.headerText.next(newText);
  }

  getHeaderText(): Observable<string> {
    return this.headerText;
  }

  getTierValues(): ReplaySubject<number[][]> {
    return this.recipePriceTiers;
  }

  setTierValues(recipes: Recipe[]) {
    let quarterCount = Math.floor(recipes.length / 4);
    let tierRanges: number[] = [];
    for (let i = 0; i < recipes.length; i += quarterCount) {
      tierRanges.push(recipes[i].price);
    }
    let tiers: number[][] = [];
    for (let i = 0; i < 4; i++ * 2) {
      tiers.push([Math.floor(tierRanges[i]), Math.floor(tierRanges[i + 1])]);
    }
    tiers[3][1] = Math.floor(recipes[recipes.length - 2].price) + 1;
    this.recipePriceTiers.next(tiers);
  }

  setTvRemoteRules() {
    let priceTiers: number[][];
    this.recipePriceTiers.subscribe((tiers) => priceTiers = tiers);
  }

  downloadRecipeImage(title: string): Observable<string> {
    let titleURL = encodeURI(title.replace(/ /gi, '+'));
    return this.http.get<string>(`${this.getURLPrefix()}${this.getImageURL}${titleURL}`);
  }
  getRecipeImage(title: string): string {
    let titleURL = encodeURI(title.replace(/ /gi, '+'));
    return `${this.getURLPrefix()}images/recipe_images/${titleURL}.png`;
  }

  goTo(location: string) {
    this.router.navigate([`/${location}`], { skipLocationChange: true });
  }
}