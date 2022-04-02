function renderer(vnode, container) { // 渲染器(虛擬節點物件, 真實節點(一般指向父節點))
  if(typeof vnode.tag === 'string') {
    mountElement(vnode, container)
  } else if (typeof vnode.tag === 'function') {
    mountComponent(vnode, container)
  }
}

////////////////////////////////
// test
// const vnode = {
//   tag: "a",
//   props: {
//     onClick: () => alert('test'),
//   },
//   children: [
//     {
//       tag: "div",
//       children: 'check'
//     }
//   ]
// }
// renderer(vnode, document.body)

////////////////////////////////

// 組件
const myComponent = {
  render() {
    return {
      tag: "div",
      props: {
        onClick: () => alert('test'),
      },
      children: 'check'
    }
  }
}