<template>
  <div class="model-page">
    <!-- 头部操作栏 -->
    <header class="model-header">
      <div class="header-lf">
        <a href="http://localhost:8082/#/" style="text-decoration: none;"><span>易创（yichuang）</span></a>
      </div>
      <div class="header-lr">
        <el-space>
          <el-button type="primary" icon="Film" @click="$router.push({ path: '/modelBase' })">
            模型库
          </el-button>
          <el-button type="primary" icon="Document" v-if="handleConfigBtn" @click="onSaveConfig">保存数据</el-button>
          <el-button type="primary" icon="View" v-if="handleConfigBtn" @click="onPrivew">效果预览</el-button>

          <el-dropdown trigger="click">
            <el-button type="primary" icon="Download">
              下载/导出<el-icon class="el-icon--right"></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="onDownloadCover">下载封面</el-dropdown-item>
                <el-dropdown-item @click="onExportModleFile('glb')">导出模型(.glb)格式</el-dropdown-item>
                <el-dropdown-item @click="onExportModleFile('gltf')">导出模型(.gltf)格式</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button type="primary" icon="HelpFilled" v-if="handleConfigBtn" @click="onImportantCode">
            嵌入代码
          </el-button>
          <el-button type="primary" icon="FullScreen" @click="onFullScreen">
            {{ fullscreenStatus ? '取消全屏' : '全屏' }}
          </el-button>
        </el-space>
      </div>
    </header>
    <div class="model-container">
      <!-- 模型列表 -->
      <model-choose ref="choosePanel"></model-choose>
      <!-- 模型视图 -->
      <div id="model" @drop="onGeometryDrop" ref="model" @dragover.prevent>
        <div class="camera-icon">
          <el-tooltip effect="dark" content="居中" placement="top">
            <el-icon :size="18" color="#fff" @click="onResetCamera">
              <Aim />
            </el-icon>
          </el-tooltip>
        </div>
        <div id="mesh-txt"></div>
      </div>
      <!-- 右侧编辑栏 -->
      <div class="edit-panel" :style="{ minWidth: '380px' }">
        <model-edit-panel ref="editPanel" v-if="store.modelApi.model"></model-edit-panel>
      </div>
    </div>
    <page-loading :loading="loading" :percentage="progress"></page-loading>
    <!-- 嵌入代码弹框 -->
    <implant-code-dialog ref="implatDialog"></implant-code-dialog>
  </div>
</template>

<script setup name="modelEdit">
import { ModelEditPanel, ModelChoose, ImplantCodeDialog } from "@/components/index";
import { onMounted, ref, getCurrentInstance, onBeforeUnmount, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import renderModel from "@/utils/renderModel";
import { modelList } from "@/config/model";
import PageLoading from "@/components/Loading/PageLoading";
import { MODEL_PRIVEW_CONFIG, MODEL_BASE_DATA, MODEL_DEFAULT_CONFIG } from "@/config/constant";
import { useMeshEditStore } from '@/store/meshEditStore'
import * as THREE from 'three'

const store = useMeshEditStore();
const router = useRouter();
const { $bus, $local } = getCurrentInstance().proxy;

const loading = ref(false);
const progress = ref(0);
const editPanel = ref(null);
const choosePanel = ref(null);
const implatDialog = ref(null);
const fullscreenStatus = ref(false)

const handleConfigBtn = computed(() => {
  if (editPanel.value) {
    const fileInfo = choosePanel.value.activeModel
    return fileInfo?.filePath ? true : false
  }
  return false
})
// 重置相机位置
const onResetCamera = () => {
  store.modelApi.onResetModelCamera();
};
// 初始化模型库数据
const initModelBaseData = () => {
  const modelBase = $local.get(MODEL_BASE_DATA);
  // 如果是首次加载需要设置模型库初始数据值
  if (!Array.isArray(modelBase)) {
    let modelBaseData = [];
    modelList.forEach((v) => {
      modelBaseData.push({
        ...MODEL_DEFAULT_CONFIG,
        fileInfo: { ...v },
      });
    });
    $local.set(MODEL_BASE_DATA, modelBaseData);
  }
};

// 几何体模型拖拽结束
const onGeometryDrop = (e) => {
  const { dragGeometryModel, dragTag } = store.modelApi
  const { clientX, clientY } = e
  // console.log(dragType)
  // 如果是几何体模型拖拽
  if (dragGeometryModel.id && store.dragType == 'geometry') {
    dragGeometryModel.clientX = clientX;
    dragGeometryModel.clientY = clientY;
    store.modelApi.onSwitchModel(dragGeometryModel);
  }

  if (dragTag.id && store.dragType == 'tags') {
    dragTag.clientX = clientX;
    dragTag.clientY = clientY;
    store.modelApi.create3dTags(dragTag);
  }


};
// 预览
const onPrivew = () => {
  const modelConfig = editPanel.value.getPanelConfig();
  modelConfig.camera = store.modelApi.onGetModelCamera();
  modelConfig.fileInfo = choosePanel.value.activeModel;
  //判断是否是外部模型
  if (modelConfig.fileInfo.filePath) {
    $local.set(MODEL_PRIVEW_CONFIG, modelConfig);
    const { href } = router.resolve({ path: "/preview" });
    window.open(href, "_blank");
  } else {
    ElMessage.warning("当前模型暂不支持“效果预览”");
  }
};

const onImportantCode = () => {
  
  const modelConfig = editPanel.value.getPanelConfig();
  modelConfig.camera = store.modelApi.onGetModelCamera();
  modelConfig.fileInfo = choosePanel.value.activeModel;
  implatDialog.value.showDialog(modelConfig)
}

// 全屏
const onFullScreen = () => {
  const element = document.documentElement;
  if (!fullscreenStatus.value) {
    if (element.requestFullscreen) {
      element.requestFullscreen();
      // 适用于旧版WebKit浏览器
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}

// 保存配置
const onSaveConfig = () => {
  ElMessageBox.confirm(" 确认要更新当前模型数据至“模板库”?", "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "success",
  })
    .then(() => {
      const modelConfig = editPanel.value.getPanelConfig();
      modelConfig.camera = store.modelApi.onGetModelCamera();
      modelConfig.fileInfo = choosePanel.value.activeModel;
      // 判断是否是外部模型
      if (modelConfig.fileInfo.filePath) {
        const modelBaseData = $local.get(MODEL_BASE_DATA) || [];
        const { id } = modelConfig.fileInfo;
        // 更新缓存数据
        Object.assign(modelBaseData.filter((v) => id === v.fileInfo.id)[0], modelConfig);
        $local.set(MODEL_BASE_DATA, modelBaseData);
        ElMessage.success("更新成功");
      } else {
        ElMessage.warning("当前模型暂不支持“数据保存”");
      }
    })
    .catch(() => { });
};

// 下载封面
const onDownloadCover = () => {
  store.modelApi.onDownloadScenCover();
};
// 导出模型
const onExportModleFile = (type) => {
  store.modelApi.onExporterModel(type);
};

// 全屏监听事件
const addEventListenerFllscreen = (e) => {
  const status = document.fullscreenElement || document.webkitFullscreenElement;
  fullscreenStatus.value = !!status
}

onMounted(async () => {
  loading.value = true;
  const modelApi = new renderModel("#model");
  store.setModelApi(modelApi)
  $bus.on("page-loading", (value) => {
    loading.value = value;

  });
  // 模型加载进度条
  store.modelApi.onProgress((progressNum) => {
    progress.value = Number((progressNum / 1024 / 1024).toFixed(2));
    // console.log('模型已加载' + progress.value + 'M')
  });
  const load = await modelApi.init();
  if (load) {
    loading.value = false;
    progress.value = 0;
  }
  // 初始化模型库数据
  initModelBaseData();
  // 全屏监听事件
  document.addEventListener('fullscreenchange', addEventListenerFllscreen)
});
onBeforeUnmount(() => {
  store.modelApi.onClearModelData();
  document.removeEventListener('fullscreenchange', addEventListenerFllscreen)
});
</script>

<style lang="scss" scoped>
.model-page {
  width: 100%;
  background-color: #1b1c23;

  .model-header {
    height: 35px;
    width: 100%;
    background-color: #010c1d;
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
    text-align: center;
    font-weight: 500;
    color: #fff;
    text-shadow: 5px 3px 5px #c11212;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0px 10px;
    box-sizing: border-box;
  }

  .model-container {
    display: flex;

    #model {
      width: calc(100% - 630px);
      height: calc(100vh - 35px);
      position: relative;

      .camera-icon {
        position: absolute;
        top: 10px;
        left: calc(100% - 50%);
        cursor: pointer;
      }
    }
  }
}
</style>

<style lang="scss">
.edit-box {
  height: calc(100vh - 79px);
}

.edit-box,
.model-choose {
  .header {
    width: 100%;
    height: 35px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #33343f;
    color: #ccc;
    padding: 0px 20px;
    border-bottom: 1px solid #1b1c23;
    border-top: 1px solid #1b1c23;
    box-sizing: border-box;
  }

  .disabled {
    opacity: 0.3;
    pointer-events: none;
  }

  .options {
    max-width: 380px;
    box-sizing: border-box;
    background-color: #1b1c23;

    .option-active {
      background-color: #27282f;
    }

    .space-between {
      justify-content: space-between;
    }

    .option {
      padding: 0px 18px;
      box-sizing: border-box;
      cursor: pointer;
      color: #ccc;
      display: flex;
      align-items: center;
      height: 33px;
      font-size: 14px;

      .icon-name {
        display: flex;
        align-items: center;
      }
    }
  }
}

.el-input-number {
  width: 90px !important;
}
</style>
