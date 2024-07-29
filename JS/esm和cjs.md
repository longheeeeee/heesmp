# 使用方法
## cjs
```js
// 以下三种是等价的
module.exports = { name: 123}
module.exports.name = 123
exports.name = 123

const { name } = require('./lib.js')
const lib = require('./lib.js')
```
在执行文件的时候，会先创建`module.exports`，赋值一个空对象，然后把`exports`指向这个对象，这会产生几个问题
1. 重新赋值`exports`没有意义
2. `module.exports = {}`后，`exports`没有意义，因为最终导出的还是`module.exports`
## esm
```js
// 两种导出方式，default主要是兼容旧的cjs规范
export const name = 123
export default { name: 123 }

// 拿到单独export的值
import { name } from './lib.js'
// 拿到default的值
import lib from './lib.js'
// 两个都获取
import lib, { name } from './lib.js'
// 两种不同的别名
import lib as myLib from './lib.js'
import { name as myName } from './lib.js'
// 在没有export default的情况下，或者写库想要批量导入导出的时候可以使用*来获取所有
import * as lib from './lib.js'
```
# 区别
1. cjs是在es6之前，在nodejs中广泛使用的模块规范，很多的库也是使用cjs来进行导出
2. esm是es6进行引入的，作为官方的模块规范
3. cjs是运行时加载，esm是编译时加载
4. cjs是值拷贝，esm是值引用
5. cjs的语法是动态的，esm是静态的
6. cjs导入的变量就是普通的变量，esm是一个只读的引用
7. cjs不支持异步，esm支持

# 导入的语法实现不一致
esm和cjs导出都是导出一个对象，这个对象也不会重复生成，但是导入语法的实现会功能导致有差异
```js
// cjs导出
const lib = { name: 123 }
module.export = lib
// esm导出
export let name = 123
```
在引入的时候，分别使用不同的语法
```js
// 使用解构的情况下，name就是一个普通变量，并且会在这行执行的时候进行赋值
const { name } = require('./lib.js')
// 如果不使用解构，那么引入的时候就是lib导出的整个变量了
const lib = require('./lib.js')
// 在这种情况下，lib.name是可以改变的，lib这个变量指向的就是lib.js导出的对象
console.log(lib.name)

// 而在esm的情况下，这个name实际上是一个引用，不是一个const生成出来的变量，同时这个name也不能被重新赋值
import { name } from './lib.js'
// 在lib中被改变了，这里也会被改变
console.log(name)
```
这种实现就会导致几种不同的区别
1. cjs是运行时加载，esm是编译时加载
    - 在循环引用的情况下，A引B，B引A的时候A还没进行导出，B就拿不到值(这是一个const值)，esm中会提前生成导出的对象，对象上会有对应的字段(虽然暂时没值)，B引A是可以拿到A的引用的，后面赋值后就可以使用了
2. cjs是值拷贝，esm是值引用
3. cjs导入的变量就是普通的变量，esm是一个只读的引用

## tree shaking
因为esm是静态的，export和import语句都必须在顶层，不能使用if进行判断，所以可以根据调用链来进行treeshaking

# 互相转换
## ESM to CJS
1. esm中的`default`会被转成`module.exports.default`，变成一个普通的导出值
2. esm中导出的对象会使用getter进行包裹，作为引用导出，同时无法进行改变

## CJS to ESM
1. cjs导出的整个`module.exports`会被转化成`default`，没有具名导出，同时这也是esm明明拥有具名导出就足够了，但是还添加了`default`导出的原因



# 参考文章
- [经典面试题：ES6 module和CommonJS到底有什么区别？记住这5点！](https://juejin.cn/post/7096052771064905735)
- [本想搞清楚ESM和CJS模块的互相转换问题，没想到写完我的问题更多了](https://juejin.cn/post/7158231134743035911?from=search-suggest)

