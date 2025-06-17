const precosBase = {
            "5,5x8,5": { "SRA3 250 grs": 0.80, "SRA3 300 grs": 0.90, "SRA3 350 grs": 1.00 },
            "7,5x10,5": { "SRA3 250 grs": 0.80, "SRA3 300 grs": 0.90, "SRA3 350 grs": 1.00 },
            "10x10": { "SRA3 250 grs": 0.80, "SRA3 300 grs": 0.90, "SRA3 350 grs": 1.00 }
        };
        function calcularPreco() {
            const tamanho = document.getElementById("tamanho").value;
            const papel = document.getElementById("papel").value;
            const quantidade = parseInt(document.getElementById("quantidade").value);
            const impressao = document.getElementById("impressao").value;
            let precoUnitario = precosBase[tamanho]?.[papel] || 0;
            let total = precoUnitario * quantidade;
            if (impressao === "frente verso") {
                total += 2.50;     
            }
            document.getElementById("precoEstimado").textContent = `Preço estimado: €${total.toFixed(2)}`;
        }
        ["tamanho", "papel", "quantidade", "impressao"].forEach(id => {
            document.getElementById(id).addEventListener("change", calcularPreco);
            document.getElementById(id).addEventListener("input", calcularPreco);
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
            }
            const dadosPedido = {
                tipoServico: "cartoes",
                tamanho: document.getElementById("tamanho").value,
                papel: document.getElementById("papel").value,
                quantidade: document.getElementById("quantidade").value,
                impressao: document.getElementById("impressao").value,
                arquivo: arquivo ? arquivo.name : "Nenhum arquivo"
            };
            adicionarAoCarrinho(dadosPedido);
            alert("Pedido adicionado ao carrinho!");
            document.getElementById("personalizarForm").reset();
            calcularPreco();
        });
        calcularPreco();