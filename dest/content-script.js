"use strict";
;
(function () {
    const shadowRoot = document.createElement('div').attachShadow({ mode: 'open' });
    const bubble = document.createElement('div');
    bubble.classList.add('message-preview-bubble');
    const margin = 20;
    const windowHeight = window.innerHeight;
    bubble.textContent = '';
    const maxHeight = windowHeight - margin * 2;
    bubble.style.setProperty('max-height', `${maxHeight}px`);
    const fontSize = '24px';
    bubble.style.setProperty('font-size', fontSize);
    shadowRoot.appendChild(bubble);
    document.body.appendChild(shadowRoot);
    const setupMouseOver = (sidebar) => {
        const setupEventListeners = () => {
            const boxes = sidebar.children;
            Array.from(boxes).forEach(box => {
                var _a;
                const textElement = box.querySelector('.msg-overlay-list-bubble__message-snippet, .msg-overlay-list-bubble__message-snippet--v2');
                const message = (_a = textElement === null || textElement === void 0 ? void 0 : textElement.textContent) !== null && _a !== void 0 ? _a : '';
                box.addEventListener('mouseenter', () => {
                    bubble.textContent = message;
                    bubble.style.setProperty('max-width', `400px`);
                    const bubbleRect1 = bubble.getBoundingClientRect();
                    const boxRect = box.getBoundingClientRect();
                    if (bubbleRect1.height === maxHeight) {
                        bubble.style.setProperty('max-width', `${window.innerWidth - boxRect.width - margin * 2}px`);
                        bubble.style.setProperty('right', `${margin}px`);
                        bubble.style.setProperty('top', `${margin}px`);
                        while (bubble.scrollHeight > bubbleRect1.height) {
                            const currentFontSize = Number(bubble.style.fontSize.split('px')[0]);
                            bubble.style.setProperty('font-size', `${currentFontSize - 1}px`);
                        }
                    }
                    else {
                        bubble.style.setProperty('font-size', fontSize);
                        bubble.style.setProperty('right', `${boxRect.width + margin}px`);
                        bubble.style.setProperty('top', `${boxRect.y + (boxRect.height - bubbleRect1.height) / 2}px`);
                        const bubbleRect2 = bubble.getBoundingClientRect();
                        if (bubbleRect2.y + bubbleRect2.height > windowHeight - margin) {
                            bubble.style.setProperty('top', `${windowHeight - bubbleRect2.height - margin}px`);
                        }
                    }
                    bubble.classList.add('show-bubble');
                    box.addEventListener('mouseleave', () => {
                        bubble.classList.remove('show-bubble');
                    });
                });
            });
        };
        setupEventListeners();
        const mutationObserver = new MutationObserver(_ => setupEventListeners());
        mutationObserver.observe(sidebar, { childList: true });
    };
    let count = 0;
    const intervalId = setInterval(() => {
        count++;
        const sidebarHeader = document.querySelector('.msg-overlay-bubble-header');
        if (!sidebarHeader && count === 15) {
            clearInterval(intervalId);
        }
        const sidebar = document.querySelector('.msg-overlay-list-bubble__conversations-list');
        if (sidebar) {
            clearInterval(intervalId);
            setupMouseOver(sidebar);
        }
    }, 1000);
})();
