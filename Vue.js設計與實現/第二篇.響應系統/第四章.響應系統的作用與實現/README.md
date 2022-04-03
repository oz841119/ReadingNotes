> 看到這章時，我開始覺得難度直線上升，程式碼量也多出了不少，且複雜相當多，
是需要同步手寫慢慢釐清原理，建議先了解完Set, WeakMap, Map數據結構並保持清醒，思緒清晰時再進行閱讀。
而本章內容相對前三章多了非常多(前三章頁數約12頁上下，本章42頁。)
</br>


# 嚮應系統的作用與實現

|[1. 響應式數據與副作用函數](#響應式數據與副作用函數)|[2. 響應式數據的基本實現](#響應式數據的基本實現)|[3. 設計一個完善的響應系統](#設計一個完善的響應系統)|
|-|-|-|
</br>

Vue3的響應式系統改採以Proxy對數據進行代理，除了性能方面的提升外，原文也提到這與「語言規範層面的知識」有一些關係。

> 如何根据语言规范实现对数据对象的代理，以及其中的一些重要细节。(原文所述)

本篇帶著我們初步的實現響應式系統，並不斷遇到需要解決的問題，並去修繕它，進而完成一個「相對完善的響應式系統」。
</br>

---
## 響應式數據與副作用函數
---
「副作用函數」指得是一個會直接或間接影響其他函數執行，或一些對全局變量進行修改的函數。

「響應式數據」則是當數據發生變化時，可以觸發某個函數的數據。
例如這樣。

```js
const obj = { text: 'Hello World'} // 數據

function effect() { // 副作用函數
  document.innerText = obj.text
}

obj.text = 'New Hello World' // 當這句執行完畢時，希望自動去調用effect函數去改變DOM元素的文本節點
```
但目前是做不到的，當obj.text被修改時，它並沒有執行effect函數
</br>

---
## 響應式數據的基本實現
---
接下來我們去思考，當obj.text執行完畢後，如何去觸發一個effect函數?
> 排除掉Vue2的做法，這裡我的第一個念頭是addEventListener，但我嘗試後對addEventListener是EventTarget的方法這個概念有更深入的了解，並非一般的js物件擁有的方法。

這裡先找到了兩個線索
* 當副作用函數(effect)執行時，會發生對目標的「讀取」操作
* 當obj.text被修改時，會發生對目標(obj.text)的「設置」操作
* obj.text被修改時，需要去觸發被依賴的副作用函數。

**讀取**

![imgag1](./image1.svg)
</br>

**設置**

![imgag2](./image2.svg)

</br>
</br>

為了完成對目標的讀取及設置的攔截，Vue3使用Proxy的方式去進行代理。
```js
const data = { text: 'Hello World' }  // 數據
const bucket = new Set()  // 用以存放副作用函數的集合

const obj = new Proxy(data, { // 代理原始數據
  // 攔截讀取
  get(target, key) {
    bucket.add(effect) // 將副作用函數添加進集合中
    return target[key]
  },

  // 攔截設置
  set(target, key, newValue) {
    target[key] = newValue // 將原始數據修改為新值
    bucket.forEach(fn => fn()) // 執行該集合中的所有函數
    return true
  }
})
```

到這，我們完成了將一個數據轉化為響應式數據的簡陋過程。
</br>

---
## 設計一個完善的響應系統
---
先處理第一個問題，當函數effect不叫做effect，而是叫做myEffect、甚至是個匿名函數時我們該怎麼辦？於是我們需要使用一個全局變量來儲存這個副作用函數。
```js
let activeEffect // 創建一個全局變量，用來存放將要被註冊副作用函數

function effect(fn) {
  activeEffect = fn // 將副作用函數存入全局變量
  fn() // 執行副作用函數
}
```

當有副作用函數要被註冊時，我們就可以把副作用函數傳入effect函數來調用
```js
effect(() => { // 將副作用函數傳入
  document.body.innerHTML = obj.text
})
```

這時我們的響應式系統就應該要改為這樣
```js
const obj = new Proxy(data, { // 代理原始數據
  // 攔截讀取
  get(target, key) {
    if(activeEffect) { // 如果activeEffect有值
      bucket.add(activeEffect) // 則添加入集合
    }
    return target[key]
  },

  // 攔截設置
  set(target, key, newValue) {
    target[key] = newValue // 將原始數據修改為新值
    bucket.forEach(fn => fn()) // 執行該集合中的所有函數
    return true
  }
})

```

目前整個響應式系統的流程將為這樣

![image3](./image3.svg)
