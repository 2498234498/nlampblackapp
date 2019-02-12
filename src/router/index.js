import Vue from 'vue'
import Router from 'vue-router'
import { BASEURL, USERINFO } from 'util'
import store from '@/store'
const Main = () => import(/* webpackChunkName: "Main" */ '@/modules/Main')
// 登录
const Login = () => import(/* webpackChunkName: "Login" */ '@/modules/Login')
// 引导
const Guide = () => import(/* webpackChunkName: "guide" */ '@/modules/Guide')
// 首页
const Home = () => import(/* webpackChunkName: "Home" */ '@/modules/Home')
const HomeHome = () => import(/* webpackChunkName: "Home" */ '@/modules/Home/Home')
// 地图
const Map = () => import(/* webpackChunkName: "Map" */ '@/modules/Map')
const MapHome = () => import(/* webpackChunkName: "Map" */ '@/modules/Map/MapHome')
const MapData = () => import(/* webpackChunkName: "Map" */ '@/modules/Map/MapData')
const MapInfo = () => import(/* webpackChunkName: "Map" */ '@/modules/Map/MapInfo')
// 监控点
const Monitor = () => import(/* webpackChunkName: "Monitor" */ '@/modules/Monitor')
const MonitorHome = () => import(/* webpackChunkName: "Monitor" */ '@/modules/Monitor/MonitorHome')
// 数据
const Data = () => import(/* webpackChunkName: "Data" */ '@/modules/Data')
const DataHome = () => import(/* webpackChunkName: "Data" */ '@/modules/Data/DataHome')
const OperateLog = () => import(/* webpackChunkName: "Data" */ '@/modules/Data/OperateLog')
const MonitoringData = () => import(/* webpackChunkName: "Data" */ '@/modules/Data/MonitoringData')
const Instructions = () => import(/* webpackChunkName: "Data" */ '@/modules/Data/Instructions')
const WorkRecord = () => import(/* webpackChunkName: "Data" */ '@/modules/Data/WorkRecord')
const BrokenNetworkLog = () => import(/* webpackChunkName: "Data" */ '@/modules/Data/BrokenNetworkLog')
const AbnormalData = () => import(/* webpackChunkName: "Data" */ '@/modules/Data/AbnormalData')
const StandardData = () => import(/* webpackChunkName: "Data" */ '@/modules/Data/StandardData')
const HistoricalData = () => import(/* webpackChunkName: "Data" */ '@/modules/Data/HistoricalData')
const RealTimeData = () => import(/* webpackChunkName: "Data" */ '@/modules/Data/RealTimeData')
const MonitorList = () => import(/* webpackChunkName: "Data" */ '@/modules/Data/MonitorList')
const AttendanceDetails = () => import(/* webpackChunkName: "Data" */ '@/modules/Data/AttendanceDetails')
const StandardDetails = () => import(/* webpackChunkName: "Data" */ '@/modules/Data/StandardDetails')
// 设置页面
const Settings = () => import(/* webpackChunkName: "Settings" */ '@/modules/Settings')
const SettingsHome = () => import(/* webpackChunkName: "Settings" */ '@/modules/Settings/SettingsHome')
const Feedback = () => import(/* webpackChunkName: "Settings" */ '@/modules/Settings/Feedback')
const ChangePsd = () => import(/* webpackChunkName: "Settings" */ '@/modules/Settings/ChangePsd')
const ChangeIP = () => import(/* webpackChunkName: "Settings" */ '@/modules/Settings/ChangeIP')
Vue.use(Router)

let router = new Router({
  routes: [
    {
      path: '/',
      name: 'Guide',
      component: Guide,
      meta: {
        isUseCache: false,
        keepAlive: false // 不需要缓存
      }
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: {
        isUseCache: false,
        keepAlive: false // 不需要缓存
      }
    },
    {
      path: '/main',
      component: Main,
      meta: {checkLogined: true},
      children: [
        {
          path: '',
          component: Home,
          meta: {checkLogined: true},
          children: [
            {
              path: '',
              name: 'Home',
              component: HomeHome,
              meta: {
                checkLogined: true,
                isUseCache: false,
                keepAlive: false // 不需要缓存
              }
            }
          ]
        },
        {
          path: '/map',
          component: Map,
          meta: {checkLogined: true},
          children: [
            {
              path: '',
              name: 'Map',
              meta: {
                checkLogined: true,
                isUseCache: false,
                keepAlive: false // 不需要缓存
              },
              component: MapHome
            },
            {
              path: 'mapData',
              name: 'MapData',
              meta: {
                checkLogined: true,
                isUseCache: false,
                keepAlive: false // 不需要缓存
              },
              component: MapData
            },
            {
              path: 'mapInfo',
              name: 'MapInfo',
              meta: {
                checkLogined: true,
                isUseCache: false,
                keepAlive: false // 不需要缓存
              },
              component: MapInfo
            }
          ]
        },
        {
          path: '/monitor',
          component: Monitor,
          meta: {
            checkLogined: true
          },
          children: [
            {
              path: '',
              name: 'Monitor',
              meta: {
                checkLogined: true,
                isUseCache: false,
                keepAlive: true // 需要缓存
              },
              component: MonitorHome
            }
          ]
        },
        {
          path: '/data',
          meta: {checkLogined: true},
          component: Data,
          children: [
            {
              path: '',
              name: 'Data',
              meta: {
                checkLogined: true,
                isUseCache: false,
                keepAlive: false // 不需要缓存
              },
              component: DataHome
            },
            {
              path: 'operateLog',
              name: 'OperateLog',
              meta: {
                checkLogined: true,
                isUseCache: false,
                keepAlive: false // 不需要缓存
              },
              component: OperateLog
            },
            {
              path: 'monitoringData/:devNo',
              name: 'MonitoringData',
              meta: {
                checkLogined: true,
                isUseCache: false,
                keepAlive: true // 需要缓存
              },
              component: MonitoringData
            },
            {
              path: 'instructions',
              name: 'Instructions',
              meta: {
                checkLogined: true,
                isUseCache: false,
                keepAlive: false // 不需要缓存
              },
              component: Instructions
            },
            {
              path: 'workRecord',
              name: 'WorkRecord',
              meta: {
                checkLogined: true,
                isUseCache: false,
                keepAlive: true // 需要缓存
              },
              component: WorkRecord
            },
            {
              path: 'brokenNetworkLog',
              name: 'BrokenNetworkLog',
              meta: {
                checkLogined: true,
                isUseCache: false,
                keepAlive: false // 不需要缓存
              },
              component: BrokenNetworkLog
            },
            {
              path: 'abnormalData/:id',
              name: 'AbnormalData',
              meta: {
                checkLogined: true,
                isUseCache: false,
                keepAlive: false // 不需要缓存
              },
              component: AbnormalData
            },
            {
              path: 'standardData',
              name: 'StandardData',
              meta: {
                checkLogined: true,
                isUseCache: false,
                keepAlive: true // 需要缓存
              },
              component: StandardData
            },
            {
              path: 'historicalData/:id',
              name: 'HistoricalData',
              meta: {
                checkLogined: true,
                isUseCache: false,
                keepAlive: false // 不需要缓存
              },
              component: HistoricalData
            },
            {
              path: 'monitorList/:type',
              name: 'MonitorList',
              meta: {
                checkLogined: true,
                isUseCache: false,
                keepAlive: true // 需要缓存
              },
              component: MonitorList
            },
            {
              path: 'realTimeData/:id',
              name: 'RealTimeData',
              meta: {
                checkLogined: true,
                isUseCache: false,
                keepAlive: false // 不需要缓存
              },
              component: RealTimeData
            },
            {
              path: 'attendanceDetails',
              name: 'AttendanceDetails',
              meta: {
                checkLogined: true,
                isUseCache: false,
                keepAlive: false // 不需要缓存
              },
              component: AttendanceDetails
            },
            {
              path: 'standardDetails',
              name: 'StandardDetails',
              meta: {
                checkLogined: true,
                isUseCache: false,
                keepAlive: false // 不需要缓存
              },
              component: StandardDetails
            }
          ]
        },
        {
          path: '/settings',
          component: Settings,
          meta: {checkLogined: true},
          children: [
            {
              path: '',
              name: 'Settings',
              meta: {
                checkLogined: true,
                isUseCache: false,
                keepAlive: false // 不需要缓存
              },
              component: SettingsHome
            },
            {
              path: 'feedback',
              name: 'Feedback',
              meta: {
                checkLogined: true,
                isUseCache: false,
                keepAlive: false // 不需要缓存
              },
              component: Feedback
            },
            {
              path: 'changePsd',
              name: 'ChangePsd',
              meta: {
                checkLogined: true,
                isUseCache: false,
                keepAlive: false // 不需要缓存
              },
              component: ChangePsd
            },
            {
              path: 'changeIP',
              name: 'ChangeIP',
              meta: {
                checkLogined: true,
                isUseCache: false,
                keepAlive: false // 不需要缓存
              },
              component: ChangeIP
            }
          ]
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  // 切换路由时清除还存在提示框
  document.querySelectorAll('.mint-toast').forEach(el => { el.style.display = 'none' })
  // 切换路由时清除还存在loading
  document.querySelectorAll('.mint-indicator').forEach(el => { el.style.display = 'none' })
  if (to.name === 'Guide') {
    // 引号页判断是否已经有缓存服务器地址和端口
    if (localStorage.getItem(BASEURL)) {
      next({name: 'Login'})
    } else {
      next()
    }
  } else if (to.name === 'Login' && process.env.NODE_ENV === 'production') {
    // TODO 生产环境才判断登录页，为了方便开发
    let userInfo = JSON.parse(localStorage.getItem(USERINFO))
    if (userInfo && userInfo.token) {
      next({name: 'Home'})
    } else {
      next()
    }
  } else if (to.meta.checkLogined) {
    // 根据token判断是否已经登录
    // TODO 退出登录一定清除localStorage的token
    let userInfo = JSON.parse(localStorage.getItem(USERINFO))
    if (userInfo && userInfo.token) {
      next()
    } else {
      next({name: 'Login'})
    }
  } else {
    next()
  }
})

/**
 * 配置路由过渡效果
 */
Router.prototype.goBack = function () {
  store.commit('setBack', true)
  router.back()
}
export default router
