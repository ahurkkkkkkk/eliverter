(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const s of a.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&r(s)}).observe(document,{childList:!0,subtree:!0});function n(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function r(i){if(i.ep)return;i.ep=!0;const a=n(i);fetch(i.href,a)}})();const Wr=!1;var kn=Array.isArray,pa=Array.prototype.indexOf,hn=Array.prototype.includes,En=Array.from,Gr=Object.defineProperty,nt=Object.getOwnPropertyDescriptor,Ur=Object.getOwnPropertyDescriptors,_a=Object.prototype,ga=Array.prototype,tr=Object.getPrototypeOf,wr=Object.isExtensible;function qt(e){return typeof e=="function"}const ma=()=>{};function ba(e){return e()}function Rn(e){for(var t=0;t<e.length;t++)e[t]()}function Yr(){var e,t,n=new Promise((r,i)=>{e=r,t=i});return{promise:n,resolve:e,reject:t}}function ya(e,t){if(Array.isArray(e))return e;if(!(Symbol.iterator in e))return Array.from(e);const n=[];for(const r of e)if(n.push(r),n.length===t)break;return n}const ue=2,Tt=4,nn=8,nr=1<<24,Pe=16,Ee=32,Ye=64,Dn=128,rr=256,Ce=512,Q=1024,Y=2048,xe=4096,he=8192,pe=16384,jt=32768,pn=1<<25,mt=65536,_n=1<<17,Kr=1<<18,Ct=1<<19,Zr=1<<20,Ie=1<<25,gn=1<<21,At=1<<22,rt=1<<23,De=Symbol("$state"),Xr=Symbol("component"),Jr=Symbol("legacy props"),wa=Symbol(""),Qr=Symbol("attributes"),qn=Symbol("class"),Vn=Symbol("style"),Hn=Symbol("text"),cn=Symbol("form reset"),rn=new class extends Error{name="StaleReactionError";message="The reaction that called `getAbortSignal()` was re-run or destroyed"},ir=!!globalThis.document?.contentType&&globalThis.document.contentType.includes("xml"),xa=1,ka=2,ei=4,Ea=8,$a=16,Aa=1,Ta=2,ti=4,Ma=8,Sa=16,Pa=1,Na=2,X=Symbol("uninitialized"),ni="http://www.w3.org/1999/xhtml",ja="http://www.w3.org/2000/svg",Ca="@attach";function Oa(){console.warn("https://svelte.dev/e/derived_inert")}function za(){console.warn("https://svelte.dev/e/select_multiple_invalid_value")}function La(){console.warn("https://svelte.dev/e/svelte_boundary_reset_noop")}let Ia=!1;function ri(e){return e===this.v}function Fa(e,t){return e!=e?t==t:e!==t||e!==null&&typeof e=="object"||typeof e=="function"}function ii(e){return!Fa(e,this.v)}function Ra(e){throw new Error("https://svelte.dev/e/lifecycle_outside_component")}function Da(){throw new Error("https://svelte.dev/e/async_derived_orphan")}function qa(e,t,n){throw new Error("https://svelte.dev/e/each_key_duplicate")}function Va(e){throw new Error("https://svelte.dev/e/effect_in_teardown")}function Ha(){throw new Error("https://svelte.dev/e/effect_in_unowned_derived")}function Ba(e){throw new Error("https://svelte.dev/e/effect_orphan")}function Wa(){throw new Error("https://svelte.dev/e/effect_update_depth_exceeded")}function Ga(e){throw new Error("https://svelte.dev/e/props_invalid_value")}function Ua(){throw new Error("https://svelte.dev/e/state_descriptors_fixed")}function Ya(){throw new Error("https://svelte.dev/e/state_prototype_fixed")}function Ka(){throw new Error("https://svelte.dev/e/state_unsafe_mutation")}function Za(){throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror")}let Ot=!1,Xa=!1;function Ja(){Ot=!0}let W=null;function Mt(e){W=e}function lt(e,t=!1,n){W={p:W,i:!1,c:null,e:null,s:e,x:null,r:O,l:Ot&&!t?{s:null,u:null,$:[]}:null}}function ut(e){var t=W,n=t.e;if(n!==null){t.e=null;for(var r of n)ki(r)}return t.i=!0,W=t.p,ar(e)}function ar(e={}){return Gr(e,Xr,{value:!0}),e}function an(){return!Ot||W!==null&&W.l===null}let vt=[];function ai(){var e=vt;vt=[],Rn(e)}function Fe(e){if(vt.length===0&&!Kt){var t=vt;queueMicrotask(()=>{t===vt&&ai()})}vt.push(e)}function Qa(){for(;vt.length>0;)ai()}const es=-7169;function G(e,t){e.f=e.f&es|t}function sr(e){(e.f&Ce)!==0||e.deps===null?G(e,Q):G(e,xe)}function si(e,t,n){(e.f&Y)!==0?t.add(e):(e.f&xe)!==0&&n.add(e),G(e,Q)}function ts(e,t){if(t){const n=document.body;e.autofocus=!0,Fe(()=>{document.activeElement===n&&e.focus()})}}let xr=!1;function ns(){xr||(xr=!0,document.addEventListener("reset",e=>{Promise.resolve().then(()=>{if(!e.defaultPrevented)for(const t of e.target.elements)t[cn]?.()})},{capture:!0}))}function zt(e){var t=L,n=O;$e(null),Ae(null);try{return e()}finally{$e(t),Ae(n)}}function rs(e,t,n,r=n){e.addEventListener(t,()=>zt(n));const i=e[cn];i?e[cn]=()=>{i(),r(!0)}:e[cn]=()=>r(!0),ns()}function oi(e,t,n,r){const i=an()?St:or;var a=e.filter(p=>!p.settled),s=t.map(i);if(n.length===0&&a.length===0){r(s);return}var o=O,l=is(),u=a.length===1?a[0].promise:a.length>1?Promise.all(a.map(p=>p.promise)):null;function f(p){if((o.f&pe)===0){l();try{r([...s,...p])}catch(c){Le(c,o)}mn()}}var v=li();if(n.length===0){u.then(()=>f([])).finally(v);return}function h(){Promise.all(n.map(p=>as(p))).then(f).catch(p=>Le(p,o)).finally(v)}u?u.then(()=>{l(),h(),mn()}):h()}function is(){var e=O,t=L,n=W,r=j;return function(a=!0){Ae(e),$e(t),Mt(n),a&&(e.f&pe)===0&&(r?.activate(),r?.apply())}}function mn(e=!0){Ae(null),$e(null),Mt(null),e&&j?.deactivate()}function li(){var e=O,t=e.b,n=j,r=!!t?.is_rendered();return t?.update_pending_count(1,n),n.increment(r,e),()=>{t?.update_pending_count(-1,n),n.decrement(r,e)}}function St(e){var t=ue|Y;return O!==null&&(O.f|=Ct),{ctx:W,deps:null,effects:null,equals:ri,f:t,fn:e,reactions:null,rv:0,v:X,wv:0,parent:O,ac:null}}const Wt=Symbol("obsolete");function as(e,t,n){let r=O;r===null&&Da();var i=void 0,a=st(X),s=!L,o=new Set;return bs(()=>{var l=O,u=Yr();i=u.promise;try{Promise.resolve(e()).then(u.resolve,p=>{p!==rn&&u.reject(p)}).finally(mn)}catch(p){u.reject(p),mn()}var f=j;if(s){if((l.f&jt)!==0)var v=li();if(r.b?.is_rendered())f.async_deriveds.get(l)?.reject(Wt);else for(const p of o.values())p.reject(Wt);o.add(u),f.async_deriveds.set(l,u)}const h=(p,c=void 0)=>{v?.(),o.delete(u),c!==Wt&&(f.activate(),c?(a.f|=rt,Pt(a,c)):((a.f&rt)!==0&&(a.f^=rt),Pt(a,p)),f.deactivate())};u.promise.then(h,p=>h(null,p||"unknown"))}),$n(()=>{for(const l of o)l.reject(Wt)}),new Promise(l=>{function u(f){function v(){f===i?l(a):u(i)}f.then(v,v)}u(i)})}function Re(e){const t=St(e);return Si(t),t}function or(e){const t=St(e);return t.equals=ii,t}function ss(e){var t=e.effects;if(t!==null){e.effects=null;for(var n=0;n<t.length;n+=1)re(t[n])}}function lr(e){var t,n=O,r=e.parent;if(!Ke&&r!==null&&e.v!==X&&(r.f&(pe|he))!==0)return Oa(),e.v;Ae(r);try{ss(e),t=Ci(e)}finally{Ae(n)}return t}function ui(e){var t=lr(e);if(!e.equals(t)&&(e.wv=Ni(),(!j?.is_fork||e.deps===null)&&(j!==null?(j.capture(e,t,!0),Bn?.capture(e,t,!0)):e.v=t,e.deps===null))){G(e,Q);return}Ke||(Ne!==null?(dr()||j?.is_fork)&&Ne.set(e,t):sr(e))}function os(e){if(e.effects!==null)for(const t of e.effects)(t.teardown||t.ac)&&(t.teardown?.(),t.ac!==null&&zt(()=>{t.ac.abort(rn),t.ac=null}),t.fn!==null&&(t.teardown=ma),Jt(t,0),hr(t))}function fi(e){if(e.effects!==null)for(const t of e.effects)t.teardown&&t.fn!==null&&Nt(t)}let Sn=null,Et=null,j=null,Bn=null,Ne=null,Wn=null,Kt=!1,Pn=!1,Zt=null,dn=null;var kr=0;let ls=1;class at{id=ls++;#t=!1;linked=!0;#s=null;#e=null;async_deriveds=new Map;current=new Map;previous=new Map;#l=new Set;#r=new Set;#a=0;#n=new Map;#o=null;#i=[];#h=[];#u=new Set;#f=new Set;#d=new Map;#_=new Set;is_fork=!1;#c=!1;constructor(){Et===null?Sn=Et=this:(Et.#e=this,this.#s=Et),Et=this}#b(){if(this.is_fork)return!0;for(const r of this.#n.keys()){for(var t=r,n=!1;t.parent!==null;){if(this.#d.has(t)){n=!0;break}t=t.parent}if(!n)return!0}return!1}skip_effect(t){this.#d.has(t)||this.#d.set(t,{d:[],m:[]}),this.#_.delete(t)}unskip_effect(t,n=r=>this.schedule(r)){var r=this.#d.get(t);if(r){this.#d.delete(t);for(var i of r.d)G(i,Y),n(i);for(i of r.m)G(i,xe),n(i)}this.#_.add(t)}#x(){var t=[];for(const a of this.#i)if(!((a.f&pe)!==0||(a.f&(Y|xe))===0)){for(var n=a,r=!1;n.parent!==null;){n=n.parent;var i=n.f;if((i&(Ye|Ee))!==0){if((i&Q)===0){r=!0;break}n.f^=Q}}r||t.push(n)}return this.#i=[],t}#g(){this.#t=!0;for(const o of this.#u)this.#f.delete(o),G(o,Y),this.schedule(o);for(const o of this.#f)G(o,xe),this.schedule(o);this.apply();for(var t=Zt=[],n=[],r=dn=[];this.#i.length>0;){kr++>1e3&&(this.#p(),fs());for(const o of this.#x())try{this.#m(o,t,n)}catch(l){throw vi(o),this.#b()||this.discard(),l}}if(j=null,r.length>0){var i=at.ensure();for(const o of r)i.schedule(o)}if(Zt=null,dn=null,this.#b()){this.#v(n),this.#v(t);for(const[o,l]of this.#d)di(o,l);r.length>0&&j.#g();return}const a=this.#k();if(a){this.#v(n),this.#v(t),a.#y(this);return}this.#u.clear(),this.#f.clear();for(const o of this.#l)o(this);this.#l.clear(),Bn=this,Er(n),Er(t),Bn=null,this.#o?.resolve();var s=j;if(this.#a===0&&(this.#i.length===0||s!==null)&&this.#p(),this.#i.length>0)if(s!==null){for(const o of this.#i)s.#i.push(o);this.#i=[]}else s=this;s!==null&&(qe.clear(),s.#g())}#m(t,n,r){t.f^=Q;for(var i=t.first;i!==null;){var a=i.f,s=(a&(Ee|Ye))!==0,o=s&&(a&Q)!==0,l=o||(a&he)!==0||this.#d.has(i);if(!l&&i.fn!==null){s?i.f^=Q:(a&Tt)!==0?n.push(i):ln(i)&&((a&Pe)!==0&&this.#f.add(i),Nt(i));var u=i.first;if(u!==null){i=u;continue}}for(;i!==null;){var f=i.next;if(f!==null){i=f;break}i=i.parent}}}#k(){for(var t=this.#s;t!==null;){if(!t.is_fork){for(const[n,[,r]]of this.current)if(t.current.has(n)&&!r)return t}t=t.#s}return null}#y(t){for(const[r,i]of t.current)!this.previous.has(r)&&t.previous.has(r)&&this.previous.set(r,t.previous.get(r)),this.current.set(r,i);for(const[r,i]of t.async_deriveds){const a=this.async_deriveds.get(r);a&&i.promise.then(a.resolve).catch(a.reject)}t.async_deriveds.clear(),this.transfer_effects(t.#u,t.#f);const n=r=>{var i=r.reactions;if(i!==null&&!((r.f&ue)!==0&&(r.f&(Y|xe))===0))for(const o of i){var a=o.f;if((a&ue)!==0)n(o);else{var s=o;a&(At|Pe)&&!this.async_deriveds.has(s)&&(this.#f.delete(s),G(s,Y),this.schedule(s))}}};for(const r of this.current.keys())n(r);this.oncommit(()=>t.discard()),t.#p(),j=this,this.#g()}#v(t){for(var n=0;n<t.length;n+=1)si(t[n],this.#u,this.#f)}capture(t,n,r=!1){t.v!==X&&!this.previous.has(t)&&this.previous.set(t,t.v),(t.f&rt)===0&&(this.current.set(t,[n,r]),Ne?.set(t,n)),this.is_fork||(t.v=n)}activate(){j=this}deactivate(){j=null,Ne=null}flush(){try{Pn=!0,j=this,this.#g()}finally{kr=0,Wn=null,Zt=null,dn=null,Pn=!1,j=null,Ne=null,qe.clear()}}discard(){for(const t of this.#r)t(this);this.#r.clear();for(const t of this.async_deriveds.values())t.reject(Wt);this.#p(),this.#o?.resolve()}register_created_effect(t){this.#h.push(t)}#w(){for(let v=Sn;v!==null;v=v.#e){var t=v.id<this.id,n=[];for(const[h,[p,c]]of this.current){if(v.current.has(h)){var r=v.current.get(h)[0];if(t&&p!==r)v.current.set(h,[p,c]);else continue}n.push(h)}if(t)for(const[h,p]of this.async_deriveds){const c=v.async_deriveds.get(h);c&&p.promise.then(c.resolve).catch(c.reject)}var i=[...v.current.keys()].filter(h=>!v.current.get(h)[1]);if(!(!v.#t||i.length===0)){var a=i.filter(h=>!this.current.has(h));if(a.length===0)t&&v.discard();else if(n.length>0){if(t)for(const h of this.#_)v.unskip_effect(h,p=>{(p.f&(Pe|At))!==0?v.schedule(p):v.#v([p])});v.activate();var s=new Set,o=new Map;for(var l of n)ci(l,a,s,o);o=new Map;var u=[...v.current].filter(([h,p])=>{const c=this.current.get(h);return c?c[0]!==p[0]||c[1]!==p[1]:!0}).map(([h])=>h);if(u.length>0)for(const h of this.#h)(h.f&(pe|he|_n))===0&&ur(h,u,o)&&((h.f&(At|Pe))!==0?(G(h,Y),v.schedule(h)):v.#u.add(h));if(v.#i.length>0&&!v.#c){v.apply();for(var f of v.#x())v.#m(f,[],[])}v.deactivate()}}}}increment(t,n){if(this.#a+=1,t){let r=this.#n.get(n)??0;this.#n.set(n,r+1)}}decrement(t,n){if(this.#a-=1,t){let r=this.#n.get(n)??0;r===1?this.#n.delete(n):this.#n.set(n,r-1)}this.#c||(this.#c=!0,Fe(()=>{this.#c=!1,this.linked&&this.flush()}))}transfer_effects(t,n){for(const r of t)this.#u.add(r);for(const r of n)this.#f.add(r);t.clear(),n.clear()}oncommit(t){this.#l.add(t)}ondiscard(t){this.#r.add(t)}settled(){return(this.#o??=Yr()).promise}static ensure(){if(j===null){const t=j=new at;!Pn&&!Kt&&Fe(()=>{t.#t||t.flush()})}return j}apply(){{Ne=null;return}}schedule(t){if(Wn=t,t.b?.is_pending&&(t.f&(Tt|nn|nr))!==0&&(t.f&jt)===0){t.b.defer_effect(t);return}this.#i.push(t)}#p(){if(this.linked){var t=this.#s,n=this.#e;t===null?Sn=n:t.#e=n,n===null?Et=t:n.#s=t,this.linked=!1}}}function us(e){var t=Kt;Kt=!0;try{for(var n;;){if(Qa(),j===null)return n;j.flush()}}finally{Kt=t}}function fs(){try{Wa()}catch(e){Le(e,Wn)}}let Ue=null;function Er(e){var t=e.length;if(t!==0){for(var n=0;n<t;){var r=e[n++];if((r.f&(pe|he))===0&&ln(r)&&(Ue=new Set,Nt(r),r.deps===null&&r.first===null&&r.nodes===null&&r.teardown===null&&r.ac===null&&Ai(r),Ue?.size>0)){qe.clear();for(const i of Ue){if((i.f&(pe|he))!==0)continue;const a=[i];let s=i.parent;for(;s!==null;)Ue.has(s)&&(Ue.delete(s),a.push(s)),s=s.parent;for(let o=a.length-1;o>=0;o--){const l=a[o];(l.f&(pe|he))===0&&Nt(l)}}Ue.clear()}}Ue=null}}function ci(e,t,n,r){if(!n.has(e)&&(n.add(e),e.reactions!==null))for(const i of e.reactions){const a=i.f;(a&ue)!==0?ci(i,t,n,r):(a&(At|Pe))!==0&&(a&Y)===0&&ur(i,t,r)&&(G(i,Y),fr(i))}}function ur(e,t,n){const r=n.get(e);if(r!==void 0)return r;if(e.deps!==null)for(const i of e.deps){if(hn.call(t,i))return!0;if((i.f&ue)!==0&&ur(i,t,n))return n.set(i,!0),!0}return n.set(e,!1),!1}function fr(e){j.schedule(e)}function di(e,t){if(!((e.f&Ee)!==0&&(e.f&Q)!==0)){(e.f&Y)!==0?t.d.push(e):(e.f&xe)!==0&&t.m.push(e),G(e,Q);for(var n=e.first;n!==null;)di(n,t),n=n.next}}function vi(e){G(e,Q);for(var t=e.first;t!==null;)vi(t),t=t.next}let bn=new Set;const qe=new Map;let hi=!1;function st(e,t){var n={f:0,v:e,reactions:null,equals:ri,rv:0,wv:0};return n}function F(e,t){const n=st(e);return Si(n),n}function cs(e,t=!1,n=!0){const r=st(e);return t||(r.equals=ii),Ot&&n&&W!==null&&W.l!==null&&(W.l.s??=[]).push(r),r}function k(e,t,n=!1){L!==null&&(!je||(L.f&_n)!==0)&&an()&&(L.f&(ue|Pe|At|_n))!==0&&(He===null||!He.has(e))&&Ka();let r=n?ke(t):t;return Pt(e,r,dn)}var dt=null,Gn=0;function Pt(e,t,n=null){if(!e.equals(t)){Ke?qe.set(e,t):qe.has(e)||qe.set(e,e.v);var r=at.ensure();if(r.capture(e,t),(e.f&ue)!==0){const i=e;(e.f&Y)!==0&&lr(i),Ne===null&&sr(i)}e.wv=Ni(),dt=null,Gn=0,pi(e,Y,n),dt=null,an()&&O!==null&&(O.f&Q)!==0&&(O.f&(Ee|Ye))===0&&(we===null?xs([e]):we.push(e)),!r.is_fork&&bn.size>0&&!hi&&ds()}return t}function ds(){hi=!1;for(const e of bn){(e.f&Q)!==0&&G(e,xe);let t;try{t=ln(e)}catch{t=!0}t&&Nt(e)}bn.clear()}function $r(e,t=1){var n=d(e),r=t===1?n++:n--;return k(e,n),r}function Xt(e){k(e,e.v+1)}function pi(e,t,n){var r=e.reactions;if(r!==null){var i=an(),a=r.length;if(Gn+=a,Gn>1e5&&dt===null&&(dt=new Set),dt!==null){if(dt.has(e))return;dt.add(e)}for(var s=0;s<a;s++){var o=r[s],l=o.f;if(!(!i&&o===O)){var u=(l&Y)===0;if(u&&G(o,t),(l&_n)!==0)bn.add(o);else if((l&ue)!==0){var f=o;Ne?.delete(f),pi(f,xe,n)}else if(u){var v=o;(l&Pe)!==0&&Ue!==null&&Ue.add(v),n!==null?n.push(v):fr(v)}}}}}function ke(e){if(typeof e!="object"||e===null||De in e||Xr in e)return e;const t=tr(e);if(t!==_a&&t!==ga)return e;var n=new Map,r=kn(e),i=F(0),a=gt,s=o=>{if(gt===a)return o();var l=L,u=gt;$e(null),Sr(a);var f=o();return $e(l),Sr(u),f};return r&&n.set("length",F(e.length)),new Proxy(e,{defineProperty(o,l,u){(!("value"in u)||u.configurable===!1||u.enumerable===!1||u.writable===!1)&&Ua();var f=n.get(l);return f===void 0?s(()=>{var v=F(u.value);return n.set(l,v),v}):k(f,u.value,!0),!0},deleteProperty(o,l){var u=n.get(l);if(u===void 0){if(l in o){const f=s(()=>F(X));n.set(l,f),Xt(i)}}else k(u,X),Xt(i);return!0},get(o,l,u){if(l===De)return e;var f=n.get(l),v=l in o;if(f===void 0&&(!v||nt(o,l)?.writable)&&(f=s(()=>{var p=ke(v?o[l]:X),c=F(p);return c}),n.set(l,f)),f!==void 0){var h=d(f);return h===X?void 0:h}return Reflect.get(o,l,u)},getOwnPropertyDescriptor(o,l){this.has?.(o,l);var u=Reflect.getOwnPropertyDescriptor(o,l),f=n.get(l);if(f!==void 0){var v=d(f);if(v===X)return;if(u&&"value"in u)u.value=v;else return{enumerable:!0,configurable:!0,value:v,writable:!0}}return u},has(o,l){if(l===De)return!0;var u=n.get(l),f=u!==void 0&&u.v!==X||Reflect.has(o,l);if(u!==void 0||O!==null&&(!f||nt(o,l)?.writable)){u===void 0&&(u=s(()=>{var h=f?ke(o[l]):X,p=F(h);return p}),n.set(l,u));var v=d(u);if(v===X)return!1}return f},set(o,l,u,f){var v=n.get(l),h=l in o;if(r&&l==="length")for(var p=u;p<v.v;p+=1){var c=n.get(p+"");c!==void 0?k(c,X):p in o&&(c=s(()=>F(X)),n.set(p+"",c))}if(v===void 0)(!h||nt(o,l)?.writable)&&(v=s(()=>F(void 0)),k(v,ke(u)),n.set(l,v));else{h=v.v!==X;var m=s(()=>ke(u));k(v,m)}var _=Reflect.getOwnPropertyDescriptor(o,l);if(_?.set&&_.set.call(f,u),!h){if(r&&typeof l=="string"){var b=n.get("length"),A=Number(l);Number.isInteger(A)&&A>=b.v&&k(b,A+1)}Xt(i)}return!0},ownKeys(o){d(i);var l=Reflect.ownKeys(o).filter(v=>{var h=n.get(v);return h===void 0||h.v!==X});for(var[u,f]of n)f.v!==X&&!(u in o)&&l.push(u);return l},setPrototypeOf(){Ya()}})}function Ar(e){try{if(e!==null&&typeof e=="object"&&De in e)return e[De]}catch{}return e}function _i(e,t){return Object.is(Ar(e),Ar(t))}var Tr,gi,mi,bi,yi;function vs(){if(Tr===void 0){Tr=window,gi=document,mi=/Firefox/.test(navigator.userAgent);var e=Element.prototype,t=Node.prototype,n=Text.prototype;bi=nt(t,"firstChild").get,yi=nt(t,"nextSibling").get,wr(e)&&(e[qn]=void 0,e[Qr]=null,e[Vn]=void 0,e.__e=void 0),wr(n)&&(n[Hn]=void 0)}}function Ve(e=""){return document.createTextNode(e)}function bt(e){return bi.call(e)}function sn(e){return yi.call(e)}function P(e,t){return bt(e)}function K(e,t=!1){{var n=bt(e);return n instanceof Comment&&n.data===""?sn(n):n}}function H(e,t=!1){return bt(e)}function x(e,t=1,n=!1){let r=e;for(;t--;)r=sn(r);return r}function hs(e){e.textContent=""}function wi(){return!1}function cr(e,t,n){return t==null||t===ni?n?document.createElement(e,{is:n}):document.createElement(e):n?document.createElementNS(t,e,{is:n}):document.createElementNS(t,e)}function ps(e){var t=O;if(t===null)return L.f|=rt,e;if((t.f&jt)===0&&(t.f&Tt)===0)throw e;Le(e,t)}function Le(e,t){if(!(t!==null&&(t.f&pe)!==0)){for(;t!==null;){if((t.f&Dn)!==0&&(t.f&(pe|pn))===0){if((t.f&jt)===0)throw e;try{t.b.error(e);return}catch(n){e=n}}t=t.parent}throw e}}function xi(e){O===null&&(L===null&&Ba(),Ha()),Ke&&Va()}function _s(e,t){var n=t.last;n===null?t.last=t.first=e:(n.next=e,e.prev=n,t.last=e)}function Oe(e,t){var n=O;n!==null&&(n.f&he)!==0&&(e|=he);var r={ctx:W,deps:null,nodes:null,f:e|Y|Ce,first:null,fn:t,last:null,next:null,parent:n,b:n&&n.b,prev:null,teardown:null,wv:0,ac:null};j?.register_created_effect(r);var i=r;if((e&Tt)!==0)Zt!==null?Zt.push(r):at.ensure().schedule(r);else if(t!==null){try{Nt(r)}catch(s){throw re(r),s}i.deps===null&&i.teardown===null&&i.nodes===null&&i.first===i.last&&(i.f&Ct)===0&&(i=i.first,(e&Pe)!==0&&(e&mt)!==0&&i!==null&&(i.f|=mt))}if(i!==null&&(i.parent=n,n!==null&&_s(i,n),L!==null&&(L.f&ue)!==0&&(e&Ye)===0)){var a=L;(a.effects??=[]).push(i)}return r}function dr(){return L!==null&&!je}function $n(e){const t=Oe(nn,null);return G(t,Q),t.teardown=e,t}function yt(e){xi();var t=O.f,n=!L&&(t&Ee)!==0&&W!==null&&!W.i;if(n){var r=W;(r.e??=[]).push(e)}else return ki(e)}function ki(e){return Oe(Tt|Zr,e)}function gs(e){return xi(),Oe(nn|Zr,e)}function ms(e){at.ensure();const t=Oe(Ye|Ct,e);return(n={})=>new Promise(r=>{n.outro?_t(t,()=>{re(t),r(void 0)}):(re(t),r(void 0))})}function An(e){return Oe(Tt,e)}function bs(e){return Oe(At|Ct,e)}function vr(e,t=0){return Oe(nn|t,e)}function B(e,t=[],n=[],r=[]){oi(r,t,n,i=>{Oe(nn,()=>{e(...i.map(d))})})}function on(e,t=0){var n=Oe(Pe|t,e);return n}function Ei(e,t=0){var n=Oe(nr|t,e);return n}function ve(e){return Oe(Ee|Ct,e)}function $i(e){var t=e.teardown;if(t!==null){const n=Ke,r=L;Mr(!0),$e(null);try{t.call(null)}catch(i){Le(i,e.parent)}finally{Mr(n),$e(r)}}}function hr(e,t=!1){var n=e.first;for(e.first=e.last=null;n!==null;){const i=n.ac;i!==null&&zt(()=>{i.abort(rn)});var r=n.next;(n.f&Ye)!==0?n.parent=null:re(n,t),n=r}}function ys(e){for(var t=e.first;t!==null;){var n=t.next;(t.f&Ee)===0&&re(t),t=n}}function re(e,t=!0){var n=!1;(t||(e.f&Kr)!==0)&&e.nodes!==null&&e.nodes.end!==null&&(ws(e.nodes.start,e.nodes.end),n=!0),e.f|=pn,hr(e,t&&!n),Jt(e,0);var r=e.nodes&&e.nodes.t;if(r!==null)for(const a of r)a.stop();$i(e),e.f^=pn,e.f|=pe;var i=e.parent;i!==null&&i.first!==null&&Ai(e),e.next=e.prev=e.teardown=e.ctx=e.deps=e.fn=e.nodes=e.ac=e.b=null}function ws(e,t){for(;e!==null;){var n=e===t?null:sn(e);e.remove(),e=n}}function Ai(e){var t=e.parent,n=e.prev,r=e.next;n!==null&&(n.next=r),r!==null&&(r.prev=n),t!==null&&(t.first===e&&(t.first=r),t.last===e&&(t.last=n))}function _t(e,t,n=!0){var r=[];e.f|=rr,Ti(e,r,!0);var i=()=>{n&&re(e),t&&t()},a=r.length;if(a>0){var s=()=>--a||i();for(var o of r)o.out(s)}else i()}function Ti(e,t,n){if((e.f&he)===0){e.f^=he;var r=e.nodes&&e.nodes.t;if(r!==null)for(const o of r)(o.is_global||n)&&t.push(o);for(var i=e.first;i!==null;){var a=i.next;if((i.f&Ye)===0){var s=(i.f&mt)!==0||(i.f&Ee)!==0&&(e.f&Pe)!==0;Ti(i,t,s?n:!1)}i=a}}}function yn(e){e.f&=~rr,Mi(e,!0)}function Mi(e,t){if((e.f&rr)===0&&(e.f&he)!==0){e.f^=he,(e.f&Q)===0&&(G(e,Y),at.ensure().schedule(e));for(var n=e.first;n!==null;){var r=n.next,i=(n.f&mt)!==0||(n.f&Ee)!==0;Mi(n,i?t:!1),n=r}var a=e.nodes&&e.nodes.t;if(a!==null)for(const s of a)(s.is_global||t)&&s.in()}}function pr(e,t){if(e.nodes)for(var n=e.nodes.start,r=e.nodes.end;n!==null;){var i=n===r?null:sn(n);t.append(n),n=i}}let vn=!1,Ke=!1;function Mr(e){Ke=e}let L=null,je=!1;function $e(e){L=e}let O=null;function Ae(e){O=e}let He=null;function Si(e){L!==null&&((L.f&gn)!==0||(L.f&ue)!==0)&&(He??=new Set).add(e)}let me=null,ye=0,we=null;function xs(e){we=e}let Pi=1,ht=0,gt=ht;function Sr(e){gt=e}function Ni(){return++Pi}function ln(e){var t=e.f;if((t&Y)!==0)return!0;if((t&xe)!==0){for(var n=e.deps,r=n.length,i=0;i<r;i++){var a=n[i];if(ln(a)&&ui(a),a.wv>e.wv)return!0}(t&Ce)!==0&&Ne===null&&G(e,Q)}return!1}function ji(e,t,n=!0){var r=e.reactions;if(r!==null&&!(He!==null&&He.has(e)))for(var i=0;i<r.length;i++){var a=r[i];(a.f&ue)!==0?ji(a,t,!1):t===a&&(n?G(a,Y):(a.f&Q)!==0&&G(a,xe),fr(a))}}function Ci(e){var t=me,n=ye,r=we,i=L,a=He,s=W,o=je,l=gt,u=e.f;me=null,ye=0,we=null,L=(u&(Ee|Ye))===0?e:null,He=null,Mt(e.ctx),je=!1,gt=++ht,e.ac!==null&&(zt(()=>{e.ac.abort(rn)}),e.ac=null);try{e.f|=gn;var f=e.fn,v=f();e.f|=jt;var h=Pr(e);if(an()&&we!==null&&!je&&h!==null&&(e.f&(ue|xe|Y))===0)for(var p=0;p<we.length;p++)ji(we[p],e);if(i!==null&&i!==e){if(ht++,i.deps!==null)for(let c=0;c<n;c+=1)i.deps[c].rv=ht;if(t!==null)for(const c of t)c.rv=ht;we!==null&&(r===null?r=we:r.push(...we))}return(e.f&rt)!==0&&(e.f^=rt),v}catch(c){return Pr(e),ps(c)}finally{e.f^=gn,me=t,ye=n,we=r,L=i,He=a,Mt(s),je=o,gt=l}}function Pr(e){var t=e.deps,n=j?.is_fork;if(me!==null){var r;if(n||Jt(e,ye),t!==null&&ye>0)for(t.length=ye+me.length,r=0;r<me.length;r++)t[ye+r]=me[r];else e.deps=t=me;if(dr()&&(e.f&Ce)!==0)for(r=ye;r<t.length;r++)(t[r].reactions??=[]).push(e)}else!n&&t!==null&&ye<t.length&&(Jt(e,ye),t.length=ye);return t}function ks(e,t){let n=t.reactions;if(n!==null){var r=pa.call(n,e);if(r!==-1){var i=n.length-1;i===0?n=t.reactions=null:(n[r]=n[i],n.pop())}}if(n===null&&(t.f&ue)!==0&&(me===null||!hn.call(me,t))){var a=t;(a.f&Ce)!==0&&(a.f^=Ce),a.v!==X&&sr(a),a.ac!==null&&zt(()=>{a.ac.abort(rn),a.ac=null,G(a,Y)}),os(a),Jt(a,0)}}function Jt(e,t){var n=e.deps;if(n!==null)for(var r=t;r<n.length;r++)ks(e,n[r])}function Nt(e){var t=e.f;if((t&pe)===0){G(e,Q);var n=O,r=vn;O=e,vn=(t&(Ee|Ye))===0;try{(t&(Pe|nr))!==0?ys(e):hr(e),$i(e);var i=Ci(e);e.teardown=typeof i=="function"?i:null,e.wv=Pi;var a;Wr&&Xa&&(e.f&Y)!==0&&e.deps}finally{vn=r,O=n}}}async function Es(){await Promise.resolve(),us()}function d(e){var t=e.f,n=(t&ue)!==0;if(L!==null&&!je){var r=O!==null&&(O.f&pe)!==0;if(!r&&(He===null||!He.has(e))){var i=L.deps;if((L.f&gn)!==0)e.rv<ht&&(e.rv=ht,me===null&&i!==null&&i[ye]===e?ye++:me===null?me=[e]:me.push(e));else{L.deps??=[],hn.call(L.deps,e)||L.deps.push(e);var a=e.reactions;a===null?e.reactions=[L]:hn.call(a,L)||a.push(L)}}}if(Ke&&qe.has(e))return qe.get(e);if(n){var s=e;if(Ke){var o=s.v;return((s.f&Q)===0&&s.reactions!==null||zi(s))&&(o=lr(s)),qe.set(s,o),o}var l=(s.f&Ce)===0&&!je&&L!==null&&(vn||(L.f&Ce)!==0),u=(s.f&jt)===0;ln(s)&&(l&&(s.f|=Ce),ui(s)),l&&!u&&(fi(s),Oi(s))}if(Ne?.has(e))return Ne.get(e);if((e.f&rt)!==0)throw e.v;return e.v}function Oi(e){if(e.f|=Ce,e.deps!==null)for(const t of e.deps)(t.reactions??=[]).push(e),(t.f&ue)!==0&&(t.f&Ce)===0&&(fi(t),Oi(t))}function zi(e){if(e.v===X)return!0;if(e.deps===null)return!1;for(const t of e.deps)if(qe.has(t)||(t.f&ue)!==0&&zi(t))return!0;return!1}function ot(e){var t=je;try{return je=!0,e()}finally{je=t}}function $t(e){if(!(typeof e!="object"||!e||e instanceof EventTarget)){if(De in e)Un(e);else if(!Array.isArray(e))for(let t in e){const n=e[t];typeof n=="object"&&n&&De in n&&Un(n)}}}function Un(e,t=new Set){if(typeof e=="object"&&e!==null&&!(e instanceof EventTarget)&&!t.has(e)){t.add(e),e instanceof Date&&e.getTime();for(let r in e)try{Un(e[r],t)}catch{}const n=tr(e);if(n!==Object.prototype&&n!==Array.prototype&&n!==Map.prototype&&n!==Set.prototype&&n!==Date.prototype){const r=Ur(n);for(let i in r){const a=r[i].get;if(a)try{a.call(e)}catch{}}}}}function $s(e){return e.endsWith("capture")&&e!=="gotpointercapture"&&e!=="lostpointercapture"}const As=["beforeinput","click","change","dblclick","contextmenu","focusin","focusout","input","keydown","keyup","mousedown","mousemove","mouseout","mouseover","mouseup","pointerdown","pointermove","pointerout","pointerover","pointerup","touchend","touchmove","touchstart"];function Ts(e){return As.includes(e)}const Ms={formnovalidate:"formNoValidate",ismap:"isMap",nomodule:"noModule",playsinline:"playsInline",readonly:"readOnly",defaultvalue:"defaultValue",defaultchecked:"defaultChecked",srcobject:"srcObject",novalidate:"noValidate",allowfullscreen:"allowFullscreen",disablepictureinpicture:"disablePictureInPicture",disableremoteplayback:"disableRemotePlayback"};function Ss(e){return e=e.toLowerCase(),Ms[e]??e}const Ps=["touchstart","touchmove"];function Ns(e){return Ps.includes(e)}const Gt=Symbol("events"),Li=new Set,Yn=new Set;function Ii(e,t,n,r={}){function i(a){if(r.capture||Kn.call(t,a),!a.cancelBubble)return zt(()=>n?.call(this,a))}return e.startsWith("pointer")||e.startsWith("touch")||e==="wheel"?(i.__removed=!1,Fe(()=>{i.__removed||t.addEventListener(e,i,r)})):t.addEventListener(e,i,r),i}function pt(e,t,n,r,i){var a={capture:r,passive:i},s=Ii(e,t,n,a);(t===document.body||t===window||t===document||t instanceof HTMLMediaElement)&&$n(()=>{s.__removed=!0,t.removeEventListener(e,s,a)})}function le(e,t,n){(t[Gt]??={})[e]=n}function Lt(e){for(var t=0;t<e.length;t++)Li.add(e[t]);for(var n of Yn)n(e)}let Nn=null,jn=!1;function Kn(e){var t=this,n=t.ownerDocument,r=e.type,i=e.composedPath?.()||[],a=i[0]||e.target;Nn=e,jn||(jn=!0,setTimeout(()=>{jn=!1,Nn=null}));var s=0,o=Nn===e&&e[Gt];if(o){var l=i.indexOf(o);if(l!==-1&&(t===document||t===window)){e[Gt]=t;return}var u=i.indexOf(t);if(u===-1)return;l<=u&&(s=l)}if(a=i[s]||e.target,a!==t){Gr(e,"currentTarget",{configurable:!0,get(){return a||n}});var f=L,v=O;$e(null),Ae(null);try{for(var h,p=[];a!==null&&a!==t;){try{var c=a[Gt]?.[r];c!=null&&(!a.disabled||e.target===a)&&c.call(a,e)}catch(m){h?p.push(m):h=m}if(e.cancelBubble)break;s++,a=s<i.length?i[s]:null}if(h){for(let m of p)queueMicrotask(()=>{throw m});throw h}}finally{e[Gt]=t,delete e.currentTarget,$e(f),Ae(v)}}}const js=globalThis?.window?.trustedTypes&&globalThis.window.trustedTypes.createPolicy("svelte-trusted-html",{createHTML:e=>e});function Cs(e){return js?.createHTML(e)??e}function Fi(e){var t=cr("template");return t.innerHTML=Cs(e.replaceAll("<!>","<!---->")),t.content}function Qt(e,t){var n=O;n.nodes===null&&(n.nodes={start:e,end:t,a:null,t:null})}function R(e,t){var n=(t&Pa)!==0,r=(t&Na)!==0,i,a=!e.startsWith("<!>");return()=>{i===void 0&&(i=Fi(a?e:"<!>"+e),n||(i=bt(i)));var s=r||mi?document.importNode(i,!0):i.cloneNode(!0);if(n){var o=bt(s),l=s.lastChild;Qt(o,l)}else Qt(s,s);return s}}function Os(e,t,n="svg"){var r=!e.startsWith("<!>"),i=`<${n}>${r?e:"<!>"+e}</${n}>`,a;return()=>{if(!a){var s=Fi(i),o=bt(s);a=bt(o)}var l=a.cloneNode(!0);return Qt(l,l),l}}function Ri(e,t){return Os(e,t,"svg")}function fe(){var e=document.createDocumentFragment(),t=document.createComment(""),n=Ve();return e.append(t,n),Qt(t,n),e}function E(e,t){e!==null&&e.before(t)}function zs(e){let t=0,n=st(0),r;return()=>{dr()&&(d(n),vr(()=>(t===0&&(r=ot(()=>e(()=>Xt(n)))),t+=1,()=>{Fe(()=>{t-=1,t===0&&(r?.(),r=void 0,Xt(n))})})))}}var Ls=mt|Ct;function Is(e,t,n,r){new Fs(e,t,n,r)}class Fs{parent;is_pending=!1;transform_error;#t;#s=null;#e;#l;#r;#a=null;#n=null;#o=null;#i=null;#h=0;#u=0;#f=!1;#d=new Set;#_=new Set;#c=null;#b=zs(()=>(this.#c=st(this.#h),()=>{this.#c=null}));constructor(t,n,r,i){this.#t=t,this.#e=n,this.#l=a=>{var s=O;s.b=this,s.f|=Dn,r(a)},this.parent=O.b,this.transform_error=i??this.parent?.transform_error??(a=>a),this.#r=on(()=>{this.#y()},Ls)}#x(){try{this.#a=ve(()=>this.#l(this.#t))}catch(t){this.error(t)}}#g(t){const n=this.#e.failed,{reset:r,invoke_onerror:i}=this.#m(t);Fe(i),n&&(this.#o=ve(()=>{n(this.#t,()=>t,()=>r)}))}#m(t){var n=!1,r=!1;const i=()=>{if(n){La();return}n=!0,r&&Za(),this.#o!==null&&_t(this.#o,()=>{this.#o=null}),this.#w(()=>{this.#y()})};return{reset:i,invoke_onerror:()=>{try{r=!0,this.#e.onerror?.(t,i),r=!1}catch(s){Le(s,this.#r&&this.#r.parent)}}}}#k(){const t=this.#e.pending;t&&(this.is_pending=!0,this.#n=ve(()=>t(this.#t)),Fe(()=>{var n=this.#i=document.createDocumentFragment(),r=Ve(),i=!1;if(n.append(r),this.#a=this.#w(()=>{try{return ve(()=>this.#l(r))}catch(a){try{this.error(a),i=!0}catch(s){Le(s,this.#r.parent)}return null}}),this.#a===null){this.#i=null,i&&this.#v(j);return}this.#u===0&&(this.#t.before(n),this.#i=null,_t(this.#n,()=>{this.#n=null}),this.#v(j))}))}#y(){try{if(this.is_pending=this.has_pending_snippet(),this.#u=0,this.#h=0,this.#a=ve(()=>{this.#l(this.#t)}),this.#u>0){var t=this.#i=document.createDocumentFragment();pr(this.#a,t);const n=this.#e.pending;this.#n=ve(()=>n(this.#t))}else this.#v(j)}catch(n){this.error(n)}}#v(t){this.is_pending=!1,t.transfer_effects(this.#d,this.#_)}defer_effect(t){si(t,this.#d,this.#_)}is_rendered(){return!this.is_pending&&(!this.parent||this.parent.is_rendered())}has_pending_snippet(){return!!this.#e.pending}#w(t){var n=O,r=L,i=W;Ae(this.#r),$e(this.#r),Mt(this.#r.ctx);try{return at.ensure(),t()}finally{Ae(n),$e(r),Mt(i)}}#p(t,n){if(!this.has_pending_snippet()){this.parent&&this.parent.#p(t,n);return}this.#u+=t,this.#u===0&&(this.#v(n),this.#n&&_t(this.#n,()=>{this.#n=null}),this.#i&&(this.#t.before(this.#i),this.#i=null))}update_pending_count(t,n){this.#p(t,n),this.#h+=t,!(!this.#c||this.#f)&&(this.#f=!0,Fe(()=>{this.#f=!1,this.#c&&Pt(this.#c,this.#h)}))}get_effect_pending(){return this.#b(),d(this.#c)}error(t){if(!this.#e.onerror&&!this.#e.failed)throw t;j?.is_fork?(this.#a&&j.skip_effect(this.#a),this.#n&&j.skip_effect(this.#n),this.#o&&j.skip_effect(this.#o),j.oncommit(()=>{this.#E(t)})):this.#E(t)}#E(t){this.#a&&(re(this.#a),this.#a=null),this.#n&&(re(this.#n),this.#n=null),this.#o&&(re(this.#o),this.#o=null);let n=this.#e.failed;const r=i=>{const{reset:a,invoke_onerror:s}=this.#m(i);s(),n&&(this.#o=this.#w(()=>{try{return ve(()=>{var o=O;o.b=this,o.f|=Dn,n(this.#t,()=>i,()=>a)})}catch(o){return Le(o,this.#r.parent),null}}))};Fe(()=>{var i;try{i=this.transform_error(t)}catch(a){Le(a,this.#r&&this.#r.parent);return}i!==null&&typeof i=="object"&&typeof i.then=="function"?i.then(r,a=>Le(a,this.#r&&this.#r.parent)):r(i)})}}function q(e,t){var n=t==null?"":typeof t=="object"?`${t}`:t;n!==(e[Hn]??=e.nodeValue)&&(e[Hn]=n,e.nodeValue=`${n}`)}function Rs(e,t){return Ds(e,t)}const un=new Map;function Ds(e,{target:t,anchor:n,props:r={},events:i,context:a,intro:s=!0,transformError:o}){vs();var l=void 0,u=ms(()=>{var f=n??t.appendChild(Ve());Is(f,{pending:()=>{}},p=>{lt({});var c=W;a&&(c.c=a),i&&(r.$$events=i),l=e(p,r)||ar(),ut()},o);var v=new Set,h=p=>{for(var c=0;c<p.length;c++){var m=p[c];if(!v.has(m)){v.add(m);var _=Ns(m);for(const g of[t,document]){var b=un.get(g);b===void 0&&(b=new Map,un.set(g,b));var A=b.get(m);A===void 0?(g.addEventListener(m,Kn,{passive:_}),b.set(m,1)):b.set(m,A+1)}}}};return h(En(Li)),Yn.add(h),()=>{for(var p of v)for(const _ of[t,document]){var c=un.get(_),m=c.get(p);--m==0?(_.removeEventListener(p,Kn),c.delete(p),c.size===0&&un.delete(_)):c.set(p,m)}Yn.delete(h),f!==n&&f.parentNode?.removeChild(f)}});return qs.set(l,u),l}let qs=new WeakMap;class Di{anchor;#t=new Map;#s=new Map;#e=new Map;#l=new Set;#r=!0;constructor(t,n=!0){this.anchor=t,this.#r=n}#a=t=>{if(this.#t.has(t)){var n=this.#t.get(t),r=this.#s.get(n);if(r)yn(r),this.#l.delete(n);else{var i=this.#e.get(n);i&&(yn(i.effect),this.#s.set(n,i.effect),this.#e.delete(n),i.fragment.lastChild.remove(),this.anchor.before(i.fragment),r=i.effect)}for(const[a,s]of this.#t){if(this.#t.delete(a),a===t)break;const o=this.#e.get(s);o&&(re(o.effect),this.#e.delete(s))}for(const[a,s]of this.#s){if(a===n||this.#l.has(a))continue;const o=()=>{if(Array.from(this.#t.values()).includes(a)){var u=document.createDocumentFragment();pr(s,u),u.append(Ve()),this.#e.set(a,{effect:s,fragment:u})}else re(s);this.#l.delete(a),this.#s.delete(a)};this.#r||!r?(this.#l.add(a),_t(s,o,!1)):o()}}};#n=t=>{this.#t.delete(t);const n=Array.from(this.#t.values());for(const[r,i]of this.#e)n.includes(r)||(re(i.effect),this.#e.delete(r))};ensure(t,n){var r=j,i=wi();if(n&&!this.#s.has(t)&&!this.#e.has(t))if(i){var a=document.createDocumentFragment(),s=Ve();a.append(s),this.#e.set(t,{effect:ve(()=>n(s)),fragment:a})}else this.#s.set(t,ve(()=>n(this.anchor)));if(this.#t.set(r,t),i){for(const[o,l]of this.#s)o===t?r.unskip_effect(l):r.skip_effect(l);for(const[o,l]of this.#e)o===t?r.unskip_effect(l.effect):r.skip_effect(l.effect);r.oncommit(this.#a),r.ondiscard(this.#n)}else this.#a(r)}}function ne(e,t,n=!1){var r=new Di(e),i=n?mt:0;function a(s,o){r.ensure(s,o)}on(()=>{var s=!1;t((o,l=0)=>{s=!0,a(l,o)}),s||a(-1,null)},i)}function qi(e,t){return t}function Vs(e,t,n){for(var r=[],i=t.length,a,s=t.length,o=0;o<i;o++){let v=t[o];_t(v,()=>{if(a){if(a.pending.delete(v),a.done.add(v),a.pending.size===0){var h=e.outrogroups;Zn(e,En(a.done)),h.delete(a),h.size===0&&(e.outrogroups=null)}}else s-=1},!1)}if(s===0){var l=r.length===0&&n!==null&&e.pending.size===0;if(l){var u=n,f=u.parentNode;hs(f),f.append(u),e.items.clear()}Zn(e,t,!l)}else a={pending:new Set(t),done:new Set},(e.outrogroups??=new Set).add(a)}function Zn(e,t,n=!0){var r;if(e.pending.size>0){r=new Set;for(const s of e.pending.values())for(const o of s)r.add(e.items.get(o).e)}for(var i=0;i<t.length;i++){var a=t[i];if(r?.has(a)){a.f|=Ie;const s=document.createDocumentFragment();pr(a,s)}else re(t[i],n)}}var Nr;function tt(e,t,n,r,i,a=null){var s=e,o=new Map,l=(t&ei)!==0;if(l){var u=e;s=u.appendChild(Ve())}var f=null,v=or(()=>{var g=n();return kn(g)?g:g==null?[]:En(g)}),h,p=new Map,c=!0;function m(g){(A.effect.f&pe)===0&&(A.pending.delete(g),A.fallback=f,Hs(A,h,s,t,r),f!==null&&(h.length===0?(f.f&Ie)===0?yn(f):(f.f^=Ie,Ut(f,null,s)):_t(f,()=>{f=null})))}function _(g){A.pending.delete(g)}var b=on(()=>{h=d(v);for(var g=h.length,S=new Set,D=j,N=wi(),T=0;T<g;T+=1){var C=h[T],V=r(C,T),y=c?null:o.get(V);y?(y.v&&Pt(y.v,C),y.i&&Pt(y.i,T),N&&D.unskip_effect(y.e)):(y=Bs(o,c?s:Nr??=Ve(),C,V,T,i,t,n),c||(y.e.f|=Ie),o.set(V,y)),S.add(V)}if(g===0&&a&&!f&&(c?f=ve(()=>a(s)):(f=ve(()=>a(Nr??=Ve())),f.f|=Ie)),g>S.size&&qa(),!c)if(p.set(D,S),N){for(const[Z,J]of o)S.has(Z)||D.skip_effect(J.e);D.oncommit(m),D.ondiscard(_)}else m(D);d(v)}),A={effect:b,items:o,pending:p,outrogroups:null,fallback:f};c=!1}function Vt(e){for(;e!==null&&(e.f&Ee)===0;)e=e.next;return e}function Hs(e,t,n,r,i){var a=(r&Ea)!==0,s=t.length,o=e.items,l=Vt(e.effect.first),u,f=null,v,h=[],p=[],c,m,_,b;if(a)for(b=0;b<s;b+=1)c=t[b],m=i(c,b),_=o.get(m).e,(_.f&Ie)===0&&(_.nodes?.a?.measure(),(v??=new Set).add(_));for(b=0;b<s;b+=1){if(c=t[b],m=i(c,b),_=o.get(m).e,e.outrogroups!==null)for(const y of e.outrogroups)y.pending.delete(_),y.done.delete(_);if((_.f&he)!==0&&(yn(_),a&&(_.nodes?.a?.unfix(),(v??=new Set).delete(_))),(_.f&Ie)!==0)if(_.f^=Ie,_===l)Ut(_,null,n);else{var A=f?f.next:l;_===e.effect.last&&(e.effect.last=_.prev),_.prev&&(_.prev.next=_.next),_.next&&(_.next.prev=_.prev),Qe(e,f,_),Qe(e,_,A),Ut(_,A,n),f=_,h=[],p=[],l=Vt(f.next);continue}if(_!==l){if(u!==void 0&&u.has(_)){if(h.length<p.length){var g=p[0],S;f=g.prev;var D=h[0],N=h[h.length-1];for(S=0;S<h.length;S+=1)Ut(h[S],g,n);for(S=0;S<p.length;S+=1)u.delete(p[S]);Qe(e,D.prev,N.next),Qe(e,f,D),Qe(e,N,g),l=g,f=N,b-=1,h=[],p=[]}else u.delete(_),Ut(_,l,n),Qe(e,_.prev,_.next),Qe(e,_,f===null?e.effect.first:f.next),Qe(e,f,_),f=_;continue}for(h=[],p=[];l!==null&&l!==_;)(u??=new Set).add(l),p.push(l),l=Vt(l.next);if(l===null)continue}(_.f&Ie)===0&&h.push(_),f=_,l=Vt(_.next)}if(e.outrogroups!==null){for(const y of e.outrogroups)y.pending.size===0&&(Zn(e,En(y.done)),e.outrogroups?.delete(y));e.outrogroups.size===0&&(e.outrogroups=null)}if(l!==null||u!==void 0){var T=[];if(u!==void 0)for(_ of u)(_.f&he)===0&&T.push(_);for(;l!==null;)(l.f&he)===0&&l!==e.fallback&&T.push(l),l=Vt(l.next);var C=T.length;if(C>0){var V=(r&ei)!==0&&s===0?n:null;if(a){for(b=0;b<C;b+=1)T[b].nodes?.a?.measure();for(b=0;b<C;b+=1)T[b].nodes?.a?.fix()}Vs(e,T,V)}}a&&Fe(()=>{if(v!==void 0)for(_ of v)_.nodes?.a?.apply()})}function Bs(e,t,n,r,i,a,s,o){var l=(s&xa)!==0?(s&$a)===0?cs(n,!1,!1):st(n):null,u=(s&ka)!==0?st(i):null;return{v:l,i:u,e:ve(()=>(a(t,l??n,u??i,o),()=>{e.delete(r)}))}}function Ut(e,t,n){if(e.nodes)for(var r=e.nodes.start,i=e.nodes.end,a=t&&(t.f&Ie)===0?t.nodes.start:n;r!==null;){var s=sn(r);if(a.before(r),r===i)return;r=s}}function Qe(e,t,n){t===null?e.effect.first=n:t.next=n,n===null?e.effect.last=t:n.prev=t}function ce(e,t,n,r,i){if(t.$$host?.$$shadowRoot){const o=cr("slot");E(e,o);return}var a=t.$$slots?.[n],s=!1;a===!0&&(a=t.children,s=!0),a===void 0||a(e,s?()=>r:r)}function Ws(e,t,n,r,i,a){var s=null,o=e,l=new Di(o,!1);on(()=>{const u=t()||null;var f=ja;if(u===null){l.ensure(null,null);return}return l.ensure(u,v=>{if(u){if(s=cr(u,f),Qt(s,s),r){var h=null,p=s.appendChild(Ve());r(s,p),h?.remove()}O.nodes.end=s,v.before(s)}}),()=>{}},mt),$n(()=>{})}function Gs(e,t){var n;n=document.head.appendChild(Ve());try{on(()=>{var r=ve(()=>t(n));r.f|=Kr,Ia||(r.nodes===null?r.nodes={start:n,end:n,a:null,t:null}:r.nodes.end=n)})}finally{}}function Us(e,t){var n=void 0,r;Ei(()=>{n!==(n=t())&&(r&&(re(r),r=null),n&&(r=ve(()=>{An(()=>n(e))})))})}function Vi(e){var t,n,r="";if(typeof e=="string"||typeof e=="number")r+=e;else if(typeof e=="object")if(Array.isArray(e)){var i=e.length;for(t=0;t<i;t++)e[t]&&(n=Vi(e[t]))&&(r&&(r+=" "),r+=n)}else for(n in e)e[n]&&(r&&(r+=" "),r+=n);return r}function Ys(){for(var e,t,n=0,r="",i=arguments.length;n<i;n++)(e=arguments[n])&&(t=Vi(e))&&(r&&(r+=" "),r+=t);return r}function Hi(e){return typeof e=="object"?Ys(e):e??""}const jr=[...` 	
\r\f \v\uFEFF`];function Ks(e,t,n){var r=e==null?"":""+e;if(n){for(var i of Object.keys(n))if(n[i])r=r?r+" "+i:i;else if(r.length)for(var a=i.length,s=0;(s=r.indexOf(i,s))>=0;){var o=s+a;(s===0||jr.includes(r[s-1]))&&(o===r.length||jr.includes(r[o]))?r=(s===0?"":r.substring(0,s))+r.substring(o+1):s=o}}return r===""?null:r}function Cr(e,t=!1){var n=t?" !important;":";",r="";for(var i of Object.keys(e)){var a=e[i];a!=null&&a!==""&&(r+=" "+i+": "+a+n)}return r}function Cn(e){return e[0]!=="-"||e[1]!=="-"?e.toLowerCase():e}function Zs(e,t){if(t){var n="",r,i;if(Array.isArray(t)?(r=t[0],i=t[1]):r=t,e){e=String(e).replaceAll(/\/\*.*?\*\//g,"").trim();var a=!1,s=0,o=!1,l=[];r&&l.push(...Object.keys(r).map(Cn)),i&&l.push(...Object.keys(i).map(Cn));var u=0,f=-1;const m=e.length;for(var v=0;v<m;v++){var h=e[v];if(o?h==="/"&&e[v-1]==="*"&&(o=!1):a?a===h&&(a=!1):h==="/"&&e[v+1]==="*"?o=!0:h==='"'||h==="'"?a=h:h==="("?s++:h===")"&&s--,!o&&a===!1&&s===0){if(h===":"&&f===-1)f=v;else if(h===";"||v===m-1){if(f!==-1){var p=Cn(e.substring(u,f).trim());if(!l.includes(p)){h!==";"&&v++;var c=e.substring(u,v).trim();n+=" "+c+";"}}u=v+1,f=-1}}}}return r&&(n+=Cr(r)),i&&(n+=Cr(i,!0)),n=n.trim(),n===""?null:n}return e==null?null:String(e)}function it(e,t,n,r,i,a){var s=e[qn];if(s!==n||s===void 0){var o=Ks(n,r,a);o==null?e.removeAttribute("class"):t?e.className=o:e.setAttribute("class",o),e[qn]=n}else if(a&&i!==a)for(var l in a){var u=!!a[l];(i==null||u!==!!i[l])&&e.classList.toggle(l,u)}return a}function On(e,t={},n,r){for(var i in n){var a=n[i];t[i]!==a&&(n[i]==null?e.style.removeProperty(i):e.style.setProperty(i,a,r))}}function wt(e,t,n,r){var i=e[Vn];if(i!==t){var a=Zs(t,r);a==null?e.removeAttribute("style"):e.style.cssText=a,e[Vn]=t}else r&&(Array.isArray(r)?(On(e,n?.[0],r[0]),On(e,n?.[1],r[1],"important")):On(e,n,r));return r}function Bi(e,t){t?e.hasAttribute("selected")||e.setAttribute("selected",""):e.removeAttribute("selected")}function Or(e,t){var n=!("__defaultValue"in e);!n&&e.__defaultValue===t||(e.__defaultValue=t,Wi(e,!n||"__value"in e))}function Wi(e,t){var n=e.__defaultValue,r=e.multiple,i=r?n??[]:null;if(!(r&&!kn(i))){var a=e.selectedIndex,s=t&&r?new Set(e.selectedOptions):null;for(var o of e.options){var l=Jn(o);Bi(o,r?i.includes(l):_i(l,n))}if(t)if(s!==null)for(o of e.options){var u=s.has(o);o.selected!==u&&(o.selected=u)}else e.selectedIndex!==a&&(e.selectedIndex=a)}}function Xn(e,t,n=!1){if(e.multiple){if(t==null)return;if(!kn(t))return za();for(var r of e.options)r.selected=t.includes(Jn(r));return}for(r of e.options){var i=Jn(r);if(_i(i,t)){r.selected=!0;return}}(!n||t!==void 0)&&(e.selectedIndex=-1)}function Xs(e){var t=new MutationObserver(n=>{n.every(Js)||("__defaultValue"in e&&Wi(e,!1),"__value"in e&&Xn(e,e.__value))});t.observe(e,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["value"]}),$n(()=>{t.disconnect()})}function Jn(e){return"__value"in e?e.__value:e.value}function Js(e){if(e.target.closest("selectedcontent")!==null)return!0;if(e.type==="childList"){var t=[...e.addedNodes,...e.removedNodes];return t.length>0&&t.every(n=>n.nodeName==="SELECTEDCONTENT")}return!1}const Ht=Symbol("class"),Bt=Symbol("style"),Gi=Symbol("is custom element"),Ui=Symbol("is html"),Qs=ir?"input":"INPUT",eo=ir?"option":"OPTION",Yi=ir?"select":"SELECT";function z(e,t,n,r){var i=Ki(e);i[t]!==(i[t]=n)&&(t==="loading"&&(e[wa]=n),n==null?e.removeAttribute(t):typeof n!="string"&&Zi(e).has(t)?e[t]=n:e.setAttribute(t,n))}function to(e,t,n,r,i=!1,a=!1){var s=Ki(e),o=s[Gi],l=!s[Ui],u=t||{},f=e.nodeName===eo,v=e.nodeName===Yi;for(var h in t)!(h in n)&&h[0]+h[1]!=="$$"&&(n[h]=null);n.class?n.class=Hi(n.class):n[Ht]&&(n.class=null),n[Bt]&&(n.style??=null);var p=Zi(e);if(e.nodeName===Qs&&"type"in n&&("value"in n||"__value"in n)){var c=n.type;(c!==u.type||c===void 0&&e.hasAttribute("type"))&&(u.type=c,z(e,"type",c))}for(const N in n){let T=n[N];if(f&&N==="value"&&T==null){e.value=e.__value="",u[N]=T;continue}if(N==="class"){var m=e.namespaceURI==="http://www.w3.org/1999/xhtml";it(e,m,T,r,t?.[Ht],n[Ht]),u[N]=T,u[Ht]=n[Ht];continue}if(N==="style"){wt(e,T,t?.[Bt],n[Bt]),u[N]=T,u[Bt]=n[Bt];continue}var _=u[N];if(!(T===_&&!(T===void 0&&e.hasAttribute(N)))){u[N]=T;var b=N[0]+N[1];if(b!=="$$")if(b==="on"){const C={},V="$$"+N;let y=N.slice(2);var A=Ts(y);if($s(y)&&(y=y.slice(0,-7),C.capture=!0),!A&&_){if(T!=null)continue;e.removeEventListener(y,u[V],C),u[V]=null}if(A)le(y,e,T),Lt([y]);else if(T!=null){let Z=function(J){u[N].call(this,J)};var D=Z;u[V]=Ii(y,e,Z,C)}}else if(N==="style")z(e,N,T);else if(N==="autofocus")ts(e,!!T);else if(!o&&(N==="__value"||N==="value"&&T!=null))e.value=e.__value=T;else if(N==="selected"&&f)Bi(e,T);else{var g=N;l||(g=Ss(g));var S=g==="defaultValue"||g==="defaultChecked";if(v&&g==="defaultValue")continue;if(T==null&&!o&&!S)if(s[N]=null,g==="value"||g==="checked"){let C=e;const V=t===void 0;if(g==="value"){let y=C.defaultValue;C.removeAttribute(g),C.defaultValue=y,C.value=C.__value=V?y:null}else{let y=C.defaultChecked;C.removeAttribute(g),C.defaultChecked=y,C.checked=V?y:!1}}else e.removeAttribute(N);else S||(o||typeof T!="string")&&p.has(g)?(e[g]=T,g in s&&(s[g]=X)):typeof T!="function"&&z(e,g,T)}}}return u}function zr(e,t,n=[],r=[],i=[],a,s=!1,o=!1){oi(i,n,r,l=>{var u=void 0,f={},v=e.nodeName===Yi,h=!1;if(Ei(()=>{var c=t(...l.map(d)),m=to(e,u,c,a,s,o);if(h&&v){var _=e;"defaultValue"in c&&Or(_,c.defaultValue),"value"in c&&Xn(_,c.value)}for(let A of Object.getOwnPropertySymbols(f))c[A]||re(f[A]);for(let A of Object.getOwnPropertySymbols(c)){var b=c[A];A.description===Ca&&(!u||b!==u[A])&&(f[A]&&re(f[A]),f[A]=ve(()=>Us(e,()=>b))),m[A]=b}u=m}),v){var p=e;An(()=>{var c=u;"defaultValue"in c&&Or(p,c.defaultValue),Xn(p,c.value,!0),Xs(p)})}h=!0})}function Ki(e){return e[Qr]??={[Gi]:e.nodeName.includes("-"),[Ui]:e.namespaceURI===ni}}var Lr=new Map;function Zi(e){var t=e.getAttribute("is")||e.nodeName,n=Lr.get(t);if(n)return n;Lr.set(t,n=new Set);for(var r,i=e,a=Element.prototype;a!==i;){r=Ur(i);for(var s in r)r[s].set&&s!=="innerHTML"&&s!=="textContent"&&s!=="innerText"&&n.add(s);i=tr(i)}return n}function no(e,t,n=t){var r=new WeakSet;rs(e,"input",async i=>{var a=i?e.defaultValue:e.value;if(a=zn(e)?Ln(a):a,n(a),j!==null&&r.add(j),await Es(),a!==(a=t())){var s=e.selectionStart,o=e.selectionEnd,l=e.value.length;if(e.value=a??"",o!==null){var u=e.value.length;s===o&&o===l&&u>l?(e.selectionStart=u,e.selectionEnd=u):(e.selectionStart=s,e.selectionEnd=Math.min(o,u))}}}),ot(t)==null&&e.value&&(n(zn(e)?Ln(e.value):e.value),j!==null&&r.add(j)),vr(()=>{var i=t();if(e===document.activeElement){var a=j;if(r.has(a))return}zn(e)&&i===Ln(e.value)||e.type==="date"&&!i&&!e.value||i!==e.value&&(e.value=i??"")})}function zn(e){var t=e.type;return t==="number"||t==="range"}function Ln(e){return e===""?null:+e}function In(e,t){return e===t||e?.[De]===t}function wn(e=ar(),t,n,r){var i=W.r,a=O;return An(()=>{var s,o;return vr(()=>{s=o,o=[],ot(()=>{In(n(...o),e)||(t(e,...o),s&&In(n(...s),e)&&t(null,...s))})}),()=>{let l=a;for(;l!==i&&l.parent!==null&&l.parent.f&pn;)l=l.parent;const u=()=>{o&&In(n(...o),e)&&t(null,...o)},f=l.teardown;l.teardown=()=>{u(),f?.()}}}),e}function ro(e=!1){const t=W,n=t.l.u;if(!n)return;let r=()=>$t(t.s);if(e){let i=0,a={};const s=St(()=>{let o=!1;const l=t.s;for(const u in l)l[u]!==a[u]&&(a[u]=l[u],o=!0);return o&&i++,i});r=()=>d(s)}n.b.length&&gs(()=>{Ir(t,r),Rn(n.b)}),yt(()=>{const i=ot(()=>n.m.map(ba));return()=>{for(const a of i)typeof a=="function"&&a()}}),n.a.length&&yt(()=>{Ir(t,r),Rn(n.a)})}function Ir(e,t){if(e.l.s)for(const n of e.l.s)d(n);t()}let fn=!1;function io(e){var t=fn;try{return fn=!1,[e(),fn]}finally{fn=t}}const ao={get(e,t){if(!e.exclude.includes(t))return d(e.version),t in e.special?e.special[t]():e.props[t]},set(e,t,n){if(!(t in e.special)){var r=O;try{Ae(e.parent_effect),e.special[t]=te({get[t](){return e.props[t]}},t,ti)}finally{Ae(r)}}return e.special[t](n),$r(e.version),!0},getOwnPropertyDescriptor(e,t){if(!e.exclude.includes(t)&&t in e.props)return{enumerable:!0,configurable:!0,value:e.props[t]}},deleteProperty(e,t){return e.exclude.includes(t)||(e.exclude.push(t),$r(e.version)),!0},has(e,t){return e.exclude.includes(t)?!1:t in e.props},ownKeys(e){return Reflect.ownKeys(e.props).filter(t=>!e.exclude.includes(t))}};function ie(e,t){return new Proxy({props:e,exclude:t,special:{},version:st(0),parent_effect:O},ao)}const so={get(e,t){let n=e.props.length;for(;n--;){let r=e.props[n];if(qt(r)&&(r=r()),typeof r=="object"&&r!==null&&t in r)return r[t]}},set(e,t,n){let r=e.props.length;for(;r--;){let i=e.props[r];qt(i)&&(i=i());const a=nt(i,t);if(a&&a.set)return a.set(n),!0}return!1},getOwnPropertyDescriptor(e,t){let n=e.props.length;for(;n--;){let r=e.props[n];if(qt(r)&&(r=r()),typeof r=="object"&&r!==null&&t in r){const i=nt(r,t);return i&&!i.configurable&&(i.configurable=!0),i}}},has(e,t){if(t===De||t===Jr)return!1;for(let n of e.props)if(qt(n)&&(n=n()),n!=null&&t in n)return!0;return!1},ownKeys(e){const t=[];for(let n of e.props)if(qt(n)&&(n=n()),!!n){for(const r in n)t.includes(r)||t.push(r);for(const r of Object.getOwnPropertySymbols(n))t.includes(r)||t.push(r)}return t}};function _e(...e){return new Proxy({props:e},so)}function te(e,t,n,r){var i=!Ot||(n&Ta)!==0,a=(n&Ma)!==0,s=(n&Sa)!==0,o=r,l=!0,u=void 0,f=()=>s&&i?(u??=St(r),d(u)):(l&&(l=!1,o=s?ot(r):r),o);let v;if(a){var h=De in e||Jr in e;v=nt(e,t)?.set??(h&&t in e?S=>e[t]=S:void 0)}var p,c=!1;a?[p,c]=io(()=>e[t]):p=e[t],p===void 0&&r!==void 0&&(p=f(),v&&(i&&Ga(),v(p)));var m;if(i?m=()=>{var S=e[t];return S===void 0?f():(l=!0,S)}:m=()=>{var S=e[t];return S!==void 0&&(o=void 0),S===void 0?o:S},i&&(n&ti)===0)return m;if(v){var _=e.$$legacy;return(function(S,D){return arguments.length>0?((!i||!D||_||c)&&v(D?m():S),S):m()})}var b=!1,A=((n&Aa)!==0?St:or)(()=>(b=!1,m()));a&&d(A);var g=O;return(function(S,D){if(arguments.length>0){const N=D?d(A):i&&a?ke(S):S;return k(A,N),b=!0,o!==void 0&&(o=N),S}return Ke&&b||(g.f&pe)!==0?A.v:d(A)})}function oo(e){W===null&&Ra(),Ot&&W.l!==null?lo(W).m.push(e):yt(()=>{const t=ot(e);if(typeof t=="function")return t})}function lo(e){var t=e.l;return t.u??={a:[],b:[],m:[]}}const uo="5";typeof window<"u"&&((window.__svelte??={}).v??=new Set).add(uo);Ja();/**
 * @license lucide-svelte v0.544.0 - ISC
 *
 * ISC License
 * 
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
 * 
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 * 
 * ---
 * 
 * The MIT License (MIT) (for portions derived from Feather)
 * 
 * Copyright (c) 2013-2023 Cole Bemis
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 */const fo={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};var co=Ri("<svg><!><!></svg>");function ge(e,t){const n=ie(t,["children","$$slots","$$events","$$legacy"]),r=ie(n,["name","color","size","strokeWidth","absoluteStrokeWidth","iconNode"]);lt(t,!1);let i=te(t,"name",8,void 0),a=te(t,"color",8,"currentColor"),s=te(t,"size",8,24),o=te(t,"strokeWidth",8,2),l=te(t,"absoluteStrokeWidth",8,!1),u=te(t,"iconNode",24,()=>[]);const f=(...c)=>c.filter((m,_,b)=>!!m&&b.indexOf(m)===_).join(" ");ro();var v=co();zr(v,(c,m)=>({...fo,...r,width:s(),height:s(),stroke:a(),"stroke-width":c,class:m}),[()=>($t(l()),$t(o()),$t(s()),ot(()=>l()?Number(o())*24/Number(s()):o())),()=>($t(i()),$t(n),ot(()=>f("lucide-icon","lucide",i()?`lucide-${i()}`:"",n.class)))]);var h=P(v);tt(h,1,u,qi,(c,m)=>{var _=Re(()=>ya(d(m),2));let b=()=>d(_)[0],A=()=>d(_)[1];var g=fe(),S=K(g);Ws(S,b,!0,(D,N)=>{zr(D,()=>({...A()}))}),E(c,g)});var p=x(h);ce(p,t,"default",{}),E(e,v),ut()}function vo(e,t){const n=ie(t,["children","$$slots","$$events","$$legacy"]);/**
 * @license lucide-svelte v0.544.0 - ISC
 *
 * ISC License
 *
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * ---
 *
 * The MIT License (MIT) (for portions derived from Feather)
 *
 * Copyright (c) 2013-2023 Cole Bemis
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */const r=[["path",{d:"M20 6 9 17l-5-5"}]];ge(e,_e({name:"check"},()=>n,{get iconNode(){return r},children:(i,a)=>{var s=fe(),o=K(s);ce(o,t,"default",{}),E(i,s)},$$slots:{default:!0}}))}function ho(e,t){const n=ie(t,["children","$$slots","$$events","$$legacy"]);/**
 * @license lucide-svelte v0.544.0 - ISC
 *
 * ISC License
 *
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * ---
 *
 * The MIT License (MIT) (for portions derived from Feather)
 *
 * Copyright (c) 2013-2023 Cole Bemis
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */const r=[["path",{d:"m6 9 6 6 6-6"}]];ge(e,_e({name:"chevron-down"},()=>n,{get iconNode(){return r},children:(i,a)=>{var s=fe(),o=K(s);ce(o,t,"default",{}),E(i,s)},$$slots:{default:!0}}))}function po(e,t){const n=ie(t,["children","$$slots","$$events","$$legacy"]);/**
 * @license lucide-svelte v0.544.0 - ISC
 *
 * ISC License
 *
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * ---
 *
 * The MIT License (MIT) (for portions derived from Feather)
 *
 * Copyright (c) 2013-2023 Cole Bemis
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */const r=[["path",{d:"M12 15V3"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"}],["path",{d:"m7 10 5 5 5-5"}]];ge(e,_e({name:"download"},()=>n,{get iconNode(){return r},children:(i,a)=>{var s=fe(),o=K(s);ce(o,t,"default",{}),E(i,s)},$$slots:{default:!0}}))}function _o(e,t){const n=ie(t,["children","$$slots","$$events","$$legacy"]);/**
 * @license lucide-svelte v0.544.0 - ISC
 *
 * ISC License
 *
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * ---
 *
 * The MIT License (MIT) (for portions derived from Feather)
 *
 * Copyright (c) 2013-2023 Cole Bemis
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */const r=[["path",{d:"M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"}]];ge(e,_e({name:"heart"},()=>n,{get iconNode(){return r},children:(i,a)=>{var s=fe(),o=K(s);ce(o,t,"default",{}),E(i,s)},$$slots:{default:!0}}))}function go(e,t){const n=ie(t,["children","$$slots","$$events","$$legacy"]);/**
 * @license lucide-svelte v0.544.0 - ISC
 *
 * ISC License
 *
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * ---
 *
 * The MIT License (MIT) (for portions derived from Feather)
 *
 * Copyright (c) 2013-2023 Cole Bemis
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */const r=[["path",{d:"M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"}],["path",{d:"M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"}],["path",{d:"M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"}]];ge(e,_e({name:"layers"},()=>n,{get iconNode(){return r},children:(i,a)=>{var s=fe(),o=K(s);ce(o,t,"default",{}),E(i,s)},$$slots:{default:!0}}))}function mo(e,t){const n=ie(t,["children","$$slots","$$events","$$legacy"]);/**
 * @license lucide-svelte v0.544.0 - ISC
 *
 * ISC License
 *
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * ---
 *
 * The MIT License (MIT) (for portions derived from Feather)
 *
 * Copyright (c) 2013-2023 Cole Bemis
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */const r=[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56"}]];ge(e,_e({name:"loader-circle"},()=>n,{get iconNode(){return r},children:(i,a)=>{var s=fe(),o=K(s);ce(o,t,"default",{}),E(i,s)},$$slots:{default:!0}}))}function bo(e,t){const n=ie(t,["children","$$slots","$$events","$$legacy"]);/**
 * @license lucide-svelte v0.544.0 - ISC
 *
 * ISC License
 *
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * ---
 *
 * The MIT License (MIT) (for portions derived from Feather)
 *
 * Copyright (c) 2013-2023 Cole Bemis
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */const r=[["path",{d:"M5.8 11.3 2 22l10.7-3.79"}],["path",{d:"M4 3h.01"}],["path",{d:"M22 8h.01"}],["path",{d:"M15 2h.01"}],["path",{d:"M22 20h.01"}],["path",{d:"m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"}],["path",{d:"m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17"}],["path",{d:"m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7"}],["path",{d:"M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z"}]];ge(e,_e({name:"party-popper"},()=>n,{get iconNode(){return r},children:(i,a)=>{var s=fe(),o=K(s);ce(o,t,"default",{}),E(i,s)},$$slots:{default:!0}}))}function yo(e,t){const n=ie(t,["children","$$slots","$$events","$$legacy"]);/**
 * @license lucide-svelte v0.544.0 - ISC
 *
 * ISC License
 *
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * ---
 *
 * The MIT License (MIT) (for portions derived from Feather)
 *
 * Copyright (c) 2013-2023 Cole Bemis
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */const r=[["path",{d:"m12 9-8.414 8.414A2 2 0 0 0 3 18.828v1.344a2 2 0 0 1-.586 1.414A2 2 0 0 1 3.828 21h1.344a2 2 0 0 0 1.414-.586L15 12"}],["path",{d:"m18 9 .4.4a1 1 0 1 1-3 3l-3.8-3.8a1 1 0 1 1 3-3l.4.4 3.4-3.4a1 1 0 1 1 3 3z"}],["path",{d:"m2 22 .414-.414"}]];ge(e,_e({name:"pipette"},()=>n,{get iconNode(){return r},children:(i,a)=>{var s=fe(),o=K(s);ce(o,t,"default",{}),E(i,s)},$$slots:{default:!0}}))}function wo(e,t){const n=ie(t,["children","$$slots","$$events","$$legacy"]);/**
 * @license lucide-svelte v0.544.0 - ISC
 *
 * ISC License
 *
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * ---
 *
 * The MIT License (MIT) (for portions derived from Feather)
 *
 * Copyright (c) 2013-2023 Cole Bemis
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */const r=[["path",{d:"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"}]];ge(e,_e({name:"sparkle"},()=>n,{get iconNode(){return r},children:(i,a)=>{var s=fe(),o=K(s);ce(o,t,"default",{}),E(i,s)},$$slots:{default:!0}}))}function xo(e,t){const n=ie(t,["children","$$slots","$$events","$$legacy"]);/**
 * @license lucide-svelte v0.544.0 - ISC
 *
 * ISC License
 *
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * ---
 *
 * The MIT License (MIT) (for portions derived from Feather)
 *
 * Copyright (c) 2013-2023 Cole Bemis
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */const r=[["path",{d:"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"}],["path",{d:"M20 2v4"}],["path",{d:"M22 4h-4"}],["circle",{cx:"4",cy:"20",r:"2"}]];ge(e,_e({name:"sparkles"},()=>n,{get iconNode(){return r},children:(i,a)=>{var s=fe(),o=K(s);ce(o,t,"default",{}),E(i,s)},$$slots:{default:!0}}))}function ko(e,t){const n=ie(t,["children","$$slots","$$events","$$legacy"]);/**
 * @license lucide-svelte v0.544.0 - ISC
 *
 * ISC License
 *
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * ---
 *
 * The MIT License (MIT) (for portions derived from Feather)
 *
 * Copyright (c) 2013-2023 Cole Bemis
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */const r=[["path",{d:"M10 11v6"}],["path",{d:"M14 11v6"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"}],["path",{d:"M3 6h18"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"}]];ge(e,_e({name:"trash-2"},()=>n,{get iconNode(){return r},children:(i,a)=>{var s=fe(),o=K(s);ce(o,t,"default",{}),E(i,s)},$$slots:{default:!0}}))}function Eo(e,t){const n=ie(t,["children","$$slots","$$events","$$legacy"]);/**
 * @license lucide-svelte v0.544.0 - ISC
 *
 * ISC License
 *
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * ---
 *
 * The MIT License (MIT) (for portions derived from Feather)
 *
 * Copyright (c) 2013-2023 Cole Bemis
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */const r=[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"}],["path",{d:"M16 9a5 5 0 0 1 0 6"}],["path",{d:"M19.364 18.364a9 9 0 0 0 0-12.728"}]];ge(e,_e({name:"volume-2"},()=>n,{get iconNode(){return r},children:(i,a)=>{var s=fe(),o=K(s);ce(o,t,"default",{}),E(i,s)},$$slots:{default:!0}}))}function $o(e,t){const n=ie(t,["children","$$slots","$$events","$$legacy"]);/**
 * @license lucide-svelte v0.544.0 - ISC
 *
 * ISC License
 *
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * ---
 *
 * The MIT License (MIT) (for portions derived from Feather)
 *
 * Copyright (c) 2013-2023 Cole Bemis
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */const r=[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"}],["line",{x1:"22",x2:"16",y1:"9",y2:"15"}],["line",{x1:"16",x2:"22",y1:"9",y2:"15"}]];ge(e,_e({name:"volume-x"},()=>n,{get iconNode(){return r},children:(i,a)=>{var s=fe(),o=K(s);ce(o,t,"default",{}),E(i,s)},$$slots:{default:!0}}))}function Ao(e,t){const n=ie(t,["children","$$slots","$$events","$$legacy"]);/**
 * @license lucide-svelte v0.544.0 - ISC
 *
 * ISC License
 *
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * ---
 *
 * The MIT License (MIT) (for portions derived from Feather)
 *
 * Copyright (c) 2013-2023 Cole Bemis
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */const r=[["path",{d:"m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"}],["path",{d:"m14 7 3 3"}],["path",{d:"M5 6v4"}],["path",{d:"M19 14v4"}],["path",{d:"M10 2v2"}],["path",{d:"M7 8H3"}],["path",{d:"M21 16h-4"}],["path",{d:"M11 3H9"}]];ge(e,_e({name:"wand-sparkles"},()=>n,{get iconNode(){return r},children:(i,a)=>{var s=fe(),o=K(s);ce(o,t,"default",{}),E(i,s)},$$slots:{default:!0}}))}function Fr(e,t){const n=ie(t,["children","$$slots","$$events","$$legacy"]);/**
 * @license lucide-svelte v0.544.0 - ISC
 *
 * ISC License
 *
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2023 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2025.
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * ---
 *
 * The MIT License (MIT) (for portions derived from Feather)
 *
 * Copyright (c) 2013-2023 Cole Bemis
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */const r=[["path",{d:"M18 6 6 18"}],["path",{d:"m6 6 12 12"}]];ge(e,_e({name:"x"},()=>n,{get iconNode(){return r},children:(i,a)=>{var s=fe(),o=K(s);ce(o,t,"default",{}),E(i,s)},$$slots:{default:!0}}))}let et=null,Be=null,Tn=!1;function _r(){if(typeof window>"u")return null;const e=window.AudioContext??window.webkitAudioContext;return e?(et||(et=new e,Be=et.createGain(),Be.gain.value=.28,Be.connect(et.destination)),et):null}function en(){const e=_r();e&&e.state==="suspended"&&e.resume()}function To(e){Tn=e,Be&&et&&(Be.gain.cancelScheduledValues(et.currentTime),Be.gain.linearRampToValueAtTime(e?0:.28,et.currentTime+.08))}function Mo(){return Tn}function Mn({from:e,to:t,duration:n,type:r="sine",peak:i=.9,resonance:a=.8,filterAt:s}){const o=_r();if(!o||!Be||Tn)return;const l=o.currentTime,u=o.createOscillator(),f=o.createGain();u.type=r,u.frequency.setValueAtTime(e,l),u.frequency.exponentialRampToValueAtTime(Math.max(1,t),l+n),f.gain.setValueAtTime(1e-4,l),f.gain.exponentialRampToValueAtTime(i,l+n*.18),f.gain.exponentialRampToValueAtTime(1e-4,l+n);let v=f;if(s){const h=o.createBiquadFilter();h.type="lowpass",h.frequency.setValueAtTime(s,l),h.Q.value=a,f.connect(h),v=h}u.connect(f),v.connect(Be),u.start(l),u.stop(l+n+.02)}function tn(){Mn({from:650,to:900,duration:.045,peak:.35})}function Xi(){Mn({from:500,to:180,duration:.16,peak:.85,resonance:6,filterAt:900})}function Qn(){Mn({from:420,to:80,duration:.03,type:"triangle",peak:.8,resonance:12})}const So=[1046.5,1318.51,1567.98,2093];function Po(){const e=_r();!e||!Be||Tn||So.forEach((t,n)=>{const r=e.currentTime+n*.11,i=e.createOscillator(),a=e.createGain();i.type="triangle",i.frequency.setValueAtTime(t,r),a.gain.setValueAtTime(1e-4,r),a.gain.exponentialRampToValueAtTime(.55,r+.02),a.gain.exponentialRampToValueAtTime(1e-4,r+.34),i.connect(a),a.connect(Be),i.start(r),i.stop(r+.36)})}function Rr(){Mn({from:320,to:120,duration:.22,type:"sine",peak:.5,filterAt:700})}var No=R('<label class="flex items-center gap-2 text-xs font-bold text-[#6b4a8a]"><span class="sr-only">background colour to remove</span> <input type="color" class="h-7 w-10 cursor-pointer rounded-md border-0 bg-transparent p-0"/> <span class="font-mono normal-case"> </span></label>'),jo=R('<p class="text-xs text-[#7c6290]">reads the edge of your file, so it wants a fairly flat backdrop</p>'),Co=R('<div class="flex w-full flex-wrap items-center gap-2 rounded-2xl bg-lavender/40 px-3 py-2"><div class="flex items-center gap-1" role="group" aria-label="how to find the background"><button type="button">find it for me</button> <button type="button"><!> <span>this colour</span></button></div> <!></div> <p class="w-full text-[11px] text-[#9c85ab]"> </p>',1),Oo=R('<div class="mt-3 flex flex-wrap items-center gap-2"><button type="button" title="key the background out and keep transparency"><!> <span>pop the background out</span></button> <!></div>');function zo(e,t){lt(t,!0);let n=te(t,"enabled",15,!1),r=te(t,"mode",15,"auto"),i=te(t,"color",15,"#00ff00"),a=te(t,"onpulse",3,()=>{});const s=["webm","gif","webp","png","apng"];var o=Oo(),l=P(o),u=P(l);Ao(u,{size:"14"});var f=x(l,2);{var v=h=>{var p=Co(),c=K(p),m=P(c),_=P(m),b=x(_,2),A=P(b);yo(A,{size:"12"});var g=x(m,2);{var S=C=>{var V=No(),y=x(P(V),2),Z=x(y,2),J=H(Z,!0);B(()=>q(J,i())),no(y,i),E(C,V)},D=C=>{var V=jo();E(C,V)};ne(g,C=>{r()==="color"?C(S):C(D,-1)})}var N=x(c,2),T=H(N);B(C=>{it(_,1,`pill text-xs ${r()==="auto"?"bg-bubblegum/70 text-white":"bg-cream/70 text-[#6b4a8a]"}`),z(_,"aria-pressed",r()==="auto"),it(b,1,`pill flex items-center gap-1 text-xs ${r()==="color"?"bg-bubblegum/70 text-white":"bg-cream/70 text-[#6b4a8a]"}`),z(b,"aria-pressed",r()==="color"),q(T,`transparency survives in ${C??""} — pick one of those to turn this on`)},[()=>s.join(", ")]),le("click",_,()=>r("auto")),le("click",b,()=>r("color")),E(h,p)};ne(f,h=>{n()&&h(v)})}B(()=>{it(l,1,`pill flex items-center gap-1.5 transition-colors ${n()?"bg-mint/60 text-[#0c4a44]":"bg-cream/80 text-[#6b4a8a]"}`),z(l,"aria-pressed",n())}),le("click",l,()=>{n(!n()),a()()}),pt("mouseenter",l,function(...h){tn?.apply(this,h)}),E(e,o),ut()}Lt(["click"]);var Lo=Ri('<svg viewBox="0 0 64 64" focusable="false"><g stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="M17 25 12 7.5 28.5 16.5Z"></path><path d="M47 25 52 7.5 35.5 16.5Z"></path><ellipse cx="32" cy="36" rx="21" ry="18"></ellipse></g><path fill="#ffa6d5" d="M17.8 21.6 15.4 12.6 23.4 16.8Z"></path><path fill="#ffa6d5" d="M46.2 21.6 48.6 12.6 40.6 16.8Z"></path><ellipse cx="20.6" cy="41.4" rx="4.1" ry="2.4" fill="#ffa6d5" opacity="0.75"></ellipse><ellipse cx="43.4" cy="41.4" rx="4.1" ry="2.4" fill="#ffa6d5" opacity="0.75"></ellipse><ellipse cx="25" cy="35" rx="3.1" ry="4.1"></ellipse><ellipse cx="39" cy="35" rx="3.1" ry="4.1"></ellipse><circle cx="26.2" cy="33.2" r="1.2" fill="#fff"></circle><circle cx="40.2" cy="33.2" r="1.2" fill="#fff"></circle><path fill="#ff62a5" d="M32 40.4 34.3 42.9a1.15 1.15 0 0 1-.9 1.9h-2.8a1.15 1.15 0 0 1-.9-1.9Z"></path><g fill="none" stroke-width="1.6" stroke-linecap="round"><path d="M32 44.9v1.3"></path><path d="M32 46.2q-3.1 3.3-6.5.4"></path><path d="M32 46.2q3.1 3.3 6.5.4"></path></g><g stroke-width="1.4" stroke-linecap="round" opacity="0.8"><path d="M2.6 31.6l9.6 1.9"></path><path d="M2.6 39.4l9.6-1.6"></path><path d="M61.4 31.6l-9.6 1.9"></path><path d="M61.4 39.4l-9.6-1.6"></path></g></svg>');function Ji(e,t){let n=te(t,"size",3,46),r=te(t,"label",3,""),i=te(t,"class",3,"");const a="#c084fc",s="#faf7fd",o="#4a3557";var l=Lo(),u=P(l);z(u,"stroke",a);var f=P(u);z(f,"fill",s);var v=x(f);z(v,"fill",s);var h=x(v);z(h,"fill",s);var p=x(u,5);z(p,"fill",o);var c=x(p);z(c,"fill",o);var m=x(c,4);z(m,"stroke",o);var _=x(m);z(_,"stroke",a),B(()=>{z(l,"width",n()),z(l,"height",n()),it(l,0,Hi(i())),z(l,"role",r()?"img":void 0),z(l,"aria-label",r()||void 0),z(l,"aria-hidden",r()?void 0:"true")}),E(e,l)}const It="";async function Ft(e){if(!e.ok){let t=`${e.status} ${e.statusText}`;try{const n=await e.json();n?.error&&(t=n.error)}catch{}throw new Error(t)}return await e.json()}function Io(e,t,n){const r=new FormData;r.append("file",e,e.name);for(const[i,a]of Object.entries(t))a==null||a===!1||r.append(i,String(a));return fetch(`${It}/api/jobs`,{method:"POST",body:r,signal:n}).then(Ft)}function Fo(e,t,n={}){const r=new FormData;r.append("file",e,e.name),r.append("pack",t);for(const[i,a]of Object.entries(n))a==null||a===!1||r.append(i,String(a));return fetch(`${It}/api/sticker-packs`,{method:"POST",body:r}).then(Ft)}function Ro(e){const t=new FormData;return t.append("file",e,e.name),fetch(`${It}/api/probe`,{method:"POST",body:t}).then(Ft)}function Dr(e=50){return fetch(`${It}/api/jobs?limit=${e}`).then(Ft)}function Do(){return fetch(`${It}/api/packs`).then(Ft)}function qr(e){return fetch(`${It}/api/jobs/${e}`,{method:"DELETE"}).then(Ft)}function qo(e,t){let n=null,r=!1,i=!1,a=0,s;const o=()=>`${location.protocol==="https:"?"wss":"ws"}://${location.host}/ws/jobs`,l=()=>{r||(n=new WebSocket(o()),n.onopen=()=>{a=0,i&&t?.(),i=!0},n.onmessage=u=>{try{e(JSON.parse(u.data))}catch{}},n.onclose=()=>{r||(a=Math.min(a+1,6),s=setTimeout(l,400*a))},n.onerror=()=>n?.close())};return l(),()=>{r=!0,s&&clearTimeout(s),n?.close()}}const Vr=["#FF62A5","#FFA6D5","#6EE7B7","#67E8F9","#FDE047","#C084FC","#FDBA74"],Hr=["heart","star","sparkle","bubble"];let Yt=[],xn=null,Se=null;function Qi(){if(Se)return Se;Se=document.createElement("canvas"),Se.setAttribute("aria-hidden","true"),Object.assign(Se.style,{position:"fixed",inset:"0",width:"100%",height:"100%",pointerEvents:"none",zIndex:"50"}),document.body.appendChild(Se);const e=()=>{if(!Se)return;const t=Math.min(devicePixelRatio||1,2);Se.width=innerWidth*t,Se.height=innerHeight*t,Se.getContext("2d")?.setTransform(t,0,0,t,0,0)};return e(),addEventListener("resize",e),Se}function Vo(e,t){const{size:n}=t;switch(e.beginPath(),t.shape){case"heart":{const r=n/16;e.moveTo(0,4*r),e.bezierCurveTo(-8*r,-6*r,-2*r,-10*r,0,-4*r),e.bezierCurveTo(2*r,-10*r,8*r,-6*r,0,4*r);break}case"star":{const i=n/2,a=i*.45;for(let s=0;s<10;s++){const o=s%2===0?i:a,l=Math.PI*s/5-Math.PI/2,u=Math.cos(l)*o,f=Math.sin(l)*o;s===0?e.moveTo(u,f):e.lineTo(u,f)}e.closePath();break}case"sparkle":{const r=n/2;e.moveTo(0,-r),e.quadraticCurveTo(0,0,r,0),e.quadraticCurveTo(0,0,0,r),e.quadraticCurveTo(0,0,-r,0),e.quadraticCurveTo(0,0,0,-r);break}default:e.arc(0,0,n/2,0,Math.PI*2)}}function ea(){const t=Qi().getContext("2d");if(t){t.clearRect(0,0,innerWidth,innerHeight),Yt=Yt.filter(n=>n.life>0&&n.y<innerHeight+60);for(const n of Yt)n.vy+=.16,n.vx*=.992,n.x+=n.vx,n.y+=n.vy,n.rotation+=n.spin,n.life-=1,t.save(),t.translate(n.x,n.y),t.rotate(n.rotation),t.globalAlpha=Math.max(0,Math.min(1,n.life/40)),t.fillStyle=n.color,t.shadowColor=n.color,t.shadowBlur=10,Vo(t,n),t.fill(),t.restore();Yt.length>0?xn=requestAnimationFrame(ea):(xn=null,t.clearRect(0,0,innerWidth,innerHeight))}}function Ho(e=140,t){if(Bo())return;Qi().getContext("2d");const r=innerWidth/2,i=innerHeight/2;for(let a=0;a<e;a++){const s=Math.random()*Math.PI*2,o=4+Math.random()*11;Yt.push({x:r,y:i,vx:Math.cos(s)*o,vy:Math.sin(s)*o-5,spin:(Math.random()-.5)*.32,rotation:Math.random()*Math.PI,size:8+Math.random()*14,color:Vr[Math.random()*Vr.length|0],shape:Hr[Math.random()*Hr.length|0],life:90+Math.random()*70})}xn===null&&(xn=requestAnimationFrame(ea))}function Bo(){return matchMedia("(prefers-reduced-motion: reduce)").matches}const er="Elive",oe={loaded:()=>"Yay! What an adorable file! Let’s give it a makeover!",baking:()=>Fn(["Whipping up cute frames… adding fairy dust…","Baking your stickers in the pastel oven…","Tucking every pixel into its little bed…","Sprinkling a bit more sparkle on this one…"]),done:()=>Fn(["Tada! All dressed up and ready to sparkle in your chats!","It’s perfect now! Go show your group chat.","Wrapped with a bow and everything. Yours!"]),tooBig:()=>"Uh-oh, Telegram says this sticker ate too many treats! Let me trim it down so it fits perfectly!",failed:e=>Fn([`Oops, that one got away from me: ${e}`,`Hmm, I tripped over this one: ${e}`]),queued:()=>"Saving a spot for your file, one sec!"};function Fn(e){return e[Math.random()*e.length|0]}function Wo(){let e=F(ke([])),t=F(ke([])),n=F(!1),r=F("Drop anything and I’ll make it fit ♡"),i=F(null),a=F(!1),s=F("");const o=c=>{const m=d(e).findIndex(_=>_.id===c.id);m!==-1&&(d(e)[m]={...d(e)[m],...c})};qo(c=>{if(c.job_id)switch(c.type){case"queued":o({id:c.job_id,status:"queued",quip:oe.queued()});break;case"started":o({id:c.job_id,status:"processing",quip:oe.baking()});break;case"progress":o({id:c.job_id,status:"processing",progress_pct:c.pct??0,output_size:c.size_bytes??0});break;case"waveform":o({id:c.job_id,peaks:c.peaks});break;case"complete":{const m=d(e).find(_=>_.id===c.job_id);o({id:c.job_id,status:"completed",progress_pct:100,output_size:c.size_bytes??m?.output_size??0,quip:oe.done()}),Po(),Ho(),k(r,oe.done(),!0);break}case"error":o({id:c.job_id,status:"failed",error:c.message??"unknown"}),Rr(),k(s,c.message??"something went sideways",!0),k(r,oe.failed(d(s)),!0);break}},u);async function u(){try{const c=await Dr(60);for(const m of c.jobs)o(m)}catch{}}const f=async()=>{const[c,m]=await Promise.all([Dr(60),Do()]);k(e,c.jobs.map(_=>({..._,nickname:_.source_filename,quip:""})),!0),k(t,m,!0)},v=async(c,m,_={})=>{k(s,""),k(n,!0),k(r,oe.loaded(),!0),Xi();try{const b=await Io(c,{target_format:m,..._});k(e,[{...b,nickname:c.name,quip:oe.queued()},...d(e)],!0)}catch(b){p(b)}finally{k(n,!1)}},h=async(c,m,_={})=>{k(s,""),k(n,!0),Qn(),k(r,oe.baking(),!0);try{const b=await Fo(c,m,_);k(e,[{...b,nickname:c.name,quip:oe.queued()},...d(e)],!0)}catch(b){p(b)}finally{k(n,!1)}},p=c=>{const m=c instanceof Error?c.message:String(c);k(s,m,!0),k(r,/too large|size limit/i.test(m)?oe.tooBig():oe.failed(m),!0),Rr()};return{get jobs(){return d(e)},get available(){return d(t)},get busy(){return d(n)},get statusLine(){return d(r)},set statusLine(c){k(r,c,!0)},get lastInfo(){return d(i)},set lastInfo(c){k(i,c,!0)},get error(){return d(s)},get mutesAudio(){return d(a)},set mutesAudio(c){k(a,c,!0)},hydrate:f,submit:v,submitPack:h}}const se=Wo();var Go=R('<span class="absolute inset-0 rounded-full border-4 border-bubblegum/60 animate-ripple"></span>'),Uo=R(`<div role="button" tabindex="0" aria-label="Choose a media file to convert" class="dropzone relative flex flex-col items-center justify-center gap-3 px-6 py-14 text-center cursor-pointer select-none"><div class="relative"><div class="grid place-items-center size-20 rounded-full bg-gradient-to-br from-cotton/40 to-babysky/40" style="box-shadow: var(--shadow-rest);"><!></div> <!></div> <p class="text-xl font-extrabold text-[#5b3a6b]"> </p> <p class="max-w-sm text-sm text-[#8a6f9b]">Video, audio, GIF, PNG or one of those mysterious retro files from an old
    game. I know a surprising number of formats.</p> <span class="pill mt-1">tap to choose instead</span> <input type="file" class="hidden" multiple="" accept="video/*,audio/*,image/*,.bik,.smk,.mve,.vqa,.cin,.cmv,.anm,.nut,.ogm,.rm,.rmvb,.wtv,.mxf,.gxf,.dv,.jxl,.avif,.heic,.exr,.dpx,.fits,.ras,.3gp,.3g2,.mts,.m2ts,.vob,.f4v,.mpc,.vqf,.ape,.wv,.tta,.tak,.shn,.s3m,.it,.mod,.xm"/></div>`);function Yo(e,t){lt(t,!0);let n=F(!1),r=F(!1),i=F(void 0);function a(g){g?.length&&t.onfiles([...g])}function s(g){g.preventDefault(),k(n,!1),k(r,!0),en(),Xi(),a(g.dataTransfer?.files??null),setTimeout(()=>k(r,!1),640)}function o(g){g.preventDefault(),d(n)||(k(n,!0),tn())}var l=Uo(),u=P(l),f=P(u),v=P(f);{var h=g=>{xo(g,{size:"34",strokeWidth:2.2,class:"text-bubblegum"})},p=g=>{Ji(g,{size:48,get label(){return er}})};ne(v,g=>{d(n)?g(h):g(p,-1)})}var c=x(f,2);{var m=g=>{var S=Go();E(g,S)};ne(c,g=>{d(r)&&g(m)})}var _=x(u,2),b=H(_,!0),A=x(_,6);wn(A,g=>k(i,g),()=>d(i)),B(()=>{z(l,"data-over",d(n)),z(l,"data-dropped",d(r)),q(b,d(n)?"Yes yes yes — let it go!":"Toss your file in here ♡")}),pt("dragover",l,o),pt("dragleave",l,()=>k(n,!1)),pt("drop",l,s),le("click",l,()=>(en(),d(i)?.click())),le("keydown",l,g=>{(g.key==="Enter"||g.key===" ")&&(g.preventDefault(),d(i)?.click())}),pt("mouseenter",l,function(...g){tn?.apply(this,g)}),le("change",A,g=>a(g.currentTarget.files)),E(e,l),ut()}Lt(["click","keydown","change"]);var Ko=R('<span class="block truncate text-xs text-[#9c85ab]"> </span>'),Zo=R('<span class="grid size-7 shrink-0 place-items-center rounded-full bg-mint/30 text-[#0c4a44]"><!></span>'),Xo=R('<li class="stagger"><button type="button" class="flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-left transition-[background,transform] duration-200 hover:bg-lavender active:scale-[0.97]"><span class="min-w-0"><span class="block truncate font-bold text-[#5b3a6b]"> </span> <!></span> <!></button></li>'),Jo=R("<ul></ul>"),Qo=R('<div class="relative"><span class="block mb-1 text-xs font-bold uppercase tracking-wider text-[#a98fb8]"> </span> <button type="button" class="btn flex items-center gap-2 min-w-52 justify-between" aria-haspopup="true"><span class="flex items-center gap-2 truncate"><!> </span> <!></button> <!></div>');function el(e,t){lt(t,!0);let n=te(t,"value",3,"webm"),r=te(t,"label",3,"turn it into"),i=te(t,"open",15,!1),a=F(void 0),s=F(void 0),o=F("down"),l=F("20rem"),u=F(null),f=Re(()=>d(u)??n()),v=Re(()=>t.options.find(y=>y.key===d(f))??{key:d(f),label:d(f).toUpperCase()});function h(){if(!d(s))return;const y=d(s).getBoundingClientRect(),Z=document.querySelector('[aria-live="polite"]')?.offsetHeight??0,J=innerHeight-y.bottom-20-Z,be=y.top-20;k(o,J<160&&be>J?"up":"down",!0);const ze=d(o)==="up"?be:J;k(l,`${Math.round(Math.min(320,Math.max(160,ze)))}px`)}function p(){en(),i(!i()),i()&&Qn()}function c(y){k(u,y,!0),i(!1),Qn(),t.onchange(y)}function m(y){y.key==="Escape"&&i(!1),y.key==="ArrowDown"&&!i()&&(y.preventDefault(),i(!0))}yt(()=>{i()&&h()}),yt(()=>{if(!i())return;const y=Z=>{d(a)&&!d(a).contains(Z.target)&&i(!1)};return addEventListener("pointerdown",y),()=>removeEventListener("pointerdown",y)});var _=Qo(),b=P(_),A=H(b,!0),g=x(b,2),S=P(g),D=P(S);go(D,{size:"18",strokeWidth:2.4});var N=x(D),T=x(S,2);{let y=Re(()=>i()?"rotate-180":"");ho(T,{size:"18",strokeWidth:2.6,get class(){return`transition-transform duration-300 [transition-timing-function:var(--ease-jelly)] ${d(y)??""}`}})}wn(g,y=>k(s,y),()=>d(s));var C=x(g,2);{var V=y=>{var Z=Jo();tt(Z,23,()=>t.options,J=>J.key,(J,be,ze)=>{var ft=Xo(),Ze=P(ft),xt=P(Ze),$=P(xt),I=H($,!0),ae=x($,2);{var We=de=>{var Je=Ko(),Rt=H(Je,!0);B(()=>q(Rt,d(be).hint)),E(de,Je)};ne(ae,de=>{d(be).hint&&de(We)})}var Ge=x(xt,2);{var Xe=de=>{var Je=Zo(),Rt=P(Je);vo(Rt,{size:"16",strokeWidth:3}),E(de,Je)};ne(Ge,de=>{d(be).key===d(f)&&de(Xe)})}B(()=>{wt(ft,`--i: ${d(ze)??""}`),z(Ze,"aria-current",d(be).key===d(f)?"true":void 0),q(I,d(be).label)}),le("click",Ze,()=>c(d(be).key)),pt("mouseenter",Ze,function(...de){tn?.apply(this,de)}),E(J,ft)}),B(()=>{z(Z,"aria-label",r()),it(Z,1,`card absolute z-30 w-full min-w-64 overflow-y-auto p-2 list-none ${d(o)==="up"?"bottom-full mb-2":"mt-2"}`),wt(Z,`transform-origin: ${d(o)==="up"?"bottom":"top"} center; max-height: ${d(l)??""};`)}),E(y,Z)};ne(C,y=>{i()&&y(V)})}wn(_,y=>k(a,y),()=>d(a)),B(()=>{q(A,r()),z(g,"aria-expanded",i()),q(N,` ${d(v).label??""}`)}),le("click",g,p),le("keydown",g,m),pt("mouseenter",g,function(...y){tn?.apply(this,y)}),E(e,_),ut()}Lt(["click","keydown"]);var tl=R('<div class="progress-track mt-2.5"><div class="progress-bar"></div></div> <p class="mt-1 text-right text-[11px] font-bold text-[#9c85ab]"> </p>',1),nl=R('<span class="flex-1 rounded-t-full bg-gradient-to-t from-babysky/70 to-bubblegum/80"></span>'),rl=R('<div class="mt-2 flex h-8 items-end gap-[2px]" aria-hidden="true"></div>'),il=R('<a class="icon-btn no-underline text-[#0c4a44]"><!></a>'),Br=R('<button class="icon-btn"><!></button>'),al=R('<p class="mt-2 rounded-2xl bg-cream/70 px-3 py-2 text-xs text-[#a03a5f]"> </p>'),sl=R('<article><div class="flex items-start gap-3"><span class="grid size-11 shrink-0 place-items-center rounded-full bg-cream/80 text-lilac"><!></span> <div class="min-w-0 flex-1"><div class="flex items-baseline justify-between gap-2"><h3 class="truncate font-extrabold text-[#4a3557]"> </h3> <span class="shrink-0 text-xs font-bold text-[#8a6f9b]"> </span></div> <p class="mt-0.5 text-xs font-medium text-[#7c6290]"> </p> <p class="mt-1.5 text-sm text-[#6b4a8a]"> </p> <!> <!></div> <div class="flex shrink-0 flex-col gap-1.5"><!></div></div> <!></article>');function ol(e,t){lt(t,!0);const n=Re(()=>Math.min(100,Math.round(t.job.progress_pct)));function r($){return $?$>1<<20?`${($/(1<<20)).toFixed(2)} MB`:`${Math.max(1,Math.round($/1024))} KB`:"—"}const i=Re(()=>t.job.status==="completed"?"from-mint/25 to-babysky/25":t.job.status==="failed"?"from-peach/30 to-cotton/25":"from-lavender to-periwinkle/60");function a($){return $.quip?$.quip:$.status==="queued"?oe.queued():$.status==="processing"?oe.baking():$.status==="completed"?oe.done():oe.failed($.error||"unknown")}var s=sl(),o=P(s),l=P(o),u=P(l);{var f=$=>{mo($,{size:"20",class:"animate-spin"})},v=$=>{bo($,{size:"20"})},h=$=>{Fr($,{size:"20"})};ne(u,$=>{t.job.status==="processing"||t.job.status==="queued"?$(f):t.job.status==="completed"?$(v,1):$(h,-1)})}var p=x(l,2),c=P(p),m=P(c),_=H(m,!0),b=x(m,2),A=H(b,!0),g=x(c,2),S=H(g),D=x(g,2),N=H(D,!0),T=x(D,2);{var C=$=>{var I=tl(),ae=K(I),We=H(ae),Ge=x(ae,2),Xe=H(Ge);B(de=>{wt(We,`width: ${de??""}%`),q(Xe,`${d(n)??""}%`)},[()=>Math.max(4,d(n))]),E($,I)};ne(T,$=>{(t.job.status==="processing"||t.job.status==="queued")&&$(C)})}var V=x(T,2);{var y=$=>{var I=rl();tt(I,21,()=>t.job.peaks,qi,(ae,We)=>{var Ge=nl();B(Xe=>wt(Ge,`height: ${Xe??""}%`),[()=>Math.max(6,Math.round(d(We)*100))]),E(ae,Ge)}),E($,I)};ne(V,$=>{t.job.peaks?.length&&$(y)})}var Z=x(p,2),J=P(Z);{var be=$=>{var I=il(),ae=P(I);po(ae,{size:"16"}),B(()=>{z(I,"href",t.job.download_url),z(I,"download",t.job.nickname),z(I,"aria-label",`Save ${t.job.nickname??""}`),z(I,"title",`Save ${t.job.nickname??""}`)}),E($,I)},ze=$=>{var I=Br(),ae=P(I);ko(ae,{size:"16"}),B(()=>{z(I,"aria-label",`Discard ${t.job.nickname??""}`),z(I,"title",`Discard ${t.job.nickname??""}`)}),le("click",I,()=>qr(t.job.id)),E($,I)},ft=$=>{var I=Br(),ae=P(I);Fr(ae,{size:"16"}),B(()=>{z(I,"aria-label",`Stop ${t.job.nickname??""}`),z(I,"title",`Stop ${t.job.nickname??""}`)}),le("click",I,()=>qr(t.job.id)),E($,I)};ne(J,$=>{t.job.status==="completed"?$(be):t.job.status==="failed"?$(ze,1):$(ft,-1)})}var Ze=x(o,2);{var xt=$=>{var I=al(),ae=H(I,!0);B(()=>q(ae,t.job.error)),E($,I)};ne(Ze,$=>{t.job.error&&$(xt)})}B(($,I)=>{it(s,1,`card bg-gradient-to-br ${d(i)??""} p-4`),q(_,t.job.nickname),q(A,$),q(S,`${(t.job.source_format||"unknown")??""} → ${t.job.target_format??""}`),q(N,I)},[()=>r(t.job.output_size),()=>t.job.quip||a(t.job)]),E(e,s),ut()}Lt(["click"]);var ll=R('<span class="sparkle"> </span>'),ul=R('<div class="pointer-events-none fixed inset-x-0 bottom-0 top-[max(env(safe-area-inset-top),2.5rem)] overflow-hidden transition-transform duration-500 ease-out" aria-hidden="true"></div>');function fl(e,t){lt(t,!0);let n=F(void 0);const r=["✦","✧","♡","⋆","✩","❋"],i=["#FFA6D5","#6EE7B7","#67E8F9","#FDE047","#C084FC","#FDBA74"],a=Array.from({length:26},(u,f)=>({id:f,glyph:r[f%r.length],color:i[f%i.length],left:`${f*37%100}%`,size:`${10+f*13%16}px`,delay:`${-(f*1.4).toFixed(2)}s`,duration:`${11+f*5%9}s`}));let s=F(ke({x:.5,y:.5}));function o(u){k(s,{x:u.clientX/innerWidth,y:u.clientY/innerHeight},!0)}oo(()=>(addEventListener("pointermove",o,{passive:!0}),()=>removeEventListener("pointermove",o))),yt(()=>{if(!d(n))return;const u=(d(s).x-.5)*-22,f=(d(s).y-.5)*-14;d(n).style.transform=`translate3d(${u}px, ${f}px, 0)`});var l=ul();tt(l,21,()=>a,u=>u.id,(u,f)=>{var v=ll(),h=H(v,!0);B(()=>{wt(v,`left:${d(f).left??""}; font-size:${d(f).size??""}; color:${d(f).color??""};
             animation-delay:${d(f).delay??""}; animation-duration:${d(f).duration??""};`),q(h,d(f).glyph)}),E(u,v)}),wn(l,u=>k(n,u),()=>d(n)),E(e,l),ut()}var cl=R("<!> <span>muted</span>",1),dl=R("<!> <span>sounds on</span>",1),vl=R("<li> </li>"),hl=R('<section class="card border-2 border-peach/60 bg-gradient-to-br from-peach/20 to-cotton/15 p-4" role="alert"><h2 class="text-sm font-black uppercase tracking-wider text-[#a03a5f]"> </h2> <ul class="mt-2 list-disc space-y-1 pl-5 text-xs text-[#7c3a52]"></ul> <button type="button" class="pill mt-3 bg-cream/80 text-[#6b4a8a]">okay, hide this</button></section>'),pl=R('<p class="mt-3 text-xs font-semibold text-[#a03a5f]"> </p>'),_l=R('<p class="mt-3 text-xs font-semibold text-[#8a6f9b]"> <span class="text-[#6b4a8a]"> </span></p>'),gl=R('<div><dt class="font-bold uppercase tracking-wide text-[#a98fb8]"> </dt> <dd class="font-semibold text-[#5b3a6b]"> </dd></div>'),ml=R('<dl class="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-4"></dl>'),bl=R('<button type="button" class="stagger group flex items-center justify-between gap-3 rounded-2xl bg-lavender/70 px-3.5 py-3 text-left transition-[transform,background] duration-200 hover:bg-periwinkle active:scale-[0.97] disabled:opacity-40"><span class="min-w-0"><span class="block truncate text-sm font-extrabold text-[#4a3557]"> </span> <span class="block truncate text-[11px] text-[#7c6290]"> </span></span> <span class="pill shrink-0 bg-cream/80 text-[#0c4a44]">make</span></button>'),yl=R('<p class="col-span-full text-xs text-[#8a6f9b]">loading the pack rules…</p>'),wl=R('<p class="card p-5 text-center text-sm text-[#8a6f9b]">nothing yet — drop something in and I’ll get right on it ♡</p>'),xl=R(`<!> <main class="relative mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-4 pb-24 pt-[max(2rem,env(safe-area-inset-top))]"><header class="flex items-center justify-between gap-4"><div><h1 class="glow-text text-4xl font-black tracking-tight sm:text-5xl">Eliverter</h1> <p class="mt-1 text-sm font-semibold text-[#8a6f9b]"> </p></div> <div class="grid size-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-cotton/35 to-babysky/35" style="box-shadow: var(--shadow-rest);"><!></div> <button type="button" class="pill flex shrink-0 items-center gap-2 whitespace-nowrap bg-cream/90 text-[#6b4a8a]"><!></button></header> <!> <!> <section><div class="flex flex-wrap items-end gap-4"><!> <button type="button" class="btn flex items-center gap-2 ml-auto disabled:opacity-50"><!> </button></div> <!> <!> <!></section> <section class="card p-4"><h2 class="flex items-center gap-2 text-lg font-black text-[#4a3557]"><!> one-click ready packs</h2> <p class="mt-1 text-xs text-[#8a6f9b]">Exact platform rules, no guessing about sizes or codecs.</p> <div class="mt-3 grid gap-2 sm:grid-cols-2"></div></section> <section class="flex flex-col gap-3"><h2 class="text-sm font-black uppercase tracking-wider text-[#a98fb8]">today’s batch</h2> <!></section> <footer class="card mt-2 flex flex-wrap items-center justify-between gap-3 p-4"><p class="text-xs font-semibold text-[#7c6290]">made by <a class="font-black text-[#6b4a8a] underline decoration-bubblegum decoration-2 underline-offset-4
               hover:text-bubblegum" href="https://ahura.site/resume" target="_blank" rel="noopener noreferrer">ahura</a> · everything happens on your phone, nothing is uploaded</p> <a class="pill bg-cream/80 text-[#6b4a8a]" href="https://ahura.site/resume" target="_blank" rel="noopener noreferrer">ahura.site/resume</a></footer></main> <div class="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]" aria-live="polite"><p class="card max-w-full truncate px-4 py-2 text-[13px] font-bold text-[#5b3a6b] shadow-lift"> </p></div>`,1);function kl(e,t){lt(t,!0);const n=[{key:"mp4",label:"MP4",hint:"H.264 · plays anywhere"},{key:"webm",label:"WebM",hint:"VP9 · tiny and transparent"},{key:"mkv",label:"Matroska",hint:"everything in one tin"},{key:"mov",label:"QuickTime",hint:"ProRes friendly"},{key:"gif",label:"GIF",hint:"looping, palette-quantised"},{key:"webp",label:"WebP",hint:"sticker-grade still or animated"},{key:"png",label:"PNG",hint:"lossless with alpha"},{key:"avif",label:"AVIF",hint:"newest image format"},{key:"mp3",label:"MP3",hint:"LAME VBR"},{key:"m4a",label:"M4A / AAC",hint:"clean and small"},{key:"opus",label:"Opus in Ogg",hint:"best quality per byte"},{key:"flac",label:"FLAC",hint:"lossless audio"},{key:"wav",label:"WAV",hint:"raw PCM, no thinking required"}];let r=F("webm"),i=F(ke([])),a=F(ke([])),s=F(ke(Mo())),o=F(!1),l=F(!1),u=F("auto"),f=F("#00ff00");const v=new Set(["webm","gif","webp","png","apng"]),h=Re(()=>v.has(d(r))),p=Re(()=>d(o)&&d(h)?{erase_background:!0,erase_mode:d(u),...d(u)==="color"?{key_color:d(f)}:{}}:{});yt(()=>{se.hydrate()});async function c(w){en(),k(a,[],!0),se.lastInfo=null;const M=[];for(const U of w)try{const{info:ee}=await Ro(U);se.lastInfo=ee,M.push(U)}catch(ee){const Te=ee instanceof Error?ee.message:String(ee);k(a,[...d(a),`${U.name} — ${Te}`],!0)}if(k(i,M,!0),M.length===0){se.statusLine=oe.failed(d(a)[0]??"nothing readable was chosen");return}M.length===1&&se.submit(M[0],d(r),d(p))}function m(){for(const w of d(i))se.submit(w,d(r),d(p))}function _(w){for(const M of d(i))se.submitPack(M,w,d(p))}function b(){k(s,!d(s)),To(d(s)),se.mutesAudio=d(s)}const A=Re(()=>se.available),g=Re(()=>se.jobs);function S(w){const M=`${w.width}×${w.height}`;return[{k:"container",v:w.container||w.format.format_name},{k:"length",v:`${w.duration_seconds.toFixed(2)}s`},{k:"video",v:w.video_codec?`${w.video_codec} ${M}`:"—"},{k:"audio",v:w.audio_codec?`${w.audio_codec} · ${w.sample_rate}Hz`:"—"}]}var D=xl();Gs("1n46o8q",w=>{An(()=>{gi.title="Eliverter ✿ pastel media sanctuary"})});var N=K(D);fl(N,{});var T=x(N,2),C=P(T),V=P(C),y=x(P(V),2),Z=H(y),J=x(V,2),be=P(J);Ji(be,{size:38});var ze=x(J,2),ft=P(ze);{var Ze=w=>{var M=cl(),U=K(M);$o(U,{size:"16"}),E(w,M)},xt=w=>{var M=dl(),U=K(M);Eo(U,{size:"16"}),E(w,M)};ne(ft,w=>{d(s)?w(Ze):w(xt,-1)})}var $=x(C,2);Yo($,{onfiles:c});var I=x($,2);{var ae=w=>{var M=hl(),U=P(M),ee=H(U),Te=x(U,2);tt(Te,20,()=>d(a),ct=>ct,(ct,Dt)=>{var kt=vl(),ha=H(kt,!0);B(()=>q(ha,Dt)),E(ct,kt)});var Me=x(Te,2);B(()=>q(ee,`I couldn’t read ${d(a).length??""} file${d(a).length===1?"":"s"}`)),le("click",Me,()=>k(a,[],!0)),E(w,M)};ne(I,w=>{d(a).length&&w(ae)})}var We=x(I,2),Ge=P(We),Xe=P(Ge);el(Xe,{get options(){return n},get value(){return d(r)},onchange:w=>k(r,w,!0),get open(){return d(l)},set open(w){k(l,w,!0)}});var de=x(Xe,2),Je=P(de);wo(Je,{size:"18"});var Rt=x(Je),gr=x(Ge,2);{var na=w=>{zo(w,{onpulse:()=>en(),get enabled(){return d(o)},set enabled(M){k(o,M,!0)},get mode(){return d(u)},set mode(M){k(u,M,!0)},get color(){return d(f)},set color(M){k(f,M,!0)}})},ra=w=>{var M=pl(),U=H(M);B(()=>q(U,`${d(r)??""} cannot keep transparency, so the background stays put — switch to
        WebM, GIF, WebP or PNG to erase it`)),E(w,M)};ne(gr,w=>{d(h)?w(na):d(o)&&w(ra,1)})}var mr=x(gr,2);{var ia=w=>{var M=_l(),U=P(M),ee=x(U),Te=H(ee,!0);B(Me=>{q(U,`${d(i).length??""} file${d(i).length===1?"":"s"} waiting: `),q(Te,Me)},[()=>d(i).map(Me=>Me.name).join(", ")]),E(w,M)};ne(mr,w=>{d(i).length&&w(ia)})}var aa=x(mr,2);{var sa=w=>{var M=ml();tt(M,21,()=>S(se.lastInfo),U=>U.k,(U,ee)=>{var Te=gl(),Me=P(Te),ct=H(Me,!0),Dt=x(Me,2),kt=H(Dt,!0);B(()=>{q(ct,d(ee).k),q(kt,d(ee).v)}),E(U,Te)}),E(w,M)};ne(aa,w=>{se.lastInfo&&w(sa)})}var br=x(We,2),yr=P(br),oa=P(yr);_o(oa,{size:"18",class:"text-bubblegum"});var la=x(yr,4);tt(la,23,()=>d(A),w=>w.id,(w,M,U)=>{var ee=bl(),Te=P(ee),Me=P(Te),ct=H(Me,!0),Dt=x(Me,2),kt=H(Dt);B(()=>{wt(ee,`--i: ${d(U)??""}`),ee.disabled=!d(i).length||se.busy,q(ct,d(M).label),q(kt,`${d(M).edge??""}px · ${d(M).limit??""} ${d(M).fps?`· ${d(M).fps}fps`:""}`)}),le("click",ee,()=>_(d(M).id)),E(w,ee)},w=>{var M=yl();E(w,M)});var ua=x(br,2),fa=x(P(ua),2);tt(fa,17,()=>d(g),w=>w.id,(w,M)=>{ol(w,{get job(){return d(M)}})},w=>{var M=wl();E(w,M)});var ca=x(T,2),da=P(ca),va=H(da,!0);B(()=>{q(Z,`your pastel media sanctuary · ${er} is in the oven`),z(J,"title",er),z(ze,"aria-pressed",d(s)),z(ze,"title",d(s)?"unmute the little sounds":"mute the little sounds"),it(We,1,`card p-4 ${d(l)?"relative z-40":""}`),de.disabled=!d(i).length||se.busy,q(Rt,` ${se.busy?"working on it…":`make ${d(i).length||"your"} file${d(i).length===1?"":"s"} pretty`}`),q(va,se.statusLine)}),le("click",ze,b),le("click",de,m),E(e,D),ut()}Lt(["click"]);const ta=document.getElementById("app");if(!ta)throw new Error("#app is missing from index.html");Rs(kl,{target:ta});
