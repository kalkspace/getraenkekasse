<template>
  <ImagePriceCardList :items="drinksAsItems" @click="itemClicked" />
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Drink } from "../types/register";
import ImagePriceCardList, {
  ImagePriceCardItem,
} from "./ImagePriceCardList.vue";

interface ProductImagePriceCardItem extends ImagePriceCardItem {
  id: number;
}

export default defineComponent({
  name: "ProductList",
  components: { ImagePriceCardList },
  emits: ["addDrink"],
  computed: {
    drinksAsItems(): ImagePriceCardItem[] {
      return this.$props.drinks.map((drink) => {
        return {
          id: drink.id,
          name: drink.name,
          imageUrl: `/mete/${drink.logo_url}`,
          priceCents: drink.price_cents,
        };
      });
    },
  },
  methods: {
    itemClicked(item: ProductImagePriceCardItem) {
      this.$emit(
        "addDrink",
        this.$props.drinks.find((drink) => drink.id == item.id)
      );
    },
  },
  props: { drinks: { type: Object as PropType<Drink[]>, required: true } },
});
</script>

<style scoped>
.col {
  padding: 10px 0;
}

.card {
  cursor: pointer;
}

.image {
  width: 100%;
  display: block;
  max-height: 100px;
  object-fit: contain;
}
</style>
