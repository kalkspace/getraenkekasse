<template>
  <el-container class="maincontainer">
    <el-header>
      <el-button @click="menu = true">Menü</el-button>
      Getränkekasse
    </el-header>
    <el-drawer title="Menü" v-model="menu" direction="ltr">
      <!-- Poor mans routing -->
      <div>
        <el-link type="primary" @click="goRegister($event)"
          >Getränkekasse</el-link
        >
      </div>
      <div>
        <el-link type="primary" @click="goMete($event)">Mete</el-link>
      </div>
    </el-drawer>
    <el-main v-if="!mete">
      <SseContainer />
    </el-main>
    <!-- <base href="/mete" /> -->
    <iframe class="meteframe" v-if="mete" src="/mete" />
  </el-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import SseContainer from "./components/SseContainer.vue";

export default defineComponent({
  name: "App",
  components: {
    SseContainer,
  },
  data() {
    return {
      menu: false,
      mete: false,
    };
  },
  methods: {
    // "Routing"
    goMete($event: Event) {
      $event.preventDefault();

      this.menu = false;
      this.mete = true;
    },
    goRegister($event: Event) {
      $event.preventDefault();
      this.menu = false;
      this.mete = false;
    },
  },
});
</script>
<style scoped>
.maincontainer {
  height: 100%;
}
.meteframe {
  flex: 1;
  border: 0;
}
</style>

<style>
html,
body {
  margin: 0;
  width: 100%;
  height: 100%;
}

.el-header {
  background-color: #b3c0d1;
  color: #333;
  line-height: 60px;
  text-align: left;
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
  height: 100%;
}
</style>
