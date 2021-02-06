<template>
  <el-row :gutter="20">
    <el-col :span="18">
      <el-row :gutter="20" class="product-container">
        <el-col
          :span="8"
          :key="key"
          v-for="(drink, key) in drinks"
          class="product-card"
        >
          <el-card @click="addDrink(drink)">
            <img :src="'/mete/' + drink.logo_url" class="image" />
            <div style="padding: 14px">
              <el-row>
                <el-col>{{ drink.name }}</el-col>
                <el-col><Price :cents="20n" /></el-col>
              </el-row>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-col>
    <el-col :span="6" class="summary">
      <el-table
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
  components: { Price },
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
el-card {
  padding: 20px;
}

table {
  width: 100%;
}

.product-container {
  margin-top: -10px;
}

.product-card {
  padding: 10px 0;
}
.right {
  text-align: right;
}

.time {
  font-size: 13px;
  color: #999;
}

.bottom {
  margin-top: 13px;
  line-height: 12px;
}

.button {
  padding: 0;
  float: right;
}

.image {
  width: 100%;
  display: block;
  max-height: 100px;
  object-fit: contain;
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
