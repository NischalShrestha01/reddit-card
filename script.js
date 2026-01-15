/* ===== RANDOM NAMES & PROFILE PICS ===== */
const NAMES = [
  "u/ghost_logic", "u/voidthinker", "u/midnightdev",
  "u/signalnoise", "u/404brain", "u/halfawake"
];

const randomName = () =>
  NAMES[Math.floor(Math.random() * NAMES.length)];

const randomPfp = () =>
  `https://i.pravatar.cc/50?img=${Math.floor(Math.random() * 70)}`;

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
  try {
    stored = JSON.parse(localStorage.getItem("redditCard"));
  } catch (e) {
    stored = null;
  }

  // Ensure required structure exists
  if (!stored || !stored.post || typeof stored.post.text !== "string") {
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }

  // Merge stored post with default post (to fill missing fields)
  const post = { ...DEFAULT_DATA.post, ...stored.post };
  const comments = Array.isArray(stored.comments) ? stored.comments : [];

  return { post, comments };
}

const data = loadData();

/* ===== SAVE FUNCTION ===== */
function save() {
  localStorage.setItem("redditCard", JSON.stringify(data));
}

/* ===== USER BLOCK ===== */
function userBlock(userObj, rerender) {
  const wrap = document.createElement("div");
  wrap.className = "user-wrap";

  wrap.innerHTML = `
    <img class="pfp" src="${userObj.pfp}">
    <span class="username">${userObj.user}</span>
    <div class="user-menu" style="display:none; position:absolute;">
      <button class="rand">🎲 Random</button>
      <button class="link">🔗 Set image</button>
    </div>
  `;

  const avatar = wrap.querySelector(".pfp");
  const menu = wrap.querySelector(".user-menu");

  // Show buttons on hover
  wrap.addEventListener("mouseenter", () => {
    menu.style.display = "inline-block";
  });
  wrap.addEventListener("mouseleave", () => {
    menu.style.display = "none";
  });

  // Randomize username + pfp
  wrap.querySelector(".rand").onclick = () => {
    userObj.user = randomName();
    userObj.pfp = randomPfp();
    save();
    rerender();
  };

  // Set custom image
  wrap.querySelector(".link").onclick = () => {
    const url = prompt("Paste image URL:");
    if (url) {
      userObj.pfp = url;
      save();
      rerender();
    }
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

  // Edit post text
  postTextEl.onclick = () => {
    const v = prompt("Edit post text:", data.post.text);
    if (v !== null) { // allow empty string
      data.post.text = v;
      save();
      renderPost();
    }
  };
}

/* ===== RENDER COMMENTS ===== */
function renderComments() {
  const container = document.getElementById("comments");
  container.innerHTML = "";

  data.comments.forEach((c, i) => {
    const div = document.createElement("div");
    div.className = "comment";

    const header = document.createElement("div");
    header.className = "comment-header";
    header.appendChild(userBlock(c, renderAll));

    const text = document.createElement("div");
    text.className = "comment-text";
    text.textContent = c.text;

    text.onclick = () => {
      const v = prompt("Edit comment:", c.text);
      if (v !== null) {
        c.text = v;
        save();
        renderComments();
      }
    };

    div.appendChild(header);
    div.appendChild(text);
    container.appendChild(div);
  });
}

/* ===== ADD COMMENT ===== */
document.getElementById("addCommentBtn").onclick = () => {
  data.comments.push({
    user: randomName(),
    pfp: randomPfp(),
    text: "New comment"
  });
  save();
  renderAll(); // full render to keep comments + post in sync
};

/* ===== MASTER RENDER ===== */
function renderAll() {
  renderPost();
  renderComments();
}

/* ===== INITIAL RENDER ===== */
renderAll();
