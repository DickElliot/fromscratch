import { IProduct, IPricedProduct, PricedProduct, IAmount, purchaseUnit } from "./IProduct";

export interface IIngredient {
  originalText: string;
  recipe: string;
  unit?: string;
  unitClass?: string;
  quantity?: string;
  parsedText?: string;
  // currentProduct?: IPricedProduct;
  // matchedProducts?: IPricedProduct[];
}


export interface IShoppingListIngredient {
  ingredient: Ingredient;
  servingSize: number;
}

export class Ingredient implements IIngredient {
  originalText: string;
  recipe: string;
  unit: string = '';
  unitClass?: string;
  quantity: string = '';
  parsedText: string = '';
  currentProduct?: PricedProduct;
  matchedProducts: PricedProduct[] = [];
  constructor(originalText: string, recipe: string) {
    this.originalText = originalText;
    this.recipe = recipe;
    this.parsedText = this.parseOriginalText(this.originalText);
    if (this.unit === '') {
      this.unit = 'item';
    }
    if (this.unit !== 'item' && typeof this.unit !== 'number') {
      this.quantity = this.fractionsToPercentages(this.quantity);
    }
    this.matchedProducts = this.isIngredientAbleToBeMatched();
  }

  get getMatchedProducts() {
    return this.matchedProducts;
  }

  clearMatchedProducts(): void {
    this.matchedProducts = [];
  }

  /**
   * 
   * @returns 
   */
  private isIngredientAbleToBeMatched(): PricedProduct[] {
    let matchedProductsArray: PricedProduct[] = [];
    // Divided hash allows match checking to be specific for it's
    // food group
    let stopMatch: { [key: string]: string[] } = {
      bread: ['bread', 'pitta', 'pita', 'flatbread'],
      wine: ['wine', 'vermouth'],
      salt: ['salt'],
    };
    let allowMatch: { [key: string]: string[] } = {
      bread: ['sticks', 'tortilla', 'flatbreads', 'crumbs', 'garlic'],
      wine: ['vinegar', 'dressing'],
      salt: ['coarse', 'rock', '-salt'],
    };
    let fillerProducts: { [key: string]: IProduct } = {
      bread: { title: 'bread', price: '4', unit: 'item', supermarketSection: 'none' },
      wine: { title: 'wine', price: '10', unit: 'item', supermarketSection: 'none' },
      salt: { title: 'salt', price: '0.1', unit: 'item', supermarketSection: 'none' },
    };
    let foodGroups = Object.keys(stopMatch);
    let foodGroup = '';
    const parsedWords: Map<string, number> = new Map();
    let findFoodGroup = false;
    for (let word of this.parsedText!.trim().split(' ')) {
      parsedWords.set(word, 1);
      if (stopMatch[word] !== undefined) {
        findFoodGroup = true;
      }
      break;
    }
    if (findFoodGroup) {
      for (let group of foodGroups) {
        for (let food of stopMatch[group]) {
          if (parsedWords.has(food)) {
            foodGroup = group;
            break;
          }
        }
      }
      if (foodGroup !== '') {
        let flagFound = false;
        for (let flag of allowMatch[foodGroup]) {
          if (this.parsedText?.includes(flag)) {
            flagFound = true;
            break;
          }
        }
        if (flagFound === false) {
          let fillerPurchaseAmount = (): number => { if (!isNaN(Number(this.quantity))) { return Number(this.quantity); } else return 1; };
          let fillerProduct: IPricedProduct = {
            title: fillerProducts[foodGroup].title,
            price: fillerProducts[foodGroup].price,
            unit: fillerProducts[foodGroup].unit,
            minPurchaseAmount: '1',
            supermarketSection: fillerProducts[foodGroup].supermarketSection,
            purchaseAmount: fillerPurchaseAmount(),
            purchasePrice: Number(fillerProducts[foodGroup].price) * Number(fillerPurchaseAmount()),
          };
          let newProduct: PricedProduct = new PricedProduct(fillerProduct);
          for (let i = 0; i < 10; i++) {

            matchedProductsArray.push(newProduct);
          }
        }
      }
    }
    return matchedProductsArray;
  }

  set setNewQuantity(newQuantity: string) {
    console.log(`this.q: ${this.quantity} vs. ${newQuantity}`)
    if (this.quantity != newQuantity.toString()) {
      console.log('reaced');
      this.quantity = newQuantity;
      let title = this.currentProduct.title;
      let newAmount = this.getPurchaseAmount();
      this.matchedProducts.forEach((product) => {
        product.purchase(newAmount);
      });
    }
  }


  // Decoupling pricing method could allow this to be cleaner
  // a queue implementation with an unmovable head could be cool 
  // If currentProduct empty & matchedProducts full then bump 
  // cheapest product. Though could run into issues of adding 
  // more products later. Don't lose current ingredient on repricing
  private repriceIngredient() {
    let currentProductHolder = this.currentProduct;
    let productsHolder = this.matchedProducts!.slice();
    this.matchedProducts = [].slice();
    productsHolder.forEach((product) => {
      // this.addToMatchedProducts(product);
    });
    // this.currentProduct = this.matchedProducts.find((product) => product.title == currentProductHolder?.title);
  }

  addToMatchedProducts(IProduct: IProduct) {
    const amount = this.getPurchaseAmount();
    const pricedProduct: PricedProduct = new PricedProduct(IProduct);
    pricedProduct.purchase(amount);
    if (this.currentProduct === undefined) {
      this.currentProduct = pricedProduct;
    } else if (pricedProduct.purchasePrice < this.currentProduct?.purchasePrice) {
      this.currentProduct = pricedProduct;
    }
    this.matchedProducts?.push(pricedProduct);

  }
  private getPurchaseAmount(): IAmount {
    const unitConversion: { [key: string]: number } = {
      tsp: 3.5, tbsp: 14, dessertspoon: 20,
      bunch: 1, small: 1,
      medium: 1.5, large: 2.5,
      knob: 1, few: 1, squeeze: 1,
      splash: 1, bottle: 1,
      ml: 1, l: 1000, kg: 1000, g: 1, pinch: 1,
      cup: 200, cm: 10, handful: 10, thumbsized: 40, whole: 1, item: 1
    };
    const types: { [key: string]: number } = {
      item: 1, Each: 1,
      whole: 1, canned: 1,
      small: 1, medium: 1,
      large: 1,
    }
    let unit: purchaseUnit;
    if (types[this.unit] !== undefined) {
      unit = purchaseUnit.whole;
    } else unit = purchaseUnit.weight;
    let quantity = Number(this.quantity) * unitConversion[this.unit];
    const amount: IAmount = {
      quantity: quantity,
      unit: unit,
    }
    return amount;
  }

  set setCurrentProduct(product: any) {
    if (product.title in this.matchedProducts!) {
      this.currentProduct = product;
    } else { console.log("Can't set as product, hasn't been matched to ingredient!"); }
  }


  private sortMatchedProductsByCheapest() {
    this.matchedProducts?.sort((a, b) => a.purchasePrice - b.purchasePrice);
  }


  /** 
   *  Parses the original text of the ingredient to
   *  to find products that are suitable for the ingredient. It also finds the unit & quantity that the
   *  ingredient has. E.g. 2 Tsp Olive Oil will create a parse match of olive oil with a unit of teaspoon
   *  and a quantity of 2
   */
  parseOriginalText(originalText: string): string {
    let parsedText = originalText.toLowerCase().trim()
      .replace(/\((.*?)\)/gi, '')
      .split(',')[0]
      .split(' or ')[0];
    const firstWord = parsedText.split(/\s+/)[0];
    parsedText = parsedText
      .replace(firstWord, this.fractionsToPercentages(firstWord));
    let quantity = '';
    let unit = '';
    let previousWord: string;
    let currentWord: string;
    let nextWord: string = '';
    const unitPattern: RegExp = /[,.\d]+[-\w]+/i;
    const numbersPattern: RegExp = /[.\d]+/i;
    const wordsAroundHyphenPattern: RegExp = /[a-z]+[\-][a-z]+/i;
    const nonNumbersPattern: RegExp = /[\D]+/i;
    const alphabetPattern: RegExp = /[a-z]+/i;
    parsing: {
      // Parse spaces in hyphenated terms
      if (parsedText.includes(' -' || '- ') && (!parsedText.match(wordsAroundHyphenPattern))) {
        parsedText = parsedText.replace(' -', '-').replace('- ', '-');
      }
      // Parse '2 x 400g' pattern
      if (parsedText.includes(' x ')) {
        let thisPattern: RegExp = /[.\d]+ x [.\d]+/gi;
        if (parsedText.match(thisPattern)) {
          let resultEquation = parsedText.match(thisPattern)?.toString().split(' x ');
          let result: number = Number(resultEquation?.[0]) * Number(resultEquation?.[1]);
          parsedText = parsedText.replace(thisPattern, result.toString());
          this.quantity = (parsedText.match(unitPattern))![0].match(numbersPattern)![0];
          this.unit = (parsedText.match(alphabetPattern))![0].match(alphabetPattern)![0];
          parsedText = parsedText.replace(this.quantity, '').replace(this.unit, '');
          break parsing;
        }
      }
      let parsedTextArray = parsedText.split(/\s+/);
      if (parsedTextArray[0].includes('-') && !(parsedText.match(wordsAroundHyphenPattern))) {
        let amounts: string[] = [];
        let hyphenedWord: string = parsedTextArray[0];
        amounts = hyphenedWord.split('-');
        let firstAmount: string = amounts[0];
        let secondAmount: string = amounts[1];
        if (alphabetPattern.test(firstAmount) == alphabetPattern.test(firstAmount)) {
          let ingredientUnit = '';
          if (secondAmount.match(alphabetPattern) != null) {
            ingredientUnit = secondAmount.match(alphabetPattern)![0];
          } else if (firstAmount.match(alphabetPattern) != null) {
            ingredientUnit = firstAmount.match(alphabetPattern)![0];
          }
          firstAmount = firstAmount.replace(alphabetPattern, '');
          secondAmount = secondAmount.replace(alphabetPattern, '');
          if (firstAmount.match(numbersPattern) && secondAmount.match(numbersPattern)) {
            let averageAmount = (Number(firstAmount.match(numbersPattern)) + Number(secondAmount.match(numbersPattern))) / 2;
            this.quantity = averageAmount.toString();
            this.unit = ingredientUnit;
            break parsing;
          }
        }
        // Greater unit match if there is text like 1 pinch - 1 tsp    
        /* else if (nonNumbersPattern.test(firstAmount) && nonNumbersPattern.test(secondAmount)) {
          console.log(`1) complicated hyphen checking found ${parsedText} from ${originalText} in ${this.recipe}`);
        }
        else if (nonNumbersPattern.test(firstAmount) || nonNumbersPattern.test(secondAmount)) {
          console.log(`2) complicated hyphen checking found ${parsedText} from ${originalText} in ${this.recipe}`);
        } */
      }
      if (parsedText.includes('/')) {
        let wordSplitBySlash = parsedText.split('/');
        if (unitPattern.test(wordSplitBySlash[0]) && unitPattern.test(wordSplitBySlash[1])) {
          parsedText = parsedText.replace('/' + wordSplitBySlash[1].match(unitPattern), '');
        } else if (numbersPattern.test(wordSplitBySlash[0]) && numbersPattern.test(wordSplitBySlash[1])) {
          let secondNumber = wordSplitBySlash[1].match(numbersPattern)!;
          let fraction = wordSplitBySlash[0] + '/' + secondNumber;
          let percentage = this.fractionsToPercentages(fraction);
          parsedText = parsedText.replace(fraction, percentage);
        }
      }
      parsedTextArray = parsedText.split(/\s+/);
      for (let i = 0; i < parsedTextArray.length; i++) {
        currentWord = parsedTextArray[i].trim();
        if (i < parsedTextArray.length - 1) {
          nextWord = parsedTextArray[i + 1].trim();
        } else { nextWord = ''; }
        if (unitPattern.test(currentWord)) {
          if (numbersPattern.test(currentWord)) {
            quantity = currentWord.match(numbersPattern)!.toString();
          }
          if (alphabetPattern.test(currentWord)) {
            if (this.isUnit(currentWord.match(alphabetPattern)![0])) unit = currentWord.match(alphabetPattern)![0];
          } else if (alphabetPattern.test(nextWord)) {
            if (this.isUnit(nextWord)) unit = nextWord;
          }
          parsedText = parsedText.replace(unit, '').replace(quantity, '').trim();
          this.quantity = quantity;
          this.unit = unit;
          break parsing;
        }
        else if (!numbersPattern.test(currentWord)) {
          if (this.isUnit(currentWord)) unit = currentWord;
          if (quantity.length == 0 && !numbersPattern.test(parsedText)) {
            quantity = '1';
          } else if (numbersPattern.test(parsedText)) { quantity = parsedText.match(numbersPattern)!.toString(); }
          parsedText = parsedText.replace(unit, '').replace(quantity, '');
          this.unit = unit;
          this.quantity = quantity;
          break parsing;
        }
        else if (nextWord != '') {
          let quantityCheck = false;
          if (this.isUnit(nextWord)) unit = nextWord;
          if (this.isQuantity(currentWord) && quantityCheck == false) {
            quantity = currentWord;
            quantityCheck = true;
          } else if (quantityCheck == false) {
            for (let x = 0; x < parsedTextArray.length && quantityCheck == false; x++) {
              if (this.isQuantity(parsedTextArray[x])) {
                quantity = this.fractionsToPercentages(parsedTextArray[x].trim());
                quantityCheck = true;
              }
            }
          } else if (quantity.length == 0 && !numbersPattern.test(parsedText)) {
            quantity = '1';
          }
          this.quantity = quantity;
          this.unit = unit;
          parsedText = parsedText.replace(unit, '').replace(quantity, '');
          break parsing;
        }
      }
    }
    const edgeCases: { [key: string]: string } = {
      egg: 'eggs',
      onion: 'onions',
      lemon: 'lemons',
      'of butter': 'butter',
    }
    parsedText = parsedText.trim();
    if (edgeCases[parsedText] !== undefined) {
      parsedText = edgeCases[parsedText];
    }
    return parsedText.trim();
  }

  private isQuantity(quantity: string): boolean {
    let isQuantity: boolean = false;
    const quantities: string[] = ['small', 'large', 'medium', 'pinch', 'bunch', 'dash', 'few', 'drizzle', 'handful'];
    const isNumberPattern: RegExp = /\b[\.\d]+\b/i;
    if (quantities.includes(quantity)) {
    }
    if (isNumberPattern.test(quantity) || quantities.includes(quantity)) {
      isQuantity = true;
    }
    return isQuantity;
  }

  private isUnit(unit: string): boolean {
    const u: { [key: string]: { [key: string]: { [key: string]: any[] } } } = {
      weight: {
        pound: { shorthand: ["lb", "lbs"], conversions: [{ ounce: 28 }, { grams: 10 }] },
        ounce: { shorthand: ["oz", "oz."] },
        kilogram: { shorthand: ["kg", "kilo"] },
        gram: { shorthand: ["g", "gr"] },
      },
      volume: {
        "pint": { shorthand: ["pint"] },
        "fluid ounce": { shorthand: ["floz.", "fl.oz."] },
        tsp: { shorthand: ["teaspoon"] },
        dstp: { shorthand: ["dts"] },
        tbsp: { shorthand: ["tbs", "tablespoon"] },
        cup: { shorthand: ["cup"] },
        milliliter: { shorthand: ["ml"] },
        l: { shorthand: ["litre"] },
      },
      whole: {
        small: { shorthand: ["sml"] },
        medium: { shorthand: ["med"] },
        large: { shorthand: ["lrg"], conversions: [{ small: 0.3 }, { medium: 0.7 }] },
        knob: { shorthand: ["knob"] },
        bunch: { shorthand: ['bunch'] },
        handful: { shorthand: ['handful'] },
        pinch: { shorthand: ['pinch'] },
        whole: { shorthand: ['whole'] },
      },
    };
    for (let unitClass in u) {
      for (let unitType in u[unitClass]) {
        if (unit == unitType) {
          return true;
        }
        for (let shorthand of u[unitClass][unitType].shorthand) {
          if (unit == shorthand) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private fractionsToPercentages(fraction: string): string {
    const fractionsToDecimals: { [key: string]: number } = {
      '¼': 0.25,
      '½': 0.5,
      '1/2': 0.5,
      '¾': 0.75,
      '⅓': 0.3333,
      '⅔': 0.6666,
      '⅕': 0.2,
      '⅖': 0.4,
      '⅗': 0.6,
      '⅘': 0.8,
      '⅙': 0.1666,
      '⅚': 0.8333,
      '⅛': 0.125,
      '⅜': 0.375,
      '⅝': 0.625,
      '⅞': 0.875,
    };
    if (fraction in fractionsToDecimals) {
      return fractionsToDecimals[fraction].toString();
    }
    else return fraction;
  }
}
