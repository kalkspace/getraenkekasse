<template>
  <el-form ref="form" :model="form" label-width="120px">
    <el-form-item label="Bezahlen als">
      <UserList v-model="form.selectedUser" />
    </el-form-item>
    <el-form-item>
      <el-button
        type="primary"
        :disabled="form.selectedUser == ''"
        @click="checkout"
        >Bezahlen</el-button
      >
    </el-form-item>
  </el-form>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import UserList from "./UserList.vue";

export default defineComponent({
  components: { UserList },
  name: "Checkout",
  data() {
    return {
      form: { selectedUser: "" },
    };
  },
  methods: {
    checkout() {
      this.$emit("checkout", this.form.selectedUser);
      this.form.selectedUser = "";
    },
  },
  props: {
    disabled: {
      type: Boolean,
    },
  },
  emits: ["checkout"],
});
</script>
