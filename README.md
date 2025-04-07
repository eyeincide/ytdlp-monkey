
# ytdlp-monkey

**ytdlp-monkey** is a userscript for video websites that provides a menu option. When clicked, it sends the current video's URL to a small local server running yt-dlp, allowing you to download the video in the format of your choice. This is an excellent solution for users migrating from browser add-ons like Video DownloadHelper who want more control, privacy, and flexibility.

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

2. Inside `C:\ytdlp-server`, copy `server.py`
3. Run the server:
   ```bash
   cd C:\ytdlp-server
   python server.py
   ```

   Keep this terminal open. The server is now running at http://127.0.0.1:8080.
   
## Installing the ytdlp-monkey Userscript

With Tampermonkey installed, open a new script window by clicking the Tampermonkey icon and selecting "Create a New Script".

Copy and paste the contents of ytdlp-monkey.user.js into the editor, then save.

With the script installed, open a YouTube video page. You should see a red "Download Video" button at the top-left corner. You can drag it to a convenient position and its location will be saved for future visits.

## Using ytdlp-monkey

1. **Start Your Local Server:** In a terminal (where `server.py` is located), run:
   ```bash
   python server.py
   ```
   Keep it running in the background.

2. **Go to a video site supported by yt-dlp extensions:** Navigate to any supported video page.

3. **Download the Video:** Click the plugin icon, there will be an option under the script titled  "Download Video via yt-dlp". The script will send the video URL (and cookies) to your local server, which will start yt-dlp. The video will begin downloading to the `videos` directory within the server's folder.

## Troubleshooting

- **Server Not Running or Connection Error:** Ensure `server.py` is running and accessible at http://127.0.0.1:8080.
- **yt-dlp Not Found:** Update `yt_dlp_path` in `server.py` to the correct path to yt-dlp or place yt-dlp in your PATH.
- **Different Video Formats or Quality:** Modify the `command` array in `server.py` to specify different formats or quality levels. Refer to the yt-dlp documentation for more options.

## License

The userscript is licensed under GPL v2.  
yt-dlp is licensed under its own terms; see the yt-dlp repo for details.
