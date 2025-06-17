document.getElementById("abrirInboxBtn").onclick = function () {
    document.getElementById("modalInbox").style.display = "flex";
    carregarMensagens();
};
document.getElementById("fecharInboxBtn").onclick = function () {
    document.getElementById("modalInbox").style.display = "none";
};
window.onclick = function (event) {
    const modal = document.getElementById("modalInbox");
    if (event.target === modal) modal.style.display = "none";
    const modalDetalhes = document.getElementById("modalDetalhesEncomenda");
    if (event.target === modalDetalhes) modalDetalhes.style.display = "none";
};

document.getElementById("fecharDetalhesBtn").onclick = function () {
    document.getElementById("modalDetalhesEncomenda").style.display = "none";
};

// Mostra detalhes separados em duas colunas: Cliente e Produto
function mostrarDetalhesEncomenda(pedido) {
    // Cliente
    const clienteCampos = [
        { label: "Nome", valor: pedido.nomeCliente || pedido.userId?.nome || '-' },
        { label: "Email", valor: pedido.emailCliente || pedido.userId?.email || '-' },
        { label: "Morada", valor: pedido.morada || '-' },
        { label: "Telefone", valor: pedido.telefoneCliente || '-' }
    ];

    // Produto/Encomenda
    const encomendaCampos = [
        { label: "Tipo de Serviço", valor: pedido.tipoServico || '-' },
        { label: "Tamanho", valor: pedido.tamanho || (pedido.baseLargura && pedido.baseProfundidade ? `${pedido.baseLargura} x ${pedido.baseProfundidade}` : '-') },
        { label: "Formato", valor: pedido.formato || '-' },
        { label: "Papel/Material", valor: pedido.papel || '-' },
        { label: "Quantidade", valor: pedido.quantidade || '-' },
        { label: "Arquivo", valor: pedido.arquivo ? `<a href="/download/${pedido.arquivo.split('/').pop()}" target="_blank">${pedido.arquivo.split('/').pop()} ⬇️</a>` : '-' },
        { label: "Cadeiras", valor: pedido.cadeiras ?? '-' },
        { label: "Mesas", valor: pedido.mesas ?? '-' },
        { label: "Paredes", valor: Array.isArray(pedido.paredes) && pedido.paredes.length > 0 ? pedido.paredes.map(p => `${p.quantidade}x ${p.material}`).join(", ") : '-' },
        { label: "Preço", valor: pedido.precoEstimado ? pedido.precoEstimado.toFixed(2) + " €" : '-' },
        { label: "Data", valor: pedido.dataPedido ? new Date(pedido.dataPedido).toLocaleString() : '-' },
        { label: "Estado", valor: pedido.estado || '-' },
        { label: "Imagem", valor: pedido.imagem ? `<a href="${pedido.imagem}" target="_blank"><img src="${pedido.imagem}" style="max-width:120px;max-height:90px;border-radius:6px;" alt="stand"></a>` : '-' }
    ];

    const conteudo = document.getElementById("detalhesEncomendaConteudo");
    conteudo.innerHTML = `
        <div class="detalhes-col">
            <h3>Cliente</h3>
            ${clienteCampos.map(campo => `<strong>${campo.label}:</strong> ${campo.valor}<br>`).join("")}
        </div>
        <div class="detalhes-col">
            <h3>Encomenda</h3>
            ${encomendaCampos.map(campo => `<strong>${campo.label}:</strong> ${campo.valor}<br>`).join("")}
        </div>
    `;
    document.getElementById("modalDetalhesEncomenda").style.display = "flex";
}
window.mostrarDetalhesEncomenda = mostrarDetalhesEncomenda;

document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("jwtToken");
    const backendUrl = "http://localhost:3000";
    if (!token) {
        alert("Acesso restrito. Efetue login como admin.");
        window.location.href = "/login";
        return;
    }

    try {
        const resposta = await fetch('/api/admin/encomendas', {
            headers: { 'Authorization': token }
        });
        if (!resposta.ok) throw new Error("Não autorizado");

        const encomendas = await resposta.json();
        carregarFaturacao(encomendas);
        const tbody = document.querySelector("#tabelaEncomendas tbody");

        encomendas.forEach(pedido => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                    <td>${pedido.userId?.nome || 'N/A'}</td>
                    <td>${pedido.userId?.email || 'N/A'}</td>
                    <td>${pedido.tamanho}</td>
                    <td>${pedido.papel}</td>
                    <td>${pedido.quantidade}</td>
                    <td>
                    ${pedido.arquivo
                    ? `<a href="${backendUrl}/download/${pedido.arquivo.split('/').pop()}" target="/admin.html" title="Download ficheiro">${pedido.arquivo.split('/').pop()} ⬇️</a>`
                    : '-'}
                    </td>
                    <td>${pedido.tipoServico}</td>
                    <td>${new Date(pedido.dataPedido).toLocaleString()}</td>
                    <td>
                        <button class="admin-btn" onclick='mostrarDetalhesEncomenda(${JSON.stringify(pedido)})'>Ver Detalhes</button>
                        <select onchange="atualizarEstado('${pedido._id}', this.value)">
                            <option value="pendente" ${pedido.estado === 'pendente' ? 'selected' : ''}>Pendente</option>
                            <option value="em-processamento" ${pedido.estado === 'em-processamento' ? 'selected' : ''}>Em Processamento</option>
                            <option value="concluido" ${pedido.estado === 'concluido' ? 'selected' : ''}>Concluído</option>
                            <option value="enviado" ${pedido.estado === 'enviado' ? 'selected' : ''}>Enviado</option>
                        </select>   
                        <button onclick="apagarEncomenda('${pedido._id}')">🗑️ Apagar</button>
                    </td>
                `;
            tr.style.cursor = "pointer";
            tr.addEventListener("click", function (e) {
                if (e.target.tagName === "SELECT" || e.target.tagName === "BUTTON") return;
                mostrarDetalhesEncomenda(pedido);
            });
            tbody.appendChild(tr);
        });

        const tbodyStands = document.querySelector("#tabelaStands tbody");
        encomendas
            .filter(pedido => pedido.tipoServico === "Stand")
            .forEach(pedido => {
                const tr = document.createElement("tr");
                let paredesDesc = "";
                if (Array.isArray(pedido.paredes)) {
                    paredesDesc = pedido.paredes.map(p => `${p.quantidade}x ${p.material}`).join(", ");
                }
                let imgHtml = "";
                if (pedido.imagem) {
                    imgHtml = `
                            <a href="${pedido.imagem}" target="_blank" title="Ver imagem">
                                <img src="${pedido.imagem}" style="max-width:80px;max-height:60px;border-radius:6px;" alt="stand">
                            </a>
                            <a href="${pedido.imagem}" download="stand_${pedido._id}.png" title="Download imagem" style="margin-left:8px; font-size:1.2em;">⬇️</a>
                        `;
                }
                tr.innerHTML = `
                        <td>${pedido.nomeCliente || pedido.userId?.nome || 'N/A'}</td>
                        <td>${pedido.emailCliente || pedido.userId?.email || 'N/A'}</td>
                        <td>${pedido.baseLargura || '-'} x ${pedido.baseProfundidade || '-'}</td>
                        <td>${pedido.cadeiras ?? '-'}</td>
                        <td>${pedido.mesas ?? '-'}</td>
                        <td>${paredesDesc || '-'}</td>
                        <td>${pedido.precoEstimado ? pedido.precoEstimado.toFixed(2) + " €" : '-'}</td>
                        <td>${imgHtml}</td>
                        <td>${new Date(pedido.dataPedido).toLocaleString()}</td>
                        <td>
                            <button class="admin-btn" onclick='mostrarDetalhesEncomenda(${JSON.stringify(pedido)})'>Ver Detalhes</button>
                            <select onchange="atualizarEstado('${pedido._id}', this.value)">
                                <option value="pendente" ${pedido.estado === 'pendente' ? 'selected' : ''}>Pendente</option>
                                <option value="em-processamento" ${pedido.estado === 'em-processamento' ? 'selected' : ''}>Em Processamento</option>
                                <option value="concluido" ${pedido.estado === 'concluido' ? 'selected' : ''}>Concluído</option>
                                <option value="enviado" ${pedido.estado === 'enviado' ? 'selected' : ''}>Enviado</option>
                            </select>   
                            <button onclick="apagarEncomenda('${pedido._id}')">🗑️ Apagar</button>
                        </td>
                    `;
                tr.style.cursor = "pointer";
                tr.addEventListener("click", function (e) {
                    if (e.target.tagName === "SELECT" || e.target.tagName === "BUTTON" || e.target.tagName === "IMG" || e.target.tagName === "A") return;
                    mostrarDetalhesEncomenda(pedido);
                });
                tbodyStands.appendChild(tr);
            });

    } catch (err) {
        alert("Erro ao carregar encomendas. Verifica se tens permissões de administrador.");
    }
});

async function apagarEncomenda(id) {
    const confirmar = confirm("Tens a certeza que queres apagar esta encomenda?");
    if (!confirmar) return;

    const token = localStorage.getItem("jwtToken");

    try {
        const resposta = await fetch(`/api/admin/encomendas/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': token }
        });

        if (!resposta.ok) throw new Error("Erro ao apagar");

        alert("Encomenda apagada com sucesso!");
        location.reload();
    } catch (err) {
        alert("Erro ao apagar encomenda.");
        console.error(err);
    }
}

async function atualizarEstado(id, novoEstado) {
    const token = localStorage.getItem("jwtToken");

    try {
        const resposta = await fetch(`/api/admin/encomendas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({ estado: novoEstado })
        });

        if (!resposta.ok) throw new Error("Erro ao atualizar estado");

        alert("Estado atualizado com sucesso!");
    } catch (err) {
        alert("Erro ao atualizar o estado da encomenda.");
        console.error(err);
    }
}

async function carregarMensagens() {
    const token = localStorage.getItem("jwtToken");
    try {
        const resposta = await fetch('/api/admin/mensagens', {
            headers: { 'Authorization': token }
        });
        if (!resposta.ok) throw new Error("Não autorizado");
        const mensagens = await resposta.json();
        const tbody = document.querySelector("#tabelaMensagens tbody");
        tbody.innerHTML = "";
        mensagens.forEach(msg => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                    <td>${new Date(msg.data).toLocaleString()}</td>
                    <td>${msg.nome}</td>
                    <td>${msg.email}</td>
                    <td>${msg.mensagem}</td>
                `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        alert("Erro ao carregar mensagens de contacto.");
    }
}

async function carregarFaturacao(encomendas) {
    const faturacaoPorMes = {};
    const faturacaoPorTipo = {};
    let total = 0;

    encomendas.forEach(e => {
        const data = new Date(e.dataPedido);
        const mes = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
        const tipo = e.tipoServico || "Outro";
        const valor = Number(e.precoEstimado) || 0;

        faturacaoPorMes[mes] = (faturacaoPorMes[mes] || 0) + valor;
        faturacaoPorTipo[tipo] = (faturacaoPorTipo[tipo] || 0) + valor;
        total += valor;
    });

    document.getElementById("totalFaturado").textContent = total.toFixed(2) + " €";

    // Gráfico por mês
    const ctxMes = document.getElementById('faturacaoPorMes').getContext('2d');
    new Chart(ctxMes, {
        type: 'bar',
        data: {
            labels: Object.keys(faturacaoPorMes),
            datasets: [{
                label: 'Faturação por mês (€)',
                data: Object.values(faturacaoPorMes),
                backgroundColor: '#ff6600',
                borderRadius: 8,
                maxBarThickness: 38
            }]
        },
        options: {
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    // Gráfico por tipo de serviço
    const ctxTipo = document.getElementById('faturacaoPorTipo').getContext('2d');
    new Chart(ctxTipo, {
        type: 'pie',
        data: {
            labels: Object.keys(faturacaoPorTipo),
            datasets: [{
                label: 'Faturação por tipo',
                data: Object.values(faturacaoPorTipo),
                backgroundColor: [
                    '#ff6600', '#232526', '#ffb84d', '#ff884d', '#4dc9ff', '#36a2eb', '#aaa'
                ]
            }]
        },
        options: {
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

