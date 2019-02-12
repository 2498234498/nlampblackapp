<template>
  <div id="app">
    <transition :name="$store.state.transition.transitionName">
      <router-view class="child-view"></router-view>
    </transition>
  </div>
</template>

<script>
import transition from '@/mixin/transition'
import { setStatusBarStyle } from 'util/app'
// eslint-disable-next-line
import Vconsole from 'vconsole'
export default {
  name: 'App',
  data () {
    return {
      vConsole: null
    }
  },
  created () {
    // this.vConsole = new Vconsole()
  },
  watch: {
    // 除了登录页的状态栏前景色是黑色之外，其余页面的状态栏前景色都是白色
    $route: {
      handler (to, from) {
        if (to.name === 'Login') {
          setStatusBarStyle('dark')
        } else {
          setStatusBarStyle()
        }
        to.meta.keepAlive && this.$store.commit('setCache', to.name)
      },
      immediate: true
    }
  },
  mixins: [transition]
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
}
</style>
