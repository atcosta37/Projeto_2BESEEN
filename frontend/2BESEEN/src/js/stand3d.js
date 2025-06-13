import * as THREE from 'three';
       import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
        // --- Three.js setup ---
        let scene, camera, renderer, standMesh, controls = {};
        let objetos = [];
        let selectedObject = null;
        let raycaster = new THREE.Raycaster();
        let mouse = new THREE.Vector2();
        let offset = new THREE.Vector3();
        let dragging = false;
        let baseLargura = 3; 
        let baseProfundidade = 3;
        function init() {
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(45, 1.8, 0.1, 1000);
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(900, 500);
            document.getElementById("stand3d").appendChild(renderer.domElement);


            controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true; // movimento suave
            controls.dampingFactor = 0.08;
            controls.screenSpacePanning = false;
            controls.minDistance = 2;
            controls.maxDistance = 30;
            controls.target.set(0, 0.75, 0); // centro do stand
            controls.update();
            criarBase();
            ajustarRenderAoTamanhoBase();

            // Luz
            const light = new THREE.DirectionalLight(0xffffff, 1);
            light.position.set(2, 5, 5);
            scene.add(light);

            camera.position.set(0, 4, -5);
            camera.lookAt(0, 0, 0);

            renderer.domElement.addEventListener('mousedown', onMouseDown, false);
            renderer.domElement.addEventListener('mousemove', onMouseMove, false);
            renderer.domElement.addEventListener('mouseup', onMouseUp, false);
            window.addEventListener('keydown', onKeyDown, false);

            animate();
        }
        
        function ajustarCameraParaIlha() {
        const maior = Math.max(baseLargura, baseProfundidade);
        camera.position.set(0, maior * 1.2, -maior * 1.5);
        camera.lookAt(0, 0, 0);
    }
        function criarBase() {
            if (standMesh) scene.remove(standMesh);
            const standGeo = new THREE.BoxGeometry(baseLargura, 0.1, baseProfundidade);
            const standMat = new THREE.MeshStandardMaterial({ color: "#cccccc" });
            standMesh = new THREE.Mesh(standGeo, standMat);
            standMesh.position.set(0, -0.05, 0);
            scene.add(standMesh);
            ajustarRenderAoTamanhoBase();
        }

        function alterarBase() {
            const select = document.getElementById("tamanhoBase");
            const [largura, profundidade] = select.value.split('x').map(Number);
            baseLargura = largura;
            baseProfundidade = profundidade;

            objetos.forEach(obj => scene.remove(obj));
            objetos = [];
            criarBase();
            const ilha = document.getElementById("ilhaCheckbox").checked;
            if (ilha) {
                ajustarCameraParaIlha();
            }
        }
        function ajustarRenderAoTamanhoBase() {
            const larguraPx = window.innerWidth;
            const alturaPx = window.innerHeight;
            const div = document.getElementById("stand3d");
            div.style.width = larguraPx + "px";
            div.style.height = alturaPx + "px";
            renderer.setSize(larguraPx, alturaPx);
            camera.aspect = larguraPx / alturaPx;
            camera.updateProjectionMatrix();
        }
        window.addEventListener('resize', ajustarRenderAoTamanhoBase);
        function atualizarOpcoesBase() {
            const ilha = document.getElementById("ilhaCheckbox").checked;
            const select = document.getElementById("tamanhoBase");
            select.innerHTML = ""; // Limpa as opções

            if (ilha) {
                select.innerHTML += '<option value="6x6">6x6</option>';
                select.innerHTML += '<option value="9x9">9x9</option>';
            } else {
                select.innerHTML += '<option value="3x3">3x3</option>';
                select.innerHTML += '<option value="6x3">3x6</option>';
                select.innerHTML += '<option value="9x3">3x9</option>';
            }
            alterarBase(); // Atualiza a base para o novo valor selecionado
        }
        function atualizarPrecoTotal() {
            let total = 0;
            objetos.forEach(obj => {
                if (obj.userData.tipo === 'cadeira') total += precoCadeira;
                else if (obj.userData.tipo === 'mesa') total += precoMesa;
                else if (obj.userData.tipo === 'parede') {
                    const mat = obj.userData.materialParede || 'cartao';
                    total += precosParede[mat] || 0;
                }
            });
            document.getElementById("precoTotal").textContent = total.toFixed(2) + " €";
        }
        // Adicionar objetos
        function adicionarObjeto(tipo) {
            let mesh;
            if (tipo === 'cadeira') {
                const geo = new THREE.BoxGeometry(0.3, 0.5, 0.3);
                const mat = new THREE.MeshStandardMaterial({ color: "#1976d2" });
                mesh = new THREE.Mesh(geo, mat);
                mesh.position.set(0, 0.25, 0);
            } else if (tipo === 'mesa') {
                const geo = new THREE.BoxGeometry(0.6, 0.35, 0.6);
                const mat = new THREE.MeshStandardMaterial({ color: "#8d5524" });
                mesh = new THREE.Mesh(geo, mat);
                mesh.position.set(0.5, 0.175, 0);
            } else if (tipo === 'parede') {
                const geo = new THREE.BoxGeometry(3, 1.5, 0.05);
                const mat = new THREE.MeshStandardMaterial({ color: "#bdbdbd" })
                const material = document.getElementById("materialParede")?.value || 'cartao';;
                mesh = new THREE.Mesh(geo, mat);
                mesh.position.set(0, 0.75, -0.97);
                mesh.userData.materialParede = material;
            }
            mesh.userData.tipo = tipo;
            scene.add(mesh);
            objetos.push(mesh);
            atualizarPrecoTotal();
        }
        
        // Drag & drop
        function onMouseDown(event) {
            event.preventDefault();
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(objetos);
            if (intersects.length > 0) {
                selectedObject = intersects[0].object;
                dragging = true;
                offset.copy(intersects[0].point).sub(selectedObject.position);
                mostrarPainelPersonalizacao(selectedObject);
                if(controls) controls.enabled = false; // <-- mostra e sincroniza
                console.log("Objeto selecionado:", selectedObject.userData.tipo);
            } else {
                selectedObject = null;
                esconderPainelPersonalizacao(); // <-- esconde se não houver seleção
                console.log("Nenhum objeto selecionado");
            }
        }
        function onMouseUp() {
            dragging = false;
            if(controls) controls.enabled = true;
        }
        function onMouseMove(event) {
            if (!dragging || !selectedObject) return;
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const planeY = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.05);
            const intersection = new THREE.Vector3();
            raycaster.ray.intersectPlane(planeY, intersection);
            if (intersection) {
                // Limites do chão
                const halfLargura = baseLargura / 2;
                const halfProfundidade = baseProfundidade / 2;
                // Margem de segurança para não sair fora (ajusta se necessário)
                const margem = 0.15;

                let novoX = intersection.x - offset.x;
                let novoZ = intersection.z - offset.z;

                // Limitar dentro do chão
                novoX = Math.max(-halfLargura + margem, Math.min(halfLargura - margem, novoX));
                novoZ = Math.max(-halfProfundidade + margem, Math.min(halfProfundidade - margem, novoZ));

                selectedObject.position.x = novoX;
                selectedObject.position.z = novoZ;
            }
        }
        function onKeyDown(event) {
            if (event.key === "Backspace" && selectedObject) {
                scene.remove(selectedObject);
                objetos = objetos.filter(obj => obj !== selectedObject);
                selectedObject = null;
                esconderPainelPersonalizacao();
                atualizarPrecoTotal();
            }
        }

        function animate() {
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        }

        function mostrarPainelPersonalizacao(obj) {
            const painel = document.getElementById("painelPersonalizacao");
            painel.style.display = "block";
            // Atualiza os valores dos inputs
            document.getElementById("corObjeto").value = rgbToHex(obj.material.color);
            document.getElementById("escalaObjeto").value = obj.scale.x;
            document.getElementById("rotacaoObjeto").value = Math.round(THREE.MathUtils.radToDeg(obj.rotation.y));
        }
        function esconderPainelPersonalizacao() {
            document.getElementById("painelPersonalizacao").style.display = "none";
        }
        function rgbToHex(color) {
            return "#" + color.getHexString();
        }
        document.getElementById("corObjeto").addEventListener("input", function() {
            if (selectedObject) {
                selectedObject.material.color.set(this.value);
            }
        });
        document.getElementById("escalaObjeto").addEventListener("input", function() {
            if (selectedObject) {
                selectedObject.scale.set(Number(this.value), Number(this.value), Number(this.value));
            }
        });
        document.getElementById("rotacaoObjeto").addEventListener("input", function() {
            if (selectedObject) {
                selectedObject.rotation.y = THREE.MathUtils.degToRad(Number(this.value));
            }
        });
        window.adicionarObjeto = adicionarObjeto;
        window.alterarBase = alterarBase;
        window.atualizarOpcoesBase = atualizarOpcoesBase;
        window.onload = init;