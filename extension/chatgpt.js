(() => {
  if (globalThis.__aiRelayInstalled) return;
  globalThis.__aiRelayInstalled = true;
  const tr = (key, value) => chrome.i18n.getMessage(key, value);
  const BUTTON = 'ai-relay-send-button';
  const ignored = 'button, script, style, svg, [aria-hidden="true"], .sr-only, .not-prose button';
  function md(node, listDepth = 0) {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
    if (node.nodeType !== Node.ELEMENT_NODE || node.matches(ignored)) return '';
    const tag = node.tagName.toLowerCase();
    const children = () => Array.from(node.childNodes).map(n => md(n, listDepth)).join('');
    if (tag === 'pre') {
      const code = node.querySelector('code');
      const raw = (code || node).textContent;
      const lang = code?.className?.match?.(/language-([\w+-]+)/)?.[1] || '';
      const longest = Math.max(2, ...Array.from(raw.matchAll(/`+/g), m => m[0].length));
      const fence = '`'.repeat(longest + 1);
      return `\n\n${fence}${lang}\n${raw.trimEnd()}\n${fence}\n\n`;
    }
    if (tag === 'code') { const raw = node.textContent; const fence = '`'.repeat(Math.max(0, ...Array.from(raw.matchAll(/`+/g), m => m[0].length)) + 1); return fence + raw + fence; }
    if (tag === 'br') return '\n';
    if (tag === 'hr') return '\n\n---\n\n';
    if (/^h[1-6]$/.test(tag)) return '\n\n' + '#'.repeat(Number(tag[1])) + ' ' + children().trim() + '\n\n';
    if (tag === 'strong' || tag === 'b') return '**' + children() + '**';
    if (tag === 'em' || tag === 'i') return '*' + children() + '*';
    if (tag === 'a') {const t = children(); const href = node.getAttribute('href'); return href && /^https?:/i.test(node.href) ? `[${t}](${node.href})` : t;}
    if (tag === 'img') return node.alt ? tr('figureAlt', node.alt) : tr('figure');
    if (tag === 'blockquote') return '\n\n' + children().trim().split('\n').map(l => '> ' + l).join('\n') + '\n\n';
    if (tag === 'ul' || tag === 'ol') {
      let i = Number(node.getAttribute('start')) || 1;
      const lines = Array.from(node.children).filter(el => el.tagName === 'LI').map(el => {
        const prefix = '  '.repeat(listDepth) + (tag === 'ol' ? `${i++}. ` : '- ');
        let nested = '';
        const main = Array.from(el.childNodes).map(n => {
          if (n.nodeType === 1 && /^(UL|OL)$/.test(n.tagName)) { nested += md(n, listDepth + 1); return ''; }
          return md(n, listDepth + 1);
        }).join('').trim();
        return prefix + main.replace(/\n+/g, '\n' + '  '.repeat(listDepth + 1)) + (nested ? '\n' + nested.trimEnd().replace(/^\n+/, '') : '');
      });
      return '\n' + lines.join('\n') + '\n';
    }
    if (tag === 'table') {
      const rows = Array.from(node.querySelectorAll('tr')).map(tr => Array.from(tr.cells).map(td => md(td).trim().replace(/\|/g, '\\|').replace(/\n+/g, ' ')));
      if (!rows.length) return '';
      const width = Math.max(...rows.map(r => r.length));
      const row = r => '| ' + Array.from({length:width}, (_,i) => r[i] || '').join(' | ') + ' |';
      return '\n\n' + [row(rows[0]), row(Array(width).fill('---')), ...rows.slice(1).map(row)].join('\n') + '\n\n';
    }
    const result = children();
    return /^(p|div|section|article|figure)$/.test(tag) && result.trim() ? result + '\n\n' : result;
  }
  const fromClaude = location.hostname === 'claude.ai';
  const generic = !fromClaude && !['chatgpt.com', 'chat.openai.com'].includes(location.hostname);
  const destination = generic ? 'AI' : fromClaude ? 'ChatGPT' : 'Claude';
  const label = tr(generic ? 'copyAI' : fromClaude ? 'copyChatGPT' : 'copyClaude');

  async function renderImage(img) {
    await img.decode();
    const canvas = document.createElement('canvas');
    const vector = /^data:image\/svg/i.test(img.currentSrc || img.src);
    const rect = img.getBoundingClientRect();
    canvas.width = vector ? Math.max(img.naturalWidth, Math.round(rect.width * devicePixelRatio)) : img.naturalWidth;
    canvas.height = Math.max(1, Math.round(canvas.width * img.naturalHeight / img.naturalWidth));
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    try { canvas.toDataURL('image/png', 1); }
    catch (error) {
      const response = await fetch(img.currentSrc || img.src);
      if (!response.ok) throw error;
      const bitmap = await createImageBitmap(await response.blob());
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();
    }
    return canvas;
  }

  async function savePDF(content, images, key) {
    const response = await fetch(chrome.runtime.getURL('reply.ttf'));
    if (!response.ok) throw new Error(tr('fontError'));
    const font = await response.blob();
    const fontData = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(font);
    });
    const pdf = new jspdf.jsPDF({unit:'pt', compress:true, putOnlyUsedFonts:true});
    pdf.addFileToVFS('reply.ttf', fontData);
    pdf.addFont('reply.ttf', 'Reply', 'normal');
    pdf.setFont('Reply');
    pdf.setFontSize(12);
    const margin = 40;
    const width = pdf.internal.pageSize.getWidth() - 2 * margin;
    const bottom = pdf.internal.pageSize.getHeight() - margin;
    let y = margin;
    function fit(height) {
      if (y + height > bottom) { pdf.addPage(); y = margin; }
    }
    const blocks = content.split(new RegExp('(' + key + '-[0-9]+-)'));
    const figures = new Map(images.map(img => [img.marker, img.canvas]));
    for (const block of blocks) {
      if (!block) continue;
      const canvas = figures.get(block);
      if (canvas) {
        const scale = Math.min(width / canvas.width, (bottom - margin) / canvas.height);
        const height = canvas.height * scale;
        fit(height);
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin, y, canvas.width * scale, height);
        y += height + 9;
        continue;
      }
      for (const line of pdf.splitTextToSize(block, width)) {
        fit(18);
        pdf.text(line, margin, y + 13);
        y += 18;
      }
    }
    const encoded = pdf.output('datauristring').split(',')[1];
    try {
      const result = await chrome.runtime.sendMessage({type:'AI_RELAY_COPY_PDF', pdf:encoded});
      if (!result?.ok) console.warn('Copy to AI',result?.error || tr('hostError'));
      if (result?.ok) return 'pdfCopied';
    } catch (error) {
      console.warn('Copy to AI', error);
    }
    pdf.save(tr('downloadName') + '-' + Date.now() + '.pdf');
    return 'downloaded';
  }

  async function copyText(text) {
    if (!text.trim()) throw new Error(tr('empty'));
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
    const field = document.createElement('textarea');
    field.value = text;
    field.style.cssText = 'position:fixed;left:-10000px;top:0';
    document.body.append(field);
    try {
      field.select();
      if (!document.execCommand('copy')) throw new Error(tr('clipboardError'));
    } finally { field.remove(); }
  }

  async function writeReply(message) {
    if (generic) {
      const selection = window.getSelection()?.toString().trim();
      if (selection) {
        await copyText(selection);
        return { kind: 'textCopied', detail: tr('selectionCopied') };
      }
      message = document.querySelector('main article, article, main, [role="main"]') || document.body;
    }
    const clone = message.cloneNode(true);
    const originals = [...message.querySelectorAll('img')];
    const copies = [...clone.querySelectorAll('img')];
    const images = [];
    const key = Array.from(crypto.getRandomValues(new Uint32Array(4))).join('-');
    let skipped = 0;
    for (const [i, img] of originals.entries()) {
      if (!img.getClientRects().length || img.closest('[aria-hidden="true"], .sr-only')) {
        copies[i].remove();
        continue;
      }
      let canvas;
      try {
        canvas = await renderImage(img);
      } catch {
        skipped++;
        copies[i].replaceWith(img.alt || tr('missingImage'));
        continue;
      }
      const marker = key + '-' + images.length + '-';
      images.push({canvas, marker, alt:img.alt});
      // Images may be wrapped in a zoom button, which the Markdown exporter skips.
      const wrapper = copies[i].closest('button');
      if (wrapper && wrapper.querySelectorAll('img').length === 1) wrapper.replaceWith(marker);
      else copies[i].replaceWith(marker);
    }
    clone.querySelectorAll('form, input, textarea, select, [contenteditable="true"], [hidden], template, noscript, #ai-relay-notice').forEach(el => el.remove());
    if (generic) clone.querySelectorAll('nav, aside, footer, [role="navigation"]').forEach(el => el.remove());
    const content = md(clone).trim();
    const note = skipped ? tr('skipped', String(skipped)) : '';
    if (images.length) {
      const kind = await savePDF(content, images, key);
      const detail = kind === 'pdfCopied' ? tr(kind, destination) : tr(kind);
      return { kind, detail: detail + note };
    }
    await copyText(content);
    return { kind: 'textCopied', detail: tr('textCopied', destination) + note };
  }
  function messages() {
    if (generic) return [document.body];
    const selector = fromClaude
      ? '[data-testid="assistant-message"], [data-is-streaming], .font-claude-response, [data-message-author-role="assistant"]'
      : '[data-message-author-role="assistant"], [data-chatgpt-search-unit-key$=":assistant"]';
    return Array.from(document.querySelectorAll(selector)).filter(el =>
      !el.parentElement?.closest(selector)
    );
  }
  function notice(text) {
    document.getElementById('ai-relay-notice')?.remove();
    const n = document.createElement('div'); n.id = 'ai-relay-notice'; n.textContent = text;
    n.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:2147483647;background:#222;color:white;padding:12px 18px;border-radius:10px;font:14px system-ui;max-width:85vw;';
    document.body.append(n); setTimeout(() => n.remove(), 6500);
  }
  const resetTimers = new WeakMap();
  function setState(button, state) {
    button.dataset.copyState = state;
    const caption = state === 'idle' ? label : tr('button_' + state);
    button.textContent = caption;
    if (state === 'idle' || state === 'copying') {
      const indicator = document.createElement('span');
      indicator.className = state === 'idle' ? 'ai-relay-idle' : 'ai-relay-spinner';
      if (state === 'idle') indicator.textContent = tr('button_idle');
      else indicator.setAttribute('aria-hidden', 'true');
      if (state === 'idle') button.append(indicator);
      else button.prepend(indicator);
    }
    button.disabled = state === 'copying';
  }

  let copying = false;
  async function copyReply(message, button = message?.querySelector('.' + BUTTON)) {
    if (copying || !message) return;
    copying = true;
    if (button) {
      clearTimeout(resetTimers.get(button));
      setState(button, 'copying');
    }
    try {
      const result = await writeReply(message);
      if (button) setState(button, result.kind);
      notice(result.detail);
    } catch (error) {
      console.warn('Copy to AI', error);
      if (button) setState(button, 'failed');
      notice(tr('copyFailed'));
    } finally {
      copying = false;
      if (button) resetTimers.set(button, setTimeout(() => setState(button, 'idle'), 4500));
    }
  }
  function install() {
    for (const message of messages()) {
      const existing = message.querySelector('.' + BUTTON);
      if (existing) continue;
      const button = document.createElement('button');
      button.type = 'button'; button.className = BUTTON;
      button.setAttribute('aria-live', 'polite');
      button.setAttribute('aria-atomic', 'true');
      setState(button, 'idle');
      button.title = tr('replyHint');
      button.style.cssText = 'display:inline-flex;align-items:center;margin:8px 0;padding:5px 10px;border:1px solid #ba826d;border-radius:8px;color:inherit;background:transparent;font:inherit;font-size:12px;cursor:pointer;';
      if (generic) {
        button.style.cssText += 'position:fixed;right:18px;bottom:18px;z-index:2147483646;color:#fff;background:#333;padding:8px 14px;';
        button.title = tr('pageHint');
        button.addEventListener('mousedown', event => event.preventDefault());
      }
      button.addEventListener('click', event => {
        if (event.isTrusted) copyReply(message, button);
      });
      message.append(button);
    }
  }
  chrome.runtime.onMessage.addListener((msg, sender, reply) => {
    if (sender.id !== chrome.runtime.id || msg?.type !== 'AI_RELAY_LATEST') return;
    copyReply(messages().at(-1)); reply({accepted:true});
  });
  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return; scheduled = true;
    requestAnimationFrame(() => { scheduled = false; install(); });
  });
  observer.observe(document.body, {childList:true, subtree:true}); install();
})();
