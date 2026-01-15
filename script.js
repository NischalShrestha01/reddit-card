/* ===== UTILS ===== */
const NAMES = ["u/ghost_logic","u/voidthinker","u/midnightdev","u/signalnoise","u/404brain"];
const randomName = () => NAMES[Math.floor(Math.random()*NAMES.length)];
const randomPfp = () => `https://i.pravatar.cc/50?img=${Math.floor(Math.random()*70)}`;

const DEFAULT = {
  post: { user:"u/TheDreamingCat", pfp:"https://imgs.search.brave.com/44Rj3zRUvCMxMY8B-miqspb4xQAuyLuKQACoeWwPU8Q/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTI4/OTg4NTg2MS9waG90/by9jdXRlLWdpbmdl/ci1jYXQuanBnP3M9/NjEyeDYxMiZ3PTAm/az0yMCZjPXhYUDMx/dS0xZFNNaTg1cVFs/a2pyMlNDRUgyV3J4/VkhIQU9XQ2NaRlM1/RVU9", text:"Why would the Grim Reaper need a scythe if he can kill people by just touching them?", image:null, upvotes:133, comments:0 },
  comments:[]
};

/* ===== STORAGE ===== */
function load() {
  try {
    const d = JSON.parse(localStorage.getItem("redditCard"));
    if(!d || !d.post || !Array.isArray(d.comments)) throw 0;
    return d;
  } catch { localStorage.removeItem("redditCard"); return structuredClone(DEFAULT); }
}
const data = load();
const save = ()=>localStorage.setItem("redditCard", JSON.stringify(data));

/* ===== SAFE EDIT ===== */
function safeEdit(current,label="Edit") {
  const v = prompt(label,current);
  if(v===null) return null;
  const t = v.trim();
  return t==="" ? null : t;
}

/* ===== COMMENT COUNT ===== */
function totalComments(list){ return list.reduce((a,c)=>a+1+totalComments(c.replies||[]),0); }

/* ===== DELETE HELPER ===== */
function deleteNode(list,node){ const i=list.indexOf(node); if(i!==-1) list.splice(i,1); }

/* ===== USER BLOCK ===== */
function userBlock(obj, rerender, parent=null){
  const w = document.createElement("div");
  w.className="user-wrap";
  w.innerHTML = `
    <img class="pfp" src="${obj.pfp}">
    <span class="username">${obj.user}</span>
    <div class="user-menu">
      <button title="Random">🎲</button>
      <button title="Avatar">🔗</button>
      <button title="Image">🖼</button>
      ${parent?`<button title="Delete">🗑</button>`:""}
    </div>
  `;
  w.querySelector(".username").onclick=()=>{
    const v=safeEdit(obj.user,"Edit username:");
    if(v){obj.user=v; save(); rerender();}
  };
  const [rnd,ava,img,del] = w.querySelectorAll("button");
  rnd.onclick=()=>{ obj.user=randomName(); obj.pfp=randomPfp(); save(); rerender(); };
  ava.onclick=()=>{ const u=prompt("Avatar URL:"); if(u){obj.pfp=u; save(); rerender();} };
  img.onclick=()=>{ const i=prompt("Image URL (empty removes):"); if(i!==null){obj.image=i||null; save(); rerender();} };
  if(del){del.onclick=()=>{ if(!confirm("Delete?")) return; deleteNode(parent,obj); save(); rerender(); }};
  return w;
}

/* ===== POST ===== */
function renderPost(){
  const h=document.getElementById("postHeader"); h.innerHTML=""; h.appendChild(userBlock(data.post,renderAll));
  const t=document.getElementById("postText"); t.textContent=data.post.text;
  t.onclick=()=>{ const v=safeEdit(data.post.text,"Edit post:"); if(v){data.post.text=v; save(); renderPost();} };

  document.querySelector(".post-image")?.remove();
  if(data.post.image){
    const i=document.createElement("div");
    i.className="post-image"; i.innerHTML=`<img src="${data.post.image}">`; t.after(i);
  }

  const u=document.getElementById("upvotes"); u.textContent=`⬆ ${data.post.upvotes}`;
  u.onclick=()=>{ const v=safeEdit(data.post.upvotes,"Upvotes:"); if(!isNaN(v)){data.post.upvotes=+v; save(); renderPost();} };
  document.getElementById("commentsCount").textContent=`💬 ${totalComments(data.comments)}`;
}

/* ===== COMMENTS ===== */
function renderComment(c,list){
  const d=document.createElement("div"); d.className="comment";
  const h=document.createElement("div"); h.appendChild(userBlock(c,renderAll,list));
  const txt=document.createElement("div"); txt.className="editable"; txt.textContent=c.text;
  txt.onclick=()=>{ const v=safeEdit(c.text,"Edit comment:"); if(v){c.text=v; save(); renderAll();} };
  d.append(h,txt);
  if(c.image){ const i=document.createElement("div"); i.className="comment-image"; i.innerHTML=`<img src="${c.image}">`; d.appendChild(i);}
  const f=document.createElement("div"); f.className="comment-footer";
  const up=document.createElement("span"); up.className="meta"; up.textContent=`⬆ ${c.upvotes}`;
  up.onclick=()=>{ const v=safeEdit(c.upvotes,"Upvotes:"); if(!isNaN(v)){c.upvotes=+v; save(); renderAll();} };
  const cm=document.createElement("span"); cm.className="meta"; cm.textContent=`💬 ${c.replies.length}`;
  cm.onclick=()=>{ c.replies.push({ user:randomName(), pfp:randomPfp(), text:"New reply", image:null, upvotes:0, replies:[] }); save(); renderAll(); };
  f.append(up,cm); d.appendChild(f);
  const r=document.createElement("div"); r.className="replies"; c.replies.forEach(x=>r.appendChild(renderComment(x,c.replies))); d.appendChild(r);
  return d;
}

function renderComments(){ const c=document.getElementById("comments"); c.innerHTML=""; data.comments.forEach(x=>c.appendChild(renderComment(x,data.comments))); }

/* ===== ADD COMMENT ===== */
document.getElementById("addCommentBtn").onclick=()=>{
  data.comments.push({ user:randomName(), pfp:randomPfp(), text:"New comment", image:null, upvotes:0, replies:[] });
  save(); renderAll();
};

/* ===== CLEAR COMMENTS ===== */
document.getElementById("clearCommentsBtn").onclick=()=>{
  if(confirm("Clear all comments?")){ data.comments=[]; save(); renderAll(); }
};

/* ===== TOUCH HOVER ===== */
document.addEventListener("touchstart", e=>{
  const uw=e.target.closest(".user-wrap"); if(!uw) return;
  uw.classList.add("force-hover");
  setTimeout(()=>uw.classList.remove("force-hover"),1500);
});

/* ===== MASTER RENDER ===== */
function renderAll(){ renderPost(); renderComments(); }
renderAll();
