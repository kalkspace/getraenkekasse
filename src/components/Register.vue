<template>
  <el-row :gutter="20">
    <el-col :span="14">
      <ProductList @addDrink="addDrink" :drinks="drinks" />
    </el-col>
    <el-col :span="10" class="summary">
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

import { Drink as MeteDrink, BarcodeRef } from "../types/mete";
import { CartDrink } from "../types/register";
import currency from "../util/currency";

interface StornoInfo {
  userId: string;
  amount: BigInt;
  stornoTimeout: number;
}

interface Drink extends MeteDrink {
  barcodes: string[];
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
    const [drinks, barcodeRefs]: [MeteDrink[], BarcodeRef[]] =
      await Promise.all([getDrinks(), getBarcodeRefs()]);

    this.drinks = drinks.map((drink) => ({
      ...drink,
      barcodes: barcodeRefs
        .filter((barcodeRef) => barcodeRef.drink == drink.id)
        .map((barcode) => barcode.id),
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
      const notify = (this as any).$notify as Function;
      const drink = this.drinks.find((drink) =>
        drink.barcodes.includes(barcode)
      );
      if (drink !== undefined) {
        this.addDrink(drink);
      } else {
        notify({
          title: "Unbekannter Barcode!",
          message: `Bitte den Barcode ${barcode} im Administrationsbereich hinterlegen!`,
          type: "warning",
        });
      }
    },

    async storno() {
      const notify = (this as any).$notify as Function;
      if (!this.stornoInfo) {
        notify({
          title: `Keine Stornoinformationen vorhanden! Zu spät?`,
          type: "warning",
        });
        return;
      }
      clearTimeout(this.stornoInfo.stornoTimeout);
      try {
        await fetch(
          `/mete/users/${this.stornoInfo.userId}/deposit?amount=${
            Number(this.stornoInfo.amount) / 100
          }`,
          {
            headers: {
              "X-Storno": "1",
            },
          }
        );
        notify({
          title: `Storno erfolgreich`,
          type: "success",
        });
        this.stornoInfo = null;
      } catch (e) {
        notify({
          title: "Fehler!",
          message: `${e.message}`,
          type: "error",
        });
      }
    },

    async checkoutAsUser(userId: string) {
      // unsure how to fix typing...$notify is installed globally by element-plus
      const notify = (this as any).$notify as Function;
      // no idea how to install a general error handler yet
      try {
        // https://github.com/chaosdorf/mete/issues/97
        //
        // const transactions = this.cart.reduce((prev, drink) => {
        //   for (let i = 0; i < drink.count; i++) {
        //     prev.push(
        //       fetch(`/mete/api/v1/users/${userId}/buy.json?drink=${drink.id}`)
        //     );
        //   }
        //   return prev;
        // }, [] as Promise<Response>[]);

        // const responses = await Promise.all(transactions);

        // serialize requests for now :S

        for (const drink of this.cart) {
          for (let i = 0; i < drink.count; i++) {
            const response = await fetch(
              `/mete/api/v1/users/${userId}/buy.json?drink=${drink.id}`
            );
            if (!response.ok) {
              throw new Error(`Error calling backend: ${response.statusText}`);
            }
          }
        }
        if (this.stornoInfo) {
          clearTimeout(this.stornoInfo!.stornoTimeout);
        }
        this.stornoInfo = {
          userId: userId,
          amount: this.cart.reduce(
            (prev, drink) => prev + drink.price * BigInt(drink.count),
            0n
          ),
          stornoTimeout: setTimeout(() => {
            notify({
              title: `Stornozeit abgelaufen`,
              type: "info",
            });
            this.stornoInfo = null;
          }, 60000),
        };
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
      }
    },
  },
  data: () => {
    return {
      drinks: [] as Drink[],
      cart: [] as CartDrink[],
      stornoInfo: null as StornoInfo | null,
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
