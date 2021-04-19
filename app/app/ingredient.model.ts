import { IProduct, IPricedProduct } from "./IProduct";

export interface IIngredient {
  originalText: string;
  recipe: string;
  unit?: string;
  unitClass?: string;
  quantity?: string;
  parsedText?: string;
  currentProduct?: IPricedProduct;
  matchedProducts?: IPricedProduct[];
}

export class Ingredient implements IIngredient {
  private newMatchedProducts: IPricedProduct[] = [];
  originalText: string;
  recipe: string;
  unit?: string;
  unitClass?: string;
  quantity?: string;
  parsedText?: string;
  currentProduct?: IPricedProduct;
  matchedProducts?: IPricedProduct[];
  constructor(originalText: string, recipeTitle: string, newQuantity?: any, currentProduct?: IPricedProduct,
    matchedProducts?: IPricedProduct[]) {
    this.originalText = originalText;
    this.recipe = recipeTitle;
    this.Creator();
    this.currentProduct = currentProduct || null;
    this.matchedProducts = matchedProducts || null;
    if (newQuantity != null) {
      this.setNewQuantity = newQuantity;
    }
  }

  Creator(): void {
    this.unit = '';
    this.quantity = '';
    this.parsedText = this.parseOriginalText(this.originalText).trim();
    if (this.unit == '' || this.unit == null) {
      this.unit = 'item';
    }
    if (this.unit != 'item' && typeof this.unit != 'number') {
      this.quantity = this.fractionsToPercentages(this.quantity);
    }
    this.matchedProducts = this.isIngredientAbleToBeMatched();
  }
  clearMatchedProducts() {
    this.matchedProducts = [].slice();
  }
  private isIngredientAbleToBeMatched(): IPricedProduct[] {
    let matchedProductsArray: IPricedProduct[] = [];
    let unmatchables: object = {
      bread: ['bread', 'pitta', 'pita', 'flatbread'],
      wine: ['red', 'white', 'vermouth'],
      salt: ['ground'],
    };
    let matchFlags: object = {
      bread: ['sticks', 'tortilla', 'flatbreads', 'crumbs'],
      wine: ['vinegar', 'dressing'],
      salt: ['coarse', 'rock', '-salt'],
    };
    let unmatchableProducts: object = {
      bread: { title: 'bread', price: '4', unit: 'item', supermarketSection: 'none' },
      wine: { title: 'wine', price: '10', unit: 'item', supermarketSection: 'none' },
      salt: { title: 'salt', price: '0.1', unit: 'item', supermarketSection: 'none' },
    };
    let foodGroups: string[] = Object.keys(unmatchables).concat(Object.keys(matchFlags).filter((key: string) => !(Object.keys(unmatchables).includes(key))));
    let foodGroup: string = '';
    for (let food of foodGroups) {
      if (this.parsedText.includes(food + ' ' || ' ' + food)) {
        foodGroup = food;
      }
    }
    if (foodGroup != '') {
      let flagFound: boolean = false;
      for (let flag of matchFlags[foodGroup]) {
        if (this.parsedText.includes(flag)) {
          flagFound = true;
        }
      }
      if (flagFound == false) {
        let fillerPurchaseAmount = (): string => { if (Number(this.quantity)) { return this.quantity; } else return '1'; };
        let fillerProduct: IPricedProduct = {
          title: unmatchableProducts[foodGroup].title,
          price: unmatchableProducts[foodGroup].price,
          unit: unmatchableProducts[foodGroup].unit,
          minPurchaseAmount: '1',
          supermarketSection: unmatchableProducts[foodGroup].superMarketSection,
          purchaseAmount: fillerPurchaseAmount(),
          purchasePrice: Number(unmatchableProducts[foodGroup].price) * Number(fillerPurchaseAmount()),
        };
        for (let i = 0; i < 10; i++) {
          matchedProductsArray.push(fillerProduct);
        }
      }
      return matchedProductsArray;
    } else { return []; }
    return [];
  }

  addToMatchedProducts(product: IProduct) {
    let pricingDetails: any[] = this.priceProduct(product);
    if (pricingDetails[0] != 0 && pricingDetails[1] != 0) {
      let pricedProduct: IPricedProduct = {
        title: product.title,
        price: product.price,
        unit: product.unit,
        supermarketSection: product.supermarketSection,
        minPurchaseAmount: product.minPurchaseAmount,
        purchaseAmount: pricingDetails[0],
        purchasePrice: pricingDetails[1]
      }
      if (this.currentProduct == null) {
        this.currentProduct = pricedProduct;
      } else if (pricedProduct.purchasePrice < this.currentProduct.purchasePrice) {
        this.currentProduct = pricedProduct;
      }
      this.matchedProducts.push(pricedProduct);
    }
  }

  set setCurrentProduct(product: IPricedProduct) {
    if (product.title in this.matchedProducts) {
      this.currentProduct = product;
    } else { console.log("Can't set as product, hasn't been matched to ingredient!"); }
  }

  set setNewQuantity(newQuantity) {
    if (this.quantity != newQuantity.toString()) {
      this.quantity = newQuantity;
      this.repriceIngredient();
    }
  }

  private repriceIngredient() {
    let currentProductHolder = this.currentProduct;
    let productsHolder: IPricedProduct[] = this.matchedProducts.slice();
    this.matchedProducts = [].slice();
    productsHolder.forEach((product: IPricedProduct) => {
      this.addToMatchedProducts(product);
    });
    this.currentProduct = this.matchedProducts.find((product) => product.title == currentProductHolder.title);
    //console.log('title:', this.currentProduct.title);
  }

  private sortMatchedProductsByCheapest() {
    this.matchedProducts.sort((a, b) => a.purchasePrice - b.purchasePrice);
  }

  priceProduct(product: IProduct): any[] {
    let purchasePrice = 0;
    let purchaseAmount = 0;
    let unitTypes = {
      spoon: { tsp: 14, tbsp: 25, dessertspoon: 20 },
      amount: { bunch: 1, small: 1, medium: 1.5, large: 2.5, knob: 1, few: 1, squeeze: 1, splash: 1, bottle: 1 },
      liquid: { ml: 1, l: 0.1 },
      weights: { kg: 1000, g: 1, pinch: 1 },
      volume: { cup: 200, cm: 10, handful: 10, thumbsized: 40 },
      each: { item: 'item', cans: 'cans', squares: 'squares' }
    };
    let quantityTypes = {
      amount: { bunch: 1, small: 1, handful: 10 },
    };
    let itemSizes = {
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
      'ball of moz': 200,
      broccoli: 100,
      cabbage: 900,
    };
    let ingredientAmount: number = 1;
    if (Number(this.quantity)) {
      ingredientAmount = Number(this.quantity);
    } else if (Object.keys(quantityTypes.amount).includes(this.quantity)) {
      ingredientAmount = quantityTypes.amount[this.quantity];
    }
    let productAmount = Number(product.minPurchaseAmount);
    if (product.minPurchaseAmount.includes('kg')) {
      productAmount = Number(product.minPurchaseAmount.match(/\d+/)) * 1000;
    }
    else if (product.minPurchaseAmount.includes('ml') || product.minPurchaseAmount.includes('g')) {
      productAmount = Number(product.minPurchaseAmount.match(/\d+/));
    }
    else if (product.minPurchaseAmount.includes('l')) {
      productAmount = Number(product.minPurchaseAmount.match(/\d+/)) * 1000;
    };
    if (productAmount == 0 || Number(productAmount) == NaN) { productAmount = 1; };
    if (Object.keys(unitTypes.spoon).includes(this.unit)) {
      ingredientAmount = ingredientAmount * unitTypes.spoon[this.unit];
    }
    else if (Object.keys(unitTypes.amount).includes(this.unit)) {
      ingredientAmount = unitTypes.amount[this.unit] * productAmount;
    }
    else if (Object.keys(unitTypes.liquid).includes(this.unit)) {
      ingredientAmount = ingredientAmount * unitTypes.liquid[this.unit];
    }
    else if (Object.keys(unitTypes.weights).includes(this.unit)) {
      ingredientAmount = ingredientAmount * unitTypes.weights[this.unit];
    }
    else if (Object.keys(unitTypes.volume).includes(this.unit)) {
      ingredientAmount = ingredientAmount * unitTypes.volume[this.unit];
    }
    else if (Object.keys(unitTypes.each).includes(this.unit)) {
      if (this.unit == 'item') {
        if (product.unit.includes('pk')) {
          ingredientAmount = ingredientAmount;
        }
        if (Object.keys(itemSizes).includes(this.parsedText || this.parsedText + 's')) {
          ingredientAmount = ingredientAmount * itemSizes[this.parsedText];
        }
      } else if (this.unit == 'cans') {
        if (product.supermarketSection == 'fruit-veg') {
          ingredientAmount = ingredientAmount * 400;
        } else { ingredientAmount = ingredientAmount }
      } else if (this.unit == 'squares') {
        ingredientAmount = ingredientAmount * (0.1 * productAmount);
      }
    }
    let amount: number = 1;
    if (product.unit.trim() == product.minPurchaseAmount.trim() || typeof Number(product.minPurchaseAmount.trim()) == 'number' && product.unit.trim() == 'Each') {
      while (ingredientAmount > (amount * productAmount)) {
        amount++;
      }
      purchaseAmount = amount;
      purchasePrice = amount * Number(product.price.replace('$', ''));
      return [purchaseAmount, purchasePrice];
    }
    else if (product.unit == 'kg') {
      if (productAmount > ingredientAmount) {
        let purchaseAmount: string = product.minPurchaseAmount;
        purchasePrice = (productAmount / 1000) * (Number(product.price.replace('$', '')));
        return [purchaseAmount, purchasePrice];
      } else {
        if (this.unit == 'g') {
          return [ingredientAmount, (ingredientAmount / 1000) * (Number(product.price.replace('$', '')))];
        } else {
          while (ingredientAmount < amount * productAmount) {
            amount++;
          }
        }
        return [amount, amount * (Number(product.price.replace('$', '')))];
      }
    }
    return [purchaseAmount, purchasePrice];
  }

  /** 
   *  Parses the original text of the ingredient to
   *  to find products that are suitable for the ingredient. It also finds the unit & quantity that the
   *  ingredient has. E.g. 2 Tsp Olive Oil will create a parse match of olive oil with a unit of teaspoon
   *  and a quantity of 2
   */
  private parseOriginalText(originalText: string): string {
    let parsedText: string = originalText.toLowerCase().trim().replace(/\((.*?)\)/gi, '').split(',')[0].split(' or ')[0];
    let quantity: string = '';
    let unit: string = '';
    let parsedTextArray: string[] = parsedText.split(/\s+/);
    let previousWord: string;
    let currentWord: string;
    let nextWord: string = '';
    const unitPattern: RegExp = /[,.\d]+[-\w]+/i;
    const numbersPattern: RegExp = /[.\d]+/i;
    const wordsAroundHyphenPattern: RegExp = /[a-z]+[\-][a-z]+/i;
    const nonNumbersPattern: RegExp = /[\D]+/i;
    const alphabetPattern: RegExp = /[a-z]+/i;
    parsedText = parsedText.replace(parsedText.split(/\s+/)[0], this.fractionsToPercentages(parsedText.split(/\s+/)[0]));
    // Fix spaces in hyphenated terms
    if (parsedText.includes('-') && (!parsedText.match(wordsAroundHyphenPattern))) {
      if (parsedText.includes(' -') || parsedText.includes('- ')) {
        parsedText = parsedText.replace(' -', '-').replace('- ', '-');
      }
    }
    // Fix '2 x 400g' pattern
    if (parsedText.includes(' x ')) {
      let thisPattern: RegExp = /[.\d]+ x [.\d]+/gi;
      if (parsedText.match(thisPattern)) {
        let thisPatternMatch: RegExpMatchArray = parsedText.match(thisPattern);
        let result: string[] = thisPatternMatch.toString().split(' x ');
        let actualResult: number = Number(result[0]) * Number(result[1]);
        parsedText = parsedText.replace(thisPattern, actualResult.toString());
        this.quantity = (parsedText.match(unitPattern))[0].match(numbersPattern)[0];
        this.unit = (parsedText.match(alphabetPattern))[0].match(alphabetPattern)[0];
        parsedText = parsedText.replace(this.quantity, '').replace(this.unit, '');
        return parsedText;
      }
    }
    let amounts: string[] = [];
    parsedTextArray = parsedText.split(/\s+/);
    if (parsedTextArray[0].includes('-') && !(parsedText.match(wordsAroundHyphenPattern))) {
      let hyphenedWord: string = parsedTextArray[0];
      amounts = hyphenedWord.split('-');
      let firstAmount: string = amounts[0];
      let secondAmount: string = amounts[1];
      if (alphabetPattern.test(firstAmount) == alphabetPattern.test(firstAmount)) {
        let ingredientUnit;
        if (secondAmount.match(alphabetPattern) != null) {
          ingredientUnit = secondAmount.match(alphabetPattern);
        } else if (firstAmount.match(alphabetPattern) != null) {
          ingredientUnit = firstAmount.match(alphabetPattern);
        }
        firstAmount = firstAmount.replace(alphabetPattern, '');
        secondAmount = secondAmount.replace(alphabetPattern, '');
        if (firstAmount.match(numbersPattern) && secondAmount.match(numbersPattern)) {
          let averageAmount = (Number(firstAmount.match(numbersPattern)) + Number(secondAmount.match(numbersPattern))) / 2;
          this.quantity = averageAmount.toString();
          this.unit = ingredientUnit;
          return parsedText;
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
        let secondNumber: RegExpMatchArray = wordSplitBySlash[1].match(numbersPattern);
        let fraction: any = wordSplitBySlash[0] + '/' + secondNumber;
        let percentage: string = this.fractionsToPercentages(fraction);
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
          quantity = currentWord.match(numbersPattern).toString();
        }
        if (alphabetPattern.test(currentWord)) {
          if (this.isUnit(currentWord.match(alphabetPattern)[0])) unit = currentWord.match(alphabetPattern)[0];
        } else if (alphabetPattern.test(nextWord)) {
          if (this.isUnit(nextWord)) unit = nextWord;
        }
        parsedText = parsedText.replace(unit, '').replace(quantity, '').trim();
        this.quantity = quantity;
        this.unit = unit;
        return parsedText;
      }
      else if (!numbersPattern.test(currentWord)) {
        if (this.isUnit(currentWord)) unit = currentWord;
        if (quantity.length == 0 && !numbersPattern.test(parsedText)) {
          quantity = '1';
        } else if (numbersPattern.test(parsedText)) { quantity = parsedText.match(numbersPattern).toString(); }
        parsedText = parsedText.replace(unit, '').replace(quantity, '');
        this.unit = unit;
        this.quantity = quantity;
        return parsedText;
      }
      else if (nextWord != '') {
        if (originalText == '½ cup freshly grated Parmigiano-Reggiano, or as needed') { console.log(`cheese found ${nextWord}`); }
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
        parsedText = parsedText.replace(unit, "").replace(quantity, "");
        return parsedText;
      }
    }
    if (unit != null) {
      this.unit = unit;
    }
    if (quantity != null) {
      this.quantity = quantity;
    }
    return parsedText;
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
    const u = {
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
        large: { shorthand: ["lrg"], small: 0.3, medium: 1.5 },
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
        for (let ref of u[unitClass][unitType].shorthand) {
          if (unit == ref) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private fractionsToPercentages(fraction: string): string {
    const fractionsToDecimals = {
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
      return fractionsToDecimals[fraction];
    }
    else return fraction;
  }
}
