<template>
  <div class="custom-select" @click="is=!is">
    <span class="value">{{ val }}</span>
    <img class="icon-arrow" :class="is ? '' : 'select'" src="@/assets/img/customSelect/arrow.png" alt="">
    <input type="text" class="hidden" readonly @focus="is=true" ref="hidden" @blur="selectBlur()">
    <transition name="fade">
      <ul v-show="is" @touchmove.stop>
        <li v-for="(item, key) in list" :key="key" @click="$emit('update:val', item)">{{ item }}</li>
      </ul>
    </transition>
  </div>
</template>

<script>
// 使用方法 <customSelect :val.sync="areaSelect" :list="area"></customSelect>
export default {
  props: {
    val: {
      type: [String, Number],
      default: 0
    },
    list: {
      type: Array,
      default () {
        return []
      }
    }
  },
  data () {
    return {
      is: false
    }
  },
  methods: {
    selectBlur () {
      setTimeout(() => {
        this.is = false
      }, 0)
    }
  },
  watch: {
    is (nd, od) {
      if (nd === true) {
        setTimeout(() => {
          this.$refs.hidden.focus()
        }, 0)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s;
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
  position: relative;
  border-radius: 10px;
  .value{
    font-size: 26px;
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
    left: 0;
    li {
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
