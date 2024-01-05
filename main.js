import * as BABYLON from '@babylonjs/core';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'; // Add this import statement
import * as CANNON from 'cannon';
window.CANNON = CANNON;

const canvas = document.getElementById('renderCanvas');

const engine = new BABYLON.Engine(canvas);

let maxJump = 50; // La hauteur maximale du saut
let dim = 1000; // La taille du terrain

let camera;
let ground;

let keys = {};

window.addEventListener('keydown', function(event) {
  keys[event.code] = true;
});

window.addEventListener('keyup', function(event) {
  keys[event.code] = false;
});

const createScene = function(){
  const scene = new BABYLON.Scene(engine);

  scene.enablePhysics();

  // Créer une caméra universelle
  let camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 2, -10), scene);
  // Activer les collisions de la caméra
  camera.checkCollisions = true;
  // Attacher le contrôle de la caméra au canvas
  camera.attachControl(canvas, true);
  camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);

  // Remapper les touches de contrôle pour utiliser ZQSD à la place de WASD
  camera.keysUp = [90]; // Z
  camera.keysDown = [83]; // S
  camera.keysLeft = [81]; // Q
  camera.keysRight = [68]; // D
  camera.keysSpace = ['Space']; // la touche d'espace
  // Supprimer les touches WASD par défaut
  camera.keysUp = camera.keysUp.filter(k => k !== 87); // W
  camera.keysDown = camera.keysDown.filter(k => k !== 83); // S
  camera.keysLeft = camera.keysLeft.filter(k => k !== 65); // A
  camera.keysRight = camera.keysRight.filter(k => k !== 68); // D
  
  // Créer un terrain à partir d'une image en niveaux de gris
  ground = MeshBuilder.CreateGroundFromHeightMap("ground", "heightmap/img6.png", { // Update the method call
    width: dim, // la largeur du terrain
    height: dim, // la hauteur du terrain
    subdivisions: 150, // le nombre de subdivisions
    minHeight: 0, // la hauteur minimale
    maxHeight: dim/50, // la hauteur maximale
    scene: scene,
    onReady: () => {
      // Positionner la caméra au niveau du sol une fois que la carte de hauteur est chargée
      camera.position.y = ground.getHeightAtCoordinates(camera.position.x, camera.position.z) + 3; // 2 est la hauteur des yeux d'un humain
      engine.runRenderLoop(function(){
        if (keys['Space'] && camera.position.y < ground.getHeightAtCoordinates(camera.position.x,camera.position.y)+maxJump) {
          camera.position.y += 1; // 1 est la vitesse de montée, augmentez cette valeur pour monter plus vite
        } else if (camera.position.y >= ground.getHeightAtCoordinates(camera.position.x,camera.position.y)+3){
          camera.position.y -= 1; // 1 est la vitesse de descente, augmentez cette valeur pour descendre plus vite
        }

        let newPosition = camera.position.clone();

        if (keys['KeyQ'] && camera.position.x > -dim) {
          newPosition.addInPlace(new BABYLON.Vector3(-1, 0, 0));
        }
        
        if (keys['KeyD'] && camera.position.x < dim) {
          newPosition.addInPlace(new BABYLON.Vector3(1, 0, 0));
        }
        
        if (keys['KeyZ'] && camera.position.z > -dim) {
          newPosition.addInPlace(new BABYLON.Vector3(0, 0, 1));
        }
        
        if (keys['KeyS'] && camera.position.z < dim) {
          newPosition.addInPlace(new BABYLON.Vector3(0, 0, -1));
        }
      
        // Obtenir la hauteur du terrain à la nouvelle position
        let groundHeight = ground.getHeightAtCoordinates(newPosition.x, newPosition.z);
      
        // Ajuster la position y de la caméra en fonction de la hauteur du terrain
        newPosition.y = groundHeight + 3; // 3 est la hauteur des yeux d'un humain
      
        // Déplacer la caméra à la nouvelle position
        camera.position = newPosition;

        scene.render();
      });
    }
  });
  // Activer les collisions du sol
  ground.checkCollisions = true;

  // Créer une texture d'herbe
  const grassMaterial = new BABYLON.StandardMaterial("grass", scene);
  grassMaterial.diffuseTexture = new BABYLON.Texture("textures/grass.avif", scene);
  grassMaterial.diffuseTexture.uScale = 50; // Répéter la texture 50 fois sur l'axe U
  grassMaterial.diffuseTexture.vScale = 50; // Répéter la texture 50 fois sur l'axe V
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

window.addEventListener('resize', function(){
  engine.resize();
});

// Forcer le focus sur le canvas lorsque l'utilisateur clique n'importe où sur la page
window.addEventListener('click', function() {
  canvas.focus();
});

// Activer le mode "pointer lock" lorsque l'utilisateur clique sur le canvas
canvas.addEventListener('click', function() {
  // Vérifier si le pointeur est déjà verrouillé
  if (document.pointerLockElement !== canvas) {
    canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
    canvas.requestPointerLock();
  }
});
