
# ytdlp-monkey

**ytdlp-monkey** is a userscript for YouTube that provides a draggable "Download" button directly on the YouTube watch page. When clicked, it sends the current video's URL to a small local server running yt-dlp, allowing you to download the video in the format of your choice. This is an excellent solution for users migrating from browser add-ons like Video DownloadHelper who want more control, privacy, and flexibility.

## Why Migrate from Video DownloadHelper?

- **No watermark:**  
  yt-dlp does not mangle your saved videos to its own benefit
- **More Control:**  
  With yt-dlp, you can specify formats, quality, and advanced download options.
- **Local and Private:**  
  Everything is processed locally on your machineâ€”no third-party intermediaries.
- **Extensible and Scriptable:**  
  yt-dlp is command-line based and highly configurable. Integrate it into your workflows or automation scripts as you see fit.

## Requirements

1. **A Modern Browser:**  
   Use [Firefox](https://www.mozilla.org/firefox/new/) or [Chrome](https://www.google.com/chrome/) for the best compatibility with userscripts.
   
2. **Tampermonkey (or Similar Userscript Manager):**  
   Install Tampermonkey to run custom JavaScript on websites.  
   - Firefox: [Tampermonkey for Firefox](https://addons.mozilla.org/firefox/addon/tampermonkey/)  
   - Chrome: [Tampermonkey for Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)  
   
   Once installed, ensure Tampermonkey is enabled and running in your browser.
    
3. **yt-dlp:**  
   yt-dlp is the tool that actually downloads videos.
   
   **Option A: Python-based (Recommended)**
   - [Install Python](https://www.python.org/downloads/)
   - Run:
     ```bash
     python -m pip install yt-dlp
     ```

   **Option B: Standalone Binary (Windows)**
   - Download the latest `yt-dlp.exe` from the [yt-dlp Releases](https://github.com/yt-dlp/yt-dlp/releases).
   - Place `yt-dlp.exe` in a convenient location (e.g. `C:\Program Files\yt-dlp\yt-dlp.exe`).

   Make sure to update the server scriptâ€™s `command` array to point to `yt-dlp` or `yt-dlp.exe` if not in your PATH.

4. **Flask (Local Server):**  
   The userscript communicates with yt-dlp through a small local Flask server.
   - Ensure Python is installed.
   - Install Flask:
     ```bash
     python -m pip install flask
     ```

## Setting Up the Local Flask Server

1. Create a folder for your server files, for example `C:\ytdlp-server`.

2. Inside `C:\ytdlp-server`, create a file named `server.py` with the following content (adjust paths as necessary):
   ```python
   from flask import Flask, request, jsonify
   import os
   import subprocess
   import logging

   app = Flask(__name__)

   # Configure logging
   logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s: %(message)s')

   DEFAULT_DOWNLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "videos")

   @app.route("/youtube-dl", methods=["POST"])
   def download_video():
       data = request.get_json()
       if not data:
           return jsonify({"error": "No JSON data provided"}), 400

       video_url = data.get("videoUrl")
       if not video_url:
           return jsonify({"error": "Missing 'videoUrl' in request"}), 400

       os.makedirs(DEFAULT_DOWNLOAD_DIR, exist_ok=True)

       # Update the path below if needed. If yt-dlp is in PATH, you can just use "yt-dlp" instead of a full path.
       yt_dlp_path = "c:/PATH/TO/yt-dlp.exe"
    
       command = [
           yt_dlp_path,
           "-S", "res,br",
           "-f", "bv*[height<=1024]+ba/b[height<=1024]",
           "--merge-output-format", "mp4",
           "-o", f"{DEFAULT_DOWNLOAD_DIR}/%(title)s.%(ext)s",
           video_url
       ]

       app.logger.info("Starting download for URL: %s", video_url)
       try:
           result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
           if result.returncode != 0:
               app.logger.error("yt-dlp failed: %s", result.stderr)
               return jsonify({"error": "yt-dlp execution failed", "details": result.stderr.strip()}), 500

           app.logger.info("Download started successfully.")
           return jsonify({"message": "Download started successfully."}), 200

       except FileNotFoundError:
           app.logger.error("yt-dlp not found. Ensure it is installed or provide the correct full path.")
           return jsonify({"error": "yt-dlp not found"}), 500
       except Exception as e:
           app.logger.exception("An unexpected error occurred.")
           return jsonify({"error": str(e)}), 500

   if __name__ == "__main__":
       app.run(host='0.0.0.0', port=8080, debug=True)
   ```

3. Run the server:
   ```bash
   cd C:\ytdlp-server
   python server.py
   ```

   Keep this terminal open. The server is now running at http://127.0.0.1:8080.
   
## Installing the ytdlp-monkey Userscript

With Tampermonkey installed, open a new script window by clicking the Tampermonkey icon and selecting "Create a New Script".

Copy and paste the following code into the editor, then save:

```javascript
// ==UserScript==
// @name         ytdlp-monkey
// @namespace    https://github.com/yourusername/ytdlp-monkey
// @version      1.1.0
// @description  A draggable "Download" button for YouTube that hooks into a local yt-dlp server to download videos and remembers its position across page refreshes.
// @author       
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

        document.addEventListener('mousemove', function (e) {
            if (isDragging) {
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                button.style.left = (initialLeft + deltaX) + 'px';
                button.style.top = (initialTop + deltaY) + 'px';

                if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
                    moved = true;
                }
            }
        });

        document.addEventListener('mouseup', function () {
            if (isDragging) {
                isDragging = false;
                button.style.cursor = 'move';
                const left = parseInt(button.style.left, 10);
                const top = parseInt(button.style.top, 10);
                localStorage.setItem('yt-dlp-button-left', left);
                localStorage.setItem('yt-dlp-button-top', top);
            }
        });

        button.addEventListener('click', function () {
            if (!moved) {
                console.log("[ytdlp-monkey] Button clicked. Sending request...");
                const videoUrl = window.location.href;
                const cookies = document.cookie
                    .split('; ')
                    .map(cookie => {
                        const [name, value] = cookie.split('=');
                        return `.youtube.com	TRUE	/	FALSE	0	${name}	${value}`;
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

        document.body.appendChild(button);
    }

    document.addEventListener('mousemove', function () {
        const button = document.getElementById('yt-dlp-download-button');
        if (button && !isDragging) {
            button.style.cursor = 'move';
        }
    });

    addDownloadButton();
})();
```

With the script installed, open a YouTube video page. You should see a red "Download Video" button at the top-left corner. You can drag it to a convenient position and its location will be saved for future visits.

## Using ytdlp-monkey

1. **Start Your Local Server:** In a terminal (where `server.py` is located), run:
   ```bash
   python server.py
   ```
   Keep it running in the background.

2. **Go to YouTube:** Navigate to a YouTube video page. The "Download Video" button should appear.

3. **Download the Video:** Click the "Download Video" button without dragging it. The script will send the video URL (and cookies) to your local server, which will start yt-dlp. The video will begin downloading to the `videos` directory within the server's folder.

## Troubleshooting

- **No Button Appears:** Check that Tampermonkey is enabled and that the script is active.
- **Server Not Running or Connection Error:** Ensure `server.py` is running and accessible at http://127.0.0.1:8080.
- **yt-dlp Not Found:** Update `yt_dlp_path` in `server.py` to the correct path to yt-dlp or place yt-dlp in your PATH.
- **Different Video Formats or Quality:** Modify the `command` array in `server.py` to specify different formats or quality levels. Refer to the yt-dlp documentation for more options.

## License

The userscript is licensed under GPL v2.  
yt-dlp is licensed under its own terms; see the yt-dlp repo for details.
