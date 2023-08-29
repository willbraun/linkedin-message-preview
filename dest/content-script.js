"use strict";
;
(function () {
    console.log('hi');
    const shadowRoot = document.createElement('div').attachShadow({ mode: 'open' });
    const bubble = document.createElement('div');
    bubble.classList.add('message-preview-bubble');
    bubble.innerHTML = '';
    shadowRoot.appendChild(bubble);
    document.body.appendChild(shadowRoot);
    const formatBubbleInnerHTML = (message) => (bubble.innerHTML = `<p>${message}</p>`);
    // do this with mutation observer instead
    const sidebarMessages = document.querySelectorAll('.msg-overlay-list-bubble__convo-item');
    sidebarMessages.forEach(msg => msg.addEventListener('hover', () => formatBubbleInnerHTML('hi')));
})();
