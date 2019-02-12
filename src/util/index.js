import api from 'api'
import { JSEncrypt } from 'JsEncrypt'
import { Toast } from 'mint-ui'
import router from '@/router'

/**
 * mint-ui 提示窗
 * @param {String} message - 提示内容
 * @param {String} position - Toast 的位置
 * @param {Number} duration - 持续时间（毫秒），若为 -1 则不会自动关闭
 * @param {String} className - Toast 的类名。可以为其添加样式
 */
export function customToast ({
  message = '',
  position = 'middle',
  duration = 3000,
  className = 'custom-tip'
} = {}) {
  Toast({
    message,
    position,
    duration,
    className
  })
}

/**
 * 获得cookie，兼容APP端
 * @param {String} str - 想要cookies的值
 */
export function getCookie (str) {
  // eslint-disable-next-line
  let cookie = equipment() === 'PC' ? document.cookie : (plus.navigator.getCookie('http://www.bocon.cn/') || '')
  let ck = cookie.split('; ').find(c => c.split('=')[0] === str) || ''
  ck = ck.length ? ck.split('=')[1] : ''
  return unescape(ck)
}

/**
 * 设置cookie，兼容APP端
 * @param {*} key
 * @param {*} value
 * @param {Number} expires -过期时间, 1s = 1000
 */
export function setCookie (key, value, expires = null) {
  try {
    let date = new Date()
    date.setTime(date.getTime() + expires)

    if (equipment() === 'PC') {
      document.cookie = `${key}=${escape(value)}` + ((expires === null) ? '' : `; expires=${date.toGMTString()}`) + '; path=/'
      // eslint-disable-next-line
    } else if (plus && plus.navigator) {
      // eslint-disable-next-line
      plus.navigator.setCookie('http://www.bocon.cn/', `${key}=${escape(value)}` + ((expires === null) ? '' : `; expires=${date.toGMTString()}`) + '; path=/')
    }
  } catch (e) {
    console.log(e)
  }
}

/**
 * 获取时间，带格式
 * @param {Object} params
 * @param {Number} params.timestamp - 时间戳，可传/不穿，默认为当前时间
 * @param {String} params.format - 获取的时间格式，注意中间以空格切分“日期”和“时间”
 *                               - yyyy-MM-dd HH:mm:ss
 *                               - yyyy-MM-dd
 *                               - ...自定义
 */
export function getDate ({
  timestamp = null,
  format = 'yyyy-MM-dd HH:mm:ss'
} = {}) {
  try {
    let formatDate = ''
    let date = timestamp ? new Date(timestamp) : new Date()
    let objData = {}
    objData.yyyy = date.getFullYear()
    objData.MM = addZero(date.getMonth() + 1)
    objData.dd = addZero(date.getDate())
    objData.HH = addZero(date.getHours())
    objData.mm = addZero(date.getMinutes())
    objData.ss = addZero(date.getSeconds())

    format.split(' ').forEach(time => {
      formatDate = formatDate.length ? formatDate + ' ' : formatDate
      // 匹配非英文字母
      let other = time.match(/[^A-Za-z]+/g)
      // 匹配非其他字符
      time.match(/[A-Za-z]+/g).forEach((str, key) => {
        formatDate += `${objData[str]}${other[key] || ''}`
      })
    })
    return formatDate
  } catch (e) {
    console.log(e)
  }
}

/**
 * 数字补0
 * @param {*} num
 * @param {*} len
 */
export function addZero (num, len = 2) {
  return (`0${num}`).slice(-len)
}

/**
 * 得到本月、上月、下月的起始、结束日期
 * @param {Object} params
 * @param {String} params.type - "s"代表开始,"e"代表结束，默认为"s"
 * @param {Number} params.months - 不传或0代表本月，-1代表上月，1代表下月
 * @param {String} params.format - 获取的时间格式，只支持日期格式 yyyy-MM-dd
 */
export function getMonth ({
  type = 's',
  months = 0,
  format = 'yyyy-MM-dd'
} = {}) {
  var d = new Date()
  let objData = {
    yyyy: d.getFullYear(),
    MM: d.getMonth() + 1,
    dd: '01'
  }
  if (Math.abs(months) > 12) {
    months = months % 12
  }
  if (months !== 0) {
    if (objData.MM + months > 12) {
      objData.yyyy++
      objData.MM = (objData.MM + months) % 12
    } else if (objData.MM + months < 1) {
      objData.yyyy--
      objData.MM = 12 + objData.MM + months
    } else {
      objData.MM = objData.MM + months
    }
  }
  objData.MM = addZero(objData.MM)
  let firstDD = '01'
  if (['01', '03', '05', '07', '08', '10', '12'].includes(objData.MM)) {
    objData.dd = 31
  } else if (objData.MM === '02') {
    if ((objData.yyyy % 4 === 0 && objData.yyyy % 100 !== 0) || (objData.yyyy % 100 === 0 && objData.yyyy % 400 === 0)) {
      objData.dd = 29
    } else {
      objData.dd = 28
    }
  } else {
    objData.dd = 30
  }
  let day = ''
  // 匹配非英文字母
  let other = format.match(/[^A-Za-z]+/g)
  // 匹配非其他字符
  format.match(/[A-Za-z]+/g).forEach((m, k) => {
    if (m === 'dd') {
      type === 's'
        ? (day += `${firstDD}${other[k] || ''}`)
        : (day += `${objData[m]}${other[k] || ''}`)
    } else {
      day += `${objData[m]}${other[k] || ''}`
    }
  })
  return day
}

// 生产环境自定义后台地址的key，存于localStorage
export const BASEURL = 'baseUrl'
// 登录存用户信息的key，存于localStorage
export const USERINFO = 'userInfo'

/**
 * 登录成功回调
 */
export function loginSucceed (params) {
  // 对token进行RSA算法加密
  let encryptor = new JSEncrypt()
  encryptor.setPublicKey(params.publicKey)
  params.token = encryptor.encrypt(params.token)
  params.ack && delete params.ack
  let userInfo = JSON.parse(localStorage.getItem(USERINFO))
  userInfo && userInfo.rememberPassword !== null && params.rememberPassword === undefined && (params['rememberPassword'] = userInfo.rememberPassword)
  localStorage.setItem(USERINFO, JSON.stringify(params))
  // 设置跟后台约定好的过期的时间，30分钟 === 30 * 60 *1000
  setCookie('token', params.token, 30 * 60 * 1000)
}

/**
 * 自动登录，用于实现token过期，后台返回过期
 */
export function loginAuto () {
  return new Promise((resolve, reject) => {
    setCookie('token', '', -1)
    try {
      let userInfo = JSON.parse(localStorage.getItem(USERINFO))
      if (!userInfo) {
        errorDis()
        reject(new Error('error'))
      }
      let params = {
        usr: userInfo.usr,
        passwd: userInfo.passwd
        // dataTime: getDate()
      }
      // 1.获得验证码
      // 2.登录
      api.getCode()
        .then(res => {
          if (res.ack === '1') {
            params = Object.assign(params, {
              dataTime: getDate(),
              publicKey: res.publicKey
            })
            return api.login(params)
          } else {
            errorDis()
            reject(new Error('error'))
          }
        })
        .then(res => {
          if (res.ack === '1') {
            loginSucceed(Object.assign(res, params))
            resolve()
          } else {
            errorDis()
            reject(new Error('error'))
          }
        })
    } catch (e) {
      errorDis()
      reject(new Error(e))
    }
  })
}

/**
 * 重新获取token过程出错处理
 */
function errorDis () {
  customToast({
    message: 'token获取失败，请重新登录'
  })
  setTimeout(() => {
    localStorage.remove(USERINFO)
    router.push({name: 'Login'})
  }, 1500)
}

/**
 * 根据http请求方法分别对此进行token
 * @param {Object} config - 请求配置参数
 */
export function setRequestToken (config) {
  if (!config || !config.method) {
    console.error('请求配置参数不能为空')
    return false
  }
  if (!config.url.includes('connect.action') && !config.url.includes('login.action')) {
    try {
      let key = 'params' // 默认为get方法
      if (config.method === 'post') {
        key = 'data'
      }
      config[key] = config[key] || {}
      config[key]['token'] = getCookie('token')
      config[key]['usr'] = (JSON.parse(localStorage.getItem(USERINFO)))['usr']
      return config
    } catch (e) {
      console.log(e)
      return false
    }
  } else {
    return false
  }
}

/**
 * 根据移动设备执行相对应的方法
 * 此方法包括调用此方法的只在移动设备中生效
 */
export function equipment () {
  try {
    // eslint-disable-next-line
    return plus.os.name
  } catch (e) {
    // console.log(e)
    return 'PC'
  }
}
