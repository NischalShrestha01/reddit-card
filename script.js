/* ===== UTIL ===== */
const NAMES = ["u/ghost_logic","u/voidthinker","u/midnightdev","u/signalnoise","u/404brain"];
const randomName = () => NAMES[Math.floor(Math.random()*NAMES.length)];
const randomPfp = () => `https://i.pravatar.cc/50?img=${Math.floor(Math.random()*70)}`;

/* ===== DEFAULT ===== */
const DEFAULT = {
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
function load() {
  try {
    const d = JSON.parse(localStorage.getItem("redditCard"));
    if (!d?.post?.text) throw 0;
    return d;
  } catch {
    return structuredClone(DEFAULT);
  }
}
const data = load();
const save = () => localStorage.setItem("redditCard", JSON.stringify(data));

/* ===== HELPERS ===== */
const countReplies = n => n.replies.reduce((a,b)=>a+1+countReplies(b),0);

/* ===== USER BLOCK ===== */
function userBlock(obj, rerender, parent=null) {
  const w = document.createElement("div");
  w.className = "user-wrap";

  w.innerHTML = `
    <img class="pfp" src="${obj.pfp}">
    <span class="username">${obj.user}</span>
    <div class="user-menu">
      <button title="Random">🎲</button>
      <button title="Avatar">🔗</button>
      <button title="Image">🖼</button>
      ${parent ? `<button title="Delete">🗑</button>` : ""}
    </div>
  `;

  // ✅ FIX: username editable
  w.querySelector(".username").onclick = () => {
    const n = prompt("Edit username:", obj.user);
    if (n) { obj.user = n; save(); rerender(); }
  };

  const [rnd, ava, img, del] = w.querySelectorAll("button");

  rnd.onclick = () => { obj.user = randomName(); obj.pfp = randomPfp(); save(); rerender(); };
  ava.onclick = () => {
    const u = prompt("Avatar URL:");
    if (u) { obj.pfp = u; save(); rerender(); }
  };
  img.onclick = () => {
    const i = prompt("Image URL (empty removes):");
    if (i !== null) { obj.image = i || null; save(); rerender(); }
  };

  if (del) {
    del.onclick = () => {
      if (!confirm("Delete?")) return;
      const idx = parent.indexOf(obj);
      data.post.comments -= 1 + countReplies(obj);
      parent.splice(idx,1);
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
    if (v) { data.post.text = v; save(); renderPost(); }
  };

  document.querySelector(".post-image")?.remove();
  if (data.post.image) {
    const i = document.createElement("div");
    i.className = "post-image";
    i.innerHTML = `<img src="${data.post.image}">`;
    t.after(i);
  }

  const u = document.getElementById("upvotes");
  u.textContent = `⬆ ${data.post.upvotes}`;
  u.onclick = () => {
    const v = prompt("Upvotes:", data.post.upvotes);
    if (!isNaN(v)) { data.post.upvotes = +v; save(); renderPost(); }
  };

  document.getElementById("commentsCount").textContent = `💬 ${data.post.comments}`;
}

/* ===== COMMENT ===== */
function renderComment(c, list) {
  const d = document.createElement("div");
  d.className = "comment";

  const h = document.createElement("div");
  h.appendChild(userBlock(c, renderAll, list));

  const txt = document.createElement("div");
  txt.textContent = c.text;
  txt.className = "editable";
  txt.onclick = () => {
    const v = prompt("Edit comment:", c.text);
    if (v) { c.text = v; save(); renderAll(); }
  };

  d.append(h, txt);

  if (c.image) {
    const i = document.createElement("div");
    i.className = "comment-image";
    i.innerHTML = `<img src="${c.image}">`;
    d.appendChild(i);
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

/* ===== MASTER ===== */
function renderAll() {
  renderPost();
  renderComments();
}
renderAll();
