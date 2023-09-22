<template>
  <el-card class="card" @click="$emit('click', user)">
    <el-row>
      <el-col><img :src="gravatar(user.email)" class="image" /></el-col>
    </el-row>
    <el-row>
      <el-col>{{ user.name }}</el-col>
    </el-row>
  </el-card>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue";
import { User } from "../types/mete";
import MD5 from "crypto-js/md5";

export default defineComponent({
  name: "UserCard",
  props: { user: { type: Object as PropType<User>, required: true } },
  emits: ["click"],
  methods: {
    gravatar(email: string) {
      return `https://www.gravatar.com/avatar/${MD5(email)}`;
    },
  },
});
</script>
