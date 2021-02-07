<template>
  <el-row :gutter="20">
    <el-col :span="18">
      <ProductList @addDrink="addDrink" :drinks="drinks" />
    </el-col>
    <el-col :span="6" class="summary">
      <el-table
        class="table"
        :data="cart"
        stripe
        border
        show-summary
        :summary-method="getTotal"
        style="width: 100%"
      >
        <el-table-column prop="count" label="Anzahl">
          <template #default="scope">
            <el-button @click="removeDrink(scope.row)">-</el-button
            ><span>{{ scope.row.count }}</span
            ><el-button @click="scope.row.count++">+</el-button></template
          ></el-table-column
        >
        <el-table-column prop="name" label="Name"> </el-table-column>
        <el-table-column prop="price" label="Preis"
          ><template #default="scope">
            <!-- For some reason without the "|| 0" vue will yield a warning -->
            <Price :cents="scope.row.price || 0n"
          /></template>
        </el-table-column>
      </el-table>
      <Checkout :disabled="cart.length == 0" @checkout="checkout" />
    </el-col>
  </el-row>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import currency from "../util/currency";
import Price from "./Price.vue";
import ProductList from "./ProductList.vue";
import Checkout from "./Checkout.vue";

import { Drink as MeteDrink, User, BarcodeRef } from "../mete";

interface Drink extends MeteDrink {
  barcode: string | undefined;
  price_cents: bigint;
}

interface CashierData {
  drinks: Drink[];
  cart: CartDrink[];
}

interface CartDrink {
  name: string;
  id: number;
  price: bigint;
  count: number;
}

interface SummaryData {
  data: CartDrink[];
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

export default defineComponent<{}, {}, CashierData>({
  name: "Cashier",
  components: { Checkout, Price, ProductList },
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
    console.log(this.drinks);
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
    getTotal(param: SummaryData) {
      const { data } = param;
      const sums: string[] = ["Gesamt"];

      const prices = data.map((item) => item["price"] * BigInt(item["count"]));
      const sum = prices.reduce((prev, price) => prev + price, 0n);
      sums.push(currency(sum));
      return sums;
    },
    addFromBarcode(barcode: string) {
      const drink = this.drinks.find((drink) => drink.barcode === barcode);
      if (drink !== undefined) {
        this.addDrink(drink);
      }
    },
    async checkoutAsUser(user: User) {
      this.$notify({
        title: "Success",
        message: `${user.name} checked out successfully`,
        type: "success",
      });
      this.cart = [];
    },
  },
  data: () => {
    return {
      drinks: [],
      cart: [],
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
