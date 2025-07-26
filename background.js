// 爱华工具箱 - 后台脚本

// 插件安装时创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
  createContextMenus();
});

// 监听设置变化，重新创建菜单
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "sync") {
    // 当设置发生变化时，重新创建菜单
    createContextMenus();
  }
});

// 创建右键菜单结构
function createContextMenus() {
  // 获取用户设置
  chrome.storage.sync.get(
    {
      githubFeatureEnabled: true,
      markdownFeatureEnabled: true,
      contextMenuEnabled: true,
    },
    function (settings) {
      // 移除所有现有菜单
      chrome.contextMenus.removeAll(() => {
        // 如果右键菜单被禁用，则不创建任何菜单
        if (!settings.contextMenuEnabled) {
          return;
        }

        // 主菜单
        chrome.contextMenus.create({
          id: "aihua-toolbox",
          title: "爱华工具箱",
          contexts: ["page", "selection", "link"],
        });

        // 功能1: GitHub1s跳转 - 根据设置决定是否显示
        if (settings.githubFeatureEnabled) {
          chrome.contextMenus.create({
            id: "github-to-github1s",
            parentId: "aihua-toolbox",
            title: "🚀 跳转到GitHub1s编辑器",
            contexts: ["page", "link"],
            documentUrlPatterns: ["https://github.com/*/*"],
          });
        }

        // 功能2: HTML转Markdown - 根据设置决定是否显示
        if (settings.markdownFeatureEnabled) {
          chrome.contextMenus.create({
            id: "html-to-markdown",
            parentId: "aihua-toolbox",
            title: "📝 导出为Markdown",
            contexts: ["page", "selection"],
          });
        }

        // 只有在有功能启用时才显示分隔线
        if (settings.githubFeatureEnabled || settings.markdownFeatureEnabled) {
          chrome.contextMenus.create({
            id: "separator1",
            parentId: "aihua-toolbox",
            type: "separator",
            contexts: ["page"],
          });
        }

        // 设置选项
        chrome.contextMenus.create({
          id: "open-options",
          parentId: "aihua-toolbox",
          title: "⚙️ 设置选项",
          contexts: ["page"],
        });

        // 功能3: 预留扩展位置
        chrome.contextMenus.create({
          id: "feature-placeholder",
          parentId: "aihua-toolbox",
          title: "🔧 更多功能 (敬请期待)",
          contexts: ["page"],
          enabled: false,
        });
      });
    }
  );
}

// 处理右键菜单点击事件
chrome.contextMenus.onClicked.addListener((info, tab) => {
  // 获取当前设置，确保功能确实启用
  chrome.storage.sync.get(
    {
      githubFeatureEnabled: true,
      markdownFeatureEnabled: true,
    },
    function (settings) {
      switch (info.menuItemId) {
        case "github-to-github1s":
          if (settings.githubFeatureEnabled) {
            handleGithubToGithub1s(info, tab);
          }
          break;
        case "html-to-markdown":
          if (settings.markdownFeatureEnabled) {
            handleHtmlToMarkdown(info, tab);
          }
          break;
        case "open-options":
          chrome.runtime.openOptionsPage();
          break;
      }
    }
  );
});

// GitHub1s跳转功能
// GitHub1s跳转功能
function handleGithubToGithub1s(info, tab) {
  let url = info.linkUrl || tab.url;

  if (url && url.includes("github.com")) {
    // 获取GitHub设置
    chrome.storage.sync.get(
      {
        github1sDomain: "github1s.com",
        openInNewTab: true,
        showNotification: true,
      },
      function (settings) {
        // 将github.com替换为配置的域名
        const github1sUrl = url.replace("github.com", settings.github1sDomain);

        // 根据设置决定是否在新标签页打开
        if (settings.openInNewTab) {
          chrome.tabs.create({
            url: github1sUrl,
            index: tab.index + 1,
          });
        } else {
          chrome.tabs.update(tab.id, { url: github1sUrl });
        }

        // 根据设置决定是否显示通知，并添加错误处理
        if (settings.showNotification && chrome.notifications) {
          try {
            chrome.notifications.create({
              type: "basic",
              iconUrl: "icons/icon48.png",
              title: "爱华工具箱",
              message: "正在跳转到GitHub1s编辑器...",
            });
          } catch (error) {
            console.log("通知创建失败:", error);
          }
        }
      }
    );
  }
}

// HTML转Markdown功能
function handleHtmlToMarkdown(info, tab) {
  // 向内容脚本发送消息
  chrome.tabs.sendMessage(tab.id, {
    action: "convertToMarkdown",
    selectedText: info.selectionText,
  });
}
