;(function () {
	console.log('hi')
	const shadowRoot = document.createElement('div').attachShadow({ mode: 'open' })
	const bubble = document.createElement('div')
	bubble.classList.add('message-preview-bubble')
	bubble.innerHTML = ''
	shadowRoot.appendChild(bubble)
	document.body.appendChild(shadowRoot)

	const handleHover = (message: string) => {
		console.log(message)
		bubble.innerHTML = `<p>${message}</p>`
	}

	const setupMutationObserver = () => {
		const sidebar = document.querySelector('.msg-overlay-list-bubble__conversations-list')

		if (sidebar) {
			const mutationObserver = new MutationObserver(mutationsList => {
				console.log(mutationsList)
				mutationsList.forEach(mutation => {
					const addedElements = Array.from(mutation.addedNodes).filter(node => node.nodeType === Node.ELEMENT_NODE)

					console.log('Added elements:', addedElements)

					addedElements.forEach(element => element.addEventListener('hover', () => handleHover('Test')))
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
