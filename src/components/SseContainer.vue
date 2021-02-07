<template>
  <Cashier ref="cashier" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Cashier from "./Register.vue";
// it seems firefox closes the connection very frequently...so reconnect automatically
import ReconnectingEventSource from "reconnecting-eventsource";
import { User } from "../types/mete";

interface UserMapping {
  id: string;
  meteId: number;
}

const fetchMeteUser = async (nfcId: string) => {
  const mappingResponse = await fetch(`/mete-compat/user-mapping/${nfcId}`);
  const mapping: UserMapping = await mappingResponse.json();

  const userResponse = await fetch(`/mete/api/v1/users/${mapping.meteId}`);
  const user: User = await userResponse.json();
  return user;
};

export default defineComponent({
  name: "SseContainer",
  components: { Cashier },
  mounted() {
    const cashier = this.$refs.cashier as typeof Cashier;
    const evtSource = new ReconnectingEventSource("/events");
    evtSource.addEventListener("nfc-plain", function (event: Event) {
      console.log("plain", JSON.parse((event as any).data!));
    });

    evtSource.addEventListener("nfc-uuid", function (event: Event) {
      fetchMeteUser(JSON.parse((event as any).data!)).then((user: User) =>
        cashier.checkoutAsUser(user)
      );
    });

    evtSource.addEventListener("nfc-invalid", function (event: Event) {
      console.log("invalid", JSON.parse((event as any).data!));
    });

    evtSource.addEventListener("barcode", (event: Event) => {
      cashier.addFromBarcode(JSON.parse((event as any).data!));
    });
  },
});
</script>
