# vite的最大特点
- 快速的冷启动
- 即时模块热更新
- 真正的按需编译

vite高效的主要原因在于使用了很多浏览器esm的特性，会在浏览器端使用export import来导入和导出模块，在script上面设置type="module"，来使用浏览器自带的esm功能

# 1. 快速的冷启动
no-bundle加上esbuild预构建
1. no-bundle：webpack会把所有的文件都打包成bundle再启动开发服务器，文件数量增多时启动速度变慢，vite不会把所有的依赖都先构建，不会随着项目变大启动速度变慢
2. esbuild预构建：找到入口文件然后把对应的依赖打包成bundle，减少多层依赖带来的大量请求数量。入口文件没有依赖的文件不会被构建。并且使用了esbuild，使用go语言编写，速度更快
# 2. 即时模块热更新
vite中，只会对变化的文件做重新编译，webpack会以更新的文件作为入口，重新打包构建下面的所有文件。并且vite使用了http缓存作为优化。
# 3. 真正的按需编译
只对当前使用到的文件做编译处理，其他的文件不编译

# 启动过程
### 1. 裸模块重写
因为esm不支持直接引入模块名称，所以访问模块的时候会先把依赖引入的语句转化成对应的地址，比如改写vue到@moudle/vue下面

### 2. 依赖预编译
启动前找到用户的入口文件，然后把依赖到的包查找一次依赖关系图，并且打包成bundle，加上hash后添加强缓存策略。
这是因为如果直接下载的话，有可能会下载数量巨大的依赖包，这样子预先编译的话就可以把请求压缩。
预编译使用的esbuild，比webpack快很多。
而且也只是会把入口文件的包预先编译，其他的包不会处理。

### 3. 浏览器加载
浏览器加载html后会发起文件的请求，vite拦截后，根据请求的是项目代码还是依赖文件做不同的处理
1. 项目代码：编译后返回
2. 依赖文件：使用esbuild编译成bundle，缓存到node_module内，然后加上浏览器强缓存策略再返回


# 插件机制
vite的插件因为生态不够成熟，所以直接兼容了rollup的插件。
vite设计时使用了rollup兼容的接口，在此基础上做了部分拓展，并且有部分相同的时机和钩子。
所以只要一个插件只使用了这部分共用的钩子，那么就可以做到插件的通用。

# 对比
- snowpack snowpack可以于其他不同的打包器兼容，带来的问题是体验不好，配置不一样插件不是官方维护等等，vite跟rollup做绑定，生态和用户体验都更好

# vite解决了什么问题
传统开发工具启动和更新慢的问题

# 跟webpack的对比
webpack是把代码都打包成bundle，随着项目代码增长，打包速度变慢，而vite是需要下载模块的时候才会去构建文件

# vite对文件的处理
vite的基本实现原理就是启动一个koa服务器拦截浏览器对esm的请求，然后通过path找到文件并且对文件做一定处理后返回esm格式的文件给浏览器

使用esbuild进行打包，esbuild底层是go，比js快很多


https://juejin.cn/post/7050293652739850271