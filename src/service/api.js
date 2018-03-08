import network from '@/service/network'

export default {
  // 文档地址:  http://10.25.81.230:31082/swagger-ui.html
  // 登出
  logOut() {
    // return network.get('logOut.json');
    return network.post(`/signout`, {});
  },
  // 新增训练项目
  addProject(obj) {
    // return network.get('addProject.json');
    return network.post(`/projects`, obj);
  },
  // 删除训练项目
  delProject(proId) {
    return network.delete(`/projects/${proId}`);
  },
  // 项目对应训练List
  getTrains(obj) {
    // return network.get('getTrains.json');
    return network.get(`/trains`, {
      params: obj
    });
  },
  // 获取菜单
  getMenus() {
    // return network.get('/getUserMenu.json');
    return network.get('/user/getMgrMenu.do');
  },
  // 获取 关键词管理-配置功能服务
  getAllApp() {
    // return network.get('/getAllApp.json');
    return network.get('/module/getAllApp.do', {
      params: {
        startIndex: 0,
        pageSize: 10
      }
    });
  },
  // 构建镜像
  buildImage(obj) {
    let req = network.create({
      timeout: 60 * 1000
    });
    console.log(`buildImage(): `, req);
    return req.post(`/image/build`, obj);
  }

}
