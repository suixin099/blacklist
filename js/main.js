// 在原有JavaScript中添加
        function closeDisclaimer() {
            document.getElementById('disclaimerModal').classList.remove('show');
        }

        // 页面加载时自动显示免责声明
        //window.onload = function() {
        //    document.getElementById('disclaimerModal').classList.add('show');
        //}
		
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
            if (foundLines.length > 0) {
                let resultHTML = '<p style="color: red;">查询到以下黑名单记录：</p><ol>';
                foundLines.forEach((line, index) => {
                    resultHTML += `<li>${line}</li>`;
                });
                resultHTML += '</ol>';
                resultElement.innerHTML = resultHTML;
            } else {
                resultElement.innerHTML = '<p style="color: green;">未查询到相关黑名单记录。</p>';
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