<template>
  <div class="changeIP">
    <div class="top statusBarTop header">
      <div @click="$router.goBack()" class="left">
        <img src="@/assets/img/settingsPage/back.png" alt="">
      </div>
      <h1>修改服务器地址</h1>
      <div class="right"></div>
    </div>
    <mt-field class="input-bar" label="服务器地址" placeholder="请填写服务器地址" type="text" v-model="server"></mt-field>
    <mt-field class="input-bar post" label="端口" placeholder="请填写端口" type="text" v-model="post"></mt-field>
    <button class="btn click-active blank-000" @click="submit()">提交</button>
  </div>
</template>

<script>
import { BASEURL, setCookie, USERINFO } from 'util'
import { getRequestTest } from 'api/config'
export default {
  name: 'ChangeIP',
  data () {
    return {
      server: '',
      post: ''
    }
  },
  methods: {
    submit () {
      // 判断是否输入http://
      let _server = this.server.toLowerCase()
      this.server = _server.indexOf('http://') === -1 ? `http://${_server}` : _server
      getRequestTest({
        url: '/nlampblack/app/connect.action',
        baseURL: `${this.server}:${this.post}`,
        $text: '正在检查服务器地址是否可用'
      })
        .then(res => {
          // alert(res)
          // TODO 成功跳转
          this.$toast({
            message: '修改成功，请重新登录',
            position: 'middle',
            duration: 3000,
            className: 'custom-tip'
          })
          localStorage.setItem(BASEURL, `${this.server}:${this.post}`)
          // 清除数据
          setCookie('token', '', -1)
          let userInfo = JSON.parse(localStorage.getItem(USERINFO))
          if (userInfo && userInfo.token) {
            delete userInfo.token
            localStorage.setItem(USERINFO, JSON.stringify(userInfo))
          }
          setTimeout(() => {
            this.$router.push({ name: 'Login' })
          }, 1500)
        })
        .catch(e => {
          // alert(e)
          this.$toast({
            message: '服务器地址不可用，请重新输入',
            duration: 1000
          })
        })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang='scss'>
.changeIP {
  height: 100%;
  padding-top: $headerHei;
  background: #eeeff4;
  overflow: hidden;
  .top {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: $headerHei;
    background: #427fdc;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .left {
      img {
        width: 19px;
        height: 33px;
        margin-left: 24px;
      }
    }
    h1 {
      flex: 1;
      text-align: center;
      color: #feffff;
      font-size: 31px;
      letter-spacing: 2px;
      font-weight: 100;
    }
    .right {
      width: 68px;
      height: 88px;
    }
  }
  .input-bar {
    margin-top: 30px;
    height: 71px;
    color: #656565;
    display: flex;
    align-items: center;
    font-size: 29px;
    background: none;
    /deep/ .mint-cell-wrapper {
      height: 100%;
    }
    /deep/ .mint-cell-title {
      height: 100%;
      width: auto;
      font-size: 29px;
      margin-left: 23px;
      margin-right: 26px;
      display: flex;
      align-items: center;
    }
    /deep/ .mint-cell-value {
      position: relative;
      height: 100%;
      padding-right: 14px;
    }
    /deep/ .mint-field-clear {
      position: absolute;
      right: 20px;
    }
    /deep/ .mint-field-core {
      font-size: 29px;
      height: 100%;
      border-radius: 6px;
      text-indent: 8px;
    }
    /deep/ .mintui {
      font-size: 36px;
    }
  }
  .post /deep/ .mint-cell-text {
    letter-spacing: 42px;
  }
  .server,
  .post {
    height: 71px;
    line-height: 71px;
    font-size: 29px;
    color: #656565;
    display: flex;
    justify-content: flex-start;
    margin-top: 30px;
  }
  .server span,
  .post span {
    margin-left: 23px;
    margin-right: 26px;
  }
  .post span {
    letter-spacing: 42px;
  }
  .server input,
  .post input {
    height: 71px;
    flex: 1;
    margin-right: 24px;
  }
  .btn {
    height: 89px;
    width: 93.8%;
    margin: 0 auto;
    line-height: 89px;
    text-align: center;
    background: #427fdc;
    font-size: 28px;
    color: #feffff;
    border-radius: 9px;
    outline: none;
    margin-top: 217px;
  }
}
</style>
