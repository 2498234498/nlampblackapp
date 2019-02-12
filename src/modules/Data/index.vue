<template>
  <div class="data">
    <transition :name="$store.state.transition.transitionName">
      <keep-alive :include="$store.state.cache.cacheRouteArr.toString()">
        <router-view class="child-view"></router-view>
      </keep-alive>
    </transition>
  </div>
</template>

<script>
import transition from '@/mixin/transition'
export default {
  name: 'Data',
  data () {
    return {}
  },
  mixins: [transition]
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang='scss'>
  .data {
    height: 100%;
  }
</style>
