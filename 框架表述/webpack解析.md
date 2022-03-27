[[万字总结] 一文吃透 Webpack 核心原理](https://zhuanlan.zhihu.com/p/363928061)

### 1. 初始化阶段
1. 初始化参数，获取`options`
2. 初始化编译器对象，初始化`compiler`
3. 初始化编译环境，注入插件
4. 开始编译，执行`compiler`的`run`
5. 确认入口，根据`entry`找出入口文件，将入口文件转换成`dependence`对象
### 2. 构建阶段
1. 编译模块，根据`entry`对应的`dependence`创建`module`对象，调用`loader`将模块转译成标准js内容，调用js解释器转化成`AST`，找到依赖的模块，添加`dependence`到`module`上，然后递归查找
2. 最终生成依赖关系图
### 3. 生成阶段
1. 输出资源：根据入口和模块的依赖关系，组装成`chunk`，再把`chunk`转换成单独文件加入到输出列表
2. 写入文件系统

### 个人总结
1. 初始化阶段
2. 构建阶段：从入口开始，对每个模块
     1. 调用`loader`转成`js`
     2. 然后转成`AST`
     3. 根据查询依赖关系
     4. 递归
3. 生成阶段：生成`chunk`
4. 输出

### vue简单流程
1. `main.js`作为入口，然后读取引入的`app.vue`
2. `vue-loader`处理成`js`，`acron`转化成`AST`，`webpack`查找依赖，查找到`ComA.vue`和`ComB.vue`
3. 读取`ComA`内容，`vue-loader`处理成`js`，`acron`处理成`AST`，`webpack`查找不到更多依赖
4. `ComB`同理

# 1. 构建阶段
![依赖图片](https://pic1.zhimg.com/80/v2-27eb916f4247d91c5485420c983ba720_720w.jpg)

### 问题：
#### 编译过程webpack和babel干了什么？
`webpack`把源码使用`acron`解析成`AST`，然后仅遍历`AST`集合，找到依赖关系；`babel`则是对源码做等价转换

#### Webpack 编译过程中，如何识别资源对其他资源的依赖？
`Webpack` 遍历 `AST` 集合过程中，识别 `require/ import` 之类的导入语句，确定模块对其他资源的依赖关系

# 2. 生成阶段
通过入口文件的依赖来生成`chunk`，不同的入口会生成多个`chunk`，按照默认规则生成完成后，可以使用`splitChunk`来优化`chunk`
### 默认规则
- `entry` 及 `entry` 触达到的模块，组合成一个 `chunk`
- 使用动态引入语句引入的模块，各自组合成一个 `chunk`

# 3. plugins
### 什么是插件？
- 插件是一个带有`apply`方法的类，`apply`方法在初始化阶段会执行，然后传入`complier`作为参数，在`compiler`中可以注册各种钩子回调
### 什么时候会触发钩子？
1. 触发时机：`webpack`从构建到生成阶段过程中都会有不同的钩子
2. 传递参数：根据调用钩子的时候，`webpack`正在进行什么处理来决定钩子的参数
### 钩子如何影响编译？
绑定了钩子函数后，`webpack`会在钩子的回调函数调用的时候传入当前的上下文信息，函数里面可以通过调用上下文`api`或者直接修改上下文数据等，对原定的流程做修改
### 例子
1. `compiler.hooks.optimizeChunks`：`chunk`集合构建完毕后触发，`splitChunkPlugin`在这个钩子实现拆分
2. `compiler.hooks.done`：包含编译过程中的各种统计信息，`webpack-bundle-analyzer`基于这个钩子实现打包分析

# 4. loader
`loader`的工作就是在`webpack`根据依赖找到资源后，会根据规则，把资源传到`loader`处理，`loader`经过处理后会输出给下一个`loader`，处理过程的最后一个`loader`应该返回`js`文本或者`AST`，交给`webpack`继续查询依赖

# 5. `tree-shakin`
### 必须要`ESM`
因为在`cjs`等旧方案中，导入导出行为是动态的，依赖关系要到运行完才能获取，所以不能直接分析，`esm`在代码编译阶段就可以根据导入导出来确定依赖关系，所以可以进行静态分析
### 大概原理
- 在构建阶段，收集模块导出变量并且记录到模块关系图中
- 在生成阶段，遍历并且标记那些没有被使用
- 在输出文件阶段，通过`terser`把没有被使用的代码删掉
### 注意点
1. 避免空引用，方法被导入后存起来可是没有使用
2. 避免编写产生副作用的代码
3. 避免`babel`对`ESM`风格导入导出转化成`cjs`
4. 不使用`export default`，使用`export`来拆分属性
5. 使用`esm`编写的包

# 6. 其他面试题
### 1. hash，content-hash，chunk-hash的区别
1. `hash`是每次构建时根据构建内容产生的`hash`，所有的文件其中有一个发生变化，`hash`就会发生变化
2. `chunk-hash`是根据`chunk`的内容来产生`hash`，同一个`chunk`下的文件改变会互相影响
3. `content-hash`，根据文件内容做的`hash`，同一个`chunk`改变也不会改变

### 2. HMR热更新原理
1. 打包文件的时候，`webpack`会生成一个`webpack-dev-server`在本地服务器，然后代码里面注入`webpack-dev-server`的`client`用于沟通、一个`HMR`运行时和`webpack`的其他运行时
2. `webpack`的`watch`模式下，文件发生变化，`webpack`会根据配置重新编译打包，然后生成的`js`代码存放到内存中
3. 项目运行的时候，项目中的`webpack-dev-server`客户端会跟服务器建立一个`socket`连接，传递的是新模块的`hash`值
4. 更新的时候，`client`端获取到更新`hash`后，`webpack`运行时会根据更新信息来决定是否刷新页面还是采用`hmr`部分更新
5. 如果使用`HMR`更新，`webpack`运行时会把更新信息传递给`HMR`运行时，`HMR`运行时会向服务端发送`ajax`请求获取所有的更新代码，然后把新的模块代码更新到`webpack`模块缓存中
6. 业务代码需要监听`HMR`的变动，然后重新获取模块代码，重走业务逻辑，比如`vue`是使用`vue-loader`去完成的这部分更新

### 3. loader和plugin的区别
#### loader：
`loader`是一个函数，接收文件内容然后进行转译，输出另外一种文件内容。在`webpack`的构建阶段被调用，`webpack`根据依赖找到资源后，会根据配置，调用对应的`loader`，同一个规则可以采用多个`loader`，`loader`按照顺序执行，上一个`loader`的输出会传递给下一个`loader`，最终输出到`webpack`的应该是`js`文本或者是`ast`
#### plugins：
`plugin`就是插件，在整个`webpack`编译过程中都会被使用。`webpack`在编译过程的各个地方都会广播出很多事件，`plugin`在初始化的时候就会绑定这些事件，`webpack`会传入当前的上下文信息等参数，然后回调函数里面通过调用`api`或者直接修改数据来对`webpack`的流程做修改

### 4. babel原理
- 主要作用：修改我们的代码，使得低版本浏览器也可以执行新版本的代码
- `babel`的功能主要由插件实现，`babel-core`提供了代码生成`AST`和`AST`转成代码的功能，`babel-preset`提供一系列语法转译插件的集合，`babel-polyfill`提供新`api`的低版本实现。

1. 解析：使用`babel-core`的`tranform`解析代码，分成词法分析和语法分析，词法分析会把代码切分成`token`，比如`a+b`就会分成三个`token`，`a`，`+`，`b`，语法分析把`token`转化成`AST`
2. 转换：使用`babel-tarverse`遍历`AST`，然后根据转换规则，对`AST`树进行添加增加删除修改操作，插件主要就是在这里对代码进行修改
3. 生成：使用`bebel-generator`把`AST`重新构建成代码并且输出

### 5. css-loader、style-loader的作用
`css-loader`把引入的`css`文件转换成字符串并且输出
`style-loader`把`css-loader`返回的`css`文本包裹成一个函数，函数会新建一个`style`节点，把`css`文本插入到内部，然后把`style`节点插入到`head`标签内。
