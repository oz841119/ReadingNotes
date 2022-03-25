const div = document.querySelector('#div') // 獲取div
div.innerText = 'Hello World' // 設置text內容
div.addEventListener('click', () => { alert('按下了') }) // 綁定點擊監聽事件
// *********** //
div.textContent = 'Hello World'