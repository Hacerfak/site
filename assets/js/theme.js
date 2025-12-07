const toggleButton = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme');

// Aplica o tema salvo ao carregar
if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
}

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