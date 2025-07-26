// 爱华工具箱 - 设置页面脚本

// 默认设置
const DEFAULT_SETTINGS = {
  // 功能开关
  githubFeatureEnabled: true,
  markdownFeatureEnabled: true,
  contextMenuEnabled: true,
  
  // Markdown设置
  headerSelectors: 'h1, h2, h3, h4, h5, h6',
  contentSelectors: 'article, .content, .post-content, .entry-content, main, .main-content',
  excludeSelectors: '.ad, .advertisement, .sidebar, .navigation, .footer',
  includeImages: true,
  includeLinks: true,
  addMetadata: true,
  
  // GitHub设置
  github1sDomain: 'github1s.com',
  openInNewTab: true,
  showNotification: true,
  
  // 高级设置
  customCss: '',
  debugMode: false,
  autoUpdate: true
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  initializeOptions();
  bindEvents();
  loadSettings();
});

// 初始化设置页面
function initializeOptions() {
  console.log('爱华工具箱设置页面已加载');
}

// 绑定事件监听器
function bindEvents() {
  // 保存设置
  document.getElementById('save-settings').addEventListener('click', saveSettings);
  
  // 恢复默认设置
  document.getElementById('reset-settings').addEventListener('click', resetSettings);
  
  // 导出设置
  document.getElementById('export-settings').addEventListener('click', exportSettings);
  
  // 导入设置
  document.getElementById('import-settings').addEventListener('click', () => {
    document.getElementById('import-file').click();
  });
  
  document.getElementById('import-file').addEventListener('change', importSettings);
  
  // 实时保存某些设置
  const autoSaveElements = [
    'github-feature-enabled',
    'markdown-feature-enabled', 
    'context-menu-enabled'
  ];
  
  autoSaveElements.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('change', () => {
        saveSettings(false); // 静默保存
      });
    }
  });
}

// 加载设置
function loadSettings() {
  chrome.storage.sync.get(DEFAULT_SETTINGS, function(settings) {
    // 功能开关
    document.getElementById('github-feature-enabled').checked = settings.githubFeatureEnabled;
    document.getElementById('markdown-feature-enabled').checked = settings.markdownFeatureEnabled;
    document.getElementById('context-menu-enabled').checked = settings.contextMenuEnabled;
    
    // Markdown设置
    document.getElementById('header-selectors').value = settings.headerSelectors;
    document.getElementById('content-selectors').value = settings.contentSelectors;
    document.getElementById('exclude-selectors').value = settings.excludeSelectors;
    document.getElementById('include-images').checked = settings.includeImages;
    document.getElementById('include-links').checked = settings.includeLinks;
    document.getElementById('add-metadata').checked = settings.addMetadata;
    
    // GitHub设置
    document.getElementById('github1s-domain').value = settings.github1sDomain;
    document.getElementById('open-in-new-tab').checked = settings.openInNewTab;
    document.getElementById('show-notification').checked = settings.showNotification;
    
    // 高级设置
    document.getElementById('custom-css').value = settings.customCss;
    document.getElementById('debug-mode').checked = settings.debugMode;
    document.getElementById('auto-update').checked = settings.autoUpdate;
    
    console.log('设置已加载:', settings);
  });
}

// 保存设置
function saveSettings(showMessage = true) {
  const settings = {
    // 功能开关
    githubFeatureEnabled: document.getElementById('github-feature-enabled').checked,
    markdownFeatureEnabled: document.getElementById('markdown-feature-enabled').checked,
    contextMenuEnabled: document.getElementById('context-menu-enabled').checked,
    
    // Markdown设置
    headerSelectors: document.getElementById('header-selectors').value.trim(),
    contentSelectors: document.getElementById('content-selectors').value.trim(),
    excludeSelectors: document.getElementById('exclude-selectors').value.trim(),
    includeImages: document.getElementById('include-images').checked,
    includeLinks: document.getElementById('include-links').checked,
    addMetadata: document.getElementById('add-metadata').checked,
    
    // GitHub设置
    github1sDomain: document.getElementById('github1s-domain').value,
    openInNewTab: document.getElementById('open-in-new-tab').checked,
    showNotification: document.getElementById('show-notification').checked,
    
    // 高级设置
    customCss: document.getElementById('custom-css').value,
    debugMode: document.getElementById('debug-mode').checked,
    autoUpdate: document.getElementById('auto-update').checked
  };
  
  // 验证设置
  if (!validateSettings(settings)) {
    return;
  }
  
  // 保存到Chrome存储
  chrome.storage.sync.set(settings, function() {
    if (chrome.runtime.lastError) {
      showStatusMessage('保存失败: ' + chrome.runtime.lastError.message, 'error');
      return;
    }
    
    if (showMessage) {
      showStatusMessage('设置已保存成功！', 'success');
    }
    
    // 通知后台脚本更新菜单
    chrome.runtime.sendMessage({
      action: 'updateSettings',
      settings: settings
    });
    
    console.log('设置已保存:', settings);
  });
}

// 验证设置
function validateSettings(settings) {
  // 验证CSS选择器格式
  const selectorFields = ['headerSelectors', 'contentSelectors', 'excludeSelectors'];
  
  for (const field of selectorFields) {
    if (settings[field] && !isValidCssSelector(settings[field])) {
      showStatusMessage(`${field}格式不正确，请检查CSS选择器语法`, 'error');
      return false;
    }
  }
  
  return true;
}

// 验证CSS选择器
function isValidCssSelector(selector) {
  try {
    document.querySelector(selector.split(',')[0].trim());
    return true;
  } catch (e) {
    return false;
  }
}

// 恢复默认设置
function resetSettings() {
  if (confirm('确定要恢复所有设置为默认值吗？此操作不可撤销。')) {
    chrome.storage.sync.clear(function() {
      loadSettings();
      showStatusMessage('已恢复默认设置', 'success');
    });
  }
}

// 导出设置
function exportSettings() {
  chrome.storage.sync.get(null, function(settings) {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `aihua-toolbox-settings-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showStatusMessage('设置已导出', 'success');
  });
}

// 导入设置
function importSettings(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const settings = JSON.parse(e.target.result);
      
      // 验证导入的设置
      if (validateImportedSettings(settings)) {
        chrome.storage.sync.set(settings, function() {
          loadSettings();
          showStatusMessage('设置导入成功', 'success');
        });
      } else {
        showStatusMessage('导入的设置文件格式不正确', 'error');
      }
    } catch (error) {
      showStatusMessage('导入失败：文件格式错误', 'error');
    }
  };
  
  reader.readAsText(file);
  
  // 清空文件输入
  event.target.value = '';
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
function showStatusMessage(message, type = 'success') {
  const statusElement = document.getElementById('status-message');
  statusElement.textContent = message;
  statusElement.className = `status-message ${type}`;
  statusElement.style.display = 'block';
  
  // 3秒后自动隐藏
  setTimeout(() => {
    statusElement.style.display = 'none';
  }, 3000);
}

// 监听来自其他脚本的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    chrome.storage.sync.get(DEFAULT_SETTINGS, function(settings) {
      sendResponse(settings);
    });
    return true; // 保持消息通道开放
  }
});