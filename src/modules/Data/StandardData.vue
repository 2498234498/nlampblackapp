<template>
  <div class="standardData" ref="box">
    <mt-header fixed title="超标数据" class="header">
      <a @click="$router.goBack()" slot="left">
        <mt-button icon="back"></mt-button>
      </a>
    </mt-header>
    <div class="loadmoreBox" ref="standardData" @scroll.passive="$raf(needToTop)" @touchstart="$_loadmore($event)">
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
              <div class="bar">
                <label for="area">企业名称：</label>
                <input type="text" class="input" v-model="company" @keyup.13="query()" ref="input1">
              </div>
              <div class="bar">
                <label for="area">监控名称：</label>
                <input type="text" class="input" v-model="monitoring" @keyup.13="query()" ref="input2">
              </div>
            </div>
            <div class="funItem">
              <div class="bar">
                <label for="area">区域：</label>
                <custom-select :list="area.selectList" :val.sync="area.value" :index="area.index"></custom-select>
              </div>
              <div class="bar">
                <label for="area">街道：</label>
                <custom-select :list="street.selectList" :val.sync="street.value" :index="street.index"></custom-select>
              </div>
            </div>
            <div class="funItem">
              <div class="bar">
                <label for="area">设备号：</label>
                <input type="text" class="input" v-model="facility" @keyup.13="query()" ref="input3">
              </div>
              <div class="bar btnBar">
                <mt-button type="primary" class="parBtn" @click="query()">查询</mt-button>
              </div>
            </div>
          </div>
          <div class="noDada" v-show="!standardData.length">
            <img src="@/assets/img/data/noData.png" alt="">
            <span>暂无数据</span>
          </div>
          <div class="container" v-for="(item, key) in standardData" :key="key">
            <div class="row">
              <div class="item">
                <div>
                  <span>监控点名称：</span>
                  <span>{{item.point}}</span>
                </div>
                <div>
                  <span>设备号：</span>
                  <span>{{item.devNO}}</span>
                </div>
                <div>
                  <span>最新超标时间：</span>
                  <span>{{item.lasttime}}</span>
                </div>
                <div>
                  <span>排放总数：</span>
                  <span>{{item.emissiondata}}</span>
                </div>
              </div>
              <div class="item">
                <div>
                  <span>超标次数：</span>
                  <span>{{item.overcount}}</span>
                </div>
                <div>
                  <span>严重超标：</span>
                  <span>{{item.heavyTimes}}</span>
                </div>
                <div>
                  <span>超标率：</span>
                  <span>{{item.overpercent}}</span>
                </div>
              </div>
              <div class="item">
                <div>
                  <span>超标最大值：</span>
                  <span>{{item.max}}</span>
                </div>
                <div>
                  <span>排放均值：</span>
                  <span>{{item.average}}</span>
                </div>
                <div>
                  <span>超标均值：</span>
                  <span>{{item.overAverage}}</span>
                </div>
              </div>
              <div class="item">
                <div>
                  <span>联系人：</span>
                  <span>{{item.contacts}}</span>
                </div>
                <div>
                  <span>联系电话：</span>
                  <span>{{item.call}}</span>
                </div>
                <div>
                  <span>短信报警：</span>
                  <span></span>
                </div>
                <div @click="jump({name: 'StandardDetails', query: {startTime: startTime,endTime: endTime,devNO: item.devNO}})">
                  <span>详情</span>
                  <span class="detail">点击查看 ></span>
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
import customSelect from '@/components/CustomSelectMap.vue'
import BackTop from '@/components/BackTop'
import api from 'api'
import { getDate } from 'util'
export default {
  name: 'StandardData',
  data () {
    return {
      showHeader: false,
      area: {
        value: {
          areaName: '全部'
        },
        selectList: [],
        index: 'areaName'
      },
      company: '',
      street: {
        value: {
          streetName: '全部'
        },
        selectList: [],
        index: 'streetName'
      },
      monitoring: '',
      facility: '',
      type: '',
      startTime: getDate({ format: 'yyyy-MM-dd' }) + ' 00:00:00',
      endTime: getDate({ format: 'yyyy-MM-dd' }) + ' 23:59:59',
      datetime: '',
      standardData: [],
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
        let curHeight = self.$refs.standardData.scrollTop
        var now = curHeight
        var speed = (0 - now) / 7
        speed = speed > 0 ? Math.ceil(speed) : Math.floor(speed)
        self.$refs.standardData.scrollTop = curHeight + speed
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
     * 获取超标数据
     * @param {String} action - 执行动作区分，默认不执行
     */
    query (action) {
      this.$nextTick(() => {
        this.$refs.input1.blur()
        this.$refs.input2.blur()
        this.$refs.input3.blur()
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
          companyName: this.company,
          pointName: this.monitoring,
          devNo: this.facility,
          streetId: this.street.value.streetId,
          areaId: this.area.value.areaId,
          index: _index
        }
        api.overproofQuery(params)
          .then(res => {
            if (res.ack === 1) {
              if (action === 'next') {
                this.standardData = this.standardData.concat(res.data)
                this.index++
              } else {
                this.standardData = res.data
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
    getStreetId () {
      return new Promise((resolve, reject) => {
        api.streetQuery()
          .then(res => {
            if (res.ack === 1) {
              res.data.unshift({ streetName: '全部' })
              this.street.selectList = res.data
            } else {
              this.$toast({
                message: '数据加载异常'
              })
            }
            resolve()
          })
      })
    },
    getAreaId () {
      return new Promise((resolve, reject) => {
        api.districtsQuery()
          .then(res => {
            if (res.ack === 1) {
              res.data.unshift({ areaName: '全部' })
              this.area.selectList = res.data
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
      Promise.all([
        this.getStreetId(),
        this.getAreaId(),
        this.query()
      ])
        .then(() => {
          this.$refs.loadmore.onTopLoaded()
        })
    },
    /**
     * 上拉加载 下一页
     */
    loadBottom () {
      this.query('next').then(() => { this.$refs.loadmore.onBottomLoaded() })
    },
    /**
     * 跳转详情页，同时记录滚动位置
     */
    jump (params) {
      this.$store.commit('setScrollTop', this.$refs.standardData.scrollTop)
      this.$router.push(params)
    },
    /**
     * 初始化数据
     */
    initializeData () {
      this.area.value = { areaName: '全部' }
      this.company = ''
      this.street.value = { streetName: '全部' }
      this.monitoring = ''
      this.facility = ''
      this.type = ''
      this.startTime = getDate({ format: 'yyyy-MM-dd' }) + ' 00:00:00'
      this.endTime = getDate({ format: 'yyyy-MM-dd' }) + ' 23:59:59'
      this.datetime = ''
      this.standardData = []
      this.index = 0
      this.topStatus = false
      this.allLoaded = true
    },
    needToTop () {
      this.$nextTick(() => {
        this.$refs.input1.blur()
        this.$refs.input2.blur()
        this.$refs.input3.blur()
      })
      let prevScrollTop = this.needToTop.scrollTop || 0
      let scrollTop = this.$refs.standardData.scrollTop
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
  created () {},
  components: {
    customSelect,
    BackTop
  },
  activated () {
    if (this.$route.meta.isUseCache) {
      // 设置页面滚动位置及初始化数据
      this.$refs.standardData.scrollTop = this.$store.state.scroll.pageYOffset
    } else {
      // 滚动到最顶，数据初始化
      this.$refs.standardData.scrollTop = 0
      this.initializeData()
      this.query()
      this.getStreetId()
      this.getAreaId()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang='scss'>
.standardData {
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
      content: "";
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
        margin-left: 120px;
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
    .row {
      background: #f0f0f0;
      width: 98%;
      margin: 0 auto;
      margin-top: 10px;
      margin-bottom: 10px;
      overflow: hidden;
      transition: background .15s;
      &:active {
        background-color: rgba(0, 0, 0, .05)
      }
      .item {
        background: #fff;
        width: 96%;
        margin: 0 auto;
        margin-top: 10px;
        margin-bottom: 10px;
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
          .detail {
            color: #427fdc !important;
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
