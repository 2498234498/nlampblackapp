<template>
  <div class="feedback">
    <div class="top statusBarTop header">
      <div class="left" @click="$router.goBack()">
        <img src="@/assets/img/settingsPage/back.png" alt="">
      </div>
      <h1>意见反馈</h1>
      <div class="right"></div>
    </div>
    <textarea placeholder="请输入您的建议或反馈信息" v-model="value"></textarea>
    <button class="btn click-active blank-000" @click="submit()">提交</button>
  </div>
</template>

<script>
import api from 'api'
export default {
  name: 'Feedback',
  data () {
    return {
      value: ''
    }
  },
  methods: {
    submit: function () {
      if (this.value === '') {
        this.toast('反馈消息不能为空')
      } else {
        let params = {
          feedbackmsg: this.value
        }
        api.usrfeedback(params).then(res => {
          switch (parseInt(res.ack)) {
            case 1 :
              this.toast('提交成功')
              this.value = ''
              break
            case 2 :
              this.toast('提交失败')
              break
          }
        })
      }
    },
    toast (message) {
      this.$toast({
        message: message,
        duration: 500
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
  textarea {
    width: 93.8%;
    height: 434px;
    font-size: 29px;
    line-height: 50px;
    margin: 0 auto;
    outline: none;
    resize: none;
    border: none;
    border-radius: 8px;
    margin-top: 20px;
    margin-bottom: 66px;
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
  }
}
</style>
