# requestAnimationFrame

使用 `setInterval()` 或 `setTimeout()` 完成动画的核心是来定时更新动画的状态和渲染。

这种方法看起来很简单，但实际上有很多问题。首先，它不能保证动画的流畅性，因为定时器的执行时间和浏览器的渲染时间可能不一致，导致动画出现卡顿或掉帧的现象。其次，它不能保证动画的高效性，因为定时器会一直执行，即使浏览器处于后台或隐藏状态，也会消耗资源和电池寿命。最后，它不能保证动画的灵活性，因为定时器的频率是固定的，不能根据不同的设备和环境进行调整。

为了解决这些问题，HTML5 提供了一个新的方法：requestAnimationFrame。这个方法可以让浏览器在合适的时间来执行动画的回调函数，从而实现流畅和高效的动画效果。

## 用法

requestAnimationFrame 的用法很简单，只需要传入一个回调函数作为参数，就可以让浏览器在下一次重绘之前执行这个回调函数。例如，我们可以使用以下代码来改写上面的移动方块的动画：



这里有几点需要注意：

- 回调函数会接收一个参数：timestamp，表示当前时间与页面加载时间的差值（单位为毫秒）。我们可以利用这个参数来计算动画的状态和速度。
- 我们需要在回调函数中再次调用 requestAnimationFrame 来请求下一次动画帧，从而形成一个循环。否则，动画只会执行一次。
- 我们可以使用 cancelAnimationFrame 来取消已经请求的动画帧，传入的参数是 requestAnimationFrame 的返回值，表示动画帧的编号。这样可以在不需要动画时停止动画，节省资源。

## 性能

requestAnimationFrame 的性能优势主要体现在以下几个方面：

- 它可以根据浏览器的刷新率来调整动画帧率，从而保证动画的流畅性。一般来说，浏览器的刷新率是 60Hz，也就是每秒 60 帧，所以 requestAnimationFrame 的回调函数也会每秒执行 60 次。但是，如果浏览器的刷新率低于 60Hz，或者设备的性能不足，那么 requestAnimationFrame 的回调函数会相应地减少执行次数，以避免动画卡顿或掉帧。
- 它可以在后台标签页或隐藏的 \<iframe> 中暂停动画，从而节省资源和电池寿命。这是因为浏览器会根据页面的可见性来决定是否执行 requestAnimationFrame 的回调函数。如果页面不可见，那么回调函数就不会执行，直到页面再次可见时恢复执行。
- 它可以避免动画和其他任务的冲突，从而提高动画的稳定性。这是因为 requestAnimationFrame 的回调函数会在浏览器的主线程中执行，但是它会在其他任务（如事件处理，DOM 操作，网络请求等）之后，渲染之前执行。这样可以保证动画的状态和渲染的一致性，避免出现闪烁或抖动等问题。

## 兼容性

requestAnimationFrame 的兼容性还不是很好，目前只有最新版本的主流浏览器支持它。如果要在不支持的浏览器中使用它，我们需要使用 polyfill 来模拟它。polyfill 是一种代码片段，可以让旧版本的浏览器支持新的特性或方法。

一个简单的 requestAnimationFrame 的 polyfill 如下：

```javascript
// 判断是否已经存在 requestAnimationFrame
if (!window.requestAnimationFrame) {
  // 定义变量
  var lastTime = 0;
  // 创建 requestAnimationFrame
  window.requestAnimationFrame = function(callback) {
    // 获取当前时间
    var now = Date.now();
    // 计算下一次执行时间
    var nextTime = Math.max(lastTime + 16, now);
    // 返回定时器编号
    return setTimeout(function() {
      // 执行回调函数
      callback(lastTime = nextTime);
    }, nextTime - now);
  };
  // 创建 cancelAnimationFrame
  window.cancelAnimationFrame = clearTimeout;
}
```

这个 polyfill 的原理是使用 setTimeout 来模拟 requestAnimationFrame，但是它会根据上一次执行时间来计算下一次执行时间，从而尽量保持每秒 60 帧的效果。

## 总结

requestAnimationFrame 是一个非常有用的方法，可以让我们创建流畅和高效的动画效果。它有以下几个特点和优势：

- 它可以根据浏览器的刷新率来调整动画帧率，保证动画的流畅性。
- 它可以在后台标签页或隐藏的 \<iframe> 中暂停动画，节省资源和电池寿命。
- 它可以


`window.requestAnimationFrame()` 告诉浏览器——你希望执行一个动画，并且要求浏览器在下次重绘之前调用指定的回调函数更新动画。该方法需要传入一个回调函数作为参数，该回调函数会在浏览器下一次重绘之前执行。

:::tip 备注
若你想在浏览器下次重绘之前继续更新下一帧动画，那么回调函数自身必须再次调用 `requestAnimationFrame()`。`requestAnimationFrame()` 是一次性的。
:::

当你准备更新在屏动画时你应该调用此方法。这将使浏览器在下一次重绘之前调用你传入给该方法的动画函数（即你的回调函数）。回调函数执行次数通常是每秒 60 次，但在大多数遵循 W3C 建议的浏览器中，回调函数执行次数通常与浏览器屏幕刷新次数相匹配。为了提高性能和电池寿命，在大多数浏览器里，当 `requestAnimationFrame()` 运行在后台标签页或者隐藏的 \<iframe> 里时，`requestAnimationFrame()` 会被暂停调用以提升性能和电池寿命。

[`DOMHighResTimeStamp`](https://developer.mozilla.org/zh-CN/docs/Web/API/DOMHighResTimeStamp) 参数会传入回调方法中，它指示当前被 `requestAnimationFrame()` 排序的回调函数被触发的时间。在同一个帧中的多个回调函数，它们每一个都会接受到一个相同的时间戳，即使在计算上一个回调函数的工作负载期间已经消耗了一些时间。该时间戳是一个十进制数，单位为毫秒，最小精度为 1ms（1000μs）。

:::warning 警告
请确保总是使用第一个参数（或其他一些获取当前时间的方法）来计算动画在一帧中的进度，否则动画在高刷新率的屏幕中会运行得更快。
:::

## 语法

```js
requestAnimationFrame(callback)
```

### 参数

`callback`

当你的动画需要更新时，为下一次重绘所调用的函数。该回调函数会传入 [`DOMHighResTimeStamp`](https://developer.mozilla.org/zh-CN/docs/Web/API/DOMHighResTimeStamp) 参数，该参数与 [`performance.now()`](https://developer.mozilla.org/zh-CN/docs/Web/API/Performance/now) 的返回值相同，它表示 `requestAnimationFrame()` 开始执行回调函数的时刻。

### 返回值

一个 `long` 整数，请求 ID，是回调列表中唯一的标识。是个非零值，没有别的意义。你可以传这个值给 [`window.cancelAnimationFrame()`](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/cancelAnimationFrame) 以取消回调函数请求。

## 优点

- 电池友好

