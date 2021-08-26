import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject, ReplaySubject } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { IProduct } from '../classes/IProduct';
import { IMarket } from '../classes/IMarket';
import { ICoordinates } from '../classes/ICoordinates';
import { Ingredient } from '../classes/IIngredient';
import { MatchingService } from '../services/matching.service';


@Injectable({
  providedIn: 'root',
})
export class ProductService {
  products: Observable<IProduct[]> = new Observable<IProduct[]>();
  productsProcessed: Subject<boolean> = new Subject<boolean>();
  location: string = this.getDefaultLocation();
  currentLocation: BehaviorSubject<string> = new BehaviorSubject<string>(this.getDefaultLocation());
  shoppingList: Subject<Ingredient[]> = new ReplaySubject<Ingredient[]>();
  shoppingListPrice: Subject<number> = new ReplaySubject<number>();
  geoLocation: ICoordinates;
  // Products to filter, eventually user will be able to filter out unwanted/allergen foods
  blockedTerms: string[] = ['chewing gum', 'chips', 'crackers', '&', 'biscuits', 'muesli bars'];
  // local
  private urlPrefix = 'http://localhost/fromscratch/';
  // server
  // private urlPrefix = '';
  private productsRetrieverURL: string = `${this.urlPrefix}backend/productsRetriever.php/?`;
  private supermarketsDetailsRetrieverURL: string = `${this.urlPrefix}backend/supermarketsDetailsRetriever.php`;
  constructor(private http: HttpClient, private matchingService: MatchingService) {
    this.currentLocation.pipe(shareReplay(3)).subscribe((location: string) => {
      this.location = location;
      this.downloadProducts().subscribe((products: IProduct[]) => {
        this.matchingService.setProducts(products);
        this.productsProcessed.next(true);
      });
    });
  }

  /**
   * Downloads products using the location from
   * the service. Also includes the terms to filter
   * of the products so that only the necessary 
   * products are downloaded.
   */
  downloadProducts(): Observable<IProduct[]> {
    let blockedTerms = this.blockedTerms.join('[]');
    let locationQuery = this.location.replace(/ /g, '_');
    return this.http.get<any[]>(`${this.productsRetrieverURL}${locationQuery}?${blockedTerms}`).pipe(
      map((result: any) => {
        result.forEach((product) => {
          product.title = product['name'];
          product.variable = product['unit']
          product.unit = product['volume_size'];
          product.supermarketSection = product['section'];
        });
        return result;
      }),
    );
  }

  /**
   * Supermarket location, to be used to fetch products,
   * show which supermarket is chosen & eventually map
   * a route for the user. 
   * @param location supermarket title
   */
  setCurrentLocation(location: string) {
    // console.log('setCurrentLocation to', location);
    this.currentLocation.next(location);
  }

  /**
   * Automatic supermarket choice.
   */
  getDefaultLocation(): string {
    return 'countdown northlands';
  }

  /**
   * Uses inbuilt-browser methods to retrieve 
   * coordinates of user
   */
  getGeoLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.showPosition(position);
      });;
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }
  /**
   * Records GeoLocation to find nearest market. 
   * @param position GeoLocation Position
   */
  showPosition(position) {
    let geoLocation: ICoordinates = { longitude: position.coords.longitude, latitude: position.coords.latitude };
    this.geoLocation = geoLocation;
  }

  /**
   * Finds the nearest supermarket to the given coordinates.
   * @param geoLocation Coordinates
   * @param supermarkets Available supermarket
   * @return shortestDistance Object with properties of distance & market
   */
  getNearestSuperMarket(geoLocation: ICoordinates, supermarkets: IMarket[]): any {
    let shortestDistance = { distance: 'empty', market: 'empty' };
    let toRad = (value: number) => {
      return value * Math.PI / 180;
    }
    let haversine = (lat1: number, lat2: number, long1: number, long2: number) => {
      let rad = 6372.8;
      let deltaLat = toRad(lat2 - lat1);
      let deltaLong = toRad(long2 - long1);
      lat1 = toRad(lat1);
      lat2 = toRad(lat2);
      let a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) + Math.sin(deltaLong / 2) * Math.sin(deltaLong / 2) * Math.cos(lat1) * Math.cos(lat2);
      let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return rad * c;
    };
    shortestDistance.distance = String(haversine(Number(geoLocation.latitude), Number(supermarkets[0].latitude), Number(geoLocation.longitude), Number(supermarkets[0].longitude)));
    shortestDistance.market = supermarkets[0].name;
    for (let i = 1; i < supermarkets.length; i++) {
      let marketDistance = haversine(Number(geoLocation.latitude), Number(supermarkets[i].latitude), Number(geoLocation.longitude), Number(supermarkets[i].longitude));
      if (marketDistance < Number(shortestDistance.distance)) {
        shortestDistance.distance = String(marketDistance);
        shortestDistance.market = supermarkets[i].name;
      }
    }
    return shortestDistance;
  }

  /** 
   * Returns the physical details of all available supermarkets
   * so that users can choose which one. 
   */
  downloadSupermarketsDetails(): Observable<IMarket[]> {
    return this.http.get<IMarket[]>(`${this.supermarketsDetailsRetrieverURL}`).pipe(
      map((response: any) => {
        response.forEach((market) => {
          market.name = market['name'].replace(/_/g, ' ');
          market.longitude = market['longitude'];
          market.latitude = market['latitude'];
          market.address = market['address'];
          return market;
        })
        return response;
      }));
  }
}