/* ===== RANDOM NAMES & PROFILE PICS ===== */
const NAMES = ["u/ghost_logic","u/voidthinker","u/midnightdev","u/signalnoise","u/404brain","u/halfawake"];
const randomName = () => NAMES[Math.floor(Math.random() * NAMES.length)];
const randomPfp = () => `https://i.pravatar.cc/50?img=${Math.floor(Math.random() * 70)}`;

/* ===== DEFAULT DATA ===== */
const DEFAULT_DATA = {
  post: {
    user: "u/BoxMorton",
    pfp: randomPfp(),
    text: "Why would the Grim Reaper need a scythe if he can kill people by just touching them?",
    upvotes: "⬆ 133",
    commentsCount: "💬 95"
  },
  comments: []
};

/* ===== LOAD DATA SAFELY ===== */
function loadData() {
  let stored = null;
  try { stored = JSON.parse(localStorage.getItem("redditCard")); } catch(e) { stored = null; }

  if(!stored || !stored.post || typeof stored.post.text !== "string") return JSON.parse(JSON.stringify(DEFAULT_DATA));

  const post = { ...DEFAULT_DATA.post, ...stored.post };
  const comments = Array.isArray(stored.comments) ? stored.comments : [];
  return { post, comments };
}

const data = loadData();
function save() { localStorage.setItem("redditCard", JSON.stringify(data)); }

/* ===== USER BLOCK WITH HOVER MENU ===== */
function userBlock(userObj, rerender) {
  const wrap = document.createElement("div");
  wrap.className = "user-wrap";

  wrap.innerHTML = `
    <img class="pfp" src="${userObj.pfp}">
    <span class="username">${userObj.user}</span>
    <div class="user-menu">
      <button class="rand">🎲 Random</button>
      <button class="link">🔗 Set image</button>
    </div>
  `;

  const menu = wrap.querySelector(".user-menu");

  wrap.querySelector(".rand").onclick = () => {
    userObj.user = randomName(); userObj.pfp = randomPfp(); save(); rerender();
  };
  wrap.querySelector(".link").onclick = () => {
    const url = prompt("Paste image URL:");
    if(url){ userObj.pfp=url; save(); rerender(); }
  };

  return wrap;
}

/* ===== RENDER POST ===== */
function renderPost() {
  const header = document.getElementById("postHeader");
  header.innerHTML = "";
  header.appendChild(userBlock(data.post, renderAll));

  const postTextEl = document.getElementById("postText");
  postTextEl.textContent = data.post.text;
  document.getElementById("upvotes").textContent = data.post.upvotes;
  document.getElementById("commentsCount").textContent = data.post.commentsCount;

  postTextEl.onclick = () => {
    const v = prompt("Edit post text:", data.post.text);
    if(v !== null){ data.post.text = v; save(); renderPost(); }
  };
}

/* ===== RECURSIVE COMMENT RENDER ===== */
function renderComment(c, rerender){
  const div = document.createElement("div");
  div.className = "comment";

  const header = document.createElement("div");
  header.className = "comment-header";
  header.appendChild(userBlock(c, rerender));

  const text = document.createElement("div");
  text.className = "comment-text";
  text.textContent = c.text;
  text.onclick = () => { const v = prompt("Edit comment:", c.text); if(v!==null){ c.text=v; save(); rerender(); } };

  const replyBtn = document.createElement("button");
  replyBtn.textContent = "Reply";
  replyBtn.onclick = () => {
    c.replies = c.replies || [];
    c.replies.push({ user: randomName(), pfp: randomPfp(), text: "New reply", replies: [] });
    save();
    rerender();
  };

  div.appendChild(header);
  div.appendChild(text);
  div.appendChild(replyBtn);

  const repliesContainer = document.createElement("div");
  repliesContainer.className = "replies";
  if(c.replies && c.replies.length>0){
    c.replies.forEach(r => { repliesContainer.appendChild(renderComment(r, rerender)); });
  }
  div.appendChild(repliesContainer);

  return div;
}

/* ===== RENDER ALL COMMENTS ===== */
function renderComments(){
  const container = document.getElementById("comments");
  container.innerHTML="";
  data.comments.forEach(c => container.appendChild(renderComment(c, renderAll)));
}

/* ===== ADD TOP-LEVEL COMMENT ===== */
document.getElementById("addCommentBtn").onclick = () => {
  data.comments.push({ user: randomName(), pfp: randomPfp(), text: "New comment", replies: [] });
  save();
  renderAll();
};

/* ===== MASTER RENDER ===== */
function renderAll(){ renderPost(); renderComments(); }

/* ===== INITIAL RENDER ===== */
renderAll();
