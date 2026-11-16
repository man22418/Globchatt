# GlobeChat

A lightweight, installable chat interface designed for meaningful conversations around the world.

## What works today

- Browse sample conversations and send messages in the browser.
- Add contacts with the **＋** button.
- Search saved contacts by name, email, phone, location, or recent message.
- Preview sample reels, add local video files, or preview a public Instagram Reel link.
- Install the site from a supported browser.

**Important:** This is currently a front-end demo. Contacts and messages are saved in the browser on the device where they were added. Registration does not create an online account, and messages are not delivered to another person. Cross-device accounts, following, and real-time chat require a shared backend.

## Publish with GitHub Pages

1. Open the repository on GitHub and select **Settings**.
2. Select **Pages** in the sidebar.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and the `/ (root)` folder, then save.
5. Wait for GitHub Pages to finish publishing. The HTTPS site address will appear on the Pages settings screen. For this repository, it will generally look like:

   `https://man22418.github.io/Globchat/`

6. Open that address to check the site, then share it with others.

Anyone with the link can open the published site. On a compatible phone browser, use its menu and choose **Install app** or **Add to Home Screen**. Publishing the site does not enable shared accounts or synchronized chats.

## Project files

- `index.html` — app structure and dialogs
- `styles.css` — responsive styles
- `script.js` — chat interface and browser-side behavior
- `manifest.json` and `icon.svg` — installable app metadata and icon
- `service-worker.js` — offline app-shell caching
