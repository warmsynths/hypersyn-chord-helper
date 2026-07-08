(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const s of i.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&r(s)}).observe(document,{childList:!0,subtree:!0});function n(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(o){if(o.ep)return;o.ep=!0;const i=n(o);fetch(o.href,i)}})();const Cn="modulepreload",In=function(t){return"/hypersyn-chord-helper/"+t},ce={},_n=function(e,n,r){let o=Promise.resolve();if(n&&n.length>0){let p=function(l){return Promise.all(l.map(d=>Promise.resolve(d).then(u=>({status:"fulfilled",value:u}),u=>({status:"rejected",reason:u}))))};var s=p;document.getElementsByTagName("link");const a=document.querySelector("meta[property=csp-nonce]"),c=a?.nonce||a?.getAttribute("nonce");o=p(n.map(l=>{if(l=In(l),l in ce)return;ce[l]=!0;const d=l.endsWith(".css"),u=d?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${l}"]${u}`))return;const m=document.createElement("link");if(m.rel=d?"stylesheet":Cn,d||(m.as="script"),m.crossOrigin="",m.href=l,c&&m.setAttribute("nonce",c),document.head.appendChild(m),d)return new Promise((h,y)=>{m.addEventListener("load",h),m.addEventListener("error",()=>y(new Error(`Unable to preload CSS for ${l}`)))})}))}function i(a){const c=new Event("vite:preloadError",{cancelable:!0});if(c.payload=a,window.dispatchEvent(c),!c.defaultPrevented)throw a}return o.then(a=>{for(const c of a||[])c.status==="rejected"&&i(c.reason);return e().catch(i)})};function Bn(){const t=document.getElementById("video-bg"),e=document.getElementById("toggleVideoBtn");if(!t||!e)return;const n=t.style.display==="none";t.style.display=n?"block":"none",e.textContent=n?"Hide Video":"Show Video"}function Tn(t,e){if(!Array.isArray(t))return t;const n=[...t].sort((o,i)=>o-i);function r(o){return o.includes(4)&&o.includes(10)}switch(e){case"drop2":if(n.length>=2){const i=n.length-2;n[i]-=12}return n.slice().sort((i,s)=>i-s);case"open-triad":return n.length===3?[n[0],n[2],n[1]+12].sort((s,a)=>s-a):n;case"drop3":if(n.length>=3){const i=n.length-3;n[i]-=12}return n.slice().sort((i,s)=>i-s);case"spread":return n.map((i,s)=>s%2===1?i+12:i);case"octave":const o=[...n];return o.length>0&&o.push(o[0]+12),o.length>2&&o.push(o[2]+12),o;case"first-inversion":if(n.length>1){const i=[...n];return i[0]+=12,i.slice(1).concat(i[0]).sort((s,a)=>s-a)}return n;case"second-inversion":if(n.length>2){const i=[...n];return i[0]+=12,i[1]+=12,i.slice(2).concat(i[0],i[1]).sort((s,a)=>s-a)}return n;case"third-inversion":if(n.length>3){const i=[...n];return i[0]+=12,i[1]+=12,i[2]+=12,i.slice(3).concat(i[0],i[1],i[2]).sort((s,a)=>s-a)}return n;case"shell-dominant":return r(n)?n.filter(i=>i===0||i===4||i===10):n;case"altered-dominant":return r(n)?n.filter(s=>s===0||s===4||s===10).concat([1,5,6,8]).sort((s,a)=>s-a):n;case"closed":default:return t}}let L=[],D=[],bt=null,X=null,pt=null,ft=null;function Mt(){pt&&(clearTimeout(pt),pt=null),ft&&(clearTimeout(ft),ft=null),L&&L.length&&(L.forEach(t=>{try{t.stop()}catch{}}),L=[]),D&&D.length&&(D.forEach(t=>{try{t.disconnect()}catch{}}),D=[])}function Ht(t,e=!1,n=null){if(!t||t.length===0){n&&n();return}const r=bt||new(globalThis.AudioContext||globalThis.webkitAudioContext);if(bt=r,r.state==="suspended"&&r.resume(),!X){const p=r.sampleRate*2.5,l=r.createBuffer(2,p,r.sampleRate);for(let u=0;u<2;u++){const m=l.getChannelData(u);for(let h=0;h<p;h++)m[h]=(Math.random()*2-1)*Math.pow(1-h/p,2.5)}const d=r.createConvolver();d.buffer=l,X=d}const o=X;let i=r.currentTime;const s=2.5;Mt();const a=.05;L=[],D=[],t.forEach(p=>{p.forEach(l=>{if(!isFinite(l))return;let d=440*Math.pow(2,(l-69)/12);if(!isFinite(d))return;let u=r.createOscillator(),m=r.createGain(),h=r.createBiquadFilter();u.type="triangle",u.frequency.value=d,u.detune.value=Math.random()*10-5,h.type="lowpass",h.frequency.value=220,h.Q.value=1.4;const y=1,M=1.2;m.gain.setValueAtTime(0,i),m.gain.linearRampToValueAtTime(a,i+y),m.gain.setValueAtTime(a,i+s-M),m.gain.linearRampToValueAtTime(0,i+s),u.connect(h).connect(m).connect(o).connect(r.destination),u.start(i),u.stop(i+s),L.push(u),D.push(m)}),i+=s});const c=s*t.length;e?pt=setTimeout(()=>{Ht(t,e,n)},c*1e3):ft=setTimeout(()=>{n&&n()},c*1e3)}function Nn(t){if(!t||!Array.isArray(t.intervalOnly))return;const e={C:48,"C#":49,Db:49,D:50,"D#":51,Eb:51,E:52,F:53,"F#":54,Gb:54,G:55,"G#":56,Ab:56,A:57,"A#":58,Bb:58,B:59},n=bt||new(globalThis.AudioContext||globalThis.webkitAudioContext);if(bt=n,n.state==="suspended"&&n.resume(),!X){const c=n.sampleRate*2.5,p=n.createBuffer(2,c,n.sampleRate);for(let d=0;d<2;d++){const u=p.getChannelData(d);for(let m=0;m<c;m++)u[m]=(Math.random()*2-1)*Math.pow(1-m/c,2.5)}const l=n.createConvolver();l.buffer=p,X=l}const r=X;Mt();const o=parseInt(document.getElementById("volumeSlider").value,10)/100;L=[],D=[];let i=e[t.root]||60;isFinite(i)||(i=60);const s=typeof Te=="function"?Te():"closed";let a=t.intervalOnly.filter(c=>typeof c=="number"&&isFinite(c));a=Tn(a,s),a.forEach(c=>{let p=i+c;if(!isFinite(p))return;let l=440*Math.pow(2,(p-69)/12);if(!isFinite(l))return;let d=n.createOscillator(),u=n.createGain(),m=n.createBiquadFilter();d.type="triangle",d.frequency.value=l,d.detune.value=Math.random()*10-5,m.type="lowpass",m.frequency.value=220,m.Q.value=1.4;const h=n.currentTime,y=1,M=2.5,b=1.2;u.gain.setValueAtTime(0,h),u.gain.linearRampToValueAtTime(o,h+y),u.gain.setValueAtTime(o,h+M-b),u.gain.linearRampToValueAtTime(0,h+M),d.connect(m).connect(u).connect(r).connect(n.destination),d.start(h),d.stop(h+M),L.push(d),D.push(u)})}const kn=()=>"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(t){var e=Math.random()*16|0,n=t==="x"?e:e&3|8;return n.toString(16)}),$=(t,e="info")=>{const n=document.getElementById("toastContainer");if(!n)return;for(;n.children.length>=2;)n.removeChild(n.firstChild);const r=document.createElement("div");r.className=`toast ${e}`,r.textContent=t,r.setAttribute("role","alert"),n.appendChild(r),setTimeout(()=>{r.style.transition="opacity 0.5s ease",r.style.opacity="0",setTimeout(()=>{r.parentNode===n&&n.removeChild(r)},500)},2400)},et=()=>{const t=localStorage.getItem("hypersynChordSets");try{const e=t?JSON.parse(t):[];let n=!1;return e.forEach(r=>{(!r.chordSets||!Array.isArray(r.chordSets)||r.chordSets.length===0)&&(r.chordSets=[r.chords||""],n=!0)}),n&&localStorage.setItem("hypersynChordSets",JSON.stringify(e)),e}catch{return[]}},Ft=t=>{localStorage.setItem("hypersynChordSets",JSON.stringify(t))},Et=()=>{const t=document.getElementById("savedChordSetsSelect");if(!t)return;const e=et();t.innerHTML='<option value="">Load saved set...</option>',e.forEach((n,r)=>{t.innerHTML+=`<option value="${r}">${n.name}</option>`})},jn=()=>{const t=document.getElementById("chordsInput").value,e=[...A],r=document.getElementById("chordSetNameInput").value.trim();if(!r){$("Please enter a name for the chord set.","error");return}let o=et();const i=o.findIndex(s=>s.name===r);i>=0?(o[i].chords=t,o[i].chordSets=e):o.push({name:r,chords:t,chordSets:e,id:kn()}),Ft(o),Et(),$(`Chord set saved as '${r}'.`,"success")},On=()=>{const e=document.getElementById("savedChordSetsSelect").value;if(!e||isNaN(Number(e))){$("Please select a saved chord set to load.","error");return}const r=et()[parseInt(e,10)];r?(Vt(r.chordSets),$(`Chord set '${r.name}' loaded!`,"success")):$("Chord set not found.","error")},Rn=()=>{const e=document.getElementById("savedChordSetsSelect").value;if(!e||isNaN(Number(e))){$("Please select a saved chord set to delete.","error");return}let n=et();n[parseInt(e,10)]?(n.splice(parseInt(e,10),1),Ft(n),Et(),$("Chord set deleted.","success")):$("Chord set not found.","error")},Ln=()=>{const t=et(),e=JSON.stringify(t,null,2),n=new Blob([e],{type:"application/json"}),r=URL.createObjectURL(n),o=document.createElement("a");let i="hypersyn-chord-sets.json";const s=document.getElementById("savedChordSetsSelect");if(s&&s.value&&!isNaN(Number(s.value))){const a=parseInt(s.value,10),c=Array.isArray(t)?t:[];if(c[a]&&c[a].name){let p=c[a].name.toLowerCase().replace(/[^a-z0-9]/g,"");p.length>0&&(i=`hypersyn-${p}.json`)}}o.href=r,o.download=i,document.body.appendChild(o),o.click(),document.body.removeChild(o),URL.revokeObjectURL(r),$(`Chord sets exported as ${i}.`,"success")},Dn=t=>{if(!t.files||!t.files[0]){$("No file selected.","error");return}const e=t.files[0],n=new FileReader;n.onload=function(r){try{const o=typeof r.target.result=="string"?r.target.result:"",i=JSON.parse(o);if(!Array.isArray(i))throw new Error("Invalid format");let s=et();const a=new Set(s.map(p=>p.id));let c=0;i.forEach(p=>{p&&p.id&&!a.has(p.id)&&((!p.chordSets||!Array.isArray(p.chordSets)||p.chordSets.length===0)&&(p.chordSets=[p.chords||""]),s.push(p),c++)}),Ft(s),Et(),c>0?$(`Imported ${c} new chord set(s).`,"success"):$("No new chord sets to import.","info")}catch{$("Failed to import chord sets.","error")}t.value=""},n.readAsText(e)};function Vn(t,e){const n=[];for(;e--;n[e]=e+t);return n}function Hn(t,e){const n=[];for(;e--;n[e]=t-e);return n}function Fn(t,e){return t<e?Vn(t,e-t+1):Hn(t,t-e+1)}function ke(t,e){const n=e.length,r=(t%n+n)%n;return e.slice(r,n).concat(e.slice(0,r))}function je(t){return t.filter(e=>e===0||e)}function Oe(t){return t!==null&&typeof t=="object"&&"name"in t&&typeof t.name=="string"}function Re(t){return t!==null&&typeof t=="object"&&"step"in t&&typeof t.step=="number"&&"alt"in t&&typeof t.alt=="number"&&!isNaN(t.step)&&!isNaN(t.alt)}var Le=[0,2,4,-1,1,3,5],De=Le.map(t=>Math.floor(t*7/12));function Ve(t){const{step:e,alt:n,oct:r,dir:o=1}=t,i=Le[e]+7*n;if(r===void 0)return[o*i];const s=r-De[e]-4*n;return[o*i,o*s]}var Un=[3,0,4,1,5,2,6];function He(t){const[e,n,r]=t,o=Un[zn(e)],i=Math.floor((e+1)/7);if(n===void 0)return{step:o,alt:i,dir:r};const s=n+4*i+De[o];return{step:o,alt:i,oct:s,dir:r}}function zn(t){const e=(t+1)%7;return e<0?7+e:e}var de=(t,e)=>Array(Math.abs(e)+1).join(t),Rt=Object.freeze({empty:!0,name:"",num:NaN,q:"",type:"",step:NaN,alt:NaN,dir:NaN,simple:NaN,semitones:NaN,chroma:NaN,coord:[],oct:NaN}),qn="([-+]?\\d+)(d{1,4}|m|M|P|A{1,4})",Gn="(AA|A|P|M|m|d|dd)([-+]?\\d+)",Wn=new RegExp("^"+qn+"|"+Gn+"$");function Kn(t){const e=Wn.exec(`${t}`);return e===null?["",""]:e[1]?[e[1],e[2]]:[e[4],e[3]]}var me={};function _(t){return typeof t=="string"?me[t]||(me[t]=Xn(t)):Re(t)?_(Yn(t)):Oe(t)?_(t.name):Rt}var ue=[0,2,4,5,7,9,11],Fe="PMMPPMM";function Xn(t){const e=Kn(t);if(e[0]==="")return Rt;const n=+e[0],r=e[1],o=(Math.abs(n)-1)%7,i=Fe[o];if(i==="M"&&r==="P")return Rt;const s=i==="M"?"majorable":"perfectable",a=""+n+r,c=n<0?-1:1,p=n===8||n===-8?n:c*(o+1),l=Jn(s,r),d=Math.floor((Math.abs(n)-1)/7),u=c*(ue[o]+l+12*d),m=(c*(ue[o]+l)%12+12)%12,h=Ve({step:o,alt:l,oct:d,dir:c});return{empty:!1,name:a,num:n,q:r,step:o,alt:l,dir:c,type:s,simple:p,semitones:u,chroma:m,coord:h,oct:d}}function Ut(t,e){const[n,r=0]=t,o=n*7+r*12<0,i=e||o?[-n,-r,-1]:[n,r,1];return _(He(i))}function Jn(t,e){return e==="M"&&t==="majorable"||e==="P"&&t==="perfectable"?0:e==="m"&&t==="majorable"?-1:/^A+$/.test(e)?e.length:/^d+$/.test(e)?-1*(t==="perfectable"?e.length:e.length+1):0}function Yn(t){const{step:e,alt:n,oct:r=0,dir:o}=t;if(!o)return"";const i=e+1+7*r,s=i===0?e+1:i,a=o<0?"-":"",c=Fe[e]==="M"?"majorable":"perfectable";return a+s+Qn(c,n)}function Qn(t,e){return e===0?t==="majorable"?"M":"P":e===-1&&t==="majorable"?"m":e>0?de("A",e):de("d",t==="perfectable"?e:e+1)}var he=(t,e)=>Array(Math.abs(e)+1).join(t),Ue=Object.freeze({empty:!0,name:"",letter:"",acc:"",pc:"",step:NaN,alt:NaN,chroma:NaN,height:NaN,coord:[],midi:null,freq:null}),pe=new Map,Zn=t=>"CDEFGAB".charAt(t),tr=t=>t<0?he("b",-t):he("#",t),er=t=>t[0]==="b"?-t.length:t.length;function I(t){const e=JSON.stringify(t),n=pe.get(e);if(n)return n;const r=typeof t=="string"?ir(t):Re(t)?I(ar(t)):Oe(t)?I(t.name):Ue;return pe.set(e,r),r}var nr=/^([a-gA-G]?)(#{1,}|b{1,}|x{1,}|)(-?\d*)\s*(.*)$/;function zt(t){const e=nr.exec(t);return e?[e[1].toUpperCase(),e[2].replace(/x/g,"##"),e[3],e[4]]:["","","",""]}function rr(t){return I(He(t))}var or=(t,e)=>(t%e+e)%e,kt=[0,2,4,5,7,9,11];function ir(t){const e=zt(t);if(e[0]===""||e[3]!=="")return Ue;const n=e[0],r=e[1],o=e[2],i=(n.charCodeAt(0)+3)%7,s=er(r),a=o.length?+o:void 0,c=Ve({step:i,alt:s,oct:a}),p=n+r+o,l=n+r,d=(kt[i]+s+120)%12,u=a===void 0?or(kt[i]+s,12)-1188:kt[i]+s+12*(a+1),m=u>=0&&u<=127?u:null,h=a===void 0?null:Math.pow(2,(u-69)/12)*440;return{empty:!1,acc:r,alt:s,chroma:d,coord:c,freq:h,height:u,letter:n,midi:m,name:p,oct:a,pc:l,step:i}}function ar(t){const{step:e,alt:n,oct:r}=t,o=Zn(e);if(!o)return"";const i=o+tr(n);return r||r===0?i+r:i}function V(t,e){const n=I(t),r=Array.isArray(e)?e:_(e).coord;if(n.empty||!r||r.length<2)return"";const o=n.coord,i=o.length===1?[o[0]+r[0]]:[o[0]+r[0],o[1]+r[1]];return rr(i).name}function ze(t,e){const n=t.length;return r=>{if(!e)return"";const o=r<0?(n- -r%n)%n:r%n,i=Math.floor(r/n),s=V(e,[0,i]);return V(s,t[o])}}function Pt(t,e){const n=I(t),r=I(e);if(n.empty||r.empty)return"";const o=n.coord,i=r.coord,s=i[0]-o[0],a=o.length===2&&i.length===2?i[1]-o[1]:-Math.floor(s*7/12),c=r.height===n.height&&r.midi!==null&&n.oct===r.oct&&n.step>r.step;return Ut([s,a],c).name}var Y={empty:!0,name:"",setNum:0,chroma:"000000000000",normalized:"000000000000",intervals:[]},qe=t=>Number(t).toString(2).padStart(12,"0"),fe=t=>parseInt(t,2),sr=/^[01]{12}$/;function Ge(t){return sr.test(t)}var lr=t=>typeof t=="number"&&t>=0&&t<=4095,cr=t=>t&&Ge(t.chroma),ge={[Y.chroma]:Y};function q(t){const e=Ge(t)?t:lr(t)?qe(t):Array.isArray(t)?gr(t):cr(t)?t.chroma:Y.chroma;return ge[e]=ge[e]||fr(e)}var dr=["1P","2m","2M","3m","3M","4P","5d","5P","6m","6M","7m","7M"];function mr(t){const e=[];for(let n=0;n<12;n++)t.charAt(n)==="1"&&e.push(dr[n]);return e}function ur(t,e=!0){const r=q(t).chroma.split("");return je(r.map((o,i)=>{const s=ke(i,r);return e&&s[0]==="0"?null:s.join("")}))}function hr(t){const e=q(t).setNum;return n=>{const r=q(n).setNum;return e&&e!==r&&(r&e)===r}}function We(t){const e=q(t).setNum;return n=>{const r=q(n).setNum;return e&&e!==r&&(r|e)===r}}function pr(t){const e=t.split("");return e.map((n,r)=>ke(r,e).join(""))}function fr(t){const e=fe(t),n=pr(t).map(fe).filter(i=>i>=2048).sort()[0],r=qe(n),o=mr(t);return{empty:!1,name:"",setNum:e,chroma:t,normalized:r,intervals:o}}function gr(t){if(t.length===0)return Y.chroma;let e;const n=[0,0,0,0,0,0,0,0,0,0,0,0];for(let r=0;r<t.length;r++)e=I(t[r]),e.empty&&(e=_(t[r])),e.empty||(n[e.chroma]=1);return n.join("")}var vr=[["1P 3M 5P","major","M ^  maj"],["1P 3M 5P 7M","major seventh","maj7 Δ ma7 M7 Maj7 ^7"],["1P 3M 5P 7M 9M","major ninth","maj9 Δ9 ^9"],["1P 3M 5P 7M 9M 13M","major thirteenth","maj13 Maj13 ^13"],["1P 3M 5P 6M","sixth","6 add6 add13 M6"],["1P 3M 5P 6M 9M","sixth added ninth","6add9 6/9 69 M69"],["1P 3M 6m 7M","major seventh flat sixth","M7b6 ^7b6"],["1P 3M 5P 7M 11A","major seventh sharp eleventh","maj#4 Δ#4 Δ#11 M7#11 ^7#11 maj7#11"],["1P 3m 5P","minor","m min -"],["1P 3m 5P 7m","minor seventh","m7 min7 mi7 -7"],["1P 3m 5P 7M","minor/major seventh","m/ma7 m/maj7 mM7 mMaj7 m/M7 -Δ7 mΔ -^7 -maj7"],["1P 3m 5P 6M","minor sixth","m6 -6"],["1P 3m 5P 7m 9M","minor ninth","m9 -9"],["1P 3m 5P 7M 9M","minor/major ninth","mM9 mMaj9 -^9"],["1P 3m 5P 7m 9M 11P","minor eleventh","m11 -11"],["1P 3m 5P 7m 9M 13M","minor thirteenth","m13 -13"],["1P 3m 5d","diminished","dim ° o"],["1P 3m 5d 7d","diminished seventh","dim7 °7 o7"],["1P 3m 5d 7m","half-diminished","m7b5 ø -7b5 h7 h"],["1P 3M 5P 7m","dominant seventh","7 dom"],["1P 3M 5P 7m 9M","dominant ninth","9"],["1P 3M 5P 7m 9M 13M","dominant thirteenth","13"],["1P 3M 5P 7m 11A","lydian dominant seventh","7#11 7#4"],["1P 3M 5P 7m 9m","dominant flat ninth","7b9"],["1P 3M 5P 7m 9A","dominant sharp ninth","7#9"],["1P 3M 7m 9m","altered","alt7"],["1P 4P 5P","suspended fourth","sus4 sus"],["1P 2M 5P","suspended second","sus2"],["1P 4P 5P 7m","suspended fourth seventh","7sus4 7sus"],["1P 5P 7m 9M 11P","eleventh","11"],["1P 4P 5P 7m 9m","suspended fourth flat ninth","b9sus phryg 7b9sus 7b9sus4"],["1P 5P","fifth","5"],["1P 3M 5A","augmented","aug + +5 ^#5"],["1P 3m 5A","minor augmented","m#5 -#5 m+"],["1P 3M 5A 7M","augmented seventh","maj7#5 maj7+5 +maj7 ^7#5"],["1P 3M 5P 7M 9M 11A","major sharp eleventh (lydian)","maj9#11 Δ9#11 ^9#11"],["1P 2M 4P 5P","","sus24 sus4add9"],["1P 3M 5A 7M 9M","","maj9#5 Maj9#5"],["1P 3M 5A 7m","","7#5 +7 7+ 7aug aug7"],["1P 3M 5A 7m 9A","","7#5#9 7#9#5 7alt"],["1P 3M 5A 7m 9M","","9#5 9+"],["1P 3M 5A 7m 9M 11A","","9#5#11"],["1P 3M 5A 7m 9m","","7#5b9 7b9#5"],["1P 3M 5A 7m 9m 11A","","7#5b9#11"],["1P 3M 5A 9A","","+add#9"],["1P 3M 5A 9M","","M#5add9 +add9"],["1P 3M 5P 6M 11A","","M6#11 M6b5 6#11 6b5"],["1P 3M 5P 6M 7M 9M","","M7add13"],["1P 3M 5P 6M 9M 11A","","69#11"],["1P 3m 5P 6M 9M","","m69 -69"],["1P 3M 5P 6m 7m","","7b6"],["1P 3M 5P 7M 9A 11A","","maj7#9#11"],["1P 3M 5P 7M 9M 11A 13M","","M13#11 maj13#11 M13+4 M13#4"],["1P 3M 5P 7M 9m","","M7b9"],["1P 3M 5P 7m 11A 13m","","7#11b13 7b5b13"],["1P 3M 5P 7m 13M","","7add6 67 7add13"],["1P 3M 5P 7m 9A 11A","","7#9#11 7b5#9 7#9b5"],["1P 3M 5P 7m 9A 11A 13M","","13#9#11"],["1P 3M 5P 7m 9A 11A 13m","","7#9#11b13"],["1P 3M 5P 7m 9A 13M","","13#9"],["1P 3M 5P 7m 9A 13m","","7#9b13"],["1P 3M 5P 7m 9M 11A","","9#11 9+4 9#4"],["1P 3M 5P 7m 9M 11A 13M","","13#11 13+4 13#4"],["1P 3M 5P 7m 9M 11A 13m","","9#11b13 9b5b13"],["1P 3M 5P 7m 9m 11A","","7b9#11 7b5b9 7b9b5"],["1P 3M 5P 7m 9m 11A 13M","","13b9#11"],["1P 3M 5P 7m 9m 11A 13m","","7b9b13#11 7b9#11b13 7b5b9b13"],["1P 3M 5P 7m 9m 13M","","13b9"],["1P 3M 5P 7m 9m 13m","","7b9b13"],["1P 3M 5P 7m 9m 9A","","7b9#9"],["1P 3M 5P 9M","","Madd9 2 add9 add2"],["1P 3M 5P 9m","","Maddb9"],["1P 3M 5d","","Mb5"],["1P 3M 5d 6M 7m 9M","","13b5"],["1P 3M 5d 7M","","M7b5"],["1P 3M 5d 7M 9M","","M9b5"],["1P 3M 5d 7m","","7b5"],["1P 3M 5d 7m 9M","","9b5"],["1P 3M 7m","","7no5"],["1P 3M 7m 13m","","7b13"],["1P 3M 7m 9M","","9no5"],["1P 3M 7m 9M 13M","","13no5"],["1P 3M 7m 9M 13m","","9b13"],["1P 3m 4P 5P","","madd4"],["1P 3m 5P 6m 7M","","mMaj7b6"],["1P 3m 5P 6m 7M 9M","","mMaj9b6"],["1P 3m 5P 7m 11P","","m7add11 m7add4"],["1P 3m 5P 9M","","madd9"],["1P 3m 5d 6M 7M","","o7M7"],["1P 3m 5d 7M","","oM7"],["1P 3m 6m 7M","","mb6M7"],["1P 3m 6m 7m","","m7#5"],["1P 3m 6m 7m 9M","","m9#5"],["1P 3m 5A 7m 9M 11P","","m11A"],["1P 3m 6m 9m","","mb6b9"],["1P 2M 3m 5d 7m","","m9b5"],["1P 4P 5A 7M","","M7#5sus4"],["1P 4P 5A 7M 9M","","M9#5sus4"],["1P 4P 5A 7m","","7#5sus4"],["1P 4P 5P 7M","","M7sus4"],["1P 4P 5P 7M 9M","","M9sus4"],["1P 4P 5P 7m 9M","","9sus4 9sus"],["1P 4P 5P 7m 9M 13M","","13sus4 13sus"],["1P 4P 5P 7m 9m 13m","","7sus4b9b13 7b9b13sus4"],["1P 4P 7m 10m","","4 quartal"],["1P 5P 7m 9m 11P","","11b9"]],yr=vr,br={...Y,name:"",quality:"Unknown",intervals:[],aliases:[]},qt=[],it={};function Mr(t){return it[t]||br}function Gt(){return qt.slice()}function Pr(t,e,n){const r=$r(t),o={...q(t),name:n||"",quality:r,intervals:t,aliases:e};qt.push(o),o.name&&(it[o.name]=o),it[o.setNum]=o,it[o.chroma]=o,o.aliases.forEach(i=>xr(o,i))}function xr(t,e){it[e]=t}function $r(t){const e=n=>t.indexOf(n)!==-1;return e("5A")?"Augmented":e("3M")?"Major":e("5d")?"Diminished":e("3m")?"Minor":"Unknown"}yr.forEach(([t,e,n])=>Pr(t.split(" "),n.split(" "),e));qt.sort((t,e)=>t.setNum-e.setNum);var Ar=t=>{const e=t.reduce((n,r)=>{const o=I(r).chroma;return o!==void 0&&(n[o]=n[o]||I(r).name),n},{});return n=>e[n]};function Sr(t,e={}){const n=t.map(o=>I(o).pc).filter(o=>o);return I.length===0?[]:Tr(n,1,e).filter(o=>o.weight).sort((o,i)=>i.weight-o.weight).map(o=>o.name)}var wt={anyThirds:384,perfectFifth:16,nonPerfectFifths:40,anySeventh:3},Ct=t=>e=>!!(e&t),Er=Ct(wt.anyThirds),wr=Ct(wt.perfectFifth),Cr=Ct(wt.anySeventh),Ir=Ct(wt.nonPerfectFifths);function _r(t){const e=parseInt(t.chroma,2);return Er(e)&&wr(e)&&Cr(e)}function Br(t){const e=parseInt(t,2);return Ir(e)?t:(e|16).toString(2)}function Tr(t,e,n){const r=t[0],o=I(r).chroma,i=Ar(t),s=ur(t,!1),a=[];return s.forEach((c,p)=>{const l=n.assumePerfectFifth&&Br(c);Gt().filter(u=>n.assumePerfectFifth&&_r(u)?u.chroma===l:u.chroma===c).forEach(u=>{const m=u.aliases[0],h=i(p);p!==o?a.push({weight:.5*e,name:`${h}${m}/${r}`}):a.push({weight:1*e,name:`${h}${m}`})})}),a}function Nr(){return"1P 2M 3M 4P 5P 6m 7m".split(" ")}var Ke=_,kr=t=>_(t).name,Xe=t=>_(t).semitones,jr=t=>_(t).q,Or=t=>_(t).num;function Rr(t){const e=_(t);return e.empty?"":e.simple+e.q}function Lr(t){const e=_(t);if(e.empty)return"";const n=(7-e.step)%7,r=e.type==="perfectable"?-e.alt:-(e.alt+1);return _({step:n,alt:r,oct:e.oct,dir:e.dir}).name}var Dr=[1,2,2,3,3,4,5,5,6,6,7,7],Vr="P m M m M P d P m M m M".split(" ");function Hr(t){const e=t<0?-1:1,n=Math.abs(t),r=n%12,o=Math.floor(n/12);return e*(Dr[r]+7*o)+Vr[r]}var Fr=Pt,Je=Qe((t,e)=>[t[0]+e[0],t[1]+e[1]]),Ur=t=>e=>Je(t,e),Ye=Qe((t,e)=>[t[0]-e[0],t[1]-e[1]]);function zr(t,e){const n=Ke(t);if(n.empty)return"";const[r,o,i]=n.coord;return Ut([r+e,o,i]).name}var qr={names:Nr,get:Ke,name:kr,num:Or,semitones:Xe,quality:jr,fromSemitones:Hr,distance:Fr,invert:Lr,simplify:Rr,add:Je,addTo:Ur,subtract:Ye,transposeFifths:zr};function Qe(t){return(e,n)=>{const r=_(e).coord,o=_(n).coord;if(r&&o){const i=t(r,o);return Ut(i).name}}}var Gr=[["1P 2M 3M 5P 6M","major pentatonic","pentatonic"],["1P 2M 3M 4P 5P 6M 7M","major","ionian"],["1P 2M 3m 4P 5P 6m 7m","minor","aeolian"],["1P 2M 3m 3M 5P 6M","major blues"],["1P 3m 4P 5d 5P 7m","minor blues","blues"],["1P 2M 3m 4P 5P 6M 7M","melodic minor"],["1P 2M 3m 4P 5P 6m 7M","harmonic minor"],["1P 2M 3M 4P 5P 6M 7m 7M","bebop"],["1P 2M 3m 4P 5d 6m 6M 7M","diminished","whole-half diminished"],["1P 2M 3m 4P 5P 6M 7m","dorian"],["1P 2M 3M 4A 5P 6M 7M","lydian"],["1P 2M 3M 4P 5P 6M 7m","mixolydian","dominant"],["1P 2m 3m 4P 5P 6m 7m","phrygian"],["1P 2m 3m 4P 5d 6m 7m","locrian"],["1P 3M 4P 5P 7M","ionian pentatonic"],["1P 3M 4P 5P 7m","mixolydian pentatonic","indian"],["1P 2M 4P 5P 6M","ritusen"],["1P 2M 4P 5P 7m","egyptian"],["1P 3M 4P 5d 7m","neapolitan major pentatonic"],["1P 3m 4P 5P 6m","vietnamese 1"],["1P 2m 3m 5P 6m","pelog"],["1P 2m 4P 5P 6m","kumoijoshi"],["1P 2M 3m 5P 6m","hirajoshi"],["1P 2m 4P 5d 7m","iwato"],["1P 2m 4P 5P 7m","in-sen"],["1P 3M 4A 5P 7M","lydian pentatonic","chinese"],["1P 3m 4P 6m 7m","malkos raga"],["1P 3m 4P 5d 7m","locrian pentatonic","minor seven flat five pentatonic"],["1P 3m 4P 5P 7m","minor pentatonic","vietnamese 2"],["1P 3m 4P 5P 6M","minor six pentatonic"],["1P 2M 3m 5P 6M","flat three pentatonic","kumoi"],["1P 2M 3M 5P 6m","flat six pentatonic"],["1P 2m 3M 5P 6M","scriabin"],["1P 3M 5d 6m 7m","whole tone pentatonic"],["1P 3M 4A 5A 7M","lydian #5p pentatonic"],["1P 3M 4A 5P 7m","lydian dominant pentatonic"],["1P 3m 4P 5P 7M","minor #7m pentatonic"],["1P 3m 4d 5d 7m","super locrian pentatonic"],["1P 2M 3m 4P 5P 7M","minor hexatonic"],["1P 2A 3M 5P 5A 7M","augmented"],["1P 2M 4P 5P 6M 7m","piongio"],["1P 2m 3M 4A 6M 7m","prometheus neapolitan"],["1P 2M 3M 4A 6M 7m","prometheus"],["1P 2m 3M 5d 6m 7m","mystery #1"],["1P 2m 3M 4P 5A 6M","six tone symmetric"],["1P 2M 3M 4A 5A 6A","whole tone","messiaen's mode #1"],["1P 2m 4P 4A 5P 7M","messiaen's mode #5"],["1P 2M 3M 4P 5d 6m 7m","locrian major","arabian"],["1P 2m 3M 4A 5P 6m 7M","double harmonic lydian"],["1P 2m 2A 3M 4A 6m 7m","altered","super locrian","diminished whole tone","pomeroy"],["1P 2M 3m 4P 5d 6m 7m","locrian #2","half-diminished","aeolian b5"],["1P 2M 3M 4P 5P 6m 7m","mixolydian b6","melodic minor fifth mode","hindu"],["1P 2M 3M 4A 5P 6M 7m","lydian dominant","lydian b7","overtone"],["1P 2M 3M 4A 5A 6M 7M","lydian augmented"],["1P 2m 3m 4P 5P 6M 7m","dorian b2","phrygian #6","melodic minor second mode"],["1P 2m 3m 4d 5d 6m 7d","ultralocrian","superlocrian bb7","superlocrian diminished"],["1P 2m 3m 4P 5d 6M 7m","locrian 6","locrian natural 6","locrian sharp 6"],["1P 2A 3M 4P 5P 5A 7M","augmented heptatonic"],["1P 2M 3m 4A 5P 6M 7m","dorian #4","ukrainian dorian","romanian minor","altered dorian"],["1P 2M 3m 4A 5P 6M 7M","lydian diminished"],["1P 2M 3M 4A 5A 7m 7M","leading whole tone"],["1P 2M 3M 4A 5P 6m 7m","lydian minor"],["1P 2m 3M 4P 5P 6m 7m","phrygian dominant","spanish","phrygian major"],["1P 2m 3m 4P 5P 6m 7M","balinese"],["1P 2m 3m 4P 5P 6M 7M","neapolitan major"],["1P 2M 3M 4P 5P 6m 7M","harmonic major"],["1P 2m 3M 4P 5P 6m 7M","double harmonic major","gypsy"],["1P 2M 3m 4A 5P 6m 7M","hungarian minor"],["1P 2A 3M 4A 5P 6M 7m","hungarian major"],["1P 2m 3M 4P 5d 6M 7m","oriental"],["1P 2m 3m 3M 4A 5P 7m","flamenco"],["1P 2m 3m 4A 5P 6m 7M","todi raga"],["1P 2m 3M 4P 5d 6m 7M","persian"],["1P 2m 3M 5d 6m 7m 7M","enigmatic"],["1P 2M 3M 4P 5A 6M 7M","major augmented","major #5","ionian augmented","ionian #5"],["1P 2A 3M 4A 5P 6M 7M","lydian #9"],["1P 2m 2M 4P 4A 5P 6m 7M","messiaen's mode #4"],["1P 2m 3M 4P 4A 5P 6m 7M","purvi raga"],["1P 2m 3m 3M 4P 5P 6m 7m","spanish heptatonic"],["1P 2M 3m 3M 4P 5P 6M 7m","bebop minor"],["1P 2M 3M 4P 5P 5A 6M 7M","bebop major"],["1P 2m 3m 4P 5d 5P 6m 7m","bebop locrian"],["1P 2M 3m 4P 5P 6m 7m 7M","minor bebop"],["1P 2M 3M 4P 5d 5P 6M 7M","ichikosucho"],["1P 2M 3m 4P 5P 6m 6M 7M","minor six diminished"],["1P 2m 3m 3M 4A 5P 6M 7m","half-whole diminished","dominant diminished","messiaen's mode #2"],["1P 3m 3M 4P 5P 6M 7m 7M","kafi raga"],["1P 2M 3M 4P 4A 5A 6A 7M","messiaen's mode #6"],["1P 2M 3m 3M 4P 5d 5P 6M 7m","composite blues"],["1P 2M 3m 3M 4A 5P 6m 7m 7M","messiaen's mode #3"],["1P 2m 2M 3m 4P 4A 5P 6m 6M 7M","messiaen's mode #7"],["1P 2m 2M 3m 3M 4P 5d 5P 6m 6M 7m 7M","chromatic"]],Wr=Gr;({...Y});var Ze=[],gt={};function Kr(){return Ze.slice()}function Xr(t,e,n=[]){const r={...q(t),name:e,intervals:t,aliases:n};return Ze.push(r),gt[r.name]=r,gt[r.setNum]=r,gt[r.chroma]=r,r.aliases.forEach(o=>Jr(r,o)),r}function Jr(t,e){gt[e]=t}Wr.forEach(([t,e,...n])=>Xr(t.split(" "),e,n));var tn={empty:!0,name:"",symbol:"",root:"",bass:"",rootDegree:0,type:"",tonic:null,setNum:NaN,quality:"Unknown",chroma:"",normalized:"",aliases:[],notes:[],intervals:[]};function Wt(t){const[e,n,r,o]=zt(t);return e===""?jt("",t):e==="A"&&o==="ug"?jt("","aug"):jt(e+n,r+o)}function jt(t,e){const n=e.split("/");if(n.length===1)return[t,n[0],""];const[r,o,i,s]=zt(n[1]);return r!==""&&i===""&&s===""?[t,n[0],r+o]:[t,e,""]}function N(t){if(Array.isArray(t))return vt(t[1]||"",t[0],t[2]);if(t==="")return tn;{const[e,n,r]=Wt(t),o=vt(n,e,r);return o.empty?vt(t):o}}function vt(t,e,n){const r=Mr(t),o=I(e||""),i=I(n||"");if(r.empty||e&&o.empty||n&&i.empty)return tn;const s=Pt(o.pc,i.pc),a=r.intervals.indexOf(s),c=a>=0,p=c?i:I(""),l=a===-1?NaN:a+1,d=i.pc&&i.pc!==o.pc,u=Array.from(r.intervals);if(c)for(let M=1;M<l;M++){const b=u[0][0],f=u[0][1],g=parseInt(b,10)+7;u.push(`${g}${f}`),u.shift()}else if(d){const M=Ye(Pt(o.pc,i.pc),"8P");M&&u.unshift(M)}const m=o.empty?[]:u.map(M=>V(o.pc,M));t=r.aliases.indexOf(t)!==-1?t:r.aliases[0];const h=`${o.empty?"":o.pc}${t}${c&&l>1?"/"+p.pc:d?"/"+i.pc:""}`,y=`${e?o.pc+" ":""}${r.name}${c&&l>1?" over "+p.pc:d?" over "+i.pc:""}`;return{...r,name:y,symbol:h,tonic:o.pc,type:r.name,root:p.pc,bass:d?i.pc:"",intervals:u,rootDegree:l,notes:m}}var Yr=N;function Qr(t,e){const[n,r,o]=Wt(t);if(!n)return t;const i=V(o,e),s=i?"/"+i:"";return V(n,e)+r+s}function Zr(t){const e=N(t),n=We(e.chroma);return Kr().filter(r=>n(r.chroma)).map(r=>r.name)}function to(t){const e=N(t),n=We(e.chroma);return Gt().filter(r=>n(r.chroma)).map(r=>e.tonic+r.aliases[0])}function eo(t){const e=N(t),n=hr(e.chroma);return Gt().filter(r=>n(r.chroma)).map(r=>e.tonic+r.aliases[0])}function no(t,e){const n=N(t),r=e||n.tonic;return!r||n.empty?[]:n.intervals.map(o=>V(r,o))}function ro(t,e){const n=N(t),r=e||n.tonic,o=ze(n.intervals,r);return i=>i?o(i>0?i-1:i):""}function oo(t,e){const n=N(t),r=e||n.tonic;return ze(n.intervals,r)}var en={getChord:vt,get:N,detect:Sr,chordScales:Zr,extended:to,reduced:eo,tokenize:Wt,transpose:Qr,degrees:ro,steps:oo,notes:no,chord:Yr};function io(t){return+t>=0&&+t<=127}function Kt(t){if(io(t))return+t;const e=I(t);return e.empty?null:e.midi}var ao=Math.log(2),so=Math.log(440);function nn(t){const e=12*(Math.log(t)-so)/ao+69;return Math.round(e*100)/100}var lo="C C# D D# E F F# G G# A A# B".split(" "),co="C Db D Eb E F Gb G Ab A Bb B".split(" ");function j(t,e={}){if(isNaN(t)||t===-1/0||t===1/0)return"";t=Math.round(t);const r=(e.sharps===!0?lo:co)[t%12];if(e.pitchClass)return r;const o=Math.floor(t/12)-1;return r+o}var mo=["C","D","E","F","G","A","B"],rn=t=>t.name,on=t=>t.map(I).filter(e=>!e.empty);function uo(t){return t===void 0?mo.slice():Array.isArray(t)?on(t).map(rn):[]}var T=I,ho=t=>T(t).name,po=t=>T(t).pc,fo=t=>T(t).acc,go=t=>T(t).oct,vo=t=>T(t).midi,yo=t=>T(t).freq,bo=t=>T(t).chroma;function Mo(t){return j(t)}function Po(t){return j(nn(t))}function xo(t){return j(nn(t),{sharps:!0})}function $o(t){return j(t,{sharps:!0})}var Ao=Pt,ut=V,So=V,an=t=>e=>ut(e,t),Eo=an,sn=t=>e=>ut(t,e),wo=sn;function ln(t,e){return ut(t,[e,0])}var Co=ln;function Io(t,e){return ut(t,[0,e])}var Xt=(t,e)=>t.height-e.height,_o=(t,e)=>e.height-t.height;function cn(t,e){return e=e||Xt,on(t).sort(e).map(rn)}function Bo(t){return cn(t,Xt).filter((e,n,r)=>n===0||e!==r[n-1])}var To=t=>{const e=T(t);return e.empty?"":j(e.midi||e.chroma,{sharps:e.alt>0,pitchClass:e.midi===null})};function No(t,e){const n=T(t);if(n.empty)return"";const r=T(e||j(n.midi||n.chroma,{sharps:n.alt<0,pitchClass:!0}));if(r.empty||r.chroma!==n.chroma)return"";if(n.oct===void 0)return r.pc;const o=n.chroma-n.alt,i=r.chroma-r.alt,s=o>11||i<0?-1:o<0||i>11?1:0,a=n.oct+s;return r.pc+a}var O={names:uo,get:T,name:ho,pitchClass:po,accidentals:fo,octave:go,midi:vo,ascending:Xt,descending:_o,distance:Ao,sortedNames:cn,sortedUniqNames:Bo,fromMidi:Mo,fromMidiSharps:$o,freq:yo,fromFreq:Po,fromFreqSharps:xo,chroma:bo,transpose:ut,tr:So,transposeBy:an,trBy:Eo,transposeFrom:sn,trFrom:wo,transposeFifths:ln,transposeOctaves:Io,trFifths:Co,simplify:To,enharmonic:No};function dn(t){const e=je(t.map(n=>typeof n=="number"?n:Kt(n)));return!t.length||e.length!==t.length?[]:e.reduce((n,r)=>{const o=n[n.length-1];return n.concat(Fn(o,r).slice(1))},[e[0]])}function ko(t,e){return dn(t).map(n=>j(n,e))}var jo={numeric:dn,chromatic:ko},mn={M:["1P 3M 5P","3M 5P 8P","5P 8P 10M"],m:["1P 3m 5P","3m 5P 8P","5P 8P 10m"],o:["1P 3m 5d","3m 5d 8P","5d 8P 10m"],aug:["1P 3M 5A","3M 5A 8P","5A 8P 10M"]},Jt={m7:["3m 5P 7m 9M","7m 9M 10m 12P"],7:["3M 6M 7m 9M","7m 9M 10M 13M"],"^7":["3M 5P 7M 9M","7M 9M 10M 12P"],69:["3M 5P 6A 9M"],m7b5:["3m 5d 7m 8P","7m 8P 10m 12d"],"7b9":["3M 6m 7m 9m","7m 9m 10M 13m"],"7b13":["3M 6m 7m 9m","7m 9m 10M 13m"],o7:["1P 3m 5d 6M","5d 6M 8P 10m"],"7#11":["7m 9M 11A 13A"],"7#9":["3M 7m 9A"],mM7:["3m 5P 7M 9M","7M 9M 10m 12P"],m6:["3m 5P 6M 9M","6M 9M 10m 12P"]},Oo={M:["1P 3M 5P","3M 5P 8P","5P 8P 10M"],m:["1P 3m 5P","3m 5P 8P","5P 8P 10m"],o:["1P 3m 5d","3m 5d 8P","5d 8P 10m"],aug:["1P 3M 5A","3M 5A 8P","5A 8P 10M"],m7:["3m 5P 7m 9M","7m 9M 10m 12P"],7:["3M 6M 7m 9M","7m 9M 10M 13M"],"^7":["3M 5P 7M 9M","7M 9M 10M 12P"],69:["3M 5P 6A 9M"],m7b5:["3m 5d 7m 8P","7m 8P 10m 12d"],"7b9":["3M 6m 7m 9m","7m 9m 10M 13m"],"7b13":["3M 6m 7m 9m","7m 9m 10M 13m"],o7:["1P 3m 5d 6M","5d 6M 8P 10m"],"7#11":["7m 9M 11A 13A"],"7#9":["3M 7m 9A"],mM7:["3m 5P 7M 9M","7M 9M 10m 12P"],m6:["3m 5P 6M 9M","6M 9M 10m 12P"]},It=Jt;function Ro(t,e=It){if(e[t])return e[t];const{aliases:n}=en.get("C"+t),r=Object.keys(e).find(o=>n.includes(o))||"";if(r!==void 0)return e[r]}var ve={lookup:Ro,lefthand:Jt,triads:mn,all:Oo,defaultDictionary:It},Lo=["C3","C5"];function ye(t,e=Lo,n=ve.triads){const[r,o]=en.tokenize(t),i=ve.lookup(o,n);if(!i)return[];const s=i.map(c=>c.split(" ")),a=jo.chromatic(e);return s.reduce((c,p)=>{const l=p.map(h=>qr.subtract(h,p[0])||""),d=O.transpose(r,p[0]),m=a.filter(h=>O.chroma(h)===O.chroma(d)).filter(h=>(O.midi(O.transpose(h,l[l.length-1]))||0)<=(O.midi(e[1])||0)).map(h=>O.enharmonic(h,d)).map(h=>l.map(y=>O.transpose(h,y)));return c.concat(m)},[])}const Lt={C:0,"C#":1,Db:1,D:2,"D#":3,Eb:3,E:4,F:5,"F#":6,Gb:6,G:7,"G#":8,Ab:8,A:9,"A#":10,Bb:10,B:11},Yt=t=>({C:60,"C#":61,Db:61,D:62,"D#":63,Eb:63,E:64,F:65,"F#":66,Gb:66,G:67,"G#":68,Ab:68,A:69,"A#":70,Bb:70,B:71})[t]||60,Do={maj:"maj",m:"m",m7:"m7",maj7:"maj7",m7b5:"m7b5",dim7:"dim7",aug:"aug",mMaj7:"mMaj7"},Vo=(t,e)=>{if(!Array.isArray(t)||!e)return null;const n=Yt(e),r=t.map(o=>Kt(o)).filter(o=>typeof o=="number"&&isFinite(o)).map(o=>o-n).sort((o,i)=>o-i);return r.length>0?r:null},be=t=>[`${t}2`,`${t}6`],Ho=t=>t==="open-triad"?mn:t==="shell-dominant"||t==="altered-dominant"?Jt:It,Fo=(t,e,n)=>{if(!Array.isArray(t)||t.length===0)return null;const r=Yt(n)+5,o=t.map(s=>{const a=s.map(l=>Kt(l)).filter(l=>typeof l=="number"&&isFinite(l));if(a.length===0)return null;const c=a.reduce((l,d)=>l+d,0)/a.length,p=Math.max(...a)-Math.min(...a);return{notes:s,avg:c,span:p}}).filter(Boolean);if(o.length===0)return null;o.sort((s,a)=>{const c=Math.abs(s.avg-r),p=Math.abs(a.avg-r);return c!==p?c-p:s.span-a.span});const i=o.slice(0,Math.min(6,o.length));return e==="spread"||e==="octave"?i.slice().sort((s,a)=>a.span-s.span)[0].notes:e==="drop2"||e==="first-inversion"?i[Math.min(1,i.length-1)].notes:e==="drop3"||e==="second-inversion"?i[Math.min(2,i.length-1)].notes:e==="third-inversion"?i[Math.min(3,i.length-1)].notes:i[0].notes},Uo=(t,e,n)=>{if(!n||!n.root||!n.type)return null;const r=Do[n.type]||n.type,o=`${n.root}${r}`,i=N(o);if(!i||i.empty)return null;const s=Ho(e);let a=ye(o,be(n.root),s);(!Array.isArray(a)||a.length===0)&&(a=ye(o,be(n.root),It));const c=Fo(a,e,n.root);return Vo(c,n.root)},zo=(t,e,n=null)=>{const r=Uo(t,e,n);return Array.isArray(r)&&r.length>0?r:t},Q=t=>typeof t!="number"||isNaN(t)?"--":((t%12+12)%12).toString(16).toUpperCase().padStart(2,"0"),qo={maj:[0,4,7],min:[0,3,7],m:[0,3,7],dim:[0,3,6],aug:[0,4,8],"+":[0,4,8],7:[0,4,7,10],m7:[0,3,7,10],min7:[0,3,7,10],maj7:[0,4,7,11],M7:[0,4,7,11],sus2:[0,2,7],sus4:[0,5,7],6:[0,4,7,9],m6:[0,3,7,9],9:[0,4,7,10,14],m9:[0,3,7,10,14],maj9:[0,4,7,11,14],11:[0,4,7,10,14,17],13:[0,4,7,10,14,21],add9:[0,4,7,14],add11:[0,4,7,10,14],add13:[0,4,7,10,14,21],sus:[0,5,7],5:[0,7],madd9:[0,3,7,14],maj6:[0,4,7,9],min9:[0,3,7,10,14],min11:[0,3,7,10,14,17],min13:[0,3,7,10,14,21],"7alt":[0,4,7,10,13,15,18,20],ø7:[0,3,6,10],m7b5:[0,3,6,10],dim7:[0,3,6,9],"maj7#5":[0,4,8,11],mMaj7:[0,3,7,11],add2:[0,2,4,7],add4:[0,4,5,7],add6:[0,4,7,9],"7b9":[0,4,7,10,13],"7#9":[0,4,7,10,15],"7b5":[0,4,6,10],"7#5":[0,4,8,10],"9b5":[0,4,6,10,14],"9#5":[0,4,8,10,14],"13b9":[0,4,7,10,13,21],"13#9":[0,4,7,10,15,21]},ht={"":"maj",major:"maj",min:"m",minor:"m","-":"m",Δ:"maj7",Δ7:"maj7",M7:"maj7",min7:"m7",ø:"m7b5",ø7:"m7b5","°7":"dim7",o7:"dim7","+":"aug",mM7:"mMaj7",mmaj7:"mMaj7"},Go={maj:["","maj"],m:["m","min"],maj7:["maj7","M7"],m7:["m7","min7"],m7b5:["m7b5","ø7"],aug:["aug","+"],mMaj7:["mMaj7","mM7"]},Wo={maj:["maj"],m:["m","min"],maj7:["maj7","M7"],m7:["m7","min7"],m7b5:["m7b5","ø7"],aug:["aug","+"],mMaj7:["mMaj7"]},Ko=t=>{if(!t)return null;const e=t.charAt(0).toUpperCase();if(!/[A-G]/.test(e))return null;const n=t.slice(1).replace(/♯/g,"#").replace(/♭/g,"b").replace(/B/g,"b");return["","#","b"].includes(n)?e+n:null},Xo=t=>{let e=(t||"").trim().replace(/\s+/g,"");e=e.replace(/major/i,"major").replace(/minor/i,"minor").replace(/maj/i,"maj").replace(/min/i,"min").replace(/dim/i,"dim").replace(/aug/i,"aug").replace(/sus/i,"sus").replace(/add/i,"add");const n=e.match(/^\((.+)\)$/)?.[1]||e;return Object.prototype.hasOwnProperty.call(ht,e)?ht[e]:Object.prototype.hasOwnProperty.call(ht,n)?ht[n]:n||"maj"},un=(t,e)=>{const n=t[e]||[e],r=[];return n.forEach(o=>{typeof o=="string"&&o.length>=0&&!r.includes(o)&&r.push(o)}),r},Jo=(t,e)=>{const n=un(Go,e);for(let r=0;r<n.length;r++){const o=n[r],i=`${t}${o}`,s=N(i);if(!s||s.empty||!Array.isArray(s.intervals))continue;const a=s.intervals.map(c=>Xe(c)).filter(c=>typeof c=="number"&&isFinite(c));if(a.length>0)return{intervalOnly:a,type:o===""?"maj":o}}return null},Yo=t=>{const e=un(Wo,t);for(let n=0;n<e.length;n++){const r=e[n],o=qo[r];if(Array.isArray(o)&&o.length>0)return{intervalOnly:o.slice(),type:r}}return null},hn=t=>{if(typeof t!="string")return null;const e=t.trim();if(!e)return null;const n=e.match(/^[A-Ga-g][bB#♭♯]?/);if(!n)return null;const r=Ko(n[0]);if(!r||typeof Lt[r]!="number")return null;const o=Xo(e.slice(n[0].length)),s=Jo(r,o)||Yo(o);if(!s)return null;const a=s.intervalOnly,c=s.type,p=Lt[r],l=a.map(u=>Q(u+p)),d=a.map(u=>Q(u));return{chordName:e,root:r,type:c,rootBaked:l,intervalOnlyHex:d,intervalOnly:a}};function Qo(t){const e=[],n={};return t.forEach((o,i)=>{const s=o.intervalOnly.join("-");n[s]||(e.push(s),n[s]={typeKey:s,chords:[],intervalOnlyHex:o.intervalOnlyHex.slice()}),n[s].chords.push(o.chordName)}),e.map(o=>n[o])}const Zo=(t,e)=>{const o=t.split(/[\s,]+/).filter(a=>a.length>0).map(hn).filter(a=>a!==null).map(a=>{const c=zo(a.intervalOnly,e,a),p=Array.isArray(c)?c:[];return{...a,intervalOnly:p,intervalOnlyHex:p.map(Q),rootBaked:p.map(l=>Q(l+(Lt[a.root]||0)))}}).filter(a=>typeof a.chordName=="string");o.length>0&&o.map(a=>a.chordName).join(" ")+"";let s=Qo(o).map((a,c)=>({index:c,chords:Array.isArray(a.chords)?a.chords:[],interval:Array.isArray(a.intervalOnlyHex)?a.intervalOnlyHex:[]}));return{inputChordNames:o.map(a=>a.chordName),uniqueGroups:s,voicing:e,chords:o}};function ti(t){const r=new Set([1,3,6,8,10]),o=13,i=50,s=8,a=30,p=22*o,l=i+13;let d=0;const u={},m={};for(let f=48;f<=84;f++){const g=(f-48)%12;r.has(g)||(u[f]=d*o,d++)}for(let f=48;f<=84;f++){const g=(f-48)%12;if(r.has(g)){const P=f-1;u[P]!==void 0&&(m[f]=u[P]+o-Math.floor(s/2))}}const h=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],y=new Set(t),M=`kg${Math.random().toString(36).slice(2,7)}`,b=[`<defs><filter id="${M}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`,`<svg class="chord-keyboard-svg" width="${p}" height="${l}" viewBox="0 0 ${p} ${l}" xmlns="http://www.w3.org/2000/svg">`];for(let f=48;f<=84;f++){const g=(f-48)%12;if(r.has(g))continue;const P=u[f],S=y.has(f);b.push(`<rect x="${P}" y="0" width="${o-1}" height="${i}" rx="2" fill="${S?"var(--key-active)":"var(--key-white)"}" stroke="${S?"var(--accent-dim)":"#1a3a4a"}" stroke-width="1" ${S?`filter="url(#${M})"`:""}/>`),S&&b.push(`<text x="${P+(o-1)/2}" y="${i+10}" text-anchor="middle" font-size="7" font-family="'Share Tech Mono',monospace" fill="var(--accent)">${h[g]}</text>`)}for(let f=48;f<=84;f++){const g=(f-48)%12;if(!r.has(g)||m[f]===void 0)continue;const P=m[f],S=y.has(f);b.push(`<rect x="${P}" y="0" width="${s}" height="${a}" rx="1" fill="${S?"var(--key-active)":"var(--key-black)"}" stroke="${S?"var(--accent)":"#0a1825"}" stroke-width="1" ${S?`filter="url(#${M})"`:""}/>`),S&&b.push(`<text x="${P+s/2}" y="${a+9}" text-anchor="middle" font-size="6" font-family="'Share Tech Mono',monospace" fill="var(--accent)">${h[g]}</text>`)}return b.push("</svg>"),b[0]+b.slice(1).join("")}function ei(t,e){const o=new Set;for(let i=-24;i<=24;i+=12)for(const s of t){const a=e+s+i;a>=48&&a<=84&&o.add(a)}return Array.from(o).sort((i,s)=>i-s)}function ni(t){if(t.length<=4)return[t];const n=[];for(let r=0;r<=t.length-4;r++)n.push(t.slice(r,r+4));return n}var yt=globalThis,Qt=yt.ShadowRoot&&(yt.ShadyCSS===void 0||yt.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Zt=Symbol(),Me=new WeakMap,pn=class{constructor(t,e,n){if(this._$cssResult$=!0,n!==Zt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(Qt&&t===void 0){let n=e!==void 0&&e.length===1;n&&(t=Me.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),n&&Me.set(e,t))}return t}toString(){return this.cssText}},ri=t=>new pn(typeof t=="string"?t:t+"",void 0,Zt),oi=(t,...e)=>new pn(t.length===1?t[0]:e.reduce((n,r,o)=>n+(i=>{if(i._$cssResult$===!0)return i.cssText;if(typeof i=="number")return i;throw Error("Value passed to 'css' function must be a 'css' function result: "+i+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+t[o+1],t[0]),t,Zt),ii=(t,e)=>{if(Qt)t.adoptedStyleSheets=e.map(n=>n instanceof CSSStyleSheet?n:n.styleSheet);else for(let n of e){let r=document.createElement("style"),o=yt.litNonce;o!==void 0&&r.setAttribute("nonce",o),r.textContent=n.cssText,t.appendChild(r)}},Pe=Qt?t=>t:t=>t instanceof CSSStyleSheet?(e=>{let n="";for(let r of e.cssRules)n+=r.cssText;return ri(n)})(t):t,{is:ai,defineProperty:si,getOwnPropertyDescriptor:li,getOwnPropertyNames:ci,getOwnPropertySymbols:di,getPrototypeOf:mi}=Object,_t=globalThis,xe=_t.trustedTypes,ui=xe?xe.emptyScript:"",hi=_t.reactiveElementPolyfillSupport,at=(t,e)=>t,xt={toAttribute(t,e){switch(e){case Boolean:t=t?ui:null;break;case Object:case Array:t=t==null?t:JSON.stringify(t)}return t},fromAttribute(t,e){let n=t;switch(e){case Boolean:n=t!==null;break;case Number:n=t===null?null:Number(t);break;case Object:case Array:try{n=JSON.parse(t)}catch{n=null}}return n}},te=(t,e)=>!ai(t,e),$e={attribute:!0,type:String,converter:xt,reflect:!1,useDefault:!1,hasChanged:te};Symbol.metadata??=Symbol("metadata"),_t.litPropertyMetadata??=new WeakMap;var K=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=$e){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(t,n,e);r!==void 0&&si(this.prototype,t,r)}}static getPropertyDescriptor(t,e,n){let{get:r,set:o}=li(this.prototype,t)??{get(){return this[e]},set(i){this[e]=i}};return{get:r,set(i){let s=r?.call(this);o?.call(this,i),this.requestUpdate(t,s,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??$e}static _$Ei(){if(this.hasOwnProperty(at("elementProperties")))return;let t=mi(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(at("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(at("properties"))){let e=this.properties,n=[...ci(e),...di(e)];for(let r of n)this.createProperty(r,e[r])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[n,r]of e)this.elementProperties.set(n,r)}this._$Eh=new Map;for(let[e,n]of this.elementProperties){let r=this._$Eu(e,n);r!==void 0&&this._$Eh.set(r,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let n=new Set(t.flat(1/0).reverse());for(let r of n)e.unshift(Pe(r))}else t!==void 0&&e.push(Pe(t));return e}static _$Eu(t,e){let n=e.attribute;return n===!1?void 0:typeof n=="string"?n:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let n of e.keys())this.hasOwnProperty(n)&&(t.set(n,this[n]),delete this[n]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ii(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,n){this._$AK(t,n)}_$ET(t,e){let n=this.constructor.elementProperties.get(t),r=this.constructor._$Eu(t,n);if(r!==void 0&&n.reflect===!0){let o=(n.converter?.toAttribute===void 0?xt:n.converter).toAttribute(e,n.type);this._$Em=t,o==null?this.removeAttribute(r):this.setAttribute(r,o),this._$Em=null}}_$AK(t,e){let n=this.constructor,r=n._$Eh.get(t);if(r!==void 0&&this._$Em!==r){let o=n.getPropertyOptions(r),i=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute===void 0?xt:o.converter;this._$Em=r;let s=i.fromAttribute(e,o.type);this[r]=s??this._$Ej?.get(r)??s,this._$Em=null}}requestUpdate(t,e,n,r=!1,o){if(t!==void 0){let i=this.constructor;if(r===!1&&(o=this[t]),n??=i.getPropertyOptions(t),!((n.hasChanged??te)(o,e)||n.useDefault&&n.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(i._$Eu(t,n))))return;this.C(t,e,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:n,reflect:r,wrapped:o},i){n&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,i??e??this[t]),o!==!0||i!==void 0)||(this._$AL.has(t)||(this.hasUpdated||n||(e=void 0),this._$AL.set(t,e)),r===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[r,o]of this._$Ep)this[r]=o;this._$Ep=void 0}let n=this.constructor.elementProperties;if(n.size>0)for(let[r,o]of n){let{wrapped:i}=o,s=this[r];i!==!0||this._$AL.has(r)||s===void 0||this.C(r,void 0,o,s)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(e)):this._$EM()}catch(n){throw t=!1,this._$EM(),n}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};K.elementStyles=[],K.shadowRootOptions={mode:"open"},K[at("elementProperties")]=new Map,K[at("finalized")]=new Map,hi?.({ReactiveElement:K}),(_t.reactiveElementVersions??=[]).push("2.1.2");var ee=globalThis,Ae=t=>t,$t=ee.trustedTypes,Se=$t?$t.createPolicy("lit-html",{createHTML:t=>t}):void 0,fn="$lit$",R=`lit$${Math.random().toFixed(9).slice(2)}$`,gn="?"+R,pi=`<${gn}>`,G=document,ct=()=>G.createComment(""),dt=t=>t===null||typeof t!="object"&&typeof t!="function",ne=Array.isArray,fi=t=>ne(t)||typeof t?.[Symbol.iterator]=="function",Ot=`[ 	
\f\r]`,rt=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Ee=/-->/g,we=/>/g,H=RegExp(`>|${Ot}(?:([^\\s"'>=/]+)(${Ot}*=${Ot}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Ce=/'/g,Ie=/"/g,vn=/^(?:script|style|textarea|title)$/i,v=(t=>(e,...n)=>({_$litType$:t,strings:e,values:n}))(1),Z=Symbol.for("lit-noChange"),C=Symbol.for("lit-nothing"),_e=new WeakMap,U=G.createTreeWalker(G,129);function yn(t,e){if(!ne(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return Se===void 0?e:Se.createHTML(e)}var gi=(t,e)=>{let n=t.length-1,r=[],o,i=e===2?"<svg>":e===3?"<math>":"",s=rt;for(let a=0;a<n;a++){let c=t[a],p,l,d=-1,u=0;for(;u<c.length&&(s.lastIndex=u,l=s.exec(c),l!==null);)u=s.lastIndex,s===rt?l[1]==="!--"?s=Ee:l[1]===void 0?l[2]===void 0?l[3]!==void 0&&(s=H):(vn.test(l[2])&&(o=RegExp("</"+l[2],"g")),s=H):s=we:s===H?l[0]===">"?(s=o??rt,d=-1):l[1]===void 0?d=-2:(d=s.lastIndex-l[2].length,p=l[1],s=l[3]===void 0?H:l[3]==='"'?Ie:Ce):s===Ie||s===Ce?s=H:s===Ee||s===we?s=rt:(s=H,o=void 0);let m=s===H&&t[a+1].startsWith("/>")?" ":"";i+=s===rt?c+pi:d>=0?(r.push(p),c.slice(0,d)+fn+c.slice(d)+R+m):c+R+(d===-2?a:m)}return[yn(t,i+(t[n]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),r]},Dt=class bn{constructor({strings:e,_$litType$:n},r){let o;this.parts=[];let i=0,s=0,a=e.length-1,c=this.parts,[p,l]=gi(e,n);if(this.el=bn.createElement(p,r),U.currentNode=this.el.content,n===2||n===3){let d=this.el.content.firstChild;d.replaceWith(...d.childNodes)}for(;(o=U.nextNode())!==null&&c.length<a;){if(o.nodeType===1){if(o.hasAttributes())for(let d of o.getAttributeNames())if(d.endsWith(fn)){let u=l[s++],m=o.getAttribute(d).split(R),h=/([.?@])?(.*)/.exec(u);c.push({type:1,index:i,name:h[2],strings:m,ctor:h[1]==="."?yi:h[1]==="?"?bi:h[1]==="@"?Mi:Bt}),o.removeAttribute(d)}else d.startsWith(R)&&(c.push({type:6,index:i}),o.removeAttribute(d));if(vn.test(o.tagName)){let d=o.textContent.split(R),u=d.length-1;if(u>0){o.textContent=$t?$t.emptyScript:"";for(let m=0;m<u;m++)o.append(d[m],ct()),U.nextNode(),c.push({type:2,index:++i});o.append(d[u],ct())}}}else if(o.nodeType===8)if(o.data===gn)c.push({type:2,index:i});else{let d=-1;for(;(d=o.data.indexOf(R,d+1))!==-1;)c.push({type:7,index:i}),d+=R.length-1}i++}}static createElement(e,n){let r=G.createElement("template");return r.innerHTML=e,r}};function tt(t,e,n=t,r){if(e===Z)return e;let o=r===void 0?n._$Cl:n._$Co?.[r],i=dt(e)?void 0:e._$litDirective$;return o?.constructor!==i&&(o?._$AO?.(!1),i===void 0?o=void 0:(o=new i(t),o._$AT(t,n,r)),r===void 0?n._$Cl=o:(n._$Co??=[])[r]=o),o!==void 0&&(e=tt(t,o._$AS(t,e.values),o,r)),e}var vi=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:n}=this._$AD,r=(t?.creationScope??G).importNode(e,!0);U.currentNode=r;let o=U.nextNode(),i=0,s=0,a=n[0];for(;a!==void 0;){if(i===a.index){let c;a.type===2?c=new re(o,o.nextSibling,this,t):a.type===1?c=new a.ctor(o,a.name,a.strings,this,t):a.type===6&&(c=new Pi(o,this,t)),this._$AV.push(c),a=n[++s]}i!==a?.index&&(o=U.nextNode(),i++)}return U.currentNode=G,r}p(t){let e=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(t[e]):(n._$AI(t,n,e),e+=n.strings.length-2)),e++}},re=class Mn{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,n,r,o){this.type=2,this._$AH=C,this._$AN=void 0,this._$AA=e,this._$AB=n,this._$AM=r,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,n=this._$AM;return n!==void 0&&e?.nodeType===11&&(e=n.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,n=this){e=tt(this,e,n),dt(e)?e===C||e==null||e===""?(this._$AH!==C&&this._$AR(),this._$AH=C):e!==this._$AH&&e!==Z&&this._(e):e._$litType$===void 0?e.nodeType===void 0?fi(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==C&&dt(this._$AH)?this._$AA.nextSibling.data=e:this.T(G.createTextNode(e)),this._$AH=e}$(e){let{values:n,_$litType$:r}=e,o=typeof r=="number"?this._$AC(e):(r.el===void 0&&(r.el=Dt.createElement(yn(r.h,r.h[0]),this.options)),r);if(this._$AH?._$AD===o)this._$AH.p(n);else{let i=new vi(o,this),s=i.u(this.options);i.p(n),this.T(s),this._$AH=i}}_$AC(e){let n=_e.get(e.strings);return n===void 0&&_e.set(e.strings,n=new Dt(e)),n}k(e){ne(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,o=0;for(let i of e)o===n.length?n.push(r=new Mn(this.O(ct()),this.O(ct()),this,this.options)):r=n[o],r._$AI(i),o++;o<n.length&&(this._$AR(r&&r._$AB.nextSibling,o),n.length=o)}_$AR(e=this._$AA.nextSibling,n){for(this._$AP?.(!1,!0,n);e!==this._$AB;){let r=Ae(e).nextSibling;Ae(e).remove(),e=r}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},Bt=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,n,r,o){this.type=1,this._$AH=C,this._$AN=void 0,this.element=t,this.name=e,this._$AM=r,this.options=o,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=C}_$AI(t,e=this,n,r){let o=this.strings,i=!1;if(o===void 0)t=tt(this,t,e,0),i=!dt(t)||t!==this._$AH&&t!==Z,i&&(this._$AH=t);else{let s=t,a,c;for(t=o[0],a=0;a<o.length-1;a++)c=tt(this,s[n+a],e,a),c===Z&&(c=this._$AH[a]),i||=!dt(c)||c!==this._$AH[a],c===C?t=C:t!==C&&(t+=(c??"")+o[a+1]),this._$AH[a]=c}i&&!r&&this.j(t)}j(t){t===C?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},yi=class extends Bt{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===C?void 0:t}},bi=class extends Bt{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==C)}},Mi=class extends Bt{constructor(t,e,n,r,o){super(t,e,n,r,o),this.type=5}_$AI(t,e=this){if((t=tt(this,t,e,0)??C)===Z)return;let n=this._$AH,r=t===C&&n!==C||t.capture!==n.capture||t.once!==n.once||t.passive!==n.passive,o=t!==C&&(n===C||r);r&&this.element.removeEventListener(this.name,this,n),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},Pi=class{constructor(t,e,n){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(t){tt(this,t)}},xi=ee.litHtmlPolyfillSupport;xi?.(Dt,re),(ee.litHtmlVersions??=[]).push("3.3.3");var $i=(t,e,n)=>{let r=n?.renderBefore??e,o=r._$litPart$;if(o===void 0){let i=n?.renderBefore??null;r._$litPart$=o=new re(e.insertBefore(ct(),i),i,void 0,n??{})}return o._$AI(t),o},oe=globalThis,st=class extends K{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=$i(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return Z}};st._$litElement$=!0,st.finalized=!0,oe.litElementHydrateSupport?.({LitElement:st});var Ai=oe.litElementPolyfillSupport;Ai?.({LitElement:st}),(oe.litElementVersions??=[]).push("4.2.2");var Si=t=>(e,n)=>{n===void 0?customElements.define(t,e):n.addInitializer(()=>{customElements.define(t,e)})},Ei={attribute:!0,type:String,converter:xt,reflect:!1,hasChanged:te},wi=(t=Ei,e,n)=>{let{kind:r,metadata:o}=n,i=globalThis.litPropertyMetadata.get(o);if(i===void 0&&globalThis.litPropertyMetadata.set(o,i=new Map),r==="setter"&&((t=Object.create(t)).wrapped=!0),i.set(n.name,t),r==="accessor"){let{name:s}=n;return{set(a){let c=e.get.call(this);e.set.call(this,a),this.requestUpdate(s,c,t,!0,a)},init(a){return a!==void 0&&this.C(s,void 0,t,a),a}}}if(r==="setter"){let{name:s}=n;return function(a){let c=this[s];e.call(this,a),this.requestUpdate(s,c,t,!0,a)}}throw Error("Unsupported decorator location: "+r)};function w(t){return(e,n)=>typeof n=="object"?wi(t,e,n):((r,o,i)=>{let s=o.hasOwnProperty(i);return o.constructor.createProperty(i,r),s?Object.getOwnPropertyDescriptor(o,i):void 0})(t,e,n)}function E(t,e,n,r){var o=arguments.length,i=o<3?e:r,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")i=Reflect.decorate(t,e,n,r);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(i=(o<3?s(i):o>3?s(e,n,i):s(e,n))||i);return o>3&&i&&Object.defineProperty(e,n,i),i}function Ci(t){try{let e=JSON.stringify(t);return btoa(e).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}catch(e){return console.error("Failed to encode progression",e),""}}function Ii(t){try{let e=t.replace(/-/g,"+").replace(/_/g,"/");for(;e.length%4;)e+="=";let n=atob(e);return JSON.parse(n)}catch(e){return console.error("Failed to decode progression",e),null}}var Pn=[{label:"Major",value:"maj"},{label:"Minor",value:"m"},{label:"Suspended (Sus)",value:"sus4"},{label:"Diminished",value:"dim"}],xn=[{label:"None",value:""},{label:"6th",value:"6"},{label:"Minor 7th (m7)",value:"7"},{label:"Major 7th (M7)",value:"maj7"},{label:"9th",value:"9"}];function $n(t,e){if(t==="maj"){if(e==="")return"";if(e==="6")return"6";if(e==="7")return"7";if(e==="maj7")return"maj7";if(e==="9")return"9"}if(t==="m"){if(e==="")return"m";if(e==="6")return"m6";if(e==="7")return"m7";if(e==="maj7")return"mM7";if(e==="9")return"m9"}if(t==="sus4"){if(e==="")return"sus4";if(e==="6")return"6sus4";if(e==="7")return"7sus4";if(e==="maj7")return"maj7sus4";if(e==="9")return"9sus4"}if(t==="dim"){if(e==="")return"dim";if(e==="6")return"dim6";if(e==="7")return"m7b5";if(e==="maj7")return"dimMaj7";if(e==="9")return"dim9"}return t+e}var x=class extends st{constructor(...t){super(...t),this.heading="Human Engine",this.chordSequence="Cmaj7 Dm7 G7 Cmaj",this.hideInput=!1,this.spread=.6,this.duration=1,this.minVelocity=60,this.maxVelocity=110,this.humanVariance=.6,this.microTiming=.3,this.bpm=80,this.arpMode="off",this.arpRate="1/16",this.arpRange=1,this.debugExpanded=!0,this.arpExpanded=!0,this.showInfo=!1,this.mode="advanced",this.humanSlider=.5}static get styles(){return oi`
    :host {
      /* Theme Tokens - Host applications can override these CSS custom properties */
      --hp-bg: var(--human-bg, #1a1a24);
      --hp-surface: var(--human-surface, #242530);
      --hp-border: var(--human-border, #3b3c4f);
      --hp-text-primary: var(--human-text-primary, #f5f5f7);
      --hp-text-secondary: var(--human-text-secondary, #a3a6be);
      --hp-accent: var(--human-accent, #ff9f43);
      --hp-accent-hover: var(--human-accent-hover, #ffb067);
      --hp-radius: var(--human-radius, 12px);
      --hp-font-family: var(--human-font, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif);

      display: block;
      width: 100%;
      min-width: 360px;
      max-width: 400px;
      background: var(--hp-bg);
      color: var(--hp-text-primary);
      font-family: var(--hp-font-family);
      border-radius: var(--hp-radius);
      border: 1px solid var(--hp-border);
      box-sizing: border-box;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }

    * {
      box-sizing: border-box;
    }

    .panel-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--hp-border);
      background: var(--hp-surface);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .panel-header h2 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      letter-spacing: -0.01em;
    }

    .info-toggle-btn {
      background: transparent;
      border: 1px solid var(--hp-border);
      color: var(--hp-text-secondary);
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 0.75rem;
      font-weight: 600;
      transition: all 0.2s;
      padding: 0;
      outline: none;
    }
    .info-toggle-btn:hover {
      color: var(--hp-accent);
      border-color: var(--hp-accent);
    }
    .info-toggle-btn.active {
      background: var(--hp-accent);
      color: #ffffff;
      border-color: var(--hp-accent);
    }

    .panel-subheader {
      padding: 12px 20px;
      background: rgba(0, 0, 0, 0.15);
      border-bottom: 1px solid var(--hp-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .mode-tabs {
      display: flex;
      background: var(--hp-surface);
      padding: 2px;
      border-radius: 6px;
      border: 1px solid var(--hp-border);
    }

    .tab-btn {
      background: transparent;
      border: none;
      color: var(--hp-text-secondary);
      padding: 6px 12px;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .tab-btn:hover {
      color: var(--hp-text-primary);
    }

    .tab-btn.active {
      background: var(--hp-accent);
      color: #ffffff;
    }

    .reset-btn {
      background: transparent;
      border: 1px solid var(--hp-border);
      color: var(--hp-text-secondary);
      padding: 6px 12px;
      font-size: 0.75rem;
      font-weight: 500;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .reset-btn:hover {
      background: rgba(255, 255, 255, 0.05);
      color: var(--hp-text-primary);
      border-color: var(--hp-text-secondary);
    }

    .panel-content {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    .control-group {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .group-header-row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      border-bottom: 1px solid var(--hp-border);
      padding-bottom: 8px;
      gap: 12px;
    }

    .group-header-row.collapsible {
      cursor: pointer;
      user-select: none;
      border-radius: 4px;
      margin-bottom: -4px;
      transition: background 0.15s;
    }

    .group-header-row.collapsible:hover {
      background: rgba(255, 255, 255, 0.04);
    }

    .group-title {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--hp-text-secondary);
      font-weight: 700;
      margin: 0;
    }

    .group-explanation {
      font-size: 0.7rem;
      color: var(--hp-text-secondary);
      opacity: 0.75;
      font-style: italic;
      font-weight: normal;
    }

    .collapse-chevron {
      margin-left: auto;
      color: var(--hp-text-secondary);
      opacity: 0.6;
      transition: transform 0.2s ease;
      display: flex;
      align-items: center;
    }

    .collapse-chevron.open {
      transform: rotate(0deg);
    }

    .collapse-chevron.closed {
      transform: rotate(-90deg);
    }

    .collapsible-body {
      display: flex;
      flex-direction: column;
      gap: 16px;
      overflow: hidden;
      transition: opacity 0.2s ease;
    }

    .collapsible-body.hidden {
      display: none;
    }

    .setting-explanation {
      font-size: 0.72rem;
      color: var(--hp-text-secondary);
      opacity: 0.85;
      line-height: 1.35;
      margin-top: 4px;
      padding-left: 2px;
    }

    .control-row {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .control-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 0.875rem;
    }

    .control-label {
      color: var(--hp-text-primary);
      font-weight: 500;
    }

    .control-value {
      color: var(--hp-accent);
      font-variant-numeric: tabular-nums;
      font-size: 0.75rem;
      font-weight: 600;
      background: rgba(59, 130, 246, 0.1); /* Subtle accent bg */
      padding: 2px 6px;
      border-radius: 4px;
    }

    /* Text Input Styling */
    input[type="text"] {
      width: 100%;
      background: var(--hp-surface);
      border: 1px solid var(--hp-border);
      color: var(--hp-text-primary);
      padding: 10px 12px;
      border-radius: 6px;
      font-family: inherit;
      font-size: 0.875rem;
      transition: all 0.2s ease-in-out;
    }

    input[type="text"]:focus {
      outline: none;
      border-color: var(--hp-accent);
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }

    input[type="text"]::placeholder {
      color: var(--hp-text-secondary);
      opacity: 0.6;
    }

    /* Select Dropdown Styling */
    select {
      width: 100%;
      background: var(--hp-surface);
      border: 1px solid var(--hp-border);
      color: var(--hp-text-primary);
      padding: 10px 12px;
      border-radius: 6px;
      font-family: inherit;
      font-size: 0.875rem;
      transition: all 0.2s ease-in-out;
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a3a6be' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      background-size: 16px;
      cursor: pointer;
    }

    select:focus {
      outline: none;
      border-color: var(--hp-accent);
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }

    /* Disabled State styling */
    select:disabled,
    input[type="range"]:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    
    input[type="range"]:disabled::-webkit-slider-thumb {
      cursor: not-allowed;
      background: var(--hp-text-secondary);
      transform: none;
    }

    input[type="range"]:disabled::-moz-range-thumb {
      cursor: not-allowed;
      background: var(--hp-text-secondary);
      transform: none;
    }

    /* Range Slider Styling */
    input[type="range"] {
      -webkit-appearance: none;
      width: 100%;
      background: transparent;
      padding: 8px 0; /* Increase touch target area */
      cursor: pointer;
    }

    input[type="range"]:focus {
      outline: none;
    }

    /* Webkit Slider Track */
    input[type="range"]::-webkit-slider-runnable-track {
      width: 100%;
      height: 4px;
      background: var(--hp-surface);
      border-radius: 2px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    /* Webkit Slider Thumb */
    input[type="range"]::-webkit-slider-thumb {
      border: 2px solid var(--hp-bg);
      height: 16px;
      width: 16px;
      border-radius: 50%;
      background: var(--hp-accent);
      -webkit-appearance: none;
      margin-top: -7px;
      transition: transform 0.1s, background-color 0.2s;
    }

    input[type="range"]::-webkit-slider-thumb:hover {
      background: var(--hp-accent-hover);
      transform: scale(1.1);
    }

    input[type="range"]:active::-webkit-slider-thumb {
      transform: scale(0.95);
    }

    /* Firefox Slider Track */
    input[type="range"]::-moz-range-track {
      width: 100%;
      height: 4px;
      background: var(--hp-surface);
      border-radius: 2px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    /* Firefox Slider Thumb */
    input[type="range"]::-moz-range-thumb {
      border: 2px solid var(--hp-bg);
      height: 16px;
      width: 16px;
      border-radius: 50%;
      background: var(--hp-accent);
      transition: transform 0.1s, background-color 0.2s;
    }

    input[type="range"]::-moz-range-thumb:hover {
      background: var(--hp-accent-hover);
      transform: scale(1.1);
    }

    input[type="range"]:active::-moz-range-thumb {
      transform: scale(0.95);
    }

    .preview-btn {
      width: 100%;
      background: var(--hp-accent);
      color: #ffffff;
      border: none;
      padding: 12px 16px;
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      box-shadow: 0 2px 10px rgba(59, 130, 246, 0.3);
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
    }

    .preview-btn:hover {
      background: var(--hp-accent-hover);
      transform: translateY(-1px);
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
    }

    .preview-btn:active {
      transform: translateY(1px);
      box-shadow: 0 1px 5px rgba(59, 130, 246, 0.3);
    }

    .preview-btn svg {
      width: 16px;
      height: 16px;
      fill: currentColor;
    }
  `}connectedCallback(){super.connectedCallback(),this.loadFromLocalStorage()}loadFromLocalStorage(){try{let t=localStorage.getItem("human-panel-state");if(t){let e=JSON.parse(t);e.chordSequence!==void 0&&(this.chordSequence=e.chordSequence),e.spread!==void 0&&(this.spread=e.spread),e.duration!==void 0&&(this.duration=e.duration),e.minVelocity!==void 0&&(this.minVelocity=e.minVelocity),e.maxVelocity!==void 0&&(this.maxVelocity=e.maxVelocity),e.humanVariance!==void 0&&(this.humanVariance=e.humanVariance),e.microTiming!==void 0&&(this.microTiming=e.microTiming),e.bpm!==void 0&&(this.bpm=e.bpm),e.arpMode!==void 0&&(this.arpMode=e.arpMode),e.arpRate!==void 0&&(this.arpRate=e.arpRate),e.arpRange!==void 0&&(this.arpRange=e.arpRange),e.mode!==void 0&&(this.mode=e.mode),e.humanSlider!==void 0&&(this.humanSlider=e.humanSlider),e.debugExpanded!==void 0&&(this.debugExpanded=e.debugExpanded)}}catch(t){console.error("Error loading state from localStorage:",t)}}saveToLocalStorage(){try{let t={chordSequence:this.chordSequence,spread:this.spread,duration:this.duration,minVelocity:this.minVelocity,maxVelocity:this.maxVelocity,humanVariance:this.humanVariance,microTiming:this.microTiming,bpm:this.bpm,arpMode:this.arpMode,arpRate:this.arpRate,arpRange:this.arpRange,mode:this.mode,humanSlider:this.humanSlider,debugExpanded:this.debugExpanded};localStorage.setItem("human-panel-state",JSON.stringify(t))}catch(t){console.error("Error saving state to localStorage:",t)}}emitChange(){this.saveToLocalStorage();let t={chordSequence:this.chordSequence,spread:this.spread,duration:this.duration,minVelocity:this.minVelocity,maxVelocity:this.maxVelocity,humanVariance:this.humanVariance,microTiming:this.microTiming,bpm:this.bpm,arpMode:this.arpMode,arpRate:this.arpRate,arpRange:this.arpRange};this.dispatchEvent(new CustomEvent("human-change",{detail:t,bubbles:!0,composed:!0}))}toggleInfo(){this.showInfo=!this.showInfo}handleTextChange(t){let e=t.target;this.chordSequence=e.value,this.emitChange()}handleNumberChange(t,e,n=!1){let r=e.target,o=n?parseInt(r.value,10):parseFloat(r.value);this[t]=o,t==="minVelocity"&&this.minVelocity>this.maxVelocity?this.maxVelocity=this.minVelocity:t==="maxVelocity"&&this.maxVelocity<this.minVelocity&&(this.minVelocity=this.maxVelocity),this.emitChange()}handleBasicSliderChange(t){let e=t.target,n=parseFloat(e.value);this.humanSlider=n,this.spread=parseFloat((n**1.2*1.5).toFixed(2)),this.humanVariance=parseFloat((n**1.1*1).toFixed(2)),this.microTiming=parseFloat((n**1.5*1.5).toFixed(2)),this.emitChange()}setMode(t){if(this.mode=t,t==="basic"){let e=(this.spread/1.5+this.humanVariance/1+this.microTiming/1.5)/3;this.humanSlider=Math.max(0,Math.min(1,e))}this.emitChange()}handleReset(){this.chordSequence="Cmaj7 Dm7 G7 Cmaj",this.spread=.6,this.duration=1,this.minVelocity=60,this.maxVelocity=110,this.humanVariance=.6,this.microTiming=.3,this.bpm=80,this.arpMode="off",this.arpRate="1/16",this.arpRange=1,this.mode="advanced",this.humanSlider=.5,this.debugExpanded=!0,this.emitChange()}handleBpmChange(t){let e=t.target;this.bpm=Math.max(40,Math.min(240,parseInt(e.value,10)||80)),this.emitChange()}handleArpModeChange(t){let e=t.target;this.arpMode=e.value,this.emitChange()}handleArpRateChange(t){let e=t.target;this.arpRate=e.value,this.emitChange()}handleArpRangeChange(t){let e=t.target;this.arpRange=parseInt(e.value,10),this.emitChange()}handlePreview(){let t={chordSequence:this.chordSequence,spread:this.spread,duration:this.duration,minVelocity:this.minVelocity,maxVelocity:this.maxVelocity,humanVariance:this.humanVariance,microTiming:this.microTiming,bpm:this.bpm,arpMode:this.arpMode,arpRate:this.arpRate,arpRange:this.arpRange};this.dispatchEvent(new CustomEvent("human-preview",{detail:t,bubbles:!0,composed:!0}))}toggleDebug(){this.debugExpanded=!this.debugExpanded,this.saveToLocalStorage()}render(){return v`
      <div class="panel-header">
        <h2>${this.heading}</h2>
        <button 
          class="info-toggle-btn ${this.showInfo?"active":""}" 
          @click=${this.toggleInfo} 
          title="Toggle explanations"
          aria-label="Toggle explanations"
        >
          ?
        </button>
      </div>

      <div class="panel-subheader">
        <div class="mode-tabs">
          <button 
            class="tab-btn ${this.mode==="basic"?"active":""}" 
            @click=${()=>this.setMode("basic")}
          >
            Basic
          </button>
          <button 
            class="tab-btn ${this.mode==="advanced"?"active":""}" 
            @click=${()=>this.setMode("advanced")}
          >
            Advanced
          </button>
        </div>
        <button class="reset-btn" @click=${this.handleReset} title="Reset to default settings">
          Reset
        </button>
      </div>

      <div class="panel-content">
        
        <!-- Section: Debug -->
        <div class="control-group">
          <div class="group-header-row" @click=${this.toggleDebug} style="cursor: pointer; user-select: none;">
            <h3 class="group-title" style="display: flex; align-items: center; gap: 8px;">
              <span>debug</span>
              ${this.showInfo?v`
                <span class="group-explanation" style="text-transform: none; font-weight: normal;">(test tools)</span>
              `:""}
            </h3>
            <span style="font-size: 0.65rem; color: var(--hp-text-secondary);">${this.debugExpanded?"▼":"▶"}</span>
          </div>
          
          ${this.debugExpanded?v`
            ${this.hideInput?"":v`
              <div class="control-row">
                <input 
                  type="text" 
                  .value=${this.chordSequence}
                  @input=${this.handleTextChange}
                  placeholder="e.g. Cmaj7 Dm7 G7 Cmaj"
                  aria-label="Chord Sequence"
                />
                ${this.showInfo?v`
                  <div class="setting-explanation">Type a space-separated sequence of chords to play and preview.</div>
                `:""}
              </div>
            `}
            
            <div class="control-row">
              <button class="preview-btn" @click=${this.handlePreview} aria-label="Preview Configuration">
                <svg viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Preview
              </button>
              ${this.showInfo?v`
                <div class="setting-explanation">Triggers immediate chord playback using your humanized settings.</div>
              `:""}
            </div>
          `:""}
        </div>

        ${this.mode==="basic"?v`
          <!-- Section: Basic Controls -->
          <div class="control-group">
            <div class="group-header-row">
              <h3 class="group-title">Basic Controls</h3>
              ${this.showInfo?v`
                <span class="group-explanation">(macro human feel)</span>
              `:""}
            </div>
            
            <!-- Human Feel -->
            <div class="control-row">
              <div class="control-header">
                <label class="control-label">Human Feel</label>
                <span class="control-value">${Math.round(this.humanSlider*100)}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="1" step="0.01" 
                .value=${this.humanSlider.toString()}
                @input=${this.handleBasicSliderChange}
                aria-label="Human Feel"
              />
              ${this.showInfo?v`
                <div class="setting-explanation">Adjusts overall human elements (spread, variance, micro-timing) simultaneously.</div>
              `:""}
            </div>
          </div>
        `:v`
          <!-- Section: Chord Gen Group -->
          <div class="control-group">
            <div class="group-header-row">
              <h3 class="group-title">Chord Gen Group</h3>
              ${this.showInfo?v`
                <span class="group-explanation">(strum & note length)</span>
              `:""}
            </div>
            
            <!-- Spread -->
            <div class="control-row">
              <div class="control-header">
                <label class="control-label">Spread</label>
                <span class="control-value">${this.spread.toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="0" max="2" step="0.01" 
                .value=${this.spread.toString()}
                @input=${t=>this.handleNumberChange("spread",t)}
                aria-label="Spread"
              />
              ${this.showInfo?v`
                <div class="setting-explanation">Staggers the start times of notes in the chord for an arpeggiated or strummed feel.</div>
              `:""}
            </div>

            <!-- Duration -->
            <div class="control-row">
              <div class="control-header">
                <label class="control-label">Duration</label>
                <span class="control-value">${this.duration.toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="0.1" max="2.0" step="0.01" 
                .value=${this.duration.toString()}
                @input=${t=>this.handleNumberChange("duration",t)}
                aria-label="Duration"
              />
              ${this.showInfo?v`
                <div class="setting-explanation">Controls the base length of the notes during playback.</div>
              `:""}
            </div>
          </div>

          <!-- Section: Dynamics Group -->
          <div class="control-group">
            <div class="group-header-row">
              <h3 class="group-title">Dynamics Group</h3>
              ${this.showInfo?v`
                <span class="group-explanation">(velocity & randomness)</span>
              `:""}
            </div>
            
            <!-- Min Velocity -->
            <div class="control-row">
              <div class="control-header">
                <label class="control-label">Min Velocity</label>
                <span class="control-value">${this.minVelocity}</span>
              </div>
              <input 
                type="range" 
                min="0" max="127" step="1" 
                .value=${this.minVelocity.toString()}
                @input=${t=>this.handleNumberChange("minVelocity",t,!0)}
                aria-label="Min Velocity"
              />
              ${this.showInfo?v`
                <div class="setting-explanation">The minimum MIDI velocity (volume) for chord notes.</div>
              `:""}
            </div>

            <!-- Max Velocity -->
            <div class="control-row">
              <div class="control-header">
                <label class="control-label">Max Velocity</label>
                <span class="control-value">${this.maxVelocity}</span>
              </div>
              <input 
                type="range" 
                min="0" max="127" step="1" 
                .value=${this.maxVelocity.toString()}
                @input=${t=>this.handleNumberChange("maxVelocity",t,!0)}
                aria-label="Max Velocity"
              />
              ${this.showInfo?v`
                <div class="setting-explanation">The maximum MIDI velocity (volume) for chord notes.</div>
              `:""}
            </div>

            <!-- Human Variance -->
            <div class="control-row">
              <div class="control-header">
                <label class="control-label">Human Variance</label>
                <span class="control-value">${this.humanVariance.toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="0" max="1" step="0.01" 
                .value=${this.humanVariance.toString()}
                @input=${t=>this.handleNumberChange("humanVariance",t)}
                aria-label="Human Variance"
              />
              ${this.showInfo?v`
                <div class="setting-explanation">Adds subtle random velocity and duration deviations.</div>
              `:""}
            </div>
          </div>

          <!-- Section: Timing Grid Group -->
          <div class="control-group">
            <div class="group-header-row">
              <h3 class="group-title">Timing Grid Group</h3>
              ${this.showInfo?v`
                <span class="group-explanation">(onset timing offsets)</span>
              `:""}
            </div>
            
            <!-- Micro-timing / Variation -->
            <div class="control-row">
              <div class="control-header">
                <label class="control-label">Micro-timing (Variation)</label>
                <span class="control-value">${this.microTiming.toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="0" max="2" step="0.01" 
                .value=${this.microTiming.toString()}
                @input=${t=>this.handleNumberChange("microTiming",t)}
                aria-label="Micro-timing Variation"
              />
              ${this.showInfo?v`
                <div class="setting-explanation">Shifts note onset times slightly early or late for human feel.</div>
              `:""}
            </div>
          </div>

          <!-- Section: Arpeggiator Group -->
          <div class="control-group">
            <div
              class="group-header-row collapsible"
              @click=${()=>{this.arpExpanded=!this.arpExpanded}}
              aria-expanded=${this.arpExpanded}
              role="button"
              tabindex="0"
              @keydown=${t=>{(t.key==="Enter"||t.key===" ")&&(t.preventDefault(),this.arpExpanded=!this.arpExpanded)}}
            >
              <h3 class="group-title">Arpeggiator</h3>
              ${this.showInfo?v`
                <span class="group-explanation">(arp engine & tempo)</span>
              `:""}
              <span class="collapse-chevron ${this.arpExpanded?"open":"closed"}">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 4L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </div>

            <div class="collapsible-body ${this.arpExpanded?"":"hidden"}">
              <!-- BPM -->
              <div class="control-row">
                <div class="control-header">
                  <label class="control-label">Tempo (BPM)</label>
                  <span class="control-value">${this.bpm} BPM</span>
                </div>
                <div style="display: flex; gap: 12px; align-items: center;">
                  <input 
                    type="range" 
                    min="40" max="240" step="1" 
                    .value=${this.bpm.toString()}
                    @input=${this.handleBpmChange}
                    aria-label="BPM Slider"
                    style="flex: 1;"
                  />
                  <input 
                    type="number" 
                    min="40" max="240" 
                    .value=${this.bpm.toString()}
                    @input=${this.handleBpmChange}
                    aria-label="BPM Input"
                    style="width: 70px; background: var(--hp-surface); border: 1px solid var(--hp-border); color: var(--hp-text-primary); padding: 8px 10px; border-radius: 6px; font-family: inherit; font-size: 0.875rem;"
                  />
                </div>
                ${this.showInfo?v`
                  <div class="setting-explanation">Controls the global tempo of the project in Beats Per Minute.</div>
                `:""}
              </div>

              <!-- Arp Mode -->
              <div class="control-row">
                <div class="control-header">
                  <label class="control-label">Arp Mode</label>
                </div>
                <select 
                  .value=${this.arpMode}
                  @change=${this.handleArpModeChange}
                  aria-label="Arp Mode"
                >
                  <option value="off">Off</option>
                  <option value="up">Up</option>
                  <option value="down">Down</option>
                  <option value="up-down">Up-Down</option>
                  <option value="random">Random</option>
                </select>
                ${this.showInfo?v`
                  <div class="setting-explanation">Determines the order in which the notes of the chord are played.</div>
                `:""}
              </div>

              <!-- Arp Rate / Division -->
              <div class="control-row">
                <div class="control-header">
                  <label class="control-label">Arp Rate / Division</label>
                </div>
                <select 
                  .value=${this.arpRate}
                  @change=${this.handleArpRateChange}
                  ?disabled=${this.arpMode==="off"}
                  aria-label="Arp Rate"
                >
                  <option value="1/4">1/4</option>
                  <option value="1/8">1/8</option>
                  <option value="1/16">1/16</option>
                  <option value="1/8T">1/8T (Triplet)</option>
                </select>
                ${this.showInfo?v`
                  <div class="setting-explanation">Rhythmic speed / subdivision division of the arpeggio notes.</div>
                `:""}
              </div>

              <!-- Octave Range -->
              <div class="control-row">
                <div class="control-header">
                  <label class="control-label">Octave Range</label>
                  <span class="control-value">${this.arpRange}</span>
                </div>
                <input 
                  type="range" 
                  min="1" max="4" step="1" 
                  .value=${this.arpRange.toString()}
                  @input=${this.handleArpRangeChange}
                  ?disabled=${this.arpMode==="off"}
                  aria-label="Octave Range"
                />
                ${this.showInfo?v`
                  <div class="setting-explanation">The number of octaves the arpeggio pattern repeats across.</div>
                `:""}
              </div>
            </div>
          </div>
        `}
      </div>
    `}};E([w({type:String})],x.prototype,"heading",void 0),E([w({type:String,attribute:"chord-sequence"})],x.prototype,"chordSequence",void 0),E([w({type:Boolean})],x.prototype,"hideInput",void 0),E([w({type:Number})],x.prototype,"spread",void 0),E([w({type:Number})],x.prototype,"duration",void 0),E([w({type:Number})],x.prototype,"minVelocity",void 0),E([w({type:Number})],x.prototype,"maxVelocity",void 0),E([w({type:Number})],x.prototype,"humanVariance",void 0),E([w({type:Number})],x.prototype,"microTiming",void 0),E([w({type:Number})],x.prototype,"bpm",void 0),E([w({type:String,attribute:"arp-mode"})],x.prototype,"arpMode",void 0),E([w({type:String,attribute:"arp-rate"})],x.prototype,"arpRate",void 0),E([w({type:Number,attribute:"arp-range"})],x.prototype,"arpRange",void 0),E([w({type:Boolean})],x.prototype,"debugExpanded",void 0),E([w({type:Boolean})],x.prototype,"arpExpanded",void 0),E([w({type:Boolean})],x.prototype,"showInfo",void 0),E([w({type:String})],x.prototype,"mode",void 0),E([w({type:Number})],x.prototype,"humanSlider",void 0),x=E([Si("human-panel")],x);const _i=Object.freeze(Object.defineProperty({__proto__:null,CHORD_CORES:Pn,CHORD_MODIFIERS:xn,get HumanPanel(){return x},decodeProgression:Ii,encodeProgression:Ci,getChordSuffix:$n},Symbol.toStringTag,{value:"Module"}));let mt=[],z=!1,k=[],F=[];const Bi=18;function Ti(t,e,n){let r=0,o=0,i=!1;t.addEventListener("pointerdown",a=>{r=a.clientX,o=k[e]??0,i=!0,t.classList.add("dragging"),t.setPointerCapture(a.pointerId)}),t.addEventListener("pointermove",a=>{if(!i)return;const c=a.clientX-r,p=Math.round(c/Bi),l=Be(o+p,0,n-1);l!==(k[e]??0)&&(k[e]=l,At(e,l))});const s=()=>{i=!1,t.classList.remove("dragging")};t.addEventListener("pointerup",s),t.addEventListener("pointercancel",s),t.addEventListener("wheel",a=>{a.preventDefault();const p=(Math.abs(a.deltaX)>Math.abs(a.deltaY)?a.deltaX:a.deltaY)>0?1:-1,l=k[e]??0,d=Be(l+p,0,n-1);d!==l&&(k[e]=d,At(e,d))},{passive:!1})}function Be(t,e,n){return Math.max(e,Math.min(n,t))}function At(t,e){const n=mt[t];if(!n)return;const r=F[t]??[],o=r[e]??r[0]??[],i=document.getElementById("chordKeyboardViz"+t);i&&(i.innerHTML=ti(o));const s=document.getElementById("hexBoxes"+t);s&&(s.innerHTML=o.map((a,c)=>{let p="",l="";if(z){const m=a-(n.midiRoot??60);p=Q(m),l=`Interval ${m} → ${p}`}else p=a.toString(16).toUpperCase().padStart(2,"0"),l=`MIDI ${a} → ${p}`;const d=j(a);return`<div class="hex-col"><span class="${z?"hex-box interval-mode":"hex-box"}" title="${l}" data-copy="${p}">${p}</span><span class="hex-note-name">${d}</span></div>`}).join(""))}const Ni=()=>{z=!z;const t=document.getElementById("intervalToggleBtn");t&&(z?(t.classList.remove("btn-muted"),t.classList.add("btn-primary")):(t.classList.remove("btn-primary"),t.classList.add("btn-muted"))),mt.forEach((e,n)=>At(n,k[n]??0))},An=(t,e,n)=>{const r=document.getElementById("outputBox"),o=document.getElementById("toggleOutputBoxBtn");r.style.display="block",o&&(o.innerHTML="CHORDS ▼",o.setAttribute("aria-expanded","true"),o.classList.remove("dimmed"));const i=document.getElementById("chordsInput").value,s=i.split(/[\s,]+/).filter(m=>m.length>0);n(s);const a=t(i,"closed");if(!a.chords||a.chords.length===0){document.getElementById("output").innerHTML='<div style="padding:16px;color:var(--text-dim);font-size:0.8rem;">NO VALID CHORDS FOUND</div>',$("No valid chords found.","error");const m=document.getElementById("playbackControls");m&&(m.style.display="none");const h=document.getElementById("intervalToggleContainer");h&&(h.style.display="none");return}const c=document.getElementById("playbackControls");c&&(c.style.display="flex");const p=document.getElementById("intervalToggleContainer");p&&(p.style.display="flex"),mt=a.chords,k=a.chords.map(()=>0),F=[];const l={};a.uniqueGroups.forEach((m,h)=>{m.chords.forEach(y=>{l[y]=h.toString(16).toUpperCase().padStart(2,"0")})}),a.chords.forEach(m=>{m.midiRoot=Yt(m.root);const h=ei(m.intervalOnly,m.midiRoot);F.push(ni(h))});let d='<div id="chord-list">';a.chords.forEach((m,h)=>{const y=l[m.chordName]??h.toString(16).toUpperCase().padStart(2,"0"),b=(F[h]?.[0]??[]).map(f=>{let g="",P="";if(z){const nt=f-(m.midiRoot??60);g=Q(nt),P=`Interval ${nt} → ${g}`}else g=f.toString(16).toUpperCase().padStart(2,"0"),P=`MIDI ${f} → ${g}`;const S=j(f);return`<div class="hex-col"><span class="${z?"hex-box interval-mode":"hex-box"}" title="${P}" data-copy="${g}">${g}</span><span class="hex-note-name">${S}</span></div>`}).join("");d+=`
      <div class="chord-row-wrapper" style="display:flex; flex-direction:column; background:var(--panel); border: 1px solid var(--border); border-radius: 2px; overflow:hidden;">
        <div class="chord-row" id="chord-row-${h}" style="border:none; border-radius:0;">
          <div class="chord-meta">
            <span class="chord-label">CHORD ${y}</span>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="chord-name-display">[ ${m.root}${m.type} ]</span>
              <button class="btn btn-muted chord-edit-toggle-btn" data-chord-idx="${h}" title="Edit Chord" style="padding:3px; height:20px; display:flex; align-items:center; justify-content:center;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              </button>
              <button class="btn btn-muted chord-play-btn" data-chord-idx="${h}" title="Play Chord" style="padding:3px 6px; height:20px; display:flex; align-items:center; justify-content:center;">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              </button>
            </div>
          </div>
          <div class="chord-keyboard-wrap" id="kbdWrap${h}" data-chord-idx="${h}" title="Drag left/right to move through voicing positions">
            <div id="chordKeyboardViz${h}"></div>
          </div>
          <div class="hex-boxes" id="hexBoxes${h}">${b}</div>
        </div>
        
        <div class="chord-edit-drawer" id="chord-edit-${h}" style="display:none; padding:12px; border-top:1px solid var(--border); background:var(--panel-alt);">
          <div style="display:flex; flex-direction:column; gap:14px;">
            <div>
              <div class="chord-label" style="margin-bottom:6px;">CORE QUALITY</div>
              <div style="display:flex; flex-wrap:wrap; gap:6px;">
                ${Pn.map(f=>{let g=!1;return(f.value==="maj"&&(m.type==="M"||m.type==="maj"||m.type==="")||f.value==="dim"&&m.type.startsWith("dim")||f.value==="sus4"&&m.type.startsWith("sus")||f.value==="m"&&m.type.startsWith("m")&&!m.type.startsWith("maj"))&&(g=!0),`<button class="btn ${g?"btn-primary":"btn-muted"} chord-edit-btn" data-chord-idx="${h}" data-type="core" data-val="${f.value}">${f.label}</button>`}).join("")}
              </div>
            </div>
            <div>
              <div class="chord-label" style="margin-bottom:6px;">MODIFIER</div>
              <div style="display:flex; flex-wrap:wrap; gap:6px;">
                ${xn.map(f=>{let g=!1;return(f.value==="7"&&m.type.includes("7")&&!m.type.includes("maj7")||f.value==="maj7"&&m.type.includes("maj7")||f.value==="9"&&m.type.includes("9")||f.value==="6"&&m.type.includes("6")||f.value===""&&!m.type.includes("7")&&!m.type.includes("9")&&!m.type.includes("6"))&&(g=!0),`<button class="btn ${g?"btn-primary":"btn-muted"} chord-edit-btn" data-chord-idx="${h}" data-type="mod" data-val="${f.value}">${f.label}</button>`}).join("")}
              </div>
            </div>
          </div>
        </div>
      </div>`}),d+="</div>",document.getElementById("output").innerHTML=d,a.chords.forEach((m,h)=>{At(h,0);const y=document.getElementById(`kbdWrap${h}`);y&&Ti(y,h,F[h]?.length??1)});const u=document.getElementById("chord-list");u&&u.addEventListener("click",m=>{const h=m.target,y=h.closest(".chord-edit-toggle-btn");if(y){const b=y.dataset.chordIdx;if(b){const f=document.getElementById(`chord-edit-${b}`);f&&(f.style.display=f.style.display==="none"?"block":"none")}return}if(h.classList.contains("chord-edit-btn")){const b=h.dataset.chordIdx,f=h.dataset.type,g=h.dataset.val;if(!b||!f||g===void 0)return;const P=parseInt(b,10),S=document.getElementById(`chord-edit-${P}`);if(!S)return;let Tt="",nt="";S.querySelectorAll(`.chord-edit-btn[data-type="${f}"]`).forEach(W=>{W.classList.remove("btn-primary"),W.classList.add("btn-muted")}),h.classList.remove("btn-muted"),h.classList.add("btn-primary");const ae=S.querySelector('.chord-edit-btn[data-type="core"].btn-primary'),se=S.querySelector('.chord-edit-btn[data-type="mod"].btn-primary');ae&&(Tt=ae.dataset.val??""),se&&(nt=se.dataset.val??"");const Sn=$n(Tt,nt);let Nt=document.getElementById("chordsInput").value.split(/[\s,]+/).filter(W=>W.length>0);if(Nt[P]){const W=mt[P].root;Nt[P]=W+Sn;const En=Nt.join(" ");document.getElementById("chordsInput").value=En;const wn=S.style.display!=="none";An(t,e,n),wn&&setTimeout(()=>{const le=document.getElementById(`chord-edit-${P}`);le&&(le.style.display="block")},0)}return}const M=h.closest(".chord-play-btn");if(M){const b=M.dataset.chordIdx;if(b){const f=parseInt(b,10),g=k[f]??0,P=F[f]??[],S=P[g]??P[0]??[];Ht([S])}return}h.classList.contains("hex-box")&&h.dataset.copy&&navigator.clipboard?.writeText(h.dataset.copy).then(()=>$(`Copied ${h.dataset.copy}`,"info")).catch(()=>{})})},ki=()=>mt.map((t,e)=>{const n=k[e]??0,r=F[e]??[];return r[n]??r[0]??[]}),Te=()=>"closed";let A=[""],B=0,lt=!1;const Vt=t=>{(!t||t.length===0)&&(t=[""]),A.length=0,A.push(...t),B=0;const e=document.getElementById("chordsInput");e&&(e.value=A[0]),J(),lt=!0,St(),document.getElementById("convertChordsBtn")?.click()},St=()=>{const t=document.getElementById("step-strip");if(!t||(t.innerHTML="",!lt))return;A.forEach((r,o)=>{const i=document.createElement("div");i.className="step-num"+(o===B?" active":""),i.textContent=(o+1).toString(),i.style.cursor="pointer",i.addEventListener("click",()=>ie(o)),t.appendChild(i)});const e=document.createElement("div");e.className="step-num",e.textContent="+",e.title="Add Chord Set",e.style.cursor="pointer",e.addEventListener("click",ji),t.appendChild(e);const n=document.getElementById("removeSetBtn");n&&(n.style.display=A.length>1?"inline-block":"none")},ji=()=>{A.push(""),ie(A.length-1)},Oi=()=>{if(A.length<=1)return;A.splice(B,1),B>=A.length&&(B=A.length-1);const t=B;B=-1,ie(t)},ie=t=>{if(t<0||t>=A.length)return;B=t;const e=document.getElementById("chordsInput");if(e&&(e.value=A[B]),J(),St(),A[B].trim()===""){const n=document.getElementById("outputBox");n&&(n.style.display="none");const r=document.getElementById("toggleOutputBoxBtn");r&&(r.innerHTML="CHORDS ▶",r.setAttribute("aria-expanded","false"),r.classList.add("dimmed"))}else document.getElementById("convertChordsBtn")?.click()},Ri=()=>{const t=document.getElementById("chordsInput");if(t){t.value="",A[B]="",J();const e=document.getElementById("outputBox");e&&(e.style.display="none");const n=document.getElementById("toggleOutputBoxBtn");n&&(n.innerHTML="CHORDS ▶",n.setAttribute("aria-expanded","false"),n.classList.add("dimmed"))}},J=()=>{const t=document.getElementById("chordsInput"),e=document.getElementById("singleChordSelect");if(!t||!e)return;const n=t.value.split(/\s|,/).map(o=>o.trim()).filter(Boolean),r=Array.from(new Set(n));if(e.innerHTML="",r.length===0){const o=document.createElement("option");o.value="",o.textContent="(No chords)",e.appendChild(o),e.disabled=!0}else r.forEach(o=>{const i=document.createElement("option");i.value=o,i.textContent=o,e.appendChild(i)}),e.disabled=!1},Li=()=>{const t=document.getElementById("singleChordSelect");if(!t||!t.value)return;const e=hn(t.value);e&&Nn(e)},Ne=["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];let ot=[];function Di(t){if(ot.push(t.key),ot.length>Ne.length&&ot.shift(),ot.join(",")===Ne.join(",")){ot=[];const n=document.body.classList.toggle("theme-synthwave"),r=document.getElementById("video-bg"),o=document.getElementById("app-title");r&&(r.style.display=n?"block":"none"),o&&(o.style.display=n?"block":"none"),$(n?"🎮 Synthwave easter egg activated!":"🎮 Back to tracker mode",n?"success":"info")}}const Vi=()=>{document.addEventListener("keydown",Di),document.addEventListener("DOMContentLoaded",()=>{const t=document.getElementById("chordsInput");t&&(A[0]=t.value);let e=!1,n=!1;const r='<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>',o='<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="4" y="4" width="16" height="16"></rect></svg>',i=()=>{e=!1;const l=document.getElementById("mainPlayBtn");l&&(l.innerHTML=r,l.classList.remove("btn-primary"),l.classList.add("btn-muted"))};document.getElementById("mainPlayBtn")?.addEventListener("click",()=>{const l=document.getElementById("mainPlayBtn");if(e)Mt(),i();else{const d=ki();Ht(d,n,i),e=!0,l&&(l.innerHTML=o,l.classList.remove("btn-muted"),l.classList.add("btn-primary"))}}),document.getElementById("mainLoopBtn")?.addEventListener("click",()=>{n=!n;const l=document.getElementById("mainLoopBtn");n?l&&(l.classList.remove("btn-muted"),l.classList.add("btn-primary")):l&&(l.classList.remove("btn-primary"),l.classList.add("btn-muted"))}),document.getElementById("intervalToggleBtn")?.addEventListener("click",()=>{Ni()}),document.getElementById("saveChordSetBtn")?.addEventListener("click",jn),document.getElementById("loadChordSetBtn")?.addEventListener("click",On),document.getElementById("deleteChordSetBtn")?.addEventListener("click",Rn),document.getElementById("exportChordSetsBtn")?.addEventListener("click",Ln),document.getElementById("importChordSetsInput")?.addEventListener("change",Dn);const s=document.getElementById("helpModal");document.getElementById("nav-settings-btn")?.addEventListener("click",()=>{s&&s.showModal()}),document.getElementById("helpModalCloseBtn")?.addEventListener("click",()=>{s&&s.close()}),s?.addEventListener("click",l=>{l.target===s&&s.close()});const a=document.getElementById("diskModal");document.getElementById("nav-disk-btn")?.addEventListener("click",()=>{a&&a.showModal()}),document.getElementById("diskModalCloseBtn")?.addEventListener("click",()=>{a&&a.close()}),a?.addEventListener("click",l=>{l.target===a&&a.close()}),document.getElementById("newProjectBtn")?.addEventListener("click",()=>{A=[""],B=0,lt=!1,St();const l=document.getElementById("chordsInput");l&&(l.value="");const d=document.getElementById("outputBox");d&&(d.style.display="none");const u=document.getElementById("toggleOutputBoxBtn");u&&(u.innerHTML="CHORDS ▶",u.setAttribute("aria-expanded","false"),u.classList.add("dimmed"));const m=document.getElementById("intervalToggleContainer");m&&(m.style.display="none"),a&&a.close(),$("New project started.","info")}),document.getElementById("toggleVideoBtn")?.addEventListener("click",Bn),document.getElementById("convertChordsBtn")?.addEventListener("click",()=>{lt||(lt=!0,St()),An(Zo,()=>"closed",J),Mt(),i()}),document.getElementById("clearInputBtn")?.addEventListener("click",Ri),document.getElementById("removeSetBtn")?.addEventListener("click",Oi),document.getElementById("shareProgressionBtn")?.addEventListener("click",()=>{const l=A.map(m=>m.trim()).filter(Boolean);if(l.length===0){$("No chords to share!","error");return}const d=l.join(";"),u=new URL(window.location.href);u.searchParams.set("p",d),navigator.clipboard.writeText(u.toString()).then(()=>{$("Shareable link copied to clipboard!","success")}).catch(()=>{$("Failed to copy link to clipboard.","error")})}),document.getElementById("playSingleChordBtn")?.addEventListener("click",Li),document.getElementById("chordsInput")?.addEventListener("input",l=>{const d=l.target;A[B]=d.value,J()}),document.getElementById("toggleOutputBoxBtn")?.addEventListener("click",()=>{const l=document.getElementById("outputBox"),d=document.getElementById("toggleOutputBoxBtn");if(!l||!d)return;const u=l.style.display!=="none"&&l.style.display!=="";l.style.display=u?"none":"block",d.setAttribute("aria-expanded",String(!u)),u?d.innerHTML="CHORDS ▶":d.innerHTML="CHORDS ▼"}),J(),Et();const c=new URLSearchParams(window.location.search),p=c.get("state");if(p)_n(()=>Promise.resolve().then(()=>_i),void 0).then(l=>{try{const d=l.decodeProgression(p);if(d&&d.chords&&d.chords.length>0){const u=d.chords.map(m=>m.symbol).join(" ");Vt([u])}}catch(d){console.error("Failed to decode shared state",d)}}).catch(l=>console.warn("human-engine not available for decoding state",l));else{let l=c.getAll("p");if(l.length===0&&(l=c.getAll("progression")),l.length>0){const d=[];l.forEach(u=>{const m=u.split(";");d.push(...m)}),d.length>0&&d.some(u=>u.trim()!=="")&&Vt(d)}}})};Vi();
