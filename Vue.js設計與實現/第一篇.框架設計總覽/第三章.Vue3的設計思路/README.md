# Vue3的設計思路
|[1. 聲明式渲染UI](#聲明式渲染UI)|[2. 初識渲染器](#初識渲染器)|[3. 組件本質](#組件本質)|[4. 模板的工作原理](#模板的工作原理)|[5. Vuejs是各個模塊組成的有機整體](#Vuejs是各個模塊組成的有機整體)|
|-|-|-|-|-|
</br>

---
## 聲明式渲染UI
---
在Vue3中，實際的例子就像是這樣。
* 使用和HTML Tags相同的方式來描述DOM及其靜態屬性。(Ex: \<span id="mySpan">\<a href="./.../.../...">\</a>\</span>)
* 使用v-bind描述動態屬性。(Ex: \<span :id="someId">...\</span>)
* 使用v-on描述事件。(Ex: \<span @click="alert('display')">...\</span>)
* JavaScript物件...(第一章提到)

聲明式渲染UI可以使我們僅用短短幾句話告訴Vue我們想要獲得的結果。
</br>

---
## 初識渲染器
---
Vue渲染器的作用就是將虛擬DOM轉變為真實DOM並渲染到頁面上。
</br>

**我們直接來編寫一個簡易的渲染器renderer**
```js
function renderer(vnode, container) { // 渲染器(虛擬節點物件, 真實節點(一般指向父節點))
  // 處理Tag
  const el = document.createElement(vnode.tag) // 以虛擬節點的tag屬性作為標籤名

  // 處理屬性及事件 (這段屬性貌似沒有掛入...)
  for(const key in vnode.props) { // 遍歷虛擬節點的props屬性，把事件和屬性添加到DOM元素
    if(/^on/.test(key)) { // 若key以on作為開頭，則為事件
      el.addEventListener( // 掛載監聽器
        key.substr(2).toLowerCase(), // 去掉on並轉為小寫
        vnode.props[key] // 回調函數
      )
    }
  } 

  // 處理children (children如果是字串 說明為文本) 數組的話則為其他子節點(如span標籤)
  if(typeof vnode.children === "string") { // 如果是字串(文本節點)則直接掛載
    el.appendChild(document.createTextNode(vnode.children))
  } else if (Array.isArray(vnode.children)) {
    vnode.children.forEach(child => renderer(child, el)) // 遍歷並遞迴
  }

  // 終將元素掛載進container
  container.appendChild(el)
}
```

並且執行它
```js
const vnode = {
  tag: "a",
  props: {
    onClick: () => alert('test'),
  },
  children: [
    {
      tag: "div",
      children: 'check'
    }
  ]
}

renderer(vnode, document.body)
```

我們可以在頁面上看到body下產生了一個a節點，a節點被綁定了一個點擊監聽器，點擊後彈框。其有一個子節點為div，文本為check。

聽起來很簡單，但事實上，目前僅僅提到了初次渲染，真正複雜的更新渲染內容後在之後的章節所提到。
</br>

---
## 組件本質
---
平時我們透過Vue CLI建立一個Vue應用，可能在一個.vue檔案中編寫template作為組件，而組件名稱是我們自定義的，它無法依照這個名字被掛載進真實DOM成為一個Tag標籤，所以Vue在編譯模板的時候，會將組件透過一個函數封裝起來，這個函數的返回值便是需要掛載渲染的內容。
```js
const myComponent = function() {
  return {
    tag: "div",
    props: {
      onClick: () => alert('test'),
    },
    children: 'check'
  }
}

// 用vnode物件的tag儲存組件。
const vnode = {
  tag: myComponent
}
```
可以發現，return的結構與vnode一致。但為了讓渲染器可以知道這是一個組件，我們讓渲染器對tag屬性做型別判斷，區分選擇調用掛載元素還是掛載組件。
其中，掛載元素的方法就是上文函數一致，所以接下來我們關注掛載組建的方法。
</br>

```js
/// 渲染器
function renderer(vnode, container) {
  if(typeof vnode.tag === 'string') {
    mountElement(vnode, container)
  } else if (typeof vnode.tag === 'function') {
    mountComponent(vnode, container)
  }
}
```

</br>

**mountComponent**
```js
/// mountComponent
function mountComponent(vnode, container) {
  const subtree = vnode.tag()
  renderer(subtree, container)
}
```
其實就很簡單，主要的作用就是在接受這個組件函數的返回值，而這個返回值就是一個vnode結構。
</br>

**當你仍希望用物件去表示組件，而不是函數時，你也可以這樣做**
```js
// 物件中含有一個render方法，返回vnode結構
const myComponent = {
  render() {
    return {
      tag: "div",
      props: {
        onClick: () => alert('test'),
      },
      children: 'check'
    }
  }
}

const vnode = {
  tag: myComponent
}
```

```js
/// 渲染器
function renderer(vnode, container) {
  if(typeof vnode.tag === 'string') {
    mountElement(vnode, container)
  } else if (typeof vnode.tag === 'object') { // function改為object
    mountComponent(vnode, container)
  }
}
```

```js
/// mountComponent
function mountComponent(vnode, container) {
  const subtree = vnode.tag.render() //執行物件中的方法
  renderer(subtree, container)
}
```
其實就是一點點改動而已。原文提到，Vue中的有狀態組件便是使用物件結構來做表達。
</br>

---
## 模板的工作原理
---
Vue的模板也就是我們在.vue檔案內編寫的template，編寫的方式近似於HTML，也使我們可以直接在template內去聲明動態屬性、事件等，甚至直接去遍歷渲染動態節點。而實現這件事情的便是Vue的編譯器，其功能是解析模板並將模板編譯為渲染函數(render)，終由渲染器(renderer)進行渲染。

編譯器具體的工作原理也是個巨大的工程，後續章節也會重點提到。
</br>

---
## Vuejs是各個模塊組成的有機整體
---
在我們去理解Vue時，依然需要去了解各個模塊之間的關聯性，因為他們在整個Vue中依然彼此依賴及制約，構成了一個有機整體。例如編譯器和渲染器之間的配合，並去實現性能提升。
</br>
例如目前我們有個模板

```
<div id="foo" :class="cls"></div>
```
</br>
編譯器將他編譯為渲染函數

```js
render() {
  return {
    tag: 'div',
    props: {
      id: 'foo',
      class: cls
    }
    patchFlags: 1 // 數字為1表示class是動態的
  }
  // 等價於 return h('div', {id: 'foo', class: cls})
}
```

而當編譯器執行時，編譯器會透過模板給出的訊息(v-bind...)，去識別靜態及動態屬性，使得渲染器可以更高效的尋找到可能會發生更新的點。
> 目前這段比較陌生的地方是props中有了屬性，而非單純的事件，截至本段，渲染器(renderer)為標籤掛入屬性的方法尚未呈現。