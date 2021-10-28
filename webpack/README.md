此块笔记基于是[Webpack原理与实践](https://kaiwu.lagou.com/course/courseInfo.htm?courseId=88#/content)的二手笔记

遗留问题：
webpack生成出来的代码具体是什么样的
webpack如何远程加载代码
umd格式是如何实现
plugin是否能代替loader

在学习webpack打包出来的代码的时候发现几个有疑惑的东西
1. __esModule是个什么东西？存在的意义是什么？
2. cjs打包出来和esm打包出来的东西有什么区别？

然后看到了两篇文章：
[球球你们，别再用export default了。](https://zhuanlan.zhihu.com/p/97737035)
[续·别再用export default了](https://zhuanlan.zhihu.com/p/98101010)
这两篇文章里面能看到__esModule的产生原因

[深入解析ES Module（一）：禁用export default object](https://zhuanlan.zhihu.com/p/40733281)
这里有看到对esm的详细解析

[__esModule 的作用](https://toyobayashi.github.io/2020/06/29/ESModule/)
也是解析了__esModule的问题