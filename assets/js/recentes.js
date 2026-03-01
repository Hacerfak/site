// Lógica simples para carregar apenas os 3 artigos mais recentes
async function loadLatestPosts() {
    try {
        const response = await fetch('/posts.json');
        const posts = await response.json();

        // Pega apenas os 3 primeiros elementos da lista
        const latestPosts = posts.slice(0, 4);
        const container = document.getElementById('latest-posts');

        latestPosts.forEach(post => {
            const mainCategory = post.category ? post.category.split(',')[0].trim() : 'Geral';
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
    <small class="meta"><i class="fa-regular fa-calendar"></i> ${post.date} &nbsp;•&nbsp; ${mainCategory}</small>
    <h3><a href="${post.url}">${post.title}</a></h3>
    <a href="${post.url}">Ler Artigo &rarr;</a>
    `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Erro ao carregar os últimos posts:", error);
    }
}

loadLatestPosts();