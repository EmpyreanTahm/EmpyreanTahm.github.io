import{_ as s,c as a,o as l,Q as o}from"./chunks/framework.1f725d55.js";const n="/浅谈GC/unreachable.svg",e="/浅谈GC/memory-fit.png",p="/浅谈GC/memory-align.png",c="/浅谈GC/v8-area.png",r="/浅谈GC/parallel-gc.png",t="/浅谈GC/increase-mark.png",i="/浅谈GC/tri-color-marking.png",d="/浅谈GC/reference-modification.png",y="/浅谈GC/simultaneous.png",G=JSON.parse('{"title":"浅谈 GC","description":"","frontmatter":{},"headers":[],"relativePath":"进阶篇/浅谈 GC.md","filePath":"进阶篇/浅谈 GC.md","lastUpdated":null}'),E={name:"进阶篇/浅谈 GC.md"},h=o(`<h1 id="浅谈-gc" tabindex="-1">浅谈 GC <a class="header-anchor" href="#浅谈-gc" aria-label="Permalink to &quot;浅谈 GC&quot;">​</a></h1><p>程序的运行需要内存，只要程序提出要求，操作系统或者运行时就必须供给内存。程序运行过程中申请的内存大于系统能够提供的内存，导致程序无法申请到足够的内存，会造成内存溢出（Out of Memory）。不再用到的内存，没有及时释放，就叫做内存泄漏（Memory Leak）。</p><div class="language-JS vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">JS</span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#F97583;">let</span><span style="color:#E1E4E8;"> obj </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> { prop: </span><span style="color:#9ECBFF;">&#39;value&#39;</span><span style="color:#E1E4E8;"> }</span></span>
<span class="line"><span style="color:#E1E4E8;">obj </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> [</span><span style="color:#79B8FF;">1</span><span style="color:#E1E4E8;">, </span><span style="color:#79B8FF;">2</span><span style="color:#E1E4E8;">, </span><span style="color:#79B8FF;">3</span><span style="color:#E1E4E8;">, </span><span style="color:#79B8FF;">4</span><span style="color:#E1E4E8;">, </span><span style="color:#79B8FF;">5</span><span style="color:#E1E4E8;">]</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#D73A49;">let</span><span style="color:#24292E;"> obj </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> { prop: </span><span style="color:#032F62;">&#39;value&#39;</span><span style="color:#24292E;"> }</span></span>
<span class="line"><span style="color:#24292E;">obj </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> [</span><span style="color:#005CC5;">1</span><span style="color:#24292E;">, </span><span style="color:#005CC5;">2</span><span style="color:#24292E;">, </span><span style="color:#005CC5;">3</span><span style="color:#24292E;">, </span><span style="color:#005CC5;">4</span><span style="color:#24292E;">, </span><span style="color:#005CC5;">5</span><span style="color:#24292E;">]</span></span></code></pre></div><p>以上代码在执行时：</p><ol><li>栈内存中存放指针，指向堆内存中的对象实体 <code>{ prop: &#39;value&#39; }</code></li><li>被重新赋值一个数组时，栈中的指针指向堆内存中新的数组实体 <code>[1, 2, 3, 4, 5]</code></li><li>对象实体 <code>{ prop: &#39;value&#39; }</code> 不会再被使用到，应该清理其所占的内存空间</li></ol><p>如果没有对不再使用的内存空间进行清理，就会发生内存泄漏。内存泄漏的堆积，会使内存占用越来越高，轻则影响系统性能，重则导致进程崩溃，尤其是持续运行的服务进程（Daemon）。</p><p>ES 具有自动垃圾回收（Garbage Collecation）机制，宿主环境会负责内存的分配和回收。垃圾回收器会按照固定的时间间隔，周期性地找出不再继续使用的变量，然后释放其占用的内存。</p><h2 id="引用计数" tabindex="-1">引用计数 <a class="header-anchor" href="#引用计数" aria-label="Permalink to &quot;引用计数&quot;">​</a></h2><p>引用计数是<strong>被弃用</strong>的垃圾回收策略。引用计数将 “对象不再需要” 与 “对象不被任何对象引用” 挂钩，跟踪记录每个变量值被引用的次数：</p><ul><li>声明变量，并将引用类型值赋值给该变量，引用次数为 <code>1</code></li><li>同一引用类型值被赋值给另一变量，引用次数 <code>+1</code></li><li>同一引用类型值被其它值覆盖，引用次数 <code>-1</code></li><li>当值的引用次数变为 <code>0</code> 时，说明没有变量在使用值，无法被访问，GC 在运行时会清理掉引用次数为 <code>0</code> 的值占用的内存</li></ul><div class="language-JS vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">JS</span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#F97583;">let</span><span style="color:#E1E4E8;"> arr </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> [</span><span style="color:#79B8FF;">1</span><span style="color:#E1E4E8;">, </span><span style="color:#79B8FF;">2</span><span style="color:#E1E4E8;">, </span><span style="color:#79B8FF;">3</span><span style="color:#E1E4E8;">, </span><span style="color:#79B8FF;">4</span><span style="color:#E1E4E8;">]</span></span>
<span class="line"><span style="color:#E1E4E8;">console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;Hello, World!&#39;</span><span style="color:#E1E4E8;">)</span></span>
<span class="line"><span style="color:#6A737D;">// arr = null</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#D73A49;">let</span><span style="color:#24292E;"> arr </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> [</span><span style="color:#005CC5;">1</span><span style="color:#24292E;">, </span><span style="color:#005CC5;">2</span><span style="color:#24292E;">, </span><span style="color:#005CC5;">3</span><span style="color:#24292E;">, </span><span style="color:#005CC5;">4</span><span style="color:#24292E;">]</span></span>
<span class="line"><span style="color:#24292E;">console.</span><span style="color:#6F42C1;">log</span><span style="color:#24292E;">(</span><span style="color:#032F62;">&#39;Hello, World!&#39;</span><span style="color:#24292E;">)</span></span>
<span class="line"><span style="color:#6A737D;">// arr = null</span></span></code></pre></div><p>数组 <code>[1, 2, 3, 4]</code> 是一个值，会占用内存。变量 <code>arr</code> 是仅有的对这个值的引用，因此这个数组的被引用次数为 <code>1</code>。尽管后面的代码没有用到 <code>arr</code> 变量，但数组还是会持续占用内存。如果执行 <code>arr = null</code>，就解除了 <code>arr</code> 对 <code>[1, 2, 3, 4]</code> 的引用，引用次数变成了 <code>0</code>，这部分内存就可以被垃圾回收器释放。</p><p>以下代码执行完后，由两个参数对象由于互相引用使得其引用计数为 <code>2</code>，会造成即使后续不会再被使用到，也会持续占用内存，不被释放，这就是引用计数最大的缺点---无法处理循环引用。</p><div class="language-JS vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">JS</span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#F97583;">function</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">marry</span><span style="color:#E1E4E8;">(</span><span style="color:#FFAB70;">man</span><span style="color:#E1E4E8;">, </span><span style="color:#FFAB70;">woman</span><span style="color:#E1E4E8;">) {</span></span>
<span class="line"><span style="color:#E1E4E8;">  man.wife </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> woman</span></span>
<span class="line"><span style="color:#E1E4E8;">  woman.husband </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> man</span></span>
<span class="line"><span style="color:#E1E4E8;">  </span><span style="color:#F97583;">return</span><span style="color:#E1E4E8;"> </span><span style="color:#9ECBFF;">&#39;Hello, World!&#39;</span></span>
<span class="line"><span style="color:#E1E4E8;">}</span></span>
<span class="line"><span style="color:#B392F0;">marry</span><span style="color:#E1E4E8;">({ name: </span><span style="color:#9ECBFF;">&#39;John&#39;</span><span style="color:#E1E4E8;"> }, { name: </span><span style="color:#9ECBFF;">&#39;Ann&#39;</span><span style="color:#E1E4E8;"> })</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#D73A49;">function</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">marry</span><span style="color:#24292E;">(</span><span style="color:#E36209;">man</span><span style="color:#24292E;">, </span><span style="color:#E36209;">woman</span><span style="color:#24292E;">) {</span></span>
<span class="line"><span style="color:#24292E;">  man.wife </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> woman</span></span>
<span class="line"><span style="color:#24292E;">  woman.husband </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> man</span></span>
<span class="line"><span style="color:#24292E;">  </span><span style="color:#D73A49;">return</span><span style="color:#24292E;"> </span><span style="color:#032F62;">&#39;Hello, World!&#39;</span></span>
<span class="line"><span style="color:#24292E;">}</span></span>
<span class="line"><span style="color:#6F42C1;">marry</span><span style="color:#24292E;">({ name: </span><span style="color:#032F62;">&#39;John&#39;</span><span style="color:#24292E;"> }, { name: </span><span style="color:#032F62;">&#39;Ann&#39;</span><span style="color:#24292E;"> })</span></span></code></pre></div><h3 id="小结" tabindex="-1">小结 <a class="header-anchor" href="#小结" aria-label="Permalink to &quot;小结&quot;">​</a></h3><p>引用计数的优点在于容易实现，当对象不再被引用时，其内存会被立即释放，由于释放操作是针对每个对象个别执行的，由 GC 而产生的中断时间就比较短。</p><p>引用计数最大的缺点是无法释放循环引用的对象。同时，引用计数也不适合并行处理，如果多个线程同时对引用计数进行增减的话，引用计数的值就可能会不一致，导致内存错误。为了避免这种情况的发生，对引用计数的操作必须采用独占的方式来进行。如果引用操作频繁发生，每次都要使用加锁等并发控制机制的话，其开销也是不可小觑的。</p><h2 id="可达性-reachability" tabindex="-1">可达性（Reachability） <a class="header-anchor" href="#可达性-reachability" aria-label="Permalink to &quot;可达性（Reachability）&quot;">​</a></h2><p>为理解标记清除策略，需要先了解 “可达性” 的概念。Node.js 的 <code>global</code> 对象和 JavaScript 的 <code>window</code> 对象，被称作 “根” 对象。</p><p>“可达值” 指<strong>存储在内存中的、可访问或可用的值</strong>：</p><ul><li>当前执行函数的局部变量和参数</li><li>当前嵌套调用链上的其它函数和它们的局部变量和参数</li><li>全局变量</li><li>可通过根对象访问的值，如全局对象的一个属性是另一个对象，这个属性指向的对象是可达的</li></ul><p>可达值在函数作用域的定义都使用了 “当前执行” 进行限制，实际上，在函数在执行完毕后，如果没有返回函数造成闭包，那么此时整个函数作用域将不具备可达性。</p><h2 id="标记清除" tabindex="-1">标记清除 <a class="header-anchor" href="#标记清除" aria-label="Permalink to &quot;标记清除&quot;">​</a></h2><p>标记清除（Mark and Sweep）是目前 ES 引擎中最常用的 GC 策略，各大浏览器的 GC 算法都是基于标记清除的改进和优化。</p><p><strong>标记清除从根对象开始，将具有可达性的对象用递归的方式进行标记，然后将没有标记到的对象作为垃圾进行回收。</strong></p><p>根据标记清除算法，<code>0</code> 引用的对象一定会被回收，而需要被回收的对象却不一定是零引用。前述 <code>marry()</code> 函数执行完毕之后，尽管函数作用域中的对象存在循环引用，但这个函数作用域整体不具备可达性，即通过根对象始终无法访问，因此这个函数作用域整体会成为一个孤岛而不被标记，等待 GC。</p><p><img src="`+n+'" alt="unreachable"></p><div class="tip custom-block"><p class="custom-block-title">归纳</p><p>无论哪种回收策略，<strong>全局变量永远不会被当成垃圾回收</strong>。</p></div><h3 id="小结-1" tabindex="-1">小结 <a class="header-anchor" href="#小结-1" aria-label="Permalink to &quot;小结&quot;">​</a></h3><p>引用计数和标记清除在释放内存后，剩余对象的内存位置依旧不变，会导致空闲内存空间不连续，出现许多内存碎片。</p><p>剩余空闲内存不是一整块，而是由不同大小内存组成的内存列表。在分配大小为 <code>size</code> 的内存时，需要对空闲内存列表进行一次单向遍历找出 <code>&gt;=size</code> 的块才能为其分配，主要的三种分配策略：</p><ul><li><code>First-fit</code>：找到 <code>&gt;=size</code> 的块立即返回</li><li><code>Best-fit</code>：遍历整个空闲列表，返回 <code>&gt;=size</code> 的最小分块</li><li><code>Worst-fit</code>：遍历整个空闲列表，找到最大的分块，将其切成两部分，其中一部分大小为 <code>size</code> 并将该部分返回</li></ul><p><img src="'+e+'" alt="memory-fit"></p><p>内存碎片化导致需要遍历空闲内存列表，选取最适合的内存进行分配，即使是 <code>First-fit</code> 分配策略，时间复杂度也是 <code>O(n)</code>。垃圾回收会导致后续对象，尤其是大对象的内存分配效率变慢。标记整理（Mark Compact）算法可以有效解决这个问题，它会在标记结束后，将被标记的对象向内存的一端移动，最后清理边界的未被标记的内存。</p><p><img src="'+p+'" alt="memory-align"></p><h2 id="v8-的分代回收" tabindex="-1">V8 的分代回收 <a class="header-anchor" href="#v8-的分代回收" aria-label="Permalink to &quot;V8 的分代回收&quot;">​</a></h2><p>垃圾清理算法会定时检查内存中所有的对象，并对可达对象进行标记。其问题在于，一些对象常驻内存，可能伴随代码的整个生命周期，频繁检测这一类对象耗费性能。V8 的分代回收对不同类型的对象使用不同的回收机制和频率，很大程度提高了 GC 的效率。</p><p><img src="'+c+'" alt="v8-area"></p><p>V8 引擎将堆内存分成多个区域，新生代和老生代区域采用不同的策略管理垃圾回收：</p><ul><li>新生代的对象为新产生的、存活时间较短的对象，新生代通常只支持 <code>1～8M</code> 的容量</li><li>老生代的对象为存活事件较长或常驻内存的对象，它们是经历过新生代垃圾回收后还存活下来的对象，老生代容量通常比较大</li></ul><p>新生代对象通过 Scavenge 算法进行 GC，Scavenge 算法主要采用 <a href="https://en.wikipedia.org/wiki/Cheney%27s_algorithm" target="_blank" rel="noreferrer">Cheney</a> 算法。Cheney 算法将新生代分为 2 个同样大小的空间，处于使用状态的空间称为 <code>From</code> ，闲置的空间称为 <code>To</code>，产生的新对象进入 <code>From</code>：</p><ol><li>检查 <code>From</code> 是否已满，已满执行 Scavenge 算法</li><li>标记 <code>From</code> 中的活动对象</li><li>标记完成之后，将 <code>From</code> 的活动对象复制进 <code>To</code> 并进行排序</li><li>清理 <code>From</code> 区域</li><li><code>From</code> 和 <code>to</code> 角色互换</li></ol><p>在执行以上第 3 步时，如果发现：</p><ul><li>对象已经历过多次复制，直接晋升到老生代</li><li>对象会占用 <code>To</code> 空间 <code>&gt;=25%</code> 的大小，晋升到老生代（方便内存分配，防止频繁复制）</li></ul><p>老生代中主要是占用空间大，存活时间久的对象，它主要使用标记清除算法进行 GC，并用标记整理算法解决内存碎片化的问题。对老生代的优化主要是增量标记与惰性清理。</p><h2 id="v8-的增量标记与惰性清理" tabindex="-1">V8 的增量标记与惰性清理 <a class="header-anchor" href="#v8-的增量标记与惰性清理" aria-label="Permalink to &quot;V8 的增量标记与惰性清理&quot;">​</a></h2><p>ES 是单线程语言，只有一个主线程，GC 会阻塞脚本的执行，这种行为叫全停顿（Stop The World）。</p><h3 id="辅助线程" tabindex="-1">辅助线程 <a class="header-anchor" href="#辅助线程" aria-label="Permalink to &quot;辅助线程&quot;">​</a></h3><p>如果执行一次完整 GC 的时间过长，就可能造成运行卡顿。为提高 GC 的效率，V8 采用多个辅助线程同时执行 GC。</p><p><img src="'+r+'" alt="parallel-gc"></p><p>新生代空间就采用辅助线程进行回收，在 GC 过程中，会启动多个线程来负责新生代中的垃圾清理操作，这些线程同时将 <code>From</code> 的对象移动到 <code>To</code>。在这个过程中，由于对象地址会发生改变，所以还需要同步更新引用这些对象的指针。不过好在这个 GC 过程是一个整体，只需要考虑协同问题。</p><p>辅助线程还是一种全停顿的 GC 方式。老生代由于存在的对象多且大，采用辅助线程依然会消耗大量时间。对于老生代空间，V8 采用增量标记进行优化。</p><h3 id="增量标记" tabindex="-1">增量标记 <a class="header-anchor" href="#增量标记" aria-label="Permalink to &quot;增量标记&quot;">​</a></h3><p>增量标记就是将原本一次完整 <strong>GC 标记</strong>（只是标记，不包括回收）的过程，分成多次与主线程任务交替执行。</p><p><img src="'+t+'" alt="increase-mark"></p><p>将一次完整的 GC 标记分次执行造成 2 个主要问题：</p><ul><li>每一小次 GC 标记执行完之后，如何暂停下来去执行任务程序，而后又怎么恢复？</li><li>假如在一次完整的 GC 标记分块暂停后，执行任务程序时内存中标记好的对象引用关系被修改了怎么办？</li></ul><p>为解决增量标记带来的问题，V8 采用 “三色标记法” 和 “写屏障”。</p><h4 id="三色标记法" tabindex="-1">三色标记法 <a class="header-anchor" href="#三色标记法" aria-label="Permalink to &quot;三色标记法&quot;">​</a></h4><p>之前介绍的标记清除将可达性的对象进行标记，不可达对象不予理睬，这实际上一种非黑即白的二色标记法。三色标记法维护一个标记工作表，并对每个对象使用两个标记位进行标记，两个标记位编码白、灰、黑三种颜色：</p><ul><li>白：未被标记</li><li>灰：自身被标记，成员对象未被标记</li><li>黑：自身和成员变量皆被标记</li></ul><p><img src="'+i+'" alt="tri-color-marking"></p><p>在恢复 GC 标记时，如果没有灰色节点，说明本次 GC 标记工作完成，进入清理阶段，反之需要继续从灰色节点继续进行标记。</p><h5 id="强制三色不变性" tabindex="-1">强制三色不变性 <a class="header-anchor" href="#强制三色不变性" aria-label="Permalink to &quot;强制三色不变性&quot;">​</a></h5><p>在一小次 GC 标记后，主线程执行任务时，可能会修改对象的引用关系：</p><p><img src="'+d+'" alt="reference-modification"></p><p>上图中的 <code>C</code> 对象不再具备可达性，在这一轮的 GC 中，它不会标记和清理，不过完全可以等待下轮 GC 处理它。但是新的对象 <code>D</code> 初始是白色，本轮的下一次 GC 标记时，由于没有灰色节点，因此会认为标记结束， <code>D</code> 对象会在本轮 GC 的清理阶段被回收。</p><p>为防止以上情况的发生，V8 增量回收使用了 “写屏障（Write Barriers）” 机制，即一旦有黑色对象引用白色对象，会强制将该白对象置灰，从而保证本轮的下一次 GC 标记正常执行。这个机制也被称作 “强制三色不变性”。因此，上述情况的 <code>D</code> 对象会被强制改为灰色。</p><h3 id="惰性清理" tabindex="-1">惰性清理 <a class="header-anchor" href="#惰性清理" aria-label="Permalink to &quot;惰性清理&quot;">​</a></h3><p>增量标记只对活动对象和非活动对象进行标记，实际还需要清理释放内存。V8 清理释放内存采用惰性清理（Lazy Sweeping）：增量标记完成后，如果内存空间足够，不影响代码的执行，没有必要立即清理，可以适当延迟清理从而让步于脚本的执行。</p><h3 id="小结-2" tabindex="-1">小结 <a class="header-anchor" href="#小结-2" aria-label="Permalink to &quot;小结&quot;">​</a></h3><p>可以看出，增量标记和惰性清理的引入，并没有减少 GC 占用主线程的时间。实际上 V8 采用 “并发标记”，多个辅助线程在后台完成标记工作，并发的优点是不占用主线程，但多个线程的协同需要锁机制来保障。</p><p><img src="'+y+`" alt="simultaneous"></p><p>新生代优化：</p><ul><li>Scavenge 算法</li><li>辅助线程</li></ul><p>老生代优化：</p><ul><li>并发标记：主线程执行程序任务，辅助线程同时执行标记操作</li><li>并行清理：主线程执行清理时，多个辅助线程也同时执行清理，这个过程以增量的方式执行</li></ul><h2 id="识别内存泄漏" tabindex="-1">识别内存泄漏 <a class="header-anchor" href="#识别内存泄漏" aria-label="Permalink to &quot;识别内存泄漏&quot;">​</a></h2><p>在浏览器开发者工具中，使用 Performance 和 Memory 功能，都可以帮助开发者查看内存占用，如果内存占用不是趋于平稳，而是随时间一直上升，则可能发生了内存泄漏。</p><p>Node.js 提供的 <code>process.memoryUsage()</code> 方法执行后返回一个对象，包含了 Node.js 进程的内存占用信息，该对象包含四个字段，单位是 <code>Byte</code>。判断内存泄漏，以 <code>heapUsed</code> 字段为准：</p><div class="language-JS vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">JS</span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#E1E4E8;">process.</span><span style="color:#B392F0;">memoryUsage</span><span style="color:#E1E4E8;">()</span></span>
<span class="line"><span style="color:#6A737D;">/*</span></span>
<span class="line"><span style="color:#6A737D;">  {</span></span>
<span class="line"><span style="color:#6A737D;">    rss: 37306368,</span></span>
<span class="line"><span style="color:#6A737D;">    heapTotal: 7892992,</span></span>
<span class="line"><span style="color:#6A737D;">    heapUsed: 6185232,</span></span>
<span class="line"><span style="color:#6A737D;">    external: 1005812,</span></span>
<span class="line"><span style="color:#6A737D;">    arrayBuffers: 17422</span></span>
<span class="line"><span style="color:#6A737D;">  }</span></span>
<span class="line"><span style="color:#6A737D;">*/</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292E;">process.</span><span style="color:#6F42C1;">memoryUsage</span><span style="color:#24292E;">()</span></span>
<span class="line"><span style="color:#6A737D;">/*</span></span>
<span class="line"><span style="color:#6A737D;">  {</span></span>
<span class="line"><span style="color:#6A737D;">    rss: 37306368,</span></span>
<span class="line"><span style="color:#6A737D;">    heapTotal: 7892992,</span></span>
<span class="line"><span style="color:#6A737D;">    heapUsed: 6185232,</span></span>
<span class="line"><span style="color:#6A737D;">    external: 1005812,</span></span>
<span class="line"><span style="color:#6A737D;">    arrayBuffers: 17422</span></span>
<span class="line"><span style="color:#6A737D;">  }</span></span>
<span class="line"><span style="color:#6A737D;">*/</span></span></code></pre></div><blockquote><ul><li>rss（resident set size）：所有内存占用，包括指令区和堆栈</li><li>heapTotal：“堆” 占用的内存，包括用到的和没用到的</li><li>heapUsed：用到的堆占用的内存</li><li>external： V8 引擎内部的 C++ 对象占用的内存</li><li>arrayBuffers：分配给 <code>ArrayBuffers</code> 和 <code>SharedArrayBuffers</code> 的内存，包括所有 Node.js 缓冲区</li></ul></blockquote>`,82),m=[h];function u(C,g,b,F,f,_){return l(),a("div",null,m)}const v=s(E,[["render",u]]);export{G as __pageData,v as default};
