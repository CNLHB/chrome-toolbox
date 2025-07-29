// 爱华工具箱 - 设置页面脚本

// 默认设置
const DEFAULT_SETTINGS = {
  // 功能开关
  githubFeatureEnabled: true,
  markdownFeatureEnabled: true,
  contextMenuEnabled: true,

  // 网站配置
  siteConfigs: [],
  useTurndownService: true,

  // Markdown设置
  headerSelectors: "h1, h2, h3, h4, h5, h6",
  contentSelectors:
    "article, .content, .post-content, .entry-content, main, .main-content",
  excludeSelectors:
    "style, .ad, .advertisement, .sidebar, .navigation, .footer",
  includeImages: true,
  includeLinks: true,
  addMetadata: true,

  // GitHub设置
  github1sDomain: "github1s.com",
  openInNewTab: true,
  showNotification: true,

  // 高级设置
  customCss: "",
  debugMode: false,
  autoUpdate: true,
};

// 预设配置
const PRESET_CONFIGS = {
  wechat: {
    domain: "mp.weixin.qq.com",
    name: "微信公众号",
    titleSelector: "#activity-name",
    contentSelector: "#js_content",
  },
  zhihu: {
    domain: "zhuanlan.zhihu.com",
    name: "知乎专栏",
    titleSelector: ".Post-Title, .ContentItem-title",
    contentSelector: ".Post-RichTextContainer, .RichContent-inner",
  },
  juejin: {
    domain: "juejin.cn",
    name: "掘金",
    titleSelector: ".article-title",
    contentSelector: ".markdown-body",
    excludeSelectors: "style",
  },
  csdn: {
    domain: "blog.csdn.net",
    name: "CSDN博客",
    titleSelector: ".title-article, .article_title",
    contentSelector: "#content_views, .article_content",
  },
  github: {
    domain: "github.com",
    name: "GitHub",
    titleSelector: ".js-issue-title, .markdown-title",
    contentSelector: ".markdown-body, .comment-body",
  },
};

// 初始化设置页面
function initializeOptions() {
  console.log("爱华工具箱设置页面已加载");
}

// 绑定事件监听器 - 合并所有事件绑定
function bindEvents() {
  // 主要按钮事件
  document
    .getElementById("save-settings")
    .addEventListener("click", saveSettings);
  document
    .getElementById("reset-settings")
    .addEventListener("click", resetSettings);
  document
    .getElementById("export-settings")
    .addEventListener("click", exportSettings);
  document.getElementById("import-settings").addEventListener("click", () => {
    document.getElementById("import-file").click();
  });
  document
    .getElementById("import-file")
    .addEventListener("change", importSettings);

  // 实时保存某些设置
  const autoSaveElements = [
    "github-feature-enabled",
    "markdown-feature-enabled",
    "context-menu-enabled",
  ];

  autoSaveElements.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener("change", () => {
        saveSettings(false); // 静默保存
      });
    }
  });

  // 网站配置相关事件
  const addSiteConfigBtn = document.getElementById("add-site-config");
  if (addSiteConfigBtn) {
    addSiteConfigBtn.addEventListener("click", addSiteConfig);
  }

  // 预设配置按钮
  document.querySelectorAll(".preset-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const preset = e.target.dataset.preset;
      addPresetConfig(preset);
    });
  });
}

// 加载设置
function loadSettings() {
  chrome.storage.sync.get(DEFAULT_SETTINGS, function (settings) {
    // 功能开关
    const githubFeatureEnabled = document.getElementById(
      "github-feature-enabled"
    );
    const markdownFeatureEnabled = document.getElementById(
      "markdown-feature-enabled"
    );
    const contextMenuEnabled = document.getElementById("context-menu-enabled");

    if (githubFeatureEnabled)
      githubFeatureEnabled.checked = settings.githubFeatureEnabled;
    if (markdownFeatureEnabled)
      markdownFeatureEnabled.checked = settings.markdownFeatureEnabled;
    if (contextMenuEnabled)
      contextMenuEnabled.checked = settings.contextMenuEnabled;

    // Markdown设置
    const headerSelectors = document.getElementById("header-selectors");
    const contentSelectors = document.getElementById("content-selectors");
    const excludeSelectors = document.getElementById("exclude-selectors");
    const includeImages = document.getElementById("include-images");
    const includeLinks = document.getElementById("include-links");
    const addMetadata = document.getElementById("add-metadata");

    if (headerSelectors) headerSelectors.value = settings.headerSelectors;
    if (contentSelectors) contentSelectors.value = settings.contentSelectors;
    if (excludeSelectors) excludeSelectors.value = settings.excludeSelectors;
    if (includeImages) includeImages.checked = settings.includeImages;
    if (includeLinks) includeLinks.checked = settings.includeLinks;
    if (addMetadata) addMetadata.checked = settings.addMetadata;

    // GitHub设置
    const github1sDomain = document.getElementById("github1s-domain");
    const openInNewTab = document.getElementById("open-in-new-tab");
    const showNotification = document.getElementById("show-notification");

    if (github1sDomain) github1sDomain.value = settings.github1sDomain;
    if (openInNewTab) openInNewTab.checked = settings.openInNewTab;
    if (showNotification) showNotification.checked = settings.showNotification;

    // 高级设置
    const customCss = document.getElementById("custom-css");
    const debugMode = document.getElementById("debug-mode");
    const autoUpdate = document.getElementById("auto-update");
    const useTurndownService = document.getElementById("use-turndown-service");

    if (customCss) customCss.value = settings.customCss;
    if (debugMode) debugMode.checked = settings.debugMode;
    if (autoUpdate) autoUpdate.checked = settings.autoUpdate;
    if (useTurndownService)
      useTurndownService.checked = settings.useTurndownService;

    // 加载网站配置
    loadSiteConfigs(settings.siteConfigs || []);

    console.log("设置已加载:", settings);
  });
}

// 保存设置
function saveSettings(showMessage = true) {
  const settings = {
    // 功能开关
    githubFeatureEnabled:
      document.getElementById("github-feature-enabled")?.checked || false,
    markdownFeatureEnabled:
      document.getElementById("markdown-feature-enabled")?.checked || false,
    contextMenuEnabled:
      document.getElementById("context-menu-enabled")?.checked || false,

    // Markdown设置
    headerSelectors:
      document.getElementById("header-selectors")?.value.trim() ||
      DEFAULT_SETTINGS.headerSelectors,
    contentSelectors:
      document.getElementById("content-selectors")?.value.trim() ||
      DEFAULT_SETTINGS.contentSelectors,
    excludeSelectors:
      document.getElementById("exclude-selectors")?.value.trim() ||
      DEFAULT_SETTINGS.excludeSelectors,
    includeImages: document.getElementById("include-images")?.checked || false,
    includeLinks: document.getElementById("include-links")?.checked || false,
    addMetadata: document.getElementById("add-metadata")?.checked || false,

    // GitHub设置
    github1sDomain:
      document.getElementById("github1s-domain")?.value ||
      DEFAULT_SETTINGS.github1sDomain,
    openInNewTab: document.getElementById("open-in-new-tab")?.checked || false,
    showNotification:
      document.getElementById("show-notification")?.checked || false,

    // 高级设置
    customCss: document.getElementById("custom-css")?.value || "",
    debugMode: document.getElementById("debug-mode")?.checked || false,
    autoUpdate: document.getElementById("auto-update")?.checked || false,

    // 网站配置
    siteConfigs: getSiteConfigs(),
    useTurndownService:
      document.getElementById("use-turndown-service")?.checked || false,
  };

  // 验证设置
  if (!validateSettings(settings)) {
    return;
  }

  // 保存到Chrome存储
  chrome.storage.sync.set(settings, function () {
    if (chrome.runtime.lastError) {
      showStatusMessage(
        "保存失败: " + chrome.runtime.lastError.message,
        "error"
      );
      return;
    }

    if (showMessage) {
      showStatusMessage("设置已保存成功！", "success");
    }

    // 通知后台脚本更新菜单
    chrome.runtime.sendMessage({
      action: "updateSettings",
      settings: settings,
    });

    console.log("设置已保存:", settings);
  });
}

// 验证设置
function validateSettings(settings) {
  // 验证CSS选择器格式
  const selectorFields = [
    "headerSelectors",
    "contentSelectors",
    "excludeSelectors",
  ];

  for (const field of selectorFields) {
    if (settings[field] && !isValidCssSelector(settings[field])) {
      showStatusMessage(`${field}格式不正确，请检查CSS选择器语法`, "error");
      return false;
    }
  }

  return true;
}

// 验证CSS选择器
function isValidCssSelector(selector) {
  try {
    document.querySelector(selector.split(",")[0].trim());
    return true;
  } catch (e) {
    return false;
  }
}

// 恢复默认设置
function resetSettings() {
  if (confirm("确定要恢复所有设置为默认值吗？此操作不可撤销。")) {
    chrome.storage.sync.clear(function () {
      loadSettings();
      showStatusMessage("已恢复默认设置", "success");
    });
  }
}

// 导出设置
function exportSettings() {
  chrome.storage.sync.get(null, function (settings) {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = `aihua-toolbox-settings-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();

    showStatusMessage("设置已导出", "success");
  });
}

// 导入设置
function importSettings(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const settings = JSON.parse(e.target.result);

      // 验证导入的设置
      if (validateImportedSettings(settings)) {
        chrome.storage.sync.set(settings, function () {
          loadSettings();
          showStatusMessage("设置导入成功", "success");
        });
      } else {
        showStatusMessage("导入的设置文件格式不正确", "error");
      }
    } catch (error) {
      showStatusMessage("导入失败：文件格式错误", "error");
    }
  };

  reader.readAsText(file);

  // 清空文件输入
  event.target.value = "";
}

// 验证导入的设置
function validateImportedSettings(settings) {
  // 检查必要的字段
  const requiredFields = Object.keys(DEFAULT_SETTINGS);

  for (const field of requiredFields) {
    if (!(field in settings)) {
      console.warn(`缺少设置字段: ${field}`);
      // 使用默认值
      settings[field] = DEFAULT_SETTINGS[field];
    }
  }

  return true;
}

// 显示状态消息
function showStatusMessage(message, type = "success") {
  const statusElement = document.getElementById("status-message");
  if (statusElement) {
    statusElement.textContent = message;
    statusElement.className = `status-message ${type}`;
    statusElement.style.display = "block";

    // 3秒后自动隐藏
    setTimeout(() => {
      statusElement.style.display = "none";
    }, 3000);
  }
}

// 网站配置相关函数
function addSiteConfig(config = null) {
  const container = document.getElementById("site-configs");
  if (!container) return;

  const index = container.children.length;

  const configItem = document.createElement("div");
  configItem.className = "site-config-item";
  configItem.innerHTML = `
    <div class="site-config-header">
      <h4>网站配置 ${index + 1}</h4>
      <button type="button" class="remove-site-config">删除</button>
    </div>
    <div class="site-config-row">
      <div class="form-group">
        <label>网站域名</label>
        <input type="text" class="site-domain" placeholder="例如: mp.weixin.qq.com" value="${
          config?.domain || ""
        }">
      </div>
      <div class="form-group">
        <label>配置名称</label>
        <input type="text" class="site-name" placeholder="例如: 微信公众号" value="${
          config?.name || ""
        }">
      </div>
      <div class="form-group">
        <label>是否启用</label>
        <label class="toggle-switch">
          <input type="checkbox" class="site-enabled" ${
            config?.enabled !== false ? "checked" : ""
          }>
          <span class="slider"></span>
        </label>
      </div>
    </div>
    <div class="site-config-row">
      <div class="form-group">
        <label>标题选择器</label>
        <input type="text" class="site-title-selector" placeholder="例如: #activity-name" value="${
          config?.titleSelector || ""
        }">
      </div>
      <div class="form-group">
        <label>内容选择器</label>
        <input type="text" class="site-content-selector" placeholder="例如: #js_content" value="${
          config?.contentSelector || ""
        }">
      </div>
      <div class="form-group">
        <label>排除选择器</label>
        <input type="text" class="site-exclude-selector" placeholder="例如: .ad, .sidebar" value="${
          config?.excludeSelector || ""
        }">
      </div>
    </div>
  `;

  // 为删除按钮添加事件监听器
  const removeBtn = configItem.querySelector(".remove-site-config");
  removeBtn.addEventListener("click", function () {
    removeSiteConfig(this);
  });

  container.appendChild(configItem);
}

function removeSiteConfig(button) {
  button.closest(".site-config-item").remove();
  updateSiteConfigNumbers();
}

function updateSiteConfigNumbers() {
  const items = document.querySelectorAll(".site-config-item");
  items.forEach((item, index) => {
    item.querySelector("h4").textContent = `网站配置 ${index + 1}`;
  });
}

function addPresetConfig(presetKey) {
  const preset = PRESET_CONFIGS[presetKey];
  if (preset) {
    addSiteConfig({
      ...preset,
      enabled: true,
    });
  }
}

function loadSiteConfigs(configs) {
  const container = document.getElementById("site-configs");
  if (!container) return;

  container.innerHTML = "";

  configs.forEach((config) => {
    addSiteConfig(config);
  });
}

function getSiteConfigs() {
  const configs = [];
  const items = document.querySelectorAll(".site-config-item");

  items.forEach((item) => {
    const config = {
      domain: item.querySelector(".site-domain")?.value.trim() || "",
      name: item.querySelector(".site-name")?.value.trim() || "",
      enabled: item.querySelector(".site-enabled")?.checked || false,
      titleSelector:
        item.querySelector(".site-title-selector")?.value.trim() || "",
      contentSelector:
        item.querySelector(".site-content-selector")?.value.trim() || "",
      excludeSelector:
        item.querySelector(".site-exclude-selector")?.value.trim() || "",
    };

    if (config.domain && config.titleSelector && config.contentSelector) {
      configs.push(config);
    }
  });

  return configs;
}

// 监听来自其他脚本的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSettings") {
    chrome.storage.sync.get(DEFAULT_SETTINGS, function (settings) {
      sendResponse(settings);
    });
    return true; // 保持消息通道开放
  }
});

/**
 * 切换折叠状态的函数
 * @param {string} containerId - 容器元素的ID
 */
const toggleCollapse = (containerId) => {
  const container = document.getElementById(containerId);
  const icon = document.getElementById(
    containerId.replace("-container", "-icon")
  );

  if (container && icon) {
    container.classList.toggle("collapsed");
    icon.classList.toggle("collapsed");

    // 保存折叠状态到本地存储
    const isCollapsed = container.classList.contains("collapsed");
    localStorage.setItem(`collapse-${containerId}`, isCollapsed);
  }
};

/**
 * 恢复折叠状态的函数
 * @param {string} containerId - 容器元素的ID
 */
const restoreCollapseState = (containerId) => {
  const isCollapsed =
    localStorage.getItem(`collapse-${containerId}`) === "true";
  if (isCollapsed) {
    const container = document.getElementById(containerId);
    const icon = document.getElementById(
      containerId.replace("-container", "-icon")
    );
    if (container && icon) {
      container.classList.add("collapsed");
      icon.classList.add("collapsed");
    }
  }
};

/**
 * 初始化折叠功能的函数
 */
const initializeCollapsible = () => {
  // 为所有可折叠标题添加点击事件监听器
  const collapsibleHeaders = document.querySelectorAll(".collapsible-header");
  collapsibleHeaders.forEach((header) => {
    header.addEventListener("click", () => {
      const targetId = header.getAttribute("data-target");
      if (targetId) {
        toggleCollapse(targetId);
      }
    });
  });

  // 恢复网站配置的折叠状态
  restoreCollapseState("site-configs-container");
};

// 修改现有的DOMContentLoaded事件监听器
document.addEventListener("DOMContentLoaded", function () {
  initializeOptions();
  bindEvents();
  loadSettings();

  // 初始化折叠功能
  initializeCollapsible();
});
