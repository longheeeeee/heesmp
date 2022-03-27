# 1. MVC 和 MVVM 区别
### MVC：
model，view，controller，用户修改view上的数据，然后会反应到controller，controller对数据进行逻辑处理后提交给model，model数据更新完成后再反馈到view
### MVVM：
model，view，viewModel，用户在view上的修改反应到viewModel上，然后viewModel更新model的数据，model更新完成后自动反应到viewModel上，viewModel把修改更新到view上
### 区别：
MVC数据是单向的，view-controller-model这样子流动，model更新后需要手动更新view；MVVM在model更新后会自动通过viewModel进行更新，model不直接操作view

- vue提供了$ref属性，使得model可以直接接触view

# 2. 为什么data是一个函数
- data可以是一个对象，也可以是一个返回对象的函数。
- 每一个组件都需要维护自己的私有数据，在初始化组件实例的时候如果data是一个对象则所有实例都会共享同一个data对象，如果是一个函数的话每个子实例就会生成自己的一个data对象

# 3. Vue组件通讯方式有哪些
vue内置的通讯方式：
1. 父传子：props，\$children，\$ref
2. 子传父：emit，$parent
3. 祖孙：provide/inject
其他方式：
1. vuex全局
2. 事件总线eventbus

# 4. Vue的生命周期方法有哪些
### 1. beforeCreate&created
在子组件实例构造函数调用的时候，会调用`_init`方法初始化组件实例，其中在初始化数据方法`initState`方法调用前会触发`beforeCreated`钩子，在初始化数据方法后调用`created`钩子，所以在`beforeCreated`回调函数中是拿不到组件的data数据的
### 2. beforeMount&mounted
根实例调用`$mount`的时候会先调用根实例的`beforeMount`钩子，然后后面调用patch的时候会新建子组件，子组件调用`$mount`会调用子组件的`beforeMount`钩子，然后子组件进行挂载，挂载完成的组件会被推到一个数组中，最后同层的所有子组件都挂载完成后遍历触发数组中组件的`mounted`钩子，根实例下所有元素都挂载完成后再执行根实例的`mounted`
- mounted的执行时机是每一个子组件同层下面的所有子组件会同时依次执行，然后当前子组件会在它的父组件的同层子组件下面依次执行
### 3. beforeUpdate&updated
数据发生更改的时候，会对所有观察这个数据的`watcher`派发更新，触发对应`watcher`的`update`方法，`watcher`会被推到一个队列中，等待`nextTick`的时候被遍历触发更新，`render watcher`在初始化的时候传入了`before`钩子，然后`render watcher`更新的时候会调用这个钩子，这个钩子触发组件的`beforeUpdate`钩子，最后所有watcher都更新完成后，遍历触发刚才执行过更新的watcher对应组件的`updated`方法
### 4. beforeDestroy & destroyed
patch过程中删除节点的时候会调用`removeVnodes`方法，会递归执行下面所有子组件的`$destory`方法，其中会先执行`beforeDestroy`，然后进行一系列卸载操作，比如从parent组件中删除自己，销毁所有的watcher，使用patch把当前dom删掉，最后执行`destroy`钩子
### 5. activited&deactivited
1. 父组件数据更新之后，执行patch的过程中，如果子组件有插槽内容，则会强制子组件更新，所以keep-alive组件会触发更新，调用patch方法挂载缓存的子节点，子组件挂载后会触发vnode的insert钩子函数，如果组件上有keep-alive标志的话调用`activited`否则是`mounted`
2. patch过程中删除节点的时候会调用`removeVnodes`方法，其中会调用`invokeDestroyHook`，会把递归执行下面所有子组件vnode的`destory`钩子，如果判断vnode是keep-alive组件，则调用`deactivited`

# 4.1 异步请求在哪一步发起
`created` `beforeMount` `mounted`都行，如果不需要DOM操作最好在`created`钩子，需要的话在`mounted`，`created`的时候如果有默认情况或者是特殊情况不需要发起请求的话，可以先一步使用最终数据渲染vnode，如果是`mounted`钩子的话会先渲染完再修改

# 5. v-if和v-show的区别
- 从表现上来说，这两个都是能动态切换一个元素的显隐的
- v-if隐藏的时候会把整个dom节点从文档中删除来隐藏，v-show是给元素添加上display：none来切换
- 原理角度来说，`v-if`在生成`render function`过程中会被编译成三元运算符，根据条件切换返回的`vnode`，`v-show`是一个自定义指令，被混入到`vnode`的钩子函数上，在条件发生变化时重新执行`render`，在调用`vnode`的`update`钩子的时候切换`el.style.display`

# 6. vue内置指令
1. v-bind 绑定属性
2. v-on 绑定事件
3. v-html 直接赋值innerHtml
4. v-model 双向绑定
5. v-if/v-else-if/v-else 条件判断
6. v-show 使用`display: none`切换显隐
7. v-for 循环渲染
8. v-pre 跳过编译过程
9. v-text 修改节点的textContent
10. v-once 设置成静态内容

# 7. 如何理解vue的单向数据流
单向数据流指的是父组件的数据会通过props自动更新到子组件上，子组件不能直接修改props来改变父组件的数据，防止子组件更新父组件数据，使得数据流向难以理解

# 8. computed和watch的区别和使用场景
- 使用上来说，computed是一个计算属性，通过一个方法来计算一个返回值，并且会对这个返回值做缓存，不会每次都重新计算，比较多用于直接渲染，或者做数据的整合和列表的渲染
- watch则是传入一个属性和一个回调函数，在属性发生变化的时候会调用回调函数并且传入修改前后的值，一般用于监听某些字段的变化然后做对应的事情，比如监听弹窗的显隐等
- 实现原理来说，这两个本质上都是使用了watcher这个类
- watche方法在watcher里面调用字段的getter，然后字段对这个watcher做依赖收集，字段在发生变化的时候会调用watcher的update，执行用户传入的回调函数
- computed方法的watcher监听的是整个方法的执行，watcher在方法执行前会判断dirty是否为true，false的情况下会直接返回缓存的值，true的情况下会把dirty设置成false然后执行方法，方法中被获取的数据都会对watcher做依赖收集，然后watcher会缓存方法的返回值，然后数据发生变化的时候会触发watcher的update方法，会把dirty设置成true，可是不会马上更新，而是在其他方法尝试获取computed的值的时候再次执行方法计算

# 9. v-if 与 v-for 为什么不建议一起使用
会先解析for再解析if，for数组不改变的情况如果其他数据改变导致组件发生重新渲染，会重跑render function，然后会遍历一次所有的if判断，造成性能浪费
```js
// genElement
else if (el.for && !el.forProcessed) {
  return genFor(el, state)
}
else if (el.if && !el.ifProcessed) {
  return genIf(el, state)
}
```
解决的方法有两种，如果是整个列表的显隐的话可以在外面包一层`template`，在`template`上做`v-if`
如果是实现筛选器的功能的话，可以使用`computed`来实现，因为缓存的特性，其他数据更改的时候不会触发`computed`的方法

# 10. vue2 响应式原理
1. 响应式核心是观察者模式，`vue`在对数据进行响应式处理的时候，使用了`object.defineProperty`，给对象上的属性添加了`getter`和`setter`，并且采用闭包的形式给每一个字段都创建一个`dep`依赖收集器
2. 在使用到这个数据的地方会建立一个观察者`watcher`，比如`render watcher`或者是自定义的`watcher`，访问这个响应式数据的时候，会触发数据的`getter`，`getter`会把当前访问数据的`watcher`使用`dep`依赖收集器收集起来
3. 当数据发生变化的时候，会触发数据的`setter`，`setter`遍历当前字段`dep`依赖收集器里面的所有`watcher`派发更新，`watcher`收到后会执行对应的回调函数，比如`render watcher`就会进行重新渲染

# 11. Vue如何检测数组变化
- `vue`使用了`Object.defineProperty`来实现响应式，可是对于数组使用方括号或者修改`length`来修改数组内容是没有办法监听的，所以`vue`会对这种情况做特殊的处理
- 在对数组做响应式处理的时候，会有两个特殊处理，一个是会在数组上添加一个依赖收集器，然后在`watcher`调用数组的`getter`的时候，会收集`watcher`的依赖，然后在数组的原型链上加了一层，对数组的八个方法做重写，其中会对`splice`、`push`、`unshift`这三个方法添加的元素做响应式处理，然后八个方法都会调用数组的`dep`上的`update`方法派发更新，最后调用原来方法进行数组的更新
- 所以`vue`推荐开发者使用数组的方法来对数组进行修改和新增而不是使用方括号和修改`length`来修改数组的数据

# 14. vue2的父子组件生命周期钩子函数执行顺序
### 1. 挂载
1. 根实例初始化，执行根实例的`beforeCreate``created`，然后根实例执行`$mount`进行挂载，先执行根实例的`beforeMount`，patch的过程中递归遍历vnode子树
2. 发现组件vnode就会执行组件构造函数初始化，执行组件的`beforeCreate``created`，然后调用组件的`$mount`挂载，调用`beforeMount`，然后执行patch，如果组件还有子组件就重复上面的步骤，子组件挂载完成后执行同层挂载完成的子组件的`mounted`钩子
3. 根实例的子组件都挂载完成后执行根实例子组件的`mounted`，最后执行根实例的`mounted`
### 2. 更新
组件更新没有父子组件顺序之分，那个组件更新就触发对应组件的钩子，不会冒泡

如果父子组件都在一个tick內进行更新的话，watcher队列执行的顺序是先父到子，所以`beforeUpdate`顺序是先父到子，然后最后watcher队列执行完成后遍历执行更新过的watcher对应的组件的`updated`，这个顺序是先子到父
### 3. 销毁
`$destroy`方法先执行组件的`beforeDestroy`方法，然后执行`__patch__`方法卸载，其中会递归卸载子组件，子组件执行`beforeDestroy`，然后卸载完成后执行`destroyed`，再到父组件的`destroyed`

# 15. 虚拟DOM是什么？有什么优缺点？
- 虚拟DOM是一个抽象的，用来描述一个真实DOM的对象，因为真实DOM会存放很多的数据，而我们一般不会用到所有的东西，所以我们只把其中使用到的数据给抽象出来，以此来优化性能
优点：
1. 可以兼容多平台，给vdom做不同平台的API适配即可
2. 减少了真实DOM操作带来的性能问题
缺点：
1. 不能满足对性能极致的要求，虚拟DOM虽然保证了性能不会很差，可是同样的也限制了性能上限，对于需要极致性能的应用，手动做针对性改动才是最合适的

# 16. v-model原理
v-model的本质是语法糖
1. 使用在非组件节点上的时候，会在节点上添加一个`prop`和一个事件，事件触发的时候去修改`prop`上的数据。主要实现逻辑在编译阶段的第三阶段`generate`中，`genData`的时候会给节点上添加`prop`，也就是`:value`然后内容是`v-model`定义的值，然后添加一个回调函数，根据节点和修饰符的不同，绑定不同的事件，回调函数触发的时候修改`prop`上的值。`v-model`做了两点优化，一个是可以使用修饰符，比如`trim`就可以在回调函数修改的时候添加上`trim()`方法调用，另一个是优化了用户在使用输入法输入的时候不会触发回调，输入法输入空格真正修改才触发
2. 使用在组件上的时候，等于新增了一个`prop`属性给子组件，然后定义一个事件，回调中修改父组件中的数据。主要实现在生成组件`vnode`的过程，在`vnode`上添加一个`prop`，`key`值默认为`value`，或者是用户设置，然后定义一个事件名为`input`的事件，回调函数中修改父组件中`prop`中的值，这个事件需要子组件手动触发更新

# 17. v-for为什么要加key
- key的作用体现在`patch`过程中用于对比两个`vnode`是否相同，因为对于真实DOM的操作消耗比较大，所以节点能复用的就不会做改动，在这个过程中就可能出现DOM节点在更新后出现内容没有发生变化的情况，比如因为`input`虽然更新了可是因为原地复用导致输入框的内容没有被清除，这个时候就需要`key`来标注每个节点，对于不同的`key`则判断不能复用
- 另外一个在`diff`算法中，当子节点头尾对比无果的时候会遍历旧节点根据`key`来生成`map`用于快速查找，如果没有传`key`的话则需要进行遍历查找，浪费性能

# 18. vue的事件绑定原理
1. 对于非组件节点来说，事件的绑定使用`dom`的`addEventListener api`实现的，绑定事件的时候，对于每一个不同的事件名称都会新建一个`invoker`类，然后把事件推到`invoker`上的`fns`数组，事件触发会调用`invoker`去遍历触发`fns`里面的回调，当事件更新的时候只需要更换`fns`就好，不需要对`dom`的事件绑定做修改
2. 对于绑定在组件上的事件来说，每一个组件实例都有一个事件中心，事件被绑定到组件的时候，就会根据事件名称推到实例`_events`对应事件名称下面的数组上，当事件使用`$emit`触发的时候，组件根据触发的事件名在`_events`中找到绑定数组并且遍历执行

# 25. vue 中使用了哪些设计模式
1. 工厂模式：根据不同平台返回不同的patch方法
2. 观察者模式：响应式数据
3. 发布订阅模式：事件中心

# 26. 你都做过哪些 Vue 的性能优化
1. 使用computed代替if和for
2. 不需要响应式的数据不需要放到data中
3. 和webpack配合使用路由懒加载

# 27. Vue.mixin 的使用场景和原理
场景：一些具有相同属性的组件可以使用`mixin`抽离方法，比如列表页填表页等重复性比较高但是又有自己特定业务逻辑的页面
原理：在创建组件构造函数的时候会把`mixin`的配置通过`mergeOptions`方法跟原来的配置合并起来，这个方法对于不同的配置会采用不同的合并策略，比如钩子函数会变成一个数组遍历执行，`data`中相同的`key`的值会进行覆盖等

# 28. nextTick 使用场景和原理
在`vue`中，会有很多频繁修改`dom`的逻辑，如果同步修改的话会有性能问题，所以`vue`提供了一个异步任务来执行这些修改，这个功能就是`nexttick`。`nexttick`内部会维护一个队列，当`nexttick`被调用的时候，就会往队列里面添加一个回调函数，并且把执行队列这个操作放到一个异步任务里面，异步任务的选择有四种，按照优先级分别是`Promise`，`mutationObserver`，`setImmidate`，`setTimeout`，根据浏览器的兼容性来决定异步任务的执行策略，在异步任务执行的时候就会清空`nextTick`的队列

# 29. keep-alive 使用场景和原理
- keep-alive是使用到了slot的特性，keep-alive里面的组件就是父组件传进来的插槽内容
- 在第一次渲染的时候，父组件会生成所有自元素的vnode，包括keep-alive组件和里面的子组件，其中keep-alive组件是一个以占位符vnode存在的，子组件会存放在keep-alive组件的$slots上
- 然后keep-alive会调用render function生成vnode，在里面会使用slots获取插槽内容，获得第一个子组件，然后拿组件的名称跟includes和excludes规则进行判断，如果不需要缓存的则直接返回vnode，否则去缓存中查找
- 缓存是一个对象，key是组件定义的key没有的话取组件的cid加上tag，value是子组件vnode
- 查找不到的话，就会把当前vnode添加到缓存中，然后设置一个keepAlive标志位，返回这个vnode
- 在组件发生变化的时候会重新触发keep-alive的render function，然后会有新的vnode去做判断，如果缓存中有对应的vnode的话就返回缓存的vnode，抛弃父组件生成的vnode
- 然后旧组件vnode会被销毁，在执行$destory的时候会根据keepAlive标志位判断组件是否是缓存过的，是的话调用deactivated钩子函数，否则调用destory
- 组件再次挂载的时候，在createComponent创建子组件实例之前会进行判断，如果组建实例已经存在了并且有标志位，就不会生成新的实例，在组件挂载完成后，在原本应该调用mount钩子函数的地方也会判断标志位，来调用activated钩子函数
- 当keep-alive规则发生改变的时候，会遍历当前的缓存，如果有不符合规则的就会把缓存删掉
- keep-alive还有一个max属性，代表最大缓存数量，达到数量后会采用LRU算法来删掉一个缓存，具体是keep-alive会维护一个keys栈，组件被缓存的时候会往栈里push，从缓存中拿出来的时候会把对应的key挪到栈顶，这样子栈底就是最不常用的组件了，删除的时候会删掉栈底的缓存


# 30. 作用域插槽原理
普通插槽的内容`vnode`生成时间是父组件生成`vnode`的时候，作用域插槽因为需要获取子组件的数据，所以父组件并不会先生成`vnode`，而是保持`render function`的形式传给子组件，子组件生成`vnode`的时候就会调用父组件的`render function`，并且传入参数来生成`vnode`

# 30. Vue.set 方法原理
vue对于使用点操作符给对象新增属性是做不到响应式的，所以做了`set`方法去解决这个问题
`set`方法做了很多判断
1. 判断对象是否是响应式，不是的话直接赋值
2. 判断是否是数组，并且如果`index`合法的话使用`splice`方法插入
3. 判断字段是否已经存在，是的直接修改
4. 新增字段的话，对数据做响应式处理，然后手动调用对象上的`dep.notify`派发更新

# 31. Vue.extend 作用和原理
- 作用：创建一个当前组件的子类
- 原理：构造一个子类构造函数，然后做继承处理，子类的`options`使用`mergeOptions`根据合并策略进行合并，最后在配置文件上存放父类的id和创建的构造函数作为缓存，防止同一份配置文件被同一个父类重复生成

# 32. 写过自定义指令吗 原理是什么
在`patch`的过程中会调用`vnode`的钩子，自定义指令的钩子会混入到这些钩子里面，在对`vnode`做CURD的时候会触发这些自定义指令混入的钩子，来对`vnode`做不同的处理

# 33. Vue 修饰符有哪些
- .stop 在回调方法中调用`e.target.stopPopagation`
- .once
- .native 把组件上的事件绑定到根节点的DOM上
- .trim 回调函数添加`trim`
- .number 回调函数返回值做number处理
- .lazy

# 34. Vue 模板编译原理
分为三步：
1. 创建`AST`
2. 优化`AST`
3. 创建`render function`

1. 创建`AST`过程，使用正则表达式去匹配模版，把模板分成一段段进行处理，比如先匹配到标签开头，然后标签名字，然后到标签结尾，然后根据标签名称标签内容进行处理，最后匹配结束标签，在过程中会维护一个栈，处理到开始标签的时候会推入栈中，如果到结束标签的时候发现栈顶不是对应的开始标签会报错
2. 优化`AST`，对于一些纯静态，没有响应式数据参与的节点会打上标记，后续在`patch`的过程中可以对这些节点跳过
3. 把`ast`转化成`render function`，对每一个`AST`节点进行处理，然后生成代码字符串，比如对`v-if`节点会生成三段式的代码，对于`v-for`节点使用`_l`进行包裹，普通的节点使用`_c`进行包裹

# 38. diff 算法了解吗
在`patch`对新旧`vnode`节点做对比的过程中，如果两个`vnode`节点判断成`sameNode`，这个`vnode`节点对应的`DOM`节点就会复用，然后会对下面的子节点做`diff`算法进行比对，先把新旧`children`各添加两个头尾的指针，重复进行下面的对比
1. 头头判断，如果相同则更新`vnode`，然后移动指针
2. 尾尾判断，相同则更新然后移动指针
3. 头尾互相判断，相同则移动位置，然后更新，最后移动指针
4. 如果头尾判断都没有相同的，使用旧`children`根据`key`来生成一个`map`，然后遍历新`children`，找到旧`chlidren`中的对应位置，然后进行移动和更新
5. 最后遍历完成后，如果旧`children`中有剩余的就进行删除，新`children`有剩余的进行插入操作

# 39. transition原理
vnode上会有很多钩子，比如create，active，remove等，在patch的过程中会调用这些钩子来对vnode进行处理，transition会给这个抽象组件的子节点添加transition属性，然后在子组件的vnode上添加create，active，remove的三个钩子，然后在patch的时候，会调用对应的钩子，create、active的时候会调用enter方法，remove会调用leave方法，如果是css过渡的话就添加上对应的enter、enter-active、enter-to等类，如果是js过渡的话就调用对应的方法，实际上transition只是会添加对应的类，动画效果需要用户写对应的样式

# 40. 异步组件
1. 异步组件在patch的时候因为没有构造函数，所以不会生成组件的实例
2. webpack会生成一个工厂函数，调用这个函数会返回一个promise，webpack会使用jsonp来加载这个组件，然后加载完成后把结果调用resolve传给这个promise
3. 异步组件发起请求后，会生成一个空的注释节点，然后等promise结束后，把结果存起来，调用`$forceUpadte`强行刷新组件，并触发组件的创建和挂载
