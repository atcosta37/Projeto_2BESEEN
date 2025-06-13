let scene, camera, renderer, formatoMesh, formatoTexture= null;

export function initGrandeFormato3D() {
    // Inicializar cena apenas uma vez
    if (scene) return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, 500 / 400, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(500, 400);

    const previewDiv = document.getElementById("preview3d");
    previewDiv.innerHTML = "";
    previewDiv.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 1, 2);
    scene.add(light);

    criarFormatoMesh();
    camera.position.z = 3;
    animate();

    // Atualizar preview ao mudar largura/altura
    document.getElementById("largura").addEventListener("input", atualizarFormato3D);
    document.getElementById("altura").addEventListener("input", atualizarFormato3D);
    document.getElementById("arquivo").addEventListener("change", onFileChange);
}

function criarFormatoMesh() {
    if (formatoMesh) scene.remove(formatoMesh);
    // Escala: 1 unidade = 10cm (ajusta conforme preferires)
    const largura = (parseFloat(document.getElementById("largura").value) || 100) / 100;
    const altura = (parseFloat(document.getElementById("altura").value) || 100) / 100;
    const geometry = new THREE.PlaneGeometry(largura, altura);
    let material;
    if (formatoTexture) {
        material = new THREE.MeshStandardMaterial({ map: formatoTexture});
    } else {
        material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    }
    formatoMesh = new THREE.Mesh(geometry, material);
    scene.add(formatoMesh);
}

function atualizarFormato3D() {
    criarFormatoMesh();
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
        formatoTexture = texture;
        if (formatoMesh) {
            formatoMesh.material.map = formatoTexture;
            formatoMesh.material.needsUpdate = true;
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}