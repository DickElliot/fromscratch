import { PricedProduct } from './IProduct';


export interface IShoppingListRecipe {
  recipe: string;
  servings: number;
  id: number;
}

export class ShoppingListItem {
  ids: number[];
  bought: boolean;
  price: number;
  private productPrices: { [key: number]: number };
  amount: number;
  private productAmounts: { [key: number]: number };
  supermarketSection: string;
  title: string;
  constructor(id: number, purchasePrice: number, purchaseAmount: number, supermarketSection: string, title: string) {
    this.ids = [id];
    this.bought = false;
    this.productPrices = {};
    this.productPrices[id] = purchasePrice;
    this.productAmounts = {};
    this.productAmounts[id] = purchaseAmount;
    this.supermarketSection = supermarketSection;
    this.title = title;
    this.setPrice();
    this.setAmount();
  }
  addProduct(id: number, purchaseAmount: number, purchasePrice: number) {
    this.ids.push(id);
    this.productPrices[id] = purchasePrice;
    this.productAmounts[id] = purchaseAmount;
    this.addPrice(id);
    this.addAmount(id);
  }
  // General idea for this area is that other entries of the same product must be able to be put
  // onto this object while still being able to be identified later on for removal.
  removeProduct(id: number) {
    let index = this.ids.indexOf(id);
    if (index > -1) {
      delete this.productPrices[id];
      delete this.productAmounts[id];
      this.ids.splice(index, 1);
      this.setAmount();
      this.setPrice();
    }
  }
  private setPrice(): void {
    this.price = 0;
    this.ids.forEach((id) => {
      this.price += this.productPrices[id];
    });
  }
  private addPrice(id: number) {
    this.price += this.productPrices[id];
  }
  private setAmount() {
    this.amount = 0;
    this.ids.forEach((id) => {
      this.amount += this.productAmounts[id];
    });
  }
  private addAmount(id: number) {
    this.amount += this.productAmounts[id];
  }

}

export class ShoppingList {
  price: number;
  items: ShoppingListItem[];
  recipes: IShoppingListRecipe[];
  constructor() {
    this.price = 0;
    this.items = [];
    this.recipes = [];
  }

  addProducts(products: PricedProduct[], servingSize: number, recipeTitle: string) {
    let id = this.recipes.length + 1;
    products.forEach((product) => {
      let index = this.items.findIndex((existingItem) => product.title === existingItem.title);
      if (index > -1) {
        this.items[index].addProduct(id, product.purchaseAmount, product.purchasePrice);
      } else {
        let listItem = new ShoppingListItem(id, product.purchasePrice, product.purchaseAmount, product.supermarketSection, product.title);
        this.items.push(listItem);
      }
    });
    let recipe: IShoppingListRecipe = {
      recipe: recipeTitle,
      servings: servingSize,
      id: id,
    }
    this.recipes.push(recipe);
    this.priceList();
  }

  buyItem(item: string) {
    let index = this.items.findIndex((existingItem) => existingItem.title === item);
    if (index > -1) {
      this.items[index].bought = !this.items[index].bought;
    }
    this.priceList();
  }

  removeRecipe(recipe: IShoppingListRecipe) {
    for (let i = 0; i < this.items.length; i++) {
      this.items[i].removeProduct(recipe.id);
    }
    this.items = this.items.filter((product) => product.ids.length !== 0);
    this.recipes = this.recipes.filter((existingRecipe) => recipe.id !== existingRecipe.id);
    this.priceList();
  }

  priceList() {
    let price = 0;
    this.items.forEach((product) => {
      if (!product.bought) {
        price += product.price;
      }
    });
    this.price = price;
  }


}
