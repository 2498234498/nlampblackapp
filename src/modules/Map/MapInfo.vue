<template>
  <mt-loadmore class="loadmore" :top-method="loadTop" @top-status-change="handleTopChange" ref="loadmore">
    <div class="mapInfo">
      <div class="fun">
        <div class="left">
          <label for="area">区域：</label>
          <custom-select name="area" :val.sync="area.value" :list="area.selectList" :index="area.index"></custom-select>
        </div>
        <div class="right">
          <mt-button type="primary" class="rightBtn" @click="getData()">查询</mt-button>
        </div>
      </div>
      <div class="graph">
        <div class="graphItem" v-for="(item, key) in chartData" :key="key">
          <h3>{{ item.title }}</h3>
          <div class="pieBar">
            <ve-pie height="100%" :data="item" :settings="chartSettings" :colors="chartColors" :extend="chartExtend"></ve-pie>
          </div>
        </div>
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
      topStatus: false,
      area: {
        value: {
          areaName: '全部'
        },
        selectList: [],
        index: 'areaName'
      },
      chartSettings: {
        dataType: 'percent', // 数据类型，可选值: KMB, normal, percent
        radius: 70, // 饼图半径
        offsetY: 160, // 纵向偏移量
        labelLine: { // 引导线
          length: 10, // 第一段引导线
          length2: 15, // 第二段引导线
          lineStyle: {
            color: '#5589df'
          }
        },
        label: { // 引导线后面的标签
          fontSize: '12',
          formatter: '{b}: {c} ({d}%)'
        }
      },
      chartExtend: {
        legend: {
          orient: 'vertical',
          left: '3.3%',
          top: 'auto'
        },
        tooltip: {
          position (p) {
            return [p[0] > 162 ? p[0] - 162 : p[0], p[1] > 84 ? p[1] - 40 : p[1]]
          },
          formatter: '点数统计<br/>{b}：{c} ({d}%)',
          textStyle: {
            fontSize: '10'
          },
          extraCssText: 'text-align: left;z-index: 0;'
        }
      },
      chartData: [],
      chartColors: ['#2ec8ca', '#b6a2df', '#5AB1EF']
    }
  },
  methods: {
    /**
     * 获取图标数据
     * @param {String} areaId - 区域id，为空查询所有，默认为空，areaSelect.areaId
     */
    getData () {
      return new Promise((resolve, reject) => {
        api.diningLampbQuery({areaId: this.area.value.areaId})
          .then(res => {
            if (res.ack === 1) {
              const columns = ['类型', '占比']
              let arr = []
              arr.push({
                columns,
                title: '超标监控点统计',
                rows: [
                  { 类型: '超标', 占比: res.overproof },
                  { 类型: '正常', 占比: res.normal }
                ]
              })
              // arr.push({
              //   columns,
              //   title: '停业监控点统计',
              //   rows: [
              //     { 类型: '停业', 占比: res.stop },
              //     { 类型: '正常', 占比: res.onlinecount }
              //   ]
              // })
              arr.push({
                columns,
                title: '在线监控点统计',
                rows: [
                  { 类型: '在线数', 占比: res.onlinecount },
                  { 类型: '离线数', 占比: res.totall - res.onlinecount }
                ]
              })
              this.chartData = arr
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
     * 获得筛选的数据
     */
    getsScreenData () {
      return new Promise((resolve, reject) => {
        api.districtsQuery().then(res => {
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
        this.getsScreenData(),
        this.getData()
      ])
        .then(() => {
          // 关闭下拉
          this.$refs.loadmore.onTopLoaded()
        })
    }
  },
  created () {
    this.getsScreenData()
    this.getData()
  }
}
</script>

<style lang="scss" scoped>
.loadmore {
  width: 100%;
  overflow-y: scroll;
  // min-height: 100%;
  height: 100%;
  position: relative;
  top: 0;
  left: 0;
  /deep/ .mint-loadmore-content {
    height: 100%;
    // overflow-y:scroll;
  }
}
.mapInfo {
  width: 100%;
  height: auto;
  min-height: 100%;
  // overflow: hidden;
  // margin-bottom: $footerHei;
  display: flex;
  flex-direction: column;
  .fun {
    position: relative;
    width: 100%;
    height: 90px;
    padding: 0 26px;
    display: flex;
    align-items: center;
    background: #fff;
    margin-bottom: 20px;
    & > div {
      width: 50%;
    }
    color: #333;
    .left {
      display: flex;
      label {
        font-size: 28px;
        margin-right: 38px;
        display: flex;
        align-items: center;
      }
      .select {
        width: 202px;
        height: 50px;
        line-height: 50px;
        text-align: center;
        border-radius: 10px;
        background: #fff;
        border: 1px solid #e6e6e6;
        option {
          height: 40px;
        }
      }
    }
    .right {
      display: flex;
      flex-direction: row-reverse;
      .rightBtn {
        width: 202px;
        height: 50px;
        font-size: 28px;
        color: #fff;
        border-radius: 10px;
        background: #427fdc;
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
  .graph {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    .graphItem {
      width: 100%;
      height: 700px;
      display: flex;
      flex-direction: column;
      position: relative;
      margin-bottom: 20px;
      &::after {
        position: absolute;
        width: 100%;
        height: 20px;
        background: #f0f0f0;
        content: "";
        left: 0;
        bottom: -20px;
      }
      h3 {
        height: 100px;
        line-height: 100px;
        font-size: 28px;
        color: #333;
        font-weight: bold;
      }
      .pieBar {
        height: 600px;
        overflow: hidden;
      }
      &:last-child {
        margin-bottom: 0;
        &::after {
          height: 0;
        }
      }
    }
  }
  .graph:last-child {
    padding-bottom: $footerHei;
  }
}
</style>
