import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
export const allBaseObject = [];

// 假设您已经通过某种方式引入了 THREE.js  

function getModelLoader(fileType) {
  switch (fileType) {
    case 'stl':
      return new STLLoader(); // 注意这里添加了 THREE  
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
  let geometryOrScene = null;
  let meshName = '';

  if (fileExtension === 'obj') {
    // 加载 .mtl 和 .obj 文件  
    const mtlLoader = new MTLLoader();
    mtlLoader.setPath(baseURL);
    const materials = await new Promise((resolve, reject) => {
      mtlLoader.load(
        `${modelName}.mtl`,
        resolve,
        undefined,
        reject
      );
    });

    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    geometryOrScene = await new Promise((resolve, reject) => {
      objLoader.load(
        `${modelName}.obj`,
        resolve,
        undefined,
        reject
      );
    });
    meshName = 'objObject';
  } else {
    const loader = getModelLoader(fileExtension);
    if (loader === 'OBJ') {
      // Handle OBJ case separately since it's a special case here.
      // Ideally, you would have the actual loader setup for OBJ.
      // This part should be replaced with actual loading logic.
      throw new Error('OBJ loading not implemented in this snippet.');
    } else if (loader instanceof GLTFLoader) {
      try {
        const gltf = await loader.loadAsync(url);
        geometryOrScene = gltf.scene || gltf.scenes[0];
        meshName = 'gltfObject';
      } catch (error) {
        throw error; // Re-throwing the error to be handled outside
      }
    } else if (loader instanceof STLLoader) {
      // Assuming a hypothetical async loading method for STL
      geometryOrScene = await new Promise((resolve, reject) => {
        loader.load(url, (geometry) => {
          const material = new THREE.MeshStandardMaterial({ color: 0x606060 });
          const stlMesh = new THREE.Mesh(geometry, material);
          resolve(stlMesh);
        }, undefined, reject);
      });
      meshName = 'stlObject';
    }
  }

  if (!geometryOrScene) {
    throw new Error('No geometry or scene was loaded.');
  }

  return { geometryOrScene, meshName };
}
loadModel('public/static/girl_model.glb', 'public/static', 'girl_model')
  .then(({ geometryOrScene, meshName }) => {
    geometryOrScene.name = meshName;
    scene.add(geometryOrScene);
  })
  .catch(error => console.error('Failed to load model:', error));
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
export const box = new THREE.Mesh(boxGeometry, boxMaterial);
box.name = 'box';
allBaseObject.push(box);