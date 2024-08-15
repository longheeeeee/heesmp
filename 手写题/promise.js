/**
入参是一个方法，方法里面有什么参数
1. onResolve：promise转成resolve状态
2. onReject：promise转成reject状态
返回什么？
一个包含then方法的对象
then做了什么？
then的入参是什么？
1. onFulfilled，onReject
调用then的时候，promise的状态是什么
1. pending：添加到待执行队列
2. fulfilled/rejected：回调函数微任务执行
then返回什么？
一个新的promise，这个promise的状态是根据then的onFilfilled/onReject的执行结果决定的
1. 返回一个promise，则等待这个promise，在这个promise的then上接入这个promise的resolve/reject
2. 返回正常数据：fulfilled
3. 执行出错：rejected
*/

// promise有当前状态，当前值，执行器中调用传入的参数来使状态发生变更
// 使用then方法传入回调，当状态发生坍塌时会调用对应的回调函数
// then方法返回一个promise，新的promise的状态跟随上一个promise的状态
// 如果then回调返回的是一个promise，则新的promise跟随返回的promise的状态

const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'

// 在链式then中，根据上一个promise的回调执行结果，来决定下一个promise的status
const resolvePromise = (promise2, x, resolve, reject) => {
  if (promise2 === x) return reject(new TypeError())
  // 如果返回值是一个promise，则再次根据这个promise的执行结果来决定下一个promise的status
  // promiseResolveThenableJob
  if (typeof x === 'object' && x !== null || typeof x === 'function') {
    try {
      let then = x.then
      if (typeof then === 'function') {
        then.call(
          x,
          // 如果then的执行结果还是promise，再次等待
          res => resolvePromise(promise2, x, resolve, reject),
          // 如果执行失败则下一个promise为rejected
          rej => reject(rej)
        )
      }
      // 不是一个thenable对象
      else {
        resolve(x)
      }
    }
    // 如果在返回值promise执行过程中出错，则下一个promise状态为rejected
    catch(e) {
      reject(e)
    }
  }
  // 在执行没有错误并且返回值是一个普通值的情况，下一个promise的值为fulfilled状态
  else {
    resolve(x)
  }
}

class Promise {
  constructor(executor) {
    // 设置默认值
    this.status = PENDING
    // 成功状态的值，成功回调的返回值
    this.value = undefined
    // 失败状态的值，失败回调的返回值
    this.reason = undefined

    // 存放成功的回调
    this.onResolvedCallbacks = []
    // 存放失败的回调
    this.onRejectedCallbacks = []

    // 成功回调
    let resolve = (value) => {
      // Promise.resolve() api使用，当传入的还是一个promise的时候，需要等待该promise
      if (value instanceof Promise) {
        return value.then(resolve, reject)
      }
      // 在pending状态才修改状态
      if (this.status === PENDING) {
        this.status = FULFILLED
        this.value = value
        // 状态发生变化后，执行等待的成功回调函数
        this.onResolvedCallbacks.forEach(fn => fn())
      }
    }

    // 失败回调
    let reject = (reason) => {
      // 在pending状态才修改状态
      if (this.status === PENDING) {
        this.status = REJECTED
        this.reason = reason
        // 状态发生变化后，执行等待的失败回调函数
        this.onRejectedCallbacks.forEach(fn => fn())
      }
    }

    try {
      // 立即执行
      executor(resolve, reject)
    }
    // 报错时直接reject
    catch(e) {
      reject(e)
    }
  }

  // 包含一个then方法
  then(onFulfilled, onRejected) {

    // 在then没传值的时候取默认值
    typeof onFulfilled !== 'function' && (onFulfilled = v => v)
    typeof onRejected !== 'function' && (onRejected = err => {throw err})

    const promise2 = new Promise((resolve, reject) => {
      // then方法执行时如果是pending状态的
      if (this.status === PENDING) {
        // 存放成功的回调，等待状态发生变化
        this.onResolvedCallbacks.push(() => {
          // 在下一个异步时间节点执行回调，使用setTimeout进行模拟
          setTimeout(() => {
            try {
              // 获取到回调函数的返回值，并且根据返回值的类型做对应的处理
              const x = onFulfilled(this.value)
              resolvePromise(promise2, x, resolve, reject)
            }
            // 如果上一个promise的回调执行过程报错了，则下一个promise为rejected状态
            catch(e) {
              reject(e)
            }
          }, 0)
        })
        // 存放失败的回调，等待状态发生变化
        this.onRejectedCallbacks.push(() => {
          // 在下一个异步时间节点执行回调，使用setTimeout进行模拟
          setTimeout(() => {
            try {
              // 获取到回调函数的返回值，并且根据返回值的类型做对应的处理
              const x = onRejected(this.reason)
              resolvePromise(promise2, x, resolve, reject)
            }
            // 如果上一个promise的回调执行过程报错了，则下一个promise为rejected状态
            catch(e) {
              reject(e)
            }
          }, 0)
        })
      }
      // 如果是fulfilled状态或者是rejected的直接执行回调
      else if (this.status === FULFILLED) {
        try {
          // 获取到回调函数的返回值，并且根据返回值的类型做对应的处理
          const x = onFulfilled(this.value)
          resolvePromise(promise2, x, resolve, reject)
        }
        // 如果上一个promise的回调执行过程报错了，则下一个promise为rejected状态
        catch(e) {
          reject(e)
        }
      }
      else {
        try {
          // 获取到回调函数的返回值，并且根据返回值的类型做对应的处理
          const x = onRejected(this.reason)
          resolvePromise(promise2, x, resolve, reject)
        }
        // 如果上一个promise的回调执行过程报错了，则下一个promise为rejected状态
        catch(e) {
          reject(e)
        }
      }
    })
    return promise2
  }

  // 用于捕获异常，相当于一个没有成功回调的then
  catch(errorCb) {
    return this.then(undefined, errorCb)
  }

  // 无论上一个promise的结果是fulfilled还是rejected，都会执行
  // 并且生成的promise的状态不跟随这个finally的返回结果
  // 跟随的是上一个promise的结果
  // 使用Promise.resolve()的原因是如果callbacks返回的是一个promise的话需要等待
  // 否则可以直接执行
  // 下一个promise等待的是Promise.resolve返回的promise
  // 返回的promise又等待的是callback
  finally(callback) {
    return this.then(
      value => Promise.resolve(callback()).then(() => value),
      reason => Promise.resolve(callback()).then(() => {throw reason})
    )
  }

  // 返回一个fulfilled状态的Promise，需要注意的是，
  static resolve(value) {
    return new Promise((res, rej) => {
      res(value)
    })
  }

  // 返回一个rejected状态的promise
  static reject(reason) {
    return new Promise((res, rej) => {
      rej(reason)
    })
  }

  // 返回一个promise，队列里所有的promise都resolve后该promise为fulfilled
  // 队列里任何一个promise reject的话走reject
  static all (values) {
    return new Promise((resolve, reject) => {
      let promiseRes = []
      let handled = 0
      const promiseResolved = (result, index) => {
        handled += 1
        promiseRes[index] = result
        if (handled === values.length) {
          resolve(promiseRes)
        }
      }
      values.forEach((value, index) => {
        if (typeof value.then === 'function') {
          value.then(
            res => promiseResolved(res, index),
            rej => reject(rej)
          )
        }
        else {
          promiseResolved(value, index)
        }
      })
    })
  }

  // 谁先完成用那个
  // resolve,reject会被重复触发，不过里面有逻辑判断防止重复触发
  static race(values) {
    return new Promise((resolve, reject) => {
      values.forEach(value => {
        if (typeof value.then === "function") {
          value.then(resolve, reject)
        }
        else {
          resolve(value)
        }
      })
    })
  }
}
