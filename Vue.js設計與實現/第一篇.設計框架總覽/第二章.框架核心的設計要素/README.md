> 撰寫完第一章時，我發現了由於**內容過多**失去了撰文的本意，使這個Notes變得類似於翻譯，但原文就是簡體中文呀！！！
所以我想試著更簡單扼要的描繪出我的筆記心得。

# 框架核心的設計要素
|[1. 開發體驗](#開發體驗)|[2. 體積](#體積)|[3. Tree Shaking](#Tree-Shaking)|[4. 應輸出怎樣的產物(略)](#應輸出怎樣的產物)|[5. 特性開關](#特性開關)|
|-|-|-|-|-|
</br>

框架的設計不單單僅是將**功能實現**，更包括了開發者在不如預期的使用框架時，是否需要**報錯**或是**警告**(Ex: console.warn(msg))？是否以**按需引入**(Ex: import { function1, function2 } from File)的方式讓開發者使用？**Hot Module Replacement**(HMR)的支持？**開發及生產版本**的建構區別等，幾乎是針對開發者的**開發體驗**、**運行效率**及**體積壓縮**為指標去考量設計要素。

---
## 開發體驗
---
例如試圖將Vue掛載到一個尚不存在的節點上，它應該提供一個警告，讓開發者可以快速定位問題。
```js
createApp(App).mount(`#not-exist`)
```
>[ Vue warn ]: Failed to mount app: mount target selector "#not-exist" returned null.

</br>
假設Vue不產生Warn，那麼瀏覽器可能會提供一個錯誤，這會使得開發者沒辦法快速找到問題所在。

> Uncaught TypeError: cannot read property "xxx" of null.

</br>
另一點有趣的是，Vue也提供了我們在瀏覽器控制台列印一些Vue編寫的數據時，輸出Vue自定義的formatter，使得我們在觀測數據時變得更加直觀。

```js
console.log(ref(0)) // 書籍以ref(0)作為舉例 有興趣的朋友可以嘗試看看
```

</br>
不過我相關的設定一直是關閉著，在這之前也不知道有這個作用。

> Google瀏覽器需開啟enable custom formatter(偏好設定 > 主控台 > 啟用自訂格式器)

</br>

---
## 體積
---
原書本章接下來的內容會有更多**rollup.js**的內容，作者在本章的前言就提供了個建議，學習本章時要求讀者對常用的模塊打包工具有一定的使用經驗，尤其是**rollup.js**或是**webpack**，我的理解是「手動配置」打包工具，**而非在Vue CLI直接執行個npm run build進行產出而已。**

而我也極少去主動配置已經幫我們架構好的打包文件，所以接下來的內容我理解也是有限，甚至直接略過筆記，建議酌情閱讀。
</br>

**\__DEV__**
```js
if(__DEV__ && XXX) {
  warn(WarningMessage) // warn函數最終會調用console.warn(WarningMessage)
}
```
稍微去看一下Vue3的原始碼會發現，當調用warn函數時，通常會伴隨__DEV__的判斷，主要用於建構開發版本時，__DEV__的參數為true，而生產版本則為false，而__DEV__也不是變數，而是常數，透過rollup.js的插件預先定義的。

在生產版本中，由於不需要提示開發者有關於開發體驗的訊息，這段程式碼會永遠被判斷為false永不執行，也就是所稱的**dead code**，那麼這段程式碼也不應該出現在生產版本中，所以在打包時就會被移除。

接下來的內容也提到了**Tree-Shaking**，本意就是排除dead code(也包括上方提到的__DEV___的生產版本)，但原文包括許多rollup的配置，我就暫且不做過多的筆記，以我目前的知識儲備可能還沒有辦法全面的理解。

</br>

---
## Tree Shaking
---
指的是排除那些永遠不會被執行的程式碼，為了實現Tree-Shaking，模塊必須為**ES Module**，這裡有一個我覺得很有意思的地方。

在文件中導出foo和bar函數，並在其他文件中**僅導入foo函數**並執行，打包時。
```js
  function foo(obj) { obj && obj.foo }
  foo()
```
bar函數很直觀的可以知道不會被包含在內，因為我們也沒有導入，Tree Shaking起了作用。但為什麼執行foo函數但不傳參時，意味著foo函數的功能僅有讀取值而已，沒有參數可以供內部執行或返回，那何不乾脆也一起排除掉就好了？

**這就與Tree Shaking的作用有關係了—「副作用」。**

foo自己的作用域中如果找不到obj，那他將往上層開始找，如果obj在作用域鏈中被找到了，它是有可能被**讀取**到的。涉及**讀取**，如果obj為proxy物件，那是能夠執行proxy的Callback。
</br>

**那為什麼在打包時不做一個全文的掃描，分析foo這個函數到底有無副作用？**

這也是我想知道的，但原文提到，「 因為**分析是靜態的**，而**Javascript是動態的**，所以想要靜態分析Javascript很困難。 」可能你跟我一樣很難理解這句話的原理。

不過，rollup.js提供了一種方式讓我們可以確切的告訴它將某個函數不會產生副作用，類似於這樣。

```js
export const isHTMLTag = /*#__PURE__*/ makeMap(HTML_TAGS)
```
</br>

---
## 應輸出怎樣的產物
---
(略)