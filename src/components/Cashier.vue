<template>
  <el-row :gutter="20">
    <el-col :span="18">
      <el-row :gutter="20" class="product-container">
        <el-col
          :span="8"
          :key="key"
          class="product-card"
          v-for="(product, key) in products"
        >
          <el-card>
            <img :src="product.image" class="image" />
            <div style="padding: 14px">
              <el-row>
                <el-col>{{ product.name }}</el-col>
                <el-col><Price :value="product.price" /></el-col>
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
            <button>-</button><span>{{ scope.row.count }}</span
            ><button>+</button></template
          ></el-table-column
        >
        <el-table-column prop="name" label="Name"> </el-table-column>
        <el-table-column prop="price" label="Preis"
          ><template #default="scope">
            <!-- For some reason without the "|| 0" vue will yield a warning -->
            <Price :value="scope.row.price || 0"
          /></template>
        </el-table-column>
      </el-table>
    </el-col>
  </el-row>
</template>

<script lang="ts">
import { defineComponent, h } from "vue";
import currency from "../util/currency";
import Price from "./Price.vue";

export default defineComponent({
  name: "Cashier",
  components: { Price },
  methods: {
    getTotal(param: any) {
      const { data } = param;
      const sums: string[] = ["Gesamt"];

      const prices = data.map((item) => item["price"]);
      const sum = prices.reduce((prev, price) => prev + price, 0);
      sums.push(currency(sum));
      return sums;
    },
  },
  data: () => {
    return {
      cart: [
        { name: "Kaffee", price: 0.5, count: 1 },
        { name: "Bier", price: 0.5, count: 2 },
      ],
      products: [
        {
          name: "Kaffee",
          image: "https://netzfrauen.org/wp-content/uploads/2014/02/Kaffee.jpg",
          price: 0.5,
        },
        {
          name: "Bier",
          image:
            "https://images.alko.fi/images/cs_srgb,f_auto,t_medium/cdn/781456/sunner-kolsch.jpg",
          price: 0.5,
        },
        {
          name: "Kaffee",
          image: "https://netzfrauen.org/wp-content/uploads/2014/02/Kaffee.jpg",
          price: 0.5,
        },
        {
          name: "Kaffee",
          image: "https://netzfrauen.org/wp-content/uploads/2014/02/Kaffee.jpg",
          price: 0.5,
        },
        {
          name: "Kaffee",
          image: "https://netzfrauen.org/wp-content/uploads/2014/02/Kaffee.jpg",
          price: 0.5,
        },
      ],
      test: 1,
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
