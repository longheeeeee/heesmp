### 同步加载
最主要的方法是`__webpack__reauire__`，同步的import语句会转化成这个方法，传入的是moduleId，moduleId就是路径，同步代码会被编译成一个iife，然后存储到`__webpack__modules__`中，当使用`__webpack__require__`的时候，会先从`__webpack_module_cache__`中尝试获取缓存，没有的话，根据moduleId从webpackModule中获取到代码，然后执行，把返回值放到缓存中，然后返回模块的返回值。

### 远程加载
1. 首先，远程分出来的包，会把用户的代码封装成一个方法，然后执行的时候会调用`window['webpackJsonp'].push`，把方法和模块id传进去。
2. 远程代码使用`__webpack_require__.e`方法进行远程加载，这个方法会返回一个`Promise`，`Promise`里面会创建一个`script`标签，然后填入对应的请求地址并且插入到文档中发起请求，在`onload`方法中，获取模块传给`webpackJsonp`的方法，然后执行这段代码，并且把返回值存放到缓存中，最后`reoslve`掉`promise`，并且把模块代码的执行返回值传到`resolve`中
3. 使用动态`import`语句后返回的就是上面的`promise`，然后执行用户的`then`方法