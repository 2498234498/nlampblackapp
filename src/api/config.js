import axios from 'axios'
import apiConfig from '../../config/api.config'
import { Indicator } from 'mint-ui'
import { getCookie, loginAuto, USERINFO, setRequestToken, BASEURL, customToast } from 'util'
import router from '@/router'

// 请求头，针对各环境的判断
if (process.env.NODE_ENV === 'development') {
  axios.defaults.baseURL = apiConfig.baseUrl
} else {
  // 生产环境的后台是由用户自定义的
  // 所以在api.config.js里面配置的生产环境地址无效
  // 只需从用户定义的地址取即可 localStorage
  axios.defaults.baseURL = localStorage.getItem(BASEURL || 'baseUrl')
}

// 超时，10s
axios.defaults.timeout = 10000

// 是否有请求正在刷新token
window.isRefreshing = false
// 被挂起的请求数组
let refreshSubscribers = []
// push所有请求到数组中
let subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb)
}
// 刷新请求（refreshSubscribers数组中的请求得到新的token之后会自执行，用新的token去请求数据）
let onRrefreshed = () => {
  refreshSubscribers.map(cb => cb())
}

/**
 * 处理发送ajax请求前操作
 */
axios.interceptors.request.use(config => {
  // loading
  Indicator.open({
    text: config.$text, // 自定义提示内容
    spinnerType: 'snake'
  })
  // console.log(router)
  config = setRequestToken(config) || config

  // token是否过期，同时排除验证码接口、登录接口和测试请求
  if (!getCookie('token') && !config.url.includes('connect.action') && !config.url.includes('login.action')) {
    // 判断是否已经正在重新获取token
    if (!window.isRefreshing) {
      window.isRefreshing = true
      loginAuto()
        .then(() => {
          window.isRefreshing = false
          // 获取完token完，重新回调刚被挂起的回调函数
          onRrefreshed()
          // 回调完，清空
          refreshSubscribers = []
        })
        .catch(() => {
          customToast({
            message: 'token获取失败，请重新登录'
          })
          window.isRefreshing = false
          // 如果获取token失败，则跳到登录页，让用户手动登录
          let userInfo = JSON.parse(localStorage.getItem(USERINFO))
          delete userInfo.token
          localStorage.setItem(USERINFO, JSON.stringify(userInfo))
          // 清空回调
          refreshSubscribers = []
          router.push({name: 'Login'})
        })
    }
    let retry = new Promise((resolve, reject) => {
      /// 回调函数
      subscribeTokenRefresh(() => {
        config = setRequestToken(config) || config
        // 请求将被挂起
        resolve(config)
      })
    })
    return retry
  } else {
    return config
  }
}, err => {
  setTimeout(() => {
    Indicator.close()
  }, 0)
  customToast({
    message: '网络异常'
  })
  return Promise.reject(err)
})

/**
 * 处理接口返回时操作
 */
axios.interceptors.response.use(data => {
  setTimeout(() => {
    Indicator.close()
  }, 0)
  // 如果是测试接口，成功之后重新设置axios请求头
  if (data.config.action === 'test' && process.env.NODE_ENV === 'production') {
    axios.defaults.baseURL = data.config.baseURL
  }
  if (data.status && data.status === 200 && data.data.status === 'error') {
    customToast({
      message: '系统异常'
    })
    return
  }
  // 后台返回token过期的结果
  if (data.data.ack === '9') {
    // TODO token的过期请求，应该提示点什么
    if (!window.isRefreshing) {
      window.isRefreshing = true
      // 重新获取token，并锁住
      loginAuto()
        .then(() => {
          window.isRefreshing = false
          // 获取完token完，重新回调刚被挂起的回调函数
          onRrefreshed()
          // 回调完，清空
          refreshSubscribers = []
        })
        .catch(() => {
          customToast({
            message: 'token获取失败，请重新登录'
          })
          window.isRefreshing = false
          // 如果获取token失败，则跳到登录页，让用户手动登录
          let userInfo = JSON.parse(localStorage.getItem(USERINFO))
          delete userInfo.token
          localStorage.setItem(USERINFO, JSON.stringify(userInfo))
          // 清空回调
          refreshSubscribers = []
          router.push({name: 'Login'})
        })
    }
  } else {
    return data.data
  }
}, err => {
  setTimeout(() => {
    Indicator.close()
  }, 0)
  if (err.config && err.config.action !== 'test') {
    customToast({
      message: '网络异常'
    })
  }
  return Promise.reject(err)
})

/**
 * post请求
 * @param url
 * @param params
 * @param {String,Number} $text - 自定义提示语
 * @returns {AxiosPromise}
 */
export const postRequest = (url, params, $text) => {
  return axios({
    method: 'post',
    url: url,
    data: params,
    $text,
    transformRequest: [function (data) {
      let ret = ''
      for (let it in data) {
        ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
      }
      return ret
    }],
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

/**
 * 上传文件请求
 * @param url
 * @param params
 * @param {String,Number} $text - 自定义提示语
 * @returns {AxiosPromise}
 */
export const uploadFileRequest = (url, params, $text) => {
  return axios({
    method: 'post',
    url: url,
    data: params,
    $text,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * put请求(分片)
 * @param url
 * @param params
 * @param {String,Number} $text - 自定义提示语
 * @returns {AxiosPromise}
 */
export const putRequest = (url, params, $text) => {
  return axios({
    method: 'put',
    url: url,
    data: params,
    $text,
    transformRequest: [function (data) {
      let ret = ''
      for (let it in data) {
        ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
      }
      return ret
    }],
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

/**
 * delete请求
 * @param url
 * @param {String,Number} $text - 自定义提示语
 * @returns {AxiosPromise}
 */
export const deleteRequest = (url, $text) => {
  return axios({
    method: 'delete',
    url: url,
    $text
  })
}

/**
 * get请求
 * @param url
 * @param {String,Number} $text - 自定义提示语
 * @returns {AxiosPromise}
 */
export const getRequest = (url, params, $text) => {
  return axios({
    method: 'get',
    url: url,
    params,
    $text
  })
}

/**
 * 测试请求
 * @param {Object} params
 * @param {String} params.url - 请求地址
 * @param {String} params.params - 请求参数
 * @param {String} params.baseURL - 请求头的地址
 * @param {String} params.$text - 自定义提示内容
 */
export const getRequestTest = ({
  url = '',
  params = '',
  baseURL = '',
  $text = ''
} = {}) => {
  return axios({
    method: 'get',
    url,
    params,
    baseURL,
    $text,
    action: 'test'
  })
}

/* 调用方法
this.postRequest('/login', {
  username: this.loginForm.username,
  password: this.loginForm.password
}).then(resp=> {
  console.log(resp);
  ...
}
}); */
