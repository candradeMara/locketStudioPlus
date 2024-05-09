<template>
  <div class="bg-dark full-width text-center logos q-pb-sm q-px-md">
    <div class="div1">
      <router-link to="/products/adult">
        <img src="~assets/img/logo-adult-essentials.svg" />
      </router-link>
    </div>
    <div class="div2">
      <router-link to="/products/children">
        <img src="~assets/img/logo-kiddie-kraft.png" />
      </router-link>
    </div>
    <div class="div3">
      <a href="https://locketstudio.com" target="_blank">
        <img src="~assets/img/logo-locket-studio.svg" />
      </a>
    </div>
    <div class="div4">
      <router-link to="/">
        <img src="~assets/img/logo.svg" />
      </router-link>
    </div>
    <div class="div5">
      <router-link to="/products/capeCod">
        <img src="~assets/img/logo-cape-cod-collection.svg" />
      </router-link>
    </div>
    <div class="div6">
      <router-link to="/products/convertibleCollection">
        <img src="~assets/img/logo-convertible-collection.svg" />
      </router-link>
    </div>
    <div class="div7">
      <router-link to="/products/eveningTide">
        <img src="~assets/img/logo-evening-tide-collection.svg" />
      </router-link>
    </div>
    <div class="div8">
      <a href="https://lestage.com" target="_blank">
        <img src="~assets/img/logo-lestage.svg" />
      </a>
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
    max-height: 270px;
    width: 90%;
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
