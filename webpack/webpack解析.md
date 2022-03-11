[[万字总结] 一文吃透 Webpack 核心原理](https://zhuanlan.zhihu.com/p/363928061)

### 1. 初始化阶段
1. 初始化参数，获取options
2. 初始化编译器对象，初始化化compiler
3. 初始化编译环境，注入插件
4. 开始编译，执行compiler的run
5. 确认入口，根据entry找出入口文件，将入口文件转换成dependence对象
### 2. 构建阶段
1. 编译模块，根据entry对应的dependence创建module对象，调用loader将模块转译成标准js内容，调用js解释器转化成AST，找到依赖的模块，添加dependence到module上，然后递归查找
2. 最终生成依赖关系图
### 3. 生成阶段
1. 输出资源：根据入口和模块的依赖关系，组装成chunk，再把chunk转换成单独文件加入到输出列表
2. 写入文件系统

### 个人总结
1. 初始化阶段
2. 构建阶段：从入口开始，对每个模块
  1. 调用loader转成js
  2. 然后转成AST
  3. 根据查询依赖关系
  4. 递归
3. 生成阶段：生成chunk
4. 输出

### vue简单流程
1. main.js作为入口，然后读取引入的app.vue
2. vue-loader处理成js，acron转化成AST，webpack查找依赖，查找到ComA.vue和ComB.vue
3. 读取ComA内容，vue-loader处理成js，acron处理成AST，webpack查找不到更多依赖
4. ComB同理

# 1. 构建阶段
![依赖图片](https://pic1.zhimg.com/80/v2-27eb916f4247d91c5485420c983ba720_720w.jpg)

### 问题：
#### 编译过程webpack和babel干了什么？
webpack把源码使用acron解析成AST，然后仅遍历AST集合，找到依赖关系；babel则是对源码做等价转换

#### Webpack 编译过程中，如何识别资源对其他资源的依赖？
Webpack 遍历 AST 集合过程中，识别 require/ import 之类的导入语句，确定模块对其他资源的依赖关系

# 2. 生成阶段
通过入口文件的依赖来生成chunk，不同的入口会生成多个chunk，按照默认规则生成完成后，可以使用splitChunk来优化chunk
### 默认规则
- entry 及 entry 触达到的模块，组合成一个 chunk
- 使用动态引入语句引入的模块，各自组合成一个 chunk

# 3. plugins
#### 什么是插件？
- 插件是一个apply方法的类，apply方法在初始化阶段会执行，然后传入complier作为参数，在compiler中可以注册各种钩子回调
### 什么时候会触发钩子？
1. 触发时机：webpack从构建到生成阶段过程中都会有不同的钩子
2. 传递参数：根据调用钩子的时候，webpack正在进行什么处理来决定钩子的参数
## 钩子如何影响编译？
在钩子中可以通过修改状态、调用上下文api等方式对webpack当前的数据进行修改

# 4. loader
loader的工作就是在webpack根据依赖找到资源后，会把资源传到loader，理论上loader最终出来的应该是js文本或者AST，返回给webpack继续查询依赖

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

