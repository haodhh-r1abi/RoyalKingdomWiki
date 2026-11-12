
(function(){
  const root = window.SITE_ROOT || "";
  const q = document.getElementById("q"), res = document.getElementById("results");
  const strip = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").replace(/Đ/g,"D").toLowerCase();
  let idx = null, sel = -1;
  function addScript(){ if(!window.SEARCH_INDEX && !document.getElementById("searchjs")){ const s=document.createElement("script"); s.id="searchjs"; s.src=root+"assets/search.js"; s.onload=()=>{ if(q && q.value.trim().length>1) q.dispatchEvent(new Event("input")); }; document.head.appendChild(s); } }
  async function load(){ if(window.SEARCH_INDEX) return window.SEARCH_INDEX; if(idx) return idx; addScript(); try{ const r = await fetch(root+"assets/search.json"); idx = await r.json(); return idx; }catch(e){ return []; } }
  function render(items){ if(!items.length){ res.hidden = true; return; } res.innerHTML = items.map((it,i)=>`<a href="${root}${it.u}" class="${i===0?'sel':''}"><div>${it.t} <span class="r-c">· ${it.c}</span></div><div class="r-c">${it.g||''}</div></a>`).join(""); res.hidden = false; sel = 0; }
  if(q){
    q.addEventListener("focus", addScript);
    q.addEventListener("input", async ()=>{ const v = strip(q.value.trim()); if(v.length<2){ res.hidden=true; return; } const ix = await load();
      const scored = ix.map(it=>{ let s=0; const t=strip(it.t), k=strip(it.k||""), g=strip(it.g||""); if(t.startsWith(v)) s+=10; if(t.includes(v)) s+=6; if(g.includes(v)) s+=3; if(k.includes(v)) s+=2; return [s,it]; }).filter(x=>x[0]>0).sort((a,b)=>b[0]-a[0]).slice(0,14).map(x=>x[1]);
      render(scored); });
    q.addEventListener("keydown", e=>{ const links = res.querySelectorAll("a"); if(e.key==="Escape"){ res.hidden=true; } if(!links.length||res.hidden) return; if(e.key==="ArrowDown"){ sel=Math.min(sel+1,links.length-1); } else if(e.key==="ArrowUp"){ sel=Math.max(sel-1,0); } else if(e.key==="Enter"){ e.preventDefault(); links[Math.max(sel,0)].click(); return; } else return; links.forEach((l,i)=>l.classList.toggle("sel",i===sel)); e.preventDefault(); });
    document.addEventListener("click", e=>{ if(!e.target.closest(".search")) res.hidden=true; });
    document.addEventListener("keydown", e=>{ if(e.key==="/" && document.activeElement!==q && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)){ e.preventDefault(); q.focus(); } });
  }
  const mb = document.getElementById("menuBtn"), sb = document.getElementById("sidebar");
  if(mb&&sb){ mb.addEventListener("click", ()=>sb.classList.toggle("open")); }
  document.querySelectorAll("input.filter[data-target]").forEach(inp=>{ const tb = document.querySelector("table."+inp.dataset.target+" tbody"); if(!tb) return;
    inp.addEventListener("input", ()=>{ const v = strip(inp.value); tb.querySelectorAll("tr").forEach(tr=>{ tr.style.display = !v || strip(tr.textContent).includes(v) ? "" : "none"; }); }); });
  document.querySelectorAll(".toggle-all").forEach(a=>a.addEventListener("click", e=>{ e.preventDefault(); const ds = document.querySelectorAll("details.uc"); const open = [...ds].some(d=>!d.open); ds.forEach(d=>d.open=open); }));
  if(location.hash){ const el = document.getElementById(decodeURIComponent(location.hash.slice(1))); if(el && el.tagName==="DETAILS") el.open = true; }
  if(window.LOAD_LEVELS){ const box = document.getElementById("levels"), f = document.getElementById("lvfilter");
    const show = t=>{ const lines = t.split("\n").filter(Boolean); const h = lines[0].split("\t"); const rows = lines.slice(1).map(l=>l.split("\t"));
      let cur = rows; const draw = ()=>{ const lim = cur.slice(0,600); box.innerHTML = `<p class="muted">${cur.length} dòng (hiển thị tối đa 600)</p><table class="wt"><thead><tr>${h.map(x=>`<th>${x}</th>`).join("")}</tr></thead><tbody>${lim.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`; };
      draw(); f.addEventListener("input", ()=>{ const v = f.value.trim().toLowerCase(); cur = !v ? rows : rows.filter(r=> r[1]===v || r.join("\t").toLowerCase().includes(v)); draw(); }); };
    if(window.LEVELS_TSV) show(window.LEVELS_TSV); else fetch(root+"data/levels.tsv").then(r=>r.text()).then(show).catch(()=>{ box.innerHTML = '<p class="muted">Không tải được levels.tsv.</p>'; }); }
  // lightbox for screenshots (a.shot / a.lb)
  const links=[...document.querySelectorAll("a.shot, a.lb")]; if(!links.length) return;
  let box=null, k=0;
  function show(i){ k=(i+links.length)%links.length; const a=links[k];
    if(!box){ box=document.createElement("div"); box.className="lbox"; box.innerHTML='<button class="x" aria-label="Đóng">✕</button><button class="prev" aria-label="Trước">‹</button><img alt=""><div class="cap"></div><button class="next" aria-label="Sau">›</button>';
      document.body.appendChild(box);
      box.addEventListener("click",e=>{ if(e.target.classList.contains("prev")) show(k-1); else if(e.target.classList.contains("next")) show(k+1); else if(e.target.tagName!=="IMG") box.hidden=true; }); }
    box.querySelector("img").src=a.href; box.querySelector(".cap").textContent=a.dataset.cap||a.title||""; box.hidden=false; }
  links.forEach((a,i)=>a.addEventListener("click",e=>{ e.preventDefault(); show(i); }));
  document.addEventListener("keydown",e=>{ if(!box||box.hidden) return; if(e.key==="Escape") box.hidden=true; if(e.key==="ArrowLeft") show(k-1); if(e.key==="ArrowRight") show(k+1); });
})();
