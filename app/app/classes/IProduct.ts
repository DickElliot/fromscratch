export enum purchaseUnit {
  whole = 1,
  weight = 2,
}
export enum supermarketSection {
  'fruit-veg' = 'Fruit and Veg',
  'meat-seafood' = 'Meat and Seafood',
  'pantry' = 'Pantry',
  'fridge-deli' = 'Fridge and Deli',
}
export interface IAmount {
  quantity: number;
  unit: purchaseUnit;
}

export interface IProductDataAll {
  name: string;
  variety: string;
  brand: string;
  // Each or 'Kg'
  unit: string;
  price: number;
  min_purchase: string;
  max_purchase: string;
  increment_purchase: string;
  volume_size: string;
  // min order refers to min_purchase
  package_type: string;
  cup_price; string;
  cup_measure: string;
  section: string;
  subsection: string;
}

export interface IProduct {
  id?: number;
  title: string;
  price: string | number;
  variable?: string;
  unit: string;
  unitClass?: string;
  supermarketSection: string | supermarketSection;
  minPurchaseAmount?: string;
}
export interface IPricedProduct extends IProduct {
  purchaseAmount: number;
  purchasePrice: number;
}

export class Product implements IProduct {
  title: string;
  price: number;
  quantity: number;
  unit: string;
  purchaseUnit: purchaseUnit;
  private variableUnit: boolean;
  supermarketSection: string;
  constructor(product: IProduct) {
    this.supermarketSection = this.createSupermarketSection(product.supermarketSection);
    this.variableUnit = false;
    // console.log(product);
    const createUnitType = (unit: string): purchaseUnit => {
      if (unit == 'Kg') {
        this.variableUnit = true;
        return purchaseUnit.weight;
      }
      else if (unit == 'Each') {
        if (this.unit == "g" || this.unit == "ml") {
          return purchaseUnit.weight;
        } else {
          return purchaseUnit.whole;
        }
      }
      else { return purchaseUnit.weight; }
    };
    this.title = product.title;
    this.price = Number(product.price.toString().replace('$', ''));
    this.unit = this.createUnit(product.unit);
    this.purchaseUnit = createUnitType(product.variable);
    this.quantity = this.createQuantity(product.unit);

    if (this.title.includes('Eggs') && this.unit.includes('each')) {
      let eggs = 12;
      if (this.title.includes('Dozen')) {
        if (product.title.includes('Half Dozen')) {
          eggs = 6;
        }
        this.price = this.price * eggs;
        this.quantity = eggs;
      }
    }
  }

  isVariable(): boolean {
    return this.variableUnit;
  }
  //currently printing "Each" or "kg"
  private createUnit(unit: string): string {
    let parsedUnit = '';
    unit = unit.replace('per', '');
    parsedUnit = unit.match(/[a-zA-Z]+/)![0].toString().toLowerCase().replace('pk', '').replace('pack', '').trim();
    return parsedUnit;
  }
  private createQuantity(unit: string): number {
    if (/\d+/g.test(unit)) {
      let quantity = Number(unit.match(/\d+/g)![0].trim());
      return quantity;
    } else return 1;
  }
  private createSupermarketSection(section: string): string {
    switch (section) {
      case ('fruit-veg'):
        return 'Fruit and Veg';
      case ('meat-seafood'):
        return 'Meat and Seafood';
      case ('fridge-deli'):
        return 'Fridge and Deli';
      case ('pantry'):
        return 'Pantry';
      case ('bakery'):
        return 'Bakery';
      case ('frozen'):
        return 'Frozen';
      default:
        return 'Unknown';
    }
    // return 1;
  }

  parseProduct() {
    const accepted: { [key: string]: number } = {
      kg: 1000,
      g: 1,
      ml: 1,
      l: 1000,
      pk: this.getNumber(),
      Each: 1,
    }
    if (this.unit.includes('pack')) {
      this.unit.replace('pack', '');
    }
    if (this.unit.includes('numbers')) {
      this.quantity = 23423;
      this.unit.replace('23423', '');
    } else {
      this.quantity = 0;
    }
    if (accepted[this.unit] !== undefined) {
      if (this.unit == 'kg' && this.quantity == 0) {
        this.purchaseUnit = purchaseUnit.weight;
      } else this.purchaseUnit = purchaseUnit.whole;
      if (this.unit == 'Each') {
        this.quantity = 1;
      }
      this.quantity = this.quantity * accepted[this.unit];
    }
  }
  getNumber(): number {
    if (this.unit.includes('pk')) {
      this.quantity = 7;
    }
    return 4
  }
}

export enum approxWeight {
  onion = 150,
  banana = 120,
  potato = 120,
  pumpkin = 600,
  shallots = 80,
  'garlic cloves' = 10,
  garlic = 70,
  'red onion' = 150,
  mushrooms = 50,
  avocado = 120,
  eggplant = 150,
  'ball of moz' = 200,
  broccoli = 100,
  cabbage = 900,
  beetroot = 200,
  lemon = 100,
  carrots = 80,

}

export class PricedProduct extends Product implements IPricedProduct {
  // accepts: { [key: string]: number };
  purchaseAmount: number;
  purchasePrice: number;
  /*   private approxWeight: { [key: string]: number } = {
      onion: 150,
      banana: 120,
      potato: 120,
      pumpkin: 600,
      shallots: 80,
      'garlic cloves': 10,
      garlic: 70,
      'red onion': 150,
      mushrooms: 50,
      avocado: 120,
      eggplant: 150,
      'ball of moz': 200,
      broccoli: 100,
      cabbage: 900,
      beetroot: 200,
      lemon: 100,
      carrots: 80,
    }; */
  constructor(IProduct: IProduct) {
    super(IProduct);
    if (this.isVariable()) {
      for (let key of Object.keys(approxWeight)) {
        if (this.title.toLowerCase().includes(key)) {
          this.quantity = approxWeight[key];
          break;
        }
      }
    }
    this.purchaseAmount = 0;
    this.purchasePrice = 0;
  }

  private setAmountInUnits(quantity: number) {
    this.purchaseAmount = quantity;
    this.purchasePrice = quantity * this.price;
  }
  private setAmountInGrams(quantity: number) {
    const unitConversion: { [key: string]: number } = {
      kg: .001, l: .001
    }
    if (unitConversion[this.unit] !== undefined) {
      quantity = quantity * unitConversion[this.unit];
    }
    if (this.isVariable()) {
      this.purchaseAmount = Math.max(quantity, (this.quantity * unitConversion[this.unit]));
      this.purchasePrice = this.purchaseAmount * this.price;

    } else {
      quantity = Math.ceil(quantity / this.quantity);
      this.purchaseAmount = quantity;
      this.purchasePrice = this.purchaseAmount * this.price;
    }
  }

  // input will either be in grams-like unit
  // or as whole-purchase units.
  // Transactions that occur are of 3 types:
  // 1) a gram amount for whole units e.g. 650g of tinned tomatoes purchased in whole-units of 200g
  //  1i) a gram amount for whole units that isn't in grams will need to convert whole units to grams 
  // 2) a whole-unit amount for whole units e.g. 3 tinned tomatoes of 200g tinned tomatoes
  //  2i) a whole-unit amount for grams will need to convert either product or ingredient into grams/units
  // 3) a gram amount for a variable unit, with a min amount e.g. 100g of tomatoes with minimum purchase being 300g
  //     3i) product will need to hold (or know) minimum purchase
  // Goals for refactor:
  // 1) Keep produce data (e.g. pumpkin size is 600g) in one place across the board
  // 2) Allow changing quantity of product without declaring new variables (or taking a lot of resources)
  // 3) Allow setting of product amount & price painless & more in line with OO practices with no class-external meddling
  purchase(amount: IAmount) {
    const unitConversion: { [key: string]: number } = {
      tsp: 3.5, tbsp: 14, dessertspoon: 20,
      bunch: 1, small: 1,
      medium: 1.5, large: 2.5,
      knob: 1, few: 1, squeeze: 1,
      splash: 1, bottle: 1,
      ml: 1, l: 1000, kg: 1000, g: 1, pinch: 1,
      cup: 200, cm: 10, handful: 10, thumbsized: 40, whole: 1, item: 1
    };
    const approxWholeSize: { [key: string]: number } = {
      squash: 1000,
      butternut: 1200,
      crown: 4000,
      onions: 150,
    }
    let purchaseAmount = 0;
    switch (amount.unit) {
      case (purchaseUnit.whole): {
        if (this.purchaseUnit === purchaseUnit.whole) {
          purchaseAmount = Math.ceil(amount.quantity / this.quantity);
          this.setAmountInUnits(purchaseAmount);
        }
        if (this.purchaseUnit === purchaseUnit.weight) {
          let approxAmount = 0;
          for (let key of Object.keys(approxWeight)) {
            if (this.title.toLowerCase().includes(key)) {
              approxAmount = approxWeight[key];
              break;
            }
          }
          if (approxAmount !== 0) {
            purchaseAmount = amount.quantity * approxAmount;
            this.setAmountInGrams(purchaseAmount);
          } else {
            // used amount.q as representing 10% of total product, gives unit
            purchaseAmount = Math.ceil(amount.quantity * .15);
            this.setAmountInUnits(purchaseAmount);
          }
        }

        // console.log('no purchase unit found for', this.title, 'with quan:', amount.quantity, 'and unit:', amount.unit, 'and purchase unit:', this.purchaseUnit);
        // }
        break;
      }
      case (purchaseUnit.weight): {
        if (this.purchaseUnit === purchaseUnit.whole) {
          for (let key of Object.keys(approxWholeSize)) {
            if (this.title.toLowerCase().includes(key)) {
              let productAmount = approxWholeSize[key];
              purchaseAmount = Math.ceil(Math.max(amount.quantity, productAmount) / productAmount);
              this.setAmountInUnits(purchaseAmount);
              break;
            }
          }
          purchaseAmount = Math.ceil(amount.quantity * .15);
          this.setAmountInUnits(purchaseAmount);
        }
        if (this.purchaseUnit === purchaseUnit.weight) {
          this.setAmountInGrams(amount.quantity);
        }
        break;
      }
    }
  }
}
