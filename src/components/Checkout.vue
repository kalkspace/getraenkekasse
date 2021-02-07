<template></template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Checkout",
  props: {
    disabled: {
      type: Boolean,
    },
  },
  emits: ["checkout"],
});
</script>
