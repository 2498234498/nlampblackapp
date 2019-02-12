<template>
  <div class="go-top">
    <img src="@/assets/img/data/goTop.png" alt="">
  </div>
</template>

<script>
export default {
  name: 'backTop'
}
</script>

<style scoped lang='scss'>
.go-top {
  position: fixed;
  bottom: 120px;
  right: 20px;
  width: 100px;
  height: 100px;
  z-index: 1000;
  img {
    opacity: 0.6;
    width: 100%;
    height: 100%;
  }
}
</style>
