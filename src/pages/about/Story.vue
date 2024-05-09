<template>
  <h3>An Established History</h3>
  <q-img
    :src="`https://via.placeholder.com/400x200?text=decoration`"
    width="50%"
    class="float-right q-ml-lg q-mb-lg fade-left-img"
    fit="fill"
    data-aos="fade-left"
  />
  <p>
    Many manufacturing companies have come and gone since we started in
    business. Established in 1897, we are family owned and operated.
  </p>
  <p>
    Over the years, we have established a reputation for Integrity, Reliability,
    and Service. Our customers know they can count on us, and it is for this
    reason that the names Kiddie Kraft and Marathon are known throughout the
    U.S.A.
  </p>
  <p>
    The acceptance and achievements of Marathon Company have been due to our
    ability to manufacture a quality piece of jewelry of superior design and
    craftsmanship at an affordable price. A Lifetime Guarantee accompanies every
    item we manufacture.
  </p>
  <q-separator class="clear q-mt-lg" />
  <h4>Sustainability Commitment</h4>
  <p>
    Marathon Company fully recognizes the importance of sustainability in
    developing and strengthening our mission. Our approach aims to take a
    leadership role by advancing the understanding of sustainability, developing
    strategic partnerships, and implementing best practices to reduce the impact
    of our operations on the environment and people.
  </p>
  <h4>Guiding Principles:</h4>
  <q-img
    :src="`https://via.placeholder.com/200x400?text=decoration`"
    width="20%"
    class="float-left"
    fit="contain"
    data-aos="fade-right"
    data-aos-anchor-placement="top-bottom"
  />
  <q-list>
    <q-item data-aos="zoom-in-left">
      To comply with, and exceed where practicable, all applicable legislation,
      regulations, and codes of practice.
    </q-item>
    <q-item data-aos="zoom-in-left">
      To integrate sustainability considerations into our business decisions.
    </q-item>
    <q-item data-aos="zoom-in-left">
      To ensure that all staff are fully aware of our Sustainability Policy and
      are committed to implementing and improving it.
    </q-item>
    <q-item data-aos="zoom-in-left">
      To minimize the impact on the sustainability of all office and
      transportation activities.
    </q-item>
    <q-item data-aos="zoom-in-left">
      To make clients and suppliers aware of our Sustainability Policy, and
      encourage them to adopt sound sustainable management practices.
    </q-item>
    <q-item data-aos="zoom-in-left">
      To review annually and to continually strive to improve our sustainability
      performance.
    </q-item>
  </q-list>
  <h4 class="clear">Practical Steps:</h4>
  <q-img
    :src="`https://via.placeholder.com/200x400?text=decoration`"
    width="20%"
    class="float-right"
    fit="contain"
    data-aos="fade-left"
    data-aos-anchor-placement="top-bottom"
  />
  <q-list>
    <q-item-label header> Travel and Meetings </q-item-label>
    <q-item>
      Walk, cycle, carpool, and/or use public transport to attend meetings, site
      visits, etc, apart from circumstances where the alternatives are
      impractical and/or cost-prohibitive.
    </q-item>
    <q-item>
      Avoid physically traveling to meetings etc where alternatives are
      available and practical, such as using teleconferencing, video
      conferencing, or webcams, and efficient timing of meetings to avoid
      multiple trips. These options are also often more time-efficient, while
      not sacrificing the benefits of regular contact with clients and partners.
    </q-item>
    <q-item>
      Reduce the need for our staff to travel by supporting alternative working
      arrangements where possible, including home working.
    </q-item>
  </q-list>
  <q-list>
    <q-item-label header>
      Purchase of Equipment and Consumption of Resources
    </q-item-label>
    <q-item>
      Minimize our use of paper and other office consumables, for example by
      double-siding all paper used, reusing scrap paper and packaging, and
      identifying opportunities to reduce waste. As far as possible arrange for
      the reuse or recycling of office waste, including paper, computer
      supplies, and redundant equipment.
    </q-item>
    <q-item>
      Reduce the energy consumption of office and manufacturing equipment by
      purchasing energy-efficient equipment and good housekeeping and
      maintenance.
    </q-item>
  </q-list>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "Story",
  setup() {
    return {};
  },
});
</script>
<style lang="scss" scoped>
.fade-left-img {
  position: relative;
  &::after {
    background: linear-gradient(
      to right,
      rgba(240, 235, 235, 1) 0%,
      rgba(240, 235, 235, 0) 40%
    );
    content: "";
    height: 100%;
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;
    z-index: 1;
  }
}
</style>
