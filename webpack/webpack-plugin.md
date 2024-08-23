# 常见的概念和hook
1. compiler Hook
2. compilation Hook
3. ContextModuleFactory Hook
4. JavascriptParser Hooks
5. NormalModuleFactory Hooks

# complier
是一个单例对象，在首次执行webpack的时候创建，贯穿整个编译周期。我们可以通过这个对象来获取到编译的一些配置，比如loader、plugin等
- complier.option，可以访问编译过程中webpack的完整配置信息
- complier.inputFileSystem，可以操作文件，简单理解成node的fs模块
- complier.hooks，可以在complier生命周期中植入不同逻辑
在apply里面会直接传入
```js
class DonePlugin {
  apply(compiler) {
    // 调用 Compiler Hook 注册额外逻辑
    compiler.hooks.done.tapAsync('Plugin Done', (stats, callback) => {
      console.log(compiler, 'compiler 对象');
    });
  }
}
```

# compliation
单次编译生成的对象，在普通的编译，整个编译流程只会生成一个compliation，如果是在--watch的情况下，每一次触发更新都会生成一个新的compliation

compliation对象会对构建依赖图中的所有模块进行编译，在编译阶段，会执行模块的加载load，封存seal，优化optimize，分块chunk，哈希hash，和重新创建restore。

在compliation对象中，我们可以操作本次编译的模块、输出的模块、变化的文件等数据，同时也导出了不同的hook可供调用

- compliation.module，一个Set类型，包含所有的模块，简单可以认为是每个文件就是一个模块
- compliation.chunks，一个Set类型，包含所有的chunk，多个文件根据依赖生成一个chunk
- compliation.assets，记录了本次打包生成的所有文件的结果
- compliation.hooks，导出的编译阶段的生命周期

在一些compiler的hook中可以访问到这个对象
```js
class DonePlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tapAsync(
      'Plugin Done',
      (compilation, callback) => {
        console.log(compilation, 'compilation 对象');
      }
    );
  }
}
```

# ContextModuleFactory Hook
```js
class DonePlugin {
  apply(compiler) {
    compiler.hooks.contextModuleFactory.tap(
      'Plugin',
      (contextModuleFactory) => {
        // 在 require.context 解析请求的目录之前调用该 Hook
        // 参数为需要解析的 Context 目录对象
        contextModuleFactory.hooks.beforeResolve.tapAsync(
          'Plugin',
          (data, callback) => {
            console.log(data, 'data');
            callback();
          }
        );
      }
    );
  }
}
```
在执行require.context的时候会触发，不常用

# NormalModuleFactory Hook
```js
class DonePlugin {
  apply(compiler) {
    compiler.hooks.normalModuleFactory.tap(
      'MyPlugin',
      (NormalModuleFactory) => {
        NormalModuleFactory.hooks.beforeResolve.tap(
          'MyPlugin',
          (resolveData) => {
            console.log(resolveData, 'resolveData');
            // 仅仅解析目录为./src/index.js 忽略其他引入的模块
            return resolveData.request === './src/index.js';
          }
        );
      }
    );
  }
}
```
normalModuleFactory会从入口文件开始，分解每个模块请求，进行解析，分析出下一个请求，最终生成所有文件

normalModuleFactory的hook可以用于控制webpack中对于模块引用的默认处理，比如ESM/CJS等模块引入前后注入逻辑

# JavascriptParser
```js
const t = require('@babel/types');
const g = require('@babel/generator').default;
const ConstDependency = require('webpack/lib/dependencies/ConstDependency');

class DonePlugin {
  apply(compiler) {
    // 解析模块时进入
    compiler.hooks.normalModuleFactory.tap('pluginA', (factory) => {
      // 当使用javascript/auto处理模块时会调用该hook
      const hook = factory.hooks.parser.for('javascript/auto');

      // 注册
      hook.tap('pluginA', (parser) => {
        parser.hooks.statementIf.tap('pluginA', (statementNode) => {
          const { code } = g(t.booleanLiteral(false));
          const dep = new ConstDependency(code, statementNode.test.range);
          dep.loc = statementNode.loc;
          parser.state.current.addDependency(dep);
          return statementNode;
        });
      });
    });
  }
}
```
在normalModuleFactory之下的hook，基于模块解析后，生成ast时候触发



# 参考文章
- [全方位探究Webpack5中核心Plugin机制](https://juejin.cn/post/7046360070677856292)