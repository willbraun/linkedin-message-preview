;(function () {
	const shadowRoot = document.createElement('div').attachShadow({ mode: 'open' })
	const bubble = document.createElement('div')
	bubble.classList.add('message-preview-bubble')
	const margin = 20
	const windowHeight = window.innerHeight

	bubble.textContent = ''
	const maxHeight = windowHeight - margin * 2
	bubble.style.setProperty('max-height', `${maxHeight}px`)
	const fontSize = '24px'
	bubble.style.setProperty('font-size', fontSize)

	shadowRoot.appendChild(bubble)
	document.body.appendChild(shadowRoot)

	const setupMouseOver = (sidebar: Element) => {
		const setupEventListeners = () => {
			const boxes = sidebar.children
			Array.from(boxes).forEach(box => {
				const textElement = box.querySelector(
					'.msg-overlay-list-bubble__message-snippet, .msg-overlay-list-bubble__message-snippet--v2'
				)
				const message = textElement?.textContent ?? ''

				box.addEventListener('mouseenter', () => {
					bubble.textContent = message
					bubble.style.setProperty('max-width', `400px`)

					const bubbleRect1 = bubble.getBoundingClientRect()
					const boxRect = box.getBoundingClientRect()

					if (bubbleRect1.height === maxHeight) {
						bubble.style.setProperty('max-width', `${window.innerWidth - boxRect.width - margin * 2}px`)
						bubble.style.setProperty('left', `${margin}px`)
						bubble.style.setProperty('top', `${margin}px`)

						while (bubble.scrollHeight > bubbleRect1.height) {
							const currentFontSize = Number(bubble.style.fontSize.split('px')[0])
							bubble.style.setProperty('font-size', `${currentFontSize - 1}px`)
						}
					} else {
						bubble.style.setProperty('font-size', fontSize)
						bubble.style.setProperty('left', `${boxRect.x - bubbleRect1.width - margin}px`)
						bubble.style.setProperty('top', `${boxRect.y + (boxRect.height - bubbleRect1.height) / 2}px`)
						
						const bubbleRect2 = bubble.getBoundingClientRect()

						if (bubbleRect2.y + bubbleRect2.height > windowHeight - margin) {
							bubble.style.setProperty('top', `${windowHeight - bubbleRect2.height - margin}px`)
						}
					}
				})
			})
		}

		setupEventListeners()
		const mutationObserver = new MutationObserver(_ => setupEventListeners())
		mutationObserver.observe(sidebar, { childList: true })
	}

	const intervalId = setInterval(() => {
		const sidebar = document.querySelector('.msg-overlay-list-bubble__conversations-list')
		if (sidebar) {
			clearInterval(intervalId)
			setupMouseOver(sidebar)
		}
	}, 1000)
})()
