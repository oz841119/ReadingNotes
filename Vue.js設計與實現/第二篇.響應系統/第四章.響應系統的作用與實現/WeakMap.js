const map = new Map()
const weakMap = new WeakMap()

function fun() {
  const obj = {a: 1}
  const obj2 = {b: 2} 
  map.set(obj,11)
  weakMap.set(obj2, 22)
}

console.log(map);
console.log(weakMap);