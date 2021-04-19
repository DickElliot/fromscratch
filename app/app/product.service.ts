import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, Subject, ReplaySubject } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { IProduct } from './IProduct';
import { IMarket } from './IMarket';
import { ICoordinates } from './ICoordinates';
import { Ingredient } from './ingredient.model';

enum supermarketSection {
  'fruit-veg' = 1,
  'fridge-deli' = 2,
  'meat-seafood' = 3,
  'pantry' = 3,
}
@Injectable({
  providedIn: 'root',
})

export class ProductService {
  products: Observable<IProduct[]> = new Observable<IProduct[]>();
  currentProducts: Subject<IProduct[]> = new Subject<IProduct[]>();
  currentLocation: BehaviorSubject<string> = new BehaviorSubject<string>(this.getDefaultLocation());
  shoppingList: Subject<Ingredient[]> = new ReplaySubject<Ingredient[]>();
  shoppingListPrice: Subject<number> = new ReplaySubject<number>();
  geoLocation: ICoordinates;
  itemSizes;
  // Products to filter, eventually user will be able to filter out unwanted/allergen foods
  blockedTerms: string[] = ['chewing gum', 'chips', 'crackers', '&', 'biscuits', 'muesli bars'];
  currentProductsData: IProduct[] = [];
  private urlPrefix = '';
  private productsRetrieverURL: string = `${this.urlPrefix}backend/productsRetriever.php/?`;
  private supermarketsDetailsRetrieverURL: string = `${this.urlPrefix}backend/supermarketsDetailsRetriever.php`;
  constructor(private http: HttpClient) {
    this.itemSizes = {
      onion: 150,
      banana: 120,
      potato: 120,
      pumpkin: 600,
      shallots: 80,
      garlic: 70,
      'red onion': 150,
      mushrooms: 50,
      avocado: 120,
      eggplant: 150,
      broccoli: 100,
      cabbage: 900,
    };
    this.currentLocation.pipe(shareReplay(3)).subscribe((location: string) => {
      // Have this subscription act on the downloadProducts subscription so that 
      // it is triggered when the location is changed.
      this.downloadProducts().subscribe((products: IProduct[]) => {
        this.currentProductsData = products;
        this.currentProducts.next(products);
        this.currentProducts.complete();
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
    let blockedTerms = this.blockedTerms;
    let blockedQueryString = '';
    for (let term of blockedTerms) {
      blockedQueryString += `${term}[]`;
    }
    blockedQueryString = blockedQueryString.slice(0, blockedQueryString.length - 2);
    let locationQuery;
    this.currentLocation.subscribe((location) => { locationQuery = location });
    if (locationQuery == null) {
      locationQuery = this.getDefaultLocation();
    }
    locationQuery = locationQuery.replace(/ /g, '_');
    return this.http.get<IProduct[]>(`${this.productsRetrieverURL}${locationQuery}?${blockedQueryString}`).pipe(
      map((result) => {
        result.forEach((product) => {
          product.supermarketSection = product['supermarket_section'];
          product.minPurchaseAmount = this.createProductMinimumPurchaseAmount(product);
        });
        result.sort((a, b) => {
          if (supermarketSection[a.supermarketSection] < supermarketSection[b.supermarketSection]) {
            return -1;
          }
          if (supermarketSection[a.supermarketSection] > supermarketSection[b.supermarketSection]) {
            return 1;
          }
          return 0;
        });
        return result;
      }),
      catchError(this.handleError<any>('Failed to get products from database'))
    );
  }

  /**
   * Uses the unit of the product to find whether the products are
   * packaged or not, and the minium/unit purchase. Allows for
   * accurate pricing
   * @param product The product
   */
  createProductMinimumPurchaseAmount(product: IProduct): string {
    let unit = product.unit.toLowerCase().trim();
    if (product.title.includes('Eggs') && unit.includes('each')) {
      if (product.price.includes('$') && product.title.includes('Dozen')) {
        let totalPrice = Number(product.price.replace('$', '').trim()) * 12;
        product.price = totalPrice.toString();
      }
      if (product.title.includes('Dozen')) {
        return '12';
      } else if (product.title.includes('pk')) {
        return product.title.match(/\d+pk/).toString().replace('pk', '').trim();
      }
    }
    else if (unit != 'each' && unit != 'kg') {
      if (unit.includes('pk')) {
        return unit.replace('pk', '');
      } else { return unit; }
    } else if (unit == 'each') {
      let itemSize = '';
      for (let item of Object.keys(this.itemSizes)) {
        if (product.title.toLowerCase().includes(item)) {
          itemSize = this.itemSizes[item].toString();
        }
      }
      if (itemSize != '') {
        return itemSize + 'g';
      } else return '1';
    } else if (unit == 'kg') {
      let itemSize = '';
      for (let item of Object.keys(this.itemSizes)) {
        if (product.title.toLowerCase().includes(item)) {
          itemSize = this.itemSizes[item].toString();
        }
      }
      return itemSize + 'g';
    } else if (unit == 'kg') {
      return '50g';
    }
    return '';
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
    return 'countdown newtown';
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
    let longitude = position.coords.longitude;
    let geoLocation: ICoordinates = { longitude: position.coords.longitude, latitude: position.coords.latitude };
    this.geoLocation = geoLocation;
    // console.log("Longitude set to: " + this.geoLocation.longitude +
    // "Latitude set to: " + this.geoLocation.latitude);
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
    }
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
      map((response) => {
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

  /* 
    A work in progress method that finds 'easy matches'.
    TODO if changed to intake ingredient, product and variable match amount then 
    method could be used within other method. Consider including list of parses not to try, 
    ones that include too many 'necessary' possibilities, as blockWords is the time sink. e.g. butter, olive oil 
   */
  matchProductsToIngredientQuickly(ingredient: Ingredient): Ingredient {
    let products: IProduct[] = this.currentProductsData;
    const wordsInParseMatch = ingredient.parsedText.toLowerCase().trim().split(/\s+/);
    const parseMatch = ingredient.parsedText.toLowerCase();
    const ignoreWords = ['produce', 'of', 'pack', 'puff', 'ground', 'block', 'cooked', '-', 'bunch'];
    if (wordsInParseMatch.length >= 2) {
      for (let i = 0; i < products.length && ingredient.matchedProducts.length < 5; i++) {
        let wordMatch = [];
        let wordsInProductTitle = products[i].title.toLowerCase().trim().split(/\s+/);
        let keyWord = wordsInProductTitle[wordsInProductTitle.length];
        for (let word of wordsInParseMatch) {
          if (wordsInProductTitle.includes(word) && !(ignoreWords.includes(word))) {
            wordMatch.push(word);
          }
        }
        if (!(products[i].title.toLowerCase().includes(keyWord)) && wordMatch.length >= 2) {
          ingredient.addToMatchedProducts(products[i]);
        }
      }
    }
    return ingredient;
  }

  /**
   * The method. This matches products to ingredients through
   * word analysis. Has to be configured further to reduce
   * match time. 
   * @param ingredient the ingredient being matched against
   * @return IIngredient the ingredient with matches
   */
  // TODO Optimize data alphabetically
  matchProductsToIngredientUsing(ingredient: Ingredient): Ingredient {
    let products: IProduct[] = this.currentProductsData;
    const loneModifiers = {
      colours: ['white', 'red', 'brown', 'black', 'green'],
      types: ['baby', 'fresh', 'whole', 'canned', 'frozen', 'dried', 'strong', 'ball', 'powder', 'hot', 'leaves', 'roasted', 'mixed'],
      others: ['sauce', 'thai', 'pouch', 'creme', 'vegetable', 'sweet', 'light', 'curry', 'and', 'paste', 'juice', 'sticks'],
    };
    let ignoreWords = ['plain', 'with', 'small', 'extra', 'produce', 'vegetarian', 'of', 'pack', 'puff', 'juice', 'ground', 'block', '-', 'bunch', 'cooking', 'pot', 'seasoned', 'smoked', 'toasted'];
    let necessary = {
      avocado: ['oil'],
      garlic: ['hummus', 'bread'],
      celery: ['salt', 'sticks', 'bunch', 'seeds'],
      ricotta: ['sauce'],
      cream: ['sour', 'cheese', 'soured', 'whipped', 'chips'],
      corn: ['chips'],
      chocolate: ['dark', 'sauce', 'white', 'milk', 'biscuits', 'cookies'],
      beans: ['black', 'kidney', 'jelly', 'baked'],
      butter: ['cream', 'beans', 'peanut', 'cashew', 'unsalted', 'shortbread', 'chicken', 'popcorn'],
      wheat: ['biscuits'],
      pepper: loneModifiers.colours,
      vinegar: ['balsamic', 'white', 'red', 'wine', 'apple'],
      stock: ['beef', 'vegetable', 'fish', 'chicken'],
      cheese: ['halloumi', 'mascarpone', 'sliced', 'parmesan', 'cheddar'],
      florets: ['broccoli', 'cauliflower'],
      masala: ['garam'],
      cashew: ['butter', 'snack'],
      lentils: ['green', 'red'],
      mustard: ['american', 'wholegrain', 'dijon', 'mild'],
      broccoli: ['sesame'],
      nuts: ['brazil', 'pine', 'almond', 'cashew'],
      bread: ['crumbs'],
      mince: ['lamb', 'beef', 'chicken', 'pork'],
      chilli: ['sweet', 'red', 'green', 'flakes', 'sauce', 'powder', 'crushed', 'beans'],
      pastry: ['puff', 'filo'],
      yoghurt: ['natural', 'greek', 'vanilla', 'coconut', 'strawberry'],
      potatoes: loneModifiers['colours'].concat(['new']),
      oil: ['tuna', 'olive', 'canola', 'garlic', 'coconut', 'vegetable', 'sesame', 'peanut'],
      curry: ['tahini', 'masala', 'korma', 'red', 'green', 'madras'],
      milk: ['chocolate', 'coconut', 'arrowroot', 'malt', 'porridge', 'choc'],
      powder: ['cocoa', 'custard', 'stock', 'mustard', 'chilli', 'baking'],
      rice: ['paella', 'wild', 'basmati', 'brown', 'white', 'crackers', 'bubbles', 'cakes', 'jasmine', 'long'],
      saffron: ['spice'],
      onions: ['spring', 'brown', 'red'],
      mushrooms: ['pasta', 'soup'],
      peas: ['chick'],
      olive: ['oil', 'spread'],
      olives: ['kalamata', 'green'],
      flour: ['gluten', 'spelt', 'gluten', 'wholemeal', 'plain'],
      cabbage: ['green', 'red'],
      fillets: ['salmon', 'chicken', 'lamb'],
      shallots: ['fried'],
      parsley: ['sausages'],
      steaks: ['venison', 'lamb'],
      sauce: ['soy', 'tomato', 'fish', 'hoisin', 'oyster', 'chocolate', 'chilli'],
      coconut: ['desiccated', 'milk', 'sauce', 'cream', 'oil', 'sugar', 'shredded', 'flour'],
      seeds: ['fenugreek', 'sunflower', 'sesame', 'mustard'],
      basil: ['pesto'],
      mixed: ['olives', 'salad'],
      lime: ['jelly', 'pie', 'raspberry', 'marmalade', 'flavoured', 'pickle'],
      sugar: ['brown', 'white', 'snap', 'icing'],
      bacon: ['pasta', 'sauce', 'spam', 'flavoured', 'salad'],
      wholegrain: ['oats', 'mustard', 'bread'],
      sunflower: ['oil', 'seed'],
      tomato: ['sauce', 'salsa', 'beans', 'spaghetti', 'pasta'],
      shoulder: ['lamb', 'pork'],
      grated: ['nutmeg', 'parmesan', 'cheese'],
    };
    const unitMatch = {
      'olive oil': 'ml',
    };
    const flags = ['hummus', 'spread', 'dip', 'sausages'];
    const animals = {
      boneless: [],
      chicken: ['breast', 'thigh', 'drumsticks', 'legs'],
      beef: ['sirloin', 'steak'],
      lamb: ['shoulder', 'roast'],
      pork: ['ribs', 'shoulder'],
      fish: ['salmon', 'cod'],
      poultry: ['turkey', 'pheasant'],
    };
    let supermarketSectionRefinement = {
      canned: 'pantry',
    };
    let parsedText = ingredient.parsedText.toLowerCase().trim();
    for (let i = 0; ingredient.matchedProducts.length < 5 && i < products.length; i++) {
      let wordMatch = [];
      let wordsInParsedText: string[] = parsedText.split(/\s+/);
      let wordsInProductTitle: string[] = products[i].title.trim().toLowerCase().split(/\s+/);

      for (let word of wordsInParsedText) {
        if (wordsInProductTitle.includes(word) && (!(ignoreWords.includes(word)))) {
          wordMatch.push(word);
        }
      }
      let matchAllowed = true;
      if (wordMatch.length == 1) {
        for (let modifier of Object.keys(loneModifiers)) {
          if (loneModifiers[modifier].includes(wordMatch[0])) {
            matchAllowed = false;
          }
        }
      }
      if (matchAllowed) {
        for (let animal in Object.keys(animals)) {
          if (parsedText.includes(animal)) {
            for (let part in animals[animal]) {
              if ((parsedText.includes(part)) && !(products[i].title.toLowerCase().includes(part))) {
                matchAllowed = false;
              } else matchAllowed = true;
            }
          }
          if (products[i].title.toLowerCase().includes(animal)) {
            matchAllowed = true;
          }
        }
      }
      const productIncludesFlag = (flag) => wordsInProductTitle.includes(flag);
      const ingredientIncludesFlag = (flag) => wordsInParsedText.includes(flag);
      if (matchAllowed && flags.some(productIncludesFlag)) {
        if (!flags.some(ingredientIncludesFlag)) matchAllowed = false;
      }
      /*      if (matchAllowed && Object.keys(supermarketSectionRefinement).some(ingredientIncludesFlag)) {
             let section: string = '';
             wordsInParsedText.forEach((word) => { if (word in supermarketSectionRefinement) { section = supermarketSectionRefinement[word] } });
             if (products[i].supermarketSection != section) {
               matchAllowed = false;
             }
           } */
      if (matchAllowed) {
        for (let word of wordMatch) {
          if (Object.keys(necessary).includes(word)) {
            for (let necessaryWord of necessary[word]) {
              if (products[i].title.toLowerCase().includes(necessaryWord) && !(parsedText.includes(necessaryWord))) {
                // console.log('blockWords', products[i].title.toLowerCase(), 'includes', blockWord, 'while', parseMatch, 'doesn\'t');
                matchAllowed = false;
              }
            }
          }
        }
      }
      if (matchAllowed && parsedText in unitMatch && wordMatch.length == wordsInParsedText.length) {
        if (!products[i].unit.includes(unitMatch[parsedText])) {
          matchAllowed = false;
        }
      }
      if (matchAllowed && wordMatch.length > 0) {
        ingredient.addToMatchedProducts(products[i]);
      }
    }
    return ingredient;
  }

  /** TODO. For unit comparisons  */
  matchIngredientUnitClassProducts(ingredient: Ingredient, product: IProduct): void {
    const u = {
      weight: {
        pound: [{ references: ["lb", "lbs"] }],
        ounce: [{ references: ["oz"] }],
        kilogram: [{ references: ["kg", "kilo"] }],
        gram: [{ references: ["g, gr"] }],
      },
      volume: {
        "pint, UK": [{ references: ["pint"] }],
        "pint, US": [{ references: ["pint"] }],
        "fluid ounce, US": [{ references: ["floz.", "fl.oz."] }],
        "fluid ounce, UK": [{ references: ["floz.", "fl.oz."] }],
        tsp: [{ references: ["tsp", "tsp", "teaspoon"] }],
        dstp: [{ references: ["dts", "dstsp"] }],
        tbsp: [{ references: ["tbs", "tablespoon"] }],
        cup: [{ references: ["c", "cup"] }],
        milliliter: [{ references: "ml" }],
        litre: [{ references: "l" }],
        deciliter: [{ references: "dl" }],
      },
      whole: {
        small: [{ references: ["sml"] }],
        medium: [{ references: ["med"] }],
        large: [{ references: ["lrg"] }],
        knob: [{ references: ["knob"] }],
      },
      ml: "TODO",
      g: "TODO",
    };
    let unitConvertibleClass = false;
    if (
      ingredient.unitClass === "weight" ||
      ingredient.unitClass === "volume"
    ) {
      unitConvertibleClass = true;
    }
    if (
      unitConvertibleClass === true &&
      product.unit.replace(/\D/gi, "") in u[ingredient.unitClass]
    ) {
      console.log("found product with same unit class");
    }
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
  private log(message: string) {
    console.log(`RecipeService: ${message}`);
  }
}
