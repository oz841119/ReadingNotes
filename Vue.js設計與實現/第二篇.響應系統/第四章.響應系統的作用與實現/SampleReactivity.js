const bucket = new WeakMap()
const data = { text: 'Hello World', ok: true }

let activeEffect
function effect(fn) {
  const effectFn = () => {
    activeEffect = effectFn // 設置為當前啟用的副作用函數
    fn() // 執行副作用函數
  }

  effectFn.deps = [] // 用來儲存和這個副作用函數依賴的屬性
  effectFn()
}

/* ----- 開始代理物件並設置攔截 ----- */
const obj = new Proxy(data, { // 代理原始數據
  // 攔截讀取
  get(target, key) {
    track(target, key) // 調用trackc函數
    return target[key]
  },

  // 攔截設置
  set(target, key, newValue) {
    target[key] = newValue // 將原始數據修改為新值
    trigger(target, key) // 調用trigger函數
    return true
  }
})

/* ----- 封裝會被攔截時將調用的函數 ----- */

function track(target, key) {
  if(!activeEffect) return
  let depsMap = bucket.get(target) //從bucket取得原始數據
  if(!depsMap) { // 如果depsMap沒有值的話
    // 則在bucket(WeakMap)中去設立一個Key為原始數據，Value為一個空Map
    bucket.set(target, (depsMap = new Map))
  }
  let deps = depsMap.get(key) // 透過讀取的Key取得依賴的副作用函數
  if(!deps) { // 如果deps沒有值的話
    // 則以原始數據的Key為Map的Key，Value為一個空集合
    depsMap.set(key, (deps = new Set()))
  }
  deps.add(activeEffect) // 最後將副作用函數添加入集合中
  activeEffect.deps.push(deps)
  console.log(deps);
}

function trigger(target, key) {
  const depsMap = bucket.get(target) // 藉由target從bucket中取得被依賴的key(Map)
  if(!depsMap) return // 屬性如果並非響應式數據的話就直接ruturn
  const effects = depsMap.get(key) // 再藉由Key找出所有被依賴的副作用函數(Set)
  effects && effects.forEach(fn => fn()) // 有依賴副作用函數的話的執行所有副作用函數
}

/* ----- 執行effect函數，讓被讀取的代理物件成為一個響應式數據 ----- */
effect(() => {
  document.body.innerHTML = obj.text
})

obj.text = '123'