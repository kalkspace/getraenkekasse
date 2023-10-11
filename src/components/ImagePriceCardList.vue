<template>
  <el-row :gutter="20" class="container">
    <el-col :span="6" :key="key" v-for="(item, key) in items" class="col">
      <el-card class="card" @click="$emit('click', item)">
        <img :src="item.imageUrl" class="image" />
        <div style="padding: 14px">
          <el-row>
            <el-col v-if="item.name">{{ item.name }}</el-col>
            <el-col><Price :cents="item.priceCents" /></el-col>
          </el-row>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>
<style scoped>
.container {
  padding: 10px 0;
}

.image {
  width: 100%;
  display: block;
  max-height: 100px;
  object-fit: contain;
}
</style>
<script lang="ts">
export interface ImagePriceCardItem {
  name?: string;
  imageUrl: string;
  priceCents: BigInt;
}

import { PropType, defineComponent } from "vue";
import Price from "./Price.vue";

export default defineComponent({
  components: { Price },
  props: {
    items: {
      type: Array as PropType<ImagePriceCardItem[]>,
      required: true,
    },
  },
  name: "ImagePriceCardList",
  emits: ["click"],
});
</script>
