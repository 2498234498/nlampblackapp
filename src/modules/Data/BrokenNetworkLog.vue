<template>
  <div class="brokenNetworkLog" ref="box">
    <mt-header fixed title="断线日志" class="header">
      <a @click="$router.goBack()" slot="left">
        <mt-button icon="back"></mt-button>
      </a>
      <div class="right" slot="right"></div>
    </mt-header>
    <div class="loadmoreBox" ref="loadmoreBox" @scroll.passive="$raf(needToTop)" @touchstart="$_loadmore($event)">
      <mt-loadmore class="loadmore" :top-method="loadTop" :auto-fill="false" :bottom-method="loadBottom" :bottom-all-loaded="allLoaded" @top-status-change="handleTopChange" ref="loadmore">
        <div class="screeningCondition">
          <div class="type">
            <div class="type-left">
              <span class="actionItem">设备号：</span>
              <input class="actionValue" type="text" v-model="eqvNo" @keyup.13="query()" ref="input1">
            </div>
            <div class="type-left">
              <span class="actionItem">内容：</span>
              <input class="actionValue" type="text" v-model="contant" @keyup.13="query()" ref="input2">
            </div>
          </div>
          <div class="query" @click="query()">查询</div>
        </div>
        <div class="content" v-for="(value,index) in data" :key="index">
          <div class="con-table">
            <div class="con-tr">
              <span>设备号:</span>
              <p>{{value.eqvNo}}</p>
            </div>
            <div class="con-tr">
              <span>内容:</span>
              <p>{{value.contant}}</p>
            </div>
            <div class="con-tr">
              <span>时间:</span>
              <p>{{value.time}}</p>
            </div>
          </div>
        </div>
        <div class="noDada" v-show="!data.length">
          <img src="@/assets/img/data/noData.png" alt="">
          <span>暂无数据</span>
        </div>
      </mt-loadmore>
    </div>
    <div v-show="showHeader" @click="goHeader()">
      <back-top></back-top>
    </div>
  </div>
</template>

<script>
import api from 'api'
import BackTop from '@/components/BackTop'
export default {
  name: 'BrokenNetworkLog',
  data () {
    return {
      showHeader: false,
      contant: '',
      eqvNo: '',
      username: '',
      data: [],
      index: 0,
      pageTotal: 50, // 每页50条
      topStatus: false,
      allLoaded: true, // 判断全部加载完成，false为没有，true加载完
      timer: null
    }
  },
  methods: {
    goHeader () {
      let self = this
      self.$raf.cancel(self.timer)
      self.timer = self.$raf(function fn () {
        let curHeight = self.$refs.loadmoreBox.scrollTop
        var now = curHeight
        var speed = (0 - now) / 7
        speed = speed > 0 ? Math.ceil(speed) : Math.floor(speed)
        self.$refs.loadmoreBox.scrollTop = curHeight + speed
        if (curHeight > 0) {
          self.timer = self.$raf(fn)
        } else {
          self.$raf.cancel(self.timer)
          self.timer = null
        }
      })
      self.$once('hook:beforeDestroy', () => {
        if (self.timer) self.$raf.cancel(self.timer)
      })
    },
    /**
     * 获取断线日志的数据
     * @param {String} action - 执行动作区分，默认不执行
     */
    query: function (action) {
      this.$nextTick(() => {
        this.$refs.input1.blur()
        this.$refs.input2.blur()
      })
      let _index
      if (action === 'next') {
        _index = this.index + 1
      } else {
        _index = this.index = 0
      }
      let params = {
        eqvNo: this.eqvNo,
        contant: this.contant,
        index: _index
      }
      return new Promise((resolve, reject) => {
        api.brokennetworkQuery(params).then(res => {
          if (res.ack === 1) {
            if (action === 'next') {
              this.data = [...this.data, ...res.data]
              this.index++
            } else {
              this.data = res.data
            }
            // 判断是否为最后一页
            if (res.data.length < this.pageTotal) {
              this.allLoaded = true
            } else {
              this.allLoaded = false
            }
          } else {
            this.$toast({
              message: '数据加载异常'
            })
          }
          resolve()
        })
      })
    },
    handleTopChange (status) {
      this.topStatus = status
    },
    /**
     * 下拉刷新回调
     */
    loadTop () {
      this.query().then(() => { this.$refs.loadmore.onTopLoaded() })
    },
    /**
     * 上拉加载 下一页
     */
    loadBottom () {
      this.query('next').then(() => { this.$refs.loadmore.onBottomLoaded() })
    },
    needToTop () {
      this.$nextTick(() => {
        this.$refs.input1.blur()
        this.$refs.input2.blur()
      })
      let prevScrollTop = this.needToTop.scrollTop || 0
      let scrollTop = this.$refs.loadmoreBox.scrollTop
      this.needToTop.scrollTop = scrollTop
      if (scrollTop > 300) {
        this.showHeader = true
      } else {
        this.showHeader = false
      }
      if (scrollTop > prevScrollTop && this.timer) {
        this.$raf.cancel(this.timer)
        this.timer = null
      }
    }
  },
  created () {
    this.query()
  },
  components: {
    BackTop
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang='scss'>
.brokenNetworkLog {
  height: 100%;
  background: #eeeff4;
  padding-top: $headerHei;
  .header {
    height: $headerHei;
    background-color: #4180dc;
    font-weight: normal;
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
  .loadmoreBox {
    height: 100%;
    overflow: scroll;
    padding-bottom: $footerHei;
  }
  .screeningCondition {
    height: 162px;
    background: #fff;
    .time {
      .time-left {
        margin-top: 22px;
        width: 50%;
        height: 48px;
        line-height: 48px;
        float: left;
        .startTime {
          float: left;
          font-size: 28px;
          color: #333333;
          margin-left: 25px;
          margin-right: 2px;
        }
        .startTimeNumber {
          float: left;
          border-radius: 8px;
          height: 46px;
          width: 198px;
          border: 2px solid #e6e6e6;
          background: #fff;
        }
      }
      .time-right {
        margin-top: 22px;
        width: 50%;
        height: 48px;
        line-height: 48px;
        float: left;
        .endTime {
          float: left;
          font-size: 28px;
          color: #333333;
          text-align: center;
        }
        .endTimeNumber {
          float: left;
          margin-left: 12px;
          border-radius: 8px;
          height: 46px;
          width: 198px;
          border: 2px solid #e6e6e6;
          background: #fff;
        }
      }
    }
    .type {
      .type-left {
        width: 50%;
        float: left;
        height: 48px;
        line-height: 48px;
        margin-top: 20px;
        font-size: 28px;
        .actionItem,
        .actionValue {
          float: left;
          text-align: left;
          text-indent: 10px;
        }
        .actionItem {
          margin-left: 25px;
        }
        .actionValue {
          border-radius: 8px;
          height: 46px;
          width: 198px;
          border: 2px solid #e6e6e6;
        }
      }
      .logType {
        margin-top: 20px;
        width: 50%;
        float: left;
        height: 48px;
        line-height: 48px;
        font-size: 28px;
        label,
        .select {
          float: left;
        }
        label {
          margin-right: 12px;
        }
      }
    }
    .query {
      float: right;
      width: 202px;
      height: 50px;
      border-radius: 10px;
      background: #427fdc;
      font-size: 28px;
      text-align: center;
      line-height: 50px;
      color: #fff;
      margin-top: 20px;
      margin-right: 34px;
    }
  }
  .content {
    margin-top: 20px;
    background-color: #fafafa;
    height: 197px;
    padding: 20px 24px 0;
    .con-table {
      background-color: #fff;
      height: 157px;
      padding: 1px 30px 0;
      border-radius: 10px;
      transition: background .15s;
      &:active {
        background-color: rgba(0,0,0,.05);
      }
      .con-tr {
        font-size: 26px;
        display: flex;
        margin-top: 14px;
        span {
          flex: 1;
          text-align: left;
          color: #989898;
        }
        p {
          flex: 3;
          text-align: right;
        }
      }
    }
  }
  .noDada {
    width: 100%;
    height: 800px;
    margin-top: 20px;
    background: #fff;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    img {
      width: 64px;
      height: 70px;
    }
    span {
      margin-top: 20px;
    }
  }
}
</style>
