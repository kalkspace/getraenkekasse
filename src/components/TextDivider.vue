<template>
  <el-row :gutter="20" class="container">
    <el-col class="divider"><slot></slot> </el-col>
  </el-row>
</template>

<style>
.divider {
  padding: 5px;
  background-color: #c6e2ff;
}
</style>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "TextDivider",
});
</script>
