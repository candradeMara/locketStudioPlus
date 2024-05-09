<template>
  <h3>Meaningful Warranty</h3>
  <p>
    Marathon Company warranties all products against original manufacturing
    defects during the lifetime of the items. All warranties are
    non-transferrable and are only available to the end-users of our products.
    Warranties do not apply to products purchased from online vendors or auction
    sites unathorized to sell Marathon products including ebay.com.
  </p>
  <p>
    The tarnishing of natural sterling silver products is not considered a
    manufacturing defect.
  </p>
  <p>
    Please direct all warranty inquiries to the authorized retailer from whom it
    was purchased or
    <router-link to="/contact"> contact us </router-link> directly.
  </p>
  <q-separator />
  <h3>Product Care</h3>
  <p>
    All Marathon products are made from the highest quality metals. Natural
    silver will patina with age. To remove tarnish from your item(s), please
    follow instructions from an appropriate jewelry cleaner.
  </p>
  <h5>How to clean your jewelry</h5>
  <p>
    Mix a few drops of liquid dish soap with warm water. Dip a soft cloth in the
    solution and rub the jewelry to remove the dirt and tarnish. Rinse with cool
    water and gently buff dry with another soft cloth.
  </p>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "Warranty",
  setup() {
    return {};
  },
});
</script>
<style lang="scss" scoped>
.instructions {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.step {
  align-items: center;
  display: flex;
  flex-direction: row;
  min-height: 300px;
  width: 80vw;
  p,
  img {
    text-align: center;
    width: 50%;
  }
}
#step-4 {
  p {
    align-self: center;
    margin: 0 auto;
    width: 100%;
  }
}
.number {
  background: white;
  box-shadow: $shadow-6;
  border-radius: 100%;
  display: block;
  height: 2.5rem;
  line-height: 2.5rem;
  margin: 0.5rem auto;
  text-align: center;
  width: 2.5rem;
}
</style>
