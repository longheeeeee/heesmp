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
通过入口文件的依赖来生成chunk，不同的入口会生成多个chunk，按照默认规则生成完成后，可以使用splitChunk来优化chunk
### 默认规则
- entry 及 entry 触达到的模块，组合成一个 chunk
- 使用动态引入语句引入的模块，各自组合成一个 chunk

# 3. plugins
### 什么是插件？
- 插件是一个apply方法的类，apply方法在初始化阶段会执行，然后传入complier作为参数，在compiler中可以注册各种钩子回调
### 什么时候会触发钩子？
1. 触发时机：webpack从构建到生成阶段过程中都会有不同的钩子
2. 传递参数：根据调用钩子的时候，webpack正在进行什么处理来决定钩子的参数
### 钩子如何影响编译？
绑定了钩子函数后，webpack会在钩子的回调函数调用的时候传入当前的上下文信息，函数里面可以通过调用上下文api或者直接修改上下文数据等，对原定的流程做修改
### 例子
1. compiler.hooks.optimizeChunks：chunk集合构建完毕后触发，splitChunkPlugin在这个钩子实现拆分
2. chmpiler.hooks.done：包含编译过程中的各种统计信息，webpack-bundle-analyzer基于这个钩子实现打包分析

# 4. loader
loader的工作就是在webpack根据依赖找到资源后，会根据规则，把资源传到loader处理，loader经过处理后会输出给下一个loader，处理过程的最后一个loader应该返回js文本或者AST，交给webpack继续查询依赖

# 5. tree-shakin
### 必须要ESM
因为在cjs等旧方案中，导入导出行为是动态的，import可以写在if里面，所以不能直接分析，esm规定了导入导出语句只能出现在模块顶层，所以有静态分析的基础
### 大概原理
- 在构建阶段，收集模块导出变量并且记录到模块关系图中
- 在生成阶段，遍历并且标记那些没有被使用
- 在输出文件阶段，通过terser把没有被使用的代码删掉
### 注意点
1. 避免空引用，方法被导入后存起来可是没有使用
2. 避免编写产生副作用的代码
3. 避免babel对ESM风格导入导出转化成cjs
4. 不使用export default，使用export来拆分属性
5. 使用esm编写的包

# 6. 其他面试题
### 1. hash，content-hash，chunk-hash的区别
1. hash是每次构建时根据构建内容产生的hash，所有的文件其中有一个发生变化，hash就会发生变化
2. chunk-hash是根据chunk的内容来产生hash，同一个chunk下的文件改变会互相影响
3. content-hash，根据文件内容做的hash，同一个chunk改变也不会改变

### 2. HMR热更新原理
1. 打包文件的时候，webpack会生成一个webpack-dev-server在本地服务器，然后代码里面注入webpack-dev-server的client用于沟通、一个HMR运行时和webpack的其他运行时
2. webpack的watch模式下，文件发生变化，webpack会根据配置重新编译打包，然后生成的js代码存放到内存中
3. 项目运行的时候，项目中的webpack-dev-server客户端会跟服务器建立一个socket连接，传递的是新模块的hash值
4. 更新的时候，client端获取到更新hash后，webpack运行时会根据更新信息来决定是否刷新页面还是采用hmr部分更新
5. 如果使用HMR更新，webpack运行时会把更新信息传递给HMR运行时，HMR运行时会向服务端发送ajax请求获取所有的更新代码，然后把新的模块代码更新到webpack模块缓存中
6. 业务代码需要监听HMR的变动，然后重新获取模块代码，重走业务逻辑，比如vue是使用vue-loader去完成的这部分更新

### 3. loader和plugin的区别
#### loader：
loader是一个函数，接收文件内容然后进行转译，输出另外一种文件内容。在webpack的构建阶段被调用，webpack根据依赖找到资源后，会根据配置，调用对应的loader，同一个规则可以采用多个loader，loader按照顺序执行，上一个loader的输出会传递给下一个loader，最终输出到webpack的应该是js文本或者是ast
#### plugins：
plugin就是插件，在整个webpack编译过程中都会被使用。webpack在编译过程的各个地方都会广播出很多事件，plugin在初始化的时候就会绑定这些事件，webpack会传入当前的上下文信息等参数，然后回调函数里面通过调用api或者直接修改数据来堆webpack的流程做修改

### 4. babel原理
babel作用：修改我们的语法，把我们使用的新语法转译成旧版本的语法
babel内核很小，大部分功能使用插件来实现，比如加载插件的core，转化成ast的parser，遍历的traverse，生成代码的generate，还有各种语法插件，比如optional-chaining等，其中会使用preset-env来做一些插件的集合

1. 解析：解析分成词法分析和语法分析，词法分析会把代码切分成token，比如a+b就会分成三个token，a，+，b，语法分析把token转化成AST
2. 转换：遍历AST，然后根据转换规则，对AST树进行添加增加删除修改操作
3. 生成：把AST重新构建成代码并且输出


