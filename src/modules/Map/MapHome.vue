<template>
  <div class="mapHome">
    <ve-bmap height="100%" :settings="chartSettings" :after-set-option="bampAfterConfig" :series="chartSeries" :tooltip="chartTooltip" :ready-once="bmapReadyOnce()" :events="chartEvents" :set-option-opts="false" ref="bmap">
    </ve-bmap>
  </div>
</template>

<script>
import api from 'api'
export default {
  props: {
    // 搜索框的值
    search: {
      type: [String, Number],
      default: ''
    },
    // 是否执行搜索事件，默认不执行
    trigger: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      chartSeries: {
        type: 'scatter',
        coordinateSystem: 'bmap',
        data: [
          // 经度，维度，参数, ...
          // [
          //   113.35,
          //   23.12,
          //   {}
          // ]
        ],
        label: {
          show: true,
          position: 'top',
          formatter (params) { // 自定义绘制点的文字内容
            return [`{name|${params.data[2].monitorpoint}}`].join('\n')
          },
          rich: {
            name: {
              color: '#fe0000',
              fontSize: '14',
              lineHeight: 25,
              height: 25,
              backgroundColor: '#fff',
              padding: [0, 2.5],
              borderColor: '#7e7d7b',
              borderWidth: 1,
              align: 'center',
              textBorderColor: 'none',
              shadowOffsetX: 100
            }
          }
        },
        symbol: `image://${require('@/assets/img/map/location_icon.png')}`, // 绘制点图标
        symbolSize: [20, 25],
        itemStyle: {
          opacity: 1
        }
      },
      chartSettings: {
        key: 'oBvDtR6nzWtVchkY4cLHtnah1VVZQKRK',
        bmap: {
          center: [113.413146, 23.124132],
          zoom: 14,
          roam: true,
          mapStyle: {}
        }
      },
      chartTooltip: {
        show: true,
        position (point, params, dom, rect, size) {
          // 自定义获得焦点时的显示dom
          let obj = params.data[2]
          let html = ''
          html = `<div class='MapTig'>
                    <div class='MapTig-title'>详细信息</div>
                    <div class='MapTig-cont'>
                      <ul>
                        <li><span class='MapTig-li-title'>监控点名称：</span><span class='MapTig-li-cont'>${obj.monitorpoint}</span></li>
                        <li><span class='MapTig-li-title'>设备号：</span><span class='MapTig-li-cont'>${obj.equNo}</span></li>
                        <li><span class='MapTig-li-title'>油烟浓度：</span><span class='MapTig-li-cont'>`
          obj.monitorDataSubs.forEach(lanmp => {
            html += `<p>${lanmp.smokechannel}：${lanmp.lastdata}</p>`
          })
          html += `</span></li>
                        <li><span class='MapTig-li-title'>净化器：</span><span class='MapTig-li-cont MapRed'>${obj.cleaner}</span></li>
                        <li><span class='MapTig-li-title'>风机：</span><span class='MapTig-li-cont MapRed'>${obj.fan}</span></li>
                        <li><span class='MapTig-li-title'>最新时间：</span><span class='MapTig-li-cont'>${obj.lasttime}</span></li>
                      </ul>
                    </div>
                  </div>`
          dom.innerHTML = html
          if (!dom.classList.contains('MapTigger')) dom.classList.add('MapTigger')
          // 由于绘制点多一行标题，所以需要计算偏移上方的位置
          // 默认API是4个方向，这里需求的是2个方面，分别正上和下
          let pit = [0, 0]
          let domW = dom.clientWidth
          let domH = dom.clientHeight
          pit[0] = point[0] + domW * 0.58 - domW
          pit[1] = point[1] - 65 - domH
          return pit
        }
      },
      chartEvents: {},
      clickChange: false // 点击设备点居中且重新设置tooltip的位置
    }
  },
  methods: {
    /**
     * 获得地图数据
     * @param {String} equNo - 搜索设备号，默认不传
     */
    getMapData ({ equNo = '' } = {}) {
      let params = { equNo }
      api.monitordatalistQuery(params).then(res => {
        if (res.ack === 1) {
          this.chartSeries.data = res.data.map(data => {
            return [data.longitude, data.latitude, data]
          })
        } else {
          this.$toast({
            message: '数据加载异常'
          })
        }
      })
    },
    /**
     * 获取地图数据，重新地图默认显示位置
     */
    bampAfterConfig (echarts) {
      if (this.chartSeries.data.length) {
        this.$nextTick(() => {
          if (echarts.getModel().getComponent('bmap') && echarts.getModel().getComponent('bmap').getBMap()) {
            let bmap = echarts.getModel().getComponent('bmap').getBMap()
            bmap.setCenter(new window.BMap.Point(this.chartSeries.data[0][0], this.chartSeries.data[0][1]))
          }
        })
      }
    },
    bmapReadyOnce () {
      this.$once('hook:mounted', () => {
        setTimeout(() => {
          try {
            this.$refs.bmap.$el.querySelector('canvas').addEventListener('touchstart', () => {
              this.$parent.$refs.search.blur()
            })
          } catch (e) { }
        }, 3000)
      })
    },
    // 点击位移到屏幕中间
    bmapClick () {
      let that = this
      this.chartEvents = {
        click (e) {
          let bmap = that.$refs.bmap.echarts.getModel().getComponent('bmap').getBMap()
          bmap.setCenter(new window.BMap.Point(e.data[0], e.data[1]))
          that.$nextTick(() => {
            that.clickChange = true
          })
        },
        // 渲染结束时处理
        finished () {
          if (that.clickChange) {
            that.clickChange = false
            const [clW, clH] = [that.$refs.bmap.$el.clientWidth, that.$refs.bmap.$el.clientHeight]
            let dom = document.querySelector('.MapTigger')
            let pit = [0, 0]
            let domW = dom.clientWidth
            let domH = dom.clientHeight
            pit[0] = (clW / 2) + domW * 0.58 - domW
            pit[1] = (clH / 2) - 65 - domH
            dom.style.left = pit[0] + 'px'
            dom.style.top = pit[1] + 'px'
          }
        }
      }
    }
  },
  watch: {
    /**
     * 监听search和搜索事件
     */
    trigger (nd, od) {
      if (nd) {
        // 搜索设备号
        this.getMapData({ equNo: this.search })
        // 改变搜索事件为false
        this.$emit('update:trigger', false)
      }
    }
  },
  created () {
    this.getMapData()
    this.bmapClick()
  },
  beforeDestroy () {
    this.$refs.bmap.clean()
  }
}
</script>

<style lang="scss" scoped>
.mapHome {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>

<style>
.MapTigger {
  padding: 0 !important;
  width: auto;
  min-width: 490px;
  height: auto;
  text-align: left;
  box-shadow: 0px 0px 5px 5px rgba(0, 0, 0, 0.2);
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}
.MapTigger::after {
  position: absolute;
  content: '';
  left: 190px;
  bottom: -15px;
  width: 0;
  height: 0;
  z-index: 1;
  border-style: solid;
  border-top-width: 27px;
  border-right-width: 27px;
  border-left-width: 20px;
  border-right-width: 20px;
  border-color: #fff #fff #fff #fff;
  transform: rotate(135deg);
  box-shadow: 5px -5px 5px rgba(0, 0, 0, 0.2);
}
.MapTig-title {
  position: relative;
  padding-left: 26px;
  height: 55px;
  background: #f2f2f2;
  font-size: 28px;
  color: #444;
  line-height: 55px;
  font-weight: bold;
  border-bottom: 1px solid #e1e1e1;
}
.MapTig-cont {
  position: relative;
  padding-left: 26px;
  background: #fff;
  font-size: 24px;
  color: #666;
  z-index: 10;
}
.MapTig-cont ul {
  display: flex;
  flex-direction: column;
}
.MapTig-cont ul li {
  display: flex;
}
.MapTig-li-title {
  width: 140px;
  margin-right: 23px;
  text-align: justify;
  text-align-last: justify;
}
.MapTig-li-cont {
  flex-grow: 1;
}
.MapTig-cont .MapRed {
  color: #fe0000;
}
</style>
