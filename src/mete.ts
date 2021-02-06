interface User {
  id: number;
  name: string;
}
interface BarcodeRef {
  id: string;
  drink: number;
}

interface Drink {
  name: string;
  id: number;
  price: string;
}

export { User, BarcodeRef, Drink };
