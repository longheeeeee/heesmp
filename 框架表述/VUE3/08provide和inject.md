# 使用
```js
// Provider 
import { provide, ref } from 'vue' 
export default { 
  setup() { 
    const theme = ref('dark') 
    provide('theme', theme) 
  } 
}
```
```js
import { inject } from 'vue' 
export default { 
  setup() { 
    const theme = inject('theme', 'light') 
    return { 
      theme 
    } 
  } 
}
```

Provide原理：
创建组件实例的时候，组件实例的provide对象会等于父组件的provide对象，当组件使用provide方法提供数据的时候，组件promise对象就会使用当前的，也就是父级的provide对象，使用Object.create来创建新的provide对象，来实现简单的对象原型继承

在inject的时候会获取当前组件的provide对象上的数据