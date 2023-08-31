;(function () {
	console.log('hi')
	const shadowRoot = document.createElement('div').attachShadow({ mode: 'open' })
	const bubble = document.createElement('div')
	bubble.classList.add('message-preview-bubble')
	bubble.textContent = ''
	shadowRoot.appendChild(bubble)
	document.body.appendChild(shadowRoot)

	const handleMouseOver = (message: string) => {
		bubble.textContent = message
	}

	const setupMutationObserver = () => {
		const sidebar = document.querySelector('.msg-overlay-list-bubble__conversations-list')

		if (sidebar) {
			const boxes = sidebar.children
			const mutationObserver = new MutationObserver(_ => {
				Array.from(boxes).forEach(box => {
					const textElement = box.querySelector(
						'.msg-overlay-list-bubble__message-snippet, .msg-overlay-list-bubble__message-snippet--v2'
					)
					const message = textElement?.textContent ?? ''

					box.addEventListener('mouseover', () => handleMouseOver(message))
				})
			})

			const observerConfig = { childList: true }
			mutationObserver.observe(sidebar, observerConfig)
		} else {
			console.error('The target element is still null or undefined.')
		}
	}

	const intervalId = setInterval(() => {
		if (document.querySelector('.msg-overlay-list-bubble__conversations-list')) {
			clearInterval(intervalId)
			setupMutationObserver()
		}
	}, 1000)
})()
