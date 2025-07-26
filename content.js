// 爱华工具箱 - 内容脚本

// 监听来自后台脚本的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "convertToMarkdown") {
    // 不再使用selectedText，而是使用选择器
    convertPageToMarkdown();
  }
});

// HTML转Markdown核心功能
function convertPageToMarkdown() {
  chrome.storage.sync.get(null, function (settings) {
    const currentDomain = window.location.hostname;
    let config = findSiteConfig(currentDomain, settings.siteConfigs || []);

    if (!config) {
      // 使用默认配置
      config = {
        titleSelector: settings.headerSelectors || "h1, h2, h3, h4, h5, h6",
        contentSelector:
          settings.contentSelectors ||
          "article, .content, .post-content, .entry-content, main, .main-content",
        excludeSelector:
          settings.excludeSelectors ||
          ".ad, .advertisement, .sidebar, .navigation, .footer",
      };
    }

    // 直接使用选择器提取内容，不再依赖selectedText
    const content = extractPageContentWithConfig(config, settings);

    // 构建完整的Markdown内容
    const title = document.title;
    const markdownContent = settings.addMetadata
      ? `来源: ${
          window.location.href
        }\n> 导出时间: ${new Date().toLocaleString()}\n\n${content}`
      : content;
    const blob = new Blob([markdownContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = title + ".md";
    // 模拟点击下载
    a.click();
    // 释放URL对象
    URL.revokeObjectURL(url);
  });
}

// 查找匹配的网站配置
function findSiteConfig(domain, siteConfigs) {
  return siteConfigs.find(
    (config) => config.enabled && domain.includes(config.domain)
  );
}

// 使用网站特定配置提取内容
function extractPageContentWithConfig(config, settings) {
  let content = "";

  // 获取标题 - 使用配置的标题选择器
  const titleElement = document.querySelector(config.titleSelector);
  if (titleElement) {
    content += `# ${titleElement.textContent.trim()}\n\n`;
  }

  // 获取主要内容 - 使用配置的内容选择器
  const contentElement = document.querySelector(config.contentSelector);
  if (contentElement) {
    // 克隆元素以避免修改原始DOM
    const clonedElement = contentElement.cloneNode(true);

    // 移除排除的元素
    if (config.excludeSelector) {
      const excludeElements = clonedElement.querySelectorAll(
        config.excludeSelector
      );
      excludeElements.forEach((el) => el.remove());
    }

    content += settings.useTurndownService
      ? convertWithTurndownService(clonedElement.outerHTML, config)
      : convertHtmlToMarkdown(clonedElement.innerHTML);
  } else {
    // 如果没找到特定内容区域，尝试多个选择器
    const fallbackSelectors = config.contentSelector
      .split(",")
      .map((s) => s.trim());
    let foundContent = false;

    for (const selector of fallbackSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const clonedElement = element.cloneNode(true);

        // 移除排除的元素
        if (config.excludeSelector) {
          const excludeElements = clonedElement.querySelectorAll(
            config.excludeSelector
          );
          excludeElements.forEach((el) => el.remove());
        }

        content += settings.useTurndownService
          ? convertWithTurndownService(clonedElement.outerHTML, config)
          : convertHtmlToMarkdown(clonedElement.innerHTML);
        foundContent = true;
        break;
      }
    }

    // 如果所有选择器都没找到内容，使用默认方式
    if (!foundContent) {
      console.warn("未找到匹配的内容选择器，使用默认提取方式");
      const elements = document.querySelectorAll(
        "h1, h2, h3, h4, h5, h6, p, blockquote, ul, ol, pre, code"
      );
      elements.forEach((el) => {
        content += convertElementToMarkdown(el) + "\n\n";
      });
    }
  }

  return content;
}

// 新增：根据选择器导出特定元素的函数
function exportElementBySelector(selector, filename = null) {
  const element = document.querySelector(selector);
  if (!element) {
    console.error(`未找到选择器 "${selector}" 对应的元素`);
    return;
  }

  chrome.storage.sync.get(null, function (settings) {
    const clonedElement = element.cloneNode(true);

    // 移除排除的元素（如果有配置）
    if (settings.excludeSelectors) {
      const excludeElements = clonedElement.querySelectorAll(
        settings.excludeSelectors
      );
      excludeElements.forEach((el) => el.remove());
    }

    const content = settings.useTurndownService
      ? convertWithTurndownService(clonedElement.outerHTML, {})
      : convertHtmlToMarkdown(clonedElement.innerHTML);

    const title = filename || `element_${Date.now()}`;
    const markdownContent = settings.addMetadata
      ? `# ${title}\n\n> 来源: ${
          window.location.href
        }\n> 选择器: ${selector}\n> 导出时间: ${new Date().toLocaleString()}\n\n${content}`
      : content;

    // 发送到后台脚本进行下载
    chrome.runtime.sendMessage({
      action: "downloadMarkdown",
      content: markdownContent,
      filename: `${sanitizeFilename(title)}.md`,
    });
  });
}

// 新增：批量导出多个选择器的函数
function exportMultipleSelectors(selectors, filename = null) {
  let combinedContent = "";

  chrome.storage.sync.get(null, function (settings) {
    selectors.forEach((selector, index) => {
      const element = document.querySelector(selector);
      if (element) {
        const clonedElement = element.cloneNode(true);

        // 移除排除的元素
        if (settings.excludeSelectors) {
          const excludeElements = clonedElement.querySelectorAll(
            settings.excludeSelectors
          );
          excludeElements.forEach((el) => el.remove());
        }

        const content = settings.useTurndownService
          ? convertWithTurndownService(clonedElement.outerHTML, {})
          : convertHtmlToMarkdown(clonedElement.innerHTML);

        combinedContent += `## 部分 ${
          index + 1
        } (${selector})\n\n${content}\n\n`;
      } else {
        combinedContent += `## 部分 ${
          index + 1
        } (${selector})\n\n*未找到匹配的元素*\n\n`;
      }
    });

    const title = filename || `multi_elements_${Date.now()}`;
    const markdownContent = settings.addMetadata
      ? `# ${title}\n\n> 来源: ${
          window.location.href
        }\n> 选择器: ${selectors.join(
          ", "
        )}\n> 导出时间: ${new Date().toLocaleString()}\n\n${combinedContent}`
      : combinedContent;

    // 发送到后台脚本进行下载
    chrome.runtime.sendMessage({
      action: "downloadMarkdown",
      content: markdownContent,
      filename: `${sanitizeFilename(title)}.md`,
    });
  });
}

// 使用TurndownService转换
function convertWithTurndownService(html, config) {
  if (typeof TurndownService === "undefined") {
    console.warn("TurndownService未加载，使用默认转换方式");
    return convertHtmlToMarkdown(html);
  }

  const turndownService = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
  });

  // 自定义图片规则 - 支持微信公众号等平台的data-src
  turndownService.addRule("image", {
    filter: ["img"],
    replacement: function (content, node) {
      const src =
        node.getAttribute("data-src") ||
        node.getAttribute("data-original") ||
        node.getAttribute("src") ||
        "";
      const alt = node.getAttribute("alt") || "";
      return src ? `![${alt}](${src})` : "";
    },
  });

  // 自定义代码块规则
  turndownService.addRule("pre", {
    filter: ["pre"],
    replacement: function (content, node) {
      const codeNode = node.querySelector("code");
      if (codeNode) {
        let allText = [];
        [...codeNode.childNodes].forEach((item) => {
          let text = item.textContent || item.innerText || "";
          if (item.innerHTML && item.innerHTML.indexOf("<br>") > -1) {
            text = "\n";
          }
          allText.push(text || "  ");
        });

        const language =
          codeNode.className.match(/language-(\w+)/)?.[1] || "js";
        return `\`\`\`${language}\n${allText.join("")}\n\`\`\``;
      }
      return `\`\`\`\n${content}\n\`\`\``;
    },
  });

  // 自定义链接规则 - 处理相对链接
  turndownService.addRule("link", {
    filter: ["a"],
    replacement: function (content, node) {
      let href = node.getAttribute("href") || "";
      if (href.startsWith("/")) {
        href = window.location.origin + href;
      }
      return href ? `[${content}](${href})` : content;
    },
  });

  try {
    return turndownService.turndown(html);
  } catch (error) {
    console.error("TurndownService转换失败:", error);
    return convertHtmlToMarkdown(html);
  }
}

// HTML转Markdown转换器（备用方案）
function convertHtmlToMarkdown(html) {
  // 创建临时DOM元素
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  let markdown = "";

  // 遍历所有子元素
  const walker = document.createTreeWalker(
    tempDiv,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    null,
    false
  );

  let node;
  while ((node = walker.nextNode())) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      if (text) {
        markdown += text + " ";
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
    case "h1":
      return `\n# ${text}\n`;
    case "h2":
      return `\n## ${text}\n`;
    case "h3":
      return `\n### ${text}\n`;
    case "h4":
      return `\n#### ${text}\n`;
    case "h5":
      return `\n##### ${text}\n`;
    case "h6":
      return `\n###### ${text}\n`;
    case "p":
      return `\n${text}\n`;
    case "blockquote":
      return `\n> ${text}\n`;
    case "strong":
    case "b":
      return `**${text}**`;
    case "em":
    case "i":
      return `*${text}*`;
    case "code":
      return `\`${text}\``;
    case "pre":
      return `\n\`\`\`\n${text}\n\`\`\`\n`;
    case "a":
      const href = element.getAttribute("href");
      return href ? `[${text}](${href})` : text;
    case "img":
      const src = element.getAttribute("src");
      const alt = element.getAttribute("alt") || "";
      return src ? `![${alt}](${src})` : "";
    case "ul":
    case "ol":
      let listItems = "";
      const items = element.querySelectorAll("li");
      items.forEach((item, index) => {
        const prefix = tagName === "ul" ? "- " : `${index + 1}. `;
        listItems += `${prefix}${item.textContent.trim()}\n`;
      });
      return `\n${listItems}`;
    default:
      return text ? ` ${text} ` : "";
  }
}

// 清理文件名
function sanitizeFilename(filename) {
  return filename.replace(/[^a-z0-9\u4e00-\u9fa5]/gi, "_").substring(0, 50);
}

// 页面加载完成后的初始化
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeContentScript);
} else {
  initializeContentScript();
}

function initializeContentScript() {
  // 内容脚本初始化逻辑
  console.log("爱华工具箱内容脚本已加载");

  // 暴露函数到全局，方便调试和外部调用
  window.aihuaToolbox = {
    exportElementBySelector,
    exportMultipleSelectors,
    convertPageToMarkdown,
  };
}
