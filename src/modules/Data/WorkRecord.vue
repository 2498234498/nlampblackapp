<template>
  <div class="workRecord" ref="box">
    <mt-header fixed title="考勤记录" class="header">
      <a @click="$router.goBack()" slot="left">
        <mt-button icon="back"></mt-button>
      </a>
      <div class="right" slot="right"></div>
    </mt-header>
    <div class="loadmoreBox" ref="workRecord" @scroll.passive="$raf(needToTop)" @touchstart="$_loadmore($event)">
      <mt-loadmore class="loadmore" :top-method="loadTop" :auto-fill="false" :bottom-method="loadBottom" :bottom-all-loaded="allLoaded" @top-status-change="handleTopChange" ref="loadmore">
        <div class="screeningCondition">
          <div class="time">
            <div class="time-left">
              <span class="startTime">开始时间：</span>
              <span class="startTimeNumber" @click="openPicker(0)">{{startTime}}</span>
            </div>
            <div class="time-right">
              <span class="endTime">结束时间：</span>
              <span class="endTimeNumber" @click="openPicker(1)">{{endTime}}</span>
            </div>
          </div>
          <div class="type">
            <div class="type-left">
              <span class="actionItem">设备号：</span>
              <input class="actionValue" type="text" v-model="option" @keyup.13="query()" ref="input1">
            </div>
            <div class="query" @click="query()">查询</div>
          </div>
        </div>
        <div class="record-content" v-for="(item, key) in data" :key="key">
          <div class="con-table">
            <div class="con-tr">
              <span>监控点名称:</span>
              <p>{{ item.point }}</p>
            </div>
            <div class="con-tr">
              <span>设备号:</span>
              <p>{{ item.devNo }}</p>
            </div>
            <div class="con-tr">
              <span>维护人员名单:</span>
              <p>{{ item.name }}</p>
            </div>
          </div>
          <div class="con-table">
            <div class="con-tr">
              <span>最新时间:</span>
              <p>{{ item.lastime }}</p>
            </div>
            <div class="con-tr">
              <span>状态:</span>
              <div class="status">
                <span class="status-item" v-for="(sts, skey) in status.icon" :key="skey">
                  <i>{{ status.text[skey] }}</i>
                  <img class="across" :src="(!computedStatus(skey, item.state) ? status.imgaAcross[0] : status.imgaAcross[1])" alt="">
                  <img class="icon" :src="(!computedStatus(skey, item.state) ? status.icon[skey][0] : status.icon[skey][1])" alt="">
                </span>
              </div>
            </div>
            <div class="con-tr">
              <span>详情:</span>
              <p>
                <a @click="goDetail(item.id)" href="javascript:;">点击查看 ></a>
              </p>
            </div>
          </div>
        </div>
        <div class="noDada" v-show="!data.length">
          <img src="@/assets/img/data/noData.png" alt="">
          <span>暂无数据</span>
        </div>
      </mt-loadmore>
    </div>
    <mt-datetime-picker ref="picker" type="datetime" year-format="{value} 年" month-format="{value} 月" date-format="{value} 日" hour-format="{value} 时" minute-format="{value} 分" @confirm="handleConfirm" v-model="pickerValue">
    </mt-datetime-picker>
    <div v-show="showHeader" @click="goHeader()">
      <back-top></back-top>
    </div>
  </div>
</template>

<script>
import api from 'api'
import BackTop from '@/components/BackTop'
import { getDate, getMonth } from 'util'
export default {
  name: 'WorkRecord',
  data () {
    return {
      showHeader: false,
      pickerValue: `${getMonth({ type: 's' })} 00:00:00`,
      startTime: `${getMonth({ type: 's' })} 00:00:00`,
      endTime: `${getMonth({ type: 'e' })} 23:59:59`,
      type: '',
      option: '',
      index: 0,
      pageTotal: 50, // 每页50条
      data: [],
      status: {
        imgaAcross: [
          require('@/assets/img/WorkRecord/across-false.png'),
          require('@/assets/img/WorkRecord/across-true.png')
        ],
        icon: [
          [
            require('@/assets/img/WorkRecord/status-false-1.png'),
            require('@/assets/img/WorkRecord/status-true-1.png')
          ],
          [
            require('@/assets/img/WorkRecord/status-false-2.png'),
            require('@/assets/img/WorkRecord/status-true-2.png')
          ],
          [
            require('@/assets/img/WorkRecord/status-false-3.png'),
            require('@/assets/img/WorkRecord/status-true-3.png')
          ]
        ],
        text: ['维护开始', '维护完成', '验收完成']
      },
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
        let curHeight = self.$refs.workRecord.scrollTop
        var now = curHeight
        var speed = (0 - now) / 7
        speed = speed > 0 ? Math.ceil(speed) : Math.floor(speed)
        self.$refs.workRecord.scrollTop = curHeight + speed
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
        this.pickerValue = this.startTime
      } else {
        this.pickerValue = this.endTime
      }
      this.type = type
      this.$refs.picker.open()
    },
    handleConfirm () {
      if (this.pickerValue === '') {
        this.pickerValue = '2008-01-01 00:00'
        if (!this.type) {
          this.startTime = this.pickerValue
        } else {
          this.endTime = this.pickerValue
        }
      } else {
        this.pickerValue = getDate({ timestamp: this.pickerValue, format: 'yyyy-MM-dd HH:mm' })
        if (!this.type) {
          this.startTime = this.pickerValue + ':00'
        } else {
          this.endTime = this.pickerValue + ':59'
        }
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
        let params = {
          bgtime: this.startTime,
          edtime: this.endTime,
          devNo: this.option,
          index: _index
        }
        api.workrecordQuery(params)
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
      this.query().then(() => { this.$refs.loadmore.onTopLoaded() })
    },
    /**
     * 上拉加载 下一页
     */
    loadBottom () {
      this.query('next').then(() => { this.$refs.loadmore.onBottomLoaded() })
    },
    /**
     * 计算渲染列表的状态项
     */
    computedStatus (key, sts) {
      return this.status.text.some((n, k) => n === sts && k >= key)
    },
    /**
     * 初始化数据
     */
    initializeData () {
      this.pickerValue = `${getMonth({ type: 's' })} 00:00:00`
      this.startTime = `${getMonth({ type: 's' })} 00:00:00`
      this.endTime = `${getMonth({ type: 'e' })} 23:59:59`
      this.type = ''
      this.option = ''
      this.index = 0
      this.data = []
      this.topStatus = false
      this.allLoaded = true
    },
    needToTop () {
      this.$nextTick(() => {
        this.$refs.input1.blur()
      })
      let prevScrollTop = this.needToTop.scrollTop || 0
      let scrollTop = this.$refs.workRecord.scrollTop
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
    },
    goDetail (id) {
      this.$store.commit('setScrollTop', this.$refs.workRecord.scrollTop)
      this.$router.push({name: 'AttendanceDetails', query: {id: id}})
    }
  },
  created () {},
  activated () {
    if (this.$route.meta.isUseCache) {
      // 设置页面滚动位置
      this.$refs.workRecord.scrollTop = this.$store.state.scroll.pageYOffset
    } else {
      // 滚动到最顶，数据初始化
      this.$refs.workRecord.scrollTop = 0
      this.initializeData()
      this.query() // 这是我们获取数据的函数
    }
  },
  components: {
    BackTop
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang='scss'>
.workRecord {
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
  .screeningCondition {
    padding-top: 22px;
    padding-bottom: 20px;
    height: auto;
    background: #fff;
    .time {
      // padding-top: 22px;
      .time-left {
        margin-bottom: 22px;
        height: 48px;
        line-height: 48px;
        .startTime {
          float: left;
          font-size: 28px;
          color: #333333;
          margin-left: 25px;
        }
        .startTimeNumber {
          float: left;
          border-radius: 8px;
          height: 46px;
          line-height: 46px;
          width: 320px;
          border: 2px solid #e6e6e6;
          background: #fff;
          margin-left: 12px;
        }
      }
      .time-right {
        margin-bottom: 22px;
        height: 48px;
        line-height: 48px;
        .endTime {
          float: left;
          font-size: 28px;
          color: #333333;
          text-align: center;
          margin-left: 25px;
        }
        .endTimeNumber {
          float: left;
          margin-left: 12px;
          border-radius: 8px;
          height: 46px;
          line-height: 46px;
          width: 320px;
          border: 2px solid #e6e6e6;
          background: #fff;
        }
      }
    }
    .type {
      height: 48px;
      // margin-bottom: 20px;
      .type-left {
        width: 54%;
        float: left;
        height: 48px;
        line-height: 48px;
        font-size: 28px;
        .actionItem,
        .actionValue {
          float: left;
        }
        .actionItem {
          margin-left: 25px;
          margin-right: 12px;
          display: inline-block;
          width: 140px;
          text-align: left;
        }
        .actionValue {
          text-indent: 10px;
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
      height: 48px;
      border-radius: 10px;
      background: #427fdc;
      font-size: 28px;
      text-align: center;
      line-height: 48px;
      color: #fff;
      margin-right: 24px;
    }
  }
  .record-content {
    margin-top: 20px;
    background-color: #fafafa;
    height: 374px;
    padding: 20px 24px 0;
    transition: background 0.15s;
    &:active {
      background-color: rgba(0, 0, 0, 0.05);
    }
    .con-table {
      background-color: #fff;
      height: 157px;
      padding: 1px 30px 0;
      border-radius: 10px;
      .con-tr {
        font-size: 26px;
        display: flex;
        margin-top: 14px;
        span {
          text-align: left;
          color: #989898;
        }
        p {
          flex: 1;
          text-align: right;
        }
        .status {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          .status-item {
            display: flex;
            align-items: center;
            i {
              font-style: normal;
            }
            .across {
              width: 26px;
              height: 3px;
              margin-left: 7px;
              margin-right: 4px;
            }
            .icon {
              width: 26px;
              height: 26px;
              margin-right: 13px;
            }
          }
        }
      }
      &:nth-child(2) {
        margin-top: 20px;
        // height: 105px;
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
