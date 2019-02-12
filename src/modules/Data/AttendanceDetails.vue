<template>
  <div class="attendanceDetails" @touchstart="$_loadmore($event)">
    <mt-header fixed title="考勤详情-监控点" class="header">
      <a @click="$router.goBack()" slot="left">
        <mt-button icon="back"></mt-button>
      </a>
    </mt-header>
    <mt-loadmore class="loadmore" :top-method="loadTop" @top-status-change="handleTopChange" ref="loadmore">
      <div class="main">
        <div class="bar" v-for="(item, key) in data" :key="key">
          <p class="title">
            <span class="title-title">{{ item.companyname }}</span>
            <img class="img" src="@/assets/img/attendanceDetails/dian.png" alt="">
          </p>
          <p class="other">
            <span class="other-title">设备号:</span>
            <span class="other-cont">{{ item.pointnum }}</span>
          </p>
          <p class="other">
            <span class="other-title">人员名称:</span>
            <span class="other-cont">{{ item.username }}</span>
          </p>
          <p class="other">
            <span class="other-title">记录时间:</span>
            <span class="other-cont">{{ item.datatime }}</span>
          </p>
          <p class="other">
            <span class="other-title">验收状态:</span>
            <span class="other-cont">{{ item.state | tabStatus }}</span>
          </p>
        </div>
        <div class="noDada" v-show="!data.length">
          <img src="@/assets/img/data/noData.png" alt="">
          <span>暂无数据</span>
        </div>
      </div>
    </mt-loadmore>
  </div>
</template>

<script>
import api from 'api'
export default {
  data () {
    return {
      topStatus: false,
      data: []
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
      this.query().then(() => {
        // 关闭下拉刷新
        this.$refs.loadmore.onTopLoaded()
      })
    },
    /**
     * 查询考勤详情
     */
    query () {
      return new Promise((resolve, reject) => {
        api.attendanceQueryDetail({ id: this.$route.query.id })
          .then(res => {
            if (res.ack === 1) {
              this.data = res.data
            } else {
              this.$toast({
                message: '数据加载异常'
              })
            }
            resolve()
          })
      })
    }
  },
  filters: {
    /**
     * 验收状态格式转换
     */
    tabStatus (status) {
      const sts = ['维护开始', '维护完成', '验收完成']
      return sts[status]
    }
  },
  created () {
    this.query()
  }
}
</script>

<style lang="scss" scoped>
.attendanceDetails {
  height: 100%;
  padding-top: $headerHei;
  overflow: scroll;
  .header {
    height: $headerHei;
    background-color: #4180dc;
    font-weight: normal;
    display: flex;
    align-items: center;
    /deep/ .mintui-back {
      font-size: 32px;
    }
  }
  .loadmore {
    .main {
      height: auto;
      background: #fff;
      padding: 0 16px;
      padding-bottom: $footerHei;
      .bar {
        border: 1px solid #ececec; /*no*/
        border-radius: 10px;
        padding-top: 28px;
        text-align: left;
        margin-top: 20px;
        transition: background 0.15s;
        &:active {
          background-color: rgba(0, 0, 0, 0.1);
        }
        p {
          padding: 0 18px;
          font-size: 26px;
          display: flex;
          align-items: center;
        }
        .title {
          color: #333;
          margin-bottom: 26px;
          .img {
            width: 40px;
            height: 24px;
            margin-left: 18px;
          }
        }
        .other {
          color: #666;
          margin-bottom: 22px;
          .other-cont {
            margin-left: 18px;
            flex-grow: 1;
          }
        }
      }
      .noDada {
        width: 100%;
        min-height: 300px;
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
  }
}
</style>
