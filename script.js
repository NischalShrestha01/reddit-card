const NAMES = [
  "u/ghost_logic", "u/voidthinker", "u/midnightdev",
  "u/signalnoise", "u/404brain", "u/halfawake"
];

const randomName = () => NAMES[Math.floor(Math.random() * NAMES.length)];
const randomPfp = () => `https://i.pravatar.cc/50?img=${Math.floor(Math.random() * 70)}`;

const DEFAULT_DATA = {
  post: {
    user: "u/TheDreamingCat",
    pfp: "https://yt3.ggpht.com/OfYN7fLx7o5s-VjtJ7vRyTylZ9o7oMfA1IevNDymtmvfgLfZr3PnoAuyLb-AZcPboue2Sx9F=s600-c-k-c0x00ffffff-no-rj-rp-mo",
    text: "Why would the Grim Reaper need a scythe if he can kill people by just touching them?",
    upvotes: "⬆ 133",
    commentsCount: "💬 0",
    image: null
  },
  comments: []
};

const data = JSON.parse(localStorage.getItem("redditCard")) || DEFAULT_DATA;
const save = () => localStorage.setItem("redditCard", JSON.stringify(data));

document.addEventListener("click", () => {
  document.querySelectorAll(".user-wrap.active")
    .forEach(w => w.classList.remove("active"));
});

const imageInput = document.createElement("input");
imageInput.type = "file";
imageInput.accept = "image/*";
imageInput.hidden = true;
document.body.appendChild(imageInput);

function userBlock(userObj, rerender, allowImage = false) {
  const wrap = document.createElement("div");
  wrap.className = "user-wrap";

  wrap.innerHTML = `
    <img class="pfp" src="${userObj.pfp}">
    <span class="username">${userObj.user}</span>
    <div class="user-menu">
      <button class="rand">🎲</button>
      <button class="name">✏</button>
      <button class="img">🖼</button>
      <button class="link">🔗</button>
      <button class="rmimg">❌</button>
      <button class="del">🗑</button>
    </div>
  `;

  const menu = wrap.querySelector(".user-menu");
  wrap.querySelector(".pfp").onclick =
    wrap.querySelector(".username").onclick = e => {
      e.stopPropagation();
      wrap.classList.toggle("active");
    };

  menu.onclick = e => e.stopPropagation();

  wrap.querySelector(".rand").onclick = () => {
    userObj.user = randomName();
    userObj.pfp = randomPfp();
    save(); rerender();
  };

  wrap.querySelector(".name").onclick = () => {
    const v = prompt("Username:", userObj.user);
    if (v) { userObj.user = v; save(); rerender(); }
  };

  wrap.querySelector(".img").onclick = () => {
    imageInput.onchange = () => {
      const f = imageInput.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        if (allowImage) data.post.image = r.result;
        else userObj.pfp = r.result;
        save(); rerender();
      };
      r.readAsDataURL(f);
    };
    imageInput.click();
  };

  wrap.querySelector(".link").onclick = () => {
    const url = prompt("Paste image URL:");
    if (!url) return;
    if (allowImage) data.post.image = url;
    else userObj.pfp = url;
    save(); rerender();
  };

  wrap.querySelector(".rmimg").onclick = () => {
    if (allowImage) data.post.image = null;
    else userObj.pfp = randomPfp();
    save(); rerender();
  };

  wrap.querySelector(".del").onclick = () => {
    if (userObj._delete && confirm("Delete?")) userObj._delete();
  };

  return wrap;
}

function renderPost() {
  postHeader.innerHTML = "";
  postHeader.appendChild(userBlock(data.post, renderAll, true));

  postText.textContent = data.post.text;
  postText.onclick = () => {
    const v = prompt("Edit post:", data.post.text);
    if (v) { data.post.text = v; save(); renderPost(); }
  };

  upvotes.textContent = data.post.upvotes;
  commentsCount.textContent = data.post.commentsCount;

  upvotes.onclick = () => {
    const v = prompt("Upvotes:", data.post.upvotes.replace("⬆ ", ""));
    if (v !== null) {
      data.post.upvotes = `⬆ ${v}`;
      save(); renderPost();
    }
  };

  commentsCount.onclick = () => {
    const v = prompt("Comments:", data.post.commentsCount.replace("💬 ", ""));
    if (v !== null) {
      data.post.commentsCount = `💬 ${v}`;
      save(); renderPost();
    }
  };

  postImage.style.display = data.post.image ? "block" : "none";
  postImage.src = data.post.image || "";
}

function renderComments(list, container) {
  list.forEach(c => {
    c.upvotes ??= 1;
    c.replies ??= [];

    const div = document.createElement("div");
    div.className = "comment";

    c._delete = () => {
      list.splice(list.indexOf(c), 1);
      save(); renderAll();
    };

    const header = document.createElement("div");
    header.className = "comment-header";
    header.appendChild(userBlock(c, renderAll));

    const text = document.createElement("div");
    text.className = "comment-text";
    text.textContent = c.text;
    text.onclick = () => {
      const v = prompt("Edit comment:", c.text);
      if (v) { c.text = v; save(); renderAll(); }
    };

    const footer = document.createElement("div");
    footer.className = "comment-footer";

    const up = document.createElement("span");
    up.textContent = `⬆ ${c.upvotes}`;
    up.onclick = e => {
      e.stopPropagation();
      const v = prompt("Upvotes:", c.upvotes);
      if (v !== null) {
        c.upvotes = Number(v) || c.upvotes;
        save(); renderAll();
      }
    };

    const rep = document.createElement("span");
    rep.textContent = `💬 ${c.replies.length}`;
    rep.onclick = e => {
      e.stopPropagation();
      c.replies.push({
        user: randomName(),
        pfp: randomPfp(),
        text: "Reply",
        upvotes: 1,
        replies: []
      });
      save(); renderAll();
    };

    footer.append(up, rep);
    div.append(header, text, footer);

    if (c.replies.length) {
      const r = document.createElement("div");
      r.className = "replies";
      renderComments(c.replies, r);
      div.appendChild(r);
    }

    container.appendChild(div);
  });
}

function renderAll() {
  renderPost();
  comments.innerHTML = "";
  renderComments(data.comments, comments);
}

addCommentBtn.onclick = () => {
  data.comments.push({
    user: randomName(),
    pfp: randomPfp(),
    text: "New comment",
    upvotes: 1,
    replies: []
  });
  data.post.commentsCount = `💬 ${data.comments.length}`;
  save(); renderAll();
};

clearCommentsBtn.onclick = () => {
  if (confirm("Clear all comments?")) {
    data.comments = [];
    data.post.commentsCount = "💬 0";
    save(); renderAll();
  }
};

renderAll();
