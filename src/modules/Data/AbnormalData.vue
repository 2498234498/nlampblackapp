<template>
  <div class="abnormalData">
    <mt-header fixed :title="(show ? '异常数据-数据列表' : '异常数据-数据图表')" class="header">
      <a @click="$router.goBack()" slot="left">
        <mt-button icon="back"></mt-button>
      </a>
      <div class="right" @click="show=!show" slot="right">
        <img v-show="show" class="icon" src="@/assets/img/threeCharts/data-sheets.png" alt="">
        <img v-show="!show" class="icon" src="@/assets/img/threeCharts/data-list.png" alt="">
      </div>
    </mt-header>
    <div class="loadmoreBox" ref="loadmoreBox" @scroll.passive="$raf(needToTop)" @touchstart="$_loadmore($event)">
      <mt-loadmore
        class="loadmore"
        :top-method="loadTop"
        :auto-fill="false"
        :bottom-method="loadBottom"
        :bottom-all-loaded="allLoaded"
        @top-status-change="handleTopChange"
        ref="loadmore"
      >
        <div class="container">
          <div class="top">
            <div>
              <label>时间：</label>
              <span class="time span1" @click="openPicker(0)">{{time}}</span>
              <custom-select class="select" :list="hour" :val.sync="hourInit"></custom-select>
            </div>
            <div>
              <label>日期：</label>
              <span class="time" @click="openPicker(1)">{{dateValue}}</span>
              <label class="type">类型：</label>
              <custom-select class="typeSelect" :list="type" :val.sync="typeInit"></custom-select>
            </div>
            <div class="btn">
              <button @click="query(1)">查询</button>
            </div>
          </div>
        </div>
        <div class="noDada" v-show="show?!realTimeData.length:show">
          <img src="@/assets/img/data/noData.png" alt="">
          <span>暂无数据</span>
        </div>
        <div class="graph" v-if="!show">
          <ve-line
            height="100%"
            :title="abnormalDataChart.title"
            :data="abnormalDataChart.data"
            :extend="abnormalDataChart.extend"
            :data-zoom="abnormalDataChart.dataZoom"
          >
          </ve-line>
        </div>
        <div class="listData" v-show="show" v-for="row in realTimeData" :key="row.timestamp">
          <div class="row">
            <div class="item" v-for="(item,key) in row.realDataEntitySubs" :key="key">
              <div class="dataTime">
                <span>数据时间</span>
                <span>{{row.timestamp}}</span>
              </div>
              <div class="flue segmentation">
                <span>烟道1</span>
              </div>
              <div>
                <span>净化后：</span>
                <span>{{item.potency}}</span>
              </div>
              <div class="segmentation">
                <span>净化后总量：</span>
                <span>{{item.aggregate}}</span>
              </div>
              <div>
                <span>风机：</span>
                <span :class="item.fan=='关闭'?'malfunction':'normal'">{{item.fan}}</span>
              </div>
              <div class="segmentation">
                <span>风机电流：</span>
                <span>{{item.fanEltric}}</span>
              </div>
              <div>
                <span>净化电流：</span>
                <span>{{item.cleanerEltric}}</span>
              </div>
              <div>
                <span>净化器：</span>
                <span :class="item.cleaner=='关闭'?'malfunction':'normal'">{{item.cleaner}}</span>
              </div>
              <div>
                <span>探头状态：</span>
                <span :class="item.state=='正常'?'normal':'malfunction'">{{item.state}}</span>
              </div>
            </div>
          </div>
        </div>
      </mt-loadmore>
    </div>
    <mt-datetime-picker
      ref="picker"
      type="time"
      hour-format="{value} 时"
      minute-format="{value} 分"
      @confirm="handleConfirm(0)"
      v-model="pickerValue"
    >
    </mt-datetime-picker>
    <mt-datetime-picker
      ref="picker1"
      type="date"
      year-format="{value} 年"
      month-format="{value} 月"
      date-format="{value} 日"
      @confirm="handleConfirm(1)"
      v-model="date"
    >
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
  name: 'AbnormalData',
  data () {
    return {
      showHeader: false,
      topStatus: false,
      allLoaded: true,
      pageTotal: 50,
      index: 0,
      show: true,
      type: ['异常数据'],
      typeInit: '异常数据',
      hour: ['2小时', '3小时', '4小时', '5小时'],
      hourInit: '2小时',
      time: '',
      pickerValue: '',
      date: '',
      dateValue: '',
      pointNum: '',
      realTimeData: [],
      abnormalDataChart: {},
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
        this.pickerValue = this.time
        this.$refs.picker.open()
      } else {
        this.date = this.dateValue
        this.$refs.picker1.open()
      }
    },
    handleConfirm (type) {
      if (type === 0) {
        this.time = this.pickerValue + ':00'
      } else {
        this.conversionTimeType(this.date, 1)
      }
    },
    conversionTimeType (time, type) {
      if (type === 0) {
        let h = getDate({format: 'HH:mm:ss'}).split(':')[0] - 2
        h = h > 10 ? h : '0' + h
        let m = getDate({format: 'HH:mm:ss'}).split(':')[1]
        let s = getDate({format: 'HH:mm:ss'}).split(':')[2]
        this.time = h + ':' + m + ':' + s
      }
      if (time) {
        this.dateValue = getDate({ timestamp: time, format: 'yyyy-MM-dd' })
      } else {
        this.dateValue = getDate({ timestamp: time, format: 'yyyy-MM-dd' })
      }
    },
    query (type) {
      if (type) {
        this.index = 0
      }
      let params = {
        pointNum: this.pointNum,
        time: this.time,
        timestyle: parseInt(this.hourInit),
        date: this.dateValue,
        datastyle: 1,
        index: this.index
      }
      api.realdataQuery(params).then(res => {
        if (res.ack === 1) {
          if (res.data.length) {
            if (res.data[0].realDataEntitySubs.length === 1) {
              if (this.abnormalDataChart.data.columns.length === 3) {
                this.abnormalDataChart.data.columns.pop()
              }
            }
          } else {
            if (this.abnormalDataChart.data.columns.length === 3) {
              this.abnormalDataChart.data.columns.pop()
            }
          }
          if (res.data.length < this.pageTotal) {
            this.allLoaded = true
          } else {
            this.allLoaded = false
          }
          if (this.index > 0) {
            this.realTimeData = this.realTimeData.concat(res.data)
            this.$refs.loadmore.onBottomLoaded()
          } else {
            this.realTimeData = res.data
            this.$refs.loadmore.onTopLoaded()
          }
          let echartsData = []
          this.realTimeData.map((ele, index) => {
            echartsData[index] = {
              '时间': ele.timestamp.split(' ')[1]
            }
            ele.realDataEntitySubs.map((item, i) => {
              var potency = item.channel + '净化后'
              var arr = echartsData[index]
              arr[potency] = item.potency
              return echartsData
            })
          })
          this.abnormalDataChart.data.rows = echartsData
        } else {
          this.$toast({
            message: '数据加载异常'
          })
        }
      })
    },
    handleTopChange (status) {
      this.topStatus = status
    },
    loadTop () {
      this.index = 0
      this.query()
    },
    loadBottom () {
      this.index++
      this.query()
    },
    needToTop () {
      if (this.show) {
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
      } else {
        this.showHeader = false
      }
    }
  },
  created () {
    this.abnormalDataChart = {
      extend: {
        toolbox: {
          show: true,
          right: '6%',
          feature: {
            dateView: {
              readOnly: true
            },
            magicType: {
              type: ['line', 'bar']
            }
          }
        },
        legend: {
          orient: 'vertical',
          top: '10%',
          left: '65%',
          textStyle: {
            fontSize: '11'
          }
        },
        xAxis: {
          name: '',
          show: true,
          axisLabel: {
            boundaryGap: true,
            textStyle: {
              fontSize: 12,
              color: '#008bcd'
            }
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#5392d1'
            }
          },
          axisTick: {
            show: true
          },
          splitLine: {
            show: false
          }
        },
        yAxis: {
          name: '浓度(mg/m³)',
          position: 'left',
          axisLine: {
            show: true,
            lineStyle: {
              color: '#5392d1'
            }
          },
          axisTick: {
            show: true
          },
          splitLine: {
            show: true
          }
        },
        grid: {
          x: 50,
          y: 70,
          x2: 30,
          y2: 60,
          containLabel: false
        },
        tooltip: {
          position: function (p) {
            return [p[0] > 162 ? p[0] - 162 : p[0], p[1] > 84 ? p[1] - 40 : p[1]]
          },
          formatter: function (datas) {
            let res = datas[0].name + '<br/>'
            let val = ''
            for (var i = 0; i < datas.length; i++) {
              val = datas[i].data[1]
              res += datas[i].seriesName + '(mg/m³): ' + val + '<br/>'
            }
            return res
          },
          textStyle: {
            fontSize: '10',
            align: 'left'
          }
        }
      },
      data: {
        columns: ['时间', '烟道1净化后', '烟道2净化后'],
        rows: []
      },
      dataZoom: [
        {
          type: 'slider',
          start: 0,
          end: 50
        },
        {
          type: 'inside',
          start: 0,
          end: 50
        }
      ],
      title: {
        show: true,
        text: '监控点实时数据',
        textStyle: {
          color: '#5392d1',
          fontSize: '16',
          fontWeight: '100'
        },
        top: '6%',
        left: '2%'
      }
    }
  },
  mounted () {
    this.pointNum = this.$route.params.id
    this.conversionTimeType('', 0)
    this.query()
    this.$nextTick(() => {
      // this.$refs.loadmoreBox.addEventListener('scroll', this.needToTop)
    })
  },
  components: {
    customSelect,
    BackTop
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang='scss'>
.abnormalData {
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
      height: 88px;
      .icon {
        margin-top: 22px;
        width: 100%;
        height: 39px;
      }
    }
  }
  .loadmoreBox {
    height: 100%;
    overflow: scroll;
  }
  .container {
    .top {
      display: flex;
      flex-wrap: wrap;
      height: 228px;
      background: #fff;
      padding-top: 20px;
      div {
        width: 100%;
        display: flex;
        justify-content: flex-start;
        .time {
          border-radius: 8px;
          height: 46px;
          line-height: 46px;
          width: 198px;
          border: 2px solid #e6e6e6;
          background: #fff;
        }
        .span1 {
          margin-right: 20px;
        }
        label {
          font-size: 25px;
          width: 106px;
          height: 46px;
          color: #323232;
          line-height: 46px;
          text-align: left;
          margin-left: 28px;
        }
        .select {
          width: 362px;
          /deep/ span {
            display: block;
            margin: 0 auto;
          }
        }
        .typeSelect {
          width: 268px;
          /deep/ span {
            display: block;
            margin: 0 auto;
          }
        }
        .dataType {
          width: 128px;
        }
        .input {
          width: 188px;
          height: 50px;
          border: 2px solid #e6e6e6;
          border-radius: 10px;
        }
        .type {
          width: 86px;
        }
        button {
          float: right;
          width: 188px;
          height: 50px;
          border-radius: 10px;
          background: #427fdc;
          font-size: 28px;
          text-align: center;
          line-height: 50px;
          color: #fff;
          outline: none;
        }
      }
      div:last-child {
        display: flex;
      }
      .btn {
        display: flex;
        justify-content: flex-end;
        margin-right: 40px;
      }
    }
  }
  .graph {
    position: relative;
    margin-top: 20px;
    background: #fff;
    width: 100%;
    height: 800px;
    overflow: hidden;
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
  .listData {
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
        overflow: hidden;
        margin-top: 10px;
        div {
          display: flex;
          justify-content: space-between;
          padding-right: 30px;
          padding-left: 30px;
          span {
            font-size: 21px;
            line-height: 42px;
          }
          span:nth-child(1) {
            color: #999;
          }
          span:nth-child(2) {
            color: #000;
          }
          .normal {
            color: #09943a !important;
          }
          .malfunction {
            color: #f80000 !important;
          }
        }
        div:first-child {
          margin-top: 10px;
        }
        div:last-child {
          margin-bottom: 10px;
        }
        .dataTime {
          span {
            color: #000 !important;
          }
        }
        .flue {
          span {
            color: #666666 !important;
          }
        }
        .segmentation {
          border-bottom: 2px solid #f3f3f3;
        }
      }
      .item:last-child {
        margin-bottom: 10px;
      }
    }
  }
  .listData:last-child {
    margin-bottom: 100px;
  }
}
</style>
