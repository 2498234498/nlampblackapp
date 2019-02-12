import * as types from './types'

export default {
  state: {
    pageYOffset: 0
  },
  mutations: {
    [types.setScrollTop] (state, res) {
      state.pageYOffset = res
    }
  },
  actions: {}
}
