<template>
  <el-dialog
    title="Unbekannter NFC code"
    v-model="dialogVisible"
    width="50%"
    :before-close="clearDialog"
  >
    <p>
      Du hast einen unbekannten NFC Code übermittelt. Wenn du möchtest, kannst
      du diesen Code in der Kasse hinterlegen und so in Zukunft damit bezahlen.
      Wähle dazu hier eine Nutzer:in aus.
    </p>
    <UserList v-model="selectedUser" />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="clearDialog()">Abbrechen</el-button>
        <el-button
          type="primary"
          @click="registerNfc(unregisteredNfc, selectedUser)"
          :disabled="selectedUser == ''"
          >NFC-Code registrieren</el-button
        >
      </span>
    </template>
  </el-dialog>
  <Register ref="register" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
// it seems firefox closes the connection very frequently...so reconnect automatically
import ReconnectingEventSource from "reconnecting-eventsource";
import { User } from "../types/mete";

import Register from "./Register.vue";
import UserList from "./UserList.vue";

interface UserMapping {
  id: string;
  meteId: number;
}

class UserNotFoundError extends Error {}

const checkUserResponse = (response: Response) => {
  if (response.status === 404) {
    throw new UserNotFoundError("User not found");
  }
  if (!response.ok) {
    throw new Error(`Invalid status code ${response.status}`);
  }
};

const fetchMeteUser = async (nfcId: string) => {
  const mappingResponse = await fetch(`/mete-compat/user-mapping/${nfcId}`);
  checkUserResponse(mappingResponse);
  const mapping: UserMapping = await mappingResponse.json();

  const userResponse = await fetch(`/mete/api/v1/users/${mapping.meteId}`);
  checkUserResponse(userResponse);
  return (await userResponse.json()) as User;
};

export default defineComponent({
  name: "SseContainer",
  components: { Register, UserList },
  methods: {
    clearDialog() {
      this.unregisteredNfc = null;
      this.dialogVisible = false;
      this.selectedUser = "";
    },
    async registerNfc(nfcId: string, userId: string) {
      const response = await fetch(`/mete-compat/user-mapping`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: nfcId,
          meteId: parseInt(userId, 10),
        }),
      });
      if (!response.ok) {
        throw new Error(`Invalid answer ${response.status}`);
      }
      (this as any).$notify({
        type: "success",
        title: "NFC erfolgreich verknüpft",
        message: "Du kannst jetzt kontaktlos bezahlen",
      });

      this.clearDialog();
    },
  },
  mounted() {
    const notify = (this as any).$notify;
    const register = this.$refs.register as typeof Register;
    const evtSource = new ReconnectingEventSource("/events");

    const handleNfc = (event: Event) => {
      this.clearDialog();
      const nfcId = JSON.parse((event as any).data!);
      fetchMeteUser(nfcId)
        .then((user: User) => register.checkoutAsUser(user.id))
        .catch((e) => {
          if (e instanceof UserNotFoundError) {
            this.unregisteredNfc = nfcId;
            this.dialogVisible = true;
          } else {
            notify({
              type: "error",
              title: "Konnte NFC nicht lesen",
              message: "Bitte erneut probieren!",
            });
          }
        });
    };

    evtSource.addEventListener("nfc-plain", handleNfc);
    evtSource.addEventListener("nfc-uuid", handleNfc);
    evtSource.addEventListener("nfc-missing-getraenkekarte", (event: Event) => {
      console.log("missing getraenkekarte", JSON.parse((event as any).data!));
      notify({
        type: "warning",
        title: "Fehlende Android App!",
        message: "Bitte die KalkSpace App Getränkekarte installieren!",
      });
    });

    evtSource.addEventListener("nfc-invalid", (event: Event) => {
      console.log("invalid", JSON.parse((event as any).data!));
      notify({
        type: "warning",
        title: "Konnte NFC nicht lesen",
        message: "Bitte erneut probieren!",
      });
    });

    evtSource.addEventListener("barcode", (event: Event) => {
      register.addFromBarcode(JSON.parse((event as any).data!));
    });
  },
  data() {
    return {
      dialogVisible: false,
      selectedUser: "",
      unregisteredNfc: null,
    };
  },
});
</script>
