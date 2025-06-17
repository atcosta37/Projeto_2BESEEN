let carrinho = [];
if (localStorage.getItem("carrinho")) {
    carrinho = JSON.parse(localStorage.getItem("carrinho"));
    renderizarCarrinho();
}
function adicionarAoCarrinho(item) {
    const precoEstimadoElem = document.getElementById("precoEstimado");
    if (precoEstimadoElem) {
        const precoEstimadoText = precoEstimadoElem.textContent;
        const precoEstimado = parseFloat(precoEstimadoText.replace(/[^\d.,-]/g, '').replace(',', '.'));
        if (!isNaN(precoEstimado)) {
            item.precoEstimado = precoEstimado;
        }
    }
    carrinho.push(item);
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    renderizarCarrinho();
}


function calcularPrecoItem(item) {
    // Exemplo de preços base (ajusta conforme necessário)
    const precosBase = {
        "A4": { "SRA3 150 grs": 0.50, "SRA3 200 grs": 0.65, "SRA3 250 grs": 0.80 },
        "A5": { "SRA3 150 grs": 0.50, "SRA3 200 grs": 0.65, "SRA3 250 grs": 0.80 },
        "5,5x8,5": { "SRA3 250 grs": 0.80, "SRA3 300 grs": 0.90, "SRA3 350 grs": 1.00 },
        "7,5x10,5": { "SRA3 250 grs": 0.80, "SRA3 300 grs": 0.90, "SRA3 350 grs": 1.00 },
        "10x10": { "SRA3 250 grs": 0.80, "SRA3 300 grs": 0.90, "SRA3 350 grs": 1.00 }
    };
    let precoUnitario = precosBase[item.tamanho]?.[item.papel] || 0;
    let total = precoUnitario * (parseInt(item.quantidade) || 1);

    // Exemplo: custo extra para impressão frente e verso
    if (item.impressao === "frente verso") {
        total += 2.50;
    }
    return total;
}

function renderizarCarrinho() {
    const lista = document.getElementById("carrinhoLista");
    if (!lista) return;
    lista.innerHTML = "";

    let precoTotal = 0;

    carrinho.forEach((item, index) => {
        if (!item) return; // Verifica se o item é válido
        const li = document.createElement("li");
        li.classList.add("carrinho-item");


        const btnRemover = document.createElement("button");
        btnRemover.textContent = "✕";
        btnRemover.className = "remover-btn";
        btnRemover.title = "Remover encomenda";
        btnRemover.onclick = () => {
            carrinho.splice(index, 1);
            localStorage.setItem("carrinho", JSON.stringify(carrinho));
            renderizarCarrinho();
        };
        const precoItem = typeof item.precoEstimado === "number" ? item.precoEstimado : 0;
        precoTotal += precoItem;
        if (item.tipoServico === "Stand") {
            li.textContent = `Stand: ${item.baseLargura || ""}x${item.baseProfundidade || ""} | ${precoItem.toFixed(2)} €`;
        } else {
            li.textContent = `${item.tipoServico ? item.tipoServico.charAt(0).toUpperCase() + item.tipoServico.slice(1) : "Pedido"}: ${item.quantidade}x ${item.formato || item.tamanho || ""} - ${item.papel} | ${precoItem.toFixed(2)} €`;
        }

        li.appendChild(btnRemover);
        lista.appendChild(li);
    });


    let totalDiv = document.getElementById("carrinhoTotal");
    if (!totalDiv) {
        totalDiv = document.createElement("div");
        totalDiv.id = "carrinhoTotal";
        lista.parentNode.appendChild(totalDiv);
    }
    totalDiv.textContent = `Total: ${precoTotal.toFixed(2)} €`;

    const vazioDiv = document.getElementById("carrinhoVazio");
    if (vazioDiv) {
        vazioDiv.style.display = carrinho.length === 0 ? "block" : "none";
    }
}


function confirmarPedido() {
    // Lê o carrinho do localStorage
    const carrinhoAtual = JSON.parse(localStorage.getItem("carrinho") || "[]");
    if (!carrinhoAtual.length) {
        alert("O carrinho está vazio.");
        return;
    }
    // Redireciona para a página de checkout
    window.location.href = "/checkout.html";


}

function toggleCarrinho() {
    const carrinhoDiv = document.getElementById("carrinhoContainer");
    if (carrinhoDiv) {
        carrinhoDiv.classList.toggle("aberto");
    }
}

