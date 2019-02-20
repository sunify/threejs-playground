import * as THREE from 'three';
import * as dat from 'dat.gui';
import runWithFps from 'run-with-fps';

const options = {
  rotationSpeed: 0.02,
  bouncingSpeed: 0.03,
  objects: [],
  addSphere() {
    const size = 4 * Math.random();
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(size, 20, 20),
      new THREE.MeshLambertMaterial({
        color: `hsl(${306 * Math.random()}, 100%, 50%)`
      })
    );
    sphere.size = size;
    sphere.velocity = new THREE.Vector3(0, Math.random() * -0.2, 0);
    sphere.acceleration = new THREE.Vector3(0, Math.random() * -0.02, 0);
    sphere.position.set(
      30 * (0.5 - Math.random()),
      20 * Math.random() + size,
      30 * (0.5 - Math.random())
    );
    sphere.castShadow = true;
    scene.add(sphere);
    this.objects.push(sphere);
  },
  removeSpere() {
    scene.remove(this.objects.pop());
  }
};

const gui = new dat.GUI();
gui.add(options, 'bouncingSpeed', 0, 0.5);
gui.add(options, 'addSphere');
gui.add(options, 'removeSpere');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const axes = new THREE.AxesHelper(20);
scene.add(axes);

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(60, 60),
  new THREE.MeshLambertMaterial({ color: 0xaaaaaa })
);
plane.position.set(0, 0, 0);
plane.rotation.x = -0.5 * Math.PI;
plane.receiveShadow = true;
scene.add(plane);

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(4, 20, 20),
  new THREE.MeshLambertMaterial({ color: 0x7777ff })
);
sphere.position.set(20, 4, 2);
sphere.castShadow = true;
scene.add(sphere);

const spotLight = new THREE.SpotLight(0xffffff);
spotLight.position.set(-10, 40, -35);
spotLight.castShadow = true;
spotLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
spotLight.shadow.camera.far = 130;
spotLight.shadow.camera.near = 40;
scene.add(spotLight);

camera.position.set(-30, 40, 30);
camera.lookAt(scene.position);

let t = 0;
const stop = runWithFps(() => {
  t += options.bouncingSpeed;

  options.objects.forEach(o => {
    o.velocity.add(o.acceleration);
    o.position.add(o.velocity);
    if (o.position.y < o.size) {
      o.acceleration.y *= 0.7;
      o.velocity.y *= -0.9;
    }
  });

  sphere.position.x = 20 + 10 * Math.cos(t);
  sphere.position.y = 2 + 10 * Math.abs(Math.sin(t));
  renderer.render(scene, camera);
}, 30);

const handleResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

window.addEventListener('resize', handleResize, false);

// Handle hot module replacement
if (module.hot) {
  module.hot.dispose(() => {
    window.removeEventListener('resize', handleResize, false);
    document.body.removeChild(renderer.domElement);
    const dgRoot = document.querySelector('body > .dg');
    if (dgRoot) {
      dgRoot.removeChild(dgRoot.querySelector('.dg.main'));
    }
    if (stop) {
      stop();
    }
  });
}
