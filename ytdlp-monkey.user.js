// ==UserScript==
// @name         YT-DLP Monkey
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Sends the current video URL and cookies to a local Flask server via a Tampermonkey menu command.
// @match        *://*/*
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    function sendDownloadRequest() {
        console.log("[ytdlp-monkey] Menu command triggered. Sending request...");
        const videoUrl = window.location.href;
        const cookies = document.cookie
            .split('; ')
            .map(cookie => {
                const [name, value] = cookie.split('=');
                // Use the current page's hostname for the cookie domain
                const domain = window.location.hostname;
                return `${domain}\tTRUE\t/\tFALSE\t0\t${name}\t${value}`;
            })
            .join('\n');

        GM_xmlhttpRequest({
            method: "POST",
            url: "http://127.0.0.1:8080/video-dl",
            headers: {
                "Content-Type": "application/json"
            },
            data: JSON.stringify({ videoUrl, cookies }),
            onload: function(response) {
                console.log("[ytdlp-monkey] Server response:", response.responseText);
            },
            onerror: function(err) {
                console.error("[ytdlp-monkey] Error:", err);
            }
        });
    }

    // Register the menu command in the Tampermonkey menu
    GM_registerMenuCommand("Download Video via yt-dlp", sendDownloadRequest);
})();
