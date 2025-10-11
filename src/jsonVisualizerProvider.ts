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
    }

    public updateJSON(jsonData: any, originalText: string) {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'updateJSON',
                data: jsonData,
                originalText: originalText
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
        body {
            padding: 0;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            margin: 0;
            font-size: 12px;
            overflow: hidden;
        }
        
        .container {
            width: 100%;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        .status {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
            padding: 8px 12px;
            background-color: var(--vscode-textBlockQuote-background);
            border-bottom: 1px solid var(--vscode-panel-border);
        }
        
        .json-container {
            flex: 1;
            background-color: var(--vscode-editor-background);
            overflow: auto;
            position: relative;
        }
        
        .json-editor {
            display: flex;
            min-height: 100%;
        }
        
        .json-content {
            flex: 1;
            padding: 8px;
            line-height: 18px;
            position: relative;
            overflow-x: auto;
        }
        
        .json-line {
            position: relative;
            min-height: 18px;
            display: block;
        }
        
        .fold-icon {
            display: inline-block;
            width: 12px;
            height: 12px;
            cursor: pointer;
            margin-right: 4px;
            color: var(--vscode-symbolIcon-classForeground, #4ec9b0);
            font-size: 8px;
            opacity: 0.7;
            border-radius: 2px;
            text-align: center;
            line-height: 12px;
        }
        
        .fold-icon:hover {
            opacity: 1;
            background-color: var(--vscode-list-hoverBackground);
        }
        
        .fold-icon.collapsed::before {
            content: '▶';
        }
        
        .fold-icon.expanded::before {
            content: '▼';
        }
        
        .indent-guides {
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            pointer-events: none;
            z-index: 0;
        }
        
        .indent-guide {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 1px;
            background-color: var(--vscode-editorIndentGuide-background, #404040);
            opacity: 0.3;
        }
        
        .content-text {
            position: relative;
            z-index: 1;
            white-space: pre-wrap;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        
        .json-key {
            color: #9CDCFE !important;
            font-weight: normal;
        }
        
        .json-string {
            color: #CE9178 !important;
        }
        
        .json-number {
            color: #B5CEA8 !important;
        }
        
        .json-boolean {
            color: #569cd6 !important;
            font-weight: bold;
        }
        
        .json-null {
            color: #808080 !important;
            font-style: italic;
        }
        
        .json-punctuation {
            color: #D4D4D4 !important;
        }
        
        .json-brace, .json-bracket {
            color: #FFD700 !important;
            font-weight: bold;
        }
        
        .hidden {
            display: none;
        }
        
        .empty-state {
            text-align: center;
            color: var(--vscode-descriptionForeground);
            font-style: italic;
            padding: 20px;
        }
        
        .hover-highlight:hover {
            background-color: var(--vscode-list-hoverBackground);
        }
    </style>
</head>
<body>
    <div class="container">
        <div id="status" class="status">请在编辑器中选择JSON文本...</div>
        <div id="jsonContent" class="json-container">
            <div class="empty-state">
                <p>🔍 选中JSON文本以开始可视化</p>
                <p>支持的功能：</p>
                <ul style="text-align: left; display: inline-block;">
                    <li>格式化显示</li>
                    <li>语法高亮</li>
                    <li>层级结构</li>
                    <li>展开/折叠</li>
                </ul>
            </div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let currentData = null;
        let lineNumber = 1;
        
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.type) {
                case 'updateJSON':
                    displayJSON(message.data, message.originalText);
                    break;
                case 'clearView':
                    clearDisplay();
                    break;
            }
        });
        
        function clearDisplay() {
            document.getElementById('status').textContent = '请在编辑器中选择JSON文本...';
            document.getElementById('jsonContent').innerHTML =
                '<div class="empty-state"><p>🔍 选中JSON文本以开始可视化</p><p>支持的功能：</p><ul style="text-align: left; display: inline-block;"><li>格式化显示</li><li>语法高亮</li><li>层级结构</li><li>展开/折叠</li></ul></div>';
        }
        
        function displayJSON(data, originalText) {
            const statusEl = document.getElementById('status');
            const contentEl = document.getElementById('jsonContent');
            
            currentData = data;
            lineNumber = 1;
            
            // 更新状态
            const size = JSON.stringify(data).length;
            const type = Array.isArray(data) ? 'Array' : typeof data;
            statusEl.textContent = \`JSON数据已加载 (类型: \${type}, 大小: \${size} 字符)\`;
            
            // 创建简化布局
            contentEl.innerHTML = '';
            const contentDiv = document.createElement('div');
            contentDiv.className = 'json-content';
            contentDiv.id = 'jsonLines';
            contentEl.appendChild(contentDiv);
            
            // 渲染JSON
            const lines = [];
            renderJSON(data, lines, 0);
            updateDisplay(lines);
        }
        
        function renderJSON(obj, lines, level = 0, key = null) {
            // 不在这里添加缩进，而是在显示时通过CSS实现
            
            if (key !== null) {
                // 对象属性
                if (obj === null) {
                    lines.push({
                        level: level,
                        content: \`<span class="json-key">"\${escapeHtml(key)}"</span><span class="json-punctuation">: </span><span class="json-null">null</span>\`,
                        foldable: false
                    });
                } else if (typeof obj === 'boolean') {
                    lines.push({
                        level: level,
                        content: \`<span class="json-key">"\${escapeHtml(key)}"</span><span class="json-punctuation">: </span><span class="json-boolean">\${obj}</span>\`,
                        foldable: false
                    });
                } else if (typeof obj === 'number') {
                    lines.push({
                        level: level,
                        content: \`<span class="json-key">"\${escapeHtml(key)}"</span><span class="json-punctuation">: </span><span class="json-number">\${obj}</span>\`,
                        foldable: false
                    });
                } else if (typeof obj === 'string') {
                    lines.push({
                        level: level,
                        content: \`<span class="json-key">"\${escapeHtml(key)}"</span><span class="json-punctuation">: </span><span class="json-string">"\${escapeHtml(obj)}"</span>\`,
                        foldable: false
                    });
                } else if (Array.isArray(obj)) {
                    if (obj.length === 0) {
                        lines.push({
                            level: level,
                            content: \`<span class="json-key">"\${escapeHtml(key)}"</span><span class="json-punctuation">: </span><span class="json-bracket">[]</span>\`,
                            foldable: false
                        });
                    } else {
                        const openLineIndex = lines.length;
                        lines.push({
                            level: level,
                            content: \`<span class="json-key">"\${escapeHtml(key)}"</span><span class="json-punctuation">: </span><span class="json-bracket">[</span>\`,
                            foldable: true,
                            isOpen: true
                        });
                        
                        obj.forEach((item, index) => {
                            renderJSON(item, lines, level + 1);
                            if (index < obj.length - 1) {
                                lines[lines.length - 1].content += '<span class="json-punctuation">,</span>';
                            }
                        });
                        
                        lines.push({
                            level: level,
                            content: \`<span class="json-bracket">]</span>\`,
                            foldable: false,
                            closeFor: openLineIndex
                        });
                        
                        lines[openLineIndex].closeLineIndex = lines.length - 1;
                    }
                } else if (typeof obj === 'object') {
                    const keys = Object.keys(obj);
                    if (keys.length === 0) {
                        lines.push({
                            level: level,
                            content: \`<span class="json-key">"\${escapeHtml(key)}"</span><span class="json-punctuation">: </span><span class="json-brace">{}</span>\`,
                            foldable: false
                        });
                    } else {
                        const openLineIndex = lines.length;
                        lines.push({
                            level: level,
                            content: \`<span class="json-key">"\${escapeHtml(key)}"</span><span class="json-punctuation">: </span><span class="json-brace">{</span>\`,
                            foldable: true,
                            isOpen: true
                        });
                        
                        keys.forEach((objKey, index) => {
                            renderJSON(obj[objKey], lines, level + 1, objKey);
                            if (index < keys.length - 1) {
                                lines[lines.length - 1].content += '<span class="json-punctuation">,</span>';
                            }
                        });
                        
                        lines.push({
                            level: level,
                            content: \`<span class="json-brace">}</span>\`,
                            foldable: false,
                            closeFor: openLineIndex
                        });
                        
                        lines[openLineIndex].closeLineIndex = lines.length - 1;
                    }
                }
            } else {
                // 根级别
                if (obj === null) {
                    lines.push({
                        level: level,
                        content: \`<span class="json-null">null</span>\`,
                        foldable: false
                    });
                } else if (typeof obj === 'boolean') {
                    lines.push({
                        level: level,
                        content: \`<span class="json-boolean">\${obj}</span>\`,
                        foldable: false
                    });
                } else if (typeof obj === 'number') {
                    lines.push({
                        level: level,
                        content: \`<span class="json-number">\${obj}</span>\`,
                        foldable: false
                    });
                } else if (typeof obj === 'string') {
                    lines.push({
                        level: level,
                        content: \`<span class="json-string">"\${escapeHtml(obj)}"</span>\`,
                        foldable: false
                    });
                } else if (Array.isArray(obj)) {
                    if (obj.length === 0) {
                        lines.push({
                            level: level,
                            content: \`<span class="json-bracket">[]</span>\`,
                            foldable: false
                        });
                    } else {
                        const openLineIndex = lines.length;
                        lines.push({
                            level: level,
                            content: \`<span class="json-bracket">[</span>\`,
                            foldable: true,
                            isOpen: true
                        });
                        
                        obj.forEach((item, index) => {
                            renderJSON(item, lines, level + 1);
                            if (index < obj.length - 1) {
                                lines[lines.length - 1].content += '<span class="json-punctuation">,</span>';
                            }
                        });
                        
                        lines.push({
                            level: level,
                            content: \`<span class="json-bracket">]</span>\`,
                            foldable: false,
                            closeFor: openLineIndex
                        });
                        
                        lines[openLineIndex].closeLineIndex = lines.length - 1;
                    }
                } else if (typeof obj === 'object') {
                    const keys = Object.keys(obj);
                    if (keys.length === 0) {
                        lines.push({
                            level: level,
                            content: \`<span class="json-brace">{}</span>\`,
                            foldable: false
                        });
                    } else {
                        const openLineIndex = lines.length;
                        lines.push({
                            level: level,
                            content: \`<span class="json-brace">{</span>\`,
                            foldable: true,
                            isOpen: true
                        });
                        
                        keys.forEach((objKey, index) => {
                            renderJSON(obj[objKey], lines, level + 1, objKey);
                            if (index < keys.length - 1) {
                                lines[lines.length - 1].content += '<span class="json-punctuation">,</span>';
                            }
                        });
                        
                        lines.push({
                            level: level,
                            content: \`<span class="json-brace">}</span>\`,
                            foldable: false,
                            closeFor: openLineIndex
                        });
                        
                        lines[openLineIndex].closeLineIndex = lines.length - 1;
                    }
                }
            }
        }
        
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        function updateDisplay(lines) {
            const contentDiv = document.getElementById('jsonLines');
            contentDiv.innerHTML = '';
            
            lines.forEach((line, index) => {
                if (line.hidden) return;
                
                // 内容行
                const contentLine = document.createElement('div');
                contentLine.className = 'json-line hover-highlight';
                
                // 缩进指示线
                const indentGuidesDiv = document.createElement('div');
                indentGuidesDiv.className = 'indent-guides';
                for (let i = 1; i <= line.level; i++) {
                    const guide = document.createElement('div');
                    guide.className = 'indent-guide';
                    guide.style.left = (i * 20) + 'px'; // 与paddingLeft保持一致：每层级20px
                    indentGuidesDiv.appendChild(guide);
                }
                contentLine.appendChild(indentGuidesDiv);
                
                // 文本内容
                const textDiv = document.createElement('div');
                textDiv.className = 'content-text';
                textDiv.style.paddingLeft = (line.level * 20) + 'px'; // 每层级20px缩进
                
                // 如果可折叠，在内容前添加折叠图标
                let content = line.content;
                if (line.foldable) {
                    const foldIcon = document.createElement('span');
                    foldIcon.className = \`fold-icon \${line.isOpen ? 'expanded' : 'collapsed'}\`;
                    foldIcon.addEventListener('click', () => {
                        toggleFold(lines, index);
                        updateDisplay(lines);
                    });
                    textDiv.appendChild(foldIcon);
                }
                
                const contentSpan = document.createElement('span');
                contentSpan.innerHTML = content;
                textDiv.appendChild(contentSpan);
                
                contentLine.appendChild(textDiv);
                contentDiv.appendChild(contentLine);
            });
        }
        
        function toggleFold(lines, lineIndex) {
            const line = lines[lineIndex];
            if (!line.foldable) return;
            
            line.isOpen = !line.isOpen;
            
            if (line.closeLineIndex !== undefined) {
                for (let i = lineIndex + 1; i <= line.closeLineIndex; i++) {
                    lines[i].hidden = !line.isOpen;
                }
            }
        }
    </script>
</body>
</html>`;
    }
}