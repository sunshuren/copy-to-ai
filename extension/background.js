const isSupported = url => /^https?:\/\//i.test(url || '');
chrome.action.onClicked.addListener(async tab => {
  if (!isSupported(tab.url)) return;
  try {
    try {await chrome.tabs.sendMessage(tab.id,{type:'AI_RELAY_LATEST'});}
    catch {await chrome.scripting.insertCSS({target:{tabId:tab.id},files:['feedback.css']}); await chrome.scripting.executeScript({target:{tabId:tab.id},files:['jspdf.js','chatgpt.js']}); await chrome.tabs.sendMessage(tab.id,{type:'AI_RELAY_LATEST'});}
  } catch (e) {console.warn('Copy to AI',e);}
});

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (msg?.type !== 'AI_RELAY_COPY_PDF' || sender.id !== chrome.runtime.id ||
      sender.frameId !== 0 || !isSupported(sender.url) || typeof msg.pdf !== 'string') return;
  chrome.runtime.sendNativeMessage('local.airelay.pdfclipboard', {pdf:msg.pdf})
    .then(reply, error => reply({ok:false,error:error.message}));
  return true;
});
