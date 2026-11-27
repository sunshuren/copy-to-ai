# Copy to AI

**English** · [简体中文](README.zh-CN.md)

When you paste a web article or an AI reply into another chat, the text often comes through while the images get left behind. You end up attaching each image separately and explaining where it belongs. Copy to AI keeps the text and images in order in a single PDF you can attach to the conversation. For text-only content, one click copies it to the clipboard.

| Where you are | Button | What it copies |
| --- | --- | --- |
| Any supported web page | Copy to AI | Your selected text, or the main content if nothing is selected |
| ChatGPT | Copy to Claude | The assistant reply above the button |
| Claude | Copy to ChatGPT | The assistant reply above the button |

The interface follows your browser’s display language. Chinese-language browsers show Chinese labels and messages. English is the fallback. Copied content stays in its original language.

## Install in Edge or Chrome

1. Download the ZIP attached to the [latest release](https://github.com/sunshuren/copy-to-ai/releases/latest) and extract it, or clone this repository.
2. Open `edge://extensions` or `chrome://extensions`. Turn on **Developer mode**, choose **Load unpacked**, and select the **extension** folder.
3. Refresh any tabs that were already open. On ordinary pages, **Copy to AI** appears in the lower-right corner. In ChatGPT and Claude, look below the reply you want to copy.

## Paste a PDF as a file on Windows

By default, the extension downloads the PDF so you can drag it into a chat. Install the optional clipboard helper to paste the PDF directly with **Ctrl+V** in apps that accept file attachments from the clipboard.

Copy the 32-character extension ID from the browser’s extensions page. Open PowerShell in the extracted folder and run the command below with your ID. For Chrome, replace `Edge` with `Chrome`.

```powershell
.\windows\install.ps1 -ExtensionId 'YOUR_EXTENSION_ID' -Browser Edge
```

The installer uses the Windows .NET Framework C# compiler and registers the helper for the current user. The helper accepts PDFs from the specified extension and stores them in `%LOCALAPPDATA%\AI Relay\PDF`. You can remove these files after pasting.

## Page access and supported content

The extension requests access to HTTP and HTTPS pages so it can display the copy button. It processes the content locally when you click. No AI account or API key is required, and the extension never sends a chat message on your behalf.

Selections are copied as plain text. For full pages, the extension looks for an article or main region, then falls back to the page body. It skips navigation, sidebars, footers, and forms. Images that fail to load or cannot be read across origins may be omitted; the copy notification reports the count. Interactive canvases, videos, and embedded pages are outside the export scope. Browser settings pages and extension stores restrict extension buttons.

## License

Project code is available under the [MIT License](LICENSE). The extension bundles [jsPDF 4.2.1](extension/jspdf-LICENSE.txt) and a regular-weight static font derived from Noto Sans SC, distributed under the [SIL Open Font License 1.1](extension/font-LICENSE.txt). Both are included locally.
