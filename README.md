# JSON可视化工具

一个VSCode插件，用于可视化JSON数据，支持格式化显示、语法高亮和层级结构展示。

## 功能特性

- 🔍 **智能检测**: 选中JSON文本时自动在侧边栏显示可视化结果
- 📋 **智能备用**: 没有活动编辑器时自动复制当前选中内容并可视化
- 🎨 **语法高亮**: 区分显示JSON的key、value、数字、字符串、布尔值和null
- 📊 **层级结构**: 清晰展示JSON的嵌套层级关系
- 🔄 **展开/折叠**: 支持对象和数组的展开折叠操作
- 📱 **响应式**: 自适应VSCode主题和配色方案
- 🚀 **兼容性强**: 适用于超长文件、Jupyter notebook输出等各种场景

## 使用方法

1. 在VSCode中安装此插件
2. 选中一段JSON文本
3. 右键菜单选择"可视化选中的JSON"或使用命令面板
4. 如果在超长文件或Jupyter notebook等场景中没有活动编辑器，插件会自动复制当前选中内容并进行可视化

## 智能模式说明

插件采用智能检测模式：
- **优先模式**: 从活动编辑器中获取选中的JSON文本
- **备用模式**: 当没有活动编辑器时，自动执行复制操作并从剪贴板读取JSON内容
- **无感操作**: 整个过程对用户完全透明，只需要一次操作

## 可用命令

- `json-visualizer.visualizeJson`: 智能可视化JSON（自动适应各种场景）
- `json-visualizer.openView`: 打开JSON可视化器面板

## 支持的JSON格式

插件支持标准的JSON格式，包括：
- 对象 `{}`
- 数组 `[]`
- 字符串 `"string"`
- 数字 `123`
- 布尔值 `true/false`
- 空值 `null`

## 示例

选中以下JSON文本试试：

```json
{
  "name": "JSON可视化工具",
  "version": "1.0.0",
  "features": ["高亮", "层级", "折叠"],
  "config": {
    "enabled": true,
    "theme": "auto"
  },
  "stats": {
    "downloads": 1000,
    "rating": 4.8
  }
}
```

## 开发

### 本地开发

```bash
# 安装依赖
npm install

# 编译
npm run compile

# 开发模式（监听文件变化）
npm run watch
```

### 调试

1. 按 `F5` 启动插件开发环境
2. 在新窗口中测试插件功能

### 打包

```bash
# 安装vsce（如果还没安装）
npm install -g @vscode/vsce

# 打包插件
npm run package
```

## 许可证

MIT License