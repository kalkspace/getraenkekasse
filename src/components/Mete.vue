<template>
  <iframe ref="mete" class="meteframe" :src="url" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Mete",
  props: {
    url: {
      type: String,
      required: true,
    }
  }
});
</script>
