var app=function(t){"use strict";function e(){}function n(t,e){for(const n in e)t[n]=e[n];return t}function l(t){return t()}function o(){return Object.create(null)}function r(t){t.forEach(l)}function c(t){return"function"==typeof t}function i(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function s(t,...n){if(null==t)return e;const l=t.subscribe(...n);return l.unsubscribe?()=>l.unsubscribe():l}function a(t,e,n){t.$$.on_destroy.push(s(e,n))}function u(t,e,l,o){return t[1]&&o?n(l.ctx.slice(),t[1](o(e))):l.ctx}function d(t,e){t.appendChild(e)}function f(t,e,n){t.insertBefore(e,n||null)}function h(t){t.parentNode.removeChild(t)}function g(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function $(t){return document.createElement(t)}function m(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}function p(t){return document.createTextNode(t)}function y(){return p(" ")}function x(){return p("")}function v(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function b(t,e){e=""+e,t.wholeText!==e&&(t.data=e)}function w(t,e,n,l){null===n?t.style.removeProperty(e):t.style.setProperty(e,n,l?"important":"")}function k(t,e,n){t.classList[n?"add":"remove"](e)}let _;function j(t){_=t}function C(){if(!_)throw new Error("Function called outside component initialization");return _}const z=[],S=[],M=[],q=[],E=Promise.resolve();let B=!1;function A(t){M.push(t)}const N=new Set;let T=0;function I(){const t=_;do{for(;T<z.length;){const t=z[T];T++,j(t),L(t.$$)}for(j(null),z.length=0,T=0;S.length;)S.pop()();for(let t=0;t<M.length;t+=1){const e=M[t];N.has(e)||(N.add(e),e())}M.length=0}while(z.length);for(;q.length;)q.pop()();B=!1,N.clear(),j(t)}function L(t){if(null!==t.fragment){t.update(),r(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(A)}}const D=new Set;let O;function F(){O={r:0,c:[],p:O}}function P(){O.r||r(O.c),O=O.p}function H(t,e){t&&t.i&&(D.delete(t),t.i(e))}function V(t,e,n,l){if(t&&t.o){if(D.has(t))return;D.add(t),O.c.push((()=>{D.delete(t),l&&(n&&t.d(1),l())})),t.o(e)}else l&&l()}function W(t,e){const n=e.token={};function l(t,l,o,r){if(e.token!==n)return;e.resolved=r;let c=e.ctx;void 0!==o&&(c=c.slice(),c[o]=r);const i=t&&(e.current=t)(c);let s=!1;e.block&&(e.blocks?e.blocks.forEach(((t,n)=>{n!==l&&t&&(F(),V(t,1,1,(()=>{e.blocks[n]===t&&(e.blocks[n]=null)})),P())})):e.block.d(1),i.c(),H(i,1),i.m(e.mount(),e.anchor),s=!0),e.block=i,e.blocks&&(e.blocks[l]=i),s&&I()}if((o=t)&&"object"==typeof o&&"function"==typeof o.then){const n=C();if(t.then((t=>{j(n),l(e.then,1,e.value,t),j(null)}),(t=>{if(j(n),l(e.catch,2,e.error,t),j(null),!e.hasCatch)throw t})),e.current!==e.pending)return l(e.pending,0),!0}else{if(e.current!==e.then)return l(e.then,1,e.value,t),!0;e.resolved=t}var o}function K(t){t&&t.c()}function R(t,e,n,o){const{fragment:i,on_mount:s,on_destroy:a,after_update:u}=t.$$;i&&i.m(e,n),o||A((()=>{const e=s.map(l).filter(c);a?a.push(...e):r(e),t.$$.on_mount=[]})),u.forEach(A)}function U(t,e){const n=t.$$;null!==n.fragment&&(r(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function G(t,e){-1===t.$$.dirty[0]&&(z.push(t),B||(B=!0,E.then(I)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function J(t,n,l,c,i,s,a,u=[-1]){const d=_;j(t);const f=t.$$={fragment:null,ctx:null,props:s,update:e,not_equal:i,bound:o(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(n.context||(d?d.$$.context:[])),callbacks:o(),dirty:u,skip_bound:!1,root:n.target||d.$$.root};a&&a(f.root);let g=!1;if(f.ctx=l?l(t,n.props||{},((e,n,...l)=>{const o=l.length?l[0]:n;return f.ctx&&i(f.ctx[e],f.ctx[e]=o)&&(!f.skip_bound&&f.bound[e]&&f.bound[e](o),g&&G(t,e)),n})):[],f.update(),g=!0,r(f.before_update),f.fragment=!!c&&c(f.ctx),n.target){if(n.hydrate){const t=function(t){return Array.from(t.childNodes)}(n.target);f.fragment&&f.fragment.l(t),t.forEach(h)}else f.fragment&&f.fragment.c();n.intro&&H(t.$$.fragment),R(t,n.target,n.anchor,n.customElement),I()}j(d)}class Z{$destroy(){U(this,1),this.$destroy=e}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}const Q=t=>({matches:1&t}),X=t=>({matches:t[0]});function Y(t){let e;const n=t[4].default,l=function(t,e,n,l){if(t){const o=u(t,e,n,l);return t[0](o)}}(n,t,t[3],X);return{c(){l&&l.c()},m(t,n){l&&l.m(t,n),e=!0},p(t,[o]){l&&l.p&&(!e||9&o)&&function(t,e,n,l,o,r){if(o){const c=u(e,n,l,r);t.p(c,o)}}(l,n,t,t[3],e?function(t,e,n,l){if(t[2]&&l){const o=t[2](l(n));if(void 0===e.dirty)return o;if("object"==typeof o){const t=[],n=Math.max(e.dirty.length,o.length);for(let l=0;l<n;l+=1)t[l]=e.dirty[l]|o[l];return t}return e.dirty|o}return e.dirty}(n,t[3],o,Q):function(t){if(t.ctx.length>32){const e=[],n=t.ctx.length/32;for(let t=0;t<n;t++)e[t]=-1;return e}return-1}(t[3]),X)},i(t){e||(H(l,t),e=!0)},o(t){V(l,t),e=!1},d(t){l&&l.d(t)}}}function tt(t,e,n){let l,o,{$$slots:r={},$$scope:c}=e,{query:i}=e,s=!1,a=!1;var u;function d(){l&&o&&l.removeListener(o)}return u=()=>(n(2,s=!0),()=>{d()}),C().$$.on_mount.push(u),t.$$set=t=>{"query"in t&&n(1,i=t.query),"$$scope"in t&&n(3,c=t.$$scope)},t.$$.update=()=>{6&t.$$.dirty&&s&&(d(),function(t){l=window.matchMedia(t),o=t=>n(0,a=t.matches),l.addListener(o),n(0,a=l.matches)}(i))},[a,i,s,c,r]}class et extends Z{constructor(t){super(),J(this,t,tt,Y,i,{query:1})}}const nt=[];function lt(t,e){return{subscribe:ot(t,e).subscribe}}function ot(t,n=e){let l;const o=new Set;function r(e){if(i(t,e)&&(t=e,l)){const e=!nt.length;for(const e of o)e[1](),nt.push(e,t);if(e){for(let t=0;t<nt.length;t+=2)nt[t][0](nt[t+1]);nt.length=0}}}return{set:r,update:function(e){r(e(t))},subscribe:function(c,i=e){const s=[c,i];return o.add(s),1===o.size&&(l=n(r)||e),c(t),()=>{o.delete(s),0===o.size&&(l(),l=null)}}}}function rt(t,n,l){const o=!Array.isArray(t),i=o?[t]:t,a=n.length<2;return lt(l,(t=>{let l=!1;const u=[];let d=0,f=e;const h=()=>{if(d)return;f();const l=n(o?u[0]:u,t);a?t(l):f=c(l)?l:e},g=i.map(((t,e)=>s(t,(t=>{u[e]=t,d&=~(1<<e),l&&h()}),(()=>{d|=1<<e}))));return l=!0,h(),function(){r(g),f()}}))}function ct(t){let n;return{c(){n=$("header"),n.innerHTML='<section class="minSize svelte-1nkw34r">Die<br/>großen<br/>Themen</section> \n\t<section class="grow svelte-1nkw34r"><h2 class="svelte-1nkw34r">Was bewegt die Fürther:innen?</h2> \n\t\t<div class="subtitle svelte-1nkw34r">Ideen, Wünsche und Aregungen für eine lebenswertes Fürth 2031</div></section>',v(n,"class","svelte-1nkw34r")},m(t,e){f(t,n,e)},p:e,i:e,o:e,d(t){t&&h(n)}}}class it extends Z{constructor(t){super(),J(this,t,null,ct,i,{})}}function st(t){let n,l,o,r;return{c(){n=$("div"),l=p(t[4]),v(n,"class",o="wsf-card "+t[0].join(" ")+" svelte-71b6lg"),v(n,"title",t[5]),v(n,"data-id",t[1]),v(n,"data-length",t[3]),v(n,"data-categories",r=t[2].join(","))},m(t,e){f(t,n,e),d(n,l)},p(t,[e]){16&e&&b(l,t[4]),1&e&&o!==(o="wsf-card "+t[0].join(" ")+" svelte-71b6lg")&&v(n,"class",o),32&e&&v(n,"title",t[5]),2&e&&v(n,"data-id",t[1]),8&e&&v(n,"data-length",t[3]),4&e&&r!==(r=t[2].join(","))&&v(n,"data-categories",r)},i:e,o:e,d(t){t&&h(n)}}}function at(t,e,n){let l,{ID:o=null}=e,{categories:r=null}=e,{length:c=null}=e,{classes:i=null}=e,{gender:s=null}=e,{age:a=null}=e,{location:u=null}=e,{text:d=""}=e;return t.$$set=t=>{"ID"in t&&n(1,o=t.ID),"categories"in t&&n(2,r=t.categories),"length"in t&&n(3,c=t.length),"classes"in t&&n(0,i=t.classes),"gender"in t&&n(6,s=t.gender),"age"in t&&n(7,a=t.age),"location"in t&&n(8,u=t.location),"text"in t&&n(4,d=t.text)},t.$$.update=()=>{if(464&t.$$.dirty){n(5,l=[`"${d}"`,["m"===s?"Mann":"w"===s?"Frau":null,a?`(${a} Jahre)`:"",u?`aus ${u}`:""].filter(Boolean).join(" ")].join("\n"));const t=d.length;n(0,i=t<=40?["xxs","postit"]:t<=75?["xs","postit"]:t<=100?["s","postit"]:t<=200?["m","postit"]:t<=300?["l","postit"]:t<=450?["xl","postit"]:["xxl","cardboard"])}},[i,o,r,c,d,l,s,a,u]}class ut extends Z{constructor(t){super(),J(this,t,at,st,i,{ID:1,categories:2,length:3,classes:0,gender:6,age:7,location:8,text:4})}}async function dt(t){const e=await fetch(t);return await e.json()}const ft=lt([],(t=>{dt("./desktop/statistics.json").then(t)})),ht=lt([],(t=>{dt("./desktop/categories.json").then(t)})),gt=lt([],(t=>{dt("./desktop/entries.json").then(t)})),$t=ot(),mt=ot();function pt(t,e,n){const l=t.slice();return l[5]=e[n],l}function yt(t){let n,l,o=t[8].message+"";return{c(){n=$("div"),l=p(o),w(n,"color","red")},m(t,e){f(t,n,e),d(n,l)},p(t,e){1&e&&o!==(o=t[8].message+"")&&b(l,o)},i:e,o:e,d(t){t&&h(n)}}}function xt(t){let e,n,l=t[0],o=[];for(let e=0;e<l.length;e+=1)o[e]=vt(pt(t,l,e));const r=t=>V(o[t],1,1,(()=>{o[t]=null}));return{c(){e=$("ul");for(let t=0;t<o.length;t+=1)o[t].c();v(e,"id","cardsList"),v(e,"class","wsf-cards svelte-ef0j5a")},m(t,l){f(t,e,l);for(let t=0;t<o.length;t+=1)o[t].m(e,null);n=!0},p(t,n){if(1&n){let c;for(l=t[0],c=0;c<l.length;c+=1){const r=pt(t,l,c);o[c]?(o[c].p(r,n),H(o[c],1)):(o[c]=vt(r),o[c].c(),H(o[c],1),o[c].m(e,null))}for(F(),c=l.length;c<o.length;c+=1)r(c);P()}},i(t){if(!n){for(let t=0;t<l.length;t+=1)H(o[t]);n=!0}},o(t){o=o.filter(Boolean);for(let t=0;t<o.length;t+=1)V(o[t]);n=!1},d(t){t&&h(e),g(o,t)}}}function vt(t){let e,l,o,r;const c=[t[5]];let i={};for(let t=0;t<c.length;t+=1)i=n(i,c[t]);return l=new ut({props:i}),{c(){e=$("li"),K(l.$$.fragment),o=y(),v(e,"class","svelte-ef0j5a")},m(t,n){f(t,e,n),R(l,e,null),d(e,o),r=!0},p(t,e){const n=1&e?function(t,e){const n={},l={},o={$$scope:1};let r=t.length;for(;r--;){const c=t[r],i=e[r];if(i){for(const t in c)t in i||(l[t]=1);for(const t in i)o[t]||(n[t]=i[t],o[t]=1);t[r]=i}else for(const t in c)o[t]=1}for(const t in l)t in n||(n[t]=void 0);return n}(c,[(o=t[5],"object"==typeof o&&null!==o?o:{})]):{};var o;l.$set(n)},i(t){r||(H(l.$$.fragment,t),r=!0)},o(t){V(l.$$.fragment,t),r=!1},d(t){t&&h(e),U(l)}}}function bt(t){let n;return{c(){n=$("div"),n.textContent="...waiting"},m(t,e){f(t,n,e)},p:e,i:e,o:e,d(t){t&&h(n)}}}function wt(t){let e,n,l,o,r,c,i,s={ctx:t,current:null,token:null,hasCatch:!0,pending:bt,then:xt,catch:yt,value:4,error:8,blocks:[,,,]};return W(c=t[0],s),{c(){e=$("link"),n=$("link"),l=$("link"),o=y(),r=x(),s.block.c(),v(e,"rel","preconnect"),v(e,"href","https://fonts.googleapis.com"),v(n,"rel","preconnect"),v(n,"href","https://fonts.gstatic.com"),v(n,"crossorigin",""),v(l,"href","https://fonts.googleapis.com/css2?family=Reenie+Beanie&family=Shadows+Into+Light+Two&family=Square+Peg&display=swap"),v(l,"rel","stylesheet")},m(t,c){d(document.head,e),d(document.head,n),d(document.head,l),f(t,o,c),f(t,r,c),s.block.m(t,s.anchor=c),s.mount=()=>r.parentNode,s.anchor=r,i=!0},p(e,[n]){t=e,s.ctx=t,1&n&&c!==(c=t[0])&&W(c,s)||function(t,e,n){const l=e.slice(),{resolved:o}=t;t.current===t.then&&(l[t.value]=o),t.current===t.catch&&(l[t.error]=o),t.block.p(l,n)}(s,t,n)},i(t){i||(H(s.block),i=!0)},o(t){for(let t=0;t<3;t+=1){V(s.blocks[t])}i=!1},d(t){h(e),h(n),h(l),t&&h(o),t&&h(r),s.block.d(t),s.token=null,s=null}}}function kt(t,e,n){let l,o;a(t,gt,(t=>n(3,o=t)));let{mainCategory:r}=e,{subCategory:c}=e;return t.$$set=t=>{"mainCategory"in t&&n(1,r=t.mainCategory),"subCategory"in t&&n(2,c=t.subCategory)},t.$$.update=()=>{14&t.$$.dirty&&n(0,l=o.filter((t=>t.categories.includes(`${r}.${c}`))))},[l,r,c,o]}class _t extends Z{constructor(t){super(),J(this,t,kt,wt,i,{mainCategory:1,subCategory:2})}}function jt(t){let n,l,o,r,c,i,s,a,u;return{c(){n=$("li"),l=$("h2"),o=p(t[3]),r=y(),c=$("div"),i=p(t[2]),v(l,"class","svelte-1336dkq"),v(c,"class","sub-item-count svelte-1336dkq"),v(n,"id",t[1]),v(n,"class",s="btn "+t[0]+" svelte-1336dkq"),v(n,"data-count",t[2]),k(n,"selected",t[4])},m(e,s){var h,g,$,m;f(e,n,s),d(n,l),d(l,o),d(n,r),d(n,c),d(c,i),a||(h=n,g="click",$=t[5],h.addEventListener(g,$,m),u=()=>h.removeEventListener(g,$,m),a=!0)},p(t,[e]){8&e&&b(o,t[3]),4&e&&b(i,t[2]),2&e&&v(n,"id",t[1]),1&e&&s!==(s="btn "+t[0]+" svelte-1336dkq")&&v(n,"class",s),4&e&&v(n,"data-count",t[2]),17&e&&k(n,"selected",t[4])},i:e,o:e,d(t){t&&h(n),a=!1,u()}}}function Ct(t,e,n){let{type:l="main"}=e,{id:o}=e,{count:r}=e,{name:c}=e,{selected:i=!0}=e;return t.$$set=t=>{"type"in t&&n(0,l=t.type),"id"in t&&n(1,o=t.id),"count"in t&&n(2,r=t.count),"name"in t&&n(3,c=t.name),"selected"in t&&n(4,i=t.selected)},[l,o,r,c,i,function(){"main"===l?$t.set(o):mt.set(o)}]}class zt extends Z{constructor(t){super(),J(this,t,Ct,jt,i,{type:0,id:1,count:2,name:3,selected:4})}}function St(t,e,n){const l=t.slice();return l[2]=e[n],l}function Mt(t){let n;return{c(){n=$("div")},m(t,e){f(t,n,e)},p:e,i:e,o:e,d(t){t&&h(n)}}}function qt(t){let e,n,l=t[0],o=[];for(let e=0;e<l.length;e+=1)o[e]=Et(St(t,l,e));const r=t=>V(o[t],1,1,(()=>{o[t]=null}));return{c(){e=$("ul");for(let t=0;t<o.length;t+=1)o[t].c();v(e,"class","svelte-1y8qml7")},m(t,l){f(t,e,l);for(let t=0;t<o.length;t+=1)o[t].m(e,null);n=!0},p(t,n){if(3&n){let c;for(l=t[0],c=0;c<l.length;c+=1){const r=St(t,l,c);o[c]?(o[c].p(r,n),H(o[c],1)):(o[c]=Et(r),o[c].c(),H(o[c],1),o[c].m(e,null))}for(F(),c=l.length;c<o.length;c+=1)r(c);P()}},i(t){if(!n){for(let t=0;t<l.length;t+=1)H(o[t]);n=!0}},o(t){o=o.filter(Boolean);for(let t=0;t<o.length;t+=1)V(o[t]);n=!1},d(t){t&&h(e),g(o,t)}}}function Et(t){let e,n;return e=new zt({props:{type:"main",id:t[2].id,count:t[2].count,name:t[2].name,selected:t[1]===t[2].id}}),{c(){K(e.$$.fragment)},m(t,l){R(e,t,l),n=!0},p(t,n){const l={};1&n&&(l.id=t[2].id),1&n&&(l.count=t[2].count),1&n&&(l.name=t[2].name),3&n&&(l.selected=t[1]===t[2].id),e.$set(l)},i(t){n||(H(e.$$.fragment,t),n=!0)},o(t){V(e.$$.fragment,t),n=!1},d(t){U(e,t)}}}function Bt(t){let e,n,l,o;const r=[qt,Mt],c=[];function i(t,e){return t[0].length?0:1}return n=i(t),l=c[n]=r[n](t),{c(){e=$("nav"),l.c(),v(e,"class","svelte-1y8qml7")},m(t,l){f(t,e,l),c[n].m(e,null),o=!0},p(t,[o]){let s=n;n=i(t),n===s?c[n].p(t,o):(F(),V(c[s],1,1,(()=>{c[s]=null})),P(),l=c[n],l?l.p(t,o):(l=c[n]=r[n](t),l.c()),H(l,1),l.m(e,null))},i(t){o||(H(l),o=!0)},o(t){V(l),o=!1},d(t){t&&h(e),c[n].d()}}}function At(t,e,n){let l,o;return a(t,ht,(t=>n(0,l=t))),a(t,$t,(t=>n(1,o=t))),[l,o]}class Nt extends Z{constructor(t){super(),J(this,t,At,Bt,i,{})}}function Tt(t,e,n){const l=t.slice();return l[3]=e[n],l}function It(t){let n;return{c(){n=$("div")},m(t,e){f(t,n,e)},p:e,i:e,o:e,d(t){t&&h(n)}}}function Lt(t){let e,n,l=t[0],o=[];for(let e=0;e<l.length;e+=1)o[e]=Dt(Tt(t,l,e));const r=t=>V(o[t],1,1,(()=>{o[t]=null}));return{c(){e=$("ul");for(let t=0;t<o.length;t+=1)o[t].c();v(e,"class","svelte-1kpwrwk")},m(t,l){f(t,e,l);for(let t=0;t<o.length;t+=1)o[t].m(e,null);n=!0},p(t,n){if(3&n){let c;for(l=t[0],c=0;c<l.length;c+=1){const r=Tt(t,l,c);o[c]?(o[c].p(r,n),H(o[c],1)):(o[c]=Dt(r),o[c].c(),H(o[c],1),o[c].m(e,null))}for(F(),c=l.length;c<o.length;c+=1)r(c);P()}},i(t){if(!n){for(let t=0;t<l.length;t+=1)H(o[t]);n=!0}},o(t){o=o.filter(Boolean);for(let t=0;t<o.length;t+=1)V(o[t]);n=!1},d(t){t&&h(e),g(o,t)}}}function Dt(t){let e,n;return e=new zt({props:{type:"sub",id:t[3].id,count:t[3].count,name:t[3].name,selected:t[1]===t[3].id}}),{c(){K(e.$$.fragment)},m(t,l){R(e,t,l),n=!0},p(t,n){const l={};1&n&&(l.id=t[3].id),1&n&&(l.count=t[3].count),1&n&&(l.name=t[3].name),3&n&&(l.selected=t[1]===t[3].id),e.$set(l)},i(t){n||(H(e.$$.fragment,t),n=!0)},o(t){V(e.$$.fragment,t),n=!1},d(t){U(e,t)}}}function Ot(t){let e,n,l,o;const r=[Lt,It],c=[];function i(t,e){return t[0]?0:1}return n=i(t),l=c[n]=r[n](t),{c(){e=$("nav"),l.c(),v(e,"class","svelte-1kpwrwk")},m(t,l){f(t,e,l),c[n].m(e,null),o=!0},p(t,[o]){let s=n;n=i(t),n===s?c[n].p(t,o):(F(),V(c[s],1,1,(()=>{c[s]=null})),P(),l=c[n],l?l.p(t,o):(l=c[n]=r[n](t),l.c()),H(l,1),l.m(e,null))},i(t){o||(H(l),o=!0)},o(t){V(l),o=!1},d(t){t&&h(e),c[n].d()}}}function Ft(t,e,n){let l,o;a(t,mt,(t=>n(1,o=t)));let r=rt([ht,$t],(([t,e],n)=>{if(t.length&&e){const l=t.find((t=>t.id===e));l&&n(l.sub)}}));return a(t,r,(t=>n(0,l=t))),[l,o,r]}class Pt extends Z{constructor(t){super(),J(this,t,Ft,Ot,i,{})}}function Ht(t){let n;return{c(){n=$("footer"),n.innerHTML='<div class="svelte-tnkizv">realisiert mit ❤️ von</div> \n\t<a href="https://fullstax.de" class="svelte-tnkizv">fullstax</a>',v(n,"class","copyright svelte-tnkizv")},m(t,e){f(t,n,e)},p:e,i:e,o:e,d(t){t&&h(n)}}}class Vt extends Z{constructor(t){super(),J(this,t,null,Ht,i,{})}}function Wt(t){let e,n,l,o,r,c,i,s,a,u,g,m,p,x,b,w;return n=new it({}),c=new Nt({}),s=new Vt({}),m=new Pt({}),b=new _t({props:{mainCategory:t[1],subCategory:t[2]}}),{c(){e=$("div"),K(n.$$.fragment),l=y(),o=$("main"),r=$("aside"),K(c.$$.fragment),i=y(),K(s.$$.fragment),a=y(),u=$("article"),g=$("header"),K(m.$$.fragment),p=y(),x=$("section"),K(b.$$.fragment),v(r,"class","svelte-9fwcf5"),v(g,"class","subCatHeader svelte-9fwcf5"),v(x,"id","cardsScrollContainer"),v(x,"class","svelte-9fwcf5"),v(u,"class","svelte-9fwcf5"),v(o,"class","svelte-9fwcf5"),v(e,"class","werkstadt-container svelte-9fwcf5")},m(h,$){f(h,e,$),R(n,e,null),d(e,l),d(e,o),d(o,r),R(c,r,null),d(r,i),R(s,r,null),d(o,a),d(o,u),d(u,g),R(m,g,null),d(u,p),d(u,x),R(b,x,null),t[3](x),w=!0},p(t,[e]){const n={};2&e&&(n.mainCategory=t[1]),4&e&&(n.subCategory=t[2]),b.$set(n)},i(t){w||(H(n.$$.fragment,t),H(c.$$.fragment,t),H(s.$$.fragment,t),H(m.$$.fragment,t),H(b.$$.fragment,t),w=!0)},o(t){V(n.$$.fragment,t),V(c.$$.fragment,t),V(s.$$.fragment,t),V(m.$$.fragment,t),V(b.$$.fragment,t),w=!1},d(l){l&&h(e),U(n),U(c),U(s),U(m),U(b),t[3](null)}}}function Kt(t,e,n){let l,o,r;a(t,$t,(t=>n(1,l=t))),a(t,mt,(t=>n(2,o=t)));const c=ht.subscribe((t=>{t.length&&$t.set(t[0].id)})),i=rt([ht,$t],(([t,e],n)=>{const l=t.find((t=>t.id===e));if(l){const t=l.sub[0].id;mt.set(t)}r&&r.scrollTo(0,0)})).subscribe((t=>{console.log("dataStore",t)}));var s;return s=()=>{c(),i()},C().$$.on_destroy.push(s),[r,l,o,function(t){S[t?"unshift":"push"]((()=>{r=t,n(0,r)}))}]}class Rt extends Z{constructor(t){super(),J(this,t,Kt,Wt,i,{})}}function Ut(t,e,n){const l=t.slice();return l[1]=e[n],l}function Gt(t,e,n){const l=t.slice();return l[4]=e[n],l}function Jt(t){let e,n,l,o,r,c,i,s,a,u,g,m,x,w,k,_=t[4].name+"",j=t[4].count+"";return g=new _t({props:{mainCategory:t[1].id,subCategory:t[4].id}}),{c(){e=$("li"),n=$("details"),l=$("summary"),o=$("h2"),r=p(_),c=y(),i=$("div"),s=p(j),a=y(),u=$("article"),K(g.$$.fragment),w=y(),v(o,"class","svelte-t1703a"),v(i,"class","sub-item-count"),v(l,"class","svelte-t1703a"),v(u,"class","accordion-content svelte-t1703a"),v(n,"class","svelte-t1703a"),v(e,"class","accordion-item svelte-t1703a"),v(e,"id",m=t[4].id),v(e,"data-count",x=t[4].count)},m(t,h){f(t,e,h),d(e,n),d(n,l),d(l,o),d(o,r),d(l,c),d(l,i),d(i,s),d(n,a),d(n,u),R(g,u,null),f(t,w,h),k=!0},p(t,n){(!k||1&n)&&_!==(_=t[4].name+"")&&b(r,_),(!k||1&n)&&j!==(j=t[4].count+"")&&b(s,j);const l={};1&n&&(l.mainCategory=t[1].id),1&n&&(l.subCategory=t[4].id),g.$set(l),(!k||1&n&&m!==(m=t[4].id))&&v(e,"id",m),(!k||1&n&&x!==(x=t[4].count))&&v(e,"data-count",x)},i(t){k||(H(g.$$.fragment,t),k=!0)},o(t){V(g.$$.fragment,t),k=!1},d(t){t&&h(e),U(g),t&&h(w)}}}function Zt(t){let e,n,l,o,r,c,i,s,a,u,m,x,w,k,_,j=t[1].name+"",C=t[1].count+"",z=t[1].sub,S=[];for(let e=0;e<z.length;e+=1)S[e]=Jt(Gt(t,z,e));const M=t=>V(S[t],1,1,(()=>{S[t]=null}));return{c(){e=$("li"),n=$("details"),l=$("summary"),o=$("h2"),r=p(j),c=y(),i=$("div"),s=p(C),a=y(),u=$("article"),m=$("ul");for(let t=0;t<S.length;t+=1)S[t].c();k=y(),v(o,"class","svelte-t1703a"),v(i,"class","sub-item-count"),v(l,"class","svelte-t1703a"),v(m,"class","accordion level-2 svelte-t1703a"),v(u,"class","accordion-content svelte-t1703a"),v(n,"class","svelte-t1703a"),v(e,"class","accordion-item svelte-t1703a"),v(e,"id",x=t[1].id),v(e,"data-count",w=t[1].count)},m(t,h){f(t,e,h),d(e,n),d(n,l),d(l,o),d(o,r),d(l,c),d(l,i),d(i,s),d(n,a),d(n,u),d(u,m);for(let t=0;t<S.length;t+=1)S[t].m(m,null);f(t,k,h),_=!0},p(t,n){if((!_||1&n)&&j!==(j=t[1].name+"")&&b(r,j),(!_||1&n)&&C!==(C=t[1].count+"")&&b(s,C),1&n){let e;for(z=t[1].sub,e=0;e<z.length;e+=1){const l=Gt(t,z,e);S[e]?(S[e].p(l,n),H(S[e],1)):(S[e]=Jt(l),S[e].c(),H(S[e],1),S[e].m(m,null))}for(F(),e=z.length;e<S.length;e+=1)M(e);P()}(!_||1&n&&x!==(x=t[1].id))&&v(e,"id",x),(!_||1&n&&w!==(w=t[1].count))&&v(e,"data-count",w)},i(t){if(!_){for(let t=0;t<z.length;t+=1)H(S[t]);_=!0}},o(t){S=S.filter(Boolean);for(let t=0;t<S.length;t+=1)V(S[t]);_=!1},d(t){t&&h(e),g(S,t),t&&h(k)}}}function Qt(t){let e,n,l,o,r,c=t[0],i=[];for(let e=0;e<c.length;e+=1)i[e]=Zt(Ut(t,c,e));const s=t=>V(i[t],1,1,(()=>{i[t]=null}));return o=new Vt({}),{c(){e=$("div"),n=$("ul");for(let t=0;t<i.length;t+=1)i[t].c();l=y(),K(o.$$.fragment),v(n,"class","accordion level-1 svelte-t1703a"),v(e,"class","accordion-container svelte-t1703a")},m(t,c){f(t,e,c),d(e,n);for(let t=0;t<i.length;t+=1)i[t].m(n,null);d(e,l),R(o,e,null),r=!0},p(t,[e]){if(1&e){let l;for(c=t[0],l=0;l<c.length;l+=1){const o=Ut(t,c,l);i[l]?(i[l].p(o,e),H(i[l],1)):(i[l]=Zt(o),i[l].c(),H(i[l],1),i[l].m(n,null))}for(F(),l=c.length;l<i.length;l+=1)s(l);P()}},i(t){if(!r){for(let t=0;t<c.length;t+=1)H(i[t]);H(o.$$.fragment,t),r=!0}},o(t){i=i.filter(Boolean);for(let t=0;t<i.length;t+=1)V(i[t]);V(o.$$.fragment,t),r=!1},d(t){t&&h(e),g(i,t),U(o)}}}function Xt(t,e,n){let l;return a(t,ht,(t=>n(0,l=t))),[l]}class Yt extends Z{constructor(t){super(),J(this,t,Xt,Qt,i,{})}}function te(t){let n;return{c(){n=$("div"),n.textContent="lade Daten...",v(n,"class","svelte-1kv31h0")},m(t,e){f(t,n,e)},p:e,i:e,o:e,d(t){t&&h(n)}}}function ee(t){let e,n,l,o;return e=new et({props:{query:"(min-width: 800px)",$$slots:{default:[le,({matches:t})=>({1:t}),({matches:t})=>t?2:0]},$$scope:{ctx:t}}}),l=new et({props:{query:"(max-width: 800px)",$$slots:{default:[re,({matches:t})=>({1:t}),({matches:t})=>t?2:0]},$$scope:{ctx:t}}}),{c(){K(e.$$.fragment),n=y(),K(l.$$.fragment)},m(t,r){R(e,t,r),f(t,n,r),R(l,t,r),o=!0},p(t,n){const o={};6&n&&(o.$$scope={dirty:n,ctx:t}),e.$set(o);const r={};6&n&&(r.$$scope={dirty:n,ctx:t}),l.$set(r)},i(t){o||(H(e.$$.fragment,t),H(l.$$.fragment,t),o=!0)},o(t){V(e.$$.fragment,t),V(l.$$.fragment,t),o=!1},d(t){U(e,t),t&&h(n),U(l,t)}}}function ne(t){let e,n;return e=new Rt({}),{c(){K(e.$$.fragment)},m(t,l){R(e,t,l),n=!0},i(t){n||(H(e.$$.fragment,t),n=!0)},o(t){V(e.$$.fragment,t),n=!1},d(t){U(e,t)}}}function le(t){let e,n,l=t[1]&&ne();return{c(){l&&l.c(),e=x()},m(t,o){l&&l.m(t,o),f(t,e,o),n=!0},p(t,n){t[1]?l?2&n&&H(l,1):(l=ne(),l.c(),H(l,1),l.m(e.parentNode,e)):l&&(F(),V(l,1,1,(()=>{l=null})),P())},i(t){n||(H(l),n=!0)},o(t){V(l),n=!1},d(t){l&&l.d(t),t&&h(e)}}}function oe(t){let e,n;return e=new Yt({}),{c(){K(e.$$.fragment)},m(t,l){R(e,t,l),n=!0},i(t){n||(H(e.$$.fragment,t),n=!0)},o(t){V(e.$$.fragment,t),n=!1},d(t){U(e,t)}}}function re(t){let e,n,l=t[1]&&oe();return{c(){l&&l.c(),e=x()},m(t,o){l&&l.m(t,o),f(t,e,o),n=!0},p(t,n){t[1]?l?2&n&&H(l,1):(l=oe(),l.c(),H(l,1),l.m(e.parentNode,e)):l&&(F(),V(l,1,1,(()=>{l=null})),P())},i(t){n||(H(l),n=!0)},o(t){V(l),n=!1},d(t){l&&l.d(t),t&&h(e)}}}function ce(t){let e,n,l,o;const r=[ee,te],c=[];function i(t,e){return t[0].length?0:1}return e=i(t),n=c[e]=r[e](t),{c(){n.c(),l=x()},m(t,n){c[e].m(t,n),f(t,l,n),o=!0},p(t,[o]){let s=e;e=i(t),e===s?c[e].p(t,o):(F(),V(c[s],1,1,(()=>{c[s]=null})),P(),n=c[e],n?n.p(t,o):(n=c[e]=r[e](t),n.c()),H(n,1),n.m(l.parentNode,l))},i(t){o||(H(n),o=!0)},o(t){V(n),o=!1},d(t){c[e].d(t),t&&h(l)}}}function ie(t,e,n){let l;return a(t,ht,(t=>n(0,l=t))),[l]}function se(t,e,n){const l=t.slice();return l[21]=e[n],l[23]=n,l}function ae(t,e,n){const l=t.slice();return l[21]=e[n],l[23]=n,l}function ue(t,e,n){const l=t.slice();return l[21]=e[n],l[23]=n,l}function de(t){let e,n;return{c(){e=$("h3"),n=p(t[3]),v(e,"class","wsf-barchart__title svelte-1v77q49"),w(e,"background-color",t[2])},m(t,l){f(t,e,l),d(e,n)},p(t,l){8&l&&b(n,t[3]),4&l&&w(e,"background-color",t[2])},d(t){t&&h(e)}}}function fe(t){let e,n,l,o;return{c(){e=m("text"),n=p("lade Daten..."),v(e,"x",l=t[0]/2),v(e,"y",o=t[1]/2),v(e,"dominant-baseline","middle"),v(e,"text-anchor","middle"),w(e,"fill",t[2],!1)},m(t,l){f(t,e,l),d(e,n)},p(t,n){1&n&&l!==(l=t[0]/2)&&v(e,"x",l),2&n&&o!==(o=t[1]/2)&&v(e,"y",o),4&n&&w(e,"fill",t[2],!1)},d(t){t&&h(e)}}}function he(t){let e,n,l,o;return{c(){e=m("rect"),v(e,"x",n=t[15]+t[23]*t[8]+t[23]*t[11]),v(e,"y",l=t[14]+t[13]-t[21].value/t[12]*t[13]),v(e,"width",t[8]),v(e,"height",o=t[21].value/t[12]*t[13]),v(e,"class","svelte-1v77q49"),w(e,"fill",t[2],!1)},m(t,n){f(t,e,n)},p(t,r){2304&r&&n!==(n=t[15]+t[23]*t[8]+t[23]*t[11])&&v(e,"x",n),12800&r&&l!==(l=t[14]+t[13]-t[21].value/t[12]*t[13])&&v(e,"y",l),256&r&&v(e,"width",t[8]),12800&r&&o!==(o=t[21].value/t[12]*t[13])&&v(e,"height",o),4&r&&w(e,"fill",t[2],!1)},d(t){t&&h(e)}}}function ge(t){let e,n,l,o,r,c,i,s=t[21].label+"";return{c(){e=m("text"),n=p(s),v(e,"x",l=t[15]+t[23]*t[8]+t[8]/2+t[23]*t[11]),v(e,"y",o=!t[4]&&t[7]>3&&t[23]%2?t[14]+t[13]+1.75*t[5]:t[14]+t[13]+.75*t[5]),v(e,"dominant-baseline",r=t[4]?"start":"middle"),v(e,"text-anchor",c=t[4]?"start":"middle"),v(e,"writing-mode",i=t[4]?"tb":"lr"),w(e,"fill",t[2],!1),w(e,"font-size",t[5]+"px",!1),w(e,"font-weight","bold",!1)},m(t,l){f(t,e,l),d(e,n)},p(t,a){512&a&&s!==(s=t[21].label+"")&&b(n,s),2304&a&&l!==(l=t[15]+t[23]*t[8]+t[8]/2+t[23]*t[11])&&v(e,"x",l),8368&a&&o!==(o=!t[4]&&t[7]>3&&t[23]%2?t[14]+t[13]+1.75*t[5]:t[14]+t[13]+.75*t[5])&&v(e,"y",o),16&a&&r!==(r=t[4]?"start":"middle")&&v(e,"dominant-baseline",r),16&a&&c!==(c=t[4]?"start":"middle")&&v(e,"text-anchor",c),16&a&&i!==(i=t[4]?"tb":"lr")&&v(e,"writing-mode",i),4&a&&w(e,"fill",t[2],!1),32&a&&w(e,"font-size",t[5]+"px",!1)},d(t){t&&h(e)}}}function $e(t){let e,n,l,o;return{c(){e=m("text"),n=p(t[6]),v(e,"x",l=t[0]/2),v(e,"y",o=t[14]+t[10]+t[5]),v(e,"dominant-baseline","middle"),v(e,"text-anchor","middle"),w(e,"fill",t[2],!1)},m(t,l){f(t,e,l),d(e,n)},p(t,r){64&r&&b(n,t[6]),1&r&&l!==(l=t[0]/2)&&v(e,"x",l),1056&r&&o!==(o=t[14]+t[10]+t[5])&&v(e,"y",o),4&r&&w(e,"fill",t[2],!1)},d(t){t&&h(e)}}}function me(t){let e,n,l,o,r,c,i,s=t[21].label+"",a=t[21].value+"";return{c(){e=$("tr"),n=$("td"),l=p(s),o=y(),r=$("td"),c=p(a),i=y()},m(t,s){f(t,e,s),d(e,n),d(n,l),d(e,o),d(e,r),d(r,c),d(e,i)},p(t,e){512&e&&s!==(s=t[21].label+"")&&b(l,s),512&e&&a!==(a=t[21].value+"")&&b(c,a)},d(t){t&&h(e)}}}function pe(t){let n,l,o,r,c,i,s,a,u,w,k,_,j,C,z,S,M,q,E,B=(t[3]||"Key")+"",A=t[3]&&de(t),N=(!t[9]||!t[9].length)&&fe(t),T=t[9],I=[];for(let e=0;e<T.length;e+=1)I[e]=he(ue(t,T,e));let L=t[9],D=[];for(let e=0;e<L.length;e+=1)D[e]=ge(ae(t,L,e));let O=t[6]&&$e(t),F=t[9],P=[];for(let e=0;e<F.length;e+=1)P[e]=me(se(t,F,e));return{c(){n=$("div"),A&&A.c(),l=y(),o=$("figure"),r=m("svg"),N&&N.c(),c=x();for(let t=0;t<I.length;t+=1)I[t].c();i=x();for(let t=0;t<D.length;t+=1)D[t].c();s=x(),O&&O.c(),u=y(),w=$("figcaption"),k=$("table"),_=$("thead"),j=$("tr"),C=$("th"),z=p(B),S=y(),M=$("th"),M.textContent="Anzahl",q=y(),E=$("tbody");for(let t=0;t<P.length;t+=1)P[t].c();v(r,"class","wsf-barchart__chart svelte-1v77q49"),v(r,"width","100%"),v(r,"height","100%"),v(r,"viewBox",a="0 0 "+t[0]+" "+t[1]),v(k,"border","1"),v(w,"class","sr-only"),v(n,"class","wsf-barchart svelte-1v77q49")},m(t,e){f(t,n,e),A&&A.m(n,null),d(n,l),d(n,o),d(o,r),N&&N.m(r,null),d(r,c);for(let t=0;t<I.length;t+=1)I[t].m(r,null);d(r,i);for(let t=0;t<D.length;t+=1)D[t].m(r,null);d(r,s),O&&O.m(r,null),d(o,u),d(o,w),d(w,k),d(k,_),d(_,j),d(j,C),d(C,z),d(j,S),d(j,M),d(k,q),d(k,E);for(let t=0;t<P.length;t+=1)P[t].m(E,null)},p(t,[e]){if(t[3]?A?A.p(t,e):(A=de(t),A.c(),A.m(n,l)):A&&(A.d(1),A=null),t[9]&&t[9].length?N&&(N.d(1),N=null):N?N.p(t,e):(N=fe(t),N.c(),N.m(r,c)),64260&e){let n;for(T=t[9],n=0;n<T.length;n+=1){const l=ue(t,T,n);I[n]?I[n].p(l,e):(I[n]=he(l),I[n].c(),I[n].m(r,i))}for(;n<I.length;n+=1)I[n].d(1);I.length=T.length}if(60340&e){let n;for(L=t[9],n=0;n<L.length;n+=1){const l=ae(t,L,n);D[n]?D[n].p(l,e):(D[n]=ge(l),D[n].c(),D[n].m(r,s))}for(;n<D.length;n+=1)D[n].d(1);D.length=L.length}if(t[6]?O?O.p(t,e):(O=$e(t),O.c(),O.m(r,null)):O&&(O.d(1),O=null),3&e&&a!==(a="0 0 "+t[0]+" "+t[1])&&v(r,"viewBox",a),8&e&&B!==(B=(t[3]||"Key")+"")&&b(z,B),512&e){let n;for(F=t[9],n=0;n<F.length;n+=1){const l=se(t,F,n);P[n]?P[n].p(l,e):(P[n]=me(l),P[n].c(),P[n].m(E,null))}for(;n<P.length;n+=1)P[n].d(1);P.length=F.length}},i:e,o:e,d(t){t&&h(n),A&&A.d(),N&&N.d(),g(I,t),g(D,t),O&&O.d(),g(P,t)}}}function ye(t,e,n){let l,o,r,c,i,s,a,u,d,{data:f=[]}=e,{width:h=320}=e,{height:g=320}=e,{color:$="rgb(0, 0, 255)"}=e,{title:m=null}=e,{xVertical:p=!1}=e,{fontSize:y=Math.abs(.06*g)}=e,{subtitle:x=null}=e;const v=.1*g,b=p?.3*g:.1*g,w=.15*h,k=.15*h;return t.$$set=t=>{"data"in t&&n(16,f=t.data),"width"in t&&n(0,h=t.width),"height"in t&&n(1,g=t.height),"color"in t&&n(2,$=t.color),"title"in t&&n(3,m=t.title),"xVertical"in t&&n(4,p=t.xVertical),"fontSize"in t&&n(5,y=t.fontSize),"subtitle"in t&&n(6,x=t.subtitle)},t.$$.update=()=>{1&t.$$.dirty&&n(17,l=h-k-w),2&t.$$.dirty&&n(10,o=g-v-b),32&t.$$.dirty&&n(18,r=2*y),263168&t.$$.dirty&&n(13,c=o-r),65536&t.$$.dirty&&n(7,i=f.length),65536&t.$$.dirty&&n(9,s=f.map((t=>({label:`${t.key}`,value:t.value})))),512&t.$$.dirty&&n(12,a=Math.max(...s.map((t=>t.value)))),131200&t.$$.dirty&&n(8,u=l/i*.65),131456&t.$$.dirty&&n(11,d=(l-u*i)/(i-1))},[h,g,$,m,p,y,x,i,u,s,o,d,a,c,v,k,f,l,r]}class xe extends Z{constructor(t){super(),J(this,t,ye,pe,i,{data:16,width:0,height:1,color:2,title:3,xVertical:4,fontSize:5,subtitle:6})}}function ve(t,e,n){const l=t.slice();return l[18]=e[n],l}function be(t,e,n){const l=t.slice();return l[21]=e[n],l}function we(t){let n;return{c(){n=$("p"),n.textContent="lade Daten..."},m(t,e){f(t,n,e)},p:e,d(t){t&&h(n)}}}function ke(t){let e,n,l,o,r,c,i,s,a=t[8],u=[];for(let e=0;e<a.length;e+=1)u[e]=_e(be(t,a,e));let p=t[4]&&je(t),b=t[2],w=[];for(let e=0;e<b.length;e+=1)w[e]=Ce(ve(t,b,e));return{c(){e=$("figure"),n=m("svg");for(let t=0;t<u.length;t+=1)u[t].c();l=x(),p&&p.c(),o=y(),r=$("figcaption"),c=$("table"),i=$("tr"),i.innerHTML="<th>Key</th><th>Value</th>",s=y();for(let t=0;t<w.length;t+=1)w[t].c();v(n,"width","100%"),v(n,"height","100%"),v(n,"viewBox",t[10]),v(c,"border","1"),v(r,"class","sr-only")},m(t,a){f(t,e,a),d(e,n);for(let t=0;t<u.length;t+=1)u[t].m(n,null);d(n,l),p&&p.m(n,null),d(e,o),d(e,r),d(r,c),d(c,i),d(c,s);for(let t=0;t<w.length;t+=1)w[t].m(c,null)},p(t,e){if(971&e){let o;for(a=t[8],o=0;o<a.length;o+=1){const r=be(t,a,o);u[o]?u[o].p(r,e):(u[o]=_e(r),u[o].c(),u[o].m(n,l))}for(;o<u.length;o+=1)u[o].d(1);u.length=a.length}if(t[4]?p?p.p(t,e):(p=je(t),p.c(),p.m(n,null)):p&&(p.d(1),p=null),1024&e&&v(n,"viewBox",t[10]),4&e){let n;for(b=t[2],n=0;n<b.length;n+=1){const l=ve(t,b,n);w[n]?w[n].p(l,e):(w[n]=Ce(l),w[n].c(),w[n].m(c,null))}for(;n<w.length;n+=1)w[n].d(1);w.length=b.length}},d(t){t&&h(e),g(u,t),p&&p.d(),g(w,t)}}}function _e(t){let e,n,l,o,r,c,i,s,a,u,g,$,y,x,w,k,_,j,C,z,S,M,q,E,B,A,N,T,I,L,D,O,F,P,H=t[21].title+"",V=t[21].subTitle+"";return{c(){e=m("path"),r=m("circle"),g=m("line"),C=m("foreignObject"),z=document.createElementNS("http://www.w3.org/1999/xhtml","p"),S=p(H),N=m("foreignObject"),T=document.createElementNS("http://www.w3.org/1999/xhtml","p"),I=p(V),v(e,"d",n=t[21].d),v(e,"stroke",l=t[21].color),v(e,"stroke-opacity",o=t[21].opacity),v(e,"stroke-width","30"),v(e,"stroke-linecap","butt"),v(e,"fill","none"),v(e,"class","svelte-1m39huv"),v(r,"cx",c=t[21].x),v(r,"cy",i=t[21].y),v(r,"r",s=.03*t[6]),v(r,"fill",a=t[21].color),v(r,"fill-opacity",u=t[21].opacity),v(r,"stroke-width","1"),v(r,"stroke","none"),v(g,"x1",$=t[21].x>t[7]?t[21].x+.03*t[6]:t[21].x-.03*t[6]),v(g,"y1",y=t[21].y),v(g,"x2",x=t[21].x>t[7]?t[21].x+t[9]-10:t[21].x-t[9]+10),v(g,"y2",w=t[21].y),v(g,"stroke",k=t[21].color),v(g,"stroke-opacity",_=t[21].opacity),v(g,"stroke-width",j=.02*t[6]),v(g,"stroke-linecap","round"),v(z,"xmlns","http://www.w3.org/1999/xhtml"),v(z,"style",M=[`color: ${t[21].color}`,`opacity: ${t[21].opacity}`,`font-size: ${t[3]}px`,`line-height: ${t[3]}px`,"text-align: "+(t[21].x>t[7]?"left":"right")].join(";")),v(C,"x",q=t[21].x>t[7]?t[21].x+t[9]:t[21].x-t[9]-.2*t[0]),v(C,"y",E=t[21].y-.05*t[1]+.5*t[3]),v(C,"width",B=.2*t[0]),v(C,"height",A=.2*t[1]),v(T,"xmlns","http://www.w3.org/1999/xhtml"),v(T,"style",L=[`color: ${t[21].color}`,`opacity: ${t[21].opacity}`,`font-size: ${.4*t[3]}px`,`line-height: ${.5*t[3]}px`,"text-align: "+(t[21].x>t[7]?"left":"right")].join(";")),v(N,"x",D=t[21].x>t[7]?t[21].x+t[9]:t[21].x-t[9]-.2*t[0]),v(N,"y",O=t[21].y-.05*t[1]+1.5*t[3]),v(N,"width",F=.2*t[0]),v(N,"height",P=.2*t[1])},m(t,n){f(t,e,n),f(t,r,n),f(t,g,n),f(t,C,n),d(C,z),d(z,S),f(t,N,n),d(N,T),d(T,I)},p(t,d){256&d&&n!==(n=t[21].d)&&v(e,"d",n),256&d&&l!==(l=t[21].color)&&v(e,"stroke",l),256&d&&o!==(o=t[21].opacity)&&v(e,"stroke-opacity",o),256&d&&c!==(c=t[21].x)&&v(r,"cx",c),256&d&&i!==(i=t[21].y)&&v(r,"cy",i),64&d&&s!==(s=.03*t[6])&&v(r,"r",s),256&d&&a!==(a=t[21].color)&&v(r,"fill",a),256&d&&u!==(u=t[21].opacity)&&v(r,"fill-opacity",u),448&d&&$!==($=t[21].x>t[7]?t[21].x+.03*t[6]:t[21].x-.03*t[6])&&v(g,"x1",$),256&d&&y!==(y=t[21].y)&&v(g,"y1",y),896&d&&x!==(x=t[21].x>t[7]?t[21].x+t[9]-10:t[21].x-t[9]+10)&&v(g,"x2",x),256&d&&w!==(w=t[21].y)&&v(g,"y2",w),256&d&&k!==(k=t[21].color)&&v(g,"stroke",k),256&d&&_!==(_=t[21].opacity)&&v(g,"stroke-opacity",_),64&d&&j!==(j=.02*t[6])&&v(g,"stroke-width",j),256&d&&H!==(H=t[21].title+"")&&b(S,H),392&d&&M!==(M=[`color: ${t[21].color}`,`opacity: ${t[21].opacity}`,`font-size: ${t[3]}px`,`line-height: ${t[3]}px`,"text-align: "+(t[21].x>t[7]?"left":"right")].join(";"))&&v(z,"style",M),897&d&&q!==(q=t[21].x>t[7]?t[21].x+t[9]:t[21].x-t[9]-.2*t[0])&&v(C,"x",q),266&d&&E!==(E=t[21].y-.05*t[1]+.5*t[3])&&v(C,"y",E),1&d&&B!==(B=.2*t[0])&&v(C,"width",B),2&d&&A!==(A=.2*t[1])&&v(C,"height",A),256&d&&V!==(V=t[21].subTitle+"")&&b(I,V),392&d&&L!==(L=[`color: ${t[21].color}`,`opacity: ${t[21].opacity}`,`font-size: ${.4*t[3]}px`,`line-height: ${.5*t[3]}px`,"text-align: "+(t[21].x>t[7]?"left":"right")].join(";"))&&v(T,"style",L),897&d&&D!==(D=t[21].x>t[7]?t[21].x+t[9]:t[21].x-t[9]-.2*t[0])&&v(N,"x",D),266&d&&O!==(O=t[21].y-.05*t[1]+1.5*t[3])&&v(N,"y",O),1&d&&F!==(F=.2*t[0])&&v(N,"width",F),2&d&&P!==(P=.2*t[1])&&v(N,"height",P)},d(t){t&&h(e),t&&h(r),t&&h(g),t&&h(C),t&&h(N)}}}function je(t){let e,n,l,o;return{c(){e=m("text"),n=p(t[4]),v(e,"x",l=t[0]/2),v(e,"y",o=t[1]-t[3]),v(e,"dominant-baseline","middle"),v(e,"text-anchor","middle"),w(e,"fill",t[5],!1),w(e,"font-weight","normal",!1)},m(t,l){f(t,e,l),d(e,n)},p(t,r){16&r&&b(n,t[4]),1&r&&l!==(l=t[0]/2)&&v(e,"x",l),10&r&&o!==(o=t[1]-t[3])&&v(e,"y",o),32&r&&w(e,"fill",t[5],!1)},d(t){t&&h(e)}}}function Ce(t){let e,n,l,o,r,c,i=t[18].key+"",s=t[18].value.toFixed(2)+"";return{c(){e=$("tr"),n=$("td"),l=p(i),o=$("td"),r=p(s),c=y()},m(t,i){f(t,e,i),d(e,n),d(n,l),d(e,o),d(o,r),d(e,c)},p(t,e){4&e&&i!==(i=t[18].key+"")&&b(l,i),4&e&&s!==(s=t[18].value.toFixed(2)+"")&&b(r,s)},d(t){t&&h(e)}}}function ze(t){let n;function l(t,e){return t[2]&&t[2].length?ke:we}let o=l(t),r=o(t);return{c(){n=$("div"),r.c(),v(n,"class","wsf-donatchart svelte-1m39huv")},m(t,e){f(t,n,e),r.m(n,null)},p(t,[e]){o===(o=l(t))&&r?r.p(t,e):(r.d(1),r=o(t),r&&(r.c(),r.m(n,null)))},i:e,o:e,d(t){t&&h(n),r.d()}}}function Se(t,e,n){let l,o,r,c,i,s,a,u,d,{width:f=960}=e,{height:h=500}=e,{data:g=[]}=e,{fontSize:$=.03*f}=e,{subtitle:m=null}=e,{color:p="black"}=e;function y(t,e,n,l){var o=(l-90)*Math.PI/180;return{x:t+n*Math.cos(o),y:e+n*Math.sin(o)}}function x(t){let e=0;return t.filter((t=>t.value>0)).map(((t,n)=>{let r=t.value/a,s=e,u=e=s+360*r;const f=y(l,o,c+i,u-360*r/2),h=f.x,g=f.y,$=function(t,e,n,l,o){var r=y(t,e,n,o),c=y(t,e,n,l),i=o-l<=180?0:1;return["M",r.x,r.y,"A",n,n,0,i,0,c.x,c.y].join(" ")}(l,o,c,s+d,u-d);return{x:h,y:g,d:$,color:t.color||p,opacity:1,title:`${t.title||t.key} ${(100*r).toFixed(0)}%`,subTitle:t.subTitle||t.keys.join(", "),value:t.value}}))}return t.$$set=t=>{"width"in t&&n(0,f=t.width),"height"in t&&n(1,h=t.height),"data"in t&&n(2,g=t.data),"fontSize"in t&&n(3,$=t.fontSize),"subtitle"in t&&n(4,m=t.subtitle),"color"in t&&n(5,p=t.color)},t.$$.update=()=>{1&t.$$.dirty&&n(7,l=f/2),2&t.$$.dirty&&(o=h/2),3&t.$$.dirty&&n(10,r=`0 0 ${f} ${h}`),1&t.$$.dirty&&n(6,c=.15*f),64&t.$$.dirty&&(i=.25*c),64&t.$$.dirty&&n(9,s=.4*c),4&t.$$.dirty&&(a=g.reduce(((t,e)=>t+e.value),0)),4&t.$$.dirty&&n(8,u=x(g))},d=1,[f,h,g,$,m,p,c,l,u,s,r]}class Me extends Z{constructor(t){super(),J(this,t,Se,ze,i,{width:0,height:1,data:2,fontSize:3,subtitle:4,color:5})}}function qe(t){let e,n,l,o,r,c,i,s,a,u,g,m;return o=new xe({props:{title:"Altersverteilung",subtitle:t[1],data:t[5],width:"480",height:"320",color:"var(--werkstadt-orange)"}}),i=new xe({props:{title:"Geschlecht",subtitle:t[2],data:t[4],width:"480",height:"320",color:"var(--werkstadt-purple)"}}),g=new Me({props:{width:"800",height:"500",color:"rgba(60, 188, 150, 1)",subtitle:t[3],data:t[0]}}),{c(){e=$("div"),n=$("section"),l=$("div"),K(o.$$.fragment),r=y(),c=$("div"),K(i.$$.fragment),s=y(),a=$("section"),u=$("div"),K(g.$$.fragment),v(l,"class","chart svelte-1053edn"),v(c,"class","chart svelte-1053edn"),v(n,"class","svelte-1053edn"),v(u,"class","chart svelte-1053edn"),v(a,"class","svelte-1053edn"),v(e,"class","wsf-statistics")},m(t,h){f(t,e,h),d(e,n),d(n,l),R(o,l,null),d(n,r),d(n,c),R(i,c,null),d(e,s),d(e,a),d(a,u),R(g,u,null),m=!0},p(t,[e]){const n={};2&e&&(n.subtitle=t[1]),32&e&&(n.data=t[5]),o.$set(n);const l={};4&e&&(l.subtitle=t[2]),16&e&&(l.data=t[4]),i.$set(l);const r={};8&e&&(r.subtitle=t[3]),1&e&&(r.data=t[0]),g.$set(r)},i(t){m||(H(o.$$.fragment,t),H(i.$$.fragment,t),H(g.$$.fragment,t),m=!0)},o(t){V(o.$$.fragment,t),V(i.$$.fragment,t),V(g.$$.fragment,t),m=!1},d(t){t&&h(e),U(o),U(i),U(g)}}}function Ee(t,e,n){let l,o,r,c,i,s,u;a(t,ft,(t=>n(10,u=t)));let d=[],f=null,h=null,g=null;return t.$$.update=()=>{if(1024&t.$$.dirty&&n(9,l=u.age||[]),1024&t.$$.dirty&&n(8,o=u.gender||[]),1024&t.$$.dirty&&n(7,r=u.location||[]),512&t.$$.dirty&&n(5,c=l.filter((t=>"unknown"!==t.key))),512&t.$$.dirty){const t=l?l.find((t=>"unknown"===t.key)):null,e=t?t.value:null;n(1,f=e?`${e} ${e>1?"Menschen haben":"Mensch hat"} keine Angabe gemacht`:null)}if(256&t.$$.dirty&&n(4,i=o.filter((t=>"unknown"!==t.key))),256&t.$$.dirty){const t=o?o.find((t=>"unknown"===t.key)):null,e=t?t.value:null;n(2,h=e?`${e} ${e>1?"Menschen haben":"Mensch hat"} keine Angabe gemacht`:null)}if(128&t.$$.dirty&&n(6,s=r.map((t=>t.value)).reduce(((t,e)=>t+e),0)),128&t.$$.dirty){const t=r?r.find((t=>"unknown"===t.key)):null,e=t?t.value:null;n(3,g=e?`${e} ${e>1?"Menschen haben":"Mensch hat"} keine Angabe gemacht`:null)}if(192&t.$$.dirty){const t=[{key:"Zentrum",keys:["Innenstadt","Westvorstadt"],value:0,color:"rgba(60, 188, 150, 1)"},{key:"Osten",keys:["Stadtgrenze","Poppenreuth","Espan"],value:0,color:"rgba(60, 188, 150, 0.4)"},{key:"Süden",keys:["Südstadt","Dambach"],value:0,color:"rgba(60, 188, 150, 0.9)"},{key:"Norden",keys:["Vach","Stadeln","Ronhof","Mannhof","Ritzmannshof","Atzenhof"],value:0,color:"rgba(60, 188, 150, 0.6)"},{key:"Westen",keys:["Hardhöhe","Eigenes Heim","Burgfarrnbach","Oberfürberg","Unterfürberg","Unterfarrnbach"],value:0,color:"rgba(60, 188, 150, 0.8)"}];for(const e of r){let n=!1;for(const l of t.filter((t=>"unknown"!==t.key)))l.keys.includes(e.key)&&(l.value+=e.value/s,n=!0);n||console.warn(`No group found for entry "${e.key}"`)}n(0,d=t)}},[d,f,h,g,i,c,s,r,o,l,u]}const Be=new class extends Z{constructor(t){super(),J(this,t,Ee,qe,i,{})}}({target:document.getElementById("werkstadt-2031-statistics")}),Ae=new class extends Z{constructor(t){super(),J(this,t,ie,ce,i,{})}}({target:document.getElementById("werkstadt-2031-app")});return t.default=Ae,t.statistics=Be,Object.defineProperty(t,"__esModule",{value:!0}),t}({});
//# sourceMappingURL=bundle.js.map