<template>
  <div class="guide statusBarTop">
    <div class="set-cont">
      <p class="title">设置服务器地址</p>
      <mt-field class="item" label="服务器地址" placeholder="请填写服务器地址" v-model="address"></mt-field>
      <mt-field class="item" label="端口" placeholder="请填写端口" v-model="port"></mt-field>
      <div class="item-btn">
        <mt-button class="btn" type="primary" size="large" @click="setBaseUrl()">确定</mt-button>
      </div>
    </div>
  </div>
</template>

<script>
import { BASEURL } from 'util'
import customSelect from '@/components/CustomSelect.vue'
import { getRequestTest } from 'api/config'
export default {
  name: 'Guide',
  data () {
    return {
      address: '',
      port: ''
    }
  },
  methods: {
    /**
     * 尝试发送请求
     */
    setBaseUrl () {
      // 判断是否输入http://
      let _address = this.address.toLowerCase()
      this.address = _address.indexOf('http://') === -1 ? `http://${_address}` : _address
      getRequestTest({
        url: '/nlampblack/app/connect.action',
        baseURL: `${this.address}:${this.port}`,
        $text: '正在检查服务器地址是否可用'
      })
        .then(res => {
          // console.log(res)
          localStorage.setItem(BASEURL, `${this.address}:${this.port}`)
          this.$toast({
            message: '连接服务器成功，正在跳转登录页...',
            duration: 1500
          })
          setTimeout(() => {
            this.$router.push({ name: 'Login' })
          }, 1500)
        })
        .catch(e => {
          this.$toast({
            message: '服务器地址不可用或网络异常，请检测重新输入'
          })
        })
    }
  },
  created () {},
  components: {
    customSelect
  }
}
</script>

<style lang="scss" scoped>
.guide {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('../../assets/img/guide/guide.png') no-repeat center top;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
  .set-cont {
    width: 90%;
    height: auto;
    box-shadow: 0px 0px 8px 6px rgba(0,0,0,0.1);
    background-color: #fff;
    padding: 40px 30px;
    border-radius: 12px;
    color: #333;
    display: flex;
    flex-direction: column;
    .title {
      font-size: 36px;
    }
    .item {
      margin-top: 40px;
      display: flex;
      padding: 0 40px;
      height: 60px;
      /deep/ .mint-cell-wrapper {
        padding: 0;
        font-size: 30px;
      }
      /deep/ .mint-cell-title {
        width: 30%;
        word-break: keep-all; // 针对小屏幕，文字不换行
        white-space: nowrap;
        text-align: left;
      }
      /deep/ .mint-cell-value {
        height: 100%;
        flex-grow: 1;
        position: relative;
        display: flex;
        align-items: center;
      }
      /deep/ .mint-field-core {
        height: 100%;
        border-radius: 6px;
        background: #f1f1f1;
        text-indent: 10px;
      }
      /deep/ .mint-field-clear {
        position: absolute;
        right: 20px;
      }
      /deep/ .mintui {
        font-size: 28px;
      }
    }
    .item-btn {
      display: flex;
      margin-top: 100px;
      .btn {
        font-size: 28px;
        flex-grow: 1;
        height: 80px;
        border-radius: 8px;
        &:first-child {
          margin-right: 15px;
        }
        &:last-child {
          margin-left: 15px;
        }
      }
    }
  }
}
</style>
