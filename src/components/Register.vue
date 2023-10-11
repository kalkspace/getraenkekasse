<template>
  <el-row :gutter="24">
    <el-col :span="14">
      <TextDivider>Getränke</TextDivider>
      <ProductList @addDrink="addDrink" :drinks="drinks" />
      <TextDivider>Guthaben aufladen</TextDivider>
      <MoneyList @addMoney="addMoney" />
    </el-col>
    <el-col :span="10">
      <div class="summary">
        <el-row>
          <Cart :items="cart" @removeItem="removeItem" />
        </el-row>
        <el-row>
          <Checkout :disabled="cart.length == 0" @checkout="checkoutAsUser" />
        </el-row>
      </div>
    </el-col>
  </el-row>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import ProductList from "./ProductList.vue";
import Checkout from "./Checkout.vue";
import Cart from "./Cart.vue";
import TextDivider from "./TextDivider.vue";

import { Drink as MeteDrink, BarcodeRef } from "../types/mete";
import { CartDrink, CartItem, Drink } from "../types/register";
import currency from "../util/currency";
import MoneyList from "./MoneyList.vue";

interface StornoInfo {
  userId: string;
  amount: BigInt;
  stornoTimeout: number;
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
  components: { Cart, Checkout, ProductList, TextDivider, MoneyList },

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
    removeItem(cartItem: CartItem) {
      if (cartItem.count > 1) {
        cartItem.count--;
      } else {
        const existingCartItem = this.cart.findIndex((existingCartItem) => {
          if ("id" in cartItem) {
            return (
              "id" in existingCartItem &&
              (existingCartItem as CartDrink).id === (cartItem as CartDrink).id
            );
          } else {
            return existingCartItem.price == cartItem.price;
          }
        });
        this.cart.splice(existingCartItem, 1);
      }
    },
    addDrink({ name, id, price_cents: price }: Drink) {
      const existing = this.cart.find(
        (existing) => "id" in existing && existing.id! === id
      );
      if (existing) {
        existing.count++;
      } else {
        this.cart.push({ name, id, count: 1, price } as CartItem);
      }
    },

    addMoney(price_cents: bigint) {
      const deposit = -price_cents;
      const existing = this.cart.find(
        (existing) => !("id" in existing) && existing.price == deposit
      );
      if (existing) {
        existing.count++;
      } else {
        this.cart.push({
          name: `Guthaben ${price_cents / 100n} EUR`,
          count: 1,
          price: deposit,
        });
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
          message: `${(e as Error).message}`,
          type: "error",
        });
      }
    },

    async checkoutAsUser(userId: string) {
      // unsure how to fix typing...$notify is installed globally by element-plus
      const notify = (this as any).$notify as Function;
      // no idea how to install a general error handler yet
      try {
        const deposit = -this.cart
          .filter((item) => item.price < 0n)
          .reduce((prev, item) => prev + item.price * BigInt(item.count), 0n);

        if (deposit > 0n) {
          const response = await fetch(
            `/mete/users/${userId}/deposit?amount=${Number(deposit / 100n)}`
          );
          if (!response.ok) {
            throw new Error(`Error calling backend: ${response.statusText}`);
          }
        }
        const drinks = this.cart.filter((item) => "id" in item) as CartDrink[];

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
        for (const drink of drinks) {
          if (drink.price < 0n) {
            continue;
          }
          for (let i = 0; i < drink.count; i++) {
            const response = await fetch(
              `/mete-compat/api/v1/users/${userId}/buy.json?drink=${drink.id}`
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
          message: `${(e as Error).message}`,
          type: "error",
        });
      }
    },
  },
  data: () => {
    return {
      drinks: [] as Drink[],
      cart: [] as CartItem[],
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

.summary {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 1em;
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
