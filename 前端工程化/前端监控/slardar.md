1. 使用插件形式提供功能


使用形式
```js
import browserClient from '@slardar/web';

browserClient('init', {
  bid: 'my bid'
})

browserClient('start')
```

在import的时候会使用createBrowserClient来创建client并导出
在执行init的时候，执行plugin.apply，在创建client的时候会传入对应的plugin name，默认的会有breadcrumb/jsError/performance/resourceError/resource
client提供了on/provide方法
不是，provide是用来挂载的

js异常监控，使用onerror和unhandledrejection

请求监控，在xhr的send阶段进行拦截，获取到method/url/start/xhr，往xhr上添加traceheader

请求各阶段的耗时可以通过performance.getEntriesByType('reource')获取，上面有请求的地址、类型（xhr/图片等）

静态资源监控
对全局error事件进行监听可以获取静态资源错误，需要在捕获阶段添加，因为不会冒泡

白屏监控原理
1. 页面load完成后，等待一个requestIdleCallback，然后开始监听变更，包括请求、dom、资源加载、longtask等
2. 每次变更后检查是否有打分任务，有则重置
    1. 打分通过时，被认为是非白屏，继续等待
    2. 打分不通过时，可能是白屏，进行回测任务
3. 回测任务中监控是否有用户产生的交互类型事件
    1. 如果有，则认为是误报。
    2. 如果没有，则尝试截屏，同时上报白屏事件
4. 上报的白屏事件会尝试跟最近的错误事件进行关联

打分任务：从设定的root节点开始往下计算，每看到一个可见dom元素则累计1*depth分，4层或者达到阈值后停止
回测任务：确定是否是一个稳定的白屏状态，首屏是8秒，非首屏是4秒

PVUV上报

微前端性能数据指标
1. MFFCP：通过mutationObserver来监听子应用root元素的变更
2. 

