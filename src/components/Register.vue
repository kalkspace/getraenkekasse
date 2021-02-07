<template>
  <el-row :gutter="20">
    <el-col :span="18">
      <ProductList @addDrink="addDrink" :drinks="drinks" />
    </el-col>
    <el-col :span="6" class="summary">
      <el-row>
        <Cart :items="cart" @removeDrink="removeDrink" />
      </el-row>
      <el-row>
        <Checkout :disabled="cart.length == 0" @checkout="checkoutAsUser" />
      </el-row>
    </el-col>
  </el-row>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import ProductList from "./ProductList.vue";
import Checkout from "./Checkout.vue";
import Cart from "./Cart.vue";

import { Drink as MeteDrink, User, BarcodeRef } from "../types/mete";
import { CartDrink } from "../types/register";
import currency from "../util/currency";

interface Drink extends MeteDrink {
  barcode: string | undefined;
  price_cents: bigint;
}

const getDrinks = async () => {
  const response = await fetch("/mete/api/v1/drinks.json");
  const meteDrinks: MeteDrink[] = await response.json();
  return meteDrinks;
};

const getBarcodeRefs = async () => {
  const response = await fetch("/mete/api/v1/barcodes.json");
  const barcodeRefs: BarcodeRef[] = await response.json();
  return barcodeRefs;
};

export default defineComponent({
  name: "Register",
  components: { Cart, Checkout, ProductList },

  setup() {},
  async mounted() {
    const [drinks, barcodeRefs]: [
      MeteDrink[],
      BarcodeRef[]
    ] = await Promise.all([getDrinks(), getBarcodeRefs()]);

    this.drinks = drinks.map((drink) => ({
      ...drink,
      barcode: barcodeRefs.find((barcodeRef) => barcodeRef.drink == drink.id)
        ?.id,
      price_cents: BigInt(parseFloat(drink.price) * 100),
    }));
  },
  methods: {
    removeDrink(cartDrink: CartDrink) {
      if (cartDrink.count > 1) {
        cartDrink.count--;
      } else {
        const existingCartDrink = this.cart.findIndex(
          (existingCartDrink) => existingCartDrink.id === cartDrink.id
        );
        this.cart.splice(existingCartDrink, 1);
      }
    },
    addDrink({ name, id, price_cents: price }: Drink) {
      const existing = this.cart.find((existing) => existing.id === id);
      if (existing) {
        existing.count++;
      } else {
        this.cart.push({ name, id, count: 1, price });
      }
    },

    addFromBarcode(barcode: string) {
      const drink = this.drinks.find((drink) => drink.barcode === barcode);
      if (drink !== undefined) {
        this.addDrink(drink);
      }
    },
    async checkoutAsUser(userId: string | number) {
      // unsure how to fix typing...$notify is installed globally by element-plus
      const notify = (this as any).$notify as Function;
      // no idea how to install a general error handler yet
      try {
        const transactions = this.cart.reduce((prev, drink) => {
          for (let i = 0; i < drink.count; i++) {
            prev.push(
              fetch(`/mete/api/v1/users/${userId}/buy.json?drink=${drink.id}`)
            );
          }
          return prev;
        }, [] as Promise<Response>[]);

        const responses = await Promise.all(transactions);
        const errors = responses
          .filter((response) => !response.ok)
          .map((errorResponse) => errorResponse.statusText);
        if (errors.length > 0) {
          throw new Error(
            `Errors while calling the backend: ${errors.join(", ")}`
          );
        }
        this.cart = [];
        const userResponse = await fetch(`/mete/api/v1/users/${userId}`);
        const updatedUser = await userResponse.json();
        notify({
          title: `Vielen Dank für deinen Einkauf ${updatedUser.name}!`,
          message: `Dein neuer Kontostand: ${currency(
            BigInt(parseFloat(updatedUser.balance) * 100)
          )}`,
          type: "success",
        });
      } catch (e) {
        notify({
          title: "Fehler!",
          message: `${e.message}`,
          type: "error",
        });
        return;
      }
    },
  },
  data: () => {
    return {
      drinks: [] as Drink[],
      cart: [] as CartDrink[],
    };
  },
});
</script>

<style scoped>
.table {
  width: 100%;
  margin-top: 10px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both;
}
</style>
