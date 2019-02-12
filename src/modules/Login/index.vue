<template>
  <div class="login statusBarTop">
    <h1>餐饮油烟在线监控</h1>
    <ul>
      <li>
        <img src="@/assets/img/login/1.jpg" alt="" class="icon">
        <mt-field class="input" placeholder="请输入用户名" v-model="username"></mt-field>
      </li>
      <li>
        <img src="@/assets/img/login/2.jpg" alt="" class="icon">
        <mt-field class="input" type="password" placeholder="请输入密码" v-model="password" ref="password" v-if="show"></mt-field>
        <mt-field class="input" type="text" placeholder="请输入密码" v-model="password" ref="password" v-else></mt-field>
        <img :src="show ? passImg[0] :passImg[1]" alt="" class="show" @click="show = !show">
      </li>
      <li>
        <img src="@/assets/img/login/3.jpg" alt="" class="icon">
        <mt-field class="input" type="text" placeholder="请输入验证码" v-model="num" ref="mtInput"></mt-field>
        <div class="code" @click="securityCode()">
          <div v-for="(item, key) in code" :key="key">{{ item }}</div>
        </div>
      </li>
    </ul>
    <div class="psd">
      <span class="span">记住密码</span>
      <div class="switch-container">
        <input class="switch switch-anim" type="checkbox" checked v-model="rememberPassword">
      </div>
    </div>
    <mt-button type="primary" size="large" class="btn" @click="submit()">登 陆</mt-button>
    <div class="forgetPsd">
      <span @click="showDialog = true">忘记密码</span>
    </div>
    <div class="dialogBox" v-show="showDialog" @click="showDialog = false">
      <div class="dialog"></div>
      <div class="container">
        <div class="service">请联系客服</div>
        <div class="number">400-800-65752</div>
      </div>
    </div>
  </div>
</template>

<script>
import api from 'api'
import { getDate, loginSucceed, USERINFO } from 'util'
export default {
  name: 'Login',
  data () {
    return {
      username: '',
      password: '',
      num: '',
      rememberPassword: false,
      show: true, // 密码显隐
      passImg: [
        require('@/assets/img/login/login_1.png'),
        require('@/assets/img/login/login_2.png')
      ],
      code: [],
      codeNum: '',
      publicKey: '',
      dataTime: '',
      showDialog: false
    }
  },
  methods: {
    /**
     * 获取验证码
     */
    securityCode () {
      api.getCode().then(res => {
        if (parseInt(res.ack) === 1) {
          this.codeNum = res.randnum
          this.code = this.codeNum.split('')
          this.dataTime = getDate()
          this.publicKey = res.publicKey
        } else {
          this.codeNum = ''
          this.code = []
          this.toast('获取验证码失败')
        }
      })
    },
    /**
     * 初始化，获取记得密码状态，账号自动填入
     */
    initialize: function () {
      let userInfo = JSON.parse(localStorage.getItem(USERINFO))
      if (userInfo) {
        this.rememberPassword = userInfo.rememberPassword
        this.username = userInfo.usr
        if (userInfo.rememberPassword) {
          this.password = userInfo.passwd
        }
      }
    },
    /**
     * 提交登录
     */
    submit () {
      if (this.username === '') {
        this.toast('', 1)
      } else if (this.password === '') {
        this.toast('', 2)
      } else if (this.num !== this.codeNum) {
        this.toast('', 3)
        this.securityCode()
      } else {
        let params = {
          dataTime: this.dataTime,
          usr: this.username,
          passwd: this.password
        }
        api.login(params).then(res => {
          this.toast(parseInt(res.ack))
          if (parseInt(res.ack) > 1) {
            this.securityCode()
          } else if (parseInt(res.ack) === 1) {
            // 登录成功统一处理数据
            loginSucceed(Object.assign(res, params, {
              rememberPassword: this.rememberPassword,
              publicKey: this.publicKey
            }))
            setTimeout(() => {
              this.$router.push({ name: 'Home' })
            }, 2000)
          }
        })
      }
    },
    toast (ackMsg, msg) {
      let message = []
      if (ackMsg) {
        message = ['登录成功', '登录失败', '用户名错误', '密码错误', '账号未激活', '登录超时,请重新尝试', '', '', '登录过期', 'token信息错误']
      } else {
        message = ['用户名不能为空', '密码不能为空', '验证码错误']
      }
      let num = 0
      ackMsg ? num = ackMsg : num = msg ? num = msg : num = 0
      this.$toast({
        message: message[num - 1] ? message[num - 1] : '数据异常'
      })
    }
  },
  created () {
    this.securityCode()
    this.initialize()
  },
  mounted () {
    let _this = this
    // 设置IOS首字母输入不自动大写
    // 由于input使用的是mint-ui的组件，所以无法手动进行添加，则通过事件来获取元素
    document.querySelectorAll('.mint-field-core').forEach(el => {
      !el.getAttribute('autocapitalize') && el.setAttribute('autocapitalize', 'off')
      !el.getAttribute('autocorrect') && el.setAttribute('autocorrect', 'off')
    })
    // 给mt-field里面input绑定回车事件
    this.$refs.mtInput.$el.querySelector('input').onkeydown = function (e) {
      if (e.keyCode === 13) {
        _this.submit()
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang='scss' scoped>
.login {
  overflow: hidden;
  min-height: 100%;
  background: #e5e5e5;
  h1 {
    font-size: 41px;
    text-align: center;
    margin-top: 205px;
    margin-bottom: 76px;
  }
  ul {
    height: auto;
    width: 93%;
    border: 1px solid #c8c8c8; /*no*/
    margin: 0 auto;
    background: #fefefe;
    margin-bottom: 42px;
    box-shadow:0px 5px 5px #d0d2d1;
    li {
      width: 93%;
      margin: 0 auto;
      height: 93px;
      border-bottom: 1px solid #e6e6e6; /*no*/
      display: flex;
      align-items: center;
      overflow: hidden;
      .icon {
        height: 43px;
        width: 43px;
        margin-left: 32px;
      }
      .show {
        height: 44px;
        width: 44px;
        margin-right: 39px;
      }
      .code {
        width: 145px;
        height: 93px;
        line-height: 93px;
        div {
          float: left;
          width: 20%;
          text-align: center;
          font-size: 36px;
          font-weight: bolder;
        }
        div:nth-child(1) {
          color: #6c4e4e;
        }
        div:nth-child(2) {
          color: #0e1969;
        }
        div:nth-child(3) {
          color: #2f6144;
        }
        div:nth-child(4) {
          color: #292768;
        }
      }
    }
    .input{
      height: 100%;
      // margin-top: 3px;
      margin-left: 63px;
      flex-grow: 1;
      // border-bottom: 1px solid #e6e6e6; /*no*/
      /deep/ .mint-cell-wrapper {
        padding: 0;
      }
      /deep/ .mint-field-core {
        font-size: 36px;
      }
      /deep/ .mintui {
        font-size: 36px;
      }
      /deep/ .mint-cell-value {
        position: relative;
      }
      /deep/ .mint-field-clear {
        position: absolute;
        right: 25px;
      }
    }
    li:last-child {
      border-bottom: none;
    }
  }
  .psd {
    width: 93%;
    height: 84px;
    background: #fff;
    border: 1px solid #c8c8c8;
    margin: 0 auto;
    line-height: 84px;
    margin-bottom: 96px;
    box-shadow:0px 5px 5px #d0d2d1;
    .span {
      float: left;
      margin-left: 34px;
      font-size: 33px;
      color: #000;
    }
    .login-switch {
      float: right;
      margin-top: 18px;
      margin-right: 16px;
    }
    .switch-container {
      width: 150px;
      height: 63px;
      position: relative;
      float: right;
      margin-right: 32px;
      margin-top: 10px;
    }
    .switch-on {
      line-height: 0;
      top: 30px;
      left: 26px;
      position: absolute;
      font-size: 23px;
      color: #fff;
    }
    .switch-off {
      line-height: 0;
      top: 30px;
      right: 5px;
      position: absolute;
      font-size: 23px;
      color: #000;
    }
    .switch {
      width: 150px;
      height: 63px;
      position: relative;
      border: 2px solid #40ba55;
      background-color: #fdfdfd;
      box-shadow: #dfdfdf 0 0 0 0 inset;
      border-radius: 31.5px;
      background-clip: content-box;
      display: inline-block;
      -webkit-appearance: none;
      user-select: none;
      outline: none;
      transition: background 0.3s, box-shadow 0.3s;
      display: flex;
      align-items: center;
    }
    .switch:after {
      position: absolute;
      content: 'OFF';
      font-size: 36px;
      right: 20px;
      left: auto;
      color: #64bd63;
    }
    .switch:checked:after {
      content: 'ON';
      font-size: 36px;
      left: 20px;
      right: auto;
      color: #fff;
    }
    .switch:before {
      content: '';
      width: 50px;
      height: 50px;
      position: absolute;
      top: 5px;
      left: 0;
      border-radius: 50px;
      background-color: #fff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
      z-index: 10;
    }
    .switch:checked {
      border-color: #64bd63;
      box-shadow: #64bd63 0 0 0 16px inset;
      background-color: #4bd963;
    }
    .switch:checked:before {
      left: 95px;
    }
    .switch.switch-anim:before {
      transition: left 0.3s;
    }
    .switch.switch-anim:checked {
      box-shadow: #64bd63 0 0 0 16px inset;
      background-color: #64bd63;
    }
    .switch.switch-anim:checked:before {
      transition: left 0.3s;
    }
  }
  .btn {
    width: 90%;
    height: 94px;
    border-radius: 14px;
    background: #4bd963;
    font-size: 43px;
    line-height: 94px;
    text-align: center;
    color: #fff;
    outline: none;
    margin: 0 auto;
  }
  .forgetPsd {
    width: 90%;
    margin: 0 auto;
    span {
      font-size: 28px;
      color: #a1a1a1;
      float: right;
      margin-top: 51px;
    }
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
      .service {
        font-size: 33px;
        font-weight: 100;
        margin-top: 120px;
        margin-bottom: 30px;
        color: #323232;
      }
      .number {
        text-align: center;
        font-size: 33px;
        color: #323232;
        font-size: 27px;
      }
    }
  }
}
</style>
