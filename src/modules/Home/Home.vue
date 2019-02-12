<template>
  <mt-loadmore class="loadmore" :top-method="loadTop" @top-status-change="handleTopChange" ref="loadmore">
    <div class="homeItem statusBarTop">
      <div class="titleBar">
        <div class="cent">餐饮油烟在线监控</div>
      </div>
      <div class="timeBar">{{ updateTime }}</div>
      <div class="updateBar"></div>
      <div class="semicycle" ref="semicycle">
        <div class="cont">
          <span class="rate">正常率</span>
          <span class="nu-rate">{{ normal }}<i>%</i></span>
        </div>
      </div>
      <router-link class="fun-click click-active" style="{color:'#333'}" :to="{name: 'StandardData'}">点击查看超标监控点··></router-link>
      <div class="data">
        <div class="data-item" :class="'data-item-'+item.length" v-for="(item, key) in data" :key="key">
          <div class="item-item" v-for="(xtem, xkey) in item" :key="xkey">
            <span class="name">{{ xtem.name }}</span>
            <span class="value">{{ xtem.value }}</span>
            <span class="name unit" v-if="xtem.unit">{{ xtem.unit }}</span>
          </div>
        </div>
      </div>
    </div>
  </mt-loadmore>
</template>

<script>
import api from 'api'
import { getDate } from 'util'
export default {
  name: 'HomeHome',
  data () {
    return {
      topStatus: '',
      data: [
        [
          { name: '离线设备数', value: 0 },
          { name: '探头故障设备数', value: 0 }
        ],
        [
          { name: '总数', value: 0 },
          { name: '在线数', value: 0 },
          { name: '在线率', value: 0, unit: '%' }
        ],
        [
          { name: '正常数', value: 0 },
          { name: '超标数', value: 0 },
          { name: '超标率', value: 0, unit: '%' }
        ]
      ],
      normal: 0, // 正常率
      updateTime: '', // 更新时间
      refresh: 5 * 60 * 1000, // 5分钟刷新一次， 5 * 60 * 1000 = 300000
      timeOut: 0, // 定时器
      times: {} // 动态定时器
    }
  },
  methods: {
    handleTopChange (status) {
      this.topStatus = status
    },
    /**
     * 下拉刷新回调
     */
    loadTop () {
      // 消除上一次的定时器，消除不必要的内存
      if (this.timeOut) clearTimeout(this.timeOut)
      this.getDiningLampb().then(() => {
        // 关闭下拉
        this.$refs.loadmore.onTopLoaded()
      })
    },
    /**
     * 餐饮油烟在线监控数据获取
     */
    getDiningLampb () {
      let that = this
      return new Promise((resolve, reject) => {
        api.diningLampbQuery().then(res => {
          try {
            if (res.ack === 1) {
              that.data[0][0].value = res.totall - res.onlinecount
              that.data[0][1].value = res.faultNum
              that.data[1][0].value = res.totall
              that.data[1][1].value = res.onlinecount
              that.data[1][2].value = (Number((res.onlinecount / res.totall).toFixed(3)) * 1000 / 10) || 0
              that.data[2][0].value = res.normal
              that.data[2][1].value = res.overproof
              that.data[2][2].value = (Number((res.overproof / res.totall).toFixed(3)) * 1000 / 10) || 0
              this.numScroll(that.normal, (Number((res.normal / res.totall).toFixed(3)) * 1000 / 10) || 0, 'normal')
              that.updateTime = getDate({ format: 'yyyy-MM-dd HH:mm', timestamp: new Date().getTime() + this.refresh })
            } else {
              this.$toast({
                message: '数据显示异常'
              })
            }
          } catch (e) {
            console.log(e)
          }
          // 5分钟后重新更新数据
          that.timeOut = setTimeout(() => {
            that.getDiningLampb()
          }, that.refresh)
          // 监听组件销毁时，清除定时器
          this.$once('hook:beforeDestroy', () => {
            clearTimeout(this.timeOut)
            this.timeOut = null
          })
          resolve()
        })
      })
    },
    /**
     * 数字变化过程
     */
    numScroll (initial, last, key) {
      if (initial === last) return
      let total = 2000 // 变化总时间
      let interval = 100 // 变化间隔
      let j = (last - initial) / (total / interval) // 算出每100毫秒变化多少
      let timer = `${key}_timer`
      // 动态给定时器赋值
      if (this.times[timer]) {
        clearInterval(this.times[timer])
      } else {
        this.$set(this.times, timer, 0)
      }
      this.times[timer] = setInterval(() => {
        initial += j
        if (j >= 0) {
          this[key] = ~~initial
          if (~~initial >= last) {
            clearInterval(this.times[timer])
            this[key] = last
          }
        } else if (j < 0) {
          this[key] = Math.ceil(initial)
          if (~~initial < last) {
            clearInterval(this.times[timer])
            this[key] = last
          }
        }
      }, interval)
      this.$once('hook:beforeDestroy', () => {
        clearInterval(this.times[timer])
        this.times[timer] = null
      })
    }
  },
  created () {
    this.getDiningLampb()
  }
}
</script>

<style lang="scss" scoped>
@font-face {
  font-family: 'Agency FB Regular';
  src: url('../../assets/AGENCYR.ttf');
  font-weight: normal;
  font-style: normal;
}
@keyframes myfirst {
  0% {
    left: -10px;
    bottom: 0;
  }
  100% {
    left: 500px;
    bottom: 100px;
  }
}
$lv: 1;
.loadmore {
  width: 100%;
  height: 100%;
  /deep/ .mint-loadmore-content {
    height: 100%;
  }
}
.homeItem {
  width: 100%;
  height: 100%;
  background-image: url('~@/assets/img/home/bg.png');
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
  .titleBar {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    .cent {
      font-size: 38px;
      font-weight: bold;
    }
  }
  .timeBar {
    margin-top: 50px;
    font-size: 28px;
    min-height: 38px;
  }
  .updateBar {
    margin-top: 15px;
    font-size: 22px;
  }
  .semicycle {
    position: relative;
    width: 582px;
    height: 350px;
    margin-top: 70px;
    display: flex;
    margin-top: 100px;
    justify-content: center;
    border-width: 12px;
    border-color: #9bc2e5;
    border-style: solid;
    border-radius: 60% / 100% 100% 0 0;
    border-bottom-width: 0;
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.9) 0%,
      rgba(255, 255, 255, 0) 100%
    );
    .cont {
      display: flex;
      flex-direction: column;
      .rate {
        margin-top: 92px;
        font-size: 30px;
      }
      .nu-rate {
        margin-top: 30px;
        font-size: 170px; /*px*/
        font-family: 'Agency FB Regular';
        display: block;
        height: 140px;
        line-height: 140px;
        padding-left: 60px;
        i {
          font-size: 100px;
          font-style: normal;
        }
      }
    }
    .dotBar {
      position: absolute;
      width: 100%;
      height: 100%;
      // top: -12px;
      transition: transform 3s linear;
      transform: rotate(0);
      .dot {
        position: absolute;
        width: 30px;
        height: 30px;
        background: #009b4c;
        border-radius: 50%;
        left: -25px;
        bottom: -15px;
        transition: transform 3s linear;
        transform: translate3D(0px, 0, 0);
      }
      &.dong {
        transform: rotate(calc(360deg * #{$lv}));
        .dot {
          // (父亲宽度的100% - 父亲的border-width*2) * %
          transform: translate3D(calc(570px * #{$lv}), 0, 0);
        }
      }
    }
  }
  .fun-click {
    color: #fff;
    font-size: 42px; /*px*/
    position: relative;
    z-index: 100;
  }
  .data {
    width: 100%;
    height: auto;
    margin-top: 60px;
    .data-item {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 70px;
      margin: 0 auto;
      margin-bottom: 10px;
      .item-item {
        display: flex;
        align-items: center;
        height: 100%;
        background: linear-gradient(
          to bottom,
          rgba(255, 255, 255, 0.3) 0%,
          rgba(255, 255, 255, 0.1) 100%
        );
        margin-right: 5px;
        padding-left: 8px;
        &:first-child {
          border-top-left-radius: calc(78px / 2);
          border-bottom-left-radius: calc(78px / 2);
          padding-left: 18px;
        }
        &:last-child {
          border-top-right-radius: calc(78px / 2);
          border-bottom-right-radius: calc(78px / 2);
          padding-right: 18px;
          margin-right: 0;
          margin-bottom: 0;
        }
        .name {
          font-size: 28px;
          white-space: nowrap;
        }
        .unit {
          font-family: 'Agency FB Regular';
        }
        .value {
          font-family: 'Agency FB Regular';
          font-size: 60px;
          flex-grow: 1;
        }
      }
      &.data-item-2 {
        .item-item {
          width: 260px;
        }
      }
      &.data-item-3 {
        .item-item {
          width: 160px;
          &:last-child,
          &:first-child {
            width: 178px;
          }
          .value {
            font-size: 42px;
          }
        }
      }
    }
  }
}
</style>
