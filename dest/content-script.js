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
    const setUpEventListeners = (sidebar) => {
        const boxes = sidebar.querySelectorAll('.msg-conversation-listitem__link');
        Array.from(boxes).forEach(box => {
            var _a;
            const textElement = box.querySelector('.msg-overlay-list-bubble__message-snippet, .msg-overlay-list-bubble__message-snippet--v2');
            const message = (_a = textElement === null || textElement === void 0 ? void 0 : textElement.textContent) !== null && _a !== void 0 ? _a : '';
            // on mouseenter, calculate styles and show bubble
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
            });
            // on mouseleave, hide bubble
            box.addEventListener('mouseleave', () => {
                bubble.classList.remove('show-bubble');
            });
        });
    };
    const setUpMouseOver = (sidebar) => {
        setUpEventListeners(sidebar);
        const mutationObserver = new MutationObserver(_ => setUpEventListeners(sidebar));
        mutationObserver.observe(sidebar, { childList: true, subtree: true });
    };
    const findSidebar = (intervalId) => {
        const sidebar = document.querySelector('.msg-overlay-list-bubble__default-conversation-container');
        if (sidebar) {
            setUpMouseOver(sidebar);
            clearInterval(intervalId);
        }
    };
    const setUpSidebarOnHeaderClick = () => {
        let sidebarCount = 0;
        const sidebarInterval = setInterval(() => {
            findSidebar(sidebarInterval);
            sidebarCount++;
            // messages tab is closed
            if (sidebarCount === 10) {
                clearInterval(sidebarInterval);
            }
        }, 500);
    };
    let clickHandlerAdded = false;
    const checkForSidebar = (intervalId) => {
        if (!clickHandlerAdded) {
            const sidebarHeader = document.querySelector('.msg-overlay-bubble-header');
            if (sidebarHeader) {
                sidebarHeader.addEventListener('click', setUpSidebarOnHeaderClick, { capture: true });
                clickHandlerAdded = true;
            }
        }
        findSidebar(intervalId);
    };
    // check every 1s, then every 5s, then give up after 20 tries of each
    let count1 = 0;
    let count2 = 0;
    const intervalId1 = setInterval(() => {
        checkForSidebar(intervalId1);
        count1++;
        if (count1 === 20) {
            clearInterval(intervalId1);
            const intervalId2 = setInterval(() => {
                checkForSidebar(intervalId2);
                count2++;
                if (count2 === 20) {
                    clearInterval(intervalId2);
                }
            }, 5000);
        }
    }, 1000);
})();
