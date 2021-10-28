## 编写源文件
首先编写一下源文件，包括两个模块文件和一个入口文件：
#### cjs
```js
console.log('i am cjs.js')
function cjs1 () {}
function cjs2 () {}
module.exports = cjs1
module.exports.cjs2 = cjs2 // cjs1.cjs2 = cjs2
```

#### es
```js
console.log('i am es.js')
export const esVar1 = 'esVar1'
export const esVar2 = 'esVar2'
export default 'es.js default export'
```

#### index.js
```js
import cjs1, { cjs2 } from './cjs.js'
import es, {esVar1} from './es.js'
console.log('i am index.js')
console.log('cjs1', cjs1)
console.log('cjs2', cjs2)
console.log('es', es)
console.log('esVar1', esVar1)
```

这边cjs和es混合写是因为webpack会对这个做特殊的处理，详细看下面解析：

## 打包后文件
当前webpack打包版本是v5.59.1，代码里面已经去掉了不必要的注释
```js
// 整个文件是一个iife
(() => {
// 这里存放所有的引用进来的文件模块，key为项目根目录的相对路径，value是一个函数
  var __webpack_modules__ = ({
    // 函数输出的就是module
    "./src/cjs.js": ((module) => {
        console.log('i am cjs.js')
        function cjs1() { }
        function cjs2() { }
        module.exports = cjs1
        module.exports.cjs2 = cjs2 // cjs1.cjs2 = cjs2
      }),

    "./src/es.js": ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
        "use strict";
        // 这里可以先看下面工具函数的定义再回头看
        __webpack_require__.r(__webpack_exports__);
        __webpack_require__.d(__webpack_exports__, {
          "esVar1": () => (esVar1),
          "esVar2": () => (esVar2),
          "default": () => (__WEBPACK_DEFAULT_EXPORT__)
        });
        console.log('i am es.js')
        const esVar1 = 'esVar1'
        const esVar2 = 'esVar2'
        const __WEBPACK_DEFAULT_EXPORT__ = ('es.js default export');
      })
  });

  // 模块的缓存，key为路径，value是模块执行之后返回的结果
  var __webpack_module_cache__ = {};

  // 根据路径(moduleId)获取模块的内容
  // 先尝试从缓存获取，如果没有的话从原始表里获取，执行后缓存并返回
  function __webpack_require__(moduleId) {
    // 尝试从缓存中获取
    var cachedModule = __webpack_module_cache__[moduleId];
    if (cachedModule !== undefined) {
      return cachedModule.exports;
    }
    // 没有的话
    // 先定义放置模块出口的容器
    var module = __webpack_module_cache__[moduleId] = {
      exports: {}
    };
    // 执行原始表里面的函数，函数会把返回值挂载到刚刚定义的module上
    __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
    return module.exports;
  }

  // 这里由于ejs和esm的定义差异，所以esm模块需要做一个标记，
  // 如果是esm模块的话返回module.export
  // TODO 这块内容会新开文章进行阐述
  (() => {
    // 返回一个getter函数，这个函数会根据module是否是esm模块来做不同的返回
    __webpack_require__.n = (module) => {
      var getter = module && module.__esModule ?
        () => (module['default']) :
        () => (module);
      // TODO 不知道什么操作，在getter上面定义一个a，然后值是自己，形成一个循环引用
      __webpack_require__.d(getter, { a: getter });
      return getter;
    };
  })();

  (() => {
    // 在exports上做一层代理，返回definition上的键值对
    __webpack_require__.d = (exports, definition) => {
      for (var key in definition) {
        // 这里加一层判断的原因是forin会迭代原型链上的方法，这里只需要对definition自身上的属性即可
        if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
          // 这里做代理，getter返回的是definition上的属性
          Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
        }
      }
    };
  })();

  (() => {
    // hasOwnProperty快捷方式
    __webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
  })();

  (() => {
    // 在esm模块上定义一个__esModule
    __webpack_require__.r = (exports) => {
      if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
        // 设置了这个之后，使用exports.toString()会返回'[object Module]'
        Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
      }
      Object.defineProperty(exports, '__esModule', { value: true });
    };
  })();

  // 因为index.js是一个esm的文件
  var __webpack_exports__ = {};
  (() => {
    "use strict";
    // 所以这里要定义一下指明__webpack_exports__是一个esm，虽然没有用到就是啦
    __webpack_require__.r(__webpack_exports__);

    var _cjs_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./cjs.js */ "./src/cjs.js");
    var _cjs_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_cjs_js__WEBPACK_IMPORTED_MODULE_0__); // /*#__PURE__*/这玩意用来指明这东西没有副作用
    var _es_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./es.js */ "./src/es.js");


    console.log('i am index.js')
    console.log('cjs1', (_cjs_js__WEBPACK_IMPORTED_MODULE_0___default()))
    console.log('cjs2', _cjs_js__WEBPACK_IMPORTED_MODULE_0__.cjs2)
    console.log('es', _es_js__WEBPACK_IMPORTED_MODULE_1__["default"])
    console.log('esVar1', _es_js__WEBPACK_IMPORTED_MODULE_1__.esVar1)
  })();

})();

```


## 疑惑
在我的理解中，__esModule应该是用来抹平esm和cjs导出引入之间的差异的，可是感觉webpack并没有使用到？
```js
  // 因为index.js是一个esm的文件
  var __webpack_exports__ = {};
  (() => {
    "use strict";
    // 所以这里要定义一下指明__webpack_exports__是一个esm，虽然没有用到就是啦
    __webpack_require__.r(__webpack_exports__);

    var _cjs_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./cjs.js */ "./src/cjs.js");
    var _cjs_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_cjs_js__WEBPACK_IMPORTED_MODULE_0__); // /*#__PURE__*/这玩意用来指明这东西没有副作用
    var _es_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./es.js */ "./src/es.js");


    console.log('i am index.js')
    console.log('cjs1', (_cjs_js__WEBPACK_IMPORTED_MODULE_0___default()))
    console.log('cjs2', _cjs_js__WEBPACK_IMPORTED_MODULE_0__.cjs2)
    // TODO 这里我还是有疑惑的，明明都写了一个__esModule来使用了，可是为什么偏偏是cjs定义的default使用了(实际上也没用上)，可是esm的反而手动加上了["default"]？
    console.log('es', _es_js__WEBPACK_IMPORTED_MODULE_1__["default"])
    console.log('esVar1', _es_js__WEBPACK_IMPORTED_MODULE_1__.esVar1)
  })();
```
我以为应该是下面这个样子的

```js
  var __webpack_exports__ = {};
  (() => {
    "use strict";
    __webpack_require__.r(__webpack_exports__);
    var _cjs_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./cjs.js */ "./src/cjs.js");
    var _cjs_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_cjs_js__WEBPACK_IMPORTED_MODULE_0__);
    var _es_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./es.js */ "./src/es.js");
    // 难道不是应该跟上面一样包一层来解决转换问题？
    var _es_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_es_js__WEBPACK_IMPORTED_MODULE_1__);


    console.log('i am index.js')
    console.log('cjs1', (_cjs_js__WEBPACK_IMPORTED_MODULE_0___default()))
    console.log('cjs2', _cjs_js__WEBPACK_IMPORTED_MODULE_0__.cjs2)
    console.log('es', _es_js__WEBPACK_IMPORTED_MODULE_1__["default"])
    // 然后这里应该是下面这种写法？
    console.log('es', (_es_js__WEBPACK_IMPORTED_MODULE_1___default()))
    console.log('esVar1', _es_js__WEBPACK_IMPORTED_MODULE_1__.esVar1)
  })();
```
