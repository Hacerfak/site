const toggleButton = document.getElementById('theme-toggle');

// Ouve o clique no botão de mudar o tema
if (toggleButton) {
    toggleButton.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');

        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        }
    });
}

// ==========================================
// Funcionalidade de Copiar Código (Lado a Lado)
// ==========================================

// Encontra APENAS as caixas de código dos tutoriais
const codeBlocks = document.querySelectorAll('div.highlight, figure.highlight');

codeBlocks.forEach(block => {
    // Cria o botão HTML
    const button = document.createElement('button');
    button.className = 'copy-code-btn';
    button.innerHTML = '<i class="fa-regular fa-copy"></i> Copiar';

    // Coloca o botão no INÍCIO da div (para ser o item da esquerda no flexbox)
    block.prepend(button);

    // Evento de clique para copiar
    button.addEventListener('click', async () => {
        const codeElement = block.querySelector('code') || block.querySelector('pre');
        if (!codeElement) return;

        const codeText = codeElement.innerText;

        try {
            await navigator.clipboard.writeText(codeText);

            button.innerHTML = '<i class="fa-solid fa-check"></i> Copiado!';
            button.classList.add('copied');

            setTimeout(() => {
                button.innerHTML = '<i class="fa-regular fa-copy"></i> Copiar';
                button.classList.remove('copied');
            }, 2000);

        } catch (err) {
            console.error('Falha ao copiar o código: ', err);
            button.innerHTML = '<i class="fa-solid fa-xmark"></i> Erro';
        }
    });
});