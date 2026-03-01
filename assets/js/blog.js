// Configurações Iniciais
const POSTS_PER_PAGE = 6;
let allPosts = [];
let filteredPosts = [];
let currentPage = 1;
let currentCategory = '';

// Elementos do DOM
const postsGrid = document.getElementById('posts-grid');
const paginationContainer = document.getElementById('pagination-container');
const searchInput = document.getElementById('search-input');
const categoryPillsContainer = document.getElementById('category-pills');

// Inicializa o Blog
async function initBlog() {
    try {
        const response = await fetch('/posts.json');
        allPosts = await response.json();
        filteredPosts = [...allPosts];

        generateCategories();
        renderPosts();
        setupSearch();
    } catch (error) {
        postsGrid.innerHTML = '<p style="text-align:center; width:100%;">Erro ao carregar os artigos.</p>';
        console.error("Erro ao puxar posts.json:", error);
    }
}

// Renderiza os posts da página atual
function renderPosts() {
    postsGrid.innerHTML = '';

    if (filteredPosts.length === 0) {
        postsGrid.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-muted)">Nenhum artigo encontrado.</p>';
        paginationContainer.innerHTML = '';
        return;
    }

    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    const postsToShow = filteredPosts.slice(startIndex, endIndex);

    postsToShow.forEach(post => {
        // Pega só a primeira categoria principal para a tag visual
        const mainCategory = post.category ? post.category.split(',')[0].trim() : 'Geral';

        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <small class="meta"><i class="fa-regular fa-calendar"></i> ${post.date} &nbsp;•&nbsp; ${mainCategory}</small>
            <h3><a href="${post.url}">${post.title}</a></h3>
            <a href="${post.url}">Ler Artigo &rarr;</a>
        `;
        postsGrid.appendChild(card);
    });

    renderPagination();
}

// Renderiza a paginação (Botão Voltar e Avançar)
function renderPagination() {
    const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
    paginationContainer.innerHTML = '';

    if (totalPages <= 1) return; // Não precisa de paginação se só tem 1 página

    // Botão Anterior
    const prevBtn = document.createElement('a');
    prevBtn.className = 'btn';
    prevBtn.innerText = '← Anterior';
    if (currentPage === 1) {
        prevBtn.style.opacity = '0.5';
        prevBtn.style.cursor = 'not-allowed';
    } else {
        prevBtn.href = '#';
        prevBtn.onclick = (e) => { e.preventDefault(); changePage(currentPage - 1); };
    }
    paginationContainer.appendChild(prevBtn);

    // Texto da página
    const pageText = document.createElement('span');
    pageText.style.display = 'inline-block';
    pageText.style.margin = '0 15px';
    pageText.innerHTML = `Página <strong>${currentPage}</strong> de <strong>${totalPages}</strong>`;
    paginationContainer.appendChild(pageText);

    // Botão Próximo
    const nextBtn = document.createElement('a');
    nextBtn.className = 'btn';
    nextBtn.innerText = 'Próxima →';
    if (currentPage === totalPages) {
        nextBtn.style.opacity = '0.5';
        nextBtn.style.cursor = 'not-allowed';
    } else {
        nextBtn.href = '#';
        nextBtn.onclick = (e) => { e.preventDefault(); changePage(currentPage + 1); };
    }
    paginationContainer.appendChild(nextBtn);
}

// Troca a página e joga o usuário pro topo do grid
function changePage(newPage) {
    currentPage = newPage;
    renderPosts();
    document.querySelector('.blog-controls').scrollIntoView({ behavior: 'smooth' });
}

// Filtra por Busca e Categorias
function filterPosts() {
    const searchTerm = searchInput.value.toLowerCase();

    filteredPosts = allPosts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm) ||
            (post.tags && post.tags.toLowerCase().includes(searchTerm)) ||
            (post.category && post.category.toLowerCase().includes(searchTerm));

        const matchesCategory = currentCategory === '' || (post.category && post.category.includes(currentCategory));

        return matchesSearch && matchesCategory;
    });

    currentPage = 1; // Volta pra primeira página sempre que pesquisa
    renderPosts();
}

// Adiciona evento na barra de busca
function setupSearch() {
    searchInput.addEventListener('input', filterPosts);
}

// Extrai e cria botões de categoria dinamicamente
function generateCategories() {
    let categories = new Set();

    allPosts.forEach(post => {
        if (post.category) {
            // Divide categorias por vírgula se houver mais de uma
            post.category.split(',').forEach(cat => categories.add(cat.trim()));
        }
    });

    // Cria o botão "Todos"
    categoryPillsContainer.innerHTML = `<li><a href="#" class="category-btn active" data-cat="">Todos</a></li>`;

    categories.forEach(cat => {
        if (!cat) return;
        categoryPillsContainer.innerHTML += `<li><a href="#" class="category-btn" data-cat="${cat}">${cat}</a></li>`;
    });

    // Eventos de clique nas categorias
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();

            // Remove classe ativa de todos e bota no clicado
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            currentCategory = e.target.getAttribute('data-cat');
            filterPosts();
        });
    });
}

// Inicia a aplicação quando o arquivo carrega
initBlog();