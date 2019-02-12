<template>
  <div class="dataHome">
    <h1 class="statusBarTop header">
      <span>数据</span>
    </h1>
    <div class="container">
      <ul>
        <li v-for="item in data" :key="item.img">
          <router-link :to="'/data/'+item.name" class="click-active">
            <img :src="item.img" alt="">
            <span>{{item.title}}</span>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataHome',
  data () {
    return {
      data: [
        {name: 'MonitoringData/0', img: require('@/assets/img/data/icon-1.png'), title: '监控数据'},
        {name: 'MonitorList/0', img: require('@/assets/img/data/icon-2.png'), title: '实时数据'},
        {name: 'MonitorList/1', img: require('@/assets/img/data/icon-3.png'), title: '历史数据'},
        {name: 'StandardData', img: require('@/assets/img/data/icon-4.png'), title: '超标数据'},
        {name: 'MonitorList/2', img: require('@/assets/img/data/icon-5.png'), title: '异常数据'},
        {name: 'OperateLog', img: require('@/assets/img/data/icon-6.png'), title: '操作日志'},
        {name: 'BrokenNetworkLog', img: require('@/assets/img/data/icon-7.png'), title: '断线日志'},
        {name: 'WorkRecord', img: require('@/assets/img/data/icon-8.png'), title: '考勤记录'},
        {name: 'Instructions', img: require('@/assets/img/data/icon-9.png'), title: '使用说明'}
      ]
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang='scss'>
.dataHome {
  height: calc(100% - #{$footerHei});
  background: #eeeff4;
  padding-top: $headerHei;
  h1 {
    position: fixed;
    top: 0;
    left: 0;
    height: $headerHei;
    width: 100%;
    background: #427fdc;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 100;
    span {
      color: #feffff;
      font-size: 31px;
      letter-spacing: 2px;
    }
  }
  .container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    ul {
      display: flex;
      justify-content: space-around;
      flex-wrap: wrap;
      li {
        width: 28%;
        height: 28%;
        border-radius: 10px;
        border: 4px solid #fff;
        margin-bottom: 37px;
        a {
          display: flex;
          flex-direction: column;
          justify-items: center;
          align-items: center;
          img {
            width: 94px;
            height: 64px;
          }
        }
        span {
          display: inline-block;
          font-size: 28px;
          color: #0087be;
          margin-bottom: 33px;
        }
      }
      li:nth-child(1) {
        img {
          width: 94px;
          height: 64px;
          margin-top: 44px;
          margin-bottom: 41px;
        }
      }
      li:nth-child(2) {
        img {
          width: 109px;
          height: 63px;
          margin-top: 45px;
          margin-bottom: 43px;
        }
      }
      li:nth-child(3) {
        img {
          width: 64px;
          height: 82px;
          margin-top: 34px;
          margin-bottom: 30px;
        }
      }
      li:nth-child(4) {
        img {
          width: 82px;
          height: 67px;
          margin-top: 35px;
          margin-bottom: 40px;
        }
      }
      li:nth-child(5) {
        img {
          width: 79px;
          height: 66px;
          margin-top: 35px;
          margin-bottom: 40px;
        }
      }
      li:nth-child(6) {
        img {
          width: 90px;
          height: 82px;
          margin-top: 27px;
          margin-bottom: 32px;
        }
      }
      li:nth-child(7) {
        img {
          width: 65px;
          height: 84px;
          margin-top: 27px;
          margin-bottom: 29px;
        }
      }
      li:nth-child(8) {
        img {
          width: 83px;
          height: 92px;
          margin-top: 24px;
          margin-bottom: 26px;
        }
      }
      li:nth-child(9) {
        img {
          width: 78px;
          height: 89px;
          margin-top: 25px;
          margin-bottom: 27px;
        }
      }
    }
  }
}
</style>
