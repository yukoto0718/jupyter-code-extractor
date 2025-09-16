<template>
  <div id="app">
    <el-container>
      <el-header>
        <h1>
          <el-icon><Document /></el-icon>
          Jupyter Code Extractor
        </h1>
        <p>提取Jupyter Notebook中的纯代码，支持去除注释和文本单元格</p>
      </el-header>

      <el-main>
        <div class="main-content">
          <!-- 文件上传区域 -->
          <el-card class="upload-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon><Upload /></el-icon>
                <span>上传Notebook文件</span>
              </div>
            </template>

            <el-upload
              ref="uploadRef"
              class="upload-dragger"
              drag
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleFileChange"
              accept=".ipynb"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">将 .ipynb 文件拖拽到此处，或<em>点击上传</em></div>
              <template #tip>
                <div class="el-upload__tip">支持 .ipynb 格式的Jupyter Notebook文件</div>
              </template>
            </el-upload>

            <div v-if="selectedFile" class="file-info">
              <el-tag type="success" size="large">
                <el-icon><Document /></el-icon>
                {{ selectedFile.name }}
                <el-button type="text" size="small" @click="clearFile" style="margin-left: 8px">
                  <el-icon><Close /></el-icon>
                </el-button>
              </el-tag>
            </div>
          </el-card>

          <!-- 处理选项 -->
          <el-card v-if="selectedFile" class="options-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon><Setting /></el-icon>
                <span>处理选项</span>
              </div>
            </template>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-checkbox v-model="options.removeMarkdown" size="large">
                  去除Markdown文本单元格
                </el-checkbox>
              </el-col>
              <el-col :span="12">
                <el-checkbox v-model="options.removeComments" size="large">
                  去除代码注释
                </el-checkbox>
              </el-col>
            </el-row>

            <el-divider />

            <div class="output-format">
              <label class="format-label">输出格式：</label>
              <el-radio-group v-model="options.outputFormat" size="large">
                <el-radio label="python">
                  <el-icon><Document /></el-icon>
                  Python文件 (.py)
                </el-radio>
                <el-radio label="markdown">
                  <el-icon><Edit /></el-icon>
                  Markdown文件 (.md)
                </el-radio>
              </el-radio-group>
            </div>
          </el-card>

          <!-- 处理按钮 -->
          <div v-if="selectedFile" class="action-section">
            <el-button
              type="primary"
              size="large"
              @click="processFile"
              :loading="processing"
              :disabled="!selectedFile"
            >
              <el-icon><CircleCheck /></el-icon>
              <!-- 原来是 Magic -->
              {{ processing ? '处理中...' : '提取代码' }}
            </el-button>
          </div>

          <!-- 结果显示 -->
          <el-card v-if="result" class="result-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon><Check /></el-icon>
                <span>处理完成</span>
              </div>
            </template>

            <el-result icon="success" :title="`成功提取 ${result.cellCount} 个代码单元格`">
              <template #extra>
                <el-button type="primary" @click="downloadResult">
                  <el-icon><Download /></el-icon>
                  下载 {{ result.filename }}
                </el-button>
                <el-button @click="reset">
                  <el-icon><Refresh /></el-icon>
                  重新处理
                </el-button>
              </template>
            </el-result>

            <!-- 预览 -->
            <el-collapse v-model="activeCollapse">
              <el-collapse-item name="preview">
                <template #title>
                  <el-icon><View /></el-icon>
                  预览内容
                </template>
                <el-input
                  v-model="result.content"
                  type="textarea"
                  :rows="15"
                  readonly
                  class="preview-textarea"
                />
              </el-collapse-item>
            </el-collapse>
          </el-card>
        </div>
      </el-main>

      <el-footer>
        <div class="footer-content">
          <p>
            Made with ❤️ for Jupyter users |
            <a href="https://github.com/yourusername/jupyter-code-extractor" target="_blank">
              <el-icon><Link /></el-icon>
              GitHub
            </a>
          </p>
        </div>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import {
  Document,
  Upload,
  UploadFilled,
  Close,
  Setting,
  Edit,
  CircleCheck, // 替换 Magic
  Check,
  Download,
  Refresh,
  View,
  Link,
} from '@element-plus/icons-vue'

import type { ProcessOptions, ProcessResult, JupyterNotebook } from './types/notebook'
import { NotebookProcessor } from './utils/notebookProcessor'

// 响应式数据
const selectedFile = ref<File | null>(null)
const processing = ref(false)
const result = ref<ProcessResult | null>(null)
const activeCollapse = ref<string[]>([])

const options = reactive<ProcessOptions>({
  removeMarkdown: true,
  removeComments: false,
  outputFormat: 'python',
})

// 文件处理
const handleFileChange = (file: any) => {
  const rawFile = file.raw

  if (!rawFile.name.endsWith('.ipynb')) {
    ElMessage.error('请上传 .ipynb 格式的文件')
    return
  }

  selectedFile.value = rawFile
  result.value = null

  ElMessage.success(`文件 ${rawFile.name} 上传成功`)
}

const clearFile = () => {
  selectedFile.value = null
  result.value = null
}

// 处理文件
const processFile = async () => {
  if (!selectedFile.value) {
    ElMessage.error('请先选择文件')
    return
  }

  processing.value = true

  try {
    const fileContent = await readFileAsText(selectedFile.value)
    const notebook: JupyterNotebook = JSON.parse(fileContent)

    // 验证文件格式
    if (!notebook.cells || !Array.isArray(notebook.cells)) {
      throw new Error('无效的 Jupyter Notebook 格式')
    }

    result.value = NotebookProcessor.process(notebook, options)

    ElNotification({
      title: '处理完成',
      message: `成功提取 ${result.value.cellCount} 个代码单元格`,
      type: 'success',
    })
  } catch (error) {
    ElMessage.error(`处理失败: ${error instanceof Error ? error.message : '未知错误'}`)
  } finally {
    processing.value = false
  }
}

// 读取文件内容
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file, 'utf-8')
  })
}

// 下载结果
const downloadResult = () => {
  if (!result.value) return

  const blob = new Blob([result.value.content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = result.value.filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  ElMessage.success('文件下载开始')
}

// 重置
const reset = () => {
  selectedFile.value = null
  result.value = null
  processing.value = false
}
</script>

<style scoped>
#app {
  min-height: 100vh;
}

.el-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 20px;
}

.el-header h1 {
  margin: 0;
  font-size: 2.5em;
  font-weight: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.el-header p {
  margin: 10px 0 0 0;
  opacity: 0.9;
  font-size: 1.1em;
}

.main-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.upload-card,
.options-card,
.result-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.upload-dragger {
  width: 100%;
}

.file-info {
  margin-top: 15px;
  text-align: center;
}

.output-format {
  display: flex;
  align-items: center;
  gap: 15px;
}

.format-label {
  font-weight: 600;
  color: #606266;
}

.action-section {
  text-align: center;
  margin: 30px 0;
}

.preview-textarea {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.el-footer {
  background-color: #f5f7fa;
  border-top: 1px solid #e4e7ed;
  text-align: center;
  color: #909399;
  padding: 20px;
}

.footer-content a {
  color: #409eff;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.footer-content a:hover {
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 10px;
  }

  .el-header h1 {
    font-size: 2em;
  }

  .el-col {
    margin-bottom: 10px;
  }
}
</style>
