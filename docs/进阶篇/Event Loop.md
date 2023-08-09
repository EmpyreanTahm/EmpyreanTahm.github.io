# Event Loop

ES 的运行环境都采用了**单线程**模型，这意味着任一时刻，ES 只能执行一个操作。单线程的好处是：不需要考虑并发和同步问题、避免竞态条件、节省内存。单线程的坏处在于：无法利用多核 CPU、不适合 CPU 密集型任务。

浏览器提供了 Web Workers 技术，使用 `Worker` 类创建独立线程。Node.js 提供了对应的 Worker Threads 技术，后者引用 `worker_threads` 包创建独立线程。这两种方案创建的独立线程，可以与主线程通信，从而利用多核 CPU，处理 CPU 密集型任务。

## 浏览器的事件循环

在现代浏览器中，一个标签页通常是一个独立的进程，每个进程都可以包含多个线程。浏览器有一个主线程，负责处理子线程的协调和调度，这些子线程包括：
- 渲染线程：负责页面的渲染和绘制，包括布局计算、绘制图形等任务
- ES 引擎线程：负责解析和执行 ES 代码，ES 引擎线程运行会阻塞渲染线程的执行
- 事件线程：负责处理用户输入和其它事件的触发和处理
- 定时器线程：`setInterval` 与 `setTimeout` 所在的线程，用于计时并触发定时任务
- 存储线程：负责处理与存储相关的任务，如读取和写入本地存储
- 网络线程：负责处理网络请求和响应的发送和接收
- 工作线程（Web Workers）：用于执行耗时的操作，以避免阻塞主线程

### 调用栈

调用栈是一个用于追踪函数调用的有限栈内存区域。当函数被调用时，会被推入调用栈，当函数执行完成后，会从调用栈中弹出。

函数执行过程中，如果触发了异步任务，会将被触发的异步任务交给**特定的线程处理**，函数继续执行完成后正常出栈。当异步操作完成需要执行回调函数时，**特定的处理线程**会将回调函数放入对应的任务队列。

### 任务队列

任务队列是一个遵循先进先出原则的队列，在浏览器中，任务队列由浏览器内核或 ES 引擎创建和管理，浏览器中包含两个主要的任务队列：**宏任务队列（Macro Task Queue）**和**微任务队列（Micro Task Queue）**，它们分别用于存放微任务和宏任务的回调函数，微任务队列执行的优先级高于宏任务队列。

#### 宏任务
- 定时器：`setTimeout()`、`setInterval()`
- UI 事件交互
- 网络请求
- `requestAnimationFrame()`：用于在浏览器的下一帧渲染之前执行回调函数
- `MessageChannel()`：用于跨线程异步通信

#### 微任务
- `Promise`
- `await`：`await` 关键字后的 `Promise` 对象会被包装称微任务
- `MutationObserver()`：监听 DOM 变动的回调会被放入微任务队列

### 事件循环过程

1. 主线程（指 ES 引擎线程）执行同步任务，入栈、出栈直到调用栈为空。执行过程中的异步任务交由特定线程处理，异步操作执行完成后，回调函数被放入对应的微任务队列或宏任务队列中
2. 依次取出微任务队列中的回调函数直到清空
3. 取出宏任务队列中的一个回调函数执行
4. 依次取出微任务队列中的回调函数执行直到清空
5. 重复 `3`、`4` 步骤，直至所有任务队列清空

事件循环持续运行，不断检查微任务队列和宏任务队列。每执行一次宏任务回调函数，就需要清空所有微任务队列。

## Node.js 的事件循环

Node.js 事件循环由 `libuv` 库实现，Node.js 执行过程中的异步任务交由 `libuv` 处理，异步操作执行完成后，回调函数会被放入对应的任务队列中。

当 Node.js 启动时会初始化事件循环，事件循环包含以下六个阶段，这些阶段会依次执行：
1. `timers`：执行到期的 `setTimeout()` 和 `setInterval()` 的回调
2. `pending callbacks`：执行上一个循环的 `poll` 阶段还没来得及处理的回调
3. `idle, prepare`：仅在 Node.js 内部使用，可忽略
4. `poll`：执行网络请求、文件读写等 I/O 的回调
5. `check`：执行 `setImmediate()` 的回调
6. `close callbacks`：执行 `close` 事件回调，如 `socket.on('close', cb)` 的回调

![Node-eventloop](/Node-eventloop.png)

每个阶段都有一个对应的（宏）任务队列，每个阶段都需要清空对应的任务队列，执行完所有的回调函数，事件循环才会进入下一个阶段。Node.js 中还有另外还有两个优先级更高的队列：
- `NextTick Queue`：存放 `procee.nextTick()` 回调，优先级最高，某个阶段产生的 `procee.nextTick()` 回调会插入前阶段的末尾执行，而不是下一个事件循环中
- `MicroTask Queue`：存放 `Promise` 的 `then()`、`catch()` 回调，行为类似 `procee.nextTick()`，优先级仅次于 `NextTick Queue`

![Node-eventloop-order](/Node-eventloop-order.png)

### 关于 `poll` 阶段

在 `poll` 阶段，I/O 的回调函数可能持续触发，因此这个过程可能会阻塞后续阶段的回调执行。

为确保定时器的执行不会误差太多，事件循环会使用定时器队列中最小的 `timeout`，如果在执行 `timeout` 时间后，还有 I/O 回调函数未执行，事件循环会立即结束当前 `poll` 阶段，并将剩余的回调函数放入 `pending callbacks` 队列。

由于回调函数本身是同步执行的，如果某次回调函数执行时间过长，那么定时器可能会有相当大的误差。

```JS
const https = require('https')

https.get('https://httpbin.org/stream-bytes/10240?chunk_size=16',
  response => {
    response.on('data', (chunk) => {
      console.log('CHUNK')
    });

    response.on('end', () => {
      console.log('END')
    });

  }).on('error', err => {
    console.error(err)
  })

setTimeout(() => {
  console.log('SETTIMEOUT')
}, 2000)
```

适当调整 `setTimeout()` 延迟参数，可以得到下面的结果：

```
CHUNK
CHUNK
CHUNK
CHUNK
CHUNK
CHUNK
CHUNK
CHUNK
SETTIMEOUT
CHUNK
CHUNK
...
```

但是如果 `data` 事件的回调函数内有较复杂的费时操作，还是会影响到定时器的准确性。
