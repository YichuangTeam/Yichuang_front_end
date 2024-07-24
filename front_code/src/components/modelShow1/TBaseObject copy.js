// import * as THREE from 'three';
// import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

export const allBaseObject = [];

function getModelLoader(fileType) {
  switch (fileType) {
    // case 'stl':
    //   return new STLLoader();
    case 'mtl':
      return new MTLLoader();
    case 'gltf':
    case 'glb':
      return new GLTFLoader();
    case 'obj':
      return new OBJLoader(); // 或者返回一个包含 .obj 和 .mtl 加载逻辑的对象
    default:
      throw new Error('Unsupported file type');
  }
}

async function loadModel(url, baseURL, modelName) {
  const fileExtension = url.split('.').pop().toLowerCase();

  if (fileExtension === 'obj') {
    const mtlLoader = new MTLLoader();
    mtlLoader.setPath(`/public/static/`);

    const materials = await new Promise((resolve, reject) => {
      mtlLoader.load(
        `${modelName}.mtl`,
        (materials) => {
          materials.preload();
          resolve(materials);
        },
        undefined, // 进度回调（如果需要）
        (error) => {
          reject(error);
        }
      );
    });

    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);

    const geometryOrScene = await new Promise((resolve, reject) => {
      objLoader.load(
        `${modelName}.obj`,
        (obj) => {
          resolve(obj);
        },
        undefined, // 进度回调（如果需要）
        (error) => {
          reject(error);
        }
      );
    });

    return { geometryOrScene, meshName: 'objObject' };
  } else {
    // 其他类型的文件加载逻辑...
  }
}

// 示例调用
(async () => {
  try {
    const { geometryOrScene, meshName } = await loadModel('/public/static/wu.obj', 'public', 'wu'); // 假设这里我们使用obj模型作为示例
    
    if (geometryOrScene && meshName) {
      geometryOrScene.name = meshName; // 确保geometryOrScene存在再设置name
      scene.add(geometryOrScene); // 将模型添加到场景
    } else {
      console.warn('Loaded model or mesh name is undefined.');
    }
  } catch (error) {
    console.error('Failed to load model:', error);
  }
})();
// (async () => {
//   try {
//     loadModel('/static/wu.stl', 'static', 'wu');
//     geometryOrScene.name = meshName;
//     scene.add(geometryOrScene);
//   } catch (error) {
//     console.error('Failed to load model:', error);
//   }
// })();