<template>
  <div class="standardDetails">
    <mt-header fixed title="超标详情" class="header">
      <a @click="$router.goBack()" slot="left">
        <mt-button icon="back"></mt-button>
      </a>
    </mt-header>
    <div class="loadmoreBox" ref="loadmoreBox" @scroll.passive="$raf(needToTop)" @touchstart="$_loadmore($event)">
      <mt-loadmore class="loadmore" :top-method="loadTop" :auto-fill="false" :bottom-method="loadBottom" :bottom-all-loaded="allLoaded" @top-status-change="handleTopChange" ref="loadmore">
        <div class="main">
          <div class="fun">
            <div class="time">
              <label>开始时间：</label>
              <span @click="openPicker(0)">{{startTime}}</span>
            </div>
            <div class="time">
              <label>结束时间：</label>
              <span @click="openPicker(1)">{{endTime}}</span>
            </div>
            <div class="funItem">
              <div class="bar"></div>
              <div class="bar btnBar">
                <mt-button type="primary" class="parBtn" @click="query()">查询</mt-button>
              </div>
            </div>
          </div>
          <div class="container">
            <div class="row">
              <div class="item" v-for="(row, key) in data" :key="key">
                <div>
                  <span>监控点名称：</span>
                  <span>{{row.pointname}}</span>
                </div>
                <div>
                  <span>设备号：</span>
                  <span>{{row.pointnum}}</span>
                </div>
                <div>
                  <span>临界上限：</span>
                  <span class="critical">{{row.voerceil}}</span>
                </div>
                <div>
                  <span>超标值：</span>
                  <span class="overproof">{{row.cbehind}}</span>
                </div>
                <div>
                  <span>时间：</span>
                  <span>{{row.datatime}}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </mt-loadmore>
    </div>
    <mt-datetime-picker ref="picker" type="datetime" year-format="{value} 年" month-format="{value} 月" date-format="{value} 日" hour-format="{value} 时" minute-format="{value} 分" @confirm="handleConfirm" v-model="datetime">
    </mt-datetime-picker>
    <div v-show="showHeader" @click="goHeader()">
      <back-top></back-top>
    </div>
  </div>
</template>

<script>
import customSelect from '@/components/CustomSelect.vue'
import BackTop from '@/components/BackTop'
import api from 'api'
import { getDate } from 'util'
export default {
  name: 'StandardDetails',
  data () {
    return {
      type: '',
      startTime: this.$route.query.startTime,
      endTime: this.$route.query.endTime,
      devNo: this.$route.query.devNO,
      datetime: '',
      data: [],
      index: 0,
      pageTotal: 50, // 每页50条
      topStatus: false,
      allLoaded: true, // 判断全部加载完成，false为没有，true加载完
      showHeader: false,
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
    openPicker (type) {
      if (type === 0) {
        this.datetime = this.startTime
      } else {
        this.datetime = this.endTime
      }
      this.type = type
      this.$refs.picker.open()
    },
    handleConfirm () {
      if (!this.type) {
        this.startTime = getDate({ timestamp: this.datetime, format: 'yyyy-MM-dd HH:mm' }) + ':00'
      } else {
        this.endTime = getDate({ timestamp: this.datetime, format: 'yyyy-MM-dd HH:mm' }) + ':59'
      }
    },
    /**
     * 获取超标数据详情
     * @param {String} action - 执行动作区分，默认不执行
     */
    query (action) {
      return new Promise((resolve, reject) => {
        let _index
        if (action === 'next') {
          _index = this.index + 1
        } else {
          _index = this.index = 0
        }
        let params = {
          bgtime: this.startTime,
          edtime: this.endTime,
          devNo: this.devNo,
          index: _index
        }
        api.findwarndataDetail(params)
          .then(res => {
            if (res.ack === 1) {
              if (action === 'next') {
                this.data = this.data.concat(res.data)
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
      this.query().then(() => {
        this.$refs.loadmore.onTopLoaded()
      })
    },
    /**
     * 上拉加载 下一页
     */
    loadBottom () {
      this.query('next').then(() => {
        this.$refs.loadmore.onBottomLoaded()
      })
    },
    needToTop () {
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
    customSelect,
    BackTop
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang='scss'>
.standardDetails {
  height: 100%;
  background: #eeeff4;
  padding-top: $headerHei;
  padding-bottom: $footerHei;
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
  .loadmoreBox {
    height: 100%;
    overflow: scroll;
  }
  .fun {
    position: relative;
    background: #fff;
    width: 100%;
    height: auto;
    padding: 18px 0 18px 26px;
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    .time {
      display: flex;
      margin-bottom: 18px;
      label {
        height: 50px;
        width: 150px;
        text-align: left;
        line-height: 50px;
      }
      span {
        height: 50px;
        width: 320px;
        line-height: 50px;
        text-align: center;
        border: 2px solid #e6e6e6;
        border-radius: 10px;
      }
    }
    &::after {
      position: absolute;
      width: 100%;
      height: 20px;
      background: #f0f0f0;
      content: '';
      left: 0;
      bottom: -20px;
    }
  }
  .funItem {
    display: flex;
    width: 100%;
    margin-bottom: 18px;
    .bar {
      width: 50%;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      label {
        text-align: left;
        width: 150px;
      }
      .input {
        width: 200px;
        height: 50px;
        border: 2px solid #e6e6e6;
        border-radius: 10px;
        text-align: center;
      }
    }
    .btnBar {
      .parBtn {
        width: 202px;
        height: 50px;
        font-size: 28px;
        border-radius: 10px;
        color: #fff;
        background: #427fdc;
        margin-left: 120px;
      }
    }
    &:last-child {
      margin-bottom: 0;
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
  .container {
    background: #fff;
    margin-top: 20px;
    width: 100%;
    overflow: hidden;
    .row {
      background: #f0f0f0;
      width: 98%;
      margin: 0 auto;
      margin-top: 10px;
      margin-bottom: 10px;
      overflow: hidden;
      .item {
        background: #fff;
        width: 96%;
        margin: 0 auto;
        margin-top: 10px;
        margin-bottom: 10px;
        border-radius: 8px;
        transition: background 0.15s;
        &:active {
          background-color: rgba(0, 0, 0, .1);
        }
        div {
          height: 44px;
          line-height: 44px;
          span:nth-child(1) {
            float: left;
            font-size: 24px;
            color: #999;
            margin-left: 30px;
          }
          span:nth-child(2) {
            float: right;
            font-size: 24px;
            color: #666;
            font-weight: bolder;
            margin-right: 24px;
          }
          .critical {
            color: #08980f !important;
          }
          .overproof {
            color: #f63b3b !important;
          }
        }
        div:last-child {
          min-height: 44px;
          line-height: 44px;
        }
      }
    }
  }
}
</style>
