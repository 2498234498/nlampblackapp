<template>
  <div id="footer">
    <ul>
      <li v-for="(item, key) in foot" :key="key">
        <router-link :to="item.to" class="click-active">
          <div class="icon"></div>
          <div class="name">{{ item.name }}</div>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'Footer',
  data () {
    return {
      foot: [
        { name: '首页', to: { name: 'Home', path: '/main/' } },
        { name: '地图', to: { name: 'Map', path: '/map/' } },
        { name: '监控点', to: { name: 'Monitor', path: '/monitor/' } },
        { name: '数据', to: { name: 'Data', path: '/data/' } },
        { name: '设置', to: { name: 'Settings', path: '/settings/' } }
      ]
    }
  },
  watch: {
    $route: {
      handler (to, from) {
        this.foot.some(r => r.to.name === this.$route.name) && this.$store.commit('setBack', false)
        this.$emit('getThisRouter', to.name) // 发送一个当前路由信息出去
      },
      immediate: true
    }
  }
}
</script>

<style lang="scss" scoped>
#footer {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: $footerHei;
  background: #fff;
  box-shadow:0px -1px 1px rgba(0,0,0,.1);
  ul {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    li {
      display: flex;
      flex-direction: column;
      justify-content: center;
      width: 25%;
      font-size: 22px;
      a {
        color: #989898;
      }
      div {
        width: 100%;
      }
      .icon {
        width: 50px;
        height: 45px;
        margin: 0 auto;
        background-repeat: no-repeat;
        background-size: 100% 100%;
        background-position:center center;
        img {
          width: 100%;
          height: 100%;
        }
      }
      a.router-link-active{
        color: #6494e0;
      }
      &:nth-child(1) {
        .icon {
          background-image: url('~@/assets/img/footer/home1.png');
        }
        a.router-link-active .icon {
          background-image: url('~@/assets/img/footer/home2.png');
        }
      }
      &:nth-child(2) {
        .icon {
          background-image: url('~@/assets/img/footer/map1.png');
        }
        a.router-link-active .icon {
          background-image: url('~@/assets/img/footer/map2.png');
        }
      }
      &:nth-child(3) {
        .icon {
          background-image: url('~@/assets/img/footer/monitor1.png');
        }
        a.router-link-active .icon {
          background-image: url('~@/assets/img/footer/monitor2.png');
        }
      }
      &:nth-child(4) {
        .icon {
          background-image: url('~@/assets/img/footer/data1.png');
        }
        a.router-link-active .icon {
          background-image: url('~@/assets/img/footer/data2.png');
        }
      }
      &:nth-child(5) {
        .icon {
          background-image: url('~@/assets/img/footer/settings1.png');
        }
        a.router-link-active .icon {
          background-image: url('~@/assets/img/footer/settings2.png');
        }
      }
    }
  }
}
</style>
