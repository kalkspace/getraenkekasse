<template>
  <span>{{ eur }}</span>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import currency from "../util/currency";

export default defineComponent({
  name: "Price",
  props: { cents: { type: BigInt, required: true } },
  computed: {
    eur(): string {
      return currency(this.cents);
    },
  },
});
</script>
