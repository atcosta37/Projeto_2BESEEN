document.addEventListener("DOMContentLoaded", function () {
    const bgSlides = document.querySelectorAll('.bg-slide');
    const bgCaption = document.querySelector('.bg-caption');
    let bgCurrent = 0;

    // Frases para cada background
    const bgCaptions = [
        "TUDO SERÁ FEITO, PARA QUE A SUA COMUNICAÇÃO SEJA ÚNICA E DE GRANDE IMPACTO!",
        "ULTRAPASSAR GRANDES DESAFIOS, É A NOSSA PRINCIPAL CAPACIDADE! ",
        "VEMOS O FUTURO, COM A MELHOR TECNOLOGIA, DE HOJE!",
        "PROPOMOS SEMPRE O QUE MELHOR SE ADAPTA, ÁS NECESSIDADES DOS CLIENTES!",
        "A SATISFAÇÃO DO CLIENTE NO FINAL DO TRABALHO, É O QUE MAIS NOS MOTIVA! "
    ];

    function showBgSlide(idx) {
        bgSlides.forEach((img, i) => {
            img.classList.toggle('active', i === idx);
        });
        // Atualiza a frase
        if (bgCaption) {
            bgCaption.textContent = bgCaptions[idx] || "";
        }
    }

    setInterval(() => {
        bgCurrent = (bgCurrent + 1) % bgSlides.length;
        showBgSlide(bgCurrent);
    }, 4000);

    showBgSlide(bgCurrent);
});