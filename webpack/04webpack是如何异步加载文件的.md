# webpack分包后是如何进行异步加载的
## TL;DR
1. 尝试获取缓存内的模块
2. 如果没有，则尝试发起jsonp请求获取模块
3. 检查`installedChunks[id]`是否有相同的chunkid的请求中的模块，有则复用
4. 往`installedChunks[id]`上注册一个promise，返回给最外面的方法
5. 添加一个script标签，插入到文档中
6. 脚本下载完成后，调用window上的webpackJsonpCallback，把当前chunk上的module挂载在`__webpack_modules__`上，并且把`installedChunks[id]`设置成0，流转对应的promise状态
7. promise触发then方法，处理分包加载完成后的逻辑

## 详细
> webpack版本为`5.93.0`
源代码为
```js
// index.js
import('./print.js').then((res) => {
  console.log(res)
})
// print.js
export default function printMe() {
  console.log('I get called from print.js!');
}
```
webpack构建完成后，产生了两个js文件
1. `index.bundle.js`
2. `src_print_js.bundle.js`
打开index.bundle.js能看到
```js
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/

__webpack_require__.e(/*! import() */ "src_print_js")
  .then(__webpack_require__.bind(__webpack_require__, /*! ./print.js */ "./src/print.js"))
  .then((res) => {
    console.log(res)
  })
```
1. 调用`__webpack_require__.e`，传入文件地址
2. 调用`__webpack_require__`，传入文件地址
3. 调用回调
```js
/* webpack/runtime/ensure chunk */
(() => {
	__webpack_require__.f = {};
	// This file contains only the entry chunk.
	// The chunk loading function for additional chunks
	__webpack_require__.e = (chunkId) => {
    // 这里会调用__webpack_require__.f下面的所有方法，并且传递chunkid和promises进去
    // 在本场景中，实际上只有一个__webpack_require__.f.j被挂载了，实际传参就是__webpack_require__.f.j(chunkId, [])
		return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
			__webpack_require__.f[key](chunkId, promises);
			return promises;
		}, []));
	};
})();
```
```js
// 本场景中，调用的promise就是空数组[]
__webpack_require__.f.j = (chunkId, promises) => {
    // JSONP chunk loading for javascript
    // 这里__webpack_require__.o就是hasOwnProperty，尝试获取installedChunkData
		var installedChunkData = __webpack_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
		if(installedChunkData !== 0) { // 0 means "already installed".
			// a Promise means "currently loading".
      // 如果已经存在了，意思是多个文件都尝试获取同一个chunk，则添加已经生成完的promise然后返回
			if(installedChunkData) {
				promises.push(installedChunkData[2]);
			} else {
				if(true) { // all chunks have JS
					// setup Promise in chunk cache
          // 生成一个promise，并且保存resolve和reject回调，保存到installedChunks[chunkId]中
					var promise = new Promise((resolve, reject) => (installedChunkData = installedChunks[chunkId] = [resolve, reject]));
					promises.push(installedChunkData[2] = promise);

					// start chunk loading
          // 获取chunkid对应的url
					var url = __webpack_require__.p + __webpack_require__.u(chunkId);
					// create error before stack unwound to get useful stacktrace later
					var error = new Error();
          // 加载完成后，这里要注意的是，在本场景中，这个回调函数被调用的时候，
          // 理论上installedChunks[chunkId]已经被设置成0了，这里判断的是如果文件加载/执行失败的情况
					var loadingEnded = (event) => {
						if(__webpack_require__.o(installedChunks, chunkId)) {
              // 获取到promise
							installedChunkData = installedChunks[chunkId];
              // 重置成undefined，注意这里不是代表加载完成的0
							if(installedChunkData !== 0) installedChunks[chunkId] = undefined;
							if(installedChunkData) {
								var errorType = event && (event.type === 'load' ? 'missing' : event.type);
								var realSrc = event && event.target && event.target.src;
								error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
								error.name = 'ChunkLoadError';
								error.type = errorType;
								error.request = realSrc;
								installedChunkData[1](error);
							}
						}
					};
					__webpack_require__.l(url, loadingEnded, "chunk-" + chunkId, chunkId);
				}
			}
		}
};
```
下一步就是生成script标签并且插入
```js
/* webpack/runtime/load script */
// 整个函数的大概流程就是创建一个script然后插入到html上，添加回调
(() => {
	var inProgress = {};
	var dataWebpackPrefix = "webpack-demo:";
	// loadScript function to load a script via script tag
	__webpack_require__.l = (url, done, key, chunkId) => {
		if(inProgress[url]) { inProgress[url].push(done); return; }
		var script, needAttach;
		if(key !== undefined) {
			var scripts = document.getElementsByTagName("script");
			for(var i = 0; i < scripts.length; i++) {
				var s = scripts[i];
				if(s.getAttribute("src") == url || s.getAttribute("data-webpack") == dataWebpackPrefix + key) { script = s; break; }
			}
		}
		if(!script) {
			needAttach = true;
			script = document.createElement('script');
	
			script.charset = 'utf-8';
			script.timeout = 120;
			if (__webpack_require__.nc) {
				script.setAttribute("nonce", __webpack_require__.nc);
			}
			script.setAttribute("data-webpack", dataWebpackPrefix + key);
	
			script.src = url;
		}
		inProgress[url] = [done];
		var onScriptComplete = (prev, event) => {
			// avoid mem leaks in IE.
			script.onerror = script.onload = null;
			clearTimeout(timeout);
			var doneFns = inProgress[url];
			delete inProgress[url];
			script.parentNode && script.parentNode.removeChild(script);
			doneFns && doneFns.forEach((fn) => (fn(event)));
			if(prev) return prev(event);
		}
		var timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), 120000);
		script.onerror = onScriptComplete.bind(null, script.onerror);
		script.onload = onScriptComplete.bind(null, script.onload);
		needAttach && document.head.appendChild(script);
	};
})();
```
然后script被下载，然后执行
```js
"use strict";
// 主要看这里，调用了self["webpackChunkwebpack_demo"].push方法
(self["webpackChunkwebpack_demo"] = self["webpackChunkwebpack_demo"] || []).push([["src_print_js"],{

/***/ "./src/print.js":
/*!**********************!*\
  !*** ./src/print.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ printMe)
/* harmony export */ });
function printMe() {
  console.log('I get called from print.js!');
}
/***/ })
}]);
```
下载完成后，执行window上的`self["webpackChunkwebpack_demo"].push`方法来注册模块
```js
	// install a JSONP callback for chunk loading
	var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
		var [chunkIds, moreModules, runtime] = data;
    // chunkIds: ["src_print_js"]
    // moreModules: {'src_print_js': 模块函数}
		// add "moreModules" to the modules object,
		// then flag all "chunkIds" as loaded and fire callback
		var moduleId, chunkId, i = 0;
    // 存在非加载完成的chunk
		if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
      // 遍历。然后使用ownProperty来过滤原型链上的属性
			for(moduleId in moreModules) {
				if(__webpack_require__.o(moreModules, moduleId)) {
          // 把对应的module挂载到__webpack_modules__上
					__webpack_require__.m[moduleId] = moreModules[moduleId];
				}
			}
			if(runtime) var result = runtime(__webpack_require__);
		}
		if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
		for(;i < chunkIds.length; i++) {
			chunkId = chunkIds[i];
			if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
        // 执行chunk的resolve方法，流转对应的promise状态
				installedChunks[chunkId][0]();
			}
      // 设置成加载完成
			installedChunks[chunkId] = 0;
		}
	
	}
	
	var chunkLoadingGlobal = self["webpackChunkwebpack_demo"] = self["webpackChunkwebpack_demo"] || [];
	chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
  // self["webpackChunkwebpack_demo"].push实际上调用的就是webpackJsonpCallback方法
	chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
```



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