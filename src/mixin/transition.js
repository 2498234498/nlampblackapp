// 路由过渡
export default {
  beforeRouteUpdate (to, form, next) {
    let isBack = this.$store.state.transition.isBack
    if (isBack) {
      this.$store.commit('setTransitionName', 'slide-right')
    } else {
      this.$store.commit('setTransitionName', 'slide-left')
    }
    this.$store.commit('setBack', false)
    next()
  }
}
