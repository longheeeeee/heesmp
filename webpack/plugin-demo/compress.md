# 正文
```js
// webpack.config.js
// 引入plugin
const CompressAssetsPlugin = require('./webpack/plugins/CompressAssetsPlugin')

module.exports = {
  plugins: [
    new CompressAssetsPlugin({
      // 导出的名称
      output: 'result.zip'
    }),
  ]
}
```

```js
const jszip = require('jszip')
const { RawSource } = require('webpack-sources')

const pluginName = 'CompressAssetsPlugin';

/**
declare interface Asset {
  // the filename of the asset 
  name: string;
  // source of the asset
  source: Source;
  // info about the asset
  info: AssetInfo;
}
declare class Source {
	constructor();
	size(): number;
	map(options?: MapOptions): null | RawSourceMap;
	sourceAndMap(options?: MapOptions): { source: string | Buffer; map: Object };
	updateHash(hash: Hash): void;
	source(): string | Buffer;
	buffer(): Buffer;
}
 */

/**
 * 这个插件的目的是获取到所有生成的资源，并且打包成一个压缩包
 */
class CompressAssetsPlugin {
  // 这里接收外面的配置
  constructor ({ output }) {
    this.outputDir = output
  }
  apply(compiler) {
    /**
      emit
      AsyncSeriesHook
      输出 asset 到 output 目录之前执行。这个钩子 不会 被复制到子编译器。
      回调参数：compilation
     */
    compiler.hooks.emit.tapAsync(pluginName, (compilation, cb) => {
      console.log('entered CompressAssetsPlugin')
      const zip = new jszip()
      // 获取本次打包生成的所有资源
      // getAssets(): Readonly<Asset>[];
      // asset是最终生成的文件
      const assets = compilation.getAssets()
      assets.forEach(asset => {
        // 获取源代码
        const sourceCode = asset.source.buffer()
        // 添加资源名称和源代码内容
        zip.file(asset.name, sourceCode)
      });
      // 生成压缩包
      zip
        // 不是很清楚为什么这里是nodebuffer，类型上sourceCode是一个string|buffer，什么时候是string呢？换成buffer也also work
        .generateAsync({type: 'nodebuffer'})
        .then(res => {
          // 使用RawSource来创建一个不需要map映射的资源文件对象
          const file = new RawSource(res)
          
          // 使用内置的emitAsset来代替fs模块
          compilation.emitAsset(this.outputDir, file)
          cb()
        })
    })
  }
}
module.exports = CompressAssetsPlugin
```
# 参考文章
https://juejin.cn/post/7047777251949019173#heading-20
