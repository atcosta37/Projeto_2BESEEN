document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("jwtToken");
    if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        document.getElementById("nomeCliente").textContent = payload.nome; 
        document.getElementById("perfilCliente").style.display = "flex";
        const loginBtn = document.querySelector(".login-button");   
        if (loginBtn) loginBtn.style.display = "none";
    }else {
        if (perfilClienteElem) perfilClienteElem.style.display = "none";
        if (loginBtn) loginBtn.style.display = "inline-block";
        if (logoutBtn) logoutBtn.style.display = "none";
    }
});
function logout() {
    localStorage.removeItem("jwtToken");
    window.location.href = "/login";
}

 function toggleMenu() {
    let sidebar = document.getElementById("sidebar");
    if (sidebar.style.width === "250px") {
        sidebar.style.width = "0";
    } else {
        sidebar.style.width = "250px";
    }
}
function toggleSubMenu() {
    let submenu = document.getElementById("submenu");
    submenu.style.display = submenu.style.display === "block" ? "none" : "block";
}