<template>
  <div class="full-width text-center logos q-pb-sm q-px-md">
    <div class="div4">
      <router-link to="/">
        <img src="~assets/img/LocketStudioMain.png" />
      </router-link>
    </div>

  </div>
</template>
<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "LayoutBanner",
  setup() {
    return {};
  },
});
</script>
<style lang="scss" scoped>
.logo path {
  fill: #fff;
}


.logos {
  display: grid;
  grid-template-columns: min(20vw, 200px) 1fr repeat(4, min(5vw, 50px));
  grid-template-rows: repeat(3, 45px);
  grid-column-gap: 0px;
  grid-row-gap: 0px;
  align-items: center;

  div {
    img {
      max-height: 70px;
      max-width: 100%;
    }
  }
}


.div1 {
  grid-area: 1 / 1 / 2 / 2;
}

.div2 {
  grid-area: 2 / 1 / 3 / 2;
}

.div3 {
  grid-area: 3 / 1 / 4 / 2;
}

div.div4 {
  grid-area: 1 / 2 / 4 / 3;

  img {
    max-height: 180px;
    width: 70%;
  }
}

.div5 {
  grid-area: 1 / 3 / 2 / 5;
}

.div6 {
  grid-area: 1 / 5 / 2 / 7;
}

.div7 {
  grid-area: 2 / 4 / 3 / 6;
}

.div8 {
  grid-area: 3 / 3 / 4 / 7;
}
</style>
