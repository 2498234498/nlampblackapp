<template>
  <mt-loadmore class="loadmore height-header-footer" :top-method="loadTop" @top-status-change="handleTopChange" ref="loadmore">
    <div class="mapData">
      <div class="fun">
        <div class="funItem">
          <div class="bar">
            <label for="area">区域：</label>
            <custom-select name="area" :list="area.selectList" :val.sync="area.value" :index="area.index"></custom-select>
          </div>
          <div class="bar">
            <label for="screen">筛选条件：</label>
            <custom-select name="screen" :list="screen.selectList" :val.sync="screen.value" :index="screen.index"></custom-select>
          </div>
        </div>
        <div class="funItem">
          <div class="bar">
            <label for="street">街道：</label>
            <custom-select name="street" :list="street.selectList" :val.sync="street.value" :index="street.index"></custom-select>
          </div>
          <div class="bar">
            <label for="monitor">监控名称：</label>
            <input type="text" name="monitor" class="input" v-model="monitorName" @keyup.13="getData()" ref="input1">
          </div>
        </div>
        <div class="funItem">
          <div class="bar">
            <label for="DeviceNum">设备号：</label>
            <input type="text" name="DeviceNum" class="input" v-model="DeviceNum" @keyup.13="getData()" ref="input2">
          </div>
          <div class="bar btnBar">
            <mt-button type="primary" class="parBtn" @click="getData()">查询</mt-button>
          </div>
        </div>
      </div>
      <div class="graph">
        <ve-histogram height="100%" :data="chartData.data" :extend="chartData.extend" :data-zoom="chartData.dataZoom" :title="chartData.title"></ve-histogram>
      </div>
    </div>
  </mt-loadmore>
</template>

<script>
import customSelect from '@/components/CustomSelectMap.vue'
import api from 'api'
export default {
  components: {
    customSelect
  },
  data () {
    return {
      area: {
        value: {
          areaName: '全部'
        },
        selectList: [],
        index: 'areaName'
      },
      screen: {
        value: {
          screenName: '全部',
          screenId: ''
        },
        selectList: [
          {
            screenName: '全部',
            screenId: ''
          },
          {
            screenName: '正常浓度',
            screenId: '1'
          },
          {
            screenName: '超标报警',
            screenId: '3'
          },
          {
            screenName: '严重超标',
            screenId: '4'
          },
          {
            screenName: '在线',
            screenId: '11'
          },
          {
            screenName: '离线',
            screenId: '10'
          }
        ],
        index: 'screenName'
      },
      street: {
        value: {
          streetName: '全部'
        },
        selectList: [],
        index: 'streetName'
      },
      monitorName: '',
      DeviceNum: '',
      chartData: {
        extend: {
          toolbox: {
            show: true,
            right: '2%',
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
            top: '3%',
            left: '50%',
            textStyle: {
              fontSize: '11'
            }
          },
          xAxis: {
            name: '',
            axisLabel: {
              interval: 0,
              formatter (val) {
                return val.split('').length > 5 ? `${val.slice(0, 5)}\n${val.slice(5)}` : val
              },
              textStyle: {
                fontSize: '9',
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
          grid: {
            x: 40,
            x2: 30,
            y: 60,
            y2: 80,
            containLabel: false
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
              show: true
            },
            splitLine: {
              show: true
            }
          },
          tooltip: {
            formatter (datas) {
              let res = ''
              datas.forEach(d => {
                res += `${d.name}<br/>${d.seriesName}: ${d.value}`
              })
              return res
            },
            textStyle: {
              fontSize: '10'
            },
            extraCssText: 'text-align: left;'
          }
        },
        title: {
          show: true,
          text: '监控点实时数据',
          textStyle: {
            color: '#5392d1',
            fontSize: '16',
            fontWeight: '100'
          },
          top: '8%',
          left: '0'
        },
        data: {
          columns: ['X', '实时值'],
          rows: [
            // { 'X': '开发测试设备', '实时值': '0.1' },
            // { 'X': '开发测试设备', '实时值': '0.2' }
          ]
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
        ]
      }
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
      Promise.all([
        this.getOtherScreenData(),
        this.getData()
      ])
        .then(() => {
          // 关闭下拉
          this.$refs.loadmore.onTopLoaded()
        })
    },
    /**
     * 获得数据图标 数据
     * @param {Object} params
     * @param {String} params.aredId - 区域ID
     * @param {String} params.selparam - 筛选条件
     * @param {String} params.streetId - 街道ID
     * @param {String} params.pointName - 监控点名称
     * @param {String} params.equNo - 设备号
     */
    getData () {
      this.$nextTick(() => {
        this.$refs.input1.blur()
        this.$refs.input2.blur()
      })
      let params = {
        areaId: this.area.value.areaId,
        selparam: this.screen.value.screenId,
        streetId: this.street.value.streetId,
        pointName: this.monitorName,
        equNo: this.DeviceNum,
        index: 0
      }
      return new Promise((resolve, reject) => {
        api.monitordatachartQuery(params)
          .then(res => {
            if (res.ack === 1) {
              this.chartData.data.rows = res.data.map(r => {
                r['X'] = r.monitorpoint
                r['实时值'] = r.realdata || '0.0'
                return r
              })
            } else {
              this.$toast({
                message: '数据加载异常'
              })
            }
            resolve()
          })
      })
    },
    /**
     * 区域数据查询，街道数据查询
     */
    getOtherScreenData () {
      return new Promise((resolve, reject) => {
        this.$axios.all([
          api.districtsQuery(), // 区域查询
          api.streetQuery() // 街道查询
        ])
          .then(this.$axios.spread((...res) => {
            // console.log(res)
            let calls = [
              (res) => {
                if (res.ack === 1) {
                  res.data.unshift({
                    areaName: '全部'
                  })
                  this.area.selectList = res.data
                } else {
                  this.$toast({
                    message: '数据加载异常'
                  })
                }
              },
              (res) => {
                if (res.ack === 1) {
                  res.data.unshift({
                    streetName: '全部'
                  })
                  this.street.selectList = res.data
                } else {
                  this.$toast({
                    message: '数据加载异常'
                  })
                }
              }
            ]
            res.forEach((r, key) => { calls[key](r) })
            resolve()
          }))
      })
    }
  },
  created () {
    this.getOtherScreenData()
    this.getData()
  }
}
</script>

<style lang="scss" scoped>
.loadmore {
  width: 100%;
  height: 100%;
  overflow-y: scroll;
}
.mapData {
  width: 100%;
  height: auto;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  .fun {
    position: relative;
    width: 100%;
    height: auto;
    padding: 18px 26px;
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
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
    margin-bottom: 18px;
    .bar {
      width: 50%;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      label {
        text-align: left;
        word-break: keep-all; // 针对小屏幕，文字不换行
        white-space: nowrap;
      }
      &:nth-child(odd) {
        label {
          width: 105px;
        }
      }
      &:nth-child(even) {
        label {
          width: 138px;
        }
      }
      .input {
        width: 202px;
        height: 50px;
        line-height: 50px;
        background: #fff;
        font-size: 28px;
        border: 1px solid #e6e6e6; /*no*/
        border-radius: 10px;
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
        margin-left: 138px;
      }
    }
    &:last-child {
      margin-bottom: 0;
    }
  }
  .graph {
    position: relative;
    width: 100%;
    height: 630px;
    overflow: hidden;
  }
}
</style>
