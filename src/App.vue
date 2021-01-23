<template>
  <el-container>
    <el-header>Getränkekasse</el-header>
    <el-main>
      <Cashier />
    </el-main>
  </el-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Cashier from "./components/Cashier.vue";

export default defineComponent({
  name: "App",
  components: {
    Cashier,
  },
});
</script>

<style>
html,
body {
  margin: 0;
}

.el-header {
  background-color: #b3c0d1;
  color: #333;
  line-height: 60px;
}

.el-aside {
  color: #333;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
