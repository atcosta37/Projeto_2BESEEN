document.getElementById("formContacto").addEventListener("submit", async function (e) {
    e.preventDefault();
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const mensagem = document.getElementById("mensagem").value;

    const resposta = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, mensagem })
    });

    if (resposta.ok) {
        document.getElementById("mensagemSucesso").style.display = "block";
        this.reset();
        setTimeout(() => {
            document.getElementById("mensagemSucesso").style.display = "none";
        }, 4000);
    } else {
        alert("Erro ao enviar mensagem.");
    }
});