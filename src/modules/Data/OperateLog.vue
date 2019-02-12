<template>
  <div class="operateLog" ref="box">
    <mt-header fixed title="操作日志" class="header">
      <a @click="$router.goBack()" slot="left">
        <mt-button icon="back"></mt-button>
      </a>
    </mt-header>
    <div class="loadmoreBox" ref="operateLog" @scroll.passive="$raf(needToTop)" @touchstart="$_loadmore($event)">
      <mt-loadmore
        class="loadmore"
        :top-method="loadTop"
        :auto-fill="false"
        :bottom-method="loadBottom"
        :bottom-all-loaded="allLoaded"
        @top-status-change="handleTopChange"
        ref="loadmore"
      >
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
            <div class="bar">
              <label for="area">操作项：</label>
              <input type="text" class="input" v-model="operation" @keyup.13="query()" ref="input1">
            </div>
            <div class="bar">
              <label for="area" class="type">日志类型：</label>
              <custom-select :list="log.selectList" :val.sync="log.value" :index="log.index"></custom-select>
            </div>
          </div>
          <div class="funItem">
            <div class="bar"></div>
            <div class="bar btnBar">
              <label for="area"></label>
              <mt-button type="primary" class="parBtn" @click="query()">查询</mt-button>
            </div>
          </div>
        </div>
        <div class="noDada" v-show="!operateLog.length">
          <img src="@/assets/img/data/noData.png" alt="">
          <span>暂无数据</span>
        </div>
        <div class="container" v-for="(item, key) in operateLog" :key="key">
          <div class="row">
            <div class="item">
              <div>
                <span>操作项：</span>
                <span>{{item.option}}</span>
              </div>
              <div>
                <span>类型：</span>
                <span class="type">{{item.style}}</span>
              </div>
            </div>
            <div class="item">
              <div>
                <span>操作人：</span>
                <span>{{item.operator}}</span>
              </div>
              <div>
                <span>真实姓名：</span>
                <span>{{item.realname}}</span>
              </div>
            </div>
            <div class="item">
              <div>
                <span>操作时间：</span>
                <span>{{item.time }}</span>
              </div>
              <div>
                <span>操作描述：</span>
              </div>
              <h4 class="des" v-html="item.discrib">{{item.discrib}}</h4>
            </div>
          </div>
        </div>
      </mt-loadmore>
    </div>
    <mt-datetime-picker
      ref="picker"
      type="datetime"
      year-format="{value} 年"
      month-format="{value} 月"
      date-format="{value} 日"
      hour-format="{value} 时"
      minute-format="{value} 分"
      @confirm="handleConfirm"
      v-model="datetime"
    >
    </mt-datetime-picker>
    <div v-show="show" @click="goHeader()">
      <back-top></back-top>
    </div>
  </div>
</template>

<script>
import customSelect from '@/components/CustomSelectMap.vue'
import BackTop from '@/components/BackTop.vue'
import api from 'api'
import { getDate } from 'util'
export default {
  name: 'OperateLog',
  data () {
    return {
      log: {
        value: {
          logName: '全部',
          logtype: '3'
        },
        selectList: [
          {
            logName: '系统管理',
            logtype: '1'
          },
          {
            logName: '参数管理',
            logtype: '2'
          },
          {
            logName: '全部',
            logtype: '3'
          }
        ],
        index: 'logName',
        show: false
      },
      operation: '',
      type: '',
      startTime: `${getDate({ format: 'yyyy-MM-dd' })} 00:00:00`,
      endTime: `${getDate({ format: 'yyyy-MM-dd' })} 23:59:59`,
      datetime: '',
      index: 0,
      operateLog: [],
      pageTotal: 50, // 每页50条
      topStatus: false,
      allLoaded: true, // 判断全部加载完成，false为没有，true加载完
      show: false,
      timer: null,
      stop: false
    }
  },
  methods: {
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
      if (this.datetime === '') {
        this.datetime = '2008-01-01 00:00'
        if (!this.type) {
          this.startTime = this.datetime
        } else {
          this.endTime = this.datetime
        }
      } else {
        this.conversionTimeType(this.datetime)
      }
    },
    conversionTimeType (time) {
      if (time) {
        if (!this.type) {
          this.startTime = getDate({ timestamp: time, format: 'yyyy-MM-dd HH:mm:ss' })
        } else {
          this.endTime = getDate({ timestamp: time, format: 'yyyy-MM-dd HH:mm:ss' })
        }
      } else {
        this.startTime = getDate({ format: 'yyyy-MM-dd' }) + ' 00:00:00'
        this.endTime = getDate({ format: 'yyyy-MM-dd' }) + ' 23:59:59'
      }
    },
    /**
     * 获取考勤记录的数据
     * @param {String} action - 执行动作区分，默认不执行
     */
    query (action) {
      this.$nextTick(() => {
        this.$refs.input1.blur()
      })
      return new Promise((resolve, reject) => {
        let _index
        if (action === 'next') {
          _index = this.index + 1
        } else {
          _index = this.index = 0
        }
        var params = {
          bgtime: this.startTime,
          edtime: this.endTime,
          option: this.operation,
          logtype: this.log.value.logtype,
          index: _index
        }
        api.operateLogQuery(params)
          .then(res => {
            if (res.ack === 1) {
              // 处理描述的信息
              res.data.forEach(ele => {
                let arr = ele.discrib.split('')
                for (let i = 0; i < arr.length; i++) {
                  if (arr[i] === '(' || arr[i] === ',') {
                    arr[i] = '<br/>'
                  } else if (arr[i] === ')') {
                    arr[i] = '<br/><br/>'
                  }
                }
                ele.discrib = arr.join('')
              })
              // this.operateLog = res.data
              if (action === 'next') {
                this.operateLog = this.operateLog.concat(res.data)
                this.index++
              } else {
                this.operateLog = res.data
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
      this.query().then(() => this.$refs.loadmore.onTopLoaded())
    },
    /**
     * 上拉加载 下一页
     */
    loadBottom () {
      this.query('next').then(() => this.$refs.loadmore.onBottomLoaded())
    },
    needToTop () {
      this.$nextTick(() => {
        this.$refs.input1.blur()
      })
      let prevScrollTop = this.needToTop.scrollTop || 0
      let scrollTop = this.$refs.operateLog.scrollTop
      this.needToTop.scrollTop = scrollTop
      if (scrollTop > 300) {
        this.show = true
      } else {
        this.show = false
      }
      if (scrollTop > prevScrollTop && this.timer) {
        this.$raf.cancel(this.timer)
        this.timer = null
      }
    },
    goHeader () {
      let self = this
      self.$raf.cancel(self.timer)
      self.timer = self.$raf(function fn () {
        let curHeight = self.$refs.operateLog.scrollTop
        var now = curHeight
        var speed = (0 - now) / 7
        speed = speed > 0 ? Math.ceil(speed) : Math.floor(speed)
        self.$refs.operateLog.scrollTop = curHeight + speed
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
.operateLog {
  height: 100%;
  background: #eeeff4;
  padding-top: $headerHei;
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
    padding-bottom: $footerHei;
  }
  .fun {
    position: relative;
    background: #fff;
    width: 100%;
    height: auto;
    // padding: 18px 0 18px 26px;
    padding: 18px 26px;
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
      content: "";
      left: 0;
      bottom: -20px;
    }
  }
  .funItem {
    display: flex;
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
      .type {
        margin-left: 20px;
        width: 200px;
      }
      .input {
        width: 200px;
        height: 50px;
        border: 2px solid #e6e6e6;
        border-radius: 10px;
        text-align: left;
        text-indent: 10px;
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
      }
    }
    &:last-child {
      margin-bottom: 0;
    }
  }
  .noDada {
    width: 100%;
    height: 700px;
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
    transition: background 0.15s;
    &:active {
      background-color: rgba(0, 0, 0, 0.05);
    }
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
        .type {
          color: orange !important;
        }
        div {
          height: 44px;
          line-height: 44px;
          span:nth-child(1) {
            float: left;
            font-size: 28px;
            color: #999;
            margin-left: 30px;
          }
          span:nth-child(2) {
            float: right;
            font-size: 28px;
            color: #666;
            font-weight: bolder;
            margin-right: 24px;
          }
        }
        .des {
          color: #666;
          padding-bottom: 20px;
          font-weight: bolder;
          text-align: left;
          word-break: break-all;
          margin-left: 60px;
          margin-right: 20px;
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
