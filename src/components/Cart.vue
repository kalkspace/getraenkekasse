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
        <el-button @click="$emit('removeDrink', scope.row)">-</el-button
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
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { CartDrink } from "../types/register";

export default defineComponent({
  name: "Cart",
  props: { items: { type: Object as PropType<CartDrink> } },
  emits: ["removeDrink"],
});
</script>
