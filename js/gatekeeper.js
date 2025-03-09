// gatekeeper.js 修复版
const initGatekeeper = () => {
    // 确保body元素存在
    const safeGetBody = () => {
        let el = document.body;
        if (!el) {
            el = document.createElement('body');
            document.documentElement.appendChild(el);
        }
        return el;
    };

    // 创建维护遮罩
    const overlay = document.createElement('div');
    overlay.id = '__gatekeeper';
    overlay.innerHTML = `
        <h2 style="color:#dc3545;">🔧 网页停用中 🔧</h2>
		<p>由于有人拿着该网页到处发甚至直接发给雷</p>
		<p>导致网址已暴露给雷和骗子</p>
		<p>雷和骗子知道以后立刻换号继续骗</p>
		<p>更换以后的网址私聊随心，不熟就不用费劲问了</p>
        <p>全面开放时间暂定</p>
    `;
    overlay.style = `
        position:fixed; top:0; left:0; width:100%; height:100%;
        background:#fff; z-index:2147483647; /* 最大层级 */
        display:flex; flex-direction:column; align-items:center; justify-content:center;
        cursor:pointer;
    `;

    // 隐藏原始内容
    const originalBodyDisplay = safeGetBody().style.display;
    safeGetBody().style.display = 'none';

    // 点击计数器
    let counter = 0;
    overlay.onclick = () => {
        if (++counter >= 20) {
            // 显示原始内容
            safeGetBody().style.display = originalBodyDisplay;
            overlay.remove();
            
            // 30分钟后自动恢复
            setTimeout(() => {
                safeGetBody().style.display = 'none';
                document.documentElement.appendChild(overlay);
                counter = 0;
            }, 1800000);
        }
    }

    // 挂载元素
    document.documentElement.appendChild(overlay);
}

// 确保在DOM就绪后执行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGatekeeper);
} else {
    initGatekeeper();
}