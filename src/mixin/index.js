// 上级路由缓存的跳转下一级路由
const routeCacheNextName = ['RealTimeData', 'HistoricalData', 'AbnormalData', 'RealTimeData', 'StandardDetails', 'AttendanceDetails', 'MonitoringData']
const mixin = {
  beforeRouteEnter (to, from, next) {
    if (to.meta.keepAlive && routeCacheNextName.includes(from.name)) {
      to.meta.isUseCache = true
    } else {
      to.meta.isUseCache = false
    }
    next()
  },
  beforeRouteLeave (to, from, next) {
    if (from.meta.keepAlive && !routeCacheNextName.includes(to.name)) {
      // 退出时，销毁已缓存的页面，释放内存
      if (this.$vnode && this.$vnode.data.keepAlive) {
        if (this.$vnode.parent && this.$vnode.parent.componentInstance && this.$vnode.parent.componentInstance.cache) {
          if (this.$vnode.componentOptions) {
            let key = this.$vnode.key == null
              ? this.$vnode.componentOptions.Ctor.cid + (this.$vnode.componentOptions.tag ? `::${this.$vnode.componentOptions.tag}` : '')
              : this.$vnode.key
            let cache = this.$vnode.parent.componentInstance.cache
            let keys = this.$vnode.parent.componentInstance.keys
            if (cache[key]) {
              if (keys.length) {
                var index = keys.indexOf(key)
                if (index > -1) {
                  keys.splice(index, 1)
                }
              }
              delete cache[key]
            }
          }
        }
      }
      this.$destroy()
    }
    next()
  },
  methods: {
    // 解决IOS下拉/上拉触发子元素事件
    $_loadmore (e) {
      e.target.classList.add('needsclick')
      // https://github.com/ElemeFE/mint-ui/issues/120
    }
  }
}

export default mixin
