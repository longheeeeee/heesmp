# constructor
### 初始化匹配器`matcher`
遍历路由配置生成路由映射表，定义`pathlist`，`nameMap`，`pathMap`，三个map，对每一个路由配置生成路由记录，并且新增到`pathList`和`pathMap`中，其中会把动态路由生成正则，命名路由会新增到nameMap中，别名路由会额外生成一个路由记录，最后把通配符挪到`pathList`的最后
### 生成history实例
根据`mode`生成不同的`history`实例，`mode`分成两种，一种是`hash`，一种是`history`。
- hash会在路由上添加#，使用`hashcange`事件监听变化。
- history使用HTMl5的`history`API实现，使用`history.replaceState`和`history.pushState`更改路由，使用`popState`监听变化

# install：和vue实例做绑定关系
1. 使用`mixins`，全局混入`beforeCreate`
2. 挂载`$router`、`$route`到`Vue.prototype`，子组件可以访问单例的`router`和`$route`
3. 注册`router-view`、`router-link`组件

`beforeCreate`中，根节点会调用`router`的`init`方法并把`router`和`route`挂载到`vue`根实例上，其中`route`会做响应式处理

`init`方法：初始路由跳转，监听路由变化并且同步修改`route`对象

初始路由跳转会调用`history.transitionTo`，其中会调用`match`匹配跳转路由：

`match`传入字符串或者对象，如果有`name`则使用`nameMap`查找，否则使用`pathList`顺序遍历，找到第一个匹配的，然后使用匹配的结果生成一个新的`route`路径对象

执行钩子函数：使用了一个队列，队列里面使用一个迭代器进行迭代，钩子函数使用`next`才会执行下一个钩子

会顺序调用：
1. 失活的组件中调用`beforeRouteLeave`离开钩子
2. 调用全局的`beforeEach`
3. 重用的组件调用`beforeRouteUpdate`钩子
4. 新路由的`beforeEnter`
5. 激活异步组件
6. 新路由的`beforeRouteEnter`
7. 全局的`beforeResolve`
8. 全局的`afterEach`

路径切换完成后，使用`history.push`往路由栈中压入一个新路由
- `history`模式，使用`replaceState`和`pushState`接口来往页面栈中添加新页面，然后监听`popState`方法来监听路由变化
- `hash`模式下，优先使用`replaceState`和`pushState`接口来往页面栈中添加新页面，不支持的话直接修改`location.href`，然后监听`popState`或者`hashChange`方法来监听路由变化

`router-view`中会获取当前根实例上的`$route`，然后上面会有组件的信息来渲染组件，在`$router`发生变化的时候，因为之前已经做了响应式监听，所以会触发`router-view`组件的依赖，重新渲染组件

