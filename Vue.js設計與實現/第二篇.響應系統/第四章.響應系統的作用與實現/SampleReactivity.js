const bucket = new Set()
const data = { text: 'Hello World' }

function effect(fn) {
  activeEffect = fn // 將副作用函數存入全局變量
  fn() // 執行副作用函數
}

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

effect(() => { // 將副作用函數傳入
  document.body.innerHTML = obj.text
})

obj.text = '123'
obj.text = '24'
