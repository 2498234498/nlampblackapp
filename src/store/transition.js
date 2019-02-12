import * as types from './types'

export default {
  state: {
    isBack: false,
    transitionName: 'slide-left'
  },
  mutations: {
    [types.setBack] (state, res) {
      state.isBack = res
    },
    [types.setTransitionName] (state, res) {
      state.transitionName = res
    }
  },
  actions: {}
}
