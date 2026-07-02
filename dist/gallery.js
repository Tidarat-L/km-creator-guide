// Shared gallery resolver for public site + admin.
// Store shape: localStorage 'km_product_gallery' = { [productId]: [ {t:'b',k:'hero'} | {t:'a',d:'data:...',label} ] }
(function(){
  function base(p){ return 'img/'+p.id+'/'; }
  window.KM_defaultShots = function(p){
    const im=p&&p.img; const out=[]; if(!im) return out; const b=base(p);
    if(im.ad)   out.push({t:'b',k:'ad',   src:b+im.ad,   label:'ภาพโฆษณา'});
    if(im.hero) out.push({t:'b',k:'hero', src:b+im.hero, label:'แพ็กเกจ'});
    if(im.white)out.push({t:'b',k:'white',src:b+im.white,label:'ภาพผลิตภัณฑ์'});
    (im.gallery||[]).forEach((g,i)=>out.push({t:'b',k:'g'+i,src:b+g,label:'ไลฟ์สไตล์'}));
    if(im.box)  out.push({t:'b',k:'box', src:b+im.box, label:'กล่องบรรจุ'});
    if(im.back) out.push({t:'b',k:'back',src:b+im.back,label:'ฉลากด้านหลัง'});
    if(im.alt)  out.push({t:'b',k:'alt', src:b+im.alt, label:'มุมมองอื่น'});
    if(im.info) out.push({t:'b',k:'info',src:b+im.info,label:'ข้อมูลผลิตภัณฑ์'});
    return out;
  };
  // resolve final ordered shots [{src,label,t,k}] given a stored record (or default)
  window.KM_resolveShots = function(p, store){
    const def = window.KM_defaultShots(p);
    const rec = store && store[p.id];
    if(!rec || !rec.length) return def;
    const byKey={}; def.forEach(s=>{ byKey[s.k]=s; });
    const out=[];
    rec.forEach(item=>{
      if(item.t==='b'){ if(byKey[item.k]) out.push(byKey[item.k]); }
      else if(item.t==='a' && item.d){ out.push({t:'a',src:item.d,label:item.label||'รูปเพิ่มเติม'}); }
    });
    return out.length ? out : def;
  };
  // default record (tokens only) used by admin when the user first edits a gallery
  window.KM_defaultRecord = function(p){ return window.KM_defaultShots(p).map(s=> ({t:'b',k:s.k}) ); };
})();
