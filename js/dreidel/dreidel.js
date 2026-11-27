/* Tomchu Tattoo · Hanukkah dreidel (4.12–12.12). Loaded only during the campaign. */
const CFG=window.TT_DREIDEL||{};
const API=CFG.api||(document.getElementById('promo-bar')||{dataset:{}}).dataset.api||'';
const HOME=new URL('../../../',import.meta.url).href, LOGO=CFG.logo||new URL('../../img/logo-ink.png',import.meta.url).href;
const LIVE=CFG.live!=null?CFG.live:/(^|\.)tomchu-tattoo\.co\.il$/.test(location.hostname);
const P=[['נ','20% הנחה','נס גדול! 20% הנחה על הקעקוע'],['ג','30% הנחה','גדול! 30% הנחה על הקעקוע'],['ה','40% הנחה','היה פה שמח! 40% הנחה על הקעקוע'],['פ','קעקוע שני מתנה','פה! קעקוע שני במתנה 🎁']];
const W8=[45,30,20,5]; // fallback only; the server decides when the Apps Script is live
const UNTIL='31.12.2026', KEY='tt-dreidel-26';
const $=(i)=>document.getElementById(i);
const st={get(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){return null}},set(v){try{localStorage.setItem(KEY,JSON.stringify(v))}catch(e){}}};
const bookUrl=(k,tel)=>HOME+'contact.html?promo='+encodeURIComponent('סביבון חנוכה: '+P[k][1])+'&tel='+encodeURIComponent(tel||'');

if(!CFG.noBar)document.body.insertAdjacentHTML('afterbegin',`<div class="dr-bar" id="dr-bar"><div class="wrap"><span>🕎 <b>חנוכה ב־Tomchu:</b> מסובבים סביבון וזוכים בהטבה!</span><button type="button" id="dr-open">לסובב</button></div></div>`);
document.body.insertAdjacentHTML('beforeend',`<div class="dr-m" id="dr-m" hidden role="dialog" aria-modal="true" aria-labelledby="dr-h"><div class="dr-box"><div class="dr-in">
 <button class="dr-x" id="dr-x" type="button" aria-label="סגירה">✕</button>
 <div id="dr-s1"><h2 id="dr-h">סביבון חנוכה של Tomchu 🕎</h2><p>מסובבים פעם אחת, ומה שיוצא זוכים!</p>
  <div class="dr-prz"><div><b>נ</b>20%</div><div><b>ג</b>30%</div><div><b>ה</b>40%</div><div><b>פ</b>קעקוע שני מתנה</div></div>
  <div class="dr-stage"><canvas id="dr-cv" width="340" height="300" aria-label="סביבון Tomchu Tattoo"></canvas></div>
  <label for="dr-ph">מספר נייד (כדי לשמור לך את הזכייה)</label>
  <input id="dr-ph" type="tel" inputmode="tel" placeholder="05X-XXXXXXX" autocomplete="tel">
  <p class="dr-err" id="dr-err" role="alert"></p>
  <button class="btn btn-iri" id="dr-go" type="button">לסובב את הסביבון!</button>
  <p class="dr-fine">סיבוב אחד לכל מספר טלפון · ההטבה למימוש עד ${UNTIL} · לא כפל מבצעים</p></div>
 <div id="dr-s2" hidden><p id="dr-rk" class="dr-rk"></p><div class="dr-res" id="dr-rt"></div><p id="dr-rd"></p>
  <a class="btn btn-iri" id="dr-book" href="#">כן, לקבוע תור עם ההטבה</a><button class="btn btn-ghost" type="button" id="dr-later">אחר כך</button>
  <p class="dr-fine">ההטבה שמורה על המספר שלך ותופיע אוטומטית בהודעה לתום.</p></div>
 <div class="dr-cf" id="dr-cf"></div></div></div></div>`);

function show(k,tel,again){$('dr-s1').hidden=true;$('dr-s2').hidden=false;$('dr-rk').textContent=again?'כבר סובבת, וזה מה שיצא לך:':'יצא '+P[k][0]+'!';
 $('dr-rt').innerHTML='<span>'+P[k][1]+'</span>';$('dr-rd').textContent=(again?'':P[k][2]+'. ')+'רוצה לקבוע תור עכשיו?';$('dr-book').href=bookUrl(k,tel);if(!again)boom()}
function boom(){const c=$('dr-cf'),cols=['#18B58A','#4C82E6','#9B5BD6','#E8467F','#FFD37A'];for(let i=0;i<40;i++){const e=document.createElement('i');e.style.left=Math.random()*100+'%';e.style.background=cols[i%5];e.style.animationDelay=Math.random()*.5+'s';c.appendChild(e)}}
const pick=()=>{let r=Math.random()*100;for(let i=0;i<4;i++){if((r-=W8[i])<0)return i}return 0};

let ready=null;
function open(){$('dr-m').hidden=false;const prev=st.get();if(prev){show(prev.k,prev.tel,true)}else{ready=ready||initScene();setTimeout(()=>$('dr-ph').focus(),50)}}
if($('dr-open'))$('dr-open').onclick=open;window.ttDreidelOpen=open;
$('dr-book').addEventListener('click',(e)=>{if(!CFG.book)return;e.preventDefault();const v=st.get();if(v){$('dr-m').hidden=true;CFG.book(P[v.k][1],v.tel)}});$('dr-x').onclick=$('dr-later').onclick=()=>{$('dr-m').hidden=true};
$('dr-m').addEventListener('keydown',(e)=>{if(e.key==='Escape')$('dr-m').hidden=true});
$('dr-go').onclick=async()=>{
 const tel=$('dr-ph').value.replace(/\D/g,'');if(!/^05\d{8}$/.test(tel)){$('dr-err').textContent='צריך מספר נייד תקין, למשל 0541234567';$('dr-ph').focus();return}
 $('dr-err').textContent='';$('dr-go').disabled=true;$('dr-go').textContent='מסובבים…';
 let k=null,again=false;
 if(API&&LIVE){try{const j=await (await fetch(API+'?action=dreidel&tel='+tel)).json();if(j&&j.ok&&j.k>=0&&j.k<4){k=j.k;again=!!j.again}else if(j&&j.closed){$('dr-err').textContent='המבצע הסתיים. חג שמח!';$('dr-go').disabled=false;$('dr-go').textContent='לסובב את הסביבון!';return}}catch(e){}}
 if(k===null)k=pick();
 st.set({k,tel});
 if(again){show(k,tel,true);return}
 await ready;window.spinTo(k,()=>setTimeout(()=>show(k,tel,false),800));
};
if(!CFG.noBar&&new URLSearchParams(location.search).has('dreidel'))open();

async function initScene(){
const T=await import('./three.js');const {RoomEnvironment}=await import('./RoomEnvironment.js');
await new Promise((res)=>{


const cv=document.getElementById('dr-cv'),R=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true});R.setPixelRatio(Math.min(devicePixelRatio,3));R.setSize(340,300,false);R.toneMapping=T.ACESFilmicToneMapping;
const S=new T.Scene(),C=new T.PerspectiveCamera(32,340/300,.1,50);C.position.set(0,1.6,7.6);C.lookAt(0,.1,0);
S.environment=new T.PMREMGenerator(R).fromScene(new RoomEnvironment(),.04).texture;
const k1=new T.DirectionalLight(0xffffff,1.6);k1.position.set(3,5,4);S.add(k1);S.add(new T.AmbientLight(0xffffff,.9));const k2=new T.PointLight(0xC86BFF,18,12);k2.position.set(-3,1,2);S.add(k2);
const logo=new Image();logo.src=LOGO;
function face(L){const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,512,512);
 [['#0F8A66',0],['#0E8E99',.28],['#2A5FC4',.52],['#7A36B3',.76],['#C82464',1]].forEach(([c2,o])=>g.addColorStop(o,c2));x.fillStyle=g;x.fillRect(0,0,512,512);
 x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=10;x.strokeRect(26,26,460,460);
 x.fillStyle='#fff';x.shadowColor='rgba(0,0,0,.35)';x.shadowBlur=18;x.font='800 540px Rubik,Heebo,Arial';x.textAlign='center';x.textBaseline='middle';x.fillText(L,256,215);
 x.shadowBlur=0;x.save();x.beginPath();x.arc(256,412,52,0,7);x.clip();x.drawImage(logo,204,360,104,104);x.restore();
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;return new T.MeshPhysicalMaterial({map:t,roughness:.28,metalness:.15,clearcoat:1,clearcoatRoughness:.12});}
function tipM(){const c=document.createElement('canvas');c.width=256;c.height=256;const x=c.getContext('2d'),g=x.createLinearGradient(0,0,256,0);[['#C82464',0],['#7A36B3',.33],['#2A5FC4',.66],['#0F8A66',1]].forEach(([a,o])=>g.addColorStop(o,a));x.fillStyle=g;x.fillRect(0,0,256,256);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return new T.MeshStandardMaterial({map:t,roughness:.45,metalness:0,envMapIntensity:.35});}
const D=new T.Group(),G=new T.Group();G.add(D);S.add(G);
logo.onload=()=>{res();
 const N=9,SEG=200,ROWS=90,Y0=-1.6,Y1=1.2;
 const rad=y=>{let r;if(y>=-.2)r=1;else{const q=(-.2-y)/(-.2-Y0);r=Math.pow(Math.max(0,1-Math.pow(q,1.5)),.7)}if(y>Y1-.12){const q=(y-(Y1-.12))/.12;r*=1-.07*q*q}return r;};
 const se=th=>{const s=Math.sin(th),c=Math.cos(th);return[Math.sign(s)*Math.pow(Math.abs(s),2/N),Math.sign(c)*Math.pow(Math.abs(c),2/N)]};
 const pos=[],uv=[],idx=[];
 const ring=[],al=[0];for(let i=0;i<=SEG;i++){const th=i/SEG*Math.PI*2-Math.PI/4,[x,z]=se(th);ring.push([-x,z]);if(i)al.push(al[i-1]+Math.hypot(ring[i][0]-ring[i-1][0],ring[i][1]-ring[i-1][1]))}
 const tot=al[SEG],u0=al[SEG/8];
 for(let j=0;j<=ROWS;j++){const y=Y0+(Y1-Y0)*j/ROWS,r=rad(y);for(let i=0;i<=SEG;i++){pos.push(ring[i][0]*r,y,ring[i][1]*r);uv.push((al[i]-u0)/tot+.125,j/ROWS)}}
 for(let j=0;j<ROWS;j++)for(let i=0;i<SEG;i++){const a=j*(SEG+1)+i,b=a+SEG+1;idx.push(a,a+1,b,a+1,b+1,b)}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();
 const W=4096,H=1280,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
 x.fillStyle='#F4EFF8';x.fillRect(0,0,W,H);for(let k=0;k<4;k++){const sg=x.createLinearGradient(k*W/4,0,(k+1)*W/4,0);sg.addColorStop(0,'rgba(80,50,110,.10)');sg.addColorStop(.5,'rgba(255,255,255,0)');sg.addColorStop(1,'rgba(80,50,110,.10)');x.fillStyle=sg;x.fillRect(k*W/4,0,W/4,H)}
 const L=['נ','ג','ה','פ'],vy=y=>H*(1-(y-Y0)/(Y1-Y0)),BR=[['#0F8A66',0],['#2A5FC4',.35],['#7A36B3',.68],['#C82464',1]];
 const rim=x.createLinearGradient(0,0,W,0);for(let r=0;r<4;r++)BR.forEach(([cl,o])=>rim.addColorStop(Math.min(1,(r+o*.999)/4),cl));
 x.fillStyle=rim;x.fillRect(0,vy(Y1-.05),W,vy(Y1-.12)-vy(Y1-.05)+1);
 x.textAlign='center';x.textBaseline='middle';
 L.forEach((l,k)=>{const cx=(k+.5)*W/4,ly=vy(.42);
  const lg=x.createLinearGradient(cx-120,ly-130,cx+120,ly+130);BR.forEach(([cl,o])=>lg.addColorStop(o,cl));
  x.font='800 540px Rubik,Heebo,Arial';x.shadowColor='rgba(0,0,0,0)';x.shadowBlur=0;x.fillStyle=lg;x.fillText(l,cx,ly);x.shadowBlur=0;
  const my=vy(-.82),R0=160;const rg=x.createLinearGradient(cx-R0,my-R0,cx+R0,my+R0);BR.forEach(([cl,o])=>rg.addColorStop(o,cl));
  const sx2=1/rad(-.82);x.fillStyle=rg;x.beginPath();x.ellipse(cx,my,(R0+12)*sx2,R0+12,0,0,7);x.fill();
  x.save();x.beginPath();x.ellipse(cx,my,R0*sx2,R0,0,0,7);x.clip();x.fillStyle='#0B0A0D';x.fill();x.imageSmoothingQuality='high';x.drawImage(logo,cx-R0*sx2,my-R0,R0*2*sx2,R0*2);x.restore()});
 const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=R.capabilities.getMaxAnisotropy();tex.generateMipmaps=true;tex.minFilter=T.LinearMipmapLinearFilter;tex.wrapS=T.RepeatWrapping;
 const body=new T.Mesh(geo,new T.MeshPhysicalMaterial({map:tex,roughness:.5,metalness:0,clearcoat:.15,clearcoatRoughness:.5,envMapIntensity:.1}));D.add(body);
 const sh2=new T.Shape();for(let i=0;i<=SEG;i++){const th=i/SEG*Math.PI*2,[a,b2]=se(th);const r=rad(Y1)*1.001;i?sh2.lineTo(a*r,b2*r):sh2.moveTo(a*r,b2*r)}
 const cap=new T.Mesh(new T.ShapeGeometry(sh2,1),new T.MeshPhysicalMaterial({color:0xE9E1F0,roughness:.4,clearcoat:.5}));cap.rotation.x=-Math.PI/2;cap.position.y=Y1;D.add(cap);
 const gold=new T.MeshPhysicalMaterial({color:0xE9C77A,metalness:.85,roughness:.3,clearcoat:.8});
 const h=new T.Mesh(new T.CylinderGeometry(.17,.19,1.15,32),gold);h.position.y=Y1+.55;D.add(h);
 const hc=new T.Mesh(new T.SphereGeometry(.17,24,16),gold);hc.position.y=Y1+1.12;D.add(hc);
 D.scale.setScalar(.95);
 const sc=document.createElement('canvas');sc.width=sc.height=128;const sx=sc.getContext('2d'),sg=sx.createRadialGradient(64,64,0,64,64,64);sg.addColorStop(0,'rgba(122,54,179,.55)');sg.addColorStop(.5,'rgba(0,0,0,.35)');sg.addColorStop(1,'rgba(0,0,0,0)');sx.fillStyle=sg;sx.fillRect(0,0,128,128);
 const sh=new T.Mesh(new T.PlaneGeometry(3,3),new T.MeshBasicMaterial({map:new T.CanvasTexture(sc),transparent:true,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.position.y=-1.62;S.add(sh);
 D.position.y=0;G.position.y=.05;
 let st={mode:'idle'},t0=performance.now();
 window.spinTo=(k,cb)=>{const cur=D.rotation.y,base=Math.floor(cur/(Math.PI*2))*Math.PI*2;st={mode:'spin',from:cur,to:base-Math.PI*2*9+k*Math.PI/2+Math.PI,s:performance.now(),dur:4200,cb};};
 const RM=matchMedia('(prefers-reduced-motion: reduce)').matches,dm=document.getElementById('dr-m');
 (function loop(now){requestAnimationFrame(loop);if(dm.hidden)return;const t=(now-t0)/1000;sh.scale.setScalar(1-(G.position.y-.05)*1.5);
  if(st.mode==='idle'){if(RM){R.render(S,C);return}D.rotation.y-=.008;G.rotation.z=Math.sin(t*1.6)*.06;G.rotation.x=Math.cos(t*1.3)*.04;G.position.y=.05+Math.sin(t*2)*.05;}
  else if(st.mode==='spin'){const p=Math.min((now-st.s)/st.dur,1),e=1-Math.pow(1-p,4);D.rotation.y=st.from+(st.to-st.from)*e;const w=(1-e);
   G.rotation.z=Math.sin(t*14)*.22*w;G.rotation.x=Math.cos(t*14)*.22*w;G.position.y=.05+Math.sin(t*30)*.03*w;
   if(p>=1){st.mode='done';st.cb&&st.cb()}}
  else{G.rotation.z*=.9;G.rotation.x*=.9;}
  R.render(S,C);})(t0);
};

});}
