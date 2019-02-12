const isPro = Object.is(process.env.NODE_ENV, 'production')

/*
 * 区分开发环境和正式环境接口求地址前缀
 */
module.exports = {
  // 前者是正式环境， 后者是开发环境
  // 代理头
  baseUrl: isPro ? '' : '/api',
  // 实际地址
  actualUrl: isPro ? '' : 'http://183.233.186.20:8888/',
}
