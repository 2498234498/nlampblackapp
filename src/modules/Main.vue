<template>
  <div class="main-con">
    <v-touch
      @swiperight="onSwipeRight($event)"
      :swipe-options="{ direction: 'horizontal', threshold: 200 }"
      style="width:100%; height:100%;"
    >
      <router-view></router-view>
    </v-touch>
    <my-footer v-show="show" @getThisRouter="getThisRouter"></my-footer>
  </div>
</template>
<script>
export default {
  data () {
    return {
      show: true,
      clientHeight: document.documentElement.clientHeight,
      rtName: 'Home'
    }
  },
  methods: {
    // 右滑返回上一页，排除主页的路由
    onSwipeRight (e) {
      // console.log(e)
      const mainRouteList = ['Home', 'Map', 'Monitor', 'Data', 'Settings']
      if (mainRouteList.includes(this.rtName)) return
      this.$router.goBack()
    },
    // 获得当前路由信息
    getThisRouter (name) {
      this.rtName = name
    }
  },
  mounted () {
    // 监控视口高度
    window.onresize = () => {
      if (this.clientHeight > document.documentElement.clientHeight) {
        this.show = false
      } else {
        this.show = true
      }
    }
  },
  components: {
    MyFooter: resolve => require(['@/components/Footer'], resolve)
  }
}
</script>
<style lang='scss' scoped>
  .main-con {
    height: 100%;
  }
</style>
