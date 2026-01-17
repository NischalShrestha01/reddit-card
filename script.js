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
  },
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

/* ---------------- COMMENT FUNCTIONS ---------------- */
function createComment(text = "New comment", parentList = data.comments, isReply = false) {
  const comment = {
    user: randomName(),
    pfp: randomPfp(),
    text: text,
    upvotes: 1,
    replies: []
  };

  // Add _delete method to comment
  comment._delete = function () {
    const index = parentList.indexOf(this);
    if (index > -1) {
      parentList.splice(index, 1);
      save();
      renderAll();
    }
  };

  parentList.push(comment);
  save();
  return comment;
}

function renderComment(comment, container, parentList) {
  const commentDiv = document.createElement("div");
  commentDiv.className = "comment";

  // Add user block
  const userBlockEl = userBlock(comment, renderAll);
  commentDiv.appendChild(userBlockEl);

  // Add comment text
  const textDiv = document.createElement("div");
  textDiv.className = "comment-text";
  textDiv.textContent = comment.text;
  textDiv.onclick = () => {
    const newText = prompt("Edit comment:", comment.text);
    if (newText !== null) {
      comment.text = newText;
      save();
      renderAll();
    }
  };
  commentDiv.appendChild(textDiv);

  // Add comment actions
  const actionsDiv = document.createElement("div");
  actionsDiv.className = "comment-actions";
  actionsDiv.innerHTML = `
    <button class="reply-btn">↩ Reply</button>
    <button class="upvote-btn">⬆ ${comment.upvotes}</button>
    <button class="delete-btn">🗑</button>
  `;

  // Reply functionality
  actionsDiv.querySelector(".reply-btn").onclick = () => {
    const replyText = prompt("Enter your reply:");
    if (replyText) {
      createComment(replyText, comment.replies, true);
      renderAll();
    }
  };

  // Upvote functionality
  actionsDiv.querySelector(".upvote-btn").onclick = () => {
    comment.upvotes = (comment.upvotes || 1) + 1;
    save();
    renderAll();
  };

  // Delete functionality
  actionsDiv.querySelector(".delete-btn").onclick = () => {
    if (confirm("Delete this comment?")) {
      comment._delete();
    }
  };

  commentDiv.appendChild(actionsDiv);

  // Render replies if they exist
  if (comment.replies && comment.replies.length > 0) {
    const repliesDiv = document.createElement("div");
    repliesDiv.className = "replies";
    comment.replies.forEach(reply => {
      renderComment(reply, repliesDiv, comment.replies);
    });
    commentDiv.appendChild(repliesDiv);
  }

  container.appendChild(commentDiv);
}

/* ---------------- POST ---------------- */
function renderPost() {
  const postHeader = document.getElementById("postHeader");
  const postText = document.getElementById("postText");
  const upvotes = document.getElementById("upvotes");
  const commentsCount = document.getElementById("commentsCount");
  const postImage = document.getElementById("postImage");

  postHeader.innerHTML = "";
  postHeader.appendChild(userBlock(data.post, renderAll, true));

  postText.textContent = data.post.text;
  postText.onclick = () => {
    const v = prompt("Edit post:", data.post.text);
    if (v) {
      data.post.text = v;
      save();
      renderPost();
    }
  };

  upvotes.textContent = data.post.upvotes;
  upvotes.onclick = () => {
    const match = data.post.upvotes.match(/\d+/);
    const current = match ? parseInt(match[0]) : 133;
    const newUpvotes = prompt("Enter new upvote count:", current);
    if (newUpvotes !== null && !isNaN(newUpvotes)) {
      data.post.upvotes = `⬆ ${newUpvotes}`;
      save();
      renderPost();
    }
  };

  // Calculate total comments count
  let totalComments = 0;
  function countComments(comments) {
    totalComments += comments.length;
    comments.forEach(c => {
      if (c.replies) {
        countComments(c.replies);
      }
    });
  }
  countComments(data.comments);
  data.post.commentsCount = `💬 ${totalComments}`;
  commentsCount.textContent = data.post.commentsCount;

  // Handle post image
  postImage.style.display = data.post.image ? "block" : "none";
  if (data.post.image) {
    postImage.src = data.post.image;
    postImage.className = `post-image ${data.post.imageSize}`;
    postImage.style.width = data.post.imageWidth || "";
    postImage.style.height = data.post.imageHeight || "";
  }
}

/* ---------------- RENDER ALL ---------------- */
function renderAll() {
  renderPost();

  const commentsContainer = document.getElementById("comments");
  commentsContainer.innerHTML = "";

  // Render all comments
  data.comments.forEach(comment => {
    renderComment(comment, commentsContainer, data.comments);
  });
}

/* ---------------- EVENT LISTENERS ---------------- */
document.getElementById("addCommentBtn").onclick = () => {
  const commentText = prompt("Enter your comment:");
  if (commentText) {
    createComment(commentText);
    renderAll();
  }
};

document.getElementById("clearCommentsBtn").onclick = () => {
  if (confirm("Clear all comments?")) {
    data.comments = [];
    save();
    renderAll();
  }
};

// Initial render
renderAll();