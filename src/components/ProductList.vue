<template>
  <el-row :gutter="20" class="container">
    <el-col :span="8" :key="key" v-for="(drink, key) in drinks" class="col">
      <el-card class="card" @click="$emit('addDrink', drink)">
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
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Drink } from "../types/register";
import Price from "./Price.vue";

export default defineComponent({
  name: "ProductList",
  components: { Price },
  emits: ["addDrink"],
  props: { drinks: { type: Object as PropType<Drink[]>, required: true } },
});
</script>

<style scoped>
.col {
  padding: 10px 0;
}

.card {
  cursor: pointer;
}

.image {
  width: 100%;
  display: block;
  max-height: 100px;
  object-fit: contain;
}
</style>
