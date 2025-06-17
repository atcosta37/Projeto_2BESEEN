document.getElementById("forgotForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const resposta = await fetch("/api/users/forgotPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    });
    const data = await resposta.json();
    document.getElementById("mensagem").textContent = data.mensagem || data.error || "Verifique o seu email.";
});