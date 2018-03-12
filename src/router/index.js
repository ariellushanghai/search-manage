import Router from 'vue-router'
import store from '@/store/'

// 首页
// --搜索观象台
const mgrObservatory = r => require(['@/pages/homePage/mgrObservatory'], r);
// 关键词管理
// --关键词库
const mgrFunKeyWord = r => require(['@/pages/keyWordManage/mgrFunKeyWord.vue'], r);


const router = new Router({
  routes: [
    {
      name: 'index',
      redirect: {
        name: 'mgrObservatory'
      },
      path: '/'
    },
    {
      name: 'mgrObservatory',
      path: '/homePage/mgrObservatory',
      component: mgrObservatory
    },

    {
      name: 'mgrFunKeyWord',
      path: '/keyWordManage/mgrFunKeyWord',
      component: mgrFunKeyWord
    }
  ]
});

// router.beforeEach((to, from, next) => {
//   console.log(`router.beforeEach(to: `, to, ` from: `, from);
//   return next();
//   // if (store.getters.user_name) {
//   //   return next();
//   // } else {
//   //   return next({
//   //     name: 'login'
//   //   });
//   // }
// });

export default router