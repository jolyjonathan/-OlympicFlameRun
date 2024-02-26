import * as BABYLON from '@babylonjs/core';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'; // Add this import statement
import * as CANNON from 'cannon';
import 'babylonjs-loaders';
window.CANNON = CANNON;

const canvas = document.getElementById('renderCanvas');

const engine = new BABYLON.Engine(canvas);

let maxJump = 50; // La hauteur maximale du saut
let dim = 1000; // La taille du terrain

let camera;
let ground;

let keys = {};

let startTime = Date.now();
let sun;
let sunSphere;
let sunMaterial;
let moon;
let moonSphere;
let moonMaterial;
let flameLight;
var teleportZone

function createLights(scene) {
  sun = new BABYLON.DirectionalLight("sun", new BABYLON.Vector3(0, -1, 0), scene);
  sun.intensity = 0.5;
  sun.diffuse = new BABYLON.Color3(1, 1, 0.98);
  sun.specular = new BABYLON.Color3(1, 1, 1);

  sunSphere = BABYLON.MeshBuilder.CreateSphere("sunSphere", {diameter: 50}, scene);
  sunSphere.position = sun.position;

  sunMaterial = new BABYLON.StandardMaterial("sunMaterial", scene);
  sunMaterial.emissiveTexture = new BABYLON.Texture("textures/sun.jpg", scene);
  sunSphere.material = sunMaterial;

  moon = new BABYLON.DirectionalLight("moon", new BABYLON.Vector3(0, 1, 0), scene);
  moon.intensity = 1;
  moon.diffuse = new BABYLON.Color3(0.5, 0.5, 0.5);
  moon.specular = new BABYLON.Color3(0.5, 0.5, 0.5);

  moonSphere = BABYLON.MeshBuilder.CreateSphere("moonSphere", {diameter: 50}, scene);
  moonSphere.position = moon.position;

  moonMaterial = new BABYLON.StandardMaterial("moonMaterial", scene);
  moonMaterial.emissiveTexture = new BABYLON.Texture("textures/moon.jpg", scene); // Remplacez "textures/moon.jpg" par le chemin de votre texture de lune
  moonSphere.material = moonMaterial;

  flameLight = new BABYLON.PointLight("flameLight", new BABYLON.Vector3(0, 0, 0), scene);
  flameLight.intensity = 0.5;
}

window.addEventListener('keydown', function(event) {
  keys[event.code] = true;
});

window.addEventListener('keyup', function(event) {
  keys[event.code] = false;
});

function createCamera(scene) {
  camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(30, 2, -30), scene);
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
}

function createGround(scene) {
  ground = MeshBuilder.CreateGround("ground", { 
    width: dim, // la largeur du terrain
    height: dim, // la hauteur du terrain
    subdivisions: 150, // le nombre de subdivisions
    minHeight: 0, // la hauteur minimale
    maxHeight: dim/30, // la hauteur maximale
    scene: scene
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

    let groundHeight = 0; // Hauteur du sol pour un terrain plat
    camera.position.y = groundHeight + 3; // 3 est la hauteur des yeux d'un humain
    let isJumping = false;
    let newPosition = camera.position.clone();
    engine.runRenderLoop(function(){

      let time = (Date.now() - startTime) / 1000; // temps en secondes
      let speed = 2 * Math.PI / 360; // vitesse de rotation (1 tour toutes les 6 minutes)
      sun.direction = new BABYLON.Vector3(-Math.sin(time * speed), Math.cos(time * speed), 0);
      sunSphere.position = sun.direction.scale(500); // Remplacez -500 par la distance que vous voulez entre le soleil et l'origine

      moon.direction = new BABYLON.Vector3(Math.sin(time * speed), -Math.cos(time * speed), 0);
      moonSphere.position = moon.direction.scale(500); // Remplacez -500 par la distance que vous voulez entre la lune et l'origine

      if (keys['Space']) {
        isJumping = true;
      } else {
        isJumping = false;
      }
    
      let groundHeight = ground.getHeightAtCoordinates(camera.position.x, camera.position.z) ;
    
      if (isJumping && camera.position.y < groundHeight + maxJump) {
        camera.position.y += 1; // 1 est la vitesse de montée, augmentez cette valeur pour monter plus vite
      } else if (camera.position.y > groundHeight+3){
        camera.position.y -= 1; // 1 est la vitesse de descente, augmentez cette valeur pour descendre plus vite
      }
    
      let rightVector = new BABYLON.Vector3(1, 0, 0);
      let forwardVector = new BABYLON.Vector3(0, 0, 1);
      let leftVector = new BABYLON.Vector3(-1, 0, 0);
      let backwardVector = new BABYLON.Vector3(0, 0, -1);
          
      if (keys['KeyQ']) {
        let rotatedLeft = BABYLON.Vector3.TransformNormal(leftVector, camera.getWorldMatrix());
        newPosition.addInPlace(rotatedLeft);
      }
    
      if (keys['KeyD']) {
        let rotatedRight = BABYLON.Vector3.TransformNormal(rightVector, camera.getWorldMatrix());
        newPosition.addInPlace(rotatedRight);
      }
    
      if (keys['KeyZ']) {
        let rotatedForward = BABYLON.Vector3.TransformNormal(forwardVector, camera.getWorldMatrix());
        newPosition.addInPlace(rotatedForward);
      }
    
      if (keys['KeyS']) {
        let rotatedBackward = BABYLON.Vector3.TransformNormal(backwardVector, camera.getWorldMatrix());
        newPosition.addInPlace(rotatedBackward);
      }
    
      // Obtenir la hauteur du terrain à la nouvelle position
      groundHeight = ground.getHeightAtCoordinates(newPosition.x, newPosition.z);
    
      // Ajuster la position y de la caméra en fonction de la hauteur du terrain
      if (!isJumping && newPosition.y < groundHeight + 3) {
        newPosition.y = groundHeight + 3; // 3 est la hauteur des yeux d'un humain
      }
    
      // Déplacer la caméra à la nouvelle position
      camera.position = newPosition;
    
      scene.render();
    });
}

function createScene() {
  const scene = new BABYLON.Scene(engine);
  scene.enablePhysics();
  createCamera(scene);
  createGround(scene);
  createLights(scene);

  teleportZone = BABYLON.MeshBuilder.CreateCylinder("teleportZone", {height: 1, diameter: 20}, scene);
  teleportZone.position = new BABYLON.Vector3(-400, 1, -400); 

  let light = new BABYLON.PointLight("teleportZoneLight", teleportZone.position, scene);
  light.intensity = 0.5; 

  teleportZone.material = new BABYLON.StandardMaterial("teleportZoneMaterial", scene);

  let texture = new BABYLON.Texture("textures/portail.jpg", scene);
  texture.uScale = 0.1;
  texture.vOffset = 0.1; 
  teleportZone.material.diffuseTexture = texture;

  scene.registerBeforeRender(function () {
    texture.vOffset += 0.01; 
  });

  teleportZone.checkCollisions = true;

  camera.onCollide = function (collidedMesh) {
    if (collidedMesh === teleportZone) {
      loadMiniGameScene();
    }
  };

  return scene;
}


function loadMiniGameScene() {
  if (document.querySelector('script[src^="main.js"]')){
    localStorage.setItem('currentScene', 'arc');
    window.location.reload();
  }else{
    localStorage.setItem('currentScene', 'main');
    window.location.reload();
  }
}


const scene = createScene();
scene.ambientColor = new BABYLON.Color3(0.5, 0.5, 0.5); // Ajustez la couleur ambiante de la scène

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

