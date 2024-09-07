"use strict";
;
(function () {
    const shadowRoot = document.createElement('div').attachShadow({ mode: 'open' });
    const bubble = document.createElement('div');
    bubble.classList.add('message-preview-bubble');
    const margin = 20;
    const windowHeight = window.innerHeight;
    console.log('Hello from LinkedIn Message Preview Extension!');
    bubble.textContent = '';
    const maxHeight = windowHeight - margin * 2;
    bubble.style.setProperty('max-height', `${maxHeight}px`);
    const fontSize = '24px';
    bubble.style.setProperty('font-size', fontSize);
    shadowRoot.appendChild(bubble);
    document.body.appendChild(shadowRoot);
    const setupMouseOver = (sidebar) => {
        const setupEventListeners = () => {
            const boxes = sidebar.querySelectorAll('.msg-conversation-listitem__link');
            Array.from(boxes).forEach(box => {
                var _a;
                const textElement = box.querySelector('.msg-overlay-list-bubble__message-snippet, .msg-overlay-list-bubble__message-snippet--v2');
                const message = (_a = textElement === null || textElement === void 0 ? void 0 : textElement.textContent) !== null && _a !== void 0 ? _a : '';
                box.addEventListener('mouseenter', () => {
                    bubble.textContent = message;
                    bubble.style.setProperty('max-width', `400px`);
                    bubble.style.setProperty('font-size', fontSize);
                    const bubbleRect1 = bubble.getBoundingClientRect();
                    const boxRect = box.getBoundingClientRect();
                    bubble.style.setProperty('right', `${boxRect.width + margin}px`);
                    if (bubbleRect1.height === maxHeight) {
                        bubble.style.setProperty('max-width', `${window.innerWidth - boxRect.width - margin * 2}px`);
                        bubble.style.setProperty('top', `${margin}px`);
                        // shrink font until bubble fits on screen
                        while (bubble.scrollHeight > bubbleRect1.height) {
                            const currentFontSize = Number(bubble.style.fontSize.split('px')[0]);
                            bubble.style.setProperty('font-size', `${currentFontSize - 1}px`);
                        }
                    }
                    else {
                        bubble.style.setProperty('top', `${boxRect.y + (boxRect.height - bubbleRect1.height) / 2}px`);
                        const bubbleRect2 = bubble.getBoundingClientRect();
                        // if bubble goes off top
                        if (bubbleRect2.y < margin) {
                            bubble.style.setProperty('top', `${margin}px`);
                        }
                        // if bubble goes off bottom
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
        mutationObserver.observe(sidebar, { childList: true, subtree: true });
    };
    let count1 = 0;
    let count2 = 0;
    let clickHandlerAdded = false;
    const checkForMessages = (intervalId) => {
        console.log(intervalId);
        if (!clickHandlerAdded) {
            console.log('adding click handler');
            const sidebarHeader = document.querySelector('.msg-overlay-bubble-header');
            if (sidebarHeader) {
                sidebarHeader.addEventListener('click', findSidebar, { capture: true });
                clickHandlerAdded = true;
            }
        }
        const sidebar = document.querySelector('.msg-overlay-list-bubble__default-conversation-container');
        if (sidebar) {
            setupMouseOver(sidebar);
            clearInterval(intervalId);
        }
    };
    // check every 1s, then every 5s, then give up after 20 tries of each
    const intervalId1 = setInterval(() => {
        checkForMessages(intervalId1);
        count1++;
        if (count1 === 20) {
            const intervalId2 = setInterval(() => {
                checkForMessages(intervalId2);
                count2++;
                if (count2 === 20) {
                    clearInterval(intervalId2);
                }
            }, 5000);
            clearInterval(intervalId1);
        }
    }, 1000);
    const findSidebar = () => {
        let sidebarCount = 0;
        const sidebarInterval = setInterval(() => {
            const sidebar = document.querySelector('.msg-overlay-list-bubble__conversations-list');
            if (sidebar) {
                setupMouseOver(sidebar);
                clearInterval(sidebarInterval);
            }
            sidebarCount++;
            // messages tab is closed
            if (sidebarCount === 10) {
                clearInterval(sidebarInterval);
            }
        }, 500);
    };
})();
