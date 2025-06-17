import * as THREE from 'three';
let scene, camera, renderer, cardMesh, cardTexture = null;
let deveRodar = false;

export function initCartao3D() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, 600 / 400, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(600, 400);

    const previewDiv = document.getElementById("preview3d");
    previewDiv.innerHTML = "";
    previewDiv.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 1, 2);
    scene.add(light);

    criarCardMesh(1.7, 1.1); // Tamanho inicial (5,5x8,5cm em proporção)

    camera.position.set(0, 0, 4); // x=0, y=0, z=4
    camera.lookAt(0, 0, 0);
    animate();

    document.getElementById("tamanho").addEventListener("change", atualizarTamanhoCard);
    document.getElementById("arquivo").addEventListener("change", onFileChange);
    document.getElementById("impressao").addEventListener("change", atualizarRotacao);
    atualizarRotacao();
}

function atualizarRotacao() {
    const impressao = document.getElementById("impressao").value;
    deveRodar = (impressao === "frente verso");
}

function criarCardMesh(largura, altura) {
    if (cardMesh) scene.remove(cardMesh);
    const geometry = new THREE.PlaneGeometry(largura, altura);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff,side: THREE.DoubleSide});
    cardMesh = new THREE.Mesh(geometry, material);
    cardMesh.rotation.x = 0;
    cardMesh.rotation.z = 0;
    if (cardTexture) {
        cardMesh.material.map = cardTexture;
        cardMesh.material.needsUpdate = true;
    }
    scene.add(cardMesh);
}

function atualizarTamanhoCard() {
    const tamanho = document.getElementById("tamanho").value;
    let largura, altura;
    if (tamanho === "5,5x8,5") {
        largura = 1.7;
        altura = 1.1;
    } else if (tamanho === "7,5x10,5") {
        largura = 2.1;
        altura = 1.5;
    } else if (tamanho === "10x10") {
        largura = 2.0;
        altura = 2.0;
    } else {
        largura = 1.7;
        altura = 1.1;
    }
    criarCardMesh(largura, altura);
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
        cardTexture = texture;
        if (cardMesh) {
            cardMesh.material.map = cardTexture;
            cardMesh.material.needsUpdate = true;
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    if (cardMesh && deveRodar) cardMesh.rotation.y += 0.01;
    renderer.render(scene, camera);
}