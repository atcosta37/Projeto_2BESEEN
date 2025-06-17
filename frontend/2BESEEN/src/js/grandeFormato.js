const precosM2 = {
            "Vinil": 17.50,
            "Vinil laminado": 23.00,
            "Vinil perfurado": 25.00,
            "Backlight": 29.00,
            "Lona": 16.00,
            "PVC 1mm": 30.00,
            "PVC 2mm": 32.50,
            "PVC 3mm": 34.00,
            "PVC 5mm": 39.00,
            "Kline 3mm": 31.00,
            "Kline 5mm": 36.00
        };
        function calcularPreco() {
            const material = document.getElementById("material").value;
            const largura = parseFloat(document.getElementById("largura").value) || 0;
            const altura = parseFloat(document.getElementById("altura").value) || 0;
            const quantidade = parseInt(document.getElementById("quantidade").value) || 1;
            const precoM2 = precosM2[material] || 0;
            const areaM2 = (largura * altura) / 10000;
            const preco = quantidade * areaM2 * precoM2;
            document.getElementById("precoEstimado").textContent = `Preço estimado: €${preco.toFixed(2)}`;
        }
        ["material", "largura", "altura", "quantidade"].forEach(id => {
            document.getElementById(id).addEventListener("input", calcularPreco);
            document.getElementById(id).addEventListener("change", calcularPreco);
        }); 
        document.getElementById("personalizarForm").addEventListener("submit", async function(event) {
            event.preventDefault();
            const arquivo = document.getElementById("arquivo").files[0];
            let arquivoUrl = "";

            if (arquivo) {
                const formData = new FormData();
                formData.append("arquivo", arquivo);
                const resp = await fetch("/api/upload", { method: "POST", body: formData });
                const data = await resp.json();
                arquivoUrl = data.url; // O backend deve devolver { url: "/uploads/ficheiro.pdf" }
                console.log("Arquivo enviado:", arquivoUrl);
            }
            const dadosPedido = {
                tipoServico: "grande formato",
                papel: document.getElementById("material").value,
                tamanho: `${document.getElementById("largura").value}x${document.getElementById("altura").value}`,
                quantidade: document.getElementById("quantidade").value,
                arquivo: arquivoUrl,
                precoEstimado: document.getElementById("precoEstimado").textContent.replace("Preço estimado: €", "")
            };
            adicionarAoCarrinho(dadosPedido);
            alert("Pedido adicionado ao carrinho!");
            document.getElementById("personalizarForm").reset();
            calcularPreco();
        }); 
        calcularPreco();