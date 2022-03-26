(update: 20220325)
# 權衡的藝術
|[1. Vue應是命令式還是聲明式?](#vue應是命令式還是聲明式)|[2. 虛擬dom的性能如何](#虛擬dom的性能如何)|
|-|-|

---
## Vue應是命令式還是聲明式？
---
### 命令式
```js
const div = document.querySelector('#div') // 獲取div
div.innerText = 'Hello World' // 設置text內容
div.addEventListener('click', () => { alert('按下了') }) // 綁定點擊監聽事件
```
命令式使我們關注於功能實現的過程。
獲取元素⋯設置文本⋯監聽點擊⋯點擊後彈框
</br>

### 聲明式
```
<div @click="() => { alert('彈出了') }">Hello World</div>
```
而聲明式使我們更關注於結果，不必過分在乎背後具體如何實現，因為Vue將過程給封裝了起來。
重要的事，Vue的具體實現一定是命令式的，他只是對開發者們暴露了聲明式的實現，使得我們能夠基於Vue撰寫出更易於維護及直觀的程式碼。
</br>

### 性能及可維護性
聲明式的性能是不可優於命令式的，如同你不可能可以找到比這段程式碼還要更好的性能，因為它已經是最好的。
```js
div.textContent = 'Hello World'
```
也因命令式設計理論上來說能夠寫性能最極致的程式碼。

然而，Vue為了將暴露給開發者的聲明式設計達到性能的更優解，它必須找到差異並只更新不同的地方，並且完成更新的程式碼仍然是
```js
div.textContent = 'Hello World'
```
那麼**找出差異**便是額外的性能消耗
|性能消耗||
|:--:|:--:|
|命令式|更新|
|聲明式|**找出差異** + 更新|

哪怕找出差異的性能消耗為0，仍然只能做到與命令式相同，卻不能超越。
</br>

### 結論
Vue為了使開發者具有更良好的開發體驗及維護性，將聲明式設計暴露給了消費者，所以相對於命令式設計，也伴隨著性能耗損的問題。
為了使性能耗損的問題有更優解，Vue也使用了**虛擬DOM**(Virtual DOM)來對比及更新**真實DOM**

---
## 虛擬DOM的性能如何？
---

### 虛擬DOM主要為了解決什麼問題？
最小化**找出差異**的性能消耗
</br>

### 與原生JavaScript的性能比較
原文所述，這裡所提的原生JavaScript暫不包括innerHTML，因為它有些特殊，需要另外討論。

然而，使用jQuery的開發者們經常使用innerHTML，所以這段解釋了innerHTML的性能耗損，不過我並沒有實際使用jQuery進行開發過，這段並沒有完全的理解起來。
不過大意來說，innerHTML在更新時的耗損遠比虛擬DOM來得高。
</br>

##### 釐清DOM層面運算和JavsScript層面運算的性能差別
###### JavaScript層面運算
```js
const app = [] 
for(let i = 0 ; i < 10000 ; i++) {
  const div = { tag: `div`}
  app.push(div)
  // 其結果為「app陣列」中一萬個tag為div的平級元素(lenght = 10000)
  // Operation per second: 16232 ops/s
}
```
</br>

###### DOM層面運算
```js
const app = document.querySelector(`#app`)
for(let i = 0 ; i < 10000 ; i++) {
  const div = document.createElement(`div`)
  app.appendChild(div)
  // 其結果為「app元素中」創建10000個div並渲染到頁面中
  // Operation per second: 33.29 ops/s
}
```
可以看出來，JavaScript層面的運算效率遠高出DOM層面運算效率非常多
</br>

##### 比較innerHTML和虛擬DOM在『 創建 』頁面時的性能

||虛擬DOM|innerHTML|
|:-:|:-:|:-:|
|**JavaScript運算**|創建物件(VNode)|渲染HTML字串|
|**DOM運算**|新建所有DOM元素|新建所有DOM元素|
<br>

##### 比較innerHTML和虛擬DOM在『 更新 』頁面時的性能

當使用innerHTML更新頁面時事需要重構字串，並且重設DOM的innerHTML屬性。而重設innerHTML屬性意味著DOM的銷毀再創建。

而虛擬DOM的做法是再創建一個新的VNode，並且與舊的VNode找出差異(diff)並更新DOM。[那麼如何更新DOM呢?( 待更新 )](#待補充)
||虛擬DOM|innerHTML|
|:-:|:-:|:-:|
|**JavaScript運算**|創建物件(New VNode) + diff|渲染HTML字串|
|**DOM運算**|找到差異點並更新|銷毀舊的DOM<br>新建新的DOM|

在比較JS及DOM層面運算的時候提到效率相差甚遠的問題，甚至不在同一個量級上，所以diff所產生的**JS運算額外消耗**是能夠遠低於innerHTML銷毀並重建的**DOM運算消耗**

那麼原生JS(指createElement等方法)的DOM運算也就是**命令式更新**而已，比起虛擬DOM運算少了**找出差異點**，自然性能是最優秀的，但可維護性卻遠低於**聲明式告知Vue進行更新**。

---
## 運行時及編譯時
---
### 運行時
假設想在一個純運行時的框架中模擬一個簡易的Render函數，作用是將物件渲染到DOM上。
```js
    const obj = { // 建立一個想添加的樹形結構物件，用來描述DOM結構
      tag: `div`, // HTML的Tag標籤
      children: [ // 該標籤下的子節點 若為String則指的是Text節點(文本內容)，為陣列則包含其他子節點
        {
          tag: `span`,
          children: `Hello World`
        },
        {
          tag: `a`,
          children: `Link`
        },
        {
          tag: `div`,
          children: [
            {
              tag: `p`,
              children: `段落`
            }
          ]
        }
      ]
    }
    Render(obj, document.body)

    function Render(obj, root) {
      const el = document.createElement(obj.tag) // 打算創建的HTML Tag標籤
      if(typeof obj.children === `string`) {
        const text = document.createTextNode(obj.children)
        el.appendChild(text) // 在指定的HTML Tag創建一個文本節點
      } 
      else if(obj.children) {
        obj.children.forEach((child) => Render(child, el)) // 遍歷children陣列，並遞迴 (以本次循環得到的el及物件或String作為傳參再次調用Render函數)
      }
      root.appendChild(el) //最終將整個el掛載在root中
    }
```
> 這裡的Render函數僅模擬了Tag標籤及其他子節點，未包含Tag中的屬性等...

當JavaScript在運行時，執行了Render函數並傳入了用戶期望了樹形結構物件，最終目的是將他渲染成一個用戶可見的HTML文本，但開發者們仍需要自行撰寫樹形結構物件，他也脫離了以往我們編寫HTML的習慣，未免也太麻煩了，於是編寫HTML結構，再將這個結構在「編譯時」編譯成樹形結構物件的想法就出來了，如圖所示。
```html
<div>
  <span> Hello World </span>
</div>
```
&darr; 編譯後 &darr;
```js
const obj = {
  tag: `div`,
  children: [
    {
      tag: `span`,
      children: `Hello World`
    }
  ]
}
```
</br>

### 運行時編譯
為了實現這個目的，我們需要編寫一個名為Compiler的feature，使得HTML字串能夠在JavaScript在運行的時候透過Compiler函數編譯為樹形結構物件，就像這樣。
> Compiler函數的具體實現尚未提及

```js
// 編寫HTML字串
const html = `
  <div>
    <span> Hello World </span>
  </div>
`

// 調用Compiler函數將HTML字串編譯為樹狀結構物件
const obj = Compiler(html)

// 調用Render函數渲染為DOM
Render(obj, document.body)
```
</br>

**既然如此，為何不能直接將html字串編譯為命令式程式碼(直接地操作DOM，不透過Render函數操作了)？**
如此一來，框架就會成了「純編譯時」，編輯器將程式碼編譯完成後交由執行環境執行，性能可能會更好，但靈活性會降低。(當然，這也是業內正在追求的。)

**所以，Vue成了「運行時」＋「編譯時」的設計**
便於提前分析程式碼，將可能改變和不會改的內容分離出來，提交給Render函數進行更好的優化。[關於Vue在編譯優化相關的內容?( 待更新 )](#待補充)

(20220327)
