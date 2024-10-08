# 1. import-html-entry
## 1. 为什么是html-entry？
`single-spa`使用的是`js-entry`，子应用入口是一个js文件，带来更新困难、无法分包、对原有项目改动大等问题
## 2. 流程
1. 使用`fetch`来下载`HTML`（需要支持跨域）
2. 使用正则匹配`HTML`内容，记录其中的`lin`k和`script`标签并且替换成注释
3. 使用`fetch`远程加载`link`文件，下完后变成`style`标签替换到`HTML`上
4. 下载`script`文件，把`qiankun`传进来的`js`沙箱`proxy`作为全局作用域封装成一个执行器
5. 返回`html`文档和执行器
## 3. 细节点
1. 加载的`html`会根据`content-type`做不同的处理
2. 如何获取到入口文件暴露出来的生命周期方法？es中对对象遍历返回的顺序做了规定，对于非数组索引的字段，返回顺序是先后创建的顺序，在入口文件执行前会先遍历`window`的最后一个字段，然后执行入口文件，入口文件执行后会把生命周期方法挂载到`window`上，然后对比`window`的最后一个字段，改变了的话就是返回的生命周期方法

# 2. JS沙箱
## 2.1 为什么需要js沙箱
防止子应用之间的js全局变量污染
## 2.2 单例沙箱
### 简单描述
记录子应用对`window`的新增修改字段，子应用切换的时候反做一次
### 流程
1. 记录三个map，分别是新增的变量名、修改的变量名和初始值、新增修改变量的最新值
2. 新建一个`proxy`，`set`的时候如果是新增的就记录变量名，修改的在第一次修改的时候记录修改的变量名，后续只更新最新值，`get`的时候直接返回`window`的值
3. 沙箱失活的时候，把新增的字段删除，把修改的字段改回原值
4. 沙箱激活的时候，把原来的最新值都覆盖一遍
## 2.3 多例沙箱
### 简单描述
新增一个`fakeWindow`对象，新增修改都在这个`fakeWindow`上进行而不是在原来的`window`上
### 大致流程
1. 生成一个`fakeWindow`对象，返回在这个对象上做的`proxy`
2. 对`window`进行`set`的时候直接修改到`fakewindow`上，`get`的时候先判断是否在`fakewindow`上，没有的返回`window`上的值
## 2.4 降级沙箱
### 简单描述
遍历`window`然后逐个字段存起来，激活失活的时候做恢复保存
## 使用沙箱
在`import-html-entry`的时候会使用fetch把js都下载下来，然后转换成字符串，前面添加`with(proxy){}`进行包裹再执行

# 3. 样式隔离如何实现
`qiankun`的样式隔离主要分成两种，一种是严格样式隔离，使用`shadow DOM`实现，一种是`scopedCss`，在选择器上做修改
## 1. 严格样式隔离
### 简单描述
使用`shadowDOM`把子应用包裹，可以使得子应用的css样式文件不会影响到其他的子应用
### 流程
在子应用挂载节点上新增一个`shadowDom`，然后把子应用的内容放到`shadowDom`节点下面
1. 使用`div.attachShadow`创建一个`shadowDom`节点
2. `shadow.innerHtml`修改`shadowDom`的节点
## 2. 使用scopedCss样式隔离
### 简单描述
通过加上前缀到选择器上来实现`scopedCss`隔离
### 流程
1. 从获取的`style`文本
2. 把`style`文件转换成`styleSheet`样式表
3. 根据不同的样式做处理，普通的样式在第一个选择器前面加上前缀，根选择器会把根元素替换成前缀
4. `style`文本替换

# 4. render沙箱
### 简单描述
在子应用切换的时候对于加载的代码、元素和挂载的事件做清除和缓存
### 流程
#### 1. 在子应用bootstrap的时候：
1. 劫持`appendChild`、`insertBefore`方法，对`link`、`style`元素而言，插入到子应用挂载的`DOM`上，卸载的时候可以一起卸载，对于`script`而言，添加js沙箱后再执行
2. 劫持后返回`free`方法，用于在子应用卸载的时候，恢复原来的`appendChild`和`insertBefore`方法
3. `free`方法执行后返回`rebuild`方法，可以把子应用的样式文件在重新激活时挂载回去，减少请求
#### 2. 在子应用mount的时候：
1. 拦截`setInterval`、`addEventListener`方法，记录子应用设置的定时器和挂载的事件
2. 返回`free`方法，在子应用卸载的时候去除定时器和事件


# 5. 深刻印象
js多例沙箱创建的时候，会把`window`上不可配置的属性复制一份到`fakeWindow`上，正常来说`fakeWindow`上应该是没有属性才对

直接搜索问题没找到，查看各种源码解析也没有发现有人讨论这个问题，因为`qiankun`是国人写的，去英文网站上结果反而更少了，查询了`github`的`issue`，也跟同事讨论了，看了好几天也没有人能知道问题所在，后来在代码的某个地方发现了有注释提了一下，是`proxy`的兼容问题

在`proxy`使用上有一个相关规定：
> 如果当前字段不存在于目标对象或者在目标对象上是`configurable`的，该字段不能被报告成`non-configurable`

所以用户使用`proxy`访问`window`上不可配置的属性的属性描述符时，因为当前字段不在`proxy`上，所以触发了这个规定，不能把该字段返回成不可配置的；所以需要把不可配置的复制一份到`fakeWindow`上

# 6. 微前端解决了什么？
微前端的核心价值：技术栈无关，可以使不同的子应用单独部署，减少技术包袱，减轻重构成本。

# 7. 有什么办法实现微前端？
iframe

# 8. 微前端优化
可以共享依赖，虽然违背了微前端的理念，可是对于当前项目而言，收获是相对较大的

# 9. qiankun为什么需要将子应用输出成umd
`qiankun`架构下的子应用通过`webpack`的`umd`输出格式来做，让父应用在执行子应用的 js 资源时可以通过`eval`，将`window`绑定到一个`Proxy`对象上，以此来防止污染全局变量，方便对脚本的`window`相关操作做劫持处理，达到子应用之间的脚本隔离。
- 打包成cjs的话会使用`exports['app-name'] = factory()`
- 打包成umd的话会使用`root['app-name'] = factory()`，所以使用umd可以直接获取子应用暴露出来的生命周期函数

# import-html-entry原理
1. 使用fetch来下载HTML(这里需要支持跨域)
2. 使用正则匹配HTML内容，把其中的link和script标签记录下来并且注释掉
3. 使用fetch远程加载刚刚记录下来的link文件，并且在加载完成后变成style标签替换到HTML上(template)
4. 下载script标签，对JS代码做包装，把qiankun传进来的proxy绑定上去，生成一个全局作用域被改动了的函数(不执行)(execScript)
5. 返回template，execScript等内容