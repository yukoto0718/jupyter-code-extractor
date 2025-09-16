# Jupyter Code Extractor

**English Version** | [中文版](./README_CN.md)

A clean and user-friendly Jupyter Notebook code extraction tool that helps you quickly extract pure code and remove comments.

### ✨ Features

📁 Drag & Drop Upload - Support drag and drop or click to upload .ipynb files
🧹 Smart Filtering - Optional removal of Markdown text cells
💬 Comment Removal - Intelligently remove Python code comments without affecting # symbols in strings
📝 Dual Output Formats - Export as .py or .md formats
👀 Real-time Preview - Preview results before processing
🔒 Privacy Secure - All processing done locally in browser, no files uploaded to servers

### 🎯 Use Cases

Get clean code when asking AI assistants, avoiding large output interference
Convert Jupyter experimental code into executable Python scripts
Quickly extract code snippets for documentation or sharing
Batch process notebook files to get core code logic

### 🚀 Online Usage

Visit: https://yukoto0718.github.io/jupyter-code-extractor/

### 🛠️ Local Development

> Requirements
> Node.js 16.0 or higher
> npm or yarn package manager

### Install dependencies

npm install

### Start development server

npm run dev

### Build for production

npm run build

# Preview production build

Project Structure

```
jupyter-code-extractor/
├── src/
│ ├── types/ # TypeScript type definitions
│ │ └── notebook.ts
│ ├── utils/ # Utility functions
│ │ ├── commentRemover.ts # Smart comment removal
│ │ └── notebookProcessor.ts # Main processing logic
│ ├── App.vue # Main component
│ ├── main.ts # Entry file
│ └── vite-env.d.ts # Vite type declarations
├── public/ # Static assets
├── .github/
│ └── workflows/
│ └── deploy.yml # GitHub Actions auto deployment
├── vite.config.ts # Vite configuration
├── tsconfig.json # TypeScript configuration
└── package.json # Project configuration
```

### 📖 Usage Guide

#### Basic Operations

Upload File: Drag and drop or click to upload your .ipynb file
Select Options:
✅ Remove Markdown text cells: Keep only code cells
✅ Remove code comments: Intelligently delete # comments (optional)

Choose Format:
🐍 Python file (.py): Directly executable Python code
📝 Markdown file (.md): Document with code block formatting

## 🔧 Tech Stack

- **Frontend Framework**: Vue 3 + TypeScript
- **UI Component Library**: Element Plus
- **Build Tool**: Vite
- **Deployment Platform**: GitHub Pages
- **CI/CD**: GitHub Actions
