# JSON可视化插件发布指南

## 目录
1. [准备工作](#准备工作)
2. [发布到GitHub](#发布到github)
3. [发布到VSCode插件市场](#发布到vscode插件市场)
4. [版本管理](#版本管理)

## 准备工作

### 1. 完善插件信息

首先，更新 `package.json` 中的必要字段：

```json
{
  "name": "json-visualizer",
  "displayName": "JSON可视化工具",
  "description": "选中JSON文本后在侧边栏中格式化展示，支持高亮和层级结构",
  "version": "1.0.0",
  "publisher": "your-publisher-name", // 替换为你的发布者名称
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/json-visualizer.git"
  },
  "bugs": {
    "url": "https://github.com/your-username/json-visualizer/issues"
  },
  "homepage": "https://github.com/your-username/json-visualizer#readme",
  "license": "MIT",
  "keywords": [
    "json",
    "visualizer",
    "formatter",
    "highlight",
    "viewer"
  ]
}
```

### 2. 创建LICENSE文件

创建 `LICENSE` 文件（MIT许可证示例）：

```
MIT License

Copyright (c) 2024 Your Name

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### 3. 创建.vscodeignore文件

创建 `.vscodeignore` 文件来排除不必要的文件：

```
.vscode/**
.vscode-test/**
src/**
.gitignore
.yarnrc
vsc-extension-quickstart.md
**/tsconfig.json
**/.eslintrc.json
**/*.map
**/*.ts
node_modules/**
*.vsix
```

## 发布到GitHub

### 1. 初始化Git仓库

```bash
git init
git add .
git commit -m "Initial commit: JSON visualizer extension"
```

### 2. 创建GitHub仓库

1. 登录 [GitHub](https://github.com)
2. 点击右上角的 "+" 号，选择 "New repository"
3. 仓库名称：`json-visualizer`
4. 描述：`VSCode JSON可视化插件`
5. 选择 "Public"（如果想开源）
6. 不要初始化README、.gitignore或LICENSE（本地已有）
7. 点击 "Create repository"

### 3. 连接本地仓库到GitHub

```bash
git remote add origin https://github.com/your-username/json-visualizer.git
git branch -M main
git push -u origin main
```

### 4. 创建Release

1. 在GitHub仓库页面，点击 "Releases"
2. 点击 "Create a new release"
3. 标签版本：`v1.0.0`
4. 发布标题：`JSON可视化工具 v1.0.0`
5. 描述发布内容：
   ```
   ## 功能特性
   - 🎯 主动触发：选中JSON文本后右键触发
   - 🎨 语法高亮：区分key、value、数字、字符串等
   - 📊 层级结构：清晰的缩进和指示线
   - 🔄 折叠展开：支持对象和数组的折叠
   - 📱 自适应：支持VSCode主题
   ```
6. 上传 `json-visualizer-0.0.1.vsix` 文件
7. 点击 "Publish release"

## 发布到VSCode插件市场

### 1. 注册发布者账号

1. 访问 [Visual Studio Marketplace](https://marketplace.visualstudio.com/manage)
2. 使用Microsoft账号登录
3. 创建发布者账号（Publisher）
   - 发布者ID：`your-publisher-name`（与package.json中的publisher字段一致）
   - 显示名称：`Your Name`
   - 邮箱和其他信息

### 2. 获取Personal Access Token

1. 访问 [Azure DevOps](https://dev.azure.com)
2. 点击右上角头像 → "Personal access tokens"
3. 点击 "New Token"
4. 名称：`VSCode Extension Publishing`
5. Organization：`All accessible organizations`
6. 过期时间：选择合适的时间
7. Scopes：选择 "Marketplace" → "Manage"
8. 创建并保存token（只显示一次）

### 3. 登录并发布

```bash
# 安装vsce（如果还没安装）
npm install -g @vscode/vsce

# 登录
vsce login your-publisher-name
# 输入刚才获取的Personal Access Token

# 发布插件
vsce publish
```

### 4. 手动上传（替代方案）

如果命令行发布有问题，可以手动上传：

1. 打包插件：`vsce package`
2. 访问 [Marketplace管理页面](https://marketplace.visualstudio.com/manage)
3. 点击 "New extension"
4. 上传 `.vsix` 文件
5. 填写必要信息并发布

## 版本管理

### 1. 版本号规则

遵循语义化版本控制（Semantic Versioning）：
- `主版本号.次版本号.修订号`
- 例：`1.2.3`

### 2. 更新版本

```bash
# 修订版本（bug修复）
npm version patch

# 次版本（新功能）
npm version minor

# 主版本（重大更改）
npm version major
```

### 3. 发布更新

```bash
# 更新版本号
npm version patch

# 提交更改
git push && git push --tags

# 重新打包
vsce package

# 发布到市场
vsce publish

# 在GitHub创建新的Release
```

## 推广建议

### 1. README.md优化
- 添加动态演示GIF
- 详细的功能介绍
- 安装和使用指南
- 常见问题解答

### 2. 社区推广
- 在VSCode相关论坛分享
- 写技术博客介绍
- 社交媒体宣传

### 3. 收集反馈
- 鼓励用户提Issue
- 及时回复用户问题
- 根据反馈改进功能

## 注意事项

1. **插件名称**: 确保名称在市场中唯一
2. **图标**: 考虑添加插件图标（128x128 PNG）
3. **分类**: 选择合适的分类标签
4. **测试**: 发布前充分测试各种场景
5. **文档**: 保持文档更新和准确

## 维护清单

- [ ] 定期更新依赖包
- [ ] 修复用户报告的bug
- [ ] 添加新功能
- [ ] 优化性能
- [ ] 更新文档
- [ ] 与VSCode新版本保持兼容

发布成功后，你的插件将在VSCode插件市场中可见，用户可以直接通过VSCode内置的扩展管理器搜索并安装！