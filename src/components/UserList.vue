<template>
  <div>
    <el-select
      :model-value="modelValue"
      @change="$emit('update:modelValue', $event)"
      filterable
      remote
      placeholder="Nutzer:in suchen"
      :remote-method="remoteMethod"
      :loading="loading"
    >
      <el-option
        v-for="user in users"
        :key="user.value"
        :label="user.label"
        :value="user.value"
      >
      </el-option>
    </el-select>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { User } from "../types/mete";

export default defineComponent({
  name: "UserList",
  props: { modelValue: { type: String } },
  emits: ["update:modelValue"],
  data() {
    return {
      users: [],
      loading: false,
      wurst: null,
    };
  },
  methods: {
    async remoteMethod(query: string) {
      // well...api doesn't support remote filtering T_T
      this.loading = true;
      let response;
      try {
        response = await fetch("/mete/api/v1/users.json");
      } catch (e) {
        this.loading = false;
        throw e;
      }
      this.loading = false;
      if (!response.ok) {
        throw new Error(
          `Got invalid answer while requesting users: ${response.status} ${response.statusText}`
        );
      }
      const users = await response.json();
      this.users = users
        .filter((user: User) => user.name.includes(query))
        .map((user: User) => {
          return {
            value: user.id.toString(),
            label: user.name,
          };
        });
    },
  },
});
</script>
