<template>
  <div class="monitor-home" ref="box">
    <div class="header-con">
      <mt-header fixed title="监控点" class="header"></mt-header>
      <p @click="refresh" class="back-icon" v-show="isShow">
        <img src="../../assets/img/monitor/left-icon.png" alt="">
      </p>
    </div>
    <transition name="fade">
      <div class="exhibition" v-show="!isShow">
        <h1>餐饮油烟在线监控</h1>
        <div class="amount">
          <span v-for="(val, index) in totAll" :key="index">{{val}}</span>
        </div>
        <p>接入监控点总数</p>
      </div>
    </transition>
    <div class="contain" ref="contain" @scroll.passive="$refs.search.blur()" @touchstart="$_loadmore($event)">
      <mt-loadmore class="loadmore" :top-method="loadTop" :auto-fill="false" :bottom-method="loadBottom" :bottom-all-loaded="allLoaded" @top-status-change="handleTopChange" ref="loadmore">
        <div class="home-con">
          <div class="home-opt">
            <div class="left">
              <div class="search">
                <form action="javascript:;">
                  <input type="search" placeholder="请输入您要查询的公司名称" v-model="params.companyName" @keyup.enter="enter()" ref="search">
                </form>
                <i class="serach-icon"></i>
              </div>
            </div>
            <div class="select click-active" @click="isShow=!isShow">
              <span>筛选</span>
              <i class="select-icon"></i>
            </div>
          </div>
          <monitor-select fade="fadeShow" :isShow.sync="isShow" :params.sync="params" @monitor="query" :isReset.sync="isReset"></monitor-select>
          <div v-for="(item,key) in data" :key="key">
            <div class="content">
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
              <div class="row">
                <span>详情:</span>
                <span>
                  <a class="goto" @click="goto(item.devNo)" href="javascript:;">点击查看 ></a>
                </span>
              </div>
            </div>
          </div>
          <div v-if="data.length==1?true:false" class="box1"></div>
          <div class="noDada" v-show="!data.length">
            <img src="@/assets/img/data/noData.png" alt="">
            <span>暂无数据</span>
          </div>
        </div>
      </mt-loadmore>
    </div>
  </div>
</template>
<script>
import api from 'api'
export default {
  name: 'Monitor',
  components: {
    MonitorSelect: resolve => require(['./MonitorSelect'], resolve)
  },
  data () {
    return {
      isShow: false,
      totAll: ['0', '0', '0', '0'],
      allLoaded: true, // 判断全部加载完成，false为没有，true加载完
      topStatus: false,
      params: {
        companyName: ''
      },
      index: 0,
      pageTotal: 50,
      isReset: true, // 初始化monitor-select条件
      data: []
    }
  },
  methods: {
    goto (devNo) {
      this.$store.commit('setScrollTop', this.$refs.contain.scrollTop)
      this.$router.push({ path: '/data/MonitoringData/' + devNo })
    },
    refresh () {
      this.isShow = false
      this.isReset = true
    },
    /**
     * @param {String} action - next就是index++,不传就是index=0
     * query 里面已经把参数加入
     */
    query (action) {
      return new Promise((resolve, reject) => {
        let _index = this.index
        if (action === 'next') {
          _index = this.index + 1
        } else {
          _index = this.index = 0
        }
        let params = this.params
        params = Object.assign(params, { index: _index })
        api.monitorpointQuery(params)
          .then(res => {
            if (res.ack === 1) {
              if (action === 'next') {
                this.data = this.data.concat(res.data)
                this.index = _index
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
     * 回车搜索
     */
    enter () {
      this.query().then(() => {
        this.$nextTick(() => {
          this.$refs.search.blur()
        })
      })
    },
    /**
     * 初始化数据
     */
    initializeData () {
      // console.log('待初始化')
    }
  },
  created () {
    let _this = this
    api.diningLampbQuery()
      .then(res => {
        if (res.ack === 1) {
          let totall = res.totall.toString()
          let len = _this.totAll.length
          for (let i = 0; i < totall.length; i++) {
            _this.$set(_this.totAll, len - 1 - i, totall[totall.length - 1 - i])
          }
        } else {
          this.$toast({
            message: '数据加载异常'
          })
        }
      })
  },
  activated () {
    // console.log(this.$route.meta.isUseCache)
    if (this.$route.meta.isUseCache) {
      // 设置页面滚动位置
      this.query().then(() => {
        this.$refs.contain.scrollTop = this.$store.state.scroll.pageYOffset
      })
    } else {
      // 滚动到最顶，数据初始化
      this.$refs.contain.scrollTop = 0
      this.initializeData()
      this.query() // 这是我们获取数据的函数
    }
  }
}
</script>
<style lang='scss' scoped>
@font-face {
  font-family: 'led';
  src: url('../../assets/UnidreamLED.ttf');
  font-weight: normal;
  font-style: normal;
}
.fade-enter-active, .fade-leave-active {
  height: 372px;
  transition: height .35s cubic-bezier(0.075, 0.82, 0.165, 1);
}
.fade-enter, .fade-leave-to {
  height: 0px;
}
.monitor-home {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding-top: $headerHei;
  .header-con {
    position: relative;
    .header {
      height: $headerHei;
      background-color: #4180dc;
      font-weight: normal;
      display: flex;
      align-items: center;
    }
    .back-icon {
      position: absolute;
      z-index: 999;
      left: 0;
      bottom: 16px;
      width: 50px;
      height: 52px;
      padding-left: 20px;
      padding-top: 9px;
      img {
        width: 19px;
        height: 33px;
      }
    }
  }
  .exhibition {
    max-height: 372px;
    background: url('../../assets/img/monitor/monitorBG.png') no-repeat;
    background-size: cover;
    margin-top: -1px; /*no*/
    h1 {
      margin-top: 42px;
      font-size: 40px;
      color: #fff;
      text-align: center;
    }
    .amount {
      margin-top: 50px;
      span {
        margin-left: 26px;
        width: 84px;
        height: 115px;
        line-height: 115px;
        text-align: center;
        color: #fff;
        font-size: 84px;
        font-family: led;
        display: inline-block;
        background-color: rgba(255, 255, 255, 0.2);
      }
    }
    p {
      margin-top: 30px;
      margin-bottom: 42px;
      font-size: 38px;
      color: #eee;
    }
  }
  .contain {
    padding-top: 23px;
    // flex-grow: 1;
    height: 100%;
    padding-bottom: $footerHei;
    overflow: scroll;
    .box1 {
      height: 240px;
      background: #fff;
    }
  }
  .home-con {
    .home-opt {
      display: flex;
      .left {
        flex: 1;
        .search {
          margin-left: 36px;
          position: relative;
          width: 536px;
          input {
            position: absolute;
            left: 0;
            top: 0;
            width: 536px;
            height: 68px;
            border-radius: 10px;
            background-color: #eee;
            text-indent: 60px;
            color: #333;
            font-size: 32px;
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
    .content {
      padding: 0 58px;
      text-align: left;
      // height: 254px;
      border-bottom: 1px solid #ebebeb;
      h3 {
        margin-top: 27px;
        font-size: 28px;
        letter-spacing: 2px;
        color: #000;
      }
      .row {
        margin-top: 24px;
        display: flex;
        span {
          flex: 1;
          font-size: 26px;
          padding-left: 30px;
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
        &:last-child {
          margin-bottom: 20px;
        }
      }
    }
  }
  .noDada {
    width: 100%;
    height: 300px;
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
