// 爱华工具箱 - 内容脚本

// 监听来自后台脚本的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'convertToMarkdown') {
    convertPageToMarkdown(request.selectedText);
  }
});

// HTML转Markdown核心功能
function convertPageToMarkdown(selectedText) {
  let content = '';
  let title = document.title;
  
  if (selectedText) {
    // 如果有选中文本，只转换选中部分
    content = convertHtmlToMarkdown(selectedText);
  } else {
    // 转换整个页面内容
    content = extractPageContent();
  }
  
  // 构建完整的Markdown内容
  const markdownContent = `# ${title}\n\n> 来源: ${window.location.href}\n> 导出时间: ${new Date().toLocaleString()}\n\n${content}`;
  
  // 发送到后台脚本进行下载
  chrome.runtime.sendMessage({
    action: 'downloadMarkdown',
    content: markdownContent,
    filename: `${sanitizeFilename(title)}.md`
  });
}

// 提取页面主要内容
function extractPageContent() {
  // 获取用户配置的选择器
  return new Promise((resolve) => {
    chrome.storage.sync.get(['headerSelectors', 'contentSelectors'], (result) => {
      const headerSelectors = result.headerSelectors || ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
      const contentSelectors = result.contentSelectors || ['article', '.content', '.post-content', '.entry-content', 'main', '.main-content'];
      
      let content = '';
      
      // 尝试提取主要内容区域
      let mainContent = null;
      for (const selector of contentSelectors) {
        mainContent = document.querySelector(selector);
        if (mainContent) break;
      }
      
      if (mainContent) {
        content = convertHtmlToMarkdown(mainContent.innerHTML);
      } else {
        // 如果没找到主要内容区域，提取所有段落和标题
        const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, blockquote, ul, ol, pre, code');
        elements.forEach(el => {
          content += convertElementToMarkdown(el) + '\n\n';
        });
      }
      
      resolve(content);
    });
  });
}

// HTML转Markdown转换器
function convertHtmlToMarkdown(html) {
  // 创建临时DOM元素
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  let markdown = '';
  
  // 遍历所有子元素
  const walker = document.createTreeWalker(
    tempDiv,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  let node;
  while (node = walker.nextNode()) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      if (text) {
        markdown += text + ' ';
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      markdown += convertElementToMarkdown(node);
    }
  }
  
  return markdown.trim();
}

// 单个元素转换为Markdown
function convertElementToMarkdown(element) {
  const tagName = element.tagName.toLowerCase();
  const text = element.textContent.trim();
  
  switch (tagName) {
    case 'h1':
      return `\n# ${text}\n`;
    case 'h2':
      return `\n## ${text}\n`;
    case 'h3':
      return `\n### ${text}\n`;
    case 'h4':
      return `\n#### ${text}\n`;
    case 'h5':
      return `\n##### ${text}\n`;
    case 'h6':
      return `\n###### ${text}\n`;
    case 'p':
      return `\n${text}\n`;
    case 'blockquote':
      return `\n> ${text}\n`;
    case 'strong':
    case 'b':
      return `**${text}**`;
    case 'em':
    case 'i':
      return `*${text}*`;
    case 'code':
      return `\`${text}\``;
    case 'pre':
      return `\n\`\`\`\n${text}\n\`\`\`\n`;
    case 'a':
      const href = element.getAttribute('href');
      return href ? `[${text}](${href})` : text;
    case 'img':
      const src = element.getAttribute('src');
      const alt = element.getAttribute('alt') || '';
      return src ? `![${alt}](${src})` : '';
    case 'ul':
    case 'ol':
      let listItems = '';
      const items = element.querySelectorAll('li');
      items.forEach((item, index) => {
        const prefix = tagName === 'ul' ? '- ' : `${index + 1}. `;
        listItems += `${prefix}${item.textContent.trim()}\n`;
      });
      return `\n${listItems}`;
    default:
      return text ? ` ${text} ` : '';
  }
}

// 清理文件名
function sanitizeFilename(filename) {
  return filename.replace(/[^a-z0-9\u4e00-\u9fa5]/gi, '_').substring(0, 50);
}

// 页面加载完成后的初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeContentScript);
} else {
  initializeContentScript();
}

function initializeContentScript() {
  // 内容脚本初始化逻辑
  console.log('爱华工具箱内容脚本已加载');
}