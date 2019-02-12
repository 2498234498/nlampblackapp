<template>
  <transition :name="fade">
    <div class="monitor-select" v-show="isShow" :class="fade === 'fadeShow' ? 'show' : ''">
      <div class="select-con">
        <div class="select">
          <span>设备号:</span>
          <input class="inp" type="text" v-model="datas.devNo" @keyup.13="submit()" ref="input1">
        </div>
        <div class="select">
          <span>街道:</span>
          <custom-select name="street" :list="datas.street.selectList" :val.sync="datas.street.value" :index="datas.street.index"></custom-select>
        </div>
      </div>
      <div class="select-con">
        <div class="select">
          <span>监控名称:</span>
          <input class="inp" type="text" v-model="datas.pointName" @keyup.13="submit()" ref="input2">
        </div>
        <div class="select">
          <span>区域:</span>
          <custom-select name="area" :list="datas.area.selectList" :val.sync="datas.area.value" :index="datas.area.index"></custom-select>
        </div>
      </div>
      <div class="select-con">
        <div class="select last-sel">
          <button @click="initializeData('except-array')" class="reset-btn click-active">重置</button>
        </div>
        <div class="select last-sel">
          <button @click="submit" class="click-active">查询</button>
        </div>
      </div>
      <div class="bgline"></div>
    </div>
  </transition>
</template>
<script>
import customSelect from '@/components/CustomSelectMap.vue'
import api from 'api'
export default {
  components: { customSelect },
  props: {
    params: {
      type: Object
    },
    isShow: {
      type: Boolean
    },
    isReset: { // 是否重置数据，配合keep-alive
      type: Boolean,
      default: false
    },
    fade: { // 区分.bgline是否显示,fadeShow,fadeHide
      type: String,
      default: 'fade'
    }
  },
  data () {
    return {
      datas: {
        area: {
          value: {
            areaName: '全部',
            areaId: ''
          },
          selectList: [],
          index: 'areaName'
        },
        street: {
          value: {
            streetName: '全部',
            streetId: ''
          },
          selectList: [],
          index: 'streetName'
        },
        pointName: '',
        devNo: ''
      },
      homeParams: {} // 父组件的参数
    }
  },
  methods: {
    /**
     * 区域数据查询，街道数据查询
     */
    getOtherScreenData () {
      this.$axios.all([
        api.districtsQuery(), // 区域查询
        api.streetQuery() // 街道查询
      ])
        .then(this.$axios.spread((...res) => {
          let calls = [
            (res) => {
              if (res.ack === 1) {
                res.data.unshift({
                  areaName: '全部'
                })
                this.datas.area.selectList = res.data
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
                this.datas.street.selectList = res.data
              } else {
                this.$toast({
                  message: '数据加载异常'
                })
              }
            }
          ]
          res.forEach((r, key) => { calls[key](r) })
        }))
    },
    submit () {
      this.$emit('monitor', this.homeParams)
    },
    initializeData (status) {
      this.datas.area.value = {
        areaName: '全部',
        areaId: ''
      }
      if (!status) {
        this.datas.area.selectList = []
        this.datas.street.selectList = []
      }
      this.datas.street.value = {
        streetName: '全部',
        streetId: ''
      }
      this.datas.pointName = ''
      this.datas.devNo = ''
      this.params.companyName = ''
    }
  },
  created () {
    // this.getOtherScreenData()
  },
  watch: {
    datas: {
      deep: true,
      handler (nd, od) {
        this.homeParams = Object.assign(this.params, {
          areaId: this.datas.area.value.areaId,
          streetId: this.datas.street.value.streetId,
          pointName: this.datas.pointName,
          devNo: this.datas.devNo
        })
        this.$emit('update:params', this.homeParams)
      }
    },
    /**
     * 判断isReset是否要重置
     */
    isReset: {
      immediate: true,
      handler (nd, od) {
        if (nd) {
          this.initializeData()
          this.getOtherScreenData()
          this.$emit('update:isReset', false)
        }
      }
    },
    isShow: {
      handler (curVal, oldVal) {
        if (!curVal) {
          this.$nextTick(() => {
            this.$refs.input1.blur()
            this.$refs.input2.blur()
          })
        }
      }
    }
  }
}
</script>
<style lang='scss' scoped>
.fadeShow-enter-active,
.fadeShow-leave-active {
  transition: height 0.35s cubic-bezier(0.075, 0.82, 0.165, 1);
  overflow: hidden;
}
.fadeShow-enter,
.fadeShow-leave-to {
  height: 0;
}
.fadeShow-enter-to,
.fadeShow-leave {
  height: 250px;
}
.fadeHide-enter-active,
.fadeHide-leave-active {
  transition: height 0.35s cubic-bezier(0.075, 0.82, 0.165, 1);
  overflow: hidden;
}
.fadeHide-enter,
.fadeHide-leave-to {
  height: 0;
}
.fadeHide-enter-to,
.fadeHide-leave {
  height: 230px;
}
.monitor-select {
  position: relative;
  z-index: 10;
  transform: translate3d(0,0,0);
  &::before {
    content: '';
    width: 100%;
    height: 20px;
    display: block;
  }
  &.show::after {
    content: '';
    width: 100%;
    height: 20px;
    background-color: #f0f0f0;
    display: block;
  }
  .select-con {
    margin-top: 20px;
    display: flex;
    &:first-child {
      margin-top: 0;
    }
    .select {
      flex: 1;
      position: relative;
      height: 50px;
      span {
        position: absolute;
        left: 32px;
        height: 50px;
        line-height: 50px;
        font-size: 26px;
      }
      .inp {
        position: absolute;
        width: 202px;
        height: 50px;
        left: 160px;
        border: 1px solid #e6e6e6; /*no*/
        text-indent: 10px;
        color: #333;
        border-radius: 10px;
      }
      button {
        margin-right: 32px;
        width: 202px;
        height: 50px;
        border-radius: 10px;
        background-color: #427fdc;
        color: #fff;
        outline: none;
      }
      .reset-btn {
        margin-right: 14px;
        background-color: #269abc;
      }
      .custom-select {
        margin-left: 140px;
      }
    }
    .select.last-sel {
      text-align: right;
    }
  }
  .bgline {
    height: 20px;
  }
}
</style>
