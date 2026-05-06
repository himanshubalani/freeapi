import { toolList } from './lib/tools.js';
import { loadModule } from './lib/index.js';

// --- ROUTER CONFIG ---
const navigateTo = (url) => {
    history.pushState(null, null, url);
    router();
};

const router = async () => {
    const path = window.location.pathname;
    
    // Fallback to the first tool if path matches root / or is not found
    let activeTool = toolList.find(tool => path.endsWith(tool.href));
    if (!activeTool) activeTool = toolList[0];

    const appRoot = document.getElementById('app-root');
    const pageTitle = document.getElementById('current-page-title');
    
    appRoot.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-secondary);">Loading module...</div>';
    pageTitle.textContent = `FreeAPI_${activeTool.name}_`;

    // Update Sidebar Active State
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === activeTool.href) {
            link.classList.add('active');
        }
    });

    try {
        // Load the JS module dynamically
        const module = await loadModule(activeTool.id);
        
        // Cleanup previous module if it exists
        if (window.currentModule && window.currentModule.unmount) {
            window.currentModule.unmount();
        }
        
        // Inject HTML and run logic
        appRoot.innerHTML = module.render();
        if (module.mount) module.mount();
        
        window.currentModule = module;
    } catch (error) {
        console.error(error);
        appRoot.innerHTML = `
            <div class="empty-state">
                <div class="empty-title">404 - Module Error</div>
                <div class="empty-subtitle">Could not load the requested assignment.</div>
            </div>`;
    }
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Build Sidebar
    const navList = document.getElementById('nav-list');
    toolList.forEach(tool => {
        const li = document.createElement('li');
        li.innerHTML = `
            <a href="${tool.href}" data-link class="nav-link" id="nav-${tool.id}">
                <div class="nav-title">${tool.name}</div>
                <div class="nav-desc">${tool.description}</div>
            </a>`;
        navList.appendChild(li);
    });

    // 2. Intercept clicks on links with data-link attribute
    document.body.addEventListener('click', e => {
        const link = e.target.closest('[data-link]');
        if (link) {
            e.preventDefault();
            navigateTo(link.getAttribute('href'));
        }
    });

    // 3. Run router on initial load
    router();
});

// Handle Back/Forward browser buttons
window.addEventListener('popstate', router);