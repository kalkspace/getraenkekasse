<template>
  <el-dialog title="Nutzer:in wählen" v-model="dialogVisible" width="95%">
    <div v-if="loading" v-loading="loading">Loading...</div>
    <div v-if="!loading">
      <el-row type="flex" :gutter="20">
        <el-col :span="24"
          ><el-input placeholder="Nutzer:in suchen" v-model="search"></el-input
        ></el-col>
      </el-row>
      <el-row type="flex" :gutter="20">
        <el-col :span="4" v-for="user in filteredUsers">
          <el-card class="card" @click="checkout(user.id)">
            <el-row>
              <el-col><img :src="gravatar(user.email)" class="image" /></el-col>
            </el-row>
            <el-row>
              <el-col>{{ user.name }}</el-col>
            </el-row>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </el-dialog>
  <el-row>
    <el-col :span="24"
      ><el-button type="primary" @click="openUserDialog()"
        >Bezahlen</el-button
      ></el-col
    >
  </el-row>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import UserList from "./UserList.vue";
import MD5 from "crypto-js/md5";

export default defineComponent({
  components: { UserList },
  name: "Checkout",
  data() {
    return {
      dialogVisible: false,
      form: { selectedUser: "" },
      loading: false,
      users: [],
      search: "",
    };
  },
  methods: {
    gravatar(email: string) {
      return `https://www.gravatar.com/avatar/${MD5(email)}`;
    },
    async openUserDialog() {
      this.users = [];
      this.dialogVisible = true;
      this.loading = true;
      let response;
      try {
        response = await fetch("/mete/api/v1/users.json");
        this.users = await response.json();
      } catch (e) {
        this.loading = false;
        throw e;
      }
      this.loading = false;
    },
    checkout(userId: string) {
      this.dialogVisible = false;
      this.$emit("checkout", userId);
    },
  },
  props: {
    disabled: {
      type: Boolean,
    },
  },
  emits: ["checkout"],
  computed: {
    filteredUsers: function () {
      return this.users.filter((user) => {
        return user.name.toLowerCase().includes(this.search.toLowerCase());
      });
    },
  },
});
</script>

<style scoped>
.card {
  cursor: pointer;
}
</style>
