// 爱华工具箱 - 弹窗脚本

document.addEventListener('DOMContentLoaded', function() {
  initializePopup();
});

function initializePopup() {
  // 绑定按钮事件
  document.getElementById('open-options').addEventListener('click', openOptions);
  document.getElementById('help-btn').addEventListener('click', showHelp);
  
  // 绑定功能项点击事件
  document.getElementById('github-feature').addEventListener('click', () => {
    showFeatureInfo('GitHub1s跳转', '在GitHub仓库页面右键选择"跳转到GitHub1s编辑器"即可使用');
  });
  
  document.getElementById('markdown-feature').addEventListener('click', () => {
    showFeatureInfo('HTML转Markdown', '在任意网页右键选择"导出为Markdown"即可将页面内容转换为MD格式');
  });
  
  // 检查当前页面是否支持特定功能
  checkCurrentPageFeatures();
}

// 打开设置页面
function openOptions() {
  chrome.runtime.openOptionsPage();
  window.close();
}

// 显示帮助信息
function showHelp() {
  const helpText = `
🧰 爱华工具箱使用指南

🚀 GitHub1s跳转:
• 在GitHub仓库页面右键
• 选择"跳转到GitHub1s编辑器"
• 自动在新标签页打开在线编辑器

📝 HTML转Markdown:
• 在任意网页右键
• 选择"导出为Markdown"
• 可选择文本后导出选中内容
• 支持自定义内容选择器

⚙️ 更多设置:
• 点击"设置选项"进行个性化配置
• 可自定义内容提取规则
• 支持功能开关控制
  `;
  
  alert(helpText);
}

// 显示功能详情
function showFeatureInfo(title, description) {
  const modal = document.createElement('div');
  modal.className = 'feature-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>${title}</h3>
      <p>${description}</p>
      <button onclick="this.parentElement.parentElement.remove()">确定</button>
    </div>
  `;
  document.body.appendChild(modal);
}

// 检查当前页面支持的功能
function checkCurrentPageFeatures() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentTab = tabs[0];
    const url = currentTab.url;
    
    // 检查GitHub功能
    const githubFeature = document.getElementById('github-feature');
    if (url && url.includes('github.com')) {
      githubFeature.classList.add('available');
      githubFeature.querySelector('.feature-status').textContent = '可用';
      githubFeature.querySelector('.feature-status').className = 'feature-status available';
    }
    
    // Markdown功能在所有页面都可用
    const markdownFeature = document.getElementById('markdown-feature');
    markdownFeature.classList.add('available');
  });
}