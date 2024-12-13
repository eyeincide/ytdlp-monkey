// ==UserScript==
// @name         ytdlp-monkey
// @namespace    https://github.com/yourusername/ytdlp-monkey
// @version      1.1.0
// @description  A draggable "Download" button for YouTube that hooks into a local yt-dlp server to download videos and remembers its position across page refreshes.
// @author       ytdlp-monkey
// @match        https://www.youtube.com/watch*
// @grant        GM_xmlhttpRequest
// @connect      127.0.0.1
// @license      GPL v2
// @homepageURL  https://github.com/yourusername/ytdlp-monkey
// @supportURL   https://github.com/yourusername/ytdlp-monkey/issues
// ==/UserScript==

(function () {
    'use strict';

    let isDragging = false;

    function addDownloadButton() {
        if (document.getElementById('yt-dlp-download-button')) return;

        // Create the button
        const button = document.createElement('button');
        button.id = 'yt-dlp-download-button';
        button.textContent = 'Download Video';
        Object.assign(button.style, {
            position: 'fixed',
            zIndex: '9999',
            backgroundColor: '#FF0000',
            color: '#FFFFFF',
            border: 'none',
            padding: '10px 20px',
            cursor: 'move',
            borderRadius: '5px',
            fontFamily: 'sans-serif',
            fontSize: '14px'
        });

        // Load saved position or default to (10px, 10px)
        const savedLeft = localStorage.getItem('yt-dlp-button-left');
        const savedTop = localStorage.getItem('yt-dlp-button-top');
        if (savedLeft && savedTop) {
            button.style.left = savedLeft + 'px';
            button.style.top = savedTop + 'px';
        } else {
            button.style.left = '10px';
            button.style.top = '10px';
        }

        let startX, startY, initialLeft, initialTop;
        let moved = false;

        // Drag start
        button.addEventListener('mousedown', function (e) {
            isDragging = true;
            moved = false;
            startX = e.clientX;
            startY = e.clientY;
            initialLeft = parseInt(button.style.left, 10);
            initialTop = parseInt(button.style.top, 10);
            button.style.cursor = 'grabbing';
            e.preventDefault();
        });

        // Drag move
        document.addEventListener('mousemove', function (e) {
            if (isDragging) {
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                button.style.left = (initialLeft + deltaX) + 'px';
                button.style.top = (initialTop + deltaY) + 'px';

                // If user moves beyond a slight threshold, consider it a drag
                if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
                    moved = true;
                }
            }
        });

        // Drag end
        document.addEventListener('mouseup', function () {
            if (isDragging) {
                isDragging = false;
                button.style.cursor = 'move';
                // Save position
                const left = parseInt(button.style.left, 10);
                const top = parseInt(button.style.top, 10);
                localStorage.setItem('yt-dlp-button-left', left);
                localStorage.setItem('yt-dlp-button-top', top);
            }
        });

        // Button click
        button.addEventListener('click', function () {
            if (!moved) {
                console.log("[ytdlp-monkey] Button clicked. Sending request...");
                const videoUrl = window.location.href;
                const cookies = document.cookie
                    .split('; ')
                    .map(cookie => {
                        const [name, value] = cookie.split('=');
                        return `.youtube.com\tTRUE\t/\tFALSE\t0\t${name}\t${value}`;
                    })
                    .join('\n');

                GM_xmlhttpRequest({
                    method: "POST",
                    url: "http://127.0.0.1:8080/youtube-dl",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    data: JSON.stringify({ videoUrl, cookies }),
                    onload: function (response) {
                        console.log("[ytdlp-monkey] Server response:", response.responseText);
                    },
                    onerror: function (err) {
                        console.error("[ytdlp-monkey] Error:", err);
                    }
                });
            } else {
                console.log("[ytdlp-monkey] Button was dragged, not clicked.");
            }
        });

        // Add the button to the page
        document.body.appendChild(button);
    }

    // Ensure cursor styling remains consistent after dragging ends
    document.addEventListener('mousemove', function () {
        const button = document.getElementById('yt-dlp-download-button');
        if (button && !isDragging) {
            button.style.cursor = 'move';
        }
    });

    // Initialize the button
    addDownloadButton();
})();
