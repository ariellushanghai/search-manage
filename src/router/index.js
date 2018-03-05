import Router from 'vue-router'
import store from '@/store/'


const DashBoard = r => require(['@/pages/DashBoard'], r);



const router = new Router({
  routes: [
    {
      name: 'index',
      redirect: {
        name: 'DashBoard'
      },
      path: '/'
    },
    {
      name: 'DashBoard',
      path: '/dashboard',
      component: DashBoard
    }
  ]
});

router.beforeEach((to, from, next) => {
  // console.log(`router.beforeEach(to: `, to, `from: `, from, `next: `, next);

  if (to.name === 'login' || store.getters.user_name) {
    return next();
  } else {
    return next({
      name: 'login'
    });
  }
});

export default router