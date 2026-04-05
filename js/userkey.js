const initGatekeeper = () => {
  const CRYPTO_KEY = atob("Mw==");
  
  const encrypt = (str) => btoa(str);
  const decrypt = (encodedStr) => atob(encodedStr);

  const encryptedCredentials = [
    //{ data: "c2hlbnJ1fHRvdWxhb2Jhbg==" }, //共用
    { data: "Mzc4MTM4OTY1fGFpbmkxMzE0" }, //*|*
    { data: "bGNjMjAyMXwyNzE5ODk=" }, //2465932040 木子
    { data: "YW41MjB8YW41MjA=" }, //硬酱
    { data: "cWF6d3N4fDEyMzQ1Njc4OTA=" }, //清澄
	{ data: "MTM0NjQ0Mjc2fGx4bHgxMjM0" }, //2410913226 优
	{ data: "MzA2NTUyMTF8MTU5MzU3MjgwcQ==" }, //3046552117 知音
	{ data: "NDQ0ODI2NzA5fDQ0NDgyNjcwOQ==" }, //444826709 逍遥
	{ data: "encwMzI5fHp3NDIwMzI2Li4=" }, //13692002 辰雪
	{ data: "MzM4Mzc1MDQ2OHxxaW4zMzgzNzUwNDY4" }, //3383750468 Nova
	{ data: "MTAxMTQ4NzIyNHwxMDExNDg3MjI0QA==" }, //1011487224 菲菲
	{ data: "dGlhbnphaXxsc202MjU4MDku" }, //1185819098 9
	{ data: "emhpc2hpMTIzfHpoaXNoaTEyMw==" }, //2733832616 芝士
	{ data: "bnVhbnNoZW5nOHw5ODA5MDM=" }, //2464993531 暖笙
	{ data: "MTMyMDA4OTU1MHxubjEyMzQ1Ng==" }, //1320089550 小乖店
	{ data: "MTMyMDA4OTU1MHxubjEyMzQ1Ng==" }, //2430799104 艾
	{ data: "cWF6MzM1fHFxMTIzNDU2" }, //3676171200 伽澜
	{ data: "aGVpaGVpODg4fGExMjM0NTY=" }, //1095824511 黑黑
	{ data: "ZHVvZHVvfDM3MzgzOWFi" }, //3440932924 囡的小迷妹
	{ data: "bGxsMTIzMTIzfGxsbDEyMzEyMw==" }, //479605794 上瘾
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
  const LOGIN_TRANSITION_DURATION = 1800;

  // 检查锁定状态
  const checkLockout = () => {
    const lockoutData = localStorage.getItem(LOCKOUT_KEY);
    if (lockoutData) {
      const { timestamp, delay } = JSON.parse(lockoutData);
      const remainingTime = delay - (Date.now() - timestamp);
      if (remainingTime > 0) {
        return Math.ceil(remainingTime / 1000);
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
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    z-index: 2147483647;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    overflow-y: auto;
    padding: 20px 15px;
    box-sizing: border-box;
    @media (max-height: 500px) and (orientation: landscape) {
      padding: 10px 15px;
      justify-content: flex-start;
      padding-top: 20px;
    }
    /* 淡出过渡 */
    transition: opacity 0.5s ease, transform 0.5s ease;
  `;

  overlay.innerHTML = `
    <div style="
      text-align: center;
      width: clamp(300px, 90vw, 420px);
      max-height: 90vh;
      overflow-y: auto;
      padding: clamp(20px, 5vw, 40px) clamp(15px, 3vw, 30px);
      background: #ffffff;
      border-radius: clamp(12px, 3vw, 20px);
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);
      position: relative;
      box-sizing: border-box;
      @media (max-height: 500px) and (orientation: landscape) {
        max-height: 85vh;
        padding: clamp(15px, 3vw, 25px) clamp(15px, 3vw, 30px);
      }
      /*登录成功后卡片缩放过渡 */
      transition: all 0.5s ease;
    " id="login-card">
      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 6px; background: linear-gradient(90deg, #e53e3e 0%, #ed8936 100%);"></div>
      
      <div style="
        width: clamp(50px, 12vw, 80px);
        height: clamp(50px, 12vw, 80px);
        background: linear-gradient(135deg, #fef7fb 0%, #fdf2f8 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto clamp(15px, 4vw, 25px);
        border: 2px solid #f0e6ea;
        @media (max-height: 500px) and (orientation: landscape) {
          width: clamp(40px, 10vw, 60px);
          height: clamp(40px, 10vw, 60px);
          margin: 0 auto clamp(10px, 3vw, 15px);
        }
      ">
        <span style="font-size: clamp(20px, 7vw, 36px);">🔐</span>
      </div>
      
      <h2 style="
        color: #2d3748;
        margin-bottom: 12px;
        font-size: clamp(16px, 4.5vw, 24px);
        font-weight: 700;
        letter-spacing: -0.5px;
        @media (max-height: 500px) and (orientation: landscape) {
          margin-bottom: 8px;
          font-size: clamp(15px, 4vw, 20px);
        }
      ">访问受限</h2>
      <p style="
        margin-bottom: 8px;
        color: #4a5568;
        font-size: clamp(12px, 2.8vw, 15px);
        line-height: 1.5;
        @media (max-height: 500px) and (orientation: landscape) {
          margin-bottom: 4px;
        }
      ">本页面需要身份验证后才能访问</p>
      <p style="
        margin-bottom: 8px;
        color: #e53e3e;
        font-size: clamp(11px, 2.5vw, 14px);
        font-weight: 500;
        line-height: 1.5;
        @media (max-height: 500px) and (orientation: landscape) {
          margin-bottom: 4px;
        }
      ">为众人抱薪者，不可使其冻毙于风雪</p>
      <div style="margin-bottom: clamp(10px, 3vw, 20px);">
        <p id="register-tip" style="
          margin: 0;
          color: #718096;
          font-size: clamp(11px, 2.5vw, 14px);
          line-height: 1.5;
          transition: all 0.3s ease;
        ">限时开放注册，联系：随心</p>
      </div>
      
      <div style="
        width: 85%;
        margin: 0 auto clamp(15px, 4vw, 30px);
        padding: clamp(10px, 2.5vw, 18px);
        background: linear-gradient(135deg, #fef7fb 0%, #fdf2f8 100%);
        border: 1px solid #f0e6ea;
        border-radius: clamp(8px, 2vw, 12px);
        box-shadow: 0 4px 12px rgba(229, 62, 62, 0.06);
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        @media (max-height: 500px) and (orientation: landscape) {
          margin: 0 auto clamp(10px, 3vw, 15px);
          padding: clamp(8px, 2vw, 12px);
        }
      ">
        <div style="
          display: inline-block;
          background: #e53e3e;
          color: white;
          padding: clamp(3px, 1vw, 6px) clamp(10px, 2.5vw, 16px);
          border-radius: 20px;
          font-size: clamp(11px, 2.5vw, 14px);
          font-weight: 600;
          margin-bottom: 6px;
          box-shadow: 0 2px 6px rgba(229, 62, 62, 0.12);
        ">
          📣 广告位招租
        </div>
        <p style="
          color: #2d3748;
          font-size: clamp(11px, 2.5vw, 15px);
          margin: 0;
          font-weight: 600;
          width: 100%;
          text-align: center;
        ">联系：随心</p>
      </div>
      
      <div style="
        display: flex;
        flex-direction: column;
        gap: clamp(10px, 3vw, 16px);
        margin-bottom: clamp(15px, 4vw, 20px);
        max-width: 320px;
        margin: 0 auto clamp(15px, 4vw, 20px);
        width: 100%;
        @media (max-height: 500px) and (orientation: landscape) {
          gap: clamp(8px, 2vw, 12px);
          margin-bottom: clamp(10px, 3vw, 15px);
        }
      ">
        <div style="position: relative; width: 100%;">
          <span style="
            position: absolute;
            left: 16px;
            top: 50%;
            transform: translateY(-50%);
            font-size: clamp(14px, 3.5vw, 18px);
            color: #a0aec0;
            pointer-events: none;
            width: 24px;
            text-align: center;
          ">👤</span>
          <input id="gatekeeper-username" type="text" placeholder="用户名" autocomplete="username" style="
            display: block; 
            padding: clamp(8px, 2vw, 12px) 16px clamp(8px, 2vw, 12px) 56px; 
            font-size: clamp(12px, 2.8vw, 15px); 
            line-height: 1.4; 
            width: 100%; 
            height: clamp(36px, 8vw, 48px); 
            box-sizing: border-box; 
            text-align: left; 
            border-radius: clamp(8px, 2vw, 12px); 
            border: 1px solid #e2e8f0; 
            transition: all 0.2s ease; 
            font-family: inherit;
            background: #f7fafc;
            @media (max-height: 500px) and (orientation: landscape) {
              height: clamp(32px, 7vw, 40px);
              padding: clamp(6px, 1.5vw, 10px) 16px clamp(6px, 1.5vw, 10px) 56px;
            }
          ">
        </div>
        
        <div style="position: relative; width: 100%;">
          <span style="
            position: absolute;
            left: 16px;
            top: 50%;
            transform: translateY(-50%);
            font-size: clamp(14px, 3.5vw, 18px);
            color: #a0aec0;
            pointer-events: none;
            width: 24px;
            text-align: center;
          ">🔒</span>
          <input id="gatekeeper-password" type="password" placeholder="密码" autocomplete="current-password" style="
            display: block; 
            padding: clamp(8px, 2vw, 12px) 16px clamp(8px, 2vw, 12px) 56px; 
            font-size: clamp(12px, 2.8vw, 15px); 
            line-height: 1.4; 
            width: 100%; 
            height: clamp(36px, 8vw, 48px); 
            box-sizing: border-box; 
            text-align: left; 
            border-radius: clamp(8px, 2vw, 12px); 
            border: 1px solid #e2e8f0; 
            transition: all 0.2s ease; 
            font-family: inherit;
            background: #f7fafc;
            @media (max-height: 500px) and (orientation: landscape) {
              height: clamp(32px, 7vw, 40px);
              padding: clamp(6px, 1.5vw, 10px) 16px clamp(6px, 1.5vw, 10px) 56px;
            }
          ">
        </div>
      </div>
      
      <div style="
        display: flex;
        align-items: flex-start;
        justify-content: flex-start;
        gap: clamp(10px, 2.5vw, 15px);
        margin: clamp(5px, 2vw, 10px) auto clamp(15px, 4vw, 25px);
        max-width: 320px;
        width: 100%;
        flex-wrap: wrap;
        @media (max-height: 500px) and (orientation: landscape) {
          margin: clamp(5px, 1.5vw, 8px) auto clamp(10px, 3vw, 15px);
          gap: clamp(8px, 2vw, 12px);
        }
      ">
        <div style="
          display: flex;
          flex-direction: column;
          gap: clamp(8px, 2vw, 12px);
          flex: 1;
          min-width: 180px;
        ">
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" id="gatekeeper-remember" checked style="
              width: clamp(14px, 3.5vw, 18px); 
              height: clamp(14px, 3.5vw, 18px); 
              margin: 0; 
              accent-color: #1677ff; 
              cursor: pointer;
            ">
            <label for="gatekeeper-remember" style="
              font-size: clamp(11px, 2.5vw, 14px); 
              color: #4a5568; 
              cursor: pointer; 
              user-select: none;
            ">记住用户名</label>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" id="gatekeeper-save-password" style="
              width: clamp(14px, 3.5vw, 18px); 
              height: clamp(14px, 3.5vw, 18px); 
              margin: 0; 
              accent-color: #1677ff; 
              cursor: pointer;
            ">
            <label for="gatekeeper-save-password" style="
              font-size: clamp(11px, 2.5vw, 14px); 
              color: #4a5568; 
              cursor: pointer; 
              user-select: none;
            ">保存密码</label>
          </div>
        </div>
        <label id="register-label" style="
          display: inline-block;
          color: #1677ff;
          font-size: clamp(12px, 2.8vw, 15px);
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
          transition: all 0.2s ease;
          white-space: nowrap;
          flex-shrink: 0;
          margin-top: 2px;
          @media (max-width: 360px) {
            margin-top: 8px;
            flex-basis: 100%;
            text-align: left;
          }
          @media (max-height: 500px) and (orientation: landscape) {
            font-size: clamp(11px, 2.5vw, 14px);
          }
        ">注册账号</label>
      </div>
      
      <button id="gatekeeper-submit" style="
        margin-top: 5px; 
        padding: clamp(8px, 2vw, 12px) 24px; 
        height: clamp(38px, 8vw, 50px); 
        background: linear-gradient(135deg, #1677ff 0%, #4096ff 100%);
        color: white; 
        border: none; 
        border-radius: clamp(8px, 2vw, 12px); 
        font-size: clamp(13px, 2.8vw, 16px); 
        font-weight: 600; 
        cursor: pointer; 
        transition: all 0.2s ease; 
        width: 100%; 
        max-width: 320px; 
        font-family: inherit;
        box-shadow: 0 4px 12px rgba(22, 119, 255, 0.2);
        @media (max-height: 500px) and (orientation: landscape) {
          height: clamp(34px, 7vw, 42px);
          padding: clamp(6px, 1.5vw, 10px) 24px;
          font-size: clamp(12px, 2.5vw, 14px);
        }
      ">登录</button>
      
      <p id="gatekeeper-message" style="
        color: #e53e3e; 
        margin-top: clamp(12px, 3vw, 18px); 
        min-height: 20px; 
        font-size: clamp(11px, 2.5vw, 14px);
        @media (max-height: 500px) and (orientation: landscape) {
          margin-top: clamp(8px, 2vw, 12px);
        }
      "></p>
      <p id="gatekeeper-timer" style="
        color: #718096; 
        margin-top: 8px; 
        font-size: clamp(11px, 2.5vw, 14px);
        @media (max-height: 500px) and (orientation: landscape) {
          margin-top: 4px;
        }
      "></p>

      <!-- 新增：登录成功后的加载动画容器（默认隐藏） -->
      <div id="login-success-loader" style="
        margin-top: clamp(15px, 4vw, 20px);
        display: none;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
      ">
        <!-- 加载动画 -->
        <div style="
          width: clamp(30px, 8vw, 40px);
          height: clamp(30px, 8vw, 40px);
          border: 3px solid #e2e8f0;
          border-top-color: #1677ff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        "></div>
        <p style="
          color: #4a5568;
          font-size: clamp(12px, 2.8vw, 15px);
          margin: 0;
        " id="login-success-text">正在验证身份...</p>
      </div>
      <style>
        /* 新增：加载动画关键帧 */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </div>
  `;
  
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
  const registerLabel = document.getElementById('register-label');
  const registerTip = document.getElementById('register-tip');
  // 新增：获取登录卡片和加载动画元素
  const loginCard = document.getElementById('login-card');
  const loginSuccessLoader = document.getElementById('login-success-loader');
  const loginSuccessText = document.getElementById('login-success-text');
  
  // 输入框焦点
  usernameInput.addEventListener('focus', () => {
    usernameInput.style.borderColor = '#1677ff';
    usernameInput.style.background = '#ffffff';
    usernameInput.style.boxShadow = '0 0 0 3px rgba(22, 119, 255, 0.1)';
  });
  usernameInput.addEventListener('blur', () => {
    usernameInput.style.borderColor = '#e2e8f0';
    usernameInput.style.background = '#f7fafc';
    usernameInput.style.boxShadow = 'none';
  });
  
  passwordInput.addEventListener('focus', () => {
    passwordInput.style.borderColor = '#1677ff';
    passwordInput.style.background = '#ffffff';
    passwordInput.style.boxShadow = '0 0 0 3px rgba(22, 119, 255, 0.1)';
  });
  passwordInput.addEventListener('blur', () => {
    passwordInput.style.borderColor = '#e2e8f0';
    passwordInput.style.background = '#f7fafc';
    passwordInput.style.boxShadow = 'none';
  });
  
  // 按钮效果
  submitButton.addEventListener('mouseenter', () => {
    if (!submitButton.disabled) {
      submitButton.style.transform = 'translateY(-2px)';
      submitButton.style.boxShadow = '0 6px 16px rgba(22, 119, 255, 0.25)';
    }
  });
  submitButton.addEventListener('mouseleave', () => {
    if (!submitButton.disabled) {
      submitButton.style.transform = 'translateY(0)';
      submitButton.style.boxShadow = '0 4px 12px rgba(22, 119, 255, 0.2)';
    }
  });
  submitButton.addEventListener('touchstart', () => {
    if (!submitButton.disabled) {
      submitButton.style.transform = 'translateY(-2px)';
      submitButton.style.boxShadow = '0 6px 16px rgba(22, 119, 255, 0.25)';
    }
  });
  submitButton.addEventListener('touchend', () => {
    if (!submitButton.disabled) {
      submitButton.style.transform = 'translateY(0)';
      submitButton.style.boxShadow = '0 4px 12px rgba(22, 119, 255, 0.2)';
    }
  });

  // 注册标签效果
	registerLabel.addEventListener('mouseenter', () => {
	  registerLabel.style.color = '#4096ff';
	  registerLabel.style.transform = 'scale(1.05)';
	});  
	registerLabel.addEventListener('mouseleave', () => {
	  registerLabel.style.color = '#1677ff';
	  registerLabel.style.transform = 'scale(1)';
	});  
	registerLabel.addEventListener('click', () => {
	  registerTip.style.color = '#ff0000';
	  registerTip.style.fontWeight = '600';
	  registerTip.innerHTML = "限时开放注册，联系：随心<br>直接发要注册的账号密码给随心";
	  let currentScale = parseFloat(registerTip.style.transform.replace('scale(', '')) || 1;
	  //每次点击增大 0.1 倍
	  const newScale = currentScale + 0.1; 
	  registerTip.style.transform = `scale(${newScale})`;
	});

  // 锁定状态
  const updateLockStatus = () => {
    const remainingSeconds = checkLockout();
    if (remainingSeconds > 0) {
      submitButton.disabled = true;
      submitButton.style.background = '#a0aec0';
      submitButton.style.boxShadow = 'none';
      submitButton.style.transform = 'none';
      timerEl.textContent = `请等待 ${remainingSeconds} 秒后重试`;
      setTimeout(updateLockStatus, 1000);
    } else {
      submitButton.disabled = false;
      submitButton.style.background = 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)';
      submitButton.style.boxShadow = '0 4px 12px rgba(22, 119, 255, 0.2)';
      timerEl.textContent = '';
    }
  };
  updateLockStatus();

  // 登录验证
  const verifyAccess = () => {
    const remainingSeconds = checkLockout();
    if (remainingSeconds > 0) {
      updateLockStatus();
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = '验证中...';
    submitButton.style.transform = 'none';
    submitButton.style.boxShadow = 'none';

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    let attempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0');
    
    const isValid = VALID_CREDENTIALS.some(cred => 
      cred.username === username && cred.password === password
    );
    
    if(isValid) {
      localStorage.removeItem(ATTEMPTS_KEY);
      localStorage.removeItem(LOCKOUT_KEY);
      
      // ========== 登录成功后的过渡动画 ==========
      // 1. 隐藏登录表单相关元素，显示加载动画
      usernameInput.style.display = 'none';
      passwordInput.style.display = 'none';
      rememberCheckbox.closest('div').style.display = 'none';
      savePasswordCheckbox.closest('div').style.display = 'none';
      registerLabel.style.display = 'none';
      submitButton.style.display = 'none';
      messageEl.style.display = 'none';
      timerEl.style.display = 'none';
      loginSuccessLoader.style.display = 'flex';

      // 2. 模拟加载进度
      const randomDelay = Math.floor(Math.random() * (2000 - 300 + 1)) + 300;
		setTimeout(() => {
		  loginSuccessText.textContent = '身份验证成功...';
		}, randomDelay);
		  setTimeout(() => {
        loginSuccessText.textContent = '请稍等...';
        // 3. 卡片缩放 遮罩淡出
        loginCard.style.transform = 'scale(0.95)';
        overlay.style.opacity = 0.8;
      }, 1200);

      // 4. 延迟后完成登录（时长对应 LOGIN_TRANSITION_DURATION）
      setTimeout(() => {
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
      }, LOGIN_TRANSITION_DURATION);
      // ==================================================
      
    } else {
      attempts++;
      localStorage.setItem(ATTEMPTS_KEY, attempts.toString());
      const delay = Math.min(BASE_DELAY * Math.pow(2, attempts - 1), MAX_DELAY);
      localStorage.setItem(LOCKOUT_KEY, JSON.stringify({ timestamp: Date.now(), delay }));
      
      updateLockStatus();
      messageEl.textContent = `用户名或密码错误 (${attempts}/${MAX_ATTEMPTS})`;
      passwordInput.value = '';
    }
    
    submitButton.disabled = remainingSeconds > 0;
    submitButton.textContent = '登录';
  };

  submitButton.addEventListener('click', verifyAccess);  
  passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') verifyAccess();
  });

  // 自动填充
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

  window.addEventListener('resize', () => {
    updateLockStatus();
    //overlay.style.display = 'none';
    //setTimeout(() => overlay.style.display = 'flex', 50);
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGatekeeper);
} else {
  initGatekeeper();
};