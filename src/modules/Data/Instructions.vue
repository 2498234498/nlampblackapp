<template>
  <div class="instructions">
    <mt-header fixed title="使用说明" class="header">
      <a @click="$router.goBack()" slot="left">
        <mt-button icon="back"></mt-button>
      </a>
    </mt-header>
    <div class="main">
      <div class="banner">
        <img v-lazy="img">
      </div>
      <h2>油烟平台App用途</h2>
      <div class="explain">本app用于手机查看,监控油烟设备的实时信息.</div>
      <h2>App功能模块</h2>
      <div class="explain">分为首页,地图,监控点,数据,设置模块.</div>
      <div class="explain">
        其中首页显示宏观信息,地图显示设备所在位置及设备的基本信息和统计图表.
      </div>
      <div class="explain">监控点显示设备数量,设备的基本信息,以及跳转到数据模块.</div>
      <div class="explain">数据模块显示设备的详细信息,分为监控数据,实时数据,历史数据,超标数据,	异常数据,操作日志,断线日志,考勤记录,使用说明.</div>
      <div class="explain">设置页面可以意见反馈,修改密码和服务器地址.</div>
      <h2>兼容版本</h2>
      <div class="explain">ios版本: 5.1.1以上, android版本: 2.3以上.</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Instructions',
  data () {
    return {
      img: require('@/assets/img/data/banner.png')
    }
  },
  methods: {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang='scss'>
.instructions {
  height: 100%;
  padding-top: $headerHei;
  background: #eeeff4;
  .header {
    height: $headerHei;
    background-color: #4180dc;
    font-weight: normal;
    display: flex;
    align-items: center;
    /deep/ .mintui-back {
      font-size: 32px;
    }
    .right {
      display: inline-block;
      width: 38px;
      height: 39px;
      .icon {
        width: 100%;
        height: 100%;
      }
    }
  }
  .main {
    height: 100%;
    width: 100%;
    padding-bottom: $footerHei;
    .banner {
      img {
        width: 100%;
        height: 403px;
      }
    }
    h2 {
      font-size: 28px;
      text-align: left;
      text-indent: 36px;
      line-height: 42px;
      margin-top: 16px;
    }
    .explain {
      font-size: 26px;
      text-align: left;
      text-indent: 2em;
      margin-left: 36px;
      margin-right: 30px;
      line-height: 46px;
    }
  }
}
</style>
