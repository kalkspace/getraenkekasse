<template>
  <el-table
    class="table"
    :data="items"
    stripe
    border
    show-summary
    :summary-method="getTotal"
    style="width: 100%"
  >
    <el-table-column prop="count" label="Anzahl">
      <template #default="scope">
        <el-button class="btn" @click="$emit('removeDrink', scope.row)"
          >-</el-button
        ><span>{{ scope.row.count }}</span
        ><el-button class="btn" @click="scope.row.count++"
          >+</el-button
        ></template
      ></el-table-column
    >
    <el-table-column prop="name" label="Name" />
    <el-table-column prop="price" label="Einzelpreis">
      <template #default="scope">
        <!-- For some reason without the "|| 0" vue will yield a warning -->
        <Price :cents="scope.row.price || 0n"
      /></template>
    </el-table-column>
    <el-table-column prop="price" label="Preis"
      ><template #default="scope">
        <!-- For some reason without the "|| 0" vue will yield a warning -->
        <Price :cents="getRowPrice(scope.row)"
      /></template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import Price from "./Price.vue";
import { CartDrink } from "../types/register";
import currency from "../util/currency";

interface SummaryData {
  data: CartDrink[];
}

export default defineComponent({
  name: "Cart",
  components: { Price },
  props: { items: { type: Object as PropType<CartDrink> } },
  emits: ["removeDrink"],
  methods: {
    getRowPrice({ price, count }: CartDrink) {
      return price * BigInt(count);
    },
    getTotal(param: SummaryData) {
      const { data } = param;
      const sums: string[] = ["Gesamt", "", ""];

      const prices = data.map((item) => item["price"] * BigInt(item["count"]));
      const sum = prices.reduce((prev, price) => prev + price, 0n);
      sums.push(currency(sum));
      return sums;
    },
  },
});
</script>

<style scoped>
.btn {
  margin-left: 5px;
  margin-right: 5px;
}
</style>

<style>
.el-table__footer {
  font-weight: bold;
  text-transform: uppercase;
}
</style>
