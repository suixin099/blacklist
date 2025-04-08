const initGatekeeper = () => {
    const safeGetBody = () => {
        let el = document.body;
        if (!el) {
            el = document.createElement('body');
            document.documentElement.appendChild(el);
        }
        return el;
    };

    // 创建验证遮罩
    const overlay = document.createElement('div');
    overlay.id = '__gatekeeper';
    overlay.innerHTML = `
        <div style="text-align:center; max-width:500px; padding:20px;">
            <h2 style="color:#dc3545;">🔒 访问受限 🔒</h2>
            <p>本页面需要随心授权验证后才能访问</p>
			<p>熟人直接找我要，不熟的拉群给管理以后发你</p>
            <input type="password" id="gatekeeper-code" 
                   style="padding:10px; font-size:16px; width:200px; text-align:center;"
                   placeholder="请输入访问密码" autocomplete="off">
            

            <button id="gatekeeper-submit" 
                    style="margin-top:15px; padding:10px 20px; background:#dc3545; color:white; border:none; border-radius:4px;">
                验证
            </button>
            <p id="gatekeeper-message" style="color:#dc3545; margin-top:10px; height:20px;"></p>
            <p id="gatekeeper-timer" style="color:#6c757d; margin-top:5px; font-size:12px;"></p>
        </div>
    `;
    
    overlay.style = `
        position:fixed; top:0; left:0; width:100%; height:100%;
        background:rgba(255,255,255,0.95); z-index:2147483647;
        display:flex; flex-direction:column; align-items:center; justify-content:center;
        font-family:Arial, sans-serif;
    `;

    // 隐藏原始内容
    const originalBodyDisplay = safeGetBody().style.display;
    safeGetBody().style.display = 'none';

    // 持久化存储配置
    const STORAGE_KEY = 'gatekeeper-lock';
    const SESSION_KEY = 'gatekeeper-auth';
    const BASE_DELAY = 2000;
    const MAX_DELAY = 60000;

    // 初始化锁定状态
    let lockState = JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {
        failedAttempts: 0,
        lockStart: null
    };

    // 计算延迟时间（带持久化）
    const getCurrentDelay = () => {
        const delay = Math.min(BASE_DELAY * Math.pow(2, lockState.failedAttempts), MAX_DELAY);
        return delay - (Date.now() - (lockState.lockStart || Date.now()));
    };

    // 显示倒计时
    const showCountdown = (seconds) => {
        const timerEl = document.getElementById('gatekeeper-timer');
        if (seconds > 0) {
            timerEl.textContent = `请等待 ${seconds} 秒后重试`;
            setTimeout(() => showCountdown(seconds - 1), 1000);
        } else {
            timerEl.textContent = '';
        }
    };

    // 锁定输入（带状态保存）
    const lockInput = (duration) => {
        const input = document.getElementById('gatekeeper-code');
        const button = document.getElementById('gatekeeper-submit');
        
        // 更新锁定状态
        lockState.lockStart = Date.now();
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(lockState));
        
        input.disabled = true;
        button.disabled = true;
        overlay.style.pointerEvents = 'none';
        
        showCountdown(Math.ceil(duration / 1000));
        
        setTimeout(() => {
            input.disabled = false;
            button.disabled = false;
            overlay.style.pointerEvents = 'auto';
            input.focus();
            // 清除锁定状态
            sessionStorage.removeItem(STORAGE_KEY);
        }, duration);
    };

    // 验证函数
    const verifyAccess = () => {
        const now = new Date();
        const dynamicCode = 
            String(now.getMonth() + 1).padStart(2, '0') +
            String(now.getDate()).padStart(2, '0') +
            String(now.getHours()).padStart(2, '0') +
            String(now.getMinutes()).padStart(2, '0');
            
        const userInput = document.getElementById('gatekeeper-code').value.trim();
        const messageEl = document.getElementById('gatekeeper-message');
        
        if(userInput === dynamicCode) {
            // 验证成功
            lockState = { failedAttempts: 0, lockStart: null };
            sessionStorage.removeItem(STORAGE_KEY);
            safeGetBody().style.display = originalBodyDisplay;
            overlay.remove();
            
            // 设置会话
            sessionStorage.setItem(SESSION_KEY, Date.now());
            setTimeout(() => {
                sessionStorage.removeItem(SESSION_KEY);
                if(confirm("会话已过期，需要重新验证吗？")) location.reload();
            }, 15 * 60 * 1000);
        } else {
            // 更新失败次数
            lockState.failedAttempts++;
            const delay = getCurrentDelay();
            
            messageEl.textContent = "验证失败";
            document.getElementById('gatekeeper-code').value = '';
            lockInput(Math.max(delay, 1000)); // 保证最小1秒延迟
        }
    };

    // 检查会话
    const checkExistingSession = () => {
        const lastAuth = sessionStorage.getItem(SESSION_KEY);
        if (lastAuth && (Date.now() - parseInt(lastAuth)) < 15 * 60 * 1000) {
            safeGetBody().style.display = originalBodyDisplay;
            if (overlay.parentNode) overlay.remove();
            return true;
        }
        return false;
    };

    // 主流程
    if (!checkExistingSession()) {
        // 检查现有锁定
        if (lockState.lockStart) {
            const remaining = getCurrentDelay();
            if (remaining > 0) {
                document.documentElement.appendChild(overlay);
                lockInput(remaining);
            } else {
                sessionStorage.removeItem(STORAGE_KEY);
            }
        }

        document.documentElement.appendChild(overlay);
        
        const submitButton = document.getElementById('gatekeeper-submit');
        const codeInput = document.getElementById('gatekeeper-code');
        
        submitButton.onclick = verifyAccess;
        codeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') verifyAccess();
        });
        
        codeInput.focus();
    } else {
        if (overlay.parentNode) overlay.remove();
    }
};

// 初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGatekeeper);
} else {
    initGatekeeper();
}