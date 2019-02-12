import * as types from './types'

export default {
  state: {
    cacheRouteArr: []
  },
  mutations: {
    [types.setCache] (state, res) {
      if (!state.cacheRouteArr.includes(res)) {
        state.cacheRouteArr.push(res)
      }
    }
  },
  actions: {}
}
