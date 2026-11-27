# Copy to AI

[English](README.md) · **简体中文**

把一篇带图文章或一条 AI 回复粘贴到另一个对话里，常常只剩下文字。你得逐张补图，还要解释每张图对应哪段话。Copy to AI 可以把正文和配图按原顺序整理成一份 PDF，作为一个附件交给 AI。遇到纯文字，点一下就能复制到剪贴板。

| 页面 | 按钮 | 复制范围 |
| --- | --- | --- |
| 普通网页 | 复制给 AI | 选中文字时只复制选区，否则复制文章或页面主体 |
| ChatGPT | 复制给claude | 按钮所在的助手回复 |
| Claude | 复制到chatgpt | 按钮所在的助手回复 |

纯文字直接进剪贴板。含可读取图片的正文会生成 PDF，保持图文顺序。装好 Windows 助手后，到支持粘贴文件的输入框按 **Ctrl+V** 即可添加 PDF 附件。没有安装助手时，扩展会下载 PDF，供手动拖入对话。

界面语言跟随浏览器的显示语言。中文显示中文界面，其他未支持的语言回退到英文。复制的网页内容保留原文。

## 安装浏览器扩展

1. 从 [Releases](https://github.com/sunshuren/copy-to-ai/releases) 下载 ZIP 并解压，或克隆本仓库。
2. 在 Edge 打开 `edge://extensions`，在 Chrome 打开 `chrome://extensions`。打开开发者模式，选择「加载已解压的扩展程序」，选解压目录中的 **extension** 文件夹。
3. 刷新原先打开的网页。普通网页的「复制给 AI」在右下角。浏览器内置页面、扩展商店和浏览器限制注入的页面不支持此按钮。

## Windows 文件粘贴（可选）

从扩展管理页复制 Copy to AI 的 32 位扩展 ID。在解压目录打开 PowerShell，运行下列命令，把示例的占位文字换成实际 ID。Chrome 用户把 Edge 换成 Chrome。

```powershell
.\windows\install.ps1 -ExtensionId '你的扩展ID' -Browser Edge
```

安装脚本使用 Windows 自带的 .NET Framework C# 编译器，为当前用户注册本地助手。助手仅接受指定扩展发来的 PDF。每次点击会把文件保存在 `%LOCALAPPDATA%\AI Relay\PDF`，再把文件写入剪贴板。文件可以在粘贴完成后自行清理。

## 支持范围

扩展需要在普通 HTTP 和 HTTPS 页面上显示按钮，因此安装时浏览器会请求网站访问权限。点击后在本机提取内容，不需要 AI 账号、API Key 或远程中转服务。扩展不打开 AI 页面，也不代为发送消息。

普通页面优先取文章或 main 区域，没有时读取页面主体并忽略导航、侧栏、页脚和表单。跨域访问受限或加载失败的图片可能无法导出，复制提示会显示数量。选区按纯文本处理。交互画布、视频和嵌套网页的内容不在图文导出范围内。桌面客户端是否接受 PDF 粘贴取决于其输入框，可用下载文件作为附件。

## 许可证

项目代码采用 MIT 许可证。内置 jsPDF 4.2.1 的许可证见 extension/jspdf-LICENSE.txt。reply.ttf 是从 Google Fonts 的 Noto Sans SC 可变字体生成的常规字重静态字体，采用 SIL Open Font License 1.1，见 extension/font-LICENSE.txt。两个依赖均随扩展提供，运行时不从 CDN 加载。
