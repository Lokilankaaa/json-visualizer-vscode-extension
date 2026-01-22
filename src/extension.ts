import * as vscode from 'vscode';
import { JSONVisualizerProvider } from './jsonVisualizerProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('JSON可视化插件已激活');

    // 设置插件启用状态
    vscode.commands.executeCommand('setContext', 'jsonVisualizerEnabled', true);

    // 创建JSON可视化器提供者
    const provider = new JSONVisualizerProvider(context.extensionUri);

    // 注册WebView视图
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('jsonVisualizerView', provider)
    );

    // 注册打开视图命令
    context.subscriptions.push(
        vscode.commands.registerCommand('json-visualizer.openView', () => {
            vscode.commands.executeCommand('workbench.view.extension.jsonVisualizerContainer');
        })
    );

    // 注册可视化JSON命令（智能模式：总是获取最新选中内容）
    context.subscriptions.push(
        vscode.commands.registerCommand('json-visualizer.visualizeJson', async () => {
            let selectedText = '';
            
            // 优先尝试从编辑器获取选中文本
            const editor = vscode.window.activeTextEditor;
            if (editor && !editor.selection.isEmpty) {
                selectedText = editor.document.getText(editor.selection);
            }
            
            // 如果没有从编辑器获取到文本，或者为了确保获取最新选中内容，执行复制操作
            if (!selectedText.trim()) {
                try {
                    // 执行复制命令获取当前选中的文本
                    await vscode.commands.executeCommand('editor.action.clipboardCopyAction');
                    
                    // 等待复制完成
                    await new Promise(resolve => setTimeout(resolve, 200));
                    
                    // 从剪贴板读取
                    selectedText = await vscode.env.clipboard.readText();
                    if (!selectedText.trim()) {
                        vscode.window.showErrorMessage('无法获取JSON内容，请确保有选中的文本');
                        return;
                    }
                } catch (error) {
                    vscode.window.showErrorMessage('无法复制内容，请先选中JSON文本');
                    return;
                }
            }

            // 打开侧边栏
            vscode.commands.executeCommand('workbench.view.extension.jsonVisualizerContainer');
            
            // 发送原始文本给WebView，由WebView处理解析和显示
            provider.updateJSON(null, selectedText);
        })
    );
}

export function deactivate() {
    console.log('JSON可视化插件已停用');
}