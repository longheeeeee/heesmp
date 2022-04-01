rollup的最主要区别是完全拥抱esm，原生使用esm，原生输出esm

- 因为原生使用esm，也就是推荐用户使用esm开发代码，如果使用cjs则需要添加插件，所以支持tree-shaking
- 因为原生输出esm，所以可以直接被浏览器接受，不需要写一大堆的webpack运行时注入代码来兼容cjs和esm，所以打包体积会小很多，特别是在小体积库的时候


### 为什么webpack需要这么多东西来注入？
因为webpack在esm诞生之前编写，所以需要比较多的polyfill去处理一些事情：
1. 浏览器原生不支持作用域问题，所以需要使用iife来进行包裹
2. 浏览器原生不支持cjs格式，所以webpack需要自己实现module.export和require方法
3. 在esm出来之后，因为市面上基本上都是cjs的包，所以需要保留上面两个额外注入的代码



