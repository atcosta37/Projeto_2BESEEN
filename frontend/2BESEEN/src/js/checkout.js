function carregarCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem("carrinho") || "[]");
    const tbody = document.querySelector("#tabelaCheckout tbody");
    const totalDiv = document.getElementById("checkoutTotal");
    tbody.innerHTML = "";
    let total = 0;
    carrinho.forEach(item => {
        const preco = parseFloat(item.precoEstimado || 0);
        total += preco;
        const tr = document.createElement("tr");
        tr.innerHTML = `
                <td>${item.tipoServico || item.produto || ""}</td>
                <td>${item.quantidade || 1}</td>
                <td>€${preco.toFixed(2)}</td>
            `;
        tbody.appendChild(tr);
    });
    totalDiv.textContent = "Total: €" + total.toFixed(2);
}
carregarCarrinho();

// --- PayPal só disponível se formulário estiver válido ---
function isFormValido() {
    const morada = document.getElementById("morada").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    return morada.length > 0 && telefone.length > 0;
}

function renderPayPalButton() {
    if (window.paypalButtonRendered) return; // Só renderiza uma vez
    window.paypalButtonRendered = true;
    paypal.Buttons({
        createOrder: async function (data, actions) {
            const carrinho = JSON.parse(localStorage.getItem("carrinho") || "[]");
            if (carrinho.length === 0) {
                alert("O carrinho está vazio. Adicione produtos antes de finalizar a compra.");
                return;
            }
            const resposta = await fetch("/api/paypal/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ carrinho })
            });
            const dataRes = await resposta.json();
            if (!dataRes.id) {
                alert("Erro ao criar ordem PayPal.");
                throw new Error("Erro ao criar ordem PayPal");
            }
            return dataRes.id; // ID da ordem PayPal
        },
        onApprove: async function (data, actions) {
            const token = localStorage.getItem("jwtToken");
            const carrinho = JSON.parse(localStorage.getItem("carrinho") || "[]");
            const morada = document.getElementById("morada").value;
            const telefone = document.getElementById("telefone").value;

            // Chama o backend para capturar o pagamento
            const resposta = await fetch("/api/paypal/capture-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderID: data.orderID, carrinho, morada, telefone, token })
            });
            const dataRes = await resposta.json();
            if (dataRes.status === "COMPLETED") {
                localStorage.removeItem("carrinho");
                window.location.href = "sucess_order.html";
            } else {
                alert("Pagamento não foi concluído.");
            }
        }
    }).render('#paypal-button-container');
}

function checkFormAndTogglePayPal() {
    const container = document.getElementById("paypal-button-container");
    if (isFormValido()) {
        renderPayPalButton();
        container.style.pointerEvents = "auto";
        container.style.opacity = "1";
    } else {
        container.style.pointerEvents = "none";
        container.style.opacity = "0.5";
    }
}

document.getElementById("morada").addEventListener("input", checkFormAndTogglePayPal);
document.getElementById("telefone").addEventListener("input", checkFormAndTogglePayPal);

// Inicialmente desativa o botão PayPal
document.getElementById("paypal-button-container").style.pointerEvents = "none";
document.getElementById("paypal-button-container").style.opacity = "0.5";