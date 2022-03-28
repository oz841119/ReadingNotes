const data = { text: 'Hello World' }  // 數據
const bucket = new Set()  // 用以存放副作用函數

/* 代理數據 */
const obj = new Proxy(data, {
  get(target, key) {
    if(activeEffect) {
      bucket.add(activeEffect) // 將effect函數添加到bucket *
    }
    return target[key]
  },
  set(target, key, newVal) {
    target[key] = newVal // 使原數據為新值
    bucket.forEach(fn => fn()) // 尋訪bucket中的函數並執行 *
    return true
  }
})

/* 撰寫一個註冊器 */
let activeEffect  // 使用一個全局變存放被註冊的副作用函數
function effect(fn) { // 用於註冊副作用函數，接收一個function
  activeEffect = fn 
  fn()
}

/* 使用註冊器 */
effect(
  () => {
    console.log(`effect fun`);
    document.body.innerText = obj.text
  }
)

setTimeout(() => {obj.notExist = `Hello Vue3`}, 3000)