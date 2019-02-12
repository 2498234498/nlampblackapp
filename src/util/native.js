/* eslint-disable */
/**
 * 初始化原生APP事件，区分Android和IOS，只需在main.js里面引用一次即可
 * Android
 * IOS
 */
import {
  equipment
} from 'util'
import router from '@/router'

/**
 * 通用类，兼容安卓和苹果两端
 */
class Common {
  constructor () {
    // this.test()
  }
}

/**
 * 安卓原生事件
 * @class Android
 */
class Android extends Common {
  constructor () {
    super()
    this.routeTopName = ['Guide', 'Login', 'Home', 'Map', 'Monitor', 'Data', 'Settings'] // 顶级路由名称，route.name

    this.onBack()
    // this.debug()
  }

  /**
   * 监听物理返回键，非首页返回上一页，首页则默认
   */
  onBack () {
    let webview = plus.webview.currentWebview()
    plus.key.addEventListener('backbutton', () => {
      webview.canBack((e) => {
        if (!this.routeTopName.includes(router.app.$route.name)) {
          // 返回上一页
          router.goBack()
        } else {
          // 退出APP
          plus.runtime.quit()
        }
      })
    }, false)
  }

  /**
   * 安卓debug调试，生产环境可不开启
   */
  debug () {
    var webView = plus.android.importClass("android.webkit.WebView")
    webView.setWebContentsDebuggingEnabled(true)
  }
}

/**
 * 苹果原生事件
 * @class IOS
 */
class IOS extends Common {
  constructor () {
    super()
    console.log('IOS')
  }
}

// 等待自带的native初始化后再调用相对应的事件
let native = new Promise((resolve, reject) => {
  document.addEventListener('plusready', () => {
    switch (equipment()) {
      case 'Android':
        resolve(new Android())
        break
      case 'IOS':
        resolve(new IOS())
        break
      default:
        resolve(() => {
          console.log(equipment())
        })
        break
    }
  }, false)
})

export default native
