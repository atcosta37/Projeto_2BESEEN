document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
        alert("Precisa de estar autenticado.");
        window.location.href = "/login";
        return;
    }
    // Buscar dados pessoais
    try {
        const resUser = await fetch("/api/users/minhas", {
            headers: { "Authorization": token }
        });
        if (resUser.ok) {
            const user = await resUser.json();
            document.getElementById("perfilNomeCliente").textContent = user.nome || "";
            document.getElementById("perfilEmailCliente").textContent = user.email || "";
        } else {
            alert("Erro ao carregar dados do utilizador.");
        }
    } catch (err) {
        alert("Erro ao carregar dados do utilizador.");
    }
    // Buscar encomendas do próprio utilizador
    try {
        const resposta = await fetch('/api/orders/minhas', {
            headers: { 'Authorization': token }
        });
        if (!resposta.ok) throw new Error("Não autorizado");
        const encomendas = await resposta.json();
        const tbody = document.querySelector("#tabelaEncomendas tbody");
        const tbodyStands = document.querySelector("#tabelaStands tbody");
        const encomendasStandsBox = document.getElementById("encomendasStandsBox");
        tbody.innerHTML = "";
        tbodyStands.innerHTML = "";

        let temStands = false;

        encomendas.forEach(pedido => {
            if (pedido.tipoServico === "Stand") {
                temStands = true;
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${pedido.baseLargura || ''}x${pedido.baseProfundidade || ''}</td>
                    <td>${pedido.paredes?.map(p => `${p.quantidade}x ${p.material}`).join("<br>") || '-'}</td>
                    <td>${pedido.cadeiras || 0}</td>
                    <td>${pedido.mesas || 0}</td>
                    <td>${pedido.precoEstimado ? pedido.precoEstimado.toFixed(2) + " €" : '-'}</td>
                    <td>${pedido.dataPedido ? new Date(pedido.dataPedido).toLocaleString() : ''}</td>
                    <td class="estado-${pedido.estado?.replace(/ /g, '-')}">${pedido.estado || ''}</td>
                    <td><button class="detalhes-btn" onclick='window.mostrarDetalhes(${JSON.stringify(pedido)})'>Ver</button></td>
                `;
                tbodyStands.appendChild(tr);
            } else {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${pedido.tamanho || ''}</td>
                    <td>${pedido.papel || ''}</td>
                    <td>${pedido.quantidade || ''}</td>
                    <td>${pedido.arquivo || ''}</td>
                    <td>${pedido.tipoServico || ''}</td>
                    <td>${pedido.dataPedido ? new Date(pedido.dataPedido).toLocaleString() : ''}</td>
                    <td class="estado-${pedido.estado?.replace(/ /g, '-')}">${pedido.estado || ''}</td>
                    <td><button class="detalhes-btn" onclick='window.mostrarDetalhes(${JSON.stringify(pedido)})'>Ver</button></td>
                `;
                tbody.appendChild(tr);
            }
        });

        // Só mostra a tabela de stands se houver stands
        encomendasStandsBox.style.display = temStands ? "block" : "none";
    } catch (err) {
        console.error("Erro ao buscar encomendas:", err);
        alert("Erro ao carregar encomendas.");
    }
});

function mostrarDetalhes(encomenda) {
    const div = document.getElementById("detalhesConteudo");
    if (encomenda.tipoServico === "Stand") {
        div.innerHTML = `
            <p><strong>Tamanho:</strong> ${encomenda.baseLargura || ''}x${encomenda.baseProfundidade || ''}</p>
            <p><strong>Paredes:</strong> ${encomenda.paredes?.map(p => `${p.quantidade}x ${p.material}`).join(", ") || '-'}</p>
            <p><strong>Cadeiras:</strong> ${encomenda.cadeiras || 0}</p>
            <p><strong>Mesas:</strong> ${encomenda.mesas || 0}</p>
            <p><strong>Tipo de Serviço:</strong> ${encomenda.tipoServico || ''}</p>
            <p><strong>Data:</strong> ${encomenda.dataPedido ? new Date(encomenda.dataPedido).toLocaleString() : ''}</p>
            <p><strong>Estado:</strong> ${encomenda.estado || ''}</p>
            <p><strong>Valor:</strong> ${encomenda.precoEstimado ? encomenda.precoEstimado.toFixed(2) + " €" : 'N/A'}</p>
        `;
    } else {
        div.innerHTML = `
            <p><strong>Tamanho:</strong> ${encomenda.tamanho || ''}</p>
            <p><strong>Papel:</strong> ${encomenda.papel || ''}</p>
            <p><strong>Quantidade:</strong> ${encomenda.quantidade || ''}</p>
            <p><strong>Arquivo:</strong> ${encomenda.arquivo || ''}</p>
            <p><strong>Tipo de Serviço:</strong> ${encomenda.tipoServico || ''}</p>
            <p><strong>Data:</strong> ${encomenda.dataPedido ? new Date(encomenda.dataPedido).toLocaleString() : ''}</p>
            <p><strong>Estado:</strong> ${encomenda.estado || ''}</p>
            <p><strong>Valor:</strong> ${encomenda.precoEstimado ? encomenda.precoEstimado.toFixed(2) + " €" : 'N/A'}</p>
        `;
    }
    document.getElementById("detalhesModal").style.display = "block";
}

function fecharModal() {
    document.getElementById("detalhesModal").style.display = "none";
}

function editarDados() {
    alert("Funcionalidade de edição ainda não implementada.");
}

function logout() {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("carrinho");
    window.location.href = "/login";
}

// Torna as funções globais para uso nos botões das tabelas
window.mostrarDetalhes = mostrarDetalhes;
window.fecharModal = fecharModal;