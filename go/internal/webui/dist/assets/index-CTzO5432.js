(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const s of a.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&r(s)}).observe(document,{childList:!0,subtree:!0});function n(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function r(i){if(i.ep)return;i.ep=!0;const a=n(i);fetch(i.href,a)}})();const Vr=!1;var yn=Array.isArray,la=Array.prototype.indexOf,dn=Array.prototype.includes,wn=Array.from,qr=Object.defineProperty,Xe=Object.getOwnPropertyDescriptor,Hr=Object.getOwnPropertyDescriptors,ua=Object.prototype,fa=Array.prototype,Jn=Object.getPrototypeOf,gr=Object.isExtensible;function It(e){return typeof e=="function"}const ca=()=>{};function da(e){return e()}function zn(e){for(var t=0;t<e.length;t++)e[t]()}function Br(){var e,t,n=new Promise((r,i)=>{e=r,t=i});return{promise:n,resolve:e,reject:t}}function va(e,t){if(Array.isArray(e))return e;if(!(Symbol.iterator in e))return Array.from(e);const n=[];for(const r of e)if(n.push(r),n.length===t)break;return n}const ue=2,yt=4,Qt=8,Zn=1<<24,Pe=16,ke=32,We=64,In=128,Qn=256,Ce=512,Z=1024,X=2048,we=4096,ve=8192,he=16384,Tt=32768,vn=1<<25,ft=65536,hn=1<<17,Wr=1<<18,St=1<<19,Gr=1<<20,ze=1<<25,pn=1<<21,bt=1<<22,Je=1<<23,Re=Symbol("$state"),Ur=Symbol("component"),Yr=Symbol("legacy props"),ha=Symbol(""),Kr=Symbol("attributes"),Fn=Symbol("class"),Rn=Symbol("style"),Dn=Symbol("text"),un=Symbol("form reset"),en=new class extends Error{name="StaleReactionError";message="The reaction that called `getAbortSignal()` was re-run or destroyed"},er=!!globalThis.document?.contentType&&globalThis.document.contentType.includes("xml"),pa=1,_a=2,Xr=4,ga=8,ma=16,ba=1,ya=2,Jr=4,wa=8,xa=16,ka=1,Ea=2,J=Symbol("uninitialized"),Zr="http://www.w3.org/1999/xhtml",$a="http://www.w3.org/2000/svg",Aa="@attach";function Ta(){console.warn("https://svelte.dev/e/derived_inert")}function Sa(){console.warn("https://svelte.dev/e/select_multiple_invalid_value")}function Ma(){console.warn("https://svelte.dev/e/svelte_boundary_reset_noop")}let Pa=!1;function Qr(e){return e===this.v}function Na(e,t){return e!=e?t==t:e!==t||e!==null&&typeof e=="object"||typeof e=="function"}function ei(e){return!Na(e,this.v)}function ja(e){throw new Error("https://svelte.dev/e/lifecycle_outside_component")}function Ca(){throw new Error("https://svelte.dev/e/async_derived_orphan")}function Oa(e,t,n){throw new Error("https://svelte.dev/e/each_key_duplicate")}function La(e){throw new Error("https://svelte.dev/e/effect_in_teardown")}function za(){throw new Error("https://svelte.dev/e/effect_in_unowned_derived")}function Ia(e){throw new Error("https://svelte.dev/e/effect_orphan")}function Fa(){throw new Error("https://svelte.dev/e/effect_update_depth_exceeded")}function Ra(e){throw new Error("https://svelte.dev/e/props_invalid_value")}function Da(){throw new Error("https://svelte.dev/e/state_descriptors_fixed")}function Va(){throw new Error("https://svelte.dev/e/state_prototype_fixed")}function qa(){throw new Error("https://svelte.dev/e/state_unsafe_mutation")}function Ha(){throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror")}let Mt=!1,Ba=!1;function Wa(){Mt=!0}let B=null;function wt(e){B=e}function tt(e,t=!1,n){B={p:B,i:!1,c:null,e:null,s:e,x:null,r:O,l:Mt&&!t?{s:null,u:null,$:[]}:null}}function nt(e){var t=B,n=t.e;if(n!==null){t.e=null;for(var r of n)bi(r)}return t.i=!0,B=t.p,tr(e)}function tr(e={}){return qr(e,Ur,{value:!0}),e}function tn(){return!Mt||B!==null&&B.l===null}let at=[];function ti(){var e=at;at=[],zn(e)}function Ie(e){if(at.length===0&&!Wt){var t=at;queueMicrotask(()=>{t===at&&ti()})}at.push(e)}function Ga(){for(;at.length>0;)ti()}const Ua=-7169;function G(e,t){e.f=e.f&Ua|t}function nr(e){(e.f&Ce)!==0||e.deps===null?G(e,Z):G(e,we)}function ni(e,t,n){(e.f&X)!==0?t.add(e):(e.f&we)!==0&&n.add(e),G(e,Z)}function Ya(e,t){if(t){const n=document.body;e.autofocus=!0,Ie(()=>{document.activeElement===n&&e.focus()})}}let mr=!1;function Ka(){mr||(mr=!0,document.addEventListener("reset",e=>{Promise.resolve().then(()=>{if(!e.defaultPrevented)for(const t of e.target.elements)t[un]?.()})},{capture:!0}))}function Pt(e){var t=L,n=O;Ee(null),$e(null);try{return e()}finally{Ee(t),$e(n)}}function Xa(e,t,n,r=n){e.addEventListener(t,()=>Pt(n));const i=e[un];i?e[un]=()=>{i(),r(!0)}:e[un]=()=>r(!0),Ka()}function ri(e,t,n,r){const i=tn()?xt:rr;var a=e.filter(p=>!p.settled),s=t.map(i);if(n.length===0&&a.length===0){r(s);return}var o=O,l=Ja(),u=a.length===1?a[0].promise:a.length>1?Promise.all(a.map(p=>p.promise)):null;function f(p){if((o.f&he)===0){l();try{r([...s,...p])}catch(c){Le(c,o)}_n()}}var v=ii();if(n.length===0){u.then(()=>f([])).finally(v);return}function h(){Promise.all(n.map(p=>Za(p))).then(f).catch(p=>Le(p,o)).finally(v)}u?u.then(()=>{l(),h(),_n()}):h()}function Ja(){var e=O,t=L,n=B,r=C;return function(a=!0){$e(e),Ee(t),wt(n),a&&(e.f&he)===0&&(r?.activate(),r?.apply())}}function _n(e=!0){$e(null),Ee(null),wt(null),e&&C?.deactivate()}function ii(){var e=O,t=e.b,n=C,r=!!t?.is_rendered();return t?.update_pending_count(1,n),n.increment(r,e),()=>{t?.update_pending_count(-1,n),n.decrement(r,e)}}function xt(e){var t=ue|X;return O!==null&&(O.f|=St),{ctx:B,deps:null,effects:null,equals:Qr,f:t,fn:e,reactions:null,rv:0,v:J,wv:0,parent:O,ac:null}}const Vt=Symbol("obsolete");function Za(e,t,n){let r=O;r===null&&Ca();var i=void 0,a=Qe(J),s=!L,o=new Set;return ds(()=>{var l=O,u=Br();i=u.promise;try{Promise.resolve(e()).then(u.resolve,p=>{p!==en&&u.reject(p)}).finally(_n)}catch(p){u.reject(p),_n()}var f=C;if(s){if((l.f&Tt)!==0)var v=ii();if(r.b?.is_rendered())f.async_deriveds.get(l)?.reject(Vt);else for(const p of o.values())p.reject(Vt);o.add(u),f.async_deriveds.set(l,u)}const h=(p,c=void 0)=>{v?.(),o.delete(u),c!==Vt&&(f.activate(),c?(a.f|=Je,kt(a,c)):((a.f&Je)!==0&&(a.f^=Je),kt(a,p)),f.deactivate())};u.promise.then(h,p=>h(null,p||"unknown"))}),xn(()=>{for(const l of o)l.reject(Vt)}),new Promise(l=>{function u(f){function v(){f===i?l(a):u(i)}f.then(v,v)}u(i)})}function Fe(e){const t=xt(e);return $i(t),t}function rr(e){const t=xt(e);return t.equals=ei,t}function Qa(e){var t=e.effects;if(t!==null){e.effects=null;for(var n=0;n<t.length;n+=1)re(t[n])}}function ir(e){var t,n=O,r=e.parent;if(!Ge&&r!==null&&e.v!==J&&(r.f&(he|ve))!==0)return Ta(),e.v;$e(r);try{Qa(e),t=Mi(e)}finally{$e(n)}return t}function ai(e){var t=ir(e);if(!e.equals(t)&&(e.wv=Ti(),(!C?.is_fork||e.deps===null)&&(C!==null?(C.capture(e,t,!0),Vn?.capture(e,t,!0)):e.v=t,e.deps===null))){G(e,Z);return}Ge||(Ne!==null?(lr()||C?.is_fork)&&Ne.set(e,t):nr(e))}function es(e){if(e.effects!==null)for(const t of e.effects)(t.teardown||t.ac)&&(t.teardown?.(),t.ac!==null&&Pt(()=>{t.ac.abort(en),t.ac=null}),t.fn!==null&&(t.teardown=ca),Kt(t,0),fr(t))}function si(e){if(e.effects!==null)for(const t of e.effects)t.teardown&&t.fn!==null&&$t(t)}let An=null,gt=null,C=null,Vn=null,Ne=null,qn=null,Wt=!1,Tn=!1,Gt=null,fn=null;var br=0;let ts=1;class Ze{id=ts++;#t=!1;linked=!0;#s=null;#e=null;async_deriveds=new Map;current=new Map;previous=new Map;#l=new Set;#r=new Set;#a=0;#n=new Map;#o=null;#i=[];#h=[];#u=new Set;#f=new Set;#d=new Map;#_=new Set;is_fork=!1;#c=!1;constructor(){gt===null?An=gt=this:(gt.#e=this,this.#s=gt),gt=this}#b(){if(this.is_fork)return!0;for(const r of this.#n.keys()){for(var t=r,n=!1;t.parent!==null;){if(this.#d.has(t)){n=!0;break}t=t.parent}if(!n)return!0}return!1}skip_effect(t){this.#d.has(t)||this.#d.set(t,{d:[],m:[]}),this.#_.delete(t)}unskip_effect(t,n=r=>this.schedule(r)){var r=this.#d.get(t);if(r){this.#d.delete(t);for(var i of r.d)G(i,X),n(i);for(i of r.m)G(i,we),n(i)}this.#_.add(t)}#x(){var t=[];for(const a of this.#i)if(!((a.f&he)!==0||(a.f&(X|we))===0)){for(var n=a,r=!1;n.parent!==null;){n=n.parent;var i=n.f;if((i&(We|ke))!==0){if((i&Z)===0){r=!0;break}n.f^=Z}}r||t.push(n)}return this.#i=[],t}#g(){this.#t=!0;for(const o of this.#u)this.#f.delete(o),G(o,X),this.schedule(o);for(const o of this.#f)G(o,we),this.schedule(o);this.apply();for(var t=Gt=[],n=[],r=fn=[];this.#i.length>0;){br++>1e3&&(this.#p(),rs());for(const o of this.#x())try{this.#m(o,t,n)}catch(l){throw ui(o),this.#b()||this.discard(),l}}if(C=null,r.length>0){var i=Ze.ensure();for(const o of r)i.schedule(o)}if(Gt=null,fn=null,this.#b()){this.#v(n),this.#v(t);for(const[o,l]of this.#d)li(o,l);r.length>0&&C.#g();return}const a=this.#k();if(a){this.#v(n),this.#v(t),a.#y(this);return}this.#u.clear(),this.#f.clear();for(const o of this.#l)o(this);this.#l.clear(),Vn=this,yr(n),yr(t),Vn=null,this.#o?.resolve();var s=C;if(this.#a===0&&(this.#i.length===0||s!==null)&&this.#p(),this.#i.length>0)if(s!==null){for(const o of this.#i)s.#i.push(o);this.#i=[]}else s=this;s!==null&&(De.clear(),s.#g())}#m(t,n,r){t.f^=Z;for(var i=t.first;i!==null;){var a=i.f,s=(a&(ke|We))!==0,o=s&&(a&Z)!==0,l=o||(a&ve)!==0||this.#d.has(i);if(!l&&i.fn!==null){s?i.f^=Z:(a&yt)!==0?n.push(i):an(i)&&((a&Pe)!==0&&this.#f.add(i),$t(i));var u=i.first;if(u!==null){i=u;continue}}for(;i!==null;){var f=i.next;if(f!==null){i=f;break}i=i.parent}}}#k(){for(var t=this.#s;t!==null;){if(!t.is_fork){for(const[n,[,r]]of this.current)if(t.current.has(n)&&!r)return t}t=t.#s}return null}#y(t){for(const[r,i]of t.current)!this.previous.has(r)&&t.previous.has(r)&&this.previous.set(r,t.previous.get(r)),this.current.set(r,i);for(const[r,i]of t.async_deriveds){const a=this.async_deriveds.get(r);a&&i.promise.then(a.resolve).catch(a.reject)}t.async_deriveds.clear(),this.transfer_effects(t.#u,t.#f);const n=r=>{var i=r.reactions;if(i!==null&&!((r.f&ue)!==0&&(r.f&(X|we))===0))for(const o of i){var a=o.f;if((a&ue)!==0)n(o);else{var s=o;a&(bt|Pe)&&!this.async_deriveds.has(s)&&(this.#f.delete(s),G(s,X),this.schedule(s))}}};for(const r of this.current.keys())n(r);this.oncommit(()=>t.discard()),t.#p(),C=this,this.#g()}#v(t){for(var n=0;n<t.length;n+=1)ni(t[n],this.#u,this.#f)}capture(t,n,r=!1){t.v!==J&&!this.previous.has(t)&&this.previous.set(t,t.v),(t.f&Je)===0&&(this.current.set(t,[n,r]),Ne?.set(t,n)),this.is_fork||(t.v=n)}activate(){C=this}deactivate(){C=null,Ne=null}flush(){try{Tn=!0,C=this,this.#g()}finally{br=0,qn=null,Gt=null,fn=null,Tn=!1,C=null,Ne=null,De.clear()}}discard(){for(const t of this.#r)t(this);this.#r.clear();for(const t of this.async_deriveds.values())t.reject(Vt);this.#p(),this.#o?.resolve()}register_created_effect(t){this.#h.push(t)}#w(){for(let v=An;v!==null;v=v.#e){var t=v.id<this.id,n=[];for(const[h,[p,c]]of this.current){if(v.current.has(h)){var r=v.current.get(h)[0];if(t&&p!==r)v.current.set(h,[p,c]);else continue}n.push(h)}if(t)for(const[h,p]of this.async_deriveds){const c=v.async_deriveds.get(h);c&&p.promise.then(c.resolve).catch(c.reject)}var i=[...v.current.keys()].filter(h=>!v.current.get(h)[1]);if(!(!v.#t||i.length===0)){var a=i.filter(h=>!this.current.has(h));if(a.length===0)t&&v.discard();else if(n.length>0){if(t)for(const h of this.#_)v.unskip_effect(h,p=>{(p.f&(Pe|bt))!==0?v.schedule(p):v.#v([p])});v.activate();var s=new Set,o=new Map;for(var l of n)oi(l,a,s,o);o=new Map;var u=[...v.current].filter(([h,p])=>{const c=this.current.get(h);return c?c[0]!==p[0]||c[1]!==p[1]:!0}).map(([h])=>h);if(u.length>0)for(const h of this.#h)(h.f&(he|ve|hn))===0&&ar(h,u,o)&&((h.f&(bt|Pe))!==0?(G(h,X),v.schedule(h)):v.#u.add(h));if(v.#i.length>0&&!v.#c){v.apply();for(var f of v.#x())v.#m(f,[],[])}v.deactivate()}}}}increment(t,n){if(this.#a+=1,t){let r=this.#n.get(n)??0;this.#n.set(n,r+1)}}decrement(t,n){if(this.#a-=1,t){let r=this.#n.get(n)??0;r===1?this.#n.delete(n):this.#n.set(n,r-1)}this.#c||(this.#c=!0,Ie(()=>{this.#c=!1,this.linked&&this.flush()}))}transfer_effects(t,n){for(const r of t)this.#u.add(r);for(const r of n)this.#f.add(r);t.clear(),n.clear()}oncommit(t){this.#l.add(t)}ondiscard(t){this.#r.add(t)}settled(){return(this.#o??=Br()).promise}static ensure(){if(C===null){const t=C=new Ze;!Tn&&!Wt&&Ie(()=>{t.#t||t.flush()})}return C}apply(){{Ne=null;return}}schedule(t){if(qn=t,t.b?.is_pending&&(t.f&(yt|Qt|Zn))!==0&&(t.f&Tt)===0){t.b.defer_effect(t);return}this.#i.push(t)}#p(){if(this.linked){var t=this.#s,n=this.#e;t===null?An=n:t.#e=n,n===null?gt=t:n.#s=t,this.linked=!1}}}function ns(e){var t=Wt;Wt=!0;try{for(var n;;){if(Ga(),C===null)return n;C.flush()}}finally{Wt=t}}function rs(){try{Fa()}catch(e){Le(e,qn)}}let Be=null;function yr(e){var t=e.length;if(t!==0){for(var n=0;n<t;){var r=e[n++];if((r.f&(he|ve))===0&&an(r)&&(Be=new Set,$t(r),r.deps===null&&r.first===null&&r.nodes===null&&r.teardown===null&&r.ac===null&&xi(r),Be?.size>0)){De.clear();for(const i of Be){if((i.f&(he|ve))!==0)continue;const a=[i];let s=i.parent;for(;s!==null;)Be.has(s)&&(Be.delete(s),a.push(s)),s=s.parent;for(let o=a.length-1;o>=0;o--){const l=a[o];(l.f&(he|ve))===0&&$t(l)}}Be.clear()}}Be=null}}function oi(e,t,n,r){if(!n.has(e)&&(n.add(e),e.reactions!==null))for(const i of e.reactions){const a=i.f;(a&ue)!==0?oi(i,t,n,r):(a&(bt|Pe))!==0&&(a&X)===0&&ar(i,t,r)&&(G(i,X),sr(i))}}function ar(e,t,n){const r=n.get(e);if(r!==void 0)return r;if(e.deps!==null)for(const i of e.deps){if(dn.call(t,i))return!0;if((i.f&ue)!==0&&ar(i,t,n))return n.set(i,!0),!0}return n.set(e,!1),!1}function sr(e){C.schedule(e)}function li(e,t){if(!((e.f&ke)!==0&&(e.f&Z)!==0)){(e.f&X)!==0?t.d.push(e):(e.f&we)!==0&&t.m.push(e),G(e,Z);for(var n=e.first;n!==null;)li(n,t),n=n.next}}function ui(e){G(e,Z);for(var t=e.first;t!==null;)ui(t),t=t.next}let gn=new Set;const De=new Map;let fi=!1;function Qe(e,t){var n={f:0,v:e,reactions:null,equals:Qr,rv:0,wv:0};return n}function F(e,t){const n=Qe(e);return $i(n),n}function is(e,t=!1,n=!0){const r=Qe(e);return t||(r.equals=ei),Mt&&n&&B!==null&&B.l!==null&&(B.l.s??=[]).push(r),r}function x(e,t,n=!1){L!==null&&(!je||(L.f&hn)!==0)&&tn()&&(L.f&(ue|Pe|bt|hn))!==0&&(qe===null||!qe.has(e))&&qa();let r=n?xe(t):t;return kt(e,r,fn)}var it=null,Hn=0;function kt(e,t,n=null){if(!e.equals(t)){Ge?De.set(e,t):De.has(e)||De.set(e,e.v);var r=Ze.ensure();if(r.capture(e,t),(e.f&ue)!==0){const i=e;(e.f&X)!==0&&ir(i),Ne===null&&nr(i)}e.wv=Ti(),it=null,Hn=0,ci(e,X,n),it=null,tn()&&O!==null&&(O.f&Z)!==0&&(O.f&(ke|We))===0&&(ye===null?ps([e]):ye.push(e)),!r.is_fork&&gn.size>0&&!fi&&as()}return t}function as(){fi=!1;for(const e of gn){(e.f&Z)!==0&&G(e,we);let t;try{t=an(e)}catch{t=!0}t&&$t(e)}gn.clear()}function wr(e,t=1){var n=d(e),r=t===1?n++:n--;return x(e,n),r}function Ut(e){x(e,e.v+1)}function ci(e,t,n){var r=e.reactions;if(r!==null){var i=tn(),a=r.length;if(Hn+=a,Hn>1e5&&it===null&&(it=new Set),it!==null){if(it.has(e))return;it.add(e)}for(var s=0;s<a;s++){var o=r[s],l=o.f;if(!(!i&&o===O)){var u=(l&X)===0;if(u&&G(o,t),(l&hn)!==0)gn.add(o);else if((l&ue)!==0){var f=o;Ne?.delete(f),ci(f,we,n)}else if(u){var v=o;(l&Pe)!==0&&Be!==null&&Be.add(v),n!==null?n.push(v):sr(v)}}}}}function xe(e){if(typeof e!="object"||e===null||Re in e||Ur in e)return e;const t=Jn(e);if(t!==ua&&t!==fa)return e;var n=new Map,r=yn(e),i=F(0),a=ut,s=o=>{if(ut===a)return o();var l=L,u=ut;Ee(null),$r(a);var f=o();return Ee(l),$r(u),f};return r&&n.set("length",F(e.length)),new Proxy(e,{defineProperty(o,l,u){(!("value"in u)||u.configurable===!1||u.enumerable===!1||u.writable===!1)&&Da();var f=n.get(l);return f===void 0?s(()=>{var v=F(u.value);return n.set(l,v),v}):x(f,u.value,!0),!0},deleteProperty(o,l){var u=n.get(l);if(u===void 0){if(l in o){const f=s(()=>F(J));n.set(l,f),Ut(i)}}else x(u,J),Ut(i);return!0},get(o,l,u){if(l===Re)return e;var f=n.get(l),v=l in o;if(f===void 0&&(!v||Xe(o,l)?.writable)&&(f=s(()=>{var p=xe(v?o[l]:J),c=F(p);return c}),n.set(l,f)),f!==void 0){var h=d(f);return h===J?void 0:h}return Reflect.get(o,l,u)},getOwnPropertyDescriptor(o,l){this.has?.(o,l);var u=Reflect.getOwnPropertyDescriptor(o,l),f=n.get(l);if(f!==void 0){var v=d(f);if(v===J)return;if(u&&"value"in u)u.value=v;else return{enumerable:!0,configurable:!0,value:v,writable:!0}}return u},has(o,l){if(l===Re)return!0;var u=n.get(l),f=u!==void 0&&u.v!==J||Reflect.has(o,l);if(u!==void 0||O!==null&&(!f||Xe(o,l)?.writable)){u===void 0&&(u=s(()=>{var h=f?xe(o[l]):J,p=F(h);return p}),n.set(l,u));var v=d(u);if(v===J)return!1}return f},set(o,l,u,f){var v=n.get(l),h=l in o;if(r&&l==="length")for(var p=u;p<v.v;p+=1){var c=n.get(p+"");c!==void 0?x(c,J):p in o&&(c=s(()=>F(J)),n.set(p+"",c))}if(v===void 0)(!h||Xe(o,l)?.writable)&&(v=s(()=>F(void 0)),x(v,xe(u)),n.set(l,v));else{h=v.v!==J;var g=s(()=>xe(u));x(v,g)}var _=Reflect.getOwnPropertyDescriptor(o,l);if(_?.set&&_.set.call(f,u),!h){if(r&&typeof l=="string"){var b=n.get("length"),A=Number(l);Number.isInteger(A)&&A>=b.v&&x(b,A+1)}Ut(i)}return!0},ownKeys(o){d(i);var l=Reflect.ownKeys(o).filter(v=>{var h=n.get(v);return h===void 0||h.v!==J});for(var[u,f]of n)f.v!==J&&!(u in o)&&l.push(u);return l},setPrototypeOf(){Va()}})}function xr(e){try{if(e!==null&&typeof e=="object"&&Re in e)return e[Re]}catch{}return e}function di(e,t){return Object.is(xr(e),xr(t))}var kr,vi,hi,pi,_i;function ss(){if(kr===void 0){kr=window,vi=document,hi=/Firefox/.test(navigator.userAgent);var e=Element.prototype,t=Node.prototype,n=Text.prototype;pi=Xe(t,"firstChild").get,_i=Xe(t,"nextSibling").get,gr(e)&&(e[Fn]=void 0,e[Kr]=null,e[Rn]=void 0,e.__e=void 0),gr(n)&&(n[Dn]=void 0)}}function Ve(e=""){return document.createTextNode(e)}function ct(e){return pi.call(e)}function nn(e){return _i.call(e)}function P(e,t){return ct(e)}function U(e,t=!1){{var n=ct(e);return n instanceof Comment&&n.data===""?nn(n):n}}function H(e,t=!1){return ct(e)}function S(e,t=1,n=!1){let r=e;for(;t--;)r=nn(r);return r}function os(e){e.textContent=""}function gi(){return!1}function or(e,t,n){return t==null||t===Zr?n?document.createElement(e,{is:n}):document.createElement(e):n?document.createElementNS(t,e,{is:n}):document.createElementNS(t,e)}function ls(e){var t=O;if(t===null)return L.f|=Je,e;if((t.f&Tt)===0&&(t.f&yt)===0)throw e;Le(e,t)}function Le(e,t){if(!(t!==null&&(t.f&he)!==0)){for(;t!==null;){if((t.f&In)!==0&&(t.f&(he|vn))===0){if((t.f&Tt)===0)throw e;try{t.b.error(e);return}catch(n){e=n}}t=t.parent}throw e}}function mi(e){O===null&&(L===null&&Ia(),za()),Ge&&La()}function us(e,t){var n=t.last;n===null?t.last=t.first=e:(n.next=e,e.prev=n,t.last=e)}function Oe(e,t){var n=O;n!==null&&(n.f&ve)!==0&&(e|=ve);var r={ctx:B,deps:null,nodes:null,f:e|X|Ce,first:null,fn:t,last:null,next:null,parent:n,b:n&&n.b,prev:null,teardown:null,wv:0,ac:null};C?.register_created_effect(r);var i=r;if((e&yt)!==0)Gt!==null?Gt.push(r):Ze.ensure().schedule(r);else if(t!==null){try{$t(r)}catch(s){throw re(r),s}i.deps===null&&i.teardown===null&&i.nodes===null&&i.first===i.last&&(i.f&St)===0&&(i=i.first,(e&Pe)!==0&&(e&ft)!==0&&i!==null&&(i.f|=ft))}if(i!==null&&(i.parent=n,n!==null&&us(i,n),L!==null&&(L.f&ue)!==0&&(e&We)===0)){var a=L;(a.effects??=[]).push(i)}return r}function lr(){return L!==null&&!je}function xn(e){const t=Oe(Qt,null);return G(t,Z),t.teardown=e,t}function Et(e){mi();var t=O.f,n=!L&&(t&ke)!==0&&B!==null&&!B.i;if(n){var r=B;(r.e??=[]).push(e)}else return bi(e)}function bi(e){return Oe(yt|Gr,e)}function fs(e){return mi(),Oe(Qt|Gr,e)}function cs(e){Ze.ensure();const t=Oe(We|St,e);return(n={})=>new Promise(r=>{n.outro?lt(t,()=>{re(t),r(void 0)}):(re(t),r(void 0))})}function kn(e){return Oe(yt,e)}function ds(e){return Oe(bt|St,e)}function ur(e,t=0){return Oe(Qt|t,e)}function W(e,t=[],n=[],r=[]){ri(r,t,n,i=>{Oe(Qt,()=>{e(...i.map(d))})})}function rn(e,t=0){var n=Oe(Pe|t,e);return n}function yi(e,t=0){var n=Oe(Zn|t,e);return n}function de(e){return Oe(ke|St,e)}function wi(e){var t=e.teardown;if(t!==null){const n=Ge,r=L;Er(!0),Ee(null);try{t.call(null)}catch(i){Le(i,e.parent)}finally{Er(n),Ee(r)}}}function fr(e,t=!1){var n=e.first;for(e.first=e.last=null;n!==null;){const i=n.ac;i!==null&&Pt(()=>{i.abort(en)});var r=n.next;(n.f&We)!==0?n.parent=null:re(n,t),n=r}}function vs(e){for(var t=e.first;t!==null;){var n=t.next;(t.f&ke)===0&&re(t),t=n}}function re(e,t=!0){var n=!1;(t||(e.f&Wr)!==0)&&e.nodes!==null&&e.nodes.end!==null&&(hs(e.nodes.start,e.nodes.end),n=!0),e.f|=vn,fr(e,t&&!n),Kt(e,0);var r=e.nodes&&e.nodes.t;if(r!==null)for(const a of r)a.stop();wi(e),e.f^=vn,e.f|=he;var i=e.parent;i!==null&&i.first!==null&&xi(e),e.next=e.prev=e.teardown=e.ctx=e.deps=e.fn=e.nodes=e.ac=e.b=null}function hs(e,t){for(;e!==null;){var n=e===t?null:nn(e);e.remove(),e=n}}function xi(e){var t=e.parent,n=e.prev,r=e.next;n!==null&&(n.next=r),r!==null&&(r.prev=n),t!==null&&(t.first===e&&(t.first=r),t.last===e&&(t.last=n))}function lt(e,t,n=!0){var r=[];e.f|=Qn,ki(e,r,!0);var i=()=>{n&&re(e),t&&t()},a=r.length;if(a>0){var s=()=>--a||i();for(var o of r)o.out(s)}else i()}function ki(e,t,n){if((e.f&ve)===0){e.f^=ve;var r=e.nodes&&e.nodes.t;if(r!==null)for(const o of r)(o.is_global||n)&&t.push(o);for(var i=e.first;i!==null;){var a=i.next;if((i.f&We)===0){var s=(i.f&ft)!==0||(i.f&ke)!==0&&(e.f&Pe)!==0;ki(i,t,s?n:!1)}i=a}}}function mn(e){e.f&=~Qn,Ei(e,!0)}function Ei(e,t){if((e.f&Qn)===0&&(e.f&ve)!==0){e.f^=ve,(e.f&Z)===0&&(G(e,X),Ze.ensure().schedule(e));for(var n=e.first;n!==null;){var r=n.next,i=(n.f&ft)!==0||(n.f&ke)!==0;Ei(n,i?t:!1),n=r}var a=e.nodes&&e.nodes.t;if(a!==null)for(const s of a)(s.is_global||t)&&s.in()}}function cr(e,t){if(e.nodes)for(var n=e.nodes.start,r=e.nodes.end;n!==null;){var i=n===r?null:nn(n);t.append(n),n=i}}let cn=!1,Ge=!1;function Er(e){Ge=e}let L=null,je=!1;function Ee(e){L=e}let O=null;function $e(e){O=e}let qe=null;function $i(e){L!==null&&((L.f&pn)!==0||(L.f&ue)!==0)&&(qe??=new Set).add(e)}let _e=null,me=0,ye=null;function ps(e){ye=e}let Ai=1,st=0,ut=st;function $r(e){ut=e}function Ti(){return++Ai}function an(e){var t=e.f;if((t&X)!==0)return!0;if((t&we)!==0){for(var n=e.deps,r=n.length,i=0;i<r;i++){var a=n[i];if(an(a)&&ai(a),a.wv>e.wv)return!0}(t&Ce)!==0&&Ne===null&&G(e,Z)}return!1}function Si(e,t,n=!0){var r=e.reactions;if(r!==null&&!(qe!==null&&qe.has(e)))for(var i=0;i<r.length;i++){var a=r[i];(a.f&ue)!==0?Si(a,t,!1):t===a&&(n?G(a,X):(a.f&Z)!==0&&G(a,we),sr(a))}}function Mi(e){var t=_e,n=me,r=ye,i=L,a=qe,s=B,o=je,l=ut,u=e.f;_e=null,me=0,ye=null,L=(u&(ke|We))===0?e:null,qe=null,wt(e.ctx),je=!1,ut=++st,e.ac!==null&&(Pt(()=>{e.ac.abort(en)}),e.ac=null);try{e.f|=pn;var f=e.fn,v=f();e.f|=Tt;var h=Ar(e);if(tn()&&ye!==null&&!je&&h!==null&&(e.f&(ue|we|X))===0)for(var p=0;p<ye.length;p++)Si(ye[p],e);if(i!==null&&i!==e){if(st++,i.deps!==null)for(let c=0;c<n;c+=1)i.deps[c].rv=st;if(t!==null)for(const c of t)c.rv=st;ye!==null&&(r===null?r=ye:r.push(...ye))}return(e.f&Je)!==0&&(e.f^=Je),v}catch(c){return Ar(e),ls(c)}finally{e.f^=pn,_e=t,me=n,ye=r,L=i,qe=a,wt(s),je=o,ut=l}}function Ar(e){var t=e.deps,n=C?.is_fork;if(_e!==null){var r;if(n||Kt(e,me),t!==null&&me>0)for(t.length=me+_e.length,r=0;r<_e.length;r++)t[me+r]=_e[r];else e.deps=t=_e;if(lr()&&(e.f&Ce)!==0)for(r=me;r<t.length;r++)(t[r].reactions??=[]).push(e)}else!n&&t!==null&&me<t.length&&(Kt(e,me),t.length=me);return t}function _s(e,t){let n=t.reactions;if(n!==null){var r=la.call(n,e);if(r!==-1){var i=n.length-1;i===0?n=t.reactions=null:(n[r]=n[i],n.pop())}}if(n===null&&(t.f&ue)!==0&&(_e===null||!dn.call(_e,t))){var a=t;(a.f&Ce)!==0&&(a.f^=Ce),a.v!==J&&nr(a),a.ac!==null&&Pt(()=>{a.ac.abort(en),a.ac=null,G(a,X)}),es(a),Kt(a,0)}}function Kt(e,t){var n=e.deps;if(n!==null)for(var r=t;r<n.length;r++)_s(e,n[r])}function $t(e){var t=e.f;if((t&he)===0){G(e,Z);var n=O,r=cn;O=e,cn=(t&(ke|We))===0;try{(t&(Pe|Zn))!==0?vs(e):fr(e),wi(e);var i=Mi(e);e.teardown=typeof i=="function"?i:null,e.wv=Ai;var a;Vr&&Ba&&(e.f&X)!==0&&e.deps}finally{cn=r,O=n}}}async function gs(){await Promise.resolve(),ns()}function d(e){var t=e.f,n=(t&ue)!==0;if(L!==null&&!je){var r=O!==null&&(O.f&he)!==0;if(!r&&(qe===null||!qe.has(e))){var i=L.deps;if((L.f&pn)!==0)e.rv<st&&(e.rv=st,_e===null&&i!==null&&i[me]===e?me++:_e===null?_e=[e]:_e.push(e));else{L.deps??=[],dn.call(L.deps,e)||L.deps.push(e);var a=e.reactions;a===null?e.reactions=[L]:dn.call(a,L)||a.push(L)}}}if(Ge&&De.has(e))return De.get(e);if(n){var s=e;if(Ge){var o=s.v;return((s.f&Z)===0&&s.reactions!==null||Ni(s))&&(o=ir(s)),De.set(s,o),o}var l=(s.f&Ce)===0&&!je&&L!==null&&(cn||(L.f&Ce)!==0),u=(s.f&Tt)===0;an(s)&&(l&&(s.f|=Ce),ai(s)),l&&!u&&(si(s),Pi(s))}if(Ne?.has(e))return Ne.get(e);if((e.f&Je)!==0)throw e.v;return e.v}function Pi(e){if(e.f|=Ce,e.deps!==null)for(const t of e.deps)(t.reactions??=[]).push(e),(t.f&ue)!==0&&(t.f&Ce)===0&&(si(t),Pi(t))}function Ni(e){if(e.v===J)return!0;if(e.deps===null)return!1;for(const t of e.deps)if(De.has(t)||(t.f&ue)!==0&&Ni(t))return!0;return!1}function et(e){var t=je;try{return je=!0,e()}finally{je=t}}function mt(e){if(!(typeof e!="object"||!e||e instanceof EventTarget)){if(Re in e)Bn(e);else if(!Array.isArray(e))for(let t in e){const n=e[t];typeof n=="object"&&n&&Re in n&&Bn(n)}}}function Bn(e,t=new Set){if(typeof e=="object"&&e!==null&&!(e instanceof EventTarget)&&!t.has(e)){t.add(e),e instanceof Date&&e.getTime();for(let r in e)try{Bn(e[r],t)}catch{}const n=Jn(e);if(n!==Object.prototype&&n!==Array.prototype&&n!==Map.prototype&&n!==Set.prototype&&n!==Date.prototype){const r=Hr(n);for(let i in r){const a=r[i].get;if(a)try{a.call(e)}catch{}}}}}function ms(e){return e.endsWith("capture")&&e!=="gotpointercapture"&&e!=="lostpointercapture"}const bs=["beforeinput","click","change","dblclick","contextmenu","focusin","focusout","input","keydown","keyup","mousedown","mousemove","mouseout","mouseover","mouseup","pointerdown","pointermove","pointerout","pointerover","pointerup","touchend","touchmove","touchstart"];function ys(e){return bs.includes(e)}const ws={formnovalidate:"formNoValidate",ismap:"isMap",nomodule:"noModule",playsinline:"playsInline",readonly:"readOnly",defaultvalue:"defaultValue",defaultchecked:"defaultChecked",srcobject:"srcObject",novalidate:"noValidate",allowfullscreen:"allowFullscreen",disablepictureinpicture:"disablePictureInPicture",disableremoteplayback:"disableRemotePlayback"};function xs(e){return e=e.toLowerCase(),ws[e]??e}const ks=["touchstart","touchmove"];function Es(e){return ks.includes(e)}const qt=Symbol("events"),ji=new Set,Wn=new Set;function Ci(e,t,n,r={}){function i(a){if(r.capture||Gn.call(t,a),!a.cancelBubble)return Pt(()=>n?.call(this,a))}return e.startsWith("pointer")||e.startsWith("touch")||e==="wheel"?(i.__removed=!1,Ie(()=>{i.__removed||t.addEventListener(e,i,r)})):t.addEventListener(e,i,r),i}function ot(e,t,n,r,i){var a={capture:r,passive:i},s=Ci(e,t,n,a);(t===document.body||t===window||t===document||t instanceof HTMLMediaElement)&&xn(()=>{s.__removed=!0,t.removeEventListener(e,s,a)})}function le(e,t,n){(t[qt]??={})[e]=n}function Nt(e){for(var t=0;t<e.length;t++)ji.add(e[t]);for(var n of Wn)n(e)}let Sn=null,Mn=!1;function Gn(e){var t=this,n=t.ownerDocument,r=e.type,i=e.composedPath?.()||[],a=i[0]||e.target;Sn=e,Mn||(Mn=!0,setTimeout(()=>{Mn=!1,Sn=null}));var s=0,o=Sn===e&&e[qt];if(o){var l=i.indexOf(o);if(l!==-1&&(t===document||t===window)){e[qt]=t;return}var u=i.indexOf(t);if(u===-1)return;l<=u&&(s=l)}if(a=i[s]||e.target,a!==t){qr(e,"currentTarget",{configurable:!0,get(){return a||n}});var f=L,v=O;Ee(null),$e(null);try{for(var h,p=[];a!==null&&a!==t;){try{var c=a[qt]?.[r];c!=null&&(!a.disabled||e.target===a)&&c.call(a,e)}catch(g){h?p.push(g):h=g}if(e.cancelBubble)break;s++,a=s<i.length?i[s]:null}if(h){for(let g of p)queueMicrotask(()=>{throw g});throw h}}finally{e[qt]=t,delete e.currentTarget,Ee(f),$e(v)}}}const $s=globalThis?.window?.trustedTypes&&globalThis.window.trustedTypes.createPolicy("svelte-trusted-html",{createHTML:e=>e});function As(e){return $s?.createHTML(e)??e}function Oi(e){var t=or("template");return t.innerHTML=As(e.replaceAll("<!>","<!---->")),t.content}function Xt(e,t){var n=O;n.nodes===null&&(n.nodes={start:e,end:t,a:null,t:null})}function I(e,t){var n=(t&ka)!==0,r=(t&Ea)!==0,i,a=!e.startsWith("<!>");return()=>{i===void 0&&(i=Oi(a?e:"<!>"+e),n||(i=ct(i)));var s=r||hi?document.importNode(i,!0):i.cloneNode(!0);if(n){var o=ct(s),l=s.lastChild;Xt(o,l)}else Xt(s,s);return s}}function Ts(e,t,n="svg"){var r=!e.startsWith("<!>"),i=`<${n}>${r?e:"<!>"+e}</${n}>`,a;return()=>{if(!a){var s=Oi(i),o=ct(s);a=ct(o)}var l=a.cloneNode(!0);return Xt(l,l),l}}function Ss(e,t){return Ts(e,t,"svg")}function ie(){var e=document.createDocumentFragment(),t=document.createComment(""),n=Ve();return e.append(t,n),Xt(t,n),e}function k(e,t){e!==null&&e.before(t)}function Ms(e){let t=0,n=Qe(0),r;return()=>{lr()&&(d(n),ur(()=>(t===0&&(r=et(()=>e(()=>Ut(n)))),t+=1,()=>{Ie(()=>{t-=1,t===0&&(r?.(),r=void 0,Ut(n))})})))}}var Ps=ft|St;function Ns(e,t,n,r){new js(e,t,n,r)}class js{parent;is_pending=!1;transform_error;#t;#s=null;#e;#l;#r;#a=null;#n=null;#o=null;#i=null;#h=0;#u=0;#f=!1;#d=new Set;#_=new Set;#c=null;#b=Ms(()=>(this.#c=Qe(this.#h),()=>{this.#c=null}));constructor(t,n,r,i){this.#t=t,this.#e=n,this.#l=a=>{var s=O;s.b=this,s.f|=In,r(a)},this.parent=O.b,this.transform_error=i??this.parent?.transform_error??(a=>a),this.#r=rn(()=>{this.#y()},Ps)}#x(){try{this.#a=de(()=>this.#l(this.#t))}catch(t){this.error(t)}}#g(t){const n=this.#e.failed,{reset:r,invoke_onerror:i}=this.#m(t);Ie(i),n&&(this.#o=de(()=>{n(this.#t,()=>t,()=>r)}))}#m(t){var n=!1,r=!1;const i=()=>{if(n){Ma();return}n=!0,r&&Ha(),this.#o!==null&&lt(this.#o,()=>{this.#o=null}),this.#w(()=>{this.#y()})};return{reset:i,invoke_onerror:()=>{try{r=!0,this.#e.onerror?.(t,i),r=!1}catch(s){Le(s,this.#r&&this.#r.parent)}}}}#k(){const t=this.#e.pending;t&&(this.is_pending=!0,this.#n=de(()=>t(this.#t)),Ie(()=>{var n=this.#i=document.createDocumentFragment(),r=Ve(),i=!1;if(n.append(r),this.#a=this.#w(()=>{try{return de(()=>this.#l(r))}catch(a){try{this.error(a),i=!0}catch(s){Le(s,this.#r.parent)}return null}}),this.#a===null){this.#i=null,i&&this.#v(C);return}this.#u===0&&(this.#t.before(n),this.#i=null,lt(this.#n,()=>{this.#n=null}),this.#v(C))}))}#y(){try{if(this.is_pending=this.has_pending_snippet(),this.#u=0,this.#h=0,this.#a=de(()=>{this.#l(this.#t)}),this.#u>0){var t=this.#i=document.createDocumentFragment();cr(this.#a,t);const n=this.#e.pending;this.#n=de(()=>n(this.#t))}else this.#v(C)}catch(n){this.error(n)}}#v(t){this.is_pending=!1,t.transfer_effects(this.#d,this.#_)}defer_effect(t){ni(t,this.#d,this.#_)}is_rendered(){return!this.is_pending&&(!this.parent||this.parent.is_rendered())}has_pending_snippet(){return!!this.#e.pending}#w(t){var n=O,r=L,i=B;$e(this.#r),Ee(this.#r),wt(this.#r.ctx);try{return Ze.ensure(),t()}finally{$e(n),Ee(r),wt(i)}}#p(t,n){if(!this.has_pending_snippet()){this.parent&&this.parent.#p(t,n);return}this.#u+=t,this.#u===0&&(this.#v(n),this.#n&&lt(this.#n,()=>{this.#n=null}),this.#i&&(this.#t.before(this.#i),this.#i=null))}update_pending_count(t,n){this.#p(t,n),this.#h+=t,!(!this.#c||this.#f)&&(this.#f=!0,Ie(()=>{this.#f=!1,this.#c&&kt(this.#c,this.#h)}))}get_effect_pending(){return this.#b(),d(this.#c)}error(t){if(!this.#e.onerror&&!this.#e.failed)throw t;C?.is_fork?(this.#a&&C.skip_effect(this.#a),this.#n&&C.skip_effect(this.#n),this.#o&&C.skip_effect(this.#o),C.oncommit(()=>{this.#E(t)})):this.#E(t)}#E(t){this.#a&&(re(this.#a),this.#a=null),this.#n&&(re(this.#n),this.#n=null),this.#o&&(re(this.#o),this.#o=null);let n=this.#e.failed;const r=i=>{const{reset:a,invoke_onerror:s}=this.#m(i);s(),n&&(this.#o=this.#w(()=>{try{return de(()=>{var o=O;o.b=this,o.f|=In,n(this.#t,()=>i,()=>a)})}catch(o){return Le(o,this.#r.parent),null}}))};Ie(()=>{var i;try{i=this.transform_error(t)}catch(a){Le(a,this.#r&&this.#r.parent);return}i!==null&&typeof i=="object"&&typeof i.then=="function"?i.then(r,a=>Le(a,this.#r&&this.#r.parent)):r(i)})}}function V(e,t){var n=t==null?"":typeof t=="object"?`${t}`:t;n!==(e[Dn]??=e.nodeValue)&&(e[Dn]=n,e.nodeValue=`${n}`)}function Cs(e,t){return Os(e,t)}const on=new Map;function Os(e,{target:t,anchor:n,props:r={},events:i,context:a,intro:s=!0,transformError:o}){ss();var l=void 0,u=cs(()=>{var f=n??t.appendChild(Ve());Ns(f,{pending:()=>{}},p=>{tt({});var c=B;a&&(c.c=a),i&&(r.$$events=i),l=e(p,r)||tr(),nt()},o);var v=new Set,h=p=>{for(var c=0;c<p.length;c++){var g=p[c];if(!v.has(g)){v.add(g);var _=Es(g);for(const m of[t,document]){var b=on.get(m);b===void 0&&(b=new Map,on.set(m,b));var A=b.get(g);A===void 0?(m.addEventListener(g,Gn,{passive:_}),b.set(g,1)):b.set(g,A+1)}}}};return h(wn(ji)),Wn.add(h),()=>{for(var p of v)for(const _ of[t,document]){var c=on.get(_),g=c.get(p);--g==0?(_.removeEventListener(p,Gn),c.delete(p),c.size===0&&on.delete(_)):c.set(p,g)}Wn.delete(h),f!==n&&f.parentNode?.removeChild(f)}});return Ls.set(l,u),l}let Ls=new WeakMap;class Li{anchor;#t=new Map;#s=new Map;#e=new Map;#l=new Set;#r=!0;constructor(t,n=!0){this.anchor=t,this.#r=n}#a=t=>{if(this.#t.has(t)){var n=this.#t.get(t),r=this.#s.get(n);if(r)mn(r),this.#l.delete(n);else{var i=this.#e.get(n);i&&(mn(i.effect),this.#s.set(n,i.effect),this.#e.delete(n),i.fragment.lastChild.remove(),this.anchor.before(i.fragment),r=i.effect)}for(const[a,s]of this.#t){if(this.#t.delete(a),a===t)break;const o=this.#e.get(s);o&&(re(o.effect),this.#e.delete(s))}for(const[a,s]of this.#s){if(a===n||this.#l.has(a))continue;const o=()=>{if(Array.from(this.#t.values()).includes(a)){var u=document.createDocumentFragment();cr(s,u),u.append(Ve()),this.#e.set(a,{effect:s,fragment:u})}else re(s);this.#l.delete(a),this.#s.delete(a)};this.#r||!r?(this.#l.add(a),lt(s,o,!1)):o()}}};#n=t=>{this.#t.delete(t);const n=Array.from(this.#t.values());for(const[r,i]of this.#e)n.includes(r)||(re(i.effect),this.#e.delete(r))};ensure(t,n){var r=C,i=gi();if(n&&!this.#s.has(t)&&!this.#e.has(t))if(i){var a=document.createDocumentFragment(),s=Ve();a.append(s),this.#e.set(t,{effect:de(()=>n(s)),fragment:a})}else this.#s.set(t,de(()=>n(this.anchor)));if(this.#t.set(r,t),i){for(const[o,l]of this.#s)o===t?r.unskip_effect(l):r.skip_effect(l);for(const[o,l]of this.#e)o===t?r.unskip_effect(l.effect):r.skip_effect(l.effect);r.oncommit(this.#a),r.ondiscard(this.#n)}else this.#a(r)}}function ne(e,t,n=!1){var r=new Li(e),i=n?ft:0;function a(s,o){r.ensure(s,o)}rn(()=>{var s=!1;t((o,l=0)=>{s=!0,a(l,o)}),s||a(-1,null)},i)}function zi(e,t){return t}function zs(e,t,n){for(var r=[],i=t.length,a,s=t.length,o=0;o<i;o++){let v=t[o];lt(v,()=>{if(a){if(a.pending.delete(v),a.done.add(v),a.pending.size===0){var h=e.outrogroups;Un(e,wn(a.done)),h.delete(a),h.size===0&&(e.outrogroups=null)}}else s-=1},!1)}if(s===0){var l=r.length===0&&n!==null&&e.pending.size===0;if(l){var u=n,f=u.parentNode;os(f),f.append(u),e.items.clear()}Un(e,t,!l)}else a={pending:new Set(t),done:new Set},(e.outrogroups??=new Set).add(a)}function Un(e,t,n=!0){var r;if(e.pending.size>0){r=new Set;for(const s of e.pending.values())for(const o of s)r.add(e.items.get(o).e)}for(var i=0;i<t.length;i++){var a=t[i];if(r?.has(a)){a.f|=ze;const s=document.createDocumentFragment();cr(a,s)}else re(t[i],n)}}var Tr;function Ke(e,t,n,r,i,a=null){var s=e,o=new Map,l=(t&Xr)!==0;if(l){var u=e;s=u.appendChild(Ve())}var f=null,v=rr(()=>{var m=n();return yn(m)?m:m==null?[]:wn(m)}),h,p=new Map,c=!0;function g(m){(A.effect.f&he)===0&&(A.pending.delete(m),A.fallback=f,Is(A,h,s,t,r),f!==null&&(h.length===0?(f.f&ze)===0?mn(f):(f.f^=ze,Ht(f,null,s)):lt(f,()=>{f=null})))}function _(m){A.pending.delete(m)}var b=rn(()=>{h=d(v);for(var m=h.length,M=new Set,D=C,y=gi(),E=0;E<m;E+=1){var j=h[E],R=r(j,E),N=c?null:o.get(R);N?(N.v&&kt(N.v,j),N.i&&kt(N.i,E),y&&D.unskip_effect(N.e)):(N=Fs(o,c?s:Tr??=Ve(),j,R,E,i,t,n),c||(N.e.f|=ze),o.set(R,N)),M.add(R)}if(m===0&&a&&!f&&(c?f=de(()=>a(s)):(f=de(()=>a(Tr??=Ve())),f.f|=ze)),m>M.size&&Oa(),!c)if(p.set(D,M),y){for(const[te,pe]of o)M.has(te)||D.skip_effect(pe.e);D.oncommit(g),D.ondiscard(_)}else g(D);d(v)}),A={effect:b,items:o,pending:p,outrogroups:null,fallback:f};c=!1}function Ft(e){for(;e!==null&&(e.f&ke)===0;)e=e.next;return e}function Is(e,t,n,r,i){var a=(r&ga)!==0,s=t.length,o=e.items,l=Ft(e.effect.first),u,f=null,v,h=[],p=[],c,g,_,b;if(a)for(b=0;b<s;b+=1)c=t[b],g=i(c,b),_=o.get(g).e,(_.f&ze)===0&&(_.nodes?.a?.measure(),(v??=new Set).add(_));for(b=0;b<s;b+=1){if(c=t[b],g=i(c,b),_=o.get(g).e,e.outrogroups!==null)for(const N of e.outrogroups)N.pending.delete(_),N.done.delete(_);if((_.f&ve)!==0&&(mn(_),a&&(_.nodes?.a?.unfix(),(v??=new Set).delete(_))),(_.f&ze)!==0)if(_.f^=ze,_===l)Ht(_,null,n);else{var A=f?f.next:l;_===e.effect.last&&(e.effect.last=_.prev),_.prev&&(_.prev.next=_.next),_.next&&(_.next.prev=_.prev),Ue(e,f,_),Ue(e,_,A),Ht(_,A,n),f=_,h=[],p=[],l=Ft(f.next);continue}if(_!==l){if(u!==void 0&&u.has(_)){if(h.length<p.length){var m=p[0],M;f=m.prev;var D=h[0],y=h[h.length-1];for(M=0;M<h.length;M+=1)Ht(h[M],m,n);for(M=0;M<p.length;M+=1)u.delete(p[M]);Ue(e,D.prev,y.next),Ue(e,f,D),Ue(e,y,m),l=m,f=y,b-=1,h=[],p=[]}else u.delete(_),Ht(_,l,n),Ue(e,_.prev,_.next),Ue(e,_,f===null?e.effect.first:f.next),Ue(e,f,_),f=_;continue}for(h=[],p=[];l!==null&&l!==_;)(u??=new Set).add(l),p.push(l),l=Ft(l.next);if(l===null)continue}(_.f&ze)===0&&h.push(_),f=_,l=Ft(_.next)}if(e.outrogroups!==null){for(const N of e.outrogroups)N.pending.size===0&&(Un(e,wn(N.done)),e.outrogroups?.delete(N));e.outrogroups.size===0&&(e.outrogroups=null)}if(l!==null||u!==void 0){var E=[];if(u!==void 0)for(_ of u)(_.f&ve)===0&&E.push(_);for(;l!==null;)(l.f&ve)===0&&l!==e.fallback&&E.push(l),l=Ft(l.next);var j=E.length;if(j>0){var R=(r&Xr)!==0&&s===0?n:null;if(a){for(b=0;b<j;b+=1)E[b].nodes?.a?.measure();for(b=0;b<j;b+=1)E[b].nodes?.a?.fix()}zs(e,E,R)}}a&&Ie(()=>{if(v!==void 0)for(_ of v)_.nodes?.a?.apply()})}function Fs(e,t,n,r,i,a,s,o){var l=(s&pa)!==0?(s&ma)===0?is(n,!1,!1):Qe(n):null,u=(s&_a)!==0?Qe(i):null;return{v:l,i:u,e:de(()=>(a(t,l??n,u??i,o),()=>{e.delete(r)}))}}function Ht(e,t,n){if(e.nodes)for(var r=e.nodes.start,i=e.nodes.end,a=t&&(t.f&ze)===0?t.nodes.start:n;r!==null;){var s=nn(r);if(a.before(r),r===i)return;r=s}}function Ue(e,t,n){t===null?e.effect.first=n:t.next=n,n===null?e.effect.last=t:n.prev=t}function ae(e,t,n,r,i){if(t.$$host?.$$shadowRoot){const o=or("slot");k(e,o);return}var a=t.$$slots?.[n],s=!1;a===!0&&(a=t.children,s=!0),a===void 0||a(e,s?()=>r:r)}function Rs(e,t,n,r,i,a){var s=null,o=e,l=new Li(o,!1);rn(()=>{const u=t()||null;var f=$a;if(u===null){l.ensure(null,null);return}return l.ensure(u,v=>{if(u){if(s=or(u,f),Xt(s,s),r){var h=null,p=s.appendChild(Ve());r(s,p),h?.remove()}O.nodes.end=s,v.before(s)}}),()=>{}},ft),xn(()=>{})}function Ds(e,t){var n;n=document.head.appendChild(Ve());try{rn(()=>{var r=de(()=>t(n));r.f|=Wr,Pa||(r.nodes===null?r.nodes={start:n,end:n,a:null,t:null}:r.nodes.end=n)})}finally{}}function Vs(e,t){var n=void 0,r;yi(()=>{n!==(n=t())&&(r&&(re(r),r=null),n&&(r=de(()=>{kn(()=>n(e))})))})}function Ii(e){var t,n,r="";if(typeof e=="string"||typeof e=="number")r+=e;else if(typeof e=="object")if(Array.isArray(e)){var i=e.length;for(t=0;t<i;t++)e[t]&&(n=Ii(e[t]))&&(r&&(r+=" "),r+=n)}else for(n in e)e[n]&&(r&&(r+=" "),r+=n);return r}function qs(){for(var e,t,n=0,r="",i=arguments.length;n<i;n++)(e=arguments[n])&&(t=Ii(e))&&(r&&(r+=" "),r+=t);return r}function Hs(e){return typeof e=="object"?qs(e):e??""}const Sr=[...` 	
\r\f \v\uFEFF`];function Bs(e,t,n){var r=e==null?"":""+e;if(n){for(var i of Object.keys(n))if(n[i])r=r?r+" "+i:i;else if(r.length)for(var a=i.length,s=0;(s=r.indexOf(i,s))>=0;){var o=s+a;(s===0||Sr.includes(r[s-1]))&&(o===r.length||Sr.includes(r[o]))?r=(s===0?"":r.substring(0,s))+r.substring(o+1):s=o}}return r===""?null:r}function Mr(e,t=!1){var n=t?" !important;":";",r="";for(var i of Object.keys(e)){var a=e[i];a!=null&&a!==""&&(r+=" "+i+": "+a+n)}return r}function Pn(e){return e[0]!=="-"||e[1]!=="-"?e.toLowerCase():e}function Ws(e,t){if(t){var n="",r,i;if(Array.isArray(t)?(r=t[0],i=t[1]):r=t,e){e=String(e).replaceAll(/\/\*.*?\*\//g,"").trim();var a=!1,s=0,o=!1,l=[];r&&l.push(...Object.keys(r).map(Pn)),i&&l.push(...Object.keys(i).map(Pn));var u=0,f=-1;const g=e.length;for(var v=0;v<g;v++){var h=e[v];if(o?h==="/"&&e[v-1]==="*"&&(o=!1):a?a===h&&(a=!1):h==="/"&&e[v+1]==="*"?o=!0:h==='"'||h==="'"?a=h:h==="("?s++:h===")"&&s--,!o&&a===!1&&s===0){if(h===":"&&f===-1)f=v;else if(h===";"||v===g-1){if(f!==-1){var p=Pn(e.substring(u,f).trim());if(!l.includes(p)){h!==";"&&v++;var c=e.substring(u,v).trim();n+=" "+c+";"}}u=v+1,f=-1}}}}return r&&(n+=Mr(r)),i&&(n+=Mr(i,!0)),n=n.trim(),n===""?null:n}return e==null?null:String(e)}function Yt(e,t,n,r,i,a){var s=e[Fn];if(s!==n||s===void 0){var o=Bs(n,r,a);o==null?e.removeAttribute("class"):t?e.className=o:e.setAttribute("class",o),e[Fn]=n}else if(a&&i!==a)for(var l in a){var u=!!a[l];(i==null||u!==!!i[l])&&e.classList.toggle(l,u)}return a}function Nn(e,t={},n,r){for(var i in n){var a=n[i];t[i]!==a&&(n[i]==null?e.style.removeProperty(i):e.style.setProperty(i,a,r))}}function At(e,t,n,r){var i=e[Rn];if(i!==t){var a=Ws(t,r);a==null?e.removeAttribute("style"):e.style.cssText=a,e[Rn]=t}else r&&(Array.isArray(r)?(Nn(e,n?.[0],r[0]),Nn(e,n?.[1],r[1],"important")):Nn(e,n,r));return r}function Fi(e,t){t?e.hasAttribute("selected")||e.setAttribute("selected",""):e.removeAttribute("selected")}function Pr(e,t){var n=!("__defaultValue"in e);!n&&e.__defaultValue===t||(e.__defaultValue=t,Ri(e,!n||"__value"in e))}function Ri(e,t){var n=e.__defaultValue,r=e.multiple,i=r?n??[]:null;if(!(r&&!yn(i))){var a=e.selectedIndex,s=t&&r?new Set(e.selectedOptions):null;for(var o of e.options){var l=Kn(o);Fi(o,r?i.includes(l):di(l,n))}if(t)if(s!==null)for(o of e.options){var u=s.has(o);o.selected!==u&&(o.selected=u)}else e.selectedIndex!==a&&(e.selectedIndex=a)}}function Yn(e,t,n=!1){if(e.multiple){if(t==null)return;if(!yn(t))return Sa();for(var r of e.options)r.selected=t.includes(Kn(r));return}for(r of e.options){var i=Kn(r);if(di(i,t)){r.selected=!0;return}}(!n||t!==void 0)&&(e.selectedIndex=-1)}function Gs(e){var t=new MutationObserver(n=>{n.every(Us)||("__defaultValue"in e&&Ri(e,!1),"__value"in e&&Yn(e,e.__value))});t.observe(e,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["value"]}),xn(()=>{t.disconnect()})}function Kn(e){return"__value"in e?e.__value:e.value}function Us(e){if(e.target.closest("selectedcontent")!==null)return!0;if(e.type==="childList"){var t=[...e.addedNodes,...e.removedNodes];return t.length>0&&t.every(n=>n.nodeName==="SELECTEDCONTENT")}return!1}const Rt=Symbol("class"),Dt=Symbol("style"),Di=Symbol("is custom element"),Vi=Symbol("is html"),Ys=er?"input":"INPUT",Ks=er?"option":"OPTION",qi=er?"select":"SELECT";function K(e,t,n,r){var i=Hi(e);i[t]!==(i[t]=n)&&(t==="loading"&&(e[ha]=n),n==null?e.removeAttribute(t):typeof n!="string"&&Bi(e).has(t)?e[t]=n:e.setAttribute(t,n))}function Xs(e,t,n,r,i=!1,a=!1){var s=Hi(e),o=s[Di],l=!s[Vi],u=t||{},f=e.nodeName===Ks,v=e.nodeName===qi;for(var h in t)!(h in n)&&h[0]+h[1]!=="$$"&&(n[h]=null);n.class?n.class=Hs(n.class):n[Rt]&&(n.class=null),n[Dt]&&(n.style??=null);var p=Bi(e);if(e.nodeName===Ys&&"type"in n&&("value"in n||"__value"in n)){var c=n.type;(c!==u.type||c===void 0&&e.hasAttribute("type"))&&(u.type=c,K(e,"type",c))}for(const y in n){let E=n[y];if(f&&y==="value"&&E==null){e.value=e.__value="",u[y]=E;continue}if(y==="class"){var g=e.namespaceURI==="http://www.w3.org/1999/xhtml";Yt(e,g,E,r,t?.[Rt],n[Rt]),u[y]=E,u[Rt]=n[Rt];continue}if(y==="style"){At(e,E,t?.[Dt],n[Dt]),u[y]=E,u[Dt]=n[Dt];continue}var _=u[y];if(!(E===_&&!(E===void 0&&e.hasAttribute(y)))){u[y]=E;var b=y[0]+y[1];if(b!=="$$")if(b==="on"){const j={},R="$$"+y;let N=y.slice(2);var A=ys(N);if(ms(N)&&(N=N.slice(0,-7),j.capture=!0),!A&&_){if(E!=null)continue;e.removeEventListener(N,u[R],j),u[R]=null}if(A)le(N,e,E),Nt([N]);else if(E!=null){let te=function(pe){u[y].call(this,pe)};var D=te;u[R]=Ci(N,e,te,j)}}else if(y==="style")K(e,y,E);else if(y==="autofocus")Ya(e,!!E);else if(!o&&(y==="__value"||y==="value"&&E!=null))e.value=e.__value=E;else if(y==="selected"&&f)Fi(e,E);else{var m=y;l||(m=xs(m));var M=m==="defaultValue"||m==="defaultChecked";if(v&&m==="defaultValue")continue;if(E==null&&!o&&!M)if(s[y]=null,m==="value"||m==="checked"){let j=e;const R=t===void 0;if(m==="value"){let N=j.defaultValue;j.removeAttribute(m),j.defaultValue=N,j.value=j.__value=R?N:null}else{let N=j.defaultChecked;j.removeAttribute(m),j.defaultChecked=N,j.checked=R?N:!1}}else e.removeAttribute(y);else M||(o||typeof E!="string")&&p.has(m)?(e[m]=E,m in s&&(s[m]=J)):typeof E!="function"&&K(e,m,E)}}}return u}function Nr(e,t,n=[],r=[],i=[],a,s=!1,o=!1){ri(i,n,r,l=>{var u=void 0,f={},v=e.nodeName===qi,h=!1;if(yi(()=>{var c=t(...l.map(d)),g=Xs(e,u,c,a,s,o);if(h&&v){var _=e;"defaultValue"in c&&Pr(_,c.defaultValue),"value"in c&&Yn(_,c.value)}for(let A of Object.getOwnPropertySymbols(f))c[A]||re(f[A]);for(let A of Object.getOwnPropertySymbols(c)){var b=c[A];A.description===Aa&&(!u||b!==u[A])&&(f[A]&&re(f[A]),f[A]=de(()=>Vs(e,()=>b))),g[A]=b}u=g}),v){var p=e;kn(()=>{var c=u;"defaultValue"in c&&Pr(p,c.defaultValue),Yn(p,c.value,!0),Gs(p)})}h=!0})}function Hi(e){return e[Kr]??={[Di]:e.nodeName.includes("-"),[Vi]:e.namespaceURI===Zr}}var jr=new Map;function Bi(e){var t=e.getAttribute("is")||e.nodeName,n=jr.get(t);if(n)return n;jr.set(t,n=new Set);for(var r,i=e,a=Element.prototype;a!==i;){r=Hr(i);for(var s in r)r[s].set&&s!=="innerHTML"&&s!=="textContent"&&s!=="innerText"&&n.add(s);i=Jn(i)}return n}function Js(e,t,n=t){var r=new WeakSet;Xa(e,"input",async i=>{var a=i?e.defaultValue:e.value;if(a=jn(e)?Cn(a):a,n(a),C!==null&&r.add(C),await gs(),a!==(a=t())){var s=e.selectionStart,o=e.selectionEnd,l=e.value.length;if(e.value=a??"",o!==null){var u=e.value.length;s===o&&o===l&&u>l?(e.selectionStart=u,e.selectionEnd=u):(e.selectionStart=s,e.selectionEnd=Math.min(o,u))}}}),et(t)==null&&e.value&&(n(jn(e)?Cn(e.value):e.value),C!==null&&r.add(C)),ur(()=>{var i=t();if(e===document.activeElement){var a=C;if(r.has(a))return}jn(e)&&i===Cn(e.value)||e.type==="date"&&!i&&!e.value||i!==e.value&&(e.value=i??"")})}function jn(e){var t=e.type;return t==="number"||t==="range"}function Cn(e){return e===""?null:+e}function On(e,t){return e===t||e?.[Re]===t}function dr(e=tr(),t,n,r){var i=B.r,a=O;return kn(()=>{var s,o;return ur(()=>{s=o,o=[],et(()=>{On(n(...o),e)||(t(e,...o),s&&On(n(...s),e)&&t(null,...s))})}),()=>{let l=a;for(;l!==i&&l.parent!==null&&l.parent.f&vn;)l=l.parent;const u=()=>{o&&On(n(...o),e)&&t(null,...o)},f=l.teardown;l.teardown=()=>{u(),f?.()}}}),e}function Zs(e=!1){const t=B,n=t.l.u;if(!n)return;let r=()=>mt(t.s);if(e){let i=0,a={};const s=xt(()=>{let o=!1;const l=t.s;for(const u in l)l[u]!==a[u]&&(a[u]=l[u],o=!0);return o&&i++,i});r=()=>d(s)}n.b.length&&fs(()=>{Cr(t,r),zn(n.b)}),Et(()=>{const i=et(()=>n.m.map(da));return()=>{for(const a of i)typeof a=="function"&&a()}}),n.a.length&&Et(()=>{Cr(t,r),zn(n.a)})}function Cr(e,t){if(e.l.s)for(const n of e.l.s)d(n);t()}let ln=!1;function Qs(e){var t=ln;try{return ln=!1,[e(),ln]}finally{ln=t}}const eo={get(e,t){if(!e.exclude.includes(t))return d(e.version),t in e.special?e.special[t]():e.props[t]},set(e,t,n){if(!(t in e.special)){var r=O;try{$e(e.parent_effect),e.special[t]=be({get[t](){return e.props[t]}},t,Jr)}finally{$e(r)}}return e.special[t](n),wr(e.version),!0},getOwnPropertyDescriptor(e,t){if(!e.exclude.includes(t)&&t in e.props)return{enumerable:!0,configurable:!0,value:e.props[t]}},deleteProperty(e,t){return e.exclude.includes(t)||(e.exclude.push(t),wr(e.version)),!0},has(e,t){return e.exclude.includes(t)?!1:t in e.props},ownKeys(e){return Reflect.ownKeys(e.props).filter(t=>!e.exclude.includes(t))}};function ee(e,t){return new Proxy({props:e,exclude:t,special:{},version:Qe(0),parent_effect:O},eo)}const to={get(e,t){let n=e.props.length;for(;n--;){let r=e.props[n];if(It(r)&&(r=r()),typeof r=="object"&&r!==null&&t in r)return r[t]}},set(e,t,n){let r=e.props.length;for(;r--;){let i=e.props[r];It(i)&&(i=i());const a=Xe(i,t);if(a&&a.set)return a.set(n),!0}return!1},getOwnPropertyDescriptor(e,t){let n=e.props.length;for(;n--;){let r=e.props[n];if(It(r)&&(r=r()),typeof r=="object"&&r!==null&&t in r){const i=Xe(r,t);return i&&!i.configurable&&(i.configurable=!0),i}}},has(e,t){if(t===Re||t===Yr)return!1;for(let n of e.props)if(It(n)&&(n=n()),n!=null&&t in n)return!0;return!1},ownKeys(e){const t=[];for(let n of e.props)if(It(n)&&(n=n()),!!n){for(const r in n)t.includes(r)||t.push(r);for(const r of Object.getOwnPropertySymbols(n))t.includes(r)||t.push(r)}return t}};function fe(...e){return new Proxy({props:e},to)}function be(e,t,n,r){var i=!Mt||(n&ya)!==0,a=(n&wa)!==0,s=(n&xa)!==0,o=r,l=!0,u=void 0,f=()=>s&&i?(u??=xt(r),d(u)):(l&&(l=!1,o=s?et(r):r),o);let v;if(a){var h=Re in e||Yr in e;v=Xe(e,t)?.set??(h&&t in e?M=>e[t]=M:void 0)}var p,c=!1;a?[p,c]=Qs(()=>e[t]):p=e[t],p===void 0&&r!==void 0&&(p=f(),v&&(i&&Ra(),v(p)));var g;if(i?g=()=>{var M=e[t];return M===void 0?f():(l=!0,M)}:g=()=>{var M=e[t];return M!==void 0&&(o=void 0),M===void 0?o:M},i&&(n&Jr)===0)return g;if(v){var _=e.$$legacy;return(function(M,D){return arguments.length>0?((!i||!D||_||c)&&v(D?g():M),M):g()})}var b=!1,A=((n&ba)!==0?xt:rr)(()=>(b=!1,g()));a&&d(A);var m=O;return(function(M,D){if(arguments.length>0){const y=D?d(A):i&&a?xe(M):M;return x(A,y),b=!0,o!==void 0&&(o=y),M}return Ge&&b||(m.f&he)!==0?A.v:d(A)})}function no(e){B===null&&ja(),Mt&&B.l!==null?ro(B).m.push(e):Et(()=>{const t=et(e);if(typeof t=="function")return t})}function ro(e){var t=e.l;return t.u??={a:[],b:[],m:[]}}const io="5";typeof window<"u"&&((window.__svelte??={}).v??=new Set).add(io);Wa();/**
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
 */const ao={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};var so=Ss("<svg><!><!></svg>");function ce(e,t){const n=ee(t,["children","$$slots","$$events","$$legacy"]),r=ee(n,["name","color","size","strokeWidth","absoluteStrokeWidth","iconNode"]);tt(t,!1);let i=be(t,"name",8,void 0),a=be(t,"color",8,"currentColor"),s=be(t,"size",8,24),o=be(t,"strokeWidth",8,2),l=be(t,"absoluteStrokeWidth",8,!1),u=be(t,"iconNode",24,()=>[]);const f=(...c)=>c.filter((g,_,b)=>!!g&&b.indexOf(g)===_).join(" ");Zs();var v=so();Nr(v,(c,g)=>({...ao,...r,width:s(),height:s(),stroke:a(),"stroke-width":c,class:g}),[()=>(mt(l()),mt(o()),mt(s()),et(()=>l()?Number(o())*24/Number(s()):o())),()=>(mt(i()),mt(n),et(()=>f("lucide-icon","lucide",i()?`lucide-${i()}`:"",n.class)))]);var h=P(v);Ke(h,1,u,zi,(c,g)=>{var _=Fe(()=>va(d(g),2));let b=()=>d(_)[0],A=()=>d(_)[1];var m=ie(),M=U(m);Rs(M,b,!0,(D,y)=>{Nr(D,()=>({...A()}))}),k(c,m)});var p=S(h);ae(p,t,"default",{}),k(e,v),nt()}function oo(e,t){const n=ee(t,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["path",{d:"M20 6 9 17l-5-5"}]];ce(e,fe({name:"check"},()=>n,{get iconNode(){return r},children:(i,a)=>{var s=ie(),o=U(s);ae(o,t,"default",{}),k(i,s)},$$slots:{default:!0}}))}function lo(e,t){const n=ee(t,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["path",{d:"m6 9 6 6 6-6"}]];ce(e,fe({name:"chevron-down"},()=>n,{get iconNode(){return r},children:(i,a)=>{var s=ie(),o=U(s);ae(o,t,"default",{}),k(i,s)},$$slots:{default:!0}}))}function uo(e,t){const n=ee(t,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["path",{d:"M12 2v2"}],["path",{d:"m4.93 4.93 1.41 1.41"}],["path",{d:"M20 12h2"}],["path",{d:"m19.07 4.93-1.41 1.41"}],["path",{d:"M15.947 12.65a4 4 0 0 0-5.925-4.128"}],["path",{d:"M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"}]];ce(e,fe({name:"cloud-sun"},()=>n,{get iconNode(){return r},children:(i,a)=>{var s=ie(),o=U(s);ae(o,t,"default",{}),k(i,s)},$$slots:{default:!0}}))}function fo(e,t){const n=ee(t,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["path",{d:"M12 15V3"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"}],["path",{d:"m7 10 5 5 5-5"}]];ce(e,fe({name:"download"},()=>n,{get iconNode(){return r},children:(i,a)=>{var s=ie(),o=U(s);ae(o,t,"default",{}),k(i,s)},$$slots:{default:!0}}))}function co(e,t){const n=ee(t,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["path",{d:"M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"}]];ce(e,fe({name:"heart"},()=>n,{get iconNode(){return r},children:(i,a)=>{var s=ie(),o=U(s);ae(o,t,"default",{}),k(i,s)},$$slots:{default:!0}}))}function vo(e,t){const n=ee(t,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["path",{d:"M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"}],["path",{d:"M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"}],["path",{d:"M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"}]];ce(e,fe({name:"layers"},()=>n,{get iconNode(){return r},children:(i,a)=>{var s=ie(),o=U(s);ae(o,t,"default",{}),k(i,s)},$$slots:{default:!0}}))}function ho(e,t){const n=ee(t,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56"}]];ce(e,fe({name:"loader-circle"},()=>n,{get iconNode(){return r},children:(i,a)=>{var s=ie(),o=U(s);ae(o,t,"default",{}),k(i,s)},$$slots:{default:!0}}))}function po(e,t){const n=ee(t,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["path",{d:"M5.8 11.3 2 22l10.7-3.79"}],["path",{d:"M4 3h.01"}],["path",{d:"M22 8h.01"}],["path",{d:"M15 2h.01"}],["path",{d:"M22 20h.01"}],["path",{d:"m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"}],["path",{d:"m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17"}],["path",{d:"m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7"}],["path",{d:"M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z"}]];ce(e,fe({name:"party-popper"},()=>n,{get iconNode(){return r},children:(i,a)=>{var s=ie(),o=U(s);ae(o,t,"default",{}),k(i,s)},$$slots:{default:!0}}))}function _o(e,t){const n=ee(t,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["path",{d:"m12 9-8.414 8.414A2 2 0 0 0 3 18.828v1.344a2 2 0 0 1-.586 1.414A2 2 0 0 1 3.828 21h1.344a2 2 0 0 0 1.414-.586L15 12"}],["path",{d:"m18 9 .4.4a1 1 0 1 1-3 3l-3.8-3.8a1 1 0 1 1 3-3l.4.4 3.4-3.4a1 1 0 1 1 3 3z"}],["path",{d:"m2 22 .414-.414"}]];ce(e,fe({name:"pipette"},()=>n,{get iconNode(){return r},children:(i,a)=>{var s=ie(),o=U(s);ae(o,t,"default",{}),k(i,s)},$$slots:{default:!0}}))}function go(e,t){const n=ee(t,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["path",{d:"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"}]];ce(e,fe({name:"sparkle"},()=>n,{get iconNode(){return r},children:(i,a)=>{var s=ie(),o=U(s);ae(o,t,"default",{}),k(i,s)},$$slots:{default:!0}}))}function mo(e,t){const n=ee(t,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["path",{d:"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"}],["path",{d:"M20 2v4"}],["path",{d:"M22 4h-4"}],["circle",{cx:"4",cy:"20",r:"2"}]];ce(e,fe({name:"sparkles"},()=>n,{get iconNode(){return r},children:(i,a)=>{var s=ie(),o=U(s);ae(o,t,"default",{}),k(i,s)},$$slots:{default:!0}}))}function bo(e,t){const n=ee(t,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["path",{d:"M10 11v6"}],["path",{d:"M14 11v6"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"}],["path",{d:"M3 6h18"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"}]];ce(e,fe({name:"trash-2"},()=>n,{get iconNode(){return r},children:(i,a)=>{var s=ie(),o=U(s);ae(o,t,"default",{}),k(i,s)},$$slots:{default:!0}}))}function yo(e,t){const n=ee(t,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"}],["path",{d:"M16 9a5 5 0 0 1 0 6"}],["path",{d:"M19.364 18.364a9 9 0 0 0 0-12.728"}]];ce(e,fe({name:"volume-2"},()=>n,{get iconNode(){return r},children:(i,a)=>{var s=ie(),o=U(s);ae(o,t,"default",{}),k(i,s)},$$slots:{default:!0}}))}function wo(e,t){const n=ee(t,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"}],["line",{x1:"22",x2:"16",y1:"9",y2:"15"}],["line",{x1:"16",x2:"22",y1:"9",y2:"15"}]];ce(e,fe({name:"volume-x"},()=>n,{get iconNode(){return r},children:(i,a)=>{var s=ie(),o=U(s);ae(o,t,"default",{}),k(i,s)},$$slots:{default:!0}}))}function xo(e,t){const n=ee(t,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["path",{d:"m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"}],["path",{d:"m14 7 3 3"}],["path",{d:"M5 6v4"}],["path",{d:"M19 14v4"}],["path",{d:"M10 2v2"}],["path",{d:"M7 8H3"}],["path",{d:"M21 16h-4"}],["path",{d:"M11 3H9"}]];ce(e,fe({name:"wand-sparkles"},()=>n,{get iconNode(){return r},children:(i,a)=>{var s=ie(),o=U(s);ae(o,t,"default",{}),k(i,s)},$$slots:{default:!0}}))}function Or(e,t){const n=ee(t,["children","$$slots","$$events","$$legacy"]);/**
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
 */const r=[["path",{d:"M18 6 6 18"}],["path",{d:"m6 6 12 12"}]];ce(e,fe({name:"x"},()=>n,{get iconNode(){return r},children:(i,a)=>{var s=ie(),o=U(s);ae(o,t,"default",{}),k(i,s)},$$slots:{default:!0}}))}let Ye=null,He=null,En=!1;function vr(){if(typeof window>"u")return null;const e=window.AudioContext??window.webkitAudioContext;return e?(Ye||(Ye=new e,He=Ye.createGain(),He.gain.value=.28,He.connect(Ye.destination)),Ye):null}function Jt(){const e=vr();e&&e.state==="suspended"&&e.resume()}function ko(e){En=e,He&&Ye&&(He.gain.cancelScheduledValues(Ye.currentTime),He.gain.linearRampToValueAtTime(e?0:.28,Ye.currentTime+.08))}function Eo(){return En}function $n({from:e,to:t,duration:n,type:r="sine",peak:i=.9,resonance:a=.8,filterAt:s}){const o=vr();if(!o||!He||En)return;const l=o.currentTime,u=o.createOscillator(),f=o.createGain();u.type=r,u.frequency.setValueAtTime(e,l),u.frequency.exponentialRampToValueAtTime(Math.max(1,t),l+n),f.gain.setValueAtTime(1e-4,l),f.gain.exponentialRampToValueAtTime(i,l+n*.18),f.gain.exponentialRampToValueAtTime(1e-4,l+n);let v=f;if(s){const h=o.createBiquadFilter();h.type="lowpass",h.frequency.setValueAtTime(s,l),h.Q.value=a,f.connect(h),v=h}u.connect(f),v.connect(He),u.start(l),u.stop(l+n+.02)}function Zt(){$n({from:650,to:900,duration:.045,peak:.35})}function Wi(){$n({from:500,to:180,duration:.16,peak:.85,resonance:6,filterAt:900})}function Xn(){$n({from:420,to:80,duration:.03,type:"triangle",peak:.8,resonance:12})}const $o=[1046.5,1318.51,1567.98,2093];function Ao(){const e=vr();!e||!He||En||$o.forEach((t,n)=>{const r=e.currentTime+n*.11,i=e.createOscillator(),a=e.createGain();i.type="triangle",i.frequency.setValueAtTime(t,r),a.gain.setValueAtTime(1e-4,r),a.gain.exponentialRampToValueAtTime(.55,r+.02),a.gain.exponentialRampToValueAtTime(1e-4,r+.34),i.connect(a),a.connect(He),i.start(r),i.stop(r+.36)})}function Lr(){$n({from:320,to:120,duration:.22,type:"sine",peak:.5,filterAt:700})}var To=I('<label class="flex items-center gap-2 text-xs font-bold text-[#6b4a8a]"><span class="sr-only">background colour to remove</span> <input type="color" class="h-7 w-10 cursor-pointer rounded-md border-0 bg-transparent p-0"/> <span class="font-mono normal-case"> </span></label>'),So=I('<p class="text-xs text-[#7c6290]">reads the edge of your file, so it wants a fairly flat backdrop</p>'),Mo=I('<div class="flex w-full flex-wrap items-center gap-2 rounded-2xl bg-lavender/40 px-3 py-2"><div class="flex items-center gap-1" role="group" aria-label="how to find the background"><button type="button">find it for me</button> <button type="button"><!> <span>this colour</span></button></div> <!></div> <p class="w-full text-[11px] text-[#9c85ab]"> </p>',1),Po=I('<div class="mt-3 flex flex-wrap items-center gap-2"><button type="button" title="key the background out and keep transparency"><!> <span>pop the background out</span></button> <!></div>');function No(e,t){tt(t,!0);let n=be(t,"enabled",15,!1),r=be(t,"mode",15,"auto"),i=be(t,"color",15,"#00ff00"),a=be(t,"onpulse",3,()=>{});const s=["webm","gif","webp","png","apng"];var o=Po(),l=P(o),u=P(l);xo(u,{size:"14"});var f=S(l,2);{var v=h=>{var p=Mo(),c=U(p),g=P(c),_=P(g),b=S(_,2),A=P(b);_o(A,{size:"12"});var m=S(g,2);{var M=j=>{var R=To(),N=S(P(R),2),te=S(N,2),pe=H(te,!0);W(()=>V(pe,i())),Js(N,i),k(j,R)},D=j=>{var R=So();k(j,R)};ne(m,j=>{r()==="color"?j(M):j(D,-1)})}var y=S(c,2),E=H(y);W(j=>{Yt(_,1,`pill text-xs ${r()==="auto"?"bg-bubblegum/70 text-white":"bg-cream/70 text-[#6b4a8a]"}`),K(_,"aria-pressed",r()==="auto"),Yt(b,1,`pill flex items-center gap-1 text-xs ${r()==="color"?"bg-bubblegum/70 text-white":"bg-cream/70 text-[#6b4a8a]"}`),K(b,"aria-pressed",r()==="color"),V(E,`transparency survives in ${j??""} — pick one of those to turn this on`)},[()=>s.join(", ")]),le("click",_,()=>r("auto")),le("click",b,()=>r("color")),k(h,p)};ne(f,h=>{n()&&h(v)})}W(()=>{Yt(l,1,`pill flex items-center gap-1.5 transition-colors ${n()?"bg-mint/60 text-[#0c4a44]":"bg-cream/80 text-[#6b4a8a]"}`),K(l,"aria-pressed",n())}),le("click",l,()=>{n(!n()),a()()}),ot("mouseenter",l,function(...h){Zt?.apply(this,h)}),k(e,o),nt()}Nt(["click"]);var jo=I('<span class="absolute inset-0 rounded-full border-4 border-bubblegum/60 animate-ripple"></span>'),Co=I(`<div role="button" tabindex="0" aria-label="Choose a media file to convert" class="dropzone relative flex flex-col items-center justify-center gap-3 px-6 py-14 text-center cursor-pointer select-none"><div class="relative"><div class="grid place-items-center size-20 rounded-full bg-gradient-to-br from-cotton/40 to-babysky/40 text-bubblegum" style="box-shadow: var(--shadow-rest);"><!></div> <!></div> <p class="text-xl font-extrabold text-[#5b3a6b]"> </p> <p class="max-w-sm text-sm text-[#8a6f9b]">Video, audio, GIF, PNG or one of those mysterious retro files from an old
    game. I know a surprising number of formats.</p> <span class="pill mt-1">tap to choose instead</span> <input type="file" class="hidden" multiple="" accept="video/*,audio/*,image/*,.bik,.smk,.mve,.vqa,.cin,.cmv,.anm,.nut,.ogm,.rm,.rmvb,.wtv,.mxf,.gxf,.dv,.jxl,.avif,.heic,.exr,.dpx,.fits,.ras,.3gp,.3g2,.mts,.m2ts,.vob,.f4v,.mpc,.vqf,.ape,.wv,.tta,.tak,.shn,.s3m,.it,.mod,.xm"/></div>`);function Oo(e,t){tt(t,!0);let n=F(!1),r=F(!1),i=F(void 0);function a(m){m?.length&&t.onfiles([...m])}function s(m){m.preventDefault(),x(n,!1),x(r,!0),Jt(),Wi(),a(m.dataTransfer?.files??null),setTimeout(()=>x(r,!1),640)}function o(m){m.preventDefault(),d(n)||(x(n,!0),Zt())}var l=Co(),u=P(l),f=P(u),v=P(f);{var h=m=>{mo(m,{size:"34",strokeWidth:2.2})},p=m=>{uo(m,{size:"32",strokeWidth:2.1})};ne(v,m=>{d(n)?m(h):m(p,-1)})}var c=S(f,2);{var g=m=>{var M=jo();k(m,M)};ne(c,m=>{d(r)&&m(g)})}var _=S(u,2),b=H(_,!0),A=S(_,6);dr(A,m=>x(i,m),()=>d(i)),W(()=>{K(l,"data-over",d(n)),K(l,"data-dropped",d(r)),V(b,d(n)?"Yes yes yes — let it go!":"Toss your file in here ♡")}),ot("dragover",l,o),ot("dragleave",l,()=>x(n,!1)),ot("drop",l,s),le("click",l,()=>(Jt(),d(i)?.click())),le("keydown",l,m=>{(m.key==="Enter"||m.key===" ")&&(m.preventDefault(),d(i)?.click())}),ot("mouseenter",l,function(...m){Zt?.apply(this,m)}),le("change",A,m=>a(m.currentTarget.files)),k(e,l),nt()}Nt(["click","keydown","change"]);var Lo=I('<span class="block truncate text-xs text-[#9c85ab]"> </span>'),zo=I('<span class="grid size-7 shrink-0 place-items-center rounded-full bg-mint/30 text-[#0c4a44]"><!></span>'),Io=I('<li class="stagger"><button type="button" class="flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-left transition-[background,transform] duration-200 hover:bg-lavender active:scale-[0.97]"><span class="min-w-0"><span class="block truncate font-bold text-[#5b3a6b]"> </span> <!></span> <!></button></li>'),Fo=I('<ul class="card absolute z-30 mt-2 max-h-80 w-full min-w-64 overflow-y-auto p-2 list-none" style="transform-origin: top center;"></ul>'),Ro=I('<div class="relative"><span class="block mb-1 text-xs font-bold uppercase tracking-wider text-[#a98fb8]"> </span> <button type="button" class="btn flex items-center gap-2 min-w-52 justify-between" aria-haspopup="true"><span class="flex items-center gap-2 truncate"><!> </span> <!></button> <!></div>');function Do(e,t){tt(t,!0);let n=be(t,"value",3,"webm"),r=be(t,"label",3,"turn it into"),i=F(!1),a=F(null),s=Fe(()=>d(a)??n()),o=F(void 0),l=Fe(()=>t.options.find(y=>y.key===d(s))??{key:d(s),label:d(s).toUpperCase()});function u(){Jt(),x(i,!d(i)),d(i)&&Xn()}function f(y){x(a,y,!0),x(i,!1),Xn(),t.onchange(y)}function v(y){y.key==="Escape"&&x(i,!1),y.key==="ArrowDown"&&!d(i)&&(y.preventDefault(),x(i,!0))}Et(()=>{if(!d(i))return;const y=E=>{d(o)&&!d(o).contains(E.target)&&x(i,!1)};return addEventListener("pointerdown",y),()=>removeEventListener("pointerdown",y)});var h=Ro(),p=P(h),c=H(p,!0),g=S(p,2),_=P(g),b=P(_);vo(b,{size:"18",strokeWidth:2.4});var A=S(b),m=S(_,2);{let y=Fe(()=>d(i)?"rotate-180":"");lo(m,{size:"18",strokeWidth:2.6,get class(){return`transition-transform duration-300 [transition-timing-function:var(--ease-jelly)] ${d(y)??""}`}})}var M=S(g,2);{var D=y=>{var E=Fo();Ke(E,23,()=>t.options,j=>j.key,(j,R,N)=>{var te=Io(),pe=P(te),dt=P(pe),vt=P(dt),ht=H(vt,!0),pt=S(vt,2);{var Ot=q=>{var ge=Lo(),Ae=H(ge,!0);W(()=>V(Ae,d(R).hint)),k(q,ge)};ne(pt,q=>{d(R).hint&&q(Ot)})}var $=S(dt,2);{var z=q=>{var ge=zo(),Ae=P(ge);oo(Ae,{size:"16",strokeWidth:3}),k(q,ge)};ne($,q=>{d(R).key===d(s)&&q(z)})}W(()=>{At(te,`--i: ${d(N)??""}`),K(pe,"aria-current",d(R).key===d(s)?"true":void 0),V(ht,d(R).label)}),le("click",pe,()=>f(d(R).key)),ot("mouseenter",pe,function(...q){Zt?.apply(this,q)}),k(j,te)}),W(()=>K(E,"aria-label",r())),k(y,E)};ne(M,y=>{d(i)&&y(D)})}dr(h,y=>x(o,y),()=>d(o)),W(()=>{V(c,r()),K(g,"aria-expanded",d(i)),V(A,` ${d(l).label??""}`)}),le("click",g,u),le("keydown",g,v),ot("mouseenter",g,function(...y){Zt?.apply(this,y)}),k(e,h),nt()}Nt(["click","keydown"]);const jt="";async function Ct(e){if(!e.ok){let t=`${e.status} ${e.statusText}`;try{const n=await e.json();n?.error&&(t=n.error)}catch{}throw new Error(t)}return await e.json()}function Vo(e,t,n){const r=new FormData;r.append("file",e,e.name);for(const[i,a]of Object.entries(t))a==null||a===!1||r.append(i,String(a));return fetch(`${jt}/api/jobs`,{method:"POST",body:r,signal:n}).then(Ct)}function qo(e,t,n={}){const r=new FormData;r.append("file",e,e.name),r.append("pack",t);for(const[i,a]of Object.entries(n))a==null||a===!1||r.append(i,String(a));return fetch(`${jt}/api/sticker-packs`,{method:"POST",body:r}).then(Ct)}function Ho(e){const t=new FormData;return t.append("file",e,e.name),fetch(`${jt}/api/probe`,{method:"POST",body:t}).then(Ct)}function zr(e=50){return fetch(`${jt}/api/jobs?limit=${e}`).then(Ct)}function Bo(){return fetch(`${jt}/api/packs`).then(Ct)}function Ir(e){return fetch(`${jt}/api/jobs/${e}`,{method:"DELETE"}).then(Ct)}function Wo(e,t){let n=null,r=!1,i=!1,a=0,s;const o=()=>`${location.protocol==="https:"?"wss":"ws"}://${location.host}/ws/jobs`,l=()=>{r||(n=new WebSocket(o()),n.onopen=()=>{a=0,i&&t?.(),i=!0},n.onmessage=u=>{try{e(JSON.parse(u.data))}catch{}},n.onclose=()=>{r||(a=Math.min(a+1,6),s=setTimeout(l,400*a))},n.onerror=()=>n?.close())};return l(),()=>{r=!0,s&&clearTimeout(s),n?.close()}}const Fr=["#FF62A5","#FFA6D5","#6EE7B7","#67E8F9","#FDE047","#C084FC","#FDBA74"],Rr=["heart","star","sparkle","bubble"];let Bt=[],bn=null,Me=null;function Gi(){if(Me)return Me;Me=document.createElement("canvas"),Me.setAttribute("aria-hidden","true"),Object.assign(Me.style,{position:"fixed",inset:"0",width:"100%",height:"100%",pointerEvents:"none",zIndex:"50"}),document.body.appendChild(Me);const e=()=>{if(!Me)return;const t=Math.min(devicePixelRatio||1,2);Me.width=innerWidth*t,Me.height=innerHeight*t,Me.getContext("2d")?.setTransform(t,0,0,t,0,0)};return e(),addEventListener("resize",e),Me}function Go(e,t){const{size:n}=t;switch(e.beginPath(),t.shape){case"heart":{const r=n/16;e.moveTo(0,4*r),e.bezierCurveTo(-8*r,-6*r,-2*r,-10*r,0,-4*r),e.bezierCurveTo(2*r,-10*r,8*r,-6*r,0,4*r);break}case"star":{const i=n/2,a=i*.45;for(let s=0;s<10;s++){const o=s%2===0?i:a,l=Math.PI*s/5-Math.PI/2,u=Math.cos(l)*o,f=Math.sin(l)*o;s===0?e.moveTo(u,f):e.lineTo(u,f)}e.closePath();break}case"sparkle":{const r=n/2;e.moveTo(0,-r),e.quadraticCurveTo(0,0,r,0),e.quadraticCurveTo(0,0,0,r),e.quadraticCurveTo(0,0,-r,0),e.quadraticCurveTo(0,0,0,-r);break}default:e.arc(0,0,n/2,0,Math.PI*2)}}function Ui(){const t=Gi().getContext("2d");if(t){t.clearRect(0,0,innerWidth,innerHeight),Bt=Bt.filter(n=>n.life>0&&n.y<innerHeight+60);for(const n of Bt)n.vy+=.16,n.vx*=.992,n.x+=n.vx,n.y+=n.vy,n.rotation+=n.spin,n.life-=1,t.save(),t.translate(n.x,n.y),t.rotate(n.rotation),t.globalAlpha=Math.max(0,Math.min(1,n.life/40)),t.fillStyle=n.color,t.shadowColor=n.color,t.shadowBlur=10,Go(t,n),t.fill(),t.restore();Bt.length>0?bn=requestAnimationFrame(Ui):(bn=null,t.clearRect(0,0,innerWidth,innerHeight))}}function Uo(e=140,t){if(Yo())return;Gi().getContext("2d");const r=innerWidth/2,i=innerHeight/2;for(let a=0;a<e;a++){const s=Math.random()*Math.PI*2,o=4+Math.random()*11;Bt.push({x:r,y:i,vx:Math.cos(s)*o,vy:Math.sin(s)*o-5,spin:(Math.random()-.5)*.32,rotation:Math.random()*Math.PI,size:8+Math.random()*14,color:Fr[Math.random()*Fr.length|0],shape:Rr[Math.random()*Rr.length|0],life:90+Math.random()*70})}bn===null&&(bn=requestAnimationFrame(Ui))}function Yo(){return matchMedia("(prefers-reduced-motion: reduce)").matches}const Ko="Elive",oe={loaded:()=>"Yay! What an adorable file! Let’s give it a makeover!",baking:()=>Ln(["Whipping up cute frames… adding fairy dust…","Baking your stickers in the pastel oven…","Tucking every pixel into its little bed…","Sprinkling a bit more sparkle on this one…"]),done:()=>Ln(["Tada! All dressed up and ready to sparkle in your chats!","It’s perfect now! Go show your group chat.","Wrapped with a bow and everything. Yours!"]),tooBig:()=>"Uh-oh, Telegram says this sticker ate too many treats! Let me trim it down so it fits perfectly!",failed:e=>Ln([`Oops, that one got away from me: ${e}`,`Hmm, I tripped over this one: ${e}`]),queued:()=>"Saving a spot for your file, one sec!"};function Ln(e){return e[Math.random()*e.length|0]}function Xo(){let e=F(xe([])),t=F(xe([])),n=F(!1),r=F("Drop anything and I’ll make it fit ♡"),i=F(null),a=F(!1),s=F("");const o=c=>{const g=d(e).findIndex(_=>_.id===c.id);g!==-1&&(d(e)[g]={...d(e)[g],...c})};Wo(c=>{if(c.job_id)switch(c.type){case"queued":o({id:c.job_id,status:"queued",quip:oe.queued()});break;case"started":o({id:c.job_id,status:"processing",quip:oe.baking()});break;case"progress":o({id:c.job_id,status:"processing",progress_pct:c.pct??0,output_size:c.size_bytes??0});break;case"waveform":o({id:c.job_id,peaks:c.peaks});break;case"complete":{const g=d(e).find(_=>_.id===c.job_id);o({id:c.job_id,status:"completed",progress_pct:100,output_size:c.size_bytes??g?.output_size??0,quip:oe.done()}),Ao(),Uo(),x(r,oe.done(),!0);break}case"error":o({id:c.job_id,status:"failed",error:c.message??"unknown"}),Lr(),x(s,c.message??"something went sideways",!0),x(r,oe.failed(d(s)),!0);break}},u);async function u(){try{const c=await zr(60);for(const g of c.jobs)o(g)}catch{}}const f=async()=>{const[c,g]=await Promise.all([zr(60),Bo()]);x(e,c.jobs.map(_=>({..._,nickname:_.source_filename,quip:""})),!0),x(t,g,!0)},v=async(c,g,_={})=>{x(s,""),x(n,!0),x(r,oe.loaded(),!0),Wi();try{const b=await Vo(c,{target_format:g,..._});x(e,[{...b,nickname:c.name,quip:oe.queued()},...d(e)],!0)}catch(b){p(b)}finally{x(n,!1)}},h=async(c,g,_={})=>{x(s,""),x(n,!0),Xn(),x(r,oe.baking(),!0);try{const b=await qo(c,g,_);x(e,[{...b,nickname:c.name,quip:oe.queued()},...d(e)],!0)}catch(b){p(b)}finally{x(n,!1)}},p=c=>{const g=c instanceof Error?c.message:String(c);x(s,g,!0),x(r,/too large|size limit/i.test(g)?oe.tooBig():oe.failed(g),!0),Lr()};return{get jobs(){return d(e)},get available(){return d(t)},get busy(){return d(n)},get statusLine(){return d(r)},set statusLine(c){x(r,c,!0)},get lastInfo(){return d(i)},set lastInfo(c){x(i,c,!0)},get error(){return d(s)},get mutesAudio(){return d(a)},set mutesAudio(c){x(a,c,!0)},hydrate:f,submit:v,submitPack:h}}const se=Xo();var Jo=I('<div class="progress-track mt-2.5"><div class="progress-bar"></div></div> <p class="mt-1 text-right text-[11px] font-bold text-[#9c85ab]"> </p>',1),Zo=I('<span class="flex-1 rounded-t-full bg-gradient-to-t from-babysky/70 to-bubblegum/80"></span>'),Qo=I('<div class="mt-2 flex h-8 items-end gap-[2px]" aria-hidden="true"></div>'),el=I('<a class="pill grid place-items-center bg-cream no-underline text-[#0c4a44]"><!></a>'),Dr=I('<button class="pill grid place-items-center bg-cream"><!></button>'),tl=I('<p class="mt-2 rounded-2xl bg-cream/70 px-3 py-2 text-xs text-[#a03a5f]"> </p>'),nl=I('<article><div class="flex items-start gap-3"><span class="grid size-11 shrink-0 place-items-center rounded-full bg-cream/80 text-lilac"><!></span> <div class="min-w-0 flex-1"><div class="flex items-baseline justify-between gap-2"><h3 class="truncate font-extrabold text-[#4a3557]"> </h3> <span class="shrink-0 text-xs font-bold text-[#8a6f9b]"> </span></div> <p class="mt-0.5 text-xs font-medium text-[#7c6290]"> </p> <p class="mt-1.5 text-sm text-[#6b4a8a]"> </p> <!> <!></div> <div class="flex shrink-0 flex-col gap-1.5"><!></div></div> <!></article>');function rl(e,t){tt(t,!0);const n=Fe(()=>Math.min(100,Math.round(t.job.progress_pct)));function r($){return $?$>1<<20?`${($/(1<<20)).toFixed(2)} MB`:`${Math.max(1,Math.round($/1024))} KB`:"—"}const i=Fe(()=>t.job.status==="completed"?"from-mint/25 to-babysky/25":t.job.status==="failed"?"from-peach/30 to-cotton/25":"from-lavender to-periwinkle/60");function a($){return $.quip?$.quip:$.status==="queued"?oe.queued():$.status==="processing"?oe.baking():$.status==="completed"?oe.done():oe.failed($.error||"unknown")}var s=nl(),o=P(s),l=P(o),u=P(l);{var f=$=>{ho($,{size:"20",class:"animate-spin"})},v=$=>{po($,{size:"20"})},h=$=>{Or($,{size:"20"})};ne(u,$=>{t.job.status==="processing"||t.job.status==="queued"?$(f):t.job.status==="completed"?$(v,1):$(h,-1)})}var p=S(l,2),c=P(p),g=P(c),_=H(g,!0),b=S(g,2),A=H(b,!0),m=S(c,2),M=H(m),D=S(m,2),y=H(D,!0),E=S(D,2);{var j=$=>{var z=Jo(),q=U(z),ge=H(q),Ae=S(q,2),Lt=H(Ae);W(sn=>{At(ge,`width: ${sn??""}%`),V(Lt,`${d(n)??""}%`)},[()=>Math.max(4,d(n))]),k($,z)};ne(E,$=>{(t.job.status==="processing"||t.job.status==="queued")&&$(j)})}var R=S(E,2);{var N=$=>{var z=Qo();Ke(z,21,()=>t.job.peaks,zi,(q,ge)=>{var Ae=Zo();W(Lt=>At(Ae,`height: ${Lt??""}%`),[()=>Math.max(6,Math.round(d(ge)*100))]),k(q,Ae)}),k($,z)};ne(R,$=>{t.job.peaks?.length&&$(N)})}var te=S(p,2),pe=P(te);{var dt=$=>{var z=el(),q=P(z);fo(q,{size:"16"}),W(()=>{K(z,"href",t.job.download_url),K(z,"download",t.job.nickname),K(z,"aria-label",`Save ${t.job.nickname??""}`),K(z,"title",`Save ${t.job.nickname??""}`)}),k($,z)},vt=$=>{var z=Dr(),q=P(z);bo(q,{size:"16"}),W(()=>{K(z,"aria-label",`Discard ${t.job.nickname??""}`),K(z,"title",`Discard ${t.job.nickname??""}`)}),le("click",z,()=>Ir(t.job.id)),k($,z)},ht=$=>{var z=Dr(),q=P(z);Or(q,{size:"16"}),W(()=>{K(z,"aria-label",`Stop ${t.job.nickname??""}`),K(z,"title",`Stop ${t.job.nickname??""}`)}),le("click",z,()=>Ir(t.job.id)),k($,z)};ne(pe,$=>{t.job.status==="completed"?$(dt):t.job.status==="failed"?$(vt,1):$(ht,-1)})}var pt=S(o,2);{var Ot=$=>{var z=tl(),q=H(z,!0);W(()=>V(q,t.job.error)),k($,z)};ne(pt,$=>{t.job.error&&$(Ot)})}W(($,z)=>{Yt(s,1,`card bg-gradient-to-br ${d(i)??""} p-4`),V(_,t.job.nickname),V(A,$),V(M,`${(t.job.source_format||"unknown")??""} → ${t.job.target_format??""}`),V(y,z)},[()=>r(t.job.output_size),()=>t.job.quip||a(t.job)]),k(e,s),nt()}Nt(["click"]);var il=I('<span class="sparkle"> </span>'),al=I('<div class="pointer-events-none fixed inset-x-0 bottom-0 top-[max(env(safe-area-inset-top),2.5rem)] overflow-hidden transition-transform duration-500 ease-out" aria-hidden="true"></div>');function sl(e,t){tt(t,!0);let n=F(void 0);const r=["✦","✧","♡","⋆","✩","❋"],i=["#FFA6D5","#6EE7B7","#67E8F9","#FDE047","#C084FC","#FDBA74"],a=Array.from({length:26},(u,f)=>({id:f,glyph:r[f%r.length],color:i[f%i.length],left:`${f*37%100}%`,size:`${10+f*13%16}px`,delay:`${-(f*1.4).toFixed(2)}s`,duration:`${11+f*5%9}s`}));let s=F(xe({x:.5,y:.5}));function o(u){x(s,{x:u.clientX/innerWidth,y:u.clientY/innerHeight},!0)}no(()=>(addEventListener("pointermove",o,{passive:!0}),()=>removeEventListener("pointermove",o))),Et(()=>{if(!d(n))return;const u=(d(s).x-.5)*-22,f=(d(s).y-.5)*-14;d(n).style.transform=`translate3d(${u}px, ${f}px, 0)`});var l=al();Ke(l,21,()=>a,u=>u.id,(u,f)=>{var v=il(),h=H(v,!0);W(()=>{At(v,`left:${d(f).left??""}; font-size:${d(f).size??""}; color:${d(f).color??""};
             animation-delay:${d(f).delay??""}; animation-duration:${d(f).duration??""};`),V(h,d(f).glyph)}),k(u,v)}),dr(l,u=>x(n,u),()=>d(n)),k(e,l),nt()}var ol=I("<!> <span>muted</span>",1),ll=I("<!> <span>sounds on</span>",1),ul=I("<li> </li>"),fl=I('<section class="card border-2 border-peach/60 bg-gradient-to-br from-peach/20 to-cotton/15 p-4" role="alert"><h2 class="text-sm font-black uppercase tracking-wider text-[#a03a5f]"> </h2> <ul class="mt-2 list-disc space-y-1 pl-5 text-xs text-[#7c3a52]"></ul> <button type="button" class="pill mt-3 bg-cream/80 text-[#6b4a8a]">okay, hide this</button></section>'),cl=I('<p class="mt-3 text-xs font-semibold text-[#a03a5f]"> </p>'),dl=I('<p class="mt-3 text-xs font-semibold text-[#8a6f9b]"> <span class="text-[#6b4a8a]"> </span></p>'),vl=I('<div><dt class="font-bold uppercase tracking-wide text-[#a98fb8]"> </dt> <dd class="font-semibold text-[#5b3a6b]"> </dd></div>'),hl=I('<dl class="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-4"></dl>'),pl=I('<button type="button" class="stagger group flex items-center justify-between gap-3 rounded-2xl bg-lavender/70 px-3.5 py-3 text-left transition-[transform,background] duration-200 hover:bg-periwinkle active:scale-[0.97] disabled:opacity-40"><span class="min-w-0"><span class="block truncate text-sm font-extrabold text-[#4a3557]"> </span> <span class="block truncate text-[11px] text-[#7c6290]"> </span></span> <span class="pill shrink-0 bg-cream/80 text-[#0c4a44]">make</span></button>'),_l=I('<p class="col-span-full text-xs text-[#8a6f9b]">loading the pack rules…</p>'),gl=I('<p class="card p-5 text-center text-sm text-[#8a6f9b]">nothing yet — drop something in and I’ll get right on it ♡</p>'),ml=I(`<!> <main class="relative mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-4 pb-24 pt-[max(2rem,env(safe-area-inset-top))]"><header class="flex items-center justify-between gap-4"><div><h1 class="glow-text text-4xl font-black tracking-tight sm:text-5xl">Eliverter</h1> <p class="mt-1 text-sm font-semibold text-[#8a6f9b]"> </p></div> <button type="button" class="pill flex shrink-0 items-center gap-2 whitespace-nowrap bg-cream/90 text-[#6b4a8a]"><!></button></header> <!> <!> <section class="card p-4"><div class="flex flex-wrap items-end gap-4"><!> <button type="button" class="btn ml-auto disabled:opacity-50"><!> </button></div> <!> <!> <!></section> <section class="card p-4"><h2 class="flex items-center gap-2 text-lg font-black text-[#4a3557]"><!> one-click ready packs</h2> <p class="mt-1 text-xs text-[#8a6f9b]">Exact platform rules, no guessing about sizes or codecs.</p> <div class="mt-3 grid gap-2 sm:grid-cols-2"></div></section> <section class="flex flex-col gap-3"><h2 class="text-sm font-black uppercase tracking-wider text-[#a98fb8]">today’s batch</h2> <!></section> <footer class="card mt-2 flex flex-wrap items-center justify-between gap-3 p-4"><p class="text-xs font-semibold text-[#7c6290]">made by <a class="font-black text-[#6b4a8a] underline decoration-bubblegum decoration-2 underline-offset-4
               hover:text-bubblegum" href="https://ahura.site/resume" target="_blank" rel="noopener noreferrer">ahura</a> · everything happens on your phone, nothing is uploaded</p> <a class="pill bg-cream/80 text-[#6b4a8a]" href="https://ahura.site/resume" target="_blank" rel="noopener noreferrer">ahura.site/resume</a></footer></main> <div class="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]" aria-live="polite"><p class="card max-w-full truncate px-4 py-2 text-[13px] font-bold text-[#5b3a6b] shadow-lift"> </p></div>`,1);function bl(e,t){tt(t,!0);const n=[{key:"mp4",label:"MP4",hint:"H.264 · plays anywhere"},{key:"webm",label:"WebM",hint:"VP9 · tiny and transparent"},{key:"mkv",label:"Matroska",hint:"everything in one tin"},{key:"mov",label:"QuickTime",hint:"ProRes friendly"},{key:"gif",label:"GIF",hint:"looping, palette-quantised"},{key:"webp",label:"WebP",hint:"sticker-grade still or animated"},{key:"png",label:"PNG",hint:"lossless with alpha"},{key:"avif",label:"AVIF",hint:"newest image format"},{key:"mp3",label:"MP3",hint:"LAME VBR"},{key:"m4a",label:"M4A / AAC",hint:"clean and small"},{key:"opus",label:"Opus in Ogg",hint:"best quality per byte"},{key:"flac",label:"FLAC",hint:"lossless audio"},{key:"wav",label:"WAV",hint:"raw PCM, no thinking required"}];let r=F("webm"),i=F(xe([])),a=F(xe([])),s=F(xe(Eo())),o=F(!1),l=F("auto"),u=F("#00ff00");const f=new Set(["webm","gif","webp","png","apng"]),v=Fe(()=>f.has(d(r))),h=Fe(()=>d(o)&&d(v)?{erase_background:!0,erase_mode:d(l),...d(l)==="color"?{key_color:d(u)}:{}}:{});Et(()=>{se.hydrate()});async function p(w){Jt(),x(a,[],!0),se.lastInfo=null;const T=[];for(const Y of w)try{const{info:Q}=await Ho(Y);se.lastInfo=Q,T.push(Y)}catch(Q){const Te=Q instanceof Error?Q.message:String(Q);x(a,[...d(a),`${Y.name} — ${Te}`],!0)}if(x(i,T,!0),T.length===0){se.statusLine=oe.failed(d(a)[0]??"nothing readable was chosen");return}T.length===1&&se.submit(T[0],d(r),d(h))}function c(){for(const w of d(i))se.submit(w,d(r),d(h))}function g(w){for(const T of d(i))se.submitPack(T,w,d(h))}function _(){x(s,!d(s)),ko(d(s)),se.mutesAudio=d(s)}const b=Fe(()=>se.available),A=Fe(()=>se.jobs);function m(w){const T=`${w.width}×${w.height}`;return[{k:"container",v:w.container||w.format.format_name},{k:"length",v:`${w.duration_seconds.toFixed(2)}s`},{k:"video",v:w.video_codec?`${w.video_codec} ${T}`:"—"},{k:"audio",v:w.audio_codec?`${w.audio_codec} · ${w.sample_rate}Hz`:"—"}]}var M=ml();Ds("1n46o8q",w=>{kn(()=>{vi.title="Eliverter ✿ pastel media sanctuary"})});var D=U(M);sl(D,{});var y=S(D,2),E=P(y),j=P(E),R=S(P(j),2),N=H(R),te=S(j,2),pe=P(te);{var dt=w=>{var T=ol(),Y=U(T);wo(Y,{size:"16"}),k(w,T)},vt=w=>{var T=ll(),Y=U(T);yo(Y,{size:"16"}),k(w,T)};ne(pe,w=>{d(s)?w(dt):w(vt,-1)})}var ht=S(E,2);Oo(ht,{onfiles:p});var pt=S(ht,2);{var Ot=w=>{var T=fl(),Y=P(T),Q=H(Y),Te=S(Y,2);Ke(Te,20,()=>d(a),rt=>rt,(rt,zt)=>{var _t=ul(),oa=H(_t,!0);W(()=>V(oa,zt)),k(rt,_t)});var Se=S(Te,2);W(()=>V(Q,`I couldn’t read ${d(a).length??""} file${d(a).length===1?"":"s"}`)),le("click",Se,()=>x(a,[],!0)),k(w,T)};ne(pt,w=>{d(a).length&&w(Ot)})}var $=S(pt,2),z=P($),q=P(z);Do(q,{get options(){return n},get value(){return d(r)},onchange:w=>x(r,w,!0)});var ge=S(q,2),Ae=P(ge);go(Ae,{size:"18",class:"mr-1.5 inline"});var Lt=S(Ae),sn=S(z,2);{var Ki=w=>{No(w,{onpulse:()=>Jt(),get enabled(){return d(o)},set enabled(T){x(o,T,!0)},get mode(){return d(l)},set mode(T){x(l,T,!0)},get color(){return d(u)},set color(T){x(u,T,!0)}})},Xi=w=>{var T=cl(),Y=H(T);W(()=>V(Y,`${d(r)??""} cannot keep transparency, so the background stays put — switch to
        WebM, GIF, WebP or PNG to erase it`)),k(w,T)};ne(sn,w=>{d(v)?w(Ki):d(o)&&w(Xi,1)})}var hr=S(sn,2);{var Ji=w=>{var T=dl(),Y=P(T),Q=S(Y),Te=H(Q,!0);W(Se=>{V(Y,`${d(i).length??""} file${d(i).length===1?"":"s"} waiting: `),V(Te,Se)},[()=>d(i).map(Se=>Se.name).join(", ")]),k(w,T)};ne(hr,w=>{d(i).length&&w(Ji)})}var Zi=S(hr,2);{var Qi=w=>{var T=hl();Ke(T,21,()=>m(se.lastInfo),Y=>Y.k,(Y,Q)=>{var Te=vl(),Se=P(Te),rt=H(Se,!0),zt=S(Se,2),_t=H(zt,!0);W(()=>{V(rt,d(Q).k),V(_t,d(Q).v)}),k(Y,Te)}),k(w,T)};ne(Zi,w=>{se.lastInfo&&w(Qi)})}var pr=S($,2),_r=P(pr),ea=P(_r);co(ea,{size:"18",class:"text-bubblegum"});var ta=S(_r,4);Ke(ta,23,()=>d(b),w=>w.id,(w,T,Y)=>{var Q=pl(),Te=P(Q),Se=P(Te),rt=H(Se,!0),zt=S(Se,2),_t=H(zt);W(()=>{At(Q,`--i: ${d(Y)??""}`),Q.disabled=!d(i).length||se.busy,V(rt,d(T).label),V(_t,`${d(T).edge??""}px · ${d(T).limit??""} ${d(T).fps?`· ${d(T).fps}fps`:""}`)}),le("click",Q,()=>g(d(T).id)),k(w,Q)},w=>{var T=_l();k(w,T)});var na=S(pr,2),ra=S(P(na),2);Ke(ra,17,()=>d(A),w=>w.id,(w,T)=>{rl(w,{get job(){return d(T)}})},w=>{var T=gl();k(w,T)});var ia=S(y,2),aa=P(ia),sa=H(aa,!0);W(()=>{V(N,`your pastel media sanctuary · ${Ko} is in the oven`),K(te,"aria-pressed",d(s)),K(te,"title",d(s)?"unmute the little sounds":"mute the little sounds"),ge.disabled=!d(i).length||se.busy,V(Lt,` ${se.busy?"working on it…":`make ${d(i).length||"your"} file${d(i).length===1?"":"s"} pretty`}`),V(sa,se.statusLine)}),le("click",te,_),le("click",ge,c),k(e,M),nt()}Nt(["click"]);const Yi=document.getElementById("app");if(!Yi)throw new Error("#app is missing from index.html");Cs(bl,{target:Yi});
