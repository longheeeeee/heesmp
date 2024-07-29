# webpack分包后是如何进行同步加载的
> webpack版本为`5.93.0`
上面提到的都是调用`import()`语法进行懒加载的情况，那么我们经常使用的，把react/loadsh等包进行分包后，但同时是同步加载，那webpack又是如何执行代码的呢？

如果我们在index.js里面引用了lodash，并且把lodash使用splitChunk进行了分包，那么最终将会打成两个包：
1. `vendors-node_modules_lodash_lodash_js.bundle.js`
2. `index.bundle.js`
在使用`htmlWebpackPluginhtml`中生成的代码如下
```html
  <head>
    <meta charset="utf-8">
    <title>管理输出</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script defer src="vendors-node_modules_lodash_lodash_js.bundle.js"></script>
    <script defer src="index.bundle.js"></script>
  </head>
```
能看到两个文件都是使用defer进行加载，那么webpack又是如何保证我在执行index.js的时候lodash已经加载完成了呢？

我们来查看`index.js`的代码
```js
var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors-node_modules_lodash_lodash_js"], () => (__webpack_require__("./src/index.js")))
```
在最后能看到，`index.js`的代码并没有直接执行，而是传入了`__webpack_require__.O`之中
```js
/* webpack/runtime/chunk loaded */
(() => {
	var deferred = [];
  // 这个方法有两种入口，一是index.js里面调用，会带上依赖数组
  // 二是webpackJsonpCallback里面调用，没有依赖数组
	__webpack_require__.O = (result, chunkIds, fn, priority) => {
    // 带上依赖数组的话，就只是会添加到deferred上
		if(chunkIds) {
			priority = priority || 0;
			for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
			deferred[i] = [chunkIds, fn, priority];
			return;
		}
		var notFulfilled = Infinity;
    // 没有依赖数组的话，是在webpackJsonpCallback中，当一个bundle加载完成后调用
    // 遍历所有等待的依赖数组
		for (var i = 0; i < deferred.length; i++) {
			var [chunkIds, fn, priority] = deferred[i];
			var fulfilled = true;
      // 遍历单个依赖数组中的所有依赖
			for (var j = 0; j < chunkIds.length; j++) {
        // 如果已经加载完成了，则删除
				if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
					chunkIds.splice(j--, 1);
				} else {
					fulfilled = false;
					if(priority < notFulfilled) notFulfilled = priority;
				}
			}
      // 如果所有依赖都完成了，则执行
			if(fulfilled) {
				deferred.splice(i--, 1)
				var r = fn();
				if (r !== undefined) result = r;
			}
		}
		return result;
	};
})();

__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
```