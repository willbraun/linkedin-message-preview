"use strict";
;
(function () {
    const shadowRoot = document.createElement('div').attachShadow({ mode: 'open' });
    const bubble = document.createElement('div');
    bubble.classList.add('message-preview-bubble');
    const maxHeight = window.innerHeight - 40;
    bubble.style.setProperty('max-height', `${maxHeight}px`);
    const fontSize = '24px';
    bubble.style.setProperty('font-size', fontSize);
    bubble.textContent = '';
    shadowRoot.appendChild(bubble);
    document.body.appendChild(shadowRoot);
    const root = document.documentElement;
    const setupMouseOver = (sidebar) => {
        const setupEventListeners = () => {
            const boxes = sidebar.children;
            Array.from(boxes).forEach(box => {
                var _a;
                const textElement = box.querySelector('.msg-overlay-list-bubble__message-snippet, .msg-overlay-list-bubble__message-snippet--v2');
                const message = (_a = textElement === null || textElement === void 0 ? void 0 : textElement.textContent) !== null && _a !== void 0 ? _a : '';
                box.addEventListener('mouseover', () => {
                    bubble.textContent = message;
                    bubble.style.setProperty('height', 'fit-content');
                    bubble.style.setProperty('max-width', `400px`);
                    bubble.style.setProperty('font-size', fontSize);
                    const bubbleRect = bubble.getBoundingClientRect();
                    const boxRect = box.getBoundingClientRect();
                    if (bubbleRect.height === maxHeight) {
                        bubble.style.setProperty('max-width', `${window.innerWidth - boxRect.width - 40}px`);
                        root.style.setProperty('--bubble-x', '20px');
                        root.style.setProperty('--bubble-y', '20px');
                        while (bubble.scrollHeight > bubbleRect.height) {
                            const currentFontSize = Number(bubble.style.fontSize.split('px')[0]);
                            bubble.style.setProperty('font-size', `${currentFontSize - 1}px`);
                        }
                    }
                    else {
                        root.style.setProperty('--bubble-x', `${boxRect.x - bubbleRect.width - 20}px`);
                        root.style.setProperty('--bubble-y', `${boxRect.y + (boxRect.height - bubbleRect.height) / 2}px`);
                    }
                });
            });
        };
        setupEventListeners();
        const mutationObserver = new MutationObserver(_ => setupEventListeners());
        mutationObserver.observe(sidebar, { childList: true });
    };
    const intervalId = setInterval(() => {
        const sidebar = document.querySelector('.msg-overlay-list-bubble__conversations-list');
        if (sidebar) {
            clearInterval(intervalId);
            setupMouseOver(sidebar);
        }
    }, 1000);
})();
