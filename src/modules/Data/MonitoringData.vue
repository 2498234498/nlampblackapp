<template>
  <div class="monitoringData" ref="box">
    <div class="header statusBarTop">
      <div class="left" @click="$router.goBack()">
        <img class="back" src="@/assets/img/settingsPage/back.png" alt="">
      </div>
      <h1>{{show ? '监控数据-数据列表' : '监控数据-数据图表'}}</h1>
      <div class="right" @click="switchView()">
        <img v-show="show" class="icon" src="@/assets/img/threeCharts/data-sheets.png" alt="">
        <img v-show="!show" class="icon" src="@/assets/img/threeCharts/data-list.png" alt="">
      </div>
    </div>
    <div class="loadmoreBox" ref="monitoringData" @scroll.passive="$raf(needToTop)" @touchstart="$_loadmore($event)">
      <mt-loadmore
        class="loadmore"
        :top-method="loadTop"
        :auto-fill="false"
        :bottom-method="loadBottom"
        :bottom-all-loaded="allLoaded"
        @top-status-change="handleTopChange"
        ref = "loadmore"
      >
        <div class="container">
          <div class="container-top">
            <div>
              <label class="label-left">区域：</label>
              <custom-select class="select" :list="area" :val.sync="areaInit"></custom-select>
            </div>
            <div>
              <label class="label-right">筛选条件：</label>
              <custom-select class="select" :list="selparam" :val.sync="selparamInit"></custom-select>
            </div>
            <div>
              <label class="label-left">街道：</label>
              <custom-select class="select" :list="street" :val.sync="streetInit"></custom-select>
            </div>
            <div>
              <label class="label-right">监控名称：</label>
              <input type="text" class="select input" v-model="point" ref="input1" @keyup.13="query(1)">
            </div>
            <div>
              <label class="label-left">设备号：</label>
              <input type="text" class="input" v-model="equNo" ref="input2" @keyup.13="query(1)">
            </div>
            <div>
              <label class="label-right"></label>
              <button @click="query(1)">查询</button>
            </div>
          </div>
          <div class="graph" v-if="!show">
            <ve-histogram
              height="100%"
              width="100%"
              :data="echartRealTimeData.chartData.data"
              :data-zoom="echartRealTimeData.dataZoom"
              :title="echartRealTimeData.chartData.title"
              :extend="echartRealTimeData.chartExtend"
            >
            </ve-histogram>
          </div>
          <div class="graph" v-if="!show">
            <ve-histogram
              height="100%"
              width="100%"
              :data="echartCompanyData.chartData.data"
              :data-zoom="echartCompanyData.dataZoom"
              :title="echartCompanyData.chartData.title"
              :extend="echartCompanyData.chartExtend"
            >
            </ve-histogram>
          </div>
          <div class="noDada" v-show="show ? monitoringData.length ? false : true : false">
            <img src="@/assets/img/data/noData.png" alt="">
            <span>暂无数据</span>
          </div>
          <div class="listData" v-show="show" v-for="item in monitoringData" :key="item.equNo">
            <div class="row">
              <div class="item">
                <div>
                  <span>监控点名称：</span>
                  <span>{{item.monitorpoint}}</span>
                </div>
                <div>
                  <span>设备号：</span>
                  <span>{{item.equNo}}</span>
                </div>
                <div>
                  <span>在线状态：</span>
                  <span :class="item.onlinestate=='离线'?'malfunction':'normal'">{{item.onlinestate}}</span>
                </div>
              </div>
              <div class="item">
                <div>
                  <span>实时值：</span>
                  <span>{{item.real}}</span>
                </div>
                <div>
                  <span>风机：</span>
                  <span :class="item.fan=='关闭'?'malfunction':'normal'">{{item.fan}}</span>
                </div>
                <div>
                  <span>净化器：</span>
                  <span :class="item.cleaner=='关闭'?'malfunction':'normal'">{{item.cleaner}}</span>
                </div>
              </div>
              <div class="item">
                <div>
                  <span>状态：</span>
                  <span :class="item.state=='正常'?'normal':'malfunction'">{{item.state}}</span>
                </div>
                <div>
                  <span>最新时间：</span>
                  <span>{{item.lasttime}}</span>
                </div>
                <div @click="getPageHeight()">
                  <router-link :to="{path:'/data/realTimeData/'+item.equNo}" class="skip">
                    <span>详情：</span>
                    <span>点击查看 ></span>
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </mt-loadmore>
    </div>
    <div @click="goHeader()" v-show="showHeader">
      <back-top></back-top>
    </div>
  </div>
</template>

<script>
import customSelect from '@/components/CustomSelect.vue'
import BackTop from '@/components/BackTop'
import api from 'api'
export default {
  name: 'MonitoringData',
  data () {
    return {
      showHeader: false,
      stopScroll: false,
      topStatus: false,
      allLoaded: true,
      pageTotal: 50,
      echartRealTimeData: {},
      echartCompanyData: {},
      echartCompany: [],
      show: true,
      scroll: [0, 1],
      index: 0,
      area: [],
      areaId: [],
      areaInit: '全部',
      selparam: ['全部', '正常浓度', '超标报警', '严重超标', '在线', '离线'],
      selparamInit: '全部',
      street: [],
      streetId: [],
      streetInit: '全部',
      point: '',
      equNo: '',
      monitoringData: [],
      monitorDataChart: [],
      timer: null,
      stop: false
    }
  },
  methods: {
    goHeader () {
      let self = this
      self.$raf.cancel(self.timer)
      self.timer = self.$raf(function fn () {
        let curHeight = self.$refs.monitoringData.scrollTop
        var now = curHeight
        var speed = (0 - now) / 7
        speed = speed > 0 ? Math.ceil(speed) : Math.floor(speed)
        self.$refs.monitoringData.scrollTop = curHeight + speed
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
    switchView () {
      let scroll = this.$refs.monitoringData.scrollTop
      this.show ? this.scroll[0] = scroll : this.scroll[1] = scroll
      this.show = !this.show
      this.$nextTick(() => {
        this.$refs.monitoringData.scrollTop = (this.show ? this.scroll[0] : this.scroll[1])
      })
    },
    getPageHeight () {
      this.$store.commit('setScrollTop', this.$refs.monitoringData.scrollTop)
    },
    query (type) {
      this.$nextTick(() => {
        this.$refs.input1.blur()
        this.$refs.input2.blur()
      })
      var overmark = ''
      switch (this.selparamInit) {
        case '全部':
          overmark = ''
          break
        case '正常浓度':
          overmark = 1
          break
        case '超标报警':
          overmark = 3
          break
        case '严重超标':
          overmark = 4
          break
        case '在线':
          overmark = 11
          break
        case '离线':
          overmark = 10
          break
      }
      var params = {
        equNo: this.equNo,
        pointname: this.point,
        overmark: overmark,
        areaId: '',
        streetId: '',
        index: this.index
      }
      if (type) {
        this.area.forEach((ele, index) => {
          if (ele === this.areaInit) {
            params.areaId = this.areaId[index]
          }
        })
        this.street.forEach((ele, index) => {
          if (ele === this.streetInit) {
            params.streetId = this.streetId[index]
          }
        })
        params.index = 0
        this.index = 0
      }
      api.monitordatalistQuery(params).then(res => {
        if (parseInt(res.ack) === 1) {
          if (this.index > 0) {
            this.monitoringData = this.monitoringData.concat(res.data)
            this.$refs.loadmore.onBottomLoaded()
          } else {
            this.monitoringData = res.data
            this.$refs.loadmore.onTopLoaded()
          }
          this.monitorDataChart = []
          this.monitoringData.map((ele, index) => {
            this.monitorDataChart[index] = {
              '监控点名称': ele.monitorpoint,
              '实时值': ele.real === '' ? '0' : ele.real
            }
            return this.monitorDataChart
          })
          this.echartRealTimeData.chartData.data.rows = this.monitorDataChart
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
      })
    },
    getCompanyData () {
      api.getCompanyToadySumAPP().then(res => {
        if (parseInt(res.ack) === 1) {
          this.echartCompany = res.data.map((ele, index) => {
            return {
              '监控点名称': ele.companyname,
              '总量': ele.sumval
            }
          })
          this.echartCompanyData.chartData.data.rows = this.echartCompany
        } else {
          this.$toast({
            message: '数据加载异常'
          })
        }
      })
    },
    getStreetId () {
      api.streetQuery().then(res => {
        if (res.ack === 1) {
          res.data.forEach((ele, index) => {
            this.street[index] = ele.streetName
            this.streetId[index] = ele.streetId
          })
          this.streetId.unshift('')
          this.street.unshift('全部')
        } else {
          this.$toast({
            message: '数据加载异常'
          })
        }
      })
    },
    getAreaId () {
      api.districtsQuery().then(res => {
        if (res.ack === 1) {
          res.data.forEach((ele, index) => {
            this.area[index] = ele.areaName
            this.areaId[index] = ele.areaId
          })
          this.areaId.unshift('')
          this.area.unshift('全部')
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
      this.query(1)
    },
    loadBottom () {
      this.index++
      this.query()
    },
    toast (message) {
      this.$toast({
        message: message
      })
    },
    // 初始化数据
    initData () {
      this.topStatus = false
      this.allLoaded = true
      this.pageTotal = 50
      this.echartRealTimeData = {}
      this.echartCompanyData = {}
      this.echartCompany = []
      this.show = true
      this.index = 0
      this.area = []
      this.areaId = []
      this.areaInit = '全部'
      this.selparam = ['全部', '正常浓度', '超标报警', '严重超标', '在线', '离线']
      this.selparamInit = '全部'
      this.street = []
      this.streetId = []
      this.streetInit = '全部'
      this.point = ''
      this.equNo = ''
      this.monitoringData = []
      this.monitorDataChart = []
      this.listHeight = 0
    },
    // 初始化echarts
    initEcharts () {
      this.echartRealTimeData = {
        chartData: {
          title: {
            show: true,
            text: '监控点实时数据',
            textStyle: {
              color: '#008bcd',
              fontSize: '14',
              fontWeight: '100'
            },
            top: '3%',
            left: '0'
          },
          data: {
            columns: ['监控点名称', '实时值'],
            rows: this.monitorDataChart
          }
        },
        dataZoom: [
          {
            type: 'slider',
            start: 0,
            end: 40
          },
          {
            type: 'inside',
            start: 0,
            end: 40
          }
        ],
        chartExtend: {
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
          grid: {
            containLabel: false,
            x: 40,
            x2: 30,
            y: 40,
            y2: 80
          },
          xAxis: {
            name: '',
            axisLabel: {
              interval: 0,
              formatter: function (val) {
                let str = ''
                if (val.split('').length > 5) {
                  str = val.slice(0, 5) + '\n' + val.slice(5)
                } else {
                  str = val
                }
                return str
              },
              textStyle: {
                fontSize: '9'
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
            name: '',
            position: 'left',
            axisLine: {
              show: true,
              lineStyle: {
                color: '#5392d1'
              }
            },
            axisTick: {
              show: false
            },
            splitLine: {
              show: false
            }
          },
          tooltip: {
            position: function (p) {
              return [p[0] > 162 ? p[0] - 162 : p[0], p[1] > 84 ? p[1] - 40 : p[1]]
            },
            formatter: function (datas) {
              let res = datas[0].name + '<br/>'
              let val = ''
              for (var i = 0; i < datas.length; i++) {
                val = datas[i].value === '0' ? '' : datas[i].value
                res += datas[i].seriesName + ': ' + val + '<br/>'
              }
              return res
            },
            textStyle: {
              align: 'left'
            }
          }
        }
      }
      this.echartCompanyData = {
        chartData: {
          title: {
            show: true,
            text: '企业排放总量',
            textStyle: {
              color: '#008bcd',
              fontSize: '14',
              fontWeight: '100'
            },
            top: '3%',
            left: '0'
          },
          data: {
            columns: ['监控点名称', '总量'],
            rows: this.echartCompany
          }
        },
        dataZoom: [
          {
            type: 'slider',
            start: 0,
            end: 40
          },
          {
            type: 'inside',
            start: 0,
            end: 40
          }
        ],
        chartExtend: {
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
          grid: {
            containLabel: false,
            x: 40,
            x2: 30,
            y: 40,
            y2: 80
          },
          xAxis: {
            name: '',
            axisLabel: {
              interval: 0,
              // 文字过长,换行显示
              formatter: function (val) {
                let str = ''
                if (val.split('').length > 5) {
                  str = val.slice(0, 5) + '\n' + val.slice(5)
                } else {
                  str = val
                }
                return str
              },
              textStyle: {
                fontSize: '9',
                textAlign: 'center'
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
            name: '',
            position: 'left',
            axisLine: {
              show: true,
              lineStyle: {
                color: '#5392d1'
              }
            },
            axisTick: {
              show: false
            },
            splitLine: {
              show: false
            }
          },
          tooltip: {
            position: function (p) {
              return [p[0] > 162 ? p[0] - 162 : p[0], p[1] > 84 ? p[1] - 40 : p[1]]
            },
            textStyle: {
              align: 'left'
            }
          }
        }
      }
    },
    needToTop () {
      this.$nextTick(() => {
        this.$refs.input1.blur()
        this.$refs.input2.blur()
      })
      if (this.show) {
        let prevScrollTop = this.needToTop.scrollTop || 0
        let scrollTop = this.$refs.monitoringData.scrollTop
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
  components: {
    customSelect,
    BackTop
  },
  activated () {
    // 设置页面滚动位置
    if (this.$route.meta.isUseCache) {
      this.$refs.monitoringData.scrollTop = this.$store.state.scroll.pageYOffset
    } else {
      // 滚动到最顶，数据初始化
      this.$refs.monitoringData.scrollTop = 0
      this.initData()
      this.initEcharts()
      if (this.$route.params.devNo !== '0') {
        this.equNo = this.$route.params.devNo
      }
      this.query(0)
      this.getStreetId()
      this.getAreaId()
      this.getCompanyData()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang='scss'>
.monitoringData {
  background: #eeeff4;
  height: 100%;
  padding-top: $headerHei;
  .header {
    position: fixed;
    width: 100%;
    top: 0;
    left: 0;
    z-index: 1;
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
      font-weight: 100;
      font-size: 30px;
      letter-spacing: 2px;
    }
    .right {
      width: 68px;
      height: 88px;
      .icon {
        width: 41px;
        height: 39px;
        margin-top: 24px;
      }
    }
  }
  .loadmoreBox {
    overflow: scroll;
    height: 100%;
    padding-bottom: $footerHei;
    .container {
      display: flex;
      flex-direction: column;
      .container-top {
        display: flex;
        flex-wrap: wrap;
        height: 228px;
        background: #fff;
        padding-top: 20px;
        div {
          display: flex;
          justify-content: center;
          width: 50%;
          label {
            font-size: 25px;
            color: #323232;
            line-height: 50px;
            text-align: left;
          }
          .select {
            width: 188px;
          }
          .input {
            width: 188px;
            height: 50px;
            border: 2px solid #e6e6e6;
            border-radius: 10px;
            text-indent: 10px;
          }
          .label-left {
            width: 120px;
          }
          .label-right {
            width: 150px;
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
      }
      .graph {
        position: relative;
        margin-top: 20px;
        background: #fff;
        width: 100%;
        height: 800px;
        overflow: hidden;
        z-index: 0;
        &:nth-child(3) {
          margin-top: 0;
          padding-top: 20px;
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
                font-size: 28px;
                line-height: 42px;
              }
              span:nth-child(1) {
                color: #9a9a9a;
              }
              span:nth-child(2) {
                color: #666666;
                font-weight: bolder;
              }
              .skip {
                width: 100%;
                display: flex;
                justify-content: space-between;
                span:nth-child(2) {
                  color: #427fdc;
                }
              }
            }
            div:first-child {
              margin-top: 10px;
            }
            div:last-child {
              margin-bottom: 10px;
            }
            .normal {
              color: #09943a !important;
            }
            .malfunction {
              color: #f80000 !important;
            }
          }
          .item:last-child {
            margin-bottom: 10px;
          }
        }
      }
    }
  }
}
</style>
