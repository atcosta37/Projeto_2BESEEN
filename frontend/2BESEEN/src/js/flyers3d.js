import * as THREE from 'three';

let scene, camera, renderer, flyerMesh, flyerTexture = null;
let deveRodar = false;

export function initFlyer3D() {
    // Inicializa cena
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, 600 / 400, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(500, 400);

    // Limpa e adiciona o canvas ao preview
    const previewDiv = document.getElementById("preview3d");
    previewDiv.innerHTML = "";
    previewDiv.appendChild(renderer.domElement);

    // Luz
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 1, 2);
    scene.add(light);

    // Flyer inicial (A4)
    criarFlyerMesh(2.1, 2.97);

    camera.position.z = 5;
    animate();

    // Eventos
    document.getElementById("tamanho").addEventListener("change", atualizarTamanhoFlyer);
    document.getElementById("arquivo").addEventListener("change", onFileChange);
    document.getElementById("impressao").addEventListener("change", atualizarRotacao); // NOVO
    atualizarRotacao();
} 
function atualizarRotacao() {
    const impressao = document.getElementById("impressao").value;
    deveRodar = (impressao === "frente verso");
}

function criarFlyerMesh(largura, altura) {
    if (flyerMesh) scene.remove(flyerMesh);
    const geometry = new THREE.PlaneGeometry(largura, altura);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff,  side: THREE.DoubleSide  });
    flyerMesh = new THREE.Mesh(geometry, material);
    flyerMesh.rotation.x = 0;
    flyerMesh.rotation.z = 0;
    // Reaplica textura se já houver
    if (flyerTexture) {
        flyerMesh.material.map = flyerTexture;
        flyerMesh.material.needsUpdate = true;
    }
    scene.add(flyerMesh);
}
    
function atualizarTamanhoFlyer() {
    const tamanho = document.getElementById("tamanho").value;
    let largura, altura;
    if (tamanho === "A4") {
        largura = 2.1;
        altura = 2.97;
    } else if (tamanho === "A5") {
        largura = 1.48;
        altura = 2.1;
    } else {
        largura = 2.1;
        altura = 2.97;
    }
    criarFlyerMesh(largura, altura);
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
        flyerTexture = texture;
        if (flyerMesh) {
            flyerMesh.material.map = flyerTexture;
            flyerMesh.material.needsUpdate = true;
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    if (flyerMesh && deveRodar) flyerMesh.rotation.y += 0.01;
    renderer.render(scene, camera);
}