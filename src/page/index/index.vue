<template>
  <div class="pull-height animated" :class="{'zoomOutUp': isLock}">
    <div class="index flex">
      <sidebar class="left"></sidebar>
      <div class="right flex">
        <div class="nav">
          <top></top>
          <tags></tags>
        </div>
        <div class="main">
          <keep-alive>
            <router-view v-if="$route.meta.keepAlive"></router-view>
          </keep-alive>
          <router-view v-if="!$route.meta.keepAlive"></router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {mapGetters} from "vuex";
  import top from "./top";
  import tags from "./tags";
  import sidebar from "./sidebar";

  export default {
    name: "index",
    components: {top, tags, sidebar},
    data() {
      return {};
    },
    created() {},
    mounted() {},
    computed: mapGetters(["isLock"])
  };
</script>

<style lang="scss" scoped>
  .index {
    position: relative;
    height: 100%;
    background: #fff;
    overflow: hidden;
    .left {
      width: 200px;
      overflow-y: auto;
    }
    .right {
      flex: 1;
      flex-direction: column;
      .main {
        flex: 1;
        overflow-y: scroll;
      }
      .nav {
        width: 100%;
        height: 108px;
      }
    }
  }
</style>
