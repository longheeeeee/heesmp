# webpack的使用
使用方法就不在赘述了，需要注意的点有几个：
- 使用注释可以令vscode获得代码智能提示
    ```js
    // ./webpack.config.js

    // 一定记得运行 Webpack 前先注释掉这里。
    // import { Configuration } from 'webpack' 

    /**
    * @type {Configuration}
    */
    const config = {
      entry: './src/index.js',
      output: {
        filename: 'bundle.js'
      }
    }

    module.exports = config
    ```
- 关于模式code
  - production 模式下，启动内置优化插件，自动优化打包结果，打包速度偏慢；
  - development 模式下，自动优化打包速度，添加一些调试过程中的辅助插件；
  - none 模式下，运行最原始的打包，不做任何额外处理。
详看https://webpack.js.org/configuration/mode/

# webpack打包结果剖析
