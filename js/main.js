function closeDisclaimer() {
    document.getElementById('disclaimerModal').classList.remove('show');
}

// 常量定义
const MODAL_SHOW_DURATION = 1400;
const INPUT_NUMBER_MIN_COUNT = 5;
const INPUT_CHINESE_MIN_COUNT = 2;

// 缓存 DOM 元素
const queryInput = document.getElementById('queryInput');
const resultElement = document.getElementById('result');
const modal = document.getElementById('myModal');
const modalMessage = document.getElementById('modalMessage');
const closeBtn = document.querySelector('.close');

document.addEventListener('DOMContentLoaded', function () {
    const lineCount = blacklistText.split('\n').length - 4;
    queryInput.placeholder = `现收录黑名单 ${lineCount} 条`;
});

function showModal(message) {
    modalMessage.textContent = message;
    modal.classList.add('show');

    closeBtn.onclick = function () {
        modal.classList.remove('show');
    };

    window.onclick = function (event) {
        if (event.target === modal) {
            modal.classList.remove('show');
        }
    };

    setTimeout(() => {
        modal.classList.remove('show');
    }, MODAL_SHOW_DURATION);
}

function validateInput(query) {
    if (query === '') {
        showModal('请输入要查询的内容');
        return false;
    }

    const numbers = query.match(/\d/g);
    const numberCount = numbers ? numbers.length : 0;

    const chineseCharacters = query.match(/[\u4e00-\u9fa5]/g);
    const chineseCount = chineseCharacters ? chineseCharacters.length : 0;

    if (numberCount < INPUT_NUMBER_MIN_COUNT && chineseCount < INPUT_CHINESE_MIN_COUNT) {
        showModal('输入内容需包含 5 个以上数字或者 2 个以上汉字');
        return false;
    }

    return true;
}

function displayResults(foundLines) {
    // 清空结果区域
    resultElement.innerHTML = '';
    
    if (foundLines.length > 0) {
        // 创建结果容器
        const container = document.createElement('div');
        container.style.margin = '15px 0';
        
        // 添加结果标题 - 更醒目的样式
        const title = document.createElement('p');
        title.style.color = '#ff4d4f';
        title.style.fontSize = '16px';
        title.style.fontWeight = '600';
        title.style.marginBottom = '10px';
        title.textContent = `查询到 ${foundLines.length} 条黑名单记录:`;
        container.appendChild(title);
        
        // 创建带滚动条的列表容器 - 去掉边框，添加阴影效果
        const scrollContainer = document.createElement('div');
        scrollContainer.style.maxHeight = '500px';
        scrollContainer.style.overflowY = 'auto';
        scrollContainer.style.padding = '0 5px';
        scrollContainer.style.borderRadius = '4px';
        scrollContainer.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        
        // 创建有序列表
        const resultList = document.createElement('ol');
        resultList.style.margin = '0';
        resultList.style.paddingLeft = '25px';
        
        // 添加列表项（最多200条） - 更优雅的列表样式
        const displayCount = Math.min(foundLines.length, 200);
        for (let i = 0; i < displayCount; i++) {
            const listItem = document.createElement('li');
            listItem.textContent = foundLines[i];
            listItem.style.margin = '8px 0';
            listItem.style.padding = '6px 10px';
            listItem.style.borderRadius = '3px';
            listItem.style.transition = 'background-color 0.3s';
            
            // 斑马条纹效果
            listItem.style.backgroundColor = i % 2 === 0 ? 'rgba(0, 0, 0, 0.02)' : 'transparent';
            
            // 鼠标悬停效果
            listItem.onmouseenter = () => {
                listItem.style.backgroundColor = 'rgba(255, 77, 79, 0.08)';
            };
            listItem.onmouseleave = () => {
                listItem.style.backgroundColor = i % 2 === 0 ? 'rgba(0, 0, 0, 0.02)' : 'transparent';
            };
            
            resultList.appendChild(listItem);
        }
        
        scrollContainer.appendChild(resultList);
        container.appendChild(scrollContainer);
        
        // 如果结果超过200条，添加提示 - 更精致的提示样式
        if (foundLines.length > 200) {
            const tip = document.createElement('p');
            tip.style.color = '#faad14';
            tip.style.fontSize = '14px';
            tip.style.marginTop = '10px';
            tip.style.padding = '8px 12px';
            tip.style.backgroundColor = 'rgba(250, 173, 20, 0.1)';
            tip.style.borderRadius = '4px';
            tip.textContent = `提示：已显示前200条记录，共找到${foundLines.length}条`;
            container.appendChild(tip);
        }
        
        resultElement.appendChild(container);
    } else {
        // 无结果时的优雅显示
        const noResult = document.createElement('div');
        noResult.style.color = '#52c41a';
        noResult.style.padding = '20px';
        noResult.style.textAlign = 'center';
        noResult.style.fontSize = '16px';
        noResult.innerHTML = `
            <span style="font-size: 24px;">✓</span>
            <p style="margin: 10px 0 0;">未查询到相关黑名单记录</p>
        `;
        resultElement.appendChild(noResult);
    }
}

function checkBlacklist() {
    const query = queryInput.value.trim();
    if (!validateInput(query)) {
        return;
    }

    const blacklistLines = blacklistText.split('\n');
    const foundLines = [];

    for (let i = 0; i < blacklistLines.length; i++) {
        const line = blacklistLines[i].trim();
        if (line.includes(query)) {
            foundLines.push(line);
        }
    }

    displayResults(foundLines);
}

function clearInput() {
    queryInput.value = '';
}