import {
  Vector3,
  Color,
  PerspectiveCamera,
  Scene,
  Fog,
  HemisphereLight,
  Raycaster,
  PlaneGeometry,
  SRGBColorSpace,
  Float32BufferAttribute,
  MeshBasicMaterial,
  Mesh,
  BoxGeometry,
  MeshPhongMaterial,
  WebGLRenderer,
  EquirectangularReflectionMapping,
  ACESFilmicToneMapping,
  TextureLoader,
  RepeatWrapping,
  MeshStandardMaterial,
} from "three";

import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";

let camera, scene, renderer, controls;

const objects = [];

let raycaster;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
const velocity = new Vector3();
const direction = new Vector3();

init();

function init() {
  camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.y = 1.7;

  scene = new Scene();

  controls = new PointerLockControls(camera, document.body);

  const blocker = document.getElementById("blocker");
  const instructions = document.getElementById("instructions");
  const vertex = new Vector3();
  const color = new Color();

  instructions.addEventListener("click", function () {
    controls.lock();
  });

  controls.addEventListener("lock", function () {
    instructions.style.display = "none";
    blocker.style.display = "none";
  });

  controls.addEventListener("unlock", function () {
    blocker.style.display = "block";
    instructions.style.display = "";
  });

  scene.add(controls.getObject());

  const onKeyDown = function (event) {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        moveForward = true;
        break;

      case "ArrowLeft":
      case "KeyA":
        moveLeft = true;
        break;

      case "ArrowDown":
      case "KeyS":
        moveBackward = true;
        break;

      case "ArrowRight":
      case "KeyD":
        moveRight = true;
        break;

      case "Space":
        if (canJump === true) velocity.y += 350;
        canJump = false;
        break;
    }
  };

  const onKeyUp = function (event) {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        moveForward = false;
        break;

      case "ArrowLeft":
      case "KeyA":
        moveLeft = false;
        break;

      case "ArrowDown":
      case "KeyS":
        moveBackward = false;
        break;

      case "ArrowRight":
      case "KeyD":
        moveRight = false;
        break;
    }
  };

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  raycaster = new Raycaster(new Vector3(), new Vector3(0, -1, 0), 0, 10);

  // floor

  let floorTexture = new TextureLoader().load("textures/floorpicture.png");
  floorTexture.wrapS = floorTexture.wrapT = RepeatWrapping;
  floorTexture.repeat.set(1000, 1000);
  floorTexture.anisotropy = 16;

  let floorMaterial = new MeshStandardMaterial({ map: floorTexture });
  let floorGeometry = new PlaneGeometry(1000, 1000);
  let floorMesh = new Mesh(floorGeometry, floorMaterial);
  floorMesh.position.set(0, 0, 0);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.receiveShadow = true;
  scene.add(floorMesh);

  // let floorGeometry = new PlaneGeometry(2000, 2000, 100, 100);
  // floorGeometry.rotateX(-Math.PI / 2);

  // // vertex displacement

  // let position = floorGeometry.attributes.position;

  // for (let i = 0, l = position.count; i < l; i++) {
  //   vertex.fromBufferAttribute(position, i);

  //   vertex.x += Math.random() * 20 - 10;
  //   vertex.y = 0;
  //   vertex.z += Math.random() * 20 - 10;

  //   position.setXYZ(i, vertex.x, vertex.y, vertex.z);
  // }

  // floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices

  // position = floorGeometry.attributes.position;
  // const colorsFloor = [];

  // for (let i = 0, l = position.count; i < l; i++) {
  //   color.setHSL(
  //     Math.random() * 0.3 + 0.5,
  //     0.75,
  //     Math.random() * 0.25 + 0.75,
  //     SRGBColorSpace
  //   );
  //   colorsFloor.push(color.r, color.g, color.b);
  // }

  // floorGeometry.setAttribute(
  //   "color",
  //   new Float32BufferAttribute(colorsFloor, 3)
  // );

  // const floorMaterial = new MeshBasicMaterial({ vertexColors: true });

  // const floor = new Mesh(floorGeometry, floorMaterial);
  // scene.add(floor);

  //gltf
  new RGBELoader()
    .setPath("./textures/")
    .load("kloofendal_48d_partly_cloudy_puresky_4k.hdr", function (texture) {
      texture.mapping = EquirectangularReflectionMapping;

      scene.background = texture;
      scene.environment = texture;

      // model
      const loader = new GLTFLoader().setPath("./models/");

      loader.load("exhibition_booth.glb", async function (gltf) {
        const model = gltf.scene;
        model.position.set(4, 0, 8);
        model.rotation.set(0, -Math.PI, 0);
        await renderer.compileAsync(model, camera, scene);

        scene.add(model);
      });
      loader.load("venus_exhibition_stall_design.glb", async function (gltf) {
        const model = gltf.scene;
        model.position.set(10, 0, 10);
        model.rotation.set(0, -Math.PI, 0);
        await renderer.compileAsync(model, camera, scene);

        scene.add(model);
      });
      loader.load("exhibition_booth.glb", async function (gltf) {
        const model = gltf.scene;
        model.position.set(20, 0, 8);
        model.rotation.set(0, -Math.PI, 0);
        await renderer.compileAsync(model, camera, scene);

        scene.add(model);
      });

      loader.load("stand_is_being_constructed.glb", async function (gltf) {
        const model = gltf.scene;
        model.position.set(8, 0, 2);
        model.scale.set(0.01, 0.01, 0.01); 
        await renderer.compileAsync(model, camera, scene);

        scene.add(model);
      });
      loader.load("venus_exhibition_stall_design.glb", async function (gltf) {
        const model = gltf.scene;
        model.position.set(20, 0, 0);

        await renderer.compileAsync(model, camera, scene);

        scene.add(model);
      });
      loader.load("venus_exhibition_stall_design.glb", async function (gltf) {
        console.log("Model loaded");

        const model = gltf.scene;

        console.log("Model scene", model);

        await renderer.compileAsync(model, camera, scene);

        scene.add(model);
        console.log("Model added to scene");
      });

      // loader.load("expo_books.glb", async function (gltf) {
      //   const model1 = gltf.scene;
      //   model1.position.set(0, 30, 0)
      //   model1.scale.set(0.1,0.1,0.1)

      //   await renderer.compileAsync(model1, camera, scene);

      //   scene.add(model1);
      // });
    });
  //

  renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  document.body.appendChild(renderer.domElement);

  //

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  const time = performance.now();

  if (controls.isLocked === true) {
    raycaster.ray.origin.copy(controls.getObject().position);
    raycaster.ray.origin.y -= 10;

    const intersections = raycaster.intersectObjects(objects, false);

    const onObject = intersections.length > 0;

    const delta = (time - prevTime) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize(); // this ensures consistent movements in all directions

    if (moveForward || moveBackward) velocity.z -= direction.z * 40.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 40.0 * delta;

    if (onObject === true) {
      velocity.y = Math.max(0, velocity.y);
      canJump = true;
    }

    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);

    controls.getObject().position.y += velocity.y * delta; // new behavior

    if (controls.getObject().position.y < 1.7) {
      velocity.y = 0;
      controls.getObject().position.y = 1.7;

      canJump = true;
    }
  }

  prevTime = time;

  renderer.render(scene, camera);
}
