const initGatekeeper = () => {
  const CRYPTO_KEY = atob("Mw==");
  
  const encrypt = (str) => btoa(str);
  const decrypt = (encodedStr) => atob(encodedStr);

  const encryptedCredentials = [
    { data: "Mzc4MTM4OTY1fGFpbmkxMzE0" }, //*|*
  ];
  
  const getValidCredentials = () => {
    return encryptedCredentials.map(cred => {
      const decrypted = decrypt(cred.data);
      const [username, password] = decrypted.split('|');
      return { username, password };
    });
  };

  // 系统配置
  const VALID_CREDENTIALS = getValidCredentials();
  const STORAGE_KEY = 'gatekeeper-lock';
  const SESSION_KEY = 'gatekeeper-auth';
  const CREDS_KEY = 'gatekeeper-creds';
  const PASSWORD_KEY = 'gatekeeper-password';
  const LOCKOUT_KEY = 'gatekeeper-lockout';
  const ATTEMPTS_KEY = 'gatekeeper-attempts';
  const BASE_DELAY = 2000; // 初始锁定时间2秒
  const MAX_DELAY = 5 * 60 * 1000; // 最大锁定时间5分钟
  const MAX_ATTEMPTS = 10; // 最大尝试次数
  const SESSION_TIMEOUT = 15 * 60 * 1000;
  const REMEMBER_ME_EXPIRE = 30 * 24 * 60 * 60 * 1000;

  // 检查锁定状态
  const checkLockout = () => {
    const lockoutData = localStorage.getItem(LOCKOUT_KEY);
    if (lockoutData) {
      const { timestamp, delay } = JSON.parse(lockoutData);
      const remainingTime = delay - (Date.now() - timestamp);
      if (remainingTime > 0) {
        return Math.ceil(remainingTime / 1000); // 返回剩余秒数
      } else {
        localStorage.removeItem(LOCKOUT_KEY);
      }
    }
    return 0;
  };

  // 创建登录界面
  const overlay = document.createElement('div');
  overlay.id = 'gatekeeper-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255,255,255,0.98);
    z-index: 2147483647;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: system-ui, -apple-system, sans-serif;
  `;

  overlay.innerHTML = `
    <div style="text-align: center; max-width: 500px; padding: 20px;">
      <h2 style="color: #dc3545; margin-bottom: 20px;">访问受限</h2>
      <p style="margin-bottom: 25px;">本页面需要身份验证后才能访问</p>
      <p style="margin-bottom: 25px;">熟人找随心注册登录，不熟的拉群上管理后注册</p>
      
      <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px; max-width: 280px; margin: 0 auto;">
        <div style="position: relative; width: 100%;">
          <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 16px; color: #6c757d; pointer-events: none; width: 20px; text-align: center;">👤</span>
          <input id="gatekeeper-username" type="text" placeholder="用户名" autocomplete="username" style="display: block; padding: 8px 12px 8px 40px; font-size: 14px; line-height: 1.4; width: 100%; height: 36px; box-sizing: border-box; text-align: left; border-radius: 6px; border: 1px solid #ddd; transition: border-color 0.2s; font-family: inherit;">
        </div>
        
        <div style="position: relative; width: 100%;">
          <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 16px; color: #6c757d; pointer-events: none; width: 20px; text-align: center;">🔒</span>
          <input id="gatekeeper-password" type="password" placeholder="密码" autocomplete="current-password" style="display: block; padding: 8px 12px 8px 40px; font-size: 14px; line-height: 1.4; width: 100%; height: 36px; box-sizing: border-box; text-align: left; border-radius: 6px; border: 1px solid #ddd; transition: border-color 0.2s; font-family: inherit;">
        </div>
      </div>
      
      <div style="display: flex; flex-direction: column; gap: 8px; margin: 10px auto 15px; max-width: 280px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" id="gatekeeper-remember" checked style="width: 16px; height: 16px; margin: 0;">
          <label for="gatekeeper-remember" style="font-size: 13px; color: #6c757d; cursor: pointer; user-select: none;">记住用户名</label>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" id="gatekeeper-save-password" style="width: 16px; height: 16px; margin: 0;">
          <label for="gatekeeper-save-password" style="font-size: 13px; color: #6c757d; cursor: pointer; user-select: none;">保存密码</label>
        </div>
      </div>
      
      <button id="gatekeeper-submit" style="margin-top: 5px; padding: 8px 20px; height: 36px; background: #dc3545; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; transition: background 0.2s; width: 100%; max-width: 280px; font-family: inherit;">登录</button>
      
      <p id="gatekeeper-message" style="color: #dc3545; margin-top: 15px; min-height: 20px; font-size: 13px;"></p>
      <p id="gatekeeper-timer" style="color: #6c757d; margin-top: 10px; font-size: 13px;"></p>
    </div>
  `;
  
  // 添加到DOM
  document.documentElement.appendChild(overlay);
  document.body.style.display = 'none';

  // 获取DOM元素
  const usernameInput = document.getElementById('gatekeeper-username');
  const passwordInput = document.getElementById('gatekeeper-password');
  const rememberCheckbox = document.getElementById('gatekeeper-remember');
  const savePasswordCheckbox = document.getElementById('gatekeeper-save-password');
  const submitButton = document.getElementById('gatekeeper-submit');
  const messageEl = document.getElementById('gatekeeper-message');
  const timerEl = document.getElementById('gatekeeper-timer');
  
  // 更新锁定状态显示
  const updateLockStatus = () => {
    const remainingSeconds = checkLockout();
    if (remainingSeconds > 0) {
      submitButton.disabled = true;
      submitButton.style.background = '#6c757d';
      timerEl.textContent = `请等待 ${remainingSeconds} 秒后重试`;
      setTimeout(updateLockStatus, 1000);
    } else {
      submitButton.disabled = false;
      submitButton.style.background = '#dc3545';
      timerEl.textContent = '';
    }
  };

  // 初始化检查锁定状态
  updateLockStatus();

  // 验证逻辑
  const verifyAccess = () => {
    // 检查是否处于锁定状态
    const remainingSeconds = checkLockout();
    if (remainingSeconds > 0) {
      updateLockStatus();
      return;
    }

    // 防止重复点击
    submitButton.disabled = true;
    submitButton.textContent = '验证中...';

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    // 获取当前尝试次数
    let attempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0');
    
    // 立即验证（不再延迟后验证）
    const isValid = VALID_CREDENTIALS.some(cred => 
      cred.username === username && cred.password === password
    );
    
    if(isValid) {
      // 登录成功，重置计数器
      localStorage.removeItem(ATTEMPTS_KEY);
      localStorage.removeItem(LOCKOUT_KEY);
      
      document.body.style.display = '';
      overlay.remove();
      sessionStorage.setItem(SESSION_KEY, Date.now());
      
      if (rememberCheckbox.checked) {
        localStorage.setItem(CREDS_KEY, encrypt(username));
      } else {
        localStorage.removeItem(CREDS_KEY);
      }
      
      if (savePasswordCheckbox.checked) {
        localStorage.setItem(PASSWORD_KEY, encrypt(password));
      } else {
        localStorage.removeItem(PASSWORD_KEY);
      }
    } else {
      // 登录失败，增加尝试次数并锁定
      attempts++;
      localStorage.setItem(ATTEMPTS_KEY, attempts.toString());
      
      // 计算指数递增的延迟时间
      const delay = Math.min(BASE_DELAY * Math.pow(2, attempts - 1), MAX_DELAY);
      localStorage.setItem(LOCKOUT_KEY, JSON.stringify({
        timestamp: Date.now(),
        delay: delay
      }));
      
      // 更新UI状态
      updateLockStatus();
      messageEl.textContent = `用户名或密码错误 (${attempts}/${MAX_ATTEMPTS})`;
      passwordInput.value = '';
    }
    
    // 恢复按钮状态
    submitButton.disabled = remainingSeconds > 0;
    submitButton.textContent = '登录';
  };

  // 事件绑定
  submitButton.addEventListener('click', verifyAccess);
  
  // 回车键支持
  passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') verifyAccess();
  });

  // 自动填充记住的用户名和密码
  const savedCreds = localStorage.getItem(CREDS_KEY);
  const savedPassword = localStorage.getItem(PASSWORD_KEY);
  
  if (savedCreds) {
    usernameInput.value = decrypt(savedCreds);
    rememberCheckbox.checked = true;
    
    if (savedPassword) {
      passwordInput.value = decrypt(savedPassword);
      savePasswordCheckbox.checked = true;
    }
  }
};

// 初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGatekeeper);
} else {
  initGatekeeper();
}