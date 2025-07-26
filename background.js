// 爱华工具箱 - 后台脚本

// 插件安装时创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
  createContextMenus();
});

// 创建右键菜单结构
function createContextMenus() {
  // 移除所有现有菜单
  chrome.contextMenus.removeAll(() => {
    // 主菜单
    chrome.contextMenus.create({
      id: "aihua-toolbox",
      title: "爱华工具箱",
      contexts: ["page", "selection", "link"]
    });

    // 功能1: GitHub1s跳转
    chrome.contextMenus.create({
      id: "github-to-github1s",
      parentId: "aihua-toolbox",
      title: "🚀 跳转到GitHub1s编辑器",
      contexts: ["page", "link"],
      documentUrlPatterns: ["https://github.com/*/*"]
    });

    // 功能2: HTML转Markdown
    chrome.contextMenus.create({
      id: "html-to-markdown",
      parentId: "aihua-toolbox",
      title: "📝 导出为Markdown",
      contexts: ["page", "selection"]
    });

    // 分隔线
    chrome.contextMenus.create({
      id: "separator1",
      parentId: "aihua-toolbox",
      type: "separator",
      contexts: ["page"]
    });

    // 设置选项
    chrome.contextMenus.create({
      id: "open-options",
      parentId: "aihua-toolbox",
      title: "⚙️ 设置选项",
      contexts: ["page"]
    });

    // 功能3: 预留扩展位置
    chrome.contextMenus.create({
      id: "feature-placeholder",
      parentId: "aihua-toolbox",
      title: "🔧 更多功能 (敬请期待)",
      contexts: ["page"],
      enabled: false
    });
  });
}

// 处理右键菜单点击事件
chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case "github-to-github1s":
      handleGithubToGithub1s(info, tab);
      break;
    case "html-to-markdown":
      handleHtmlToMarkdown(info, tab);
      break;
    case "open-options":
      chrome.runtime.openOptionsPage();
      break;
  }
});

// GitHub1s跳转功能
function handleGithubToGithub1s(info, tab) {
  let url = info.linkUrl || tab.url;
  
  if (url && url.includes('github.com')) {
    // 将github.com替换为github1s.com
    const github1sUrl = url.replace('github.com', 'github1s.com');
    
    // 在新标签页打开
    chrome.tabs.create({
      url: github1sUrl,
      index: tab.index + 1
    });
    
    // 显示通知
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: '爱华工具箱',
      message: '正在跳转到GitHub1s编辑器...'
    });
  }
}

// HTML转Markdown功能
function handleHtmlToMarkdown(info, tab) {
  // 向内容脚本发送消息
  chrome.tabs.sendMessage(tab.id, {
    action: 'convertToMarkdown',
    selectedText: info.selectionText
  });
}

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'downloadMarkdown') {
    // 下载Markdown文件
    const blob = new Blob([request.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    chrome.downloads.download({
      url: url,
      filename: request.filename || 'exported-content.md',
      saveAs: true
    });
  }
});