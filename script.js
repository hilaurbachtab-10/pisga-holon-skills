/* print: inside an embed (e.g. Google Sites) window.print() is blocked, so open the page in a new tab that prints itself */
(function(){
  function inFrame(){try{return window.self!==window.top;}catch(e){return true;}}
  function printUrl(){var u=location.href.split("#");var b=u[0];b+=(b.indexOf("?")>-1?"&":"?")+"print=1";return b+(u[1]?"#"+u[1]:"");}
  window.pisgaPrint=function(){
    if(!inFrame()){window.print();return;}
    var url=printUrl(),w=null;
    try{w=window.open(url,"_blank");}catch(e){w=null;}
    if(!w){var a=document.createElement("a");a.href=url;a.target="_blank";a.rel="noopener";document.body.appendChild(a);a.click();a.remove();}
  };
  document.querySelectorAll(".print-btn").forEach(function(b){b.hidden=false;b.addEventListener("click",function(e){e.preventDefault();window.pisgaPrint();});});
  if(/[?&]print=1(&|$)/.test(location.search)&&!inFrame()){
    var go=function(){
      var fr=(document.fonts&&document.fonts.ready)?document.fonts.ready:Promise.resolve();
      fr.then(function(){setTimeout(function(){
        try{var u=new URL(location.href);u.searchParams.delete("print");history.replaceState(null,"",u.href);}catch(e){}
        window.print();
      },600);});
    };
    if(document.readyState==="complete")go();else window.addEventListener("load",go);
  }
})();

(function(){
  "use strict";
  function norm(s){return s.toLowerCase().replace(/[\u0591-\u05C7]/g,"").trim();}
  var list=document.querySelector(".rubric-list"); if(!list) return;
  var cards=[].slice.call(list.querySelectorAll(".sub"));
  var q=document.getElementById("q"),fam=document.getElementById("f-fam"),sk=document.getElementById("f-skill"),
      st=document.getElementById("f-stage"),fin=document.getElementById("f-final")||{checked:false,addEventListener:function(){}},cnt=document.getElementById("count"),
      empty=document.getElementById("empty"),form=document.querySelector(".filters");
  cards.forEach(function(c){c._t=norm([].map.call(c.querySelectorAll(".code,h3,.def,.st-text,.tools li > span:last-child,.orig p,.crumbs"),function(e){return e.textContent;}).join(" ").replace("מה זה:",""));});
  var skillOpts=[].slice.call(sk.options);
  function syncSkills(){var f=fam.value;skillOpts.forEach(function(o){if(!o.value)return;o.hidden=!!f&&o.dataset.fam!==f;o.disabled=o.hidden;});
    if(sk.selectedOptions[0]&&sk.selectedOptions[0].disabled) sk.value="";}
  function apply(){
    var words=norm(q.value).split(/\s+/).filter(Boolean),n=0,s=st.value;
    cards.forEach(function(c){
      var ok=(!fam.value||c.dataset.fam===fam.value)&&(!sk.value||c.dataset.skill===sk.value)&&(!fin.checked||c.dataset.draft==="0")&&words.every(function(w){return c._t.indexOf(w)>-1;});
      c.hidden=!ok; if(ok)n++;
      c.classList.toggle("stage-only",!!s);
      [].forEach.call(c.querySelectorAll(".st"),function(li,i){li.classList.toggle("show",String(i+1)===s);});
    });
    cnt.textContent="מוצגות "+n+" מתוך "+cards.length+" תתי-מיומנויות"; empty.hidden=n>0;
    var p=new URLSearchParams();if(q.value)p.set("q",q.value);if(fam.value)p.set("fam",fam.value);if(sk.value)p.set("skill",sk.value);if(s)p.set("stage",s);if(fin.checked)p.set("final","1");
    var u=location.pathname+(p.toString()?"?"+p:"")+location.hash; try{history.replaceState(null,"",u);}catch(e){}
  }
  var init=new URLSearchParams(location.search);
  if(init.get("q"))q.value=init.get("q"); if(init.get("fam"))fam.value=init.get("fam"); syncSkills();
  if(init.get("skill"))sk.value=init.get("skill"); if(init.get("stage"))st.value=init.get("stage"); if(init.get("final"))fin.checked=true;
  q.addEventListener("input",apply); fin.addEventListener("change",apply); st.addEventListener("change",apply);
  fam.addEventListener("change",function(){syncSkills();apply();}); sk.addEventListener("change",apply);
  form.addEventListener("submit",function(e){e.preventDefault();});
  form.addEventListener("reset",function(){setTimeout(function(){syncSkills();apply();},0);});
  apply();
})();

/* print: open every expandable section, restore after */
(function(){var opened=[];
window.addEventListener('beforeprint',function(){opened=[];document.querySelectorAll('details:not([open])').forEach(function(d){d.setAttribute('open','');opened.push(d);});});
window.addEventListener('afterprint',function(){opened.forEach(function(d){d.removeAttribute('open');});opened=[];});
if(window.matchMedia){var mq=window.matchMedia('print');var h=function(e){if(e.matches){document.querySelectorAll('details:not([open])').forEach(function(d){d.setAttribute('open','');opened.push(d);});}};if(mq.addEventListener)mq.addEventListener('change',h);else if(mq.addListener)mq.addListener(h);}
})();

/* external links: always open in a new tab (the site is often embedded in a frame) */
(function(){function fx(){var h=location.hostname;document.querySelectorAll('a[href^="http"]').forEach(function(a){try{if(new URL(a.href).hostname!==h){a.target="_blank";var r=(a.rel||"").split(/\s+/);if(r.indexOf("noopener")<0){r.push("noopener");a.rel=r.join(" ").trim();}}}catch(e){}});}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",fx);else fx();})();

/* counts: computed from the data so they never drift. PISGA_COUNTS is generated from rubric.html at build time; pages that hold the data recount from the page itself. */
var PISGA_COUNTS={"total": 126, "team": 76, "starter": 50, "emo": {"c": 3, "s": 16}, "lit": {"c": 6, "s": 33}, "think": {"c": 5, "s": 27}, "other": {"c": 10, "s": 50}, "skills-with-rubric": 13};
(function(){
  var C=JSON.parse(JSON.stringify(PISGA_COUNTS));
  var list=document.querySelector(".rubric-list");
  if(list){
    var cards=[].slice.call(list.querySelectorAll(".sub")),fam={},sk={};
    cards.forEach(function(c){var f=c.dataset.fam;fam[f]=fam[f]||{s:0,k:{}};fam[f].s++;fam[f].k[c.dataset.skill]=1;sk[f+":"+c.dataset.skill]=1;});
    C.total=cards.length;C.team=0;
    ["emo","lit","think"].forEach(function(f){if(fam[f]){C[f]={c:Object.keys(fam[f].k).length,s:fam[f].s};C.team+=fam[f].s;}});
    if(fam.other){C.starter=fam.other.s;C.other={c:Object.keys(fam.other.k).length,s:fam.other.s};}
    C["skills-with-rubric"]=3+(fam.other?Object.keys(fam.other.k).length:0);
  }
  var grid=document.querySelector(".skill-grid");
  if(grid){var fc=document.querySelector("[data-count$='.c']");
    if(fc){var key=fc.getAttribute("data-count").split(".")[0];
      C[key]={c:grid.querySelectorAll(".skill-card").length,s:grid.querySelectorAll(".sub-list li").length};}}
  var subsOnPage=document.querySelectorAll("article.sub").length;
  document.querySelectorAll("[data-count]").forEach(function(el){
    var k=el.getAttribute("data-count"),v;
    if(k==="page.subs"){v=subsOnPage||null;}
    else{v=k.split(".").reduce(function(o,p){return o==null?null:o[p];},C);}
    if(typeof v==="number"&&v>0)el.textContent=String(v);
  });
})();

/* activities page: filter by family, skill, stage and duration */
(function(){
  var form=document.querySelector(".act-filters"); if(!form) return;
  var acts=[].slice.call(document.querySelectorAll("article.act[data-fam]"));
  var fam=document.getElementById("af-fam"),sk=document.getElementById("af-skill"),st=document.getElementById("af-stage"),du=document.getElementById("af-dur"),
      cnt=document.getElementById("af-count"),empty=document.getElementById("af-empty");
  var skOpts=[].slice.call(sk.options);
  function syncSkills(){var f=fam.value;skOpts.forEach(function(o){if(!o.value)return;o.hidden=!!f&&o.dataset.fam!==f;o.disabled=o.hidden;});
    if(sk.selectedOptions[0]&&sk.selectedOptions[0].disabled)sk.value="";}
  function apply(){
    var n=0;
    acts.forEach(function(a){
      var ok=(!fam.value||a.dataset.fam===fam.value)&&(!sk.value||a.dataset.skill===sk.value)&&(!st.value||a.dataset.stage===st.value)&&(!du.value||a.dataset.dur===du.value);
      a.classList.toggle("f-hide",!ok); if(ok)n++;
    });
    [].forEach.call(document.querySelectorAll(".acts"),function(g){
      var any=g.querySelector("article.act[data-fam]:not(.f-hide)"),h=g.previousElementSibling;
      g.hidden=!any;
      while(h&&!/^H2$/.test(h.tagName)){if(h.classList.contains("spec-link"))h.hidden=!any;h=h.previousElementSibling;}
      if(h)h.hidden=!any;
    });
    [].forEach.call(document.querySelectorAll(".toc a[href^='#ACT-']"),function(l){var a=document.getElementById(l.getAttribute("href").slice(1));if(a&&l.parentNode)l.parentNode.hidden=a.classList.contains("f-hide");});
    cnt.textContent="מוצגות "+n+" מתוך "+acts.length+" פעילויות"; empty.hidden=n>0;
    var p=new URLSearchParams();if(fam.value)p.set("fam",fam.value);if(sk.value)p.set("skill",sk.value);if(st.value)p.set("stage",st.value);if(du.value)p.set("dur",du.value);
    try{history.replaceState(null,"",location.pathname+(p.toString()?"?"+p:"")+location.hash);}catch(e){}
  }
  var q=new URLSearchParams(location.search);
  if(q.get("fam"))fam.value=q.get("fam"); syncSkills(); if(q.get("skill"))sk.value=q.get("skill"); if(q.get("stage"))st.value=q.get("stage"); if(q.get("dur"))du.value=q.get("dur");
  fam.addEventListener("change",function(){syncSkills();apply();}); [sk,st,du].forEach(function(s){s.addEventListener("change",apply);});
  form.addEventListener("submit",function(e){e.preventDefault();});
  form.addEventListener("reset",function(){setTimeout(function(){syncSkills();apply();},0);});
  apply();
})();

/* open a <details> targeted by the URL hash */
(function(){function o(){var h=location.hash&&document.getElementById(location.hash.slice(1));if(h&&h.tagName==="DETAILS")h.open=true;}window.addEventListener("hashchange",o);o();})();
