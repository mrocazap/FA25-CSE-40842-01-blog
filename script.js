const state = { posts: [] };

const views = {
  home: document.getElementById("home-view"),
  post: document.getElementById("post-view"),
  about: document.getElementById("about-view"),
  contact: document.getElementById("contact-view"),
  archive: document.getElementById("archive-view"),
};
const postsEl = document.getElementById("posts");
const archiveEl = document.getElementById("archive-posts");

async function loadPosts() {
  try {
    const res = await fetch("posts.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    data.sort((a, b) => new Date(b.date) - new Date(a.date));
    state.posts = data;
    if (postsEl) renderList(postsEl, 3);     // Home: latest 3
    if (archiveEl) renderList(archiveEl);    // Archive: all
  } catch (err) {
    console.error("Could not load posts.json. If you're opening the file directly, run a local server (python -m http.server).", err);
    if (postsEl) postsEl.innerHTML = `<p class="meta">Could not load posts. See console for details.</p>`;
    if (archiveEl) archiveEl.innerHTML = `<p class="meta">Could not load posts. See console for details.</p>`;
  }
}

function renderList(target, limit) {
  const items = limit ? state.posts.slice(0, limit) : state.posts;
  target.innerHTML = items.map(p => `
    <article class="card">
      <a href="#/post/${p.slug}">
        <h2>${escapeHtml(p.title)}</h2>
        <p class="meta">${formatDate(p.date)} · ${(p.tags || []).join(", ")}</p>
        <p>${escapeHtml(p.summary)}</p>
      </a>
    </article>
  `).join("");
}

async function renderPost(slug) {
  const post = state.posts.find(p => p.slug === slug);
  if (!post) {
    document.getElementById("post-title").textContent = "Not found";
    document.getElementById("post-content").textContent = "That post does not exist.";
    return;
  }
  document.getElementById("post-title").textContent = post.title;
  document.getElementById("post-date").textContent = formatDate(post.date);
  document.getElementById("post-tags").textContent = (post.tags || []).join(", ");
  try {
    const res = await fetch(`posts/${slug}.md`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const md = await res.text();
    document.getElementById("post-content").innerHTML = marked.parse(md);
  } catch (err) {
    console.error(`Could not load posts/${slug}.md`, err);
    document.getElementById("post-content").textContent = "Could not load this post. See console for details.";
  }
}

function route() {
  const hash = location.hash || "#/";
  const [, path, param] = hash.split("/");
  Object.values(views).forEach(v => v && v.classList.add("hidden"));

  if (!path || path === "") {
    views.home?.classList.remove("hidden");
  } else if (path === "post" && param) {
    views.post?.classList.remove("hidden");
    renderPost(param);
  } else if (path === "about") {
    views.about?.classList.remove("hidden");
  } else if (path === "contact") {
    views.contact?.classList.remove("hidden");
  } else if (path === "archive") {
    views.archive?.classList.remove("hidden");
  } else {
    views.home?.classList.remove("hidden");
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[m]);
}

function formatDate(s) {
  try {
    return new Date(s).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return s;
  }
}

window.addEventListener("hashchange", route);
loadPosts().then(route);