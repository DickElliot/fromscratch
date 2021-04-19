export interface IProduct {
  id?: number;
  title: string;
  price: string;
  unit: string;
  unitClass?: string;
  supermarketSection: string;
  minPurchaseAmount?: string;
}
export interface IPricedProduct extends IProduct {
  purchaseAmount: string | number;
  purchasePrice: number;
}

