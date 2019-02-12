<template>
  <div class="custom-select" @click="is=!is">
    <span class="value">{{ val[index] }}</span>
    <img class="icon-arrow" :class="is ? '' : 'select'" src="@/assets/img/customSelect/arrow.png" alt="">
    <input type="text" class="hidden" readonly @focus="is=true" ref="hidden" @blur="selectBlur()">
    <transition name="fade">
      <ul v-show="is" @touchmove.stop>
        <li v-for="(item, key) in list" :key="key" @click="$emit('update:val', item)">{{ item[index] }}</li>
      </ul>
    </transition>
  </div>
</template>

<script>
// 使用方法 <custom-select name="street" :list="street.selectList" :val.sync="street.value" :index="street.index"></custom-select>
export default {
  props: {
    val: {
      type: Object,
      default () {
        return {
          areaName: ''
        }
      }
    },
    list: {
      type: Array,
      default () {
        return []
      }
    },
    index: { // 要显示的下表，根据接口文档来
      type: String,
      default: ''
    }
  },
  data () {
    return {
      is: false
    }
  },
  methods: {
    selectBlur () {
      this.$nextTick(() => {
        this.is = false
      })
    }
  },
  watch: {
    is (nd, od) {
      if (nd === true) {
        this.$nextTick(() => {
          this.$refs.hidden.focus()
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave {
  opacity: 1;
}
.custom-select {
  width: 202px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  font-size: 28px;
  border: 1px solid #e6e6e6; /*no*/
  border-radius: 10px;
  position: relative;
  border-radius: 10px;
  .value{
    width: 150px;
    display: inline-block;
    font-size: 26px;
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
  }
  .hidden {
    width: 1px;
    height: 1px;
    opacity: 0;
    position: absolute;
    left: -9999px;
    top: -9999px;
  }
  .icon-arrow {
    position: absolute;
    width: 18px;
    height: 10px;
    line-height: 100%;
    right: 18px;
    top: 20px;
    transform: rotate(180deg);
    transition: transform 0.1s;
    &.select {
      transform: rotate(0deg);
    }
  }
  ul {
    width: 100%;
    max-height: 400px;
    overflow-y: auto;
    position: absolute;
    z-index: 10;
    top: 46px;
    li {
      min-height: 50px;
      line-height: 50px;
      border-width: 1px; /*no*/
      border-style: solid;
      border-color: #e6e6e6;
      background-color: #fff;
      border-bottom-width: 0;
      font-size: 26px;
      &:first-child {
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
      }
      &:last-child {
        border-bottom-width: 1px; /*no*/
        border-bottom-left-radius: 10px;
        border-bottom-right-radius: 10px;
      }
    }
  }
}
</style>
