<template>
  <div class="monitor-home" ref="box">
    <mt-header fixed :title="title" class="header">
      <a @click="$router.goBack()" slot="left">
        <mt-button icon="back"></mt-button>
      </a>
    </mt-header>
    <div class="loadmoreBox" ref="monitorList" @scroll.passive="$refs.search.blur()"  @touchstart="$_loadmore($event)">
      <mt-loadmore class="loadmore" :top-method="loadTop" :auto-fill="false" :bottom-method="loadBottom" :bottom-all-loaded="allLoaded" @top-status-change="handleTopChange" ref="loadmore">
        <div class="home-con">
          <div class="home-opt">
            <div class="left">
              <div class="search">
                <form action="javascript:;">
                  <input type="search" v-model="params.companyName" placeholder="请输入您要查询的公司名称" @keyup.enter="enter()" ref="search">
                </form>
                <i class="serach-icon"></i>
              </div>
            </div>
            <div class="select click-active" @click="isShow=!isShow">
              <span>筛选</span>
              <i class="select-icon"></i>
            </div>
          </div>
          <monitor-select fade="fadeHide" :isShow.sync="isShow" :params.sync="params" @monitor="monitorpointQuery" :isReset.sync="isReset"></monitor-select>
          <div class="box"></div>
          <div v-for="(item, key) in monitorpointData" :key="key" class="content" @click="getPageHeight(item.devNo)">
            <h3>{{item.monitorpoint}}</h3>
            <div class="row">
              <div class="company">
                  <span>公司:</span>
                  <span>{{item.company}}</span>
                </div>
                <div class="company">
                  <span>区域:</span>
                  <span>{{item.district}}</span>
                </div>
              </div>
              <div class="row">
                <div class="company">
                  <span>菜系:</span>
                  <span>{{item.style}}</span>
                </div>
                <div class="company">
                  <span>街道:</span>
                  <span>{{item.street}}</span>
                </div>
              </div>
              <div class="row">
                <div class="company">
                  <span>设备号:</span>
                  <span>{{item.devNo}}</span>
                </div>
                <div class="company">
                  <span>状态:</span>
                  <span><i :class="item.usestate=='正常'?'normal':'malfunction'">{{item.usestate}}</i></span>
                </div>
              </div>
          </div>
          <div v-if="monitorpointData.length==1?true:false" class="box1"> </div>
        </div>
        <div class="noDada" v-show="!monitorpointData.length">
          <img src="@/assets/img/data/noData.png" alt="">
          <span>暂无数据</span>
        </div>
      </mt-loadmore>
    </div>
  </div>
</template>
<script>
import api from 'api'
export default {
  name: 'MonitorList',
  data () {
    return {
      isShow: false,
      title: '',
      path: '',
      isReset: false,
      monitorpointData: [],
      pathData: ['realTimeData', 'HistoricalData', 'AbnormalData'],
      titleArr: ['实时数据-监控点', '历史数据-监控点', '异常数据-监控点'],
      pageTotal: 50, // 每页50条
      index: 0,
      params: {
        companyName: ''
      },
      topStatus: false,
      allLoaded: true // 判断全部加载完成，false为没有，true加载完
    }
  },
  methods: {
    getPageHeight (devNo) {
      let path = this.pathData[this.$route.params.type]
      this.$store.commit('setScrollTop', this.$refs.monitorList.scrollTop)
      this.$router.push({ path: '/data/' + path + '/' + devNo })
    },
    /**
     * 监控点列表查询
     * @param {Object} params - 接口数据
     * @param {String} action - 执行动作区分，默认不执行
     */
    monitorpointQuery (action) {
      return new Promise((resolve, reject) => {
        let _index
        if (action === 'next') {
          _index = this.index + 1
        } else {
          _index = this.index = 0
        }
        let params = this.params
        params = Object.assign(params, {
          index: _index
        })
        api.monitorpointQuery(params)
          .then(res => {
            if (res.ack === 1) {
              // this.monitorpointData = res.data
              if (action === 'next') {
                this.monitorpointData = this.monitorpointData.concat(res.data)
                this.index++
              } else {
                this.monitorpointData = res.data
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
      this.monitorpointQuery().then(() => { this.$refs.loadmore.onTopLoaded() })
    },
    /**
     * 上拉加载 下一页
     */
    loadBottom () {
      this.monitorpointQuery('next').then(() => { this.$refs.loadmore.onBottomLoaded() })
    },
    /**
     * 回车搜索
     */
    enter () {
      this.monitorpointQuery().then(() => {
        this.$nextTick(() => {
          this.$refs.search.blur()
        })
      })
    },
    initData () {
      this.isShow = false
      this.path = ''
      this.isReset = true
      this.monitorpointData = []
      this.params = {
        companyName: ''
      }
      this.index = 0
      this.topStatus = false
      this.allLoaded = true
      this.title = this.titleArr[this.$route.params.type]
    }
  },
  components: {
    MonitorSelect: resolve => require(['../Monitor/MonitorSelect'], resolve)
  },
  activated () {
    // 设置页面滚动位置
    let isFrom = this.$route.meta.isUseCache
    if (isFrom) {
      this.$refs.monitorList.scrollTop = this.$store.state.scroll.pageYOffset
    } else {
      // 滚动到最顶，数据初始化
      this.$refs.monitorList.scrollTop = 0
      this.initData()
      this.monitorpointQuery()
    }
  }
}
</script>
<style lang='scss' scoped>
.monitor-home {
  background: #eee;
  height: 100%;
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
    .home-con {
      padding-top: 23px;
      background: #fff;
      .box {
        width: 100%;
        height: 20px;
        background: #eee;
      }
      .home-opt {
        display: flex;
        height: 80px;
        .left {
          flex: 1;
          .search {
            margin-left: 36px;
            position: relative;
            width: 100%;
            input {
              position: absolute;
              left: 0;
              top: 0;
              width: 536px;
              height: 68px;
              border-radius: 10px;
              background-color: #eee;
              text-indent: 60px;
              line-height: 68px;
              color: #333;
              font-size: 32px;
              width: 100%;
            }
            .serach-icon {
              position: absolute;
              left: 10px;
              top: 16px;
              width: 36px;
              height: 36px;
              background: url('../../assets/img/monitor/search.png') no-repeat;
              background-size: cover;
            }
          }
        }
        .select {
          height: 67px;
          line-height: 67px;
          width: 158px;
          font-size: 34px;
          margin-left: 60px;
          span {
            color: #5d5d5d;
            font-size: 32px;
          }
          .select-icon {
            vertical-align: middle;
            display: inline-block;
            width: 30px;
            height: 32px;
            background: url('../../assets/img/monitor/select.png') no-repeat;
            background-size: cover;
          }
        }
      }
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
            text-align: center;
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
      .content {
        padding: 27px 58px;
        text-align: left;
        min-height: 212px;
        border-bottom: 1px solid #ebebeb;
        transition: background 0.15s;
        &:active {
          background-color: rgba(0, 0, 0, 0.05);
        }
        h3 {
          font-size: 28px;
          letter-spacing: 2px;
          color: #000;
        }
        .row {
          margin-top: 20px;
          display: flex;
          span {
            flex: 1;
            font-size: 28px;
            padding-left: 36px;
            color: #5d5d5d;
            i {
              font-style: normal;
            }
          }
          .company {
            width: 50%;
          }
          .normal {
            color: #09943a !important;
          }
          .malfunction {
            color: #f80000 !important;
          }
        }
      }
      .box1 {
        height: 240px;
        background: #eee;
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
