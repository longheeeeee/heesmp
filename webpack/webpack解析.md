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
