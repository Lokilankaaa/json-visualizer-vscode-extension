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

    // 注册可视化JSON命令
    context.subscriptions.push(
        vscode.commands.registerCommand('json-visualizer.visualizeJson', () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('没有活动的编辑器');
                return;
            }

            const selection = editor.selection;
            if (selection.isEmpty) {
                vscode.window.showErrorMessage('请先选中JSON文本');
                return;
            }

            const selectedText = editor.document.getText(selection);
            try {
                // 尝试解析JSON
                const jsonData = JSON.parse(selectedText);
                
                // 打开侧边栏
                vscode.commands.executeCommand('workbench.view.extension.jsonVisualizerContainer');
                
                // 更新JSON显示
                provider.updateJSON(jsonData, selectedText);
                
                vscode.window.showInformationMessage('JSON已成功可视化');
            } catch (error) {
                vscode.window.showErrorMessage(`无效的JSON格式: ${error instanceof Error ? error.message : '未知错误'}`);
            }
        })
    );
}

export function deactivate() {
    console.log('JSON可视化插件已停用');
}