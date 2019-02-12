<template>
  <div class="feedback">
    <div class="top statusBarTop header">
      <div @click="$router.goBack()" class="left">
        <img src="@/assets/img/settingsPage/back.png" alt="">
      </div>
      <h1>修改密码</h1>
      <div class="right"></div>
    </div>
    <mt-field class="password" label="旧密码：" placeholder="请输入旧密码" type="password" v-model="oldPsd"></mt-field>
    <mt-field class="password" label="新密码：" placeholder="请输入新密码" type="password" v-model="newPsd"></mt-field>
    <mt-field class="password againPsd" label="再次输入新密码：" placeholder="请再次输入新密码" type="password" v-model="againPsd"></mt-field>
    <button class="btn click-active blank-000" @click="submit()">确定</button>
  </div>
</template>

<script>
import api from 'api'
import { setCookie, USERINFO } from 'util'
export default {
  name: 'ChangePsd',
  data () {
    return {
      oldPsd: '',
      newPsd: '',
      againPsd: ''
    }
  },
  methods: {
    submit: function () {
      if (this.oldPsd === '') {
        this.toast('旧密码不能为空')
      } else if (this.newPsd === '') {
        this.toast('新密码不能为空')
      } else if (this.newPsd !== '') {
        if (this.newPsd === this.againPsd) {
          let params = {
            passwdnew: this.newPsd,
            passwdold: this.oldPsd
          }
          api.modifypasswd(params).then(res => {
            switch (parseInt(res.ack)) {
              case 1:
                setCookie('token', '', -1)
                let userInfo = JSON.parse(localStorage.getItem(USERINFO))
                if (userInfo && userInfo.token) {
                  delete userInfo.token
                  delete userInfo.passwd
                  localStorage.setItem(USERINFO, JSON.stringify(userInfo))
                }
                this.toast('修改成功')
                setTimeout(() => {
                  this.$router.push({ name: 'Login' })
                }, 2000)
                break
              case 2:
                this.toast('修改密码失败')
                break
              case 7:
                this.toast('旧密码错误')
                break
              case 8:
                this.toast('新密码长度不够')
                break
            }
          })
        } else {
          this.toast('两次输入的密码不一致')
        }
      }
    },
    toast (message) {
      this.$toast({
        message: message,
        duration: 1000
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang='scss'>
.feedback {
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
  .password {
    margin-top: 30px;
    height: 71px;
    margin-right: 23px;
    /deep/ .mint-cell-wrapper {
      padding: 0;
      .mint-cell-title {
        background: #eeeff4;
        color: #656565;
        height: 100%;
        width: auto;
        padding: 0 26px 0 23px;
        font-size: 29px;
        display: flex;
        align-items: center;
        .mint-cell-text {
          display: block;
          width: 150px;
          height: 100%;
          line-height: 71px;
          text-align: center;
        }
      }
      .mint-cell-value {
        position: relative;
        height: 100%;
        padding-right: 14px;
        .mint-field-core {
          font-size: 29px;
          height: 100%;
          border-radius: 6px;
          text-indent: 8px;
        }
        .mint-field-clear {
          position: absolute;
          right: 20px;
          .mintui {
            margin-right: 24px;
            font-size: 36px;
          }
        }
      }
    }
  }
  .againPsd {
    /deep/ .mint-cell-wrapper {
      .mint-cell-title {
        // padding-right: 250px;
        .mint-cell-text {
          width: 250px;
        }
      }
    }
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
