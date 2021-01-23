<template>
  <span>{{ eur }}</span>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import currency from "../util/currency";

export default defineComponent({
  name: "Price",
  props: { value: { type: Number, required: true } },
  computed: {
    eur(): string {
      return currency(this.value);
    },
  },
});
</script>
