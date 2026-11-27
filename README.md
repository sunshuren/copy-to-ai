# Copy to AI

**English** · [简体中文](README.zh-CN.md)

When you paste an article or AI reply into another chat, the images can get left behind. Copy to AI keeps the text and pictures together in reading order.

1. In ChatGPT, click **Copy to Claude**. In Claude, click **Copy to ChatGPT**. On ordinary pages, select text first or copy the main content.
2. When the button shows **✓ Copied**, paste into Claude or another AI chat with **Ctrl+V**.

The interface follows your browser’s display language. Chinese-language browsers show Chinese labels and messages. English is the fallback. Copied content stays in its original language.

## Install in Edge or Chrome

1. Download the ZIP attached to the [latest release](https://github.com/sunshuren/copy-to-ai/releases/latest) and extract it, or clone this repository.
2. Open `edge://extensions` or `chrome://extensions`. Turn on **Developer mode**, choose **Load unpacked**, and select the **extension** folder.
3. Refresh any tabs that were already open. On ordinary pages, **Copy to AI** appears in the lower-right corner. In ChatGPT and Claude, look below the reply you want to copy.

## Copy replies with images on Windows

Install the local clipboard helper once to copy replies with images. Text-only copying works without it.

Copy the 32-character extension ID from the browser’s extensions page. Open PowerShell in the extracted folder and run the command below with your ID. For Chrome, replace `Edge` with `Chrome`.

```powershell
.\windows\install.ps1 -ExtensionId 'YOUR_EXTENSION_ID' -Browser Edge
```

The helper is installed for your Windows user and accepts requests from the specified extension.

## Page access and supported content

The extension requests access to HTTP and HTTPS pages so it can display the copy button. It processes the content locally when you click. No AI account or API key is required, and the extension never sends a chat message on your behalf.

Selections are copied as plain text. For full pages, the extension looks for an article or main region, then falls back to the page body. It skips navigation, sidebars, footers, and forms. If an image cannot be read, the button offers a retry. Pasting replies with images requires a chat input that accepts attachments from the clipboard. Interactive canvases, videos, and embedded pages are outside the export scope. Browser settings pages and extension stores restrict extension buttons.

## License

Project code is available under the [MIT License](LICENSE). The extension bundles [jsPDF 4.2.1](extension/jspdf-LICENSE.txt) and a regular-weight static font derived from Noto Sans SC, distributed under the [SIL Open Font License 1.1](extension/font-LICENSE.txt). Both are included locally.
