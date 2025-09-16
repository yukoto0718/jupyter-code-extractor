# Jupyter Code Extractor

一个简洁、易用的 Jupyter Notebook 代码提取工具，帮你快速提取纯代码并去除注释。

## ✨ 功能特点

- 📁 **拖拽上传** - 支持拖拽或点击上传 .ipynb 文件
- 💬 **注释删除** - 智能删除 Python 代码注释，不误删字符串中的 # 符号
- 📝 **双输出格式** - 支持导出为 .py 或 .md 格式
- 👀 **实时预览** - 处理前可预览结果内容
- 🔒 **隐私安全** - 所有处理在浏览器本地完成，文件不上传到服务器

## 🎯 使用场景

- 向 AI 助手提问时需要纯代码，避免大量输出干扰
- 将 Jupyter 实验代码整理成可执行的 Python 脚本
- 快速提取代码片段用于文档或分享
- 批量处理 notebook 文件获取核心代码逻辑

## 🚀 在线使用

访问：[https://yukoto0718.github.io/jupyter-code-extractor/](https://yourusername.github.io/jupyter-code-extractor/)

## 🛠️ 本地开发

### 环境要求

- Node.js 16.0 或更高版本
- npm 或 yarn 包管理器

### 安装和运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

项目结构

```
jupyter-code-extractor/
├── src/
│   ├── types/           # TypeScript类型定义
│   │   └── notebook.ts
│   ├── utils/           # 工具函数
│   │   ├── commentRemover.ts      # 智能注释删除
│   │   └── notebookProcessor.ts   # 主要处理逻辑
│   ├── App.vue          # 主组件
│   ├── main.ts          # 入口文件
│   └── vite-env.d.ts    # Vite类型声明
├── public/              # 静态资源
├── .github/
│   └── workflows/
│       └── deploy.yml   # GitHub Actions自动部署
├── vite.config.ts       # Vite配置
├── tsconfig.json        # TypeScript配置
└── package.json         # 项目配置
```

📖 使用说明
基本操作

上传文件：拖拽或点击上传你的 .ipynb 文件
选择选项：

✅ 去除 Markdown 文本单元格：只保留代码单元格
✅ 去除代码注释：智能删除 # 注释（可选）

选择格式：

🐍 Python 文件 (.py)：直接可执行的 Python 代码
📝 Markdown 文件 (.md)：带代码块格式的文档

处理下载：点击"提取代码"按钮，完成后下载结果

## 🔧 技术栈

- **前端框架**：Vue 3 + TypeScript
- **UI 组件库**：Element Plus
- **构建工具**：Vite
- **部署平台**：GitHub Pages
- **CI/CD**：GitHub Actions
