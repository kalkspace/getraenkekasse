<template>
  <el-dialog title="Nutzer:in wählen" v-model="dialogVisible" width="95%">
    <div v-if="loading" v-loading="loading">Loading...</div>
    <div v-if="!loading">
      <el-row type="flex" :gutter="20">
        <el-col>
          <h3>Letzte Nutzer:innen</h3>
        </el-col>
      </el-row>
      <el-row type="flex" :gutter="20">
        <!-- todo refactor into UserCard component -->
        <el-col :span="4" v-for="user in lastUsers">
          <el-card class="card" @click="checkout(user)">
            <el-row>
              <el-col><img :src="gravatar(user.email)" class="image" /></el-col>
            </el-row>
            <el-row>
              <el-col>{{ user.name }}</el-col>
            </el-row>
          </el-card>
        </el-col>
      </el-row>
      <el-divider />
      <el-row type="flex" :gutter="20">
        <el-col :span="24"
          ><el-input placeholder="Nutzer:in suchen" v-model="search"></el-input
        ></el-col>
      </el-row>
      <el-row type="flex" :gutter="20">
        <el-col :span="4" v-for="user in filteredUsers">
          <el-card class="card" @click="checkout(user)">
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

import MD5 from "crypto-js/md5";
import { User } from "../types/mete";

export default defineComponent({
  name: "Checkout",
  mounted() {
    this.updateLastUsers();
  },
  data() {
    return {
      lastUsers: [] as User[],
      dialogVisible: false,
      form: { selectedUser: "" },
      loading: false,
      users: [] as User[],
      search: "",
    };
  },
  methods: {
    gravatar(email: string) {
      return `https://www.gravatar.com/avatar/${MD5(email)}`;
    },
    async openUserDialog() {
      this.updateLastUsers();
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
    updateLastUsers() {
      this.lastUsers = [];
      const storedLastUsers = localStorage.getItem("lastUsers");
      if (storedLastUsers !== null) {
        try {
          const value = JSON.parse(storedLastUsers) as User[];
          // enough check for now
          if (Array.isArray(value)) {
            this.lastUsers = value;
          }
        } catch (e) {
          console.error(`couldn't parse lastUsers: ${e}`);
        }
      }
    },
    checkout(user: User) {
      localStorage.setItem(
        "lastUsers",
        // remove new user from existing list if present, put user to the front and limit list to 6 entries
        JSON.stringify(
          [
            user,
            ...this.lastUsers.filter(
              (existingUser) => existingUser.id !== user.id
            ),
          ].slice(0, 6)
        )
      );
      this.dialogVisible = false;
      this.$emit("checkout", user.id);
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
