import * as BABYLON from '@babylonjs/core';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'; // Add this import statement

const canvas = document.getElementById('renderCanvas');

const engine = new BABYLON.Engine(canvas);

let isJumping = false;

const createScene = function(){
  const scene = new BABYLON.Scene(engine);

  // Créer une caméra universelle
  const camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 0, -10), scene);
  camera.attachControl(canvas, true);

  // Activer la gravité
  scene.gravity = new BABYLON.Vector3(0, -9.81, 0);

  // Activer les collisions de la caméra
  camera.checkCollisions = true;
  camera.applyGravity = true;

  // Remapper les touches de contrôle pour utiliser ZQSD à la place de WASD
  camera.keysUp = [90]; // Z
  camera.keysDown = [83]; // S
  camera.keysLeft = [81]; // Q
  camera.keysRight = [68]; // D
  camera.keysSpace = ['Space']; // la touche d'espace


  // Supprimer les touches WASD par défaut
  camera.keysUp = camera.keysUp.filter(k => k !== '87'); // W
  camera.keysDown = camera.keysDown.filter(k => k !== '83'); // S
  camera.keysLeft = camera.keysLeft.filter(k => k !== '65'); // A
  camera.keysRight = camera.keysRight.filter(k => k !== '68'); // D

  // Attacher le contrôle de la caméra au canvas
  camera.attachControl(canvas, true);
  
  // Créer un terrain à partir d'une image en niveaux de gris
  const ground = MeshBuilder.CreateGroundFromHeightMap("ground", "heightmap/img5.jpg", { // Update the method call
    width: 200, // la largeur du terrain
    height: 200, // la hauteur du terrain
    subdivisions: 100, // le nombre de subdivisions
    minHeight: 0, // la hauteur minimale
    maxHeight: 50, // la hauteur maximale
    scene: scene,
    onReady: () => {
      // Positionner la caméra au niveau du sol une fois que la carte de hauteur est chargée
      camera.position.y = ground.getHeightAtCoordinates(camera.position.x, camera.position.z) + 2; // 2 est la hauteur des yeux d'un humain
    }
  });

  // Activer les collisions du sol
  ground.checkCollisions = true;

  // Créer une texture d'herbe
  const grassMaterial = new BABYLON.StandardMaterial("grass", scene);
  grassMaterial.diffuseTexture = new BABYLON.Texture("textures/grass.avif", scene);
  grassMaterial.normalTexture = new BABYLON.Texture("textures/grass_NORM.avif", scene);
  grassMaterial.specularColor = new BABYLON.Color3(0, 0, 0); // Réglez la couleur spéculaire sur noir pour éviter les reflets
  grassMaterial.roughness = 0.8; // Ajustez la rugosité selon vos besoins


  // Appliquer la texture d'herbe au sol
  ground.material = grassMaterial;
  ground.material.anisotropicFilteringLevel = 16; // Valeur arbitraire, ajustez selon vos besoins
  ground.material.diffuseTexture.updateSamplingMode(BABYLON.Texture.BILINEAR_SAMPLINGMODE);

  return scene;
}

const scene = createScene();

scene.ambientColor = new BABYLON.Color3(0.5, 0.5, 0.5); // Ajustez la couleur ambiante de la scène

// Créer une lumière directionnelle (le soleil)
const sun = new BABYLON.DirectionalLight("sun", new BABYLON.Vector3(-1, -1, -1), scene);

// Définir l'intensité de la lumière
sun.intensity = 1;

// Définir la couleur de la lumière
sun.diffuse = new BABYLON.Color3(1, 1, 0.98); // une couleur légèrement jaune
sun.specular = new BABYLON.Color3(1, 1, 1);

engine.runRenderLoop(function(){
  scene.render();
});

window.addEventListener('resize', function(){
  engine.resize();
});

// Forcer le focus sur le canvas lorsque l'utilisateur clique n'importe où sur la page
window.addEventListener('click', function() {
  canvas.focus();
});

// Activer le mode "pointer lock" lorsque l'utilisateur clique sur le canvas
canvas.addEventListener('click', function() {
  canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
  canvas.requestPointerLock();
});

canvas.addEventListener('keydown', function (event) {
  if (event.code === 'Space') {
    if (!isJumping) {
      isJumping = true;
      // Ajoutez ici la logique pour le saut, par exemple augmenter la position Y de la caméra
      camera.position.y += 5; // Modifiez cela en fonction de la hauteur de saut souhaitée
    }
  }
});

canvas.addEventListener('keyup', function (event) {
  if (event.code === 'Space') {
    isJumping = false;
    // Ajoutez ici la logique supplémentaire si nécessaire lors du relâchement de la touche de saut
  }
});