# JSON可视化插件使用指南

## 安装插件

1. 在VSCode中按 `Ctrl+Shift+P` (Windows/Linux) 或 `Cmd+Shift+P` (Mac) 打开命令面板
2. 输入 "Extensions: Install from VSIX..."
3. 选择 `json-visualizer-0.0.1.vsix` 文件
4. 重启VSCode

## 使用方法

### 方法一：右键菜单 (推荐)

1. 在任意文件中选中一段JSON文本
2. 右键点击选中的文本
3. 选择"可视化选中的JSON"
4. 插件会自动打开侧边栏并显示格式化的JSON

### 方法二：命令面板

1. 在任意文件中选中一段JSON文本
2. 按 `Ctrl+Shift+P` (Windows/Linux) 或 `Cmd+Shift+P` (Mac) 打开命令面板
3. 输入"可视化选中的JSON"并选择该命令
4. JSON会在侧边栏中可视化显示

### 方法三：手动打开侧边栏

1. 点击VSCode左侧活动栏中的JSON图标（📄）
2. 这会打开JSON可视化器侧边栏
3. 然后使用方法一或方法二来可视化JSON

## 功能特性

- ✅ **主动触发**: 只有在你主动操作时才会显示JSON
- ✅ **右键菜单**: 选中JSON后右键即可快速可视化
- ✅ **语法高亮**: 
  - 🔵 键名 (蓝色加粗)
  - 🟡 字符串值 (黄色)
  - 🟢 数字值 (绿色)
  - 🔵 布尔值 (蓝色加粗)
  - ⚪ null值 (灰色斜体)
- ✅ **层级结构**: 清晰的缩进和颜色编码的层级指示器
- ✅ **展开/折叠**: 点击对象和数组前的三角符号
- ✅ **错误提示**: 无效JSON会显示详细错误信息

## 测试用例

试试这些JSON示例：

### 简单对象
```json
{
  "name": "张三",
  "age": 25,
  "active": true,
  "address": null
}
```

### 复杂嵌套
```json
{
  "user": {
    "id": 1001,
    "profile": {
      "name": "李四",
      "email": "lisi@example.com",
      "preferences": {
        "theme": "dark",
        "language": "zh-CN",
        "notifications": true
      }
    },
    "posts": [
      {
        "title": "第一篇文章",
        "content": "这是内容...",
        "tags": ["技术", "编程"]
      },
      {
        "title": "第二篇文章", 
        "content": "更多内容...",
        "tags": ["生活", "随笔"]
      }
    ]
  }
}
```

### 数组示例
```json
[
  {"id": 1, "name": "商品A", "price": 99.99},
  {"id": 2, "name": "商品B", "price": 149.50},
  {"id": 3, "name": "商品C", "price": 79.00}
]
```

## 故障排除

### 侧边栏没有显示
- 确保已安装插件并重启VSCode
- 查看左侧活动栏是否有JSON图标
- 尝试从命令面板手动打开："打开JSON可视化器"

### JSON无法解析
- 检查JSON格式是否正确（可以在线验证）
- 确保选中了完整的JSON文本
- 查看错误提示信息

### 选中文本没有反应
- 这是正常的！新版本需要你主动触发（右键或命令面板）
- 选中文本后右键选择"可视化选中的JSON"

## 键盘快捷键建议

你可以为常用命令设置快捷键：

1. 按 `Ctrl+Shift+P` 打开命令面板
2. 输入 "Preferences: Open Keyboard Shortcuts"
3. 搜索 "json-visualizer"
4. 为 "可视化选中的JSON" 设置快捷键（如 `Ctrl+Alt+J`）