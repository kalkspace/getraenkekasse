import { Drink as MeteDrink } from "./mete.ts";

export interface CartDrink {
  name: string;
  id: number;
  price: bigint;
  count: number;
}

export interface Drink extends MeteDrink {
  barcodes: string[];
  price_cents: bigint;
}
