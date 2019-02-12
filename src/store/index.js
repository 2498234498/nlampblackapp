import Vue from 'vue'
import Vuex from 'vuex'
import scroll from './scroll'
import cache from './cache'
import transition from './transition'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {},
  getters: {},
  mutations: {},
  actions: {},
  modules: {
    scroll,
    transition,
    cache
  }
})

export default store
