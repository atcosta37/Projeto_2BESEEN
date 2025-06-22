document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("jwtToken");
    if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        document.getElementById("nomeCliente").textContent = payload.nome;
        document.getElementById("perfilCliente").style.display = "flex";
    }
});

function logout() {
    localStorage.removeItem("jwtToken");
    window.location.href = "/login";
}

function calcularPreco() {
    const formato = document.getElementById("formato").value;
    const paginas = parseInt(document.getElementById("paginas").value);
    const papel = document.getElementById("papel").value;
    const capa = document.getElementById("capa").value;
    const encadernacao = document.getElementById("encadernacao").value;
    const quantidade = parseInt(document.getElementById("quantidade").value);

    let precoPorPagina = {
        "90g": 0.05,
        "115g": 0.07,
        "150g": 0.09
    }[papel] || 0;

    let precoCapa = {
        "Couchê 250g": 0.30,
        "Couchê 300g": 0.40
    }[capa] || 0;

    let precoEncadernacao = {
        "grampeada": 0.20,
        "colada": 0.50
    }[encadernacao] || 0;

    let precoUnitario = (paginas * precoPorPagina) + precoCapa + precoEncadernacao;
    let total = precoUnitario * quantidade;

    document.getElementById("precoEstimado").textContent = `Preço estimado: €${total.toFixed(2)}`;
}

["formato", "paginas", "papel", "capa", "encadernacao", "quantidade"].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener("change", calcularPreco);
    el.addEventListener("input", calcularPreco);
});

document.getElementById("personalizarForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    const precoEstimadoText = document.getElementById("precoEstimado").textContent;
    const precoEstimado = parseFloat(precoEstimadoText.replace(/[^\d.,-]/g, '').replace(',', '.'));
    const arquivo = document.getElementById("arquivo").files[0];
    let arquivoUrl = "";

    if (arquivo) {
        const formData = new FormData();
        formData.append("arquivo", arquivo);
        const resp = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await resp.json();
        arquivoUrl = data.url;
    }
    const dadosPedido = {
        tipoServico: "brochura",
        formato: document.getElementById("formato").value,
        paginas: document.getElementById("paginas").value,
        papel: document.getElementById("papel").value,
        capa: document.getElementById("capa").value,
        encadernacao: document.getElementById("encadernacao").value,
        quantidade: document.getElementById("quantidade").value,
        arquivo: arquivoUrl || "Nenhum arquivo",    
        arquivoOriginal: arquivo ? arquivo.name : "",
        precoEstimado: precoEstimado
    };
    if(adicionarAoCarrinho(dadosPedido)){;
    alert("Brochura adicionada ao carrinho!");
    document.getElementById("personalizarForm").reset();
    calcularPreco();
    }
});

calcularPreco();