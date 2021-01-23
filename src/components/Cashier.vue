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
                <el-col><Price :cents="drink.price_cents" /></el-col>
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
            <Price :cents="scope.row.price || BigInt(0)"
          /></template>
        </el-table-column>
      </el-table>
    </el-col>
  </el-row>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

import currency from "../util/currency";
import Price from "./Price.vue";

interface MeteDrink {
  name: string;
  id: string;
  price: string;
}

interface Drink extends MeteDrink {
  price_cents: BigInt;
}

interface CashierData {
  drinks: Drink[];
  cart: CartDrink[];
}

interface CartDrink {
  name: string;
  id: string;
  price: BigInt;
  count: number;
}

export default defineComponent<{}, {}, CashierData>({
  name: "Cashier",
  components: { Price },
  async mounted() {
    const response = await fetch("/mete/api/v1/drinks.json");
    const meteDrinks: MeteDrink[] = await response.json();
    this.drinks = meteDrinks.map((drink) => ({
      ...drink,
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
    getTotal(param: any) {
      const { data } = param;
      const sums: string[] = ["Gesamt"];

      const prices = data.map((item) => item["price"] * BigInt(item["count"]));
      const sum = prices.reduce((prev, price) => prev + price, 0n);
      sums.push(currency(sum));
      return sums;
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
