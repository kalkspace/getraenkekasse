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
        <el-link type="primary" @click="goMete($event)"
          >Mete (Administrationsbereich)</el-link
        >
      </div>
    </el-drawer>
    <DeviceEvents @userId="onUserId($event)" @barcode="onBarcode($event)" />
    <el-main v-if="!mete">
      <Register ref="register" />
    </el-main>
    <Mete v-if="mete" />
  </el-container>
</template>

<script lang="ts">
import { defineComponent, nextTick } from "vue";
import DeviceEvents from "./components/DeviceEvents.vue";
import Mete from "./components/Mete.vue";
import Register from "./components/Register.vue";

export default defineComponent({
  name: "App",
  components: {
    DeviceEvents,
    Mete,
    Register,
  },
  data() {
    return {
      menu: false,
      mete: false,
    };
  },
  methods: {
    async onUserId(userId: string) {
      // in case someone left mete open => immediately redirect to kassenview
      this.menu = false;
      this.mete = false;
      await nextTick();
      const register = this.$refs.register as typeof Register;
      register.checkoutAsUser(userId);
    },
    async onBarcode(barcode: string) {
      // in case someone left mete open => immediately redirect to kassenview
      this.menu = false;
      this.mete = false;
      await nextTick();
      const register = this.$refs.register as typeof Register;
      register.addFromBarcode(barcode);
    },
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
