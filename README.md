# FreeAPI Playground

A high-performance, Vanilla JavaScript Single-Page Application (SPA) built to interact with various [FreeAPI](https://freeapi.app/) endpoints. 

This project serves as a collection of web development assignments (Web Dev Cohort 2026), seamlessly integrated into a single, unified interface.

![Project Status](https://img.shields.io/badge/Status-Completed-success?style=flat-square)
![Tech Stack](https://img.shields.io/badge/Tech-Vanilla_JS_|_CSS3_|_HTML5-f3df49?style=flat-square&logo=javascript)

## Key Features
* **Zero Dependencies:** Built entirely with Vanilla ES6 JavaScript, HTML5, and pure CSS3. No React, no Tailwind, no bundlers required.
* **Query Parameter SPA Router:** Uses the HTML5 History API with URL search parameters (e.g., ?q=auth, ?q=quotes) for client-side navigation without page reloads.
* **Dynamic Module Loading:** Employs JS `import()` to lazy-load application logic and HTML only when a specific tool is accessed, keeping the initial payload incredibly small.
* **Event Delegation:** Optimized DOM event handling for interactive grids and modals.

---

## Project Structure
```text
/
├── index.html          # Main App Shell & Navigation structure
├── style.css           # Global "Obsidian Workbench" design system
├── app.js              # Client-side router and dynamic loader
└── lib/
    ├── tools.js        # Global configuration and metadata for all modules
    ├── index.js        # Dynamic module import mapper
    ├── auth.js         # Authentication module
    ├── cats.js         # Random Cat module
    ├── jokes.js        # Jokes database module
    ├── meals.js        # Meals API module
    ├── products.js     # Products list module
    ├── quotes.js       # Quotes gallery module
    ├── users.js        # Person database module
    └── youtube.js      # YouTube video listing module
```

---

## The Modules

### 1. Authentication (`?q=auth`)
A comprehensive session-management playground handling user registration, secure login, persistent session state (via `localStorage`), and user profile retrieval.
* **Endpoints:** `POST /users/register`, `POST /users/login`, `POST /users/logout`, `GET /users/current-user`

### 2. Quotes Gallery (`?q=quotes`)
A typography-focused gallery displaying random public quotes. Utilizes pagination to browse through a vast database while maintaining strict visual alignment.
* **Endpoint:** `GET /public/quotes`

### 3. Product Listing (`?q=products`)
An e-commerce style inventory viewer. Fetches paginated arrays of random products and renders them in an image-first grid with categorized tags and clamped descriptions.
* **Endpoint:** `GET /public/randomproducts`

### 4. YouTube Videos UI (`?q=youtube`)
A structured video browsing interface. Processes complex, nested JSON to display video thumbnails alongside parsed durations (ISO 8601 formatting) and mathematically formatted view counts (e.g., `2.5K`).
* **Endpoint:** `GET /public/youtube/videos`

### 5. Jokes Viewer (`?q=jokes`)
A terminal-style joke database viewer. Categorizes fetched jokes, specifically isolating and flagging explicit content with tactical warning tags and zero-padded ID tracking.
* **Endpoint:** `GET /public/randomjokes`

### 6. Random Cat Viewer (`?q=cats`)
An intelligence-style "Feline Dossier" generator. Retrieves a single highly-detailed cat profile per request and visualizes its physical attributes and psychological stats using custom ASCII progress bars.
* **Endpoint:** `GET /public/cats/cat/random`

### 7. Meals Directory (`?q=meals`)
A comprehensive culinary archive. Displays an interactive image grid that triggers a frosted-glass modal to reveal complex recipe data, dynamically generating ingredient tables and cooking instructions.
* **Endpoint:** `GET /public/meals`

### 8. Random Users Database (`?q=users`)
A secure personnel directory simulation. Renders user data as tactical ID badges with desaturated avatars. Clicking a badge opens a deep-dive "Extended Dossier" modal displaying cryptographic IDs and geographical coordinates.
* **Endpoint:** `GET /public/randomusers`

---

## Installation & Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/himanshubalani/freeapi.git
   cd freeapi
   ```

2. Run a local development server. You can use any of the following:
   * **VS Code:** Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension and click "Go Live".
   * **Node/NPM:** Run `npx serve .` in the project directory.
   * **Python:** Run `python3 -m http.server 8000` or `python -m SimpleHTTPServer 8000`.

3. Open your browser and navigate to `http://localhost:8000` (or the port provided by your server).

---

## Credits
Designed and Developed by **Himanshu Balani**  
* 🌐 Website: [himanshubalani.com](https://www.himanshubalani.com)
* 📝 Blog: [blog.himanshubalani.com](https://blog.himanshubalani.com)
* 🔌 Powered by: [FreeAPI](https://freeapi.app/)

*Created as part of the Web Dev Cohort 2026.*