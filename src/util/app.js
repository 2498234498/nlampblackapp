/* eslint-disable */
/**
 * 提供页面调用原生APP方法
 */
import {
  equipment
} from 'util'

/**
 * 设置状态栏前景色，只支持两种颜色，黑色(dark)，白色(light)
 * !- Android5只有小米和魅族支持，Android6及以上所有安卓支持；
 * !- iOS7及以上支持
 * @param {String} color - 颜色值，黑色(dark)，白色(light)，默认为白色(light)
 */
export function setStatusBarStyle (color = 'light') {
  if (equipment() === 'PC') return
  plus.navigator.setStatusBarStyle(color)
}

/**
 * 设置状态栏背景色
 * !- Android5及以上系统支持
 * !- iOS7.0及以上系统支持
 * @param {String} color - 十六制颜色(#333)，不传不设置
 */
export function setStatusBarBackground (color) {
  if (equipment() === 'PC') return
  if (!color) return
  plus.navigator.setStatusBarBackground(color)
}