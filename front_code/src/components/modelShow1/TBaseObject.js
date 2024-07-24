import * as THREE from 'three';
// import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
export const allBaseObject = [];

// 假设您已经通过某种方式引入了 THREE.js  

function getModelLoader(fileType) {
  switch (fileType) {
    // case 'stl':
    //   return new STLLoader(); // 注意这里添加了 THREE  
    case 'gltf':
    case 'glb':
      return new GLTFLoader(); // 注意这里添加了 THREE  
    case 'obj':
      // 对于 .obj 文件，我们返回 null 或一个特殊的标记，因为我们需要单独处理 .obj 和 .mtl  
      return 'OBJ'; // 或者您可以返回一个对象，其中包含加载 .obj 和 .mtl 所需的逻辑  
    default:
      throw new Error('Unsupported file type');
  }
}

async function loadModel(url, baseURL, modelName) { 
  const fileExtension = url.split('.').pop().toLowerCase();
  let loader; 
  let geometryOrScene;
  let meshName = '';

  if (fileExtension === 'obj') {
    // 加载 .mtl 和 .obj 文件  
    const mtlLoader = new MTLLoader();
    mtlLoader.setPath(baseURL); // 设置 .mtl 文件的路径  
    const materials = await new Promise((resolve, reject) => {
      mtlLoader.load(
        `${modelName}.mtl`, // 假设 .mtl 文件与 .obj 文件在同一个目录下  
        function (materials) {
          materials.preload();
          resolve(materials);
        },
        undefined, // 进度回调（如果需要）  
        function (error) {
          reject(error);
        }
      );
    });

    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    geometryOrScene = await new Promise((resolve, reject) => {
      objLoader.load(
        `${modelName}.obj`, // 假设 .obj 文件与 .mtl 文件在同一个目录下  
        function (obj) {
          resolve(obj);
        },
        undefined, // 进度回调（如果需要）  
        function (error) {
          reject(error);
        }
      );
    });
    meshName = 'objObject'; // 注意这里使用了单个 = 进行赋值  
  } else {
    loader = getModelLoader(fileExtension);
    try {
      if (loader instanceof STLLoader) {
        const geometry = await loader.loadAsync(url);
        const material = new MeshStandardMaterial({ color: 0x606060 });
        const stlMesh = new Mesh(geometry, material);
        meshName = 'stlObject';
      } else if (loader instanceof GLTFLoader) {
        const gltf = await loader.loadAsync(url);
        const gltfMesh = gltf.scene ? gltf.scene : gltf.scenes[0];
        meshName = 'gltfObject';
        geometryOrScene = gltfMesh;
      }

    } catch (error) {
      // 处理错误  
    }
  }


  return { geometryOrScene, meshName };
}
loadModel('public/static/wu.stl', 'public/static', 'wu')
  .then(({ geometryOrScene, meshName }) => {
    geometryOrScene.name = meshName;
    scene.add(geometryOrScene);
  })
  .catch(error => console.error('Failed to load model:', error));
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new MeshStandardMaterial({ color: 0xff0000 });
export const box = new Mesh(boxGeometry, boxMaterial);
box.name = 'box';
allBaseObject.push(box);