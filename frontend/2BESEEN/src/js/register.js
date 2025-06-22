document.getElementById("formregister").addEventListener("submit", function (event) {
    event.preventDefault();

    const dados = {
        nome: document.getElementById("nome").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };

    fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    })
        .then(response => response.json())
        .then(data => {
            const msgBox = document.getElementById("registerMsg");
            if (data.redirectTo) {
                window.location.href = data.redirectTo;
            } else if (data.mensagem) {
                msgBox.textContent = data.mensagem;
            } else {
                msgBox.textContent = "Ocorreu um erro. Tente novamente.";
            }
        })
        .catch(error => {
            document.getElementById("registerMsg").textContent = "Ocorreu um erro. Tente novamente.";
            console.error('Erro:', error);
        });
});