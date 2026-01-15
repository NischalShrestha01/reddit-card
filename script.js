const names = [
  "u/ghost_logic", "u/voidthinker", "u/midnightdev",
  "u/signalnoise", "u/404brain", "u/halfawake"
];

function randomName() {
  return names[Math.floor(Math.random() * names.length)];
}

function randomPfp() {
  return `https://i.pravatar.cc/50?img=${Math.floor(Math.random() * 70)}`;
}

const data = JSON.parse(localStorage.getItem("redditCard")) || {
  post: {
    user: "u/BoxMorton",
    pfp: randomPfp(),
    text: "Why would the Grim Reaper need a scythe if he can kill people by just touching them?",
    upvotes: "⬆ 133",
    comments: "💬 95"
  },
  comments: []
};

function save() {
  localStorage.setItem("redditCard", JSON.stringify(data));
}

/* POST RENDER */
document.querySelector(".post-content").textContent = data.post.text;
document.querySelector("[data-key='upvotes']").textContent = data.post.upvotes;
document.querySelector("[data-key='commentsCount']").textContent = data.post.comments;

function userBlock(userObj, onUpdate) {
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

  wrap.querySelector(".rand").onclick = () => {
    userObj.user = randomName();
    userObj.pfp = randomPfp();
    save();
    onUpdate();
  };

  wrap.querySelector(".link").onclick = () => {
    const url = prompt("Paste image URL:");
    if (url) {
      userObj.pfp = url;
      save();
      onUpdate();
    }
  };

  return wrap;
}

/* POST HEADER USER */
const postHeader = document.querySelector(".post-header");
postHeader.prepend(userBlock(data.post, () => location.reload()));

/* COMMENTS */
function renderComments() {
  const container = document.getElementById("comments");
  container.innerHTML = "";

  data.comments.forEach((c, i) => {
    const div = document.createElement("div");
    div.className = "comment";

    const header = document.createElement("div");
    header.className = "comment-header";
    header.appendChild(userBlock(c, renderComments));

    const text = document.createElement("div");
    text.className = "comment-text editable";
    text.textContent = c.text;
    text.onclick = () => {
      const v = prompt("Edit comment:", c.text);
      if (v) {
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

renderComments();

/* ADD COMMENT */
document.getElementById("addCommentBtn").onclick = () => {
  data.comments.push({
    user: randomName(),
    pfp: randomPfp(),
    text: "New comment"
  });
  save();
  renderComments();
};
