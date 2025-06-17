const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
document.getElementById("resetForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    const password = document.getElementById("password").value;
    const resposta = await fetch("/api/users/resetPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
    });
    const data = await resposta.json();
    document.getElementById("mensagem").textContent = data.mensagem || data.error;

    if (data.mensagem && data.mensagem.includes("sucesso")) {
        setTimeout(() => {
            window.location.href = "/login.html";
        }, 2000); // Espera 2 segundos para mostrar a mensagem
    }
});