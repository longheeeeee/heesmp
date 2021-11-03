## 为什么需要__esModule？
这个问题的答案很简单：为了解决esm中的export default和cjs不兼容的问题

## 历史缘由
### 标准制定
在cjs时代，大家都是用着下面的语法去实现模块化：
```js
// 导出
module.exports = function myFun() {}
// 或者
exports.add = function () {}

// 引入
const myFun = require('myModule')
// 或者
const { add } = require('myModule')
```
在制定esm规范的时候，需要兼容当前流行的cjs规范，在导出多个“东西”的情况下，可以使用`export const add`来对应`exports.add = add`，但是经过大佬们的观察和统计，发现目前npm上大多数包使用的都是`module.exports=xxx`，大家都只导出了一个“东西”

所以为了兼容这种情况，esm选择了`export default`这个语法来对应cjs上的`module.exports`
```js
module.exports = function myFun() {}
// 等同于
export default function myFun() {}
```
### 标准实施
在指定了标准之后，在使用的时候如何能够兼容旧有的逻辑呢？在esm还没有被node和浏览器完全支持之前，esm就需要被转化成cjs规范以使得使用新语法的库能用

比如现在有一个使用esm语法写的包
```js
export const add = () => {}
export default myLib
```
那么如何才能使得这个esm的包转成cjs语法呢？因为`module.exports`被等同于`export default`，但是如果简单的把`export default myLab`转换成`module.exports = myLib`，这会带来一个问题，那我定义的`export const add`应该怎么放呢？

在使用上，`export const add`和`export default myLib`实际上导出的是两个东西，大致上可以把`export default`理解成`export { myLib as default}`，导出的其实是两个`named export`

回到上面的问题，`export const add`如果转换成`exports.add = add`，这样就会带来一个新的问题，转化后myLib就跟add绑定上了，`myLib.add = add`，这个跟我们本意上其实是不相符的，所以转化的时候只能转化成
```js
exports.default = myLib
exports.add = add
```
现在在使用上虽然奇怪了点，但好歹还是能用的：
```js
const myModule = require('myModule')
const myLib = myModule.default
const add = myModule.add
```
那么新的问题又来了：如果我在esm语法上使用这个包呢？

esm在引入cjs的时候也遵循这个`module.exports = myLib`等于`export default myLib`这个转换规律，那么正常的cjs包`module.exports = myLib`就会被包裹成`{default: myLib}`，当`import myLib from 'myModule'`就能正常引入了

如此一来，上面由esm转化出来的cjs在被打包工具当成一个普通cjs包进行引入时，就会被包裹成
```js
{
  default: {
    default: myLib,
    add: add
  }
}
```
使用上就会变成
```js
import MyModule from 'myModule'
const myLib = myModule.default
const add = myModule.add
```
一个esm的包经过打包工具的导出和引入之后，使用上跟直接使用esm引入却不一样了

那么如何可以让打包工具知道这个包其实原本就是个esm包，不需要再进行包裹呢？答案就是`__esModule`，当打包工具发现`exports.__esModule`的时候，就不会对这个包进行再一步的包裹
```js
import MyModule, { add } from 'myModule'
```

本文参考文章
- [球球你们，别再用export default了。](https://zhuanlan.zhihu.com/p/97737035)
- [续·别再用export default了](https://zhuanlan.zhihu.com/p/98101010)
- [深入解析ES Module（一）：禁用export default object](https://zhuanlan.zhihu.com/p/40733281)
- [__esModule 的作用](https://toyobayashi.github.io/2020/06/29/ESModule/)