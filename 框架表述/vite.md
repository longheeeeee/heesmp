# vite的最大特点
- 快速的冷启动
- 即时模块热更新
- 真正的按需编译

vite高效的主要原因在于使用了很多浏览器esm的特性，会在浏览器端使用export import来导入和导出模块，在script上面设置type="module"，来使用浏览器自带的esm功能

所以不能使用cjs模块

# vite解决了什么问题
传统开发工具启动和更新慢的问题

# 跟webpack的对比
webpack是把代码都打包成bundle，随着项目代码增长，打包速度变慢，而vite是需要下载模块的时候才会去构建文件

# vite对文件的处理
vite的基本实现原理就是启动一个koa服务器拦截浏览器对esm的请求，然后通过path找到文件并且对文件做一定处理后返回esm格式的文件给浏览器

使用esbuild进行打包，esbuild底层是go，比js快很多


