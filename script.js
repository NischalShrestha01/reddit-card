/* ===== UTIL ===== */
const NAMES = ["u/ghost_logic","u/voidthinker","u/midnightdev","u/signalnoise","u/404brain","u/halfawake"];
const randomName = () => NAMES[Math.floor(Math.random()*NAMES.length)];
const randomPfp = () => `https://i.pravatar.cc/50?img=${Math.floor(Math.random()*70)}`;

/* ===== DEFAULT ===== */
const DEFAULT_DATA = {
  post: {
    user: "u/BoxMorton",
    pfp: randomPfp(),
    text: "Why would the Grim Reaper need a scythe if he can kill people by just touching them?",
    image: null,
    upvotes: 133,
    comments: 0
  },
  comments: []
};

/* ===== STORAGE ===== */
function loadData() {
  try {
    const d = JSON.parse(localStorage.getItem("redditCard"));
    if (!d?.post?.text) throw 0;
    return d;
  } catch {
    return structuredClone(DEFAULT_DATA);
  }
}
const data = loadData();
const save = () => localStorage.setItem("redditCard", JSON.stringify(data));

/* ===== DELETE HELPERS ===== */
function countAllReplies(node) {
  return node.replies.reduce((n, r) => n + 1 + countAllReplies(r), 0);
}

function deleteNode(list, node) {
  const i = list.indexOf(node);
  if (i !== -1) {
    const removed = list.splice(i, 1)[0];
    data.post.comments -= 1 + countAllReplies(removed);
  }
}

/* ===== USER BLOCK ===== */
function userBlock(obj, rerender, parentList = null) {
  const w = document.createElement("div");
  w.className = "user-wrap";

  w.innerHTML = `
    <img class="pfp" src="${obj.pfp}">
    <span class="username">${obj.user}</span>
    <div class="user-menu">
      <button title="Random user">🎲</button>
      <button title="Set avatar">🔗</button>
      <button title="Attach image">🖼</button>
      ${parentList ? `<button title="Delete">🗑</button>` : ""}
    </div>
  `;

  const buttons = w.querySelectorAll("button");

  // 🎲 random
  buttons[0].onclick = () => {
    obj.user = randomName();
    obj.pfp = randomPfp();
    save(); rerender();
  };

  // 🔗 avatar
  buttons[1].onclick = () => {
    const u = prompt("Avatar image URL:");
    if (u) { obj.pfp = u; save(); rerender(); }
  };

  // 🖼 image
  buttons[2].onclick = () => {
    const img = prompt("Attach image URL (empty removes):");
    if (img !== null) {
      obj.image = img || null;
      save(); rerender();
    }
  };

  // 🗑 delete (comments/replies only)
  if (parentList) {
    buttons[3].onclick = () => {
      if (!confirm("Delete this comment and all replies?")) return;
      deleteNode(parentList, obj);
      save(); rerender();
    };
  }

  return w;
}

/* ===== POST ===== */
function renderPost() {
  const h = document.getElementById("postHeader");
  h.innerHTML = "";
  h.appendChild(userBlock(data.post, renderAll));

  const t = document.getElementById("postText");
  t.textContent = data.post.text;
  t.onclick = () => {
    const v = prompt("Edit post:", data.post.text);
    if (v !== null) { data.post.text = v; save(); renderPost(); }
  };

  document.querySelector(".post-image")?.remove();
  if (data.post.image) {
    const img = document.createElement("div");
    img.className = "post-image";
    img.innerHTML = `<img src="${data.post.image}">`;
    t.after(img);
  }

  const u = document.getElementById("upvotes");
  u.textContent = `⬆ ${data.post.upvotes}`;
  u.onclick = () => {
    const v = prompt("Upvotes:", data.post.upvotes);
    if (!isNaN(v)) { data.post.upvotes = +v; save(); renderPost(); }
  };

  document.getElementById("commentsCount").textContent = `💬 ${data.post.comments}`;
}

/* ===== COMMENT (RECURSIVE) ===== */
function renderComment(c, parentList) {
  const d = document.createElement("div");
  d.className = "comment";

  const h = document.createElement("div");
  h.className = "comment-header";
  h.appendChild(userBlock(c, renderAll, parentList));

  const txt = document.createElement("div");
  txt.className = "comment-text";
  txt.textContent = c.text;
  txt.onclick = () => {
    const v = prompt("Edit comment:", c.text);
    if (v !== null) { c.text = v; save(); renderAll(); }
  };

  d.append(h, txt);

  if (c.image) {
    const img = document.createElement("div");
    img.className = "comment-image";
    img.innerHTML = `<img src="${c.image}">`;
    d.appendChild(img);
  }

  const f = document.createElement("div");
  f.className = "comment-footer";

  const up = document.createElement("span");
  up.className = "meta";
  up.textContent = `⬆ ${c.upvotes}`;
  up.onclick = () => {
    const v = prompt("Upvotes:", c.upvotes);
    if (!isNaN(v)) { c.upvotes = +v; save(); renderAll(); }
  };

  const cm = document.createElement("span");
  cm.className = "meta";
  cm.textContent = `💬 ${c.replies.length}`;
  cm.onclick = () => {
    c.replies.push({
      user: randomName(),
      pfp: randomPfp(),
      text: "New reply",
      image: null,
      upvotes: 0,
      replies: []
    });
    data.post.comments++;
    save(); renderAll();
  };

  f.append(up, cm);
  d.appendChild(f);

  const r = document.createElement("div");
  r.className = "replies";
  c.replies.forEach(x => r.appendChild(renderComment(x, c.replies)));
  d.appendChild(r);

  return d;
}

/* ===== COMMENTS ===== */
function renderComments() {
  const c = document.getElementById("comments");
  c.innerHTML = "";
  data.comments.forEach(x => c.appendChild(renderComment(x, data.comments)));
}

/* ===== ADD / CLEAR ===== */
document.getElementById("addCommentBtn").onclick = () => {
  data.comments.push({
    user: randomName(),
    pfp: randomPfp(),
    text: "New comment",
    image: null,
    upvotes: 0,
    replies: []
  });
  data.post.comments++;
  save(); renderAll();
};

// Clear all comments (dev-style)
const clearBtn = document.createElement("button");
clearBtn.textContent = "🧹 Clear All Comments";
clearBtn.onclick = () => {
  if (!confirm("Delete ALL comments?")) return;
  data.comments = [];
  data.post.comments = 0;
  save(); renderAll();
};
document.querySelector(".post-container").appendChild(clearBtn);

/* ===== MASTER ===== */
function renderAll() {
  renderPost();
  renderComments();
}
renderAll();
