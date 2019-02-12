<template>
  <div class="historicalData">
    <div class="header statusBarTop">
      <div class="left" @click="$router.goBack()">
        <img class="back" src="@/assets/img/settingsPage/back.png" alt="">
      </div>
      <h1>{{ ['历史数据-数据列表', '历史数据-数据图表', '历史数据-开关量'].find((t, k) => k === tab) }}</h1>
      <div v-show="tab === 0" class="right" @click="showTop(1)">
        <img class="icon" src="@/assets/img/threeCharts/data-sheets.png" alt="">
      </div>
      <div v-show="tab === 1" class="right" @click="showTop(2)">
        <img class="icon switchIcon" src="@/assets/img/data/3.png" alt="">
      </div>
      <div v-show="tab === 2" class="right" @click="showTop(0)">
        <img class="icon" src="@/assets/img/threeCharts/data-list.png" alt="">
      </div>
    </div>
    <div class="loadmoreBox" ref="loadmoreBox" @scroll.passive="$raf(needToTop)" @touchstart="$_loadmore($event)">
      <mt-loadmore
        class="loadmore"
        :top-method="loadTop"
        :auto-fill="false"
        :bottom-method="loadBottom"
        :bottom-all-loaded="allLoaded"
        @top-status-change="handleTopChange"
        ref="loadmore">
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
        <div class="graph" v-if="tab === 1">
          <ve-line
            height="100%"
            :data="historicalRealTimeDataChart.data"
            :title="historicalRealTimeDataChart.title"
            :extend="historicalRealTimeDataChart.extend"
            :data-zoom="historicalRealTimeDataChart.dataZoom">
          </ve-line>
        </div>
        <div class="graph" v-if="tab === 2">
          <ve-histogram
            height="100%"
            :data="historicalSwitchDataChart.data"
            :title="historicalSwitchDataChart.title"
            :extend="historicalSwitchDataChart.extend"
            :data-zoom="historicalSwitchDataChart.dataZoom">
          </ve-histogram>
        </div>
        <div class="noDada" v-show="tab === 0 && !historicalData.length">
          <img src="@/assets/img/data/noData.png" alt="">
          <span>暂无数据</span>
        </div>
        <div class="listData" v-show="tab === 0" v-for="(row, key) in this.historicalData" :key="key">
          <div class="row">
            <div class="item" v-for="(item,index) in row.hisDataEntitySubs" :key="index">
              <div class="dataTime" v-if="!index">
                <span>数据时间</span>
                <span>{{row.timestamp}}</span>
              </div>
              <div class="flue">
                <span>{{item.channel}}</span>
              </div>
              <div>
                <span>净化前：</span>
                <span>54650.00</span>
              </div>
              <div>
                <span>净化后：</span>
                <span>{{item.potency}}</span>
              </div>
              <div>
                <span>净化后总量：</span>
                <span>{{item.aggregate}}</span>
              </div>
              <div>
                <span>风机：</span>
                <span :class="item.fan=='关闭'?'malfunction':'normal'">{{item.fan}}</span>
              </div>
              <div>
                <span>净化器：</span>
                <span :class="item.cleaner=='关闭'?'malfunction':'normal'">{{item.cleaner}}</span>
              </div>
              <div>
                <span>状态：</span>
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
      v-model="pickerValue">
    </mt-datetime-picker>
    <mt-datetime-picker
      ref="picker1"
      type="date"
      year-format="{value} 年"
      month-format="{value} 月"
      date-format="{value} 日"
      @confirm="handleConfirm(1)"
      v-model="date">
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
  name: 'HistoricalData',
  data () {
    return {
      showHeader: false,
      topStatus: false,
      allLoaded: true,
      pageTotal: 50,
      index: 0,
      tab: 0,
      scroll: [0, 0, 0],
      type: ['分钟数据', '十分钟数据', '小时数据', '天数据'],
      typeInit: '分钟数据',
      hour: ['2小时', '3小时', '4小时', '5小时'],
      hourInit: '2小时',
      time: '',
      pickerValue: '',
      date: '',
      dateValue: '',
      pointNum: '',
      historicalData: [],
      historicalDataSwitch: [],
      historicalRealTimeDataChart: {},
      historicalSwitchDataChart: {},
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
    showTop (index) {
      let scroll = this.$refs.loadmoreBox.scrollTop
      this.scroll[this.tab] = scroll
      this.tab = index
      this.$nextTick(() => {
        this.$refs.loadmoreBox.scrollTop = this.scroll[this.tab]
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
        let h = getDate({ format: 'HH:mm:ss' }).split(':')[0] - 2
        h = h > 10 ? h : '0' + h
        let m = getDate({ format: 'HH:mm:ss' }).split(':')[1]
        let s = getDate({ format: 'HH:mm:ss' }).split(':')[2]
        this.time = h + ':' + m + ':' + s
      }
      if (time) {
        this.dateValue = getDate({ timestamp: time, format: 'yyyy-MM-dd' })
      } else {
        this.dateValue = getDate({ timestamp: time, format: 'yyyy-MM-dd' })
      }
    },
    query (type) {
      let code = 0
      let hourInit = 0
      switch (this.typeInit) {
        case '分钟数据':
          code = 5051
          hourInit = parseInt(this.hourInit)
          break
        case '十分钟数据':
          code = 5052
          hourInit = parseInt(this.hourInit)
          break
        case '小时数据':
          code = 5061
          hourInit = parseInt(this.hourInit) * 24
          break
        case '天数据':
          code = 5071
          hourInit = parseInt(this.hourInit) * 24
          break
      }
      if (type) {
        this.index = 0
      }
      let params = {
        pointNum: this.pointNum,
        timestyle: hourInit,
        datatype: code,
        time: this.time,
        date: this.dateValue,
        index: this.index
      }
      api.hisdataQuery(params).then(res => {
        if (res.ack === 1) {
          if (res.data.length) {
            if (res.data[0].hisDataEntitySubs.length !== 2) {
              if (this.historicalRealTimeDataChart.data.columns.length === 3) {
                this.historicalRealTimeDataChart.data.columns.pop()
              }
              if (this.historicalSwitchDataChart.data.columns.length === 5) {
                this.historicalSwitchDataChart.data.columns.pop()
                this.historicalSwitchDataChart.data.columns.pop()
              }
            }
          } else {
            if (this.historicalRealTimeDataChart.data.columns.length === 3) {
              this.historicalRealTimeDataChart.data.columns.pop()
            }
            if (this.historicalSwitchDataChart.data.columns.length === 5) {
              this.historicalSwitchDataChart.data.columns.pop()
              this.historicalSwitchDataChart.data.columns.pop()
            }
          }
          let num = this.historicalRealTimeDataChart.data.rows.length
          let echartsData = []
          let echartsSwitchData = []
          res.data.forEach((ele, index) => {
            // 解决charts X轴 相同会放在一起显示
            echartsData[index] = {
              '时间': `${ele.timestamp.split(' ')[1]}|${num++}`
            }
            echartsSwitchData[index] = {
              '时间': `${ele.timestamp.split(' ')[1]}|${num++}`
            }
            ele.hisDataEntitySubs.map((item, i) => {
              var potency = item.channel + '净化后'
              var potency1 = item.channel + '净化后风机状态'
              var potency2 = item.channel + '净化后净化器状态'
              var arr1 = echartsData[index]
              var arr2 = echartsSwitchData[index]
              arr1[potency] = item.potency
              arr2[potency1] = item.fan === '关闭' ? 1 : 2
              arr2[potency2] = item.cleaner === '关闭' ? 1 : 2
              return (echartsData, echartsSwitchData)
            })
          })
          if (res.data.length < this.pageTotal) {
            this.allLoaded = true
          } else {
            this.allLoaded = false
          }
          if (this.index > 0) {
            this.historicalData = this.historicalData.concat(res.data)
            this.$refs.loadmore.onBottomLoaded()
          } else {
            this.historicalData = res.data
            this.$refs.loadmore.onTopLoaded()
          }
          this.historicalRealTimeDataChart.data.rows = echartsData
          this.historicalSwitchDataChart.data.rows = echartsSwitchData
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
      if (this.tab === 0) {
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
    this.historicalRealTimeDataChart = {
      title: {
        show: true,
        text: '监控点实时数据',
        textStyle: {
          color: '#5392d1',
          fontSize: '16',
          fontWeight: '100'
        },
        top: '3%',
        left: '0'
      },
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
            fontSize: '12'
          }
        },
        xAxis: {
          name: '',
          show: true,
          axisLabel: {
            formatter (v) {
              return v.split('|')[0]
            },
            boundaryGap: true,
            textStyle: {
              fontSize: '12',
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
          x: 40,
          x2: 30,
          y: 70,
          y2: 80,
          containLabel: false
        },
        tooltip: {
          position (p) {
            return [p[0] > 162 ? p[0] - 162 : p[0], p[1] > 84 ? p[1] - 40 : p[1]]
          },
          formatter (datas) {
            let res = ''
            datas.forEach(d => {
              res += `${d.data[0].split('|')[0]}<br/>${d.seriesName}(mg/m³)：${d.data[1]}`
            })
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
      ]
    }
    this.historicalSwitchDataChart = {
      title: {
        show: true,
        text: '开关量',
        textStyle: {
          color: '#5392d1',
          fontSize: '16',
          fontWeight: '100'
        },
        top: '6%',
        left: '0'
      },
      data: {
        columns: ['时间', '烟道1净化后净化器状态', '烟道1净化后风机状态', '烟道2净化后净化器状态', '烟道2净化后风机状态'],
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
          left: '45%',
          textStyle: {
            fontSize: 12
          }
        },
        grid: {
          containLabel: false,
          x: 48,
          x2: 40,
          y: 80,
          y2: 80
        },
        xAxis: {
          name: '',
          axisLabel: {
            formatter (v) {
              return v.split('|')[0]
            }
          },
          axisLine: {
            show: true,
            boundaryGap: true,
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
          min: 0,
          max: 2,
          name: '风机净化器状态',
          position: 'left',
          axisLabel: {
            formatter: function (value) {
              let switchY = []
              switch (value) {
                case 0: switchY.push(0); break
                case 0.5: switchY.push(''); break
                case 1: switchY.push('关'); break
                case 1.5: switchY.push(''); break
                case 2: switchY.push('开'); break
              }
              return switchY
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
        tooltip: {
          trigger: 'axis',
          position (p) {
            return [p[0] > 161 ? p[0] - 161 : p[0], p[1] > 84 ? p[1] - 40 : p[1]]
          },
          formatter (datas) {
            let res = datas[0].name.split('|')[0] + '<br/>'
            let val = ''
            for (var i = 0; i < datas.length; i++) {
              val = datas[i].data === 2 ? '开' : '关'
              res += datas[i].seriesName + ': ' + val + '<br/>'
            }
            return res
          },
          textStyle: {
            fontSize: '10',
            align: 'left'
          }
        }
      }
    }
  },
  mounted () {
    this.conversionTimeType('', 0)
    this.pointNum = this.$route.params.id
    this.query()
  },
  watch: {
    typeInit (nd) {
      switch (nd) {
        case '分钟数据':
          this.hour = ['2小时', '3小时', '4小时', '5小时']
          this.hourInit = this.hour[0]
          break
        case '十分钟数据':
          this.hour = ['6个小时', '12个小时']
          this.hourInit = this.hour[0]
          break
        case '小时数据':
          this.hour = ['3天']
          this.hourInit = this.hour[0]
          break
        case '天数据':
          this.hour = ['30天', '60天', '90天']
          this.hourInit = this.hour[0]
          break
      }
    }
  },
  components: {
    customSelect,
    BackTop
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang='scss'>
.historicalData {
  height: 100%;
  background: #eeeff4;
  padding-top: $headerHei;
  padding-bottom: $footerHei;
  .header {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1;
    width: 100%;
    height: $headerHei;
    background: #427fdc;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .left {
      height: 88px;
      padding-right: 24px;
      .back {
        width: 19px;
        height: 33px;
        margin-left: 24px;
        margin-top: 28px;
      }
    }
    h1 {
      flex: 1;
      text-align: center;
      color: #feffff;
      font-size: 31px;
      letter-spacing: 2px;
      font-weight: 100;
    }
    .right {
      height: 88px;
      width: 68px;
      display: flex;
      align-items: center;
      justify-content: center;
      .icon {
        width: 38px;
        height: 39px;
        margin-top: 16px;
      }
      .switchIcon {
        width: 66px;
        margin-right: 24px;
      }
    }
  }
  .loadmoreBox {
    height: 100%;
    overflow: scroll;
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
      margin-bottom: 10px;
      margin-top: 10px;
      overflow: hidden;
      .item {
        background: #fff;
        width: 96%;
        margin: 0 auto;
        overflow: hidden;
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
          height: 60px;
          border-bottom: 1px solid #e6e6e6;
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
      .item:first-child {
        margin-top: 10px;
      }
      .item:last-child {
        margin-bottom: 10px;
        div:last-child {
          border-bottom: none;
        }
      }
    }
  }
}
</style>
