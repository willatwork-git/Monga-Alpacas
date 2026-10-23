/* Bob's article reader: opens articles from any link with data-article + data-summary. Includes the density calculator. */
(function(){
  if(!document.getElementById('reader')){ var d=document.createElement('dialog'); d.className='reader'; d.id='reader'; d.setAttribute('aria-labelledby','reader-title'); d.innerHTML='<div class="reader-bar">\n    <span id="reader-crumb">Bob’s articles</span>\n    <a id="reader-pdf" href="#" target="_blank" rel="noopener"><span class="pdf-long">Download </span>PDF</a>\n    <button class="reader-close" type="button" id="reader-close">Close</button>\n  </div>\n  <div class="reader-body">\n    <h1 id="reader-title"></h1>\n    <p class="by" id="reader-by">By Bob Kingwell, Monga Alpacas</p>\n    <div class="in-brief"><b>In brief</b><p id="reader-summary"></p></div>\n    <div class="article" id="reader-article"></div>\n    <nav class="reader-nav" aria-label="More articles">\n      <button type="button" id="reader-prev"></button>\n      <button type="button" id="reader-next"></button>\n    </nav>\n  </div>'; document.body.appendChild(d); }
  var dlg=document.getElementById('reader'); if(!dlg||!dlg.showModal) return;
  var items=[].slice.call(document.querySelectorAll('a[data-article][data-summary]'));
  var list=items.map(function(a){return {date:a.dataset.date||'',slug:a.dataset.article,title:a.querySelector('.t').textContent,summary:a.dataset.summary,pdf:a.href};});
  var cache={}, idx=-1, opener=null;
  var $=function(id){return document.getElementById(id);};
  function nav(btn,i,label){
    if(i<0||i>=list.length){btn.hidden=true;return;}
    btn.hidden=false; btn.innerHTML='<small>'+label+'</small>'; btn.appendChild(document.createTextNode(list[i].title));
    btn.onclick=function(){show(i,true);};
  }
  function load(slug){
    if(cache[slug]) return Promise.resolve(cache[slug]);
    return fetch('articles/'+slug+'.html').then(function(r){if(!r.ok) throw r; return r.text();}).then(function(t){return cache[slug]=t;});
  }
  function initCalc(root){
    var f=root.querySelector('form[data-calc="density"]'); if(!f) return;
    var tbl=root.querySelector('#density-matrix'), out=f.querySelector('.calc-out');
    var W=[[0.0165,-2.5],[0.1068,-1.5],[0.2678,-0.5],[0.2678,0.5],[0.1068,1.5],[0.0165,2.5]];
    function run(){
      var v=function(n){return parseFloat(f.elements[n].value);};
      var fd=Math.round(v('fd')*10)/10,sd=v('sd'),sl=v('sl'),wt=v('wt');
      [].forEach.call(tbl.querySelectorAll('.hit'),function(c){c.classList.remove('hit');});
      if(!(fd>0&&sd>=0&&sl>0&&wt>0)){out.textContent='Enter all four values to see the result.';return;}
      var vol=0; W.forEach(function(w){var d=(fd+w[1]*sd)/1000; vol+=w[0]*sl*d*d;});
      var n=Math.round(wt/vol/1.3), score=null, row=null;
      [].forEach.call(tbl.tBodies[0].rows,function(r){
        var m=r.cells[0].textContent.split('-').map(parseFloat);
        if(fd<=m[1] && (fd>=m[0]||r.rowIndex===2)) row=r;
      });
      if(row){
        for(var c=1;c<row.cells.length;c++){
          var t=row.cells[c].textContent.trim(); if(!t) continue;
          var a=t.split('-').map(parseFloat), hi=Math.max(a[0],a[1]), lo=Math.min(a[0],a[1]);
          if(n>=lo&&n<=hi || (c===1&&n>hi)){score=11-c; row.cells[c].classList.add('hit'); break;}
        }
        row.classList.add('hit');
      }
      out.innerHTML='Estimated number of fibres: <strong>'+n+'</strong> million · Apparent density score: <strong>'+(score===null?'—':score)+'</strong>'+(score===null?(row?' (below the bottom of Bob’s matrix for this micron)':' (micron is outside Bob’s matrix, 12.6–29.0µ)'):' out of 10');
    }
    f.addEventListener('input',run); run();
  }
  function show(i,push){
    var it=list[i]; idx=i;
    $('reader-title').textContent=it.title; $('reader-by').textContent='By Bob Kingwell, Monga Alpacas'+(it.date?' · '+it.date:''); $('reader-summary').textContent=it.summary; $('reader-pdf').href=it.pdf;
    $('reader-crumb').textContent='Bob’s articles · '+(i+1)+' of '+list.length;
    $('reader-article').innerHTML='<p>Loading…</p>';
    nav($('reader-prev'),i-1,'Previous'); nav($('reader-next'),i+1,'Next');
    load(it.slug).then(function(html){ if(idx===i){ $('reader-article').innerHTML=html; initCalc($('reader-article')); } })
      .catch(function(){ $('reader-article').innerHTML='<p>This article couldn’t be loaded here. <a href="'+it.pdf+'" target="_blank" rel="noopener">Open the original PDF</a> instead.</p>'; });
    if(!dlg.open){ dlg.showModal(); document.body.classList.add('reading'); }
    dlg.scrollTop=0;
    var h='#read/'+it.slug;
    if(push && location.hash!==h) history.pushState({read:it.slug},'',h); else if(location.hash!==h) history.replaceState({read:it.slug},'',h);
    $('reader-close').focus();
  }
  function close(fromHistory){
    if(!dlg.open) return;
    dlg.close();
  }
  dlg.addEventListener('close',function(){
    document.body.classList.remove('reading');
    if(location.hash.indexOf('#read/')===0) history.replaceState(null,'',location.pathname+location.search);
    if(opener) opener.focus();
  });
  $('reader-close').addEventListener('click',function(){close();});
  dlg.addEventListener('click',function(e){ if(e.target===dlg) close(); });
  items.forEach(function(a,i){ a.addEventListener('click',function(e){
    if(e.metaKey||e.ctrlKey||e.shiftKey) return; e.preventDefault(); opener=a; show(i,true);
  });});
  function fromHash(){
    var m=location.hash.match(/^#read\/(.+)$/);
    if(m){ var i=list.findIndex(function(x){return x.slug===m[1];}); if(i>-1){ show(i,false); return; } }
    if(dlg.open) dlg.close();
  }
  window.addEventListener('popstate',fromHash);
  fromHash();
})();
