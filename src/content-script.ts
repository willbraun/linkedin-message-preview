;(function () {
	const host = document.createElement('div')
	const shadowRoot = host.attachShadow({ mode: 'open' })
	const bubble = document.createElement('div')
	bubble.classList.add('message-preview-bubble')
	const margin = 20
	const windowHeight = window.innerHeight

	bubble.textContent = ''
	const maxHeight = windowHeight - margin * 2
	bubble.style.setProperty('max-height', `${maxHeight}px`)
	const fontSize = '24px'
	bubble.style.setProperty('font-size', fontSize)

	// Add styles to the shadow DOM
	const style = document.createElement('style')
	style.textContent = `
		.message-preview-bubble {
			position: fixed;
			padding: 1.2rem;
			width: fit-content;
			max-width: 400px;
			height: fit-content;
			background-color: #fff;
			border-radius: 0.8rem;
			box-shadow: 0px 1px 1px 1px rgba(0, 0, 0, 0.3);
			z-index: 1000;
			visibility: hidden;
		}

		html.theme--mercado-dark,
		html.theme--dark {
			.message-preview-bubble {
				background-color: #15171a;
				color: #e4e4e4;
				box-shadow: 0px 0px 1px 1px rgba(255, 255, 255, 0.3);
			}
		}

		.show-bubble {
			visibility: visible;
		}
  `

	shadowRoot.appendChild(style)
	shadowRoot.appendChild(bubble)
	document.body.appendChild(host)

	let linkedInShadowRoot: ShadowRoot | null | undefined = null

	const setUpEventListeners = (sidebar: Element) => {
		const boxes = sidebar.querySelectorAll('.entry-point')

		Array.from(boxes).forEach(box => {
			const textElement = box.querySelector(
				'.msg-overlay-list-bubble__message-snippet, .msg-overlay-list-bubble__message-snippet--v2',
			)
			const message = textElement?.textContent ?? ''

			// on mouseenter, calculate styles and show bubble
			box.addEventListener('mouseenter', () => {
				bubble.textContent = message
				bubble.style.setProperty('max-width', `400px`)
				bubble.style.setProperty('font-size', fontSize)

				const bubbleRect1 = bubble.getBoundingClientRect()
				const boxRect = box.getBoundingClientRect()

				bubble.style.setProperty('right', `${boxRect.width + 2 * margin}px`)

				if (bubbleRect1.height >= maxHeight) {
					bubble.style.setProperty('max-width', `${window.innerWidth - boxRect.width - margin * 4}px`)
					bubble.style.setProperty('top', `${margin}px`)

					// shrink font until bubble fits on screen
					while (bubble.scrollHeight > bubbleRect1.height) {
						const currentFontSize = Number(bubble.style.fontSize.split('px')[0])
						bubble.style.setProperty('font-size', `${currentFontSize - 1}px`)
					}
				} else {
					bubble.style.setProperty('top', `${boxRect.y + (boxRect.height - bubbleRect1.height) / 2}px`)

					const bubbleRect2 = bubble.getBoundingClientRect()

					// if bubble goes off top
					if (bubbleRect2.y < margin) {
						bubble.style.setProperty('top', `${margin}px`)
					}

					// if bubble goes off bottom
					if (bubbleRect2.y + bubbleRect2.height > windowHeight - margin) {
						bubble.style.setProperty('top', `${windowHeight - bubbleRect2.height - margin}px`)
					}
				}

				bubble.classList.add('show-bubble')
			})

			// on mouseleave, hide bubble
			box.addEventListener('mouseleave', () => {
				bubble.classList.remove('show-bubble')
			})
		})
	}

	const setUpMouseOver = (sidebar: Element) => {
		setUpEventListeners(sidebar)
		const mutationObserver = new MutationObserver(_ => setUpEventListeners(sidebar))
		mutationObserver.observe(sidebar, { childList: true, subtree: true })
	}

	const findSidebar = (intervalId: number) => {
		const sidebar = linkedInShadowRoot?.querySelector('.msg-overlay-list-bubble__default-conversation-container')

		if (sidebar) {
			setUpMouseOver(sidebar)
			clearInterval(intervalId)
		}
	}

	const setUpSidebarOnHeaderClick = () => {
		let sidebarCount = 0
		const sidebarInterval = setInterval(() => {
			findSidebar(sidebarInterval)
			sidebarCount++

			// messages tab is closed
			if (sidebarCount === 10) {
				clearInterval(sidebarInterval)
			}
		}, 500)
	}

	let clickHandlerAdded = false
	const checkForSidebar = (intervalId: number) => {
		linkedInShadowRoot = document.querySelector('#interop-outlet')?.shadowRoot
		if (!linkedInShadowRoot) {
			return
		}

		if (!clickHandlerAdded) {
			const sidebarHeader = linkedInShadowRoot.querySelector('.msg-overlay-bubble-header__badge-container')
			if (sidebarHeader) {
				sidebarHeader.addEventListener('click', setUpSidebarOnHeaderClick, { capture: true })
				clickHandlerAdded = true
			}
		}

		findSidebar(intervalId)
	}

	// check every 1s, then every 5s, then give up after 20 tries of each
	let count1 = 0
	let count2 = 0
	const intervalId1 = setInterval(() => {
		checkForSidebar(intervalId1)
		count1++

		if (count1 === 20) {
			clearInterval(intervalId1)

			const intervalId2 = setInterval(() => {
				checkForSidebar(intervalId2)
				count2++

				if (count2 === 20) {
					clearInterval(intervalId2)
				}
			}, 5000)
		}
	}, 1000)
})()
