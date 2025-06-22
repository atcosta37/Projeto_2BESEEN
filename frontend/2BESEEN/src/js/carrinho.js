let carrinho = [];
if (localStorage.getItem("carrinho")) {
    carrinho = JSON.parse(localStorage.getItem("carrinho"));
    renderizarCarrinho();
}
function adicionarAoCarrinho(item) {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
        alert("Tem de iniciar sessão para adicionar ao carrinho.");
        window.location.href = "/login.html";
        return false;
    }else{
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

