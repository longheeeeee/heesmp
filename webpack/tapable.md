webpack的plugin是基于tapable实现的，用于实现一系列事件的发布订阅api。

## 钩子使用
tapable提供了九种不同的钩子方法，其中最简单的`SyncHook`使用方法如下：
```ts
// 初始化同步钩子，这里参数值不重要，重要的是参数的个数
const hook = new SyncHook(["arg1", "arg2", "arg3"]);

// 注册事件，第一个参数只是一个标志位，第二个参数是回调方法
hook.tap('flag1', (arg1,arg2,arg3) => {
    console.log('flag1:',arg1,arg2,arg3)
})

hook.tap('flag2', (arg1,arg2,arg3) => {
    console.log('flag2:',arg1,arg2,arg3)
})

// 调用事件并传递执行参数
hook.call('19Qingfeng','wang','haoyu')

// 打印结果
flag1: 19Qingfeng wang haoyu
flag2: 19Qingfeng wang haoyu
```

## 钩子方法分类
### 根据同步/异步进行区分
1. Sync同步
    1. SyncHook
    2. SyncBailHook
    3. SyncWaterfallHook
    4. SyncLoopHook
2. Async异步
    1. series 串行
        1. AsyncSeriesHook
        2. AsyncSeriesBailHook
        3. ASyncSeriesWaterfallHook
    2. paralle 并行
        1. AsyncParalleHook
        2. AsyncBailHook


- 同步钩子使用tap进行绑定，使用call触发事件
- 异步钩子使用tap/tabAsync/tapPromise三种方法来注册，使用call/callAsync/promise进行触发
    - 串行：按照顺序连续调用
    - 并行：并发调用

### 根据执行机制分类
- basic hook：基本类型，不关心返回值，只执行钩子注册的事件
- waterfall：瀑布类型，会把返回值传递给下一个事件
- bail hook：保险类型，任意一个返回非undefined的值，就会退出流程
- loop hook：循环类型，任意一个返回非undefined的值，就会重新执行第一个hook

## 全部钩子用法
### synchook
最基本的钩子
```js
const { SyncHook } = require('tapable');

// 初始化同步钩子
const hook = new SyncHook(['arg1', 'arg2', 'arg3']);

// 注册事件
hook.tap('flag1', (arg1, arg2, arg3) => {
  console.log('flag1:', arg1, arg2, arg3);
});

hook.tap('flag2', (arg1, arg2, arg3) => {
  console.log('flag2:', arg1, arg2, arg3);
});

// 调用事件并传递执行参数
hook.call('19Qingfeng', 'wang', 'haoyu');
// 打印结果
flag1: 19Qingfeng wang haoyu
flag2: 19Qingfeng wang haoyu
```

### SynaBailHook 同步保险钩子
其中一个返回非undefined值，就会退出流程
```js
const { SyncBailHook } = require('tapable');

const hook = new SyncBailHook(['arg1', 'arg2', 'arg3']);

// 注册事件
hook.tap('flag1', (arg1, arg2, arg3) => {
  console.log('flag1:', arg1, arg2, arg3);
  // 存在返回值 阻断flag2事件的调用
  return true
});

hook.tap('flag2', (arg1, arg2, arg3) => {
  console.log('flag2:', arg1, arg2, arg3);
});

// 调用事件并传递执行参数
hook.call('19Qingfeng', 'wang', 'haoyu');
// 打印结果
flag1: 19Qingfeng wang haoyu
```

### SyncWaterfallHook 同步瀑布钩子
类似于pipe/compose，上一个hook的的非undefined返回值会传递到下一个hook的第一个参数，不过要注意的是，只能修改第一个参数
```js
// 初始化同步钩子
const hook = new SyncWaterfallHook(['arg1', 'arg2', 'arg3']);

// 注册事件
hook.tap('flag1', (arg1, arg2, arg3) => {
  console.log('flag1:', arg1, arg2, arg3);
  // 存在返回值 修改flag2函数的实参
  return 'github';
});

hook.tap('flag2', (arg1, arg2, arg3) => {
  console.log('flag2:', arg1, arg2, arg3);
});

hook.tap('flag3', (arg1, arg2, arg3) => {
  console.log('flag3:', arg1, arg2, arg3);
});

// 调用事件并传递执行参数
hook.call('19Qingfeng', 'wang', 'haoyu');
// 输出结果
flag1: 19Qingfeng wang haoyu
flag2: github wang haoyu
```

### SyncLoopHook 同步循环钩子
执行过程中，如果其中一个hook返回了非undefined的值，则会重新执行流程
```js
let flag1 = 2;
let flag2 = 1;

// 初始化同步钩子
const hook = new SyncLoopHook(['arg1', 'arg2', 'arg3']);

// 注册事件
hook.tap('flag1', (arg1, arg2, arg3) => {
  console.log('flag1');
  if (flag1 !== 3) {
    return flag1++;
  }
});

hook.tap('flag2', (arg1, arg2, arg3) => {
  console.log('flag2');
  if (flag2 !== 3) {
    return flag2++;
  }
});

// 调用事件并传递执行参数
hook.call('19Qingfeng', 'wang', 'haoyu');
// 执行结果
flag1
flag1
flag2
flag1
flag2
flag1
flag2
```

### AsyncSeriesHook 异步串行钩子
注册的钩子会异步串联执行
```js
// 初始化同步钩子
const hook = new AsyncSeriesHook(['arg1', 'arg2', 'arg3']);

console.time('timer');

// 注册事件
hook.tapAsync('flag1', (arg1, arg2, arg3, callback) => {
  console.log('flag1:', arg1, arg2, arg3);
  setTimeout(() => {
    // 1s后调用callback表示 flag1执行完成
    callback();
  }, 1000);
});

hook.tapPromise('flag2', (arg1, arg2, arg3) => {
  console.log('flag2:', arg1, arg2, arg3);
  // tapPromise返回Promise
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
});

// 调用事件并传递执行参数
hook.callAsync('19Qingfeng', 'wang', 'haoyu', () => {
  console.log('全部执行完毕 done');
  console.timeEnd('timer');
});
// 打印结果
flag1: 19Qingfeng wang haoyu
flag2: 19Qingfeng wang haoyu
全部执行完毕 done
timer: 2.012s
```
Async的方法有三种绑定方式，
1. tapAsync，使用callback回调，调用的时候表示当前hook执行完成，第一个参数传入err，第二个传入返回值
2. tapPromise，返回Promise，reject的时候代表错误

### AsyncSeriesBailHook 异步串行保险钩子
```js
// 初始化同步钩子
const hook = new AsyncSeriesBailHook(['arg1', 'arg2', 'arg3']);

console.time('timer');

// 注册事件
hook.tapPromise('flag1', (arg1, arg2, arg3, callback) => {
  console.log('flag2:', arg1, arg2, arg3);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // resolve函数存在任何值表示存在返回值
      // 存在返回值 bail保险打开 中断后续执行
      resolve(true);
    }, 1000);
  });
});

// flag2 不会被执行了
hook.tapAsync('flag2', (arg1, arg2, arg3,callback) => {
  console.log('flag1:', arg1, arg2, arg3);
  setTimeout(() => {
    callback();
  }, 1000);
});

// 调用事件并传递执行参数
hook.callAsync('19Qingfeng', 'wang', 'haoyu', () => {
  console.log('全部执行完毕 done');
  console.timeEnd('timer');
});
// 打印结果
flag2: 19Qingfeng wang haoyu
全部执行完毕 done
timer: 1.012s
```
resolve有值，或者是callback有返回值，则停止执行

## AsyncSeriesWaterfallHook 异步串行瀑布钩子
```js
// 初始化同步钩子
const hook = new AsyncSeriesWaterfallHook(['arg1', 'arg2', 'arg3']);

console.time('timer');

// 注册事件
hook.tapPromise('flag1', (arg1, arg2, arg3) => {
  console.log('flag2:', arg1, arg2, arg3);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, 1000);
  });
});

hook.tapAsync('flag2', (arg1, arg2, arg3, callback) => {
  console.log('flag1:', arg1, arg2, arg3);
  setTimeout(() => {
    callback();
  }, 1000);
});

// 调用事件并传递执行参数
hook.callAsync('19Qingfeng', 'wang', 'haoyu', () => {
  console.log('全部执行完毕 done');
  console.timeEnd('timer');
});
// 输出结果
flag2: 19Qingfeng wang haoyu
flag1: true wang haoyu
全部执行完毕 done
timer: 2.012s
```
resolve一个值或callback的第二个参数，可以把返回值传递给下一个事件，会替换事件触发参数的第一个参数

## AsyncParallelHook 异步并行钩子
```js
// 初始化同步钩子
const hook = new AsyncParallelHook(['arg1', 'arg2', 'arg3']);

console.time('timer');

// 注册事件
hook.tapPromise('flag1', (arg1, arg2, arg3) => {
  console.log('flag2:', arg1, arg2, arg3);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, 1000);
  });
});

hook.tapAsync('flag2', (arg1, arg2, arg3, callback) => {
  console.log('flag1:', arg1, arg2, arg3);
  setTimeout(() => {
    callback();
  }, 1000);
});

// 调用事件并传递执行参数
hook.callAsync('19Qingfeng', 'wang', 'haoyu', () => {
  console.log('全部执行完毕 done');
  console.timeEnd('timer');
});
// 执行结果
flag2: 19Qingfeng wang haoyu
flag1: 19Qingfeng wang haoyu
全部执行完毕 done
timer: 1.010s
```

## AsyncParallelBailHook 异步并行保险钩子
```js
// 初始化同步钩子
const hook = new AsyncParallelBailHook(['arg1', 'arg2', 'arg3']);

console.time('timer');

// 注册事件
hook.tapPromise('flag1', (arg1, arg2, arg3) => {
  return new Promise((resolve, reject) => {
    console.log('flag1 done:', arg1, arg2, arg3);
    setTimeout(() => {
      resolve(true);
    }, 1000);
  });
});

hook.tapAsync('flag2', (arg1, arg2, arg3, callback) => {
  setTimeout(() => {
    console.log('flag2 done:', arg1, arg2, arg3);
    callback();
  }, 3000);
});

hook.callAsync('19Qingfeng', 'wang', 'haoyu', () => {
  console.log('全部执行完毕 done');
  console.timeEnd('timer');
});

// 执行结果
flag1 done: 19Qingfeng wang haoyu
全部执行完毕 done
timer: 1.013s
flag2 done: 19Qingfeng wang haoyu
```
这里有个特殊点在于，flag1在1000ms的时候返回了true，所以flag2虽然定时了3000ms，但是并没有等待结束，就直接中断了整个流程，所以1000ms的时候就触发执行完毕了，在后续3000ms的时候再出发flag2的计时器

## 拦截器
```js
const hook = new SyncHook(['arg1', 'arg2', 'arg3']);

hook.intercept({
  // 每次调用 hook 实例的 tap() 方法注册回调函数时, 都会调用该方法,
  // 并且接受 tap 作为参数, 还可以对 tap 进行修改;
  register: (tapInfo) => {
    console.log(`${tapInfo.name} is doing its job`);
    return tapInfo; // may return a new tapInfo object
  },
  // 通过hook实例对象上的call方法时候触发拦截器
  call: (arg1, arg2, arg3) => {
    console.log('Starting to calculate routes');
  },
  // 在调用被注册的每一个事件函数之前执行
  tap: (tap) => {
    console.log(tap, 'tap');
  },
  // loop类型钩子中 每个事件函数被调用前触发该拦截器方法
  loop: (...args) => {
    console.log(args, 'loop');
  },
});
```
大概是有这么个功能，但是这个功能是在hook层面上做的，我理解我们使用hook的时候应该就是使用hook.tap去挂载方法，这个拦截器应该是webpack在使用tapable的时候使用的，webpack plugin开发者不应该会接触到这个

## tapable实现原理
比较复杂，优先级降低

## 来源
[相关文章](https://juejin.cn/post/7040982789650382855)