const defaults = {
  postUser: "u/BoxMorton",
  postPfp: "https://i.pravatar.cc/60?img=12",
  postText: "Why would the Grim Reaper need a scythe if he can kill people by just touching them?",
  upvotes: "⬆ 133",
  commentsCount: "💬 95",
  comments: [
    {
      user: "ddrober2003",
      pfp: "https://i.pravatar.cc/50?img=32",
      text: "Because he is the Grim Reaper and he needs a scythe to reap."
    }
  ]
};

// Load or initialize
const data = JSON.parse(localStorage.getItem("redditCard")) || defaults;
localStorage.setItem("redditCard", JSON.stringify(data));

// Helper save
function save() {
  localStorage.setItem("redditCard", JSON.stringify(data));
}

// Load post
document.querySelectorAll("[data-key]").forEach(el => {
  const key = el.dataset.key;
  if (el.tagName === "IMG") el.src = data[key];
  else el.textContent = data[key];
});

// Editable fields
document.querySelectorAll(".editable").forEach(el => {
  el.addEventListener("click", () => {
    const key = el.dataset.key;
    const value = prompt("Edit value:", data[key]);
    if (value) {
      data[key] = value;
      el.textContent = value;
      save();
    }
  });
});

// Editable PFP
document.querySelector(".pfp").addEventListener("click", () => {
  const url = prompt("Enter image URL:", data.postPfp);
  if (url) {
    data.postPfp = url;
    document.querySelector(".pfp").src = url;
    save();
  }
});

// Render comments
function renderComments() {
  const container = document.getElementById("comments");
  container.innerHTML = "";

  data.comments.forEach((c, i) => {
    const div = document.createElement("div");
    div.className = "comment";

    div.innerHTML = `
      <div class="comment-header">
        <img class="pfp clickable" src="${c.pfp}" />
        <span class="username clickable">${c.user}</span>
      </div>
      <div class="comment-text editable">${c.text}</div>
    `;

    // Edit username
    div.querySelector(".username").onclick = () => {
      const v = prompt("Username:", c.user);
      if (v) { c.user = v; save(); renderComments(); }
    };

    // Edit text
    div.querySelector(".comment-text").onclick = () => {
      const v = prompt("Comment:", c.text);
      if (v) { c.text = v; save(); renderComments(); }
    };

    // Edit pfp
    div.querySelector(".pfp").onclick = () => {
      const v = prompt("PFP URL:", c.pfp);
      if (v) { c.pfp = v; save(); renderComments(); }
    };

    container.appendChild(div);
  });
}

renderComments();

// Add new comment
document.getElementById("addCommentBtn").onclick = () => {
  data.comments.push({
    user: "new_user",
    pfp: "https://i.pravatar.cc/50",
    text: "New comment"
  });
  save();
  renderComments();
};
