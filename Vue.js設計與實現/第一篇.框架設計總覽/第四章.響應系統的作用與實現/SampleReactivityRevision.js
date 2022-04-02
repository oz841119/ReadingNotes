const data = { text: 'Hello World' }  // 數據
const bucket = new WeakMap()  // 用以存放副作用函數，使用 WeakMap取代上一段的Set資料結構

/* 代理數據 */
const obj = new Proxy(data, {
  get(target, key) {
    if(!activeEffect) return
    let depsMap = bucket.get(target) // 從bucket確認obj代理物件是否存在，deps為Dependence，依賴的意思
    if(!depsMap) { bucket.set(target, (depsMap = new Map())) } // 若是沒有則開始聯繫
    let deps = depsMap.get(key) // 從depsMap中確認key是否存在。
    if(!deps) { depsMap.set(key, (deps = new Set())) } // 若是沒有則對depsMap設置一個key，其值為一個Set，裡面將擁有與key依賴的副作用函數
    deps.add(activeEffect) // 將副作用函數存入deps中
    return target[key]
  },

  set(target, key, newVal) {
    target[key] = newVal // 使原數據為新值
    const depsMap = bucket.get(target) // 從bucket確認obj代理物件是否存在
    if(!depsMap) return // 若是沒有則直接return
    const effects = depsMap.get(key) // 獲取副作用函數的key
    effects && effects.forEach(fn => fn()) // 若具有副作用函數 則遍歷執行
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

setTimeout(() => {obj.text = `Hello Vue3`}, 3000)

// ** ------------------------------- ** //