const bucket = new Map()
const data = { text: 'Hello World' }

function effect(fn) {
  activeEffect = fn // 將副作用函數存入全局變量
  fn() // 執行副作用函數
}

const obj = new Proxy(data, { // 代理原始數據
  // 攔截讀取
  get(target, key) {
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
    return target[key]
  },

  // 攔截設置
  set(target, key, newValue) {
    target[key] = newValue // 將原始數據修改為新值
    const depsMap = bucket.get(target) // 藉由target從bucket中取得被依賴的key(Map)
    if(!depsMap) return
    const effects = despMap.get(key) // 再藉由Key找出所有被依賴的副作用函數(Set)
    effects && effects.forEach(fn => fn()) // 有值的執行所有副作用函數
    return true
  }
})

effect(() => {
  console.log(`effect函數-----開始`);
  document.body.innerHTML = obj.text
  console.log(`effect函數-----結束`);
})

obj.notExist = '一個原始數據不存在的屬性'
console.log(bucket);