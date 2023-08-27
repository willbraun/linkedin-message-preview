;(function() {
  const shadowRoot = document.createElement('div').attachShadow({ mode: 'open' })
	const bubble = document.createElement('div')
	bubble.classList.add('message-preview-bubble')
	bubble.innerHTML = ''
	shadowRoot.appendChild(bubble)
	document.body.appendChild(shadowRoot)
})()