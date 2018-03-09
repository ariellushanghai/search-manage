<template lang="pug">
    el-row.row(type='flex')
        el-col(:sm='3', :md='3', :lg='2', :xl='2')
            router-link.link.col(:to="{path: '/'}")
                img.logo(:src='logo_file')
        |
        el-col.title(:sm='3', :md='3', :lg='2', :xl='2')
            span 搜索管理
        |
        el-col(:sm='15', :md='15', :lg='17', :xl='17')
            el-menu(mode='horizontal', background-color='#333644', text-color='#fff', active-text-color='#EA5505', :default-active='defaultActive', :router='true')
                el-submenu(v-for='menu in menuItems', :index="'/' + menu.route", :key='menu.route')
                    template(slot='title')
                        | {{menu.display_name}}
                    el-menu-item(v-for='child in menu.children', :index="'/' + child.route", :key='child.route')
                        | {{child.display_name}}

        |
        el-col.col-user(:span='3')
            el-dropdown(@command='handleCommand', placement='bottom')
                el-button.btn-user(type='text')
                    | {{userName}}
                    i.el-icon-arrow-down.el-icon--right
                |
                el-dropdown-menu(slot='dropdown')
                    el-dropdown-item(command='logout') 退出
            |

</template>

<script>
  // @flow

  import {extend, isNil} from 'lodash'
  import API from '@/service/api'
  import logo_file from '@/assets/images/logo.jpg'

  export default {
    name: 'GlobalHeader',
    data() {
      return {
        logo_file
      }
    },
    computed: {
      defaultActive() {
        // if (/^\/project\//.exec(this.$route.path)) {
        //   return '/project'
        // }
        return this.$route.path;
      },
      menuItems() {
        return this.$store.getters.global_menu;
      },
      userName() {
        return this.$store.getters.user_name;
      }
    },
    mounted() {
      this.fetchMenu();
    },
    methods: {
      fetchMenu() {
        return API.getMenus().then(res => {
          console.log(`fetchMenu() success!!`);
          this.$store.commit('SAVE_USER_INFO', res);
          // return this.$router.push({name: 'index'})
        });
      },
      logOut() {
        return API.logOut().then(res => {
          console.log(`logout success!!`);
          this.$store.commit('LOGOUT');
          return this.$router.replace({name: 'login'})
        });
      },
      handleCommand(command) {
        if (command === 'logout') {
          return this.logOut();
        }
      }
    }
  }
</script>

<style lang="stylus" scoped>
    header-height = 60px
    ping_an-orange = #EA5505

    .invisiable
        visibility hidden
        display none
        opacity 0

    .row
        height 100%
        background-color #333644
        color #fff

    .col
        height 100%
        background-color #35495e

    .link
        display flex
        justify-content space-around
        align-items center
        background-color ping_an-orange
        user-select none

    .logo
        display block
        flex-grow 0
        flex-shrink 0
        width 82px
        height auto
        max-height header-height


    .title
        justify-content center
        line-height header-height
        text-align center
        background-color ping_an-orange
        font-size 20px
        font-weight bold
        color #fff
        user-select none

    .col-user
        display flex
        align-items center
        justify-content center

    .btn-user
        color #fff

    .btn-user:hover
        color rgb(234, 85, 5)

</style>
