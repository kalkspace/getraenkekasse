<template>
  <span>{{ eur }}</span>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import currency from "../util/currency";

export default defineComponent({
  name: "Price",
  props: {
    cents: {
      // vue doesn't support bigint yet :S https://github.com/vuejs/vue/pull/11191
      // so we are using a validator
      // type: BigInt,
      validator: (v) => typeof v === "bigint",
      required: true,
    },
  },
  computed: {
    eur(): string {
      return currency(this.cents as bigint);
    },
  },
});
</script>
