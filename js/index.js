'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MathEx = {
  degrees: function degrees(radian) {
    return radian / Math.PI * 180;
  },
  radians: function radians(degree) {
    return degree * Math.PI / 180;
  },
  clamp: function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },
  mix: function mix(x1, x2, a) {
    return x1 * (1 - a) + x2 * a;
  },
  polar: function polar(radian1, radian2, radius) {
    return [Math.cos(radian1) * Math.cos(radian2) * radius, Math.sin(radian1) * radius, Math.cos(radian1) * Math.sin(radian2) * radius];
  }
};

var debounce = function debounce(callback, duration) {
  var timer;
  return function (event) {
    clearTimeout(timer);
    timer = setTimeout(function () {
      callback(event);
    }, duration);
  };
};

var computeFaceNormal = function computeFaceNormal(v0, v1, v2) {
  var n = [];
  var v1a = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]];
  var v2a = [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]];
  n[0] = v1a[1] * v2a[2] - v1a[2] * v2a[1];
  n[1] = v1a[2] * v2a[0] - v1a[0] * v2a[2];
  n[2] = v1a[0] * v2a[1] - v1a[1] * v2a[0];
  var l = Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2], 2);
  for (var i = 0; i < n.length; i++) {
    n[i] = n[i] / l;
  }
  return n;
};

var SkyOctahedron = function () {
  function SkyOctahedron() {
    _classCallCheck(this, SkyOctahedron);

    this.uniforms = {
      time: {
        type: 'f',
        value: 0
      }
    };
    this.obj = this.createObj();
  }

  SkyOctahedron.prototype.createObj = function createObj() {
    var geometry = new THREE.OctahedronBufferGeometry(90, 4);
    var positions = geometry.attributes.position.array;
    var faceNormalsBase = [];
    var centersBase = [];
    var delaysBase = [];
    for (var i = 0; i < positions.length; i += 9) {
      var n = computeFaceNormal([positions[i + 0], positions[i + 1], positions[i + 2]], [positions[i + 3], positions[i + 4], positions[i + 5]], [positions[i + 6], positions[i + 7], positions[i + 8]]);
      faceNormalsBase.push(n[0], n[1], n[2], n[0], n[1], n[2], n[0], n[1], n[2]);
      var c = [(positions[i + 0] + positions[i + 3] + positions[i + 6]) / 3, (positions[i + 1] + positions[i + 4] + positions[i + 7]) / 3, (positions[i + 2] + positions[i + 5] + positions[i + 8]) / 3];
      var delay = Math.random() * 0.5;
      centersBase.push(c[0], c[1], c[2], c[0], c[1], c[2], c[0], c[1], c[2]);
      delaysBase.push(delay, delay, delay);
    }
    var faceNormals = new Float32Array(faceNormalsBase);
    var centers = new Float32Array(centersBase);
    var delays = new Float32Array(delaysBase);
    geometry.addAttribute('faceNormal', new THREE.BufferAttribute(faceNormals, 3));
    geometry.addAttribute('center', new THREE.BufferAttribute(centers, 3));
    geometry.addAttribute('delay', new THREE.BufferAttribute(delays, 1));
    return new THREE.Mesh(geometry, new THREE.RawShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: document.getElementById('vs').textContent,
      fragmentShader: document.getElementById('fs').textContent,
      shading: THREE.FlatShading,
      transparent: true,
      side: THREE.DoubleSide
    }));
  };

  SkyOctahedron.prototype.render = function render(time) {
    this.uniforms.time.value += time;
  };

  return SkyOctahedron;
}();

var SkyOctahedronShell = function () {
  function SkyOctahedronShell() {
    _classCallCheck(this, SkyOctahedronShell);

    this.uniforms = {
      time: {
        type: 'f',
        value: 0
      }
    };
    this.obj = this.createObj();
  }

  SkyOctahedronShell.prototype.createObj = function createObj() {
    var geometry = new THREE.OctahedronBufferGeometry(150, 4);
    return new THREE.Mesh(geometry, new THREE.RawShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: document.getElementById('vs-shell').textContent,
      fragmentShader: document.getElementById('fs-shell').textContent,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    }));
  };

  SkyOctahedronShell.prototype.render = function render(time) {
    this.uniforms.time.value += time;
  };

  return SkyOctahedronShell;
}();

var canvas = document.getElementById('canvas-webgl');
var renderer = new THREE.WebGLRenderer({
  antialias: false,
  canvas: canvas
});
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
var clock = new THREE.Clock();

var skyOctahedron = new SkyOctahedron();
var skyOctahedronShell = new SkyOctahedronShell();

var resizeWindow = function resizeWindow() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};
var render = function render() {
  var time = clock.getDelta();
  skyOctahedron.render(time);
  skyOctahedronShell.render(time);
  renderer.render(scene, camera);
};
var renderLoop = function renderLoop() {
  render();
  requestAnimationFrame(renderLoop);
};
var on = function on() {
  window.addEventListener('resize', debounce(function () {
    resizeWindow();
  }), 1000);
};

var init = function init() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x111111, 1.0);
  camera.position.set(0, 400, 600);
  camera.lookAt(new THREE.Vector3());

  scene.add(skyOctahedron.obj);
  scene.add(skyOctahedronShell.obj);
  on();
  resizeWindow();
  renderLoop();
};
init();