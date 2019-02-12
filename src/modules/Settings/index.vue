<template>
  <div class="settings">
    <transition :name="$store.state.transition.transitionName">
      <router-view class="child-view"></router-view>
    </transition>
  </div>
</template>

<script>
import transition from '@/mixin/transition'
export default {
  name: 'Setting',
  data () {
    return {}
  },
  mixins: [transition]
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang='scss'>
  .settings {
    height: 100%;
    overflow: hidden;
  }
</style>
