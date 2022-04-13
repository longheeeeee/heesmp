react中，模板使用jsx写法
```js
return <h1>Hello, {formatName(user)}!</h1>
```

在vue中，动态属性使用`on`或者`:`来使得属性的值变成表达式
在reacr中。使用`{}`来使得属性的值变成表达式
```js
return <img src={user.avatarUrl}></img>
```
- 要注意的是，部分属性跟html的不太一样，比如class在jsx中写成className，应该是跟js的DOM对象一样

jsx在经过编译后会变成一个函数调用表达式
```js
const element = (
  <h1 className="greeting">
    Hello, world!
  </h1>
);

const element = React.createElement(
  'h1',
  {className: 'greeting'},
  'Hello, world!'
);

// 注意：这是简化过的结构
const element = {
  type: 'h1',
  props: {
    className: 'greeting',
    children: 'Hello, world!'
  }
};
```


最简单的渲染：
```js
// 使用ReactDOM.createRoot创建一个根元素
const root = ReactDOM.createRoot(
  document.getElementById('root')
);

function tick() {
  const element = (
    <div>
      <h1>Hello, world!</h1>
      <h2>It is {new Date().toLocaleTimeString()}.</h2>
    </div>
  );
  // 使用render方法渲染子元素
  root.render(element);
}

setInterval(tick, 1000);
```

组件的定义：
可以使用函数式组件和类组件：
```js
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```

使用组件：
```js
// 使用参数来获取外部传进来的数据
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

// 传进去的props里面就有了name这个字段
const element = <Welcome name="Sara" />;
```

类组件中可以在构造函数中定义state
```js
constructor(props) {
  super(props);
  this.state = {date: new Date()};
}
```
定义完成后在render方法中使用`this.state.xxx`获取数据
```js
  render() {
    return (
      <div>
        <h1>Hello, world!</h1>
        <h2>It is {this.state.date.toLocaleTimeString()}.</h2>
      </div>
    );
  }
```

使用this.setState来更新state的数据从而触发视图更新
因为state和props更新是异步的
setState方法可以接受一个函数，入参是上一次的state和这次的props // 没看懂
```js
this.setState((state, props) => ({
  counter: state.counter + props.increment
}));
```

组件的生命周期定义在class组件的内部方法
```js
class Clock extends React.Component {
  constructor(props) {}

  componentDidMount() {}

  componentWillUnmount() {}

  render() {}
}
```

单向数据流：跟vue是一样的，父组件传来来的props，子组件不能进行修改

事件定义：
- 使用`onClick={handler}`进行定义
- 写在class里面的方法需要手动绑定this`this.handler = this.handler.bind(this)`
- 或者class里面使用箭头函数定义回调方法（class fields语法）
- 或者在定义onClick方法的时候使用箭头函数包一层`onClick={() => handler()}`

条件渲染：
react的条件渲染比vue的相对灵活和复杂，相对于使用v-if，react使用的是js来进行判断
1. 根据不同的条件返回不同的元素
```js
if (isButtonA) {
  return <buttonA></buttonA>
}
else {
  return <buttonB></buttonB>
}
```
2. 使用一个变量来代表元素
```js
let button
if (isButtonA) {
  button = <buttonA></buttonA>
}
else {
  button = <buttonB></buttonB>
}

return (
  <div>
    {button}
  </div>
)
```
3. 与运算法实现单个元素的局部渲染（如果条件不符合会渲染false）
```js
return (
  <div>
    {isButtonA && <buttonA></buttonA>}
  </div>
)
```
4. 使用三目运算符渲染两个不同的元素
```js
return (
  <div>
    {
      isButtonA ?
      <buttonA></buttonA> :
      <buttonB></buttonB>
    }
  </div>
)
```

列表渲染
相对于使用v-for指令，react中使用数组来代替列表元素，注意，需要加上key
```js
const list = numbers.map(num => <li key={num}>num</li>)
return (
  <div>{list}</div>
)
```
也可以在jsx中在大括号中直接写map方法
```js
return (
  <div>
  {
    numbers.map(num => <li key={num}>num</li>)
  }
  </div>
)
```

双向绑定
react中没有类似于v-model的双向绑定的语法糖，需要自己手动实现
```js
constructor (props) {
  super(props)
  this.state = {
    value: ''
  }
}

handleChange(e) {
  this.setState({value: e.target.value})
}

render () {
  return (
    <input type="text" value={this.state.value} onChange={this.handleChange} >
  )
}
```





