# csr ssr ssg isr
csr客户端渲染，在next里面跟react一样，在useEffect里面发起请求然后进行渲染
ssr服务端渲染，在一个page里面写getServerSideProps来发起请求，返回的数据会作为参数传递给页面组件
ssg静态站点生成，在构建阶段就生成，后面不进行更新。在page中写getStaticProps，跟ssr的getServerSideProps一致
isr增量静态再生，在规则中进行异步更新页面，比如n秒之后会更新缓存。在getStaticProps里面添加revalidate，写上秒数

# rsc react-server-component
水合hydration：赋予HTML交互性

ssr的缺点
1. ssr的数据必须要在组件渲染之前
2. 组件的js必须先加载到客户端，才能开始水合
3. 所有组件必须都先水合，才能进行交互

src和ssr的区别
1. 直接在组件内部获取数据
2. 在服务端渲染，代码不会打包到bundle中
3. rsc是组件级别的ssr，客户端发起请求获取组件，服务器中，组件内部发起请求，服务器渲染组件，返回带有数据和样式的组件(以rsc payload的形式)给客户端
rsc payload中包含了完整的dom结构

流式渲染
html持续进行渲染，react使用suspense来先返回loading，然后再返回真实组件代码，再使用script标签插入到html中，整个html实际上是一直不停返回的
选择性水合
react在水合的时候可以根据优先级，如果用户先点击了一个组件，则可以在事件捕获阶段先水合用户点击的组件，再进行事件响应

suspense在嵌套的情况下，也是同步请求的，但是会等待渲染

实现streaming的方法
1. 页面级别，使用loading。jsx
2. 组件，使用suspense

suspense的缺点
下载的js代码数量并没有减少，不需要交互性的组件可以不进行水合

发展趋势
CSR -> SSR -> suspense -> rsc

双组件模型
服务端组件优势
1. 数据获取更快
2. 更安全，可以处理敏感数据
3. 缓存，可以在后续的请求中复用（这个没懂）
限制：
无法使用useState，不能使用浏览器api

客户端组件
1. 在编译的时候也会生成initial state来加快渲染
2. 客户端组件不能导入服务端组件，但是可以使用props传入

组件渲染流程
1. 拆分成多个chunks，然后每个chunk：
    1. rsc渲染成rsc payload
    2. next将rsc和客户端组件渲染出html
2. 返回html到客户端
3. 客户端快速展示一个非交互界面
4. rsc payload返回，渲染出rsc
5. 水合

缓存：请求缓存和组件缓存

请求缓存：单个请求的缓存
请求记忆，数据缓存
请求记忆在单次组件树渲染期间生效，多个组件请求同一个接口会进行缓存，缓存保存在react中
数据缓存在多个部署/多个请求之间都生效，缓存保存在nextjs的node服务上

路由缓存/组件缓存：页面/组件的缓存
完整路由缓存，缓存静态渲染的rsc payload和html，缓存在服务器上
路由缓存，缓存静态和动态渲染的rsc payload和html，缓存在客户端上

service action
原来的page router，跟正常的前后端一致，就是前端需要自己使用fetch发起请求，最多就是nextjs层担当了bff层的工作
在app router中，
直接定义了两个function，比如是create和find，在create中使用revalidatePath来更新路由缓存
组件在引用的时候获取create来实现操作，find来获取数据然后渲染
在操作的时候，会自动发起一个当前页面路径的post请求，带上actionID，返回的是rsc payload，自动更新组件

常见用法
useFormStatus
在表单form组件下面的组件使用，能获取到表单的提交状态
`const { pending } = useFromStatus()`

useFormState
用于提交form之后刷新组件/页面
参数为
`const [state, formAction] = useFormState(createTodo, initialState)`
formAction是传给form组件使用的，在form submit的时候会触发
然后会把数据丢给createTodo，里面接收state和formData参数，用于获取formData的数据，返回更新后的state

路由段配置
在完整的路由路径的中的每一段，都可以在该段对应的文件夹下的layout/route/page文件下面导出一些配置字段，作用在该段上
`export const dynamic = 'force-dymanic'`可以强行设置当前段使用动态渲染，`force-static`可以强行静态渲染，cookie等方法返回空

next/dynamic
使用dynamic可以实现Suspense和import的组合
const WithCustomLoading = dynamic(
  () => import('../components/WithCustomLoading'),
  {
    loading: () => <p>Loading...</p>,
  }
)
懒加载的三种形式
```js
// Client Components:
const ComponentA = dynamic(() => import('../components/a.js'))
const ComponentB = dynamic(() => import('../components/b.js'))
const ComponentC = dynamic(() => import('../components/c.js'), { ssr: false })
 
export default function ClientComponentExample() {
  ...
  return (
    <div>
      {/* 立刻加载，但会使用一个独立的客户端 bundle，会直接在HTML上返回，同时打包一个bundle来进行hydration */}
      <ComponentA />
 
      {/* 按需加载，打包bundle */}
      {showMore && <ComponentB />}
      <button onClick={() => setShowMore(!showMore)}>Toggle</button>
 
      {/* 只在客户端加载，打包bundle，不会在HTML上直接返回div，HTML上是一个占位符标签 */}
      <ComponentC />
    </div>
  )
}
```




