"use strict";
;
(function () {
    console.log('hi');
    const shadowRoot = document.createElement('div').attachShadow({ mode: 'open' });
    const bubble = document.createElement('div');
    bubble.classList.add('message-preview-bubble');
    bubble.textContent = '';
    shadowRoot.appendChild(bubble);
    document.body.appendChild(shadowRoot);
    const root = document.documentElement;
    const setupMutationObserver = () => {
        const sidebar = document.querySelector('.msg-overlay-list-bubble__conversations-list');
        if (sidebar) {
            const boxes = sidebar.children;
            const mutationObserver = new MutationObserver(_ => {
                Array.from(boxes).forEach(box => {
                    var _a;
                    const textElement = box.querySelector('.msg-overlay-list-bubble__message-snippet, .msg-overlay-list-bubble__message-snippet--v2');
                    const message = (_a = textElement === null || textElement === void 0 ? void 0 : textElement.textContent) !== null && _a !== void 0 ? _a : '';
                    box.addEventListener('mouseover', () => {
                        const rect = box.getBoundingClientRect();
                        root.style.setProperty('--bubble-x', `${rect.x - 420}px`);
                        root.style.setProperty('--bubble-y', `${rect.y - 100 + (rect.height / 2)}px`);
                        console.log(rect);
                        bubble.textContent = message;
                    });
                });
            });
            const observerConfig = { childList: true };
            mutationObserver.observe(sidebar, observerConfig);
        }
        else {
            console.error('The target element is still null or undefined.');
        }
    };
    const intervalId = setInterval(() => {
        if (document.querySelector('.msg-overlay-list-bubble__conversations-list')) {
            clearInterval(intervalId);
            setupMutationObserver();
        }
    }, 1000);
})();
