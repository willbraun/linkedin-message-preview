;(function () {
	// ========================================
	// Constants
	// ========================================
	const SELECTORS = {
		SHADOW_HOST: '#interop-outlet',
		SIDEBAR_CONTAINER: '.msg-overlay-list-bubble__default-conversation-container',
		SIDEBAR_HEADER: '.msg-overlay-bubble-header__badge-container',
		MESSAGE_BOX: '.entry-point',
		MESSAGE_SNIPPET: '.msg-overlay-list-bubble__message-snippet, .msg-overlay-list-bubble__message-snippet--v2',
	}

	const MARGIN = 20
	const WINDOW_HEIGHT = window.innerHeight
	const MAX_HEIGHT = WINDOW_HEIGHT - MARGIN * 2
	const DEFAULT_FONT_SIZE = '24px'

	const POLLING_CONFIG = {
		fastInterval: 1000,
		fastRetries: 20,
		slowInterval: 5000,
		slowRetries: 20,
		sidebarCheckInterval: 500,
		sidebarCheckRetries: 10,
	}

	// ========================================
	// Shadow DOM Setup for the Bubble
	// ========================================
	const createBubbleElement = () => {
		const host = document.createElement('div')
		const shadowRoot = host.attachShadow({ mode: 'open' })

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
				overflow-y: auto;
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

		const bubble = document.createElement('div')
		bubble.classList.add('message-preview-bubble')
		bubble.style.setProperty('max-height', `${MAX_HEIGHT}px`)
		bubble.style.setProperty('font-size', DEFAULT_FONT_SIZE)

		shadowRoot.appendChild(style)
		shadowRoot.appendChild(bubble)
		document.body.appendChild(host)

		return bubble
	}

	const bubble = createBubbleElement()

	// ========================================
	// Positioning Logic
	// ========================================
	const positionBubble = (boxRect: DOMRect) => {
		bubble.style.setProperty('max-width', '400px')
		bubble.style.setProperty('font-size', DEFAULT_FONT_SIZE)
		bubble.style.setProperty('right', `${boxRect.width + 2 * MARGIN}px`)

		const bubbleRect = bubble.getBoundingClientRect()

		if (bubbleRect.height >= MAX_HEIGHT) {
			handleOverflowBubble(bubble, boxRect, bubbleRect)
		} else {
			handleNormalBubble(bubble, boxRect, bubbleRect)
		}
	}

	const handleOverflowBubble = (bubble: HTMLElement, boxRect: DOMRect, bubbleRect: DOMRect) => {
		bubble.style.setProperty('max-width', `${window.innerWidth - boxRect.width - MARGIN * 4}px`)
		bubble.style.setProperty('top', `${MARGIN}px`)
		shrinkFontToFit(bubble, bubbleRect)
	}

	const shrinkFontToFit = (bubble: HTMLElement, bubbleRect: DOMRect) => {
		while (bubble.scrollHeight > bubbleRect.height) {
			const currentFontSize = Number(bubble.style.fontSize.replace('px', ''))
			bubble.style.setProperty('font-size', `${currentFontSize - 1}px`)
		}
	}

	const handleNormalBubble = (bubble: HTMLElement, boxRect: DOMRect, bubbleRect: DOMRect) => {
		const centeredTop = boxRect.y + (boxRect.height - bubbleRect.height) / 2
		bubble.style.setProperty('top', `${centeredTop}px`)

		const updatedRect = bubble.getBoundingClientRect()
		constrainToViewport(bubble, updatedRect)
	}

	const constrainToViewport = (bubble: HTMLElement, bubbleRect: DOMRect) => {
		if (bubbleRect.y < MARGIN) {
			bubble.style.setProperty('top', `${MARGIN}px`)
		} else if (bubbleRect.y + bubbleRect.height > WINDOW_HEIGHT - MARGIN) {
			bubble.style.setProperty('top', `${WINDOW_HEIGHT - bubbleRect.height - MARGIN}px`)
		}
	}

	// ========================================
	// Event Handling
	// ========================================
	const processedBoxes = new WeakSet<Element>()

	const extractMessage = (box: Element): string => {
		const textElement = box.querySelector(SELECTORS.MESSAGE_SNIPPET)
		return textElement?.textContent ?? ''
	}

	const attachEventListeners = (sidebar: Element) => {
		const boxes = sidebar.querySelectorAll(SELECTORS.MESSAGE_BOX)

		Array.from(boxes).forEach(box => {
			if (processedBoxes.has(box)) return
			processedBoxes.add(box)

			const message = extractMessage(box)

			box.addEventListener('mouseenter', () => {
				bubble.textContent = message
				const boxRect = box.getBoundingClientRect()
				positionBubble(boxRect)
				bubble.classList.add('show-bubble')
			})

			box.addEventListener('mouseleave', () => {
				bubble.classList.remove('show-bubble')
			})
		})
	}

	const setupMutationObserver = (sidebar: Element) => {
		attachEventListeners(sidebar)

		const observer = new MutationObserver(() => {
			attachEventListeners(sidebar)
		})

		observer.observe(sidebar, { childList: true, subtree: true })
	}

	// ========================================
	// LinkedIn DOM Querying
	// ========================================
	let linkedInShadowRoot: ShadowRoot | null = null
	let clickHandlerAdded = false

	const findLinkedInShadowRoot = (): ShadowRoot | null => {
		if (!linkedInShadowRoot) {
			linkedInShadowRoot = document.querySelector(SELECTORS.SHADOW_HOST)?.shadowRoot ?? null
		}
		return linkedInShadowRoot
	}

	const findSidebar = (): Element | null => {
		const shadowRoot = findLinkedInShadowRoot()
		return shadowRoot?.querySelector(SELECTORS.SIDEBAR_CONTAINER) ?? null
	}

	const setupSidebarHeaderClickListener = () => {
		if (clickHandlerAdded) return

		const shadowRoot = findLinkedInShadowRoot()
		const sidebarHeader = shadowRoot?.querySelector(SELECTORS.SIDEBAR_HEADER)

		if (sidebarHeader) {
			sidebarHeader.addEventListener('click', () => pollForSidebar(), { capture: true })
			clickHandlerAdded = true
		}
	}

	// ========================================
	// Initialization & Polling
	// ========================================
	const pollForSidebar = () => {
		let attempts = 0
		const intervalId = setInterval(() => {
			const sidebar = findSidebar()

			if (sidebar) {
				setupMutationObserver(sidebar)
				clearInterval(intervalId)
			}

			attempts++
			if (attempts >= POLLING_CONFIG.sidebarCheckRetries) {
				clearInterval(intervalId)
			}
		}, POLLING_CONFIG.sidebarCheckInterval)
	}

	const checkForLinkedIn = (intervalId: number): boolean => {
		const shadowRoot = findLinkedInShadowRoot()
		if (!shadowRoot) return false

		setupSidebarHeaderClickListener()

		const sidebar = findSidebar()
		if (sidebar) {
			setupMutationObserver(sidebar)
			clearInterval(intervalId)
			return true
		}

		return false
	}

	const startPolling = () => {
		let fastAttempts = 0

		const fastPoll = setInterval(() => {
			checkForLinkedIn(fastPoll)
			fastAttempts++

			if (fastAttempts >= POLLING_CONFIG.fastRetries) {
				clearInterval(fastPoll)
				startSlowPolling()
			}
		}, POLLING_CONFIG.fastInterval)
	}

	const startSlowPolling = () => {
		let slowAttempts = 0

		const slowPoll = setInterval(() => {
			checkForLinkedIn(slowPoll)
			slowAttempts++

			if (slowAttempts >= POLLING_CONFIG.slowRetries) {
				clearInterval(slowPoll)
			}
		}, POLLING_CONFIG.slowInterval)
	}

	// ========================================
	// Entry Point
	// ========================================
	startPolling()
})()
