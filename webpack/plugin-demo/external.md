```js
// webpack.config.js
const ExternalWebpackPlugin = require('./webpack/plugins/ExternalWebpackPlugin')

module.exports = {
  plugins: [
    new ExternalWebpackPlugin({
      lodash: {
        // cdn链接
        src: 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js',
        // 替代模块变量名
        variableName: '_',
      },
      vue: {
        src: 'https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.js',
        variableName: 'Vue',
      },
    }),
  ]
}
```

```js
const webpack = require('webpack')
const { ExternalModule } = webpack
const HtmlWebpackPlugin = require('html-webpack-plugin');

const pluginName =  'ExternalWebpackPlugin';

/**
 * https://juejin.cn/post/6844904095728271374
 * webpack进阶之Parser
 */

function importHandler(parser) {
  // 在parser遇到import语句的时候会触发这个hook
  parser.hooks.import.tap(pluginName, (statement, source) => {
    // console.log('parser遇到import, ', source)
    /**
     * statement是一个ast解析出来的对象，具体可以在https://astexplorer.net/进行测试
     * source是引入的模块名，比如lodash
     */
    // 解析当前模块中的import语句
    if (this.transformLibrary.includes(source)) {
      this.usedLibrary.add(source);
    }
  });
}

function requireHandler(parser) {
  // 解析当前模块中的require语句
  parser.hooks.call.for('require').tap(pluginName, (expression) => {
    const moduleName = expression.arguments[0].value;
    // console.log('parser遇到require, ', moduleName)
    // 当require语句中使用到传入的模块时
    if (this.transformLibrary.includes(moduleName)) {
      this.usedLibrary.add(moduleName);
    }
  });
}


/**
  {
    lodash: {
      // cdn链接
      src: 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js',
      // 替代模块变量名
      variableName: '_',
    },
    vue: {
      src: 'https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.js',
      variableName: 'Vue',
    },
  }
 */
class ExternalWebpackPlugin {
  constructor(options) {
    this.options = options
    // 保存所有需要转化的名称
    this.transformLibrary = Object.keys(options)
    // 保存已经import过的包
    this.usedLibrary = new Set()
  }
  apply (compiler) {
    // 在normalModuleFactory创建后会触发该事件的监听函数
    compiler.hooks.normalModuleFactory.tap(
      pluginName,
      // 不能直接使用compiler.hooks.normalModuleFactory.hooks.factorize，
      // compiler.hooks.normalModuleFactory拿到的是一个hook，跟tap后返回的参数不是同一个东西
      (normalModuleFactory) => {
        // 第一步：在解析模块的时候，把解析到的模块都换成外部依赖
        // 在初始化解析之前调用。它应该返回 undefined 以继续。
        normalModuleFactory.hooks.factorize.tapAsync(
          pluginName,
          (resolveData, cb) => {
            // resolveData.request 打印出来是 react | ./index.css | /Users/winglam/Documents/kwanlonghee/code/webpack-plugin-demo/src/index.tsx
            // 这样就可以获取到引用的名称
            const requireModuleName = resolveData.request
            // 如果引用中包含了需要被external的包名
            // 转成外部依赖
            if (this.transformLibrary.includes(requireModuleName)) {
              console.log('需要转成external的包 ', requireModuleName)
              const externalModuleVariableName = this.options[requireModuleName].variableName
              const externalModule = new ExternalModule(
                externalModuleVariableName,
                'window',
                requireModuleName
              )
              // cb的第一个参数是err
              cb(null, externalModule)
            }
            // 其他模块正常编译
            else {
              cb()
            }
          }
        )
        // 虽然在第一步的时候，我们就可以拿到所有引用的模块了，但是我们也可以在后面生成ast的时候去做检查，两种方法都试试
        // parser这个东西是在webpack：解析模块->loader处理->使用parse生成ast获取后续依赖 的时候触发
        // 第二步：根据ast，获取到被引用的模块，在后续生成CDN路径的时候就可以减少无效引入
        normalModuleFactory.hooks.parser
          // 对于所有的js文件都会进入到这个parser
          .for('javascript/auto')
          .tap(
            pluginName,
            parser => {
              // parser的具体用法：https://webpack.js.org/api/parser/
              // 当遇到模块引入语句 import 时
              importHandler.call(this, parser);
              // 当遇到模块引入语句 require 时
              requireHandler.call(this, parser);
            }
          )
        }
    )
    // 第三步：在html中插入使用到的依赖的CDN地址
    // 获取到编译实例
    compiler.hooks.compilation.tap(pluginName, compilation => {
      // https://www.npmjs.com/package/html-webpack-plugin
      // 在HtmlWebpackPlugin的官方文档上，我们可以找到插件的生命周期以及对应暴露的钩子
      // 在生成script/style/meta等标签后会调用这个钩子
      HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tap(
        pluginName,
        data => {
          // 添加额外的scripts
          const scriptTag = data.assetTags.scripts
          this.usedLibrary.forEach(lib => {
            scriptTag.unshift({
              tagName: 'script',
              voidTag: false,
              meta: { plugin: pluginName },
              attributes: {
                defer: true,
                type: undefined,
                src: this.options[lib].src
              }
            })
          })
        }
      )
    })

  }

}

module.exports = ExternalWebpackPlugin
```