<template>
  <span>{{ eur }}</span>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import currency from "../util/currency";

export default defineComponent({
  name: "Price",
  props: { cents: { type: Object as PropType<bigint>, required: true } },
  computed: {
    eur(): string {
      return currency(this.cents);
    },
  },
});
</script>
