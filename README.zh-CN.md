# Copy to AI

[English](README.md) · **简体中文**

把网页文章或 AI 回复粘贴到另一个对话时，图片容易丢失，还得逐张补传。Copy to AI 帮你按原顺序带上正文和配图。

1. 在回复下点击 **复制回复**。普通网页上可以先选中文字，或直接复制正文。
2. 看到 **✓ 已复制**，到 Claude 或其他 AI 对话按 **Ctrl+V**。

界面语言跟随浏览器的显示语言。中文显示中文界面，其他未支持的语言回退到英文。复制的网页内容保留原文。

## 安装浏览器扩展

1. 从 [Releases](https://github.com/sunshuren/copy-to-ai/releases) 下载 ZIP 并解压，或克隆本仓库。
2. 在 Edge 打开 `edge://extensions`，在 Chrome 打开 `chrome://extensions`。打开开发者模式，选择「加载已解压的扩展程序」，选解压目录中的 **extension** 文件夹。
3. 刷新原先打开的网页。普通网页的「复制回复」在右下角。浏览器内置页面、扩展商店和浏览器限制注入的页面不支持此按钮。

## 在 Windows 上复制含图回复

首次使用含图复制时，需要安装本机助手。纯文字复制可直接使用。

从扩展管理页复制 Copy to AI 的 32 位扩展 ID。在解压目录打开 PowerShell，运行下列命令，把示例的占位文字换成实际 ID。Chrome 用户把 Edge 换成 Chrome。

```powershell
.\windows\install.ps1 -ExtensionId '你的扩展ID' -Browser Edge
```

助手仅为当前用户安装，只接受指定扩展的请求。

## 支持范围

扩展需要在普通 HTTP 和 HTTPS 页面上显示按钮，因此安装时浏览器会请求网站访问权限。点击后在本机提取内容，不需要 AI 账号、API Key 或远程中转服务。扩展不打开 AI 页面，也不代为发送消息。

普通页面优先取文章或 main 区域，没有时读取页面主体并忽略导航、侧栏、页脚和表单。图片受网页限制或加载失败时，按钮会提示重试。选区按纯文本处理。交互画布、视频和嵌套网页的内容不在图文导出范围内。含图粘贴需要目标输入框支持粘贴附件。

## 许可证

项目代码采用 MIT 许可证。内置 jsPDF 4.2.1 的许可证见 extension/jspdf-LICENSE.txt。reply.ttf 是从 Google Fonts 的 Noto Sans SC 可变字体生成的常规字重静态字体，采用 SIL Open Font License 1.1，见 extension/font-LICENSE.txt。两个依赖均随扩展提供，运行时不从 CDN 加载。
