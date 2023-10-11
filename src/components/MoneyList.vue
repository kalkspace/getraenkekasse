<template>
  <ImagePriceCardList :items="moneyAsItems" @click="itemClicked" />
</template>
<style scoped>
.container {
  padding: 10px 0;
}

.image {
  width: 100%;
  display: block;
  max-height: 100px;
  object-fit: contain;
}
</style>
<script lang="ts">
import { defineComponent } from "vue";
import ImagePriceCardList, {
  ImagePriceCardItem,
} from "./ImagePriceCardList.vue";

import fuenfzigEuro from "../images/50eur.png";
import zehnEuro from "../images/10eur.png";
import fuenfEuro from "../images/5eur.png";
import einEuro from "../images/1eur.png";

export default defineComponent({
  components: { ImagePriceCardList },
  name: "MoneyList",
  emits: ["addMoney"],
  data: () => {
    return {
      moneyOptions: [
        {
          value: BigInt(5000),
          src: fuenfzigEuro,
        },
        {
          value: BigInt(1000),
          src: zehnEuro,
        },
        {
          value: BigInt(500),
          src: fuenfEuro,
        },
        {
          value: BigInt(100),
          src: einEuro,
        },
      ],
    };
  },
  methods: {
    itemClicked(item: ImagePriceCardItem) {
      this.$emit("addMoney", item.priceCents);
    },
  },
  computed: {
    moneyAsItems(): ImagePriceCardItem[] {
      return this.moneyOptions.map((moneyOption) => {
        return {
          imageUrl: moneyOption.src,
          priceCents: moneyOption.value,
        };
      });
    },
  },
});
</script>
