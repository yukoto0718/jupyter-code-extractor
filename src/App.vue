<template>
  <div id="app">
    <el-container>
      <el-header>
        <h1>
          <el-icon><Document /></el-icon>
          Jupyter Code Extractor
        </h1>
        <p>Extract pure code from Jupyter Notebooks, remove comments and text cells</p>
      </el-header>

      <el-main>
        <div class="main-content">
          <!-- File Upload Area -->
          <el-card class="upload-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon><Upload /></el-icon>
                <span>Upload Notebook File</span>
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
              <div class="el-upload__text">
                Drop your .ipynb file here, or <em>click to upload</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  Only .ipynb format Jupyter Notebook files are supported
                </div>
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

          <!-- Processing Options -->
          <el-card v-if="selectedFile" class="options-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon><Setting /></el-icon>
                <span>Processing Options</span>
              </div>
            </template>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-checkbox v-model="options.removeMarkdown" size="large">
                  Remove Markdown text cells
                </el-checkbox>
              </el-col>
              <el-col :span="12">
                <el-checkbox v-model="options.removeComments" size="large">
                  Remove all comments (# and """)
                </el-checkbox>
              </el-col>
            </el-row>

            <el-divider />

            <div class="output-format">
              <label class="format-label">Output Format:</label>
              <el-radio-group v-model="options.outputFormat" size="large">
                <el-radio label="python">
                  <el-icon><Document /></el-icon>
                  Python file (.py)
                </el-radio>
                <el-radio label="markdown">
                  <el-icon><Edit /></el-icon>
                  Markdown file (.md)
                </el-radio>
              </el-radio-group>
            </div>
          </el-card>

          <!-- Process Button -->
          <div v-if="selectedFile" class="action-section">
            <el-button
              type="primary"
              size="large"
              @click="processFile"
              :loading="processing"
              :disabled="!selectedFile"
            >
              <el-icon><CircleCheck /></el-icon>
              {{ processing ? 'Processing...' : 'Extract Code' }}
            </el-button>
          </div>

          <!-- Results Display -->
          <el-card v-if="result" class="result-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon><Check /></el-icon>
                <span>Processing Complete</span>
              </div>
            </template>

            <el-result
              icon="success"
              :title="`Successfully extracted ${result.cellCount} code cells`"
            >
              <template #extra>
                <el-button type="primary" @click="downloadResult">
                  <el-icon><Download /></el-icon>
                  Download {{ result.filename }}
                </el-button>
                <el-button @click="reset">
                  <el-icon><Refresh /></el-icon>
                  Process Another
                </el-button>
              </template>
            </el-result>

            <!-- Preview -->
            <el-collapse v-model="activeCollapse">
              <el-collapse-item name="preview">
                <template #title>
                  <el-icon><View /></el-icon>
                  Preview Content
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
            <a href="https://github.com/yukoto0718/jupyter-code-extractor" target="_blank">
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
  CircleCheck,
  Check,
  Download,
  Refresh,
  View,
  Link,
} from '@element-plus/icons-vue'

import type { ProcessOptions, ProcessResult, JupyterNotebook } from './types/notebook'
import { NotebookProcessor } from './utils/notebookProcessor'

// Reactive data
const selectedFile = ref<File | null>(null)
const processing = ref(false)
const result = ref<ProcessResult | null>(null)
const activeCollapse = ref<string[]>([])

const options = reactive<ProcessOptions>({
  removeMarkdown: true,
  removeComments: false,
  outputFormat: 'python',
})

// File handling
const handleFileChange = (file: any) => {
  const rawFile = file.raw

  if (!rawFile.name.endsWith('.ipynb')) {
    ElMessage.error('Please upload a .ipynb format file')
    return
  }

  selectedFile.value = rawFile
  result.value = null

  ElMessage.success(`File ${rawFile.name} uploaded successfully`)
}

const clearFile = () => {
  selectedFile.value = null
  result.value = null
}

// Process file
const processFile = async () => {
  if (!selectedFile.value) {
    ElMessage.error('Please select a file first')
    return
  }

  processing.value = true

  try {
    const fileContent = await readFileAsText(selectedFile.value)
    const notebook: JupyterNotebook = JSON.parse(fileContent)

    // Validate file format
    if (!notebook.cells || !Array.isArray(notebook.cells)) {
      throw new Error('Invalid Jupyter Notebook format')
    }

    result.value = NotebookProcessor.process(notebook, options, selectedFile.value.name)

    ElNotification({
      title: 'Processing Complete',
      message: `Successfully extracted ${result.value.cellCount} code cells`,
      type: 'success',
    })
  } catch (error) {
    ElMessage.error(
      `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  } finally {
    processing.value = false
  }
}

// Read file content
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file, 'utf-8')
  })
}

// Download result
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

  ElMessage.success('File download started')
}

// Reset
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

/* Responsive design */
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
