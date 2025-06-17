import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, brochureMesh, brochureTexture = null;
let deveRodar = false;

export function initBrochura3D() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, 600 / 400, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true});
    renderer.setSize(600, 400);

    const previewDiv = document.getElementById("preview3d");
    previewDiv.innerHTML = "";
    previewDiv.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 1, 2);
    scene.add(light);

    criarBrochuraMesh(2.1, 2.97); // Tamanho inicial A4
    camera.position.set(0, 0, 5); // x=0, y=0, z=5
    camera.lookAt(0, 0, 0);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    animate();

    document.getElementById("formato").addEventListener("change", atualizarTamanhoBrochura);
    document.getElementById("arquivo").addEventListener("change", onFileChange);
    atualizarRotacao();
}

function atualizarRotacao() {
    // Se quiseres rodar a brochura em algum caso, adapta aqui
    deveRodar = false;
}

function criarBrochuraMesh(largura, altura) {
    if (brochureMesh) scene.remove(brochureMesh);
    const geometry = new THREE.PlaneGeometry(largura, altura);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    brochureMesh = new THREE.Mesh(geometry, material);
    brochureMesh.rotation.x = 0;
    brochureMesh.rotation.z = 0;
    if (brochureTexture) {
        brochureMesh.material.map = brochureTexture;
        brochureMesh.material.needsUpdate = true;
    }
    brochureMesh.position.set(0, 0, 0); // Centralizar a brochura
    scene.add(brochureMesh);
}

function atualizarTamanhoBrochura() {
    const formato = document.getElementById("formato").value;
    let largura, altura;
    if (formato === "A4") {
        largura = 2.1;
        altura = 2.97;
    } else if (formato === "A5") {
        largura = 1.48;
        altura = 2.1;
    } else {
        largura = 2.1;
        altura = 2.97;
    }
    criarBrochuraMesh(largura, altura);
}

function onFileChange(event) {
    const file = event.target.files[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
        const reader = new FileReader();
        reader.onload = function (e) {
            aplicarTextura(e.target.result);
        };
        reader.readAsDataURL(file);
    } else {
        alert("Apenas imagens .jpg ou .png são suportadas para pré-visualização.");
    }
}

function aplicarTextura(imagemUrl) {
    const loader = new THREE.TextureLoader();
    loader.load(imagemUrl, function (texture) {
        brochureTexture = texture;
        if (brochureMesh) {
            brochureMesh.material.map = brochureTexture;
            brochureMesh.material.needsUpdate = true;
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    if (brochureMesh && deveRodar) brochureMesh.rotation.y += 0.01;
    renderer.render(scene, camera);
}