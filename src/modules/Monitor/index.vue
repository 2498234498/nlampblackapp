<template>
  <div class="monitor-view">
    <keep-alive :include="$store.state.cache.cacheRouteArr.toString()">
      <router-view></router-view>
    </keep-alive>
  </div>
</template>

<script>
export default {
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang='scss' scoped>
.monitor-view {
  height: 100%;
}
</style>
