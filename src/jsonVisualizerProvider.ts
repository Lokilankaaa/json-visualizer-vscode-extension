import * as vscode from 'vscode';

export class JSONVisualizerProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'jsonVisualizerView';
    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        
        webviewView.webview.onDidReceiveMessage(message => {
            switch (message.type) {
                case 'copyToClipboard':
                    vscode.env.clipboard.writeText(message.text);
                    vscode.window.showInformationMessage('已复制到剪贴板');
                    break;
                case 'showInfo':
                    vscode.window.showInformationMessage(message.message);
                    break;
                case 'showError':
                    vscode.window.showErrorMessage(message.message);
                    break;
            }
        });
    }

    public updateJSON(jsonData: any, originalText: string) {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'updateJSON',
                text: originalText
            });
        }
    }

    public clearView() {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'clearView'
            });
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JSON可视化器</title>
    <style>
        :root {
            --bg-color: var(--vscode-editor-background);
            --fg-color: var(--vscode-editor-foreground);
            --border-color: var(--vscode-panel-border);
            --highlight-bg: #ffeb3b; /* 搜索高亮 (亮黄) */
            --current-highlight-bg: #ff9800; /* 当前搜索高亮 (橘色) */
            --key-color: #569CD6;
            --string-color: #CE9178;
            --number-color: #B5CEA8;
            --boolean-color: #569cd6;
            --null-color: #808080;
            --toolbar-bg: var(--vscode-editor-background);
            --input-bg: var(--vscode-input-background);
            --input-fg: var(--vscode-input-foreground);
            --button-bg: var(--vscode-button-background);
            --button-fg: var(--vscode-button-foreground);
            --button-hover: var(--vscode-button-hoverBackground);
        }

        body {
            padding: 0;
            margin: 0;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            background-color: var(--bg-color);
            color: var(--fg-color);
            font-size: 12px;
            height: 100vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        /* 顶部状态栏 */
        .status-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 10px;
            background-color: var(--vscode-editor-lineHighlightBackground);
            border-bottom: 1px solid var(--border-color);
            flex-shrink: 0;
            height: 32px;
            box-sizing: border-box;
        }

        .status-left {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .status-right {
            display: flex;
            align-items: center;
            gap: 8px;
            visibility: hidden; /* 默认隐藏，有数据时显示 */
        }
        .status-right.visible {
            visibility: visible;
        }

        .status-btn {
            background: none;
            border: none;
            color: var(--vscode-textLink-foreground);
            cursor: pointer;
            font-size: 11px;
            padding: 2px 4px;
        }
        .status-btn:hover {
            text-decoration: underline;
        }

        .search-box {
            display: flex;
            align-items: center;
            background-color: var(--input-bg);
            border: 1px solid var(--vscode-input-border);
            border-radius: 2px;
            padding: 0 4px;
        }

        .search-box input {
            background: none;
            border: none;
            color: var(--input-fg);
            width: 100px;
            font-size: 11px;
            outline: none;
            padding: 2px;
        }

        .search-count {
            font-size: 10px;
            color: var(--vscode-descriptionForeground);
            margin: 0 4px;
            min-width: 30px;
            text-align: center;
        }

        .nav-btn {
            background: none;
            border: none;
            color: var(--fg-color);
            cursor: pointer;
            padding: 0 2px;
            font-size: 12px;
        }
        .nav-btn:hover {
            color: var(--vscode-textLink-activeForeground);
        }

        /* 输入面板 */
        .input-panel {
            display: flex;
            flex-direction: column;
            border-bottom: 1px solid var(--border-color);
            flex-shrink: 0;
            max-height: 40vh;
            transition: height 0.2s;
        }

        .input-toolbar {
            display: flex;
            gap: 6px;
            padding: 6px 10px;
            background-color: var(--toolbar-bg);
            flex-wrap: wrap;
        }

        .tool-btn {
            background-color: var(--button-bg);
            color: var(--button-fg);
            border: none;
            padding: 3px 8px;
            font-size: 11px;
            cursor: pointer;
            border-radius: 2px;
        }
        .tool-btn:hover {
            background-color: var(--button-hover);
        }
        .tool-btn.secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        .tool-btn.secondary:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }
        .tool-btn.hidden {
            display: none;
        }

        #jsonInput {
            width: 100%;
            height: 80px;
            background-color: var(--input-bg);
            color: var(--input-fg);
            border: none;
            padding: 8px;
            font-family: inherit;
            font-size: inherit;
            resize: vertical;
            box-sizing: border-box;
            outline: none;
        }
        #jsonInput:focus {
            border: 1px solid var(--vscode-focusBorder);
        }

        .error-msg {
            color: var(--vscode-errorForeground);
            font-size: 11px;
            padding: 4px 10px;
            background-color: rgba(255, 0, 0, 0.1);
            display: none;
        }

        /* 可视化区域 */
        .json-container {
            flex: 1;
            overflow: auto;
            padding: 10px;
            position: relative;
        }

        .json-line {
            display: flex;
            align-items: flex-start;
            line-height: 1.5;
            position: relative;
        }

        .fold-icon {
            width: 16px;
            text-align: center;
            cursor: pointer;
            user-select: none;
            color: var(--vscode-icon-foreground);
            opacity: 0.7;
            flex-shrink: 0;
        }
        .fold-icon:hover {
            opacity: 1;
        }

        .json-key { 
            color: var(--key-color); 
            white-space: nowrap;
        }
        .json-string { color: var(--string-color); }
        .json-number { color: var(--number-color); }
        .json-boolean { color: var(--boolean-color); font-weight: bold; }
        .json-null { color: var(--null-color); font-style: italic; }
        .json-punctuation { color: var(--fg-color); opacity: 0.7; }
        
        .json-value-editable {
            cursor: text;
            border-bottom: 1px dashed transparent;
            white-space: pre-wrap;
            word-break: break-all;
        }
        .json-value-editable:hover {
            border-bottom-color: var(--fg-color);
        }
        .json-value-editing {
            background-color: var(--input-bg);
            color: var(--input-fg);
            border: 1px solid var(--vscode-focusBorder);
            outline: none;
            min-width: 100px;
            width: 100%;
            padding: 0 2px;
            font-family: inherit;
            font-size: inherit;
            resize: vertical;
            overflow: hidden;
            display: block;
        }

        .collapsed-info {
            color: var(--vscode-descriptionForeground);
            font-style: italic;
            margin-left: 4px;
            cursor: pointer;
        }

        .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: var(--vscode-descriptionForeground);
            opacity: 0.7;
        }

        .search-highlight {
            background-color: var(--highlight-bg);
            color: #000 !important;
            border-radius: 2px;
        }
        .search-highlight.current {
            background-color: var(--current-highlight-bg);
            font-weight: bold;
        }
    </style>
</head>
<body>
    <!-- 状态栏 -->
    <div class="status-bar">
        <div class="status-left" id="statusText">就绪</div>
        <div class="status-right" id="statusControls">
            <button class="status-btn" id="btnCollapseAll">全部折叠</button>
            <button class="status-btn" id="btnExpandAll">全部展开</button>
            <div class="search-box">
                <input type="text" id="searchInput" placeholder="搜索...">
                <span class="search-count" id="searchCount">0/0</span>
                <button class="nav-btn" id="btnPrev">▲</button>
                <button class="nav-btn" id="btnNext">▼</button>
            </div>
        </div>
    </div>

    <!-- 输入面板 -->
    <div class="input-panel">
        <div class="input-toolbar">
            <button class="tool-btn" id="btnVisualize">可视化 (Cmd+Enter)</button>
            <button class="tool-btn secondary" id="btnClear">清空</button>
            <button class="tool-btn secondary" id="btnFormat">格式化</button>
            <button class="tool-btn secondary" id="btnCompress">压缩</button>
            <button class="tool-btn secondary" id="btnCopy">复制</button>
            <button class="tool-btn hidden" id="btnSync" style="background-color: #EF476F; color: white;">同步到输入框</button>
        </div>
        <textarea id="jsonInput" placeholder="在此输入或粘贴 JSON..."></textarea>
        <div class="error-msg" id="errorMsg"></div>
    </div>

    <!-- 可视化区域 -->
    <div class="json-container" id="jsonContainer">
        <div class="empty-state">
            <p>请输入 JSON 并点击"可视化"</p>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        // 状态变量
        let globalLines = []; // 行模型
        let currentJson = null; // 当前解析后的JSON对象
        let searchResults = []; // 搜索结果索引
        let currentSearchIndex = -1; // 当前选中的搜索结果
        let isEditing = false; // 是否正在编辑

        // DOM 元素
        const els = {
            statusText: document.getElementById('statusText'),
            statusControls: document.getElementById('statusControls'),
            btnCollapseAll: document.getElementById('btnCollapseAll'),
            btnExpandAll: document.getElementById('btnExpandAll'),
            searchInput: document.getElementById('searchInput'),
            searchCount: document.getElementById('searchCount'),
            btnPrev: document.getElementById('btnPrev'),
            btnNext: document.getElementById('btnNext'),
            btnVisualize: document.getElementById('btnVisualize'),
            btnClear: document.getElementById('btnClear'),
            btnFormat: document.getElementById('btnFormat'),
            btnCompress: document.getElementById('btnCompress'),
            btnCopy: document.getElementById('btnCopy'),
            btnSync: document.getElementById('btnSync'),
            jsonInput: document.getElementById('jsonInput'),
            errorMsg: document.getElementById('errorMsg'),
            jsonContainer: document.getElementById('jsonContainer')
        };

        // 初始化
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.type) {
                case 'updateJSON':
                    els.jsonInput.value = message.text || '';
                    if (message.text) {
                        visualize();
                    }
                    break;
                case 'clearView':
                    clearAll();
                    break;
            }
        });

        // 事件监听
        els.btnVisualize.addEventListener('click', visualize);
        els.btnClear.addEventListener('click', clearAll);
        els.btnFormat.addEventListener('click', formatInput);
        els.btnCompress.addEventListener('click', compressInput);
        els.btnCopy.addEventListener('click', copyInput);
        els.btnSync.addEventListener('click', syncToInput);
        
        els.jsonInput.addEventListener('keydown', e => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                visualize();
            }
        });

        els.btnCollapseAll.addEventListener('click', () => toggleAll(false));
        els.btnExpandAll.addEventListener('click', () => toggleAll(true));
        
        els.searchInput.addEventListener('input', performSearch);
        els.btnPrev.addEventListener('click', () => navigateSearch(-1));
        els.btnNext.addEventListener('click', () => navigateSearch(1));

        // 核心功能：可视化
        function visualize() {
            const text = els.jsonInput.value.trim();
            if (!text) return;

            try {
                currentJson = JSON.parse(text);
                els.errorMsg.style.display = 'none';
                
                // 生成行模型
                globalLines = [];
                buildLines(currentJson, 0, null, globalLines);
                
                // 更新状态栏
                updateStatus(currentJson);
                els.statusControls.classList.add('visible');
                
                // 渲染
                render();
                
                // 隐藏同步按钮（直到有编辑发生）
                els.btnSync.classList.add('hidden');
                
            } catch (e) {
                els.errorMsg.textContent = 'JSON 解析错误: ' + e.message;
                els.errorMsg.style.display = 'block';
            }
        }

        // 构建行模型 (递归)
        function buildLines(obj, level, key, lines, parentObj = null, index = null) {
            const isArray = Array.isArray(obj);
            const isObject = obj !== null && typeof obj === 'object';
            
            const line = {
                id: lines.length,
                level,
                key,
                value: obj,
                isObject,
                isArray,
                expanded: true, // 默认展开
                parentObj: parentObj, // 父对象引用
                parentArr: parentObj && Array.isArray(parentObj) ? parentObj : null, // 如果父是数组
                index: index // 在父数组中的索引
            };
            
            // 如果是数组元素，key 是 null，但我们需要 index 来更新
            if (parentObj && Array.isArray(parentObj)) {
                line.parentArr = parentObj;
                line.index = index;
                line.key = null; // 数组元素没有 key 显示
            } else {
                line.parentObj = parentObj;
                line.key = key;
            }

            lines.push(line);

            if (isObject) {
                if (isArray) {
                    obj.forEach((item, idx) => {
                        buildLines(item, level + 1, null, lines, obj, idx);
                    });
                } else {
                    Object.keys(obj).forEach(k => {
                        buildLines(obj[k], level + 1, k, lines, obj, null);
                    });
                }
                
                // 添加结束标记行（可选，为了更好的视觉效果）
                lines.push({
                    isClosing: true,
                    level,
                    isArray,
                    parentLineId: line.id
                });
            }
        }

        // 渲染逻辑
        function render() {
            els.jsonContainer.innerHTML = '';
            searchResults = []; // 清空搜索结果引用
            
            const searchQuery = els.searchInput.value.toLowerCase();
            let skipUntilLevel = -1;

            for (let i = 0; i < globalLines.length; i++) {
                const line = globalLines[i];
                
                if (skipUntilLevel > -1) {
                    if (line.level > skipUntilLevel) {
                        continue;
                    } else {
                        skipUntilLevel = -1;
                    }
                }
                
                // 如果是结束标记行
                if (line.isClosing) {
                    const parentLine = globalLines[line.parentLineId];
                    if (parentLine && !parentLine.expanded) continue;
                    
                    const div = document.createElement('div');
                    div.className = 'json-line';
                    div.style.paddingLeft = (line.level * 20) + 'px';
                    const brace = document.createElement('span');
                    brace.className = 'json-punctuation';
                    brace.textContent = line.isArray ? ']' : '}';
                    div.appendChild(brace);
                    els.jsonContainer.appendChild(div);
                    continue;
                }

                const div = document.createElement('div');
                div.className = 'json-line';
                div.dataset.index = i;
                div.style.paddingLeft = (line.level * 20) + 'px';

                // 折叠图标
                const icon = document.createElement('span');
                icon.className = 'fold-icon';
                if (line.isObject) {
                    icon.textContent = line.expanded ? '▼' : '▶';
                    icon.onclick = (e) => {
                        e.stopPropagation();
                        toggleFold(i);
                    };
                } else {
                    icon.innerHTML = '&nbsp;';
                }
                div.appendChild(icon);

                // Key
                if (line.key !== null) {
                    const keySpan = document.createElement('span');
                    keySpan.className = 'json-key';
                    
                    if (searchQuery && line.key.toLowerCase().includes(searchQuery)) {
                        keySpan.innerHTML = highlightText(line.key, searchQuery);
                    } else {
                        keySpan.textContent = \`"\${line.key}"\`;
                    }
                    
                    div.appendChild(keySpan);
                    
                    const colon = document.createElement('span');
                    colon.className = 'json-punctuation';
                    colon.textContent = ': ';
                    div.appendChild(colon);
                }

                // Value
                if (line.isObject) {
                    if (line.expanded) {
                        const brace = document.createElement('span');
                        brace.className = 'json-punctuation';
                        brace.textContent = line.isArray ? '[' : '{';
                        div.appendChild(brace);
                    } else {
                        const summary = document.createElement('span');
                        summary.className = 'collapsed-info';
                        const count = Object.keys(line.value).length;
                        summary.textContent = line.isArray ? \`Array[\${count}]\` : \`Object{\${count}}\`;
                        summary.onclick = () => toggleFold(i);
                        div.appendChild(summary);
                    }
                } else {
                    const valSpan = document.createElement('span');
                    valSpan.className = \`json-value-editable \${getTypeClass(line.value)}\`;
                    
                    const valStr = formatValue(line.value);
                    if (searchQuery && valStr.toLowerCase().includes(searchQuery)) {
                        valSpan.innerHTML = highlightText(valStr, searchQuery);
                    } else {
                        valSpan.textContent = valStr;
                    }
                    
                    valSpan.ondblclick = (e) => {
                        e.stopPropagation();
                        startEditing(valSpan, line);
                    };
                    div.appendChild(valSpan);
                }
                
                els.jsonContainer.appendChild(div);
                
                // 收集高亮元素引用
                if (searchQuery) {
                    const highlights = div.querySelectorAll('.search-highlight');
                    highlights.forEach(el => searchResults.push(el));
                }
                
                if (line.isObject && !line.expanded) {
                    skipUntilLevel = line.level;
                }
            }
            
            // 恢复高亮状态
            if (searchQuery && searchResults.length > 0) {
                if (currentSearchIndex >= searchResults.length) {
                    currentSearchIndex = 0;
                }
                if (currentSearchIndex === -1) {
                    currentSearchIndex = 0;
                }
                updateHighlightState();
            } else {
                currentSearchIndex = -1;
            }
            updateSearchCount();
        }

            function highlightText(text, query) {
                const escapedText = text.replace(/&/g, "\u0026amp;").replace(/</g, "\u0026lt;").replace(/>/g, "\u0026gt;");
                const escapedQuery = query.replace(/[.*+?^\${}()|[\]\\]/g, '\\\\$\\u0026');
                const regex = new RegExp(\`(\${escapedQuery})\`, 'gi');
                return escapedText.replace(regex, '<span class="search-highlight">$1</span>');
            }

        // 辅助：获取类型样式类
        function getTypeClass(val) {
            if (val === null) return 'json-null';
            if (typeof val === 'boolean') return 'json-boolean';
            if (typeof val === 'number') return 'json-number';
            return 'json-string';
        }

        // 辅助：格式化值显示
        function formatValue(val) {
            if (val === null) return 'null';
            if (typeof val === 'string') return \`"\${val}"\`;
            return String(val);
        }

        // 折叠/展开
        function toggleFold(index) {
            const line = globalLines[index];
            if (line.isObject) {
                line.expanded = !line.expanded;
                render();
            }
        }

        // 全部折叠/展开
        function toggleAll(expand) {
            globalLines.forEach(line => {
                if (line.isObject) {
                    line.expanded = expand;
                }
            });
            render();
        }

        // 编辑功能
        function startEditing(span, line) {
            if (isEditing) return;
            isEditing = true;

            const originalValue = line.value;
            const input = document.createElement('textarea');
            input.className = 'json-value-editing';
            input.value = typeof originalValue === 'string' ? originalValue : String(originalValue);
            input.rows = 1;
            
            // 自动调整高度
            const adjustHeight = () => {
                input.style.height = 'auto';
                input.style.height = input.scrollHeight + 'px';
            };
            
            // 替换 span
            span.parentNode.replaceChild(input, span);
            adjustHeight();
            input.focus();
            
            input.addEventListener('input', adjustHeight);

            const commit = () => {
                let newValue = input.value;
                let parsedValue = newValue;

                // 智能类型解析
                if (newValue === 'true') parsedValue = true;
                else if (newValue === 'false') parsedValue = false;
                else if (newValue === 'null') parsedValue = null;
                else if (!isNaN(Number(newValue)) && newValue.trim() !== '') parsedValue = Number(newValue);
                
                // 更新数据
                line.value = parsedValue;
                
                if (line.parentObj && line.key !== null) {
                    line.parentObj[line.key] = parsedValue;
                } else if (line.parentArr && line.index !== null) {
                    line.parentArr[line.index] = parsedValue;
                } else if (line.level === 0) {
                    // 根节点
                    currentJson = parsedValue;
                }

                isEditing = false;
                render();
                
                // 显示同步按钮
                els.btnSync.classList.remove('hidden');
                vscode.postMessage({ type: 'showInfo', message: '修改已暂存，请点击"同步到输入框"以应用' });
            };

            const cancel = () => {
                isEditing = false;
                render();
            };

            input.addEventListener('keydown', e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    commit();
                }
                if (e.key === 'Escape') cancel();
            });
            
            input.addEventListener('blur', commit);
        }

        // 搜索功能
        function performSearch() {
            render();
            
            if (searchResults.length > 0) {
                currentSearchIndex = 0;
                updateHighlightState();
                scrollToCurrent();
            }
        }
        
        function updateHighlightState() {
            const currents = els.jsonContainer.querySelectorAll('.search-highlight.current');
            currents.forEach(el => el.classList.remove('current'));
            
            if (currentSearchIndex >= 0 && currentSearchIndex < searchResults.length) {
                searchResults[currentSearchIndex].classList.add('current');
            }
        }
        
        function scrollToCurrent() {
            if (currentSearchIndex >= 0 && currentSearchIndex < searchResults.length) {
                searchResults[currentSearchIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        function navigateSearch(direction) {
            if (searchResults.length === 0) return;
            
            currentSearchIndex += direction;
            
            if (currentSearchIndex >= searchResults.length) currentSearchIndex = 0;
            if (currentSearchIndex < 0) currentSearchIndex = searchResults.length - 1;
            
            updateHighlightState();
            scrollToCurrent();
            updateSearchCount();
        }

        function updateSearchCount() {
            if (searchResults.length === 0) {
                els.searchCount.textContent = '0/0';
            } else {
                els.searchCount.textContent = \`\${currentSearchIndex + 1}/\${searchResults.length}\`;
            }
        }

        // 工具栏功能
        function clearAll() {
            els.jsonInput.value = '';
            els.jsonContainer.innerHTML = '<div class="empty-state"><p>请输入 JSON 并点击"可视化"</p></div>';
            els.statusText.textContent = '就绪';
            els.statusControls.classList.remove('visible');
            els.btnSync.classList.add('hidden');
            currentJson = null;
            globalLines = [];
        }

        function formatInput() {
            try {
                const val = JSON.parse(els.jsonInput.value);
                els.jsonInput.value = JSON.stringify(val, null, 4);
            } catch (e) {}
        }

        function compressInput() {
            try {
                const val = JSON.parse(els.jsonInput.value);
                els.jsonInput.value = JSON.stringify(val);
            } catch (e) {}
        }

        function copyInput() {
            vscode.postMessage({
                type: 'copyToClipboard',
                text: els.jsonInput.value
            });
        }
        
        function syncToInput() {
            if (currentJson) {
                els.jsonInput.value = JSON.stringify(currentJson, null, 4);
                els.btnSync.classList.add('hidden');
                vscode.postMessage({ type: 'showInfo', message: '已同步到输入框' });
            }
        }

        function updateStatus(json) {
            const type = Array.isArray(json) ? 'Array' : typeof json;
            const size = JSON.stringify(json).length;
            els.statusText.textContent = \`类型: \${type} | 大小: \${size} 字符\`;
        }

    </script>
</body>
</html>`;
    }
}