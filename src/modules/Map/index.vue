<template>
  <div id="map">
    <!-- header -->
    <mt-header fixed :title="location != 0 ? routes[location].title : ''" :class="location === 0 ? 'header-map' : ''" class="statusBarTop header">
      <div slot="left" class="headerLeft" v-if="location === 0">
        <form action="javascript:;">
          <input
            class="search"
            type="search"
            v-model.lazy.trim="search"
            @keyup.enter="$refs.search.blur(),trigger=true"
            @focus="searchSH = false"
            @blur="(search.length ? searchSH = false : searchSH = true)"
            ref="search"
          >
        </form>
        <div class="placeholder">
          <div class="img" ref="placeholder_img" v-show="searchSH"></div>
          <span ref="placeholder_span" v-show="searchSH">搜索设备号</span>
        </div>
      </div>
      <!-- <router-link :to="-1" slot="left" v-else> -->
      <a @click="$router.goBack()" slot="left" v-else>
        <mt-button icon="back click-active blank-000"></mt-button>
      </a>
      <div slot="right" class="headerRight">
        <router-link :to="routes[location].to" class="icon click-active">
          <img :src="routes[location].icon" :alt="routes[location].title" class="click-active blank-000">
        </router-link>
      </div>
    </mt-header>
    <!-- header -->
    <transition :name="$store.state.transition.transitionName">
      <router-view class="child-view" @touchstart="$_loadmore($event)" :search.sync="search" :trigger.sync="trigger" v-if="location === 0"></router-view>
      <router-view class="child-view" @touchstart="$_loadmore($event)" v-else></router-view>
    </transition>
  </div>
</template>

<script>
import transition from '@/mixin/transition'
export default {
  name: 'Map',
  data () {
    return {
      routes: [
        { title: '主页', icon: require('@/assets/img/threeCharts/data-chart.png'), that: { name: 'Map' }, to: { name: 'MapInfo' } },
        { title: '综合信息', icon: require('@/assets/img/threeCharts/data-sheets.png'), that: { name: 'MapInfo' }, to: { name: 'MapData' } },
        { title: '数据图表', icon: require('@/assets/img/threeCharts/map.png'), that: { name: 'MapData' }, to: { name: 'Map' } }
      ],
      location: 0,
      search: '',
      searchSH: true,
      trigger: false
    }
  },
  methods: {},
  watch: {
    $route: {
      handler (to, from) {
        this.location = this.routes.findIndex(n => n.that.name === to.name)
        if (to.name === 'Map') {
          this.search = ''
          this.searchSH = true
        }
      },
      immediate: true
    },
    search (nd, od) {
      if (nd) {
        this.searchSH = false
      } else {
        this.searchSH = true
      }
    }
  },
  mixins: [transition]
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
#map {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  // padding-bottom: $footerHei;
  padding-top: $headerHei;
  .header {
    height: $headerHei;
    padding: (20px+$statusBarHei) 0  0 32px;
    background: #427fdc;
    display: flex;
    z-index: 99999999;
    &.header-map /deep/ .is-left {
      flex-grow: 1 !important;
    }
    &.header-map /deep/ .mint-header-title {
      display: none;
      flex-grow: 0 !important;
    }
    &.header-map /deep/ .is-right {
      flex-grow: 0 !important;
    }
    /deep/ .is-right {
      display: flex;
      flex-direction: row-reverse;
    }
    /deep/ .mintui-back {
      font-size: 32px;
    }
    .headerLeft {
      position: relative;
      color: #fff;
      font-size: 28px;
      overflow: hidden;
      .search {
        position: relative;
        z-index: 5;
        font-size: 28px;
        height: 56px;
        width: 100%;
        border-radius: 10px;
        background: rgba(119,167,239,0.1);
        color: #fff;
        text-indent: 10px;
      }
      .placeholder {
        // display: inline;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: #77a7ef;
        border-radius: 10px;
        line-height: 56px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 28px;
        .img {
          width: 28px;
          height: 28px;
          margin-right: 20px;
          background-image: url('../../assets/img/map/search.png');
          background-repeat: no-repeat;
          background-size: cover;
        }
        span {
          font-size: 28px !important;
        }
      }
    }
    .headerRight {
      display: flex;
      flex-direction: row-reverse;
      width: 108px;
      .icon {
        width: 100%;
        height: 88px;
        overflow: hidden;
        display: flex;
        align-items: center;
        flex-direction: row-reverse;
        img {
          margin-right: 20px;
          width: 42px;
          height: 44px;
        }
      }
    }
  }
}
</style>
