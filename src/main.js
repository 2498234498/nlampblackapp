// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import mixin from './mixin'
import 'lib-flexible/flexible.js'
import Vuex from 'vuex'
import store from './store/index'
import App from './App'
import router from './router'
import Fastclick from './util/fastclick'
// 按需引入mint-ui组件
import {
  Loadmore,
  Header,
  Button,
  InfiniteScroll,
  DatetimePicker,
  Field,
  Lazyload
} from 'mint-ui'
import 'mint-ui/lib/style.css'
import './assets/css/reset.css'
import './assets/css/mint.css'
import axios from 'axios'
// 按需引入v-echarts图
import Veline from 'v-charts/lib/line.common.min'
import VeBmap from 'v-charts/lib/bmap.common.min'
import VePie from 'v-charts/lib/pie.common.min'
import VeHistogram from 'v-charts/lib/histogram.common.min'
import VueTouch from 'vue-touch'
import raf from 'raf'
[Veline, VeBmap, VePie, VeHistogram, Loadmore, Header, Button, DatetimePicker, Field].forEach(comp => {
  Vue.component(comp.name, comp)
})
Vue.use(InfiniteScroll)
Vue.use(Lazyload)
// 初始化native
require('@/util/native').default.then()
Vue.config.productionTip = false
Vue.use(Vuex)
Vue.mixin(mixin)
Vue.use(VueTouch, {name: 'v-touch'})
Fastclick.FastClick.attach(document.body)
Vue.prototype.$axios = axios
Vue.prototype.$toast = require('@/util').customToast
Vue.prototype.$raf = raf
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: {
    App
  },
  template: '<App/>'
})
