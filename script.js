/* ===== UTILS ===== */
const NAMES = ["u/ghost_logic", "u/voidthinker", "u/midnightdev", "u/signalnoise", "u/404brain"];
const randomName = () => NAMES[Math.floor(Math.random() * NAMES.length)];
const randomPfp = () => `https://i.pravatar.cc/50?img=${Math.floor(Math.random() * 70)}`;


const DEFAULT_DATA = {
  post: {
    user: "u/TheDreamingCat",
    pfp: "https://imgs.search.brave.com/44Rj3zRUvCMxMY8B-miqspb4xQAuyLuKQACoeWwPU8Q/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTI4/OTg4NTg2MS9waG90/by9jdXRlLWdpbmdl/ci1jYXQuanBnP3M9/NjEyeDYxMiZ3PTAm/az0yMCZjPXhYUDMx/dS0xZFNNaTg1cVFs/a2pyMlNDRUgyV3J4/VkhIQU9XQ2NaRlM1/RVU9",
    text: "Why would the Grim Reaper need a scythe if he can kill people by just touching them?",
    upvotes: "⬆ 133",
    commentsCount: "💬 0",
    image: null
  },
  comments: []
};

const data = JSON.parse(localStorage.getItem("redditCard")) || DEFAULT_DATA;
const save = () => localStorage.setItem("redditCard", JSON.stringify(data));

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
    <button class="del">🗑</button>
    <button class="rmimg">❌</button>

  </div>
`;
  const menu = wrap.querySelector(".user-menu");
  const avatar = wrap.querySelector(".pfp");
  const name = wrap.querySelector(".username");
  menu.onclick = e => e.stopPropagation();

  function toggleMenu(e) {
    e.stopPropagation();
    wrap.classList.toggle("active");
  }

  avatar.onclick = toggleMenu;
  name.onclick = toggleMenu;


  wrap.querySelector(".rand").onclick = () => {
    userObj.user = randomName();
    userObj.pfp = randomPfp();
    save(); rerender();
  };

  wrap.querySelector(".name").onclick = () => {
    const v = prompt("Username:", userObj.user);
    if (v) { userObj.user = v; save(); rerender(); }
  };


  wrap.querySelector(".rmimg").onclick = () => {
    if (allowImage) {
      data.post.image = null;
    } else {
      userObj.pfp = randomPfp();
    }
    save();
    rerender();
  };

  wrap.querySelector(".img").onclick = () => {
    imageInput.onchange = () => {
      const r = new FileReader();
      r.onload = () => {
        if (allowImage) data.post.image = r.result;
        else userObj.pfp = r.result;
        save(); rerender();
      };
      r.readAsDataURL(imageInput.files[0]);
    };
    imageInput.click();
  };
  wrap.querySelector(".link").onclick = () => {
    const url = prompt("Paste image URL:");
    if (!url) return;

    if (allowImage) {
      data.post.image = url;
    } else {
      userObj.pfp = url;
    }

    save();
    rerender();
  };


  wrap.querySelector(".del").onclick = () => {
    if (confirm("Delete?")) userObj._delete();
  };

  return wrap;
}

function renderPost() {
  const h = document.getElementById("postHeader");
  h.innerHTML = "";
  h.appendChild(userBlock(data.post, renderAll, true));

  postText.textContent = data.post.text;
  upvotes.textContent = data.post.upvotes;
  commentsCount.textContent = data.post.commentsCount;

  c.upvotes = c.upvotes || 1;  // default 1

  postText.onclick = () => {
    const v = prompt("Edit post:", data.post.text);
    if (v) { data.post.text = v; save(); renderPost(); }
  };

  upvotes.onclick = () => {
    const v = prompt("Upvotes:", data.post.upvotes);
    if (v) { data.post.upvotes = v; save(); renderPost(); }
  };

  commentsCount.onclick = () => {
    const v = prompt("Comments:", data.post.commentsCount);
    if (v) { data.post.commentsCount = v; save(); renderPost(); }
  };

  const img = document.getElementById("postImage");
  img.style.display = data.post.image ? "block" : "none";
  img.src = data.post.image || "";

  const upEl = document.getElementById("upvotes");
  const cmEl = document.getElementById("commentsCount");

  upEl.textContent = data.post.upvotes;
  cmEl.textContent = data.post.commentsCount;

  // Make them editable again
  upEl.onclick = () => {
    const v = prompt("Edit upvotes:", data.post.upvotes.replace("⬆ ", ""));
    if (v !== null) {
      data.post.upvotes = `⬆ ${v}`;
      save();
      renderPost();
    }
  };

  cmEl.onclick = () => {
    const v = prompt("Edit comments count:", data.post.commentsCount.replace("💬 ", ""));
    if (v !== null) {
      data.post.commentsCount = `💬 ${v}`;
      save();
      renderPost();
    }
  };

}

function renderComments(list, container) {
  list.forEach(c => {
    const div = document.createElement("div");
    div.className = "comment";

    c._delete = () => {
      const i = list.indexOf(c);
      list.splice(i, 1);
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
    footer.innerHTML = `⬆ ${c.upvotes || 1} 💬 ${c.replies.length} `;

    footer.onclick = () => {
      c.replies.push({
        user: randomName(),
        pfp: randomPfp(),
        text: "Reply",
        replies: []
      });
      save(); renderAll();
    };

    div.append(header, text, footer);

    if (c.replies.length) {
      const replies = document.createElement("div");
      replies.className = "replies";
      renderComments(c.replies, replies);
      div.appendChild(replies);
    }

    container.appendChild(div);
  });
}

function renderAll() {
  renderPost();
  const c = document.getElementById("comments");
  c.innerHTML = "";
  renderComments(data.comments, c);
}

addCommentBtn.onclick = () => {
  data.comments.push({
    user: randomName(),
    pfp: randomPfp(),
    text: "New comment",
    replies: []
  });
  data.post.commentsCount = `💬 ${data.comments.length} `;
  save(); renderAll();
};

clearCommentsBtn.onclick = () => {
  if (confirm("Clear all comments?")) {
    data.comments = [];
    data.post.commentsCount = "💬 0";
    save(); renderAll();
  }
};
document.addEventListener("click", () => {
  document.querySelectorAll(".user-wrap.active")
    .forEach(w => w.classList.remove("active"));
});


renderAll();