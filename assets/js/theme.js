const toggleBtn = document.getElementById('theme-toggle');
const systemScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Função auxiliar para aplicar o tema no HTML
const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
};

// 1. VERIFICAÇÃO INICIAL AO CARREGAR A PÁGINA
const savedTheme = localStorage.getItem('theme');

if (savedTheme) {
    // Se o usuário já escolheu manualmente antes, respeita a escolha dele
    setTheme(savedTheme);
} else if (systemScheme.matches) {
    // Se não escolheu, verifica se o sistema dele é Dark
    setTheme('dark');
}
// Se não cair em nenhum dos dois, o CSS padrão (Light) assume.

// 2. EVENTO DE CLIQUE NO BOTÃO (Alteração Manual)
toggleBtn.addEventListener('click', () => {
    let currentTheme = document.documentElement.getAttribute('data-theme');

    // Se o atributo for nulo, significa que está usando o tema padrão (light)
    if (!currentTheme) currentTheme = 'light';

    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    setTheme(newTheme);
    localStorage.setItem('theme', newTheme); // Salva a escolha manual
});

// 3. EVENTO DE MUDANÇA DO SISTEMA (Em tempo real)
// Se o usuário mudar o tema do OS enquanto navega e não tiver salvo uma preferência manual
systemScheme.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        const newSystemTheme = e.matches ? 'dark' : 'light';
        setTheme(newSystemTheme);
    }
});