# 心智模型
## 主要区别
1. 可变数据结构：vue
2. 不可变数据结构： react
## Vue
- vue使用的是`拥有数据与行为且自响应式的对象`，vue底层使用proxy进行依赖收集和派发，使用上从之前的classComponent到现在的compositionAPI其实本质上都是生成一个对象，对象里面拥有响应式的数据，数据的变化导致渲染和副作用的执行。
- 所以vue在大体上会更偏向于可变数据结构，偏向于传统的OOP形式
## React
- react在hook出现之后更加偏向于函数式编程的思想，组件通过执行render这个函数来生成渲染数据，在render中通过旧的state和固定顺序的hook来计算出新的state，基于新的数据来生成新的事件等等。并且在修改数据的时候也不是同步修改，而是修改state然后在新的rander中才能获取新的数据。
- 基于这种不可变的结构的渲染流程，react在concurrentMode中实现了可中断的更新、包括分时、优先级等功能
## 状态管理
但是我们在依赖状态管理的时候，当大多数数据都存放在组件以外进行管理，那么vue和react的差别就会变得很小，因为组件都变成了dummy component

# 背景
- Vue是个人开发者，包袱小，对于大改动没有太大的心里负担。
- react背靠公司，但是技术债比较大，改动需要兼顾公司内部的现状，并且如果公司内部对框架没有太大更新意愿的话，react的迭代会变得很慢，比如18的concurrentMode推了这么久都没强制实装。

# 用法
结合以上，能推断出来一些用法的差异。
vue更加简单易上手，语法更简单、内置的API更丰富。
react
1. 更难懂，对JS掌握不深的容易出现性能问题，比如闭包、memo等。
2. 更灵活，我可以选择使用组件去封装代码，也可以使用一个返回jsx的function，组件可以通过参数传递，不需要使用slot这个概念

# 参考文章
- [【由浅到深】聊聊 Vue 和 React 的区别，看看你在哪个段位](https://juejin.cn/post/7238199999733088313)


# 心智模型的学习
> 是不是有基于 Monad 的 Haskell 内味了？只不过 React 把 API 做得完全不需要你弄懂这些复杂的东西[4]。如果你不熟悉 Monad 这个纯 FP 的概念，我们可以先不严谨[5]得把它当做文中的「上下文」。扔出 M-bomb 的原因是大家通常把它作为在纯 FP 中处理副作用的标杆，帮助我们展示如何把 React 归约到纯 FP。

react的render function像是基于monad，但是monad是如何处理副作用的？跟react的相似之处在什么地方？

> 5.React 上下文的组合是通过调用顺序在运行时里维护一个链表而非基于参数化多态的层叠（比如 Monad Transformer）来表达，可以看到都是线性的。
1. react的state并不是一个组件共享同一个state，而是不同的hook会有各自的state。上下文组合是什么意思？
2. 参数化多态的层叠是什么意思？参数化多态就是[T] -> [T]，我只需要切割，不用管传入的是木材还是钢材
3. Monad Transformer是什么？
4. 我理解的意思是，react上下文组合是通过链表，而不是层叠，但是都是线性的，所以可以不严谨的把monad当成react的上下文

- [多态](https://zhan-ge.gitbooks.io/scala/content/abstract-and-self-types/polymorphism.html)
- [多态都不知道，谈什么对象](https://blog.cc1234.cc/posts/polymorphism/)