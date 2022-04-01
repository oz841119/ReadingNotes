function renderer(vnode, container) { // 渲染器(虛擬節點物件, 真實節點(一般指向父節點))
  // 處理Tag
  const el = document.createElement(vnode.tag) // 以虛擬節點的tag屬性作為標籤名

  // 處理屬性及事件 (這段屬性應該尚未掛入)
  for(const key in vnode.props) { // 遍歷虛擬節點的props屬性，把事件和屬性添加到DOM元素
    if(/^on/.test(key)) { // 若key以on作為開頭，則為事件
      el.addEventListener( // 掛載監聽器
        key.substr(2).toLowerCase(), // 去掉on並轉為小寫 (substr是一個沒有被嚴格廢棄的方法，請留意)
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

////////////////////////////////

// test
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

////////////////////////////////

// 組件
const myComponent = function() {
  return {
    tag: "div",
    props: {
      onClick: () => alert('test'),
    },
    children: 'check'
  }
}