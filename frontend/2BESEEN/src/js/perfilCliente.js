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
            encomendas.forEach(pedido => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${pedido.tamanho || ''}</td>
                    <td>${pedido.papel || ''}</td>
                    <td>${pedido.quantidade || ''}</td>
                    <td>${pedido.arquivo || ''}</td>
                    <td>${pedido.tipoServico || ''}</td>
                    <td>${pedido.dataPedido ? new Date(pedido.dataPedido).toLocaleString() : ''}</td>
                    <td class="estado-${pedido.estado?.replace(/ /g,'-')}">${pedido.estado || ''}</td>
                    <td><button class="detalhes-btn" onclick='mostrarDetalhes(${JSON.stringify(pedido)})'>Ver</button></td>
                `;
                tbody.appendChild(tr);
            });
        } catch (err) {
            console.error("Erro ao buscar encomendas:", err);
            alert("Erro ao carregar encomendas.");
        }
    });
    function mostrarDetalhes(encomenda) {
        const div = document.getElementById("detalhesConteudo");
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
        window.location.href = "/login";
    }
    window.mostrarDetalhes = mostrarDetalhes;
    window.fecharModal = fecharModal;