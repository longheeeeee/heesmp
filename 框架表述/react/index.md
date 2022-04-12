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



