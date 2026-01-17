const NAMES = [
  "u/ghost_logic", "u/voidsignal", "u/midnightdev", "u/404brain",
  "u/halfwired", "u/packet_loss", "u/bitrot", "u/nullpointer",
  "u/cache_miss", "u/stacktrace", "u/segfaulted", "u/runtime_error",
  "u/logic_leak", "u/darkterminal", "u/sudo_user", "u/rootless",
  "u/forkbomb", "u/byte_me", "u/kernelpanic", "u/hexadecimator",

  "u/latent_thought", "u/quietprocess", "u/asyncdreams", "u/idlethread",
  "u/backgroundtask", "u/signalnoise", "u/echo_buffer", "u/overflowed",
  "u/pointer_void", "u/undefinedbehave", "u/bitshifted", "u/loop_forever",
  "u/offbyone", "u/softreset", "u/hardfault", "u/clock_skew",

  "u/lowbandwidth", "u/hiddenlayer", "u/neuralstatic", "u/latentvector",
  "u/deepcache", "u/entropy_pool", "u/randomseed", "u/chaos_engine",
  "u/fuzzylogic", "u/noisychannel", "u/blackboxer", "u/obscuredsignal",

  "u/thoughtbuffer", "u/mindoverflow", "u/silentexception", "u/ghostthread",
  "u/sleepwalker_io", "u/coldboot", "u/fragmented", "u/memoryleak",
  "u/pagefault", "u/dirtycache", "u/frozenprocess", "u/zombiepid",

  "u/bitdepth", "u/pixelnoise", "u/dithermind", "u/glitchstate",
  "u/renderpass", "u/frame_skip", "u/vsync_lost", "u/aliasing_error",
  "u/lowpolybrain", "u/shaderghost", "u/rastermind", "u/vectorvoid",

  "u/late_night_commit", "u/merge_conflict", "u/rebased", "u/detachedhead",
  "u/force_pushed", "u/stash_lost", "u/clean_build", "u/failing_tests",
  "u/redgreenrefactor", "u/commit_amnesia"
];

const randomName = () => NAMES[Math.floor(Math.random() * NAMES.length)];
const randomPfp = () => `https://i.pravatar.cc/50?img=${Math.floor(Math.random() * 70)}`;

const DEFAULT_DATA = {
  theme: "dark",
  post: {
    user: "u/TheDreamingCat",
    pfp: "https://i.pravatar.cc/50?img=12",
    text: "Why would the Grim Reaper need a scythe if he can kill people by just touching them?",
    upvotes: "⬆ 133",
    commentsCount: "💬 0",
    image: null,
    imageSize: "medium",
    imageWidth: "",
    imageHeight: ""
  }
  ,
  comments: []
};

const data = JSON.parse(localStorage.getItem("redditCard")) || DEFAULT_DATA;
const save = () => localStorage.setItem("redditCard", JSON.stringify(data));

/* ---------------- THEME ---------------- */
document.body.dataset.theme = data.theme;
document.getElementById("themeToggle").onclick = () => {
  data.theme = data.theme === "dark" ? "light" : "dark";
  document.body.dataset.theme = data.theme;
  save();
};

/* ---------------- CLICK CLOSE MENUS ---------------- */
document.addEventListener("click", () => {
  document.querySelectorAll(".user-wrap.active")
    .forEach(w => w.classList.remove("active"));
});

/* ---------------- USER BLOCK ---------------- */
function userBlock(userObj, rerender, isPost = false) {
  const wrap = document.createElement("div");
  wrap.className = "user-wrap";

  wrap.innerHTML = `
    <img class="pfp" src="${userObj.pfp}">
    <span class="username">${userObj.user}</span>
    <div class="user-menu">
      <button class="rand">🎲</button>
      <button class="name">✏</button>
      <button class="pfpUpload">🖼 PFP</button>
      <button class="pfpLink">🔗 PFP</button>
      ${isPost ? `
        <button class="postUpload">🖼 POST</button>
        <button class="postLink">🔗 POST</button>
        <button class="resize">📐 Preset</button>
        <button class="freeResize">↔ Resize</button>
        <button class="removePost">❌ Remove</button>
      ` : ""}
      
      <button class="del">🗑</button>
    </div>
  `;

  wrap.onclick = e => e.stopPropagation();
  wrap.querySelector(".pfp").onclick =
    wrap.querySelector(".username").onclick = () =>
      wrap.classList.toggle("active");

  /* RANDOM */
  wrap.querySelector(".rand").onclick = () => {
    userObj.user = randomName();
    userObj.pfp = randomPfp();
    save(); rerender();
  };

  /* NAME */
  wrap.querySelector(".name").onclick = () => {
    const v = prompt("Username:", userObj.user);
    if (v) { userObj.user = v; save(); rerender(); }
  };

  /* PFP UPLOAD */
  wrap.querySelector(".pfpUpload").onclick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const f = input.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        userObj.pfp = r.result;
        save(); rerender();
      };
      r.readAsDataURL(f);
    };
    input.click();
  };

  /* PFP LINK */
  wrap.querySelector(".pfpLink").onclick = () => {
    const url = prompt("Paste PFP URL:");
    if (url) { userObj.pfp = url; save(); rerender(); }
  };

  if (isPost) {
    /* POST IMAGE UPLOAD */
    wrap.querySelector(".postUpload").onclick = () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = () => {
        const f = input.files[0];
        if (!f) return;
        const r = new FileReader();
        r.onload = () => {
          data.post.image = r.result;
          save(); rerender();
        };
        r.readAsDataURL(f);
      };
      input.click();
    };

    /* POST IMAGE LINK */
    wrap.querySelector(".postLink").onclick = () => {
      const url = prompt("Paste post image URL:");
      if (url) { data.post.image = url; save(); rerender(); }
    };

    /* IMAGE RESIZE */
    wrap.querySelector(".resize").onclick = () => {
      const v = prompt("Image size: small / medium / large", data.post.imageSize);
      if (["small", "medium", "large"].includes(v)) {
        data.post.imageSize = v;
        save(); rerender();
      }
    };
    wrap.querySelector(".freeResize").onclick = () => {
      const w = prompt("Image width (px or %, blank = auto):", data.post.imageWidth);
      const h = prompt("Image height (px or auto):", data.post.imageHeight);

      data.post.imageWidth = w ?? "";
      data.post.imageHeight = h ?? "";

      save();
      rerender();
    };

    wrap.querySelector(".removePost").onclick = () => {
      if (!data.post.image) return;

      if (confirm("Remove post image?")) {
        data.post.image = null;
        data.post.imageWidth = "";
        data.post.imageHeight = "";
        save();
        rerender();
      }
    };

  }

  /* DELETE */
  wrap.querySelector(".del").onclick = () => {
    if (userObj._delete && confirm("Delete?")) userObj._delete();
  };

  return wrap;
}

/* ---------------- POST ---------------- */
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

  postImage.style.display = data.post.image ? "block" : "none";
  postImage.src = data.post.image || "";
  postImage.className = `post-image ${data.post.imageSize}`;
  postImage.style.width = data.post.imageWidth || "";
  postImage.style.height = data.post.imageHeight || "";
}

/* ---------------- COMMENTS ---------------- */
function renderComments(list, container) {
  list.forEach(c => {
    c.replies ??= [];
    c.upvotes ??= 1;

    const div = document.createElement("div");
    div.className = "comment";

    c._delete = () => {
      list.splice(list.indexOf(c), 1);
      save(); renderAll();
    };

    div.appendChild(userBlock(c, renderAll));

    const text = document.createElement("div");
    text.className = "comment-text";
    text.textContent = c.text;

    // Make replies editable
    text.onclick = () => {
      const v = prompt("Edit comment:", c.text);
      if (v !== null) {
        c.text = v;
        save();
        rerender();
      }
    };

    div.appendChild(text);

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

renderAll();
