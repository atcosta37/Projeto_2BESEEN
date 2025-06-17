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
            if (data.redirectTo) {
                window.location.href = data.redirectTo;
            }
        })
        .catch(error => console.error('Erro:', error));
});