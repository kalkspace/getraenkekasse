import { Drink as MeteDrink } from "./mete.ts";

export interface CartItem {
  name: string;
  price: bigint;
  count: number;
}

export interface CartDrink extends CartItem {
  id: number;
}

export interface Drink extends MeteDrink {
  barcodes: string[];
  price_cents: bigint;
}
