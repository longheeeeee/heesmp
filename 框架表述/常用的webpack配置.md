webpack配置大概分成这几块：
1. 出入口配置
2. 模块：配置对应的模块如何被处理，用来配置loader
3. 解析：在哪里寻找依赖
4. 插件：使用了哪些插件，插件的配置是怎样的
5. devServer：配置开发服务器
6. devTool：如何生成sourceMap
7. targets：目标的最终
8. watch：是否监听文件变化
9. optimization：如何优化打包，一般使用splitChunks


### mini-css-extract-plugin 原理
todo

### webpack优化
1. 使用dll进行优化：
在webpack3时代，我们可以使用dllplugin，把一些不会发生变化的依赖打包成一个缓存，以后再次打包的时候就可以直接使用这个缓存，这个技术在webpack4的时代被vue和react都抛弃了，说法是因为webpack4的性能足够好，不需要了，详细原因不清楚
2. happypack多进程打包
使用happypack可以开启多进程打包，可是因为开启多进程需要消耗资源和时间，所以在不够复杂的项目里面优化效果可能会更差
3. HardSourceWebpackPlugin
跟dll类似，也是做缓存来加快打包速度，配置比dll更加简单，速度也更快，原理不清楚



