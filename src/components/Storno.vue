<template>
  <div class="storno">
    <div class="text">STORNO</div>
    <img v-bind:src="kidUrl" @animationend="$emit('finished')" />
  </div>
</template>

<style scoped>
.storno {
  animation-delay: 0.6s;
  animation-name: background-flash;
  animation-duration: 0.05s;
  animation-iteration-count: 20;
  animation-direction: alternate;
  margin: 0;
  position: absolute;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  z-index: 100;
}

.storno img {
  animation-timing-function: ease-in-out;
  animation-duration: 3s;
  animation-name: kid;
  bottom: 0;
  position: absolute;
  transform: translateX(-100%);
}

.storno div {
  font-size: 20vh;
  font-weight: bold;
  color: red;
  font-family: "Comic Sans MS", "Comic Sans", cursive;
  width: 100%;
  text-align: center;
  animation-duration: 1s;
  animation-name: text;
  position: absolute;
  transform: translateY(-100%);
  animation-timing-function: ease-out;
  animation-iteration-count: 2;
  animation-direction: alternate;
}

@keyframes background-flash {
  from {
    background-color: white;
  }

  to {
    background-color: black;
  }
}

@keyframes text {
  from {
    top: 0%;
  }

  60%,
  to {
    top: 30%;
  }
}

@keyframes kid {
  from {
    left: 0%;
  }

  40% {
    left: 50%;
  }

  50% {
    left: 50%;
  }

  60% {
    left: 40%;
  }

  to {
    left: 100%;
    transform: translateX(0%);
  }
}
</style>

<script lang="ts">
import { defineComponent } from "vue";
import kidUrl from "../images/kid.png";

export default defineComponent({
  name: "Storno",
  emits: ["finished"],
  data() {
    return { kidUrl };
  },
});
</script>
