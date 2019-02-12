<template>
  <div class="settingsHome">
    <h1 class="statusBarTop header">设 置</h1>
    <ul>
      <li @click="$router.push({name: 'Feedback'})" class="click-active">
        <img class="message" src="@/assets/img/settingsPage/settings-1.png" alt="">
        <span>意见反馈</span>
        <img class="nextStep" src="@/assets/img/settingsPage/settings-4.png" alt="">
      </li>
      <li @click="clearCache()" class="click-active">
        <img class="remove" src="@/assets/img/settingsPage/settings-2.png" alt="">
        <span>清除系统缓存</span>
        <img class="nextStep" src="@/assets/img/settingsPage/settings-4.png" alt="">
      </li>
      <li @click="$router.push({name: 'ChangePsd'})" class="click-active">
        <img class="change" src="@/assets/img/settingsPage/settings-3.png" alt="">
        <span>修改密码</span>
        <img class="nextStep" src="@/assets/img/settingsPage/settings-4.png" alt="">
      </li>
      <li @click="$router.push({name: 'ChangeIP'})" class="click-active">
        <img class="changeIP" src="@/assets/img/settingsPage/settings-5.png" alt="">
        <span>修改服务器地址</span>
        <img class="nextStep" src="@/assets/img/settingsPage/settings-4.png" alt="">
      </li>
    </ul>
    <div class="btn click-active blank-000" @click="logOut()">退出登录</div>
    <div v-show="showDialog" class="dialogBox">
      <div class="dialog"></div>
      <div class="container">
        <div class="message">{{msg}}</div>
        <div class="footer">
          <span class="confim" @click="confim()">确定</span>
          <span class="cancel" @click="showDialog = false">取消</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from 'api'
import { setCookie, USERINFO } from 'util'
export default {
  name: 'Settings',
  data () {
    return {
      showDialog: false,
      msg: ''
    }
  },
  methods: {
    clearCache () {
      this.showDialog = true
      this.msg = '确定清除缓存吗？'
    },
    confim () {
      if (this.msg === '确定清除缓存吗？') {
        this.showDialog = false
        this.$toast({
          message: '清除成功'
        })
      } else if ((this.msg === '确定要退出登录吗？')) {
        this.showDialog = false
        api.logout().then(res => {
          if (res.ack === '1') {
            setCookie('token', '', -1)
            let userInfo = JSON.parse(localStorage.getItem(USERINFO))
            if (userInfo && userInfo.token) {
              delete userInfo.token
              localStorage.setItem(USERINFO, JSON.stringify(userInfo))
            }
            this.$router.push({ name: 'Login' })
            this.$toast({
              message: '退出登录成功'
            })
          } else {
            this.$toast({
              message: '退出登录失败'
            })
          }
        })
      }
    },
    logOut () {
      this.showDialog = true
      this.msg = '确定要退出登录吗？'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang='scss'>
.settingsHome {
  height: calc(100% - #{$footerHei});
  background: #eeeff4;
  padding-top: $headerHei;
  display: flex;
  flex-direction: column;
  h1 {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: $headerHei;
    background: #427fdc;
    color: #feffff;
    font-size: 31px;
    text-align: center;
    font-weight: 100;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  ul {
    background: #fff;
    li {
      height: 115px;
      line-height: 115px;
      border-bottom: 1px solid #e4e4e4;
      display: flex;
      justify-content: space-between;
      .message {
        width: 30px;
        height: 26px;
        margin-left: 24px;
        margin-top: 45px;
        margin-right: 22px;
      }
      .remove {
        width: 32px;
        height: 34px;
        margin-left: 24px;
        margin-top: 38px;
        margin-right: 22px;
      }
      .change {
        width: 26px;
        height: 30px;
        margin-left: 24px;
        margin-top: 42px;
        margin-right: 22px;
      }
      .changeIP {
        width: 30px;
        height: 30px;
        margin-left: 24px;
        margin-top: 44px;
        margin-right: 22px;
      }
      span {
        font-size: 30px;
        color: #6f6d6e;
        flex: 1;
        text-align: left;
      }
      .nextStep {
        width: 13px;
        height: 19px;
        margin-right: 24px;
        margin-top: 48px;
      }
    }
    li:nth-child(1) {
      margin-top: 40px;
    }
  }
  .btn {
    width: 93%;
    height: 89px;
    margin: 0 auto;
    line-height: 89px;
    text-align: center;
    background: #427fdc;
    font-size: 28px;
    color: #feffff;
    border-radius: 9px;
    outline: none;
    margin-top: 104px;
  }
  .dialogBox {
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    right: 0;
    z-index: 100;
    .dialog {
      width: 100%;
      height: 100%;
      background: #000;
      opacity: 0.5;
    }
    .container {
      top: 33%;
      left: 8%;
      position: absolute;
      height: 375px;
      width: 84%;
      background: #fff;
      border-radius: 8px;
      .message {
        height: 285px;
        line-height: 285px;
        text-align: center;
        font-size: 33px;
        color: #323232;
        border-bottom: 1px solid #c7c7c7;
      }
      .footer {
        .confim,
        .cancel {
          display: inline-block;
          height: 87px;
          width: 49%;
          font-size: 32px;
          text-align: center;
          line-height: 87px;
          color: #989898;
        }
        .confim {
          border-right: 1px solid #c7c7c7;
          color: #323232;
        }
      }
    }
  }
}
</style>
