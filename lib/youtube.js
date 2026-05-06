export function render() {
    return `
        <div class="workbench">
            <main class="output-panel card" style="grid-column: 1 / -1;">
                <div class="card-header">
                    <div style="display: flex; align-items: center;">
                        <span class="sub-label">YOUTUBE_DIRECTORY</span>
                        <span class="api-label">GET /public/youtube/videos</span>
                    </div>
                </div>
                
                <div class="card-body">
                    <div id="youtube-container" class="grid-layout youtube-grid">
                        <div style="color: var(--text-secondary); grid-column: 1/-1; text-align:center; padding: 40px 0;">Initializing...</div>
                    </div>
                </div>

                <div class="card-header" style="justify-content: center; border-top: 1px solid var(--border); border-bottom: none;">
                    <div class="toolbar" style="display: flex; align-items: center; gap: 16px;">
                        <button class="btn-outline" id="yt-prev">Previous</button>
                        <span id="yt-indicator" style="font-size: 14px; color: var(--text-secondary);">Page 1</span>
                        <button class="btn-outline" id="yt-next">Next</button>
                    </div>
                </div>
            </main>
        </div>
    `;
}

export function mount() {
    let currentPage = 1;
    let totalPages = 1;
    const container = document.getElementById('youtube-container');
    const indicator = document.getElementById('yt-indicator');
    const btnPrev = document.getElementById('yt-prev');
    const btnNext = document.getElementById('yt-next');

    // Utility to parse YouTube ISO 8601 duration (PT19M35S -> 19:35)
    const formatDuration = (pt) => {
        const match = pt.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        if (!match) return "0:00";
        const h = (match[1] || "").replace("H", "");
        const m = (match[2] || "").replace("M", "") || "0";
        const s = (match[3] || "").replace("S", "") || "00";
        let res = "";
        if (h) res += h + ":";
        res += (h ? m.padStart(2, "0") : m) + ":";
        res += s.padStart(2, "0");
        return res;
    };

    // Utility to format views (2955 -> 2.9K)
    const formatViews = (views) => {
        const v = parseInt(views, 10);
        if (v >= 1000000) return (v / 1000000).toFixed(1) + "M";
        if (v >= 1000) return (v / 1000).toFixed(1) + "K";
        return v;
    };

    const fetchVideos = async (page) => {
        container.innerHTML = '<div style="color: var(--text-secondary); grid-column: 1/-1; text-align:center; padding: 40px 0;">Loading FreeAPI Data...</div>';
        btnPrev.disabled = true;
        btnNext.disabled = true;

        try {
            const res = await fetch(`https://api.freeapi.app/api/v1/public/youtube/videos?page=${page}&limit=12`);
            const json = await res.json();
            
            if (json.success) {
                const videos = json.data.data;
                currentPage = json.data.page;
                totalPages = json.data.totalPages;
                
                renderGrid(videos);
                
                indicator.textContent = `Page ${currentPage} of ${totalPages}`;
                btnPrev.disabled = currentPage === 1;
                btnNext.disabled = currentPage === totalPages;
            } else {
                container.innerHTML = `<div style="color: var(--error-text); grid-column: 1/-1;">Error fetching videos.</div>`;
            }
        } catch (err) {
            container.innerHTML = `<div style="color: var(--error-text); grid-column: 1/-1;">Network Error.</div>`;
        }
    };

    const renderGrid = (videos) => {
        container.innerHTML = videos.map(v => {
            const snip = v.items.snippet;
            const details = v.items.contentDetails;
            const stats = v.items.statistics;
            const thumbUrl = snip.thumbnails.high ? snip.thumbnails.high.url : snip.thumbnails.default.url;
            const videoId = v.items.id;

            return `
                <div class="item-card">
                    <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" class="item-link">
                        <div class="item-image-wrapper yt-thumbnail">
                            <img src="${thumbUrl}" alt="Thumbnail" loading="lazy">
                            <div class="yt-duration">${formatDuration(details.duration)}</div>
                        </div>
                        <div class="item-details">
                            <div class="item-title yt-title">${snip.title}</div>
                            <div class="item-meta yt-channel">${snip.channelTitle}</div>
                            <div class="item-meta yt-stats">${formatViews(stats.viewCount)} views</div>
                        </div>
                    </a>
                </div>
            `;
        }).join('');
    };

    btnPrev.addEventListener('click', () => { if (currentPage > 1) fetchVideos(currentPage - 1); });
    btnNext.addEventListener('click', () => { if (currentPage < totalPages) fetchVideos(currentPage + 1); });

    fetchVideos(currentPage);
}

export function unmount() {}