document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const loginData = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };

    fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
    })
        .then(async response => {
            const contentType = response.headers.get("Content-Type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Resposta não é JSON");
            }
            return await response.json()
        })
        .then(data => {
            if (data.redirectTo) {
                localStorage.setItem("jwtToken", data.token);
                window.location.href = data.redirectTo;
            } else if (data.error) {
                alert(data.error);
            }
        })
        .catch(error => console.error('Erro:', error));
});