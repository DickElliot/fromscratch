import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Recipe } from './recipe.model';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})

export class InfrastructureService {
  private percentageOfRecipesPriced: Subject<number> = new Subject<number>();
  public headerText: Subject<string> = new BehaviorSubject<string>('from scratch');
  private recipePriceTiers: ReplaySubject<number[][]> = new ReplaySubject<number[][]>();
  private urlPrefix = this.getURLPrefix();
  private recipeModelDatabaseURL: string = `${this.urlPrefix}backend/recipeModelDatabase.php/?`;
  private recipeModelDatabaseCheckURL: string = `${this.urlPrefix}backend/recipeModelDatabaseCheck.php/?`;
  private getImageURL: string = `${this.urlPrefix}backend/getImage.php/?`;
  recipeCount: number;
  itemObs: Observable<number>;
  constructor(private http: HttpClient,
    private router: Router,
  ) { }

  /**
   * 
   * @returns the address for the backend & images
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
    return this.http.get<Recipe[]>(url).pipe(tap((result: any) => {
      this.setPercentageOfRecipePriced(100);
    }));
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
    // console.log('uploading new recipe models')
    let supermarketURL = supermarket.replace(/ /gi, '_');
    let url = `${this.recipeModelDatabaseURL}${supermarketURL}`;
    return this.http.post<any>(url, recipes);
  }
  getPercentageOfRecipesPricedString(): number {
    let percentage: number;
    this.percentageOfRecipesPriced.subscribe((value) => percentage = value);
    return percentage;
  }
  getPercentageOfRecipesPriced(): Observable<number> {
    return this.percentageOfRecipesPriced.pipe();
  }
  setPercentageOfRecipePriced(percentage: number) {
    this.percentageOfRecipesPriced.next(percentage);
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
    let recipeCount = recipes.length;
    let quarterCount = Math.floor(recipeCount / 4);
    let tierMarks: number[] = [];
    for (let i = 0; i < recipes.length; i += quarterCount) {
      let t = recipes[i].price;
      tierMarks.push(t);
    }
    let newTiers: number[][] = [];
    for (let i = 0; i < 4; i++ * 2) {
      let tier: number[] = [Math.floor(tierMarks[i]), Math.floor(tierMarks[i + 1])];
      newTiers.push(tier);
    }
    newTiers[3][1] = newTiers[3][1] + 1;
    // console.log('newTiers[3][1]', newTiers[3][1].toString(), newTiers[3][1].toLocaleString());
    if (Number.isNaN(newTiers[3][1])) {
      newTiers[3][1] = newTiers[3][0] + newTiers[1][0];
    }
    this.recipePriceTiers.next(newTiers);
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
    // let urlPrefix = this.getURLPrefix();
    let titleURL = encodeURI(title.replace(/ /gi, '+'));
    return `${this.getURLPrefix()}images/recipe_images/${titleURL}.png`;
  }

  goTo(location: string) {
    this.router.navigate([`/${location}`], { skipLocationChange: true });
  }
}