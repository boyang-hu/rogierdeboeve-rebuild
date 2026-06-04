const Vg="modulepreload",Gg=function(s){return"/"+s},Xu={},Rt=function(e,t,n){if(!t||t.length===0)return e();const i=document.getElementsByTagName("link");return Promise.all(t.map(r=>{if(r=Gg(r),r in Xu)return;Xu[r]=!0;const o=r.endsWith(".css"),a=o?'[rel="stylesheet"]':"";if(!!n)for(let d=i.length-1;d>=0;d--){const l=i[d];if(l.href===r&&(!o||l.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${r}"]${a}`))return;const u=document.createElement("link");if(u.rel=o?"stylesheet":Vg,o||(u.as="script",u.crossOrigin=""),u.href=r,document.head.appendChild(u),o)return new Promise((d,l)=>{u.addEventListener("load",d),u.addEventListener("error",()=>l(new Error(`Unable to preload CSS for ${r}`)))})})).then(()=>e()).catch(r=>{const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=r,window.dispatchEvent(o),!o.defaultPrevented)throw r})},Wg={name:"MissingMediaQueryDirective",title:"Missing value for `client:media` directive.",message:'Media query not provided for `client:media` directive. A media query similar to `client:media="(max-width: 600px)"` must be provided'},ll={name:"NoMatchingRenderer",title:"No matching renderer found.",message:(s,e,t,n)=>`Unable to render \`${s}\`.

${n>0?`There ${t?"are":"is"} ${n} renderer${t?"s":""} configured in your \`astro.config.mjs\` file,
but ${t?"none were":"it was not"} able to server-side render \`${s}\`.`:`No valid renderer was found ${e?`for the \`.${e}\` file extension.`:"for this file extension."}`}`,hint:s=>`Did you mean to enable the ${s} integration?

See https://docs.astro.build/en/core-concepts/framework-components/ for more information on how to install and configure integrations.`},$u={name:"NoClientEntrypoint",title:"No client entrypoint specified in renderer.",message:(s,e,t)=>`\`${s}\` component has a \`client:${e}\` directive, but no client entrypoint was provided by \`${t}\`.`,hint:"See https://docs.astro.build/en/reference/integrations-reference/#addrenderer-option for more information on how to configure your renderer."},cl={name:"NoClientOnlyHint",title:"Missing hint on client:only directive.",message:s=>`Unable to render \`${s}\`. When using the \`client:only\` hydration strategy, Astro needs a hint to use the correct renderer.`,hint:s=>`Did you mean to pass \`client:only="${s}"\`? See https://docs.astro.build/en/reference/directives-reference/#clientonly for more information on client:only`},qu={name:"InvalidComponentArgs",title:"Invalid component arguments.",message:s=>`Invalid arguments passed to${s?` <${s}>`:""} component.`,hint:"Astro components cannot be rendered directly via function call, such as `Component()` or `{items.map(Component)}`."},jg={name:"UnknownContentCollectionError",title:"Unknown Content Collection Error."},Yu={name:"CollectionDoesNotExistError",title:"Collection does not exist",message:s=>`The collection **${s}** does not exist. Ensure a collection directory with this name exists.`,hint:"See https://docs.astro.build/en/guides/content-collections/ for more on creating collections."};function Xg(s){return s.replace(/\r\n|\r(?!\n)|\n/g,`
`)}function $g(s,e){if(!e||e.line===void 0||e.column===void 0)return"";const t=Xg(s).split(`
`).map(o=>o.replace(/\t/g,"  ")),n=[];for(let o=-2;o<=2;o++)t[e.line+o]&&n.push(e.line+o);let i=0;for(const o of n){let a=`> ${o}`;a.length>i&&(i=a.length)}let r="";for(const o of n){const a=o===e.line-1;r+=a?"> ":"  ",r+=`${o+1} | ${t[o]}
`,a&&(r+=`${Array.from({length:i}).join(" ")}  | ${Array.from({length:e.column}).join(" ")}^
`)}return r}class Ss extends Error{constructor(e,...t){super(...t),this.type="AstroError";const{name:n,title:i,message:r,stack:o,location:a,hint:c,frame:u}=e;this.title=i,this.name=n,r&&(this.message=r),this.stack=o||this.stack,this.loc=a,this.hint=c,this.frame=u}setLocation(e){this.loc=e}setName(e){this.name=e}setMessage(e){this.message=e}setHint(e){this.hint=e}setFrame(e,t){this.frame=$g(e,t)}static is(e){return e.type==="AstroError"}}function qg(s){return s[0]==="/"?s:"/"+s}function Yg(s){return!(s.length!==3||!s[0]||typeof s[0]!="object")}function Of(s,e,t){var n;const i=((n=e?.split("/").pop())==null?void 0:n.replace(".astro",""))??"",r=(...o)=>{if(!Yg(o))throw new Ss({...qu,message:qu.message(i)});return s(...o)};return Object.defineProperty(r,"name",{value:i,writable:!1}),r.isAstroComponentFactory=!0,r.moduleId=e,r.propagation=t,r}function Kg(s){return Of(s.factory,s.moduleId,s.propagation)}function Zg(s,e,t){return typeof s=="function"?Of(s,e,t):Kg(s)}const{replace:Jg}="",Qg=/[&<>'"]/g,ev={"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"},tv=s=>ev[s],nv=s=>Jg.call(s,Qg,tv);function kf(s){const e={};return t(s),Object.keys(e).join(" ");function t(n){n&&typeof n.forEach=="function"?n.forEach(t):n===Object(n)?Object.keys(n).forEach(i=>{n[i]&&t(i)}):(n=n===!1||n==null?"":String(n).trim(),n&&n.split(/\s+/).forEach(i=>{e[i]=!0}))}}function Yc(s){return!!s&&typeof s=="object"&&typeof s.then=="function"}async function*iv(s){const e=s.getReader();try{for(;;){const{done:t,value:n}=await e.read();if(t)return;yield n}}finally{e.releaseLock()}}const da=nv;class Bf extends Uint8Array{}Object.defineProperty(Bf.prototype,Symbol.toStringTag,{get(){return"HTMLBytes"}});class ya extends String{get[Symbol.toStringTag](){return"HTMLString"}}const Lt=s=>s instanceof ya?s:typeof s=="string"?new ya(s):s;function sv(s){return Object.prototype.toString.call(s)==="[object HTMLString]"}function rv(s){return new Bf(s)}function zf(s){return typeof s.getReader=="function"}async function*Ku(s){if(zf(s))for await(const e of iv(s))yield lo(e);else for await(const e of s)yield lo(e)}function*ov(s){for(const e of s)yield lo(e)}function lo(s){if(s&&typeof s=="object"){if(s instanceof Uint8Array)return rv(s);if(s instanceof Response&&s.body){const e=s.body;return Ku(e)}else{if(typeof s.then=="function")return Promise.resolve(s).then(e=>lo(e));if(Symbol.iterator in s)return ov(s);if(Symbol.asyncIterator in s||zf(s))return Ku(s)}}return Lt(s)}const Hf=Symbol.for("astro:render");function av(s){return Object.defineProperty(s,Hf,{value:!0})}function lv(s){return s&&typeof s=="object"&&s[Hf]}const yn={Value:0,JSON:1,RegExp:2,Date:3,Map:4,Set:5,BigInt:6,URL:7,Uint8Array:8,Uint16Array:9,Uint32Array:10};function ul(s,e={},t=new WeakSet){if(t.has(s))throw new Error(`Cyclic reference detected while serializing props for <${e.displayName} client:${e.hydrate}>!

Cyclic references cannot be safely serialized for client-side usage. Please remove the cyclic reference.`);t.add(s);const n=s.map(i=>Gf(i,e,t));return t.delete(s),n}function Vf(s,e={},t=new WeakSet){if(t.has(s))throw new Error(`Cyclic reference detected while serializing props for <${e.displayName} client:${e.hydrate}>!

Cyclic references cannot be safely serialized for client-side usage. Please remove the cyclic reference.`);t.add(s);const n=Object.fromEntries(Object.entries(s).map(([i,r])=>[i,Gf(r,e,t)]));return t.delete(s),n}function Gf(s,e={},t=new WeakSet){switch(Object.prototype.toString.call(s)){case"[object Date]":return[yn.Date,s.toISOString()];case"[object RegExp]":return[yn.RegExp,s.source];case"[object Map]":return[yn.Map,ul(Array.from(s),e,t)];case"[object Set]":return[yn.Set,ul(Array.from(s),e,t)];case"[object BigInt]":return[yn.BigInt,s.toString()];case"[object URL]":return[yn.URL,s.toString()];case"[object Array]":return[yn.JSON,ul(s,e,t)];case"[object Uint8Array]":return[yn.Uint8Array,Array.from(s)];case"[object Uint16Array]":return[yn.Uint16Array,Array.from(s)];case"[object Uint32Array]":return[yn.Uint32Array,Array.from(s)];default:return s!==null&&typeof s=="object"?[yn.Value,Vf(s,e,t)]:s===void 0?[yn.Value]:[yn.Value,s]}}function Wf(s,e){return JSON.stringify(Vf(s,e))}const cv=Object.freeze(["data-astro-transition-scope","data-astro-transition-persist"]);function uv(s,e){let t={isPage:!1,hydration:null,props:{}};for(const[n,i]of Object.entries(s))if(n.startsWith("server:")&&n==="server:root"&&(t.isPage=!0),n.startsWith("client:"))switch(t.hydration||(t.hydration={directive:"",value:"",componentUrl:"",componentExport:{value:""}}),n){case"client:component-path":{t.hydration.componentUrl=i;break}case"client:component-export":{t.hydration.componentExport.value=i;break}case"client:component-hydration":break;case"client:display-name":break;default:{if(t.hydration.directive=n.split(":")[1],t.hydration.value=i,!e.has(t.hydration.directive)){const r=Array.from(e.keys()).map(o=>`client:${o}`).join(", ");throw new Error(`Error: invalid hydration directive "${n}". Supported hydration methods: ${r}`)}if(t.hydration.directive==="media"&&typeof t.hydration.value!="string")throw new Ss(Wg);break}}else n==="class:list"?i&&(t.props[n.slice(0,-5)]=kf(i)):t.props[n]=i;for(const n of Object.getOwnPropertySymbols(s))t.props[n]=s[n];return t}async function hv(s,e){const{renderer:t,result:n,astroId:i,props:r,attrs:o}=s,{hydrate:a,componentUrl:c,componentExport:u}=e;if(!u.value)throw new Error(`Unable to resolve a valid export for "${e.displayName}"! Please open an issue at https://astro.build/issues!`);const d={children:"",props:{uid:i}};if(o)for(const[h,f]of Object.entries(o))d.props[h]=da(f);d.props["component-url"]=await n.resolve(decodeURI(c)),t.clientEntrypoint&&(d.props["component-export"]=u.value,d.props["renderer-url"]=await n.resolve(decodeURI(t.clientEntrypoint)),d.props.props=da(Wf(r,e))),d.props.ssr="",d.props.client=a;let l=await n.resolve("astro:scripts/before-hydration.js");return l.length&&(d.props["before-hydration-url"]=l),d.props.opts=da(JSON.stringify({name:e.displayName,value:e.hydrateArgs||""})),cv.forEach(h=>{r[h]&&(d.props[h]=r[h])}),d}/**
 * shortdash - https://github.com/bibig/node-shorthash
 *
 * @license
 *
 * (The MIT License)
 *
 * Copyright (c) 2013 Bibig <bibig@me.com>
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */const pc="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXY",hl=pc.length;function dv(s){let e=0;if(s.length===0)return e;for(let t=0;t<s.length;t++){const n=s.charCodeAt(t);e=(e<<5)-e+n,e=e&e}return e}function fv(s){let e,t="",n=dv(s);const i=n<0?"Z":"";for(n=Math.abs(n);n>=hl;)e=n%hl,n=Math.floor(n/hl),t=pc[e]+t;return n>0&&(t=pc[n]+t),i+t}function pv(s){return s==null?!1:s.isAstroComponentFactory===!0}function mv(s,e){let t=e.propagation||"none";return e.moduleId&&s.componentMetadata.has(e.moduleId)&&t==="none"&&(t=s.componentMetadata.get(e.moduleId).propagation),t==="in-tree"||t==="self"}const jf=Symbol.for("astro.headAndContent");function gv(s){return typeof s=="object"&&!!s[jf]}function vv(s,e){return{[jf]:!0,head:s,content:e}}var _v='(()=>{var d;{let p={0:t=>u(t),1:t=>l(t),2:t=>new RegExp(t),3:t=>new Date(t),4:t=>new Map(l(t)),5:t=>new Set(l(t)),6:t=>BigInt(t),7:t=>new URL(t),8:t=>new Uint8Array(t),9:t=>new Uint16Array(t),10:t=>new Uint32Array(t)},h=t=>{let[e,n]=t;return e in p?p[e](n):void 0},l=t=>t.map(h),u=t=>typeof t!="object"||t===null?t:Object.fromEntries(Object.entries(t).map(([e,n])=>[e,h(n)]));customElements.get("astro-island")||customElements.define("astro-island",(d=class extends HTMLElement{constructor(){super(...arguments);this.hydrate=async()=>{var i;if(!this.hydrator||!this.isConnected)return;let e=(i=this.parentElement)==null?void 0:i.closest("astro-island[ssr]");if(e){e.addEventListener("astro:hydrate",this.hydrate,{once:!0});return}let n=this.querySelectorAll("astro-slot"),o={},a=this.querySelectorAll("template[data-astro-template]");for(let r of a){let s=r.closest(this.tagName);s!=null&&s.isSameNode(this)&&(o[r.getAttribute("data-astro-template")||"default"]=r.innerHTML,r.remove())}for(let r of n){let s=r.closest(this.tagName);s!=null&&s.isSameNode(this)&&(o[r.getAttribute("name")||"default"]=r.innerHTML)}let c;try{c=this.hasAttribute("props")?u(JSON.parse(this.getAttribute("props"))):{}}catch(r){let s=this.getAttribute("component-url")||"<unknown>",y=this.getAttribute("component-export");throw y&&(s+=` (export ${y})`),console.error(`[hydrate] Error parsing props for component ${s}`,this.getAttribute("props"),r),r}await this.hydrator(this)(this.Component,c,o,{client:this.getAttribute("client")}),this.removeAttribute("ssr"),this.dispatchEvent(new CustomEvent("astro:hydrate"))}}connectedCallback(){!this.hasAttribute("await-children")||this.firstChild?this.childrenConnectedCallback():new MutationObserver((e,n)=>{n.disconnect(),setTimeout(()=>this.childrenConnectedCallback(),0)}).observe(this,{childList:!0})}async childrenConnectedCallback(){let e=this.getAttribute("before-hydration-url");e&&await import(e),this.start()}start(){let e=JSON.parse(this.getAttribute("opts")),n=this.getAttribute("client");if(Astro[n]===void 0){window.addEventListener(`astro:${n}`,()=>this.start(),{once:!0});return}Astro[n](async()=>{let o=this.getAttribute("renderer-url"),[a,{default:c}]=await Promise.all([import(this.getAttribute("component-url")),o?import(o):()=>()=>{}]),i=this.getAttribute("component-export")||"default";if(!i.includes("."))this.Component=a[i];else{this.Component=a;for(let r of i.split("."))this.Component=this.Component[r]}return this.hydrator=c,this.hydrate},e,this)}attributeChangedCallback(){this.hydrate()}},d.observedAttributes=["props"],d))}})();';const xv="<style>astro-island,astro-slot,astro-static-slot{display:contents}</style>";function yv(s){return s._metadata.hasHydrationScript?!1:s._metadata.hasHydrationScript=!0}function Sv(s,e){return s._metadata.hasDirectives.has(e)?!1:(s._metadata.hasDirectives.add(e),!0)}function Zu(s,e){const n=s.clientDirectives.get(e);if(!n)throw new Error(`Unknown directive: ${e}`);return n}function bv(s,e,t){switch(e){case"both":return`${xv}<script>${Zu(s,t)};${_v}<\/script>`;case"directive":return`<script>${Zu(s,t)}<\/script>`}return""}const Xf=/^(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/i,Mv=/^(allowfullscreen|async|autofocus|autoplay|controls|default|defer|disabled|disablepictureinpicture|disableremoteplayback|formnovalidate|hidden|loop|nomodule|novalidate|open|playsinline|readonly|required|reversed|scoped|seamless|itemscope)$/i,Ev=/^(contenteditable|draggable|spellcheck|value)$/i,wv=/^(autoReverse|externalResourcesRequired|focusable|preserveAlpha)$/i,Tv=new Set(["set:html","set:text"]),Av=s=>s.trim().replace(/(?:(?!^)\b\w|\s+|[^\w]+)/g,(e,t)=>/[^\w]|\s/.test(e)?"":t===0?e:e.toUpperCase()),Js=(s,e=!0)=>e?String(s).replace(/&/g,"&#38;").replace(/"/g,"&#34;"):s,dl=s=>s.toLowerCase()===s?s:s.replace(/[A-Z]/g,e=>`-${e.toLowerCase()}`),Ju=s=>Object.entries(s).map(([e,t])=>e[0]!=="-"&&e[1]!=="-"?`${dl(e)}:${t}`:dl(e)!==e?`${dl(e)}:var(${e});${e}:${t}`:`${e}:${t}`).join(";");function Dv(s){var e;let t="";for(const[n,i]of Object.entries(s))t+=`const ${Av(n)} = ${(e=JSON.stringify(i))==null?void 0:e.replace(/<\/script>/g,"\\x3C/script>")};
`;return Lt(t)}function Qu(s){return s.length===1?s[0]:`${s.slice(0,-1).join(", ")} or ${s[s.length-1]}`}function Cv(s,e,t=!0){if(s==null)return"";if(s===!1)return Ev.test(e)||wv.test(e)?Lt(` ${e}="false"`):"";if(Tv.has(e))return console.warn(`[astro] The "${e}" directive cannot be applied dynamically at runtime. It will not be rendered as an attribute.

Make sure to use the static attribute syntax (\`${e}={value}\`) instead of the dynamic spread syntax (\`{...{ "${e}": value }}\`).`),"";if(e==="class:list"){const n=Js(kf(s),t);return n===""?"":Lt(` ${e.slice(0,-5)}="${n}"`)}if(e==="style"&&!(s instanceof ya)){if(Array.isArray(s)&&s.length===2)return Lt(` ${e}="${Js(`${Ju(s[0])};${s[1]}`,t)}"`);if(typeof s=="object")return Lt(` ${e}="${Js(Ju(s),t)}"`)}return e==="className"?Lt(` class="${Js(s,t)}"`):s===!0&&(e.startsWith("data-")||Mv.test(e))?Lt(` ${e}`):Lt(` ${e}="${Js(s,t)}"`)}function mc(s,e=!0){let t="";for(const[n,i]of Object.entries(s))t+=Cv(i,n,e);return Lt(t)}function Wi(s,{props:e,children:t=""},n=!0){const{lang:i,"data-astro-id":r,"define:vars":o,...a}=e;return o&&(s==="style"&&(delete a["is:global"],delete a["is:scoped"]),s==="script"&&(delete a.hoist,t=Dv(o)+`
`+t)),(t==null||t=="")&&Xf.test(s)?`<${s}${mc(a,n)} />`:`<${s}${mc(a,n)}>${t}</${s}>`}function $f(s){const e=[],t={write:i=>e.push(i)},n=s(t);return{async renderToFinalDestination(i){for(const r of e)i.write(r);t.write=r=>i.write(r),await n}}}const fl=(s,e,t)=>{const n=JSON.stringify(s.props),i=s.children;return e===t.findIndex(r=>JSON.stringify(r.props)===n&&r.children==i)};function eh(s){s._metadata.hasRenderedHead=!0;const e=Array.from(s.styles).filter(fl).map(r=>r.props.rel==="stylesheet"?Wi("link",r):Wi("style",r));s.styles.clear();const t=Array.from(s.scripts).filter(fl).map(r=>Wi("script",r,!1));let i=Array.from(s.links).filter(fl).map(r=>Wi("link",r,!1)).join(`
`)+e.join(`
`)+t.join(`
`);if(s._metadata.extraHead.length>0)for(const r of s._metadata.extraHead)i+=r;return Lt(i)}const qf=Symbol.for("astro:slot-string");class Yf extends ya{constructor(e,t){super(e),this.instructions=t,this[qf]=!0}}function Rv(s){return!!s[qf]}function Kf(s,e,t){return!e&&t?Kf(s,t):{async render(n){await rr(n,typeof e=="function"?e(s):e)}}}async function Oa(s,e,t){let n="",i=null;const r={write(a){a instanceof Response||(typeof a=="object"&&"type"in a&&typeof a.type=="string"?(i===null&&(i=[]),i.push(a)):n+=Kc(s,a))}};return await Kf(s,e,t).render(r),Lt(new Yf(n,i))}async function Zf(s,e={}){let t=null,n={};return e&&await Promise.all(Object.entries(e).map(([i,r])=>Oa(s,r).then(o=>{o.instructions&&(t===null&&(t=[]),t.push(...o.instructions)),n[i]=o}))),{slotInstructions:t,children:n}}const Pv=Symbol.for("astro:fragment"),th=Symbol.for("astro:renderer");new TextEncoder;const Lv=new TextDecoder;function Jf(s,e){if(lv(e)){const t=e;switch(t.type){case"directive":{const{hydration:n}=t;let i=n&&yv(s),r=n&&Sv(s,n.directive),o=i?"both":r?"directive":null;if(o){let a=bv(s,o,n.directive);return Lt(a)}else return""}case"head":return s._metadata.hasRenderedHead?"":eh(s);case"maybe-head":return s._metadata.hasRenderedHead||s._metadata.headInTree?"":eh(s);default:throw new Error(`Unknown chunk type: ${e.type}`)}}else{if(e instanceof Response)return"";if(Rv(e)){let t="";const n=e;if(n.instructions)for(const i of n.instructions)t+=Jf(s,i);return t+=e.toString(),t}}return e.toString()}function Kc(s,e){return ArrayBuffer.isView(e)?Lv.decode(e):Jf(s,e)}function Iv(s){return!!s&&typeof s=="object"&&"render"in s&&typeof s.render=="function"}async function rr(s,e){if(e=await e,e instanceof Yf)s.write(e);else if(sv(e))s.write(e);else if(Array.isArray(e)){const t=e.map(n=>$f(i=>rr(i,n)));for(const n of t)await n.renderToFinalDestination(s)}else if(typeof e=="function")await rr(s,e());else if(typeof e=="string")s.write(Lt(da(e)));else if(!(!e&&e!==0))if(Iv(e))await e.render(s);else if(Bv(e))await e.render(s);else if(Ov(e))await e.render(s);else if(ArrayBuffer.isView(e))s.write(e);else if(typeof e=="object"&&(Symbol.asyncIterator in e||Symbol.iterator in e))for await(const t of e)await rr(s,t);else s.write(e)}var Qf;const ep=Symbol.for("astro.componentInstance");class Uv{constructor(e,t,n,i){this[Qf]=!0,this.result=e,this.props=t,this.factory=i,this.slotValues={};for(const r in n){const o=n[r](e);this.slotValues[r]=()=>o}}async init(e){return this.returnValue!==void 0?this.returnValue:(this.returnValue=this.factory(e,this.props,this.slotValues),this.returnValue)}async render(e){this.returnValue===void 0&&await this.init(this.result);let t=this.returnValue;Yc(t)&&(t=await t),gv(t)?await t.content.render(e):await rr(e,t)}}Qf=ep;function Fv(s,e){if(s!=null)for(const t of Object.keys(s))t.startsWith("client:")&&console.warn(`You are attempting to render <${e} ${t} />, but ${e} is an Astro component. Astro components do not render in the client and should not have a hydration directive. Please use a framework component for client rendering.`)}function Nv(s,e,t,n,i={}){Fv(n,e);const r=new Uv(s,n,i,t);return mv(s,t)&&!s._metadata.propagators.has(t)&&s._metadata.propagators.set(t,r),r}function Ov(s){return typeof s=="object"&&!!s[ep]}var tp;const np=Symbol.for("astro.renderTemplateResult");class kv{constructor(e,t){this[tp]=!0,this.htmlParts=e,this.error=void 0,this.expressions=t.map(n=>Yc(n)?Promise.resolve(n).catch(i=>{if(!this.error)throw this.error=i,i}):n)}async render(e){const t=this.expressions.map(n=>$f(i=>{if(n||n===0)return rr(i,n)}));for(let n=0;n<this.htmlParts.length;n++){const i=this.htmlParts[n],r=t[n];e.write(Lt(i)),r&&await r.renderToFinalDestination(e)}}}tp=np;function Bv(s){return typeof s=="object"&&!!s[np]}function ip(s,...e){return new kv(s,e)}function zv(s){return typeof HTMLElement<"u"&&HTMLElement.isPrototypeOf(s)}async function Hv(s,e,t,n){const i=Vv(e);let r="";for(const o in t)r+=` ${o}="${Js(await t[o])}"`;return Lt(`<${i}${r}>${await Oa(s,n?.default)}</${i}>`)}function Vv(s){const e=customElements.getName(s);return e||s.name.replace(/^HTML|Element$/g,"").replace(/[A-Z]/g,"-$&").toLowerCase().replace(/^-/,"html-")}const nh=new Map([["solid","solid-js"]]);function Gv(s){switch(s?.split(".").pop()){case"svelte":return["@astrojs/svelte"];case"vue":return["@astrojs/vue"];case"jsx":case"tsx":return["@astrojs/react","@astrojs/preact","@astrojs/solid-js","@astrojs/vue (jsx)"];default:return["@astrojs/react","@astrojs/preact","@astrojs/solid-js","@astrojs/vue","@astrojs/svelte","@astrojs/lit"]}}function Wv(s){return s===Pv}function jv(s){return s&&s["astro:html"]===!0}const Xv=/\<\/?astro-slot\b[^>]*>/g,$v=/\<\/?astro-static-slot\b[^>]*>/g;function qv(s,e){const t=e?$v:Xv;return s.replace(t,"")}async function Yv(s,e,t,n,i={}){var r,o,a;if(!t&&!n["client:only"])throw new Error(`Unable to render ${e} because it is ${t}!
Did you forget to import the component or is it possible there is a typo?`);const{renderers:c,clientDirectives:u}=s,d={astroStaticSlot:!0,displayName:e},{hydration:l,isPage:h,props:f}=uv(n,u);let g="",v;l&&(d.hydrate=l.directive,d.hydrateArgs=l.value,d.componentExport=l.componentExport,d.componentUrl=l.componentUrl);const m=Gv(d.componentUrl),p=c.filter(y=>y.name!=="astro:jsx"),{children:x,slotInstructions:_}=await Zf(s,i);let S;if(d.hydrate!=="only"){let y=!1;try{y=t&&t[th]}catch{}if(y){const b=t[th];S=c.find(({name:U})=>U===b)}if(!S){let b;for(const U of c)try{if(await U.ssr.check.call({result:s},t,f,x)){S=U;break}}catch(z){b??=z}if(!S&&b)throw b}if(!S&&typeof HTMLElement=="function"&&zv(t)){const b=await Hv(s,t,n,i);return{render(U){U.write(b)}}}}else{if(d.hydrateArgs){const y=d.hydrateArgs,b=nh.has(y)?nh.get(y):y;S=c.find(({name:U})=>U===`@astrojs/${b}`||U===b)}if(!S&&p.length===1&&(S=p[0]),!S){const y=(r=d.componentUrl)==null?void 0:r.split(".").pop();S=c.filter(({name:b})=>b===`@astrojs/${y}`||b===y)[0]}}if(S)d.hydrate==="only"?g=await Oa(s,i?.fallback):{html:g,attrs:v}=await S.ssr.renderToStaticMarkup.call({result:s},t,f,x,d);else{if(d.hydrate==="only")throw new Ss({...cl,message:cl.message(d.displayName),hint:cl.hint(m.map(y=>y.replace("@astrojs/","")).join("|"))});if(typeof t!="string"){const y=p.filter(U=>m.includes(U.name)),b=p.length>1;if(y.length===0)throw new Ss({...ll,message:ll.message(d.displayName,(o=d?.componentUrl)==null?void 0:o.split(".").pop(),b,p.length),hint:ll.hint(Qu(m.map(U=>"`"+U+"`")))});if(y.length===1)S=y[0],{html:g,attrs:v}=await S.ssr.renderToStaticMarkup.call({result:s},t,f,x,d);else throw new Error(`Unable to render ${d.displayName}!

This component likely uses ${Qu(m)},
but Astro encountered an error during server-side rendering.

Please ensure that ${d.displayName}:
1. Does not unconditionally access browser-specific globals like \`window\` or \`document\`.
   If this is unavoidable, use the \`client:only\` hydration directive.
2. Does not conditionally return \`null\` or \`undefined\` when rendered on the server.

If you're still stuck, please open an issue on GitHub or join us at https://astro.build/chat.`)}}if(S&&!S.clientEntrypoint&&S.name!=="@astrojs/lit"&&d.hydrate)throw new Ss({...$u,message:$u.message(e,d.hydrate,S.name)});if(!g&&typeof t=="string"){const y=Kv(t),b=Object.values(x).join(""),U=ip`<${y}${mc(f)}${Lt(b===""&&Xf.test(y)?"/>":`>${b}</${y}>`)}`;g="";const z={write(P){P instanceof Response||(g+=Kc(s,P))}};await U.render(z)}if(!l)return{render(y){var b;if(_)for(const U of _)y.write(U);h||S?.name==="astro:jsx"?y.write(g):g&&g.length>0&&y.write(Lt(qv(g,((b=S?.ssr)==null?void 0:b.supportsAstroStaticSlot)??!1)))}};const M=fv(`<!--${d.componentExport.value}:${d.componentUrl}-->
${g}
${Wf(f,d)}`),E=await hv({renderer:S,result:s,astroId:M,props:f,attrs:v},d);let w=[];if(g){if(Object.keys(x).length>0)for(const y of Object.keys(x)){let b=(a=S?.ssr)!=null&&a.supportsAstroStaticSlot?d.hydrate?"astro-slot":"astro-static-slot":"astro-slot",U=y==="default"?`<${b}>`:`<${b} name="${y}">`;g.includes(U)||w.push(y)}}else w=Object.keys(x);const C=w.length>0?w.map(y=>`<template data-astro-template${y!=="default"?`="${y}"`:""}>${x[y]}</template>`).join(""):"";return E.children=`${g??""}${C}`,E.children&&(E.props["await-children"]=""),{render(y){if(_)for(const b of _)y.write(b);y.write(av({type:"directive",hydration:l})),y.write(Lt(Wi("astro-island",E,!1)))}}}function Kv(s){const e=/[&<>'"\s]+/g;return e.test(s)?s.trim().split(e)[0].trim():s}async function Zv(s,e={}){const t=await Oa(s,e?.default);return{render(n){t!=null&&n.write(t)}}}async function Jv(s,e,t,n={}){const{slotInstructions:i,children:r}=await Zf(s,n),o=e({slots:r}),a=i?i.map(c=>Kc(s,c)).join(""):"";return{render(c){c.write(Lt(a+o))}}}function Qv(s,e,t,n,i={}){const r=Nv(s,e,t,n,i);return{async render(o){await r.render(o)}}}async function e_(s,e,t,n,i={}){return Yc(t)&&(t=await t),Wv(t)?await Zv(s,i):jv(t)?await Jv(s,t,n,i):pv(t)?Qv(s,e,t,n,i):await Yv(s,e,t,n,i)}typeof process=="object"&&Object.prototype.toString.call(process);function t_({props:s,children:e}){return Wi("script",{props:s,children:e})}function ih(s,e){if(e.type==="external")return Array.from(s.styles).some(t=>t.props.href===e.src)?"":Wi("link",{props:{rel:"stylesheet",href:e.src},children:""});if(e.type==="inline")return Array.from(s.styles).some(t=>t.children.includes(e.content))?"":Wi("style",{props:{type:"text/css"},children:e.content})}function ka({globResult:s,contentDir:e}){const t={};for(const n in s){const r=n.replace(new RegExp(`^${e}`),"").split("/");if(r.length<=1)continue;const o=r[0];t[o]??={},t[o][n]=s[n]}return t}const pl=new Map;function n_({contentCollectionToEntryMap:s,dataCollectionToEntryMap:e,getRenderEntryImport:t}){return async function(i,r){let o;if(i in s)o="content";else if(i in e)o="data";else throw new Ss({...Yu,message:Yu.message(i)});const a=Object.values(o==="content"?s[i]:e[i]);let c=[];return pl.has(i)?c=[...pl.get(i)]:(c=await Promise.all(a.map(async u=>{const d=await u();return o==="content"?{id:d.id,slug:d.slug,body:d.body,collection:d.collection,data:d.data,async render(){return i_({collection:d.collection,id:d.id,renderEntryImport:await t(i,d.slug)})}}:{id:d.id,collection:d.collection,data:d.data}})),pl.set(i,c)),typeof r=="function"?c.filter(r):c}}async function i_({collection:s,id:e,renderEntryImport:t}){var n,i;const r=new Ss({...jg,message:`Unexpected error while rendering ${String(s)} → ${String(e)}.`});if(typeof t!="function")throw r;const o=await t();if(o==null||typeof o!="object")throw r;const{default:a}=o;if(s_(a)){const{collectedStyles:c,collectedLinks:u,collectedScripts:d,getMod:l}=a;if(typeof l!="function")throw r;const h=await l();if(h==null||typeof h!="object")throw r;return{Content:Zg({factory(g,v,m){let p="",x="",_="";Array.isArray(c)&&(p=c.map(M=>ih(g,{type:"inline",content:M})).join("")),Array.isArray(u)&&(x=u.map(M=>ih(g,{type:"external",src:qg(M)})).join("")),Array.isArray(d)&&(_=d.map(M=>t_(M)).join(""));let S=v;return e.endsWith("mdx")&&(S={components:h.components??{},...v}),vv(lo(p+x+_),ip`${e_(g,"Content",h.Content,S,m)}`)},propagation:"self"}),headings:((n=h.getHeadings)==null?void 0:n.call(h))??[],remarkPluginFrontmatter:h.frontmatter??{}}}else{if(o.Content&&typeof o.Content=="function")return{Content:o.Content,headings:((i=o.getHeadings)==null?void 0:i.call(o))??[],remarkPluginFrontmatter:o.frontmatter??{}};throw r}}function s_(s){return typeof s=="object"&&s!=null&&"__astroPropagation"in s}const Ba="/src/content/",sp=Object.assign({}),r_=ka({globResult:sp,contentDir:Ba}),rp=Object.assign({"/src/content/awards/awwwards.json":()=>Rt(()=>import("../_astro/awwwards.f57747d4.js"),[]),"/src/content/awards/cssda.json":()=>Rt(()=>import("../_astro/cssda.36c0ad7c.js"),[]),"/src/content/awards/fwa.json":()=>Rt(()=>import("../_astro/fwa.e05f4dee.js"),[]),"/src/content/awards/webby.json":()=>Rt(()=>import("../_astro/webby.55e71982.js"),[]),"/src/content/projects/Welcome-to-berk.json":()=>Rt(()=>import("../_astro/Welcome-to-berk.25cf317a.js"),[]),"/src/content/projects/demorgen.json":()=>Rt(()=>import("../_astro/demorgen.a7475516.js"),[]),"/src/content/projects/engaged.json":()=>Rt(()=>import("../_astro/engaged.c59d4592.js"),[]),"/src/content/projects/filmsecession.json":()=>Rt(()=>import("../_astro/filmsecession.2a234beb.js"),[]),"/src/content/projects/following-wildfire.json":()=>Rt(()=>import("../_astro/following-wildfire.944dbc9d.js"),[]),"/src/content/projects/gc-2026.json":()=>Rt(()=>import("../_astro/gc-2026.dac218e0.js"),[]),"/src/content/projects/glenncatteeuw.json":()=>Rt(()=>import("../_astro/glenncatteeuw.069c1d18.js"),[]),"/src/content/projects/hashgraph-vc.json":()=>Rt(()=>import("../_astro/hashgraph-vc.d0a40838.js"),[]),"/src/content/projects/metropolis.json":()=>Rt(()=>import("../_astro/metropolis.8aefda9e.js"),[]),"/src/content/projects/omega.json":()=>Rt(()=>import("../_astro/omega.eb96563a.js"),[]),"/src/content/projects/poppr.json":()=>Rt(()=>import("../_astro/poppr.70b66477.js"),[]),"/src/content/projects/spritexmarvel.json":()=>Rt(()=>import("../_astro/spritexmarvel.dbb5faf0.js"),[]),"/src/content/projects/theroger.json":()=>Rt(()=>import("../_astro/theroger.814982b8.js"),[]),"/src/content/projects/thoughtlab.json":()=>Rt(()=>import("../_astro/thoughtlab.b537f406.js"),[])}),o_=ka({globResult:rp,contentDir:Ba});ka({globResult:{...sp,...rp},contentDir:Ba});let op={};op={awards:{type:"data",entries:{awwwards:"/src/content/awards/awwwards.json",cssda:"/src/content/awards/cssda.json",fwa:"/src/content/awards/fwa.json",webby:"/src/content/awards/webby.json"}},projects:{type:"data",entries:{"Welcome-to-berk":"/src/content/projects/Welcome-to-berk.json",demorgen:"/src/content/projects/demorgen.json",engaged:"/src/content/projects/engaged.json",filmsecession:"/src/content/projects/filmsecession.json","following-wildfire":"/src/content/projects/following-wildfire.json","gc-2026":"/src/content/projects/gc-2026.json",glenncatteeuw:"/src/content/projects/glenncatteeuw.json","hashgraph-vc":"/src/content/projects/hashgraph-vc.json",metropolis:"/src/content/projects/metropolis.json",omega:"/src/content/projects/omega.json",poppr:"/src/content/projects/poppr.json",spritexmarvel:"/src/content/projects/spritexmarvel.json",theroger:"/src/content/projects/theroger.json",thoughtlab:"/src/content/projects/thoughtlab.json"}}};function a_(s){return async(e,t)=>{const n=op[e]?.entries[t];if(n)return s[e][n]}}const l_=Object.assign({}),c_=ka({globResult:l_,contentDir:Ba}),gc=n_({contentCollectionToEntryMap:r_,dataCollectionToEntryMap:o_,getRenderEntryImport:a_(c_)});class Le{static DEBUG=/[?&]debug/.test(location.search);static STUDIO=/[?&]studio/.test(location.search);static DEV=!1;static SOUND=!1;static GPU_TIER=3;static MOBILE=!1;static LOW_RES=!1;static BREAKPOINTS={MD:800,LG:1e3,XL:1280,XXL:1450,XXXL:2e3}}var Br=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function u_(s){return s&&s.__esModule&&Object.prototype.hasOwnProperty.call(s,"default")?s.default:s}var zi={};/*!
 *  howler.js v2.2.4
 *  howlerjs.com
 *
 *  (c) 2013-2020, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */(function(s){(function(){var e=function(){this.init()};e.prototype={init:function(){var l=this||t;return l._counter=1e3,l._html5AudioPool=[],l.html5PoolSize=10,l._codecs={},l._howls=[],l._muted=!1,l._volume=1,l._canPlayEvent="canplaythrough",l._navigator=typeof window<"u"&&window.navigator?window.navigator:null,l.masterGain=null,l.noAudio=!1,l.usingWebAudio=!0,l.autoSuspend=!0,l.ctx=null,l.autoUnlock=!0,l._setup(),l},volume:function(l){var h=this||t;if(l=parseFloat(l),h.ctx||d(),typeof l<"u"&&l>=0&&l<=1){if(h._volume=l,h._muted)return h;h.usingWebAudio&&h.masterGain.gain.setValueAtTime(l,t.ctx.currentTime);for(var f=0;f<h._howls.length;f++)if(!h._howls[f]._webAudio)for(var g=h._howls[f]._getSoundIds(),v=0;v<g.length;v++){var m=h._howls[f]._soundById(g[v]);m&&m._node&&(m._node.volume=m._volume*l)}return h}return h._volume},mute:function(l){var h=this||t;h.ctx||d(),h._muted=l,h.usingWebAudio&&h.masterGain.gain.setValueAtTime(l?0:h._volume,t.ctx.currentTime);for(var f=0;f<h._howls.length;f++)if(!h._howls[f]._webAudio)for(var g=h._howls[f]._getSoundIds(),v=0;v<g.length;v++){var m=h._howls[f]._soundById(g[v]);m&&m._node&&(m._node.muted=l?!0:m._muted)}return h},stop:function(){for(var l=this||t,h=0;h<l._howls.length;h++)l._howls[h].stop();return l},unload:function(){for(var l=this||t,h=l._howls.length-1;h>=0;h--)l._howls[h].unload();return l.usingWebAudio&&l.ctx&&typeof l.ctx.close<"u"&&(l.ctx.close(),l.ctx=null,d()),l},codecs:function(l){return(this||t)._codecs[l.replace(/^x-/,"")]},_setup:function(){var l=this||t;if(l.state=l.ctx&&l.ctx.state||"suspended",l._autoSuspend(),!l.usingWebAudio)if(typeof Audio<"u")try{var h=new Audio;typeof h.oncanplaythrough>"u"&&(l._canPlayEvent="canplay")}catch{l.noAudio=!0}else l.noAudio=!0;try{var h=new Audio;h.muted&&(l.noAudio=!0)}catch{}return l.noAudio||l._setupCodecs(),l},_setupCodecs:function(){var l=this||t,h=null;try{h=typeof Audio<"u"?new Audio:null}catch{return l}if(!h||typeof h.canPlayType!="function")return l;var f=h.canPlayType("audio/mpeg;").replace(/^no$/,""),g=l._navigator?l._navigator.userAgent:"",v=g.match(/OPR\/(\d+)/g),m=v&&parseInt(v[0].split("/")[1],10)<33,p=g.indexOf("Safari")!==-1&&g.indexOf("Chrome")===-1,x=g.match(/Version\/(.*?) /),_=p&&x&&parseInt(x[1],10)<15;return l._codecs={mp3:!!(!m&&(f||h.canPlayType("audio/mp3;").replace(/^no$/,""))),mpeg:!!f,opus:!!h.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/,""),ogg:!!h.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,""),oga:!!h.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,""),wav:!!(h.canPlayType('audio/wav; codecs="1"')||h.canPlayType("audio/wav")).replace(/^no$/,""),aac:!!h.canPlayType("audio/aac;").replace(/^no$/,""),caf:!!h.canPlayType("audio/x-caf;").replace(/^no$/,""),m4a:!!(h.canPlayType("audio/x-m4a;")||h.canPlayType("audio/m4a;")||h.canPlayType("audio/aac;")).replace(/^no$/,""),m4b:!!(h.canPlayType("audio/x-m4b;")||h.canPlayType("audio/m4b;")||h.canPlayType("audio/aac;")).replace(/^no$/,""),mp4:!!(h.canPlayType("audio/x-mp4;")||h.canPlayType("audio/mp4;")||h.canPlayType("audio/aac;")).replace(/^no$/,""),weba:!!(!_&&h.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/,"")),webm:!!(!_&&h.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/,"")),dolby:!!h.canPlayType('audio/mp4; codecs="ec-3"').replace(/^no$/,""),flac:!!(h.canPlayType("audio/x-flac;")||h.canPlayType("audio/flac;")).replace(/^no$/,"")},l},_unlockAudio:function(){var l=this||t;if(!(l._audioUnlocked||!l.ctx)){l._audioUnlocked=!1,l.autoUnlock=!1,!l._mobileUnloaded&&l.ctx.sampleRate!==44100&&(l._mobileUnloaded=!0,l.unload()),l._scratchBuffer=l.ctx.createBuffer(1,1,22050);var h=function(f){for(;l._html5AudioPool.length<l.html5PoolSize;)try{var g=new Audio;g._unlocked=!0,l._releaseHtml5Audio(g)}catch{l.noAudio=!0;break}for(var v=0;v<l._howls.length;v++)if(!l._howls[v]._webAudio)for(var m=l._howls[v]._getSoundIds(),p=0;p<m.length;p++){var x=l._howls[v]._soundById(m[p]);x&&x._node&&!x._node._unlocked&&(x._node._unlocked=!0,x._node.load())}l._autoResume();var _=l.ctx.createBufferSource();_.buffer=l._scratchBuffer,_.connect(l.ctx.destination),typeof _.start>"u"?_.noteOn(0):_.start(0),typeof l.ctx.resume=="function"&&l.ctx.resume(),_.onended=function(){_.disconnect(0),l._audioUnlocked=!0,document.removeEventListener("touchstart",h,!0),document.removeEventListener("touchend",h,!0),document.removeEventListener("click",h,!0),document.removeEventListener("keydown",h,!0);for(var S=0;S<l._howls.length;S++)l._howls[S]._emit("unlock")}};return document.addEventListener("touchstart",h,!0),document.addEventListener("touchend",h,!0),document.addEventListener("click",h,!0),document.addEventListener("keydown",h,!0),l}},_obtainHtml5Audio:function(){var l=this||t;if(l._html5AudioPool.length)return l._html5AudioPool.pop();var h=new Audio().play();return h&&typeof Promise<"u"&&(h instanceof Promise||typeof h.then=="function")&&h.catch(function(){console.warn("HTML5 Audio pool exhausted, returning potentially locked audio object.")}),new Audio},_releaseHtml5Audio:function(l){var h=this||t;return l._unlocked&&h._html5AudioPool.push(l),h},_autoSuspend:function(){var l=this;if(!(!l.autoSuspend||!l.ctx||typeof l.ctx.suspend>"u"||!t.usingWebAudio)){for(var h=0;h<l._howls.length;h++)if(l._howls[h]._webAudio){for(var f=0;f<l._howls[h]._sounds.length;f++)if(!l._howls[h]._sounds[f]._paused)return l}return l._suspendTimer&&clearTimeout(l._suspendTimer),l._suspendTimer=setTimeout(function(){if(l.autoSuspend){l._suspendTimer=null,l.state="suspending";var g=function(){l.state="suspended",l._resumeAfterSuspend&&(delete l._resumeAfterSuspend,l._autoResume())};l.ctx.suspend().then(g,g)}},3e4),l}},_autoResume:function(){var l=this;if(!(!l.ctx||typeof l.ctx.resume>"u"||!t.usingWebAudio))return l.state==="running"&&l.ctx.state!=="interrupted"&&l._suspendTimer?(clearTimeout(l._suspendTimer),l._suspendTimer=null):l.state==="suspended"||l.state==="running"&&l.ctx.state==="interrupted"?(l.ctx.resume().then(function(){l.state="running";for(var h=0;h<l._howls.length;h++)l._howls[h]._emit("resume")}),l._suspendTimer&&(clearTimeout(l._suspendTimer),l._suspendTimer=null)):l.state==="suspending"&&(l._resumeAfterSuspend=!0),l}};var t=new e,n=function(l){var h=this;if(!l.src||l.src.length===0){console.error("An array of source files must be passed with any new Howl.");return}h.init(l)};n.prototype={init:function(l){var h=this;return t.ctx||d(),h._autoplay=l.autoplay||!1,h._format=typeof l.format!="string"?l.format:[l.format],h._html5=l.html5||!1,h._muted=l.mute||!1,h._loop=l.loop||!1,h._pool=l.pool||5,h._preload=typeof l.preload=="boolean"||l.preload==="metadata"?l.preload:!0,h._rate=l.rate||1,h._sprite=l.sprite||{},h._src=typeof l.src!="string"?l.src:[l.src],h._volume=l.volume!==void 0?l.volume:1,h._xhr={method:l.xhr&&l.xhr.method?l.xhr.method:"GET",headers:l.xhr&&l.xhr.headers?l.xhr.headers:null,withCredentials:l.xhr&&l.xhr.withCredentials?l.xhr.withCredentials:!1},h._duration=0,h._state="unloaded",h._sounds=[],h._endTimers={},h._queue=[],h._playLock=!1,h._onend=l.onend?[{fn:l.onend}]:[],h._onfade=l.onfade?[{fn:l.onfade}]:[],h._onload=l.onload?[{fn:l.onload}]:[],h._onloaderror=l.onloaderror?[{fn:l.onloaderror}]:[],h._onplayerror=l.onplayerror?[{fn:l.onplayerror}]:[],h._onpause=l.onpause?[{fn:l.onpause}]:[],h._onplay=l.onplay?[{fn:l.onplay}]:[],h._onstop=l.onstop?[{fn:l.onstop}]:[],h._onmute=l.onmute?[{fn:l.onmute}]:[],h._onvolume=l.onvolume?[{fn:l.onvolume}]:[],h._onrate=l.onrate?[{fn:l.onrate}]:[],h._onseek=l.onseek?[{fn:l.onseek}]:[],h._onunlock=l.onunlock?[{fn:l.onunlock}]:[],h._onresume=[],h._webAudio=t.usingWebAudio&&!h._html5,typeof t.ctx<"u"&&t.ctx&&t.autoUnlock&&t._unlockAudio(),t._howls.push(h),h._autoplay&&h._queue.push({event:"play",action:function(){h.play()}}),h._preload&&h._preload!=="none"&&h.load(),h},load:function(){var l=this,h=null;if(t.noAudio){l._emit("loaderror",null,"No audio support.");return}typeof l._src=="string"&&(l._src=[l._src]);for(var f=0;f<l._src.length;f++){var g,v;if(l._format&&l._format[f])g=l._format[f];else{if(v=l._src[f],typeof v!="string"){l._emit("loaderror",null,"Non-string found in selected audio sources - ignoring.");continue}g=/^data:audio\/([^;,]+);/i.exec(v),g||(g=/\.([^.]+)$/.exec(v.split("?",1)[0])),g&&(g=g[1].toLowerCase())}if(g||console.warn('No file extension was found. Consider using the "format" property or specify an extension.'),g&&t.codecs(g)){h=l._src[f];break}}if(!h){l._emit("loaderror",null,"No codec support for selected audio sources.");return}return l._src=h,l._state="loading",window.location.protocol==="https:"&&h.slice(0,5)==="http:"&&(l._html5=!0,l._webAudio=!1),new i(l),l._webAudio&&o(l),l},play:function(l,h){var f=this,g=null;if(typeof l=="number")g=l,l=null;else{if(typeof l=="string"&&f._state==="loaded"&&!f._sprite[l])return null;if(typeof l>"u"&&(l="__default",!f._playLock)){for(var v=0,m=0;m<f._sounds.length;m++)f._sounds[m]._paused&&!f._sounds[m]._ended&&(v++,g=f._sounds[m]._id);v===1?l=null:g=null}}var p=g?f._soundById(g):f._inactiveSound();if(!p)return null;if(g&&!l&&(l=p._sprite||"__default"),f._state!=="loaded"){p._sprite=l,p._ended=!1;var x=p._id;return f._queue.push({event:"play",action:function(){f.play(x)}}),x}if(g&&!p._paused)return h||f._loadQueue("play"),p._id;f._webAudio&&t._autoResume();var _=Math.max(0,p._seek>0?p._seek:f._sprite[l][0]/1e3),S=Math.max(0,(f._sprite[l][0]+f._sprite[l][1])/1e3-_),M=S*1e3/Math.abs(p._rate),E=f._sprite[l][0]/1e3,w=(f._sprite[l][0]+f._sprite[l][1])/1e3;p._sprite=l,p._ended=!1;var C=function(){p._paused=!1,p._seek=_,p._start=E,p._stop=w,p._loop=!!(p._loop||f._sprite[l][2])};if(_>=w){f._ended(p);return}var y=p._node;if(f._webAudio){var b=function(){f._playLock=!1,C(),f._refreshBuffer(p);var O=p._muted||f._muted?0:p._volume;y.gain.setValueAtTime(O,t.ctx.currentTime),p._playStart=t.ctx.currentTime,typeof y.bufferSource.start>"u"?p._loop?y.bufferSource.noteGrainOn(0,_,86400):y.bufferSource.noteGrainOn(0,_,S):p._loop?y.bufferSource.start(0,_,86400):y.bufferSource.start(0,_,S),M!==1/0&&(f._endTimers[p._id]=setTimeout(f._ended.bind(f,p),M)),h||setTimeout(function(){f._emit("play",p._id),f._loadQueue()},0)};t.state==="running"&&t.ctx.state!=="interrupted"?b():(f._playLock=!0,f.once("resume",b),f._clearTimer(p._id))}else{var U=function(){y.currentTime=_,y.muted=p._muted||f._muted||t._muted||y.muted,y.volume=p._volume*t.volume(),y.playbackRate=p._rate;try{var O=y.play();if(O&&typeof Promise<"u"&&(O instanceof Promise||typeof O.then=="function")?(f._playLock=!0,C(),O.then(function(){f._playLock=!1,y._unlocked=!0,h?f._loadQueue():f._emit("play",p._id)}).catch(function(){f._playLock=!1,f._emit("playerror",p._id,"Playback was unable to start. This is most commonly an issue on mobile devices and Chrome where playback was not within a user interaction."),p._ended=!0,p._paused=!0})):h||(f._playLock=!1,C(),f._emit("play",p._id)),y.playbackRate=p._rate,y.paused){f._emit("playerror",p._id,"Playback was unable to start. This is most commonly an issue on mobile devices and Chrome where playback was not within a user interaction.");return}l!=="__default"||p._loop?f._endTimers[p._id]=setTimeout(f._ended.bind(f,p),M):(f._endTimers[p._id]=function(){f._ended(p),y.removeEventListener("ended",f._endTimers[p._id],!1)},y.addEventListener("ended",f._endTimers[p._id],!1))}catch(F){f._emit("playerror",p._id,F)}};y.src==="data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA"&&(y.src=f._src,y.load());var z=window&&window.ejecta||!y.readyState&&t._navigator.isCocoonJS;if(y.readyState>=3||z)U();else{f._playLock=!0,f._state="loading";var P=function(){f._state="loaded",U(),y.removeEventListener(t._canPlayEvent,P,!1)};y.addEventListener(t._canPlayEvent,P,!1),f._clearTimer(p._id)}}return p._id},pause:function(l){var h=this;if(h._state!=="loaded"||h._playLock)return h._queue.push({event:"pause",action:function(){h.pause(l)}}),h;for(var f=h._getSoundIds(l),g=0;g<f.length;g++){h._clearTimer(f[g]);var v=h._soundById(f[g]);if(v&&!v._paused&&(v._seek=h.seek(f[g]),v._rateSeek=0,v._paused=!0,h._stopFade(f[g]),v._node))if(h._webAudio){if(!v._node.bufferSource)continue;typeof v._node.bufferSource.stop>"u"?v._node.bufferSource.noteOff(0):v._node.bufferSource.stop(0),h._cleanBuffer(v._node)}else(!isNaN(v._node.duration)||v._node.duration===1/0)&&v._node.pause();arguments[1]||h._emit("pause",v?v._id:null)}return h},stop:function(l,h){var f=this;if(f._state!=="loaded"||f._playLock)return f._queue.push({event:"stop",action:function(){f.stop(l)}}),f;for(var g=f._getSoundIds(l),v=0;v<g.length;v++){f._clearTimer(g[v]);var m=f._soundById(g[v]);m&&(m._seek=m._start||0,m._rateSeek=0,m._paused=!0,m._ended=!0,f._stopFade(g[v]),m._node&&(f._webAudio?m._node.bufferSource&&(typeof m._node.bufferSource.stop>"u"?m._node.bufferSource.noteOff(0):m._node.bufferSource.stop(0),f._cleanBuffer(m._node)):(!isNaN(m._node.duration)||m._node.duration===1/0)&&(m._node.currentTime=m._start||0,m._node.pause(),m._node.duration===1/0&&f._clearSound(m._node))),h||f._emit("stop",m._id))}return f},mute:function(l,h){var f=this;if(f._state!=="loaded"||f._playLock)return f._queue.push({event:"mute",action:function(){f.mute(l,h)}}),f;if(typeof h>"u")if(typeof l=="boolean")f._muted=l;else return f._muted;for(var g=f._getSoundIds(h),v=0;v<g.length;v++){var m=f._soundById(g[v]);m&&(m._muted=l,m._interval&&f._stopFade(m._id),f._webAudio&&m._node?m._node.gain.setValueAtTime(l?0:m._volume,t.ctx.currentTime):m._node&&(m._node.muted=t._muted?!0:l),f._emit("mute",m._id))}return f},volume:function(){var l=this,h=arguments,f,g;if(h.length===0)return l._volume;if(h.length===1||h.length===2&&typeof h[1]>"u"){var v=l._getSoundIds(),m=v.indexOf(h[0]);m>=0?g=parseInt(h[0],10):f=parseFloat(h[0])}else h.length>=2&&(f=parseFloat(h[0]),g=parseInt(h[1],10));var p;if(typeof f<"u"&&f>=0&&f<=1){if(l._state!=="loaded"||l._playLock)return l._queue.push({event:"volume",action:function(){l.volume.apply(l,h)}}),l;typeof g>"u"&&(l._volume=f),g=l._getSoundIds(g);for(var x=0;x<g.length;x++)p=l._soundById(g[x]),p&&(p._volume=f,h[2]||l._stopFade(g[x]),l._webAudio&&p._node&&!p._muted?p._node.gain.setValueAtTime(f,t.ctx.currentTime):p._node&&!p._muted&&(p._node.volume=f*t.volume()),l._emit("volume",p._id))}else return p=g?l._soundById(g):l._sounds[0],p?p._volume:0;return l},fade:function(l,h,f,g){var v=this;if(v._state!=="loaded"||v._playLock)return v._queue.push({event:"fade",action:function(){v.fade(l,h,f,g)}}),v;l=Math.min(Math.max(0,parseFloat(l)),1),h=Math.min(Math.max(0,parseFloat(h)),1),f=parseFloat(f),v.volume(l,g);for(var m=v._getSoundIds(g),p=0;p<m.length;p++){var x=v._soundById(m[p]);if(x){if(g||v._stopFade(m[p]),v._webAudio&&!x._muted){var _=t.ctx.currentTime,S=_+f/1e3;x._volume=l,x._node.gain.setValueAtTime(l,_),x._node.gain.linearRampToValueAtTime(h,S)}v._startFadeInterval(x,l,h,f,m[p],typeof g>"u")}}return v},_startFadeInterval:function(l,h,f,g,v,m){var p=this,x=h,_=f-h,S=Math.abs(_/.01),M=Math.max(4,S>0?g/S:g),E=Date.now();l._fadeTo=f,l._interval=setInterval(function(){var w=(Date.now()-E)/g;E=Date.now(),x+=_*w,x=Math.round(x*100)/100,_<0?x=Math.max(f,x):x=Math.min(f,x),p._webAudio?l._volume=x:p.volume(x,l._id,!0),m&&(p._volume=x),(f<h&&x<=f||f>h&&x>=f)&&(clearInterval(l._interval),l._interval=null,l._fadeTo=null,p.volume(f,l._id),p._emit("fade",l._id))},M)},_stopFade:function(l){var h=this,f=h._soundById(l);return f&&f._interval&&(h._webAudio&&f._node.gain.cancelScheduledValues(t.ctx.currentTime),clearInterval(f._interval),f._interval=null,h.volume(f._fadeTo,l),f._fadeTo=null,h._emit("fade",l)),h},loop:function(){var l=this,h=arguments,f,g,v;if(h.length===0)return l._loop;if(h.length===1)if(typeof h[0]=="boolean")f=h[0],l._loop=f;else return v=l._soundById(parseInt(h[0],10)),v?v._loop:!1;else h.length===2&&(f=h[0],g=parseInt(h[1],10));for(var m=l._getSoundIds(g),p=0;p<m.length;p++)v=l._soundById(m[p]),v&&(v._loop=f,l._webAudio&&v._node&&v._node.bufferSource&&(v._node.bufferSource.loop=f,f&&(v._node.bufferSource.loopStart=v._start||0,v._node.bufferSource.loopEnd=v._stop,l.playing(m[p])&&(l.pause(m[p],!0),l.play(m[p],!0)))));return l},rate:function(){var l=this,h=arguments,f,g;if(h.length===0)g=l._sounds[0]._id;else if(h.length===1){var v=l._getSoundIds(),m=v.indexOf(h[0]);m>=0?g=parseInt(h[0],10):f=parseFloat(h[0])}else h.length===2&&(f=parseFloat(h[0]),g=parseInt(h[1],10));var p;if(typeof f=="number"){if(l._state!=="loaded"||l._playLock)return l._queue.push({event:"rate",action:function(){l.rate.apply(l,h)}}),l;typeof g>"u"&&(l._rate=f),g=l._getSoundIds(g);for(var x=0;x<g.length;x++)if(p=l._soundById(g[x]),p){l.playing(g[x])&&(p._rateSeek=l.seek(g[x]),p._playStart=l._webAudio?t.ctx.currentTime:p._playStart),p._rate=f,l._webAudio&&p._node&&p._node.bufferSource?p._node.bufferSource.playbackRate.setValueAtTime(f,t.ctx.currentTime):p._node&&(p._node.playbackRate=f);var _=l.seek(g[x]),S=(l._sprite[p._sprite][0]+l._sprite[p._sprite][1])/1e3-_,M=S*1e3/Math.abs(p._rate);(l._endTimers[g[x]]||!p._paused)&&(l._clearTimer(g[x]),l._endTimers[g[x]]=setTimeout(l._ended.bind(l,p),M)),l._emit("rate",p._id)}}else return p=l._soundById(g),p?p._rate:l._rate;return l},seek:function(){var l=this,h=arguments,f,g;if(h.length===0)l._sounds.length&&(g=l._sounds[0]._id);else if(h.length===1){var v=l._getSoundIds(),m=v.indexOf(h[0]);m>=0?g=parseInt(h[0],10):l._sounds.length&&(g=l._sounds[0]._id,f=parseFloat(h[0]))}else h.length===2&&(f=parseFloat(h[0]),g=parseInt(h[1],10));if(typeof g>"u")return 0;if(typeof f=="number"&&(l._state!=="loaded"||l._playLock))return l._queue.push({event:"seek",action:function(){l.seek.apply(l,h)}}),l;var p=l._soundById(g);if(p)if(typeof f=="number"&&f>=0){var x=l.playing(g);x&&l.pause(g,!0),p._seek=f,p._ended=!1,l._clearTimer(g),!l._webAudio&&p._node&&!isNaN(p._node.duration)&&(p._node.currentTime=f);var _=function(){x&&l.play(g,!0),l._emit("seek",g)};if(x&&!l._webAudio){var S=function(){l._playLock?setTimeout(S,0):_()};setTimeout(S,0)}else _()}else if(l._webAudio){var M=l.playing(g)?t.ctx.currentTime-p._playStart:0,E=p._rateSeek?p._rateSeek-p._seek:0;return p._seek+(E+M*Math.abs(p._rate))}else return p._node.currentTime;return l},playing:function(l){var h=this;if(typeof l=="number"){var f=h._soundById(l);return f?!f._paused:!1}for(var g=0;g<h._sounds.length;g++)if(!h._sounds[g]._paused)return!0;return!1},duration:function(l){var h=this,f=h._duration,g=h._soundById(l);return g&&(f=h._sprite[g._sprite][1]/1e3),f},state:function(){return this._state},unload:function(){for(var l=this,h=l._sounds,f=0;f<h.length;f++)h[f]._paused||l.stop(h[f]._id),l._webAudio||(l._clearSound(h[f]._node),h[f]._node.removeEventListener("error",h[f]._errorFn,!1),h[f]._node.removeEventListener(t._canPlayEvent,h[f]._loadFn,!1),h[f]._node.removeEventListener("ended",h[f]._endFn,!1),t._releaseHtml5Audio(h[f]._node)),delete h[f]._node,l._clearTimer(h[f]._id);var g=t._howls.indexOf(l);g>=0&&t._howls.splice(g,1);var v=!0;for(f=0;f<t._howls.length;f++)if(t._howls[f]._src===l._src||l._src.indexOf(t._howls[f]._src)>=0){v=!1;break}return r&&v&&delete r[l._src],t.noAudio=!1,l._state="unloaded",l._sounds=[],l=null,null},on:function(l,h,f,g){var v=this,m=v["_on"+l];return typeof h=="function"&&m.push(g?{id:f,fn:h,once:g}:{id:f,fn:h}),v},off:function(l,h,f){var g=this,v=g["_on"+l],m=0;if(typeof h=="number"&&(f=h,h=null),h||f)for(m=0;m<v.length;m++){var p=f===v[m].id;if(h===v[m].fn&&p||!h&&p){v.splice(m,1);break}}else if(l)g["_on"+l]=[];else{var x=Object.keys(g);for(m=0;m<x.length;m++)x[m].indexOf("_on")===0&&Array.isArray(g[x[m]])&&(g[x[m]]=[])}return g},once:function(l,h,f){var g=this;return g.on(l,h,f,1),g},_emit:function(l,h,f){for(var g=this,v=g["_on"+l],m=v.length-1;m>=0;m--)(!v[m].id||v[m].id===h||l==="load")&&(setTimeout(function(p){p.call(this,h,f)}.bind(g,v[m].fn),0),v[m].once&&g.off(l,v[m].fn,v[m].id));return g._loadQueue(l),g},_loadQueue:function(l){var h=this;if(h._queue.length>0){var f=h._queue[0];f.event===l&&(h._queue.shift(),h._loadQueue()),l||f.action()}return h},_ended:function(l){var h=this,f=l._sprite;if(!h._webAudio&&l._node&&!l._node.paused&&!l._node.ended&&l._node.currentTime<l._stop)return setTimeout(h._ended.bind(h,l),100),h;var g=!!(l._loop||h._sprite[f][2]);if(h._emit("end",l._id),!h._webAudio&&g&&h.stop(l._id,!0).play(l._id),h._webAudio&&g){h._emit("play",l._id),l._seek=l._start||0,l._rateSeek=0,l._playStart=t.ctx.currentTime;var v=(l._stop-l._start)*1e3/Math.abs(l._rate);h._endTimers[l._id]=setTimeout(h._ended.bind(h,l),v)}return h._webAudio&&!g&&(l._paused=!0,l._ended=!0,l._seek=l._start||0,l._rateSeek=0,h._clearTimer(l._id),h._cleanBuffer(l._node),t._autoSuspend()),!h._webAudio&&!g&&h.stop(l._id,!0),h},_clearTimer:function(l){var h=this;if(h._endTimers[l]){if(typeof h._endTimers[l]!="function")clearTimeout(h._endTimers[l]);else{var f=h._soundById(l);f&&f._node&&f._node.removeEventListener("ended",h._endTimers[l],!1)}delete h._endTimers[l]}return h},_soundById:function(l){for(var h=this,f=0;f<h._sounds.length;f++)if(l===h._sounds[f]._id)return h._sounds[f];return null},_inactiveSound:function(){var l=this;l._drain();for(var h=0;h<l._sounds.length;h++)if(l._sounds[h]._ended)return l._sounds[h].reset();return new i(l)},_drain:function(){var l=this,h=l._pool,f=0,g=0;if(!(l._sounds.length<h)){for(g=0;g<l._sounds.length;g++)l._sounds[g]._ended&&f++;for(g=l._sounds.length-1;g>=0;g--){if(f<=h)return;l._sounds[g]._ended&&(l._webAudio&&l._sounds[g]._node&&l._sounds[g]._node.disconnect(0),l._sounds.splice(g,1),f--)}}},_getSoundIds:function(l){var h=this;if(typeof l>"u"){for(var f=[],g=0;g<h._sounds.length;g++)f.push(h._sounds[g]._id);return f}else return[l]},_refreshBuffer:function(l){var h=this;return l._node.bufferSource=t.ctx.createBufferSource(),l._node.bufferSource.buffer=r[h._src],l._panner?l._node.bufferSource.connect(l._panner):l._node.bufferSource.connect(l._node),l._node.bufferSource.loop=l._loop,l._loop&&(l._node.bufferSource.loopStart=l._start||0,l._node.bufferSource.loopEnd=l._stop||0),l._node.bufferSource.playbackRate.setValueAtTime(l._rate,t.ctx.currentTime),h},_cleanBuffer:function(l){var h=this,f=t._navigator&&t._navigator.vendor.indexOf("Apple")>=0;if(!l.bufferSource)return h;if(t._scratchBuffer&&l.bufferSource&&(l.bufferSource.onended=null,l.bufferSource.disconnect(0),f))try{l.bufferSource.buffer=t._scratchBuffer}catch{}return l.bufferSource=null,h},_clearSound:function(l){var h=/MSIE |Trident\//.test(t._navigator&&t._navigator.userAgent);h||(l.src="data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA")}};var i=function(l){this._parent=l,this.init()};i.prototype={init:function(){var l=this,h=l._parent;return l._muted=h._muted,l._loop=h._loop,l._volume=h._volume,l._rate=h._rate,l._seek=0,l._paused=!0,l._ended=!0,l._sprite="__default",l._id=++t._counter,h._sounds.push(l),l.create(),l},create:function(){var l=this,h=l._parent,f=t._muted||l._muted||l._parent._muted?0:l._volume;return h._webAudio?(l._node=typeof t.ctx.createGain>"u"?t.ctx.createGainNode():t.ctx.createGain(),l._node.gain.setValueAtTime(f,t.ctx.currentTime),l._node.paused=!0,l._node.connect(t.masterGain)):t.noAudio||(l._node=t._obtainHtml5Audio(),l._errorFn=l._errorListener.bind(l),l._node.addEventListener("error",l._errorFn,!1),l._loadFn=l._loadListener.bind(l),l._node.addEventListener(t._canPlayEvent,l._loadFn,!1),l._endFn=l._endListener.bind(l),l._node.addEventListener("ended",l._endFn,!1),l._node.src=h._src,l._node.preload=h._preload===!0?"auto":h._preload,l._node.volume=f*t.volume(),l._node.load()),l},reset:function(){var l=this,h=l._parent;return l._muted=h._muted,l._loop=h._loop,l._volume=h._volume,l._rate=h._rate,l._seek=0,l._rateSeek=0,l._paused=!0,l._ended=!0,l._sprite="__default",l._id=++t._counter,l},_errorListener:function(){var l=this;l._parent._emit("loaderror",l._id,l._node.error?l._node.error.code:0),l._node.removeEventListener("error",l._errorFn,!1)},_loadListener:function(){var l=this,h=l._parent;h._duration=Math.ceil(l._node.duration*10)/10,Object.keys(h._sprite).length===0&&(h._sprite={__default:[0,h._duration*1e3]}),h._state!=="loaded"&&(h._state="loaded",h._emit("load"),h._loadQueue()),l._node.removeEventListener(t._canPlayEvent,l._loadFn,!1)},_endListener:function(){var l=this,h=l._parent;h._duration===1/0&&(h._duration=Math.ceil(l._node.duration*10)/10,h._sprite.__default[1]===1/0&&(h._sprite.__default[1]=h._duration*1e3),h._ended(l)),l._node.removeEventListener("ended",l._endFn,!1)}};var r={},o=function(l){var h=l._src;if(r[h]){l._duration=r[h].duration,u(l);return}if(/^data:[^;]+;base64,/.test(h)){for(var f=atob(h.split(",")[1]),g=new Uint8Array(f.length),v=0;v<f.length;++v)g[v]=f.charCodeAt(v);c(g.buffer,l)}else{var m=new XMLHttpRequest;m.open(l._xhr.method,h,!0),m.withCredentials=l._xhr.withCredentials,m.responseType="arraybuffer",l._xhr.headers&&Object.keys(l._xhr.headers).forEach(function(p){m.setRequestHeader(p,l._xhr.headers[p])}),m.onload=function(){var p=(m.status+"")[0];if(p!=="0"&&p!=="2"&&p!=="3"){l._emit("loaderror",null,"Failed loading audio file with status: "+m.status+".");return}c(m.response,l)},m.onerror=function(){l._webAudio&&(l._html5=!0,l._webAudio=!1,l._sounds=[],delete r[h],l.load())},a(m)}},a=function(l){try{l.send()}catch{l.onerror()}},c=function(l,h){var f=function(){h._emit("loaderror",null,"Decoding audio data failed.")},g=function(v){v&&h._sounds.length>0?(r[h._src]=v,u(h,v)):f()};typeof Promise<"u"&&t.ctx.decodeAudioData.length===1?t.ctx.decodeAudioData(l).then(g).catch(f):t.ctx.decodeAudioData(l,g,f)},u=function(l,h){h&&!l._duration&&(l._duration=h.duration),Object.keys(l._sprite).length===0&&(l._sprite={__default:[0,l._duration*1e3]}),l._state!=="loaded"&&(l._state="loaded",l._emit("load"),l._loadQueue())},d=function(){if(t.usingWebAudio){try{typeof AudioContext<"u"?t.ctx=new AudioContext:typeof webkitAudioContext<"u"?t.ctx=new webkitAudioContext:t.usingWebAudio=!1}catch{t.usingWebAudio=!1}t.ctx||(t.usingWebAudio=!1);var l=/iP(hone|od|ad)/.test(t._navigator&&t._navigator.platform),h=t._navigator&&t._navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/),f=h?parseInt(h[1],10):null;if(l&&f&&f<9){var g=/safari/.test(t._navigator&&t._navigator.userAgent.toLowerCase());t._navigator&&!g&&(t.usingWebAudio=!1)}t.usingWebAudio&&(t.masterGain=typeof t.ctx.createGain>"u"?t.ctx.createGainNode():t.ctx.createGain(),t.masterGain.gain.setValueAtTime(t._muted?0:t._volume,t.ctx.currentTime),t.masterGain.connect(t.ctx.destination)),t._setup()}};s.Howler=t,s.Howl=n,typeof Br<"u"?(Br.HowlerGlobal=e,Br.Howler=t,Br.Howl=n,Br.Sound=i):typeof window<"u"&&(window.HowlerGlobal=e,window.Howler=t,window.Howl=n,window.Sound=i)})();/*!
 *  Spatial Plugin - Adds support for stereo and 3D audio where Web Audio is supported.
 *  
 *  howler.js v2.2.4
 *  howlerjs.com
 *
 *  (c) 2013-2020, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */(function(){HowlerGlobal.prototype._pos=[0,0,0],HowlerGlobal.prototype._orientation=[0,0,-1,0,1,0],HowlerGlobal.prototype.stereo=function(t){var n=this;if(!n.ctx||!n.ctx.listener)return n;for(var i=n._howls.length-1;i>=0;i--)n._howls[i].stereo(t);return n},HowlerGlobal.prototype.pos=function(t,n,i){var r=this;if(!r.ctx||!r.ctx.listener)return r;if(n=typeof n!="number"?r._pos[1]:n,i=typeof i!="number"?r._pos[2]:i,typeof t=="number")r._pos=[t,n,i],typeof r.ctx.listener.positionX<"u"?(r.ctx.listener.positionX.setTargetAtTime(r._pos[0],Howler.ctx.currentTime,.1),r.ctx.listener.positionY.setTargetAtTime(r._pos[1],Howler.ctx.currentTime,.1),r.ctx.listener.positionZ.setTargetAtTime(r._pos[2],Howler.ctx.currentTime,.1)):r.ctx.listener.setPosition(r._pos[0],r._pos[1],r._pos[2]);else return r._pos;return r},HowlerGlobal.prototype.orientation=function(t,n,i,r,o,a){var c=this;if(!c.ctx||!c.ctx.listener)return c;var u=c._orientation;if(n=typeof n!="number"?u[1]:n,i=typeof i!="number"?u[2]:i,r=typeof r!="number"?u[3]:r,o=typeof o!="number"?u[4]:o,a=typeof a!="number"?u[5]:a,typeof t=="number")c._orientation=[t,n,i,r,o,a],typeof c.ctx.listener.forwardX<"u"?(c.ctx.listener.forwardX.setTargetAtTime(t,Howler.ctx.currentTime,.1),c.ctx.listener.forwardY.setTargetAtTime(n,Howler.ctx.currentTime,.1),c.ctx.listener.forwardZ.setTargetAtTime(i,Howler.ctx.currentTime,.1),c.ctx.listener.upX.setTargetAtTime(r,Howler.ctx.currentTime,.1),c.ctx.listener.upY.setTargetAtTime(o,Howler.ctx.currentTime,.1),c.ctx.listener.upZ.setTargetAtTime(a,Howler.ctx.currentTime,.1)):c.ctx.listener.setOrientation(t,n,i,r,o,a);else return u;return c},Howl.prototype.init=function(t){return function(n){var i=this;return i._orientation=n.orientation||[1,0,0],i._stereo=n.stereo||null,i._pos=n.pos||null,i._pannerAttr={coneInnerAngle:typeof n.coneInnerAngle<"u"?n.coneInnerAngle:360,coneOuterAngle:typeof n.coneOuterAngle<"u"?n.coneOuterAngle:360,coneOuterGain:typeof n.coneOuterGain<"u"?n.coneOuterGain:0,distanceModel:typeof n.distanceModel<"u"?n.distanceModel:"inverse",maxDistance:typeof n.maxDistance<"u"?n.maxDistance:1e4,panningModel:typeof n.panningModel<"u"?n.panningModel:"HRTF",refDistance:typeof n.refDistance<"u"?n.refDistance:1,rolloffFactor:typeof n.rolloffFactor<"u"?n.rolloffFactor:1},i._onstereo=n.onstereo?[{fn:n.onstereo}]:[],i._onpos=n.onpos?[{fn:n.onpos}]:[],i._onorientation=n.onorientation?[{fn:n.onorientation}]:[],t.call(this,n)}}(Howl.prototype.init),Howl.prototype.stereo=function(t,n){var i=this;if(!i._webAudio)return i;if(i._state!=="loaded")return i._queue.push({event:"stereo",action:function(){i.stereo(t,n)}}),i;var r=typeof Howler.ctx.createStereoPanner>"u"?"spatial":"stereo";if(typeof n>"u")if(typeof t=="number")i._stereo=t,i._pos=[t,0,0];else return i._stereo;for(var o=i._getSoundIds(n),a=0;a<o.length;a++){var c=i._soundById(o[a]);if(c)if(typeof t=="number")c._stereo=t,c._pos=[t,0,0],c._node&&(c._pannerAttr.panningModel="equalpower",(!c._panner||!c._panner.pan)&&e(c,r),r==="spatial"?typeof c._panner.positionX<"u"?(c._panner.positionX.setValueAtTime(t,Howler.ctx.currentTime),c._panner.positionY.setValueAtTime(0,Howler.ctx.currentTime),c._panner.positionZ.setValueAtTime(0,Howler.ctx.currentTime)):c._panner.setPosition(t,0,0):c._panner.pan.setValueAtTime(t,Howler.ctx.currentTime)),i._emit("stereo",c._id);else return c._stereo}return i},Howl.prototype.pos=function(t,n,i,r){var o=this;if(!o._webAudio)return o;if(o._state!=="loaded")return o._queue.push({event:"pos",action:function(){o.pos(t,n,i,r)}}),o;if(n=typeof n!="number"?0:n,i=typeof i!="number"?-.5:i,typeof r>"u")if(typeof t=="number")o._pos=[t,n,i];else return o._pos;for(var a=o._getSoundIds(r),c=0;c<a.length;c++){var u=o._soundById(a[c]);if(u)if(typeof t=="number")u._pos=[t,n,i],u._node&&((!u._panner||u._panner.pan)&&e(u,"spatial"),typeof u._panner.positionX<"u"?(u._panner.positionX.setValueAtTime(t,Howler.ctx.currentTime),u._panner.positionY.setValueAtTime(n,Howler.ctx.currentTime),u._panner.positionZ.setValueAtTime(i,Howler.ctx.currentTime)):u._panner.setPosition(t,n,i)),o._emit("pos",u._id);else return u._pos}return o},Howl.prototype.orientation=function(t,n,i,r){var o=this;if(!o._webAudio)return o;if(o._state!=="loaded")return o._queue.push({event:"orientation",action:function(){o.orientation(t,n,i,r)}}),o;if(n=typeof n!="number"?o._orientation[1]:n,i=typeof i!="number"?o._orientation[2]:i,typeof r>"u")if(typeof t=="number")o._orientation=[t,n,i];else return o._orientation;for(var a=o._getSoundIds(r),c=0;c<a.length;c++){var u=o._soundById(a[c]);if(u)if(typeof t=="number")u._orientation=[t,n,i],u._node&&(u._panner||(u._pos||(u._pos=o._pos||[0,0,-.5]),e(u,"spatial")),typeof u._panner.orientationX<"u"?(u._panner.orientationX.setValueAtTime(t,Howler.ctx.currentTime),u._panner.orientationY.setValueAtTime(n,Howler.ctx.currentTime),u._panner.orientationZ.setValueAtTime(i,Howler.ctx.currentTime)):u._panner.setOrientation(t,n,i)),o._emit("orientation",u._id);else return u._orientation}return o},Howl.prototype.pannerAttr=function(){var t=this,n=arguments,i,r,o;if(!t._webAudio)return t;if(n.length===0)return t._pannerAttr;if(n.length===1)if(typeof n[0]=="object")i=n[0],typeof r>"u"&&(i.pannerAttr||(i.pannerAttr={coneInnerAngle:i.coneInnerAngle,coneOuterAngle:i.coneOuterAngle,coneOuterGain:i.coneOuterGain,distanceModel:i.distanceModel,maxDistance:i.maxDistance,refDistance:i.refDistance,rolloffFactor:i.rolloffFactor,panningModel:i.panningModel}),t._pannerAttr={coneInnerAngle:typeof i.pannerAttr.coneInnerAngle<"u"?i.pannerAttr.coneInnerAngle:t._coneInnerAngle,coneOuterAngle:typeof i.pannerAttr.coneOuterAngle<"u"?i.pannerAttr.coneOuterAngle:t._coneOuterAngle,coneOuterGain:typeof i.pannerAttr.coneOuterGain<"u"?i.pannerAttr.coneOuterGain:t._coneOuterGain,distanceModel:typeof i.pannerAttr.distanceModel<"u"?i.pannerAttr.distanceModel:t._distanceModel,maxDistance:typeof i.pannerAttr.maxDistance<"u"?i.pannerAttr.maxDistance:t._maxDistance,refDistance:typeof i.pannerAttr.refDistance<"u"?i.pannerAttr.refDistance:t._refDistance,rolloffFactor:typeof i.pannerAttr.rolloffFactor<"u"?i.pannerAttr.rolloffFactor:t._rolloffFactor,panningModel:typeof i.pannerAttr.panningModel<"u"?i.pannerAttr.panningModel:t._panningModel});else return o=t._soundById(parseInt(n[0],10)),o?o._pannerAttr:t._pannerAttr;else n.length===2&&(i=n[0],r=parseInt(n[1],10));for(var a=t._getSoundIds(r),c=0;c<a.length;c++)if(o=t._soundById(a[c]),o){var u=o._pannerAttr;u={coneInnerAngle:typeof i.coneInnerAngle<"u"?i.coneInnerAngle:u.coneInnerAngle,coneOuterAngle:typeof i.coneOuterAngle<"u"?i.coneOuterAngle:u.coneOuterAngle,coneOuterGain:typeof i.coneOuterGain<"u"?i.coneOuterGain:u.coneOuterGain,distanceModel:typeof i.distanceModel<"u"?i.distanceModel:u.distanceModel,maxDistance:typeof i.maxDistance<"u"?i.maxDistance:u.maxDistance,refDistance:typeof i.refDistance<"u"?i.refDistance:u.refDistance,rolloffFactor:typeof i.rolloffFactor<"u"?i.rolloffFactor:u.rolloffFactor,panningModel:typeof i.panningModel<"u"?i.panningModel:u.panningModel};var d=o._panner;d||(o._pos||(o._pos=t._pos||[0,0,-.5]),e(o,"spatial"),d=o._panner),d.coneInnerAngle=u.coneInnerAngle,d.coneOuterAngle=u.coneOuterAngle,d.coneOuterGain=u.coneOuterGain,d.distanceModel=u.distanceModel,d.maxDistance=u.maxDistance,d.refDistance=u.refDistance,d.rolloffFactor=u.rolloffFactor,d.panningModel=u.panningModel}return t},Sound.prototype.init=function(t){return function(){var n=this,i=n._parent;n._orientation=i._orientation,n._stereo=i._stereo,n._pos=i._pos,n._pannerAttr=i._pannerAttr,t.call(this),n._stereo?i.stereo(n._stereo):n._pos&&i.pos(n._pos[0],n._pos[1],n._pos[2],n._id)}}(Sound.prototype.init),Sound.prototype.reset=function(t){return function(){var n=this,i=n._parent;return n._orientation=i._orientation,n._stereo=i._stereo,n._pos=i._pos,n._pannerAttr=i._pannerAttr,n._stereo?i.stereo(n._stereo):n._pos?i.pos(n._pos[0],n._pos[1],n._pos[2],n._id):n._panner&&(n._panner.disconnect(0),n._panner=void 0,i._refreshBuffer(n)),t.call(this)}}(Sound.prototype.reset);var e=function(t,n){n=n||"spatial",n==="spatial"?(t._panner=Howler.ctx.createPanner(),t._panner.coneInnerAngle=t._pannerAttr.coneInnerAngle,t._panner.coneOuterAngle=t._pannerAttr.coneOuterAngle,t._panner.coneOuterGain=t._pannerAttr.coneOuterGain,t._panner.distanceModel=t._pannerAttr.distanceModel,t._panner.maxDistance=t._pannerAttr.maxDistance,t._panner.refDistance=t._pannerAttr.refDistance,t._panner.rolloffFactor=t._pannerAttr.rolloffFactor,t._panner.panningModel=t._pannerAttr.panningModel,typeof t._panner.positionX<"u"?(t._panner.positionX.setValueAtTime(t._pos[0],Howler.ctx.currentTime),t._panner.positionY.setValueAtTime(t._pos[1],Howler.ctx.currentTime),t._panner.positionZ.setValueAtTime(t._pos[2],Howler.ctx.currentTime)):t._panner.setPosition(t._pos[0],t._pos[1],t._pos[2]),typeof t._panner.orientationX<"u"?(t._panner.orientationX.setValueAtTime(t._orientation[0],Howler.ctx.currentTime),t._panner.orientationY.setValueAtTime(t._orientation[1],Howler.ctx.currentTime),t._panner.orientationZ.setValueAtTime(t._orientation[2],Howler.ctx.currentTime)):t._panner.setOrientation(t._orientation[0],t._orientation[1],t._orientation[2])):(t._panner=Howler.ctx.createStereoPanner(),t._panner.pan.setValueAtTime(t._stereo,Howler.ctx.currentTime)),t._panner.connect(t._node),t._paused||t._parent.pause(t._id,!0).play(t._id,!0)}})()})(zi);function Mi(s){if(s===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return s}function ap(s,e){s.prototype=Object.create(e.prototype),s.prototype.constructor=s,s.__proto__=e}/*!
 * GSAP 3.12.5
 * https://gsap.com
 *
 * @license Copyright 2008-2024, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license or for
 * Club GSAP members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
*/var Tn={autoSleep:120,force3D:"auto",nullTargetWarn:1,units:{lineHeight:""}},fr={duration:.5,overwrite:!1,delay:0},Zc,tn,vt,Nn=1e8,ht=1/Nn,vc=Math.PI*2,h_=vc/4,d_=0,lp=Math.sqrt,f_=Math.cos,p_=Math.sin,zt=function(e){return typeof e=="string"},wt=function(e){return typeof e=="function"},Di=function(e){return typeof e=="number"},Jc=function(e){return typeof e>"u"},hi=function(e){return typeof e=="object"},pn=function(e){return e!==!1},Qc=function(){return typeof window<"u"},Fo=function(e){return wt(e)||zt(e)},cp=typeof ArrayBuffer=="function"&&ArrayBuffer.isView||function(){},nn=Array.isArray,_c=/(?:-?\.?\d|\.)+/gi,up=/[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g,er=/[-+=.]*\d+[.e-]*\d*[a-z%]*/g,ml=/[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi,hp=/[+-]=-?[.\d]+/,dp=/[^,'"\[\]\s]+/gi,m_=/^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i,_t,ti,xc,eu,An={},Sa={},fp,pp=function(e){return(Sa=Ts(e,An))&&_n},tu=function(e,t){return console.warn("Invalid property",e,"set to",t,"Missing plugin? gsap.registerPlugin()")},co=function(e,t){return!t&&console.warn(e)},mp=function(e,t){return e&&(An[e]=t)&&Sa&&(Sa[e]=t)||An},uo=function(){return 0},g_={suppressEvents:!0,isStart:!0,kill:!1},fa={suppressEvents:!0,kill:!1},v_={suppressEvents:!0},nu={},Zi=[],yc={},gp,Mn={},gl={},sh=30,pa=[],iu="",su=function(e){var t=e[0],n,i;if(hi(t)||wt(t)||(e=[e]),!(n=(t._gsap||{}).harness)){for(i=pa.length;i--&&!pa[i].targetTest(t););n=pa[i]}for(i=e.length;i--;)e[i]&&(e[i]._gsap||(e[i]._gsap=new zp(e[i],n)))||e.splice(i,1);return e},bs=function(e){return e._gsap||su(On(e))[0]._gsap},vp=function(e,t,n){return(n=e[t])&&wt(n)?e[t]():Jc(n)&&e.getAttribute&&e.getAttribute(t)||n},mn=function(e,t){return(e=e.split(",")).forEach(t)||e},At=function(e){return Math.round(e*1e5)/1e5||0},kt=function(e){return Math.round(e*1e7)/1e7||0},or=function(e,t){var n=t.charAt(0),i=parseFloat(t.substr(2));return e=parseFloat(e),n==="+"?e+i:n==="-"?e-i:n==="*"?e*i:e/i},__=function(e,t){for(var n=t.length,i=0;e.indexOf(t[i])<0&&++i<n;);return i<n},ba=function(){var e=Zi.length,t=Zi.slice(0),n,i;for(yc={},Zi.length=0,n=0;n<e;n++)i=t[n],i&&i._lazy&&(i.render(i._lazy[0],i._lazy[1],!0)._lazy=0)},_p=function(e,t,n,i){Zi.length&&!tn&&ba(),e.render(t,n,i||tn&&t<0&&(e._initted||e._startAt)),Zi.length&&!tn&&ba()},xp=function(e){var t=parseFloat(e);return(t||t===0)&&(e+"").match(dp).length<2?t:zt(e)?e.trim():e},yp=function(e){return e},Hn=function(e,t){for(var n in t)n in e||(e[n]=t[n]);return e},x_=function(e){return function(t,n){for(var i in n)i in t||i==="duration"&&e||i==="ease"||(t[i]=n[i])}},Ts=function(e,t){for(var n in t)e[n]=t[n];return e},rh=function s(e,t){for(var n in t)n!=="__proto__"&&n!=="constructor"&&n!=="prototype"&&(e[n]=hi(t[n])?s(e[n]||(e[n]={}),t[n]):t[n]);return e},Ma=function(e,t){var n={},i;for(i in e)i in t||(n[i]=e[i]);return n},no=function(e){var t=e.parent||_t,n=e.keyframes?x_(nn(e.keyframes)):Hn;if(pn(e.inherit))for(;t;)n(e,t.vars.defaults),t=t.parent||t._dp;return e},y_=function(e,t){for(var n=e.length,i=n===t.length;i&&n--&&e[n]===t[n];);return n<0},Sp=function(e,t,n,i,r){n===void 0&&(n="_first"),i===void 0&&(i="_last");var o=e[i],a;if(r)for(a=t[r];o&&o[r]>a;)o=o._prev;return o?(t._next=o._next,o._next=t):(t._next=e[n],e[n]=t),t._next?t._next._prev=t:e[i]=t,t._prev=o,t.parent=t._dp=e,t},za=function(e,t,n,i){n===void 0&&(n="_first"),i===void 0&&(i="_last");var r=t._prev,o=t._next;r?r._next=o:e[n]===t&&(e[n]=o),o?o._prev=r:e[i]===t&&(e[i]=r),t._next=t._prev=t.parent=null},es=function(e,t){e.parent&&(!t||e.parent.autoRemoveChildren)&&e.parent.remove&&e.parent.remove(e),e._act=0},Ms=function(e,t){if(e&&(!t||t._end>e._dur||t._start<0))for(var n=e;n;)n._dirty=1,n=n.parent;return e},S_=function(e){for(var t=e.parent;t&&t.parent;)t._dirty=1,t.totalDuration(),t=t.parent;return e},Sc=function(e,t,n,i){return e._startAt&&(tn?e._startAt.revert(fa):e.vars.immediateRender&&!e.vars.autoRevert||e._startAt.render(t,!0,i))},b_=function s(e){return!e||e._ts&&s(e.parent)},oh=function(e){return e._repeat?pr(e._tTime,e=e.duration()+e._rDelay)*e:0},pr=function(e,t){var n=Math.floor(e/=t);return e&&n===e?n-1:n},Ea=function(e,t){return(e-t._start)*t._ts+(t._ts>=0?0:t._dirty?t.totalDuration():t._tDur)},Ha=function(e){return e._end=kt(e._start+(e._tDur/Math.abs(e._ts||e._rts||ht)||0))},Va=function(e,t){var n=e._dp;return n&&n.smoothChildTiming&&e._ts&&(e._start=kt(n._time-(e._ts>0?t/e._ts:((e._dirty?e.totalDuration():e._tDur)-t)/-e._ts)),Ha(e),n._dirty||Ms(n,e)),e},bp=function(e,t){var n;if((t._time||!t._dur&&t._initted||t._start<e._time&&(t._dur||!t.add))&&(n=Ea(e.rawTime(),t),(!t._dur||Mo(0,t.totalDuration(),n)-t._tTime>ht)&&t.render(n,!0)),Ms(e,t)._dp&&e._initted&&e._time>=e._dur&&e._ts){if(e._dur<e.duration())for(n=e;n._dp;)n.rawTime()>=0&&n.totalTime(n._tTime),n=n._dp;e._zTime=-ht}},ii=function(e,t,n,i){return t.parent&&es(t),t._start=kt((Di(n)?n:n||e!==_t?In(e,n,t):e._time)+t._delay),t._end=kt(t._start+(t.totalDuration()/Math.abs(t.timeScale())||0)),Sp(e,t,"_first","_last",e._sort?"_start":0),bc(t)||(e._recent=t),i||bp(e,t),e._ts<0&&Va(e,e._tTime),e},Mp=function(e,t){return(An.ScrollTrigger||tu("scrollTrigger",t))&&An.ScrollTrigger.create(t,e)},Ep=function(e,t,n,i,r){if(ou(e,t,r),!e._initted)return 1;if(!n&&e._pt&&!tn&&(e._dur&&e.vars.lazy!==!1||!e._dur&&e.vars.lazy)&&gp!==En.frame)return Zi.push(e),e._lazy=[r,i],1},M_=function s(e){var t=e.parent;return t&&t._ts&&t._initted&&!t._lock&&(t.rawTime()<0||s(t))},bc=function(e){var t=e.data;return t==="isFromStart"||t==="isStart"},E_=function(e,t,n,i){var r=e.ratio,o=t<0||!t&&(!e._start&&M_(e)&&!(!e._initted&&bc(e))||(e._ts<0||e._dp._ts<0)&&!bc(e))?0:1,a=e._rDelay,c=0,u,d,l;if(a&&e._repeat&&(c=Mo(0,e._tDur,t),d=pr(c,a),e._yoyo&&d&1&&(o=1-o),d!==pr(e._tTime,a)&&(r=1-o,e.vars.repeatRefresh&&e._initted&&e.invalidate())),o!==r||tn||i||e._zTime===ht||!t&&e._zTime){if(!e._initted&&Ep(e,t,i,n,c))return;for(l=e._zTime,e._zTime=t||(n?ht:0),n||(n=t&&!l),e.ratio=o,e._from&&(o=1-o),e._time=0,e._tTime=c,u=e._pt;u;)u.r(o,u.d),u=u._next;t<0&&Sc(e,t,n,!0),e._onUpdate&&!n&&wn(e,"onUpdate"),c&&e._repeat&&!n&&e.parent&&wn(e,"onRepeat"),(t>=e._tDur||t<0)&&e.ratio===o&&(o&&es(e,1),!n&&!tn&&(wn(e,o?"onComplete":"onReverseComplete",!0),e._prom&&e._prom()))}else e._zTime||(e._zTime=t)},w_=function(e,t,n){var i;if(n>t)for(i=e._first;i&&i._start<=n;){if(i.data==="isPause"&&i._start>t)return i;i=i._next}else for(i=e._last;i&&i._start>=n;){if(i.data==="isPause"&&i._start<t)return i;i=i._prev}},mr=function(e,t,n,i){var r=e._repeat,o=kt(t)||0,a=e._tTime/e._tDur;return a&&!i&&(e._time*=o/e._dur),e._dur=o,e._tDur=r?r<0?1e10:kt(o*(r+1)+e._rDelay*r):o,a>0&&!i&&Va(e,e._tTime=e._tDur*a),e.parent&&Ha(e),n||Ms(e.parent,e),e},ah=function(e){return e instanceof an?Ms(e):mr(e,e._dur)},T_={_start:0,endTime:uo,totalDuration:uo},In=function s(e,t,n){var i=e.labels,r=e._recent||T_,o=e.duration()>=Nn?r.endTime(!1):e._dur,a,c,u;return zt(t)&&(isNaN(t)||t in i)?(c=t.charAt(0),u=t.substr(-1)==="%",a=t.indexOf("="),c==="<"||c===">"?(a>=0&&(t=t.replace(/=/,"")),(c==="<"?r._start:r.endTime(r._repeat>=0))+(parseFloat(t.substr(1))||0)*(u?(a<0?r:n).totalDuration()/100:1)):a<0?(t in i||(i[t]=o),i[t]):(c=parseFloat(t.charAt(a-1)+t.substr(a+1)),u&&n&&(c=c/100*(nn(n)?n[0]:n).totalDuration()),a>1?s(e,t.substr(0,a-1),n)+c:o+c)):t==null?o:+t},io=function(e,t,n){var i=Di(t[1]),r=(i?2:1)+(e<2?0:1),o=t[r],a,c;if(i&&(o.duration=t[1]),o.parent=n,e){for(a=o,c=n;c&&!("immediateRender"in a);)a=c.vars.defaults||{},c=pn(c.vars.inherit)&&c.parent;o.immediateRender=pn(a.immediateRender),e<2?o.runBackwards=1:o.startAt=t[r-1]}return new Pt(t[0],o,t[r+1])},ss=function(e,t){return e||e===0?t(e):t},Mo=function(e,t,n){return n<e?e:n>t?t:n},en=function(e,t){return!zt(e)||!(t=m_.exec(e))?"":t[1]},A_=function(e,t,n){return ss(n,function(i){return Mo(e,t,i)})},Mc=[].slice,wp=function(e,t){return e&&hi(e)&&"length"in e&&(!t&&!e.length||e.length-1 in e&&hi(e[0]))&&!e.nodeType&&e!==ti},D_=function(e,t,n){return n===void 0&&(n=[]),e.forEach(function(i){var r;return zt(i)&&!t||wp(i,1)?(r=n).push.apply(r,On(i)):n.push(i)})||n},On=function(e,t,n){return vt&&!t&&vt.selector?vt.selector(e):zt(e)&&!n&&(xc||!gr())?Mc.call((t||eu).querySelectorAll(e),0):nn(e)?D_(e,n):wp(e)?Mc.call(e,0):e?[e]:[]},Ec=function(e){return e=On(e)[0]||co("Invalid scope")||{},function(t){var n=e.current||e.nativeElement||e;return On(t,n.querySelectorAll?n:n===e?co("Invalid scope")||eu.createElement("div"):e)}},Tp=function(e){return e.sort(function(){return .5-Math.random()})},Ap=function(e){if(wt(e))return e;var t=hi(e)?e:{each:e},n=Es(t.ease),i=t.from||0,r=parseFloat(t.base)||0,o={},a=i>0&&i<1,c=isNaN(i)||a,u=t.axis,d=i,l=i;return zt(i)?d=l={center:.5,edges:.5,end:1}[i]||0:!a&&c&&(d=i[0],l=i[1]),function(h,f,g){var v=(g||t).length,m=o[v],p,x,_,S,M,E,w,C,y;if(!m){if(y=t.grid==="auto"?0:(t.grid||[1,Nn])[1],!y){for(w=-Nn;w<(w=g[y++].getBoundingClientRect().left)&&y<v;);y<v&&y--}for(m=o[v]=[],p=c?Math.min(y,v)*d-.5:i%y,x=y===Nn?0:c?v*l/y-.5:i/y|0,w=0,C=Nn,E=0;E<v;E++)_=E%y-p,S=x-(E/y|0),m[E]=M=u?Math.abs(u==="y"?S:_):lp(_*_+S*S),M>w&&(w=M),M<C&&(C=M);i==="random"&&Tp(m),m.max=w-C,m.min=C,m.v=v=(parseFloat(t.amount)||parseFloat(t.each)*(y>v?v-1:u?u==="y"?v/y:y:Math.max(y,v/y))||0)*(i==="edges"?-1:1),m.b=v<0?r-v:r,m.u=en(t.amount||t.each)||0,n=n&&v<0?Op(n):n}return v=(m[h]-m.min)/m.max||0,kt(m.b+(n?n(v):v)*m.v)+m.u}},wc=function(e){var t=Math.pow(10,((e+"").split(".")[1]||"").length);return function(n){var i=kt(Math.round(parseFloat(n)/e)*e*t);return(i-i%1)/t+(Di(n)?0:en(n))}},Dp=function(e,t){var n=nn(e),i,r;return!n&&hi(e)&&(i=n=e.radius||Nn,e.values?(e=On(e.values),(r=!Di(e[0]))&&(i*=i)):e=wc(e.increment)),ss(t,n?wt(e)?function(o){return r=e(o),Math.abs(r-o)<=i?r:o}:function(o){for(var a=parseFloat(r?o.x:o),c=parseFloat(r?o.y:0),u=Nn,d=0,l=e.length,h,f;l--;)r?(h=e[l].x-a,f=e[l].y-c,h=h*h+f*f):h=Math.abs(e[l]-a),h<u&&(u=h,d=l);return d=!i||u<=i?e[d]:o,r||d===o||Di(o)?d:d+en(o)}:wc(e))},Cp=function(e,t,n,i){return ss(nn(e)?!t:n===!0?!!(n=0):!i,function(){return nn(e)?e[~~(Math.random()*e.length)]:(n=n||1e-5)&&(i=n<1?Math.pow(10,(n+"").length-2):1)&&Math.floor(Math.round((e-n/2+Math.random()*(t-e+n*.99))/n)*n*i)/i})},C_=function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return function(i){return t.reduce(function(r,o){return o(r)},i)}},R_=function(e,t){return function(n){return e(parseFloat(n))+(t||en(n))}},P_=function(e,t,n){return Pp(e,t,0,1,n)},Rp=function(e,t,n){return ss(n,function(i){return e[~~t(i)]})},L_=function s(e,t,n){var i=t-e;return nn(e)?Rp(e,s(0,e.length),t):ss(n,function(r){return(i+(r-e)%i)%i+e})},I_=function s(e,t,n){var i=t-e,r=i*2;return nn(e)?Rp(e,s(0,e.length-1),t):ss(n,function(o){return o=(r+(o-e)%r)%r||0,e+(o>i?r-o:o)})},ho=function(e){for(var t=0,n="",i,r,o,a;~(i=e.indexOf("random(",t));)o=e.indexOf(")",i),a=e.charAt(i+7)==="[",r=e.substr(i+7,o-i-7).match(a?dp:_c),n+=e.substr(t,i-t)+Cp(a?r:+r[0],a?0:+r[1],+r[2]||1e-5),t=o+1;return n+e.substr(t,e.length-t)},Pp=function(e,t,n,i,r){var o=t-e,a=i-n;return ss(r,function(c){return n+((c-e)/o*a||0)})},U_=function s(e,t,n,i){var r=isNaN(e+t)?0:function(f){return(1-f)*e+f*t};if(!r){var o=zt(e),a={},c,u,d,l,h;if(n===!0&&(i=1)&&(n=null),o)e={p:e},t={p:t};else if(nn(e)&&!nn(t)){for(d=[],l=e.length,h=l-2,u=1;u<l;u++)d.push(s(e[u-1],e[u]));l--,r=function(g){g*=l;var v=Math.min(h,~~g);return d[v](g-v)},n=t}else i||(e=Ts(nn(e)?[]:{},e));if(!d){for(c in t)ru.call(a,e,c,"get",t[c]);r=function(g){return cu(g,a)||(o?e.p:e)}}}return ss(n,r)},lh=function(e,t,n){var i=e.labels,r=Nn,o,a,c;for(o in i)a=i[o]-t,a<0==!!n&&a&&r>(a=Math.abs(a))&&(c=o,r=a);return c},wn=function(e,t,n){var i=e.vars,r=i[t],o=vt,a=e._ctx,c,u,d;if(r)return c=i[t+"Params"],u=i.callbackScope||e,n&&Zi.length&&ba(),a&&(vt=a),d=c?r.apply(u,c):r.call(u),vt=o,d},Jr=function(e){return es(e),e.scrollTrigger&&e.scrollTrigger.kill(!!tn),e.progress()<1&&wn(e,"onInterrupt"),e},tr,Lp=[],Ip=function(e){if(e)if(e=!e.name&&e.default||e,Qc()||e.headless){var t=e.name,n=wt(e),i=t&&!n&&e.init?function(){this._props=[]}:e,r={init:uo,render:cu,add:ru,kill:K_,modifier:Y_,rawVars:0},o={targetTest:0,get:0,getSetter:lu,aliases:{},register:0};if(gr(),e!==i){if(Mn[t])return;Hn(i,Hn(Ma(e,r),o)),Ts(i.prototype,Ts(r,Ma(e,o))),Mn[i.prop=t]=i,e.targetTest&&(pa.push(i),nu[t]=1),t=(t==="css"?"CSS":t.charAt(0).toUpperCase()+t.substr(1))+"Plugin"}mp(t,i),e.register&&e.register(_n,i,gn)}else Lp.push(e)},ct=255,Qr={aqua:[0,ct,ct],lime:[0,ct,0],silver:[192,192,192],black:[0,0,0],maroon:[128,0,0],teal:[0,128,128],blue:[0,0,ct],navy:[0,0,128],white:[ct,ct,ct],olive:[128,128,0],yellow:[ct,ct,0],orange:[ct,165,0],gray:[128,128,128],purple:[128,0,128],green:[0,128,0],red:[ct,0,0],pink:[ct,192,203],cyan:[0,ct,ct],transparent:[ct,ct,ct,0]},vl=function(e,t,n){return e+=e<0?1:e>1?-1:0,(e*6<1?t+(n-t)*e*6:e<.5?n:e*3<2?t+(n-t)*(2/3-e)*6:t)*ct+.5|0},Up=function(e,t,n){var i=e?Di(e)?[e>>16,e>>8&ct,e&ct]:0:Qr.black,r,o,a,c,u,d,l,h,f,g;if(!i){if(e.substr(-1)===","&&(e=e.substr(0,e.length-1)),Qr[e])i=Qr[e];else if(e.charAt(0)==="#"){if(e.length<6&&(r=e.charAt(1),o=e.charAt(2),a=e.charAt(3),e="#"+r+r+o+o+a+a+(e.length===5?e.charAt(4)+e.charAt(4):"")),e.length===9)return i=parseInt(e.substr(1,6),16),[i>>16,i>>8&ct,i&ct,parseInt(e.substr(7),16)/255];e=parseInt(e.substr(1),16),i=[e>>16,e>>8&ct,e&ct]}else if(e.substr(0,3)==="hsl"){if(i=g=e.match(_c),!t)c=+i[0]%360/360,u=+i[1]/100,d=+i[2]/100,o=d<=.5?d*(u+1):d+u-d*u,r=d*2-o,i.length>3&&(i[3]*=1),i[0]=vl(c+1/3,r,o),i[1]=vl(c,r,o),i[2]=vl(c-1/3,r,o);else if(~e.indexOf("="))return i=e.match(up),n&&i.length<4&&(i[3]=1),i}else i=e.match(_c)||Qr.transparent;i=i.map(Number)}return t&&!g&&(r=i[0]/ct,o=i[1]/ct,a=i[2]/ct,l=Math.max(r,o,a),h=Math.min(r,o,a),d=(l+h)/2,l===h?c=u=0:(f=l-h,u=d>.5?f/(2-l-h):f/(l+h),c=l===r?(o-a)/f+(o<a?6:0):l===o?(a-r)/f+2:(r-o)/f+4,c*=60),i[0]=~~(c+.5),i[1]=~~(u*100+.5),i[2]=~~(d*100+.5)),n&&i.length<4&&(i[3]=1),i},Fp=function(e){var t=[],n=[],i=-1;return e.split(Ji).forEach(function(r){var o=r.match(er)||[];t.push.apply(t,o),n.push(i+=o.length+1)}),t.c=n,t},ch=function(e,t,n){var i="",r=(e+i).match(Ji),o=t?"hsla(":"rgba(",a=0,c,u,d,l;if(!r)return e;if(r=r.map(function(h){return(h=Up(h,t,1))&&o+(t?h[0]+","+h[1]+"%,"+h[2]+"%,"+h[3]:h.join(","))+")"}),n&&(d=Fp(e),c=n.c,c.join(i)!==d.c.join(i)))for(u=e.replace(Ji,"1").split(er),l=u.length-1;a<l;a++)i+=u[a]+(~c.indexOf(a)?r.shift()||o+"0,0,0,0)":(d.length?d:r.length?r:n).shift());if(!u)for(u=e.split(Ji),l=u.length-1;a<l;a++)i+=u[a]+r[a];return i+u[l]},Ji=function(){var s="(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b",e;for(e in Qr)s+="|"+e+"\\b";return new RegExp(s+")","gi")}(),F_=/hsl[a]?\(/,Np=function(e){var t=e.join(" "),n;if(Ji.lastIndex=0,Ji.test(t))return n=F_.test(t),e[1]=ch(e[1],n),e[0]=ch(e[0],n,Fp(e[1])),!0},fo,En=function(){var s=Date.now,e=500,t=33,n=s(),i=n,r=1e3/240,o=r,a=[],c,u,d,l,h,f,g=function v(m){var p=s()-i,x=m===!0,_,S,M,E;if((p>e||p<0)&&(n+=p-t),i+=p,M=i-n,_=M-o,(_>0||x)&&(E=++l.frame,h=M-l.time*1e3,l.time=M=M/1e3,o+=_+(_>=r?4:r-_),S=1),x||(c=u(v)),S)for(f=0;f<a.length;f++)a[f](M,h,E,m)};return l={time:0,frame:0,tick:function(){g(!0)},deltaRatio:function(m){return h/(1e3/(m||60))},wake:function(){fp&&(!xc&&Qc()&&(ti=xc=window,eu=ti.document||{},An.gsap=_n,(ti.gsapVersions||(ti.gsapVersions=[])).push(_n.version),pp(Sa||ti.GreenSockGlobals||!ti.gsap&&ti||{}),Lp.forEach(Ip)),d=typeof requestAnimationFrame<"u"&&requestAnimationFrame,c&&l.sleep(),u=d||function(m){return setTimeout(m,o-l.time*1e3+1|0)},fo=1,g(2))},sleep:function(){(d?cancelAnimationFrame:clearTimeout)(c),fo=0,u=uo},lagSmoothing:function(m,p){e=m||1/0,t=Math.min(p||33,e)},fps:function(m){r=1e3/(m||240),o=l.time*1e3+r},add:function(m,p,x){var _=p?function(S,M,E,w){m(S,M,E,w),l.remove(_)}:m;return l.remove(m),a[x?"unshift":"push"](_),gr(),_},remove:function(m,p){~(p=a.indexOf(m))&&a.splice(p,1)&&f>=p&&f--},_listeners:a},l}(),gr=function(){return!fo&&En.wake()},$e={},N_=/^[\d.\-M][\d.\-,\s]/,O_=/["']/g,k_=function(e){for(var t={},n=e.substr(1,e.length-3).split(":"),i=n[0],r=1,o=n.length,a,c,u;r<o;r++)c=n[r],a=r!==o-1?c.lastIndexOf(","):c.length,u=c.substr(0,a),t[i]=isNaN(u)?u.replace(O_,"").trim():+u,i=c.substr(a+1).trim();return t},B_=function(e){var t=e.indexOf("(")+1,n=e.indexOf(")"),i=e.indexOf("(",t);return e.substring(t,~i&&i<n?e.indexOf(")",n+1):n)},z_=function(e){var t=(e+"").split("("),n=$e[t[0]];return n&&t.length>1&&n.config?n.config.apply(null,~e.indexOf("{")?[k_(t[1])]:B_(e).split(",").map(xp)):$e._CE&&N_.test(e)?$e._CE("",e):n},Op=function(e){return function(t){return 1-e(1-t)}},kp=function s(e,t){for(var n=e._first,i;n;)n instanceof an?s(n,t):n.vars.yoyoEase&&(!n._yoyo||!n._repeat)&&n._yoyo!==t&&(n.timeline?s(n.timeline,t):(i=n._ease,n._ease=n._yEase,n._yEase=i,n._yoyo=t)),n=n._next},Es=function(e,t){return e&&(wt(e)?e:$e[e]||z_(e))||t},Rs=function(e,t,n,i){n===void 0&&(n=function(c){return 1-t(1-c)}),i===void 0&&(i=function(c){return c<.5?t(c*2)/2:1-t((1-c)*2)/2});var r={easeIn:t,easeOut:n,easeInOut:i},o;return mn(e,function(a){$e[a]=An[a]=r,$e[o=a.toLowerCase()]=n;for(var c in r)$e[o+(c==="easeIn"?".in":c==="easeOut"?".out":".inOut")]=$e[a+"."+c]=r[c]}),r},Bp=function(e){return function(t){return t<.5?(1-e(1-t*2))/2:.5+e((t-.5)*2)/2}},_l=function s(e,t,n){var i=t>=1?t:1,r=(n||(e?.3:.45))/(t<1?t:1),o=r/vc*(Math.asin(1/i)||0),a=function(d){return d===1?1:i*Math.pow(2,-10*d)*p_((d-o)*r)+1},c=e==="out"?a:e==="in"?function(u){return 1-a(1-u)}:Bp(a);return r=vc/r,c.config=function(u,d){return s(e,u,d)},c},xl=function s(e,t){t===void 0&&(t=1.70158);var n=function(o){return o?--o*o*((t+1)*o+t)+1:0},i=e==="out"?n:e==="in"?function(r){return 1-n(1-r)}:Bp(n);return i.config=function(r){return s(e,r)},i};mn("Linear,Quad,Cubic,Quart,Quint,Strong",function(s,e){var t=e<5?e+1:e;Rs(s+",Power"+(t-1),e?function(n){return Math.pow(n,t)}:function(n){return n},function(n){return 1-Math.pow(1-n,t)},function(n){return n<.5?Math.pow(n*2,t)/2:1-Math.pow((1-n)*2,t)/2})});$e.Linear.easeNone=$e.none=$e.Linear.easeIn;Rs("Elastic",_l("in"),_l("out"),_l());(function(s,e){var t=1/e,n=2*t,i=2.5*t,r=function(a){return a<t?s*a*a:a<n?s*Math.pow(a-1.5/e,2)+.75:a<i?s*(a-=2.25/e)*a+.9375:s*Math.pow(a-2.625/e,2)+.984375};Rs("Bounce",function(o){return 1-r(1-o)},r)})(7.5625,2.75);Rs("Expo",function(s){return s?Math.pow(2,10*(s-1)):0});Rs("Circ",function(s){return-(lp(1-s*s)-1)});Rs("Sine",function(s){return s===1?1:-f_(s*h_)+1});Rs("Back",xl("in"),xl("out"),xl());$e.SteppedEase=$e.steps=An.SteppedEase={config:function(e,t){e===void 0&&(e=1);var n=1/e,i=e+(t?0:1),r=t?1:0,o=1-ht;return function(a){return((i*Mo(0,o,a)|0)+r)*n}}};fr.ease=$e["quad.out"];mn("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt",function(s){return iu+=s+","+s+"Params,"});var zp=function(e,t){this.id=d_++,e._gsap=this,this.target=e,this.harness=t,this.get=t?t.get:vp,this.set=t?t.getSetter:lu},po=function(){function s(t){this.vars=t,this._delay=+t.delay||0,(this._repeat=t.repeat===1/0?-2:t.repeat||0)&&(this._rDelay=t.repeatDelay||0,this._yoyo=!!t.yoyo||!!t.yoyoEase),this._ts=1,mr(this,+t.duration,1,1),this.data=t.data,vt&&(this._ctx=vt,vt.data.push(this)),fo||En.wake()}var e=s.prototype;return e.delay=function(n){return n||n===0?(this.parent&&this.parent.smoothChildTiming&&this.startTime(this._start+n-this._delay),this._delay=n,this):this._delay},e.duration=function(n){return arguments.length?this.totalDuration(this._repeat>0?n+(n+this._rDelay)*this._repeat:n):this.totalDuration()&&this._dur},e.totalDuration=function(n){return arguments.length?(this._dirty=0,mr(this,this._repeat<0?n:(n-this._repeat*this._rDelay)/(this._repeat+1))):this._tDur},e.totalTime=function(n,i){if(gr(),!arguments.length)return this._tTime;var r=this._dp;if(r&&r.smoothChildTiming&&this._ts){for(Va(this,n),!r._dp||r.parent||bp(r,this);r&&r.parent;)r.parent._time!==r._start+(r._ts>=0?r._tTime/r._ts:(r.totalDuration()-r._tTime)/-r._ts)&&r.totalTime(r._tTime,!0),r=r.parent;!this.parent&&this._dp.autoRemoveChildren&&(this._ts>0&&n<this._tDur||this._ts<0&&n>0||!this._tDur&&!n)&&ii(this._dp,this,this._start-this._delay)}return(this._tTime!==n||!this._dur&&!i||this._initted&&Math.abs(this._zTime)===ht||!n&&!this._initted&&(this.add||this._ptLookup))&&(this._ts||(this._pTime=n),_p(this,n,i)),this},e.time=function(n,i){return arguments.length?this.totalTime(Math.min(this.totalDuration(),n+oh(this))%(this._dur+this._rDelay)||(n?this._dur:0),i):this._time},e.totalProgress=function(n,i){return arguments.length?this.totalTime(this.totalDuration()*n,i):this.totalDuration()?Math.min(1,this._tTime/this._tDur):this.rawTime()>0?1:0},e.progress=function(n,i){return arguments.length?this.totalTime(this.duration()*(this._yoyo&&!(this.iteration()&1)?1-n:n)+oh(this),i):this.duration()?Math.min(1,this._time/this._dur):this.rawTime()>0?1:0},e.iteration=function(n,i){var r=this.duration()+this._rDelay;return arguments.length?this.totalTime(this._time+(n-1)*r,i):this._repeat?pr(this._tTime,r)+1:1},e.timeScale=function(n,i){if(!arguments.length)return this._rts===-ht?0:this._rts;if(this._rts===n)return this;var r=this.parent&&this._ts?Ea(this.parent._time,this):this._tTime;return this._rts=+n||0,this._ts=this._ps||n===-ht?0:this._rts,this.totalTime(Mo(-Math.abs(this._delay),this._tDur,r),i!==!1),Ha(this),S_(this)},e.paused=function(n){return arguments.length?(this._ps!==n&&(this._ps=n,n?(this._pTime=this._tTime||Math.max(-this._delay,this.rawTime()),this._ts=this._act=0):(gr(),this._ts=this._rts,this.totalTime(this.parent&&!this.parent.smoothChildTiming?this.rawTime():this._tTime||this._pTime,this.progress()===1&&Math.abs(this._zTime)!==ht&&(this._tTime-=ht)))),this):this._ps},e.startTime=function(n){if(arguments.length){this._start=n;var i=this.parent||this._dp;return i&&(i._sort||!this.parent)&&ii(i,this,n-this._delay),this}return this._start},e.endTime=function(n){return this._start+(pn(n)?this.totalDuration():this.duration())/Math.abs(this._ts||1)},e.rawTime=function(n){var i=this.parent||this._dp;return i?n&&(!this._ts||this._repeat&&this._time&&this.totalProgress()<1)?this._tTime%(this._dur+this._rDelay):this._ts?Ea(i.rawTime(n),this):this._tTime:this._tTime},e.revert=function(n){n===void 0&&(n=v_);var i=tn;return tn=n,(this._initted||this._startAt)&&(this.timeline&&this.timeline.revert(n),this.totalTime(-.01,n.suppressEvents)),this.data!=="nested"&&n.kill!==!1&&this.kill(),tn=i,this},e.globalTime=function(n){for(var i=this,r=arguments.length?n:i.rawTime();i;)r=i._start+r/(Math.abs(i._ts)||1),i=i._dp;return!this.parent&&this._sat?this._sat.globalTime(n):r},e.repeat=function(n){return arguments.length?(this._repeat=n===1/0?-2:n,ah(this)):this._repeat===-2?1/0:this._repeat},e.repeatDelay=function(n){if(arguments.length){var i=this._time;return this._rDelay=n,ah(this),i?this.time(i):this}return this._rDelay},e.yoyo=function(n){return arguments.length?(this._yoyo=n,this):this._yoyo},e.seek=function(n,i){return this.totalTime(In(this,n),pn(i))},e.restart=function(n,i){return this.play().totalTime(n?-this._delay:0,pn(i))},e.play=function(n,i){return n!=null&&this.seek(n,i),this.reversed(!1).paused(!1)},e.reverse=function(n,i){return n!=null&&this.seek(n||this.totalDuration(),i),this.reversed(!0).paused(!1)},e.pause=function(n,i){return n!=null&&this.seek(n,i),this.paused(!0)},e.resume=function(){return this.paused(!1)},e.reversed=function(n){return arguments.length?(!!n!==this.reversed()&&this.timeScale(-this._rts||(n?-ht:0)),this):this._rts<0},e.invalidate=function(){return this._initted=this._act=0,this._zTime=-ht,this},e.isActive=function(){var n=this.parent||this._dp,i=this._start,r;return!!(!n||this._ts&&this._initted&&n.isActive()&&(r=n.rawTime(!0))>=i&&r<this.endTime(!0)-ht)},e.eventCallback=function(n,i,r){var o=this.vars;return arguments.length>1?(i?(o[n]=i,r&&(o[n+"Params"]=r),n==="onUpdate"&&(this._onUpdate=i)):delete o[n],this):o[n]},e.then=function(n){var i=this;return new Promise(function(r){var o=wt(n)?n:yp,a=function(){var u=i.then;i.then=null,wt(o)&&(o=o(i))&&(o.then||o===i)&&(i.then=u),r(o),i.then=u};i._initted&&i.totalProgress()===1&&i._ts>=0||!i._tTime&&i._ts<0?a():i._prom=a})},e.kill=function(){Jr(this)},s}();Hn(po.prototype,{_time:0,_start:0,_end:0,_tTime:0,_tDur:0,_dirty:0,_repeat:0,_yoyo:!1,parent:null,_initted:!1,_rDelay:0,_ts:1,_dp:0,ratio:0,_zTime:-ht,_prom:0,_ps:!1,_rts:1});var an=function(s){ap(e,s);function e(n,i){var r;return n===void 0&&(n={}),r=s.call(this,n)||this,r.labels={},r.smoothChildTiming=!!n.smoothChildTiming,r.autoRemoveChildren=!!n.autoRemoveChildren,r._sort=pn(n.sortChildren),_t&&ii(n.parent||_t,Mi(r),i),n.reversed&&r.reverse(),n.paused&&r.paused(!0),n.scrollTrigger&&Mp(Mi(r),n.scrollTrigger),r}var t=e.prototype;return t.to=function(i,r,o){return io(0,arguments,this),this},t.from=function(i,r,o){return io(1,arguments,this),this},t.fromTo=function(i,r,o,a){return io(2,arguments,this),this},t.set=function(i,r,o){return r.duration=0,r.parent=this,no(r).repeatDelay||(r.repeat=0),r.immediateRender=!!r.immediateRender,new Pt(i,r,In(this,o),1),this},t.call=function(i,r,o){return ii(this,Pt.delayedCall(0,i,r),o)},t.staggerTo=function(i,r,o,a,c,u,d){return o.duration=r,o.stagger=o.stagger||a,o.onComplete=u,o.onCompleteParams=d,o.parent=this,new Pt(i,o,In(this,c)),this},t.staggerFrom=function(i,r,o,a,c,u,d){return o.runBackwards=1,no(o).immediateRender=pn(o.immediateRender),this.staggerTo(i,r,o,a,c,u,d)},t.staggerFromTo=function(i,r,o,a,c,u,d,l){return a.startAt=o,no(a).immediateRender=pn(a.immediateRender),this.staggerTo(i,r,a,c,u,d,l)},t.render=function(i,r,o){var a=this._time,c=this._dirty?this.totalDuration():this._tDur,u=this._dur,d=i<=0?0:kt(i),l=this._zTime<0!=i<0&&(this._initted||!u),h,f,g,v,m,p,x,_,S,M,E,w;if(this!==_t&&d>c&&i>=0&&(d=c),d!==this._tTime||o||l){if(a!==this._time&&u&&(d+=this._time-a,i+=this._time-a),h=d,S=this._start,_=this._ts,p=!_,l&&(u||(a=this._zTime),(i||!r)&&(this._zTime=i)),this._repeat){if(E=this._yoyo,m=u+this._rDelay,this._repeat<-1&&i<0)return this.totalTime(m*100+i,r,o);if(h=kt(d%m),d===c?(v=this._repeat,h=u):(v=~~(d/m),v&&v===d/m&&(h=u,v--),h>u&&(h=u)),M=pr(this._tTime,m),!a&&this._tTime&&M!==v&&this._tTime-M*m-this._dur<=0&&(M=v),E&&v&1&&(h=u-h,w=1),v!==M&&!this._lock){var C=E&&M&1,y=C===(E&&v&1);if(v<M&&(C=!C),a=C?0:d%u?u:d,this._lock=1,this.render(a||(w?0:kt(v*m)),r,!u)._lock=0,this._tTime=d,!r&&this.parent&&wn(this,"onRepeat"),this.vars.repeatRefresh&&!w&&(this.invalidate()._lock=1),a&&a!==this._time||p!==!this._ts||this.vars.onRepeat&&!this.parent&&!this._act)return this;if(u=this._dur,c=this._tDur,y&&(this._lock=2,a=C?u:-1e-4,this.render(a,!0),this.vars.repeatRefresh&&!w&&this.invalidate()),this._lock=0,!this._ts&&!p)return this;kp(this,w)}}if(this._hasPause&&!this._forcing&&this._lock<2&&(x=w_(this,kt(a),kt(h)),x&&(d-=h-(h=x._start))),this._tTime=d,this._time=h,this._act=!_,this._initted||(this._onUpdate=this.vars.onUpdate,this._initted=1,this._zTime=i,a=0),!a&&h&&!r&&!v&&(wn(this,"onStart"),this._tTime!==d))return this;if(h>=a&&i>=0)for(f=this._first;f;){if(g=f._next,(f._act||h>=f._start)&&f._ts&&x!==f){if(f.parent!==this)return this.render(i,r,o);if(f.render(f._ts>0?(h-f._start)*f._ts:(f._dirty?f.totalDuration():f._tDur)+(h-f._start)*f._ts,r,o),h!==this._time||!this._ts&&!p){x=0,g&&(d+=this._zTime=-ht);break}}f=g}else{f=this._last;for(var b=i<0?i:h;f;){if(g=f._prev,(f._act||b<=f._end)&&f._ts&&x!==f){if(f.parent!==this)return this.render(i,r,o);if(f.render(f._ts>0?(b-f._start)*f._ts:(f._dirty?f.totalDuration():f._tDur)+(b-f._start)*f._ts,r,o||tn&&(f._initted||f._startAt)),h!==this._time||!this._ts&&!p){x=0,g&&(d+=this._zTime=b?-ht:ht);break}}f=g}}if(x&&!r&&(this.pause(),x.render(h>=a?0:-ht)._zTime=h>=a?1:-1,this._ts))return this._start=S,Ha(this),this.render(i,r,o);this._onUpdate&&!r&&wn(this,"onUpdate",!0),(d===c&&this._tTime>=this.totalDuration()||!d&&a)&&(S===this._start||Math.abs(_)!==Math.abs(this._ts))&&(this._lock||((i||!u)&&(d===c&&this._ts>0||!d&&this._ts<0)&&es(this,1),!r&&!(i<0&&!a)&&(d||a||!c)&&(wn(this,d===c&&i>=0?"onComplete":"onReverseComplete",!0),this._prom&&!(d<c&&this.timeScale()>0)&&this._prom())))}return this},t.add=function(i,r){var o=this;if(Di(r)||(r=In(this,r,i)),!(i instanceof po)){if(nn(i))return i.forEach(function(a){return o.add(a,r)}),this;if(zt(i))return this.addLabel(i,r);if(wt(i))i=Pt.delayedCall(0,i);else return this}return this!==i?ii(this,i,r):this},t.getChildren=function(i,r,o,a){i===void 0&&(i=!0),r===void 0&&(r=!0),o===void 0&&(o=!0),a===void 0&&(a=-Nn);for(var c=[],u=this._first;u;)u._start>=a&&(u instanceof Pt?r&&c.push(u):(o&&c.push(u),i&&c.push.apply(c,u.getChildren(!0,r,o)))),u=u._next;return c},t.getById=function(i){for(var r=this.getChildren(1,1,1),o=r.length;o--;)if(r[o].vars.id===i)return r[o]},t.remove=function(i){return zt(i)?this.removeLabel(i):wt(i)?this.killTweensOf(i):(za(this,i),i===this._recent&&(this._recent=this._last),Ms(this))},t.totalTime=function(i,r){return arguments.length?(this._forcing=1,!this._dp&&this._ts&&(this._start=kt(En.time-(this._ts>0?i/this._ts:(this.totalDuration()-i)/-this._ts))),s.prototype.totalTime.call(this,i,r),this._forcing=0,this):this._tTime},t.addLabel=function(i,r){return this.labels[i]=In(this,r),this},t.removeLabel=function(i){return delete this.labels[i],this},t.addPause=function(i,r,o){var a=Pt.delayedCall(0,r||uo,o);return a.data="isPause",this._hasPause=1,ii(this,a,In(this,i))},t.removePause=function(i){var r=this._first;for(i=In(this,i);r;)r._start===i&&r.data==="isPause"&&es(r),r=r._next},t.killTweensOf=function(i,r,o){for(var a=this.getTweensOf(i,o),c=a.length;c--;)ji!==a[c]&&a[c].kill(i,r);return this},t.getTweensOf=function(i,r){for(var o=[],a=On(i),c=this._first,u=Di(r),d;c;)c instanceof Pt?__(c._targets,a)&&(u?(!ji||c._initted&&c._ts)&&c.globalTime(0)<=r&&c.globalTime(c.totalDuration())>r:!r||c.isActive())&&o.push(c):(d=c.getTweensOf(a,r)).length&&o.push.apply(o,d),c=c._next;return o},t.tweenTo=function(i,r){r=r||{};var o=this,a=In(o,i),c=r,u=c.startAt,d=c.onStart,l=c.onStartParams,h=c.immediateRender,f,g=Pt.to(o,Hn({ease:r.ease||"none",lazy:!1,immediateRender:!1,time:a,overwrite:"auto",duration:r.duration||Math.abs((a-(u&&"time"in u?u.time:o._time))/o.timeScale())||ht,onStart:function(){if(o.pause(),!f){var m=r.duration||Math.abs((a-(u&&"time"in u?u.time:o._time))/o.timeScale());g._dur!==m&&mr(g,m,0,1).render(g._time,!0,!0),f=1}d&&d.apply(g,l||[])}},r));return h?g.render(0):g},t.tweenFromTo=function(i,r,o){return this.tweenTo(r,Hn({startAt:{time:In(this,i)}},o))},t.recent=function(){return this._recent},t.nextLabel=function(i){return i===void 0&&(i=this._time),lh(this,In(this,i))},t.previousLabel=function(i){return i===void 0&&(i=this._time),lh(this,In(this,i),1)},t.currentLabel=function(i){return arguments.length?this.seek(i,!0):this.previousLabel(this._time+ht)},t.shiftChildren=function(i,r,o){o===void 0&&(o=0);for(var a=this._first,c=this.labels,u;a;)a._start>=o&&(a._start+=i,a._end+=i),a=a._next;if(r)for(u in c)c[u]>=o&&(c[u]+=i);return Ms(this)},t.invalidate=function(i){var r=this._first;for(this._lock=0;r;)r.invalidate(i),r=r._next;return s.prototype.invalidate.call(this,i)},t.clear=function(i){i===void 0&&(i=!0);for(var r=this._first,o;r;)o=r._next,this.remove(r),r=o;return this._dp&&(this._time=this._tTime=this._pTime=0),i&&(this.labels={}),Ms(this)},t.totalDuration=function(i){var r=0,o=this,a=o._last,c=Nn,u,d,l;if(arguments.length)return o.timeScale((o._repeat<0?o.duration():o.totalDuration())/(o.reversed()?-i:i));if(o._dirty){for(l=o.parent;a;)u=a._prev,a._dirty&&a.totalDuration(),d=a._start,d>c&&o._sort&&a._ts&&!o._lock?(o._lock=1,ii(o,a,d-a._delay,1)._lock=0):c=d,d<0&&a._ts&&(r-=d,(!l&&!o._dp||l&&l.smoothChildTiming)&&(o._start+=d/o._ts,o._time-=d,o._tTime-=d),o.shiftChildren(-d,!1,-1/0),c=0),a._end>r&&a._ts&&(r=a._end),a=u;mr(o,o===_t&&o._time>r?o._time:r,1,1),o._dirty=0}return o._tDur},e.updateRoot=function(i){if(_t._ts&&(_p(_t,Ea(i,_t)),gp=En.frame),En.frame>=sh){sh+=Tn.autoSleep||120;var r=_t._first;if((!r||!r._ts)&&Tn.autoSleep&&En._listeners.length<2){for(;r&&!r._ts;)r=r._next;r||En.sleep()}}},e}(po);Hn(an.prototype,{_lock:0,_hasPause:0,_forcing:0});var H_=function(e,t,n,i,r,o,a){var c=new gn(this._pt,e,t,0,1,Xp,null,r),u=0,d=0,l,h,f,g,v,m,p,x;for(c.b=n,c.e=i,n+="",i+="",(p=~i.indexOf("random("))&&(i=ho(i)),o&&(x=[n,i],o(x,e,t),n=x[0],i=x[1]),h=n.match(ml)||[];l=ml.exec(i);)g=l[0],v=i.substring(u,l.index),f?f=(f+1)%5:v.substr(-5)==="rgba("&&(f=1),g!==h[d++]&&(m=parseFloat(h[d-1])||0,c._pt={_next:c._pt,p:v||d===1?v:",",s:m,c:g.charAt(1)==="="?or(m,g)-m:parseFloat(g)-m,m:f&&f<4?Math.round:0},u=ml.lastIndex);return c.c=u<i.length?i.substring(u,i.length):"",c.fp=a,(hp.test(i)||p)&&(c.e=0),this._pt=c,c},ru=function(e,t,n,i,r,o,a,c,u,d){wt(i)&&(i=i(r||0,e,o));var l=e[t],h=n!=="get"?n:wt(l)?u?e[t.indexOf("set")||!wt(e["get"+t.substr(3)])?t:"get"+t.substr(3)](u):e[t]():l,f=wt(l)?u?X_:Wp:au,g;if(zt(i)&&(~i.indexOf("random(")&&(i=ho(i)),i.charAt(1)==="="&&(g=or(h,i)+(en(h)||0),(g||g===0)&&(i=g))),!d||h!==i||Tc)return!isNaN(h*i)&&i!==""?(g=new gn(this._pt,e,t,+h||0,i-(h||0),typeof l=="boolean"?q_:jp,0,f),u&&(g.fp=u),a&&g.modifier(a,this,e),this._pt=g):(!l&&!(t in e)&&tu(t,i),H_.call(this,e,t,h,i,f,c||Tn.stringFilter,u))},V_=function(e,t,n,i,r){if(wt(e)&&(e=so(e,r,t,n,i)),!hi(e)||e.style&&e.nodeType||nn(e)||cp(e))return zt(e)?so(e,r,t,n,i):e;var o={},a;for(a in e)o[a]=so(e[a],r,t,n,i);return o},Hp=function(e,t,n,i,r,o){var a,c,u,d;if(Mn[e]&&(a=new Mn[e]).init(r,a.rawVars?t[e]:V_(t[e],i,r,o,n),n,i,o)!==!1&&(n._pt=c=new gn(n._pt,r,e,0,1,a.render,a,0,a.priority),n!==tr))for(u=n._ptLookup[n._targets.indexOf(r)],d=a._props.length;d--;)u[a._props[d]]=c;return a},ji,Tc,ou=function s(e,t,n){var i=e.vars,r=i.ease,o=i.startAt,a=i.immediateRender,c=i.lazy,u=i.onUpdate,d=i.runBackwards,l=i.yoyoEase,h=i.keyframes,f=i.autoRevert,g=e._dur,v=e._startAt,m=e._targets,p=e.parent,x=p&&p.data==="nested"?p.vars.targets:m,_=e._overwrite==="auto"&&!Zc,S=e.timeline,M,E,w,C,y,b,U,z,P,O,F,k,j;if(S&&(!h||!r)&&(r="none"),e._ease=Es(r,fr.ease),e._yEase=l?Op(Es(l===!0?r:l,fr.ease)):0,l&&e._yoyo&&!e._repeat&&(l=e._yEase,e._yEase=e._ease,e._ease=l),e._from=!S&&!!i.runBackwards,!S||h&&!i.stagger){if(z=m[0]?bs(m[0]).harness:0,k=z&&i[z.prop],M=Ma(i,nu),v&&(v._zTime<0&&v.progress(1),t<0&&d&&a&&!f?v.render(-1,!0):v.revert(d&&g?fa:g_),v._lazy=0),o){if(es(e._startAt=Pt.set(m,Hn({data:"isStart",overwrite:!1,parent:p,immediateRender:!0,lazy:!v&&pn(c),startAt:null,delay:0,onUpdate:u&&function(){return wn(e,"onUpdate")},stagger:0},o))),e._startAt._dp=0,e._startAt._sat=e,t<0&&(tn||!a&&!f)&&e._startAt.revert(fa),a&&g&&t<=0&&n<=0){t&&(e._zTime=t);return}}else if(d&&g&&!v){if(t&&(a=!1),w=Hn({overwrite:!1,data:"isFromStart",lazy:a&&!v&&pn(c),immediateRender:a,stagger:0,parent:p},M),k&&(w[z.prop]=k),es(e._startAt=Pt.set(m,w)),e._startAt._dp=0,e._startAt._sat=e,t<0&&(tn?e._startAt.revert(fa):e._startAt.render(-1,!0)),e._zTime=t,!a)s(e._startAt,ht,ht);else if(!t)return}for(e._pt=e._ptCache=0,c=g&&pn(c)||c&&!g,E=0;E<m.length;E++){if(y=m[E],U=y._gsap||su(m)[E]._gsap,e._ptLookup[E]=O={},yc[U.id]&&Zi.length&&ba(),F=x===m?E:x.indexOf(y),z&&(P=new z).init(y,k||M,e,F,x)!==!1&&(e._pt=C=new gn(e._pt,y,P.name,0,1,P.render,P,0,P.priority),P._props.forEach(function(D){O[D]=C}),P.priority&&(b=1)),!z||k)for(w in M)Mn[w]&&(P=Hp(w,M,e,F,y,x))?P.priority&&(b=1):O[w]=C=ru.call(e,y,w,"get",M[w],F,x,0,i.stringFilter);e._op&&e._op[E]&&e.kill(y,e._op[E]),_&&e._pt&&(ji=e,_t.killTweensOf(y,O,e.globalTime(t)),j=!e.parent,ji=0),e._pt&&c&&(yc[U.id]=1)}b&&$p(e),e._onInit&&e._onInit(e)}e._onUpdate=u,e._initted=(!e._op||e._pt)&&!j,h&&t<=0&&S.render(Nn,!0,!0)},G_=function(e,t,n,i,r,o,a,c){var u=(e._pt&&e._ptCache||(e._ptCache={}))[t],d,l,h,f;if(!u)for(u=e._ptCache[t]=[],h=e._ptLookup,f=e._targets.length;f--;){if(d=h[f][t],d&&d.d&&d.d._pt)for(d=d.d._pt;d&&d.p!==t&&d.fp!==t;)d=d._next;if(!d)return Tc=1,e.vars[t]="+=0",ou(e,a),Tc=0,c?co(t+" not eligible for reset"):1;u.push(d)}for(f=u.length;f--;)l=u[f],d=l._pt||l,d.s=(i||i===0)&&!r?i:d.s+(i||0)+o*d.c,d.c=n-d.s,l.e&&(l.e=At(n)+en(l.e)),l.b&&(l.b=d.s+en(l.b))},W_=function(e,t){var n=e[0]?bs(e[0]).harness:0,i=n&&n.aliases,r,o,a,c;if(!i)return t;r=Ts({},t);for(o in i)if(o in r)for(c=i[o].split(","),a=c.length;a--;)r[c[a]]=r[o];return r},j_=function(e,t,n,i){var r=t.ease||i||"power1.inOut",o,a;if(nn(t))a=n[e]||(n[e]=[]),t.forEach(function(c,u){return a.push({t:u/(t.length-1)*100,v:c,e:r})});else for(o in t)a=n[o]||(n[o]=[]),o==="ease"||a.push({t:parseFloat(e),v:t[o],e:r})},so=function(e,t,n,i,r){return wt(e)?e.call(t,n,i,r):zt(e)&&~e.indexOf("random(")?ho(e):e},Vp=iu+"repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,autoRevert",Gp={};mn(Vp+",id,stagger,delay,duration,paused,scrollTrigger",function(s){return Gp[s]=1});var Pt=function(s){ap(e,s);function e(n,i,r,o){var a;typeof i=="number"&&(r.duration=i,i=r,r=null),a=s.call(this,o?i:no(i))||this;var c=a.vars,u=c.duration,d=c.delay,l=c.immediateRender,h=c.stagger,f=c.overwrite,g=c.keyframes,v=c.defaults,m=c.scrollTrigger,p=c.yoyoEase,x=i.parent||_t,_=(nn(n)||cp(n)?Di(n[0]):"length"in i)?[n]:On(n),S,M,E,w,C,y,b,U;if(a._targets=_.length?su(_):co("GSAP target "+n+" not found. https://gsap.com",!Tn.nullTargetWarn)||[],a._ptLookup=[],a._overwrite=f,g||h||Fo(u)||Fo(d)){if(i=a.vars,S=a.timeline=new an({data:"nested",defaults:v||{},targets:x&&x.data==="nested"?x.vars.targets:_}),S.kill(),S.parent=S._dp=Mi(a),S._start=0,h||Fo(u)||Fo(d)){if(w=_.length,b=h&&Ap(h),hi(h))for(C in h)~Vp.indexOf(C)&&(U||(U={}),U[C]=h[C]);for(M=0;M<w;M++)E=Ma(i,Gp),E.stagger=0,p&&(E.yoyoEase=p),U&&Ts(E,U),y=_[M],E.duration=+so(u,Mi(a),M,y,_),E.delay=(+so(d,Mi(a),M,y,_)||0)-a._delay,!h&&w===1&&E.delay&&(a._delay=d=E.delay,a._start+=d,E.delay=0),S.to(y,E,b?b(M,y,_):0),S._ease=$e.none;S.duration()?u=d=0:a.timeline=0}else if(g){no(Hn(S.vars.defaults,{ease:"none"})),S._ease=Es(g.ease||i.ease||"none");var z=0,P,O,F;if(nn(g))g.forEach(function(k){return S.to(_,k,">")}),S.duration();else{E={};for(C in g)C==="ease"||C==="easeEach"||j_(C,g[C],E,g.easeEach);for(C in E)for(P=E[C].sort(function(k,j){return k.t-j.t}),z=0,M=0;M<P.length;M++)O=P[M],F={ease:O.e,duration:(O.t-(M?P[M-1].t:0))/100*u},F[C]=O.v,S.to(_,F,z),z+=F.duration;S.duration()<u&&S.to({},{duration:u-S.duration()})}}u||a.duration(u=S.duration())}else a.timeline=0;return f===!0&&!Zc&&(ji=Mi(a),_t.killTweensOf(_),ji=0),ii(x,Mi(a),r),i.reversed&&a.reverse(),i.paused&&a.paused(!0),(l||!u&&!g&&a._start===kt(x._time)&&pn(l)&&b_(Mi(a))&&x.data!=="nested")&&(a._tTime=-ht,a.render(Math.max(0,-d)||0)),m&&Mp(Mi(a),m),a}var t=e.prototype;return t.render=function(i,r,o){var a=this._time,c=this._tDur,u=this._dur,d=i<0,l=i>c-ht&&!d?c:i<ht?0:i,h,f,g,v,m,p,x,_,S;if(!u)E_(this,i,r,o);else if(l!==this._tTime||!i||o||!this._initted&&this._tTime||this._startAt&&this._zTime<0!==d){if(h=l,_=this.timeline,this._repeat){if(v=u+this._rDelay,this._repeat<-1&&d)return this.totalTime(v*100+i,r,o);if(h=kt(l%v),l===c?(g=this._repeat,h=u):(g=~~(l/v),g&&g===kt(l/v)&&(h=u,g--),h>u&&(h=u)),p=this._yoyo&&g&1,p&&(S=this._yEase,h=u-h),m=pr(this._tTime,v),h===a&&!o&&this._initted&&g===m)return this._tTime=l,this;g!==m&&(_&&this._yEase&&kp(_,p),this.vars.repeatRefresh&&!p&&!this._lock&&this._time!==v&&this._initted&&(this._lock=o=1,this.render(kt(v*g),!0).invalidate()._lock=0))}if(!this._initted){if(Ep(this,d?i:h,o,r,l))return this._tTime=0,this;if(a!==this._time&&!(o&&this.vars.repeatRefresh&&g!==m))return this;if(u!==this._dur)return this.render(i,r,o)}if(this._tTime=l,this._time=h,!this._act&&this._ts&&(this._act=1,this._lazy=0),this.ratio=x=(S||this._ease)(h/u),this._from&&(this.ratio=x=1-x),h&&!a&&!r&&!g&&(wn(this,"onStart"),this._tTime!==l))return this;for(f=this._pt;f;)f.r(x,f.d),f=f._next;_&&_.render(i<0?i:_._dur*_._ease(h/this._dur),r,o)||this._startAt&&(this._zTime=i),this._onUpdate&&!r&&(d&&Sc(this,i,r,o),wn(this,"onUpdate")),this._repeat&&g!==m&&this.vars.onRepeat&&!r&&this.parent&&wn(this,"onRepeat"),(l===this._tDur||!l)&&this._tTime===l&&(d&&!this._onUpdate&&Sc(this,i,!0,!0),(i||!u)&&(l===this._tDur&&this._ts>0||!l&&this._ts<0)&&es(this,1),!r&&!(d&&!a)&&(l||a||p)&&(wn(this,l===c?"onComplete":"onReverseComplete",!0),this._prom&&!(l<c&&this.timeScale()>0)&&this._prom()))}return this},t.targets=function(){return this._targets},t.invalidate=function(i){return(!i||!this.vars.runBackwards)&&(this._startAt=0),this._pt=this._op=this._onUpdate=this._lazy=this.ratio=0,this._ptLookup=[],this.timeline&&this.timeline.invalidate(i),s.prototype.invalidate.call(this,i)},t.resetTo=function(i,r,o,a,c){fo||En.wake(),this._ts||this.play();var u=Math.min(this._dur,(this._dp._time-this._start)*this._ts),d;return this._initted||ou(this,u),d=this._ease(u/this._dur),G_(this,i,r,o,a,d,u,c)?this.resetTo(i,r,o,a,1):(Va(this,0),this.parent||Sp(this._dp,this,"_first","_last",this._dp._sort?"_start":0),this.render(0))},t.kill=function(i,r){if(r===void 0&&(r="all"),!i&&(!r||r==="all"))return this._lazy=this._pt=0,this.parent?Jr(this):this;if(this.timeline){var o=this.timeline.totalDuration();return this.timeline.killTweensOf(i,r,ji&&ji.vars.overwrite!==!0)._first||Jr(this),this.parent&&o!==this.timeline.totalDuration()&&mr(this,this._dur*this.timeline._tDur/o,0,1),this}var a=this._targets,c=i?On(i):a,u=this._ptLookup,d=this._pt,l,h,f,g,v,m,p;if((!r||r==="all")&&y_(a,c))return r==="all"&&(this._pt=0),Jr(this);for(l=this._op=this._op||[],r!=="all"&&(zt(r)&&(v={},mn(r,function(x){return v[x]=1}),r=v),r=W_(a,r)),p=a.length;p--;)if(~c.indexOf(a[p])){h=u[p],r==="all"?(l[p]=r,g=h,f={}):(f=l[p]=l[p]||{},g=r);for(v in g)m=h&&h[v],m&&((!("kill"in m.d)||m.d.kill(v)===!0)&&za(this,m,"_pt"),delete h[v]),f!=="all"&&(f[v]=1)}return this._initted&&!this._pt&&d&&Jr(this),this},e.to=function(i,r){return new e(i,r,arguments[2])},e.from=function(i,r){return io(1,arguments)},e.delayedCall=function(i,r,o,a){return new e(r,0,{immediateRender:!1,lazy:!1,overwrite:!1,delay:i,onComplete:r,onReverseComplete:r,onCompleteParams:o,onReverseCompleteParams:o,callbackScope:a})},e.fromTo=function(i,r,o){return io(2,arguments)},e.set=function(i,r){return r.duration=0,r.repeatDelay||(r.repeat=0),new e(i,r)},e.killTweensOf=function(i,r,o){return _t.killTweensOf(i,r,o)},e}(po);Hn(Pt.prototype,{_targets:[],_lazy:0,_startAt:0,_op:0,_onInit:0});mn("staggerTo,staggerFrom,staggerFromTo",function(s){Pt[s]=function(){var e=new an,t=Mc.call(arguments,0);return t.splice(s==="staggerFromTo"?5:4,0,0),e[s].apply(e,t)}});var au=function(e,t,n){return e[t]=n},Wp=function(e,t,n){return e[t](n)},X_=function(e,t,n,i){return e[t](i.fp,n)},$_=function(e,t,n){return e.setAttribute(t,n)},lu=function(e,t){return wt(e[t])?Wp:Jc(e[t])&&e.setAttribute?$_:au},jp=function(e,t){return t.set(t.t,t.p,Math.round((t.s+t.c*e)*1e6)/1e6,t)},q_=function(e,t){return t.set(t.t,t.p,!!(t.s+t.c*e),t)},Xp=function(e,t){var n=t._pt,i="";if(!e&&t.b)i=t.b;else if(e===1&&t.e)i=t.e;else{for(;n;)i=n.p+(n.m?n.m(n.s+n.c*e):Math.round((n.s+n.c*e)*1e4)/1e4)+i,n=n._next;i+=t.c}t.set(t.t,t.p,i,t)},cu=function(e,t){for(var n=t._pt;n;)n.r(e,n.d),n=n._next},Y_=function(e,t,n,i){for(var r=this._pt,o;r;)o=r._next,r.p===i&&r.modifier(e,t,n),r=o},K_=function(e){for(var t=this._pt,n,i;t;)i=t._next,t.p===e&&!t.op||t.op===e?za(this,t,"_pt"):t.dep||(n=1),t=i;return!n},Z_=function(e,t,n,i){i.mSet(e,t,i.m.call(i.tween,n,i.mt),i)},$p=function(e){for(var t=e._pt,n,i,r,o;t;){for(n=t._next,i=r;i&&i.pr>t.pr;)i=i._next;(t._prev=i?i._prev:o)?t._prev._next=t:r=t,(t._next=i)?i._prev=t:o=t,t=n}e._pt=r},gn=function(){function s(t,n,i,r,o,a,c,u,d){this.t=n,this.s=r,this.c=o,this.p=i,this.r=a||jp,this.d=c||this,this.set=u||au,this.pr=d||0,this._next=t,t&&(t._prev=this)}var e=s.prototype;return e.modifier=function(n,i,r){this.mSet=this.mSet||this.set,this.set=Z_,this.m=n,this.mt=r,this.tween=i},s}();mn(iu+"parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger",function(s){return nu[s]=1});An.TweenMax=An.TweenLite=Pt;An.TimelineLite=An.TimelineMax=an;_t=new an({sortChildren:!1,defaults:fr,autoRemoveChildren:!0,id:"root",smoothChildTiming:!0});Tn.stringFilter=Np;var ws=[],ma={},J_=[],uh=0,Q_=0,yl=function(e){return(ma[e]||J_).map(function(t){return t()})},Ac=function(){var e=Date.now(),t=[];e-uh>2&&(yl("matchMediaInit"),ws.forEach(function(n){var i=n.queries,r=n.conditions,o,a,c,u;for(a in i)o=ti.matchMedia(i[a]).matches,o&&(c=1),o!==r[a]&&(r[a]=o,u=1);u&&(n.revert(),c&&t.push(n))}),yl("matchMediaRevert"),t.forEach(function(n){return n.onMatch(n,function(i){return n.add(null,i)})}),uh=e,yl("matchMedia"))},qp=function(){function s(t,n){this.selector=n&&Ec(n),this.data=[],this._r=[],this.isReverted=!1,this.id=Q_++,t&&this.add(t)}var e=s.prototype;return e.add=function(n,i,r){wt(n)&&(r=i,i=n,n=wt);var o=this,a=function(){var u=vt,d=o.selector,l;return u&&u!==o&&u.data.push(o),r&&(o.selector=Ec(r)),vt=o,l=i.apply(o,arguments),wt(l)&&o._r.push(l),vt=u,o.selector=d,o.isReverted=!1,l};return o.last=a,n===wt?a(o,function(c){return o.add(null,c)}):n?o[n]=a:a},e.ignore=function(n){var i=vt;vt=null,n(this),vt=i},e.getTweens=function(){var n=[];return this.data.forEach(function(i){return i instanceof s?n.push.apply(n,i.getTweens()):i instanceof Pt&&!(i.parent&&i.parent.data==="nested")&&n.push(i)}),n},e.clear=function(){this._r.length=this.data.length=0},e.kill=function(n,i){var r=this;if(n?function(){for(var a=r.getTweens(),c=r.data.length,u;c--;)u=r.data[c],u.data==="isFlip"&&(u.revert(),u.getChildren(!0,!0,!1).forEach(function(d){return a.splice(a.indexOf(d),1)}));for(a.map(function(d){return{g:d._dur||d._delay||d._sat&&!d._sat.vars.immediateRender?d.globalTime(0):-1/0,t:d}}).sort(function(d,l){return l.g-d.g||-1/0}).forEach(function(d){return d.t.revert(n)}),c=r.data.length;c--;)u=r.data[c],u instanceof an?u.data!=="nested"&&(u.scrollTrigger&&u.scrollTrigger.revert(),u.kill()):!(u instanceof Pt)&&u.revert&&u.revert(n);r._r.forEach(function(d){return d(n,r)}),r.isReverted=!0}():this.data.forEach(function(a){return a.kill&&a.kill()}),this.clear(),i)for(var o=ws.length;o--;)ws[o].id===this.id&&ws.splice(o,1)},e.revert=function(n){this.kill(n||{})},s}(),e0=function(){function s(t){this.contexts=[],this.scope=t,vt&&vt.data.push(this)}var e=s.prototype;return e.add=function(n,i,r){hi(n)||(n={matches:n});var o=new qp(0,r||this.scope),a=o.conditions={},c,u,d;vt&&!o.selector&&(o.selector=vt.selector),this.contexts.push(o),i=o.add("onMatch",i),o.queries=n;for(u in n)u==="all"?d=1:(c=ti.matchMedia(n[u]),c&&(ws.indexOf(o)<0&&ws.push(o),(a[u]=c.matches)&&(d=1),c.addListener?c.addListener(Ac):c.addEventListener("change",Ac)));return d&&i(o,function(l){return o.add(null,l)}),this},e.revert=function(n){this.kill(n||{})},e.kill=function(n){this.contexts.forEach(function(i){return i.kill(n,!0)})},s}(),wa={registerPlugin:function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];t.forEach(function(i){return Ip(i)})},timeline:function(e){return new an(e)},getTweensOf:function(e,t){return _t.getTweensOf(e,t)},getProperty:function(e,t,n,i){zt(e)&&(e=On(e)[0]);var r=bs(e||{}).get,o=n?yp:xp;return n==="native"&&(n=""),e&&(t?o((Mn[t]&&Mn[t].get||r)(e,t,n,i)):function(a,c,u){return o((Mn[a]&&Mn[a].get||r)(e,a,c,u))})},quickSetter:function(e,t,n){if(e=On(e),e.length>1){var i=e.map(function(d){return _n.quickSetter(d,t,n)}),r=i.length;return function(d){for(var l=r;l--;)i[l](d)}}e=e[0]||{};var o=Mn[t],a=bs(e),c=a.harness&&(a.harness.aliases||{})[t]||t,u=o?function(d){var l=new o;tr._pt=0,l.init(e,n?d+n:d,tr,0,[e]),l.render(1,l),tr._pt&&cu(1,tr)}:a.set(e,c);return o?u:function(d){return u(e,c,n?d+n:d,a,1)}},quickTo:function(e,t,n){var i,r=_n.to(e,Ts((i={},i[t]="+=0.1",i.paused=!0,i),n||{})),o=function(c,u,d){return r.resetTo(t,c,u,d)};return o.tween=r,o},isTweening:function(e){return _t.getTweensOf(e,!0).length>0},defaults:function(e){return e&&e.ease&&(e.ease=Es(e.ease,fr.ease)),rh(fr,e||{})},config:function(e){return rh(Tn,e||{})},registerEffect:function(e){var t=e.name,n=e.effect,i=e.plugins,r=e.defaults,o=e.extendTimeline;(i||"").split(",").forEach(function(a){return a&&!Mn[a]&&!An[a]&&co(t+" effect requires "+a+" plugin.")}),gl[t]=function(a,c,u){return n(On(a),Hn(c||{},r),u)},o&&(an.prototype[t]=function(a,c,u){return this.add(gl[t](a,hi(c)?c:(u=c)&&{},this),u)})},registerEase:function(e,t){$e[e]=Es(t)},parseEase:function(e,t){return arguments.length?Es(e,t):$e},getById:function(e){return _t.getById(e)},exportRoot:function(e,t){e===void 0&&(e={});var n=new an(e),i,r;for(n.smoothChildTiming=pn(e.smoothChildTiming),_t.remove(n),n._dp=0,n._time=n._tTime=_t._time,i=_t._first;i;)r=i._next,(t||!(!i._dur&&i instanceof Pt&&i.vars.onComplete===i._targets[0]))&&ii(n,i,i._start-i._delay),i=r;return ii(_t,n,0),n},context:function(e,t){return e?new qp(e,t):vt},matchMedia:function(e){return new e0(e)},matchMediaRefresh:function(){return ws.forEach(function(e){var t=e.conditions,n,i;for(i in t)t[i]&&(t[i]=!1,n=1);n&&e.revert()})||Ac()},addEventListener:function(e,t){var n=ma[e]||(ma[e]=[]);~n.indexOf(t)||n.push(t)},removeEventListener:function(e,t){var n=ma[e],i=n&&n.indexOf(t);i>=0&&n.splice(i,1)},utils:{wrap:L_,wrapYoyo:I_,distribute:Ap,random:Cp,snap:Dp,normalize:P_,getUnit:en,clamp:A_,splitColor:Up,toArray:On,selector:Ec,mapRange:Pp,pipe:C_,unitize:R_,interpolate:U_,shuffle:Tp},install:pp,effects:gl,ticker:En,updateRoot:an.updateRoot,plugins:Mn,globalTimeline:_t,core:{PropTween:gn,globals:mp,Tween:Pt,Timeline:an,Animation:po,getCache:bs,_removeLinkedListItem:za,reverting:function(){return tn},context:function(e){return e&&vt&&(vt.data.push(e),e._ctx=vt),vt},suppressOverwrites:function(e){return Zc=e}}};mn("to,from,fromTo,delayedCall,set,killTweensOf",function(s){return wa[s]=Pt[s]});En.add(an.updateRoot);tr=wa.to({},{duration:0});var t0=function(e,t){for(var n=e._pt;n&&n.p!==t&&n.op!==t&&n.fp!==t;)n=n._next;return n},n0=function(e,t){var n=e._targets,i,r,o;for(i in t)for(r=n.length;r--;)o=e._ptLookup[r][i],o&&(o=o.d)&&(o._pt&&(o=t0(o,i)),o&&o.modifier&&o.modifier(t[i],e,n[r],i))},Sl=function(e,t){return{name:e,rawVars:1,init:function(i,r,o){o._onInit=function(a){var c,u;if(zt(r)&&(c={},mn(r,function(d){return c[d]=1}),r=c),t){c={};for(u in r)c[u]=t(r[u]);r=c}n0(a,r)}}}},_n=wa.registerPlugin({name:"attr",init:function(e,t,n,i,r){var o,a,c;this.tween=n;for(o in t)c=e.getAttribute(o)||"",a=this.add(e,"setAttribute",(c||0)+"",t[o],i,r,0,0,o),a.op=o,a.b=c,this._props.push(o)},render:function(e,t){for(var n=t._pt;n;)tn?n.set(n.t,n.p,n.b,n):n.r(e,n.d),n=n._next}},{name:"endArray",init:function(e,t){for(var n=t.length;n--;)this.add(e,n,e[n]||0,t[n],0,0,0,0,0,1)}},Sl("roundProps",wc),Sl("modifiers"),Sl("snap",Dp))||wa;Pt.version=an.version=_n.version="3.12.5";fp=1;Qc()&&gr();$e.Power0;$e.Power1;$e.Power2;$e.Power3;$e.Power4;$e.Linear;$e.Quad;$e.Cubic;$e.Quart;$e.Quint;$e.Strong;$e.Elastic;$e.Back;$e.SteppedEase;$e.Bounce;$e.Sine;$e.Expo;$e.Circ;/*!
 * CSSPlugin 3.12.5
 * https://gsap.com
 *
 * Copyright 2008-2024, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license or for
 * Club GSAP members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
*/var hh,Xi,ar,uu,ys,dh,hu,i0=function(){return typeof window<"u"},Ci={},gs=180/Math.PI,lr=Math.PI/180,Ls=Math.atan2,fh=1e8,du=/([A-Z])/g,s0=/(left|right|width|margin|padding|x)/i,r0=/[\s,\(]\S/,oi={autoAlpha:"opacity,visibility",scale:"scaleX,scaleY",alpha:"opacity"},Dc=function(e,t){return t.set(t.t,t.p,Math.round((t.s+t.c*e)*1e4)/1e4+t.u,t)},o0=function(e,t){return t.set(t.t,t.p,e===1?t.e:Math.round((t.s+t.c*e)*1e4)/1e4+t.u,t)},a0=function(e,t){return t.set(t.t,t.p,e?Math.round((t.s+t.c*e)*1e4)/1e4+t.u:t.b,t)},l0=function(e,t){var n=t.s+t.c*e;t.set(t.t,t.p,~~(n+(n<0?-.5:.5))+t.u,t)},Yp=function(e,t){return t.set(t.t,t.p,e?t.e:t.b,t)},Kp=function(e,t){return t.set(t.t,t.p,e!==1?t.b:t.e,t)},c0=function(e,t,n){return e.style[t]=n},u0=function(e,t,n){return e.style.setProperty(t,n)},h0=function(e,t,n){return e._gsap[t]=n},d0=function(e,t,n){return e._gsap.scaleX=e._gsap.scaleY=n},f0=function(e,t,n,i,r){var o=e._gsap;o.scaleX=o.scaleY=n,o.renderTransform(r,o)},p0=function(e,t,n,i,r){var o=e._gsap;o[t]=n,o.renderTransform(r,o)},yt="transform",vn=yt+"Origin",m0=function s(e,t){var n=this,i=this.target,r=i.style,o=i._gsap;if(e in Ci&&r){if(this.tfm=this.tfm||{},e!=="transform")e=oi[e]||e,~e.indexOf(",")?e.split(",").forEach(function(a){return n.tfm[a]=Ei(i,a)}):this.tfm[e]=o.x?o[e]:Ei(i,e),e===vn&&(this.tfm.zOrigin=o.zOrigin);else return oi.transform.split(",").forEach(function(a){return s.call(n,a,t)});if(this.props.indexOf(yt)>=0)return;o.svg&&(this.svgo=i.getAttribute("data-svg-origin"),this.props.push(vn,t,"")),e=yt}(r||t)&&this.props.push(e,t,r[e])},Zp=function(e){e.translate&&(e.removeProperty("translate"),e.removeProperty("scale"),e.removeProperty("rotate"))},g0=function(){var e=this.props,t=this.target,n=t.style,i=t._gsap,r,o;for(r=0;r<e.length;r+=3)e[r+1]?t[e[r]]=e[r+2]:e[r+2]?n[e[r]]=e[r+2]:n.removeProperty(e[r].substr(0,2)==="--"?e[r]:e[r].replace(du,"-$1").toLowerCase());if(this.tfm){for(o in this.tfm)i[o]=this.tfm[o];i.svg&&(i.renderTransform(),t.setAttribute("data-svg-origin",this.svgo||"")),r=hu(),(!r||!r.isStart)&&!n[yt]&&(Zp(n),i.zOrigin&&n[vn]&&(n[vn]+=" "+i.zOrigin+"px",i.zOrigin=0,i.renderTransform()),i.uncache=1)}},Jp=function(e,t){var n={target:e,props:[],revert:g0,save:m0};return e._gsap||_n.core.getCache(e),t&&t.split(",").forEach(function(i){return n.save(i)}),n},Qp,Cc=function(e,t){var n=Xi.createElementNS?Xi.createElementNS((t||"http://www.w3.org/1999/xhtml").replace(/^https/,"http"),e):Xi.createElement(e);return n&&n.style?n:Xi.createElement(e)},li=function s(e,t,n){var i=getComputedStyle(e);return i[t]||i.getPropertyValue(t.replace(du,"-$1").toLowerCase())||i.getPropertyValue(t)||!n&&s(e,vr(t)||t,1)||""},ph="O,Moz,ms,Ms,Webkit".split(","),vr=function(e,t,n){var i=t||ys,r=i.style,o=5;if(e in r&&!n)return e;for(e=e.charAt(0).toUpperCase()+e.substr(1);o--&&!(ph[o]+e in r););return o<0?null:(o===3?"ms":o>=0?ph[o]:"")+e},Rc=function(){i0()&&window.document&&(hh=window,Xi=hh.document,ar=Xi.documentElement,ys=Cc("div")||{style:{}},Cc("div"),yt=vr(yt),vn=yt+"Origin",ys.style.cssText="border-width:0;line-height:0;position:absolute;padding:0",Qp=!!vr("perspective"),hu=_n.core.reverting,uu=1)},bl=function s(e){var t=Cc("svg",this.ownerSVGElement&&this.ownerSVGElement.getAttribute("xmlns")||"http://www.w3.org/2000/svg"),n=this.parentNode,i=this.nextSibling,r=this.style.cssText,o;if(ar.appendChild(t),t.appendChild(this),this.style.display="block",e)try{o=this.getBBox(),this._gsapBBox=this.getBBox,this.getBBox=s}catch{}else this._gsapBBox&&(o=this._gsapBBox());return n&&(i?n.insertBefore(this,i):n.appendChild(this)),ar.removeChild(t),this.style.cssText=r,o},mh=function(e,t){for(var n=t.length;n--;)if(e.hasAttribute(t[n]))return e.getAttribute(t[n])},em=function(e){var t;try{t=e.getBBox()}catch{t=bl.call(e,!0)}return t&&(t.width||t.height)||e.getBBox===bl||(t=bl.call(e,!0)),t&&!t.width&&!t.x&&!t.y?{x:+mh(e,["x","cx","x1"])||0,y:+mh(e,["y","cy","y1"])||0,width:0,height:0}:t},tm=function(e){return!!(e.getCTM&&(!e.parentNode||e.ownerSVGElement)&&em(e))},As=function(e,t){if(t){var n=e.style,i;t in Ci&&t!==vn&&(t=yt),n.removeProperty?(i=t.substr(0,2),(i==="ms"||t.substr(0,6)==="webkit")&&(t="-"+t),n.removeProperty(i==="--"?t:t.replace(du,"-$1").toLowerCase())):n.removeAttribute(t)}},$i=function(e,t,n,i,r,o){var a=new gn(e._pt,t,n,0,1,o?Kp:Yp);return e._pt=a,a.b=i,a.e=r,e._props.push(n),a},gh={deg:1,rad:1,turn:1},v0={grid:1,flex:1},ts=function s(e,t,n,i){var r=parseFloat(n)||0,o=(n+"").trim().substr((r+"").length)||"px",a=ys.style,c=s0.test(t),u=e.tagName.toLowerCase()==="svg",d=(u?"client":"offset")+(c?"Width":"Height"),l=100,h=i==="px",f=i==="%",g,v,m,p;if(i===o||!r||gh[i]||gh[o])return r;if(o!=="px"&&!h&&(r=s(e,t,n,"px")),p=e.getCTM&&tm(e),(f||o==="%")&&(Ci[t]||~t.indexOf("adius")))return g=p?e.getBBox()[c?"width":"height"]:e[d],At(f?r/g*l:r/100*g);if(a[c?"width":"height"]=l+(h?o:i),v=~t.indexOf("adius")||i==="em"&&e.appendChild&&!u?e:e.parentNode,p&&(v=(e.ownerSVGElement||{}).parentNode),(!v||v===Xi||!v.appendChild)&&(v=Xi.body),m=v._gsap,m&&f&&m.width&&c&&m.time===En.time&&!m.uncache)return At(r/m.width*l);if(f&&(t==="height"||t==="width")){var x=e.style[t];e.style[t]=l+i,g=e[d],x?e.style[t]=x:As(e,t)}else(f||o==="%")&&!v0[li(v,"display")]&&(a.position=li(e,"position")),v===e&&(a.position="static"),v.appendChild(ys),g=ys[d],v.removeChild(ys),a.position="absolute";return c&&f&&(m=bs(v),m.time=En.time,m.width=v[d]),At(h?g*r/l:g&&r?l/g*r:0)},Ei=function(e,t,n,i){var r;return uu||Rc(),t in oi&&t!=="transform"&&(t=oi[t],~t.indexOf(",")&&(t=t.split(",")[0])),Ci[t]&&t!=="transform"?(r=go(e,i),r=t!=="transformOrigin"?r[t]:r.svg?r.origin:Aa(li(e,vn))+" "+r.zOrigin+"px"):(r=e.style[t],(!r||r==="auto"||i||~(r+"").indexOf("calc("))&&(r=Ta[t]&&Ta[t](e,t,n)||li(e,t)||vp(e,t)||(t==="opacity"?1:0))),n&&!~(r+"").trim().indexOf(" ")?ts(e,t,r,n)+n:r},_0=function(e,t,n,i){if(!n||n==="none"){var r=vr(t,e,1),o=r&&li(e,r,1);o&&o!==n?(t=r,n=o):t==="borderColor"&&(n=li(e,"borderTopColor"))}var a=new gn(this._pt,e.style,t,0,1,Xp),c=0,u=0,d,l,h,f,g,v,m,p,x,_,S,M;if(a.b=n,a.e=i,n+="",i+="",i==="auto"&&(v=e.style[t],e.style[t]=i,i=li(e,t)||i,v?e.style[t]=v:As(e,t)),d=[n,i],Np(d),n=d[0],i=d[1],h=n.match(er)||[],M=i.match(er)||[],M.length){for(;l=er.exec(i);)m=l[0],x=i.substring(c,l.index),g?g=(g+1)%5:(x.substr(-5)==="rgba("||x.substr(-5)==="hsla(")&&(g=1),m!==(v=h[u++]||"")&&(f=parseFloat(v)||0,S=v.substr((f+"").length),m.charAt(1)==="="&&(m=or(f,m)+S),p=parseFloat(m),_=m.substr((p+"").length),c=er.lastIndex-_.length,_||(_=_||Tn.units[t]||S,c===i.length&&(i+=_,a.e+=_)),S!==_&&(f=ts(e,t,v,_)||0),a._pt={_next:a._pt,p:x||u===1?x:",",s:f,c:p-f,m:g&&g<4||t==="zIndex"?Math.round:0});a.c=c<i.length?i.substring(c,i.length):""}else a.r=t==="display"&&i==="none"?Kp:Yp;return hp.test(i)&&(a.e=0),this._pt=a,a},vh={top:"0%",bottom:"100%",left:"0%",right:"100%",center:"50%"},x0=function(e){var t=e.split(" "),n=t[0],i=t[1]||"50%";return(n==="top"||n==="bottom"||i==="left"||i==="right")&&(e=n,n=i,i=e),t[0]=vh[n]||n,t[1]=vh[i]||i,t.join(" ")},y0=function(e,t){if(t.tween&&t.tween._time===t.tween._dur){var n=t.t,i=n.style,r=t.u,o=n._gsap,a,c,u;if(r==="all"||r===!0)i.cssText="",c=1;else for(r=r.split(","),u=r.length;--u>-1;)a=r[u],Ci[a]&&(c=1,a=a==="transformOrigin"?vn:yt),As(n,a);c&&(As(n,yt),o&&(o.svg&&n.removeAttribute("transform"),go(n,1),o.uncache=1,Zp(i)))}},Ta={clearProps:function(e,t,n,i,r){if(r.data!=="isFromStart"){var o=e._pt=new gn(e._pt,t,n,0,0,y0);return o.u=i,o.pr=-10,o.tween=r,e._props.push(n),1}}},mo=[1,0,0,1,0,0],nm={},im=function(e){return e==="matrix(1, 0, 0, 1, 0, 0)"||e==="none"||!e},_h=function(e){var t=li(e,yt);return im(t)?mo:t.substr(7).match(up).map(At)},fu=function(e,t){var n=e._gsap||bs(e),i=e.style,r=_h(e),o,a,c,u;return n.svg&&e.getAttribute("transform")?(c=e.transform.baseVal.consolidate().matrix,r=[c.a,c.b,c.c,c.d,c.e,c.f],r.join(",")==="1,0,0,1,0,0"?mo:r):(r===mo&&!e.offsetParent&&e!==ar&&!n.svg&&(c=i.display,i.display="block",o=e.parentNode,(!o||!e.offsetParent)&&(u=1,a=e.nextElementSibling,ar.appendChild(e)),r=_h(e),c?i.display=c:As(e,"display"),u&&(a?o.insertBefore(e,a):o?o.appendChild(e):ar.removeChild(e))),t&&r.length>6?[r[0],r[1],r[4],r[5],r[12],r[13]]:r)},Pc=function(e,t,n,i,r,o){var a=e._gsap,c=r||fu(e,!0),u=a.xOrigin||0,d=a.yOrigin||0,l=a.xOffset||0,h=a.yOffset||0,f=c[0],g=c[1],v=c[2],m=c[3],p=c[4],x=c[5],_=t.split(" "),S=parseFloat(_[0])||0,M=parseFloat(_[1])||0,E,w,C,y;n?c!==mo&&(w=f*m-g*v)&&(C=S*(m/w)+M*(-v/w)+(v*x-m*p)/w,y=S*(-g/w)+M*(f/w)-(f*x-g*p)/w,S=C,M=y):(E=em(e),S=E.x+(~_[0].indexOf("%")?S/100*E.width:S),M=E.y+(~(_[1]||_[0]).indexOf("%")?M/100*E.height:M)),i||i!==!1&&a.smooth?(p=S-u,x=M-d,a.xOffset=l+(p*f+x*v)-p,a.yOffset=h+(p*g+x*m)-x):a.xOffset=a.yOffset=0,a.xOrigin=S,a.yOrigin=M,a.smooth=!!i,a.origin=t,a.originIsAbsolute=!!n,e.style[vn]="0px 0px",o&&($i(o,a,"xOrigin",u,S),$i(o,a,"yOrigin",d,M),$i(o,a,"xOffset",l,a.xOffset),$i(o,a,"yOffset",h,a.yOffset)),e.setAttribute("data-svg-origin",S+" "+M)},go=function(e,t){var n=e._gsap||new zp(e);if("x"in n&&!t&&!n.uncache)return n;var i=e.style,r=n.scaleX<0,o="px",a="deg",c=getComputedStyle(e),u=li(e,vn)||"0",d,l,h,f,g,v,m,p,x,_,S,M,E,w,C,y,b,U,z,P,O,F,k,j,D,K,q,te,ve,re,N,Y;return d=l=h=v=m=p=x=_=S=0,f=g=1,n.svg=!!(e.getCTM&&tm(e)),c.translate&&((c.translate!=="none"||c.scale!=="none"||c.rotate!=="none")&&(i[yt]=(c.translate!=="none"?"translate3d("+(c.translate+" 0 0").split(" ").slice(0,3).join(", ")+") ":"")+(c.rotate!=="none"?"rotate("+c.rotate+") ":"")+(c.scale!=="none"?"scale("+c.scale.split(" ").join(",")+") ":"")+(c[yt]!=="none"?c[yt]:"")),i.scale=i.rotate=i.translate="none"),w=fu(e,n.svg),n.svg&&(n.uncache?(D=e.getBBox(),u=n.xOrigin-D.x+"px "+(n.yOrigin-D.y)+"px",j=""):j=!t&&e.getAttribute("data-svg-origin"),Pc(e,j||u,!!j||n.originIsAbsolute,n.smooth!==!1,w)),M=n.xOrigin||0,E=n.yOrigin||0,w!==mo&&(U=w[0],z=w[1],P=w[2],O=w[3],d=F=w[4],l=k=w[5],w.length===6?(f=Math.sqrt(U*U+z*z),g=Math.sqrt(O*O+P*P),v=U||z?Ls(z,U)*gs:0,x=P||O?Ls(P,O)*gs+v:0,x&&(g*=Math.abs(Math.cos(x*lr))),n.svg&&(d-=M-(M*U+E*P),l-=E-(M*z+E*O))):(Y=w[6],re=w[7],q=w[8],te=w[9],ve=w[10],N=w[11],d=w[12],l=w[13],h=w[14],C=Ls(Y,ve),m=C*gs,C&&(y=Math.cos(-C),b=Math.sin(-C),j=F*y+q*b,D=k*y+te*b,K=Y*y+ve*b,q=F*-b+q*y,te=k*-b+te*y,ve=Y*-b+ve*y,N=re*-b+N*y,F=j,k=D,Y=K),C=Ls(-P,ve),p=C*gs,C&&(y=Math.cos(-C),b=Math.sin(-C),j=U*y-q*b,D=z*y-te*b,K=P*y-ve*b,N=O*b+N*y,U=j,z=D,P=K),C=Ls(z,U),v=C*gs,C&&(y=Math.cos(C),b=Math.sin(C),j=U*y+z*b,D=F*y+k*b,z=z*y-U*b,k=k*y-F*b,U=j,F=D),m&&Math.abs(m)+Math.abs(v)>359.9&&(m=v=0,p=180-p),f=At(Math.sqrt(U*U+z*z+P*P)),g=At(Math.sqrt(k*k+Y*Y)),C=Ls(F,k),x=Math.abs(C)>2e-4?C*gs:0,S=N?1/(N<0?-N:N):0),n.svg&&(j=e.getAttribute("transform"),n.forceCSS=e.setAttribute("transform","")||!im(li(e,yt)),j&&e.setAttribute("transform",j))),Math.abs(x)>90&&Math.abs(x)<270&&(r?(f*=-1,x+=v<=0?180:-180,v+=v<=0?180:-180):(g*=-1,x+=x<=0?180:-180)),t=t||n.uncache,n.x=d-((n.xPercent=d&&(!t&&n.xPercent||(Math.round(e.offsetWidth/2)===Math.round(-d)?-50:0)))?e.offsetWidth*n.xPercent/100:0)+o,n.y=l-((n.yPercent=l&&(!t&&n.yPercent||(Math.round(e.offsetHeight/2)===Math.round(-l)?-50:0)))?e.offsetHeight*n.yPercent/100:0)+o,n.z=h+o,n.scaleX=At(f),n.scaleY=At(g),n.rotation=At(v)+a,n.rotationX=At(m)+a,n.rotationY=At(p)+a,n.skewX=x+a,n.skewY=_+a,n.transformPerspective=S+o,(n.zOrigin=parseFloat(u.split(" ")[2])||!t&&n.zOrigin||0)&&(i[vn]=Aa(u)),n.xOffset=n.yOffset=0,n.force3D=Tn.force3D,n.renderTransform=n.svg?b0:Qp?sm:S0,n.uncache=0,n},Aa=function(e){return(e=e.split(" "))[0]+" "+e[1]},Ml=function(e,t,n){var i=en(t);return At(parseFloat(t)+parseFloat(ts(e,"x",n+"px",i)))+i},S0=function(e,t){t.z="0px",t.rotationY=t.rotationX="0deg",t.force3D=0,sm(e,t)},as="0deg",zr="0px",ls=") ",sm=function(e,t){var n=t||this,i=n.xPercent,r=n.yPercent,o=n.x,a=n.y,c=n.z,u=n.rotation,d=n.rotationY,l=n.rotationX,h=n.skewX,f=n.skewY,g=n.scaleX,v=n.scaleY,m=n.transformPerspective,p=n.force3D,x=n.target,_=n.zOrigin,S="",M=p==="auto"&&e&&e!==1||p===!0;if(_&&(l!==as||d!==as)){var E=parseFloat(d)*lr,w=Math.sin(E),C=Math.cos(E),y;E=parseFloat(l)*lr,y=Math.cos(E),o=Ml(x,o,w*y*-_),a=Ml(x,a,-Math.sin(E)*-_),c=Ml(x,c,C*y*-_+_)}m!==zr&&(S+="perspective("+m+ls),(i||r)&&(S+="translate("+i+"%, "+r+"%) "),(M||o!==zr||a!==zr||c!==zr)&&(S+=c!==zr||M?"translate3d("+o+", "+a+", "+c+") ":"translate("+o+", "+a+ls),u!==as&&(S+="rotate("+u+ls),d!==as&&(S+="rotateY("+d+ls),l!==as&&(S+="rotateX("+l+ls),(h!==as||f!==as)&&(S+="skew("+h+", "+f+ls),(g!==1||v!==1)&&(S+="scale("+g+", "+v+ls),x.style[yt]=S||"translate(0, 0)"},b0=function(e,t){var n=t||this,i=n.xPercent,r=n.yPercent,o=n.x,a=n.y,c=n.rotation,u=n.skewX,d=n.skewY,l=n.scaleX,h=n.scaleY,f=n.target,g=n.xOrigin,v=n.yOrigin,m=n.xOffset,p=n.yOffset,x=n.forceCSS,_=parseFloat(o),S=parseFloat(a),M,E,w,C,y;c=parseFloat(c),u=parseFloat(u),d=parseFloat(d),d&&(d=parseFloat(d),u+=d,c+=d),c||u?(c*=lr,u*=lr,M=Math.cos(c)*l,E=Math.sin(c)*l,w=Math.sin(c-u)*-h,C=Math.cos(c-u)*h,u&&(d*=lr,y=Math.tan(u-d),y=Math.sqrt(1+y*y),w*=y,C*=y,d&&(y=Math.tan(d),y=Math.sqrt(1+y*y),M*=y,E*=y)),M=At(M),E=At(E),w=At(w),C=At(C)):(M=l,C=h,E=w=0),(_&&!~(o+"").indexOf("px")||S&&!~(a+"").indexOf("px"))&&(_=ts(f,"x",o,"px"),S=ts(f,"y",a,"px")),(g||v||m||p)&&(_=At(_+g-(g*M+v*w)+m),S=At(S+v-(g*E+v*C)+p)),(i||r)&&(y=f.getBBox(),_=At(_+i/100*y.width),S=At(S+r/100*y.height)),y="matrix("+M+","+E+","+w+","+C+","+_+","+S+")",f.setAttribute("transform",y),x&&(f.style[yt]=y)},M0=function(e,t,n,i,r){var o=360,a=zt(r),c=parseFloat(r)*(a&&~r.indexOf("rad")?gs:1),u=c-i,d=i+u+"deg",l,h;return a&&(l=r.split("_")[1],l==="short"&&(u%=o,u!==u%(o/2)&&(u+=u<0?o:-o)),l==="cw"&&u<0?u=(u+o*fh)%o-~~(u/o)*o:l==="ccw"&&u>0&&(u=(u-o*fh)%o-~~(u/o)*o)),e._pt=h=new gn(e._pt,t,n,i,u,o0),h.e=d,h.u="deg",e._props.push(n),h},xh=function(e,t){for(var n in t)e[n]=t[n];return e},E0=function(e,t,n){var i=xh({},n._gsap),r="perspective,force3D,transformOrigin,svgOrigin",o=n.style,a,c,u,d,l,h,f,g;i.svg?(u=n.getAttribute("transform"),n.setAttribute("transform",""),o[yt]=t,a=go(n,1),As(n,yt),n.setAttribute("transform",u)):(u=getComputedStyle(n)[yt],o[yt]=t,a=go(n,1),o[yt]=u);for(c in Ci)u=i[c],d=a[c],u!==d&&r.indexOf(c)<0&&(f=en(u),g=en(d),l=f!==g?ts(n,c,u,g):parseFloat(u),h=parseFloat(d),e._pt=new gn(e._pt,a,c,l,h-l,Dc),e._pt.u=g||0,e._props.push(c));xh(a,i)};mn("padding,margin,Width,Radius",function(s,e){var t="Top",n="Right",i="Bottom",r="Left",o=(e<3?[t,n,i,r]:[t+r,t+n,i+n,i+r]).map(function(a){return e<2?s+a:"border"+a+s});Ta[e>1?"border"+s:s]=function(a,c,u,d,l){var h,f;if(arguments.length<4)return h=o.map(function(g){return Ei(a,g,u)}),f=h.join(" "),f.split(h[0]).length===5?h[0]:f;h=(d+"").split(" "),f={},o.forEach(function(g,v){return f[g]=h[v]=h[v]||h[(v-1)/2|0]}),a.init(c,f,l)}});var rm={name:"css",register:Rc,targetTest:function(e){return e.style&&e.nodeType},init:function(e,t,n,i,r){var o=this._props,a=e.style,c=n.vars.startAt,u,d,l,h,f,g,v,m,p,x,_,S,M,E,w,C;uu||Rc(),this.styles=this.styles||Jp(e),C=this.styles.props,this.tween=n;for(v in t)if(v!=="autoRound"&&(d=t[v],!(Mn[v]&&Hp(v,t,n,i,e,r)))){if(f=typeof d,g=Ta[v],f==="function"&&(d=d.call(n,i,e,r),f=typeof d),f==="string"&&~d.indexOf("random(")&&(d=ho(d)),g)g(this,e,v,d,n)&&(w=1);else if(v.substr(0,2)==="--")u=(getComputedStyle(e).getPropertyValue(v)+"").trim(),d+="",Ji.lastIndex=0,Ji.test(u)||(m=en(u),p=en(d)),p?m!==p&&(u=ts(e,v,u,p)+p):m&&(d+=m),this.add(a,"setProperty",u,d,i,r,0,0,v),o.push(v),C.push(v,0,a[v]);else if(f!=="undefined"){if(c&&v in c?(u=typeof c[v]=="function"?c[v].call(n,i,e,r):c[v],zt(u)&&~u.indexOf("random(")&&(u=ho(u)),en(u+"")||u==="auto"||(u+=Tn.units[v]||en(Ei(e,v))||""),(u+"").charAt(1)==="="&&(u=Ei(e,v))):u=Ei(e,v),h=parseFloat(u),x=f==="string"&&d.charAt(1)==="="&&d.substr(0,2),x&&(d=d.substr(2)),l=parseFloat(d),v in oi&&(v==="autoAlpha"&&(h===1&&Ei(e,"visibility")==="hidden"&&l&&(h=0),C.push("visibility",0,a.visibility),$i(this,a,"visibility",h?"inherit":"hidden",l?"inherit":"hidden",!l)),v!=="scale"&&v!=="transform"&&(v=oi[v],~v.indexOf(",")&&(v=v.split(",")[0]))),_=v in Ci,_){if(this.styles.save(v),S||(M=e._gsap,M.renderTransform&&!t.parseTransform||go(e,t.parseTransform),E=t.smoothOrigin!==!1&&M.smooth,S=this._pt=new gn(this._pt,a,yt,0,1,M.renderTransform,M,0,-1),S.dep=1),v==="scale")this._pt=new gn(this._pt,M,"scaleY",M.scaleY,(x?or(M.scaleY,x+l):l)-M.scaleY||0,Dc),this._pt.u=0,o.push("scaleY",v),v+="X";else if(v==="transformOrigin"){C.push(vn,0,a[vn]),d=x0(d),M.svg?Pc(e,d,0,E,0,this):(p=parseFloat(d.split(" ")[2])||0,p!==M.zOrigin&&$i(this,M,"zOrigin",M.zOrigin,p),$i(this,a,v,Aa(u),Aa(d)));continue}else if(v==="svgOrigin"){Pc(e,d,1,E,0,this);continue}else if(v in nm){M0(this,M,v,h,x?or(h,x+d):d);continue}else if(v==="smoothOrigin"){$i(this,M,"smooth",M.smooth,d);continue}else if(v==="force3D"){M[v]=d;continue}else if(v==="transform"){E0(this,d,e);continue}}else v in a||(v=vr(v)||v);if(_||(l||l===0)&&(h||h===0)&&!r0.test(d)&&v in a)m=(u+"").substr((h+"").length),l||(l=0),p=en(d)||(v in Tn.units?Tn.units[v]:m),m!==p&&(h=ts(e,v,u,p)),this._pt=new gn(this._pt,_?M:a,v,h,(x?or(h,x+l):l)-h,!_&&(p==="px"||v==="zIndex")&&t.autoRound!==!1?l0:Dc),this._pt.u=p||0,m!==p&&p!=="%"&&(this._pt.b=u,this._pt.r=a0);else if(v in a)_0.call(this,e,v,u,x?x+d:d);else if(v in e)this.add(e,v,u||e[v],x?x+d:d,i,r);else if(v!=="parseTransform"){tu(v,d);continue}_||(v in a?C.push(v,0,a[v]):C.push(v,1,u||e[v])),o.push(v)}}w&&$p(this)},render:function(e,t){if(t.tween._time||!hu())for(var n=t._pt;n;)n.r(e,n.d),n=n._next;else t.styles.revert()},get:Ei,aliases:oi,getSetter:function(e,t,n){var i=oi[t];return i&&i.indexOf(",")<0&&(t=i),t in Ci&&t!==vn&&(e._gsap.x||Ei(e,"x"))?n&&dh===n?t==="scale"?d0:h0:(dh=n||{})&&(t==="scale"?f0:p0):e.style&&!Jc(e.style[t])?c0:~t.indexOf("-")?u0:lu(e,t)},core:{_removeProperty:As,_getMatrix:fu}};_n.utils.checkPrefix=vr;_n.core.getStyleSaver=Jp;(function(s,e,t,n){var i=mn(s+","+e+","+t,function(r){Ci[r]=1});mn(e,function(r){Tn.units[r]="deg",nm[r]=1}),oi[i[13]]=s+","+e,mn(n,function(r){var o=r.split(":");oi[o[1]]=i[o[0]]})})("x,y,z,scale,scaleX,scaleY,xPercent,yPercent","rotation,rotationX,rotationY,skewX,skewY","transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective","0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY");mn("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective",function(s){Tn.units[s]="px"});_n.registerPlugin(rm);var oe=_n.registerPlugin(rm)||_n;oe.core.Tween;class w0{constructor(){this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.count=0,this.time=0,this.prev=0,this.running=!1}start(){this.startTime=El(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getFPS(){return this.time=El(),this.time-1e3>this.prev&&(this.prev=this.time,this.fps=this.count,this.count=0),this.count++,this.fps}getDelta(){let e=0;if(this.running){const t=El();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}}function El(){return(typeof performance>"u"?Date:performance).now()}class Bt{static init(){this.frames=[],this.time=new w0,window.raf=this,this.render=e=>this.frame(e)}static start(){this.stopped=!1,this.time.start(),this.id=window.requestAnimationFrame(this.render)}static stop(e=!1){e&&window.cancelAnimationFrame(this.id),this.time.stop(),this.stopped=!0}static frame(e){const t=this.time.getDelta(),n=this.time.getElapsedTime(),i=this.time.getFPS();if(this.frames.length<1)return!1;for(let r=0;r<this.frames.length&&this.frames.length>0;r++)this.frames.length&&this.frames[r].handler({time:n,delta:t,frame:e,fps:i});this.stopped||(this.id=window.requestAnimationFrame(this.render))}static add(e,t){if(typeof e!="function")throw new Error("Expected function as handler");return typeof t>"u"&&(t=`h_${++this.uidCounter}`),this.frames.push({id:t,handler:e}),this.frames.length===1&&this.start(),t}static moveToFirst(e){if(typeof e>"u")throw new Error("Expected id");const t=this.frames.findIndex(n=>n.id===e);t<0||this.frames.unshift(this.frames.splice(t,1)[0])}static moveToLast(e){if(typeof e>"u")throw new Error("Expected id");const t=this.frames.findIndex(n=>n.id===e);t<0||this.frames.push(this.frames.splice(t,1)[0])}static remove(e){if(typeof e>"u")throw new Error("Expected id");const t=this.frames.findIndex(n=>n.id===e);t<0||(this.frames.splice(t,1),this.frames.length<=0&&this.stop())}}function dn(){if(!(this instanceof dn))return new dn;this.size=0,this.uid=0,this.selectors=[],this.selectorObjects={},this.indexes=Object.create(this.indexes),this.activeIndexes=[]}var Hr=window.document.documentElement,T0=Hr.matches||Hr.webkitMatchesSelector||Hr.mozMatchesSelector||Hr.oMatchesSelector||Hr.msMatchesSelector;dn.prototype.matchesSelector=function(s,e){return T0.call(s,e)};dn.prototype.querySelectorAll=function(s,e){return e.querySelectorAll(s)};dn.prototype.indexes=[];var A0=/^#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;dn.prototype.indexes.push({name:"ID",selector:function(e){var t;if(t=e.match(A0))return t[0].slice(1)},element:function(e){if(e.id)return[e.id]}});var D0=/^\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;dn.prototype.indexes.push({name:"CLASS",selector:function(e){var t;if(t=e.match(D0))return t[0].slice(1)},element:function(e){var t=e.className;if(t){if(typeof t=="string")return t.split(/\s/);if(typeof t=="object"&&"baseVal"in t)return t.baseVal.split(/\s/)}}});var C0=/^((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;dn.prototype.indexes.push({name:"TAG",selector:function(e){var t;if(t=e.match(C0))return t[0].toUpperCase()},element:function(e){return[e.nodeName.toUpperCase()]}});dn.prototype.indexes.default={name:"UNIVERSAL",selector:function(){return!0},element:function(){return[!0]}};var Lc;typeof window.Map=="function"?Lc=window.Map:Lc=function(){function s(){this.map={}}return s.prototype.get=function(e){return this.map[e+" "]},s.prototype.set=function(e,t){this.map[e+" "]=t},s}();var yh=/((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g;function om(s,e){s=s.slice(0).concat(s.default);var t=s.length,n,i,r,o,a=e,c,u,d=[];do if(yh.exec(""),(r=yh.exec(a))&&(a=r[3],r[2]||!a)){for(n=0;n<t;n++)if(u=s[n],c=u.selector(r[1])){for(i=d.length,o=!1;i--;)if(d[i].index===u&&d[i].key===c){o=!0;break}o||d.push({index:u,key:c});break}}while(r);return d}function R0(s,e){var t,n,i;for(t=0,n=s.length;t<n;t++)if(i=s[t],e.isPrototypeOf(i))return i}dn.prototype.logDefaultIndexUsed=function(){};dn.prototype.add=function(s,e){var t,n,i,r,o,a,c,u,d=this.activeIndexes,l=this.selectors,h=this.selectorObjects;if(typeof s=="string"){for(t={id:this.uid++,selector:s,data:e},h[t.id]=t,c=om(this.indexes,s),n=0;n<c.length;n++)u=c[n],r=u.key,i=u.index,o=R0(d,i),o||(o=Object.create(i),o.map=new Lc,d.push(o)),i===this.indexes.default&&this.logDefaultIndexUsed(t),a=o.map.get(r),a||(a=[],o.map.set(r,a)),a.push(t);this.size++,l.push(s)}};dn.prototype.remove=function(s,e){if(typeof s=="string"){var t,n,i,r,o,a,c,u,d=this.activeIndexes,l=this.selectors=[],h=this.selectorObjects,f={},g=arguments.length===1;for(t=om(this.indexes,s),i=0;i<t.length;i++)for(n=t[i],r=d.length;r--;)if(a=d[r],n.index.isPrototypeOf(a)){if(c=a.map.get(n.key),c)for(o=c.length;o--;)u=c[o],u.selector===s&&(g||u.data===e)&&(c.splice(o,1),f[u.id]=!0);break}for(i in f)delete h[i],this.size--;for(i in h)l.push(h[i].selector)}};function am(s,e){return s.id-e.id}dn.prototype.queryAll=function(s){if(!this.selectors.length)return[];var e={},t=[],n=this.querySelectorAll(this.selectors.join(", "),s),i,r,o,a,c,u,d,l;for(i=0,o=n.length;i<o;i++)for(c=n[i],u=this.matches(c),r=0,a=u.length;r<a;r++)l=u[r],e[l.id]?d=e[l.id]:(d={id:l.id,selector:l.selector,data:l.data,elements:[]},e[l.id]=d,t.push(d)),d.elements.push(c);return t.sort(am)};dn.prototype.matches=function(s){if(!s)return[];var e,t,n,i,r,o,a,c,u,d,l,h=this.activeIndexes,f={},g=[];for(e=0,i=h.length;e<i;e++)if(a=h[e],c=a.element(s),c){for(t=0,r=c.length;t<r;t++)if(u=a.map.get(c[t]))for(n=0,o=u.length;n<o;n++)d=u[n],l=d.id,!f[l]&&this.matchesSelector(s,d.selector)&&(f[l]=!0,g.push(d))}return g.sort(am)};class xe{static KEY_DOWN="key_down";static KEY_UP="key_up";static KEY_PRESS="key_press";static RESIZE="resize";static VISIBILITY="visibility";static PROGRESS="progress";static COMPLETE="complete";static UPDATE="update";static HOVER="hover";static CLICK="click";static INIT="INIT";static LOAD_START="LOAD_START";static LOAD_PROGRESS="LOAD_PROGRESS";static LOAD_COMPLETE="LOAD_COMPLETE";static LOAD_END="LOAD_END";static PROJECT_ACTIVE="PROJECT_ACTIVE";static APP_READY="APP_READY";static NAV_CLICK="NAV_CLICK";static ANIMATE_IN="ANIMATE_IN";static ANIMATE_OUT="ANIMATE_OUT";static MOUSE_MOVE="MOUSE_MOVE";static WORK_GALLERY_OUT="WORK_GALLERY_OUT";static FORCE_RESIZE="FORCE_RESIZE";static MODAL_SHOW="MODAL_SHOW"}const Qs={},$n={},Ic=["mouseenter","mouseleave","pointerenter","pointerleave","blur","focus"];function Sh(s){$n[s]===void 0&&($n[s]=[])}function P0(s,e){if($n[s])for(let t=0;t<$n[s].length;t++)$n[s][t](...e)}function bh(s){return typeof s=="string"?document.querySelectorAll(s):s}function No(s){let e=L0(Qs[s.type],s.target);if(e.length)for(let t=0;t<e.length;t++)for(let n=0;n<e[t].stack.length;n++)Ic.indexOf(s.type)!==-1?(Mh(s,e[t].delegatedTarget),s.target===e[t].delegatedTarget&&e[t].stack[n].data(s)):(Mh(s,e[t].delegatedTarget),e[t].stack[n].data(s))}function L0(s,e){const t=[];let n=e;do{if(n.nodeType!==1)break;const i=s.matches(n);i.length&&t.push({delegatedTarget:n,stack:i})}while(n=n.parentElement);return t}function Mh(s,e){Object.defineProperty(s,"currentTarget",{configurable:!0,enumerable:!0,get:()=>e})}function Eh(s){return JSON.parse(JSON.stringify(s))}class I0{bindAll(e,t){t||(t=Object.getOwnPropertyNames(Object.getPrototypeOf(e)));for(let n=0;n<t.length;n++)e[t[n]]=e[t[n]].bind(e)}on(e,t,n,i){const r=e.split(" ");for(let o=0;o<r.length;o++){if(typeof t=="function"&&n===void 0){Sh(r[o]),$n[r[o]].push(t);continue}if(t.nodeType&&t.nodeType===1||t===window||t===document){t.addEventListener(r[o],n,i);continue}t=bh(t);for(let a=0;a<t.length;a++)t[a].addEventListener(r[o],n,i)}}delegate(e,t,n){const i=e.split(" ");for(let r=0;r<i.length;r++){let o=Qs[i[r]];o===void 0&&(o=new dn,Qs[i[r]]=o,Ic.indexOf(i[r])!==-1?document.addEventListener(i[r],No,!0):document.addEventListener(i[r],No)),o.add(t,n)}}off(e,t,n,i){const r=e.split(" ");for(let o=0;o<r.length;o++){if(t===void 0){$n[r[o]]=[];continue}if(typeof t=="function"){Sh(r[o]);for(let c=0;c<$n[r[o]].length;c++)$n[r[o]][c]===t&&$n[r[o]].splice(c,1);continue}const a=Qs[r[o]];if(a!==void 0&&(a.remove(t,n),a.size===0)){delete Qs[r[o]],Ic.indexOf(r[o])!==-1?document.removeEventListener(r[o],No,!0):document.removeEventListener(r[o],No);continue}if(t.removeEventListener!==void 0){t.removeEventListener(r[o],n,i);continue}t=bh(t);for(let c=0;c<t.length;c++)t[c].removeEventListener(r[o],n,i)}}emit(e,...t){P0(e,t)}debugDelegated(){return Eh(Qs)}debugBus(){return Eh($n)}}const pe=new I0;function ga(s="",e=9){return s+"_"+Math.random().toString(36).substr(2,e).toUpperCase()}function U0(s){return typeof HTMLElement=="object"?s instanceof HTMLElement:s&&typeof s=="object"&&s!==null&&s.nodeType===1&&typeof s.nodeName=="string"}class Ht{constructor(e,t=document,n,i="Block",r=!0){this.id=ga(n),this.components=[],this.page=t,U0(e)?this.el=e??null:this.el=this.get(e,t),r&&(this.init(),this.addEvents())}init(){}addEvents(){}destroy(){this.components.forEach(e=>{e.activeObserver&&e.unobserve&&e.unobserve(),e.destroy&&e.destroy()}),this.components=[]}get(e,t=this.el){return t.querySelector(e)}getAll(e,t=this.el){return Array.from(t.querySelectorAll(e))}on(e,t=this.el,n){pe.on(e,t,n)}off(e,t=this.el,n){pe.off(e,t,n)}add(e,t,n=this.el,i=!1){if(i){const r=this.getAll(e,n);r.length&&r.forEach(o=>{if(o){const a=new t(o,this,ga("Component"));this.components.push(a)}})}else{const r=this.get(e,n);if(r){const o=new t(r,this,ga("Component"));this.components.push(o)}}}}class lm extends Ht{init(){super.init(),this.onMouseEnter=this.onMouseEnter.bind(this),this.onMouseClick=this.onMouseClick.bind(this)}addEvents(){super.addEvents(),this.el.hasAttribute("data-sound-click")&&(this.el.addEventListener("click",this.onMouseClick),this.el.addEventListener("mouseenter",this.onMouseEnter))}destroy(){super.destroy(),this.el.hasAttribute("data-sound-hover")&&(this.el.removeEventListener("click",this.onMouseClick),this.el.removeEventListener("mouseenter",this.onMouseEnter))}onMouseClick(){ln.playClick()}onMouseEnter(){ln.playHover()}}class ln{static async init(){this.active=!1,this.intensity=0,this.soundToggle=document.querySelector(".ui-sound-toggle"),this.soundToggleRectContainer=this.soundToggle.querySelector(".ui-sound-toggle-rects"),this.soundToggleRects=this.soundToggle.querySelectorAll(".ui-sound-toggle-rects > rect"),this.toggleSound=this.toggleSound.bind(this),this.onRaf=this.onRaf.bind(this),this.toggleSoundItem=new lm(this.soundToggle,document,"SoundToggle"),Bt.add(this.onRaf,"Sound"),this.addListeners()}static initSounds(){this.drones=new zi.Howl({src:["/audio/drones.webm","/audio/drones.ogg","/audio/drones.mp3"],volume:0,loop:!0}),this.ambient=new zi.Howl({src:["/audio/ambient.webm","/audio/ambient.ogg","/audio/ambient-2.mp3"],volume:0,loop:!0}),this.hover=new zi.Howl({src:["/audio/eerie.webm","/audio/eerie.ogg","/audio/eerie.mp3"],volume:.65,rate:.25}),this.click=new zi.Howl({src:["/audio/eerie.webm","/audio/eerie.ogg","/audio/eerie.mp3"],volume:.15,rate:.75}),this.woosh=new zi.Howl({src:["/audio/woosh.webm","/audio/woosh.ogg","/audio/woosh.mp3"],volume:.25,rate:1.8}),this.plucks=new zi.Howl({src:["/audio/plucks.webm","/audio/plucks.ogg","/audio/plucks.mp3"],volume:.25}),this.softWoosh=new zi.Howl({src:["/audio/soft-woosh.webm","/audio/soft-woosh.ogg","/audio/soft-woosh.mp3"],volume:.25,rate:1.5})}static toggleSound(){Le.SOUND=!Le.SOUND,Le.SOUND?(this.playAmbient(),this.startAnimateSoundButton()):(this.stopAmbient(),this.stopAnimationSoundButton())}static stopAnimationSoundButton(){oe.to(this,{intensity:0,duration:1}),this.soundToggle.classList.remove("is-active")}static startAnimateSoundButton(){oe.to(this,{intensity:1,duration:1}),this.soundToggle.classList.add("is-active")}static showSoundButton(){this.soundToggle.style.pointerEvents="auto",oe.to(this.soundToggle,{opacity:1,duration:.5})}static onRaf({time:e,delta:t,frame:n,fps:i}){if(this.intensity!==0)for(let r=0;r<this.soundToggleRects.length;r++){const o=Math.cos(e*3+r*.5)*2.5*this.intensity;this.soundToggleRects[r].style.transform=`translateY(${o}px)`}}static addListeners(){document.addEventListener("visibilitychange",this.onVisibility),window.addEventListener("pointerdown",this.onPointerDown),this.soundToggle.addEventListener("click",this.toggleSound)}static playAmbient(){this.ambient.play(),this.drones.play(),this.ambient.fade(0,.2,5e3),this.drones.fade(0,.1,5e3)}static async stopAmbient(){this.ambient.fade(this.ambient.volume(),0,500),this.drones.fade(this.drones.volume(),0,500)}static playHover(){Le.SOUND&&(this.hover.play(),this.hover.fade(.6,0,1e3))}static playWoosh(){Le.SOUND&&this.woosh.play()}static playSoftWoosh(){Le.SOUND&&this.softWoosh.play()}static playClick(){Le.SOUND&&this.click.play()}static playPlucks(){Le.SOUND&&this.plucks.play()}static onVisibility=()=>{Le.SOUND&&(document.hidden?this.stopAmbient():this.playAmbient())};static onPointerDown=()=>{window.removeEventListener("pointerdown",this.onPointerDown)}}const F0=new DOMParser;function N0(s){return typeof s=="string"?F0.parseFromString(s,"text/html"):s}function O0(){return new Promise(s=>{document.readyState=="loading"?document.addEventListener("DOMContentLoaded",s):s()})}const cm=()=>{const s=window.matchMedia("(pointer:coarse)");return s&&s.matches};navigator.userAgent.indexOf("Firefox")>-1;const um=!!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);window.chrome&&(window.chrome.webstore||window.chrome.runtime);function k0(s){return new Promise((e,t)=>{var n={lossy:"UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",lossless:"UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==",alpha:"UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA==",animation:"UklGRlIAAABXRUJQVlA4WAoAAAASAAAAAAAAAAAAQU5JTQYAAAD/////AABBTk1GJgAAAAAAAAAAAAAAAAAAAGQAAABWUDhMDQAAAC8AAAAQBxAREYiI/gcA"},i=new Image;i.onload=function(){i.width>0&&i.height>0?e(s):t(s)},i.onerror=function(){t(s)},i.src="data:image/webp;base64,"+n[s]})}class Pe{static async init(){this.el=document.querySelector(".gl"),this.w=this.el.offsetWidth,this.h=this.el.offsetHeight,this.aspect=1,this.scroll={x:0,y:0},this.mouse={x:innerWidth/2,y:innerHeight/2,normalized:{x:.5,y:.5}},Le.MOBILE=this.isMobile=cm(),this.inMobileMode=this.w<=Le.BREAKPOINTS.LG,this.maxDpr=Le.LOW_RES?1.5:2,this.dpr=Math.min(this.maxDpr,window.devicePixelRatio),this.addListeners(),this.onResize()}static updateDpr(e){this.maxDpr=e,this.dpr=um&&!this.isMobile?1:this.maxDpr,this.onResize()}static addListeners(){pe.on(xe.FORCE_RESIZE,this.onResize),addEventListener("resize",this.onResize,{passive:!0}),addEventListener("mousemove",this.onMouseMove)}static onResize=()=>{this.w=this.el.offsetWidth,this.h=this.el.offsetHeight,this.aspect=this.w/this.h,pe.emit(xe.RESIZE,{w:this.w,h:this.h})};static onMouseMove=({clientX:e,clientY:t})=>{this.mouse.x=e,this.mouse.y=t,this.mouse.normalized={x:this.mouse.x/this.w,y:1-this.mouse.y/this.h},pe.emit(xe.MOUSE_MOVE,this.mouse,{w:this.w,h:this.h})}}/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const pu="164",B0=0,wh=1,z0=2,hm=1,H0=2,bi=3,Ri=0,hn=1,si=2,ot=0,cr=1,Uc=2,Th=3,Ah=4,V0=5,_s=100,G0=101,W0=102,j0=103,X0=104,$0=200,q0=201,Y0=202,K0=203,Fc=204,Nc=205,Z0=206,J0=207,Q0=208,ex=209,tx=210,nx=211,ix=212,sx=213,rx=214,ox=0,ax=1,lx=2,Da=3,cx=4,ux=5,hx=6,dx=7,dm=0,fx=1,px=2,Qi=0,mx=1,gx=2,vx=3,_x=4,xx=5,yx=6,Sx=7,Dh="attached",bx="detached",fm=300,_r=301,xr=302,Oc=303,kc=304,Ga=306,ci=1e3,ai=1001,vo=1002,cn=1003,pm=1004,eo=1005,jt=1006,va=1007,wi=1008,ns=1009,Mx=1010,Ex=1011,mm=1012,gm=1013,yr=1014,kn=1015,Wa=1016,vm=1017,_m=1018,Eo=1020,wx=35902,Tx=1021,Ax=1022,Bn=1023,Dx=1024,Cx=1025,ur=1026,_o=1027,xm=1028,ym=1029,Rx=1030,Sm=1031,bm=1033,wl=33776,Tl=33777,Al=33778,Dl=33779,Ch=35840,Rh=35841,Ph=35842,Lh=35843,Ih=36196,Uh=37492,Fh=37496,Nh=37808,Oh=37809,kh=37810,Bh=37811,zh=37812,Hh=37813,Vh=37814,Gh=37815,Wh=37816,jh=37817,Xh=37818,$h=37819,qh=37820,Yh=37821,Cl=36492,Kh=36494,Zh=36495,Px=36283,Jh=36284,Qh=36285,ed=36286,xo=2300,Sr=2301,Rl=2302,td=2400,nd=2401,id=2402,Lx=2500,Ix=0,Mm=1,Bc=2,Ux=3200,Fx=3201,Em=0,Nx=1,Gi="",Gt="srgb",$t="srgb-linear",mu="display-p3",ja="display-p3-linear",Ca="linear",pt="srgb",Ra="rec709",Pa="p3",Is=7680,sd=519,Ox=512,kx=513,Bx=514,wm=515,zx=516,Hx=517,Vx=518,Gx=519,zc=35044,lt="300 es",Ti=2e3,La=2001;class Dr{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const i=this._listeners[e];if(i!==void 0){const r=i.indexOf(t);r!==-1&&i.splice(r,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const n=this._listeners[e.type];if(n!==void 0){e.target=this;const i=n.slice(0);for(let r=0,o=i.length;r<o;r++)i[r].call(this,e);e.target=null}}}const Zt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let rd=1234567;const ro=Math.PI/180,br=180/Math.PI;function Yn(){const s=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Zt[s&255]+Zt[s>>8&255]+Zt[s>>16&255]+Zt[s>>24&255]+"-"+Zt[e&255]+Zt[e>>8&255]+"-"+Zt[e>>16&15|64]+Zt[e>>24&255]+"-"+Zt[t&63|128]+Zt[t>>8&255]+"-"+Zt[t>>16&255]+Zt[t>>24&255]+Zt[n&255]+Zt[n>>8&255]+Zt[n>>16&255]+Zt[n>>24&255]).toLowerCase()}function Qt(s,e,t){return Math.max(e,Math.min(t,s))}function gu(s,e){return(s%e+e)%e}function Wx(s,e,t,n,i){return n+(s-e)*(i-n)/(t-e)}function jx(s,e,t){return s!==e?(t-s)/(e-s):0}function oo(s,e,t){return(1-t)*s+t*e}function Xx(s,e,t,n){return oo(s,e,1-Math.exp(-t*n))}function $x(s,e=1){return e-Math.abs(gu(s,e*2)-e)}function qx(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*(3-2*s))}function Yx(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*s*(s*(s*6-15)+10))}function Kx(s,e){return s+Math.floor(Math.random()*(e-s+1))}function Zx(s,e){return s+Math.random()*(e-s)}function Jx(s){return s*(.5-Math.random())}function Qx(s){s!==void 0&&(rd=s);let e=rd+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function ey(s){return s*ro}function ty(s){return s*br}function ny(s){return(s&s-1)===0&&s!==0}function iy(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function sy(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function ry(s,e,t,n,i){const r=Math.cos,o=Math.sin,a=r(t/2),c=o(t/2),u=r((e+n)/2),d=o((e+n)/2),l=r((e-n)/2),h=o((e-n)/2),f=r((n-e)/2),g=o((n-e)/2);switch(i){case"XYX":s.set(a*d,c*l,c*h,a*u);break;case"YZY":s.set(c*h,a*d,c*l,a*u);break;case"ZXZ":s.set(c*l,c*h,a*d,a*u);break;case"XZX":s.set(a*d,c*g,c*f,a*u);break;case"YXY":s.set(c*f,a*d,c*g,a*u);break;case"ZYZ":s.set(c*g,c*f,a*d,a*u);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}}function qn(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("Invalid component type.")}}function nt(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("Invalid component type.")}}const _a={DEG2RAD:ro,RAD2DEG:br,generateUUID:Yn,clamp:Qt,euclideanModulo:gu,mapLinear:Wx,inverseLerp:jx,lerp:oo,damp:Xx,pingpong:$x,smoothstep:qx,smootherstep:Yx,randInt:Kx,randFloat:Zx,randFloatSpread:Jx,seededRandom:Qx,degToRad:ey,radToDeg:ty,isPowerOfTwo:ny,ceilPowerOfTwo:iy,floorPowerOfTwo:sy,setQuaternionFromProperEuler:ry,normalize:nt,denormalize:qn};class Q{constructor(e=0,t=0){Q.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Qt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),i=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*n-o*i+e.x,this.y=r*i+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Ne{constructor(e,t,n,i,r,o,a,c,u){Ne.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,i,r,o,a,c,u)}set(e,t,n,i,r,o,a,c,u){const d=this.elements;return d[0]=e,d[1]=i,d[2]=a,d[3]=t,d[4]=r,d[5]=c,d[6]=n,d[7]=o,d[8]=u,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,r=this.elements,o=n[0],a=n[3],c=n[6],u=n[1],d=n[4],l=n[7],h=n[2],f=n[5],g=n[8],v=i[0],m=i[3],p=i[6],x=i[1],_=i[4],S=i[7],M=i[2],E=i[5],w=i[8];return r[0]=o*v+a*x+c*M,r[3]=o*m+a*_+c*E,r[6]=o*p+a*S+c*w,r[1]=u*v+d*x+l*M,r[4]=u*m+d*_+l*E,r[7]=u*p+d*S+l*w,r[2]=h*v+f*x+g*M,r[5]=h*m+f*_+g*E,r[8]=h*p+f*S+g*w,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],o=e[4],a=e[5],c=e[6],u=e[7],d=e[8];return t*o*d-t*a*u-n*r*d+n*a*c+i*r*u-i*o*c}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],o=e[4],a=e[5],c=e[6],u=e[7],d=e[8],l=d*o-a*u,h=a*c-d*r,f=u*r-o*c,g=t*l+n*h+i*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/g;return e[0]=l*v,e[1]=(i*u-d*n)*v,e[2]=(a*n-i*o)*v,e[3]=h*v,e[4]=(d*t-i*c)*v,e[5]=(i*r-a*t)*v,e[6]=f*v,e[7]=(n*c-u*t)*v,e[8]=(o*t-n*r)*v,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,r,o,a){const c=Math.cos(r),u=Math.sin(r);return this.set(n*c,n*u,-n*(c*o+u*a)+o+e,-i*u,i*c,-i*(-u*o+c*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(Pl.makeScale(e,t)),this}rotate(e){return this.premultiply(Pl.makeRotation(-e)),this}translate(e,t){return this.premultiply(Pl.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Pl=new Ne;function Tm(s){for(let e=s.length-1;e>=0;--e)if(s[e]>=65535)return!0;return!1}function yo(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function oy(){const s=yo("canvas");return s.style.display="block",s}const od={};function Am(s){s in od||(od[s]=!0,console.warn(s))}const ad=new Ne().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),ld=new Ne().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),Oo={[$t]:{transfer:Ca,primaries:Ra,toReference:s=>s,fromReference:s=>s},[Gt]:{transfer:pt,primaries:Ra,toReference:s=>s.convertSRGBToLinear(),fromReference:s=>s.convertLinearToSRGB()},[ja]:{transfer:Ca,primaries:Pa,toReference:s=>s.applyMatrix3(ld),fromReference:s=>s.applyMatrix3(ad)},[mu]:{transfer:pt,primaries:Pa,toReference:s=>s.convertSRGBToLinear().applyMatrix3(ld),fromReference:s=>s.applyMatrix3(ad).convertLinearToSRGB()}},ay=new Set([$t,ja]),Je={enabled:!0,_workingColorSpace:$t,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(s){if(!ay.has(s))throw new Error(`Unsupported working color space, "${s}".`);this._workingColorSpace=s},convert:function(s,e,t){if(this.enabled===!1||e===t||!e||!t)return s;const n=Oo[e].toReference,i=Oo[t].fromReference;return i(n(s))},fromWorkingColorSpace:function(s,e){return this.convert(s,this._workingColorSpace,e)},toWorkingColorSpace:function(s,e){return this.convert(s,e,this._workingColorSpace)},getPrimaries:function(s){return Oo[s].primaries},getTransfer:function(s){return s===Gi?Ca:Oo[s].transfer}};function hr(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function Ll(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}let Us;class ly{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Us===void 0&&(Us=yo("canvas")),Us.width=e.width,Us.height=e.height;const n=Us.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=Us}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=yo("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const i=n.getImageData(0,0,e.width,e.height),r=i.data;for(let o=0;o<r.length;o++)r[o]=hr(r[o]/255)*255;return n.putImageData(i,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(hr(t[n]/255)*255):t[n]=hr(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let cy=0;class Dm{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:cy++}),this.uuid=Yn(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let r;if(Array.isArray(i)){r=[];for(let o=0,a=i.length;o<a;o++)i[o].isDataTexture?r.push(Il(i[o].image)):r.push(Il(i[o]))}else r=Il(i);n.url=r}return t||(e.images[this.uuid]=n),n}}function Il(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?ly.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let uy=0;class Ut extends Dr{constructor(e=Ut.DEFAULT_IMAGE,t=Ut.DEFAULT_MAPPING,n=ai,i=ai,r=jt,o=wi,a=Bn,c=ns,u=Ut.DEFAULT_ANISOTROPY,d=Gi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:uy++}),this.uuid=Yn(),this.name="",this.source=new Dm(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=r,this.minFilter=o,this.anisotropy=u,this.format=a,this.internalFormat=null,this.type=c,this.offset=new Q(0,0),this.repeat=new Q(1,1),this.center=new Q(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ne,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=d,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==fm)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case ci:e.x=e.x-Math.floor(e.x);break;case ai:e.x=e.x<0?0:1;break;case vo:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case ci:e.y=e.y-Math.floor(e.y);break;case ai:e.y=e.y<0?0:1;break;case vo:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Ut.DEFAULT_IMAGE=null;Ut.DEFAULT_MAPPING=fm;Ut.DEFAULT_ANISOTROPY=1;class st{constructor(e=0,t=0,n=0,i=1){st.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*i+o[12]*r,this.y=o[1]*t+o[5]*n+o[9]*i+o[13]*r,this.z=o[2]*t+o[6]*n+o[10]*i+o[14]*r,this.w=o[3]*t+o[7]*n+o[11]*i+o[15]*r,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,i,r;const c=e.elements,u=c[0],d=c[4],l=c[8],h=c[1],f=c[5],g=c[9],v=c[2],m=c[6],p=c[10];if(Math.abs(d-h)<.01&&Math.abs(l-v)<.01&&Math.abs(g-m)<.01){if(Math.abs(d+h)<.1&&Math.abs(l+v)<.1&&Math.abs(g+m)<.1&&Math.abs(u+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const _=(u+1)/2,S=(f+1)/2,M=(p+1)/2,E=(d+h)/4,w=(l+v)/4,C=(g+m)/4;return _>S&&_>M?_<.01?(n=0,i=.707106781,r=.707106781):(n=Math.sqrt(_),i=E/n,r=w/n):S>M?S<.01?(n=.707106781,i=0,r=.707106781):(i=Math.sqrt(S),n=E/i,r=C/i):M<.01?(n=.707106781,i=.707106781,r=0):(r=Math.sqrt(M),n=w/r,i=C/r),this.set(n,i,r,t),this}let x=Math.sqrt((m-g)*(m-g)+(l-v)*(l-v)+(h-d)*(h-d));return Math.abs(x)<.001&&(x=1),this.x=(m-g)/x,this.y=(l-v)/x,this.z=(h-d)/x,this.w=Math.acos((u+f+p-1)/2),this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class hy extends Dr{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new st(0,0,e,t),this.scissorTest=!1,this.viewport=new st(0,0,e,t);const i={width:e,height:t,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:jt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const r=new Ut(i,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);r.flipY=!1,r.generateMipmaps=n.generateMipmaps,r.internalFormat=n.internalFormat,this.textures=[];const o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let i=0,r=this.textures.length;i<r;i++)this.textures[i].image.width=e,this.textures[i].image.height=t,this.textures[i].image.depth=n;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let n=0,i=e.textures.length;n<i;n++)this.textures[n]=e.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new Dm(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Dn extends hy{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class Cm extends Ut{constructor(e=null,t=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=cn,this.minFilter=cn,this.wrapR=ai,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class dy extends Ut{constructor(e=null,t=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=cn,this.minFilter=cn,this.wrapR=ai,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class rs{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,r,o,a){let c=n[i+0],u=n[i+1],d=n[i+2],l=n[i+3];const h=r[o+0],f=r[o+1],g=r[o+2],v=r[o+3];if(a===0){e[t+0]=c,e[t+1]=u,e[t+2]=d,e[t+3]=l;return}if(a===1){e[t+0]=h,e[t+1]=f,e[t+2]=g,e[t+3]=v;return}if(l!==v||c!==h||u!==f||d!==g){let m=1-a;const p=c*h+u*f+d*g+l*v,x=p>=0?1:-1,_=1-p*p;if(_>Number.EPSILON){const M=Math.sqrt(_),E=Math.atan2(M,p*x);m=Math.sin(m*E)/M,a=Math.sin(a*E)/M}const S=a*x;if(c=c*m+h*S,u=u*m+f*S,d=d*m+g*S,l=l*m+v*S,m===1-a){const M=1/Math.sqrt(c*c+u*u+d*d+l*l);c*=M,u*=M,d*=M,l*=M}}e[t]=c,e[t+1]=u,e[t+2]=d,e[t+3]=l}static multiplyQuaternionsFlat(e,t,n,i,r,o){const a=n[i],c=n[i+1],u=n[i+2],d=n[i+3],l=r[o],h=r[o+1],f=r[o+2],g=r[o+3];return e[t]=a*g+d*l+c*f-u*h,e[t+1]=c*g+d*h+u*l-a*f,e[t+2]=u*g+d*f+a*h-c*l,e[t+3]=d*g-a*l-c*h-u*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,i=e._y,r=e._z,o=e._order,a=Math.cos,c=Math.sin,u=a(n/2),d=a(i/2),l=a(r/2),h=c(n/2),f=c(i/2),g=c(r/2);switch(o){case"XYZ":this._x=h*d*l+u*f*g,this._y=u*f*l-h*d*g,this._z=u*d*g+h*f*l,this._w=u*d*l-h*f*g;break;case"YXZ":this._x=h*d*l+u*f*g,this._y=u*f*l-h*d*g,this._z=u*d*g-h*f*l,this._w=u*d*l+h*f*g;break;case"ZXY":this._x=h*d*l-u*f*g,this._y=u*f*l+h*d*g,this._z=u*d*g+h*f*l,this._w=u*d*l-h*f*g;break;case"ZYX":this._x=h*d*l-u*f*g,this._y=u*f*l+h*d*g,this._z=u*d*g-h*f*l,this._w=u*d*l+h*f*g;break;case"YZX":this._x=h*d*l+u*f*g,this._y=u*f*l+h*d*g,this._z=u*d*g-h*f*l,this._w=u*d*l-h*f*g;break;case"XZY":this._x=h*d*l-u*f*g,this._y=u*f*l-h*d*g,this._z=u*d*g+h*f*l,this._w=u*d*l+h*f*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],i=t[4],r=t[8],o=t[1],a=t[5],c=t[9],u=t[2],d=t[6],l=t[10],h=n+a+l;if(h>0){const f=.5/Math.sqrt(h+1);this._w=.25/f,this._x=(d-c)*f,this._y=(r-u)*f,this._z=(o-i)*f}else if(n>a&&n>l){const f=2*Math.sqrt(1+n-a-l);this._w=(d-c)/f,this._x=.25*f,this._y=(i+o)/f,this._z=(r+u)/f}else if(a>l){const f=2*Math.sqrt(1+a-n-l);this._w=(r-u)/f,this._x=(i+o)/f,this._y=.25*f,this._z=(c+d)/f}else{const f=2*Math.sqrt(1+l-n-a);this._w=(o-i)/f,this._x=(r+u)/f,this._y=(c+d)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Qt(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,i=e._y,r=e._z,o=e._w,a=t._x,c=t._y,u=t._z,d=t._w;return this._x=n*d+o*a+i*u-r*c,this._y=i*d+o*c+r*a-n*u,this._z=r*d+o*u+n*c-i*a,this._w=o*d-n*a-i*c-r*u,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,i=this._y,r=this._z,o=this._w;let a=o*e._w+n*e._x+i*e._y+r*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=i,this._z=r,this;const c=1-a*a;if(c<=Number.EPSILON){const f=1-t;return this._w=f*o+t*this._w,this._x=f*n+t*this._x,this._y=f*i+t*this._y,this._z=f*r+t*this._z,this.normalize(),this}const u=Math.sqrt(c),d=Math.atan2(u,a),l=Math.sin((1-t)*d)/u,h=Math.sin(t*d)/u;return this._w=o*l+this._w*h,this._x=n*l+this._x*h,this._y=i*l+this._y*h,this._z=r*l+this._z*h,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(i*Math.sin(e),i*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class L{constructor(e=0,t=0,n=0){L.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(cd.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(cd.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*i,this.y=r[1]*t+r[4]*n+r[7]*i,this.z=r[2]*t+r[5]*n+r[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,r=e.elements,o=1/(r[3]*t+r[7]*n+r[11]*i+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*i+r[12])*o,this.y=(r[1]*t+r[5]*n+r[9]*i+r[13])*o,this.z=(r[2]*t+r[6]*n+r[10]*i+r[14])*o,this}applyQuaternion(e){const t=this.x,n=this.y,i=this.z,r=e.x,o=e.y,a=e.z,c=e.w,u=2*(o*i-a*n),d=2*(a*t-r*i),l=2*(r*n-o*t);return this.x=t+c*u+o*l-a*d,this.y=n+c*d+a*u-r*l,this.z=i+c*l+r*d-o*u,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*i,this.y=r[1]*t+r[5]*n+r[9]*i,this.z=r[2]*t+r[6]*n+r[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,i=e.y,r=e.z,o=t.x,a=t.y,c=t.z;return this.x=i*c-r*a,this.y=r*o-n*c,this.z=n*a-i*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Ul.copy(this).projectOnVector(e),this.sub(Ul)}reflect(e){return this.sub(Ul.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Qt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Ul=new L,cd=new rs;class Pi{constructor(e=new L(1/0,1/0,1/0),t=new L(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Gn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Gn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=Gn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Gn):Gn.fromBufferAttribute(r,o),Gn.applyMatrix4(e.matrixWorld),this.expandByPoint(Gn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),ko.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),ko.copy(n.boundingBox)),ko.applyMatrix4(e.matrixWorld),this.union(ko)}const i=e.children;for(let r=0,o=i.length;r<o;r++)this.expandByObject(i[r],t);return this}containsPoint(e){return!(e.x<this.min.x||e.x>this.max.x||e.y<this.min.y||e.y>this.max.y||e.z<this.min.z||e.z>this.max.z)}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return!(e.max.x<this.min.x||e.min.x>this.max.x||e.max.y<this.min.y||e.min.y>this.max.y||e.max.z<this.min.z||e.min.z>this.max.z)}intersectsSphere(e){return this.clampPoint(e.center,Gn),Gn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Vr),Bo.subVectors(this.max,Vr),Fs.subVectors(e.a,Vr),Ns.subVectors(e.b,Vr),Os.subVectors(e.c,Vr),Ii.subVectors(Ns,Fs),Ui.subVectors(Os,Ns),cs.subVectors(Fs,Os);let t=[0,-Ii.z,Ii.y,0,-Ui.z,Ui.y,0,-cs.z,cs.y,Ii.z,0,-Ii.x,Ui.z,0,-Ui.x,cs.z,0,-cs.x,-Ii.y,Ii.x,0,-Ui.y,Ui.x,0,-cs.y,cs.x,0];return!Fl(t,Fs,Ns,Os,Bo)||(t=[1,0,0,0,1,0,0,0,1],!Fl(t,Fs,Ns,Os,Bo))?!1:(zo.crossVectors(Ii,Ui),t=[zo.x,zo.y,zo.z],Fl(t,Fs,Ns,Os,Bo))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Gn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Gn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(gi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),gi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),gi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),gi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),gi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),gi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),gi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),gi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(gi),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const gi=[new L,new L,new L,new L,new L,new L,new L,new L],Gn=new L,ko=new Pi,Fs=new L,Ns=new L,Os=new L,Ii=new L,Ui=new L,cs=new L,Vr=new L,Bo=new L,zo=new L,us=new L;function Fl(s,e,t,n,i){for(let r=0,o=s.length-3;r<=o;r+=3){us.fromArray(s,r);const a=i.x*Math.abs(us.x)+i.y*Math.abs(us.y)+i.z*Math.abs(us.z),c=e.dot(us),u=t.dot(us),d=n.dot(us);if(Math.max(-Math.max(c,u,d),Math.min(c,u,d))>a)return!1}return!0}const fy=new Pi,Gr=new L,Nl=new L;class fi{constructor(e=new L,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):fy.setFromPoints(e).getCenter(n);let i=0;for(let r=0,o=e.length;r<o;r++)i=Math.max(i,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Gr.subVectors(e,this.center);const t=Gr.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),i=(n-this.radius)*.5;this.center.addScaledVector(Gr,i/n),this.radius+=i}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Nl.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Gr.copy(e.center).add(Nl)),this.expandByPoint(Gr.copy(e.center).sub(Nl))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const vi=new L,Ol=new L,Ho=new L,Fi=new L,kl=new L,Vo=new L,Bl=new L;class wo{constructor(e=new L,t=new L(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,vi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=vi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(vi.copy(this.origin).addScaledVector(this.direction,t),vi.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){Ol.copy(e).add(t).multiplyScalar(.5),Ho.copy(t).sub(e).normalize(),Fi.copy(this.origin).sub(Ol);const r=e.distanceTo(t)*.5,o=-this.direction.dot(Ho),a=Fi.dot(this.direction),c=-Fi.dot(Ho),u=Fi.lengthSq(),d=Math.abs(1-o*o);let l,h,f,g;if(d>0)if(l=o*c-a,h=o*a-c,g=r*d,l>=0)if(h>=-g)if(h<=g){const v=1/d;l*=v,h*=v,f=l*(l+o*h+2*a)+h*(o*l+h+2*c)+u}else h=r,l=Math.max(0,-(o*h+a)),f=-l*l+h*(h+2*c)+u;else h=-r,l=Math.max(0,-(o*h+a)),f=-l*l+h*(h+2*c)+u;else h<=-g?(l=Math.max(0,-(-o*r+a)),h=l>0?-r:Math.min(Math.max(-r,-c),r),f=-l*l+h*(h+2*c)+u):h<=g?(l=0,h=Math.min(Math.max(-r,-c),r),f=h*(h+2*c)+u):(l=Math.max(0,-(o*r+a)),h=l>0?r:Math.min(Math.max(-r,-c),r),f=-l*l+h*(h+2*c)+u);else h=o>0?-r:r,l=Math.max(0,-(o*h+a)),f=-l*l+h*(h+2*c)+u;return n&&n.copy(this.origin).addScaledVector(this.direction,l),i&&i.copy(Ol).addScaledVector(Ho,h),f}intersectSphere(e,t){vi.subVectors(e.center,this.origin);const n=vi.dot(this.direction),i=vi.dot(vi)-n*n,r=e.radius*e.radius;if(i>r)return null;const o=Math.sqrt(r-i),a=n-o,c=n+o;return c<0?null:a<0?this.at(c,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,r,o,a,c;const u=1/this.direction.x,d=1/this.direction.y,l=1/this.direction.z,h=this.origin;return u>=0?(n=(e.min.x-h.x)*u,i=(e.max.x-h.x)*u):(n=(e.max.x-h.x)*u,i=(e.min.x-h.x)*u),d>=0?(r=(e.min.y-h.y)*d,o=(e.max.y-h.y)*d):(r=(e.max.y-h.y)*d,o=(e.min.y-h.y)*d),n>o||r>i||((r>n||isNaN(n))&&(n=r),(o<i||isNaN(i))&&(i=o),l>=0?(a=(e.min.z-h.z)*l,c=(e.max.z-h.z)*l):(a=(e.max.z-h.z)*l,c=(e.min.z-h.z)*l),n>c||a>i)||((a>n||n!==n)&&(n=a),(c<i||i!==i)&&(i=c),i<0)?null:this.at(n>=0?n:i,t)}intersectsBox(e){return this.intersectBox(e,vi)!==null}intersectTriangle(e,t,n,i,r){kl.subVectors(t,e),Vo.subVectors(n,e),Bl.crossVectors(kl,Vo);let o=this.direction.dot(Bl),a;if(o>0){if(i)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Fi.subVectors(this.origin,e);const c=a*this.direction.dot(Vo.crossVectors(Fi,Vo));if(c<0)return null;const u=a*this.direction.dot(kl.cross(Fi));if(u<0||c+u>o)return null;const d=-a*Fi.dot(Bl);return d<0?null:this.at(d/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Ce{constructor(e,t,n,i,r,o,a,c,u,d,l,h,f,g,v,m){Ce.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,i,r,o,a,c,u,d,l,h,f,g,v,m)}set(e,t,n,i,r,o,a,c,u,d,l,h,f,g,v,m){const p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=i,p[1]=r,p[5]=o,p[9]=a,p[13]=c,p[2]=u,p[6]=d,p[10]=l,p[14]=h,p[3]=f,p[7]=g,p[11]=v,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Ce().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,i=1/ks.setFromMatrixColumn(e,0).length(),r=1/ks.setFromMatrixColumn(e,1).length(),o=1/ks.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,i=e.y,r=e.z,o=Math.cos(n),a=Math.sin(n),c=Math.cos(i),u=Math.sin(i),d=Math.cos(r),l=Math.sin(r);if(e.order==="XYZ"){const h=o*d,f=o*l,g=a*d,v=a*l;t[0]=c*d,t[4]=-c*l,t[8]=u,t[1]=f+g*u,t[5]=h-v*u,t[9]=-a*c,t[2]=v-h*u,t[6]=g+f*u,t[10]=o*c}else if(e.order==="YXZ"){const h=c*d,f=c*l,g=u*d,v=u*l;t[0]=h+v*a,t[4]=g*a-f,t[8]=o*u,t[1]=o*l,t[5]=o*d,t[9]=-a,t[2]=f*a-g,t[6]=v+h*a,t[10]=o*c}else if(e.order==="ZXY"){const h=c*d,f=c*l,g=u*d,v=u*l;t[0]=h-v*a,t[4]=-o*l,t[8]=g+f*a,t[1]=f+g*a,t[5]=o*d,t[9]=v-h*a,t[2]=-o*u,t[6]=a,t[10]=o*c}else if(e.order==="ZYX"){const h=o*d,f=o*l,g=a*d,v=a*l;t[0]=c*d,t[4]=g*u-f,t[8]=h*u+v,t[1]=c*l,t[5]=v*u+h,t[9]=f*u-g,t[2]=-u,t[6]=a*c,t[10]=o*c}else if(e.order==="YZX"){const h=o*c,f=o*u,g=a*c,v=a*u;t[0]=c*d,t[4]=v-h*l,t[8]=g*l+f,t[1]=l,t[5]=o*d,t[9]=-a*d,t[2]=-u*d,t[6]=f*l+g,t[10]=h-v*l}else if(e.order==="XZY"){const h=o*c,f=o*u,g=a*c,v=a*u;t[0]=c*d,t[4]=-l,t[8]=u*d,t[1]=h*l+v,t[5]=o*d,t[9]=f*l-g,t[2]=g*l-f,t[6]=a*d,t[10]=v*l+h}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(py,e,my)}lookAt(e,t,n){const i=this.elements;return Sn.subVectors(e,t),Sn.lengthSq()===0&&(Sn.z=1),Sn.normalize(),Ni.crossVectors(n,Sn),Ni.lengthSq()===0&&(Math.abs(n.z)===1?Sn.x+=1e-4:Sn.z+=1e-4,Sn.normalize(),Ni.crossVectors(n,Sn)),Ni.normalize(),Go.crossVectors(Sn,Ni),i[0]=Ni.x,i[4]=Go.x,i[8]=Sn.x,i[1]=Ni.y,i[5]=Go.y,i[9]=Sn.y,i[2]=Ni.z,i[6]=Go.z,i[10]=Sn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,r=this.elements,o=n[0],a=n[4],c=n[8],u=n[12],d=n[1],l=n[5],h=n[9],f=n[13],g=n[2],v=n[6],m=n[10],p=n[14],x=n[3],_=n[7],S=n[11],M=n[15],E=i[0],w=i[4],C=i[8],y=i[12],b=i[1],U=i[5],z=i[9],P=i[13],O=i[2],F=i[6],k=i[10],j=i[14],D=i[3],K=i[7],q=i[11],te=i[15];return r[0]=o*E+a*b+c*O+u*D,r[4]=o*w+a*U+c*F+u*K,r[8]=o*C+a*z+c*k+u*q,r[12]=o*y+a*P+c*j+u*te,r[1]=d*E+l*b+h*O+f*D,r[5]=d*w+l*U+h*F+f*K,r[9]=d*C+l*z+h*k+f*q,r[13]=d*y+l*P+h*j+f*te,r[2]=g*E+v*b+m*O+p*D,r[6]=g*w+v*U+m*F+p*K,r[10]=g*C+v*z+m*k+p*q,r[14]=g*y+v*P+m*j+p*te,r[3]=x*E+_*b+S*O+M*D,r[7]=x*w+_*U+S*F+M*K,r[11]=x*C+_*z+S*k+M*q,r[15]=x*y+_*P+S*j+M*te,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],i=e[8],r=e[12],o=e[1],a=e[5],c=e[9],u=e[13],d=e[2],l=e[6],h=e[10],f=e[14],g=e[3],v=e[7],m=e[11],p=e[15];return g*(+r*c*l-i*u*l-r*a*h+n*u*h+i*a*f-n*c*f)+v*(+t*c*f-t*u*h+r*o*h-i*o*f+i*u*d-r*c*d)+m*(+t*u*l-t*a*f-r*o*l+n*o*f+r*a*d-n*u*d)+p*(-i*a*d-t*c*l+t*a*h+i*o*l-n*o*h+n*c*d)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const i=this.elements;return e.isVector3?(i[12]=e.x,i[13]=e.y,i[14]=e.z):(i[12]=e,i[13]=t,i[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],o=e[4],a=e[5],c=e[6],u=e[7],d=e[8],l=e[9],h=e[10],f=e[11],g=e[12],v=e[13],m=e[14],p=e[15],x=l*m*u-v*h*u+v*c*f-a*m*f-l*c*p+a*h*p,_=g*h*u-d*m*u-g*c*f+o*m*f+d*c*p-o*h*p,S=d*v*u-g*l*u+g*a*f-o*v*f-d*a*p+o*l*p,M=g*l*c-d*v*c-g*a*h+o*v*h+d*a*m-o*l*m,E=t*x+n*_+i*S+r*M;if(E===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const w=1/E;return e[0]=x*w,e[1]=(v*h*r-l*m*r-v*i*f+n*m*f+l*i*p-n*h*p)*w,e[2]=(a*m*r-v*c*r+v*i*u-n*m*u-a*i*p+n*c*p)*w,e[3]=(l*c*r-a*h*r-l*i*u+n*h*u+a*i*f-n*c*f)*w,e[4]=_*w,e[5]=(d*m*r-g*h*r+g*i*f-t*m*f-d*i*p+t*h*p)*w,e[6]=(g*c*r-o*m*r-g*i*u+t*m*u+o*i*p-t*c*p)*w,e[7]=(o*h*r-d*c*r+d*i*u-t*h*u-o*i*f+t*c*f)*w,e[8]=S*w,e[9]=(g*l*r-d*v*r-g*n*f+t*v*f+d*n*p-t*l*p)*w,e[10]=(o*v*r-g*a*r+g*n*u-t*v*u-o*n*p+t*a*p)*w,e[11]=(d*a*r-o*l*r-d*n*u+t*l*u+o*n*f-t*a*f)*w,e[12]=M*w,e[13]=(d*v*i-g*l*i+g*n*h-t*v*h-d*n*m+t*l*m)*w,e[14]=(g*a*i-o*v*i-g*n*c+t*v*c+o*n*m-t*a*m)*w,e[15]=(o*l*i-d*a*i+d*n*c-t*l*c-o*n*h+t*a*h)*w,this}scale(e){const t=this.elements,n=e.x,i=e.y,r=e.z;return t[0]*=n,t[4]*=i,t[8]*=r,t[1]*=n,t[5]*=i,t[9]*=r,t[2]*=n,t[6]*=i,t[10]*=r,t[3]*=n,t[7]*=i,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),i=Math.sin(t),r=1-n,o=e.x,a=e.y,c=e.z,u=r*o,d=r*a;return this.set(u*o+n,u*a-i*c,u*c+i*a,0,u*a+i*c,d*a+n,d*c-i*o,0,u*c-i*a,d*c+i*o,r*c*c+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,r,o){return this.set(1,n,r,0,e,1,o,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){const i=this.elements,r=t._x,o=t._y,a=t._z,c=t._w,u=r+r,d=o+o,l=a+a,h=r*u,f=r*d,g=r*l,v=o*d,m=o*l,p=a*l,x=c*u,_=c*d,S=c*l,M=n.x,E=n.y,w=n.z;return i[0]=(1-(v+p))*M,i[1]=(f+S)*M,i[2]=(g-_)*M,i[3]=0,i[4]=(f-S)*E,i[5]=(1-(h+p))*E,i[6]=(m+x)*E,i[7]=0,i[8]=(g+_)*w,i[9]=(m-x)*w,i[10]=(1-(h+v))*w,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){const i=this.elements;let r=ks.set(i[0],i[1],i[2]).length();const o=ks.set(i[4],i[5],i[6]).length(),a=ks.set(i[8],i[9],i[10]).length();this.determinant()<0&&(r=-r),e.x=i[12],e.y=i[13],e.z=i[14],Wn.copy(this);const u=1/r,d=1/o,l=1/a;return Wn.elements[0]*=u,Wn.elements[1]*=u,Wn.elements[2]*=u,Wn.elements[4]*=d,Wn.elements[5]*=d,Wn.elements[6]*=d,Wn.elements[8]*=l,Wn.elements[9]*=l,Wn.elements[10]*=l,t.setFromRotationMatrix(Wn),n.x=r,n.y=o,n.z=a,this}makePerspective(e,t,n,i,r,o,a=Ti){const c=this.elements,u=2*r/(t-e),d=2*r/(n-i),l=(t+e)/(t-e),h=(n+i)/(n-i);let f,g;if(a===Ti)f=-(o+r)/(o-r),g=-2*o*r/(o-r);else if(a===La)f=-o/(o-r),g=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=u,c[4]=0,c[8]=l,c[12]=0,c[1]=0,c[5]=d,c[9]=h,c[13]=0,c[2]=0,c[6]=0,c[10]=f,c[14]=g,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,i,r,o,a=Ti){const c=this.elements,u=1/(t-e),d=1/(n-i),l=1/(o-r),h=(t+e)*u,f=(n+i)*d;let g,v;if(a===Ti)g=(o+r)*l,v=-2*l;else if(a===La)g=r*l,v=-1*l;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=2*u,c[4]=0,c[8]=0,c[12]=-h,c[1]=0,c[5]=2*d,c[9]=0,c[13]=-f,c[2]=0,c[6]=0,c[10]=v,c[14]=-g,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const ks=new L,Wn=new Ce,py=new L(0,0,0),my=new L(1,1,1),Ni=new L,Go=new L,Sn=new L,ud=new Ce,hd=new rs;class di{constructor(e=0,t=0,n=0,i=di.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const i=e.elements,r=i[0],o=i[4],a=i[8],c=i[1],u=i[5],d=i[9],l=i[2],h=i[6],f=i[10];switch(t){case"XYZ":this._y=Math.asin(Qt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-d,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(h,u),this._z=0);break;case"YXZ":this._x=Math.asin(-Qt(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(c,u)):(this._y=Math.atan2(-l,r),this._z=0);break;case"ZXY":this._x=Math.asin(Qt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-l,f),this._z=Math.atan2(-o,u)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-Qt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(h,f),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-o,u));break;case"YZX":this._z=Math.asin(Qt(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-d,u),this._y=Math.atan2(-l,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-Qt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(h,u),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-d,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return ud.makeRotationFromQuaternion(e),this.setFromRotationMatrix(ud,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return hd.setFromEuler(this),this.setFromQuaternion(hd,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}di.DEFAULT_ORDER="XYZ";class vu{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let gy=0;const dd=new L,Bs=new rs,_i=new Ce,Wo=new L,Wr=new L,vy=new L,_y=new rs,fd=new L(1,0,0),pd=new L(0,1,0),md=new L(0,0,1),gd={type:"added"},xy={type:"removed"},zs={type:"childadded",child:null},zl={type:"childremoved",child:null};class St extends Dr{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:gy++}),this.uuid=Yn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=St.DEFAULT_UP.clone();const e=new L,t=new di,n=new rs,i=new L(1,1,1);function r(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Ce},normalMatrix:{value:new Ne}}),this.matrix=new Ce,this.matrixWorld=new Ce,this.matrixAutoUpdate=St.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=St.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new vu,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Bs.setFromAxisAngle(e,t),this.quaternion.multiply(Bs),this}rotateOnWorldAxis(e,t){return Bs.setFromAxisAngle(e,t),this.quaternion.premultiply(Bs),this}rotateX(e){return this.rotateOnAxis(fd,e)}rotateY(e){return this.rotateOnAxis(pd,e)}rotateZ(e){return this.rotateOnAxis(md,e)}translateOnAxis(e,t){return dd.copy(e).applyQuaternion(this.quaternion),this.position.add(dd.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(fd,e)}translateY(e){return this.translateOnAxis(pd,e)}translateZ(e){return this.translateOnAxis(md,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(_i.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Wo.copy(e):Wo.set(e,t,n);const i=this.parent;this.updateWorldMatrix(!0,!1),Wr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?_i.lookAt(Wr,Wo,this.up):_i.lookAt(Wo,Wr,this.up),this.quaternion.setFromRotationMatrix(_i),i&&(_i.extractRotation(i.matrixWorld),Bs.setFromRotationMatrix(_i),this.quaternion.premultiply(Bs.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(gd),zs.child=e,this.dispatchEvent(zs),zs.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(xy),zl.child=e,this.dispatchEvent(zl),zl.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),_i.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),_i.multiply(e.parent.matrixWorld)),e.applyMatrix4(_i),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(gd),zs.child=e,this.dispatchEvent(zs),zs.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){const o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const i=this.children;for(let r=0,o=i.length;r<o;r++)i[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Wr,e,vy),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Wr,_y,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,i=t.length;n<i;n++){const r=t[n];(r.matrixWorldAutoUpdate===!0||e===!0)&&r.updateMatrixWorld(e)}}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.matrixWorldAutoUpdate===!0&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),t===!0){const i=this.children;for(let r=0,o=i.length;r<o;r++){const a=i[r];a.matrixWorldAutoUpdate===!0&&a.updateWorldMatrix(!1,!0)}}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const i={};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.visibility=this._visibility,i.active=this._active,i.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),i.maxGeometryCount=this._maxGeometryCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.geometryCount=this._geometryCount,i.matricesTexture=this._matricesTexture.toJSON(e),this.boundingSphere!==null&&(i.boundingSphere={center:i.boundingSphere.center.toArray(),radius:i.boundingSphere.radius}),this.boundingBox!==null&&(i.boundingBox={min:i.boundingBox.min.toArray(),max:i.boundingBox.max.toArray()}));function r(a,c){return a[c.uuid]===void 0&&(a[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=r(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const c=a.shapes;if(Array.isArray(c))for(let u=0,d=c.length;u<d;u++){const l=c[u];r(e.shapes,l)}else r(e.shapes,c)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let c=0,u=this.material.length;c<u;c++)a.push(r(e.materials,this.material[c]));i.material=a}else i.material=r(e.materials,this.material);if(this.children.length>0){i.children=[];for(let a=0;a<this.children.length;a++)i.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let a=0;a<this.animations.length;a++){const c=this.animations[a];i.animations.push(r(e.animations,c))}}if(t){const a=o(e.geometries),c=o(e.materials),u=o(e.textures),d=o(e.images),l=o(e.shapes),h=o(e.skeletons),f=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),c.length>0&&(n.materials=c),u.length>0&&(n.textures=u),d.length>0&&(n.images=d),l.length>0&&(n.shapes=l),h.length>0&&(n.skeletons=h),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=i,n;function o(a){const c=[];for(const u in a){const d=a[u];delete d.metadata,c.push(d)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const i=e.children[n];this.add(i.clone())}return this}}St.DEFAULT_UP=new L(0,1,0);St.DEFAULT_MATRIX_AUTO_UPDATE=!0;St.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const jn=new L,xi=new L,Hl=new L,yi=new L,Hs=new L,Vs=new L,vd=new L,Vl=new L,Gl=new L,Wl=new L;class ri{constructor(e=new L,t=new L,n=new L){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),jn.subVectors(e,t),i.cross(jn);const r=i.lengthSq();return r>0?i.multiplyScalar(1/Math.sqrt(r)):i.set(0,0,0)}static getBarycoord(e,t,n,i,r){jn.subVectors(i,t),xi.subVectors(n,t),Hl.subVectors(e,t);const o=jn.dot(jn),a=jn.dot(xi),c=jn.dot(Hl),u=xi.dot(xi),d=xi.dot(Hl),l=o*u-a*a;if(l===0)return r.set(0,0,0),null;const h=1/l,f=(u*c-a*d)*h,g=(o*d-a*c)*h;return r.set(1-f-g,g,f)}static containsPoint(e,t,n,i){return this.getBarycoord(e,t,n,i,yi)===null?!1:yi.x>=0&&yi.y>=0&&yi.x+yi.y<=1}static getInterpolation(e,t,n,i,r,o,a,c){return this.getBarycoord(e,t,n,i,yi)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,yi.x),c.addScaledVector(o,yi.y),c.addScaledVector(a,yi.z),c)}static isFrontFacing(e,t,n,i){return jn.subVectors(n,t),xi.subVectors(e,t),jn.cross(xi).dot(i)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return jn.subVectors(this.c,this.b),xi.subVectors(this.a,this.b),jn.cross(xi).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return ri.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return ri.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,i,r){return ri.getInterpolation(e,this.a,this.b,this.c,t,n,i,r)}containsPoint(e){return ri.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return ri.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,i=this.b,r=this.c;let o,a;Hs.subVectors(i,n),Vs.subVectors(r,n),Vl.subVectors(e,n);const c=Hs.dot(Vl),u=Vs.dot(Vl);if(c<=0&&u<=0)return t.copy(n);Gl.subVectors(e,i);const d=Hs.dot(Gl),l=Vs.dot(Gl);if(d>=0&&l<=d)return t.copy(i);const h=c*l-d*u;if(h<=0&&c>=0&&d<=0)return o=c/(c-d),t.copy(n).addScaledVector(Hs,o);Wl.subVectors(e,r);const f=Hs.dot(Wl),g=Vs.dot(Wl);if(g>=0&&f<=g)return t.copy(r);const v=f*u-c*g;if(v<=0&&u>=0&&g<=0)return a=u/(u-g),t.copy(n).addScaledVector(Vs,a);const m=d*g-f*l;if(m<=0&&l-d>=0&&f-g>=0)return vd.subVectors(r,i),a=(l-d)/(l-d+(f-g)),t.copy(i).addScaledVector(vd,a);const p=1/(m+v+h);return o=v*p,a=h*p,t.copy(n).addScaledVector(Hs,o).addScaledVector(Vs,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Rm={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Oi={h:0,s:0,l:0},jo={h:0,s:0,l:0};function jl(s,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?s+(e-s)*6*t:t<1/2?e:t<2/3?s+(e-s)*6*(2/3-t):s}class ye{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const i=e;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Gt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Je.toWorkingColorSpace(this,t),this}setRGB(e,t,n,i=Je.workingColorSpace){return this.r=e,this.g=t,this.b=n,Je.toWorkingColorSpace(this,i),this}setHSL(e,t,n,i=Je.workingColorSpace){if(e=gu(e,1),t=Qt(t,0,1),n=Qt(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,o=2*n-r;this.r=jl(o,r,e+1/3),this.g=jl(o,r,e),this.b=jl(o,r,e-1/3)}return Je.toWorkingColorSpace(this,i),this}setStyle(e,t=Gt){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const o=i[1],a=i[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=i[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Gt){const n=Rm[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=hr(e.r),this.g=hr(e.g),this.b=hr(e.b),this}copyLinearToSRGB(e){return this.r=Ll(e.r),this.g=Ll(e.g),this.b=Ll(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Gt){return Je.fromWorkingColorSpace(Jt.copy(this),e),Math.round(Qt(Jt.r*255,0,255))*65536+Math.round(Qt(Jt.g*255,0,255))*256+Math.round(Qt(Jt.b*255,0,255))}getHexString(e=Gt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Je.workingColorSpace){Je.fromWorkingColorSpace(Jt.copy(this),t);const n=Jt.r,i=Jt.g,r=Jt.b,o=Math.max(n,i,r),a=Math.min(n,i,r);let c,u;const d=(a+o)/2;if(a===o)c=0,u=0;else{const l=o-a;switch(u=d<=.5?l/(o+a):l/(2-o-a),o){case n:c=(i-r)/l+(i<r?6:0);break;case i:c=(r-n)/l+2;break;case r:c=(n-i)/l+4;break}c/=6}return e.h=c,e.s=u,e.l=d,e}getRGB(e,t=Je.workingColorSpace){return Je.fromWorkingColorSpace(Jt.copy(this),t),e.r=Jt.r,e.g=Jt.g,e.b=Jt.b,e}getStyle(e=Gt){Je.fromWorkingColorSpace(Jt.copy(this),e);const t=Jt.r,n=Jt.g,i=Jt.b;return e!==Gt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(e,t,n){return this.getHSL(Oi),this.setHSL(Oi.h+e,Oi.s+t,Oi.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Oi),e.getHSL(jo);const n=oo(Oi.h,jo.h,t),i=oo(Oi.s,jo.s,t),r=oo(Oi.l,jo.l,t);return this.setHSL(n,i,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,i=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*i,this.g=r[1]*t+r[4]*n+r[7]*i,this.b=r[2]*t+r[5]*n+r[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Jt=new ye;ye.NAMES=Rm;let yy=0;class ui extends Dr{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:yy++}),this.uuid=Yn(),this.name="",this.type="Material",this.blending=cr,this.side=Ri,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Fc,this.blendDst=Nc,this.blendEquation=_s,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new ye(0,0,0),this.blendAlpha=0,this.depthFunc=Da,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=sd,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Is,this.stencilZFail=Is,this.stencilZPass=Is,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBuild(){}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const i=this[t];if(i===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==cr&&(n.blending=this.blending),this.side!==Ri&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Fc&&(n.blendSrc=this.blendSrc),this.blendDst!==Nc&&(n.blendDst=this.blendDst),this.blendEquation!==_s&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Da&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==sd&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Is&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Is&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Is&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(r){const o=[];for(const a in r){const c=r[a];delete c.metadata,o.push(c)}return o}if(t){const r=i(e.textures),o=i(e.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const i=t.length;n=new Array(i);for(let r=0;r!==i;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class Ai extends ui{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new ye(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new di,this.combine=dm,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Ct=new L,Xo=new Q;class It{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=zc,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.gpuType=kn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return Am("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,r=this.itemSize;i<r;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Xo.fromBufferAttribute(this,t),Xo.applyMatrix3(e),this.setXY(t,Xo.x,Xo.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Ct.fromBufferAttribute(this,t),Ct.applyMatrix3(e),this.setXYZ(t,Ct.x,Ct.y,Ct.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Ct.fromBufferAttribute(this,t),Ct.applyMatrix4(e),this.setXYZ(t,Ct.x,Ct.y,Ct.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Ct.fromBufferAttribute(this,t),Ct.applyNormalMatrix(e),this.setXYZ(t,Ct.x,Ct.y,Ct.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Ct.fromBufferAttribute(this,t),Ct.transformDirection(e),this.setXYZ(t,Ct.x,Ct.y,Ct.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=qn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=nt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=qn(t,this.array)),t}setX(e,t){return this.normalized&&(t=nt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=qn(t,this.array)),t}setY(e,t){return this.normalized&&(t=nt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=qn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=nt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=qn(t,this.array)),t}setW(e,t){return this.normalized&&(t=nt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=nt(t,this.array),n=nt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.normalized&&(t=nt(t,this.array),n=nt(n,this.array),i=nt(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e*=this.itemSize,this.normalized&&(t=nt(t,this.array),n=nt(n,this.array),i=nt(i,this.array),r=nt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==zc&&(e.usage=this.usage),e}}class Pm extends It{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class Lm extends It{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class bt extends It{constructor(e,t,n){super(new Float32Array(e),t,n)}}let Sy=0;const Ln=new Ce,Xl=new St,Gs=new L,bn=new Pi,jr=new Pi,Ot=new L;class Vt extends Dr{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Sy++}),this.uuid=Yn(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Tm(e)?Lm:Pm)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Ne().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(e),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Ln.makeRotationFromQuaternion(e),this.applyMatrix4(Ln),this}rotateX(e){return Ln.makeRotationX(e),this.applyMatrix4(Ln),this}rotateY(e){return Ln.makeRotationY(e),this.applyMatrix4(Ln),this}rotateZ(e){return Ln.makeRotationZ(e),this.applyMatrix4(Ln),this}translate(e,t,n){return Ln.makeTranslation(e,t,n),this.applyMatrix4(Ln),this}scale(e,t,n){return Ln.makeScale(e,t,n),this.applyMatrix4(Ln),this}lookAt(e){return Xl.lookAt(e),Xl.updateMatrix(),this.applyMatrix4(Xl.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Gs).negate(),this.translate(Gs.x,Gs.y,Gs.z),this}setFromPoints(e){const t=[];for(let n=0,i=e.length;n<i;n++){const r=e[n];t.push(r.x,r.y,r.z||0)}return this.setAttribute("position",new bt(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Pi);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new L(-1/0,-1/0,-1/0),new L(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){const r=t[n];bn.setFromBufferAttribute(r),this.morphTargetsRelative?(Ot.addVectors(this.boundingBox.min,bn.min),this.boundingBox.expandByPoint(Ot),Ot.addVectors(this.boundingBox.max,bn.max),this.boundingBox.expandByPoint(Ot)):(this.boundingBox.expandByPoint(bn.min),this.boundingBox.expandByPoint(bn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new fi);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new L,1/0);return}if(e){const n=this.boundingSphere.center;if(bn.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){const a=t[r];jr.setFromBufferAttribute(a),this.morphTargetsRelative?(Ot.addVectors(bn.min,jr.min),bn.expandByPoint(Ot),Ot.addVectors(bn.max,jr.max),bn.expandByPoint(Ot)):(bn.expandByPoint(jr.min),bn.expandByPoint(jr.max))}bn.getCenter(n);let i=0;for(let r=0,o=e.count;r<o;r++)Ot.fromBufferAttribute(e,r),i=Math.max(i,n.distanceToSquared(Ot));if(t)for(let r=0,o=t.length;r<o;r++){const a=t[r],c=this.morphTargetsRelative;for(let u=0,d=a.count;u<d;u++)Ot.fromBufferAttribute(a,u),c&&(Gs.fromBufferAttribute(e,u),Ot.add(Gs)),i=Math.max(i,n.distanceToSquared(Ot))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,i=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new It(new Float32Array(4*n.count),4));const o=this.getAttribute("tangent"),a=[],c=[];for(let C=0;C<n.count;C++)a[C]=new L,c[C]=new L;const u=new L,d=new L,l=new L,h=new Q,f=new Q,g=new Q,v=new L,m=new L;function p(C,y,b){u.fromBufferAttribute(n,C),d.fromBufferAttribute(n,y),l.fromBufferAttribute(n,b),h.fromBufferAttribute(r,C),f.fromBufferAttribute(r,y),g.fromBufferAttribute(r,b),d.sub(u),l.sub(u),f.sub(h),g.sub(h);const U=1/(f.x*g.y-g.x*f.y);isFinite(U)&&(v.copy(d).multiplyScalar(g.y).addScaledVector(l,-f.y).multiplyScalar(U),m.copy(l).multiplyScalar(f.x).addScaledVector(d,-g.x).multiplyScalar(U),a[C].add(v),a[y].add(v),a[b].add(v),c[C].add(m),c[y].add(m),c[b].add(m))}let x=this.groups;x.length===0&&(x=[{start:0,count:e.count}]);for(let C=0,y=x.length;C<y;++C){const b=x[C],U=b.start,z=b.count;for(let P=U,O=U+z;P<O;P+=3)p(e.getX(P+0),e.getX(P+1),e.getX(P+2))}const _=new L,S=new L,M=new L,E=new L;function w(C){M.fromBufferAttribute(i,C),E.copy(M);const y=a[C];_.copy(y),_.sub(M.multiplyScalar(M.dot(y))).normalize(),S.crossVectors(E,y);const U=S.dot(c[C])<0?-1:1;o.setXYZW(C,_.x,_.y,_.z,U)}for(let C=0,y=x.length;C<y;++C){const b=x[C],U=b.start,z=b.count;for(let P=U,O=U+z;P<O;P+=3)w(e.getX(P+0)),w(e.getX(P+1)),w(e.getX(P+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new It(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let h=0,f=n.count;h<f;h++)n.setXYZ(h,0,0,0);const i=new L,r=new L,o=new L,a=new L,c=new L,u=new L,d=new L,l=new L;if(e)for(let h=0,f=e.count;h<f;h+=3){const g=e.getX(h+0),v=e.getX(h+1),m=e.getX(h+2);i.fromBufferAttribute(t,g),r.fromBufferAttribute(t,v),o.fromBufferAttribute(t,m),d.subVectors(o,r),l.subVectors(i,r),d.cross(l),a.fromBufferAttribute(n,g),c.fromBufferAttribute(n,v),u.fromBufferAttribute(n,m),a.add(d),c.add(d),u.add(d),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(v,c.x,c.y,c.z),n.setXYZ(m,u.x,u.y,u.z)}else for(let h=0,f=t.count;h<f;h+=3)i.fromBufferAttribute(t,h+0),r.fromBufferAttribute(t,h+1),o.fromBufferAttribute(t,h+2),d.subVectors(o,r),l.subVectors(i,r),d.cross(l),n.setXYZ(h+0,d.x,d.y,d.z),n.setXYZ(h+1,d.x,d.y,d.z),n.setXYZ(h+2,d.x,d.y,d.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Ot.fromBufferAttribute(e,t),Ot.normalize(),e.setXYZ(t,Ot.x,Ot.y,Ot.z)}toNonIndexed(){function e(a,c){const u=a.array,d=a.itemSize,l=a.normalized,h=new u.constructor(c.length*d);let f=0,g=0;for(let v=0,m=c.length;v<m;v++){a.isInterleavedBufferAttribute?f=c[v]*a.data.stride+a.offset:f=c[v]*d;for(let p=0;p<d;p++)h[g++]=u[f++]}return new It(h,d,l)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Vt,n=this.index.array,i=this.attributes;for(const a in i){const c=i[a],u=e(c,n);t.setAttribute(a,u)}const r=this.morphAttributes;for(const a in r){const c=[],u=r[a];for(let d=0,l=u.length;d<l;d++){const h=u[d],f=e(h,n);c.push(f)}t.morphAttributes[a]=c}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,c=o.length;a<c;a++){const u=o[a];t.addGroup(u.start,u.count,u.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const c=this.parameters;for(const u in c)c[u]!==void 0&&(e[u]=c[u]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const c in n){const u=n[c];e.data.attributes[c]=u.toJSON(e.data)}const i={};let r=!1;for(const c in this.morphAttributes){const u=this.morphAttributes[c],d=[];for(let l=0,h=u.length;l<h;l++){const f=u[l];d.push(f.toJSON(e.data))}d.length>0&&(i[c]=d,r=!0)}r&&(e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone(t));const i=e.attributes;for(const u in i){const d=i[u];this.setAttribute(u,d.clone(t))}const r=e.morphAttributes;for(const u in r){const d=[],l=r[u];for(let h=0,f=l.length;h<f;h++)d.push(l[h].clone(t));this.morphAttributes[u]=d}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let u=0,d=o.length;u<d;u++){const l=o[u];this.addGroup(l.start,l.count,l.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const _d=new Ce,hs=new wo,$o=new fi,xd=new L,Ws=new L,js=new L,Xs=new L,$l=new L,qo=new L,Yo=new Q,Ko=new Q,Zo=new Q,yd=new L,Sd=new L,bd=new L,Jo=new L,Qo=new L;class at extends St{constructor(e=new Vt,t=new Ai){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){const a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){const n=this.geometry,i=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(i,e);const a=this.morphTargetInfluences;if(r&&a){qo.set(0,0,0);for(let c=0,u=r.length;c<u;c++){const d=a[c],l=r[c];d!==0&&($l.fromBufferAttribute(l,e),o?qo.addScaledVector($l,d):qo.addScaledVector($l.sub(t),d))}t.add(qo)}return t}raycast(e,t){const n=this.geometry,i=this.material,r=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),$o.copy(n.boundingSphere),$o.applyMatrix4(r),hs.copy(e.ray).recast(e.near),!($o.containsPoint(hs.origin)===!1&&(hs.intersectSphere($o,xd)===null||hs.origin.distanceToSquared(xd)>(e.far-e.near)**2))&&(_d.copy(r).invert(),hs.copy(e.ray).applyMatrix4(_d),!(n.boundingBox!==null&&hs.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,hs)))}_computeIntersections(e,t,n){let i;const r=this.geometry,o=this.material,a=r.index,c=r.attributes.position,u=r.attributes.uv,d=r.attributes.uv1,l=r.attributes.normal,h=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,v=h.length;g<v;g++){const m=h[g],p=o[m.materialIndex],x=Math.max(m.start,f.start),_=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let S=x,M=_;S<M;S+=3){const E=a.getX(S),w=a.getX(S+1),C=a.getX(S+2);i=ea(this,p,e,n,u,d,l,E,w,C),i&&(i.faceIndex=Math.floor(S/3),i.face.materialIndex=m.materialIndex,t.push(i))}}else{const g=Math.max(0,f.start),v=Math.min(a.count,f.start+f.count);for(let m=g,p=v;m<p;m+=3){const x=a.getX(m),_=a.getX(m+1),S=a.getX(m+2);i=ea(this,o,e,n,u,d,l,x,_,S),i&&(i.faceIndex=Math.floor(m/3),t.push(i))}}else if(c!==void 0)if(Array.isArray(o))for(let g=0,v=h.length;g<v;g++){const m=h[g],p=o[m.materialIndex],x=Math.max(m.start,f.start),_=Math.min(c.count,Math.min(m.start+m.count,f.start+f.count));for(let S=x,M=_;S<M;S+=3){const E=S,w=S+1,C=S+2;i=ea(this,p,e,n,u,d,l,E,w,C),i&&(i.faceIndex=Math.floor(S/3),i.face.materialIndex=m.materialIndex,t.push(i))}}else{const g=Math.max(0,f.start),v=Math.min(c.count,f.start+f.count);for(let m=g,p=v;m<p;m+=3){const x=m,_=m+1,S=m+2;i=ea(this,o,e,n,u,d,l,x,_,S),i&&(i.faceIndex=Math.floor(m/3),t.push(i))}}}}function by(s,e,t,n,i,r,o,a){let c;if(e.side===hn?c=n.intersectTriangle(o,r,i,!0,a):c=n.intersectTriangle(i,r,o,e.side===Ri,a),c===null)return null;Qo.copy(a),Qo.applyMatrix4(s.matrixWorld);const u=t.ray.origin.distanceTo(Qo);return u<t.near||u>t.far?null:{distance:u,point:Qo.clone(),object:s}}function ea(s,e,t,n,i,r,o,a,c,u){s.getVertexPosition(a,Ws),s.getVertexPosition(c,js),s.getVertexPosition(u,Xs);const d=by(s,e,t,n,Ws,js,Xs,Jo);if(d){i&&(Yo.fromBufferAttribute(i,a),Ko.fromBufferAttribute(i,c),Zo.fromBufferAttribute(i,u),d.uv=ri.getInterpolation(Jo,Ws,js,Xs,Yo,Ko,Zo,new Q)),r&&(Yo.fromBufferAttribute(r,a),Ko.fromBufferAttribute(r,c),Zo.fromBufferAttribute(r,u),d.uv1=ri.getInterpolation(Jo,Ws,js,Xs,Yo,Ko,Zo,new Q)),o&&(yd.fromBufferAttribute(o,a),Sd.fromBufferAttribute(o,c),bd.fromBufferAttribute(o,u),d.normal=ri.getInterpolation(Jo,Ws,js,Xs,yd,Sd,bd,new L),d.normal.dot(n.direction)>0&&d.normal.multiplyScalar(-1));const l={a,b:c,c:u,normal:new L,materialIndex:0};ri.getNormal(Ws,js,Xs,l.normal),d.face=l}return d}class Cr extends Vt{constructor(e=1,t=1,n=1,i=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:r,depthSegments:o};const a=this;i=Math.floor(i),r=Math.floor(r),o=Math.floor(o);const c=[],u=[],d=[],l=[];let h=0,f=0;g("z","y","x",-1,-1,n,t,e,o,r,0),g("z","y","x",1,-1,n,t,-e,o,r,1),g("x","z","y",1,1,e,n,t,i,o,2),g("x","z","y",1,-1,e,n,-t,i,o,3),g("x","y","z",1,-1,e,t,n,i,r,4),g("x","y","z",-1,-1,e,t,-n,i,r,5),this.setIndex(c),this.setAttribute("position",new bt(u,3)),this.setAttribute("normal",new bt(d,3)),this.setAttribute("uv",new bt(l,2));function g(v,m,p,x,_,S,M,E,w,C,y){const b=S/w,U=M/C,z=S/2,P=M/2,O=E/2,F=w+1,k=C+1;let j=0,D=0;const K=new L;for(let q=0;q<k;q++){const te=q*U-P;for(let ve=0;ve<F;ve++){const re=ve*b-z;K[v]=re*x,K[m]=te*_,K[p]=O,u.push(K.x,K.y,K.z),K[v]=0,K[m]=0,K[p]=E>0?1:-1,d.push(K.x,K.y,K.z),l.push(ve/w),l.push(1-q/C),j+=1}}for(let q=0;q<C;q++)for(let te=0;te<w;te++){const ve=h+te+F*q,re=h+te+F*(q+1),N=h+(te+1)+F*(q+1),Y=h+(te+1)+F*q;c.push(ve,re,Y),c.push(re,N,Y),D+=6}a.addGroup(f,D,y),f+=D,h+=j}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Cr(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Mr(s){const e={};for(const t in s){e[t]={};for(const n in s[t]){const i=s[t][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=i.clone():Array.isArray(i)?e[t][n]=i.slice():e[t][n]=i}}return e}function on(s){const e={};for(let t=0;t<s.length;t++){const n=Mr(s[t]);for(const i in n)e[i]=n[i]}return e}function My(s){const e=[];for(let t=0;t<s.length;t++)e.push(s[t].clone());return e}function Im(s){const e=s.getRenderTarget();return e===null?s.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Je.workingColorSpace}const Ey={clone:Mr,merge:on};var wy=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Ty=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Cn extends ui{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=wy,this.fragmentShader=Ty,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Mr(e.uniforms),this.uniformsGroups=My(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const i in this.uniforms){const o=this.uniforms[i].value;o&&o.isTexture?t.uniforms[i]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[i]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[i]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[i]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[i]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[i]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[i]={type:"m4",value:o.toArray()}:t.uniforms[i]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}let _u=class extends St{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ce,this.projectionMatrix=new Ce,this.projectionMatrixInverse=new Ce,this.coordinateSystem=Ti}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}};const ki=new L,Md=new Q,Ed=new Q;class Wt extends _u{constructor(e=50,t=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=br*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(ro*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return br*2*Math.atan(Math.tan(ro*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){ki.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(ki.x,ki.y).multiplyScalar(-e/ki.z),ki.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(ki.x,ki.y).multiplyScalar(-e/ki.z)}getViewSize(e,t){return this.getViewBounds(e,Md,Ed),t.subVectors(Ed,Md)}setViewOffset(e,t,n,i,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(ro*.5*this.fov)/this.zoom,n=2*t,i=this.aspect*n,r=-.5*i;const o=this.view;if(this.view!==null&&this.view.enabled){const c=o.fullWidth,u=o.fullHeight;r+=o.offsetX*i/c,t-=o.offsetY*n/u,i*=o.width/c,n*=o.height/u}const a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+i,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const $s=-90,qs=1;class Ay extends St{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const i=new Wt($s,qs,e,t);i.layers=this.layers,this.add(i);const r=new Wt($s,qs,e,t);r.layers=this.layers,this.add(r);const o=new Wt($s,qs,e,t);o.layers=this.layers,this.add(o);const a=new Wt($s,qs,e,t);a.layers=this.layers,this.add(a);const c=new Wt($s,qs,e,t);c.layers=this.layers,this.add(c);const u=new Wt($s,qs,e,t);u.layers=this.layers,this.add(u)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,i,r,o,a,c]=t;for(const u of t)this.remove(u);if(e===Ti)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===La)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const u of t)this.add(u),u.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,c,u,d]=this.children,l=e.getRenderTarget(),h=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const v=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,i),e.render(t,r),e.setRenderTarget(n,1,i),e.render(t,o),e.setRenderTarget(n,2,i),e.render(t,a),e.setRenderTarget(n,3,i),e.render(t,c),e.setRenderTarget(n,4,i),e.render(t,u),n.texture.generateMipmaps=v,e.setRenderTarget(n,5,i),e.render(t,d),e.setRenderTarget(l,h,f),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class xu extends Ut{constructor(e,t,n,i,r,o,a,c,u,d){e=e!==void 0?e:[],t=t!==void 0?t:_r,super(e,t,n,i,r,o,a,c,u,d),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Dy extends Dn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},i=[n,n,n,n,n,n];this.texture=new xu(i,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:jt}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new Cr(5,5,5),r=new Cn({name:"CubemapFromEquirect",uniforms:Mr(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:hn,blending:ot});r.uniforms.tEquirect.value=t;const o=new at(i,r),a=t.minFilter;return t.minFilter===wi&&(t.minFilter=jt),new Ay(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,n,i){const r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,i);e.setRenderTarget(r)}}const ql=new L,Cy=new L,Ry=new Ne;class Hi{constructor(e=new L(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const i=ql.subVectors(n,t).cross(Cy.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(ql),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/i;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||Ry.getNormalMatrix(e),i=this.coplanarPoint(ql).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const ds=new fi,ta=new L;class yu{constructor(e=new Hi,t=new Hi,n=new Hi,i=new Hi,r=new Hi,o=new Hi){this.planes=[e,t,n,i,r,o]}set(e,t,n,i,r,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(i),a[4].copy(r),a[5].copy(o),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Ti){const n=this.planes,i=e.elements,r=i[0],o=i[1],a=i[2],c=i[3],u=i[4],d=i[5],l=i[6],h=i[7],f=i[8],g=i[9],v=i[10],m=i[11],p=i[12],x=i[13],_=i[14],S=i[15];if(n[0].setComponents(c-r,h-u,m-f,S-p).normalize(),n[1].setComponents(c+r,h+u,m+f,S+p).normalize(),n[2].setComponents(c+o,h+d,m+g,S+x).normalize(),n[3].setComponents(c-o,h-d,m-g,S-x).normalize(),n[4].setComponents(c-a,h-l,m-v,S-_).normalize(),t===Ti)n[5].setComponents(c+a,h+l,m+v,S+_).normalize();else if(t===La)n[5].setComponents(a,l,v,_).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ds.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),ds.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ds)}intersectsSprite(e){return ds.center.set(0,0,0),ds.radius=.7071067811865476,ds.applyMatrix4(e.matrixWorld),this.intersectsSphere(ds)}intersectsSphere(e){const t=this.planes,n=e.center,i=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const i=t[n];if(ta.x=i.normal.x>0?e.max.x:e.min.x,ta.y=i.normal.y>0?e.max.y:e.min.y,ta.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(ta)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function Um(){let s=null,e=!1,t=null,n=null;function i(r,o){t(r,o),n=s.requestAnimationFrame(i)}return{start:function(){e!==!0&&t!==null&&(n=s.requestAnimationFrame(i),e=!0)},stop:function(){s.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){s=r}}}function Py(s){const e=new WeakMap;function t(a,c){const u=a.array,d=a.usage,l=u.byteLength,h=s.createBuffer();s.bindBuffer(c,h),s.bufferData(c,u,d),a.onUploadCallback();let f;if(u instanceof Float32Array)f=s.FLOAT;else if(u instanceof Uint16Array)a.isFloat16BufferAttribute?f=s.HALF_FLOAT:f=s.UNSIGNED_SHORT;else if(u instanceof Int16Array)f=s.SHORT;else if(u instanceof Uint32Array)f=s.UNSIGNED_INT;else if(u instanceof Int32Array)f=s.INT;else if(u instanceof Int8Array)f=s.BYTE;else if(u instanceof Uint8Array)f=s.UNSIGNED_BYTE;else if(u instanceof Uint8ClampedArray)f=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+u);return{buffer:h,type:f,bytesPerElement:u.BYTES_PER_ELEMENT,version:a.version,size:l}}function n(a,c,u){const d=c.array,l=c._updateRange,h=c.updateRanges;if(s.bindBuffer(u,a),l.count===-1&&h.length===0&&s.bufferSubData(u,0,d),h.length!==0){for(let f=0,g=h.length;f<g;f++){const v=h[f];s.bufferSubData(u,v.start*d.BYTES_PER_ELEMENT,d,v.start,v.count)}c.clearUpdateRanges()}l.count!==-1&&(s.bufferSubData(u,l.offset*d.BYTES_PER_ELEMENT,d,l.offset,l.count),l.count=-1),c.onUploadCallback()}function i(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);const c=e.get(a);c&&(s.deleteBuffer(c.buffer),e.delete(a))}function o(a,c){if(a.isGLBufferAttribute){const d=e.get(a);(!d||d.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}a.isInterleavedBufferAttribute&&(a=a.data);const u=e.get(a);if(u===void 0)e.set(a,t(a,c));else if(u.version<a.version){if(u.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(u.buffer,a,c),u.version=a.version}}return{get:i,remove:r,update:o}}class Rn extends Vt{constructor(e=1,t=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};const r=e/2,o=t/2,a=Math.floor(n),c=Math.floor(i),u=a+1,d=c+1,l=e/a,h=t/c,f=[],g=[],v=[],m=[];for(let p=0;p<d;p++){const x=p*h-o;for(let _=0;_<u;_++){const S=_*l-r;g.push(S,-x,0),v.push(0,0,1),m.push(_/a),m.push(1-p/c)}}for(let p=0;p<c;p++)for(let x=0;x<a;x++){const _=x+u*p,S=x+u*(p+1),M=x+1+u*(p+1),E=x+1+u*p;f.push(_,S,E),f.push(S,M,E)}this.setIndex(f),this.setAttribute("position",new bt(g,3)),this.setAttribute("normal",new bt(v,3)),this.setAttribute("uv",new bt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Rn(e.width,e.height,e.widthSegments,e.heightSegments)}}var Ly=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Iy=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Uy=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Fy=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Ny=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Oy=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,ky=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,By=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,zy=`#ifdef USE_BATCHING
	attribute float batchId;
	uniform highp sampler2D batchingTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Hy=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( batchId );
#endif`,Vy=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Gy=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Wy=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,jy=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Xy=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,$y=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,qy=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Yy=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Ky=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Zy=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Jy=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Qy=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,eS=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,tS=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
float luminance( const in vec3 rgb ) {
	const vec3 weights = vec3( 0.2126729, 0.7151522, 0.0721750 );
	return dot( weights, rgb );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,nS=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,iS=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,sS=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,rS=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,oS=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,aS=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,lS="gl_FragColor = linearToOutputTexel( gl_FragColor );",cS=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}
vec4 LinearToLinear( in vec4 value ) {
	return value;
}
vec4 LinearTosRGB( in vec4 value ) {
	return sRGBTransferOETF( value );
}`,uS=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,hS=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,dS=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,fS=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,pS=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,mS=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,gS=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,vS=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,_S=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,xS=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,yS=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,SS=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,bS=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,MS=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	#if defined ( LEGACY_LIGHTS )
		if ( cutoffDistance > 0.0 && decayExponent > 0.0 ) {
			return pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );
		}
		return 1.0;
	#else
		float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
		if ( cutoffDistance > 0.0 ) {
			distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
		}
		return distanceFalloff;
	#endif
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,ES=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,wS=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,TS=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,AS=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,DS=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,CS=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,RS=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,PS=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,LS=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,IS=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,US=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,FS=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,NS=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,OS=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,kS=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,BS=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,zS=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,HS=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,VS=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,GS=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,WS=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[MORPHTARGETS_COUNT];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,jS=`#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,XS=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		objectNormal += morphNormal0 * morphTargetInfluences[ 0 ];
		objectNormal += morphNormal1 * morphTargetInfluences[ 1 ];
		objectNormal += morphNormal2 * morphTargetInfluences[ 2 ];
		objectNormal += morphNormal3 * morphTargetInfluences[ 3 ];
	#endif
#endif`,$S=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
	#endif
	#ifdef MORPHTARGETS_TEXTURE
		#ifndef USE_INSTANCING_MORPH
			uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
		#endif
		uniform sampler2DArray morphTargetsTexture;
		uniform ivec2 morphTargetsTextureSize;
		vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
			int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
			int y = texelIndex / morphTargetsTextureSize.x;
			int x = texelIndex - y * morphTargetsTextureSize.x;
			ivec3 morphUV = ivec3( x, y, morphTargetIndex );
			return texelFetch( morphTargetsTexture, morphUV, 0 );
		}
	#else
		#ifndef USE_MORPHNORMALS
			uniform float morphTargetInfluences[ 8 ];
		#else
			uniform float morphTargetInfluences[ 4 ];
		#endif
	#endif
#endif`,qS=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		transformed += morphTarget0 * morphTargetInfluences[ 0 ];
		transformed += morphTarget1 * morphTargetInfluences[ 1 ];
		transformed += morphTarget2 * morphTargetInfluences[ 2 ];
		transformed += morphTarget3 * morphTargetInfluences[ 3 ];
		#ifndef USE_MORPHNORMALS
			transformed += morphTarget4 * morphTargetInfluences[ 4 ];
			transformed += morphTarget5 * morphTargetInfluences[ 5 ];
			transformed += morphTarget6 * morphTargetInfluences[ 6 ];
			transformed += morphTarget7 * morphTargetInfluences[ 7 ];
		#endif
	#endif
#endif`,YS=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,KS=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,ZS=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,JS=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,QS=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,eb=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,tb=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,nb=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,ib=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,sb=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,rb=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,ob=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;
const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
const float ShiftRight8 = 1. / 256.;
vec4 packDepthToRGBA( const in float v ) {
	vec4 r = vec4( fract( v * PackFactors ), v );
	r.yzw -= r.xyz * ShiftRight8;	return r * PackUpscale;
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors );
}
vec2 packDepthToRG( in highp float v ) {
	return packDepthToRGBA( v ).yx;
}
float unpackRGToDepth( const in highp vec2 v ) {
	return unpackRGBAToDepth( vec4( v.xy, 0.0, 0.0 ) );
}
vec4 pack2HalfToRGBA( vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,ab=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,lb=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,cb=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,ub=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,hb=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,db=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,fb=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return shadow;
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return shadow;
	}
#endif`,pb=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,mb=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,gb=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,vb=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,_b=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,xb=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,yb=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Sb=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,bb=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Mb=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Eb=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 OptimizedCineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,wb=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Tb=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Ab=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Db=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Cb=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Rb=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Pb=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Lb=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ib=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Ub=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Fb=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Nb=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ob=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,kb=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#endif
}`,Bb=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,zb=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,Hb=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Vb=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Gb=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Wb=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,jb=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Xb=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,$b=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,qb=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Yb=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Kb=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Zb=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Jb=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Qb=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,eM=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,tM=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,nM=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,iM=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,sM=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,rM=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,oM=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,aM=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,lM=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,cM=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,uM=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,ke={alphahash_fragment:Ly,alphahash_pars_fragment:Iy,alphamap_fragment:Uy,alphamap_pars_fragment:Fy,alphatest_fragment:Ny,alphatest_pars_fragment:Oy,aomap_fragment:ky,aomap_pars_fragment:By,batching_pars_vertex:zy,batching_vertex:Hy,begin_vertex:Vy,beginnormal_vertex:Gy,bsdfs:Wy,iridescence_fragment:jy,bumpmap_pars_fragment:Xy,clipping_planes_fragment:$y,clipping_planes_pars_fragment:qy,clipping_planes_pars_vertex:Yy,clipping_planes_vertex:Ky,color_fragment:Zy,color_pars_fragment:Jy,color_pars_vertex:Qy,color_vertex:eS,common:tS,cube_uv_reflection_fragment:nS,defaultnormal_vertex:iS,displacementmap_pars_vertex:sS,displacementmap_vertex:rS,emissivemap_fragment:oS,emissivemap_pars_fragment:aS,colorspace_fragment:lS,colorspace_pars_fragment:cS,envmap_fragment:uS,envmap_common_pars_fragment:hS,envmap_pars_fragment:dS,envmap_pars_vertex:fS,envmap_physical_pars_fragment:ES,envmap_vertex:pS,fog_vertex:mS,fog_pars_vertex:gS,fog_fragment:vS,fog_pars_fragment:_S,gradientmap_pars_fragment:xS,lightmap_pars_fragment:yS,lights_lambert_fragment:SS,lights_lambert_pars_fragment:bS,lights_pars_begin:MS,lights_toon_fragment:wS,lights_toon_pars_fragment:TS,lights_phong_fragment:AS,lights_phong_pars_fragment:DS,lights_physical_fragment:CS,lights_physical_pars_fragment:RS,lights_fragment_begin:PS,lights_fragment_maps:LS,lights_fragment_end:IS,logdepthbuf_fragment:US,logdepthbuf_pars_fragment:FS,logdepthbuf_pars_vertex:NS,logdepthbuf_vertex:OS,map_fragment:kS,map_pars_fragment:BS,map_particle_fragment:zS,map_particle_pars_fragment:HS,metalnessmap_fragment:VS,metalnessmap_pars_fragment:GS,morphinstance_vertex:WS,morphcolor_vertex:jS,morphnormal_vertex:XS,morphtarget_pars_vertex:$S,morphtarget_vertex:qS,normal_fragment_begin:YS,normal_fragment_maps:KS,normal_pars_fragment:ZS,normal_pars_vertex:JS,normal_vertex:QS,normalmap_pars_fragment:eb,clearcoat_normal_fragment_begin:tb,clearcoat_normal_fragment_maps:nb,clearcoat_pars_fragment:ib,iridescence_pars_fragment:sb,opaque_fragment:rb,packing:ob,premultiplied_alpha_fragment:ab,project_vertex:lb,dithering_fragment:cb,dithering_pars_fragment:ub,roughnessmap_fragment:hb,roughnessmap_pars_fragment:db,shadowmap_pars_fragment:fb,shadowmap_pars_vertex:pb,shadowmap_vertex:mb,shadowmask_pars_fragment:gb,skinbase_vertex:vb,skinning_pars_vertex:_b,skinning_vertex:xb,skinnormal_vertex:yb,specularmap_fragment:Sb,specularmap_pars_fragment:bb,tonemapping_fragment:Mb,tonemapping_pars_fragment:Eb,transmission_fragment:wb,transmission_pars_fragment:Tb,uv_pars_fragment:Ab,uv_pars_vertex:Db,uv_vertex:Cb,worldpos_vertex:Rb,background_vert:Pb,background_frag:Lb,backgroundCube_vert:Ib,backgroundCube_frag:Ub,cube_vert:Fb,cube_frag:Nb,depth_vert:Ob,depth_frag:kb,distanceRGBA_vert:Bb,distanceRGBA_frag:zb,equirect_vert:Hb,equirect_frag:Vb,linedashed_vert:Gb,linedashed_frag:Wb,meshbasic_vert:jb,meshbasic_frag:Xb,meshlambert_vert:$b,meshlambert_frag:qb,meshmatcap_vert:Yb,meshmatcap_frag:Kb,meshnormal_vert:Zb,meshnormal_frag:Jb,meshphong_vert:Qb,meshphong_frag:eM,meshphysical_vert:tM,meshphysical_frag:nM,meshtoon_vert:iM,meshtoon_frag:sM,points_vert:rM,points_frag:oM,shadow_vert:aM,shadow_frag:lM,sprite_vert:cM,sprite_frag:uM},ue={common:{diffuse:{value:new ye(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ne},alphaMap:{value:null},alphaMapTransform:{value:new Ne},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ne}},envmap:{envMap:{value:null},envMapRotation:{value:new Ne},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ne}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ne}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ne},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ne},normalScale:{value:new Q(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ne},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ne}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ne}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ne}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new ye(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new ye(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ne},alphaTest:{value:0},uvTransform:{value:new Ne}},sprite:{diffuse:{value:new ye(16777215)},opacity:{value:1},center:{value:new Q(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ne},alphaMap:{value:null},alphaMapTransform:{value:new Ne},alphaTest:{value:0}}},ni={basic:{uniforms:on([ue.common,ue.specularmap,ue.envmap,ue.aomap,ue.lightmap,ue.fog]),vertexShader:ke.meshbasic_vert,fragmentShader:ke.meshbasic_frag},lambert:{uniforms:on([ue.common,ue.specularmap,ue.envmap,ue.aomap,ue.lightmap,ue.emissivemap,ue.bumpmap,ue.normalmap,ue.displacementmap,ue.fog,ue.lights,{emissive:{value:new ye(0)}}]),vertexShader:ke.meshlambert_vert,fragmentShader:ke.meshlambert_frag},phong:{uniforms:on([ue.common,ue.specularmap,ue.envmap,ue.aomap,ue.lightmap,ue.emissivemap,ue.bumpmap,ue.normalmap,ue.displacementmap,ue.fog,ue.lights,{emissive:{value:new ye(0)},specular:{value:new ye(1118481)},shininess:{value:30}}]),vertexShader:ke.meshphong_vert,fragmentShader:ke.meshphong_frag},standard:{uniforms:on([ue.common,ue.envmap,ue.aomap,ue.lightmap,ue.emissivemap,ue.bumpmap,ue.normalmap,ue.displacementmap,ue.roughnessmap,ue.metalnessmap,ue.fog,ue.lights,{emissive:{value:new ye(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ke.meshphysical_vert,fragmentShader:ke.meshphysical_frag},toon:{uniforms:on([ue.common,ue.aomap,ue.lightmap,ue.emissivemap,ue.bumpmap,ue.normalmap,ue.displacementmap,ue.gradientmap,ue.fog,ue.lights,{emissive:{value:new ye(0)}}]),vertexShader:ke.meshtoon_vert,fragmentShader:ke.meshtoon_frag},matcap:{uniforms:on([ue.common,ue.bumpmap,ue.normalmap,ue.displacementmap,ue.fog,{matcap:{value:null}}]),vertexShader:ke.meshmatcap_vert,fragmentShader:ke.meshmatcap_frag},points:{uniforms:on([ue.points,ue.fog]),vertexShader:ke.points_vert,fragmentShader:ke.points_frag},dashed:{uniforms:on([ue.common,ue.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ke.linedashed_vert,fragmentShader:ke.linedashed_frag},depth:{uniforms:on([ue.common,ue.displacementmap]),vertexShader:ke.depth_vert,fragmentShader:ke.depth_frag},normal:{uniforms:on([ue.common,ue.bumpmap,ue.normalmap,ue.displacementmap,{opacity:{value:1}}]),vertexShader:ke.meshnormal_vert,fragmentShader:ke.meshnormal_frag},sprite:{uniforms:on([ue.sprite,ue.fog]),vertexShader:ke.sprite_vert,fragmentShader:ke.sprite_frag},background:{uniforms:{uvTransform:{value:new Ne},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ke.background_vert,fragmentShader:ke.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ne}},vertexShader:ke.backgroundCube_vert,fragmentShader:ke.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ke.cube_vert,fragmentShader:ke.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ke.equirect_vert,fragmentShader:ke.equirect_frag},distanceRGBA:{uniforms:on([ue.common,ue.displacementmap,{referencePosition:{value:new L},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ke.distanceRGBA_vert,fragmentShader:ke.distanceRGBA_frag},shadow:{uniforms:on([ue.lights,ue.fog,{color:{value:new ye(0)},opacity:{value:1}}]),vertexShader:ke.shadow_vert,fragmentShader:ke.shadow_frag}};ni.physical={uniforms:on([ni.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ne},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ne},clearcoatNormalScale:{value:new Q(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ne},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ne},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ne},sheen:{value:0},sheenColor:{value:new ye(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ne},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ne},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ne},transmissionSamplerSize:{value:new Q},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ne},attenuationDistance:{value:0},attenuationColor:{value:new ye(0)},specularColor:{value:new ye(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ne},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ne},anisotropyVector:{value:new Q},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ne}}]),vertexShader:ke.meshphysical_vert,fragmentShader:ke.meshphysical_frag};const na={r:0,b:0,g:0},fs=new di,hM=new Ce;function dM(s,e,t,n,i,r,o){const a=new ye(0);let c=r===!0?0:1,u,d,l=null,h=0,f=null;function g(x){let _=x.isScene===!0?x.background:null;return _&&_.isTexture&&(_=(x.backgroundBlurriness>0?t:e).get(_)),_}function v(x){let _=!1;const S=g(x);S===null?p(a,c):S&&S.isColor&&(p(S,1),_=!0);const M=s.xr.getEnvironmentBlendMode();M==="additive"?n.buffers.color.setClear(0,0,0,1,o):M==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(s.autoClear||_)&&s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil)}function m(x,_){const S=g(_);S&&(S.isCubeTexture||S.mapping===Ga)?(d===void 0&&(d=new at(new Cr(1,1,1),new Cn({name:"BackgroundCubeMaterial",uniforms:Mr(ni.backgroundCube.uniforms),vertexShader:ni.backgroundCube.vertexShader,fragmentShader:ni.backgroundCube.fragmentShader,side:hn,depthTest:!1,depthWrite:!1,fog:!1})),d.geometry.deleteAttribute("normal"),d.geometry.deleteAttribute("uv"),d.onBeforeRender=function(M,E,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(d.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(d)),fs.copy(_.backgroundRotation),fs.x*=-1,fs.y*=-1,fs.z*=-1,S.isCubeTexture&&S.isRenderTargetTexture===!1&&(fs.y*=-1,fs.z*=-1),d.material.uniforms.envMap.value=S,d.material.uniforms.flipEnvMap.value=S.isCubeTexture&&S.isRenderTargetTexture===!1?-1:1,d.material.uniforms.backgroundBlurriness.value=_.backgroundBlurriness,d.material.uniforms.backgroundIntensity.value=_.backgroundIntensity,d.material.uniforms.backgroundRotation.value.setFromMatrix4(hM.makeRotationFromEuler(fs)),d.material.toneMapped=Je.getTransfer(S.colorSpace)!==pt,(l!==S||h!==S.version||f!==s.toneMapping)&&(d.material.needsUpdate=!0,l=S,h=S.version,f=s.toneMapping),d.layers.enableAll(),x.unshift(d,d.geometry,d.material,0,0,null)):S&&S.isTexture&&(u===void 0&&(u=new at(new Rn(2,2),new Cn({name:"BackgroundMaterial",uniforms:Mr(ni.background.uniforms),vertexShader:ni.background.vertexShader,fragmentShader:ni.background.fragmentShader,side:Ri,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),Object.defineProperty(u.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(u)),u.material.uniforms.t2D.value=S,u.material.uniforms.backgroundIntensity.value=_.backgroundIntensity,u.material.toneMapped=Je.getTransfer(S.colorSpace)!==pt,S.matrixAutoUpdate===!0&&S.updateMatrix(),u.material.uniforms.uvTransform.value.copy(S.matrix),(l!==S||h!==S.version||f!==s.toneMapping)&&(u.material.needsUpdate=!0,l=S,h=S.version,f=s.toneMapping),u.layers.enableAll(),x.unshift(u,u.geometry,u.material,0,0,null))}function p(x,_){x.getRGB(na,Im(s)),n.buffers.color.setClear(na.r,na.g,na.b,_,o)}return{getClearColor:function(){return a},setClearColor:function(x,_=1){a.set(x),c=_,p(a,c)},getClearAlpha:function(){return c},setClearAlpha:function(x){c=x,p(a,c)},render:v,addToRenderList:m}}function fM(s,e){const t=s.getParameter(s.MAX_VERTEX_ATTRIBS),n={},i=h(null);let r=i,o=!1;function a(b,U,z,P,O){let F=!1;const k=l(P,z,U);r!==k&&(r=k,u(r.object)),F=f(b,P,z,O),F&&g(b,P,z,O),O!==null&&e.update(O,s.ELEMENT_ARRAY_BUFFER),(F||o)&&(o=!1,S(b,U,z,P),O!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,e.get(O).buffer))}function c(){return s.createVertexArray()}function u(b){return s.bindVertexArray(b)}function d(b){return s.deleteVertexArray(b)}function l(b,U,z){const P=z.wireframe===!0;let O=n[b.id];O===void 0&&(O={},n[b.id]=O);let F=O[U.id];F===void 0&&(F={},O[U.id]=F);let k=F[P];return k===void 0&&(k=h(c()),F[P]=k),k}function h(b){const U=[],z=[],P=[];for(let O=0;O<t;O++)U[O]=0,z[O]=0,P[O]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:U,enabledAttributes:z,attributeDivisors:P,object:b,attributes:{},index:null}}function f(b,U,z,P){const O=r.attributes,F=U.attributes;let k=0;const j=z.getAttributes();for(const D in j)if(j[D].location>=0){const q=O[D];let te=F[D];if(te===void 0&&(D==="instanceMatrix"&&b.instanceMatrix&&(te=b.instanceMatrix),D==="instanceColor"&&b.instanceColor&&(te=b.instanceColor)),q===void 0||q.attribute!==te||te&&q.data!==te.data)return!0;k++}return r.attributesNum!==k||r.index!==P}function g(b,U,z,P){const O={},F=U.attributes;let k=0;const j=z.getAttributes();for(const D in j)if(j[D].location>=0){let q=F[D];q===void 0&&(D==="instanceMatrix"&&b.instanceMatrix&&(q=b.instanceMatrix),D==="instanceColor"&&b.instanceColor&&(q=b.instanceColor));const te={};te.attribute=q,q&&q.data&&(te.data=q.data),O[D]=te,k++}r.attributes=O,r.attributesNum=k,r.index=P}function v(){const b=r.newAttributes;for(let U=0,z=b.length;U<z;U++)b[U]=0}function m(b){p(b,0)}function p(b,U){const z=r.newAttributes,P=r.enabledAttributes,O=r.attributeDivisors;z[b]=1,P[b]===0&&(s.enableVertexAttribArray(b),P[b]=1),O[b]!==U&&(s.vertexAttribDivisor(b,U),O[b]=U)}function x(){const b=r.newAttributes,U=r.enabledAttributes;for(let z=0,P=U.length;z<P;z++)U[z]!==b[z]&&(s.disableVertexAttribArray(z),U[z]=0)}function _(b,U,z,P,O,F,k){k===!0?s.vertexAttribIPointer(b,U,z,O,F):s.vertexAttribPointer(b,U,z,P,O,F)}function S(b,U,z,P){v();const O=P.attributes,F=z.getAttributes(),k=U.defaultAttributeValues;for(const j in F){const D=F[j];if(D.location>=0){let K=O[j];if(K===void 0&&(j==="instanceMatrix"&&b.instanceMatrix&&(K=b.instanceMatrix),j==="instanceColor"&&b.instanceColor&&(K=b.instanceColor)),K!==void 0){const q=K.normalized,te=K.itemSize,ve=e.get(K);if(ve===void 0)continue;const re=ve.buffer,N=ve.type,Y=ve.bytesPerElement,ae=N===s.INT||N===s.UNSIGNED_INT||K.gpuType===gm;if(K.isInterleavedBufferAttribute){const le=K.data,Ie=le.stride,je=K.offset;if(le.isInstancedInterleavedBuffer){for(let V=0;V<D.locationSize;V++)p(D.location+V,le.meshPerAttribute);b.isInstancedMesh!==!0&&P._maxInstanceCount===void 0&&(P._maxInstanceCount=le.meshPerAttribute*le.count)}else for(let V=0;V<D.locationSize;V++)m(D.location+V);s.bindBuffer(s.ARRAY_BUFFER,re);for(let V=0;V<D.locationSize;V++)_(D.location+V,te/D.locationSize,N,q,Ie*Y,(je+te/D.locationSize*V)*Y,ae)}else{if(K.isInstancedBufferAttribute){for(let le=0;le<D.locationSize;le++)p(D.location+le,K.meshPerAttribute);b.isInstancedMesh!==!0&&P._maxInstanceCount===void 0&&(P._maxInstanceCount=K.meshPerAttribute*K.count)}else for(let le=0;le<D.locationSize;le++)m(D.location+le);s.bindBuffer(s.ARRAY_BUFFER,re);for(let le=0;le<D.locationSize;le++)_(D.location+le,te/D.locationSize,N,q,te*Y,te/D.locationSize*le*Y,ae)}}else if(k!==void 0){const q=k[j];if(q!==void 0)switch(q.length){case 2:s.vertexAttrib2fv(D.location,q);break;case 3:s.vertexAttrib3fv(D.location,q);break;case 4:s.vertexAttrib4fv(D.location,q);break;default:s.vertexAttrib1fv(D.location,q)}}}}x()}function M(){C();for(const b in n){const U=n[b];for(const z in U){const P=U[z];for(const O in P)d(P[O].object),delete P[O];delete U[z]}delete n[b]}}function E(b){if(n[b.id]===void 0)return;const U=n[b.id];for(const z in U){const P=U[z];for(const O in P)d(P[O].object),delete P[O];delete U[z]}delete n[b.id]}function w(b){for(const U in n){const z=n[U];if(z[b.id]===void 0)continue;const P=z[b.id];for(const O in P)d(P[O].object),delete P[O];delete z[b.id]}}function C(){y(),o=!0,r!==i&&(r=i,u(r.object))}function y(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:a,reset:C,resetDefaultState:y,dispose:M,releaseStatesOfGeometry:E,releaseStatesOfProgram:w,initAttributes:v,enableAttribute:m,disableUnusedAttributes:x}}function pM(s,e,t){let n;function i(u){n=u}function r(u,d){s.drawArrays(n,u,d),t.update(d,n,1)}function o(u,d,l){l!==0&&(s.drawArraysInstanced(n,u,d,l),t.update(d,n,l))}function a(u,d,l){if(l===0)return;const h=e.get("WEBGL_multi_draw");if(h===null)for(let f=0;f<l;f++)this.render(u[f],d[f]);else{h.multiDrawArraysWEBGL(n,u,0,d,0,l);let f=0;for(let g=0;g<l;g++)f+=d[g];t.update(f,n,1)}}function c(u,d,l,h){if(l===0)return;const f=e.get("WEBGL_multi_draw");if(f===null)for(let g=0;g<u.length;g++)o(u[g],d[g],h[g]);else{f.multiDrawArraysInstancedWEBGL(n,u,0,d,0,h,0,l);let g=0;for(let v=0;v<l;v++)g+=d[v];for(let v=0;v<h.length;v++)t.update(g,n,h[v])}}this.setMode=i,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=c}function mM(s,e,t,n){let i;function r(){if(i!==void 0)return i;if(e.has("EXT_texture_filter_anisotropic")===!0){const E=e.get("EXT_texture_filter_anisotropic");i=s.getParameter(E.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(E){return!(E!==Bn&&n.convert(E)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(E){const w=E===Wa&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(E!==ns&&n.convert(E)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE)&&E!==kn&&!w)}function c(E){if(E==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";E="mediump"}return E==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let u=t.precision!==void 0?t.precision:"highp";const d=c(u);d!==u&&(console.warn("THREE.WebGLRenderer:",u,"not supported, using",d,"instead."),u=d);const l=t.logarithmicDepthBuffer===!0,h=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),f=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),g=s.getParameter(s.MAX_TEXTURE_SIZE),v=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),m=s.getParameter(s.MAX_VERTEX_ATTRIBS),p=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),x=s.getParameter(s.MAX_VARYING_VECTORS),_=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),S=f>0,M=s.getParameter(s.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:a,precision:u,logarithmicDepthBuffer:l,maxTextures:h,maxVertexTextures:f,maxTextureSize:g,maxCubemapSize:v,maxAttributes:m,maxVertexUniforms:p,maxVaryings:x,maxFragmentUniforms:_,vertexTextures:S,maxSamples:M}}function gM(s){const e=this;let t=null,n=0,i=!1,r=!1;const o=new Hi,a=new Ne,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(l,h){const f=l.length!==0||h||n!==0||i;return i=h,n=l.length,f},this.beginShadows=function(){r=!0,d(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(l,h){t=d(l,h,0)},this.setState=function(l,h,f){const g=l.clippingPlanes,v=l.clipIntersection,m=l.clipShadows,p=s.get(l);if(!i||g===null||g.length===0||r&&!m)r?d(null):u();else{const x=r?0:n,_=x*4;let S=p.clippingState||null;c.value=S,S=d(g,h,_,f);for(let M=0;M!==_;++M)S[M]=t[M];p.clippingState=S,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=x}};function u(){c.value!==t&&(c.value=t,c.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function d(l,h,f,g){const v=l!==null?l.length:0;let m=null;if(v!==0){if(m=c.value,g!==!0||m===null){const p=f+v*4,x=h.matrixWorldInverse;a.getNormalMatrix(x),(m===null||m.length<p)&&(m=new Float32Array(p));for(let _=0,S=f;_!==v;++_,S+=4)o.copy(l[_]).applyMatrix4(x,a),o.normal.toArray(m,S),m[S+3]=o.constant}c.value=m,c.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,m}}function vM(s){let e=new WeakMap;function t(o,a){return a===Oc?o.mapping=_r:a===kc&&(o.mapping=xr),o}function n(o){if(o&&o.isTexture){const a=o.mapping;if(a===Oc||a===kc)if(e.has(o)){const c=e.get(o).texture;return t(c,o.mapping)}else{const c=o.image;if(c&&c.height>0){const u=new Dy(c.height);return u.fromEquirectangularTexture(s,o),e.set(o,u),o.addEventListener("dispose",i),t(u.texture,o.mapping)}else return null}}return o}function i(o){const a=o.target;a.removeEventListener("dispose",i);const c=e.get(a);c!==void 0&&(e.delete(a),c.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}class Kn extends _u{constructor(e=-1,t=1,n=1,i=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2;let r=n-e,o=n+e,a=i+t,c=i-t;if(this.view!==null&&this.view.enabled){const u=(this.right-this.left)/this.view.fullWidth/this.zoom,d=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=u*this.view.offsetX,o=r+u*this.view.width,a-=d*this.view.offsetY,c=a-d*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,c,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const nr=4,wd=[.125,.215,.35,.446,.526,.582],xs=20,Yl=new Kn,Td=new ye;let Kl=null,Zl=0,Jl=0,Ql=!1;const vs=(1+Math.sqrt(5))/2,Ys=1/vs,Ad=[new L(-vs,Ys,0),new L(vs,Ys,0),new L(-Ys,0,vs),new L(Ys,0,vs),new L(0,vs,-Ys),new L(0,vs,Ys),new L(-1,1,-1),new L(1,1,-1),new L(-1,1,1),new L(1,1,1)];class Dd{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,i=100){Kl=this._renderer.getRenderTarget(),Zl=this._renderer.getActiveCubeFace(),Jl=this._renderer.getActiveMipmapLevel(),Ql=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(e,n,i,r),t>0&&this._blur(r,0,0,t),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Pd(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Rd(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Kl,Zl,Jl),this._renderer.xr.enabled=Ql,e.scissorTest=!1,ia(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===_r||e.mapping===xr?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Kl=this._renderer.getRenderTarget(),Zl=this._renderer.getActiveCubeFace(),Jl=this._renderer.getActiveMipmapLevel(),Ql=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:jt,minFilter:jt,generateMipmaps:!1,type:Wa,format:Bn,colorSpace:$t,depthBuffer:!1},i=Cd(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Cd(e,t,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=_M(r)),this._blurMaterial=xM(r,e,t)}return i}_compileMaterial(e){const t=new at(this._lodPlanes[0],e);this._renderer.compile(t,Yl)}_sceneToCubeUV(e,t,n,i){const a=new Wt(90,1,t,n),c=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],d=this._renderer,l=d.autoClear,h=d.toneMapping;d.getClearColor(Td),d.toneMapping=Qi,d.autoClear=!1;const f=new Ai({name:"PMREM.Background",side:hn,depthWrite:!1,depthTest:!1}),g=new at(new Cr,f);let v=!1;const m=e.background;m?m.isColor&&(f.color.copy(m),e.background=null,v=!0):(f.color.copy(Td),v=!0);for(let p=0;p<6;p++){const x=p%3;x===0?(a.up.set(0,c[p],0),a.lookAt(u[p],0,0)):x===1?(a.up.set(0,0,c[p]),a.lookAt(0,u[p],0)):(a.up.set(0,c[p],0),a.lookAt(0,0,u[p]));const _=this._cubeSize;ia(i,x*_,p>2?_:0,_,_),d.setRenderTarget(i),v&&d.render(g,a),d.render(e,a)}g.geometry.dispose(),g.material.dispose(),d.toneMapping=h,d.autoClear=l,e.background=m}_textureToCubeUV(e,t){const n=this._renderer,i=e.mapping===_r||e.mapping===xr;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=Pd()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Rd());const r=i?this._cubemapMaterial:this._equirectMaterial,o=new at(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=e;const c=this._cubeSize;ia(t,0,0,3*c,2*c),n.setRenderTarget(t),n.render(o,Yl)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const i=this._lodPlanes.length;for(let r=1;r<i;r++){const o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=Ad[(i-r-1)%Ad.length];this._blur(e,r-1,r,o,a)}t.autoClear=n}_blur(e,t,n,i,r){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,i,"latitudinal",r),this._halfBlur(o,e,n,n,i,"longitudinal",r)}_halfBlur(e,t,n,i,r,o,a){const c=this._renderer,u=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const d=3,l=new at(this._lodPlanes[i],u),h=u.uniforms,f=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*xs-1),v=r/g,m=isFinite(r)?1+Math.floor(d*v):xs;m>xs&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${xs}`);const p=[];let x=0;for(let w=0;w<xs;++w){const C=w/v,y=Math.exp(-C*C/2);p.push(y),w===0?x+=y:w<m&&(x+=2*y)}for(let w=0;w<p.length;w++)p[w]=p[w]/x;h.envMap.value=e.texture,h.samples.value=m,h.weights.value=p,h.latitudinal.value=o==="latitudinal",a&&(h.poleAxis.value=a);const{_lodMax:_}=this;h.dTheta.value=g,h.mipInt.value=_-n;const S=this._sizeLods[i],M=3*S*(i>_-nr?i-_+nr:0),E=4*(this._cubeSize-S);ia(t,M,E,3*S,2*S),c.setRenderTarget(t),c.render(l,Yl)}}function _M(s){const e=[],t=[],n=[];let i=s;const r=s-nr+1+wd.length;for(let o=0;o<r;o++){const a=Math.pow(2,i);t.push(a);let c=1/a;o>s-nr?c=wd[o-s+nr-1]:o===0&&(c=0),n.push(c);const u=1/(a-2),d=-u,l=1+u,h=[d,d,l,d,l,l,d,d,l,l,d,l],f=6,g=6,v=3,m=2,p=1,x=new Float32Array(v*g*f),_=new Float32Array(m*g*f),S=new Float32Array(p*g*f);for(let E=0;E<f;E++){const w=E%3*2/3-1,C=E>2?0:-1,y=[w,C,0,w+2/3,C,0,w+2/3,C+1,0,w,C,0,w+2/3,C+1,0,w,C+1,0];x.set(y,v*g*E),_.set(h,m*g*E);const b=[E,E,E,E,E,E];S.set(b,p*g*E)}const M=new Vt;M.setAttribute("position",new It(x,v)),M.setAttribute("uv",new It(_,m)),M.setAttribute("faceIndex",new It(S,p)),e.push(M),i>nr&&i--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function Cd(s,e,t){const n=new Dn(s,e,t);return n.texture.mapping=Ga,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function ia(s,e,t,n,i){s.viewport.set(e,t,n,i),s.scissor.set(e,t,n,i)}function xM(s,e,t){const n=new Float32Array(xs),i=new L(0,1,0);return new Cn({name:"SphericalGaussianBlur",defines:{n:xs,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:Su(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:ot,depthTest:!1,depthWrite:!1})}function Rd(){return new Cn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Su(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:ot,depthTest:!1,depthWrite:!1})}function Pd(){return new Cn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Su(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:ot,depthTest:!1,depthWrite:!1})}function Su(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function yM(s){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){const c=a.mapping,u=c===Oc||c===kc,d=c===_r||c===xr;if(u||d){let l=e.get(a);const h=l!==void 0?l.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==h)return t===null&&(t=new Dd(s)),l=u?t.fromEquirectangular(a,l):t.fromCubemap(a,l),l.texture.pmremVersion=a.pmremVersion,e.set(a,l),l.texture;if(l!==void 0)return l.texture;{const f=a.image;return u&&f&&f.height>0||d&&f&&i(f)?(t===null&&(t=new Dd(s)),l=u?t.fromEquirectangular(a):t.fromCubemap(a),l.texture.pmremVersion=a.pmremVersion,e.set(a,l),a.addEventListener("dispose",r),l.texture):null}}}return a}function i(a){let c=0;const u=6;for(let d=0;d<u;d++)a[d]!==void 0&&c++;return c===u}function r(a){const c=a.target;c.removeEventListener("dispose",r);const u=e.get(c);u!==void 0&&(e.delete(c),u.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function SM(s){const e={};function t(n){if(e[n]!==void 0)return e[n];let i;switch(n){case"WEBGL_depth_texture":i=s.getExtension("WEBGL_depth_texture")||s.getExtension("MOZ_WEBGL_depth_texture")||s.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":i=s.getExtension("EXT_texture_filter_anisotropic")||s.getExtension("MOZ_EXT_texture_filter_anisotropic")||s.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":i=s.getExtension("WEBGL_compressed_texture_s3tc")||s.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":i=s.getExtension("WEBGL_compressed_texture_pvrtc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:i=s.getExtension(n)}return e[n]=i,i}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const i=t(n);return i===null&&console.warn("THREE.WebGLRenderer: "+n+" extension not supported."),i}}}function bM(s,e,t,n){const i={},r=new WeakMap;function o(l){const h=l.target;h.index!==null&&e.remove(h.index);for(const g in h.attributes)e.remove(h.attributes[g]);for(const g in h.morphAttributes){const v=h.morphAttributes[g];for(let m=0,p=v.length;m<p;m++)e.remove(v[m])}h.removeEventListener("dispose",o),delete i[h.id];const f=r.get(h);f&&(e.remove(f),r.delete(h)),n.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0&&delete h._maxInstanceCount,t.memory.geometries--}function a(l,h){return i[h.id]===!0||(h.addEventListener("dispose",o),i[h.id]=!0,t.memory.geometries++),h}function c(l){const h=l.attributes;for(const g in h)e.update(h[g],s.ARRAY_BUFFER);const f=l.morphAttributes;for(const g in f){const v=f[g];for(let m=0,p=v.length;m<p;m++)e.update(v[m],s.ARRAY_BUFFER)}}function u(l){const h=[],f=l.index,g=l.attributes.position;let v=0;if(f!==null){const x=f.array;v=f.version;for(let _=0,S=x.length;_<S;_+=3){const M=x[_+0],E=x[_+1],w=x[_+2];h.push(M,E,E,w,w,M)}}else if(g!==void 0){const x=g.array;v=g.version;for(let _=0,S=x.length/3-1;_<S;_+=3){const M=_+0,E=_+1,w=_+2;h.push(M,E,E,w,w,M)}}else return;const m=new(Tm(h)?Lm:Pm)(h,1);m.version=v;const p=r.get(l);p&&e.remove(p),r.set(l,m)}function d(l){const h=r.get(l);if(h){const f=l.index;f!==null&&h.version<f.version&&u(l)}else u(l);return r.get(l)}return{get:a,update:c,getWireframeAttribute:d}}function MM(s,e,t){let n;function i(h){n=h}let r,o;function a(h){r=h.type,o=h.bytesPerElement}function c(h,f){s.drawElements(n,f,r,h*o),t.update(f,n,1)}function u(h,f,g){g!==0&&(s.drawElementsInstanced(n,f,r,h*o,g),t.update(f,n,g))}function d(h,f,g){if(g===0)return;const v=e.get("WEBGL_multi_draw");if(v===null)for(let m=0;m<g;m++)this.render(h[m]/o,f[m]);else{v.multiDrawElementsWEBGL(n,f,0,r,h,0,g);let m=0;for(let p=0;p<g;p++)m+=f[p];t.update(m,n,1)}}function l(h,f,g,v){if(g===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<h.length;p++)u(h[p]/o,f[p],v[p]);else{m.multiDrawElementsInstancedWEBGL(n,f,0,r,h,0,v,0,g);let p=0;for(let x=0;x<g;x++)p+=f[x];for(let x=0;x<v.length;x++)t.update(p,n,v[x])}}this.setMode=i,this.setIndex=a,this.render=c,this.renderInstances=u,this.renderMultiDraw=d,this.renderMultiDrawInstances=l}function EM(s){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(t.calls++,o){case s.TRIANGLES:t.triangles+=a*(r/3);break;case s.LINES:t.lines+=a*(r/2);break;case s.LINE_STRIP:t.lines+=a*(r-1);break;case s.LINE_LOOP:t.lines+=a*r;break;case s.POINTS:t.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function i(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:i,update:n}}function wM(s,e,t){const n=new WeakMap,i=new st;function r(o,a,c){const u=o.morphTargetInfluences,d=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,l=d!==void 0?d.length:0;let h=n.get(a);if(h===void 0||h.count!==l){let y=function(){w.dispose(),n.delete(a),a.removeEventListener("dispose",y)};h!==void 0&&h.texture.dispose();const f=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,v=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],p=a.morphAttributes.normal||[],x=a.morphAttributes.color||[];let _=0;f===!0&&(_=1),g===!0&&(_=2),v===!0&&(_=3);let S=a.attributes.position.count*_,M=1;S>e.maxTextureSize&&(M=Math.ceil(S/e.maxTextureSize),S=e.maxTextureSize);const E=new Float32Array(S*M*4*l),w=new Cm(E,S,M,l);w.type=kn,w.needsUpdate=!0;const C=_*4;for(let b=0;b<l;b++){const U=m[b],z=p[b],P=x[b],O=S*M*4*b;for(let F=0;F<U.count;F++){const k=F*C;f===!0&&(i.fromBufferAttribute(U,F),E[O+k+0]=i.x,E[O+k+1]=i.y,E[O+k+2]=i.z,E[O+k+3]=0),g===!0&&(i.fromBufferAttribute(z,F),E[O+k+4]=i.x,E[O+k+5]=i.y,E[O+k+6]=i.z,E[O+k+7]=0),v===!0&&(i.fromBufferAttribute(P,F),E[O+k+8]=i.x,E[O+k+9]=i.y,E[O+k+10]=i.z,E[O+k+11]=P.itemSize===4?i.w:1)}}h={count:l,texture:w,size:new Q(S,M)},n.set(a,h),a.addEventListener("dispose",y)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)c.getUniforms().setValue(s,"morphTexture",o.morphTexture,t);else{let f=0;for(let v=0;v<u.length;v++)f+=u[v];const g=a.morphTargetsRelative?1:1-f;c.getUniforms().setValue(s,"morphTargetBaseInfluence",g),c.getUniforms().setValue(s,"morphTargetInfluences",u)}c.getUniforms().setValue(s,"morphTargetsTexture",h.texture,t),c.getUniforms().setValue(s,"morphTargetsTextureSize",h.size)}return{update:r}}function TM(s,e,t,n){let i=new WeakMap;function r(c){const u=n.render.frame,d=c.geometry,l=e.get(c,d);if(i.get(l)!==u&&(e.update(l),i.set(l,u)),c.isInstancedMesh&&(c.hasEventListener("dispose",a)===!1&&c.addEventListener("dispose",a),i.get(c)!==u&&(t.update(c.instanceMatrix,s.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,s.ARRAY_BUFFER),i.set(c,u))),c.isSkinnedMesh){const h=c.skeleton;i.get(h)!==u&&(h.update(),i.set(h,u))}return l}function o(){i=new WeakMap}function a(c){const u=c.target;u.removeEventListener("dispose",a),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:r,dispose:o}}class Fm extends Ut{constructor(e,t,n,i,r,o,a,c,u,d){if(d=d!==void 0?d:ur,d!==ur&&d!==_o)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&d===ur&&(n=yr),n===void 0&&d===_o&&(n=Eo),super(null,i,r,o,a,c,d,n,u),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:cn,this.minFilter=c!==void 0?c:cn,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const Nm=new Ut,Om=new Fm(1,1);Om.compareFunction=wm;const km=new Cm,Bm=new dy,zm=new xu,Ld=[],Id=[],Ud=new Float32Array(16),Fd=new Float32Array(9),Nd=new Float32Array(4);function Rr(s,e,t){const n=s[0];if(n<=0||n>0)return s;const i=e*t;let r=Ld[i];if(r===void 0&&(r=new Float32Array(i),Ld[i]=r),e!==0){n.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,s[o].toArray(r,a)}return r}function Ft(s,e){if(s.length!==e.length)return!1;for(let t=0,n=s.length;t<n;t++)if(s[t]!==e[t])return!1;return!0}function Nt(s,e){for(let t=0,n=e.length;t<n;t++)s[t]=e[t]}function Xa(s,e){let t=Id[e];t===void 0&&(t=new Int32Array(e),Id[e]=t);for(let n=0;n!==e;++n)t[n]=s.allocateTextureUnit();return t}function AM(s,e){const t=this.cache;t[0]!==e&&(s.uniform1f(this.addr,e),t[0]=e)}function DM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ft(t,e))return;s.uniform2fv(this.addr,e),Nt(t,e)}}function CM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(s.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Ft(t,e))return;s.uniform3fv(this.addr,e),Nt(t,e)}}function RM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ft(t,e))return;s.uniform4fv(this.addr,e),Nt(t,e)}}function PM(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(Ft(t,e))return;s.uniformMatrix2fv(this.addr,!1,e),Nt(t,e)}else{if(Ft(t,n))return;Nd.set(n),s.uniformMatrix2fv(this.addr,!1,Nd),Nt(t,n)}}function LM(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(Ft(t,e))return;s.uniformMatrix3fv(this.addr,!1,e),Nt(t,e)}else{if(Ft(t,n))return;Fd.set(n),s.uniformMatrix3fv(this.addr,!1,Fd),Nt(t,n)}}function IM(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(Ft(t,e))return;s.uniformMatrix4fv(this.addr,!1,e),Nt(t,e)}else{if(Ft(t,n))return;Ud.set(n),s.uniformMatrix4fv(this.addr,!1,Ud),Nt(t,n)}}function UM(s,e){const t=this.cache;t[0]!==e&&(s.uniform1i(this.addr,e),t[0]=e)}function FM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ft(t,e))return;s.uniform2iv(this.addr,e),Nt(t,e)}}function NM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Ft(t,e))return;s.uniform3iv(this.addr,e),Nt(t,e)}}function OM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ft(t,e))return;s.uniform4iv(this.addr,e),Nt(t,e)}}function kM(s,e){const t=this.cache;t[0]!==e&&(s.uniform1ui(this.addr,e),t[0]=e)}function BM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ft(t,e))return;s.uniform2uiv(this.addr,e),Nt(t,e)}}function zM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Ft(t,e))return;s.uniform3uiv(this.addr,e),Nt(t,e)}}function HM(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ft(t,e))return;s.uniform4uiv(this.addr,e),Nt(t,e)}}function VM(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i);const r=this.type===s.SAMPLER_2D_SHADOW?Om:Nm;t.setTexture2D(e||r,i)}function GM(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture3D(e||Bm,i)}function WM(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTextureCube(e||zm,i)}function jM(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture2DArray(e||km,i)}function XM(s){switch(s){case 5126:return AM;case 35664:return DM;case 35665:return CM;case 35666:return RM;case 35674:return PM;case 35675:return LM;case 35676:return IM;case 5124:case 35670:return UM;case 35667:case 35671:return FM;case 35668:case 35672:return NM;case 35669:case 35673:return OM;case 5125:return kM;case 36294:return BM;case 36295:return zM;case 36296:return HM;case 35678:case 36198:case 36298:case 36306:case 35682:return VM;case 35679:case 36299:case 36307:return GM;case 35680:case 36300:case 36308:case 36293:return WM;case 36289:case 36303:case 36311:case 36292:return jM}}function $M(s,e){s.uniform1fv(this.addr,e)}function qM(s,e){const t=Rr(e,this.size,2);s.uniform2fv(this.addr,t)}function YM(s,e){const t=Rr(e,this.size,3);s.uniform3fv(this.addr,t)}function KM(s,e){const t=Rr(e,this.size,4);s.uniform4fv(this.addr,t)}function ZM(s,e){const t=Rr(e,this.size,4);s.uniformMatrix2fv(this.addr,!1,t)}function JM(s,e){const t=Rr(e,this.size,9);s.uniformMatrix3fv(this.addr,!1,t)}function QM(s,e){const t=Rr(e,this.size,16);s.uniformMatrix4fv(this.addr,!1,t)}function eE(s,e){s.uniform1iv(this.addr,e)}function tE(s,e){s.uniform2iv(this.addr,e)}function nE(s,e){s.uniform3iv(this.addr,e)}function iE(s,e){s.uniform4iv(this.addr,e)}function sE(s,e){s.uniform1uiv(this.addr,e)}function rE(s,e){s.uniform2uiv(this.addr,e)}function oE(s,e){s.uniform3uiv(this.addr,e)}function aE(s,e){s.uniform4uiv(this.addr,e)}function lE(s,e,t){const n=this.cache,i=e.length,r=Xa(t,i);Ft(n,r)||(s.uniform1iv(this.addr,r),Nt(n,r));for(let o=0;o!==i;++o)t.setTexture2D(e[o]||Nm,r[o])}function cE(s,e,t){const n=this.cache,i=e.length,r=Xa(t,i);Ft(n,r)||(s.uniform1iv(this.addr,r),Nt(n,r));for(let o=0;o!==i;++o)t.setTexture3D(e[o]||Bm,r[o])}function uE(s,e,t){const n=this.cache,i=e.length,r=Xa(t,i);Ft(n,r)||(s.uniform1iv(this.addr,r),Nt(n,r));for(let o=0;o!==i;++o)t.setTextureCube(e[o]||zm,r[o])}function hE(s,e,t){const n=this.cache,i=e.length,r=Xa(t,i);Ft(n,r)||(s.uniform1iv(this.addr,r),Nt(n,r));for(let o=0;o!==i;++o)t.setTexture2DArray(e[o]||km,r[o])}function dE(s){switch(s){case 5126:return $M;case 35664:return qM;case 35665:return YM;case 35666:return KM;case 35674:return ZM;case 35675:return JM;case 35676:return QM;case 5124:case 35670:return eE;case 35667:case 35671:return tE;case 35668:case 35672:return nE;case 35669:case 35673:return iE;case 5125:return sE;case 36294:return rE;case 36295:return oE;case 36296:return aE;case 35678:case 36198:case 36298:case 36306:case 35682:return lE;case 35679:case 36299:case 36307:return cE;case 35680:case 36300:case 36308:case 36293:return uE;case 36289:case 36303:case 36311:case 36292:return hE}}class fE{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=XM(t.type)}}class pE{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=dE(t.type)}}class mE{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const i=this.seq;for(let r=0,o=i.length;r!==o;++r){const a=i[r];a.setValue(e,t[a.id],n)}}}const ec=/(\w+)(\])?(\[|\.)?/g;function Od(s,e){s.seq.push(e),s.map[e.id]=e}function gE(s,e,t){const n=s.name,i=n.length;for(ec.lastIndex=0;;){const r=ec.exec(n),o=ec.lastIndex;let a=r[1];const c=r[2]==="]",u=r[3];if(c&&(a=a|0),u===void 0||u==="["&&o+2===i){Od(t,u===void 0?new fE(a,s,e):new pE(a,s,e));break}else{let l=t.map[a];l===void 0&&(l=new mE(a),Od(t,l)),t=l}}}class xa{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let i=0;i<n;++i){const r=e.getActiveUniform(t,i),o=e.getUniformLocation(t,r.name);gE(r,o,this)}}setValue(e,t,n,i){const r=this.map[t];r!==void 0&&r.setValue(e,n,i)}setOptional(e,t,n){const i=t[n];i!==void 0&&this.setValue(e,n,i)}static upload(e,t,n,i){for(let r=0,o=t.length;r!==o;++r){const a=t[r],c=n[a.id];c.needsUpdate!==!1&&a.setValue(e,c.value,i)}}static seqWithValue(e,t){const n=[];for(let i=0,r=e.length;i!==r;++i){const o=e[i];o.id in t&&n.push(o)}return n}}function kd(s,e,t){const n=s.createShader(e);return s.shaderSource(n,t),s.compileShader(n),n}const vE=37297;let _E=0;function xE(s,e){const t=s.split(`
`),n=[],i=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=i;o<r;o++){const a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}function yE(s){const e=Je.getPrimaries(Je.workingColorSpace),t=Je.getPrimaries(s);let n;switch(e===t?n="":e===Pa&&t===Ra?n="LinearDisplayP3ToLinearSRGB":e===Ra&&t===Pa&&(n="LinearSRGBToLinearDisplayP3"),s){case $t:case ja:return[n,"LinearTransferOETF"];case Gt:case mu:return[n,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",s),[n,"LinearTransferOETF"]}}function Bd(s,e,t){const n=s.getShaderParameter(e,s.COMPILE_STATUS),i=s.getShaderInfoLog(e).trim();if(n&&i==="")return"";const r=/ERROR: 0:(\d+)/.exec(i);if(r){const o=parseInt(r[1]);return t.toUpperCase()+`

`+i+`

`+xE(s.getShaderSource(e),o)}else return i}function SE(s,e){const t=yE(e);return`vec4 ${s}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`}function bE(s,e){let t;switch(e){case mx:t="Linear";break;case gx:t="Reinhard";break;case vx:t="OptimizedCineon";break;case _x:t="ACESFilmic";break;case yx:t="AgX";break;case Sx:t="Neutral";break;case xx:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+s+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}function ME(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(to).join(`
`)}function EE(s){const e=[];for(const t in s){const n=s[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function wE(s,e){const t={},n=s.getProgramParameter(e,s.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){const r=s.getActiveAttrib(e,i),o=r.name;let a=1;r.type===s.FLOAT_MAT2&&(a=2),r.type===s.FLOAT_MAT3&&(a=3),r.type===s.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:s.getAttribLocation(e,o),locationSize:a}}return t}function to(s){return s!==""}function zd(s,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return s.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Hd(s,e){return s.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const TE=/^[ \t]*#include +<([\w\d./]+)>/gm;function Hc(s){return s.replace(TE,DE)}const AE=new Map;function DE(s,e){let t=ke[e];if(t===void 0){const n=AE.get(e);if(n!==void 0)t=ke[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Hc(t)}const CE=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Vd(s){return s.replace(CE,RE)}function RE(s,e,t,n){let i="";for(let r=parseInt(e);r<parseInt(t);r++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return i}function Gd(s){let e=`precision ${s.precision} float;
	precision ${s.precision} int;
	precision ${s.precision} sampler2D;
	precision ${s.precision} samplerCube;
	precision ${s.precision} sampler3D;
	precision ${s.precision} sampler2DArray;
	precision ${s.precision} sampler2DShadow;
	precision ${s.precision} samplerCubeShadow;
	precision ${s.precision} sampler2DArrayShadow;
	precision ${s.precision} isampler2D;
	precision ${s.precision} isampler3D;
	precision ${s.precision} isamplerCube;
	precision ${s.precision} isampler2DArray;
	precision ${s.precision} usampler2D;
	precision ${s.precision} usampler3D;
	precision ${s.precision} usamplerCube;
	precision ${s.precision} usampler2DArray;
	`;return s.precision==="highp"?e+=`
#define HIGH_PRECISION`:s.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:s.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function PE(s){let e="SHADOWMAP_TYPE_BASIC";return s.shadowMapType===hm?e="SHADOWMAP_TYPE_PCF":s.shadowMapType===H0?e="SHADOWMAP_TYPE_PCF_SOFT":s.shadowMapType===bi&&(e="SHADOWMAP_TYPE_VSM"),e}function LE(s){let e="ENVMAP_TYPE_CUBE";if(s.envMap)switch(s.envMapMode){case _r:case xr:e="ENVMAP_TYPE_CUBE";break;case Ga:e="ENVMAP_TYPE_CUBE_UV";break}return e}function IE(s){let e="ENVMAP_MODE_REFLECTION";if(s.envMap)switch(s.envMapMode){case xr:e="ENVMAP_MODE_REFRACTION";break}return e}function UE(s){let e="ENVMAP_BLENDING_NONE";if(s.envMap)switch(s.combine){case dm:e="ENVMAP_BLENDING_MULTIPLY";break;case fx:e="ENVMAP_BLENDING_MIX";break;case px:e="ENVMAP_BLENDING_ADD";break}return e}function FE(s){const e=s.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:n,maxMip:t}}function NE(s,e,t,n){const i=s.getContext(),r=t.defines;let o=t.vertexShader,a=t.fragmentShader;const c=PE(t),u=LE(t),d=IE(t),l=UE(t),h=FE(t),f=ME(t),g=EE(r),v=i.createProgram();let m,p,x=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(to).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(to).join(`
`),p.length>0&&(p+=`
`)):(m=[Gd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+d:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )","	attribute vec3 morphTarget0;","	attribute vec3 morphTarget1;","	attribute vec3 morphTarget2;","	attribute vec3 morphTarget3;","	#ifdef USE_MORPHNORMALS","		attribute vec3 morphNormal0;","		attribute vec3 morphNormal1;","		attribute vec3 morphNormal2;","		attribute vec3 morphNormal3;","	#else","		attribute vec3 morphTarget4;","		attribute vec3 morphTarget5;","		attribute vec3 morphTarget6;","		attribute vec3 morphTarget7;","	#endif","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(to).join(`
`),p=[Gd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.envMap?"#define "+d:"",t.envMap?"#define "+l:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Qi?"#define TONE_MAPPING":"",t.toneMapping!==Qi?ke.tonemapping_pars_fragment:"",t.toneMapping!==Qi?bE("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",ke.colorspace_pars_fragment,SE("linearToOutputTexel",t.outputColorSpace),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(to).join(`
`)),o=Hc(o),o=zd(o,t),o=Hd(o,t),a=Hc(a),a=zd(a,t),a=Hd(a,t),o=Vd(o),a=Vd(a),t.isRawShaderMaterial!==!0&&(x=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",t.glslVersion===lt?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===lt?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const _=x+m+o,S=x+p+a,M=kd(i,i.VERTEX_SHADER,_),E=kd(i,i.FRAGMENT_SHADER,S);i.attachShader(v,M),i.attachShader(v,E),t.index0AttributeName!==void 0?i.bindAttribLocation(v,0,t.index0AttributeName):t.morphTargets===!0&&i.bindAttribLocation(v,0,"position"),i.linkProgram(v);function w(U){if(s.debug.checkShaderErrors){const z=i.getProgramInfoLog(v).trim(),P=i.getShaderInfoLog(M).trim(),O=i.getShaderInfoLog(E).trim();let F=!0,k=!0;if(i.getProgramParameter(v,i.LINK_STATUS)===!1)if(F=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(i,v,M,E);else{const j=Bd(i,M,"vertex"),D=Bd(i,E,"fragment");console.error("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(v,i.VALIDATE_STATUS)+`

Material Name: `+U.name+`
Material Type: `+U.type+`

Program Info Log: `+z+`
`+j+`
`+D)}else z!==""?console.warn("THREE.WebGLProgram: Program Info Log:",z):(P===""||O==="")&&(k=!1);k&&(U.diagnostics={runnable:F,programLog:z,vertexShader:{log:P,prefix:m},fragmentShader:{log:O,prefix:p}})}i.deleteShader(M),i.deleteShader(E),C=new xa(i,v),y=wE(i,v)}let C;this.getUniforms=function(){return C===void 0&&w(this),C};let y;this.getAttributes=function(){return y===void 0&&w(this),y};let b=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return b===!1&&(b=i.getProgramParameter(v,vE)),b},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(v),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=_E++,this.cacheKey=e,this.usedTimes=1,this.program=v,this.vertexShader=M,this.fragmentShader=E,this}let OE=0;class kE{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,i=this._getShaderStage(t),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(i)===!1&&(o.add(i),i.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new BE(e),t.set(e,n)),n}}class BE{constructor(e){this.id=OE++,this.code=e,this.usedTimes=0}}function zE(s,e,t,n,i,r,o){const a=new vu,c=new kE,u=new Set,d=[],l=i.logarithmicDepthBuffer,h=i.vertexTextures;let f=i.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function v(y){return u.add(y),y===0?"uv":`uv${y}`}function m(y,b,U,z,P){const O=z.fog,F=P.geometry,k=y.isMeshStandardMaterial?z.environment:null,j=(y.isMeshStandardMaterial?t:e).get(y.envMap||k),D=j&&j.mapping===Ga?j.image.height:null,K=g[y.type];y.precision!==null&&(f=i.getMaxPrecision(y.precision),f!==y.precision&&console.warn("THREE.WebGLProgram.getParameters:",y.precision,"not supported, using",f,"instead."));const q=F.morphAttributes.position||F.morphAttributes.normal||F.morphAttributes.color,te=q!==void 0?q.length:0;let ve=0;F.morphAttributes.position!==void 0&&(ve=1),F.morphAttributes.normal!==void 0&&(ve=2),F.morphAttributes.color!==void 0&&(ve=3);let re,N,Y,ae;if(K){const tt=ni[K];re=tt.vertexShader,N=tt.fragmentShader}else re=y.vertexShader,N=y.fragmentShader,c.update(y),Y=c.getVertexShaderID(y),ae=c.getFragmentShaderID(y);const le=s.getRenderTarget(),Ie=P.isInstancedMesh===!0,je=P.isBatchedMesh===!0,V=!!y.map,dt=!!y.matcap,Te=!!j,ut=!!y.aoMap,Re=!!y.lightMap,qe=!!y.bumpMap,Ve=!!y.normalMap,Ye=!!y.displacementMap,Mt=!!y.emissiveMap,R=!!y.metalnessMap,T=!!y.roughnessMap,$=y.anisotropy>0,ee=y.clearcoat>0,ie=y.dispersion>0,se=y.iridescence>0,we=y.sheen>0,me=y.transmission>0,fe=$&&!!y.anisotropyMap,Be=ee&&!!y.clearcoatMap,ce=ee&&!!y.clearcoatNormalMap,Ee=ee&&!!y.clearcoatRoughnessMap,Ke=se&&!!y.iridescenceMap,Ae=se&&!!y.iridescenceThicknessMap,_e=we&&!!y.sheenColorMap,ze=we&&!!y.sheenRoughnessMap,Xe=!!y.specularMap,Tt=!!y.specularColorMap,He=!!y.specularIntensityMap,B=me&&!!y.transmissionMap,ne=me&&!!y.thicknessMap,Z=!!y.gradientMap,he=!!y.alphaMap,ge=y.alphaTest>0,Ze=!!y.alphaHash,ft=!!y.extensions;let Et=Qi;y.toneMapped&&(le===null||le.isXRRenderTarget===!0)&&(Et=s.toneMapping);const qt={shaderID:K,shaderType:y.type,shaderName:y.name,vertexShader:re,fragmentShader:N,defines:y.defines,customVertexShaderID:Y,customFragmentShaderID:ae,isRawShaderMaterial:y.isRawShaderMaterial===!0,glslVersion:y.glslVersion,precision:f,batching:je,instancing:Ie,instancingColor:Ie&&P.instanceColor!==null,instancingMorph:Ie&&P.morphTexture!==null,supportsVertexTextures:h,outputColorSpace:le===null?s.outputColorSpace:le.isXRRenderTarget===!0?le.texture.colorSpace:$t,alphaToCoverage:!!y.alphaToCoverage,map:V,matcap:dt,envMap:Te,envMapMode:Te&&j.mapping,envMapCubeUVHeight:D,aoMap:ut,lightMap:Re,bumpMap:qe,normalMap:Ve,displacementMap:h&&Ye,emissiveMap:Mt,normalMapObjectSpace:Ve&&y.normalMapType===Nx,normalMapTangentSpace:Ve&&y.normalMapType===Em,metalnessMap:R,roughnessMap:T,anisotropy:$,anisotropyMap:fe,clearcoat:ee,clearcoatMap:Be,clearcoatNormalMap:ce,clearcoatRoughnessMap:Ee,dispersion:ie,iridescence:se,iridescenceMap:Ke,iridescenceThicknessMap:Ae,sheen:we,sheenColorMap:_e,sheenRoughnessMap:ze,specularMap:Xe,specularColorMap:Tt,specularIntensityMap:He,transmission:me,transmissionMap:B,thicknessMap:ne,gradientMap:Z,opaque:y.transparent===!1&&y.blending===cr&&y.alphaToCoverage===!1,alphaMap:he,alphaTest:ge,alphaHash:Ze,combine:y.combine,mapUv:V&&v(y.map.channel),aoMapUv:ut&&v(y.aoMap.channel),lightMapUv:Re&&v(y.lightMap.channel),bumpMapUv:qe&&v(y.bumpMap.channel),normalMapUv:Ve&&v(y.normalMap.channel),displacementMapUv:Ye&&v(y.displacementMap.channel),emissiveMapUv:Mt&&v(y.emissiveMap.channel),metalnessMapUv:R&&v(y.metalnessMap.channel),roughnessMapUv:T&&v(y.roughnessMap.channel),anisotropyMapUv:fe&&v(y.anisotropyMap.channel),clearcoatMapUv:Be&&v(y.clearcoatMap.channel),clearcoatNormalMapUv:ce&&v(y.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Ee&&v(y.clearcoatRoughnessMap.channel),iridescenceMapUv:Ke&&v(y.iridescenceMap.channel),iridescenceThicknessMapUv:Ae&&v(y.iridescenceThicknessMap.channel),sheenColorMapUv:_e&&v(y.sheenColorMap.channel),sheenRoughnessMapUv:ze&&v(y.sheenRoughnessMap.channel),specularMapUv:Xe&&v(y.specularMap.channel),specularColorMapUv:Tt&&v(y.specularColorMap.channel),specularIntensityMapUv:He&&v(y.specularIntensityMap.channel),transmissionMapUv:B&&v(y.transmissionMap.channel),thicknessMapUv:ne&&v(y.thicknessMap.channel),alphaMapUv:he&&v(y.alphaMap.channel),vertexTangents:!!F.attributes.tangent&&(Ve||$),vertexColors:y.vertexColors,vertexAlphas:y.vertexColors===!0&&!!F.attributes.color&&F.attributes.color.itemSize===4,pointsUvs:P.isPoints===!0&&!!F.attributes.uv&&(V||he),fog:!!O,useFog:y.fog===!0,fogExp2:!!O&&O.isFogExp2,flatShading:y.flatShading===!0,sizeAttenuation:y.sizeAttenuation===!0,logarithmicDepthBuffer:l,skinning:P.isSkinnedMesh===!0,morphTargets:F.morphAttributes.position!==void 0,morphNormals:F.morphAttributes.normal!==void 0,morphColors:F.morphAttributes.color!==void 0,morphTargetsCount:te,morphTextureStride:ve,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:y.dithering,shadowMapEnabled:s.shadowMap.enabled&&U.length>0,shadowMapType:s.shadowMap.type,toneMapping:Et,useLegacyLights:s._useLegacyLights,decodeVideoTexture:V&&y.map.isVideoTexture===!0&&Je.getTransfer(y.map.colorSpace)===pt,premultipliedAlpha:y.premultipliedAlpha,doubleSided:y.side===si,flipSided:y.side===hn,useDepthPacking:y.depthPacking>=0,depthPacking:y.depthPacking||0,index0AttributeName:y.index0AttributeName,extensionClipCullDistance:ft&&y.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:ft&&y.extensions.multiDraw===!0&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:y.customProgramCacheKey()};return qt.vertexUv1s=u.has(1),qt.vertexUv2s=u.has(2),qt.vertexUv3s=u.has(3),u.clear(),qt}function p(y){const b=[];if(y.shaderID?b.push(y.shaderID):(b.push(y.customVertexShaderID),b.push(y.customFragmentShaderID)),y.defines!==void 0)for(const U in y.defines)b.push(U),b.push(y.defines[U]);return y.isRawShaderMaterial===!1&&(x(b,y),_(b,y),b.push(s.outputColorSpace)),b.push(y.customProgramCacheKey),b.join()}function x(y,b){y.push(b.precision),y.push(b.outputColorSpace),y.push(b.envMapMode),y.push(b.envMapCubeUVHeight),y.push(b.mapUv),y.push(b.alphaMapUv),y.push(b.lightMapUv),y.push(b.aoMapUv),y.push(b.bumpMapUv),y.push(b.normalMapUv),y.push(b.displacementMapUv),y.push(b.emissiveMapUv),y.push(b.metalnessMapUv),y.push(b.roughnessMapUv),y.push(b.anisotropyMapUv),y.push(b.clearcoatMapUv),y.push(b.clearcoatNormalMapUv),y.push(b.clearcoatRoughnessMapUv),y.push(b.iridescenceMapUv),y.push(b.iridescenceThicknessMapUv),y.push(b.sheenColorMapUv),y.push(b.sheenRoughnessMapUv),y.push(b.specularMapUv),y.push(b.specularColorMapUv),y.push(b.specularIntensityMapUv),y.push(b.transmissionMapUv),y.push(b.thicknessMapUv),y.push(b.combine),y.push(b.fogExp2),y.push(b.sizeAttenuation),y.push(b.morphTargetsCount),y.push(b.morphAttributeCount),y.push(b.numDirLights),y.push(b.numPointLights),y.push(b.numSpotLights),y.push(b.numSpotLightMaps),y.push(b.numHemiLights),y.push(b.numRectAreaLights),y.push(b.numDirLightShadows),y.push(b.numPointLightShadows),y.push(b.numSpotLightShadows),y.push(b.numSpotLightShadowsWithMaps),y.push(b.numLightProbes),y.push(b.shadowMapType),y.push(b.toneMapping),y.push(b.numClippingPlanes),y.push(b.numClipIntersection),y.push(b.depthPacking)}function _(y,b){a.disableAll(),b.supportsVertexTextures&&a.enable(0),b.instancing&&a.enable(1),b.instancingColor&&a.enable(2),b.instancingMorph&&a.enable(3),b.matcap&&a.enable(4),b.envMap&&a.enable(5),b.normalMapObjectSpace&&a.enable(6),b.normalMapTangentSpace&&a.enable(7),b.clearcoat&&a.enable(8),b.iridescence&&a.enable(9),b.alphaTest&&a.enable(10),b.vertexColors&&a.enable(11),b.vertexAlphas&&a.enable(12),b.vertexUv1s&&a.enable(13),b.vertexUv2s&&a.enable(14),b.vertexUv3s&&a.enable(15),b.vertexTangents&&a.enable(16),b.anisotropy&&a.enable(17),b.alphaHash&&a.enable(18),b.batching&&a.enable(19),b.dispersion&&a.enable(20),y.push(a.mask),a.disableAll(),b.fog&&a.enable(0),b.useFog&&a.enable(1),b.flatShading&&a.enable(2),b.logarithmicDepthBuffer&&a.enable(3),b.skinning&&a.enable(4),b.morphTargets&&a.enable(5),b.morphNormals&&a.enable(6),b.morphColors&&a.enable(7),b.premultipliedAlpha&&a.enable(8),b.shadowMapEnabled&&a.enable(9),b.useLegacyLights&&a.enable(10),b.doubleSided&&a.enable(11),b.flipSided&&a.enable(12),b.useDepthPacking&&a.enable(13),b.dithering&&a.enable(14),b.transmission&&a.enable(15),b.sheen&&a.enable(16),b.opaque&&a.enable(17),b.pointsUvs&&a.enable(18),b.decodeVideoTexture&&a.enable(19),b.alphaToCoverage&&a.enable(20),y.push(a.mask)}function S(y){const b=g[y.type];let U;if(b){const z=ni[b];U=Ey.clone(z.uniforms)}else U=y.uniforms;return U}function M(y,b){let U;for(let z=0,P=d.length;z<P;z++){const O=d[z];if(O.cacheKey===b){U=O,++U.usedTimes;break}}return U===void 0&&(U=new NE(s,b,y,r),d.push(U)),U}function E(y){if(--y.usedTimes===0){const b=d.indexOf(y);d[b]=d[d.length-1],d.pop(),y.destroy()}}function w(y){c.remove(y)}function C(){c.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:S,acquireProgram:M,releaseProgram:E,releaseShaderCache:w,programs:d,dispose:C}}function HE(){let s=new WeakMap;function e(r){let o=s.get(r);return o===void 0&&(o={},s.set(r,o)),o}function t(r){s.delete(r)}function n(r,o,a){s.get(r)[o]=a}function i(){s=new WeakMap}return{get:e,remove:t,update:n,dispose:i}}function VE(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.material.id!==e.material.id?s.material.id-e.material.id:s.z!==e.z?s.z-e.z:s.id-e.id}function Wd(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.z!==e.z?e.z-s.z:s.id-e.id}function jd(){const s=[];let e=0;const t=[],n=[],i=[];function r(){e=0,t.length=0,n.length=0,i.length=0}function o(l,h,f,g,v,m){let p=s[e];return p===void 0?(p={id:l.id,object:l,geometry:h,material:f,groupOrder:g,renderOrder:l.renderOrder,z:v,group:m},s[e]=p):(p.id=l.id,p.object=l,p.geometry=h,p.material=f,p.groupOrder=g,p.renderOrder=l.renderOrder,p.z=v,p.group=m),e++,p}function a(l,h,f,g,v,m){const p=o(l,h,f,g,v,m);f.transmission>0?n.push(p):f.transparent===!0?i.push(p):t.push(p)}function c(l,h,f,g,v,m){const p=o(l,h,f,g,v,m);f.transmission>0?n.unshift(p):f.transparent===!0?i.unshift(p):t.unshift(p)}function u(l,h){t.length>1&&t.sort(l||VE),n.length>1&&n.sort(h||Wd),i.length>1&&i.sort(h||Wd)}function d(){for(let l=e,h=s.length;l<h;l++){const f=s[l];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:n,transparent:i,init:r,push:a,unshift:c,finish:d,sort:u}}function GE(){let s=new WeakMap;function e(n,i){const r=s.get(n);let o;return r===void 0?(o=new jd,s.set(n,[o])):i>=r.length?(o=new jd,r.push(o)):o=r[i],o}function t(){s=new WeakMap}return{get:e,dispose:t}}function WE(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new L,color:new ye};break;case"SpotLight":t={position:new L,direction:new L,color:new ye,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new L,color:new ye,distance:0,decay:0};break;case"HemisphereLight":t={direction:new L,skyColor:new ye,groundColor:new ye};break;case"RectAreaLight":t={color:new ye,position:new L,halfWidth:new L,halfHeight:new L};break}return s[e.id]=t,t}}}function jE(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Q};break;case"SpotLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Q};break;case"PointLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Q,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[e.id]=t,t}}}let XE=0;function $E(s,e){return(e.castShadow?2:0)-(s.castShadow?2:0)+(e.map?1:0)-(s.map?1:0)}function qE(s){const e=new WE,t=jE(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let u=0;u<9;u++)n.probe.push(new L);const i=new L,r=new Ce,o=new Ce;function a(u,d){let l=0,h=0,f=0;for(let U=0;U<9;U++)n.probe[U].set(0,0,0);let g=0,v=0,m=0,p=0,x=0,_=0,S=0,M=0,E=0,w=0,C=0;u.sort($E);const y=d===!0?Math.PI:1;for(let U=0,z=u.length;U<z;U++){const P=u[U],O=P.color,F=P.intensity,k=P.distance,j=P.shadow&&P.shadow.map?P.shadow.map.texture:null;if(P.isAmbientLight)l+=O.r*F*y,h+=O.g*F*y,f+=O.b*F*y;else if(P.isLightProbe){for(let D=0;D<9;D++)n.probe[D].addScaledVector(P.sh.coefficients[D],F);C++}else if(P.isDirectionalLight){const D=e.get(P);if(D.color.copy(P.color).multiplyScalar(P.intensity*y),P.castShadow){const K=P.shadow,q=t.get(P);q.shadowBias=K.bias,q.shadowNormalBias=K.normalBias,q.shadowRadius=K.radius,q.shadowMapSize=K.mapSize,n.directionalShadow[g]=q,n.directionalShadowMap[g]=j,n.directionalShadowMatrix[g]=P.shadow.matrix,_++}n.directional[g]=D,g++}else if(P.isSpotLight){const D=e.get(P);D.position.setFromMatrixPosition(P.matrixWorld),D.color.copy(O).multiplyScalar(F*y),D.distance=k,D.coneCos=Math.cos(P.angle),D.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),D.decay=P.decay,n.spot[m]=D;const K=P.shadow;if(P.map&&(n.spotLightMap[E]=P.map,E++,K.updateMatrices(P),P.castShadow&&w++),n.spotLightMatrix[m]=K.matrix,P.castShadow){const q=t.get(P);q.shadowBias=K.bias,q.shadowNormalBias=K.normalBias,q.shadowRadius=K.radius,q.shadowMapSize=K.mapSize,n.spotShadow[m]=q,n.spotShadowMap[m]=j,M++}m++}else if(P.isRectAreaLight){const D=e.get(P);D.color.copy(O).multiplyScalar(F),D.halfWidth.set(P.width*.5,0,0),D.halfHeight.set(0,P.height*.5,0),n.rectArea[p]=D,p++}else if(P.isPointLight){const D=e.get(P);if(D.color.copy(P.color).multiplyScalar(P.intensity*y),D.distance=P.distance,D.decay=P.decay,P.castShadow){const K=P.shadow,q=t.get(P);q.shadowBias=K.bias,q.shadowNormalBias=K.normalBias,q.shadowRadius=K.radius,q.shadowMapSize=K.mapSize,q.shadowCameraNear=K.camera.near,q.shadowCameraFar=K.camera.far,n.pointShadow[v]=q,n.pointShadowMap[v]=j,n.pointShadowMatrix[v]=P.shadow.matrix,S++}n.point[v]=D,v++}else if(P.isHemisphereLight){const D=e.get(P);D.skyColor.copy(P.color).multiplyScalar(F*y),D.groundColor.copy(P.groundColor).multiplyScalar(F*y),n.hemi[x]=D,x++}}p>0&&(s.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ue.LTC_FLOAT_1,n.rectAreaLTC2=ue.LTC_FLOAT_2):(n.rectAreaLTC1=ue.LTC_HALF_1,n.rectAreaLTC2=ue.LTC_HALF_2)),n.ambient[0]=l,n.ambient[1]=h,n.ambient[2]=f;const b=n.hash;(b.directionalLength!==g||b.pointLength!==v||b.spotLength!==m||b.rectAreaLength!==p||b.hemiLength!==x||b.numDirectionalShadows!==_||b.numPointShadows!==S||b.numSpotShadows!==M||b.numSpotMaps!==E||b.numLightProbes!==C)&&(n.directional.length=g,n.spot.length=m,n.rectArea.length=p,n.point.length=v,n.hemi.length=x,n.directionalShadow.length=_,n.directionalShadowMap.length=_,n.pointShadow.length=S,n.pointShadowMap.length=S,n.spotShadow.length=M,n.spotShadowMap.length=M,n.directionalShadowMatrix.length=_,n.pointShadowMatrix.length=S,n.spotLightMatrix.length=M+E-w,n.spotLightMap.length=E,n.numSpotLightShadowsWithMaps=w,n.numLightProbes=C,b.directionalLength=g,b.pointLength=v,b.spotLength=m,b.rectAreaLength=p,b.hemiLength=x,b.numDirectionalShadows=_,b.numPointShadows=S,b.numSpotShadows=M,b.numSpotMaps=E,b.numLightProbes=C,n.version=XE++)}function c(u,d){let l=0,h=0,f=0,g=0,v=0;const m=d.matrixWorldInverse;for(let p=0,x=u.length;p<x;p++){const _=u[p];if(_.isDirectionalLight){const S=n.directional[l];S.direction.setFromMatrixPosition(_.matrixWorld),i.setFromMatrixPosition(_.target.matrixWorld),S.direction.sub(i),S.direction.transformDirection(m),l++}else if(_.isSpotLight){const S=n.spot[f];S.position.setFromMatrixPosition(_.matrixWorld),S.position.applyMatrix4(m),S.direction.setFromMatrixPosition(_.matrixWorld),i.setFromMatrixPosition(_.target.matrixWorld),S.direction.sub(i),S.direction.transformDirection(m),f++}else if(_.isRectAreaLight){const S=n.rectArea[g];S.position.setFromMatrixPosition(_.matrixWorld),S.position.applyMatrix4(m),o.identity(),r.copy(_.matrixWorld),r.premultiply(m),o.extractRotation(r),S.halfWidth.set(_.width*.5,0,0),S.halfHeight.set(0,_.height*.5,0),S.halfWidth.applyMatrix4(o),S.halfHeight.applyMatrix4(o),g++}else if(_.isPointLight){const S=n.point[h];S.position.setFromMatrixPosition(_.matrixWorld),S.position.applyMatrix4(m),h++}else if(_.isHemisphereLight){const S=n.hemi[v];S.direction.setFromMatrixPosition(_.matrixWorld),S.direction.transformDirection(m),v++}}}return{setup:a,setupView:c,state:n}}function Xd(s){const e=new qE(s),t=[],n=[];function i(d){u.camera=d,t.length=0,n.length=0}function r(d){t.push(d)}function o(d){n.push(d)}function a(d){e.setup(t,d)}function c(d){e.setupView(t,d)}const u={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:i,state:u,setupLights:a,setupLightsView:c,pushLight:r,pushShadow:o}}function YE(s){let e=new WeakMap;function t(i,r=0){const o=e.get(i);let a;return o===void 0?(a=new Xd(s),e.set(i,[a])):r>=o.length?(a=new Xd(s),o.push(a)):a=o[r],a}function n(){e=new WeakMap}return{get:t,dispose:n}}class KE extends ui{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Ux,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class ZE extends ui{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const JE=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,QE=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function ew(s,e,t){let n=new yu;const i=new Q,r=new Q,o=new st,a=new KE({depthPacking:Fx}),c=new ZE,u={},d=t.maxTextureSize,l={[Ri]:hn,[hn]:Ri,[si]:si},h=new Cn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Q},radius:{value:4}},vertexShader:JE,fragmentShader:QE}),f=h.clone();f.defines.HORIZONTAL_PASS=1;const g=new Vt;g.setAttribute("position",new It(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new at(g,h),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=hm;let p=this.type;this.render=function(E,w,C){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||E.length===0)return;const y=s.getRenderTarget(),b=s.getActiveCubeFace(),U=s.getActiveMipmapLevel(),z=s.state;z.setBlending(ot),z.buffers.color.setClear(1,1,1,1),z.buffers.depth.setTest(!0),z.setScissorTest(!1);const P=p!==bi&&this.type===bi,O=p===bi&&this.type!==bi;for(let F=0,k=E.length;F<k;F++){const j=E[F],D=j.shadow;if(D===void 0){console.warn("THREE.WebGLShadowMap:",j,"has no shadow.");continue}if(D.autoUpdate===!1&&D.needsUpdate===!1)continue;i.copy(D.mapSize);const K=D.getFrameExtents();if(i.multiply(K),r.copy(D.mapSize),(i.x>d||i.y>d)&&(i.x>d&&(r.x=Math.floor(d/K.x),i.x=r.x*K.x,D.mapSize.x=r.x),i.y>d&&(r.y=Math.floor(d/K.y),i.y=r.y*K.y,D.mapSize.y=r.y)),D.map===null||P===!0||O===!0){const te=this.type!==bi?{minFilter:cn,magFilter:cn}:{};D.map!==null&&D.map.dispose(),D.map=new Dn(i.x,i.y,te),D.map.texture.name=j.name+".shadowMap",D.camera.updateProjectionMatrix()}s.setRenderTarget(D.map),s.clear();const q=D.getViewportCount();for(let te=0;te<q;te++){const ve=D.getViewport(te);o.set(r.x*ve.x,r.y*ve.y,r.x*ve.z,r.y*ve.w),z.viewport(o),D.updateMatrices(j,te),n=D.getFrustum(),S(w,C,D.camera,j,this.type)}D.isPointLightShadow!==!0&&this.type===bi&&x(D,C),D.needsUpdate=!1}p=this.type,m.needsUpdate=!1,s.setRenderTarget(y,b,U)};function x(E,w){const C=e.update(v);h.defines.VSM_SAMPLES!==E.blurSamples&&(h.defines.VSM_SAMPLES=E.blurSamples,f.defines.VSM_SAMPLES=E.blurSamples,h.needsUpdate=!0,f.needsUpdate=!0),E.mapPass===null&&(E.mapPass=new Dn(i.x,i.y)),h.uniforms.shadow_pass.value=E.map.texture,h.uniforms.resolution.value=E.mapSize,h.uniforms.radius.value=E.radius,s.setRenderTarget(E.mapPass),s.clear(),s.renderBufferDirect(w,null,C,h,v,null),f.uniforms.shadow_pass.value=E.mapPass.texture,f.uniforms.resolution.value=E.mapSize,f.uniforms.radius.value=E.radius,s.setRenderTarget(E.map),s.clear(),s.renderBufferDirect(w,null,C,f,v,null)}function _(E,w,C,y){let b=null;const U=C.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(U!==void 0)b=U;else if(b=C.isPointLight===!0?c:a,s.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0){const z=b.uuid,P=w.uuid;let O=u[z];O===void 0&&(O={},u[z]=O);let F=O[P];F===void 0&&(F=b.clone(),O[P]=F,w.addEventListener("dispose",M)),b=F}if(b.visible=w.visible,b.wireframe=w.wireframe,y===bi?b.side=w.shadowSide!==null?w.shadowSide:w.side:b.side=w.shadowSide!==null?w.shadowSide:l[w.side],b.alphaMap=w.alphaMap,b.alphaTest=w.alphaTest,b.map=w.map,b.clipShadows=w.clipShadows,b.clippingPlanes=w.clippingPlanes,b.clipIntersection=w.clipIntersection,b.displacementMap=w.displacementMap,b.displacementScale=w.displacementScale,b.displacementBias=w.displacementBias,b.wireframeLinewidth=w.wireframeLinewidth,b.linewidth=w.linewidth,C.isPointLight===!0&&b.isMeshDistanceMaterial===!0){const z=s.properties.get(b);z.light=C}return b}function S(E,w,C,y,b){if(E.visible===!1)return;if(E.layers.test(w.layers)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&b===bi)&&(!E.frustumCulled||n.intersectsObject(E))){E.modelViewMatrix.multiplyMatrices(C.matrixWorldInverse,E.matrixWorld);const P=e.update(E),O=E.material;if(Array.isArray(O)){const F=P.groups;for(let k=0,j=F.length;k<j;k++){const D=F[k],K=O[D.materialIndex];if(K&&K.visible){const q=_(E,K,y,b);E.onBeforeShadow(s,E,w,C,P,q,D),s.renderBufferDirect(C,null,P,q,E,D),E.onAfterShadow(s,E,w,C,P,q,D)}}}else if(O.visible){const F=_(E,O,y,b);E.onBeforeShadow(s,E,w,C,P,F,null),s.renderBufferDirect(C,null,P,F,E,null),E.onAfterShadow(s,E,w,C,P,F,null)}}const z=E.children;for(let P=0,O=z.length;P<O;P++)S(z[P],w,C,y,b)}function M(E){E.target.removeEventListener("dispose",M);for(const C in u){const y=u[C],b=E.target.uuid;b in y&&(y[b].dispose(),delete y[b])}}}function tw(s){function e(){let B=!1;const ne=new st;let Z=null;const he=new st(0,0,0,0);return{setMask:function(ge){Z!==ge&&!B&&(s.colorMask(ge,ge,ge,ge),Z=ge)},setLocked:function(ge){B=ge},setClear:function(ge,Ze,ft,Et,qt){qt===!0&&(ge*=Et,Ze*=Et,ft*=Et),ne.set(ge,Ze,ft,Et),he.equals(ne)===!1&&(s.clearColor(ge,Ze,ft,Et),he.copy(ne))},reset:function(){B=!1,Z=null,he.set(-1,0,0,0)}}}function t(){let B=!1,ne=null,Z=null,he=null;return{setTest:function(ge){ge?ae(s.DEPTH_TEST):le(s.DEPTH_TEST)},setMask:function(ge){ne!==ge&&!B&&(s.depthMask(ge),ne=ge)},setFunc:function(ge){if(Z!==ge){switch(ge){case ox:s.depthFunc(s.NEVER);break;case ax:s.depthFunc(s.ALWAYS);break;case lx:s.depthFunc(s.LESS);break;case Da:s.depthFunc(s.LEQUAL);break;case cx:s.depthFunc(s.EQUAL);break;case ux:s.depthFunc(s.GEQUAL);break;case hx:s.depthFunc(s.GREATER);break;case dx:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}Z=ge}},setLocked:function(ge){B=ge},setClear:function(ge){he!==ge&&(s.clearDepth(ge),he=ge)},reset:function(){B=!1,ne=null,Z=null,he=null}}}function n(){let B=!1,ne=null,Z=null,he=null,ge=null,Ze=null,ft=null,Et=null,qt=null;return{setTest:function(tt){B||(tt?ae(s.STENCIL_TEST):le(s.STENCIL_TEST))},setMask:function(tt){ne!==tt&&!B&&(s.stencilMask(tt),ne=tt)},setFunc:function(tt,Zn,sn){(Z!==tt||he!==Zn||ge!==sn)&&(s.stencilFunc(tt,Zn,sn),Z=tt,he=Zn,ge=sn)},setOp:function(tt,Zn,sn){(Ze!==tt||ft!==Zn||Et!==sn)&&(s.stencilOp(tt,Zn,sn),Ze=tt,ft=Zn,Et=sn)},setLocked:function(tt){B=tt},setClear:function(tt){qt!==tt&&(s.clearStencil(tt),qt=tt)},reset:function(){B=!1,ne=null,Z=null,he=null,ge=null,Ze=null,ft=null,Et=null,qt=null}}}const i=new e,r=new t,o=new n,a=new WeakMap,c=new WeakMap;let u={},d={},l=new WeakMap,h=[],f=null,g=!1,v=null,m=null,p=null,x=null,_=null,S=null,M=null,E=new ye(0,0,0),w=0,C=!1,y=null,b=null,U=null,z=null,P=null;const O=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let F=!1,k=0;const j=s.getParameter(s.VERSION);j.indexOf("WebGL")!==-1?(k=parseFloat(/^WebGL (\d)/.exec(j)[1]),F=k>=1):j.indexOf("OpenGL ES")!==-1&&(k=parseFloat(/^OpenGL ES (\d)/.exec(j)[1]),F=k>=2);let D=null,K={};const q=s.getParameter(s.SCISSOR_BOX),te=s.getParameter(s.VIEWPORT),ve=new st().fromArray(q),re=new st().fromArray(te);function N(B,ne,Z,he){const ge=new Uint8Array(4),Ze=s.createTexture();s.bindTexture(B,Ze),s.texParameteri(B,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(B,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let ft=0;ft<Z;ft++)B===s.TEXTURE_3D||B===s.TEXTURE_2D_ARRAY?s.texImage3D(ne,0,s.RGBA,1,1,he,0,s.RGBA,s.UNSIGNED_BYTE,ge):s.texImage2D(ne+ft,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,ge);return Ze}const Y={};Y[s.TEXTURE_2D]=N(s.TEXTURE_2D,s.TEXTURE_2D,1),Y[s.TEXTURE_CUBE_MAP]=N(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),Y[s.TEXTURE_2D_ARRAY]=N(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),Y[s.TEXTURE_3D]=N(s.TEXTURE_3D,s.TEXTURE_3D,1,1),i.setClear(0,0,0,1),r.setClear(1),o.setClear(0),ae(s.DEPTH_TEST),r.setFunc(Da),qe(!1),Ve(wh),ae(s.CULL_FACE),ut(ot);function ae(B){u[B]!==!0&&(s.enable(B),u[B]=!0)}function le(B){u[B]!==!1&&(s.disable(B),u[B]=!1)}function Ie(B,ne){return d[B]!==ne?(s.bindFramebuffer(B,ne),d[B]=ne,B===s.DRAW_FRAMEBUFFER&&(d[s.FRAMEBUFFER]=ne),B===s.FRAMEBUFFER&&(d[s.DRAW_FRAMEBUFFER]=ne),!0):!1}function je(B,ne){let Z=h,he=!1;if(B){Z=l.get(ne),Z===void 0&&(Z=[],l.set(ne,Z));const ge=B.textures;if(Z.length!==ge.length||Z[0]!==s.COLOR_ATTACHMENT0){for(let Ze=0,ft=ge.length;Ze<ft;Ze++)Z[Ze]=s.COLOR_ATTACHMENT0+Ze;Z.length=ge.length,he=!0}}else Z[0]!==s.BACK&&(Z[0]=s.BACK,he=!0);he&&s.drawBuffers(Z)}function V(B){return f!==B?(s.useProgram(B),f=B,!0):!1}const dt={[_s]:s.FUNC_ADD,[G0]:s.FUNC_SUBTRACT,[W0]:s.FUNC_REVERSE_SUBTRACT};dt[j0]=s.MIN,dt[X0]=s.MAX;const Te={[$0]:s.ZERO,[q0]:s.ONE,[Y0]:s.SRC_COLOR,[Fc]:s.SRC_ALPHA,[tx]:s.SRC_ALPHA_SATURATE,[Q0]:s.DST_COLOR,[Z0]:s.DST_ALPHA,[K0]:s.ONE_MINUS_SRC_COLOR,[Nc]:s.ONE_MINUS_SRC_ALPHA,[ex]:s.ONE_MINUS_DST_COLOR,[J0]:s.ONE_MINUS_DST_ALPHA,[nx]:s.CONSTANT_COLOR,[ix]:s.ONE_MINUS_CONSTANT_COLOR,[sx]:s.CONSTANT_ALPHA,[rx]:s.ONE_MINUS_CONSTANT_ALPHA};function ut(B,ne,Z,he,ge,Ze,ft,Et,qt,tt){if(B===ot){g===!0&&(le(s.BLEND),g=!1);return}if(g===!1&&(ae(s.BLEND),g=!0),B!==V0){if(B!==v||tt!==C){if((m!==_s||_!==_s)&&(s.blendEquation(s.FUNC_ADD),m=_s,_=_s),tt)switch(B){case cr:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Uc:s.blendFunc(s.ONE,s.ONE);break;case Th:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case Ah:s.blendFuncSeparate(s.ZERO,s.SRC_COLOR,s.ZERO,s.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",B);break}else switch(B){case cr:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Uc:s.blendFunc(s.SRC_ALPHA,s.ONE);break;case Th:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case Ah:s.blendFunc(s.ZERO,s.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",B);break}p=null,x=null,S=null,M=null,E.set(0,0,0),w=0,v=B,C=tt}return}ge=ge||ne,Ze=Ze||Z,ft=ft||he,(ne!==m||ge!==_)&&(s.blendEquationSeparate(dt[ne],dt[ge]),m=ne,_=ge),(Z!==p||he!==x||Ze!==S||ft!==M)&&(s.blendFuncSeparate(Te[Z],Te[he],Te[Ze],Te[ft]),p=Z,x=he,S=Ze,M=ft),(Et.equals(E)===!1||qt!==w)&&(s.blendColor(Et.r,Et.g,Et.b,qt),E.copy(Et),w=qt),v=B,C=!1}function Re(B,ne){B.side===si?le(s.CULL_FACE):ae(s.CULL_FACE);let Z=B.side===hn;ne&&(Z=!Z),qe(Z),B.blending===cr&&B.transparent===!1?ut(ot):ut(B.blending,B.blendEquation,B.blendSrc,B.blendDst,B.blendEquationAlpha,B.blendSrcAlpha,B.blendDstAlpha,B.blendColor,B.blendAlpha,B.premultipliedAlpha),r.setFunc(B.depthFunc),r.setTest(B.depthTest),r.setMask(B.depthWrite),i.setMask(B.colorWrite);const he=B.stencilWrite;o.setTest(he),he&&(o.setMask(B.stencilWriteMask),o.setFunc(B.stencilFunc,B.stencilRef,B.stencilFuncMask),o.setOp(B.stencilFail,B.stencilZFail,B.stencilZPass)),Mt(B.polygonOffset,B.polygonOffsetFactor,B.polygonOffsetUnits),B.alphaToCoverage===!0?ae(s.SAMPLE_ALPHA_TO_COVERAGE):le(s.SAMPLE_ALPHA_TO_COVERAGE)}function qe(B){y!==B&&(B?s.frontFace(s.CW):s.frontFace(s.CCW),y=B)}function Ve(B){B!==B0?(ae(s.CULL_FACE),B!==b&&(B===wh?s.cullFace(s.BACK):B===z0?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):le(s.CULL_FACE),b=B}function Ye(B){B!==U&&(F&&s.lineWidth(B),U=B)}function Mt(B,ne,Z){B?(ae(s.POLYGON_OFFSET_FILL),(z!==ne||P!==Z)&&(s.polygonOffset(ne,Z),z=ne,P=Z)):le(s.POLYGON_OFFSET_FILL)}function R(B){B?ae(s.SCISSOR_TEST):le(s.SCISSOR_TEST)}function T(B){B===void 0&&(B=s.TEXTURE0+O-1),D!==B&&(s.activeTexture(B),D=B)}function $(B,ne,Z){Z===void 0&&(D===null?Z=s.TEXTURE0+O-1:Z=D);let he=K[Z];he===void 0&&(he={type:void 0,texture:void 0},K[Z]=he),(he.type!==B||he.texture!==ne)&&(D!==Z&&(s.activeTexture(Z),D=Z),s.bindTexture(B,ne||Y[B]),he.type=B,he.texture=ne)}function ee(){const B=K[D];B!==void 0&&B.type!==void 0&&(s.bindTexture(B.type,null),B.type=void 0,B.texture=void 0)}function ie(){try{s.compressedTexImage2D.apply(s,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function se(){try{s.compressedTexImage3D.apply(s,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function we(){try{s.texSubImage2D.apply(s,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function me(){try{s.texSubImage3D.apply(s,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function fe(){try{s.compressedTexSubImage2D.apply(s,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function Be(){try{s.compressedTexSubImage3D.apply(s,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function ce(){try{s.texStorage2D.apply(s,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function Ee(){try{s.texStorage3D.apply(s,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function Ke(){try{s.texImage2D.apply(s,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function Ae(){try{s.texImage3D.apply(s,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function _e(B){ve.equals(B)===!1&&(s.scissor(B.x,B.y,B.z,B.w),ve.copy(B))}function ze(B){re.equals(B)===!1&&(s.viewport(B.x,B.y,B.z,B.w),re.copy(B))}function Xe(B,ne){let Z=c.get(ne);Z===void 0&&(Z=new WeakMap,c.set(ne,Z));let he=Z.get(B);he===void 0&&(he=s.getUniformBlockIndex(ne,B.name),Z.set(B,he))}function Tt(B,ne){const he=c.get(ne).get(B);a.get(ne)!==he&&(s.uniformBlockBinding(ne,he,B.__bindingPointIndex),a.set(ne,he))}function He(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),u={},D=null,K={},d={},l=new WeakMap,h=[],f=null,g=!1,v=null,m=null,p=null,x=null,_=null,S=null,M=null,E=new ye(0,0,0),w=0,C=!1,y=null,b=null,U=null,z=null,P=null,ve.set(0,0,s.canvas.width,s.canvas.height),re.set(0,0,s.canvas.width,s.canvas.height),i.reset(),r.reset(),o.reset()}return{buffers:{color:i,depth:r,stencil:o},enable:ae,disable:le,bindFramebuffer:Ie,drawBuffers:je,useProgram:V,setBlending:ut,setMaterial:Re,setFlipSided:qe,setCullFace:Ve,setLineWidth:Ye,setPolygonOffset:Mt,setScissorTest:R,activeTexture:T,bindTexture:$,unbindTexture:ee,compressedTexImage2D:ie,compressedTexImage3D:se,texImage2D:Ke,texImage3D:Ae,updateUBOMapping:Xe,uniformBlockBinding:Tt,texStorage2D:ce,texStorage3D:Ee,texSubImage2D:we,texSubImage3D:me,compressedTexSubImage2D:fe,compressedTexSubImage3D:Be,scissor:_e,viewport:ze,reset:He}}function nw(s,e,t,n,i,r,o){const a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),u=new Q,d=new WeakMap;let l;const h=new WeakMap;let f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(R,T){return f?new OffscreenCanvas(R,T):yo("canvas")}function v(R,T,$){let ee=1;const ie=Mt(R);if((ie.width>$||ie.height>$)&&(ee=$/Math.max(ie.width,ie.height)),ee<1)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){const se=Math.floor(ee*ie.width),we=Math.floor(ee*ie.height);l===void 0&&(l=g(se,we));const me=T?g(se,we):l;return me.width=se,me.height=we,me.getContext("2d").drawImage(R,0,0,se,we),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+ie.width+"x"+ie.height+") to ("+se+"x"+we+")."),me}else return"data"in R&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+ie.width+"x"+ie.height+")."),R;return R}function m(R){return R.generateMipmaps&&R.minFilter!==cn&&R.minFilter!==jt}function p(R){s.generateMipmap(R)}function x(R,T,$,ee,ie=!1){if(R!==null){if(s[R]!==void 0)return s[R];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let se=T;if(T===s.RED&&($===s.FLOAT&&(se=s.R32F),$===s.HALF_FLOAT&&(se=s.R16F),$===s.UNSIGNED_BYTE&&(se=s.R8)),T===s.RED_INTEGER&&($===s.UNSIGNED_BYTE&&(se=s.R8UI),$===s.UNSIGNED_SHORT&&(se=s.R16UI),$===s.UNSIGNED_INT&&(se=s.R32UI),$===s.BYTE&&(se=s.R8I),$===s.SHORT&&(se=s.R16I),$===s.INT&&(se=s.R32I)),T===s.RG&&($===s.FLOAT&&(se=s.RG32F),$===s.HALF_FLOAT&&(se=s.RG16F),$===s.UNSIGNED_BYTE&&(se=s.RG8)),T===s.RG_INTEGER&&($===s.UNSIGNED_BYTE&&(se=s.RG8UI),$===s.UNSIGNED_SHORT&&(se=s.RG16UI),$===s.UNSIGNED_INT&&(se=s.RG32UI),$===s.BYTE&&(se=s.RG8I),$===s.SHORT&&(se=s.RG16I),$===s.INT&&(se=s.RG32I)),T===s.RGB&&$===s.UNSIGNED_INT_5_9_9_9_REV&&(se=s.RGB9_E5),T===s.RGBA){const we=ie?Ca:Je.getTransfer(ee);$===s.FLOAT&&(se=s.RGBA32F),$===s.HALF_FLOAT&&(se=s.RGBA16F),$===s.UNSIGNED_BYTE&&(se=we===pt?s.SRGB8_ALPHA8:s.RGBA8),$===s.UNSIGNED_SHORT_4_4_4_4&&(se=s.RGBA4),$===s.UNSIGNED_SHORT_5_5_5_1&&(se=s.RGB5_A1)}return(se===s.R16F||se===s.R32F||se===s.RG16F||se===s.RG32F||se===s.RGBA16F||se===s.RGBA32F)&&e.get("EXT_color_buffer_float"),se}function _(R,T){return m(R)===!0||R.isFramebufferTexture&&R.minFilter!==cn&&R.minFilter!==jt?Math.log2(Math.max(T.width,T.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?T.mipmaps.length:1}function S(R){const T=R.target;T.removeEventListener("dispose",S),E(T),T.isVideoTexture&&d.delete(T)}function M(R){const T=R.target;T.removeEventListener("dispose",M),C(T)}function E(R){const T=n.get(R);if(T.__webglInit===void 0)return;const $=R.source,ee=h.get($);if(ee){const ie=ee[T.__cacheKey];ie.usedTimes--,ie.usedTimes===0&&w(R),Object.keys(ee).length===0&&h.delete($)}n.remove(R)}function w(R){const T=n.get(R);s.deleteTexture(T.__webglTexture);const $=R.source,ee=h.get($);delete ee[T.__cacheKey],o.memory.textures--}function C(R){const T=n.get(R);if(R.depthTexture&&R.depthTexture.dispose(),R.isWebGLCubeRenderTarget)for(let ee=0;ee<6;ee++){if(Array.isArray(T.__webglFramebuffer[ee]))for(let ie=0;ie<T.__webglFramebuffer[ee].length;ie++)s.deleteFramebuffer(T.__webglFramebuffer[ee][ie]);else s.deleteFramebuffer(T.__webglFramebuffer[ee]);T.__webglDepthbuffer&&s.deleteRenderbuffer(T.__webglDepthbuffer[ee])}else{if(Array.isArray(T.__webglFramebuffer))for(let ee=0;ee<T.__webglFramebuffer.length;ee++)s.deleteFramebuffer(T.__webglFramebuffer[ee]);else s.deleteFramebuffer(T.__webglFramebuffer);if(T.__webglDepthbuffer&&s.deleteRenderbuffer(T.__webglDepthbuffer),T.__webglMultisampledFramebuffer&&s.deleteFramebuffer(T.__webglMultisampledFramebuffer),T.__webglColorRenderbuffer)for(let ee=0;ee<T.__webglColorRenderbuffer.length;ee++)T.__webglColorRenderbuffer[ee]&&s.deleteRenderbuffer(T.__webglColorRenderbuffer[ee]);T.__webglDepthRenderbuffer&&s.deleteRenderbuffer(T.__webglDepthRenderbuffer)}const $=R.textures;for(let ee=0,ie=$.length;ee<ie;ee++){const se=n.get($[ee]);se.__webglTexture&&(s.deleteTexture(se.__webglTexture),o.memory.textures--),n.remove($[ee])}n.remove(R)}let y=0;function b(){y=0}function U(){const R=y;return R>=i.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+R+" texture units while this GPU supports only "+i.maxTextures),y+=1,R}function z(R){const T=[];return T.push(R.wrapS),T.push(R.wrapT),T.push(R.wrapR||0),T.push(R.magFilter),T.push(R.minFilter),T.push(R.anisotropy),T.push(R.internalFormat),T.push(R.format),T.push(R.type),T.push(R.generateMipmaps),T.push(R.premultiplyAlpha),T.push(R.flipY),T.push(R.unpackAlignment),T.push(R.colorSpace),T.join()}function P(R,T){const $=n.get(R);if(R.isVideoTexture&&Ve(R),R.isRenderTargetTexture===!1&&R.version>0&&$.__version!==R.version){const ee=R.image;if(ee===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(ee.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{ve($,R,T);return}}t.bindTexture(s.TEXTURE_2D,$.__webglTexture,s.TEXTURE0+T)}function O(R,T){const $=n.get(R);if(R.version>0&&$.__version!==R.version){ve($,R,T);return}t.bindTexture(s.TEXTURE_2D_ARRAY,$.__webglTexture,s.TEXTURE0+T)}function F(R,T){const $=n.get(R);if(R.version>0&&$.__version!==R.version){ve($,R,T);return}t.bindTexture(s.TEXTURE_3D,$.__webglTexture,s.TEXTURE0+T)}function k(R,T){const $=n.get(R);if(R.version>0&&$.__version!==R.version){re($,R,T);return}t.bindTexture(s.TEXTURE_CUBE_MAP,$.__webglTexture,s.TEXTURE0+T)}const j={[ci]:s.REPEAT,[ai]:s.CLAMP_TO_EDGE,[vo]:s.MIRRORED_REPEAT},D={[cn]:s.NEAREST,[pm]:s.NEAREST_MIPMAP_NEAREST,[eo]:s.NEAREST_MIPMAP_LINEAR,[jt]:s.LINEAR,[va]:s.LINEAR_MIPMAP_NEAREST,[wi]:s.LINEAR_MIPMAP_LINEAR},K={[Ox]:s.NEVER,[Gx]:s.ALWAYS,[kx]:s.LESS,[wm]:s.LEQUAL,[Bx]:s.EQUAL,[Vx]:s.GEQUAL,[zx]:s.GREATER,[Hx]:s.NOTEQUAL};function q(R,T){if(T.type===kn&&e.has("OES_texture_float_linear")===!1&&(T.magFilter===jt||T.magFilter===va||T.magFilter===eo||T.magFilter===wi||T.minFilter===jt||T.minFilter===va||T.minFilter===eo||T.minFilter===wi)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(R,s.TEXTURE_WRAP_S,j[T.wrapS]),s.texParameteri(R,s.TEXTURE_WRAP_T,j[T.wrapT]),(R===s.TEXTURE_3D||R===s.TEXTURE_2D_ARRAY)&&s.texParameteri(R,s.TEXTURE_WRAP_R,j[T.wrapR]),s.texParameteri(R,s.TEXTURE_MAG_FILTER,D[T.magFilter]),s.texParameteri(R,s.TEXTURE_MIN_FILTER,D[T.minFilter]),T.compareFunction&&(s.texParameteri(R,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(R,s.TEXTURE_COMPARE_FUNC,K[T.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(T.magFilter===cn||T.minFilter!==eo&&T.minFilter!==wi||T.type===kn&&e.has("OES_texture_float_linear")===!1)return;if(T.anisotropy>1||n.get(T).__currentAnisotropy){const $=e.get("EXT_texture_filter_anisotropic");s.texParameterf(R,$.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(T.anisotropy,i.getMaxAnisotropy())),n.get(T).__currentAnisotropy=T.anisotropy}}}function te(R,T){let $=!1;R.__webglInit===void 0&&(R.__webglInit=!0,T.addEventListener("dispose",S));const ee=T.source;let ie=h.get(ee);ie===void 0&&(ie={},h.set(ee,ie));const se=z(T);if(se!==R.__cacheKey){ie[se]===void 0&&(ie[se]={texture:s.createTexture(),usedTimes:0},o.memory.textures++,$=!0),ie[se].usedTimes++;const we=ie[R.__cacheKey];we!==void 0&&(ie[R.__cacheKey].usedTimes--,we.usedTimes===0&&w(T)),R.__cacheKey=se,R.__webglTexture=ie[se].texture}return $}function ve(R,T,$){let ee=s.TEXTURE_2D;(T.isDataArrayTexture||T.isCompressedArrayTexture)&&(ee=s.TEXTURE_2D_ARRAY),T.isData3DTexture&&(ee=s.TEXTURE_3D);const ie=te(R,T),se=T.source;t.bindTexture(ee,R.__webglTexture,s.TEXTURE0+$);const we=n.get(se);if(se.version!==we.__version||ie===!0){t.activeTexture(s.TEXTURE0+$);const me=Je.getPrimaries(Je.workingColorSpace),fe=T.colorSpace===Gi?null:Je.getPrimaries(T.colorSpace),Be=T.colorSpace===Gi||me===fe?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,T.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,T.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,T.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,Be);let ce=v(T.image,!1,i.maxTextureSize);ce=Ye(T,ce);const Ee=r.convert(T.format,T.colorSpace),Ke=r.convert(T.type);let Ae=x(T.internalFormat,Ee,Ke,T.colorSpace,T.isVideoTexture);q(ee,T);let _e;const ze=T.mipmaps,Xe=T.isVideoTexture!==!0,Tt=we.__version===void 0||ie===!0,He=se.dataReady,B=_(T,ce);if(T.isDepthTexture)Ae=s.DEPTH_COMPONENT16,T.type===kn?Ae=s.DEPTH_COMPONENT32F:T.type===yr?Ae=s.DEPTH_COMPONENT24:T.type===Eo&&(Ae=s.DEPTH24_STENCIL8),Tt&&(Xe?t.texStorage2D(s.TEXTURE_2D,1,Ae,ce.width,ce.height):t.texImage2D(s.TEXTURE_2D,0,Ae,ce.width,ce.height,0,Ee,Ke,null));else if(T.isDataTexture)if(ze.length>0){Xe&&Tt&&t.texStorage2D(s.TEXTURE_2D,B,Ae,ze[0].width,ze[0].height);for(let ne=0,Z=ze.length;ne<Z;ne++)_e=ze[ne],Xe?He&&t.texSubImage2D(s.TEXTURE_2D,ne,0,0,_e.width,_e.height,Ee,Ke,_e.data):t.texImage2D(s.TEXTURE_2D,ne,Ae,_e.width,_e.height,0,Ee,Ke,_e.data);T.generateMipmaps=!1}else Xe?(Tt&&t.texStorage2D(s.TEXTURE_2D,B,Ae,ce.width,ce.height),He&&t.texSubImage2D(s.TEXTURE_2D,0,0,0,ce.width,ce.height,Ee,Ke,ce.data)):t.texImage2D(s.TEXTURE_2D,0,Ae,ce.width,ce.height,0,Ee,Ke,ce.data);else if(T.isCompressedTexture)if(T.isCompressedArrayTexture){Xe&&Tt&&t.texStorage3D(s.TEXTURE_2D_ARRAY,B,Ae,ze[0].width,ze[0].height,ce.depth);for(let ne=0,Z=ze.length;ne<Z;ne++)_e=ze[ne],T.format!==Bn?Ee!==null?Xe?He&&t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,ne,0,0,0,_e.width,_e.height,ce.depth,Ee,_e.data,0,0):t.compressedTexImage3D(s.TEXTURE_2D_ARRAY,ne,Ae,_e.width,_e.height,ce.depth,0,_e.data,0,0):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Xe?He&&t.texSubImage3D(s.TEXTURE_2D_ARRAY,ne,0,0,0,_e.width,_e.height,ce.depth,Ee,Ke,_e.data):t.texImage3D(s.TEXTURE_2D_ARRAY,ne,Ae,_e.width,_e.height,ce.depth,0,Ee,Ke,_e.data)}else{Xe&&Tt&&t.texStorage2D(s.TEXTURE_2D,B,Ae,ze[0].width,ze[0].height);for(let ne=0,Z=ze.length;ne<Z;ne++)_e=ze[ne],T.format!==Bn?Ee!==null?Xe?He&&t.compressedTexSubImage2D(s.TEXTURE_2D,ne,0,0,_e.width,_e.height,Ee,_e.data):t.compressedTexImage2D(s.TEXTURE_2D,ne,Ae,_e.width,_e.height,0,_e.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Xe?He&&t.texSubImage2D(s.TEXTURE_2D,ne,0,0,_e.width,_e.height,Ee,Ke,_e.data):t.texImage2D(s.TEXTURE_2D,ne,Ae,_e.width,_e.height,0,Ee,Ke,_e.data)}else if(T.isDataArrayTexture)Xe?(Tt&&t.texStorage3D(s.TEXTURE_2D_ARRAY,B,Ae,ce.width,ce.height,ce.depth),He&&t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,ce.width,ce.height,ce.depth,Ee,Ke,ce.data)):t.texImage3D(s.TEXTURE_2D_ARRAY,0,Ae,ce.width,ce.height,ce.depth,0,Ee,Ke,ce.data);else if(T.isData3DTexture)Xe?(Tt&&t.texStorage3D(s.TEXTURE_3D,B,Ae,ce.width,ce.height,ce.depth),He&&t.texSubImage3D(s.TEXTURE_3D,0,0,0,0,ce.width,ce.height,ce.depth,Ee,Ke,ce.data)):t.texImage3D(s.TEXTURE_3D,0,Ae,ce.width,ce.height,ce.depth,0,Ee,Ke,ce.data);else if(T.isFramebufferTexture){if(Tt)if(Xe)t.texStorage2D(s.TEXTURE_2D,B,Ae,ce.width,ce.height);else{let ne=ce.width,Z=ce.height;for(let he=0;he<B;he++)t.texImage2D(s.TEXTURE_2D,he,Ae,ne,Z,0,Ee,Ke,null),ne>>=1,Z>>=1}}else if(ze.length>0){if(Xe&&Tt){const ne=Mt(ze[0]);t.texStorage2D(s.TEXTURE_2D,B,Ae,ne.width,ne.height)}for(let ne=0,Z=ze.length;ne<Z;ne++)_e=ze[ne],Xe?He&&t.texSubImage2D(s.TEXTURE_2D,ne,0,0,Ee,Ke,_e):t.texImage2D(s.TEXTURE_2D,ne,Ae,Ee,Ke,_e);T.generateMipmaps=!1}else if(Xe){if(Tt){const ne=Mt(ce);t.texStorage2D(s.TEXTURE_2D,B,Ae,ne.width,ne.height)}He&&t.texSubImage2D(s.TEXTURE_2D,0,0,0,Ee,Ke,ce)}else t.texImage2D(s.TEXTURE_2D,0,Ae,Ee,Ke,ce);m(T)&&p(ee),we.__version=se.version,T.onUpdate&&T.onUpdate(T)}R.__version=T.version}function re(R,T,$){if(T.image.length!==6)return;const ee=te(R,T),ie=T.source;t.bindTexture(s.TEXTURE_CUBE_MAP,R.__webglTexture,s.TEXTURE0+$);const se=n.get(ie);if(ie.version!==se.__version||ee===!0){t.activeTexture(s.TEXTURE0+$);const we=Je.getPrimaries(Je.workingColorSpace),me=T.colorSpace===Gi?null:Je.getPrimaries(T.colorSpace),fe=T.colorSpace===Gi||we===me?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,T.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,T.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,T.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,fe);const Be=T.isCompressedTexture||T.image[0].isCompressedTexture,ce=T.image[0]&&T.image[0].isDataTexture,Ee=[];for(let Z=0;Z<6;Z++)!Be&&!ce?Ee[Z]=v(T.image[Z],!0,i.maxCubemapSize):Ee[Z]=ce?T.image[Z].image:T.image[Z],Ee[Z]=Ye(T,Ee[Z]);const Ke=Ee[0],Ae=r.convert(T.format,T.colorSpace),_e=r.convert(T.type),ze=x(T.internalFormat,Ae,_e,T.colorSpace),Xe=T.isVideoTexture!==!0,Tt=se.__version===void 0||ee===!0,He=ie.dataReady;let B=_(T,Ke);q(s.TEXTURE_CUBE_MAP,T);let ne;if(Be){Xe&&Tt&&t.texStorage2D(s.TEXTURE_CUBE_MAP,B,ze,Ke.width,Ke.height);for(let Z=0;Z<6;Z++){ne=Ee[Z].mipmaps;for(let he=0;he<ne.length;he++){const ge=ne[he];T.format!==Bn?Ae!==null?Xe?He&&t.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Z,he,0,0,ge.width,ge.height,Ae,ge.data):t.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Z,he,ze,ge.width,ge.height,0,ge.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Xe?He&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Z,he,0,0,ge.width,ge.height,Ae,_e,ge.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Z,he,ze,ge.width,ge.height,0,Ae,_e,ge.data)}}}else{if(ne=T.mipmaps,Xe&&Tt){ne.length>0&&B++;const Z=Mt(Ee[0]);t.texStorage2D(s.TEXTURE_CUBE_MAP,B,ze,Z.width,Z.height)}for(let Z=0;Z<6;Z++)if(ce){Xe?He&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,0,0,Ee[Z].width,Ee[Z].height,Ae,_e,Ee[Z].data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,ze,Ee[Z].width,Ee[Z].height,0,Ae,_e,Ee[Z].data);for(let he=0;he<ne.length;he++){const Ze=ne[he].image[Z].image;Xe?He&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Z,he+1,0,0,Ze.width,Ze.height,Ae,_e,Ze.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Z,he+1,ze,Ze.width,Ze.height,0,Ae,_e,Ze.data)}}else{Xe?He&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,0,0,Ae,_e,Ee[Z]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,ze,Ae,_e,Ee[Z]);for(let he=0;he<ne.length;he++){const ge=ne[he];Xe?He&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Z,he+1,0,0,Ae,_e,ge.image[Z]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Z,he+1,ze,Ae,_e,ge.image[Z])}}}m(T)&&p(s.TEXTURE_CUBE_MAP),se.__version=ie.version,T.onUpdate&&T.onUpdate(T)}R.__version=T.version}function N(R,T,$,ee,ie,se){const we=r.convert($.format,$.colorSpace),me=r.convert($.type),fe=x($.internalFormat,we,me,$.colorSpace);if(!n.get(T).__hasExternalTextures){const ce=Math.max(1,T.width>>se),Ee=Math.max(1,T.height>>se);ie===s.TEXTURE_3D||ie===s.TEXTURE_2D_ARRAY?t.texImage3D(ie,se,fe,ce,Ee,T.depth,0,we,me,null):t.texImage2D(ie,se,fe,ce,Ee,0,we,me,null)}t.bindFramebuffer(s.FRAMEBUFFER,R),qe(T)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,ee,ie,n.get($).__webglTexture,0,Re(T)):(ie===s.TEXTURE_2D||ie>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&ie<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,ee,ie,n.get($).__webglTexture,se),t.bindFramebuffer(s.FRAMEBUFFER,null)}function Y(R,T,$){if(s.bindRenderbuffer(s.RENDERBUFFER,R),T.depthBuffer&&!T.stencilBuffer){let ee=s.DEPTH_COMPONENT24;if($||qe(T)){const ie=T.depthTexture;ie&&ie.isDepthTexture&&(ie.type===kn?ee=s.DEPTH_COMPONENT32F:ie.type===yr&&(ee=s.DEPTH_COMPONENT24));const se=Re(T);qe(T)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,se,ee,T.width,T.height):s.renderbufferStorageMultisample(s.RENDERBUFFER,se,ee,T.width,T.height)}else s.renderbufferStorage(s.RENDERBUFFER,ee,T.width,T.height);s.framebufferRenderbuffer(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.RENDERBUFFER,R)}else if(T.depthBuffer&&T.stencilBuffer){const ee=Re(T);$&&qe(T)===!1?s.renderbufferStorageMultisample(s.RENDERBUFFER,ee,s.DEPTH24_STENCIL8,T.width,T.height):qe(T)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,ee,s.DEPTH24_STENCIL8,T.width,T.height):s.renderbufferStorage(s.RENDERBUFFER,s.DEPTH_STENCIL,T.width,T.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.RENDERBUFFER,R)}else{const ee=T.textures;for(let ie=0;ie<ee.length;ie++){const se=ee[ie],we=r.convert(se.format,se.colorSpace),me=r.convert(se.type),fe=x(se.internalFormat,we,me,se.colorSpace),Be=Re(T);$&&qe(T)===!1?s.renderbufferStorageMultisample(s.RENDERBUFFER,Be,fe,T.width,T.height):qe(T)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,Be,fe,T.width,T.height):s.renderbufferStorage(s.RENDERBUFFER,fe,T.width,T.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function ae(R,T){if(T&&T.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(s.FRAMEBUFFER,R),!(T.depthTexture&&T.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!n.get(T.depthTexture).__webglTexture||T.depthTexture.image.width!==T.width||T.depthTexture.image.height!==T.height)&&(T.depthTexture.image.width=T.width,T.depthTexture.image.height=T.height,T.depthTexture.needsUpdate=!0),P(T.depthTexture,0);const ee=n.get(T.depthTexture).__webglTexture,ie=Re(T);if(T.depthTexture.format===ur)qe(T)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,ee,0,ie):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,ee,0);else if(T.depthTexture.format===_o)qe(T)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,ee,0,ie):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,ee,0);else throw new Error("Unknown depthTexture format")}function le(R){const T=n.get(R),$=R.isWebGLCubeRenderTarget===!0;if(R.depthTexture&&!T.__autoAllocateDepthBuffer){if($)throw new Error("target.depthTexture not supported in Cube render targets");ae(T.__webglFramebuffer,R)}else if($){T.__webglDepthbuffer=[];for(let ee=0;ee<6;ee++)t.bindFramebuffer(s.FRAMEBUFFER,T.__webglFramebuffer[ee]),T.__webglDepthbuffer[ee]=s.createRenderbuffer(),Y(T.__webglDepthbuffer[ee],R,!1)}else t.bindFramebuffer(s.FRAMEBUFFER,T.__webglFramebuffer),T.__webglDepthbuffer=s.createRenderbuffer(),Y(T.__webglDepthbuffer,R,!1);t.bindFramebuffer(s.FRAMEBUFFER,null)}function Ie(R,T,$){const ee=n.get(R);T!==void 0&&N(ee.__webglFramebuffer,R,R.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),$!==void 0&&le(R)}function je(R){const T=R.texture,$=n.get(R),ee=n.get(T);R.addEventListener("dispose",M);const ie=R.textures,se=R.isWebGLCubeRenderTarget===!0,we=ie.length>1;if(we||(ee.__webglTexture===void 0&&(ee.__webglTexture=s.createTexture()),ee.__version=T.version,o.memory.textures++),se){$.__webglFramebuffer=[];for(let me=0;me<6;me++)if(T.mipmaps&&T.mipmaps.length>0){$.__webglFramebuffer[me]=[];for(let fe=0;fe<T.mipmaps.length;fe++)$.__webglFramebuffer[me][fe]=s.createFramebuffer()}else $.__webglFramebuffer[me]=s.createFramebuffer()}else{if(T.mipmaps&&T.mipmaps.length>0){$.__webglFramebuffer=[];for(let me=0;me<T.mipmaps.length;me++)$.__webglFramebuffer[me]=s.createFramebuffer()}else $.__webglFramebuffer=s.createFramebuffer();if(we)for(let me=0,fe=ie.length;me<fe;me++){const Be=n.get(ie[me]);Be.__webglTexture===void 0&&(Be.__webglTexture=s.createTexture(),o.memory.textures++)}if(R.samples>0&&qe(R)===!1){$.__webglMultisampledFramebuffer=s.createFramebuffer(),$.__webglColorRenderbuffer=[],t.bindFramebuffer(s.FRAMEBUFFER,$.__webglMultisampledFramebuffer);for(let me=0;me<ie.length;me++){const fe=ie[me];$.__webglColorRenderbuffer[me]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,$.__webglColorRenderbuffer[me]);const Be=r.convert(fe.format,fe.colorSpace),ce=r.convert(fe.type),Ee=x(fe.internalFormat,Be,ce,fe.colorSpace,R.isXRRenderTarget===!0),Ke=Re(R);s.renderbufferStorageMultisample(s.RENDERBUFFER,Ke,Ee,R.width,R.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+me,s.RENDERBUFFER,$.__webglColorRenderbuffer[me])}s.bindRenderbuffer(s.RENDERBUFFER,null),R.depthBuffer&&($.__webglDepthRenderbuffer=s.createRenderbuffer(),Y($.__webglDepthRenderbuffer,R,!0)),t.bindFramebuffer(s.FRAMEBUFFER,null)}}if(se){t.bindTexture(s.TEXTURE_CUBE_MAP,ee.__webglTexture),q(s.TEXTURE_CUBE_MAP,T);for(let me=0;me<6;me++)if(T.mipmaps&&T.mipmaps.length>0)for(let fe=0;fe<T.mipmaps.length;fe++)N($.__webglFramebuffer[me][fe],R,T,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+me,fe);else N($.__webglFramebuffer[me],R,T,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+me,0);m(T)&&p(s.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(we){for(let me=0,fe=ie.length;me<fe;me++){const Be=ie[me],ce=n.get(Be);t.bindTexture(s.TEXTURE_2D,ce.__webglTexture),q(s.TEXTURE_2D,Be),N($.__webglFramebuffer,R,Be,s.COLOR_ATTACHMENT0+me,s.TEXTURE_2D,0),m(Be)&&p(s.TEXTURE_2D)}t.unbindTexture()}else{let me=s.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(me=R.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(me,ee.__webglTexture),q(me,T),T.mipmaps&&T.mipmaps.length>0)for(let fe=0;fe<T.mipmaps.length;fe++)N($.__webglFramebuffer[fe],R,T,s.COLOR_ATTACHMENT0,me,fe);else N($.__webglFramebuffer,R,T,s.COLOR_ATTACHMENT0,me,0);m(T)&&p(me),t.unbindTexture()}R.depthBuffer&&le(R)}function V(R){const T=R.textures;for(let $=0,ee=T.length;$<ee;$++){const ie=T[$];if(m(ie)){const se=R.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:s.TEXTURE_2D,we=n.get(ie).__webglTexture;t.bindTexture(se,we),p(se),t.unbindTexture()}}}const dt=[],Te=[];function ut(R){if(R.samples>0){if(qe(R)===!1){const T=R.textures,$=R.width,ee=R.height;let ie=s.COLOR_BUFFER_BIT;const se=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,we=n.get(R),me=T.length>1;if(me)for(let fe=0;fe<T.length;fe++)t.bindFramebuffer(s.FRAMEBUFFER,we.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+fe,s.RENDERBUFFER,null),t.bindFramebuffer(s.FRAMEBUFFER,we.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+fe,s.TEXTURE_2D,null,0);t.bindFramebuffer(s.READ_FRAMEBUFFER,we.__webglMultisampledFramebuffer),t.bindFramebuffer(s.DRAW_FRAMEBUFFER,we.__webglFramebuffer);for(let fe=0;fe<T.length;fe++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(ie|=s.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(ie|=s.STENCIL_BUFFER_BIT)),me){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,we.__webglColorRenderbuffer[fe]);const Be=n.get(T[fe]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,Be,0)}s.blitFramebuffer(0,0,$,ee,0,0,$,ee,ie,s.NEAREST),c===!0&&(dt.length=0,Te.length=0,dt.push(s.COLOR_ATTACHMENT0+fe),R.depthBuffer&&R.resolveDepthBuffer===!1&&(dt.push(se),Te.push(se),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,Te)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,dt))}if(t.bindFramebuffer(s.READ_FRAMEBUFFER,null),t.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),me)for(let fe=0;fe<T.length;fe++){t.bindFramebuffer(s.FRAMEBUFFER,we.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+fe,s.RENDERBUFFER,we.__webglColorRenderbuffer[fe]);const Be=n.get(T[fe]).__webglTexture;t.bindFramebuffer(s.FRAMEBUFFER,we.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+fe,s.TEXTURE_2D,Be,0)}t.bindFramebuffer(s.DRAW_FRAMEBUFFER,we.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.resolveDepthBuffer===!1&&c){const T=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[T])}}}function Re(R){return Math.min(i.maxSamples,R.samples)}function qe(R){const T=n.get(R);return R.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&T.__useRenderToTexture!==!1}function Ve(R){const T=o.render.frame;d.get(R)!==T&&(d.set(R,T),R.update())}function Ye(R,T){const $=R.colorSpace,ee=R.format,ie=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||$!==$t&&$!==Gi&&(Je.getTransfer($)===pt?(ee!==Bn||ie!==ns)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",$)),T}function Mt(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(u.width=R.naturalWidth||R.width,u.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(u.width=R.displayWidth,u.height=R.displayHeight):(u.width=R.width,u.height=R.height),u}this.allocateTextureUnit=U,this.resetTextureUnits=b,this.setTexture2D=P,this.setTexture2DArray=O,this.setTexture3D=F,this.setTextureCube=k,this.rebindTextures=Ie,this.setupRenderTarget=je,this.updateRenderTargetMipmap=V,this.updateMultisampleRenderTarget=ut,this.setupDepthRenderbuffer=le,this.setupFrameBufferTexture=N,this.useMultisampledRTT=qe}function iw(s,e){function t(n,i=Gi){let r;const o=Je.getTransfer(i);if(n===ns)return s.UNSIGNED_BYTE;if(n===vm)return s.UNSIGNED_SHORT_4_4_4_4;if(n===_m)return s.UNSIGNED_SHORT_5_5_5_1;if(n===wx)return s.UNSIGNED_INT_5_9_9_9_REV;if(n===Mx)return s.BYTE;if(n===Ex)return s.SHORT;if(n===mm)return s.UNSIGNED_SHORT;if(n===gm)return s.INT;if(n===yr)return s.UNSIGNED_INT;if(n===kn)return s.FLOAT;if(n===Wa)return s.HALF_FLOAT;if(n===Tx)return s.ALPHA;if(n===Ax)return s.RGB;if(n===Bn)return s.RGBA;if(n===Dx)return s.LUMINANCE;if(n===Cx)return s.LUMINANCE_ALPHA;if(n===ur)return s.DEPTH_COMPONENT;if(n===_o)return s.DEPTH_STENCIL;if(n===xm)return s.RED;if(n===ym)return s.RED_INTEGER;if(n===Rx)return s.RG;if(n===Sm)return s.RG_INTEGER;if(n===bm)return s.RGBA_INTEGER;if(n===wl||n===Tl||n===Al||n===Dl)if(o===pt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===wl)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Tl)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Al)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Dl)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===wl)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Tl)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Al)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Dl)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Ch||n===Rh||n===Ph||n===Lh)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Ch)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Rh)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Ph)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Lh)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Ih||n===Uh||n===Fh)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Ih||n===Uh)return o===pt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Fh)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===Nh||n===Oh||n===kh||n===Bh||n===zh||n===Hh||n===Vh||n===Gh||n===Wh||n===jh||n===Xh||n===$h||n===qh||n===Yh)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Nh)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Oh)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===kh)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Bh)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===zh)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Hh)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Vh)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Gh)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Wh)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===jh)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Xh)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===$h)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===qh)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Yh)return o===pt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Cl||n===Kh||n===Zh)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===Cl)return o===pt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Kh)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Zh)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Px||n===Jh||n===Qh||n===ed)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Cl)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Jh)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Qh)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===ed)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Eo?s.UNSIGNED_INT_24_8:s[n]!==void 0?s[n]:null}return{convert:t}}class sw extends Wt{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class rt extends St{constructor(){super(),this.isGroup=!0,this.type="Group"}}const rw={type:"move"};class tc{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new rt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new rt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new L,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new L),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new rt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new L,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new L),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let i=null,r=null,o=null;const a=this._targetRay,c=this._grip,u=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(u&&e.hand){o=!0;for(const v of e.hand.values()){const m=t.getJointPose(v,n),p=this._getHandJoint(u,v);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}const d=u.joints["index-finger-tip"],l=u.joints["thumb-tip"],h=d.position.distanceTo(l.position),f=.02,g=.005;u.inputState.pinching&&h>f+g?(u.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!u.inputState.pinching&&h<=f-g&&(u.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1));a!==null&&(i=t.getPose(e.targetRaySpace,n),i===null&&r!==null&&(i=r),i!==null&&(a.matrix.fromArray(i.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,i.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(i.linearVelocity)):a.hasLinearVelocity=!1,i.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(i.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(rw)))}return a!==null&&(a.visible=i!==null),c!==null&&(c.visible=r!==null),u!==null&&(u.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new rt;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}const ow=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,aw=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class lw{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,n){if(this.texture===null){const i=new Ut,r=e.properties.get(i);r.__webglTexture=t.texture,(t.depthNear!=n.depthNear||t.depthFar!=n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=i}}render(e,t){if(this.texture!==null){if(this.mesh===null){const n=t.cameras[0].viewport,i=new Cn({vertexShader:ow,fragmentShader:aw,uniforms:{depthColor:{value:this.texture},depthWidth:{value:n.z},depthHeight:{value:n.w}}});this.mesh=new at(new Rn(20,20),i)}e.render(this.mesh,t)}}reset(){this.texture=null,this.mesh=null}}class cw extends Dr{constructor(e,t){super();const n=this;let i=null,r=1,o=null,a="local-floor",c=1,u=null,d=null,l=null,h=null,f=null,g=null;const v=new lw,m=t.getContextAttributes();let p=null,x=null;const _=[],S=[],M=new Q;let E=null;const w=new Wt;w.layers.enable(1),w.viewport=new st;const C=new Wt;C.layers.enable(2),C.viewport=new st;const y=[w,C],b=new sw;b.layers.enable(1),b.layers.enable(2);let U=null,z=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(N){let Y=_[N];return Y===void 0&&(Y=new tc,_[N]=Y),Y.getTargetRaySpace()},this.getControllerGrip=function(N){let Y=_[N];return Y===void 0&&(Y=new tc,_[N]=Y),Y.getGripSpace()},this.getHand=function(N){let Y=_[N];return Y===void 0&&(Y=new tc,_[N]=Y),Y.getHandSpace()};function P(N){const Y=S.indexOf(N.inputSource);if(Y===-1)return;const ae=_[Y];ae!==void 0&&(ae.update(N.inputSource,N.frame,u||o),ae.dispatchEvent({type:N.type,data:N.inputSource}))}function O(){i.removeEventListener("select",P),i.removeEventListener("selectstart",P),i.removeEventListener("selectend",P),i.removeEventListener("squeeze",P),i.removeEventListener("squeezestart",P),i.removeEventListener("squeezeend",P),i.removeEventListener("end",O),i.removeEventListener("inputsourceschange",F);for(let N=0;N<_.length;N++){const Y=S[N];Y!==null&&(S[N]=null,_[N].disconnect(Y))}U=null,z=null,v.reset(),e.setRenderTarget(p),f=null,h=null,l=null,i=null,x=null,re.stop(),n.isPresenting=!1,e.setPixelRatio(E),e.setSize(M.width,M.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(N){r=N,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(N){a=N,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return u||o},this.setReferenceSpace=function(N){u=N},this.getBaseLayer=function(){return h!==null?h:f},this.getBinding=function(){return l},this.getFrame=function(){return g},this.getSession=function(){return i},this.setSession=async function(N){if(i=N,i!==null){if(p=e.getRenderTarget(),i.addEventListener("select",P),i.addEventListener("selectstart",P),i.addEventListener("selectend",P),i.addEventListener("squeeze",P),i.addEventListener("squeezestart",P),i.addEventListener("squeezeend",P),i.addEventListener("end",O),i.addEventListener("inputsourceschange",F),m.xrCompatible!==!0&&await t.makeXRCompatible(),E=e.getPixelRatio(),e.getSize(M),i.renderState.layers===void 0){const Y={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(i,t,Y),i.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),x=new Dn(f.framebufferWidth,f.framebufferHeight,{format:Bn,type:ns,colorSpace:e.outputColorSpace,stencilBuffer:m.stencil})}else{let Y=null,ae=null,le=null;m.depth&&(le=m.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Y=m.stencil?_o:ur,ae=m.stencil?Eo:yr);const Ie={colorFormat:t.RGBA8,depthFormat:le,scaleFactor:r};l=new XRWebGLBinding(i,t),h=l.createProjectionLayer(Ie),i.updateRenderState({layers:[h]}),e.setPixelRatio(1),e.setSize(h.textureWidth,h.textureHeight,!1),x=new Dn(h.textureWidth,h.textureHeight,{format:Bn,type:ns,depthTexture:new Fm(h.textureWidth,h.textureHeight,ae,void 0,void 0,void 0,void 0,void 0,void 0,Y),stencilBuffer:m.stencil,colorSpace:e.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1})}x.isXRRenderTarget=!0,this.setFoveation(c),u=null,o=await i.requestReferenceSpace(a),re.setContext(i),re.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode};function F(N){for(let Y=0;Y<N.removed.length;Y++){const ae=N.removed[Y],le=S.indexOf(ae);le>=0&&(S[le]=null,_[le].disconnect(ae))}for(let Y=0;Y<N.added.length;Y++){const ae=N.added[Y];let le=S.indexOf(ae);if(le===-1){for(let je=0;je<_.length;je++)if(je>=S.length){S.push(ae),le=je;break}else if(S[je]===null){S[je]=ae,le=je;break}if(le===-1)break}const Ie=_[le];Ie&&Ie.connect(ae)}}const k=new L,j=new L;function D(N,Y,ae){k.setFromMatrixPosition(Y.matrixWorld),j.setFromMatrixPosition(ae.matrixWorld);const le=k.distanceTo(j),Ie=Y.projectionMatrix.elements,je=ae.projectionMatrix.elements,V=Ie[14]/(Ie[10]-1),dt=Ie[14]/(Ie[10]+1),Te=(Ie[9]+1)/Ie[5],ut=(Ie[9]-1)/Ie[5],Re=(Ie[8]-1)/Ie[0],qe=(je[8]+1)/je[0],Ve=V*Re,Ye=V*qe,Mt=le/(-Re+qe),R=Mt*-Re;Y.matrixWorld.decompose(N.position,N.quaternion,N.scale),N.translateX(R),N.translateZ(Mt),N.matrixWorld.compose(N.position,N.quaternion,N.scale),N.matrixWorldInverse.copy(N.matrixWorld).invert();const T=V+Mt,$=dt+Mt,ee=Ve-R,ie=Ye+(le-R),se=Te*dt/$*T,we=ut*dt/$*T;N.projectionMatrix.makePerspective(ee,ie,se,we,T,$),N.projectionMatrixInverse.copy(N.projectionMatrix).invert()}function K(N,Y){Y===null?N.matrixWorld.copy(N.matrix):N.matrixWorld.multiplyMatrices(Y.matrixWorld,N.matrix),N.matrixWorldInverse.copy(N.matrixWorld).invert()}this.updateCamera=function(N){if(i===null)return;v.texture!==null&&(N.near=v.depthNear,N.far=v.depthFar),b.near=C.near=w.near=N.near,b.far=C.far=w.far=N.far,(U!==b.near||z!==b.far)&&(i.updateRenderState({depthNear:b.near,depthFar:b.far}),U=b.near,z=b.far,w.near=U,w.far=z,C.near=U,C.far=z,w.updateProjectionMatrix(),C.updateProjectionMatrix(),N.updateProjectionMatrix());const Y=N.parent,ae=b.cameras;K(b,Y);for(let le=0;le<ae.length;le++)K(ae[le],Y);ae.length===2?D(b,w,C):b.projectionMatrix.copy(w.projectionMatrix),q(N,b,Y)};function q(N,Y,ae){ae===null?N.matrix.copy(Y.matrixWorld):(N.matrix.copy(ae.matrixWorld),N.matrix.invert(),N.matrix.multiply(Y.matrixWorld)),N.matrix.decompose(N.position,N.quaternion,N.scale),N.updateMatrixWorld(!0),N.projectionMatrix.copy(Y.projectionMatrix),N.projectionMatrixInverse.copy(Y.projectionMatrixInverse),N.isPerspectiveCamera&&(N.fov=br*2*Math.atan(1/N.projectionMatrix.elements[5]),N.zoom=1)}this.getCamera=function(){return b},this.getFoveation=function(){if(!(h===null&&f===null))return c},this.setFoveation=function(N){c=N,h!==null&&(h.fixedFoveation=N),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=N)},this.hasDepthSensing=function(){return v.texture!==null};let te=null;function ve(N,Y){if(d=Y.getViewerPose(u||o),g=Y,d!==null){const ae=d.views;f!==null&&(e.setRenderTargetFramebuffer(x,f.framebuffer),e.setRenderTarget(x));let le=!1;ae.length!==b.cameras.length&&(b.cameras.length=0,le=!0);for(let je=0;je<ae.length;je++){const V=ae[je];let dt=null;if(f!==null)dt=f.getViewport(V);else{const ut=l.getViewSubImage(h,V);dt=ut.viewport,je===0&&(e.setRenderTargetTextures(x,ut.colorTexture,h.ignoreDepthValues?void 0:ut.depthStencilTexture),e.setRenderTarget(x))}let Te=y[je];Te===void 0&&(Te=new Wt,Te.layers.enable(je),Te.viewport=new st,y[je]=Te),Te.matrix.fromArray(V.transform.matrix),Te.matrix.decompose(Te.position,Te.quaternion,Te.scale),Te.projectionMatrix.fromArray(V.projectionMatrix),Te.projectionMatrixInverse.copy(Te.projectionMatrix).invert(),Te.viewport.set(dt.x,dt.y,dt.width,dt.height),je===0&&(b.matrix.copy(Te.matrix),b.matrix.decompose(b.position,b.quaternion,b.scale)),le===!0&&b.cameras.push(Te)}const Ie=i.enabledFeatures;if(Ie&&Ie.includes("depth-sensing")){const je=l.getDepthInformation(ae[0]);je&&je.isValid&&je.texture&&v.init(e,je,i.renderState)}}for(let ae=0;ae<_.length;ae++){const le=S[ae],Ie=_[ae];le!==null&&Ie!==void 0&&Ie.update(le,Y,u||o)}v.render(e,b),te&&te(N,Y),Y.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:Y}),g=null}const re=new Um;re.setAnimationLoop(ve),this.setAnimationLoop=function(N){te=N},this.dispose=function(){}}}const ps=new di,uw=new Ce;function hw(s,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,Im(s)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function i(m,p,x,_,S){p.isMeshBasicMaterial||p.isMeshLambertMaterial?r(m,p):p.isMeshToonMaterial?(r(m,p),l(m,p)):p.isMeshPhongMaterial?(r(m,p),d(m,p)):p.isMeshStandardMaterial?(r(m,p),h(m,p),p.isMeshPhysicalMaterial&&f(m,p,S)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),v(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(o(m,p),p.isLineDashedMaterial&&a(m,p)):p.isPointsMaterial?c(m,p,x,_):p.isSpriteMaterial?u(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===hn&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===hn&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const x=e.get(p),_=x.envMap,S=x.envMapRotation;if(_&&(m.envMap.value=_,ps.copy(S),ps.x*=-1,ps.y*=-1,ps.z*=-1,_.isCubeTexture&&_.isRenderTargetTexture===!1&&(ps.y*=-1,ps.z*=-1),m.envMapRotation.value.setFromMatrix4(uw.makeRotationFromEuler(ps)),m.flipEnvMap.value=_.isCubeTexture&&_.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap){m.lightMap.value=p.lightMap;const M=s._useLegacyLights===!0?Math.PI:1;m.lightMapIntensity.value=p.lightMapIntensity*M,t(p.lightMap,m.lightMapTransform)}p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function o(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function a(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function c(m,p,x,_){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*x,m.scale.value=_*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function u(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function d(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function l(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function h(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,x){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===hn&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=x.texture,m.transmissionSamplerSize.value.set(x.width,x.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function v(m,p){const x=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(x.matrixWorld),m.nearDistance.value=x.shadow.camera.near,m.farDistance.value=x.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function dw(s,e,t,n){let i={},r={},o=[];const a=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function c(x,_){const S=_.program;n.uniformBlockBinding(x,S)}function u(x,_){let S=i[x.id];S===void 0&&(g(x),S=d(x),i[x.id]=S,x.addEventListener("dispose",m));const M=_.program;n.updateUBOMapping(x,M);const E=e.render.frame;r[x.id]!==E&&(h(x),r[x.id]=E)}function d(x){const _=l();x.__bindingPointIndex=_;const S=s.createBuffer(),M=x.__size,E=x.usage;return s.bindBuffer(s.UNIFORM_BUFFER,S),s.bufferData(s.UNIFORM_BUFFER,M,E),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,_,S),S}function l(){for(let x=0;x<a;x++)if(o.indexOf(x)===-1)return o.push(x),x;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(x){const _=i[x.id],S=x.uniforms,M=x.__cache;s.bindBuffer(s.UNIFORM_BUFFER,_);for(let E=0,w=S.length;E<w;E++){const C=Array.isArray(S[E])?S[E]:[S[E]];for(let y=0,b=C.length;y<b;y++){const U=C[y];if(f(U,E,y,M)===!0){const z=U.__offset,P=Array.isArray(U.value)?U.value:[U.value];let O=0;for(let F=0;F<P.length;F++){const k=P[F],j=v(k);typeof k=="number"||typeof k=="boolean"?(U.__data[0]=k,s.bufferSubData(s.UNIFORM_BUFFER,z+O,U.__data)):k.isMatrix3?(U.__data[0]=k.elements[0],U.__data[1]=k.elements[1],U.__data[2]=k.elements[2],U.__data[3]=0,U.__data[4]=k.elements[3],U.__data[5]=k.elements[4],U.__data[6]=k.elements[5],U.__data[7]=0,U.__data[8]=k.elements[6],U.__data[9]=k.elements[7],U.__data[10]=k.elements[8],U.__data[11]=0):(k.toArray(U.__data,O),O+=j.storage/Float32Array.BYTES_PER_ELEMENT)}s.bufferSubData(s.UNIFORM_BUFFER,z,U.__data)}}}s.bindBuffer(s.UNIFORM_BUFFER,null)}function f(x,_,S,M){const E=x.value,w=_+"_"+S;if(M[w]===void 0)return typeof E=="number"||typeof E=="boolean"?M[w]=E:M[w]=E.clone(),!0;{const C=M[w];if(typeof E=="number"||typeof E=="boolean"){if(C!==E)return M[w]=E,!0}else if(C.equals(E)===!1)return C.copy(E),!0}return!1}function g(x){const _=x.uniforms;let S=0;const M=16;for(let w=0,C=_.length;w<C;w++){const y=Array.isArray(_[w])?_[w]:[_[w]];for(let b=0,U=y.length;b<U;b++){const z=y[b],P=Array.isArray(z.value)?z.value:[z.value];for(let O=0,F=P.length;O<F;O++){const k=P[O],j=v(k),D=S%M;D!==0&&M-D<j.boundary&&(S+=M-D),z.__data=new Float32Array(j.storage/Float32Array.BYTES_PER_ELEMENT),z.__offset=S,S+=j.storage}}}const E=S%M;return E>0&&(S+=M-E),x.__size=S,x.__cache={},this}function v(x){const _={boundary:0,storage:0};return typeof x=="number"||typeof x=="boolean"?(_.boundary=4,_.storage=4):x.isVector2?(_.boundary=8,_.storage=8):x.isVector3||x.isColor?(_.boundary=16,_.storage=12):x.isVector4?(_.boundary=16,_.storage=16):x.isMatrix3?(_.boundary=48,_.storage=48):x.isMatrix4?(_.boundary=64,_.storage=64):x.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",x),_}function m(x){const _=x.target;_.removeEventListener("dispose",m);const S=o.indexOf(_.__bindingPointIndex);o.splice(S,1),s.deleteBuffer(i[_.id]),delete i[_.id],delete r[_.id]}function p(){for(const x in i)s.deleteBuffer(i[x]);o=[],i={},r={}}return{bind:c,update:u,dispose:p}}class fw{constructor(e={}){const{canvas:t=oy(),context:n=null,depth:i=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:u=!1,powerPreference:d="default",failIfMajorPerformanceCaveat:l=!1}=e;this.isWebGLRenderer=!0;let h;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");h=n.getContextAttributes().alpha}else h=o;const f=new Uint32Array(4),g=new Int32Array(4);let v=null,m=null;const p=[],x=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Gt,this._useLegacyLights=!1,this.toneMapping=Qi,this.toneMappingExposure=1;const _=this;let S=!1,M=0,E=0,w=null,C=-1,y=null;const b=new st,U=new st;let z=null;const P=new ye(0);let O=0,F=t.width,k=t.height,j=1,D=null,K=null;const q=new st(0,0,F,k),te=new st(0,0,F,k);let ve=!1;const re=new yu;let N=!1,Y=!1;const ae=new Ce,le=new L,Ie={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};function je(){return w===null?j:1}let V=n;function dt(A,H){return t.getContext(A,H)}try{const A={alpha:!0,depth:i,stencil:r,antialias:a,premultipliedAlpha:c,preserveDrawingBuffer:u,powerPreference:d,failIfMajorPerformanceCaveat:l};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${pu}`),t.addEventListener("webglcontextlost",B,!1),t.addEventListener("webglcontextrestored",ne,!1),t.addEventListener("webglcontextcreationerror",Z,!1),V===null){const H="webgl2";if(V=dt(H,A),V===null)throw dt(H)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(A){throw console.error("THREE.WebGLRenderer: "+A.message),A}let Te,ut,Re,qe,Ve,Ye,Mt,R,T,$,ee,ie,se,we,me,fe,Be,ce,Ee,Ke,Ae,_e,ze,Xe;function Tt(){Te=new SM(V),Te.init(),_e=new iw(V,Te),ut=new mM(V,Te,e,_e),Re=new tw(V),qe=new EM(V),Ve=new HE,Ye=new nw(V,Te,Re,Ve,ut,_e,qe),Mt=new vM(_),R=new yM(_),T=new Py(V),ze=new fM(V,T),$=new bM(V,T,qe,ze),ee=new TM(V,$,T,qe),Ee=new wM(V,ut,Ye),fe=new gM(Ve),ie=new zE(_,Mt,R,Te,ut,ze,fe),se=new hw(_,Ve),we=new GE,me=new YE(Te),ce=new dM(_,Mt,R,Re,ee,h,c),Be=new ew(_,ee,ut),Xe=new dw(V,qe,ut,Re),Ke=new pM(V,Te,qe),Ae=new MM(V,Te,qe),qe.programs=ie.programs,_.capabilities=ut,_.extensions=Te,_.properties=Ve,_.renderLists=we,_.shadowMap=Be,_.state=Re,_.info=qe}Tt();const He=new cw(_,V);this.xr=He,this.getContext=function(){return V},this.getContextAttributes=function(){return V.getContextAttributes()},this.forceContextLoss=function(){const A=Te.get("WEBGL_lose_context");A&&A.loseContext()},this.forceContextRestore=function(){const A=Te.get("WEBGL_lose_context");A&&A.restoreContext()},this.getPixelRatio=function(){return j},this.setPixelRatio=function(A){A!==void 0&&(j=A,this.setSize(F,k,!1))},this.getSize=function(A){return A.set(F,k)},this.setSize=function(A,H,X=!0){if(He.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}F=A,k=H,t.width=Math.floor(A*j),t.height=Math.floor(H*j),X===!0&&(t.style.width=A+"px",t.style.height=H+"px"),this.setViewport(0,0,A,H)},this.getDrawingBufferSize=function(A){return A.set(F*j,k*j).floor()},this.setDrawingBufferSize=function(A,H,X){F=A,k=H,j=X,t.width=Math.floor(A*X),t.height=Math.floor(H*X),this.setViewport(0,0,A,H)},this.getCurrentViewport=function(A){return A.copy(b)},this.getViewport=function(A){return A.copy(q)},this.setViewport=function(A,H,X,G){A.isVector4?q.set(A.x,A.y,A.z,A.w):q.set(A,H,X,G),Re.viewport(b.copy(q).multiplyScalar(j).round())},this.getScissor=function(A){return A.copy(te)},this.setScissor=function(A,H,X,G){A.isVector4?te.set(A.x,A.y,A.z,A.w):te.set(A,H,X,G),Re.scissor(U.copy(te).multiplyScalar(j).round())},this.getScissorTest=function(){return ve},this.setScissorTest=function(A){Re.setScissorTest(ve=A)},this.setOpaqueSort=function(A){D=A},this.setTransparentSort=function(A){K=A},this.getClearColor=function(A){return A.copy(ce.getClearColor())},this.setClearColor=function(){ce.setClearColor.apply(ce,arguments)},this.getClearAlpha=function(){return ce.getClearAlpha()},this.setClearAlpha=function(){ce.setClearAlpha.apply(ce,arguments)},this.clear=function(A=!0,H=!0,X=!0){let G=0;if(A){let W=!1;if(w!==null){const de=w.texture.format;W=de===bm||de===Sm||de===ym}if(W){const de=w.texture.type,be=de===ns||de===yr||de===mm||de===Eo||de===vm||de===_m,Me=ce.getClearColor(),De=ce.getClearAlpha(),Ue=Me.r,Oe=Me.g,Ge=Me.b;be?(f[0]=Ue,f[1]=Oe,f[2]=Ge,f[3]=De,V.clearBufferuiv(V.COLOR,0,f)):(g[0]=Ue,g[1]=Oe,g[2]=Ge,g[3]=De,V.clearBufferiv(V.COLOR,0,g))}else G|=V.COLOR_BUFFER_BIT}H&&(G|=V.DEPTH_BUFFER_BIT),X&&(G|=V.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),V.clear(G)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",B,!1),t.removeEventListener("webglcontextrestored",ne,!1),t.removeEventListener("webglcontextcreationerror",Z,!1),we.dispose(),me.dispose(),Ve.dispose(),Mt.dispose(),R.dispose(),ee.dispose(),ze.dispose(),Xe.dispose(),ie.dispose(),He.dispose(),He.removeEventListener("sessionstart",tt),He.removeEventListener("sessionend",Zn),sn.stop()};function B(A){A.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),S=!0}function ne(){console.log("THREE.WebGLRenderer: Context Restored."),S=!1;const A=qe.autoReset,H=Be.enabled,X=Be.autoUpdate,G=Be.needsUpdate,W=Be.type;Tt(),qe.autoReset=A,Be.enabled=H,Be.autoUpdate=X,Be.needsUpdate=G,Be.type=W}function Z(A){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",A.statusMessage)}function he(A){const H=A.target;H.removeEventListener("dispose",he),ge(H)}function ge(A){Ze(A),Ve.remove(A)}function Ze(A){const H=Ve.get(A).programs;H!==void 0&&(H.forEach(function(X){ie.releaseProgram(X)}),A.isShaderMaterial&&ie.releaseShaderCache(A))}this.renderBufferDirect=function(A,H,X,G,W,de){H===null&&(H=Ie);const be=W.isMesh&&W.matrixWorld.determinant()<0,Me=kg(A,H,X,G,W);Re.setMaterial(G,be);let De=X.index,Ue=1;if(G.wireframe===!0){if(De=$.getWireframeAttribute(X),De===void 0)return;Ue=2}const Oe=X.drawRange,Ge=X.attributes.position;let Dt=Oe.start*Ue,Yt=(Oe.start+Oe.count)*Ue;de!==null&&(Dt=Math.max(Dt,de.start*Ue),Yt=Math.min(Yt,(de.start+de.count)*Ue)),De!==null?(Dt=Math.max(Dt,0),Yt=Math.min(Yt,De.count)):Ge!=null&&(Dt=Math.max(Dt,0),Yt=Math.min(Yt,Ge.count));const xn=Yt-Dt;if(xn<0||xn===1/0)return;ze.setup(W,G,Me,X,De);let mi,et=Ke;if(De!==null&&(mi=T.get(De),et=Ae,et.setIndex(mi)),W.isMesh)G.wireframe===!0?(Re.setLineWidth(G.wireframeLinewidth*je()),et.setMode(V.LINES)):et.setMode(V.TRIANGLES);else if(W.isLine){let Fe=G.linewidth;Fe===void 0&&(Fe=1),Re.setLineWidth(Fe*je()),W.isLineSegments?et.setMode(V.LINES):W.isLineLoop?et.setMode(V.LINE_LOOP):et.setMode(V.LINE_STRIP)}else W.isPoints?et.setMode(V.POINTS):W.isSprite&&et.setMode(V.TRIANGLES);if(W.isBatchedMesh)W._multiDrawInstances!==null?et.renderMultiDrawInstances(W._multiDrawStarts,W._multiDrawCounts,W._multiDrawCount,W._multiDrawInstances):et.renderMultiDraw(W._multiDrawStarts,W._multiDrawCounts,W._multiDrawCount);else if(W.isInstancedMesh)et.renderInstances(Dt,xn,W.count);else if(X.isInstancedBufferGeometry){const Fe=X._maxInstanceCount!==void 0?X._maxInstanceCount:1/0,Or=Math.min(X.instanceCount,Fe);et.renderInstances(Dt,xn,Or)}else et.render(Dt,xn)};function ft(A,H,X){A.transparent===!0&&A.side===si&&A.forceSinglePass===!1?(A.side=hn,A.needsUpdate=!0,Uo(A,H,X),A.side=Ri,A.needsUpdate=!0,Uo(A,H,X),A.side=si):Uo(A,H,X)}this.compile=function(A,H,X=null){X===null&&(X=A),m=me.get(X),m.init(H),x.push(m),X.traverseVisible(function(W){W.isLight&&W.layers.test(H.layers)&&(m.pushLight(W),W.castShadow&&m.pushShadow(W))}),A!==X&&A.traverseVisible(function(W){W.isLight&&W.layers.test(H.layers)&&(m.pushLight(W),W.castShadow&&m.pushShadow(W))}),m.setupLights(_._useLegacyLights);const G=new Set;return A.traverse(function(W){const de=W.material;if(de)if(Array.isArray(de))for(let be=0;be<de.length;be++){const Me=de[be];ft(Me,X,W),G.add(Me)}else ft(de,X,W),G.add(de)}),x.pop(),m=null,G},this.compileAsync=function(A,H,X=null){const G=this.compile(A,H,X);return new Promise(W=>{function de(){if(G.forEach(function(be){Ve.get(be).currentProgram.isReady()&&G.delete(be)}),G.size===0){W(A);return}setTimeout(de,10)}Te.get("KHR_parallel_shader_compile")!==null?de():setTimeout(de,10)})};let Et=null;function qt(A){Et&&Et(A)}function tt(){sn.stop()}function Zn(){sn.start()}const sn=new Um;sn.setAnimationLoop(qt),typeof self<"u"&&sn.setContext(self),this.setAnimationLoop=function(A){Et=A,He.setAnimationLoop(A),A===null?sn.stop():sn.start()},He.addEventListener("sessionstart",tt),He.addEventListener("sessionend",Zn),this.render=function(A,H){if(H!==void 0&&H.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(S===!0)return;A.matrixWorldAutoUpdate===!0&&A.updateMatrixWorld(),H.parent===null&&H.matrixWorldAutoUpdate===!0&&H.updateMatrixWorld(),He.enabled===!0&&He.isPresenting===!0&&(He.cameraAutoUpdate===!0&&He.updateCamera(H),H=He.getCamera()),A.isScene===!0&&A.onBeforeRender(_,A,H,w),m=me.get(A,x.length),m.init(H),x.push(m),ae.multiplyMatrices(H.projectionMatrix,H.matrixWorldInverse),re.setFromProjectionMatrix(ae),Y=this.localClippingEnabled,N=fe.init(this.clippingPlanes,Y),v=we.get(A,p.length),v.init(),p.push(v),ku(A,H,0,_.sortObjects),v.finish(),_.sortObjects===!0&&v.sort(D,K);const X=He.enabled===!1||He.isPresenting===!1||He.hasDepthSensing()===!1;X&&ce.addToRenderList(v,A),this.info.render.frame++,N===!0&&fe.beginShadows();const G=m.state.shadowsArray;Be.render(G,A,H),N===!0&&fe.endShadows(),this.info.autoReset===!0&&this.info.reset();const W=v.opaque,de=v.transmissive;if(m.setupLights(_._useLegacyLights),H.isArrayCamera){const be=H.cameras;if(de.length>0)for(let Me=0,De=be.length;Me<De;Me++){const Ue=be[Me];zu(W,de,A,Ue)}X&&ce.render(A);for(let Me=0,De=be.length;Me<De;Me++){const Ue=be[Me];Bu(v,A,Ue,Ue.viewport)}}else de.length>0&&zu(W,de,A,H),X&&ce.render(A),Bu(v,A,H);w!==null&&(Ye.updateMultisampleRenderTarget(w),Ye.updateRenderTargetMipmap(w)),A.isScene===!0&&A.onAfterRender(_,A,H),ze.resetDefaultState(),C=-1,y=null,x.pop(),x.length>0?(m=x[x.length-1],N===!0&&fe.setGlobalState(_.clippingPlanes,m.state.camera)):m=null,p.pop(),p.length>0?v=p[p.length-1]:v=null};function ku(A,H,X,G){if(A.visible===!1)return;if(A.layers.test(H.layers)){if(A.isGroup)X=A.renderOrder;else if(A.isLOD)A.autoUpdate===!0&&A.update(H);else if(A.isLight)m.pushLight(A),A.castShadow&&m.pushShadow(A);else if(A.isSprite){if(!A.frustumCulled||re.intersectsSprite(A)){G&&le.setFromMatrixPosition(A.matrixWorld).applyMatrix4(ae);const be=ee.update(A),Me=A.material;Me.visible&&v.push(A,be,Me,X,le.z,null)}}else if((A.isMesh||A.isLine||A.isPoints)&&(!A.frustumCulled||re.intersectsObject(A))){const be=ee.update(A),Me=A.material;if(G&&(A.boundingSphere!==void 0?(A.boundingSphere===null&&A.computeBoundingSphere(),le.copy(A.boundingSphere.center)):(be.boundingSphere===null&&be.computeBoundingSphere(),le.copy(be.boundingSphere.center)),le.applyMatrix4(A.matrixWorld).applyMatrix4(ae)),Array.isArray(Me)){const De=be.groups;for(let Ue=0,Oe=De.length;Ue<Oe;Ue++){const Ge=De[Ue],Dt=Me[Ge.materialIndex];Dt&&Dt.visible&&v.push(A,be,Dt,X,le.z,Ge)}}else Me.visible&&v.push(A,be,Me,X,le.z,null)}}const de=A.children;for(let be=0,Me=de.length;be<Me;be++)ku(de[be],H,X,G)}function Bu(A,H,X,G){const W=A.opaque,de=A.transmissive,be=A.transparent;m.setupLightsView(X),N===!0&&fe.setGlobalState(_.clippingPlanes,X),G&&Re.viewport(b.copy(G)),W.length>0&&Io(W,H,X),de.length>0&&Io(de,H,X),be.length>0&&Io(be,H,X),Re.buffers.depth.setTest(!0),Re.buffers.depth.setMask(!0),Re.buffers.color.setMask(!0),Re.setPolygonOffset(!1)}function zu(A,H,X,G){if((X.isScene===!0?X.overrideMaterial:null)!==null)return;m.state.transmissionRenderTarget[G.id]===void 0&&(m.state.transmissionRenderTarget[G.id]=new Dn(1,1,{generateMipmaps:!0,type:Te.has("EXT_color_buffer_half_float")||Te.has("EXT_color_buffer_float")?Wa:ns,minFilter:wi,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1}));const de=m.state.transmissionRenderTarget[G.id],be=G.viewport||b;de.setSize(be.z,be.w);const Me=_.getRenderTarget();_.setRenderTarget(de),_.getClearColor(P),O=_.getClearAlpha(),O<1&&_.setClearColor(16777215,.5),_.clear();const De=_.toneMapping;_.toneMapping=Qi;const Ue=G.viewport;if(G.viewport!==void 0&&(G.viewport=void 0),m.setupLightsView(G),N===!0&&fe.setGlobalState(_.clippingPlanes,G),Io(A,X,G),Ye.updateMultisampleRenderTarget(de),Ye.updateRenderTargetMipmap(de),Te.has("WEBGL_multisampled_render_to_texture")===!1){let Oe=!1;for(let Ge=0,Dt=H.length;Ge<Dt;Ge++){const Yt=H[Ge],xn=Yt.object,mi=Yt.geometry,et=Yt.material,Fe=Yt.group;if(et.side===si&&xn.layers.test(G.layers)){const Or=et.side;et.side=hn,et.needsUpdate=!0,Hu(xn,X,G,mi,et,Fe),et.side=Or,et.needsUpdate=!0,Oe=!0}}Oe===!0&&(Ye.updateMultisampleRenderTarget(de),Ye.updateRenderTargetMipmap(de))}_.setRenderTarget(Me),_.setClearColor(P,O),Ue!==void 0&&(G.viewport=Ue),_.toneMapping=De}function Io(A,H,X){const G=H.isScene===!0?H.overrideMaterial:null;for(let W=0,de=A.length;W<de;W++){const be=A[W],Me=be.object,De=be.geometry,Ue=G===null?be.material:G,Oe=be.group;Me.layers.test(X.layers)&&Hu(Me,H,X,De,Ue,Oe)}}function Hu(A,H,X,G,W,de){A.onBeforeRender(_,H,X,G,W,de),A.modelViewMatrix.multiplyMatrices(X.matrixWorldInverse,A.matrixWorld),A.normalMatrix.getNormalMatrix(A.modelViewMatrix),W.onBeforeRender(_,H,X,G,A,de),W.transparent===!0&&W.side===si&&W.forceSinglePass===!1?(W.side=hn,W.needsUpdate=!0,_.renderBufferDirect(X,H,G,W,A,de),W.side=Ri,W.needsUpdate=!0,_.renderBufferDirect(X,H,G,W,A,de),W.side=si):_.renderBufferDirect(X,H,G,W,A,de),A.onAfterRender(_,H,X,G,W,de)}function Uo(A,H,X){H.isScene!==!0&&(H=Ie);const G=Ve.get(A),W=m.state.lights,de=m.state.shadowsArray,be=W.state.version,Me=ie.getParameters(A,W.state,de,H,X),De=ie.getProgramCacheKey(Me);let Ue=G.programs;G.environment=A.isMeshStandardMaterial?H.environment:null,G.fog=H.fog,G.envMap=(A.isMeshStandardMaterial?R:Mt).get(A.envMap||G.environment),G.envMapRotation=G.environment!==null&&A.envMap===null?H.environmentRotation:A.envMapRotation,Ue===void 0&&(A.addEventListener("dispose",he),Ue=new Map,G.programs=Ue);let Oe=Ue.get(De);if(Oe!==void 0){if(G.currentProgram===Oe&&G.lightsStateVersion===be)return Gu(A,Me),Oe}else Me.uniforms=ie.getUniforms(A),A.onBuild(X,Me,_),A.onBeforeCompile(Me,_),Oe=ie.acquireProgram(Me,De),Ue.set(De,Oe),G.uniforms=Me.uniforms;const Ge=G.uniforms;return(!A.isShaderMaterial&&!A.isRawShaderMaterial||A.clipping===!0)&&(Ge.clippingPlanes=fe.uniform),Gu(A,Me),G.needsLights=zg(A),G.lightsStateVersion=be,G.needsLights&&(Ge.ambientLightColor.value=W.state.ambient,Ge.lightProbe.value=W.state.probe,Ge.directionalLights.value=W.state.directional,Ge.directionalLightShadows.value=W.state.directionalShadow,Ge.spotLights.value=W.state.spot,Ge.spotLightShadows.value=W.state.spotShadow,Ge.rectAreaLights.value=W.state.rectArea,Ge.ltc_1.value=W.state.rectAreaLTC1,Ge.ltc_2.value=W.state.rectAreaLTC2,Ge.pointLights.value=W.state.point,Ge.pointLightShadows.value=W.state.pointShadow,Ge.hemisphereLights.value=W.state.hemi,Ge.directionalShadowMap.value=W.state.directionalShadowMap,Ge.directionalShadowMatrix.value=W.state.directionalShadowMatrix,Ge.spotShadowMap.value=W.state.spotShadowMap,Ge.spotLightMatrix.value=W.state.spotLightMatrix,Ge.spotLightMap.value=W.state.spotLightMap,Ge.pointShadowMap.value=W.state.pointShadowMap,Ge.pointShadowMatrix.value=W.state.pointShadowMatrix),G.currentProgram=Oe,G.uniformsList=null,Oe}function Vu(A){if(A.uniformsList===null){const H=A.currentProgram.getUniforms();A.uniformsList=xa.seqWithValue(H.seq,A.uniforms)}return A.uniformsList}function Gu(A,H){const X=Ve.get(A);X.outputColorSpace=H.outputColorSpace,X.batching=H.batching,X.instancing=H.instancing,X.instancingColor=H.instancingColor,X.instancingMorph=H.instancingMorph,X.skinning=H.skinning,X.morphTargets=H.morphTargets,X.morphNormals=H.morphNormals,X.morphColors=H.morphColors,X.morphTargetsCount=H.morphTargetsCount,X.numClippingPlanes=H.numClippingPlanes,X.numIntersection=H.numClipIntersection,X.vertexAlphas=H.vertexAlphas,X.vertexTangents=H.vertexTangents,X.toneMapping=H.toneMapping}function kg(A,H,X,G,W){H.isScene!==!0&&(H=Ie),Ye.resetTextureUnits();const de=H.fog,be=G.isMeshStandardMaterial?H.environment:null,Me=w===null?_.outputColorSpace:w.isXRRenderTarget===!0?w.texture.colorSpace:$t,De=(G.isMeshStandardMaterial?R:Mt).get(G.envMap||be),Ue=G.vertexColors===!0&&!!X.attributes.color&&X.attributes.color.itemSize===4,Oe=!!X.attributes.tangent&&(!!G.normalMap||G.anisotropy>0),Ge=!!X.morphAttributes.position,Dt=!!X.morphAttributes.normal,Yt=!!X.morphAttributes.color;let xn=Qi;G.toneMapped&&(w===null||w.isXRRenderTarget===!0)&&(xn=_.toneMapping);const mi=X.morphAttributes.position||X.morphAttributes.normal||X.morphAttributes.color,et=mi!==void 0?mi.length:0,Fe=Ve.get(G),Or=m.state.lights;if(N===!0&&(Y===!0||A!==y)){const Pn=A===y&&G.id===C;fe.setState(G,A,Pn)}let gt=!1;G.version===Fe.__version?(Fe.needsLights&&Fe.lightsStateVersion!==Or.state.version||Fe.outputColorSpace!==Me||W.isBatchedMesh&&Fe.batching===!1||!W.isBatchedMesh&&Fe.batching===!0||W.isInstancedMesh&&Fe.instancing===!1||!W.isInstancedMesh&&Fe.instancing===!0||W.isSkinnedMesh&&Fe.skinning===!1||!W.isSkinnedMesh&&Fe.skinning===!0||W.isInstancedMesh&&Fe.instancingColor===!0&&W.instanceColor===null||W.isInstancedMesh&&Fe.instancingColor===!1&&W.instanceColor!==null||W.isInstancedMesh&&Fe.instancingMorph===!0&&W.morphTexture===null||W.isInstancedMesh&&Fe.instancingMorph===!1&&W.morphTexture!==null||Fe.envMap!==De||G.fog===!0&&Fe.fog!==de||Fe.numClippingPlanes!==void 0&&(Fe.numClippingPlanes!==fe.numPlanes||Fe.numIntersection!==fe.numIntersection)||Fe.vertexAlphas!==Ue||Fe.vertexTangents!==Oe||Fe.morphTargets!==Ge||Fe.morphNormals!==Dt||Fe.morphColors!==Yt||Fe.toneMapping!==xn||Fe.morphTargetsCount!==et)&&(gt=!0):(gt=!0,Fe.__version=G.version);let os=Fe.currentProgram;gt===!0&&(os=Uo(G,H,W));let Wu=!1,kr=!1,rl=!1;const Kt=os.getUniforms(),Li=Fe.uniforms;if(Re.useProgram(os.program)&&(Wu=!0,kr=!0,rl=!0),G.id!==C&&(C=G.id,kr=!0),Wu||y!==A){Kt.setValue(V,"projectionMatrix",A.projectionMatrix),Kt.setValue(V,"viewMatrix",A.matrixWorldInverse);const Pn=Kt.map.cameraPosition;Pn!==void 0&&Pn.setValue(V,le.setFromMatrixPosition(A.matrixWorld)),ut.logarithmicDepthBuffer&&Kt.setValue(V,"logDepthBufFC",2/(Math.log(A.far+1)/Math.LN2)),(G.isMeshPhongMaterial||G.isMeshToonMaterial||G.isMeshLambertMaterial||G.isMeshBasicMaterial||G.isMeshStandardMaterial||G.isShaderMaterial)&&Kt.setValue(V,"isOrthographic",A.isOrthographicCamera===!0),y!==A&&(y=A,kr=!0,rl=!0)}if(W.isSkinnedMesh){Kt.setOptional(V,W,"bindMatrix"),Kt.setOptional(V,W,"bindMatrixInverse");const Pn=W.skeleton;Pn&&(Pn.boneTexture===null&&Pn.computeBoneTexture(),Kt.setValue(V,"boneTexture",Pn.boneTexture,Ye))}W.isBatchedMesh&&(Kt.setOptional(V,W,"batchingTexture"),Kt.setValue(V,"batchingTexture",W._matricesTexture,Ye));const ol=X.morphAttributes;if((ol.position!==void 0||ol.normal!==void 0||ol.color!==void 0)&&Ee.update(W,X,os),(kr||Fe.receiveShadow!==W.receiveShadow)&&(Fe.receiveShadow=W.receiveShadow,Kt.setValue(V,"receiveShadow",W.receiveShadow)),G.isMeshGouraudMaterial&&G.envMap!==null&&(Li.envMap.value=De,Li.flipEnvMap.value=De.isCubeTexture&&De.isRenderTargetTexture===!1?-1:1),G.isMeshStandardMaterial&&G.envMap===null&&H.environment!==null&&(Li.envMapIntensity.value=H.environmentIntensity),kr&&(Kt.setValue(V,"toneMappingExposure",_.toneMappingExposure),Fe.needsLights&&Bg(Li,rl),de&&G.fog===!0&&se.refreshFogUniforms(Li,de),se.refreshMaterialUniforms(Li,G,j,k,m.state.transmissionRenderTarget[A.id]),xa.upload(V,Vu(Fe),Li,Ye)),G.isShaderMaterial&&G.uniformsNeedUpdate===!0&&(xa.upload(V,Vu(Fe),Li,Ye),G.uniformsNeedUpdate=!1),G.isSpriteMaterial&&Kt.setValue(V,"center",W.center),Kt.setValue(V,"modelViewMatrix",W.modelViewMatrix),Kt.setValue(V,"normalMatrix",W.normalMatrix),Kt.setValue(V,"modelMatrix",W.matrixWorld),G.isShaderMaterial||G.isRawShaderMaterial){const Pn=G.uniformsGroups;for(let al=0,Hg=Pn.length;al<Hg;al++){const ju=Pn[al];Xe.update(ju,os),Xe.bind(ju,os)}}return os}function Bg(A,H){A.ambientLightColor.needsUpdate=H,A.lightProbe.needsUpdate=H,A.directionalLights.needsUpdate=H,A.directionalLightShadows.needsUpdate=H,A.pointLights.needsUpdate=H,A.pointLightShadows.needsUpdate=H,A.spotLights.needsUpdate=H,A.spotLightShadows.needsUpdate=H,A.rectAreaLights.needsUpdate=H,A.hemisphereLights.needsUpdate=H}function zg(A){return A.isMeshLambertMaterial||A.isMeshToonMaterial||A.isMeshPhongMaterial||A.isMeshStandardMaterial||A.isShadowMaterial||A.isShaderMaterial&&A.lights===!0}this.getActiveCubeFace=function(){return M},this.getActiveMipmapLevel=function(){return E},this.getRenderTarget=function(){return w},this.setRenderTargetTextures=function(A,H,X){Ve.get(A.texture).__webglTexture=H,Ve.get(A.depthTexture).__webglTexture=X;const G=Ve.get(A);G.__hasExternalTextures=!0,G.__autoAllocateDepthBuffer=X===void 0,G.__autoAllocateDepthBuffer||Te.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),G.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(A,H){const X=Ve.get(A);X.__webglFramebuffer=H,X.__useDefaultFramebuffer=H===void 0},this.setRenderTarget=function(A,H=0,X=0){w=A,M=H,E=X;let G=!0,W=null,de=!1,be=!1;if(A){const De=Ve.get(A);De.__useDefaultFramebuffer!==void 0?(Re.bindFramebuffer(V.FRAMEBUFFER,null),G=!1):De.__webglFramebuffer===void 0?Ye.setupRenderTarget(A):De.__hasExternalTextures&&Ye.rebindTextures(A,Ve.get(A.texture).__webglTexture,Ve.get(A.depthTexture).__webglTexture);const Ue=A.texture;(Ue.isData3DTexture||Ue.isDataArrayTexture||Ue.isCompressedArrayTexture)&&(be=!0);const Oe=Ve.get(A).__webglFramebuffer;A.isWebGLCubeRenderTarget?(Array.isArray(Oe[H])?W=Oe[H][X]:W=Oe[H],de=!0):A.samples>0&&Ye.useMultisampledRTT(A)===!1?W=Ve.get(A).__webglMultisampledFramebuffer:Array.isArray(Oe)?W=Oe[X]:W=Oe,b.copy(A.viewport),U.copy(A.scissor),z=A.scissorTest}else b.copy(q).multiplyScalar(j).floor(),U.copy(te).multiplyScalar(j).floor(),z=ve;if(Re.bindFramebuffer(V.FRAMEBUFFER,W)&&G&&Re.drawBuffers(A,W),Re.viewport(b),Re.scissor(U),Re.setScissorTest(z),de){const De=Ve.get(A.texture);V.framebufferTexture2D(V.FRAMEBUFFER,V.COLOR_ATTACHMENT0,V.TEXTURE_CUBE_MAP_POSITIVE_X+H,De.__webglTexture,X)}else if(be){const De=Ve.get(A.texture),Ue=H||0;V.framebufferTextureLayer(V.FRAMEBUFFER,V.COLOR_ATTACHMENT0,De.__webglTexture,X||0,Ue)}C=-1},this.readRenderTargetPixels=function(A,H,X,G,W,de,be){if(!(A&&A.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Me=Ve.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&be!==void 0&&(Me=Me[be]),Me){Re.bindFramebuffer(V.FRAMEBUFFER,Me);try{const De=A.texture,Ue=De.format,Oe=De.type;if(!ut.textureFormatReadable(Ue)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!ut.textureTypeReadable(Oe)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}H>=0&&H<=A.width-G&&X>=0&&X<=A.height-W&&V.readPixels(H,X,G,W,_e.convert(Ue),_e.convert(Oe),de)}finally{const De=w!==null?Ve.get(w).__webglFramebuffer:null;Re.bindFramebuffer(V.FRAMEBUFFER,De)}}},this.copyFramebufferToTexture=function(A,H,X=0){const G=Math.pow(2,-X),W=Math.floor(H.image.width*G),de=Math.floor(H.image.height*G);Ye.setTexture2D(H,0),V.copyTexSubImage2D(V.TEXTURE_2D,X,0,0,A.x,A.y,W,de),Re.unbindTexture()},this.copyTextureToTexture=function(A,H,X,G=0){const W=H.image.width,de=H.image.height,be=_e.convert(X.format),Me=_e.convert(X.type);Ye.setTexture2D(X,0),V.pixelStorei(V.UNPACK_FLIP_Y_WEBGL,X.flipY),V.pixelStorei(V.UNPACK_PREMULTIPLY_ALPHA_WEBGL,X.premultiplyAlpha),V.pixelStorei(V.UNPACK_ALIGNMENT,X.unpackAlignment),H.isDataTexture?V.texSubImage2D(V.TEXTURE_2D,G,A.x,A.y,W,de,be,Me,H.image.data):H.isCompressedTexture?V.compressedTexSubImage2D(V.TEXTURE_2D,G,A.x,A.y,H.mipmaps[0].width,H.mipmaps[0].height,be,H.mipmaps[0].data):V.texSubImage2D(V.TEXTURE_2D,G,A.x,A.y,be,Me,H.image),G===0&&X.generateMipmaps&&V.generateMipmap(V.TEXTURE_2D),Re.unbindTexture()},this.copyTextureToTexture3D=function(A,H,X,G,W=0){const de=A.max.x-A.min.x,be=A.max.y-A.min.y,Me=A.max.z-A.min.z,De=_e.convert(G.format),Ue=_e.convert(G.type);let Oe;if(G.isData3DTexture)Ye.setTexture3D(G,0),Oe=V.TEXTURE_3D;else if(G.isDataArrayTexture||G.isCompressedArrayTexture)Ye.setTexture2DArray(G,0),Oe=V.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}V.pixelStorei(V.UNPACK_FLIP_Y_WEBGL,G.flipY),V.pixelStorei(V.UNPACK_PREMULTIPLY_ALPHA_WEBGL,G.premultiplyAlpha),V.pixelStorei(V.UNPACK_ALIGNMENT,G.unpackAlignment);const Ge=V.getParameter(V.UNPACK_ROW_LENGTH),Dt=V.getParameter(V.UNPACK_IMAGE_HEIGHT),Yt=V.getParameter(V.UNPACK_SKIP_PIXELS),xn=V.getParameter(V.UNPACK_SKIP_ROWS),mi=V.getParameter(V.UNPACK_SKIP_IMAGES),et=X.isCompressedTexture?X.mipmaps[W]:X.image;V.pixelStorei(V.UNPACK_ROW_LENGTH,et.width),V.pixelStorei(V.UNPACK_IMAGE_HEIGHT,et.height),V.pixelStorei(V.UNPACK_SKIP_PIXELS,A.min.x),V.pixelStorei(V.UNPACK_SKIP_ROWS,A.min.y),V.pixelStorei(V.UNPACK_SKIP_IMAGES,A.min.z),X.isDataTexture||X.isData3DTexture?V.texSubImage3D(Oe,W,H.x,H.y,H.z,de,be,Me,De,Ue,et.data):G.isCompressedArrayTexture?V.compressedTexSubImage3D(Oe,W,H.x,H.y,H.z,de,be,Me,De,et.data):V.texSubImage3D(Oe,W,H.x,H.y,H.z,de,be,Me,De,Ue,et),V.pixelStorei(V.UNPACK_ROW_LENGTH,Ge),V.pixelStorei(V.UNPACK_IMAGE_HEIGHT,Dt),V.pixelStorei(V.UNPACK_SKIP_PIXELS,Yt),V.pixelStorei(V.UNPACK_SKIP_ROWS,xn),V.pixelStorei(V.UNPACK_SKIP_IMAGES,mi),W===0&&G.generateMipmaps&&V.generateMipmap(Oe),Re.unbindTexture()},this.initTexture=function(A){A.isCubeTexture?Ye.setTextureCube(A,0):A.isData3DTexture?Ye.setTexture3D(A,0):A.isDataArrayTexture||A.isCompressedArrayTexture?Ye.setTexture2DArray(A,0):Ye.setTexture2D(A,0),Re.unbindTexture()},this.resetState=function(){M=0,E=0,w=null,Re.reset(),ze.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Ti}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=e===mu?"display-p3":"srgb",t.unpackColorSpace=Je.workingColorSpace===ja?"display-p3":"srgb"}get useLegacyLights(){return console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights}set useLegacyLights(e){console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights=e}}class bu{constructor(e,t=1,n=1e3){this.isFog=!0,this.name="",this.color=new ye(e),this.near=t,this.far=n}clone(){return new bu(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class To extends St{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new di,this.environmentIntensity=1,this.environmentRotation=new di,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class pw{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=zc,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.version=0,this.uuid=Yn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return Am("THREE.InterleavedBuffer: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let i=0,r=this.stride;i<r;i++)this.array[e+i]=t.array[n+i];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Yn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Yn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const rn=new L;class Mu{constructor(e,t,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=i}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)rn.fromBufferAttribute(this,t),rn.applyMatrix4(e),this.setXYZ(t,rn.x,rn.y,rn.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)rn.fromBufferAttribute(this,t),rn.applyNormalMatrix(e),this.setXYZ(t,rn.x,rn.y,rn.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)rn.fromBufferAttribute(this,t),rn.transformDirection(e),this.setXYZ(t,rn.x,rn.y,rn.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=qn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=nt(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=nt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=nt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=nt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=nt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=qn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=qn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=qn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=qn(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=nt(t,this.array),n=nt(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=nt(t,this.array),n=nt(n,this.array),i=nt(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=nt(t,this.array),n=nt(n,this.array),i=nt(i,this.array),r=nt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this.data.array[e+3]=r,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[i+r])}return new It(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new Mu(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[i+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}const $d=new L,qd=new st,Yd=new st,mw=new L,Kd=new Ce,sa=new L,nc=new fi,Zd=new Ce,ic=new wo;class gw extends at{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=Dh,this.bindMatrix=new Ce,this.bindMatrixInverse=new Ce,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const e=this.geometry;this.boundingBox===null&&(this.boundingBox=new Pi),this.boundingBox.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,sa),this.boundingBox.expandByPoint(sa)}computeBoundingSphere(){const e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new fi),this.boundingSphere.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,sa),this.boundingSphere.expandByPoint(sa)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){const n=this.material,i=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),nc.copy(this.boundingSphere),nc.applyMatrix4(i),e.ray.intersectsSphere(nc)!==!1&&(Zd.copy(i).invert(),ic.copy(e.ray).applyMatrix4(Zd),!(this.boundingBox!==null&&ic.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,ic)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new st,t=this.geometry.attributes.skinWeight;for(let n=0,i=t.count;n<i;n++){e.fromBufferAttribute(t,n);const r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===Dh?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===bx?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){const n=this.skeleton,i=this.geometry;qd.fromBufferAttribute(i.attributes.skinIndex,e),Yd.fromBufferAttribute(i.attributes.skinWeight,e),$d.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let r=0;r<4;r++){const o=Yd.getComponent(r);if(o!==0){const a=qd.getComponent(r);Kd.multiplyMatrices(n.bones[a].matrixWorld,n.boneInverses[a]),t.addScaledVector(mw.copy($d).applyMatrix4(Kd),o)}}return t.applyMatrix4(this.bindMatrixInverse)}}class Hm extends St{constructor(){super(),this.isBone=!0,this.type="Bone"}}class Vm extends Ut{constructor(e=null,t=1,n=1,i,r,o,a,c,u=cn,d=cn,l,h){super(null,o,a,c,u,d,i,r,l,h),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Jd=new Ce,vw=new Ce;class Eu{constructor(e=[],t=[]){this.uuid=Yn(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,i=this.bones.length;n<i;n++)this.boneInverses.push(new Ce)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const n=new Ce;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){const e=this.bones,t=this.boneInverses,n=this.boneMatrices,i=this.boneTexture;for(let r=0,o=e.length;r<o;r++){const a=e[r]?e[r].matrixWorld:vw;Jd.multiplyMatrices(a,t[r]),Jd.toArray(n,r*16)}i!==null&&(i.needsUpdate=!0)}clone(){return new Eu(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const n=new Vm(t,e,e,Bn,kn);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){const i=this.bones[t];if(i.name===e)return i}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,i=e.bones.length;n<i;n++){const r=e.bones[n];let o=t[r];o===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",r),o=new Hm),this.bones.push(o),this.boneInverses.push(new Ce().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){const e={metadata:{version:4.6,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,n=this.boneInverses;for(let i=0,r=t.length;i<r;i++){const o=t[i];e.bones.push(o.uuid);const a=n[i];e.boneInverses.push(a.toArray())}return e}}class un extends It{constructor(e,t,n,i=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const Ks=new Ce,Qd=new Ce,ra=[],ef=new Pi,_w=new Ce,Xr=new at,$r=new fi;class $a extends at{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new un(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,_w)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Pi),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ks),ef.copy(e.boundingBox).applyMatrix4(Ks),this.boundingBox.union(ef)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new fi),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ks),$r.copy(e.boundingSphere).applyMatrix4(Ks),this.boundingSphere.union($r)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const n=t.morphTargetInfluences,i=this.morphTexture.source.data.data,r=n.length+1,o=e*r+1;for(let a=0;a<n.length;a++)n[a]=i[o+a]}raycast(e,t){const n=this.matrixWorld,i=this.count;if(Xr.geometry=this.geometry,Xr.material=this.material,Xr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),$r.copy(this.boundingSphere),$r.applyMatrix4(n),e.ray.intersectsSphere($r)!==!1))for(let r=0;r<i;r++){this.getMatrixAt(r,Ks),Qd.multiplyMatrices(n,Ks),Xr.matrixWorld=Qd,Xr.raycast(e,ra);for(let o=0,a=ra.length;o<a;o++){const c=ra[o];c.instanceId=r,c.object=this,t.push(c)}ra.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new un(new Float32Array(this.instanceMatrix.count*3),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const n=t.morphTargetInfluences,i=n.length+1;this.morphTexture===null&&(this.morphTexture=new Vm(new Float32Array(i*this.count),i,this.count,xm,kn));const r=this.morphTexture.source.data.data;let o=0;for(let u=0;u<n.length;u++)o+=n[u];const a=this.geometry.morphTargetsRelative?1:1-o,c=i*e;r[c]=a,r.set(n,c+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}class Gm extends ui{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new ye(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Ia=new L,Ua=new L,tf=new Ce,qr=new wo,oa=new fi,sc=new L,nf=new L;class wu extends St{constructor(e=new Vt,t=new Gm){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let i=1,r=t.count;i<r;i++)Ia.fromBufferAttribute(t,i-1),Ua.fromBufferAttribute(t,i),n[i]=n[i-1],n[i]+=Ia.distanceTo(Ua);e.setAttribute("lineDistance",new bt(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,r=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),oa.copy(n.boundingSphere),oa.applyMatrix4(i),oa.radius+=r,e.ray.intersectsSphere(oa)===!1)return;tf.copy(i).invert(),qr.copy(e.ray).applyMatrix4(tf);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,u=this.isLineSegments?2:1,d=n.index,h=n.attributes.position;if(d!==null){const f=Math.max(0,o.start),g=Math.min(d.count,o.start+o.count);for(let v=f,m=g-1;v<m;v+=u){const p=d.getX(v),x=d.getX(v+1),_=aa(this,e,qr,c,p,x);_&&t.push(_)}if(this.isLineLoop){const v=d.getX(g-1),m=d.getX(f),p=aa(this,e,qr,c,v,m);p&&t.push(p)}}else{const f=Math.max(0,o.start),g=Math.min(h.count,o.start+o.count);for(let v=f,m=g-1;v<m;v+=u){const p=aa(this,e,qr,c,v,v+1);p&&t.push(p)}if(this.isLineLoop){const v=aa(this,e,qr,c,g-1,f);v&&t.push(v)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){const a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function aa(s,e,t,n,i,r){const o=s.geometry.attributes.position;if(Ia.fromBufferAttribute(o,i),Ua.fromBufferAttribute(o,r),t.distanceSqToSegment(Ia,Ua,sc,nf)>n)return;sc.applyMatrix4(s.matrixWorld);const c=e.ray.origin.distanceTo(sc);if(!(c<e.near||c>e.far))return{distance:c,point:nf.clone().applyMatrix4(s.matrixWorld),index:i,face:null,faceIndex:null,object:s}}const sf=new L,rf=new L;class Wm extends wu{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let i=0,r=t.count;i<r;i+=2)sf.fromBufferAttribute(t,i),rf.fromBufferAttribute(t,i+1),n[i]=i===0?0:n[i-1],n[i+1]=n[i]+sf.distanceTo(rf);e.setAttribute("lineDistance",new bt(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class xw extends wu{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}}class jm extends ui{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new ye(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const of=new Ce,Vc=new wo,la=new fi,ca=new L;class yw extends St{constructor(e=new Vt,t=new jm){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,r=e.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),la.copy(n.boundingSphere),la.applyMatrix4(i),la.radius+=r,e.ray.intersectsSphere(la)===!1)return;of.copy(i).invert(),Vc.copy(e.ray).applyMatrix4(of);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,u=n.index,l=n.attributes.position;if(u!==null){const h=Math.max(0,o.start),f=Math.min(u.count,o.start+o.count);for(let g=h,v=f;g<v;g++){const m=u.getX(g);ca.fromBufferAttribute(l,m),af(ca,m,c,i,e,t,this)}}else{const h=Math.max(0,o.start),f=Math.min(l.count,o.start+o.count);for(let g=h,v=f;g<v;g++)ca.fromBufferAttribute(l,g),af(ca,g,c,i,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){const a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function af(s,e,t,n,i,r,o){const a=Vc.distanceSqToPoint(s);if(a<t){const c=new L;Vc.closestPointToPoint(s,c),c.applyMatrix4(n);const u=i.ray.origin.distanceTo(c);if(u<i.near||u>i.far)return;r.push({distance:u,distanceToRay:Math.sqrt(a),point:c,index:e,face:null,object:o})}}class Xm extends Ut{constructor(e,t,n,i,r,o,a,c,u){super(e,t,n,i,r,o,a,c,u),this.isVideoTexture=!0,this.minFilter=o!==void 0?o:jt,this.magFilter=r!==void 0?r:jt,this.generateMipmaps=!1;const d=this;function l(){d.needsUpdate=!0,e.requestVideoFrameCallback(l)}"requestVideoFrameCallback"in e&&e.requestVideoFrameCallback(l)}clone(){return new this.constructor(this.image).copy(this)}update(){const e=this.image;"requestVideoFrameCallback"in e===!1&&e.readyState>=e.HAVE_CURRENT_DATA&&(this.needsUpdate=!0)}}class Tu extends Vt{constructor(e=1,t=32,n=0,i=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:i},t=Math.max(3,t);const r=[],o=[],a=[],c=[],u=new L,d=new Q;o.push(0,0,0),a.push(0,0,1),c.push(.5,.5);for(let l=0,h=3;l<=t;l++,h+=3){const f=n+l/t*i;u.x=e*Math.cos(f),u.y=e*Math.sin(f),o.push(u.x,u.y,u.z),a.push(0,0,1),d.x=(o[h]/e+1)/2,d.y=(o[h+1]/e+1)/2,c.push(d.x,d.y)}for(let l=1;l<=t;l++)r.push(l,l+1,0);this.setIndex(r),this.setAttribute("position",new bt(o,3)),this.setAttribute("normal",new bt(a,3)),this.setAttribute("uv",new bt(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Tu(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class Au extends Vt{constructor(e=[],t=[],n=1,i=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:i};const r=[],o=[];a(i),u(n),d(),this.setAttribute("position",new bt(r,3)),this.setAttribute("normal",new bt(r.slice(),3)),this.setAttribute("uv",new bt(o,2)),i===0?this.computeVertexNormals():this.normalizeNormals();function a(x){const _=new L,S=new L,M=new L;for(let E=0;E<t.length;E+=3)f(t[E+0],_),f(t[E+1],S),f(t[E+2],M),c(_,S,M,x)}function c(x,_,S,M){const E=M+1,w=[];for(let C=0;C<=E;C++){w[C]=[];const y=x.clone().lerp(S,C/E),b=_.clone().lerp(S,C/E),U=E-C;for(let z=0;z<=U;z++)z===0&&C===E?w[C][z]=y:w[C][z]=y.clone().lerp(b,z/U)}for(let C=0;C<E;C++)for(let y=0;y<2*(E-C)-1;y++){const b=Math.floor(y/2);y%2===0?(h(w[C][b+1]),h(w[C+1][b]),h(w[C][b])):(h(w[C][b+1]),h(w[C+1][b+1]),h(w[C+1][b]))}}function u(x){const _=new L;for(let S=0;S<r.length;S+=3)_.x=r[S+0],_.y=r[S+1],_.z=r[S+2],_.normalize().multiplyScalar(x),r[S+0]=_.x,r[S+1]=_.y,r[S+2]=_.z}function d(){const x=new L;for(let _=0;_<r.length;_+=3){x.x=r[_+0],x.y=r[_+1],x.z=r[_+2];const S=m(x)/2/Math.PI+.5,M=p(x)/Math.PI+.5;o.push(S,1-M)}g(),l()}function l(){for(let x=0;x<o.length;x+=6){const _=o[x+0],S=o[x+2],M=o[x+4],E=Math.max(_,S,M),w=Math.min(_,S,M);E>.9&&w<.1&&(_<.2&&(o[x+0]+=1),S<.2&&(o[x+2]+=1),M<.2&&(o[x+4]+=1))}}function h(x){r.push(x.x,x.y,x.z)}function f(x,_){const S=x*3;_.x=e[S+0],_.y=e[S+1],_.z=e[S+2]}function g(){const x=new L,_=new L,S=new L,M=new L,E=new Q,w=new Q,C=new Q;for(let y=0,b=0;y<r.length;y+=9,b+=6){x.set(r[y+0],r[y+1],r[y+2]),_.set(r[y+3],r[y+4],r[y+5]),S.set(r[y+6],r[y+7],r[y+8]),E.set(o[b+0],o[b+1]),w.set(o[b+2],o[b+3]),C.set(o[b+4],o[b+5]),M.copy(x).add(_).add(S).divideScalar(3);const U=m(M);v(E,b+0,x,U),v(w,b+2,_,U),v(C,b+4,S,U)}}function v(x,_,S,M){M<0&&x.x===1&&(o[_]=x.x-1),S.x===0&&S.z===0&&(o[_]=M/2/Math.PI+.5)}function m(x){return Math.atan2(x.z,-x.x)}function p(x){return Math.atan2(-x.y,Math.sqrt(x.x*x.x+x.z*x.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Au(e.vertices,e.indices,e.radius,e.details)}}class Du extends Au{constructor(e=1,t=0){const n=(1+Math.sqrt(5))/2,i=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(i,r,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new Du(e.radius,e.detail)}}class mt extends Cn{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class Ao extends ui{constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new ye(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ye(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Em,this.normalScale=new Q(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new di,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Vn extends Ao{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new Q(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Qt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new ye(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new ye(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new ye(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}function ua(s,e,t){return!s||!t&&s.constructor===e?s:typeof e.BYTES_PER_ELEMENT=="number"?new e(s):Array.prototype.slice.call(s)}function Sw(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)}function bw(s){function e(i,r){return s[i]-s[r]}const t=s.length,n=new Array(t);for(let i=0;i!==t;++i)n[i]=i;return n.sort(e),n}function lf(s,e,t){const n=s.length,i=new s.constructor(n);for(let r=0,o=0;o!==n;++r){const a=t[r]*e;for(let c=0;c!==e;++c)i[o++]=s[a+c]}return i}function $m(s,e,t,n){let i=1,r=s[0];for(;r!==void 0&&r[n]===void 0;)r=s[i++];if(r===void 0)return;let o=r[n];if(o!==void 0)if(Array.isArray(o))do o=r[n],o!==void 0&&(e.push(r.time),t.push.apply(t,o)),r=s[i++];while(r!==void 0);else if(o.toArray!==void 0)do o=r[n],o!==void 0&&(e.push(r.time),o.toArray(t,t.length)),r=s[i++];while(r!==void 0);else do o=r[n],o!==void 0&&(e.push(r.time),t.push(o)),r=s[i++];while(r!==void 0)}class Do{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let n=this._cachedIndex,i=t[n],r=t[n-1];n:{e:{let o;t:{i:if(!(e<i)){for(let a=n+2;;){if(i===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=i,i=t[++n],e<i)break e}o=t.length;break t}if(!(e>=r)){const a=t[1];e<a&&(n=2,r=a);for(let c=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===c)break;if(i=r,r=t[--n-1],e>=r)break e}o=n,n=0;break t}break n}for(;n<o;){const a=n+o>>>1;e<t[a]?o=a:n=a+1}if(i=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,i)}return this.interpolate_(n,r,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i;for(let o=0;o!==i;++o)t[o]=n[r+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}}class Mw extends Do{constructor(e,t,n,i){super(e,t,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:td,endingEnd:td}}intervalChanged_(e,t,n){const i=this.parameterPositions;let r=e-2,o=e+1,a=i[r],c=i[o];if(a===void 0)switch(this.getSettings_().endingStart){case nd:r=e,a=2*t-n;break;case id:r=i.length-2,a=t+i[r]-i[r+1];break;default:r=e,a=n}if(c===void 0)switch(this.getSettings_().endingEnd){case nd:o=e,c=2*n-t;break;case id:o=1,c=n+i[1]-i[0];break;default:o=e-1,c=t}const u=(n-t)*.5,d=this.valueSize;this._weightPrev=u/(t-a),this._weightNext=u/(c-n),this._offsetPrev=r*d,this._offsetNext=o*d}interpolate_(e,t,n,i){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,u=c-a,d=this._offsetPrev,l=this._offsetNext,h=this._weightPrev,f=this._weightNext,g=(n-t)/(i-t),v=g*g,m=v*g,p=-h*m+2*h*v-h*g,x=(1+h)*m+(-1.5-2*h)*v+(-.5+h)*g+1,_=(-1-f)*m+(1.5+f)*v+.5*g,S=f*m-f*v;for(let M=0;M!==a;++M)r[M]=p*o[d+M]+x*o[u+M]+_*o[c+M]+S*o[l+M];return r}}class Ew extends Do{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,u=c-a,d=(n-t)/(i-t),l=1-d;for(let h=0;h!==a;++h)r[h]=o[u+h]*l+o[c+h]*d;return r}}class ww extends Do{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}}class pi{constructor(e,t,n,i){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=ua(t,this.TimeBufferType),this.values=ua(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:ua(e.times,Array),values:ua(e.values,Array)};const i=e.getInterpolation();i!==e.DefaultInterpolation&&(n.interpolation=i)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new ww(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Ew(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Mw(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case xo:t=this.InterpolantFactoryMethodDiscrete;break;case Sr:t=this.InterpolantFactoryMethodLinear;break;case Rl:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){const n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return xo;case this.InterpolantFactoryMethodLinear:return Sr;case this.InterpolantFactoryMethodSmooth:return Rl}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e}return this}trim(e,t){const n=this.times,i=n.length;let r=0,o=i-1;for(;r!==i&&n[r]<e;)++r;for(;o!==-1&&n[o]>t;)--o;if(++o,r!==0||o!==i){r>=o&&(o=Math.max(o,1),r=o-1);const a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);const n=this.times,i=this.values,r=n.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){const c=n[a];if(typeof c=="number"&&isNaN(c)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,c),e=!1;break}if(o!==null&&o>c){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,c,o),e=!1;break}o=c}if(i!==void 0&&Sw(i))for(let a=0,c=i.length;a!==c;++a){const u=i[a];if(isNaN(u)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,u),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===Rl,r=e.length-1;let o=1;for(let a=1;a<r;++a){let c=!1;const u=e[a],d=e[a+1];if(u!==d&&(a!==1||u!==e[0]))if(i)c=!0;else{const l=a*n,h=l-n,f=l+n;for(let g=0;g!==n;++g){const v=t[l+g];if(v!==t[h+g]||v!==t[f+g]){c=!0;break}}}if(c){if(a!==o){e[o]=e[a];const l=a*n,h=o*n;for(let f=0;f!==n;++f)t[h+f]=t[l+f]}++o}}if(r>0){e[o]=e[r];for(let a=r*n,c=o*n,u=0;u!==n;++u)t[c+u]=t[a+u];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),n=this.constructor,i=new n(this.name,e,t);return i.createInterpolant=this.createInterpolant,i}}pi.prototype.TimeBufferType=Float32Array;pi.prototype.ValueBufferType=Float32Array;pi.prototype.DefaultInterpolation=Sr;class Pr extends pi{}Pr.prototype.ValueTypeName="bool";Pr.prototype.ValueBufferType=Array;Pr.prototype.DefaultInterpolation=xo;Pr.prototype.InterpolantFactoryMethodLinear=void 0;Pr.prototype.InterpolantFactoryMethodSmooth=void 0;class qm extends pi{}qm.prototype.ValueTypeName="color";class Er extends pi{}Er.prototype.ValueTypeName="number";class Tw extends Do{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=(n-t)/(i-t);let u=e*a;for(let d=u+a;u!==d;u+=4)rs.slerpFlat(r,0,o,u-a,o,u,c);return r}}class Ds extends pi{InterpolantFactoryMethodLinear(e){return new Tw(this.times,this.values,this.getValueSize(),e)}}Ds.prototype.ValueTypeName="quaternion";Ds.prototype.DefaultInterpolation=Sr;Ds.prototype.InterpolantFactoryMethodSmooth=void 0;class Lr extends pi{}Lr.prototype.ValueTypeName="string";Lr.prototype.ValueBufferType=Array;Lr.prototype.DefaultInterpolation=xo;Lr.prototype.InterpolantFactoryMethodLinear=void 0;Lr.prototype.InterpolantFactoryMethodSmooth=void 0;class wr extends pi{}wr.prototype.ValueTypeName="vector";class Aw{constructor(e="",t=-1,n=[],i=Lx){this.name=e,this.tracks=n,this.duration=t,this.blendMode=i,this.uuid=Yn(),this.duration<0&&this.resetDuration()}static parse(e){const t=[],n=e.tracks,i=1/(e.fps||1);for(let o=0,a=n.length;o!==a;++o)t.push(Cw(n[o]).scale(i));const r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r}static toJSON(e){const t=[],n=e.tracks,i={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode};for(let r=0,o=n.length;r!==o;++r)t.push(pi.toJSON(n[r]));return i}static CreateFromMorphTargetSequence(e,t,n,i){const r=t.length,o=[];for(let a=0;a<r;a++){let c=[],u=[];c.push((a+r-1)%r,a,(a+1)%r),u.push(0,1,0);const d=bw(c);c=lf(c,1,d),u=lf(u,1,d),!i&&c[0]===0&&(c.push(r),u.push(u[0])),o.push(new Er(".morphTargetInfluences["+t[a].name+"]",c,u).scale(1/n))}return new this(e,-1,o)}static findByName(e,t){let n=e;if(!Array.isArray(e)){const i=e;n=i.geometry&&i.geometry.animations||i.animations}for(let i=0;i<n.length;i++)if(n[i].name===t)return n[i];return null}static CreateClipsFromMorphTargetSequences(e,t,n){const i={},r=/^([\w-]*?)([\d]+)$/;for(let a=0,c=e.length;a<c;a++){const u=e[a],d=u.name.match(r);if(d&&d.length>1){const l=d[1];let h=i[l];h||(i[l]=h=[]),h.push(u)}}const o=[];for(const a in i)o.push(this.CreateFromMorphTargetSequence(a,i[a],t,n));return o}static parseAnimation(e,t){if(!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;const n=function(l,h,f,g,v){if(f.length!==0){const m=[],p=[];$m(f,m,p,g),m.length!==0&&v.push(new l(h,m,p))}},i=[],r=e.name||"default",o=e.fps||30,a=e.blendMode;let c=e.length||-1;const u=e.hierarchy||[];for(let l=0;l<u.length;l++){const h=u[l].keys;if(!(!h||h.length===0))if(h[0].morphTargets){const f={};let g;for(g=0;g<h.length;g++)if(h[g].morphTargets)for(let v=0;v<h[g].morphTargets.length;v++)f[h[g].morphTargets[v]]=-1;for(const v in f){const m=[],p=[];for(let x=0;x!==h[g].morphTargets.length;++x){const _=h[g];m.push(_.time),p.push(_.morphTarget===v?1:0)}i.push(new Er(".morphTargetInfluence["+v+"]",m,p))}c=f.length*o}else{const f=".bones["+t[l].name+"]";n(wr,f+".position",h,"pos",i),n(Ds,f+".quaternion",h,"rot",i),n(wr,f+".scale",h,"scl",i)}}return i.length===0?null:new this(r,c,i,a)}resetDuration(){const e=this.tracks;let t=0;for(let n=0,i=e.length;n!==i;++n){const r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let t=0;t<this.tracks.length;t++)e.push(this.tracks[t].clone());return new this.constructor(this.name,this.duration,e,this.blendMode)}toJSON(){return this.constructor.toJSON(this)}}function Dw(s){switch(s.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Er;case"vector":case"vector2":case"vector3":case"vector4":return wr;case"color":return qm;case"quaternion":return Ds;case"bool":case"boolean":return Pr;case"string":return Lr}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+s)}function Cw(s){if(s.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=Dw(s.type);if(s.times===void 0){const t=[],n=[];$m(s.keys,t,n,"value"),s.times=t,s.values=n}return e.parse!==void 0?e.parse(s):new e(s.name,s.times,s.values,s.interpolation)}const qi={enabled:!1,files:{},add:function(s,e){this.enabled!==!1&&(this.files[s]=e)},get:function(s){if(this.enabled!==!1)return this.files[s]},remove:function(s){delete this.files[s]},clear:function(){this.files={}}};let Rw=class{constructor(e,t,n){const i=this;let r=!1,o=0,a=0,c;const u=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.itemStart=function(d){a++,r===!1&&i.onStart!==void 0&&i.onStart(d,o,a),r=!0},this.itemEnd=function(d){o++,i.onProgress!==void 0&&i.onProgress(d,o,a),o===a&&(r=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(d){i.onError!==void 0&&i.onError(d)},this.resolveURL=function(d){return c?c(d):d},this.setURLModifier=function(d){return c=d,this},this.addHandler=function(d,l){return u.push(d,l),this},this.removeHandler=function(d){const l=u.indexOf(d);return l!==-1&&u.splice(l,2),this},this.getHandler=function(d){for(let l=0,h=u.length;l<h;l+=2){const f=u[l],g=u[l+1];if(f.global&&(f.lastIndex=0),f.test(d))return g}return null}}};const Ym=new Rw;class Ps{constructor(e){this.manager=e!==void 0?e:Ym,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const n=this;return new Promise(function(i,r){n.load(e,i,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}}Ps.DEFAULT_MATERIAL_NAME="__DEFAULT";const Si={};class Pw extends Error{constructor(e,t){super(e),this.response=t}}class Km extends Ps{constructor(e){super(e)}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=qi.get(e);if(r!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0),r;if(Si[e]!==void 0){Si[e].push({onLoad:t,onProgress:n,onError:i});return}Si[e]=[],Si[e].push({onLoad:t,onProgress:n,onError:i});const o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin"}),a=this.mimeType,c=this.responseType;fetch(o).then(u=>{if(u.status===200||u.status===0){if(u.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||u.body===void 0||u.body.getReader===void 0)return u;const d=Si[e],l=u.body.getReader(),h=u.headers.get("X-File-Size")||u.headers.get("Content-Length"),f=h?parseInt(h):0,g=f!==0;let v=0;const m=new ReadableStream({start(p){x();function x(){l.read().then(({done:_,value:S})=>{if(_)p.close();else{v+=S.byteLength;const M=new ProgressEvent("progress",{lengthComputable:g,loaded:v,total:f});for(let E=0,w=d.length;E<w;E++){const C=d[E];C.onProgress&&C.onProgress(M)}p.enqueue(S),x()}})}}});return new Response(m)}else throw new Pw(`fetch for "${u.url}" responded with ${u.status}: ${u.statusText}`,u)}).then(u=>{switch(c){case"arraybuffer":return u.arrayBuffer();case"blob":return u.blob();case"document":return u.text().then(d=>new DOMParser().parseFromString(d,a));case"json":return u.json();default:if(a===void 0)return u.text();{const l=/charset="?([^;"\s]*)"?/i.exec(a),h=l&&l[1]?l[1].toLowerCase():void 0,f=new TextDecoder(h);return u.arrayBuffer().then(g=>f.decode(g))}}}).then(u=>{qi.add(e,u);const d=Si[e];delete Si[e];for(let l=0,h=d.length;l<h;l++){const f=d[l];f.onLoad&&f.onLoad(u)}}).catch(u=>{const d=Si[e];if(d===void 0)throw this.manager.itemError(e),u;delete Si[e];for(let l=0,h=d.length;l<h;l++){const f=d[l];f.onError&&f.onError(u)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}}class Zm extends Ps{constructor(e){super(e)}load(e,t,n,i){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,o=qi.get(e);if(o!==void 0)return r.manager.itemStart(e),setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0),o;const a=yo("img");function c(){d(),qi.add(e,this),t&&t(this),r.manager.itemEnd(e)}function u(l){d(),i&&i(l),r.manager.itemError(e),r.manager.itemEnd(e)}function d(){a.removeEventListener("load",c,!1),a.removeEventListener("error",u,!1)}return a.addEventListener("load",c,!1),a.addEventListener("error",u,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),r.manager.itemStart(e),a.src=e,a}}let Lw=class extends Ps{constructor(e){super(e)}load(e,t,n,i){const r=new xu;r.colorSpace=Gt;const o=new Zm(this.manager);o.setCrossOrigin(this.crossOrigin),o.setPath(this.path);let a=0;function c(u){o.load(e[u],function(d){r.images[u]=d,a++,a===6&&(r.needsUpdate=!0,t&&t(r))},void 0,i)}for(let u=0;u<e.length;++u)c(u);return r}};class Jm extends Ps{constructor(e){super(e)}load(e,t,n,i){const r=new Ut,o=new Zm(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){r.image=a,r.needsUpdate=!0,t!==void 0&&t(r)},n,i),r}}class qa extends St{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new ye(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),t}}const rc=new Ce,cf=new L,uf=new L;class Cu{constructor(e){this.camera=e,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Q(512,512),this.map=null,this.mapPass=null,this.matrix=new Ce,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new yu,this._frameExtents=new Q(1,1),this._viewportCount=1,this._viewports=[new st(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;cf.setFromMatrixPosition(e.matrixWorld),t.position.copy(cf),uf.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(uf),t.updateMatrixWorld(),rc.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(rc),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(rc)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class Iw extends Cu{constructor(){super(new Wt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1}updateMatrices(e){const t=this.camera,n=br*2*e.angle*this.focus,i=this.mapSize.width/this.mapSize.height,r=e.distance||t.far;(n!==t.fov||i!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=i,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class Qm extends qa{constructor(e,t,n=0,i=Math.PI/3,r=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(St.DEFAULT_UP),this.updateMatrix(),this.target=new St,this.distance=n,this.angle=i,this.penumbra=r,this.decay=o,this.map=null,this.shadow=new Iw}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}const hf=new Ce,Yr=new L,oc=new L;class Uw extends Cu{constructor(){super(new Wt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new Q(4,2),this._viewportCount=6,this._viewports=[new st(2,1,1,1),new st(0,1,1,1),new st(3,1,1,1),new st(1,1,1,1),new st(3,0,1,1),new st(1,0,1,1)],this._cubeDirections=[new L(1,0,0),new L(-1,0,0),new L(0,0,1),new L(0,0,-1),new L(0,1,0),new L(0,-1,0)],this._cubeUps=[new L(0,1,0),new L(0,1,0),new L(0,1,0),new L(0,1,0),new L(0,0,1),new L(0,0,-1)]}updateMatrices(e,t=0){const n=this.camera,i=this.matrix,r=e.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),Yr.setFromMatrixPosition(e.matrixWorld),n.position.copy(Yr),oc.copy(n.position),oc.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(oc),n.updateMatrixWorld(),i.makeTranslation(-Yr.x,-Yr.y,-Yr.z),hf.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(hf)}}class Fw extends qa{constructor(e,t,n=0,i=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new Uw}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class Nw extends Cu{constructor(){super(new Kn(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class So extends qa{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(St.DEFAULT_UP),this.updateMatrix(),this.target=new St,this.shadow=new Nw}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class eg extends qa{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}class ao{static decodeText(e){if(typeof TextDecoder<"u")return new TextDecoder().decode(e);let t="";for(let n=0,i=e.length;n<i;n++)t+=String.fromCharCode(e[n]);try{return decodeURIComponent(escape(t))}catch{return t}}static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}class Ow extends Ps{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"}}setOptions(e){return this.options=e,this}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,o=qi.get(e);if(o!==void 0){if(r.manager.itemStart(e),o.then){o.then(u=>{t&&t(u),r.manager.itemEnd(e)}).catch(u=>{i&&i(u)});return}return setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0),o}const a={};a.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",a.headers=this.requestHeader;const c=fetch(e,a).then(function(u){return u.blob()}).then(function(u){return createImageBitmap(u,Object.assign(r.options,{colorSpaceConversion:"none"}))}).then(function(u){return qi.add(e,u),t&&t(u),r.manager.itemEnd(e),u}).catch(function(u){i&&i(u),qi.remove(e),r.manager.itemError(e),r.manager.itemEnd(e)});qi.add(e,c),r.manager.itemStart(e)}}const Ru="\\[\\]\\.:\\/",kw=new RegExp("["+Ru+"]","g"),Pu="[^"+Ru+"]",Bw="[^"+Ru.replace("\\.","")+"]",zw=/((?:WC+[\/:])*)/.source.replace("WC",Pu),Hw=/(WCOD+)?/.source.replace("WCOD",Bw),Vw=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Pu),Gw=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Pu),Ww=new RegExp("^"+zw+Hw+Vw+Gw+"$"),jw=["material","materials","bones","map"];class Xw{constructor(e,t,n){const i=n||it.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,i)}getValue(e,t){this.bind();const n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(e,t)}setValue(e,t){const n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,r=n.length;i!==r;++i)n[i].setValue(e,t)}bind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}}class it{constructor(e,t,n){this.path=t,this.parsedPath=n||it.parseTrackName(t),this.node=it.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new it.Composite(e,t,n):new it(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(kw,"")}static parseTrackName(e){const t=Ww.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);const n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){const r=n.nodeName.substring(i+1);jw.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){const n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){const n=function(r){for(let o=0;o<r.length;o++){const a=r[o];if(a.name===t||a.uuid===t)return a;const c=n(a.children);if(c)return c}return null},i=n(e.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)e[t++]=n[i]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++]}_setValue_array_setNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node;const t=this.parsedPath,n=t.objectName,i=t.propertyName;let r=t.propertyIndex;if(e||(e=it.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let u=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let d=0;d<e.length;d++)if(e[d].name===u){u=d;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(u!==void 0){if(e[u]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[u]}}const o=e[i];if(o===void 0){const u=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+u+"."+i+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?a=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(i==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}it.Composite=Xw;it.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};it.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};it.prototype.GetterByBindingType=[it.prototype._getValue_direct,it.prototype._getValue_array,it.prototype._getValue_arrayElement,it.prototype._getValue_toArray];it.prototype.SetterByBindingTypeAndVersioning=[[it.prototype._setValue_direct,it.prototype._setValue_direct_setNeedsUpdate,it.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[it.prototype._setValue_array,it.prototype._setValue_array_setNeedsUpdate,it.prototype._setValue_array_setMatrixWorldNeedsUpdate],[it.prototype._setValue_arrayElement,it.prototype._setValue_arrayElement_setNeedsUpdate,it.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[it.prototype._setValue_fromArray,it.prototype._setValue_fromArray_setNeedsUpdate,it.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];class I{constructor(e){this.value=e}clone(){return new I(this.value.clone===void 0?this.value:this.value.clone())}}const df=new Ce;class $w{constructor(e,t,n=0,i=1/0){this.ray=new wo(e,t),this.near=n,this.far=i,this.camera=null,this.layers=new vu,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return df.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(df),this}intersectObject(e,t=!0,n=[]){return Gc(e,this,n,t),n.sort(ff),n}intersectObjects(e,t=!0,n=[]){for(let i=0,r=e.length;i<r;i++)Gc(e[i],this,n,t);return n.sort(ff),n}}function ff(s,e){return s.distance-e.distance}function Gc(s,e,t,n){if(s.layers.test(e.layers)&&s.raycast(e,t),n===!0){const i=s.children;for(let r=0,o=i.length;r<o;r++)Gc(i[r],e,t,!0)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:pu}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=pu);Je.enabled=!0;class qw extends fw{constructor(e){super({alpha:!0,antialias:!1,preserveDrawingBuffer:!1,powerPreference:"high-performance",stencil:!1,depth:!1}),this.autoClear=!1,this.outputColorSpace=Gt,e.appendChild(this.domElement)}resize(e,t,n){this.setSize(e,t),this.setPixelRatio(n)}}function pf(s,e){if(e===Ix)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),s;if(e===Bc||e===Mm){let t=s.getIndex();if(t===null){const o=[],a=s.getAttribute("position");if(a!==void 0){for(let c=0;c<a.count;c++)o.push(c);s.setIndex(o),t=s.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),s}const n=t.count-2,i=[];if(e===Bc)for(let o=1;o<=n;o++)i.push(t.getX(0)),i.push(t.getX(o)),i.push(t.getX(o+1));else for(let o=0;o<n;o++)o%2===0?(i.push(t.getX(o)),i.push(t.getX(o+1)),i.push(t.getX(o+2))):(i.push(t.getX(o+2)),i.push(t.getX(o+1)),i.push(t.getX(o)));i.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");const r=s.clone();return r.setIndex(i),r.clearGroups(),r}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),s}class Yw extends Ps{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new eT(t)}),this.register(function(t){return new tT(t)}),this.register(function(t){return new uT(t)}),this.register(function(t){return new hT(t)}),this.register(function(t){return new dT(t)}),this.register(function(t){return new iT(t)}),this.register(function(t){return new sT(t)}),this.register(function(t){return new rT(t)}),this.register(function(t){return new oT(t)}),this.register(function(t){return new Qw(t)}),this.register(function(t){return new aT(t)}),this.register(function(t){return new nT(t)}),this.register(function(t){return new cT(t)}),this.register(function(t){return new lT(t)}),this.register(function(t){return new Zw(t)}),this.register(function(t){return new fT(t)}),this.register(function(t){return new pT(t)})}load(e,t,n,i){const r=this;let o;if(this.resourcePath!=="")o=this.resourcePath;else if(this.path!==""){const u=ao.extractUrlBase(e);o=ao.resolveURL(u,this.path)}else o=ao.extractUrlBase(e);this.manager.itemStart(e);const a=function(u){i?i(u):console.error(u),r.manager.itemError(e),r.manager.itemEnd(e)},c=new Km(this.manager);c.setPath(this.path),c.setResponseType("arraybuffer"),c.setRequestHeader(this.requestHeader),c.setWithCredentials(this.withCredentials),c.load(e,function(u){try{r.parse(u,o,function(d){t(d),r.manager.itemEnd(e)},a)}catch(d){a(d)}},n,a)}setDRACOLoader(e){return this.dracoLoader=e,this}setDDSLoader(){throw new Error('THREE.GLTFLoader: "MSFT_texture_dds" no longer supported. Please update to "KHR_texture_basisu".')}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,i){let r;const o={},a={},c=new TextDecoder;if(typeof e=="string")r=JSON.parse(e);else if(e instanceof ArrayBuffer)if(c.decode(new Uint8Array(e,0,4))===tg){try{o[We.KHR_BINARY_GLTF]=new mT(e)}catch(l){i&&i(l);return}r=JSON.parse(o[We.KHR_BINARY_GLTF].content)}else r=JSON.parse(c.decode(e));else r=e;if(r.asset===void 0||r.asset.version[0]<2){i&&i(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}const u=new DT(r,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});u.fileLoader.setRequestHeader(this.requestHeader);for(let d=0;d<this.pluginCallbacks.length;d++){const l=this.pluginCallbacks[d](u);l.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),a[l.name]=l,o[l.name]=!0}if(r.extensionsUsed)for(let d=0;d<r.extensionsUsed.length;++d){const l=r.extensionsUsed[d],h=r.extensionsRequired||[];switch(l){case We.KHR_MATERIALS_UNLIT:o[l]=new Jw;break;case We.KHR_DRACO_MESH_COMPRESSION:o[l]=new gT(r,this.dracoLoader);break;case We.KHR_TEXTURE_TRANSFORM:o[l]=new vT;break;case We.KHR_MESH_QUANTIZATION:o[l]=new _T;break;default:h.indexOf(l)>=0&&a[l]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+l+'".')}}u.setExtensions(o),u.setPlugins(a),u.parse(n,i)}parseAsync(e,t){const n=this;return new Promise(function(i,r){n.parse(e,t,i,r)})}}function Kw(){let s={};return{get:function(e){return s[e]},add:function(e,t){s[e]=t},remove:function(e){delete s[e]},removeAll:function(){s={}}}}const We={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"};class Zw{constructor(e){this.parser=e,this.name=We.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){const e=this.parser,t=this.parser.json.nodes||[];for(let n=0,i=t.length;n<i;n++){const r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){const t=this.parser,n="light:"+e;let i=t.cache.get(n);if(i)return i;const r=t.json,c=((r.extensions&&r.extensions[this.name]||{}).lights||[])[e];let u;const d=new ye(16777215);c.color!==void 0&&d.setRGB(c.color[0],c.color[1],c.color[2],$t);const l=c.range!==void 0?c.range:0;switch(c.type){case"directional":u=new So(d),u.target.position.set(0,0,-1),u.add(u.target);break;case"point":u=new Fw(d),u.distance=l;break;case"spot":u=new Qm(d),u.distance=l,c.spot=c.spot||{},c.spot.innerConeAngle=c.spot.innerConeAngle!==void 0?c.spot.innerConeAngle:0,c.spot.outerConeAngle=c.spot.outerConeAngle!==void 0?c.spot.outerConeAngle:Math.PI/4,u.angle=c.spot.outerConeAngle,u.penumbra=1-c.spot.innerConeAngle/c.spot.outerConeAngle,u.target.position.set(0,0,-1),u.add(u.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+c.type)}return u.position.set(0,0,0),u.decay=2,Vi(u,c),c.intensity!==void 0&&(u.intensity=c.intensity),u.name=t.createUniqueName(c.name||"light_"+e),i=Promise.resolve(u),t.cache.add(n,i),i}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){const t=this,n=this.parser,r=n.json.nodes[e],a=(r.extensions&&r.extensions[this.name]||{}).light;return a===void 0?null:this._loadLight(a).then(function(c){return n._getNodeRef(t.cache,a,c)})}}class Jw{constructor(){this.name=We.KHR_MATERIALS_UNLIT}getMaterialType(){return Ai}extendParams(e,t,n){const i=[];e.color=new ye(1,1,1),e.opacity=1;const r=t.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){const o=r.baseColorFactor;e.color.setRGB(o[0],o[1],o[2],$t),e.opacity=o[3]}r.baseColorTexture!==void 0&&i.push(n.assignTexture(e,"map",r.baseColorTexture,Gt))}return Promise.all(i)}}class Qw{constructor(e){this.parser=e,this.name=We.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=i.extensions[this.name].emissiveStrength;return r!==void 0&&(t.emissiveIntensity=r),Promise.resolve()}}class eT{constructor(e){this.parser=e,this.name=We.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Vn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];if(o.clearcoatFactor!==void 0&&(t.clearcoat=o.clearcoatFactor),o.clearcoatTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatMap",o.clearcoatTexture)),o.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=o.clearcoatRoughnessFactor),o.clearcoatRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatRoughnessMap",o.clearcoatRoughnessTexture)),o.clearcoatNormalTexture!==void 0&&(r.push(n.assignTexture(t,"clearcoatNormalMap",o.clearcoatNormalTexture)),o.clearcoatNormalTexture.scale!==void 0)){const a=o.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new Q(a,a)}return Promise.all(r)}}class tT{constructor(e){this.parser=e,this.name=We.KHR_MATERIALS_DISPERSION}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Vn}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=i.extensions[this.name];return t.dispersion=r.dispersion!==void 0?r.dispersion:0,Promise.resolve()}}class nT{constructor(e){this.parser=e,this.name=We.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Vn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];return o.iridescenceFactor!==void 0&&(t.iridescence=o.iridescenceFactor),o.iridescenceTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceMap",o.iridescenceTexture)),o.iridescenceIor!==void 0&&(t.iridescenceIOR=o.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),o.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=o.iridescenceThicknessMinimum),o.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=o.iridescenceThicknessMaximum),o.iridescenceThicknessTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceThicknessMap",o.iridescenceThicknessTexture)),Promise.all(r)}}class iT{constructor(e){this.parser=e,this.name=We.KHR_MATERIALS_SHEEN}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Vn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[];t.sheenColor=new ye(0,0,0),t.sheenRoughness=0,t.sheen=1;const o=i.extensions[this.name];if(o.sheenColorFactor!==void 0){const a=o.sheenColorFactor;t.sheenColor.setRGB(a[0],a[1],a[2],$t)}return o.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=o.sheenRoughnessFactor),o.sheenColorTexture!==void 0&&r.push(n.assignTexture(t,"sheenColorMap",o.sheenColorTexture,Gt)),o.sheenRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"sheenRoughnessMap",o.sheenRoughnessTexture)),Promise.all(r)}}class sT{constructor(e){this.parser=e,this.name=We.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Vn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];return o.transmissionFactor!==void 0&&(t.transmission=o.transmissionFactor),o.transmissionTexture!==void 0&&r.push(n.assignTexture(t,"transmissionMap",o.transmissionTexture)),Promise.all(r)}}class rT{constructor(e){this.parser=e,this.name=We.KHR_MATERIALS_VOLUME}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Vn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];t.thickness=o.thicknessFactor!==void 0?o.thicknessFactor:0,o.thicknessTexture!==void 0&&r.push(n.assignTexture(t,"thicknessMap",o.thicknessTexture)),t.attenuationDistance=o.attenuationDistance||1/0;const a=o.attenuationColor||[1,1,1];return t.attenuationColor=new ye().setRGB(a[0],a[1],a[2],$t),Promise.all(r)}}class oT{constructor(e){this.parser=e,this.name=We.KHR_MATERIALS_IOR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Vn}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=i.extensions[this.name];return t.ior=r.ior!==void 0?r.ior:1.5,Promise.resolve()}}class aT{constructor(e){this.parser=e,this.name=We.KHR_MATERIALS_SPECULAR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Vn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];t.specularIntensity=o.specularFactor!==void 0?o.specularFactor:1,o.specularTexture!==void 0&&r.push(n.assignTexture(t,"specularIntensityMap",o.specularTexture));const a=o.specularColorFactor||[1,1,1];return t.specularColor=new ye().setRGB(a[0],a[1],a[2],$t),o.specularColorTexture!==void 0&&r.push(n.assignTexture(t,"specularColorMap",o.specularColorTexture,Gt)),Promise.all(r)}}class lT{constructor(e){this.parser=e,this.name=We.EXT_MATERIALS_BUMP}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Vn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];return t.bumpScale=o.bumpFactor!==void 0?o.bumpFactor:1,o.bumpTexture!==void 0&&r.push(n.assignTexture(t,"bumpMap",o.bumpTexture)),Promise.all(r)}}class cT{constructor(e){this.parser=e,this.name=We.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Vn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];return o.anisotropyStrength!==void 0&&(t.anisotropy=o.anisotropyStrength),o.anisotropyRotation!==void 0&&(t.anisotropyRotation=o.anisotropyRotation),o.anisotropyTexture!==void 0&&r.push(n.assignTexture(t,"anisotropyMap",o.anisotropyTexture)),Promise.all(r)}}class uT{constructor(e){this.parser=e,this.name=We.KHR_TEXTURE_BASISU}loadTexture(e){const t=this.parser,n=t.json,i=n.textures[e];if(!i.extensions||!i.extensions[this.name])return null;const r=i.extensions[this.name],o=t.options.ktx2Loader;if(!o){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,r.source,o)}}class hT{constructor(e){this.parser=e,this.name=We.EXT_TEXTURE_WEBP,this.isSupported=null}loadTexture(e){const t=this.name,n=this.parser,i=n.json,r=i.textures[e];if(!r.extensions||!r.extensions[t])return null;const o=r.extensions[t],a=i.images[o.source];let c=n.textureLoader;if(a.uri){const u=n.options.manager.getHandler(a.uri);u!==null&&(c=u)}return this.detectSupport().then(function(u){if(u)return n.loadTextureImage(e,o.source,c);if(i.extensionsRequired&&i.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: WebP required by asset but unsupported.");return n.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){const t=new Image;t.src="data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",t.onload=t.onerror=function(){e(t.height===1)}})),this.isSupported}}class dT{constructor(e){this.parser=e,this.name=We.EXT_TEXTURE_AVIF,this.isSupported=null}loadTexture(e){const t=this.name,n=this.parser,i=n.json,r=i.textures[e];if(!r.extensions||!r.extensions[t])return null;const o=r.extensions[t],a=i.images[o.source];let c=n.textureLoader;if(a.uri){const u=n.options.manager.getHandler(a.uri);u!==null&&(c=u)}return this.detectSupport().then(function(u){if(u)return n.loadTextureImage(e,o.source,c);if(i.extensionsRequired&&i.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: AVIF required by asset but unsupported.");return n.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){const t=new Image;t.src="data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=",t.onload=t.onerror=function(){e(t.height===1)}})),this.isSupported}}class fT{constructor(e){this.name=We.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){const t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){const i=n.extensions[this.name],r=this.parser.getDependency("buffer",i.buffer),o=this.parser.options.meshoptDecoder;if(!o||!o.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return r.then(function(a){const c=i.byteOffset||0,u=i.byteLength||0,d=i.count,l=i.byteStride,h=new Uint8Array(a,c,u);return o.decodeGltfBufferAsync?o.decodeGltfBufferAsync(d,l,h,i.mode,i.filter).then(function(f){return f.buffer}):o.ready.then(function(){const f=new ArrayBuffer(d*l);return o.decodeGltfBuffer(new Uint8Array(f),d,l,h,i.mode,i.filter),f})})}else return null}}class pT{constructor(e){this.name=We.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){const t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;const i=t.meshes[n.mesh];for(const u of i.primitives)if(u.mode!==Un.TRIANGLES&&u.mode!==Un.TRIANGLE_STRIP&&u.mode!==Un.TRIANGLE_FAN&&u.mode!==void 0)return null;const o=n.extensions[this.name].attributes,a=[],c={};for(const u in o)a.push(this.parser.getDependency("accessor",o[u]).then(d=>(c[u]=d,c[u])));return a.length<1?null:(a.push(this.parser.createNodeMesh(e)),Promise.all(a).then(u=>{const d=u.pop(),l=d.isGroup?d.children:[d],h=u[0].count,f=[];for(const g of l){const v=new Ce,m=new L,p=new rs,x=new L(1,1,1),_=new $a(g.geometry,g.material,h);for(let S=0;S<h;S++)c.TRANSLATION&&m.fromBufferAttribute(c.TRANSLATION,S),c.ROTATION&&p.fromBufferAttribute(c.ROTATION,S),c.SCALE&&x.fromBufferAttribute(c.SCALE,S),_.setMatrixAt(S,v.compose(m,p,x));for(const S in c)if(S==="_COLOR_0"){const M=c[S];_.instanceColor=new un(M.array,M.itemSize,M.normalized)}else S!=="TRANSLATION"&&S!=="ROTATION"&&S!=="SCALE"&&g.geometry.setAttribute(S,c[S]);St.prototype.copy.call(_,g),this.parser.assignFinalMaterial(_),f.push(_)}return d.isGroup?(d.clear(),d.add(...f),d):f[0]}))}}const tg="glTF",Kr=12,mf={JSON:1313821514,BIN:5130562};class mT{constructor(e){this.name=We.KHR_BINARY_GLTF,this.content=null,this.body=null;const t=new DataView(e,0,Kr),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==tg)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");const i=this.header.length-Kr,r=new DataView(e,Kr);let o=0;for(;o<i;){const a=r.getUint32(o,!0);o+=4;const c=r.getUint32(o,!0);if(o+=4,c===mf.JSON){const u=new Uint8Array(e,Kr+o,a);this.content=n.decode(u)}else if(c===mf.BIN){const u=Kr+o;this.body=e.slice(u,u+a)}o+=a}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}}class gT{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=We.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){const n=this.json,i=this.dracoLoader,r=e.extensions[this.name].bufferView,o=e.extensions[this.name].attributes,a={},c={},u={};for(const d in o){const l=Wc[d]||d.toLowerCase();a[l]=o[d]}for(const d in e.attributes){const l=Wc[d]||d.toLowerCase();if(o[d]!==void 0){const h=n.accessors[e.attributes[d]],f=dr[h.componentType];u[l]=f.name,c[l]=h.normalized===!0}}return t.getDependency("bufferView",r).then(function(d){return new Promise(function(l,h){i.decodeDracoFile(d,function(f){for(const g in f.attributes){const v=f.attributes[g],m=c[g];m!==void 0&&(v.normalized=m)}l(f)},a,u,$t,h)})})}}class vT{constructor(){this.name=We.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0||(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}}class _T{constructor(){this.name=We.KHR_MESH_QUANTIZATION}}class ng extends Do{constructor(e,t,n,i){super(e,t,n,i)}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i*3+i;for(let o=0;o!==i;o++)t[o]=n[r+o];return t}interpolate_(e,t,n,i){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=a*2,u=a*3,d=i-t,l=(n-t)/d,h=l*l,f=h*l,g=e*u,v=g-u,m=-2*f+3*h,p=f-h,x=1-m,_=p-h+l;for(let S=0;S!==a;S++){const M=o[v+S+a],E=o[v+S+c]*d,w=o[g+S+a],C=o[g+S]*d;r[S]=x*M+_*E+m*w+p*C}return r}}const xT=new rs;class yT extends ng{interpolate_(e,t,n,i){const r=super.interpolate_(e,t,n,i);return xT.fromArray(r).normalize().toArray(r),r}}const Un={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},dr={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},gf={9728:cn,9729:jt,9984:pm,9985:va,9986:eo,9987:wi},vf={33071:ai,33648:vo,10497:ci},ac={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},Wc={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},Bi={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},ST={CUBICSPLINE:void 0,LINEAR:Sr,STEP:xo},lc={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function bT(s){return s.DefaultMaterial===void 0&&(s.DefaultMaterial=new Ao({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:Ri})),s.DefaultMaterial}function ms(s,e,t){for(const n in t.extensions)s[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function Vi(s,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(s.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function MT(s,e,t){let n=!1,i=!1,r=!1;for(let u=0,d=e.length;u<d;u++){const l=e[u];if(l.POSITION!==void 0&&(n=!0),l.NORMAL!==void 0&&(i=!0),l.COLOR_0!==void 0&&(r=!0),n&&i&&r)break}if(!n&&!i&&!r)return Promise.resolve(s);const o=[],a=[],c=[];for(let u=0,d=e.length;u<d;u++){const l=e[u];if(n){const h=l.POSITION!==void 0?t.getDependency("accessor",l.POSITION):s.attributes.position;o.push(h)}if(i){const h=l.NORMAL!==void 0?t.getDependency("accessor",l.NORMAL):s.attributes.normal;a.push(h)}if(r){const h=l.COLOR_0!==void 0?t.getDependency("accessor",l.COLOR_0):s.attributes.color;c.push(h)}}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(c)]).then(function(u){const d=u[0],l=u[1],h=u[2];return n&&(s.morphAttributes.position=d),i&&(s.morphAttributes.normal=l),r&&(s.morphAttributes.color=h),s.morphTargetsRelative=!0,s})}function ET(s,e){if(s.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)s.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){const t=e.extras.targetNames;if(s.morphTargetInfluences.length===t.length){s.morphTargetDictionary={};for(let n=0,i=t.length;n<i;n++)s.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function wT(s){let e;const t=s.extensions&&s.extensions[We.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+cc(t.attributes):e=s.indices+":"+cc(s.attributes)+":"+s.mode,s.targets!==void 0)for(let n=0,i=s.targets.length;n<i;n++)e+=":"+cc(s.targets[n]);return e}function cc(s){let e="";const t=Object.keys(s).sort();for(let n=0,i=t.length;n<i;n++)e+=t[n]+":"+s[t[n]]+";";return e}function jc(s){switch(s){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function TT(s){return s.search(/\.jpe?g($|\?)/i)>0||s.search(/^data\:image\/jpeg/)===0?"image/jpeg":s.search(/\.webp($|\?)/i)>0||s.search(/^data\:image\/webp/)===0?"image/webp":"image/png"}const AT=new Ce;class DT{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new Kw,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,i=!1,r=-1;typeof navigator<"u"&&(n=/^((?!chrome|android).)*safari/i.test(navigator.userAgent)===!0,i=navigator.userAgent.indexOf("Firefox")>-1,r=i?navigator.userAgent.match(/Firefox\/([0-9]+)\./)[1]:-1),typeof createImageBitmap>"u"||n||i&&r<98?this.textureLoader=new Jm(this.options.manager):this.textureLoader=new Ow(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new Km(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){const n=this,i=this.json,r=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(o){return o._markDefs&&o._markDefs()}),Promise.all(this._invokeAll(function(o){return o.beforeRoot&&o.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(o){const a={scene:o[0][i.scene||0],scenes:o[0],animations:o[1],cameras:o[2],asset:i.asset,parser:n,userData:{}};return ms(r,a,i),Vi(a,i),Promise.all(n._invokeAll(function(c){return c.afterRoot&&c.afterRoot(a)})).then(function(){for(const c of a.scenes)c.updateMatrixWorld();e(a)})}).catch(t)}_markDefs(){const e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let i=0,r=t.length;i<r;i++){const o=t[i].joints;for(let a=0,c=o.length;a<c;a++)e[o[a]].isBone=!0}for(let i=0,r=e.length;i<r;i++){const o=e[i];o.mesh!==void 0&&(this._addNodeRef(this.meshCache,o.mesh),o.skin!==void 0&&(n[o.mesh].isSkinnedMesh=!0)),o.camera!==void 0&&this._addNodeRef(this.cameraCache,o.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;const i=n.clone(),r=(o,a)=>{const c=this.associations.get(o);c!=null&&this.associations.set(a,c);for(const[u,d]of o.children.entries())r(d,a.children[u])};return r(n,i),i.name+="_instance_"+e.uses[t]++,i}_invokeOne(e){const t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){const i=e(t[n]);if(i)return i}return null}_invokeAll(e){const t=Object.values(this.plugins);t.unshift(this);const n=[];for(let i=0;i<t.length;i++){const r=e(t[i]);r&&n.push(r)}return n}getDependency(e,t){const n=e+":"+t;let i=this.cache.get(n);if(!i){switch(e){case"scene":i=this.loadScene(t);break;case"node":i=this._invokeOne(function(r){return r.loadNode&&r.loadNode(t)});break;case"mesh":i=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(t)});break;case"accessor":i=this.loadAccessor(t);break;case"bufferView":i=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(t)});break;case"buffer":i=this.loadBuffer(t);break;case"material":i=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(t)});break;case"texture":i=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(t)});break;case"skin":i=this.loadSkin(t);break;case"animation":i=this._invokeOne(function(r){return r.loadAnimation&&r.loadAnimation(t)});break;case"camera":i=this.loadCamera(t);break;default:if(i=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(e,t)}),!i)throw new Error("Unknown type: "+e);break}this.cache.add(n,i)}return i}getDependencies(e){let t=this.cache.get(e);if(!t){const n=this,i=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(i.map(function(r,o){return n.getDependency(e,o)})),this.cache.add(e,t)}return t}loadBuffer(e){const t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[We.KHR_BINARY_GLTF].body);const i=this.options;return new Promise(function(r,o){n.load(ao.resolveURL(t.uri,i.path),r,void 0,function(){o(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){const t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){const i=t.byteLength||0,r=t.byteOffset||0;return n.slice(r,r+i)})}loadAccessor(e){const t=this,n=this.json,i=this.json.accessors[e];if(i.bufferView===void 0&&i.sparse===void 0){const o=ac[i.type],a=dr[i.componentType],c=i.normalized===!0,u=new a(i.count*o);return Promise.resolve(new It(u,o,c))}const r=[];return i.bufferView!==void 0?r.push(this.getDependency("bufferView",i.bufferView)):r.push(null),i.sparse!==void 0&&(r.push(this.getDependency("bufferView",i.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",i.sparse.values.bufferView))),Promise.all(r).then(function(o){const a=o[0],c=ac[i.type],u=dr[i.componentType],d=u.BYTES_PER_ELEMENT,l=d*c,h=i.byteOffset||0,f=i.bufferView!==void 0?n.bufferViews[i.bufferView].byteStride:void 0,g=i.normalized===!0;let v,m;if(f&&f!==l){const p=Math.floor(h/f),x="InterleavedBuffer:"+i.bufferView+":"+i.componentType+":"+p+":"+i.count;let _=t.cache.get(x);_||(v=new u(a,p*f,i.count*f/d),_=new pw(v,f/d),t.cache.add(x,_)),m=new Mu(_,c,h%f/d,g)}else a===null?v=new u(i.count*c):v=new u(a,h,i.count*c),m=new It(v,c,g);if(i.sparse!==void 0){const p=ac.SCALAR,x=dr[i.sparse.indices.componentType],_=i.sparse.indices.byteOffset||0,S=i.sparse.values.byteOffset||0,M=new x(o[1],_,i.sparse.count*p),E=new u(o[2],S,i.sparse.count*c);a!==null&&(m=new It(m.array.slice(),m.itemSize,m.normalized));for(let w=0,C=M.length;w<C;w++){const y=M[w];if(m.setX(y,E[w*c]),c>=2&&m.setY(y,E[w*c+1]),c>=3&&m.setZ(y,E[w*c+2]),c>=4&&m.setW(y,E[w*c+3]),c>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}}return m})}loadTexture(e){const t=this.json,n=this.options,r=t.textures[e].source,o=t.images[r];let a=this.textureLoader;if(o.uri){const c=n.manager.getHandler(o.uri);c!==null&&(a=c)}return this.loadTextureImage(e,r,a)}loadTextureImage(e,t,n){const i=this,r=this.json,o=r.textures[e],a=r.images[t],c=(a.uri||a.bufferView)+":"+o.sampler;if(this.textureCache[c])return this.textureCache[c];const u=this.loadImageSource(t,n).then(function(d){d.flipY=!1,d.name=o.name||a.name||"",d.name===""&&typeof a.uri=="string"&&a.uri.startsWith("data:image/")===!1&&(d.name=a.uri);const h=(r.samplers||{})[o.sampler]||{};return d.magFilter=gf[h.magFilter]||jt,d.minFilter=gf[h.minFilter]||wi,d.wrapS=vf[h.wrapS]||ci,d.wrapT=vf[h.wrapT]||ci,i.associations.set(d,{textures:e}),d}).catch(function(){return null});return this.textureCache[c]=u,u}loadImageSource(e,t){const n=this,i=this.json,r=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(l=>l.clone());const o=i.images[e],a=self.URL||self.webkitURL;let c=o.uri||"",u=!1;if(o.bufferView!==void 0)c=n.getDependency("bufferView",o.bufferView).then(function(l){u=!0;const h=new Blob([l],{type:o.mimeType});return c=a.createObjectURL(h),c});else if(o.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");const d=Promise.resolve(c).then(function(l){return new Promise(function(h,f){let g=h;t.isImageBitmapLoader===!0&&(g=function(v){const m=new Ut(v);m.needsUpdate=!0,h(m)}),t.load(ao.resolveURL(l,r.path),g,void 0,f)})}).then(function(l){return u===!0&&a.revokeObjectURL(c),l.userData.mimeType=o.mimeType||TT(o.uri),l}).catch(function(l){throw console.error("THREE.GLTFLoader: Couldn't load texture",c),l});return this.sourceCache[e]=d,d}assignTexture(e,t,n,i){const r=this;return this.getDependency("texture",n.index).then(function(o){if(!o)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(o=o.clone(),o.channel=n.texCoord),r.extensions[We.KHR_TEXTURE_TRANSFORM]){const a=n.extensions!==void 0?n.extensions[We.KHR_TEXTURE_TRANSFORM]:void 0;if(a){const c=r.associations.get(o);o=r.extensions[We.KHR_TEXTURE_TRANSFORM].extendTexture(o,a),r.associations.set(o,c)}}return i!==void 0&&(o.colorSpace=i),e[t]=o,o})}assignFinalMaterial(e){const t=e.geometry;let n=e.material;const i=t.attributes.tangent===void 0,r=t.attributes.color!==void 0,o=t.attributes.normal===void 0;if(e.isPoints){const a="PointsMaterial:"+n.uuid;let c=this.cache.get(a);c||(c=new jm,ui.prototype.copy.call(c,n),c.color.copy(n.color),c.map=n.map,c.sizeAttenuation=!1,this.cache.add(a,c)),n=c}else if(e.isLine){const a="LineBasicMaterial:"+n.uuid;let c=this.cache.get(a);c||(c=new Gm,ui.prototype.copy.call(c,n),c.color.copy(n.color),c.map=n.map,this.cache.add(a,c)),n=c}if(i||r||o){let a="ClonedMaterial:"+n.uuid+":";i&&(a+="derivative-tangents:"),r&&(a+="vertex-colors:"),o&&(a+="flat-shading:");let c=this.cache.get(a);c||(c=n.clone(),r&&(c.vertexColors=!0),o&&(c.flatShading=!0),i&&(c.normalScale&&(c.normalScale.y*=-1),c.clearcoatNormalScale&&(c.clearcoatNormalScale.y*=-1)),this.cache.add(a,c),this.associations.set(c,this.associations.get(n))),n=c}e.material=n}getMaterialType(){return Ao}loadMaterial(e){const t=this,n=this.json,i=this.extensions,r=n.materials[e];let o;const a={},c=r.extensions||{},u=[];if(c[We.KHR_MATERIALS_UNLIT]){const l=i[We.KHR_MATERIALS_UNLIT];o=l.getMaterialType(),u.push(l.extendParams(a,r,t))}else{const l=r.pbrMetallicRoughness||{};if(a.color=new ye(1,1,1),a.opacity=1,Array.isArray(l.baseColorFactor)){const h=l.baseColorFactor;a.color.setRGB(h[0],h[1],h[2],$t),a.opacity=h[3]}l.baseColorTexture!==void 0&&u.push(t.assignTexture(a,"map",l.baseColorTexture,Gt)),a.metalness=l.metallicFactor!==void 0?l.metallicFactor:1,a.roughness=l.roughnessFactor!==void 0?l.roughnessFactor:1,l.metallicRoughnessTexture!==void 0&&(u.push(t.assignTexture(a,"metalnessMap",l.metallicRoughnessTexture)),u.push(t.assignTexture(a,"roughnessMap",l.metallicRoughnessTexture))),o=this._invokeOne(function(h){return h.getMaterialType&&h.getMaterialType(e)}),u.push(Promise.all(this._invokeAll(function(h){return h.extendMaterialParams&&h.extendMaterialParams(e,a)})))}r.doubleSided===!0&&(a.side=si);const d=r.alphaMode||lc.OPAQUE;if(d===lc.BLEND?(a.transparent=!0,a.depthWrite=!1):(a.transparent=!1,d===lc.MASK&&(a.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&o!==Ai&&(u.push(t.assignTexture(a,"normalMap",r.normalTexture)),a.normalScale=new Q(1,1),r.normalTexture.scale!==void 0)){const l=r.normalTexture.scale;a.normalScale.set(l,l)}if(r.occlusionTexture!==void 0&&o!==Ai&&(u.push(t.assignTexture(a,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(a.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&o!==Ai){const l=r.emissiveFactor;a.emissive=new ye().setRGB(l[0],l[1],l[2],$t)}return r.emissiveTexture!==void 0&&o!==Ai&&u.push(t.assignTexture(a,"emissiveMap",r.emissiveTexture,Gt)),Promise.all(u).then(function(){const l=new o(a);return r.name&&(l.name=r.name),Vi(l,r),t.associations.set(l,{materials:e}),r.extensions&&ms(i,l,r),l})}createUniqueName(e){const t=it.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){const t=this,n=this.extensions,i=this.primitiveCache;function r(a){return n[We.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(a,t).then(function(c){return _f(c,a,t)})}const o=[];for(let a=0,c=e.length;a<c;a++){const u=e[a],d=wT(u),l=i[d];if(l)o.push(l.promise);else{let h;u.extensions&&u.extensions[We.KHR_DRACO_MESH_COMPRESSION]?h=r(u):h=_f(new Vt,u,t),i[d]={primitive:u,promise:h},o.push(h)}}return Promise.all(o)}loadMesh(e){const t=this,n=this.json,i=this.extensions,r=n.meshes[e],o=r.primitives,a=[];for(let c=0,u=o.length;c<u;c++){const d=o[c].material===void 0?bT(this.cache):this.getDependency("material",o[c].material);a.push(d)}return a.push(t.loadGeometries(o)),Promise.all(a).then(function(c){const u=c.slice(0,c.length-1),d=c[c.length-1],l=[];for(let f=0,g=d.length;f<g;f++){const v=d[f],m=o[f];let p;const x=u[f];if(m.mode===Un.TRIANGLES||m.mode===Un.TRIANGLE_STRIP||m.mode===Un.TRIANGLE_FAN||m.mode===void 0)p=r.isSkinnedMesh===!0?new gw(v,x):new at(v,x),p.isSkinnedMesh===!0&&p.normalizeSkinWeights(),m.mode===Un.TRIANGLE_STRIP?p.geometry=pf(p.geometry,Mm):m.mode===Un.TRIANGLE_FAN&&(p.geometry=pf(p.geometry,Bc));else if(m.mode===Un.LINES)p=new Wm(v,x);else if(m.mode===Un.LINE_STRIP)p=new wu(v,x);else if(m.mode===Un.LINE_LOOP)p=new xw(v,x);else if(m.mode===Un.POINTS)p=new yw(v,x);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+m.mode);Object.keys(p.geometry.morphAttributes).length>0&&ET(p,r),p.name=t.createUniqueName(r.name||"mesh_"+e),Vi(p,r),m.extensions&&ms(i,p,m),t.assignFinalMaterial(p),l.push(p)}for(let f=0,g=l.length;f<g;f++)t.associations.set(l[f],{meshes:e,primitives:f});if(l.length===1)return r.extensions&&ms(i,l[0],r),l[0];const h=new rt;r.extensions&&ms(i,h,r),t.associations.set(h,{meshes:e});for(let f=0,g=l.length;f<g;f++)h.add(l[f]);return h})}loadCamera(e){let t;const n=this.json.cameras[e],i=n[n.type];if(!i){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new Wt(_a.radToDeg(i.yfov),i.aspectRatio||1,i.znear||1,i.zfar||2e6):n.type==="orthographic"&&(t=new Kn(-i.xmag,i.xmag,i.ymag,-i.ymag,i.znear,i.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),Vi(t,n),Promise.resolve(t)}loadSkin(e){const t=this.json.skins[e],n=[];for(let i=0,r=t.joints.length;i<r;i++)n.push(this._loadNodeShallow(t.joints[i]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(i){const r=i.pop(),o=i,a=[],c=[];for(let u=0,d=o.length;u<d;u++){const l=o[u];if(l){a.push(l);const h=new Ce;r!==null&&h.fromArray(r.array,u*16),c.push(h)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[u])}return new Eu(a,c)})}loadAnimation(e){const t=this.json,n=this,i=t.animations[e],r=i.name?i.name:"animation_"+e,o=[],a=[],c=[],u=[],d=[];for(let l=0,h=i.channels.length;l<h;l++){const f=i.channels[l],g=i.samplers[f.sampler],v=f.target,m=v.node,p=i.parameters!==void 0?i.parameters[g.input]:g.input,x=i.parameters!==void 0?i.parameters[g.output]:g.output;v.node!==void 0&&(o.push(this.getDependency("node",m)),a.push(this.getDependency("accessor",p)),c.push(this.getDependency("accessor",x)),u.push(g),d.push(v))}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(c),Promise.all(u),Promise.all(d)]).then(function(l){const h=l[0],f=l[1],g=l[2],v=l[3],m=l[4],p=[];for(let x=0,_=h.length;x<_;x++){const S=h[x],M=f[x],E=g[x],w=v[x],C=m[x];if(S===void 0)continue;S.updateMatrix&&S.updateMatrix();const y=n._createAnimationTracks(S,M,E,w,C);if(y)for(let b=0;b<y.length;b++)p.push(y[b])}return new Aw(r,void 0,p)})}createNodeMesh(e){const t=this.json,n=this,i=t.nodes[e];return i.mesh===void 0?null:n.getDependency("mesh",i.mesh).then(function(r){const o=n._getNodeRef(n.meshCache,i.mesh,r);return i.weights!==void 0&&o.traverse(function(a){if(a.isMesh)for(let c=0,u=i.weights.length;c<u;c++)a.morphTargetInfluences[c]=i.weights[c]}),o})}loadNode(e){const t=this.json,n=this,i=t.nodes[e],r=n._loadNodeShallow(e),o=[],a=i.children||[];for(let u=0,d=a.length;u<d;u++)o.push(n.getDependency("node",a[u]));const c=i.skin===void 0?Promise.resolve(null):n.getDependency("skin",i.skin);return Promise.all([r,Promise.all(o),c]).then(function(u){const d=u[0],l=u[1],h=u[2];h!==null&&d.traverse(function(f){f.isSkinnedMesh&&f.bind(h,AT)});for(let f=0,g=l.length;f<g;f++)d.add(l[f]);return d})}_loadNodeShallow(e){const t=this.json,n=this.extensions,i=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];const r=t.nodes[e],o=r.name?i.createUniqueName(r.name):"",a=[],c=i._invokeOne(function(u){return u.createNodeMesh&&u.createNodeMesh(e)});return c&&a.push(c),r.camera!==void 0&&a.push(i.getDependency("camera",r.camera).then(function(u){return i._getNodeRef(i.cameraCache,r.camera,u)})),i._invokeAll(function(u){return u.createNodeAttachment&&u.createNodeAttachment(e)}).forEach(function(u){a.push(u)}),this.nodeCache[e]=Promise.all(a).then(function(u){let d;if(r.isBone===!0?d=new Hm:u.length>1?d=new rt:u.length===1?d=u[0]:d=new St,d!==u[0])for(let l=0,h=u.length;l<h;l++)d.add(u[l]);if(r.name&&(d.userData.name=r.name,d.name=o),Vi(d,r),r.extensions&&ms(n,d,r),r.matrix!==void 0){const l=new Ce;l.fromArray(r.matrix),d.applyMatrix4(l)}else r.translation!==void 0&&d.position.fromArray(r.translation),r.rotation!==void 0&&d.quaternion.fromArray(r.rotation),r.scale!==void 0&&d.scale.fromArray(r.scale);return i.associations.has(d)||i.associations.set(d,{}),i.associations.get(d).nodes=e,d}),this.nodeCache[e]}loadScene(e){const t=this.extensions,n=this.json.scenes[e],i=this,r=new rt;n.name&&(r.name=i.createUniqueName(n.name)),Vi(r,n),n.extensions&&ms(t,r,n);const o=n.nodes||[],a=[];for(let c=0,u=o.length;c<u;c++)a.push(i.getDependency("node",o[c]));return Promise.all(a).then(function(c){for(let d=0,l=c.length;d<l;d++)r.add(c[d]);const u=d=>{const l=new Map;for(const[h,f]of i.associations)(h instanceof ui||h instanceof Ut)&&l.set(h,f);return d.traverse(h=>{const f=i.associations.get(h);f!=null&&l.set(h,f)}),l};return i.associations=u(r),r})}_createAnimationTracks(e,t,n,i,r){const o=[],a=e.name?e.name:e.uuid,c=[];Bi[r.path]===Bi.weights?e.traverse(function(h){h.morphTargetInfluences&&c.push(h.name?h.name:h.uuid)}):c.push(a);let u;switch(Bi[r.path]){case Bi.weights:u=Er;break;case Bi.rotation:u=Ds;break;case Bi.position:case Bi.scale:u=wr;break;default:switch(n.itemSize){case 1:u=Er;break;case 2:case 3:default:u=wr;break}break}const d=i.interpolation!==void 0?ST[i.interpolation]:Sr,l=this._getArrayFromAccessor(n);for(let h=0,f=c.length;h<f;h++){const g=new u(c[h]+"."+Bi[r.path],t.array,l,d);i.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(g),o.push(g)}return o}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){const n=jc(t.constructor),i=new Float32Array(t.length);for(let r=0,o=t.length;r<o;r++)i[r]=t[r]*n;t=i}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){const i=this instanceof Ds?yT:ng;return new i(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}}function CT(s,e,t){const n=e.attributes,i=new Pi;if(n.POSITION!==void 0){const a=t.json.accessors[n.POSITION],c=a.min,u=a.max;if(c!==void 0&&u!==void 0){if(i.set(new L(c[0],c[1],c[2]),new L(u[0],u[1],u[2])),a.normalized){const d=jc(dr[a.componentType]);i.min.multiplyScalar(d),i.max.multiplyScalar(d)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;const r=e.targets;if(r!==void 0){const a=new L,c=new L;for(let u=0,d=r.length;u<d;u++){const l=r[u];if(l.POSITION!==void 0){const h=t.json.accessors[l.POSITION],f=h.min,g=h.max;if(f!==void 0&&g!==void 0){if(c.setX(Math.max(Math.abs(f[0]),Math.abs(g[0]))),c.setY(Math.max(Math.abs(f[1]),Math.abs(g[1]))),c.setZ(Math.max(Math.abs(f[2]),Math.abs(g[2]))),h.normalized){const v=jc(dr[h.componentType]);c.multiplyScalar(v)}a.max(c)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}i.expandByVector(a)}s.boundingBox=i;const o=new fi;i.getCenter(o.center),o.radius=i.min.distanceTo(i.max)/2,s.boundingSphere=o}function _f(s,e,t){const n=e.attributes,i=[];function r(o,a){return t.getDependency("accessor",o).then(function(c){s.setAttribute(a,c)})}for(const o in n){const a=Wc[o]||o.toLowerCase();a in s.attributes||i.push(r(n[o],a))}if(e.indices!==void 0&&!s.index){const o=t.getDependency("accessor",e.indices).then(function(a){s.setIndex(a)});i.push(o)}return Je.workingColorSpace!==$t&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${Je.workingColorSpace}" not supported.`),Vi(s,e),CT(s,e,t),Promise.all(i).then(function(){return e.targets!==void 0?MT(s,e.targets,t):s})}const xf=await gc("projects");class is{static getProjects(){return xf.filter(e=>e.data.active!==!1).sort((e,t)=>Date.parse(t.data.date)-Date.parse(e.data.date))}static getProjectById(e){return xf.find(t=>t.id===e)}static getNextProject(e){const t=this.getProjects();let n=t[t.findIndex(i=>i.id===e)+1];return n===void 0&&(n=t[0]),n}}class Xt{static path="/assets/";static thumbsReady=new Promise(e=>{this.thumbsReadyResolve=e});static async init(){this.initLoaders(),this.preloadTextures()}static loadImage=e=>this.textureLoader.loadAsync(e);static loadTexture=e=>this.textureLoader.load(e);static loadVideo=e=>{let t;const n=new Promise(o=>{t=o}),i=Object.assign(document.createElement("video"),{src:typeof e=="string"&&e||void 0,crossOrigin:"Anonymous",muted:!0,loop:!0,start:!0,playsInline:!0});i.addEventListener("loadedmetadata",()=>{i.play(),t(r)});const r=new Xm(i);return n};static loadGLTF=e=>this.gltfLoader.loadAsync(e);static initLoaders(){this.textureLoader=new Jm,this.gltfLoader=new Yw}static getPath(e){return this.path+e}static preloadTextures(){const e=Le.WEBP?"webp":"jpg";this.blueNoise=this.loadTexture("/images/textures/blue-noise.png"),this.blueNoise.wrapS=this.blueNoise.wrapT=ci,this.floorNormal=this.loadTexture(`/images/textures/floor-normal.${e}`),this.floorNormal.wrapS=this.floorNormal.wrapT=ci,this.perlin1=this.loadTexture(`/images/textures/perlin-1.${e}`),this.perlin1.wrapS=this.perlin1.wrapT=vo,this.perlin2=this.loadTexture(`/images/textures/perlin-2.${e}`),this.perlin2.wrapS=this.perlin2.wrapT=ci}static preloadThumbs(){this.characterModel=this.loadGLTF("/models/me/me.gltf"),this.projectThumbs=[],is.getProjects().forEach(t=>{this.projectThumbs.push({id:t.id,src:this[t.data.thumbnail.type==="mp4"?"loadVideo":"loadImage"](`/images/thumbs/${t.data.thumbnail.src}.${t.data.thumbnail.type||Le.WEBP?"webp":"jpg"}`)})}),this.thumbsReadyResolve()}static getProjectThumbById(e){return this.projectThumbs.find(t=>t.id===e)}}function fn(s=0){return new Promise(function(e){setTimeout(e,s)})}class Ya extends Wt{constructor(e){super(e)}resize(){this.updateProjectionMatrix()}}const RT=Math.PI/180;function uc(s,e,t,n,i){return n+(s-e)*(i-n)/(t-e)}function zn(s,e,t){return(1-t)*s+t*e}function yf(s,e,t,n){return zn(s,e,1-Math.exp(-t*n))}function Xc(s){return s*RT}function Fa(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function PT(s,e,t){return Fn((1-t)*s+t*e)}function Yi(s,e,t,n){return PT(s,e,1-Math.exp(-t*n))}function LT(s,e){return(s%e+e)%e}function bo(s,e,t){return Fn(Math.min(Math.max(e,s),t))}function Cs(s,e,t,n,i,r){const o=(s-e)*(i-n)/(t-e)+n;if(r!==null&&r){const a=n>i?n:i,c=n>i?i:n;return bo(o,c,a)}return Fn(o)}function Fn(s,e=4){const t=Math.pow(10,e);return Math.round(s*t)/t}class IT{constructor(e){this.params={lookAt:new L(0,0,0),camera:new Wt(45,innerWidth/innerHeight,1,2e3)},Object.assign(this.params,e),this.camera=this.params.camera,this.mouse=new Q,this.last=new Q,this.delta=new Q,this.mouse.set(document.documentElement.clientWidth/2,document.documentElement.clientHeight/2),this.last.copy(this.mouse),this.scrollVelocity=0,this.group=new rt,this.rotateGroup=new rt,this.innerGroup=new rt,this.rotateGroup.add(this.innerGroup),this.group.add(this.rotateGroup),this.group.matrixAutoUpdate=!1,this.rotateGroup.matrixAutoUpdate=!1,this.innerGroup.matrixAutoUpdate=!1,this.rotateGroup.rotation.y=Math.PI,this.lookAt=this.params.lookAt,this.origin=new L,this.target=new L,this.targetXY=new Q(1,.5),this.deltaTime=.01,this.group.position.copy(this.camera.position),this.updateOrigin(),this.rotation=0,this.rotateAngle=Xc(20),this.lerpSpeed=1,this.lerpSpeed2=.01,this.zoomSmoothing=.01,this.enabled=!0,this.origin.z=this.group.position.z,this.addListeners()}updateOrigin(e=this.camera.position){this.origin.copy(e)}updateTarget(e=this.lookAt){this.lookAt.copy(e)}updateZoomSmoothing(e=this.zoomSmoothing){this.zoomSmoothing=e}addListeners(){window.addEventListener("pointerdown",this.onPointerDown),window.addEventListener("pointermove",this.onPointerMove),window.addEventListener("pointerup",this.onPointerUp)}onPointerDown=e=>{this.onPointerMove(e)};onPointerMove=({clientX:e,clientY:t})=>{this.enabled&&this.mouse.set(e,t)};onPointerUp=e=>{this.onPointerMove(e)};resize=(e,t)=>{this.camera.aspect=e/t,this.camera.updateProjectionMatrix(),this.group.lookAt(this.lookAt)};update=(e,t,n,i)=>{if(!this.enabled)return;const{w:r,h:o}=Pe,a=i!==void 0?Math.min(Fn(2/(i/60),0),2)*.01:.01;this.delta.subVectors(this.mouse,this.last),this.last.copy(this.mouse);const c=uc(this.mouse.x,0,r,-1,1),u=uc(this.mouse.y,0,o,1,-1);this.target.x=this.origin.x+this.targetXY.x*c,this.target.y=this.origin.y+this.targetXY.y*u,this.target.z=this.origin.z+this.targetXY.y*(u*1.25),this.group.position.lerp(this.target,a),this.group.lookAt(this.lookAt);const d=uc(Math.abs(this.delta.x)/r,0,.02,0,.5);this.rotation+=(this.rotateAngle*d*Math.sign(this.delta.x)-this.rotation)*a,this.rotateGroup.rotation.z+=(this.rotation-this.rotateGroup.rotation.z)*a,this.updateCamera()};updateCamera=()=>{this.group.updateMatrix(),this.rotateGroup.updateMatrix(),this.innerGroup.updateMatrix(),this.group.updateMatrixWorld(),this.innerGroup.matrixWorld.decompose(this.camera.position,this.camera.quaternion,this.camera.scale)};animateIn=()=>{this.enabled=!0}}const UT=`
precision mediump float;
uniform sampler2D tMap;
uniform vec2 uResolution;
in vec2 v_rgbNW;
in vec2 v_rgbNE;
in vec2 v_rgbSW;
in vec2 v_rgbSE;
in vec2 v_rgbM;
in vec2 vUv;
out vec4 FragColor;
#ifndef FXAA_REDUCE_MIN
    #define FXAA_REDUCE_MIN   (1.0/ 128.0)
#endif
#ifndef FXAA_REDUCE_MUL
    #define FXAA_REDUCE_MUL   (1.0 / 8.0)
#endif
#ifndef FXAA_SPAN_MAX
    #define FXAA_SPAN_MAX     8.0
#endif
vec4 fxaa(sampler2D tex, vec2 fragCoord, vec2 resolution,
            vec2 v_rgbNW, vec2 v_rgbNE,
            vec2 v_rgbSW, vec2 v_rgbSE,
            vec2 v_rgbM) {
    vec4 color;
    mediump vec2 inverseVP = vec2(1.0 / resolution.x, 1.0 / resolution.y);
    vec3 rgbNW = texture(tex, v_rgbNW).xyz;
    vec3 rgbNE = texture(tex, v_rgbNE).xyz;
    vec3 rgbSW = texture(tex, v_rgbSW).xyz;
    vec3 rgbSE = texture(tex, v_rgbSE).xyz;
    vec4 texColor = texture(tex, v_rgbM);
    vec3 rgbM  = texColor.xyz;
    vec3 luma = vec3(0.299, 0.587, 0.114);
    float lumaNW = dot(rgbNW, luma);
    float lumaNE = dot(rgbNE, luma);
    float lumaSW = dot(rgbSW, luma);
    float lumaSE = dot(rgbSE, luma);
    float lumaM  = dot(rgbM,  luma);
    float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
    float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));
    mediump vec2 dir;
    dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
    dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));
    float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) *
                          (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);
    float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
    dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX),
              max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),
              dir * rcpDirMin)) * inverseVP;
    vec3 rgbA = 0.5 * (
        texture(tex, fragCoord * inverseVP + dir * (1.0 / 3.0 - 0.5)).xyz +
        texture(tex, fragCoord * inverseVP + dir * (2.0 / 3.0 - 0.5)).xyz);
    vec3 rgbB = rgbA * 0.5 + 0.25 * (
        texture(tex, fragCoord * inverseVP + dir * -0.5).xyz +
        texture(tex, fragCoord * inverseVP + dir * 0.5).xyz);
    float lumaB = dot(rgbB, luma);
    if ((lumaB < lumaMin) || (lumaB > lumaMax)) {
        color = vec4(rgbA, texColor.a);
    } else {
        color = vec4(rgbB, texColor.a);
    }
    return color;
}
void main() {
    FragColor = fxaa(tMap, vUv * uResolution, uResolution, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);
}
`,FT=`
precision mediump float;
in vec3 position;
in vec2 uv;
uniform vec2 uResolution;
out vec2 v_rgbNW;
out vec2 v_rgbNE;
out vec2 v_rgbSW;
out vec2 v_rgbSE;
out vec2 v_rgbM;
out vec2 vUv;
void main() {
    vUv = uv;
    vec2 fragCoord = uv * uResolution;
    vec2 inverseVP = 1.0 / uResolution.xy;
    v_rgbNW = (fragCoord + vec2(-1.0, -1.0)) * inverseVP;
    v_rgbNE = (fragCoord + vec2(1.0, -1.0)) * inverseVP;
    v_rgbSW = (fragCoord + vec2(-1.0, 1.0)) * inverseVP;
    v_rgbSE = (fragCoord + vec2(1.0, 1.0)) * inverseVP;
    v_rgbM = vec2(fragCoord * inverseVP);
    gl_Position = vec4(position, 1.0);
}
`;class ig extends mt{constructor(){super({glslVersion:lt,uniforms:{tMap:new I(null),uResolution:new I(new Q)},vertexShader:FT,fragmentShader:UT,blending:ot,depthWrite:!1,depthTest:!1})}}const NT=`
precision mediump float;
uniform sampler2D tMap;
uniform float uThreshold;
uniform float uSmoothing;
in vec2 vUv;
out vec4 FragColor;
void main() {
    vec4 texel = texture(tMap, vUv);
    vec3 luma = vec3(0.299, 0.587, 0.114);
    float v = dot(texel.xyz, luma);
    float alpha = smoothstep(uThreshold, uThreshold + uSmoothing, v);
    FragColor = mix(vec4(0), texel, alpha);
}
`,OT=`
in vec3 position;
in vec2 uv;
out vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}
`;class sg extends mt{constructor(){super({glslVersion:lt,uniforms:{tMap:new I(null),uThreshold:new I(1),uSmoothing:new I(1)},vertexShader:OT,fragmentShader:NT,blending:ot,depthWrite:!1,depthTest:!1})}}const kT=`
precision mediump float;
uniform sampler2D tMap;
uniform vec2 uDirection;
uniform vec2 uResolution;
in vec2 vUv;
out vec4 FragColor;
float gaussianPdf(float x, float sigma) {
    return 0.39894 * exp(-0.5 * x * x / (sigma * sigma)) / sigma;
}
vec4 blur(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
    vec2 invSize = 1.0 / resolution;
    float fSigma = float(SIGMA);
    float weightSum = gaussianPdf(0.0, fSigma);
    vec3 diffuseSum = texture(image, uv).rgb * weightSum;
    for (int i = 1; i < KERNEL_RADIUS; i++) {
        float x = float(i);
        float w = gaussianPdf(x, fSigma);
        vec2 uvOffset = direction * invSize * x;
        vec3 sample1 = texture(image, uv + uvOffset).rgb;
        vec3 sample2 = texture(image, uv - uvOffset).rgb;
        diffuseSum += (sample1 + sample2) * w;
        weightSum += 2.0 * w;
    }
    return vec4(diffuseSum / weightSum, 1.0);
}
void main() {
    FragColor = blur(tMap, vUv, uResolution, uDirection);
}
`,BT=`
precision mediump float;
in vec3 position;
in vec2 uv;
out vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}
`;class rg extends mt{constructor(e){super({glslVersion:lt,defines:{KERNEL_RADIUS:e,SIGMA:e},uniforms:{tMap:new I(null),tDetail:new I(null),tOverview:new I(null),tOverviewMask:new I(null),uDirection:new I(new Q(.5,.5)),uResolution:new I(new Q)},vertexShader:BT,fragmentShader:kT,blending:ot,depthWrite:!1,depthTest:!1})}}const og=`
vec4 blur(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec4 sum = vec4(0.0);
  vec2 pixel = 1.0 / resolution;
  sum += texture(image, uv - 4.0 * pixel * direction) * 0.051;
  sum += texture(image, uv - 3.0 * pixel * direction) * 0.0918;
  sum += texture(image, uv - 2.0 * pixel * direction) * 0.12245;
  sum += texture(image, uv - 1.0 * pixel * direction) * 0.1531;
  sum += texture(image, uv) * 0.1633;
  sum += texture(image, uv + 1.0 * pixel * direction) * 0.1531;
  sum += texture(image, uv + 2.0 * pixel * direction) * 0.12245;
  sum += texture(image, uv + 3.0 * pixel * direction) * 0.0918;
  sum += texture(image, uv + 4.0 * pixel * direction) * 0.051;
  return sum;
}
`,zT=`
precision highp float;

${og}

uniform sampler2D tMap;
uniform float uBluriness;
uniform vec2 uDirection;
uniform vec2 uResolution;
in vec2 vUv;
out vec4 FragColor;

void main() {
  FragColor = blur(tMap, vUv, uResolution, uBluriness * uDirection);
}
`,HT=`
in vec3 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;class Na extends mt{constructor(e=new Q(.5,.5)){super({glslVersion:lt,uniforms:{tMap:new I(null),uBluriness:new I(0),uDirection:new I(e),uResolution:new I(new Q)},vertexShader:HT,fragmentShader:zT,blending:ot,depthWrite:!1,depthTest:!1})}}class Ir{constructor(e){this.props=e,this.renderer=e.renderer,this.scene=new To,this.camera=new _u}init(){this.geometry=new Rn(2-this.props.cellScale.x*2,2-this.props.cellScale.y*2),this.mesh=new at(this.geometry,this.material),this.scene.add(this.mesh)}update(){this.renderer.setRenderTarget(this.output),this.renderer.render(this.scene,this.camera)}}const Co=`precision mediump float;
#define GLSLIFY 1
in vec3 position;in vec2 uv;uniform vec2 px;uniform vec2 bounds;out vec2 vUv;void main(){vec3 pos=position;vec2 scale=1.0-bounds*2.0;pos.xy=pos.xy*scale;vUv=vec2(0.5)+(pos.xy)*0.5;gl_Position=vec4(pos,1.0);}`,VT=`precision mediump float;
#define GLSLIFY 1
in vec3 position;in vec2 uv;uniform vec2 px;out vec2 vUv;void main(){vec3 pos=position;vUv=0.5+pos.xy*0.5;vec2 n=sign(pos.xy);pos.xy=abs(pos.xy)-px*1.0;pos.xy*=n;gl_Position=vec4(pos,1.0);}`,Sf=`precision mediump float;
#define GLSLIFY 1
uniform sampler2D velocity;uniform float dt;uniform vec2 fboSize;in vec2 vUv;out vec4 FragColor;void main(){vec2 ratio=max(fboSize.x,fboSize.y)/fboSize;vec2 spot_new=vUv;vec2 vel_old=texture(velocity,vUv).xy;vec2 spot_old=spot_new-vel_old*dt*ratio;vec2 vel_new1=texture(velocity,spot_old).xy;vec2 spot_new2=spot_old+vel_new1*dt*ratio;vec2 error=spot_new2-spot_new;vec2 spot_new3=spot_new-error/2.0;vec2 vel_2=texture(velocity,spot_new3).xy;vec2 spot_old2=spot_new3-vel_2*dt*ratio;vec2 newVel2=texture(velocity,spot_old2).xy;FragColor=vec4(newVel2,0.0,0.0);}`;class GT extends Ir{constructor(e){super(e),this.uniforms={bounds:{value:e.cellScale},px:{value:e.cellScale},fboSize:{value:e.fboSize},velocity:{value:e.src.texture},dt:{value:e.delta}},this.material=new mt({glslVersion:lt,blending:ot,depthWrite:!1,depthTest:!1,vertexShader:Co,fragmentShader:Sf,uniforms:this.uniforms}),this.output=e.dst,this.init()}init(){super.init(),this.createBounds()}createBounds(){const e=new Vt,t=new Float32Array([-1,-1,0,-1,1,0,-1,1,0,1,1,0,1,1,0,1,-1,0,1,-1,0,-1,-1,0]);e.setAttribute("position",new It(t,3));const n=new mt({glslVersion:lt,blending:ot,depthWrite:!1,depthTest:!1,vertexShader:VT,fragmentShader:Sf,uniforms:this.uniforms});this.line=new Wm(e,n),this.scene.add(this.line)}}const WT=`precision mediump float;
#define GLSLIFY 1
uniform sampler2D velocity;uniform float dt;uniform vec2 px;in vec2 vUv;out vec4 FragColor;void main(){float x0=texture(velocity,vUv-vec2(px.x,0)).x;float x1=texture(velocity,vUv+vec2(px.x,0)).x;float y0=texture(velocity,vUv-vec2(0,px.y)).y;float y1=texture(velocity,vUv+vec2(0,px.y)).y;float divergence=(x1-x0+y1-y0)/2.0;FragColor=vec4(divergence/dt);}`;class jT extends Ir{constructor(e){super(e),this.material=new mt({glslVersion:lt,depthWrite:!1,depthTest:!1,blending:ot,vertexShader:Co,fragmentShader:WT,uniforms:{bounds:{value:e.bounds},velocity:{value:e.src.texture},px:{value:e.cellScale},dt:{value:e.delta}}}),this.output=e.dst,this.init()}update(e){this.material.uniforms.velocity.value=e.texture,super.update()}}const XT=`precision mediump float;
#define GLSLIFY 1
in vec3 position;in vec2 uv;uniform vec2 center;uniform vec2 scale;uniform vec2 px;out vec2 vUv;void main(){vec2 pos=position.xy*scale*2.0*px+center;vUv=uv;gl_Position=vec4(pos,0.0,1.0);}`,$T=`precision mediump float;
#define GLSLIFY 1
uniform vec2 force;uniform vec2 center;uniform vec2 scale;uniform vec2 px;in vec2 vUv;out vec4 FragColor;void main(){vec2 circle=(vUv-0.5)*2.0;float d=1.0-min(length(circle),1.0);d*=d;FragColor=vec4(force*d,0,1);}`;class qT extends Ir{constructor(e){super(e),this.init(),this.output=e.dst,this.mouse={coords:new Q,coordsOld:new Q,diff:new Q}}init(){const{cursorSize:e,cellScale:t}=this.props;this.geometry=new Rn(2,2),this.material=new mt({glslVersion:lt,depthWrite:!1,depthTest:!1,vertexShader:XT,fragmentShader:$T,blending:Uc,uniforms:{px:{value:t},force:{value:new Q(0,0)},center:{value:new Q(0,0)},scale:{value:new Q(e,e)}}}),this.mesh=new at(this.geometry,this.material),this.scene.add(this.mesh),this.addEvents()}addEvents(){pe.on(xe.MOUSE_MOVE,this.onMouseMove.bind(this))}onMouseMove({x:e,y:t}){this.mouse.coords.set(e/Pe.w*2-1,-(t/Pe.h)*2+1)}updateMouseDiff(){this.mouse.diff.subVectors(this.mouse.coords,this.mouse.coordsOld),this.mouse.coordsOld.copy(this.mouse.coords),this.mouse.coordsOld.x===0&&this.mouse.coordsOld.y===0&&this.mouse.diff.set(0,0)}update(){this.updateMouseDiff();const{cellScale:e,mouseForce:t,cursorSize:n}=this.props,i=this.mouse.diff.x/2*t,r=this.mouse.diff.y/2*t,o=n*e.x,a=n*e.y,c=Math.min(Math.max(this.mouse.coords.x,-1+o+e.x*2),1-o-e.x*2),u=Math.min(Math.max(this.mouse.coords.y,-1+a+e.y*2),1-a-e.y*2);this.material.uniforms.force.value.set(i,r),this.material.uniforms.center.value.set(c,u),this.material.uniforms.scale.value.set(n,n),super.update()}}const YT=`precision mediump float;
#define GLSLIFY 1
uniform sampler2D pressure;uniform sampler2D divergence;uniform vec2 px;in vec2 vUv;out vec4 FragColor;void main(){float p0=texture(pressure,vUv+vec2(px.x*2.0,0)).r;float p1=texture(pressure,vUv-vec2(px.x*2.0,0)).r;float p2=texture(pressure,vUv+vec2(0,px.y*2.0)).r;float p3=texture(pressure,vUv-vec2(0,px.y*2.0)).r;float div=texture(divergence,vUv).r;float newP=(p0+p1+p2+p3)/4.0-div;FragColor=vec4(newP);}`;class KT extends Ir{constructor(e){super(e),this.material=new mt({glslVersion:lt,depthWrite:!1,depthTest:!1,blending:ot,vertexShader:Co,fragmentShader:YT,uniforms:{bounds:{value:e.bounds},pressure:{value:e.dst_.texture},divergence:{value:e.src.texture},px:{value:e.cellScale}}}),this.output=e.dst,this.output0=e.dst_,this.output1=e.dst,this.init()}update(){const{poissonIterations:e}=this.props;let t,n;for(let i=0;i<e;i++)i%2==0?(t=this.output0,n=this.output1):(t=this.output1,n=this.output0),this.material.uniforms.pressure.value=t.texture,this.output=n,super.update();return n}}const ZT=`precision mediump float;
#define GLSLIFY 1
uniform sampler2D pressure;uniform sampler2D velocity;uniform float dt;uniform vec2 px;in vec2 vUv;out vec4 FragColor;void main(){float step=1.0;float p0=texture(pressure,vUv+vec2(px.x*step,0)).r;float p1=texture(pressure,vUv-vec2(px.x*step,0)).r;float p2=texture(pressure,vUv+vec2(0,px.y*step)).r;float p3=texture(pressure,vUv-vec2(0,px.y*step)).r;vec2 v=texture(velocity,vUv).xy;vec2 gradP=vec2(p0-p1,p2-p3)*0.5;v=v-dt*gradP;FragColor=vec4(v,0.0,1.0);}`;class JT extends Ir{constructor(e){super(e),this.material=new mt({glslVersion:lt,depthWrite:!1,depthTest:!1,blending:ot,vertexShader:Co,fragmentShader:ZT,uniforms:{bounds:{value:e.bounds},pressure:{value:e.pressure.texture},velocity:{value:e.viscosity.texture},px:{value:e.cellScale},dt:{value:e.delta}}}),this.output=e.dst,this.init()}update({pressure:e,velocity:t}){this.material.uniforms.pressure.value=e.texture,this.material.uniforms.velocity.value=t.texture,super.update()}}const QT=`precision mediump float;
#define GLSLIFY 1
uniform sampler2D velocity;uniform sampler2D velocity_new;uniform float v;uniform vec2 px;uniform float dt;in vec2 vUv;out vec4 FragColor;void main(){vec2 old=texture(velocity,vUv).xy;vec2 new0=texture(velocity_new,vUv+vec2(px.x*2.0,0)).xy;vec2 new1=texture(velocity_new,vUv-vec2(px.x*2.0,0)).xy;vec2 new2=texture(velocity_new,vUv+vec2(0,px.y*2.0)).xy;vec2 new3=texture(velocity_new,vUv-vec2(0,px.y*2.0)).xy;vec2 new=4.0*old+v*dt*(new0+new1+new2+new3);new/=4.0*(1.0+v*dt);gl_FragColor=vec4(new,0.0,0.0);}`;class eA extends Ir{constructor(e){super(e),this.material=new mt({glslVersion:lt,depthWrite:!1,depthTest:!1,blending:ot,vertexShader:Co,fragmentShader:QT,uniforms:{bounds:{value:e.bounds},velocity:{value:e.src.texture},velocity_new:{value:e.dst_.texture},v:{value:e.viscosity.intensity},px:{value:e.cellScale},dt:{value:e.delta}}}),this.output=e.dst,this.output0=e.dst_,this.output1=e.dst,this.init()}update(){const{viscosityIntensity:e,viscosityIterations:t}=this.props;let n,i;this.material.uniforms.v.value=e;for(let r=0;r<t;r++)r%2==0?(n=this.output0,i=this.output1):(n=this.output1,i=this.output0),this.material.uniforms.velocity_new.value=n.texture,this.output=i,super.update();return i}}class ag{constructor(e){this.renderer=e.renderer,this.fbos={main:null,velocity_1:null,viscosity_0:null,viscosity_1:null,divergence:null,pressure_0:null,pressure_1:null},this.options={mouseForce:20,resolution:.05,cursorSize:50,poissonIterations:5,bounce:!1,delta:.01,viscosityIntensity:30,viscosityIterations:5,viscosity:!1},Object.assign(this.options,e),this.cellScale=new Q,this.fboSize=new Q,this.bounds=new Q,this.createFbos(),this.createForces()}calcSizes(e,t){const{resolution:n}=this.options;this.width=Math.round(e*n),this.height=Math.round(t*n),this.cellScale.set(1/e,1/t),this.fboSize.set(e,t)}setOptions(e){Object.assign(this.options,e);const{delta:t,mouseForce:n,cursorSize:i,viscosityIntensity:r,viscosityIterations:o,poissonIterations:a}=this.options;this.advection.material.uniforms.dt.value=t,this.divergence.material.uniforms.dt.value=t,this.pressure.material.uniforms.dt.value=t,this.force.props.mouseForce=n,this.force.props.cursorSize=i,this.viscosity.props.viscosityIntensity=r,this.viscosity.props.viscosityIterations=o,this.poisson.props.poissonIterations=a}createFbos(){for(const e in this.fbos)this.fbos[e]=new Dn(this.fboSize.x,this.fboSize.y,{depthBuffer:!1,stencilBuffer:!1,type:kn})}onResize(e,t){this.calcSizes(e,t);for(const n in this.fbos)this.fbos[n].setSize(this.fboSize.x,this.fboSize.y)}createForces(){const{cellScale:e,fboSize:t,bounds:n}=this,{viscosityIterations:i,viscosityIntensity:r,viscosity:o,delta:a,mouseForce:c,cursorSize:u,poissonIterations:d}=this.options;this.advection=new GT({renderer:this.renderer,cellScale:e,fboSize:t,delta:a,src:this.fbos.main,dst:this.fbos.velocity_1}),this.force=new qT({renderer:this.renderer,cellScale:e,mouseForce:c,cursorSize:u,dst:this.fbos.velocity_1}),this.viscosity=new eA({renderer:this.renderer,cellScale:e,bounds:n,delta:a,viscosityIntensity:r,viscosityIterations:i,viscosity:o,src:this.fbos.velocity_1,dst:this.fbos.viscosity_1,dst_:this.fbos.viscosity_0}),this.divergence=new jT({renderer:this.renderer,cellScale:e,bounds:n,delta:a,src:this.fbos.viscosity_0,dst:this.fbos.divergence}),this.poisson=new KT({renderer:this.renderer,cellScale:e,bounds:n,delta:a,poissonIterations:d,src:this.fbos.divergence,dst:this.fbos.pressure_1,dst_:this.fbos.pressure_0}),this.pressure=new JT({renderer:this.renderer,cellScale:e,bounds:n,delta:a,pressure:this.fbos.pressure_0,viscosity:this.fbos.viscosity_0,dst:this.fbos.main})}update(){const{bounce:e,viscosity:t}=this.options;e?this.bounds.set(0,0):this.bounds.copy(this.cellScale),this.advection.update(),this.force.update();let n=this.fbos.velocity_1;t.enabled&&(n=this.viscosity.update()),this.divergence.update(n);const i=this.poisson.update();this.pressure.update({velocity:n,pressure:i})}}const tA=`
float random(vec2 co) {
    float a = 12.9898;
    float b = 78.233;
    float c = 43758.5453;
    float dt = dot(co.xy, vec2(a, b));
    float sn = mod(dt, 3.14);
    return fract(sin(sn) * c);
}
`,lg=`
${tA}

vec3 dither(vec3 color) {
    // Calculate grid position
    float grid_position = random(gl_FragCoord.xy);
    // Shift the individual colors differently, thus making it even harder to see the dithering pattern
    vec3 dither_shift_RGB = vec3(0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0);
    // Modify shift acording to grid position
    dither_shift_RGB = mix(2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position);
    // Shift the color by dither_shift
    return color + dither_shift_RGB;
}
`,nA=`
precision mediump float;

${lg}

uniform sampler2D tBlur1;
uniform sampler2D tBlur2;
uniform sampler2D tBlur3;
uniform sampler2D tBlur4;
uniform sampler2D tBlur5;
uniform float uBloomFactors[NUM_MIPS];
in vec2 vUv;
out vec4 FragColor;
void main() {
  FragColor = uBloomFactors[0] * texture(tBlur1, vUv) +
    uBloomFactors[1] * texture(tBlur2, vUv) +
    uBloomFactors[2] * texture(tBlur3, vUv) +
    uBloomFactors[3] * texture(tBlur4, vUv) +
    uBloomFactors[4] * texture(tBlur5, vUv);
    #ifdef DITHERING
  FragColor.rgb = dither(FragColor.rgb);
    #endif
}
`,iA=`
in vec3 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;class cg extends mt{constructor({dithering:e}={}){super({glslVersion:lt,defines:{NUM_MIPS:5,DITHERING:e},uniforms:{tBlur1:new I(null),tBlur2:new I(null),tBlur3:new I(null),tBlur4:new I(null),tBlur5:new I(null),uBloomFactors:new I(null)},vertexShader:iA,fragmentShader:nA,blending:ot,depthWrite:!1,depthTest:!1})}}class sA{constructor(e,t,n,i){this.renderer=e,this.shader=i,this.orthoScene=new To,this.fbo=new Dn(t,n,{wrapS:ai,wrapT:ai,minFilter:jt,magFilter:jt,format:Bn,type:kn,stencilBuffer:!1,depthBuffer:!1}),this.fbo.texture.generateMipmaps=!1,this.fbos=[this.fbo,this.fbo.clone()],this.current=0,this.output=this.fbos[0],this.orthoCamera=new Kn(t/-2,t/2,n/2,n/-2,1e-5,1e3),this.orthoQuad=new at(new Rn(t,n),this.shader),this.orthoScene.add(this.orthoQuad)}onResize(e,t){this.fbos[0].setSize(e,t),this.fbos[1].setSize(e,t)}render(){this.shader.uniforms.uTexture.value=this.fbos[this.current].texture,this.input=this.fbos[this.current],this.current=1-this.current,this.output=this.fbos[this.current],this.renderer.setRenderTarget(this.output),this.renderer.render(this.orthoScene,this.orthoCamera),this.renderer.setRenderTarget(null)}}const rA=`
precision highp float;

uniform sampler2D uTexture;
uniform sampler2D uNoiseTexture;
uniform vec2 uPosOld;
uniform vec2 uPosNew;
uniform vec2 uCoords;
uniform float uSpeed;
uniform float uPersistance;
uniform float uThickness;
uniform float uTime;
uniform float uDiffusionSize;
uniform float uDiffusion;
uniform vec3 uColor;
varying vec2 vUv;

float circle(vec2 uv, vec2 center, float size) {
  float circle = length(uv - center);
  return 1. - smoothstep(0.0, size, circle);
}

// float lineSegment(vec2 p, vec2 a, vec2 b, float thickness, float aspectRatio) {
//   vec2 pa = p - a, ba = b - a;
//   float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
//   float circle = length(pa - ba * h);
//   return smoothstep(thickness, thickness * 0.5, circle);
// }

// vec4 blur(sampler2D image, vec2 uv, vec2 resolution, vec2 direction){
//   vec4 color = vec4(0.0);
//   vec2 off1 = vec2(.013846153846) * direction;
//   vec2 off2 = vec2(.032307692308) * direction;
//   color += texture2D(image, uv) * 0.2270270270;
//   color += texture2D(image, uv + vec2(off1 * resolution)) * 0.3162162162;
//   color += texture2D(image, uv - vec2(off1 * resolution)) * 0.3162162162;
//   color += texture2D(image, uv + vec2(off2 * resolution)) * 0.0702702703;
//   color += texture2D(image, uv - vec2(off2 * resolution)) * 0.0702702703;
//   return color;
// }

void main() {
  vec4 noise1 = texture2D(uNoiseTexture, vUv * 4.0 + vec2(uTime * .1, .0));
  vec4 noise2 = texture2D(uNoiseTexture, vUv * 8.0 + vec2(.0, uTime * .1) + noise1.rg * .5);
  vec4 noise3 = texture2D(uNoiseTexture, vUv * 16.0 + vec2(-uTime*.05, 0.) + noise2.rg * .5);
  vec4 noise = (noise1 + noise2 * .5 + noise3 * .25 ) / 1.75;
  
  float dirX = (-.5 + noise.g) * noise.r * 10.;
  float dirY = (-.5 + noise.b) * noise.r * 10.;
  
  vec4 oldTexture = texture2D(uTexture, vUv);
  float br = 1. - + (oldTexture.r + oldTexture.g + oldTexture.b)/3.0;
  vec4 col = oldTexture * (1.0 - uDiffusion);
  float p2 = (uDiffusion)/4.0;
  // vec2 stretchUv = vUv * vec2(1.0, 1.0);
  // col += blur(uTexture, stretchUv, vec2(uDiffusionSize * br), vec2(dirX, dirY) ) * p2;
  // col += blur(uTexture, stretchUv, vec2(uDiffusionSize * br), vec2(dirY, dirX) ) * p2;
  // col += blur(uTexture, stretchUv, vec2(uDiffusionSize * br), vec2(-dirX, -dirY) ) * p2;
  // col += blur(uTexture, stretchUv, vec2(uDiffusionSize * br), vec2(-dirY, -dirX) ) * p2;
  col.rgb *= uPersistance;
  
  if (uSpeed > 0.0){
    float lineValue = 0.;
    float th = clamp( uThickness + uSpeed * .3, .0001, .2) ;

    vec2 newUv = vUv;

    float ratio = uCoords.x / uCoords.y;

    newUv.y /= ratio;

    vec2 posOld = uPosOld;

    posOld.y /= ratio;
    
    // lineValue = lineSegment(newUv, uPosOld, uPosNew, th, ratio);
    lineValue = circle(newUv, posOld, th);

    col.rgb = mix(col.rgb, uColor, lineValue * .05);
    col.rgb = clamp( col.rgb, vec3(0.), vec3(1.));
  }
 
  gl_FragColor = vec4(col);
}
`,oA=`
precision highp float;

uniform float uTime;
varying vec2 vUv;

void main() {
  vUv = uv;
  vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * modelViewPosition; 
}
`;class Ka{constructor(e){this.options={persistance:.75,thickness:.25,diffusion:0,diffusionSize:0,pressure:1,mesh:null,rayCastMesh:null,camera:null,width:innerWidth/4,height:innerHeight/4},Object.assign(this.options,e),this.onMesh=this.options.mesh!==null,this.renderer=this.options.renderer,this.intersects=[],this.pressure=this.options.pressure,this.onMesh&&(this.mesh=this.options.mesh,this.raycaster=new $w,this.camera=this.options.camera,this.rayCastMesh=this.options.rayCastMesh!==null?this.options.rayCastMesh:this.mesh),this.mouse=new Q,this.oldPos=new Q(.5,.5),this.newPos=new Q(.5,.5),this.targetPos=new Q(.5,.5),this.simulationMaterial=new Cn({uniforms:{uTexture:{value:null},uNoiseTexture:{value:null},uCoords:{value:new Q(innerWidth,innerHeight)},uPersistance:{value:this.options.persistance},uThickness:{value:this.options.thickness},uDiffusion:{value:this.options.diffusion},uDiffusionSize:{value:this.options.diffusionSize},uTime:{value:0},uPosOld:{value:new Q(0,0)},uPosNew:{value:new Q(0,0)},uSpeed:{value:0},uColor:{value:new ye(16777215)}},fragmentShader:rA,vertexShader:oA}),this.bufferSim=new sA(this.renderer,this.options.width,this.options.height,this.simulationMaterial),this.addEvents()}addEvents(){pe.on(xe.MOUSE_MOVE,this.onMouseMove.bind(this))}onResize(e,t){this.bufferSim.onResize(e,t),this.simulationMaterial.uniforms.uCoords.value.set(e,t)}onMouseMove({x:e,y:t}){this.onMesh?this.raycast({x:e,y:t}):this.targetPos.set(e/Pe.w,1-t/Pe.h)}raycast({x:e,y:t}){this.mouse.x=e/Pe.w*2-1,this.mouse.y=-(t/Pe.h)*2+1,this.raycaster.setFromCamera(this.mouse,this.camera),this.intersects=this.raycaster.intersectObjects([this.rayCastMesh]),this.intersects.length>0&&(this.targetPos.x=this.intersects[0].uv.x,this.targetPos.y=this.intersects[0].uv.y)}update(e,t,n){this.newPos.lerp(this.targetPos,t*7.5),this.speed=new Q().subVectors(this.newPos,this.oldPos),this.simulationMaterial.uniforms.uPosNew.value=this.newPos,this.simulationMaterial.uniforms.uPosOld.value=this.oldPos,this.simulationMaterial.uniforms.uSpeed.value=Math.max(Fn(this.speed.length()),1e-4),this.simulationMaterial.uniforms.uTime.value=e,this.simulationMaterial.uniforms.uPersistance.value=Math.pow(this.options.persistance,t*10),this.onMesh&&this.intersects.length>0,this.simulationMaterial.uniforms.uThickness.value=this.options.thickness*this.pressure,this.bufferSim.render(),this.renderer.setRenderTarget(null),this.oldPos=this.newPos.clone()}}const Ur=`
vec3 saturation(vec3 rgb, float adjustment) {
    const vec3 W = vec3(0.2125, 0.7154, 0.0721);
    vec3 intensity = vec3(dot(rgb, W));
    return mix(intensity, rgb, adjustment);
}
`,Ro=`
float vignette(vec2 coords, float vignin, float vignout, float vignfade, float fstop) {
  float dist = distance(coords.xy, vec2(0.5, 0.5));
  dist = smoothstep(vignout + (fstop / vignfade), vignin + (fstop / vignfade), dist);
  return clamp(dist, 0.0, 1.0);
}
`,Za=`
vec3 circle(vec2 uv, vec2 center, vec3 color, float size) {
  float circle = length(uv - center);
  circle = 1. - smoothstep(0.0, size, circle);
  return color * circle;
}
`,Fr=`
vec3 contrast(vec3 color, float value) {
  return 0.5 + value * (color - 0.5);
}
`,Ja=`
vec3 hue(vec3 color, float hue) {
  const vec3 k = vec3(0.57735, 0.57735, 0.57735);
  float cosAngle = cos(hue);
  return vec3(color * cosAngle + cross(k, color) * sin(hue) + k * dot(k, color) * (1.0 - cosAngle));
}
`,Qa=`
vec4 rgbshift(sampler2D image, vec2 uv, float angle, float amount) {
    vec2 offset = vec2(cos(angle), sin(angle)) * amount;
    vec4 r = texture(image, uv + offset);
    vec4 g = texture(image, uv);
    vec4 b = texture(image, uv - offset);
    return vec4(r.r, g.g, b.b, g.a);
}
`,aA=`
precision highp float;

${Ur}
${Ro}
${Za}
${Fr}
${Ja}
${Qa}

float luminance(vec3 rgb) {
  const vec3 W = vec3(0.2125, 0.7154, 0.0721);
  return dot(rgb, W);
}

uniform sampler2D tScene;
uniform sampler2D tBloom;
uniform sampler2D tFluid;
uniform sampler2D tBlur;

uniform bool boolBloom;
uniform bool boolFluid;
uniform bool boolLuminosity;
uniform bool boolFxaa;

float vignout = .55; // vignetting outer border
float vignin = 0.1; // vignetting inner border
float vignfade = 2.0; // f-stops till vignete fades

in vec2 vUv;
out vec4 FragColor;

void main() {
  vec4 fluid = texture(tFluid, vUv);
  vec2 uv = vUv + fluid.rg * -.15;
  vec4 mixed = rgbshift(tScene, uv, -1., .001);

  if(boolBloom) {
    vec4 bloom = rgbshift(tBloom, uv, -1.5, .02);
    float angle = length(uv + 0.5);
    float uBloomDistortion = 2.5;
    float amount = .001 * uBloomDistortion;

    mixed.rgb += bloom.rgb;
    mixed.rgb += rgbshift(tBloom, uv, angle, amount / .5).rgb;
  }


  mixed.rgb += length(fluid.xy) * .015;

  float vignetteF = vignette(uv.xy, vignin, vignout, vignfade, .25);

  FragColor = vec4(mixed.rgb, 1.);
}
`,el=`
in vec3 position;
in vec2 uv;
uniform mat4 modelMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
out vec2 vUv;
void main() {
  vUv = uv;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vec4 mvPosition = viewMatrix * worldPosition;
  gl_Position = projectionMatrix * mvPosition;
}
`;class lA extends mt{constructor(){super({glslVersion:lt,toneMapped:!1,uniforms:{tScene:new I(null),tBloom:new I(null),tBlur:new I(null),tFluid:new I(null),tMouseSim:new I(null),boolBloom:new I(!1),boolFluid:new I(!1),boolLuminosity:new I(!1),boolFxaa:new I(!1)},vertexShader:el,fragmentShader:aA,blending:ot,depthWrite:!1,depthTest:!1})}}const bf=new Q(1,0),Mf=new Q(0,1);class Lu{constructor(e,t,n){this.renderer=e,this.scene=t,this.camera=n,this.initSettings(),this.initRenderer()}initSettings(){this.settings={renderToScreen:!1,fxaa:{enabled:!1},mousesim:{enabled:!1},luminosity:{threshold:.1,smoothing:1,enabled:!1},bloom:{strength:.05,radius:.01,enabled:!1},blur:{scale:1,strength:8,enabled:!1},fluid:{enabled:!1,mouseForce:25,cursorSize:15,delta:.019,poissonIterations:1,bounce:!1}}}initRenderer(){this.screenCamera=new Kn(-1,1,1,-1,0,1),this.screenGeometry=new Vt,this.screenGeometry.setAttribute("position",new bt([-1,3,0,-1,-1,0,3,-1,0],3)),this.screenGeometry.setAttribute("uv",new bt([0,2,0,0,2,0],2)),this.screen=new at(this.screenGeometry),this.screen.frustumCulled=!1,this.renderTargetA=new Dn(1,1,{depthBuffer:!1,stencilBuffer:!1}),this.renderTargetB=this.renderTargetA.clone(),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5,this.renderTargetBright=this.renderTargetA.clone(),this.renderTargetComposite=this.renderTargetA.clone();for(let t=0,n=this.nMips;t<n;t++)this.renderTargetsHorizontal.push(this.renderTargetA.clone()),this.renderTargetsVertical.push(this.renderTargetA.clone());this.renderTargetBlurA=this.renderTargetA.clone(),this.renderTargetBlurB=this.renderTargetA.clone(),this.hBlurMaterial=new Na(bf),this.hBlurMaterial.uniforms.uBluriness.value=0,this.vBlurMaterial=new Na(Mf),this.vBlurMaterial.uniforms.uBluriness.value=0,this.FxaaMaterial=new ig,this.FxaaMaterial.uniforms.uResolution=new I(new Q),this.renderTargetFXAA=this.renderTargetA.clone(),this.luminosityMaterial=new sg,this.luminosityMaterial.uniforms.uThreshold.value=this.settings.luminosity.threshold,this.luminosityMaterial.uniforms.uSmoothing.value=this.settings.luminosity.smoothing,this.blurMaterials=[];const e=[3,5,7,9,11];for(let t=0,n=this.nMips;t<n;t++)this.blurMaterials.push(new rg(e[t]));this.BloomMaterial=new cg,this.BloomMaterial.uniforms.tBlur1.value=this.renderTargetsVertical[0].texture,this.BloomMaterial.uniforms.tBlur2.value=this.renderTargetsVertical[1].texture,this.BloomMaterial.uniforms.tBlur3.value=this.renderTargetsVertical[2].texture,this.BloomMaterial.uniforms.tBlur4.value=this.renderTargetsVertical[3].texture,this.BloomMaterial.uniforms.tBlur5.value=this.renderTargetsVertical[4].texture,this.BloomMaterial.uniforms.uBloomFactors.value=this.bloomFactors(),this.settings.fluid.enabled&&this.initFluid(),this.settings.mousesim.enabled&&this.initMouseSim(),this.compositeMaterial=new lA,this.renderTargetA.depthBuffer=!0}initMouseSim(){this.mouseSimulation=new Ka({renderer:this.renderer})}initFluid(){this.fluidSimulation=new ag({renderer:this.renderer,mouseForce:this.settings.fluid.mouseForce,resolution:.005,cursorSize:this.settings.fluid.cursorSize,poissonIterations:this.settings.fluid.poissonIterations,bounce:this.settings.fluid.bounce,delta:this.settings.fluid.delta})}bloomFactors(){const e=[1,.8,.6,.4,.2];for(let t=0,n=this.nMips;t<n;t++){const i=e[t];e[t]=this.settings.bloom.strength*zn(i,1.2-i,this.settings.bloom.radius)}return e}resize=(e,t,n)=>{if(this.settings.renderToScreen&&(this.renderer.setPixelRatio(n),this.renderer.setSize(e,t)),this.settings.fxaa.enabled&&(this.renderTargetFXAA.setSize(e*n,t*n),this.FxaaMaterial.uniforms.uResolution.value.set(e*n,t*n)),this.settings.blur.enabled){const i=Math.round(e*this.settings.blur.scale),r=Math.round(t*this.settings.blur.scale);this.renderTargetBlurA.setSize(i,r),this.renderTargetBlurB.setSize(i,r),this.hBlurMaterial.uniforms.uResolution.value.set(e,t),this.vBlurMaterial.uniforms.uResolution.value.set(e,t)}if(e=Math.round(e*n),t=Math.round(t*n),this.renderTargetA.setSize(e,t),this.renderTargetComposite.setSize(e,t),this.settings.mousesim.enabled&&this.mouseSimulation.onResize(e/10,t/10),e=Fa(e)/4,t=Fa(t)/4,this.settings.luminosity.enabled&&this.renderTargetBright.setSize(e,t),this.settings.fluid.enabled&&this.fluidSimulation&&this.fluidSimulation.onResize(e/3,t/3),this.settings.bloom.enabled)for(let i=0,r=this.nMips;i<r;i++)this.renderTargetsHorizontal[i].setSize(e,t),this.renderTargetsVertical[i].setSize(e,t),this.blurMaterials[i].uniforms.uResolution.value.set(e,t),e/=2,t/=2};update=(e,t,n,i,r=this.camera,o=this.renderer,a=this.scene)=>{const c=this.renderTargetA,u=this.renderTargetBright,d=this.renderTargetsHorizontal,l=this.renderTargetsVertical,h=this.renderTargetComposite,f=this.renderTargetBlurA,g=this.renderTargetBlurB,v=this.renderTargetFXAA;if(o.setRenderTarget(c),o.render(a,r),this.settings.blur.enabled&&(this.hBlurMaterial.uniforms.tMap.value=c.texture,this.screen.material=this.hBlurMaterial,o.setRenderTarget(f),o.render(this.screen,this.screenCamera),this.vBlurMaterial.uniforms.tMap.value=f.texture,this.screen.material=this.vBlurMaterial,o.setRenderTarget(g),o.render(this.screen,this.screenCamera)),this.settings.luminosity.enabled&&(this.luminosityMaterial.uniforms.tMap.value=this.settings.blur.enabled?g.texture:c.texture,this.screen.material=this.luminosityMaterial,o.setRenderTarget(u),o.render(this.screen,this.screenCamera)),this.settings.bloom.enabled){let m=this.settings.luminosity.enabled?u:c;for(let p=0,x=this.nMips;p<x;p++)this.screen.material=this.blurMaterials[p],this.blurMaterials[p].uniforms.tMap.value=m.texture,this.blurMaterials[p].uniforms.uDirection.value=bf,o.setRenderTarget(d[p]),o.render(this.screen,this.screenCamera),this.blurMaterials[p].uniforms.tMap.value=this.renderTargetsHorizontal[p].texture,this.blurMaterials[p].uniforms.uDirection.value=Mf,o.setRenderTarget(l[p]),o.render(this.screen,this.screenCamera),m=l[p];this.screen.material=this.BloomMaterial,o.setRenderTarget(d[0]),o.render(this.screen,this.screenCamera),this.compositeMaterial.uniforms.tBloom.value=d[0].texture}this.settings.fluid.enabled&&(this.fluidSimulation.update(),this.fluidSimulation.fbos.main&&(this.compositeMaterial.uniforms.tFluid.value=this.fluidSimulation.fbos.main.texture)),this.settings.mousesim.enabled&&(this.mouseSimulation.update(e,t,n),this.compositeMaterial.uniforms.tMouseSim.value=this.mouseSimulation.bufferSim.output.texture),this.compositeMaterial.uniforms.tScene.value=this.settings.blur.enabled?g.texture:c.texture,this.compositeMaterial.uniforms.boolBloom.value=this.settings.bloom.enabled,this.compositeMaterial.uniforms.boolFluid.value=this.settings.fluid.enabled,this.compositeMaterial.uniforms.boolLuminosity.value=this.settings.luminosity.enabled,this.compositeMaterial.uniforms.boolFxaa.value=this.settings.fxaa.enabled,this.screen.material=this.compositeMaterial,this.settings.fxaa.enabled&&(o.setRenderTarget(v),o.render(this.screen,this.screenCamera),this.FxaaMaterial.uniforms.tMap.value=v.texture,this.screen.material=this.FxaaMaterial),this.settings.renderToScreen?(o.setRenderTarget(null),o.render(this.screen,this.screenCamera)):(o.setRenderTarget(h),o.render(this.screen,this.screenCamera),o.setRenderTarget(null))}}class Iu{constructor(e){this.gl=e,this.active=!1,this.setRenderer(e.renderer),this.components=[],this.parent=null,this.setScene(),this.setCamera(),this.setCameraController(),this.setCameraControllerSettings(),this.setRenderManager(),this.init()}setRenderer(e){this.renderer=e}init(){}setScene(){this.scene=new To}setCamera(){this.camera=new Ya(55,innerWidth/innerHeight,1,2e3),this.camera.position.set(0,0,5)}setCameraController(){this.cameraController=new IT({camera:this.camera})}setCameraControllerSettings(){}setRenderManager(){this.renderManager=new Lu(this.renderer,this.scene,this.camera)}update(e,t,n,i){this.renderManager.update(e,t,n,i),this.cameraController&&this.cameraController.update(e,t,n,i);for(let r=0;r<this.components.length;r++)this.components[r].update&&this.components[r].update(e,t,n,i)}resize(e,t,n){this.renderManager.resize(e,t,n),this.camera.resize(e,t),this.camera.aspect=e/t,this.camera.updateProjectionMatrix(),this.cameraController&&this.cameraController.resize(e,t);for(let i=0;i<this.components.length;i++)this.components[i].resize&&this.components[i].resize(e,t,n)}add(e,t){const n=new e(this,t);return this.components.push(n),n}}const cA=`
float blendHardMix(float base, float blend) {
	return (blendVividLight(base,blend)<0.5)?0.0:1.0;
}

vec3 blendHardMix(vec3 base, vec3 blend) {
	return vec3(blendHardMix(base.r,blend.r),blendHardMix(base.g,blend.g),blendHardMix(base.b,blend.b));
}

vec3 blendHardMix(vec3 base, vec3 blend, float opacity) {
	return (blendHardMix(base, blend) * opacity + base * (1.0 - opacity));
}
`,uA=`
float blendVividLight(float base, float blend) {
	return (blend<0.5)?blendColorBurn(base,(2.0*blend)):blendColorDodge(base,(2.0*(blend-0.5)));
}

vec3 blendVividLight(vec3 base, vec3 blend) {
	return vec3(blendVividLight(base.r,blend.r),blendVividLight(base.g,blend.g),blendVividLight(base.b,blend.b));
}

vec3 blendVividLight(vec3 base, vec3 blend, float opacity) {
	return (blendVividLight(base, blend) * opacity + base * (1.0 - opacity));
}
`,hA=`
float blendLinearLight(float base, float blend) {
	return blend<0.5?blendLinearBurn(base,(2.0*blend)):blendLinearDodge(base,(2.0*(blend-0.5)));
}

vec3 blendLinearLight(vec3 base, vec3 blend) {
	return vec3(blendLinearLight(base.r,blend.r),blendLinearLight(base.g,blend.g),blendLinearLight(base.b,blend.b));
}

vec3 blendLinearLight(vec3 base, vec3 blend, float opacity) {
	return (blendLinearLight(base, blend) * opacity + base * (1.0 - opacity));
}
`,dA=`
float blendPinLight(float base, float blend) {
	return (blend<0.5)?blendDarken(base,(2.0*blend)):blendLighten(base,(2.0*(blend-0.5)));
}

vec3 blendPinLight(vec3 base, vec3 blend) {
	return vec3(blendPinLight(base.r,blend.r),blendPinLight(base.g,blend.g),blendPinLight(base.b,blend.b));
}

vec3 blendPinLight(vec3 base, vec3 blend, float opacity) {
	return (blendPinLight(base, blend) * opacity + base * (1.0 - opacity));
}
`,fA=`
vec3 blendGlow(vec3 base, vec3 blend) {
	return blendReflect(blend,base);
}

vec3 blendGlow(vec3 base, vec3 blend, float opacity) {
	return (blendGlow(base, blend) * opacity + base * (1.0 - opacity));
}
`,pA=`
vec3 blendHardLight(vec3 base, vec3 blend) {
	return blendOverlay(blend,base);
}

vec3 blendHardLight(vec3 base, vec3 blend, float opacity) {
	return (blendHardLight(base, blend) * opacity + base * (1.0 - opacity));
}
`,mA=`
vec3 blendPhoenix(vec3 base, vec3 blend) {
	return min(base,blend)-max(base,blend)+vec3(1.0);
}

vec3 blendPhoenix(vec3 base, vec3 blend, float opacity) {
	return (blendPhoenix(base, blend) * opacity + base * (1.0 - opacity));
}
`,gA=`
float blendOverlay(float base, float blend) {
	return base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));
}

vec3 blendOverlay(vec3 base, vec3 blend) {
	return vec3(blendOverlay(base.r,blend.r),blendOverlay(base.g,blend.g),blendOverlay(base.b,blend.b));
}

vec3 blendOverlay(vec3 base, vec3 blend, float opacity) {
	return (blendOverlay(base, blend) * opacity + base * (1.0 - opacity));
}
`,vA=`
vec3 blendNormal(vec3 base, vec3 blend) {
	return blend;
}

vec3 blendNormal(vec3 base, vec3 blend, float opacity) {
	return (blendNormal(base, blend) * opacity + base * (1.0 - opacity));
}
`,ug=`
vec3 blendNegation(vec3 base, vec3 blend) {
	return vec3(1.0)-abs(vec3(1.0)-base-blend);
}

vec3 blendNegation(vec3 base, vec3 blend, float opacity) {
	return (blendNegation(base, blend) * opacity + base * (1.0 - opacity));
}
`,hg=`
vec3 blendMultiply(vec3 base, vec3 blend) {
	return base*blend;
}

vec3 blendMultiply(vec3 base, vec3 blend, float opacity) {
	return (blendMultiply(base, blend) * opacity + base * (1.0 - opacity));
}
`,dg=`
float blendReflect(float base, float blend) {
	return (blend==1.0)?blend:min(base*base/(1.0-blend),1.0);
}

vec3 blendReflect(vec3 base, vec3 blend) {
	return vec3(blendReflect(base.r,blend.r),blendReflect(base.g,blend.g),blendReflect(base.b,blend.b));
}

vec3 blendReflect(vec3 base, vec3 blend, float opacity) {
	return (blendReflect(base, blend) * opacity + base * (1.0 - opacity));
}
`,_A=`
vec3 blendAverage(vec3 base, vec3 blend) {
	return (base+blend)/2.0;
}

vec3 blendAverage(vec3 base, vec3 blend, float opacity) {
	return (blendAverage(base, blend) * opacity + base * (1.0 - opacity));
}
`,xA=`
float blendLinearBurn(float base, float blend) {
	// Note : Same implementation as BlendSubtractf
	return max(base+blend-1.0,0.0);
}

vec3 blendLinearBurn(vec3 base, vec3 blend) {
	// Note : Same implementation as BlendSubtract
	return max(base+blend-vec3(1.0),vec3(0.0));
}

vec3 blendLinearBurn(vec3 base, vec3 blend, float opacity) {
	return (blendLinearBurn(base, blend) * opacity + base * (1.0 - opacity));
}
`,fg=`
float blendLighten(float base, float blend) {
	return max(blend,base);
}

vec3 blendLighten(vec3 base, vec3 blend) {
	return vec3(blendLighten(base.r,blend.r),blendLighten(base.g,blend.g),blendLighten(base.b,blend.b));
}

vec3 blendLighten(vec3 base, vec3 blend, float opacity) {
	return (blendLighten(base, blend) * opacity + base * (1.0 - opacity));
}
`,yA=`
float blendScreen(float base, float blend) {
	return 1.0-((1.0-base)*(1.0-blend));
}

vec3 blendScreen(vec3 base, vec3 blend) {
	return vec3(blendScreen(base.r,blend.r),blendScreen(base.g,blend.g),blendScreen(base.b,blend.b));
}

vec3 blendScreen(vec3 base, vec3 blend, float opacity) {
	return (blendScreen(base, blend) * opacity + base * (1.0 - opacity));
}
`,SA=`
float blendSoftLight(float base, float blend) {
	return (blend<0.5)?(2.0*base*blend+base*base*(1.0-2.0*blend)):(sqrt(base)*(2.0*blend-1.0)+2.0*base*(1.0-blend));
}

vec3 blendSoftLight(vec3 base, vec3 blend) {
	return vec3(blendSoftLight(base.r,blend.r),blendSoftLight(base.g,blend.g),blendSoftLight(base.b,blend.b));
}

vec3 blendSoftLight(vec3 base, vec3 blend, float opacity) {
	return (blendSoftLight(base, blend) * opacity + base * (1.0 - opacity));
}
`,bA=`
float blendSubtract(float base, float blend) {
	return max(base+blend-1.0,0.0);
}

vec3 blendSubtract(vec3 base, vec3 blend) {
	return max(base+blend-vec3(1.0),vec3(0.0));
}

vec3 blendSubtract(vec3 base, vec3 blend, float opacity) {
	return (blendSubtract(base, blend) * opacity + base * (1.0 - opacity));
}
`,MA=`
vec3 blendExclusion(vec3 base, vec3 blend) {
	return base+blend-2.0*base*blend;
}

vec3 blendExclusion(vec3 base, vec3 blend, float opacity) {
	return (blendExclusion(base, blend) * opacity + base * (1.0 - opacity));
}
`,EA=`
vec3 blendDifference(vec3 base, vec3 blend) {
	return abs(base-blend);
}

vec3 blendDifference(vec3 base, vec3 blend, float opacity) {
	return (blendDifference(base, blend) * opacity + base * (1.0 - opacity));
}
`,wA=`
float blendDarken(float base, float blend) {
	return min(blend,base);
}

vec3 blendDarken(vec3 base, vec3 blend) {
	return vec3(blendDarken(base.r,blend.r),blendDarken(base.g,blend.g),blendDarken(base.b,blend.b));
}

vec3 blendDarken(vec3 base, vec3 blend, float opacity) {
	return (blendDarken(base, blend) * opacity + base * (1.0 - opacity));
}
`,TA=`
float blendColorDodge(float base, float blend) {
	return (blend==1.0)?blend:min(base/(1.0-blend),1.0);
}

vec3 blendColorDodge(vec3 base, vec3 blend) {
	return vec3(blendColorDodge(base.r,blend.r),blendColorDodge(base.g,blend.g),blendColorDodge(base.b,blend.b));
}

vec3 blendColorDodge(vec3 base, vec3 blend, float opacity) {
	return (blendColorDodge(base, blend) * opacity + base * (1.0 - opacity));
}
`,pg=`
float blendColorBurn(float base, float blend) {
	return (blend==0.0)?blend:max((1.0-((1.0-base)/blend)),0.0);
}

vec3 blendColorBurn(vec3 base, vec3 blend) {
	return vec3(blendColorBurn(base.r,blend.r),blendColorBurn(base.g,blend.g),blendColorBurn(base.b,blend.b));
}

vec3 blendColorBurn(vec3 base, vec3 blend, float opacity) {
	return (blendColorBurn(base, blend) * opacity + base * (1.0 - opacity));
}
`,AA=`
float blendAdd(float base, float blend) {
	return min(base+blend,1.0);
}

vec3 blendAdd(vec3 base, vec3 blend) {
	return min(base+blend,vec3(1.0));
}

vec3 blendAdd(vec3 base, vec3 blend, float opacity) {
	return (blendAdd(base, blend) * opacity + base * (1.0 - opacity));
}
`,DA=`
float blendLinearDodge(float base, float blend) {
	// Note : Same implementation as BlendAddf
	return min(base+blend,1.0);
}

vec3 blendLinearDodge(vec3 base, vec3 blend) {
	// Note : Same implementation as BlendAdd
	return min(base+blend,vec3(1.0));
}

vec3 blendLinearDodge(vec3 base, vec3 blend, float opacity) {
	return (blendLinearDodge(base, blend) * opacity + base * (1.0 - opacity));
}
`,Po=`
${TA}
${pg}
${xA}
${DA}
${wA}
${fg}
${gA}
${dg}
${uA}
${cA}
${hA}
${dA}
${fA}
${pA}
${mA}
${vA}
${ug}
${hg}
${_A}
${yA}
${SA}
${bA}
${MA}
${EA}
${AA}


vec3 blend(int mode, vec3 base, vec3 blend, float opacity) {
  if(mode == 1) {
    return blendAdd(base, blend, opacity);
  } else if(mode == 2) {
    return blendAverage(base, blend, opacity);
  } else if(mode == 3) {
    return blendColorBurn(base, blend, opacity);
  } else if(mode == 4) {
    return blendColorDodge(base, blend, opacity);
  } else if(mode == 5) {
    return blendDarken(base, blend, opacity);
  } else if(mode == 6) {
    return blendDifference(base, blend, opacity);
  } else if(mode == 7) {
    return blendExclusion(base, blend, opacity);
  } else if(mode == 8) {
    return blendGlow(base, blend, opacity);
  } else if(mode == 9) {
    return blendHardLight(base, blend, opacity);
  } else if(mode == 10) {
    return blendHardMix(base, blend, opacity);
  } else if(mode == 11) {
    return blendLighten(base, blend, opacity);
  } else if(mode == 12) {
    return blendLinearBurn(base, blend, opacity);
  } else if(mode == 13) {
    return blendLinearDodge(base, blend, opacity);
  } else if(mode == 14) {
    return blendLinearLight(base, blend, opacity);
  } else if(mode == 15) {
    return blendMultiply(base, blend, opacity);
  } else if(mode == 16) {
    return blendNegation(base, blend, opacity);
  } else if(mode == 17) {
    return blendNormal(base, blend, opacity);
  } else if(mode == 18) {
    return blendOverlay(base, blend, opacity);
  } else if(mode == 19) {
    return blendPhoenix(base, blend, opacity);
  } else if(mode == 20) {
    return blendPinLight(base, blend, opacity);
  } else if(mode == 21) {
    return blendReflect(base, blend, opacity);
  } else if(mode == 22) {
    return blendScreen(base, blend, opacity);
  } else if(mode == 23) {
    return blendSoftLight(base, blend, opacity);
  } else if(mode == 24) {
    return blendSubtract(base, blend, opacity);
  } else if(mode == 25) {
    return blendVividLight(base, blend, opacity);
  }
}
`,CA=`
precision highp float;

#include <tonemapping_pars_fragment>

${Ur}
${Ro}
${Za}
${Fr}
${Ja}
${Qa}
${Po}


float luminance(vec3 rgb) {
  const vec3 W = vec3(0.2125, 0.7154, 0.0721);
  return dot(rgb, W);
}

uniform sampler2D tScene;
uniform sampler2D tBloom;
uniform sampler2D tFluid;
uniform sampler2D tBlur;
uniform sampler2D tMouseSim;

uniform bool boolBloom;
uniform bool boolFluid;
uniform bool boolLuminosity;
uniform bool boolFxaa;

uniform float uDarken;
uniform float uSaturation;

float vignout = .55; // vignetting outer border
float vignin = 0.1; // vignetting inner border
float vignfade = 2.0; // f-stops till vignete fades

in vec2 vUv;
out vec4 FragColor;

void main() {
  vec4 fluid = texture(tFluid, vUv);
  vec4 mouseSim = texture(tMouseSim, vUv);
  vec2 uv = vUv;
  vec4 mixed = rgbshift(tScene, uv, -1., .0015);

  if(boolBloom) {
    vec4 bloom = rgbshift(tBloom, uv, -1.5, .02);
    float angle = length(uv + 0.5);
    float uBloomDistortion = 2.5;
    float amount = .001 * uBloomDistortion;

    mixed.rgb += bloom.rgb;
    mixed.rgb += rgbshift(tBloom, uv, angle, amount / .5).rgb;
  }


  mixed.rgb += length(fluid.xy) * .015;

  float vignetteF = vignette(uv.xy, vignin, vignout, vignfade, .75);

  // mixed.rgb *= vignetteF;

  vec3 green = vec3(0.063,0.141,0.086);
  vec3 greenLight = vec3(0.337,1.,0.561);
  vec3 black = vec3(0.095,0.095,0.095);

  // mixed.rgb = blend(5, mixed.rgb, greenLight, .5);
  mixed.rgb = blend(15, mixed.rgb, black, uDarken * 2. + mouseSim.r * .25 * uDarken);
  mixed.rgb = blend(11, mixed.rgb, black, 1.);

  mixed.rgb = saturation(mixed.rgb, uSaturation);

  FragColor = vec4(mixed.rgb, 1.);

  #include <tonemapping_fragment>
}
`,RA={primary:"#bcbcbc",secondary:"#464646",blocks:"#000000"},PA=1,LA=.2,IA=.35,UA=.5,FA="#000000",NA=1.1,xt={colors:RA,ambient:PA,darken:LA,saturation:IA,thumbDarknessIntensity:UA,thumbDarknessColor:FA,contrast:NA};class OA extends mt{constructor(){super({glslVersion:lt,toneMapped:!1,uniforms:{tScene:new I(null),tBloom:new I(null),tBlur:new I(null),tFluid:new I(null),tMouseSim:new I(null),boolBloom:new I(!1),boolFluid:new I(!1),boolLuminosity:new I(!1),boolFxaa:new I(!1),uDarken:new I(xt.darken),uSaturation:new I(xt.saturation)},vertexShader:el,fragmentShader:CA,blending:ot,transparent:!0,depthWrite:!1,depthTest:!1})}}class kA extends Lu{constructor(e,t,n){super(e,t,n),this.compositeMaterial=new OA}initSettings(){this.settings={renderToScreen:!1,fxaa:{enabled:!1},mousesim:{enabled:!0},luminosity:{threshold:.1,smoothing:.95,enabled:!0},bloom:{strength:.15,radius:1.5,enabled:!0},blur:{scale:1,strength:8,enabled:!1},fluid:{enabled:!1,mouseForce:25,cursorSize:20,delta:.019,poissonIterations:1,bounce:!1}}}}const BA={AMBIENT_COLOR:"#fff",AMBIENT_INTENSITY:1,LIGHT_1_POS:{x:-1.5,y:1.1,z:2.4},LIGHT_1_COLOR:"#b2b2b2",LIGHT_1_INTENSITY:10.456521739130435,LIGHT_2_POS:{x:10.5,y:100.1,z:2.4},LIGHT_2_COLOR:"green",LIGHT_2_INTENSITY:10,LIGHT_3_POS:{x:.5,y:80,z:-100},LIGHT_3_COLOR:"green",LIGHT_3_INTENSITY:7,SHADOW_NORMAL_BIAS:.01,SHADOW_RADIUS:10,SHADOW_CAMERA_FAR:43.47826086956522,LOGO_SCALE:.7,LOGO_COLOR:"#ffffff",BACKGROUND_COLOR:"#1a1a1a",FOG_COLOR:"A294FF",FOG_NEAR:17.391304347826086,FOG_FAR:35.869565217391305,PARTICLES_COLOR:"#5b5b5b",FLUID_ENABLED:!1,FXAA_ENABLED:!1,LUMINOSITY_ENABLED:!0,BLOOM_ENABLED:!0,CAMERA_POS:{x:0,y:.5,z:4.5},CAMERA_FOV:40,ROUGHNESS_INTENSITY:.9456521739130435,ENVMAP_INTENSITY:1,EMISSIVE_INTENSITY:.5,METALNESS_INTENSITY:1,ROUGHNESS_PATTERN_INTENSITY:1,ROUGHNESS_PATTERN_CONTRAST:3.1521739130434785,ROUGHNESS_PATTERN_SCALE:16.304347826086957,ROUGHNESS_DISTORTION_INTENSITY:0,ROUGHNESS_DISTORTION_SCALE:6.521739130434783,SHADER_1_ALPHA:.5,SHADER_1_SPEED:0,SHADER_1_SCALE:5.5,SHADER_2_ALPHA:0,SHADER_2_SCALE:13,SHADER_3_ALPHA:0,SHADER_3_SPEED:0,SHADER_3_SCALE:0,SHADER_1_MIX_3:1},zA=`
varying float vInstanceIndex;
varying float vInstanceAlpha;
varying vec3 vInstanceColor;
varying vec3 vPosition;
varying vec3 vOffset;
uniform vec3 uGridSize;
uniform vec3 uGridOffset;
uniform float uTime;
uniform float uMouseFactor;
uniform float uMouseLightness;
uniform vec2 uCoords;
uniform float uReveal;
uniform float uRevealProject;
uniform float uRevealSides;
varying vec2 vUv;
uniform sampler2D tMouseSim2;
uniform sampler2D tDisplacement;

#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
uniform float ior;
#endif
#ifdef SPECULAR
uniform float specularIntensity;
uniform vec3 specularColor;
	#ifdef USE_SPECULARINTENSITYMAP
uniform sampler2D specularIntensityMap;
	#endif
	#ifdef USE_SPECULARCOLORMAP
uniform sampler2D specularColorMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
uniform float clearcoat;
uniform float clearcoatRoughness;
#endif
#ifdef USE_IRIDESCENCE
uniform float iridescence;
uniform float iridescenceIOR;
uniform float iridescenceThicknessMinimum;
uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
uniform vec3 sheenColor;
uniform float sheenRoughness;
	#ifdef USE_SHEENCOLORMAP
uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEENROUGHNESSMAP
uniform sampler2D sheenRoughnessMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
// #include <color_pars_fragment>
#include <uv_pars_fragment>
// #include <map_pars_fragment>
// #include <alphamap_pars_fragment>
// #include <alphatest_pars_fragment>
// #include <aomap_pars_fragment>
// #include <lightmap_pars_fragment>
// #include <emissivemap_pars_fragment>
#include <bsdfs>
// #include <iridescence_fragment>
// #include <cube_uv_reflection_fragment>
// #include <envmap_common_pars_fragment>
// #include <envmap_physical_pars_fragment>
// #include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
// #include <bumpmap_pars_fragment>
// #include <normalmap_pars_fragment>
// #include <clearcoat_pars_fragment>
// #include <iridescence_pars_fragment>
// #include <roughnessmap_pars_fragment>
// #include <metalnessmap_pars_fragment>
// #include <logdepthbuf_pars_fragment>
// #include <clipping_planes_pars_fragment>

float random(vec2 st)
{
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}


float vignette(vec2 coords, vec2 center, float vignin, float vignout, float vignfade, float fstop) {
  float dist = distance(coords.xy, center);
  dist = smoothstep(vignout + (fstop / vignfade), vignin + (fstop / vignfade), dist);
  return clamp(dist, 0.0, 1.0);
}


void main() {
	// #include <clipping_planes_fragment>
  vec4 diffuseColor = vec4(diffuse, opacity);
  ReflectedLight reflectedLight = ReflectedLight(vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));
  vec3 totalEmissiveRadiance = emissive;

  #include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_end>

  vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
  vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
  vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;

  #include <opaque_fragment>

  float mixedAlpha = vInstanceAlpha;
  vec2 newUv = vUv;
  vec2 newOffset = vOffset.xy;

  newUv.x /= uGridSize.x; 
  newUv.y /= uGridSize.y;

  newUv.x += newOffset.x;
  newUv.y += newOffset.y; 
 
  vec2 gridUv = vec2(floor(newUv.x * uGridSize.x), floor(newUv.y * uGridSize.y));
  vec2 gridUv2 = vec2(floor(newUv.y * uGridSize.y), floor(newUv.x * uGridSize.y));

  float alpha = mix(random(gridUv * vInstanceAlpha), random(gridUv), 1.);
  float alpha2 = mix(random(gridUv2 * vInstanceAlpha), random(gridUv2), 1.);

  // create a vignette
  
  // get screen uv
  vec2 screenUv = gl_FragCoord.xy / uCoords.xy;
  vec4 mouseSim = texture2D(tMouseSim2, screenUv);
  vec4 displacement = texture2D(tDisplacement, newUv);

  float revealCombined = uReveal * uRevealProject;
  float mouseF = 1. - mouseSim.r;
  
  mixedAlpha =  ((alpha * alpha2) * vInstanceAlpha);
  if(screenUv.y > 0.1) mixedAlpha += clamp(mouseSim.r * (uMouseFactor * 0.5), 0., 1.);
  gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * vec3(mouseF), (1. - uMouseLightness));
  
  float vignin = 0.01;
  float vignout = 0.2;
  float vignfade = 6.;
  float fstop = 1.0;

  vec2 center = vec2(0.5, 0.5);

  float v = vignette(newUv.xy, center.xy, 0.01, 0.2,  6., 1.0);
  float v2 = vignette(newUv.xy, center.xy, 0.01, 2.0 * pow(revealCombined, .25),  6. , 1.0);

  mixedAlpha += v * .1;
  mixedAlpha -= 1. - v2;
  mixedAlpha *= uRevealSides;

  gl_FragColor.a = mixedAlpha;

  // #include <tonemapping_fragment>
}
`,HA=`
attribute float instanceIndex;
attribute float instanceAlpha;
attribute vec3 instanceOffset;
attribute vec3 instanceColor;
varying float vInstanceIndex;  
varying float vInstanceAlpha;
varying vec3 vInstanceColor;
varying vec3 vPosition;
varying vec3 vOffset;
varying vec2 vUv;
uniform vec2 uCoords;
uniform float uTime;
uniform float uMouseFactor;
uniform sampler2D tDisplacement;
uniform sampler2D tMouseSim;
uniform sampler2D tPerlin;
uniform vec3 uGridSize;
uniform vec3 uGridOffset;
uniform vec3 uUvOffset;
uniform float uUvOffsetScale;
uniform float uReveal;
uniform float uRevealProject;
uniform float uRevealSides;
uniform float uRevealSpread;
uniform float uRevealSpreadSides;
#define STANDARD
varying vec3 vViewPosition;
varying float vNoise;

#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <shadowmap_pars_vertex>

void main() {
  vUv = uv;
	#include <uv_vertex>
	#include <color_vertex>
	#include <beginnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>

  vec2 screenUv = gl_Position.xy / uCoords.xy;
  
  vec2 newUv = screenUv;
  vec2 newOffset = instanceOffset.xy;

  newUv.x /= uGridSize.x; 
  newUv.y /= uGridSize.y;

  newUv.x += newOffset.x;
  newUv.y += newOffset.y; 

  vec2 mouseUv = newUv + uUvOffset.xy;

  mouseUv /= uUvOffsetScale;
  
  vec4 mouseSim = texture2D(tMouseSim, mouseUv);
  
  vec4 instancePos = instanceMatrix[3];
  
  vec2 perlinUv = newUv * .75;
  vec4 perlin = texture2D(tPerlin, perlinUv - uTime * .05);



  float revealCombined = uReveal * uRevealProject;

  // vec2 displacementPos = instancePos.xy + uTime;
  float perlinDisplacementHeight = 10.;
  float perlinDisplacement =  (perlin.x * perlinDisplacementHeight);
  float toCenter = length(instancePos.xy);
  float fadeScale = (revealCombined * 5.75) - (toCenter * (revealCombined / 5.75));
  float fade = clamp(fadeScale, .0, 1.05);


  perlinDisplacement *= fade;

  float perlinScaleDisplacement = min(1., 1. - (perlinDisplacement -  (perlinDisplacementHeight / 2.)) * .1);

  vec3 perlinDisplaced = vec3(transformed);
  perlinDisplaced.z += perlinDisplacement - (perlinDisplacementHeight / 2.);
  perlinDisplaced *= perlinScaleDisplacement;

  transformed *= 1. - mouseSim.r * .05;

  
  // float toCenter = length(instancePos.xy);
  float fadeDiplacementScale = (revealCombined * 4.85) - (toCenter * (revealCombined / 4.85));
  float fadeDiplacement = clamp(fadeDiplacementScale, -1.0, 1.0);
  
  transformed = mix(transformed, perlinDisplaced, (1. - fadeDiplacement) * .25);
  transformed *= fade;
  transformed *= uRevealSides;
  
  float mouseTransform = mouseSim.r * 15.;
  
  vec4 displacement = texture2D(tDisplacement, newUv);  
  float displacementF = displacement.r;

  // vec2 displacementUv = newUv;
  // vec4 displacement = texture2D(tPerlin, displacementUv - uTime * .05);
  // float displacementF = displacement.r * 5.0;

  float waveDisplacement = displacementF * 3.0 + 6. * (1. - revealCombined);

  transformed.z -= 1.5;
  transformed.z += waveDisplacement;
  transformed.z += mouseTransform * uMouseFactor;
  transformed *= 1. - displacementF * .1;

  float spread = 3.;

  vec3 transformedSpread = transformed;

  transformedSpread.x -= instanceColor.x * spread;
  transformedSpread.x += spread / 2.0;
  transformedSpread.y -= instanceColor.y * spread;
  transformedSpread.y += spread / 2.0;
  transformedSpread.z -= instanceColor.z * spread;
  transformedSpread.z += spread / 2.0;

  transformed = mix(transformedSpread, transformed, uRevealSpreadSides);
  transformed = mix(transformedSpread, transformed, 1. - uRevealSpread);
  
  vec4 mvPosition = vec4( transformed, 1.0 );

  #ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
  #endif

  mvPosition = modelViewMatrix * mvPosition;
  gl_Position = projectionMatrix * mvPosition;

	vViewPosition = - mvPosition.xyz;

  transformed /= 1. - mouseSim.r * .2;
  vec4 worldPosition = vec4( transformed, 1.0 );
  
  worldPosition = instanceMatrix * worldPosition;
  worldPosition = modelMatrix * worldPosition;
  
	#include <shadowmap_vertex>
	#include <fog_vertex>
  vInstanceIndex = instanceIndex;
  vInstanceAlpha = instanceAlpha;
  vOffset = instanceOffset;

  #ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
  #endif
  vPosition = position;
  vInstanceColor = instanceColor;
}
`;class VA extends Ao{constructor(e){super(e),this.dithering=!0,this.transparent=!0,this.envMapIntensity=.75,this.roughness=1,this.mouse=new Q(Pe.mouse.x*Pe.dpr,Pe.mouse.y*Pe.dpr),this.depthTest=!1,this.depthWrite=!1,this.customUniforms={uTime:new I(0),uCoords:new I(new Q),uGridSize:new I(new L),uGridOffset:new I(new L),tMouseSim:new I(null),tMouseSim2:new I(null),uMouseSpeed:new I(null),uMouseFactor:new I(0),uMouseLightness:new I(1),uUvOffset:new I(new Q),uUvOffsetScale:new I(1),uReveal:new I(0),uRevealProject:new I(1),uRevealSides:new I(0),uRevealSpreadSides:new I(0),uRevealSpread:new I(0),tPerlin:new I(Xt.perlin1),tDisplacement:new I(null)},this.onBeforeCompile=t=>{t.uniforms.uGridSize=this.customUniforms.uGridSize,t.uniforms.uGridOffset=this.customUniforms.uGridOffset,t.uniforms.uTime=this.customUniforms.uTime,t.uniforms.uCoords=this.customUniforms.uCoords,t.uniforms.tMouseSim=this.customUniforms.tMouseSim,t.uniforms.tMouseSim2=this.customUniforms.tMouseSim2,t.uniforms.uMouseSpeed=this.customUniforms.uMouseSpeed,t.uniforms.uUvOffset=this.customUniforms.uUvOffset,t.uniforms.uUvOffsetScale=this.customUniforms.uUvOffsetScale,t.uniforms.uReveal=this.customUniforms.uReveal,t.uniforms.uRevealSides=this.customUniforms.uRevealSides,t.uniforms.uRevealProject=this.customUniforms.uRevealProject,t.uniforms.uRevealSpread=this.customUniforms.uRevealSpread,t.uniforms.uRevealSpreadSides=this.customUniforms.uRevealSpreadSides,t.uniforms.tPerlin=this.customUniforms.tPerlin,t.uniforms.tDisplacement=this.customUniforms.tDisplacement,t.uniforms.uMouseFactor=this.customUniforms.uMouseFactor,t.uniforms.uMouseLightness=this.customUniforms.uMouseLightness,t.vertexShader=HA,t.fragmentShader=zA}}update(e,t,n,i){this.mouse.x=zn(this.mouse.x,Pe.mouse.x,.1),this.mouse.y=zn(this.mouse.y,Pe.mouse.y,.1),this.customUniforms.uTime.value=e,this.customUniforms.uCoords.value.set(Pe.w*i,Pe.h*i)}}class mg extends Vt{constructor(e,t,n,i,r){super(),this.type="RoundedBoxGeometry",r=isNaN(r)?1:Math.max(1,Math.floor(r)),e=isNaN(e)?1:e,t=isNaN(t)?1:t,n=isNaN(n)?1:n,i=isNaN(i)?.15:i,i=Math.min(i,Math.min(e,Math.min(t,Math.min(n)))/2);var o=e/2-i,a=t/2-i,c=n/2-i;this.parameters={width:e,height:t,depth:n,radius:i,radiusSegments:r};var u=r+1,d=u*r+1<<3,l=new It(new Float32Array(d*3),3),h=new It(new Float32Array(d*3),3),f=new It(new Float32Array(d*2),2),g=[],v=[];new L;var m=new L,p=[],x=[],_=[],S=u*r,M=u*r+1;E(),C(),w(),y(),U(),b();function E(){for(var O=[new L(1,1,1),new L(1,1,-1),new L(-1,1,-1),new L(-1,1,1),new L(1,-1,1),new L(1,-1,-1),new L(-1,-1,-1),new L(-1,-1,1)],F=0;F<8;F++)g.push([]),v.push([]);for(var k=Math.PI/2,j=new L(o,a,c),D=0;D<=r;D++){var K=D/r,q=K*k,te=Math.cos(q),ve=Math.sin(q);if(D==r){m.set(0,1,0);var re=m.clone().multiplyScalar(i).add(j);g[0].push(re),p.push(re);var N=m.clone();v[0].push(N),x.push(N);continue}for(var Y=0;Y<=r;Y++){var ae=Y/r,le=ae*k;m.x=te*Math.cos(le),m.y=ve,m.z=te*Math.sin(le);var re=m.clone().multiplyScalar(i).add(j);g[0].push(re),p.push(re);var N=m.clone().normalize();v[0].push(N),x.push(N)}}for(var Ie=1;Ie<8;Ie++)for(var F=0;F<g[0].length;F++){var re=g[0][F].clone().multiply(O[Ie]);g[Ie].push(re),p.push(re);var N=v[0][F].clone().multiply(O[Ie]);v[Ie].push(N),x.push(N)}}function w(){for(var O=[!0,!1,!0,!1,!1,!0,!1,!0],F=u*(r-1),k=0;k<8;k++){for(var j=M*k,D=0;D<r-1;D++)for(var K=D*u,q=(D+1)*u,te=0;te<r;te++){var ve=te+1,re=j+K+te,N=j+K+ve,Y=j+q+te,ae=j+q+ve;O[k]?(_.push(re),_.push(Y),_.push(N),_.push(N),_.push(Y),_.push(ae)):(_.push(re),_.push(N),_.push(Y),_.push(N),_.push(ae),_.push(Y))}for(var te=0;te<r;te++){var re=j+F+te,N=j+F+te+1,Y=j+S;O[k]?(_.push(re),_.push(Y),_.push(N)):(_.push(re),_.push(N),_.push(Y))}}}function C(){var O=S,F=S+M,k=S+M*2,j=S+M*3;_.push(O),_.push(F),_.push(k),_.push(O),_.push(k),_.push(j),O=S+M*4,F=S+M*5,k=S+M*6,j=S+M*7,_.push(O),_.push(k),_.push(F),_.push(O),_.push(j),_.push(k),O=0,F=M,k=M*4,j=M*5,_.push(O),_.push(k),_.push(F),_.push(F),_.push(k),_.push(j),O=M*2,F=M*3,k=M*6,j=M*7,_.push(O),_.push(k),_.push(F),_.push(F),_.push(k),_.push(j),O=r,F=r+M*3,k=r+M*4,j=r+M*7,_.push(O),_.push(F),_.push(k),_.push(F),_.push(j),_.push(k),O=r+M,F=r+M*2,k=r+M*5,j=r+M*6,_.push(O),_.push(k),_.push(F),_.push(F),_.push(k),_.push(j)}function y(){for(var O=0;O<4;O++)for(var F=O*M,k=4*M+F,j=O&!0,D=0;D<r;D++){var K=D+1,q=F+D,te=F+K,ve=k+D,re=k+K;j?(_.push(q),_.push(ve),_.push(te),_.push(te),_.push(ve),_.push(re)):(_.push(q),_.push(te),_.push(ve),_.push(te),_.push(re),_.push(ve))}}function b(){for(var O=[0,2,4,6],F=[1,3,5,7],k=0;k<4;k++)for(var j=M*O[k],D=M*F[k],K=1>=k,q=0;q<r;q++){var te=q*u,ve=(q+1)*u,re=j+te,N=j+ve,Y=D+te,ae=D+ve;K?(_.push(re),_.push(Y),_.push(N),_.push(N),_.push(Y),_.push(ae)):(_.push(re),_.push(N),_.push(Y),_.push(N),_.push(ae),_.push(Y))}}function U(){for(var O=r-1,F=[0,1,4,5],k=[3,2,7,6],j=[0,1,1,0],D=0;D<4;D++)for(var K=F[D]*M,q=k[D]*M,te=0;te<=O;te++){var ve=K+r+te*u,re=K+(te!=O?r+(te+1)*u:M-1),N=q+r+te*u,Y=q+(te!=O?r+(te+1)*u:M-1);j[D]?(_.push(ve),_.push(N),_.push(re),_.push(re),_.push(N),_.push(Y)):(_.push(ve),_.push(re),_.push(N),_.push(re),_.push(Y),_.push(N))}}for(var z=0,P=0;P<p.length;P++)l.setXYZ(z,p[P].x,p[P].y,p[P].z),h.setXYZ(z,x[P].x,x[P].y,x[P].z),f.setXY(z,.5,.5),z++;this.setIndex(new It(new Uint16Array(_),1)),this.setAttribute("position",l),this.setAttribute("normal",h),this.setAttribute("uv",f)}}class GA extends rt{constructor(e){super(),this.gl=e,this.settings={xNum:35,yNum:23,zNum:Le.LOW_RES?4:7,size:1.25,spacing:.1,scale:.09},this.rotationWrap=new rt,this.createCube(),this.createInstancedMesh(),this.positionInstancedMesh(),this.createInstancedAttributes(),this.createPlane(),this.mouseSpeed=0,this.mouseSim=new Ka({renderer:e.renderer,camera:e.camera,mesh:this.plane,persistance:.85,thickness:.1,rayCastMesh:this.rayPlane})}createPlane(){this.planeGeometry=new Rn,this.rayPlaneGeometry=new Rn,this.planeMaterial=new Cn({uniforms:{uUvOffset:{value:new Q(0,0)},tMouseSim:{value:null},uTime:{value:0},uRatio:{value:1}},vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform vec2 uUvOffset;
        uniform float uTime;
        uniform sampler2D tMouseSim;
        varying vec2 vUv;
        uniform float uRatio;
        void main() {
          vec2 uvOff = vUv;
          
          uvOff.x -= 0.5;
          uvOff.x *= uRatio;
          uvOff.x += 0.5;
          
          vec2 p = uvOff.xy * 2. - 1.0;
          float r = length(p) * 0.9;
          vec3 color = vec3(0.24, 0.7, 0.4);
          
          float a = pow(r, .25);
          float b = sin(r * 0.8 - 1.6);
          float c = sin(r - .010);
          float s = sin(a - uTime * 1. + b);
          
          color *= abs(1. / (s * 10.8)) - 0.1;

          gl_FragColor = vec4(color, 1.);
        }
      `}),this.planeMaterial.transparent=!0,this.rayPlaneMaterial=new Ai,this.planeMaterial.depthTest=!1,this.planeMaterial.depthWrite=!1,this.rayPlaneMaterial.transparent=!0,this.rayPlaneMaterial.opacity=0,this.rayPlaneMaterial.depthTest=!1,this.rayPlaneMaterial.depthWrite=!1,this.plane=new at(this.planeGeometry,this.planeMaterial),this.rayPlane=new at(this.rayPlaneGeometry,this.rayPlaneMaterial);const e=1.3;this.plane.scale.set(35*e,23*e,1),this.plane.position.set(0,0,23*1.3/2),this.rayPlane.scale.set(35*e,23*e,1),this.rayPlane.position.set(0,0,23*e/2+.01),this.planeMaterial.uniforms.uRatio.value=35/23;const t=1.5;this.rayPlane.scale.multiplyScalar(t),this.material.customUniforms.uUvOffset.value.x=(this.rayPlane.scale.x-this.plane.scale.x)/2/this.plane.scale.x,this.material.customUniforms.uUvOffset.value.y=(this.rayPlane.scale.y-this.plane.scale.y)/2/this.plane.scale.y,this.material.customUniforms.uUvOffsetScale.value=t,this.rotationWrap.add(this.rayPlane),this.add(this.rotationWrap)}createCube(){const{size:e}=this.settings;this.geometry=new mg(e,e,e,.05),this.material=new VA({color:new ye("#808080")}),this.material.customUniforms.uGridSize.value=new L(this.settings.xNum,this.settings.yNum,this.settings.zNum)}createInstancedMesh(){const{xNum:e,yNum:t,zNum:n,scale:i}=this.settings;this.instanceCount=e*t*n,this.mesh=new $a(this.geometry,this.material,this.instanceCount),this.rotationWrap.add(this.mesh),this.rotationWrap.scale.set(i,i,i)}createInstancedAttributes(){const e=new Float32Array(this.instanceCount),t=new Float32Array(this.instanceCount*3),n=new Float32Array(this.instanceCount);for(let i=0;i<this.instanceCount;i++)e[i]=i,t[i*3+0]=Math.random(),t[i*3+1]=Math.random(),t[i*3+2]=Math.random(),n[i]=Math.random();this.geometry.setAttribute("instanceIndex",new un(e,1)),this.geometry.setAttribute("instanceColor",new un(t,3)),this.geometry.setAttribute("instanceAlpha",new un(n,1))}positionInstancedMesh(){const e=new Ce;let t=0;const{xNum:n,yNum:i,zNum:r,spacing:o,size:a}=this.settings,c=a+o,u=(n-1)*c,d=(i-1)*c,l=(r-1)*c,h=u/2,f=d/2,g=l/2,v=new Float32Array(this.instanceCount*3);for(let m=0;m<r;m++)for(let p=0;p<n;p++)for(let x=0;x<i;x++)e.setPosition(p*c-h,x*c-f,m*c-g),this.mesh.setMatrixAt(t,e),v[t*3+0]=p/n,v[t*3+1]=x/i,v[t*3+2]=m/r,t++;this.geometry.setAttribute("instanceOffset",new un(v,3))}resize(e,t,n){this.mouseSim.onResize(this.plane.scale.x,this.plane.scale.y)}update(e,t,n,i){this.material.update(e,t,n,i),this.mouseSim.update(e,t,n,i),this.material.customUniforms.tMouseSim.value=this.mouseSim.bufferSim.output.texture,this.mouseSpeed=Yi(this.mouseSpeed,this.mouseSim.simulationMaterial.uniforms.uSpeed.value,10,t),this.material.customUniforms.uMouseSpeed.value=this.mouseSpeed,this.planeMaterial.uniforms.uTime.value=e,this.material.customUniforms.tDisplacement.value=J.wavvesScene.renderManager.renderTargetComposite.texture}}const WA=`
varying float vInstanceIndex;
varying float vInstanceAlpha;
varying vec3 vPosition;
varying vec3 vOffset;
uniform vec3 uGridSize;
uniform vec3 uGridOffset;
uniform float uTime;
uniform float uMouseFactor;
uniform float uMouseLightness;
uniform vec2 uCoords;
uniform float uReveal;
uniform float uScrollOpacity;
varying vec2 vUv;
uniform sampler2D tMouseSim2;
uniform sampler2D tDisplacement;

#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
uniform float ior;
#endif
#ifdef SPECULAR
uniform float specularIntensity;
uniform vec3 specularColor;
	#ifdef USE_SPECULARINTENSITYMAP
uniform sampler2D specularIntensityMap;
	#endif
	#ifdef USE_SPECULARCOLORMAP
uniform sampler2D specularColorMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
uniform float clearcoat;
uniform float clearcoatRoughness;
#endif
#ifdef USE_IRIDESCENCE
uniform float iridescence;
uniform float iridescenceIOR;
uniform float iridescenceThicknessMinimum;
uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
uniform vec3 sheenColor;
uniform float sheenRoughness;
	#ifdef USE_SHEENCOLORMAP
uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEENROUGHNESSMAP
uniform sampler2D sheenRoughnessMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
// #include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <bsdfs>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

float random(vec2 st)
{
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}


float vignette(vec2 coords, vec2 center, float vignin, float vignout, float vignfade, float fstop) {
  float dist = distance(coords.xy, center);
  dist = smoothstep(vignout + (fstop / vignfade), vignin + (fstop / vignfade), dist);
  return clamp(dist, 0.0, 1.0);
}


void main() {
	#include <clipping_planes_fragment>
  vec4 diffuseColor = vec4(diffuse, opacity);
  ReflectedLight reflectedLight = ReflectedLight(vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));
  vec3 totalEmissiveRadiance = emissive;

	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
  vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
  vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
  vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
  float sheenEnergyComp = 1.0 - 0.157 * max3(material.sheenColor);
  outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecular;
	#endif
	#ifdef USE_CLEARCOAT
  float dotNVcc = saturate(dot(geometry.clearcoatNormal, geometry.viewDir));
  vec3 Fcc = F_Schlick(material.clearcoatF0, material.clearcoatF90, dotNVcc);
  outgoingLight = outgoingLight * (1.0 - material.clearcoat * Fcc) + clearcoatSpecular * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>

  float mixedAlpha = vInstanceAlpha;
  vec2 newUv = vUv;
  vec2 newOffset = vOffset.xy;

  newUv.x /= uGridSize.x; 
  newUv.y /= uGridSize.y;

  newUv.x += newOffset.x;
  newUv.y += newOffset.y; 
 
  vec2 gridUv = vec2(floor(newUv.x * uGridSize.x), floor(newUv.y * uGridSize.y));
  vec2 gridUv2 = vec2(floor(newUv.y * uGridSize.y), floor(newUv.x * uGridSize.y));

  float alpha = mix(random(gridUv * vInstanceAlpha), random(gridUv), 1.);
  float alpha2 = mix(random(gridUv2 * vInstanceAlpha), random(gridUv2), 1.);

  vec2 screenUv = gl_FragCoord.xy / uCoords.xy;
  vec4 mouseSim = texture2D(tMouseSim2, screenUv);
  vec4 displacement = texture2D(tDisplacement, newUv);

  float revealCombined = 1.;
  float mouseF = 1. - mouseSim.r;

  mixedAlpha =  ((alpha * alpha2) * vInstanceAlpha);
  if(screenUv.y > 0.1) mixedAlpha += clamp(mouseSim.r * (uMouseFactor * 0.15), 0., 1.);
  gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * vec3(mouseF), (1. - uMouseLightness));
  
  float vignin = 0.01;
  float vignout = 0.2;
  float vignfade = 6.;
  float fstop = 1.0;

  vec2 center = vec2(0.5, 0.5);

  float v = vignette(newUv.xy, center.xy, 0.01, 0.2,  6., 1.0);
  float v2 = vignette(newUv.xy, center.xy, 0.01, 2.0 * pow(revealCombined, .25),  6. , 1.0);

  mixedAlpha += v * .1;
  mixedAlpha -= 1. - v2;

  gl_FragColor.a = mixedAlpha * uScrollOpacity;
}
`,jA=`
attribute float instanceIndex;
attribute float instanceAlpha;
attribute vec3 instanceColor;
attribute vec3 instanceOffset;
varying float vInstanceIndex;  
varying float vInstanceAlpha;
varying vec3 vPosition;
varying vec3 vOffset;
varying vec2 vUv;
uniform vec2 uCoords;
uniform float uTime;
uniform float uMouseFactor;
uniform sampler2D tDisplacement;
uniform sampler2D tMouseSim;
uniform sampler2D tPerlin;
uniform vec3 uGridSize;
uniform vec3 uGridOffset;
uniform vec3 uUvOffset;
uniform float uUvOffsetScale;
uniform float uReveal;
uniform float uRevealSpread;
#define STANDARD
varying vec3 vViewPosition;
varying float vNoise;

#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {
  vUv = uv;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>

  vec2 screenUv = gl_Position.xy / uCoords.xy;
  
  vec2 newUv = screenUv;
  vec2 newOffset = instanceOffset.xy;

  newUv.x /= uGridSize.x; 
  newUv.y /= uGridSize.y;

  newUv.x += newOffset.x;
  newUv.y += newOffset.y; 

  vec2 mouseUv = newUv + uUvOffset.xy;

  mouseUv /= uUvOffsetScale;
  
  vec4 mouseSim = texture2D(tMouseSim, mouseUv);
  
  vec4 instancePos = instanceMatrix[3];
  
  vec2 perlinUv = newUv * .75;
  vec4 perlin = texture2D(tPerlin, perlinUv - uTime * .05);
  float revealCombined = uReveal;

  float perlinDisplacementHeight = 10.;
  float perlinDisplacement =  (perlin.x * perlinDisplacementHeight);
  float toCenter = length(instancePos.xy);

  float perlinScaleDisplacement = min(1., 1. - (perlinDisplacement -  (perlinDisplacementHeight / 2.)) * .1);

  vec3 perlinDisplaced = vec3(transformed);
  perlinDisplaced.z += perlinDisplacement - (perlinDisplacementHeight / 2.);
  perlinDisplaced *= perlinScaleDisplacement;

  transformed *= 1. - mouseSim.r * .05;

  
  float fadeDiplacementScale = (revealCombined * 4.85) - (toCenter * (revealCombined / 4.85));
  float fadeDiplacement = clamp(fadeDiplacementScale, -1.0, 1.0);
  
  transformed = mix(transformed, perlinDisplaced, (1. - fadeDiplacement) * 10.25);
  transformed *= uReveal;
  
  float mouseTransform = mouseSim.r * 15.;
  
  vec4 displacement = texture2D(tDisplacement, newUv);  
  float displacementF = displacement.r;

  float waveDisplacement = displacementF * 3.0 + 9. * (1. - revealCombined);

  transformed.z -= 1.5;
  transformed.z += waveDisplacement;
  transformed.z += mouseTransform * uMouseFactor;
  transformed *= 1. - displacementF * .1;
  
  float spread = 3.;
  
  vec3 transformedSpread = transformed;
  
  transformedSpread.x -= instanceColor.x * spread;
  transformedSpread.x += spread / 2.0;
  transformedSpread.y -= instanceColor.y * spread;
  transformedSpread.y += spread / 2.0;
  transformedSpread.z -= instanceColor.z * spread;
  transformedSpread.z += spread / 2.0;
  
  transformed = mix(transformedSpread, transformed, 1. - uRevealSpread);
  
  vec4 mvPosition = vec4( transformed, 1.0 );


  #ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
  #endif

  mvPosition = modelViewMatrix * mvPosition;
  gl_Position = projectionMatrix * mvPosition;

	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	vViewPosition = - mvPosition.xyz;

  transformed /= 1. - mouseSim.r * .2;
  vec4 worldPosition = vec4( transformed, 1.0 );
  
  worldPosition = instanceMatrix * worldPosition;
  worldPosition = modelMatrix * worldPosition;
  
	#include <shadowmap_vertex>
	#include <fog_vertex>
  vInstanceIndex = instanceIndex;
  vInstanceAlpha = instanceAlpha;
  vOffset = instanceOffset;

  #ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
  #endif
  vPosition = position;
}
`;class XA extends Vn{constructor(e){super(e),this.dithering=!0,this.transparent=!0,this.envMapIntensity=.75,this.roughness=1,this.mouse=new Q(Pe.mouse.x*Pe.dpr,Pe.mouse.y*Pe.dpr),this.depthTest=!1,this.renderOrder=10,this.depthWrite=!1,this.customUniforms={uTime:new I(0),uMouse:new I(new Q),uCoords:new I(new Q),uGridSize:new I(new L),uGridOffset:new I(new L),tMouseSim:new I(null),tMouseSim2:new I(null),uMouseSpeed:new I(null),uMouseFactor:new I(1),uMouseLightness:new I(1),uUvOffset:new I(new Q),uUvOffsetScale:new I(1),uReveal:new I(0),uRevealSpread:new I(1),tPerlin:new I(Xt.perlin1),tDisplacement:new I(null),uScrollOpacity:new I(1)},this.onBeforeCompile=t=>{t.uniforms.uGridSize=this.customUniforms.uGridSize,t.uniforms.uGridOffset=this.customUniforms.uGridOffset,t.uniforms.uTime=this.customUniforms.uTime,t.uniforms.uMouse=this.customUniforms.uMouse,t.uniforms.uCoords=this.customUniforms.uCoords,t.uniforms.tMouseSim=this.customUniforms.tMouseSim,t.uniforms.tMouseSim2=this.customUniforms.tMouseSim2,t.uniforms.uMouseSpeed=this.customUniforms.uMouseSpeed,t.uniforms.uUvOffset=this.customUniforms.uUvOffset,t.uniforms.uUvOffsetScale=this.customUniforms.uUvOffsetScale,t.uniforms.uReveal=this.customUniforms.uReveal,t.uniforms.uRevealSpread=this.customUniforms.uRevealSpread,t.uniforms.tPerlin=this.customUniforms.tPerlin,t.uniforms.tDisplacement=this.customUniforms.tDisplacement,t.uniforms.uMouseFactor=this.customUniforms.uMouseFactor,t.uniforms.uMouseLightness=this.customUniforms.uMouseLightness,t.uniforms.uScrollOpacity=this.customUniforms.uScrollOpacity,t.vertexShader=jA,t.fragmentShader=WA}}update(e,t,n,i){this.mouse.x=zn(this.mouse.x,Pe.mouse.x,.1),this.mouse.y=zn(this.mouse.y,Pe.mouse.y,.1),this.customUniforms.uTime.value=e,this.customUniforms.uCoords.value.set(Pe.w*i,Pe.h*i)}}class $A extends rt{constructor(e){super(),this.gl=e,this.settings={xNum:23,yNum:23,zNum:(Le.LOW_RES,4),size:1.25,spacing:.1,scale:.09},this.track=null,this.bounds=this.track&&this.track.getBoundingClientRect(),this.offset=new Q,this.translation=new Q,this.trackScaleF=.005,this.scroll=window.scrollY,this.rotationWrap=new rt,this.scaleWrap=new rt,this.createCube(),this.createInstancedMesh(),this.positionInstancedMesh(),this.createInstancedAttributes(),this.createPlane(),this.mouseSpeed=0,this.mouseSim=new Ka({renderer:e.renderer,camera:e.camera,mesh:this.plane,persistance:.85,thickness:.1,rayCastMesh:this.rayPlane})}createPlane(){this.planeGeometry=new Rn,this.rayPlaneGeometry=new Rn,this.planeMaterial=new Cn({uniforms:{uUvOffset:{value:new Q(0,0)},tMouseSim:{value:null},uTime:{value:0},uRatio:{value:1}},vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform vec2 uUvOffset;
        uniform float uTime;
        uniform sampler2D tMouseSim;
        varying vec2 vUv;
        uniform float uRatio;
        void main() {
          vec2 uvOff = vUv;
          
          uvOff.x -= 0.5;
          uvOff.x *= uRatio;
          uvOff.x += 0.5;
          
          vec2 p = uvOff.xy * 2. - 1.0;
          float r = length(p) * 0.9;
          vec3 color = vec3(0.24, 0.7, 0.4);
          
          float a = pow(r, .25);
          float b = sin(r * 0.8 - 1.6);
          float c = sin(r - .010);
          float s = sin(a - uTime * 1. + b);
          
          color *= abs(1. / (s * 10.8)) - 0.1;

          gl_FragColor = vec4(color, 1.);
        }
      `}),this.planeMaterial.transparent=!0,this.rayPlaneMaterial=new Ai,this.planeMaterial.depthTest=!1,this.planeMaterial.depthWrite=!1,this.rayPlaneMaterial.transparent=!0,this.rayPlaneMaterial.opacity=0,this.rayPlaneMaterial.depthTest=!1,this.rayPlaneMaterial.depthWrite=!1,this.plane=new at(this.planeGeometry,this.planeMaterial),this.rayPlane=new at(this.rayPlaneGeometry,this.rayPlaneMaterial);const e=1;this.plane.scale.set(this.settings.xNum*e,this.settings.yNum*e,1),this.plane.position.set(0,0,this.settings.zNum*1.3/2),this.rayPlane.scale.set(this.settings.xNum*e,this.settings.yNum*e,1),this.rayPlane.position.set(0,0,this.settings.zNum*e/2+.01),this.planeMaterial.uniforms.uRatio.value=1;const t=1.5;this.rayPlane.scale.multiplyScalar(t),this.rotationWrap.add(this.rayPlane),this.scaleWrap.add(this.rotationWrap),this.scaleWrap.scale.set(.35,.35,.35),this.add(this.scaleWrap)}createCube(){const{size:e}=this.settings;this.geometry=new mg(e,e,e,.05),this.material=new XA({color:8421504}),this.material.customUniforms.uGridSize.value=new L(this.settings.xNum,this.settings.yNum,this.settings.zNum)}createInstancedMesh(){const{xNum:e,yNum:t,zNum:n,scale:i}=this.settings;this.instanceCount=e*t*n,this.mesh=new $a(this.geometry,this.material,this.instanceCount),this.rotationWrap.add(this.mesh),this.rotationWrap.scale.set(i,i,i)}createInstancedAttributes(){const e=new Float32Array(this.instanceCount),t=new Float32Array(this.instanceCount*3),n=new Float32Array(this.instanceCount);for(let i=0;i<this.instanceCount;i++)e[i]=i,t[i*3+0]=Math.random(),t[i*3+1]=Math.random(),t[i*3+2]=Math.random(),n[i]=Math.random();this.geometry.setAttribute("instanceIndex",new un(e,1)),this.geometry.setAttribute("instanceColor",new un(t,3)),this.geometry.setAttribute("instanceAlpha",new un(n,1))}positionInstancedMesh(){const e=new Ce;let t=0;const{xNum:n,yNum:i,zNum:r,spacing:o,size:a}=this.settings,c=a+o,u=Math.min(n,i)*c/2,d=(n-1)*c,l=(i-1)*c,h=(r-1)*c,f=d/2,g=l/2,v=new Float32Array(this.instanceCount*3);for(let m=0;m<r;m++)for(let p=0;p<n;p++)for(let x=0;x<i;x++){const _=p*c-f,S=x*c-g,M=m*c-h/2;_*_+S*S<=u*u&&(e.setPosition(_,S,M),this.mesh.setMatrixAt(t,e),v[t*3+0]=p/n,v[t*3+1]=x/i,v[t*3+2]=m/r,t++)}this.geometry.setAttribute("instanceOffset",new un(v,3))}update(e,t,n,i){this.material.update(e,t,n,i),this.mouseSim.update(e,t,n),this.material.customUniforms.tMouseSim.value=this.mouseSim.bufferSim.output.texture,this.mouseSpeed=Yi(this.mouseSpeed,this.mouseSim.simulationMaterial.uniforms.uSpeed.value,10,t),this.material.customUniforms.uMouseSpeed.value=this.mouseSpeed,this.planeMaterial.uniforms.uTime.value=e,this.material.customUniforms.tDisplacement.value=J.wavvesScene.renderManager.renderTargetComposite.texture,this.updateScroll()}getTrack(e){this.track=document.body.querySelector(e)}updateScroll(e){}updateScroll(e=window.scrollY){Le.BREAKPOINTS.LG<=window.innerWidth?this.scroll=e:this.scroll=0,this.position.x=this.offset.x+this.translation.x,this.position.y=this.offset.y+this.translation.y+this.scroll*this.trackScaleF}resize(e,t,n){if(this.mouseSim.onResize(this.plane.scale.x,this.plane.scale.y),!this.track)return;const i=this.track.getBoundingClientRect();this.bounds={width:i.width,height:i.height,top:i.top+window.scrollY,left:i.left},this.offset.set((-e/2+this.bounds.width/2+this.bounds.left)*this.trackScaleF,(t/2-this.bounds.height/2-this.bounds.top)*this.trackScaleF),this.scale.set(this.bounds.width*this.trackScaleF,this.bounds.width*this.trackScaleF,this.bounds.width*this.trackScaleF)}}const qA=`
varying float vInstanceIndex;
varying float vInstanceAlpha;
varying vec3 vPosition;
varying vec3 vOffset;
uniform vec3 uGridSize;
uniform vec3 uGridOffset;
uniform float uTime;
uniform float uMouseFactor;
uniform float uMouseLightness;
uniform vec2 uCoords;
uniform float uReveal;
uniform float uScrollOpacity;
varying vec2 vUv;
uniform sampler2D tMouseSim2;
uniform sampler2D tDisplacement;

#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
uniform float ior;
#endif
#ifdef SPECULAR
uniform float specularIntensity;
uniform vec3 specularColor;
	#ifdef USE_SPECULARINTENSITYMAP
uniform sampler2D specularIntensityMap;
	#endif
	#ifdef USE_SPECULARCOLORMAP
uniform sampler2D specularColorMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
uniform float clearcoat;
uniform float clearcoatRoughness;
#endif
#ifdef USE_IRIDESCENCE
uniform float iridescence;
uniform float iridescenceIOR;
uniform float iridescenceThicknessMinimum;
uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
uniform vec3 sheenColor;
uniform float sheenRoughness;
	#ifdef USE_SHEENCOLORMAP
uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEENROUGHNESSMAP
uniform sampler2D sheenRoughnessMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
// #include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <bsdfs>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

float random(vec2 st)
{
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}


float vignette(vec2 coords, vec2 center, float vignin, float vignout, float vignfade, float fstop) {
  float dist = distance(coords.xy, center);
  dist = smoothstep(vignout + (fstop / vignfade), vignin + (fstop / vignfade), dist);
  return clamp(dist, 0.0, 1.0);
}


void main() {
	#include <clipping_planes_fragment>
  vec4 diffuseColor = vec4(diffuse, opacity);
  ReflectedLight reflectedLight = ReflectedLight(vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));
  vec3 totalEmissiveRadiance = emissive;

	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
  vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
  vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
  vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
  float sheenEnergyComp = 1.0 - 0.157 * max3(material.sheenColor);
  outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecular;
	#endif
	#ifdef USE_CLEARCOAT
  float dotNVcc = saturate(dot(geometry.clearcoatNormal, geometry.viewDir));
  vec3 Fcc = F_Schlick(material.clearcoatF0, material.clearcoatF90, dotNVcc);
  outgoingLight = outgoingLight * (1.0 - material.clearcoat * Fcc) + clearcoatSpecular * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>

  float mixedAlpha = vInstanceAlpha;
  vec2 newUv = vUv;
  vec2 newOffset = vOffset.xy;

  newUv.x /= uGridSize.x; 
  newUv.y /= uGridSize.y;

  newUv.x += newOffset.x;
  newUv.y += newOffset.y; 
 
  vec2 gridUv = vec2(floor(newUv.x * uGridSize.x), floor(newUv.y * uGridSize.y));
  vec2 gridUv2 = vec2(floor(newUv.y * uGridSize.y), floor(newUv.x * uGridSize.y));

  float alpha = mix(random(gridUv * vInstanceAlpha), random(gridUv), 1.);
  float alpha2 = mix(random(gridUv2 * vInstanceAlpha), random(gridUv2), 1.);

  // create a vignette
  
  // get screen uv
  vec2 screenUv = gl_FragCoord.xy / uCoords.xy;
  vec4 mouseSim = texture2D(tMouseSim2, screenUv);
  vec4 displacement = texture2D(tDisplacement, newUv);

  float revealCombined = 1.;
  float mouseF = 1. - mouseSim.r;

  mixedAlpha =  ((alpha * alpha2) * vInstanceAlpha);
  if(screenUv.y > 0.1) mixedAlpha += clamp(mouseSim.r * (uMouseFactor * 0.15), 0., 1.);
  gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * vec3(mouseF), (1. - uMouseLightness));
  
  float vignin = 0.01;
  float vignout = 0.2;
  float vignfade = 6.;
  float fstop = 1.0;

  vec2 center = vec2(0.5, 0.5);

  float v = vignette(newUv.xy, center.xy, 0.01, 0.2,  6., 1.0);
  float v2 = vignette(newUv.xy, center.xy, 0.01, 2.0 * pow(revealCombined, .25),  6. , 1.0);

  mixedAlpha += v * .1;
  mixedAlpha -= 1. - v2;

  mixedAlpha = clamp(mixedAlpha, 0.05, 1.);

  gl_FragColor.a = mixedAlpha * uReveal;
}
`,YA=`
attribute float instanceIndex;
attribute float instanceAlpha;
attribute vec3 instanceColor;
attribute vec3 instanceOffset;
varying float vInstanceIndex;  
varying float vInstanceAlpha;
varying vec3 vPosition;
varying vec3 vOffset;
varying vec2 vUv;
uniform vec2 uCoords;
uniform float uTime;
uniform float uMouseFactor;
uniform sampler2D tDisplacement;
uniform sampler2D tMouseSim;
uniform sampler2D tPerlin;
uniform vec3 uGridSize;
uniform vec3 uGridOffset;
uniform vec3 uUvOffset;
uniform float uUvOffsetScale;
uniform float uReveal;
uniform float uRevealSpread;
#define STANDARD
varying vec3 vViewPosition;
varying float vNoise;

#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {
  vUv = uv;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>

  vec2 screenUv = gl_Position.xy / uCoords.xy;
  
  vec2 newUv = screenUv;
  vec2 newOffset = instanceOffset.xy;

  newUv.x /= uGridSize.x; 
  newUv.y /= uGridSize.y;

  newUv.x += newOffset.x;
  newUv.y += newOffset.y; 

  vec2 mouseUv = newUv + uUvOffset.xy;

  mouseUv /= uUvOffsetScale;
  
  vec4 mouseSim = texture2D(tMouseSim, mouseUv);
  
  vec4 instancePos = instanceMatrix[3];
  
  vec2 perlinUv = newUv * .75;

  vec4 perlin = texture2D(tPerlin, perlinUv);

  float perlinDisplacementHeight = 5.;
  float perlinDisplacement =  (perlin.x * perlinDisplacementHeight);
  float toCenter = length(instancePos.xy);

  float perlinScaleDisplacement = min(1., 1. - (perlinDisplacement -  (perlinDisplacementHeight / 2.)) * .1);

  vec3 perlinDisplaced = vec3(transformed);
  perlinDisplaced.z += perlinDisplacement - (perlinDisplacementHeight / 2.);
  perlinDisplaced *= perlinScaleDisplacement;

  
  float fadeDiplacementScale = 0.0;
  float fadeDiplacement = clamp(fadeDiplacementScale, -1.0, 1.0);
  
  transformed.z *= 7. *  (.5 + instanceColor.r);
  
  float mouseTransform = mouseSim.r * 15.;
  
  vec4 displacement = texture2D(tDisplacement, newUv);  
  
  float displacementF = displacement.r;
  float waveDisplacement = displacementF * 3.0 + 9. * (1.);
  float spread = 3.;
  
  vec3 transformedSpread = transformed;
  
  transformed = mix(transformedSpread, transformed, 1. - uRevealSpread);
  
  vec4 mvPosition = vec4( transformed, 1.0 );
  // mvPosition.z = mod(mvPosition.z + (uTime * instanceColor.r * 10.), 1000.) - 50.;


  #ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
  #endif

  mvPosition = modelViewMatrix * mvPosition;
  gl_Position = projectionMatrix * mvPosition;

	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	vViewPosition = - mvPosition.xyz;

  transformed /= 1. - mouseSim.r * .2;
  vec4 worldPosition = vec4( transformed, 1.0 );
  
  worldPosition = instanceMatrix * worldPosition;
  worldPosition = modelMatrix * worldPosition;
  
	#include <shadowmap_vertex>
	#include <fog_vertex>
  vInstanceIndex = instanceIndex;
  vInstanceAlpha = instanceAlpha;
  vOffset = instanceOffset;

  #ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
  #endif
  vPosition = position;
}
`;class KA extends Vn{constructor(e){super(e),this.dithering=!0,this.transparent=!0,this.envMapIntensity=.75,this.roughness=1,this.mouse=new Q(Pe.mouse.x*Pe.dpr,Pe.mouse.y*Pe.dpr),this.customUniforms={uTime:new I(0),uMouse:new I(new Q),uCoords:new I(new Q),uGridSize:new I(new L),uGridOffset:new I(new L),tMouseSim:new I(null),tMouseSim2:new I(null),uMouseSpeed:new I(null),uMouseFactor:new I(1),uMouseLightness:new I(1),uUvOffset:new I(new Q),uUvOffsetScale:new I(1),uReveal:new I(0),uRevealSpread:new I(10),uRevealProject:new I(1),uRevealSides:new I(1),tPerlin:new I(Xt.perlin1),tDisplacement:new I(null),uScrollOpacity:new I(1)},this.onBeforeCompile=t=>{t.uniforms.uGridSize=this.customUniforms.uGridSize,t.uniforms.uGridOffset=this.customUniforms.uGridOffset,t.uniforms.uTime=this.customUniforms.uTime,t.uniforms.uMouse=this.customUniforms.uMouse,t.uniforms.uCoords=this.customUniforms.uCoords,t.uniforms.tMouseSim=this.customUniforms.tMouseSim,t.uniforms.tMouseSim2=this.customUniforms.tMouseSim2,t.uniforms.uMouseSpeed=this.customUniforms.uMouseSpeed,t.uniforms.uUvOffset=this.customUniforms.uUvOffset,t.uniforms.uUvOffsetScale=this.customUniforms.uUvOffsetScale,t.uniforms.uReveal=this.customUniforms.uReveal,t.uniforms.uRevealSpread=this.customUniforms.uRevealSpread,t.uniforms.tPerlin=this.customUniforms.tPerlin,t.uniforms.tDisplacement=this.customUniforms.tDisplacement,t.uniforms.uMouseFactor=this.customUniforms.uMouseFactor,t.uniforms.uMouseLightness=this.customUniforms.uMouseLightness,t.uniforms.uScrollOpacity=this.customUniforms.uScrollOpacity,t.vertexShader=YA,t.fragmentShader=qA}}update(e,t,n){this.mouse.x=zn(this.mouse.x,Pe.mouse.x,.1),this.mouse.y=zn(this.mouse.y,Pe.mouse.y,.1),this.customUniforms.uTime.value=e}}class ZA extends rt{constructor(e){super(),this.gl=e,this.settings={xNum:30,yNum:30,zNum:1,size:.5,spacing:.3,scale:.3,speed:1},this.track=null,this.bounds=this.track&&this.track.getBoundingClientRect(),this.offset=new Q,this.translationZ=0,this.trackScaleF=.005,this.scroll=window.scrollY,this.rotationWrap=new rt,this.scaleWrap=new rt,this.createCube(),this.createInstancedMesh(),this.positionInstancedMesh(),this.createInstancedAttributes(),this.update=this.update.bind(this)}createCube(){const{size:e}=this.settings;this.geometry=new Cr(e,e,e),this.material=new KA({color:8421504}),this.material.customUniforms.uGridSize.value=new L(this.settings.xNum,this.settings.yNum,this.settings.zNum)}createInstancedMesh(){const{xNum:e,yNum:t,zNum:n,scale:i}=this.settings;this.instanceCount=e*t*n,this.mesh=new $a(this.geometry,this.material,this.instanceCount),this.scaleWrap.add(this.mesh),this.scaleWrap.scale.set(i,i,i),this.add(this.scaleWrap)}createInstancedAttributes(){const e=new Float32Array(this.instanceCount);this.colors=new Float32Array(this.instanceCount*3);const t=new Float32Array(this.instanceCount);for(let n=0;n<this.instanceCount;n++)e[n]=n,this.colors[n*3+0]=Math.random(),this.colors[n*3+1]=Math.random(),this.colors[n*3+2]=Math.random(),t[n]=Math.random();this.geometry.setAttribute("instanceIndex",new un(e,1)),this.geometry.setAttribute("instanceColor",new un(this.colors,3)),this.geometry.setAttribute("instanceAlpha",new un(t,1))}positionInstancedMesh(){const e=new Ce;let t=0;const{xNum:n,yNum:i,zNum:r,spacing:o,size:a}=this.settings,c=a+o,u=(n-1)*c,d=(i-1)*c,l=(r-1)*c,h=u/2,f=d/2,g=l/2,v=new Float32Array(this.instanceCount*3);for(let m=0;m<r;m++)for(let p=0;p<n;p++)for(let x=0;x<i;x++)e.setPosition(p*c-h,x*c-f,m*c-g),this.mesh.setMatrixAt(t,e),v[t*3+0]=p/n,v[t*3+1]=x/i,v[t*3+2]=m/r,t++;this.geometry.setAttribute("instanceOffset",new un(v,3))}positionOnUpdate(e){const t=new Ce;let n=0;const{xNum:i,yNum:r,zNum:o,spacing:a,size:c}=this.settings,u=c+a,d=(i-1)*u,l=(r-1)*u,h=d/2,f=l/2;new Float32Array(this.instanceCount*3);const g=500;for(let v=0;v<o;v++)for(let m=0;m<i;m++)for(let p=0;p<r;p++){const x=v*(u+500*this.colors[n*3])+this.colors[n]*g-g/2;let _=e*bo(this.colors[n*2]*15,5,50);const S=m*u-h,M=p*u-f;_=x-_,_-=this.translationZ,t.setPosition(S,M,_%(g/2)+10),S>-3.5&&S<3.5&&M<5&&t.setPosition(-1e4,-1e4,-1e4),this.mesh.setMatrixAt(n,t),n++}}update({time:e,delta:t,frame:n}){this.material.update(e,t,n),this.positionOnUpdate(e),this.mesh.instanceMatrix.needsUpdate=!0}getTrack(e){this.track=document.body.querySelector(e)}resize(e,t,n){if(!this.track)return;const i=this.track.getBoundingClientRect();this.bounds={width:i.width,height:i.height,top:i.top+window.scrollY,left:i.left},this.offset.set((-e/2+this.bounds.width/2+this.bounds.left)*this.trackScaleF,(t/2-this.bounds.height/2-this.bounds.top)*this.trackScaleF),this.scale.set(this.bounds.width*this.trackScaleF,this.bounds.width*this.trackScaleF,this.bounds.width*this.trackScaleF)}}const JA=`
float smootherstep(float edge0, float edge1, float x) {
    x = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}
`,QA=`
precision mediump float;

${og}
${JA}

uniform sampler2D tMap;
uniform vec2 uDirection;
uniform vec2 uResolution;

in vec2 vUv;

out vec4 FragColor;

void main() {
  vec4 tMapped = texture(tMap, vUv);

  vec2 distance = smootherstep(1.0, 0.0, vUv.y) * uDirection;
  vec4 blurred = blur(tMap, vUv, uResolution, distance);

  FragColor = mix(tMapped, blurred, 1.25);
}
`,e1=`
in vec3 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;class t1 extends mt{constructor(){super({glslVersion:lt,uniforms:{tMap:new I(null),uDirection:new I(new Q(1,0)),uResolution:new I(new Q)},vertexShader:e1,fragmentShader:QA,blending:ot,depthWrite:!1,depthTest:!1})}}function n1(){const s=new Vt;return s.setAttribute("position",new bt([-1,3,0,-1,-1,0,3,-1,0],3)),s.setAttribute("uv",new bt([0,2,0,0,2,0],2)),s}class i1 extends rt{constructor({width:e=512,height:t=512,clipBias:n=0,blurIterations:i=2}={}){super(),this.clipBias=n,this.blurIterations=i,this.reflectorPlane=new Hi,this.normal=new L,this.reflectorWorldPosition=new L,this.cameraWorldPosition=new L,this.rotationMatrix=new Ce,this.lookAtPosition=new L(0,0,-1),this.clipPlane=new st,this.view=new L,this.target=new L,this.q=new st,this.textureMatrix=new Ce,this.virtualCamera=new Wt,this.textureMatrixUniform=new I(this.textureMatrix),this.renderTarget=new Dn(e,t,{depthBuffer:!1}),this.renderTargetRead=this.renderTarget.clone(),this.renderTargetWrite=this.renderTarget.clone(),this.renderTarget.depthBuffer=!0,this.renderTargetUniform=new I(this.blurIterations>0?this.renderTargetRead.texture:this.renderTarget.texture),this.blurMaterial=new t1,this.blurMaterial.uniforms.uResolution.value.set(e,t),this.screenCamera=new Kn(-1,1,1,-1,0,1),this.screenTriangle=n1(),this.screen=new at(this.screenTriangle,this.blurMaterial),this.screen.frustumCulled=!1}setSize(e,t,n){const i=e*.75,r=t*.75;this.renderTarget.setSize(i,r),this.renderTargetRead.setSize(i,r),this.renderTargetWrite.setSize(i,r),this.blurMaterial.uniforms.uResolution.value.set(e,t)}update(e,t,n){if(this.reflectorWorldPosition.setFromMatrixPosition(this.matrixWorld),this.cameraWorldPosition.setFromMatrixPosition(n.matrixWorld),this.rotationMatrix.extractRotation(this.matrixWorld),this.normal.set(0,0,1),this.normal.applyMatrix4(this.rotationMatrix),this.view.subVectors(this.reflectorWorldPosition,this.cameraWorldPosition),this.view.dot(this.normal)>0)return;this.view.reflect(this.normal).negate(),this.view.add(this.reflectorWorldPosition),this.rotationMatrix.extractRotation(n.matrixWorld),this.lookAtPosition.set(0,0,-1),this.lookAtPosition.applyMatrix4(this.rotationMatrix),this.lookAtPosition.add(this.cameraWorldPosition),this.target.subVectors(this.reflectorWorldPosition,this.lookAtPosition),this.target.reflect(this.normal).negate(),this.target.add(this.reflectorWorldPosition),this.virtualCamera.position.copy(this.view),this.virtualCamera.up.set(0,1,0),this.virtualCamera.up.applyMatrix4(this.rotationMatrix),this.virtualCamera.up.reflect(this.normal),this.virtualCamera.lookAt(this.target),this.virtualCamera.far=n.far,this.virtualCamera.updateMatrixWorld(),this.virtualCamera.projectionMatrix.copy(n.projectionMatrix),this.textureMatrix.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),this.textureMatrix.multiply(this.virtualCamera.projectionMatrix),this.textureMatrix.multiply(this.virtualCamera.matrixWorldInverse),this.textureMatrix.multiply(this.matrixWorld),this.reflectorPlane.setFromNormalAndCoplanarPoint(this.normal,this.reflectorWorldPosition),this.reflectorPlane.applyMatrix4(this.virtualCamera.matrixWorldInverse),this.clipPlane.set(this.reflectorPlane.normal.x,this.reflectorPlane.normal.y,this.reflectorPlane.normal.z,this.reflectorPlane.constant);const i=this.virtualCamera.projectionMatrix;this.q.x=(Math.sign(this.clipPlane.x)+i.elements[8])/i.elements[0],this.q.y=(Math.sign(this.clipPlane.y)+i.elements[9])/i.elements[5],this.q.z=-1,this.q.w=(1+i.elements[10])/i.elements[14],this.clipPlane.multiplyScalar(2/this.clipPlane.dot(this.q)),i.elements[2]=this.clipPlane.x,i.elements[6]=this.clipPlane.y,i.elements[10]=this.clipPlane.z+1-this.clipBias,i.elements[14]=this.clipPlane.w;const r=e.getRenderTarget(),o=e.xr.enabled,a=e.shadowMap.autoUpdate;e.xr.enabled=!1,e.shadowMap.autoUpdate=!1,e.setRenderTarget(this.renderTarget),e.state.buffers.depth.setMask(!0),e.autoClear===!1&&e.clear(),e.render(t,this.virtualCamera);const c=this.blurIterations;for(let u=0;u<c;u++){u===0?this.blurMaterial.uniforms.tMap.value=this.renderTarget.texture:this.blurMaterial.uniforms.tMap.value=this.renderTargetRead.texture;const d=(c-u-1)*15;this.blurMaterial.uniforms.uDirection.value.set(u%2===0?d:0,u%2===0?0:d),e.setRenderTarget(this.renderTargetWrite),e.render(this.screen,this.screenCamera);const l=this.renderTargetRead;this.renderTargetRead=this.renderTargetWrite,this.renderTargetWrite=l,this.renderTargetUniform.value=this.renderTargetRead.texture}e.xr.enabled=o,e.shadowMap.autoUpdate=a,e.setRenderTarget(r)}destroy(){this.renderTargetWrite.dispose(),this.renderTargetRead.dispose(),this.renderTarget.dispose(),this.blurMaterial.dispose(),this.screenTriangle.dispose();for(const e in this)this[e]=null;return null}}const s1=`
precision mediump float;

${lg}

uniform sampler2D tReflect;
uniform vec3 uColor;
uniform float uReflectivity;
uniform float uMirror;
uniform float uFloorMixStrength;
uniform float uNormalDistortionStrength;

#ifdef USE_MAP
uniform sampler2D tMap;
#endif

#ifdef USE_NORMALMAP
uniform sampler2D tNormalMap;
uniform vec2 uNormalScale;
#endif

#ifdef USE_FOG
uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;
#endif

in vec2 vUv;
in vec4 vCoord;
in vec3 vNormal;
in vec3 vToEye;

out vec4 FragColor;

void main() {
    #ifdef USE_MAP
  vec4 color = texture(tMap, vUv);
    #else
  vec4 color = vec4(uColor, 1.0);
    #endif

    #ifdef USE_NORMALMAP
  vec4 normalColor = texture(tNormalMap, vUv * uNormalScale);
  vec3 normal = normalize(vec3(normalColor.r * uNormalDistortionStrength - (uNormalDistortionStrength / 2.), normalColor.b, normalColor.g * uNormalDistortionStrength - (uNormalDistortionStrength / 2.)));
  vec3 coord = vCoord.xyz / vCoord.w;
  vec2 uv = coord.xy + coord.z * normal.xz * 0.05;
  vec4 reflectColor = texture(tReflect, uv);
    #else
  vec3 normal = vNormal;
  vec4 reflectColor = textureProj(tReflect, vCoord);
    #endif

    // Fresnel term
  vec3 toEye = normalize(vToEye);
  float theta = max(dot(toEye, normal), .0);
  float reflectance = max(0.01, min(uReflectivity + (1.0 - uReflectivity) * pow((1.0 - theta), 5.0), 1.));

  reflectColor = mix(vec4(0), reflectColor, reflectance);

  FragColor.rgb = color.rgb * ((1.0 - min(1.0, uMirror)) + reflectColor.rgb * uFloorMixStrength);

    #ifdef USE_FOG
  float fogDepth = gl_FragCoord.z / gl_FragCoord.w;
  float fogFactor = smoothstep(uFogNear, uFogFar, fogDepth);

  FragColor.rgb = mix(FragColor.rgb, uFogColor, fogFactor);
    #endif

    #ifdef DITHERING
  FragColor.rgb = dither(FragColor.rgb);
    #endif



  FragColor.a = 1.0;
}
`,r1=`
in vec3 position;
in vec3 normal;
in vec2 uv;
uniform mat4 modelMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;
uniform vec3 cameraPosition;
uniform mat3 uMapTransform;
uniform mat4 uMatrix;
out vec2 vUv;
out vec4 vCoord;
out vec3 vNormal;
out vec3 vToEye;
void main() {
  vUv = (uMapTransform * vec3(uv, 1.0)).xy;
  vCoord = uMatrix * vec4(position, 1.0);
  vNormal = normalMatrix * normal;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vToEye = cameraPosition - worldPosition.xyz;
  vec4 mvPosition = viewMatrix * worldPosition;
  gl_Position = projectionMatrix * mvPosition;
}

`;class o1 extends mt{constructor({color:e=new ye(1052688),map:t=null,normalMap:n=null,normalScale:i=new Q(1,1),reflectivity:r=0,uMirror:o=0,uFloorMixStrength:a=10,fog:c=null,dithering:u=!1}={}){const d={glslVersion:lt,defines:{},uniforms:{tReflect:new I(null),uMapTransform:new I(new Ne),uMatrix:new I(new Ce),uColor:new I(e instanceof ye?e:new ye(e)),uReflectivity:new I(r),uMirror:new I(o),uFloorMixStrength:new I(a),uNormalDistortionStrength:new I(2.5)},vertexShader:r1,fragmentShader:s1,blending:ot};t&&(t.updateMatrix(),d.defines=Object.assign(d.defines,{USE_MAP:""}),d.uniforms=Object.assign(d.uniforms,{tMap:new I(t),uMapTransform:new I(t.matrix)})),n&&(d.defines=Object.assign(d.defines,{USE_NORMALMAP:""}),d.uniforms=Object.assign(d.uniforms,{tNormalMap:new I(n),uNormalScale:new I(i)}),t||(n.updateMatrix(),d.uniforms=Object.assign(d.uniforms,{uMapTransform:new I(n.matrix)}))),c&&(d.defines=Object.assign(d.defines,{USE_FOG:""}),d.uniforms=Object.assign(d.uniforms,{uFogColor:new I(c.color),uFogNear:new I(c.near),uFogFar:new I(c.far)})),u&&(d.defines=Object.assign(d.defines,{DITHERING:""})),super(d)}}class a1 extends rt{constructor(e){super(),this.gl=e,this.scene=e.scene,this.camera=e.camera,this.renderer=e.renderer,this.background=e.backgroundColor,this.reflector=new i1,this.init()}async init(){this.scene;const e=await Xt.floorNormal;e.repeat.set(45,45);const t=new Tu(60,32),n=new o1({color:"#4a4a4a",normalMap:e,uMirror:1,reflectivity:.97,uFloorMixStrength:15});n.uniforms.tReflect=this.reflector.renderTargetUniform,n.uniforms.uMatrix=this.reflector.textureMatrixUniform;const i=new at(t,n);i.rotation.x=-Math.PI/2,i.add(this.reflector),i.onBeforeRender=(r,o,a)=>{this.visible=!1,this.reflector.update(this.renderer,this.scene,this.camera),this.visible=!0},this.add(i),this.material=n}resize=(e,t,n)=>{this.reflector.setSize(e,t,n)}}const gg=`
float randomF(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

float customRoughness(float roughness, vec2 vUv, float size, float time) {
  float roughnessFactor = roughness;
  // Triangular tiling
  vec2 triangle = vec2(mod(vUv.x * size, 1.0), mod(vUv.y * size, 1.0));

    // Generate random shades of grey based on the cell position
  vec2 cell = floor(vUv * size);
  float shade = randomF(cell) * 0.8 + 0.1; // Shades between 0.25 and 0.75
  vec4 roughnessColor = vec4(1.);

    // Create the triangle pattern
  if(triangle.y > triangle.x) {
    roughnessColor = vec4(vec3(shade), 1.0);
  } else {
    roughnessColor = vec4(vec3(1.0 - shade), 1.0);
  }

   roughnessFactor *= roughnessColor.g;

  return roughnessFactor;
}
`,vg=`
float noiseShaderRandom(vec2 n) {
  return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 ip = floor(p);
  vec2 u = fract(p);
  u = u * u * (3.0 - 2.0 * u);

  float res = mix(mix(noiseShaderRandom(ip), noiseShaderRandom(ip + vec2(1.0, 0.0)), u.x), mix(noiseShaderRandom(ip + vec2(0.0, 1.0)), noiseShaderRandom(ip + vec2(1.0, 1.0)), u.x), u.y);
  return res * res;
}

const mat2 mtx = mat2(0.80, 0.60, -0.60, 0.80);

float fbm(vec2 p, float time, float speed) {
  float f = 0.0;

  f += 0.500000 * noise(p - time * speed);
  p = mtx * p * 2.02;
  f += 0.031250 * noise(p);
  p = mtx * p * 2.01;
  f += 0.250000 * noise(p);
  p = mtx * p * 2.03;
  f += 0.125000 * noise(p);
  p = mtx * p * 2.01;
  f += 0.062500 * noise(p - time * (speed * 5.));
  p = mtx * p * 2.04;
  f += 0.015625 * noise(p + time * (speed * 5.));

  return f / 0.96875;
}

float pattern(vec2 p, float time, float speed) {
  float f1 = fbm(p, time, speed);
  float f2 = fbm(p + f1, time, speed);

  return fbm(p + f2, time, speed);
}
vec4 noiseShader(vec2 uv, float time, float speed) {
  float shade = pattern(uv, time, speed);
  return vec4(vec3(shade), shade);
}
`,_g=`

vec4 oil(vec2 uv, float time, float strength) {
    float t = time;
    vec3 col = vec3(0.0);
    vec2 pos = uv;
    float noisePos = snoise(uv * 1.15) * .005;

    for (float k = 1.0; k < 5.0; k += 1.) { 
        pos.x += strength * sin(2.0 * t + k * 1.5 * pos.y + noisePos * 10.);
        pos.y += strength * cos(2.0 * t + k * 1.5 * pos.x - noisePos);
    }

    col += clamp(-0.0 + 0.5 * cos(t * 0.5 + pos.xyx * 3.0).xxx, -0.1, 0.99);
    return vec4(col, 1.0);
}
`,xg=`
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x*34.0)+10.0)*x);
}

float snoise(vec2 v)
  {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
// First corner
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);

// Other corners
  vec2 i1;
  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
  //i1.y = 1.0 - i1.x;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  // x0 = x0 - 0.0 + 0.0 * C.xx ;
  // x1 = x0 - i1 + 1.0 * C.xx ;
  // x2 = x0 - 1.0 + 2.0 * C.xx ;
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

// Permutations
  i = mod289(i); // Avoid truncation effects in permutation
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
		+ i.x + vec3(0.0, i1.x, 1.0 ));

  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;

// Gradients: 41 points uniformly over a line, mapped onto a diamond.
// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

// Normalise gradients implicitly by scaling m
// Approximation of: m *= inversesqrt( a0*a0 + h*h );
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

// Compute final noise value at P
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`,l1=`
${xg}
${gg}
${vg}
${Po}
${_g}

uniform float uMultiplier;
uniform float uShader1Speed;
uniform float uShader1Alpha;
uniform float uShader1Scale;

uniform float uShader2Alpha;
uniform float uShader2Scale;

uniform float uShader3Speed;
uniform float uShader3Alpha;
uniform float uShader3Scale;

uniform float uShader1Mix2;
uniform float uShader1Mix3;

uniform vec3 uDarkenColor;
uniform float uDarken;

uniform sampler2D tSky;

uniform float uTime;
varying vec2 vUv;

#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
uniform float ior;
#endif
#ifdef SPECULAR
uniform float specularIntensity;
uniform vec3 specularColor;
	#ifdef USE_SPECULARINTENSITYMAP
uniform sampler2D specularIntensityMap;
	#endif
	#ifdef USE_SPECULARCOLORMAP
uniform sampler2D specularColorMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
uniform float clearcoat;
uniform float clearcoatRoughness;
#endif
#ifdef USE_IRIDESCENCE
uniform float iridescence;
uniform float iridescenceIOR;
uniform float iridescenceThicknessMinimum;
uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
uniform vec3 sheenColor;
uniform float sheenRoughness;
	#ifdef USE_SHEENCOLORMAP
uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEENROUGHNESSMAP
uniform sampler2D sheenRoughnessMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
// #include <color_pars_fragment>
#include <uv_pars_fragment>
// #include <map_pars_fragment>
// #include <alphamap_pars_fragment>
// #include <alphatest_pars_fragment>
// #include <aomap_pars_fragment>
// #include <lightmap_pars_fragment>
// #include <emissivemap_pars_fragment>
#include <bsdfs>
// #include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
// #include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
// #include <bumpmap_pars_fragment>
// #include <normalmap_pars_fragment>
// #include <clearcoat_pars_fragment>
// #include <iridescence_pars_fragment>
// #include <roughnessmap_pars_fragment>
// #include <metalnessmap_pars_fragment>
// #include <logdepthbuf_pars_fragment>
// #include <clipping_planes_pars_fragment>

float smoothMask(float coord, float center, float spread) {
  return (1. - smoothstep(coord,  center, center - spread)) + (1. - smoothstep(coord,  center, center + spread));
}

void main() {
	// #include <clipping_planes_fragment>
  vec4 diffuseColor = vec4(diffuse, opacity);
  ReflectedLight reflectedLight = ReflectedLight(vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));
  vec3 totalEmissiveRadiance = emissive;

	// #include <logdepthbuf_fragment>
	// #include <map_fragment>
	// #include <color_fragment>

  vec2 skyUv = vUv;
  vec2 skyUv2 = vUv;

  
  skyUv.x += .5;
  skyUv2.x -= .75;

  vec4 noise = texture(tSky, (skyUv * 2.));
  vec4 noise2 = texture(tSky, (skyUv2 * 1.));
  
  vec3 maskColor = vec3(1.0, 1.0, 1.0);
  
  float m = 0.0;

  m = max(m, 1. - smoothstep(vUv.x, 0.00, 0.015));
  m = max(m, 1. - smoothstep(vUv.x, 1.015, 0.985));
  m = max(m, smoothMask(vUv.x, .5, 0.01));
  m = m * 1. - smoothMask(vUv.x, .75, 0.02);
  m = clamp(m, 0.0, 1.0);

  vec4 noiseMixed = mix(noise, noise2, m);
  
  diffuseColor.rgb = blend(4, diffuseColor.rgb, noiseMixed.rgb, 0.5);
  
  vec2 skyMaskUv = vUv;
  
  skyMaskUv.y -= .1;
  
  float skyMask = mod((skyMaskUv.y) * 5., 1.);
  skyMask = max(skyMask, step(0.6, skyMaskUv.y));
  
  diffuseColor.rgb = blend(16, diffuseColor.rgb, noiseMixed.rgb , skyMask);
  diffuseColor.rgb += vec3(smoothstep(vUv.y, .45, .595));

  float skyMask2 = mod((skyMaskUv.y) * 2.5, 1.);
  skyMask2 = max(skyMask, step(0.6, skyMaskUv.y));

  diffuseColor.rgb = mix(vec3(1.0, 1.0, 1.0), diffuseColor.rgb, skyMask2 * 1.5);
  diffuseColor.rgb *= 1.15;
  diffuseColor.rgb *= clamp(diffuseColor.rgb, vec3(0.0), vec3(1.0));
  
	// #include <alphamap_fragment>
	// #include <alphatest_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	// #include <clearcoat_normal_fragment_begin>
	// #include <clearcoat_normal_fragment_maps>
	// #include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	// #include <aomap_fragment>
  vec3 totalDiffuse = reflectedLight.indirectDiffuse;
  vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	// #include <transmission_fragment>
  vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
  
  vec3 black = vec3(0.095, 0.095, 0.095);
  
	#include <opaque_fragment>

  gl_FragColor.rgb = blend(4, gl_FragColor.rgb, uDarkenColor, uDarken);
  // gl_FragColor.rgb = 1. - noiseMixed.rgb;
  // gl_FragColor.rgb = vec3(mask4);



	// #include <tonemapping_fragment>
	// #include <colorspace_fragment>
	// #include <fog_fragment>
	// #include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}
`,c1=`
varying vec2 vUv;
#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
  vUv = uv;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}
`,Qn={ROUGHNESS_INTENSITY:.94,ENVMAP_INTENSITY:1,EMISSIVE_INTENSITY:.5,METALNESS_INTENSITY:1,ROUGHNESS_PATTERN_INTENSITY:1,ROUGHNESS_PATTERN_CONTRAST:3.1521739130434785,ROUGHNESS_PATTERN_SCALE:16.304347826086957,ROUGHNESS_DISTORTION_INTENSITY:0,ROUGHNESS_DISTORTION_SCALE:6.521739130434783,SHADER_1_ALPHA:.5,SHADER_1_SPEED:.5,SHADER_1_SCALE:5.5,SHADER_2_ALPHA:0,SHADER_2_SCALE:13,SHADER_3_ALPHA:0,SHADER_3_SPEED:0,SHADER_3_SCALE:0,SHADER_1_MIX_3:1.5};class u1 extends Ao{constructor(e){super(e),this.dithering=!0,this.customUniforms={uTime:new I(0),uMultiplier:new I(2),uDarken:new I(1),tSky:new I(null),uDarkenColor:new I(new ye(xt.colors.secondary)),uShader1Alpha:new I(Qn.SHADER_1_ALPHA),uShader1Speed:new I(Qn.SHADER_1_SPEED),uShader1Scale:new I(Qn.SHADER_1_SCALE),uShader2Alpha:new I(Qn.SHADER_2_ALPHA),uShader2Scale:new I(Qn.SHADER_2_SCALE),uShader3Alpha:new I(Qn.SHADER_3_ALPHA),uShader3Speed:new I(Qn.SHADER_3_SPEED),uShader3Scale:new I(Qn.SHADER_3_SCALE),uShader1Mix3:new I(Qn.SHADER_1_MIX_3)},this.onBeforeCompile=t=>{t.uniforms.uMultiplier=this.customUniforms.uMultiplier,t.uniforms.uShader1Speed=this.customUniforms.uShader1Speed,t.uniforms.uShader1Alpha=this.customUniforms.uShader1Alpha,t.uniforms.uShader1Scale=this.customUniforms.uShader1Scale,t.uniforms.uShader2Alpha=this.customUniforms.uShader2Alpha,t.uniforms.uShader2Scale=this.customUniforms.uShader2Scale,t.uniforms.uShader3Alpha=this.customUniforms.uShader3Alpha,t.uniforms.uShader3Scale=this.customUniforms.uShader3Scale,t.uniforms.uShader3Speed=this.customUniforms.uShader3Speed,t.uniforms.uShader1Mix3=this.customUniforms.uShader1Mix3,t.uniforms.uDarkenColor=this.customUniforms.uDarkenColor,t.uniforms.uDarken=this.customUniforms.uDarken,t.uniforms.uTime=this.customUniforms.uTime,t.uniforms.tSky=this.customUniforms.tSky,t.vertexShader=c1,t.fragmentShader=l1}}update(e,t,n){this.customUniforms.uTime.value=e}}class h1 extends rt{constructor(){super(),this.promise=new Promise(e=>{this.resolve=e}),this.speed=5e-5,this.initMesh()}initMesh(){const e=new Du(300,10);this.material=new u1({side:hn,envMapIntensity:Qn.ENVMAP_INTENSITY,fog:!1});const t=new at(e,this.material);this.add(t),this.mesh=t,this.resolve()}setColor(e){this.material.color.set(e)}update(e,t,n){this.material.update(e,t,n)}}const d1=new Lw,f1=(s,e="webp")=>new Promise((n,i)=>{const r=[`${s}/px.${e}`,`${s}/nx.${e}`,`${s}/ny.${e}`,`${s}/py.${e}`,`${s}/pz.${e}`,`${s}/nz.${e}`];d1.load(r,o=>{n(o)})});class p1 extends Iu{async init(){super.init(),this.blocksWrap=new rt,this.sceneWrap=new rt,this.projects=is.getProjects(),this.radius=0,this.count=this.projects.length,this.theta=360/this.count,this.itemWidth=6.5,this.mouseF=0,this.spotLightParallax=!0,this.fog=new bu("grey",0,100),this.scene.fog=this.fog,this.setLights(),this.setBlocks(),this.setAboutBlocks(),this.setFloatingBlocks(),this.sceneWrap.add(this.blocksWrap),this.backgroundColor=new ye(BA.BACKGROUND_COLOR).convertLinearToSRGB(),this.scene.background=this.backgroundColor,this.addFog(),this.addEnvironment(),this.floor=this.add(a1),this.floor.position.y=-1.65,this.env=this.add(h1),this.env.position.y=-12.65,this.env.rotation.y=-Xc(this.rotationAdjustment),this.sceneWrap.add(this.floor),this.sceneWrap.add(this.env),this.scene.add(this.sceneWrap)}setLights(){this.ambientLight=new eg(xt.colors.secondary,xt.ambient),this.scene.add(this.ambientLight),this.maxSpotLightIntensity=220,this.spotLight=new Qm(16777215,this.maxSpotLightIntensity),this.spotLight.position.set(0,0,3.7),this.spotLight.angle=Math.PI/4,this.spotLight.penumbra=.95,this.scene.add(this.spotLight),this.scene.add(this.spotLight.target),this.directionalLight=new So(new ye("white"),1.5),this.directionalLight.position.set(10.5,10,1),this.directionalLight2=new So(new ye("white"),1),this.directionalLight2.position.set(-10.5,5,-1),this.scene.add(this.directionalLight)}adjustAmbientLight(e,t){const n=new ye(e).convertLinearToSRGB();this.ambientLight.color.set(n),this.ambientLight.intensity=t}adjustDarkness(e){this.renderManager.compositeMaterial.uniforms.uDarken.value=e}setAboutBlocks(){this.aboutBlocks=new $A(this),this.aboutBlocks.visible=!1,this.scene.add(this.aboutBlocks)}setFloatingBlocks(){this.floatingBlocks=new ZA(this),this.floatingBlocks.scale.set(3.5,3.5,3.5),this.floatingBlocks.position.y=4.65,this.floatingBlocks.visible=!1,this.scene.add(this.floatingBlocks)}setBlocks(){this.blocks=[],this.projects.forEach((n,i)=>{this.blocks.push({id:n.id,rotation:-this.theta*i,instance:new GA(this)})});const{itemWidth:e,count:t}=this;this.radius=Math.round(e/2/Math.tan(Math.PI/t)),this.lightRadius=this.radius-3.5,this.rotationAdjustment=0,this.blocks.forEach((n,i)=>{n.instance.position.x=-Math.sin(this.theta*i*Math.PI/180)*this.radius,n.instance.position.z=Math.cos(this.theta*i*Math.PI/180)*this.radius,n.id==="demorgen"&&(this.rotationAdjustment=n.rotation),n.instance.lookAt(this.blocksWrap.position),this.blocksWrap.add(n.instance)}),this.sceneWrap.position.set(0,0,this.radius-.3)}setMouseFactor(e){this.mouseF=e,this.blocks.forEach((t,n)=>{t.instance.material.customUniforms.uMouseFactor.value=e})}setRenderManager(){this.renderManager=new kA(this.renderer,this.scene,this.camera)}setCamera(){this.camera=new Ya(55,innerWidth/innerHeight,1,2e3),this.camera.position.set(0,0,5.5)}setCameraControllerSettings(e=new L(0,0,0),t=new Q(.25,.25),n=10){this.cameraController.lookAt=e,this.cameraController.targetXY.set(t.x,t.y),this.cameraController.rotateAngle=Xc(n)}addFog(){}async addEnvironment(){const e=Le.WEBP?"webp":"jpg",t=await f1("/images/cubemaps/01",e);this.scene.environment=t}update(e,t,n,i){super.update(e,t,n,i),this.spotLight&&this.spotLightParallax&&(this.spotLight.position.x=this.camera.position.x*.175,Pe.w>=Le.BREAKPOINTS.MD?this.spotLight.position.y=this.camera.position.y*.175:this.spotLight.position.y=.3+this.camera.position.y*.175);for(let r=0;r<this.blocks.length;r++){const o=this.blocks[r],a=new L;o.instance.getWorldPosition(a),a.x>5.5||a.x<-5.5||a.z>5?o.instance.visible=!1:(o.instance.update(e,t,n,Math.min(Pe.dpr,1.5)),o.instance.visible=!0,o.instance.material.customUniforms.uRevealSides.value=Cs(Math.abs(a.x),0,5,1,0,!0),o.instance.material.customUniforms.uRevealSpreadSides.value=Cs(Math.abs(a.x),2,6,1,0,!0),o.instance.material.customUniforms.tMouseSim2.value=this.renderManager.mouseSimulation.bufferSim.output.texture)}this.aboutBlocks.visible&&(this.aboutBlocks.update(e,t,n,Math.min(Pe.dpr,1.5)),this.aboutBlocks.material.customUniforms.tMouseSim2.value=this.renderManager.mouseSimulation.bufferSim.output.texture)}resize(e,t,n){super.resize(e,t,Math.min(n,1.5));for(let i=0;i<this.blocks.length;i++)this.blocks[i].instance.resize&&this.blocks[i].instance.resize(e,t,Math.min(n,1.5));this.aboutBlocks.resize(e,t,Math.min(n,1.5)),e>=Le.BREAKPOINTS.MD?(this.cameraController.origin.z=5.5,this.sceneWrap.position.y=0):(this.cameraController.origin.z=5,this.sceneWrap.position.y=.3)}}const m1=`
precision highp float;
uniform sampler2D tScene;
in vec2 vUv;
out vec4 FragColor;

void main() {
  vec4 mixed = texture(tScene, vUv);
  FragColor = vec4(mixed.rgb, 1.);
}
`,tl=`
in vec3 position;
in vec2 uv;
uniform mat4 modelMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
out vec2 vUv;
void main() {
  vUv = uv;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vec4 mvPosition = viewMatrix * worldPosition;
  gl_Position = projectionMatrix * mvPosition;
}
`;class g1 extends mt{constructor(){super({glslVersion:lt,toneMapped:!1,uniforms:{tScene:new I(null)},vertexShader:tl,fragmentShader:m1,blending:ot,depthWrite:!1,depthTest:!1})}}class Lo{constructor(e,t,n){this.renderer=e,this.scene=t,this.camera=n,this.initSettings(),this.initRenderer()}initSettings(){this.settings={renderToScreen:!0,clear:!1}}initRenderer(){this.screenCamera=new Kn(-1,1,1,-1,0,1),this.screenGeometry=new Vt,this.screenGeometry.setAttribute("position",new bt([-1,3,0,-1,-1,0,3,-1,0],3)),this.screenGeometry.setAttribute("uv",new bt([0,2,0,0,2,0],2)),this.screen=new at(this.screenGeometry),this.screen.frustumCulled=!1,this.renderTargetA=new Dn(1,1,{depthBuffer:!1,stencilBuffer:!1}),this.renderTargetComposite=this.renderTargetA.clone(),this.compositeMaterial=new g1}resize=(e,t,n)=>{this.settings.renderToScreen&&(this.renderer.setPixelRatio(n),this.renderer.setSize(e,t)),e=Math.round(e*n),t=Math.round(t*n),this.renderTargetA.setSize(e,t),this.renderTargetComposite.setSize(e,t)};update=(e,t,n,i,r=this.camera,o=this.renderer,a=this.scene)=>{const c=this.renderTargetA,u=this.renderTargetComposite;o.setRenderTarget(c),o.render(a,r),this.compositeMaterial.uniforms.tScene.value=c.texture,this.screen.material=this.compositeMaterial,this.settings.renderToScreen?(o.setRenderTarget(null),o.render(this.screen,this.screenCamera)):(o.setRenderTarget(u),o.render(this.screen,this.screenCamera),o.setRenderTarget(null))}}const v1=`
precision highp float;

${hg}
${Ur}

#include <tonemapping_pars_fragment>

uniform sampler2D tScene;
uniform float uDarkenIntensity;
uniform vec3 uDarkenColor;
uniform float uSaturation;

in vec2 vUv;
out vec4 FragColor;

void main() {
  vec2 uv = vUv ;
  vec4 mixed = texture(tScene, uv);

  mixed.rgb = blendMultiply(mixed.rgb, uDarkenColor, uDarkenIntensity);
  mixed.rgb = saturation(mixed.rgb, uSaturation);
  FragColor = vec4(mixed.rgb, 1.);

  #include <tonemapping_fragment>
}
`;class _1 extends mt{constructor(){super({glslVersion:lt,toneMapped:!1,uniforms:{tScene:new I(null),uDarkenIntensity:new I(0),uDarkenColor:new I(new ye(0)),uSaturation:new I(1)},vertexShader:tl,fragmentShader:v1,blending:ot,transparent:!0,depthWrite:!1,depthTest:!1})}}class x1 extends Lo{constructor(e,t,n){super(e,t,n),this.compositeMaterial=new _1}initSettings(){this.settings={renderToScreen:!1}}}class Uu{constructor(e){this.gl=e,this.active=!1,this.setRenderer(e.renderer),this.components=[],this.parent=null,this.setScene(),this.setCamera(),this.setRenderManager(),this.init()}init(){}setRenderer(e){this.renderer=e}setScene(){this.scene=new To,this.scene.background=new ye("black")}setCamera(){this.camera=new Ya(55,innerWidth/innerHeight,1,2e3),this.camera.position.set(0,0,5)}setRenderManager(){this.renderManager=new Lo(this.renderer,this.scene,this.camera)}update(e,t,n,i){this.renderManager.update(e,t,n,i);for(let r=0;r<this.components.length;r++)this.components[r].update&&this.components[r].update(e,t,n,i)}resize(e,t,n){this.renderManager.resize(e,t,n),this.camera.resize(e,t),this.camera.aspect=e/t,this.camera.updateProjectionMatrix(),this.cameraController&&this.cameraController.resize(e,t);for(let i=0;i<this.components.length;i++)this.components[i].resize&&this.components[i].resize(e,t,n)}add(e,t){const n=new e(this,t);return this.components.push(n),n}}const y1=`
vec4 coverTexture(sampler2D tex, vec2 imgSize, vec2 ouv, vec2 containerSize) {
  vec2 s = containerSize;
  vec2 i = imgSize;
  float rs = s.x / s.y;
  float ri = i.x / i.y;
  vec2 new = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
  vec2 newOffset = (rs < ri ? vec2((new.x - s.x) / 2.0, 0.0) : vec2(0.0, (new.y - s.y) / 2.0)) / new;
  vec2 uv = ouv * s / new + newOffset;
  vec4 color = texture(tex, uv);

  return color;
}
`,S1=`
precision highp float;

${y1}

uniform sampler2D tMap;
uniform vec2 uMapSize;
uniform vec2 uResolution;
uniform float uProgress; 
uniform float uTransitionCount; 
uniform float uTransitionSmoothness;
in vec2 vUv;
out vec4 FragColor;

vec4 transition (vec4 color1, vec4 color2, float progress, vec2 uv) {
  float pr = smoothstep(-uTransitionSmoothness, 0.0, uv.y - progress * (1.0 + uTransitionSmoothness));
  float s = step(pr, fract(uTransitionCount * uv.y));
  return mix(color1, color2, s);
}

void main() {
  vec2 uv = vUv;
  vec4 map = coverTexture(tMap, uMapSize, uv, uResolution);
  vec4 color = vec4(uv.x, uv.y, 0.0, 0.0);
  vec4 mixed = transition(map, color, 1. - uProgress, uv);
  FragColor = mixed;
}
`,b1=`
in vec3 position;
in vec2 uv;
uniform mat4 modelMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
out vec2 vUv;
void main() {
  vUv = uv;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vec4 mvPosition = viewMatrix * worldPosition;
  gl_Position = projectionMatrix * mvPosition;
}
`;class M1 extends mt{constructor(){super({glslVersion:lt,toneMapped:!1,transparent:!1,uniforms:{tMap:new I(null),uResolution:new I(new Q),uMapSize:new I(new Q),uProgress:new I(1),uTransitionCount:new I(150),uTransitionSmoothness:new I(.2)},vertexShader:b1,fragmentShader:S1,depthWrite:!1,depthTest:!1})}}class E1{constructor(e){this.id=e,this.name="thumb",this.yHook=0,this.geometry=new Rn(1,1),this.material=new M1,this.setImage(e),this.mesh=new at(this.geometry,this.material),this.mesh.scale.set(2,2,2)}async setImage(e){await Xt.thumbsReady;const n=await(await Xt.getProjectThumbById(e)).src;n.source.data,this.material.uniforms.tMap.value=n,this.material.uniforms.uMapSize.value.set(1,1),this.material.uniforms.uResolution.value.set(1,1)}resize=(e,t,n)=>{}}class w1 extends rt{constructor(){super(),this.frustumCulled=!1,this.progress=0,this.isTransitioning=!1,this.scrollWrap=new rt,this.offsetY=0,this.initThumbs(),this.add(this.scrollWrap),this.calcItemWidth()}initThumbs(){this.thumbs=[];const e=is.getProjects();this.totalItems=e.length,e.forEach((t,n)=>{const i=new E1(t.id);this.thumbs.push(i),this.scrollWrap.add(i.mesh)})}calcItemWidth(){this.thumbs.length&&(this.itemWidth=this.thumbs[0].mesh.scale.x)}resetOffsetY(){this.offsetY=0}updateGalleryProgress(e){if(this.isTransitioning)return;const t=this.itemWidth,n=this.totalItems*this.itemWidth;this.progress=e*n;for(let i=0;i<this.totalItems;i++){const r=this.thumbs[i];if(!r)return;const o=t*i;r.xHook=o;let c=(o+this.progress+n*67890)%n;c>n/2&&(c-=n),r.mesh.position.set(c,0,0),c<-1.5||c>1.5?r.mesh.visible=!1:r.mesh.visible=!0}}resize=(e,t,n)=>{for(let i=0;i<this.thumbs.length;i++)this.thumbs[i].resize&&this.thumbs[i].resize(e,t,n);this.calcItemWidth()}}class T1 extends Uu{async init(){super.init(),this.backgroundColor=new ye("#222222").convertLinearToSRGB(),this.scene.background=this.backgroundColor,this.thumbs=this.add(w1),this.scene.add(this.thumbs)}getThumb(e){return this.thumbs.thumbs.find(t=>t.id===e)}setCamera(){this.camera=new Kn(-1,1,1,-1,0,1)}setRenderManager(){this.renderManager=new x1(this.renderer,this.scene,this.camera)}resize(e,t,n){this.renderManager.resize(t,t,1);for(let i=0;i<this.components.length;i++)this.components[i].resize&&this.components[i].resize(e,t,n)}update(e,t,n,i){super.update(e,t,n,i)}}function Ef(s,e,t,n=1){const i=t/n;return 2*Math.atan(s/e/(2*i))*(180/Math.PI)}class yg extends Iu{async init(){super.init()}setCamera(){this.distance=1e3,this.fov=Ef(innerWidth,innerWidth/innerHeight,this.distance),this.camera=new Ya(this.fov,Pe.aspect,1,this.distance*2),this.camera.position.set(0,0,this.distance)}setCameraController(){}update(e,t,n){super.update(e,t,n)}resize(e,t,n){super.resize(e,t,n),this.camera.fov=Ef(e,e/t,this.distance),this.camera.aspect=e/t,this.camera.updateProjectionMatrix()}}const A1=`
precision highp float;

${Ur}
${Ro}
${Za}
${Fr}
${Ja}
${Qa}
${Po}


float luminance(vec3 rgb) {
  const vec3 W = vec3(0.2125, 0.7154, 0.0721);
  return dot(rgb, W);
}

vec4 coverTexture(sampler2D tex, vec2 imgSize, vec2 ouv, vec2 containerSize) {
  vec2 s = containerSize;
  vec2 i = imgSize;
  float rs = s.x / s.y;
  float ri = i.x / i.y;
  vec2 new = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
  vec2 newOffset = (rs < ri ? vec2((new.x - s.x) / 2.0, 0.0) : vec2(0.0, (new.y - s.y) / 2.0)) / new;
  vec2 uv = ouv * s / new + newOffset;
  vec4 color = texture(tex, uv);

  return color;
}

uniform sampler2D tScene;
uniform sampler2D tWork;
uniform sampler2D tBloom;
uniform sampler2D tMouseSim;
uniform sampler2D tFluid;
uniform sampler2D tBlur;
uniform sampler2D tNoise;
uniform sampler2D tLensflare;

uniform sampler2D tMedia;
uniform float uMediaReveal;
uniform float uFluidStrength;

uniform float uRatio;
uniform float uReveal;
uniform vec3 uBgColor;

uniform bool boolBloom;
uniform bool boolFluid;
uniform bool boolLuminosity;
uniform bool boolFxaa;

uniform vec2 uDisplacementSize;
uniform vec2 uContainerSize;
uniform float uDisplacement;
uniform float uPerlin;
uniform float uContrast;
uniform sampler2D tPerlin;
uniform float uTime;
uniform float uTransformX;

in vec2 vUv;
out vec4 FragColor;

float random(vec2 st)
{
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}


void main() {
  vec2 perlinUv = vUv * .25;

  // apply ratio
  perlinUv.xy -= 0.5;
  perlinUv.x *= uRatio;
  perlinUv.xy += 0.5;

  perlinUv.x -= uTime * .01;  
  perlinUv.y -= uTime * .005;  

  perlinUv.x += uTransformX;

  vec4 perlin = texture(tPerlin, perlinUv);
  perlin.rgb = contrast(perlin.rgb, 5.);

  vec2 displacementUv = vUv * 2.;

  displacementUv.xy -= 0.5;
  displacementUv.x *= uRatio;
  displacementUv.xy += 0.5;

  vec4 fluid = texture(tFluid, vUv);
  vec2 fluidUv = vUv + fluid.rg * -.2 * uFluidStrength;
  vec2 uv = vUv + fluid.rg * -.2 * uFluidStrength;

  // vec2 uv = vUv;
  vec2 perlinCoords = vUv;

  float vignetteF = vignette(uv.xy, 0.1, .55, 2.0, .25);

  if(uPerlin > 0.0) {
    perlinCoords += perlin.b * uPerlin;
    perlinCoords -= uPerlin * .065;
  }

  vec4 mouseSim = texture(tMouseSim, mix(perlinCoords, uv, 2.5));

  mouseSim.rgb = contrast(mouseSim.rgb, 1.);
  
  float perlinVignette = vignette(perlinCoords.xy, 0.1, .35, 2.0, .5);
  float displacementVignette = vignette(uv.xy, 0.1, .5, 2.0, .5);
  
  vec4 sceneDisplaced = rgbshift(tWork, uv, -1., .005);
  vec4 scene = rgbshift(tWork, uv, -1., .0005 + .1 * length(fluid.xy) * uFluidStrength);

  vec3 sceneMixed = mix(scene.rgb, sceneDisplaced.rgb, (1. - displacementVignette) * 1.);
  vec3 mixed = mix(uBgColor, sceneMixed.rgb, 1.);

  mixed.rgb += mouseSim.rgb * .065;
  mixed.rgb = mix(mixed.rgb, mixed.rgb * 5., (1. - perlinVignette) * .075);

  vec3 displacedPerlin = perlin.rgb;
  mixed.rgb = blend(1, mixed.rgb, displacedPerlin, (1. - displacementVignette +  mouseSim.r * .5) * .05);

  if(boolBloom) {
    vec4 bloom = rgbshift(tBloom, uv, -1.5, .02);
    float angle = length(uv + 0.5);
    float uBloomDistortion = 2.5;
    float amount = .001 * uBloomDistortion;

    mixed.rgb += bloom.rgb;
    mixed.rgb += rgbshift(tBloom, uv, angle, amount / .5).rgb;
  }


  vec2 noiseUv = vUv;

  noiseUv.xy -= 0.5;
  noiseUv.x *= uRatio;
  noiseUv.xy += 0.5;

  noiseUv.xy *= 15.;

  vec4 noise = texture(tNoise, noiseUv);

  mixed.rgb = contrast(mixed.rgb, uContrast);
  mixed.rgb *= uContrast;

  // mixed.rgb += length(fluid.xy) * 1.15;

  mixed.rgb = saturation(mixed.rgb, 1.15);
  mixed.rgb = blend(11, mixed.rgb, uBgColor.rgb, .85);
  
  vec4 media = rgbshift(tMedia, fluidUv, length(fluidUv + 2.5), .15 * length(fluid.xy) * uFluidStrength);
  
  mixed.rgb = mix(mixed.rgb, media.rgb, media.a * uMediaReveal);
  mixed.rgb = mix(mixed.rgb * noise.rgb, mixed.rgb, .75);
  mixed.rgb = mix(mixed.rgb * noise.rgb, mixed.rgb, 1.5);
 
  FragColor = vec4(mixed.rgb, 1.);
}
`,D1=`
in vec3 position;
in vec2 uv;
uniform mat4 modelMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
out vec2 vUv;
void main() {
  vUv = uv;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vec4 mvPosition = viewMatrix * worldPosition;
  gl_Position = projectionMatrix * mvPosition;
}
`;class C1 extends mt{constructor(){super({glslVersion:lt,toneMapped:!1,uniforms:{tScene:new I(null),tWork:new I(null),tMedia:new I(null),tBloom:new I(null),tBlur:new I(null),tFluid:new I(null),tPortal:new I(null),tMouseSim:new I(null),boolBloom:new I(!1),boolFluid:new I(!1),boolLuminosity:new I(!1),boolFxaa:new I(!1),uTime:new I(0),tNoise:new I(null),tLensflare:new I(null),uRatio:new I(1),tPerlin:new I(Xt.perlin2),uDisplacementSize:new I(new Q),uContainerSize:new I(new Q),uDisplacement:new I(.1),uPerlin:new I(.1),uBgColor:new I(new ye("#1F1F1F").convertLinearToSRGB()),uReveal:new I(0),uMediaReveal:new I(0),uContrast:new I(xt.contrast),uTransformX:new I(0),uFluidStrength:new I(.5)},vertexShader:D1,fragmentShader:A1,blending:ot,depthWrite:!1,depthTest:!1})}update(e,t,n){this.uniforms.uTime.value=e}resize(e,t){this.uniforms.uContainerSize.value.set(e,t)}}const R1=`
in vec3 position;
in vec2 uv;

out vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}
`,P1=`
precision highp float;

uniform sampler2D tMap;
uniform vec2 uLightPosition;
uniform vec2 uScale;
uniform float uExposure;
uniform float uClamp;
uniform vec2 uResolution;

in vec2 vUv;

out vec4 FragColor;

vec3 lensflare(vec2 uv, vec2 pos) {
  vec2 uvd = uv * length(uv);

  float f21 = max(1.0 / (1.0 + 32.0 * pow(length(uvd + 0.8 * pos), 2.0)), 0.0) * 0.25;
  float f22 = max(1.0 / (1.0 + 32.0 * pow(length(uvd + 0.85 * pos), 2.0)), 0.0) * 0.23;
  float f23 = max(1.0 / (1.0 + 32.0 * pow(length(uvd + 0.9 * pos), 2.0)), 0.0) * 0.21;

  vec2 uvx = mix(uv, uvd, -0.5);
  float f41 = max(0.01 - pow(length(uvx + 0.4 * pos), 2.4), 0.0) * 6.0;
  float f42 = max(0.01 - pow(length(uvx + 0.45 * pos), 2.4), 0.0) * 5.0;
  float f43 = max(0.01 - pow(length(uvx + 0.5 * pos), 2.4), 0.0) * 3.0;

  uvx = mix(uv, uvd, -0.4);
  float f51 = max(0.01 - pow(length(uvx + 0.2 * pos), 5.5), 0.0) * 2.0;
  float f52 = max(0.01 - pow(length(uvx + 0.4 * pos), 5.5), 0.0) * 2.0;
  float f53 = max(0.01 - pow(length(uvx + 0.6 * pos), 5.5), 0.0) * 2.0;

  uvx = mix(uv, uvd, -0.5);
  float f61 = max(0.01 - pow(length(uvx - 0.3 * pos), 1.6), 0.0) * 6.0;
  float f62 = max(0.01 - pow(length(uvx - 0.325 * pos), 1.6), 0.0) * 3.0;
  float f63 = max(0.01 - pow(length(uvx - 0.35 * pos), 1.6), 0.0) * 5.0;

  return vec3(f21 + f41 + f51 + f61, f22 + f42 + f52 + f62, f23 + f43 + f53 + f63);
}

void main() {
    vec2 uv = vUv - 0.5;
    vec2 pos = uLightPosition - 0.5;

    uv.x *= uResolution.x / uResolution.y;
    pos.x *= uResolution.x / uResolution.y;

    uv *= uScale;
    pos *= uScale;

    vec3 color = lensflare(uv, pos) * texture(tMap, uLightPosition).rgb * 2.0;
    color = pow(color, vec3(0.5));
    color *= uExposure;
    color = clamp(color, 0.0, uClamp);

    FragColor = vec4(color, 1.0);
}
`;class L1 extends mt{constructor(){super({glslVersion:lt,uniforms:{tMap:{value:null},uLightPosition:{value:new Q(.5,.5)},uScale:{value:new Q(1.5,1.5)},uExposure:{value:1},uClamp:{value:1},uResolution:{value:new Q}},vertexShader:R1,fragmentShader:P1,depthTest:!1,depthWrite:!1})}}const wf=new Q(1,0),Tf=new Q(0,1);class I1{constructor(e,t,n){this.renderer=e,this.scene=t,this.camera=n,this.initSettings(),this.initRenderer(),this.compositeMaterial.uniforms.tNoise.value=Xt.blueNoise}initSettings(){this.settings={renderToScreen:!0,fxaa:{enabled:!1},mousesim:{enabled:!1},luminosity:{threshold:.1,smoothing:1,enabled:!1},bloom:{strength:.05,radius:.01,enabled:!1},blur:{scale:1,strength:8,enabled:!1},fluid:{enabled:Le.GPU_TIER>=3,mouseForce:5,cursorSize:6,delta:.125,poissonIterations:1,bounce:!1},lensflare:{scale:new Q(1.5,1.5),exposure:1,clamp:1,enabled:!1}}}initRenderer(){this.screenCamera=new Kn(-1,1,1,-1,0,1),this.screenGeometry=new Vt,this.screenGeometry.setAttribute("position",new bt([-1,3,0,-1,-1,0,3,-1,0],3)),this.screenGeometry.setAttribute("uv",new bt([0,2,0,0,2,0],2)),this.screen=new at(this.screenGeometry),this.screen.frustumCulled=!1,this.renderTargetA=new Dn(1,1,{depthBuffer:!1,stencilBuffer:!1}),this.renderTargetB=this.renderTargetA.clone(),this.renderTargetLensflare=this.renderTargetA.clone(),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5,this.renderTargetBright=this.renderTargetA.clone(),this.renderTargetComposite=this.renderTargetA.clone();for(let t=0,n=this.nMips;t<n;t++)this.renderTargetsHorizontal.push(this.renderTargetA.clone()),this.renderTargetsVertical.push(this.renderTargetA.clone());this.renderTargetBlurA=this.renderTargetA.clone(),this.renderTargetBlurB=this.renderTargetA.clone(),this.hBlurMaterial=new Na(wf),this.hBlurMaterial.uniforms.uBluriness.value=0,this.vBlurMaterial=new Na(Tf),this.vBlurMaterial.uniforms.uBluriness.value=0,this.FxaaMaterial=new ig,this.FxaaMaterial.uniforms.uResolution=new I(new Q),this.renderTargetFXAA=this.renderTargetA.clone(),this.luminosityMaterial=new sg,this.luminosityMaterial.uniforms.uThreshold.value=this.settings.luminosity.threshold,this.luminosityMaterial.uniforms.uSmoothing.value=this.settings.luminosity.smoothing,this.settings.lensflare.enabled&&(this.lensflareMaterial=new L1,this.lensflareMaterial.uniforms.uScale.value=this.settings.lensflare.scale,this.lensflareMaterial.uniforms.uExposure.value=this.settings.lensflare.exposure,this.lensflareMaterial.uniforms.uClamp.value=this.settings.lensflare.clamp),this.blurMaterials=[];const e=[3,5,7,9,11];for(let t=0,n=this.nMips;t<n;t++)this.blurMaterials.push(new rg(e[t]));this.BloomMaterial=new cg,this.BloomMaterial.uniforms.tBlur1.value=this.renderTargetsVertical[0].texture,this.BloomMaterial.uniforms.tBlur2.value=this.renderTargetsVertical[1].texture,this.BloomMaterial.uniforms.tBlur3.value=this.renderTargetsVertical[2].texture,this.BloomMaterial.uniforms.tBlur4.value=this.renderTargetsVertical[3].texture,this.BloomMaterial.uniforms.tBlur5.value=this.renderTargetsVertical[4].texture,this.BloomMaterial.uniforms.uBloomFactors.value=this.bloomFactors(),this.settings.fluid.enabled&&this.initFluid(),this.settings.mousesim.enabled&&this.initMouseSim(),this.compositeMaterial=new C1}setLightPosition(e,t){this.settings.lensflare.enabled&&this.lensflareMaterial.uniforms.uLightPosition.value.set(e,t)}initMouseSim(){this.mouseSimulation=new Ka({renderer:this.renderer})}initFluid(){this.fluidSimulation=new ag({renderer:this.renderer,mouseForce:this.settings.fluid.mouseForce,resolution:.005,cursorSize:this.settings.fluid.cursorSize,poissonIterations:this.settings.fluid.poissonIterations,bounce:this.settings.fluid.bounce,delta:this.settings.fluid.delta})}bloomFactors(){const e=[1,.8,.6,.4,.2];for(let t=0,n=this.nMips;t<n;t++){const i=e[t];e[t]=this.settings.bloom.strength*zn(i,1.2-i,this.settings.bloom.radius)}return e}resize=(e,t,n)=>{if(this.compositeMaterial.uniforms.uRatio.value=e/t,this.settings.renderToScreen&&(this.renderer.setPixelRatio(n),this.renderer.setSize(e,t)),this.settings.fxaa.enabled&&(this.renderTargetFXAA.setSize(e*n,t*n),this.FxaaMaterial.uniforms.uResolution.value.set(e*n,t*n)),this.settings.lensflare.enabled&&this.lensflareMaterial.uniforms.uResolution.value.set(e/8,t/8),this.settings.blur.enabled){const i=Math.round(e*this.settings.blur.scale),r=Math.round(t*this.settings.blur.scale);this.renderTargetBlurA.setSize(i,r),this.renderTargetBlurB.setSize(i,r),this.hBlurMaterial.uniforms.uResolution.value.set(e,t),this.vBlurMaterial.uniforms.uResolution.value.set(e,t)}if(e=Math.round(e*n),t=Math.round(t*n),this.renderTargetA.setSize(e,t),this.renderTargetLensflare.setSize(e,t),this.renderTargetComposite.setSize(e,t),this.settings.mousesim.enabled&&this.mouseSimulation.onResize(e/10,t/10),e=Fa(e)/2,t=Fa(t)/2,this.settings.luminosity.enabled&&this.renderTargetBright.setSize(e,t),this.settings.fluid.enabled&&this.fluidSimulation&&this.fluidSimulation.onResize(e/3,t/3),this.settings.bloom.enabled)for(let i=0,r=this.nMips;i<r;i++)this.renderTargetsHorizontal[i].setSize(e,t),this.renderTargetsVertical[i].setSize(e,t),this.blurMaterials[i].uniforms.uResolution.value.set(e,t),e/=2,t/=2};update=(e,t,n,i=this.camera,r=this.renderer,o=this.scene)=>{const a=this.renderTargetA,c=this.renderTargetBright,u=this.renderTargetsHorizontal,d=this.renderTargetsVertical,l=this.renderTargetComposite,h=this.renderTargetBlurA,f=this.renderTargetBlurB,g=this.renderTargetFXAA,v=this.renderTargetLensflare;if(r.setRenderTarget(a),r.render(o,i),this.settings.blur.enabled&&(this.hBlurMaterial.uniforms.tMap.value=a.texture,this.screen.material=this.hBlurMaterial,r.setRenderTarget(h),r.render(this.screen,this.screenCamera),this.vBlurMaterial.uniforms.tMap.value=h.texture,this.screen.material=this.vBlurMaterial,r.setRenderTarget(f),r.render(this.screen,this.screenCamera)),this.settings.lensflare.enabled&&(this.lensflareMaterial.uniforms.tMap.value=this.settings.blur.enabled?f.texture:a.texture,this.screen.material=this.lensflareMaterial,r.setRenderTarget(v),r.clear(),r.render(this.screen,this.screenCamera)),this.settings.luminosity.enabled&&(this.luminosityMaterial.uniforms.tMap.value=this.settings.blur.enabled?f.texture:a.texture,this.screen.material=this.luminosityMaterial,r.setRenderTarget(c),r.render(this.screen,this.screenCamera)),this.settings.bloom.enabled){let m=this.settings.luminosity.enabled?c:a;for(let p=0,x=this.nMips;p<x;p++)this.screen.material=this.blurMaterials[p],this.blurMaterials[p].uniforms.tMap.value=m.texture,this.blurMaterials[p].uniforms.uDirection.value=wf,r.setRenderTarget(u[p]),r.render(this.screen,this.screenCamera),this.blurMaterials[p].uniforms.tMap.value=this.renderTargetsHorizontal[p].texture,this.blurMaterials[p].uniforms.uDirection.value=Tf,r.setRenderTarget(d[p]),r.render(this.screen,this.screenCamera),m=d[p];this.screen.material=this.BloomMaterial,r.setRenderTarget(u[0]),r.render(this.screen,this.screenCamera),this.compositeMaterial.uniforms.tBloom.value=u[0].texture}this.settings.fluid.enabled&&(this.compositeMaterial.uniforms.uFluidStrength.value>0&&this.fluidSimulation.update(),this.fluidSimulation.fbos.main&&(this.compositeMaterial.uniforms.tFluid.value=this.fluidSimulation.fbos.main.texture)),this.settings.mousesim.enabled&&(this.mouseSimulation.update(e,t,n),this.compositeMaterial.uniforms.tMouseSim.value=this.mouseSimulation.bufferSim.output.texture),this.compositeMaterial.uniforms.tScene.value=this.settings.blur.enabled?f.texture:a.texture,this.compositeMaterial.uniforms.boolBloom.value=this.settings.bloom.enabled,this.compositeMaterial.uniforms.boolFluid.value=this.settings.fluid.enabled,this.compositeMaterial.uniforms.boolLuminosity.value=this.settings.luminosity.enabled,this.compositeMaterial.uniforms.boolFxaa.value=this.settings.fxaa.enabled,this.compositeMaterial.uniforms.tLensflare.value=v.texture,this.screen.material=this.compositeMaterial,this.settings.fxaa.enabled&&(r.setRenderTarget(g),r.render(this.screen,this.screenCamera),this.FxaaMaterial.uniforms.tMap.value=g.texture,this.screen.material=this.FxaaMaterial),this.settings.renderToScreen?(r.setRenderTarget(null),r.render(this.screen,this.screenCamera)):(r.setRenderTarget(l),r.render(this.screen,this.screenCamera),r.setRenderTarget(null))}}class U1 extends yg{async init(){super.init(),this.scene.background=new ye("#D9D9D9").convertLinearToSRGB(),this.onMouseMove=this.onMouseMove.bind(this),this.addEvents()}addEvents(){pe.on(xe.MOUSE_MOVE,this.onMouseMove)}onMouseMove({x:e,y:t}){this.renderManager&&this.renderManager.setLightPosition(0,1-t/Pe.h)}setRenderManager(){this.renderManager=new I1(this.renderer,this.scene,this.camera)}update(e,t,n){super.update(e,t,n),this.renderManager.compositeMaterial.update(e,t,n)}resize(e,t,n){super.resize(e,t,n),this.renderManager.compositeMaterial.resize(e,t)}}const F1=`
precision highp float;

${Ro}

#include <tonemapping_pars_fragment>

uniform sampler2D tScene;
uniform float uTime;
uniform float uRatio;  

float vignout = .5; // vignetting outer border
float vignin = 0.01; // vignetting inner border
float vignfade = 2.0; // f-stops till vignete fades

in vec2 vUv;
out vec4 FragColor;

void main() {
  vec2 uvOff = vUv;
  
  uvOff.x -= 0.5;
  uvOff.x *= uRatio;
  uvOff.x += 0.5;

  vec2 uvVignette = uvOff;     
  
  uvOff.xy -= 0.5;
  uvOff *= 5.;
  uvOff.xy += 0.5;

  float strength = 1. - abs(sin(distance(uvOff, vec2(0.5)) - 0.5 - uTime)) ;

  float vignetteF = vignette(uvVignette.xy, vignin, vignout, vignfade, .4);

  FragColor = vec4(vec3(strength), 1.);
  FragColor.rgb *= 1. - vignetteF;

  #include <tonemapping_fragment>
}
`;class N1 extends mt{constructor(){super({glslVersion:lt,toneMapped:!1,uniforms:{tScene:new I(null),uRatio:new I(1),uTime:new I(0)},vertexShader:tl,fragmentShader:F1,blending:ot,transparent:!0,depthWrite:!1,depthTest:!1})}}class O1 extends Lo{constructor(e,t,n){super(e,t,n),this.compositeMaterial=new N1}initSettings(){this.settings={renderToScreen:!1}}}class k1 extends Uu{async init(){super.init(),this.backgroundColor=new ye("red").convertLinearToSRGB(),this.scene.background=this.backgroundColor}getThumb(e){return this.thumbs.thumbs.find(t=>t.id===e)}setCamera(){this.camera=new Kn(-1,1,1,-1,0,1)}setRenderManager(){this.renderManager=new O1(this.renderer,this.scene,this.camera)}resize(e,t,n){this.renderManager.resize(t/10,t/10,n);for(let i=0;i<this.components.length;i++)this.components[i].resize&&this.components[i].resize(e,t,n);this.renderManager.compositeMaterial.uniforms.uRatio.value=e/t}update(e,t,n,i){super.update(e,t,n,i),this.renderManager.compositeMaterial.uniforms.uTime.value=e}}const B1=`
precision highp float;

${Fr}
${xg}
${gg}
${vg}
${dg}
${ug}
${pg}
${_g}

#include <tonemapping_pars_fragment>

uniform sampler2D tScene;
uniform float uTime;
uniform float uShader1Speed;
uniform float uShader1Alpha;
uniform float uShader1Scale;
uniform float uShader2Speed;
uniform float uShader2Scale;
uniform float uShader1Mix3;
uniform float uShader3Scale;
uniform float uShaderMix;

in vec2 vUv;
out vec4 FragColor;

void main() {
  vec2 uv = vUv;

  vec2 pos = vUv.xy * 4.;
  pos.x *= 1.5;

  vec4 noise = noiseShader(pos, uTime, uShader1Speed * .1);
  vec4 diffuseColor = texture(tScene, vUv);

  diffuseColor.rgb = blendReflect(diffuseColor.rgb, noise.rgb, .5);
  diffuseColor.rgb = contrast(diffuseColor.rgb, 2.);
  diffuseColor.rgb = diffuseColor.rgb * 2.;

  FragColor = vec4(.9 - diffuseColor.rgb, 1.);

  #include <tonemapping_fragment>
}
`,Zs={SHADER_1_ALPHA:.5,SHADER_1_SPEED:.5,SHADER_1_SCALE:5.5,SHADER_2_SPEED:0,SHADER_2_SCALE:0,SHADER_MIX:1.5};class z1 extends mt{constructor(){super({glslVersion:lt,toneMapped:!1,uniforms:{tScene:new I(null),uTime:new I(0),uShader1Alpha:new I(Zs.SHADER_1_ALPHA),uShader1Speed:new I(Zs.SHADER_1_SPEED),uShader2Speed:new I(Zs.SHADER_2_SPEED),uShader1Scale:new I(Zs.SHADER_1_SCALE),uShader2Scale:new I(Zs.SHADER_2_SCALE),uShaderMix:new I(Zs.SHADER_1_MIX_3)},vertexShader:tl,fragmentShader:B1,blending:ot,transparent:!0,depthWrite:!1,depthTest:!1})}}class H1 extends Lo{constructor(e,t,n){super(e,t,n),this.compositeMaterial=new z1}initSettings(){this.settings={renderToScreen:!1}}}class V1 extends Uu{async init(){super.init(),this.ticking=!0,this.backgroundColor=new ye("#666666").convertLinearToSRGB(),this.scene.background=this.backgroundColor}setCamera(){this.camera=new Kn(-1,1,1,-1,0,1)}setRenderManager(){this.renderManager=new H1(this.renderer,this.scene,this.camera)}async resize(e,t,n){Le.LOW_RES&&(this.ticking=!0),this.renderManager.resize(t*.75,t*.75,1);for(let i=0;i<this.components.length;i++)this.components[i].resize&&this.components[i].resize(e,t,n);Le.LOW_RES&&(await fn(100),this.ticking=!1)}update(e,t,n,i){this.ticking&&(super.update(Le.LOW_RES?0:e,t,n,i),this.renderManager.compositeMaterial.uniforms.uTime.value=Le.LOW_RES?0:e)}}const G1=`
precision highp float;

#include <tonemapping_pars_fragment>

${Ur}
${Ro}
${Za}
${Fr}
${Ja}
${Qa}
${Po}


float luminance(vec3 rgb) {
  const vec3 W = vec3(0.2125, 0.7154, 0.0721);
  return dot(rgb, W);
}

uniform sampler2D tScene;
uniform sampler2D tBloom;
uniform sampler2D tFluid;
uniform sampler2D tBlur;
uniform sampler2D tMouseSim;

uniform bool boolBloom;
uniform bool boolFluid;
uniform bool boolLuminosity;
uniform bool boolFxaa;

in vec2 vUv;
out vec4 FragColor;

void main() {
  vec4 mixed = texture(tScene, vUv);
  FragColor = mixed;

  #include <tonemapping_fragment>
}
`;class W1 extends mt{constructor(){super({glslVersion:lt,toneMapped:!1,uniforms:{tScene:new I(null),tBloom:new I(null),tBlur:new I(null),tFluid:new I(null),tMouseSim:new I(null),boolBloom:new I(!1),boolFluid:new I(!1),boolLuminosity:new I(!1),boolFxaa:new I(!1)},vertexShader:el,fragmentShader:G1,transparent:!0,depthWrite:!1,depthTest:!1})}}class j1 extends Lo{constructor(e,t,n){super(e,t,n),this.compositeMaterial=new W1}initSettings(){this.settings={renderToScreen:!1,clear:!0}}}class X1{constructor(e){this.gl=e,this.items=[],this.backgroundColor=new ye("#000000").convertLinearToSRGB()}update(e){if(this.items.length)for(let t=0;t<this.items.length;t++)this.items[t].instance.update(e)}resize(e,t,n){if(this.items.length<1)return!1;for(let i=0;i<this.items.length;i++)this.items[i].instance.resize(e,t,n)}add(e,t){return this.items.push({id:t,instance:e}),e.backgroundColor=this.backgroundColor,e.updateBackground(),this.gl.scene.add(e),e}remove(e){const t=this.items.findIndex(n=>n.id===e);t<0||(this.items.splice(t,1),this.gl.scene.remove(this.items[t].instance))}}class $1 extends yg{async init(){super.init(),this.mediaItems=new X1(this)}setRenderManager(){this.renderManager=new j1(this.renderer,this.scene,this.camera)}setScene(){this.scene=new To}update(e,t,n,i){this.renderer.autoClear=!0,super.update(e,t,n,i),this.renderer.autoClear=!1}resize(e,t,n){super.resize(e,t,n),this.mediaItems.resize(e,t,n)}}const q1=`
precision highp float;

#include <tonemapping_pars_fragment>

${Ur}
${Fr}
${Po}


uniform sampler2D tScene;
uniform sampler2D tBloom;
uniform sampler2D tFluid;
uniform sampler2D tBlur;
uniform sampler2D tMouseSim;

uniform bool boolBloom;
uniform bool boolFluid;
uniform bool boolLuminosity;
uniform bool boolFxaa;

in vec2 vUv;
out vec4 FragColor;

void main() {
  vec2 uv = vUv;
  vec4 mixed = texture(tScene, uv);
  mixed.rgb = contrast(mixed.rgb, 1.65);
  mixed.rgb = saturation(mixed.rgb, .5);

  FragColor = vec4(mixed.rgb, 1.);

  #include <tonemapping_fragment>
}
`;class Y1 extends mt{constructor(){super({glslVersion:lt,toneMapped:!1,uniforms:{tScene:new I(null),tBloom:new I(null),tBlur:new I(null),tFluid:new I(null),tMouseSim:new I(null),boolBloom:new I(!1),boolFluid:new I(!1),boolLuminosity:new I(!1),boolFxaa:new I(!1)},vertexShader:el,fragmentShader:q1,blending:ot,transparent:!0,depthWrite:!1,depthTest:!1})}}class K1 extends Lu{constructor(e,t,n){super(e,t,n),this.compositeMaterial=new Y1}initSettings(){this.settings={renderToScreen:!1,fxaa:{enabled:!1},mousesim:{enabled:!1},luminosity:{threshold:.1,smoothing:.95,enabled:!1},bloom:{strength:.15,radius:1.5,enabled:!1},blur:{scale:1,strength:8,enabled:!1},fluid:{enabled:!1,mouseForce:25,cursorSize:20,delta:.019,poissonIterations:1,bounce:!1}}}}const Z1={AMBIENT_COLOR:"#fff",AMBIENT_INTENSITY:1,LIGHT_1_POS:{x:-1.5,y:1.1,z:2.4},LIGHT_1_COLOR:"#b2b2b2",LIGHT_1_INTENSITY:10.456521739130435,LIGHT_2_POS:{x:10.5,y:100.1,z:2.4},LIGHT_2_COLOR:"green",LIGHT_2_INTENSITY:10,LIGHT_3_POS:{x:.5,y:80,z:-100},LIGHT_3_COLOR:"green",LIGHT_3_INTENSITY:7,SHADOW_NORMAL_BIAS:.01,SHADOW_RADIUS:10,SHADOW_CAMERA_FAR:43.47826086956522,LOGO_SCALE:.7,LOGO_COLOR:"#ffffff",BACKGROUND_COLOR:"#1a1a1a",FOG_COLOR:"A294FF",FOG_NEAR:17.391304347826086,FOG_FAR:35.869565217391305,PARTICLES_COLOR:"#5b5b5b",FLUID_ENABLED:!1,FXAA_ENABLED:!1,LUMINOSITY_ENABLED:!0,BLOOM_ENABLED:!0,CAMERA_POS:{x:0,y:.5,z:4.5},CAMERA_FOV:40,ROUGHNESS_INTENSITY:.9456521739130435,ENVMAP_INTENSITY:1,EMISSIVE_INTENSITY:.5,METALNESS_INTENSITY:1,ROUGHNESS_PATTERN_INTENSITY:1,ROUGHNESS_PATTERN_CONTRAST:3.1521739130434785,ROUGHNESS_PATTERN_SCALE:16.304347826086957,ROUGHNESS_DISTORTION_INTENSITY:0,ROUGHNESS_DISTORTION_SCALE:6.521739130434783,SHADER_1_ALPHA:.5,SHADER_1_SPEED:0,SHADER_1_SCALE:5.5,SHADER_2_ALPHA:0,SHADER_2_SCALE:13,SHADER_3_ALPHA:0,SHADER_3_SPEED:0,SHADER_3_SCALE:0,SHADER_1_MIX_3:1};class J1{constructor(e){this.gl=e,this.lights=[],this.addAmbientLight()}addAmbientLight(){const{AMBIENT_COLOR:e,AMBIENT_INTENSITY:t}=Z1;this.ambientLight=new eg(e,5),this.gl.scene.add(this.ambientLight),this.directionalLight=new So("#ff9d00",3),this.directionalLight.position.set(2,-1,-1),this.gl.scene.add(this.directionalLight),this.directionalLight2=new So("blue",2),this.directionalLight2.position.set(-1,1,0),this.gl.scene.add(this.directionalLight2)}}class Q1 extends rt{constructor(e){super(),this.params={horizontal:!0,vertical:!1,dampingFactor:5},Object.assign(this.params,e),this.enabled=!0,this.onMouseDown=this.onMouseDown.bind(this),this.onMouseMove=this.onMouseMove.bind(this),this.onMouseUp=this.onMouseUp.bind(this),this.progress=0,this.drag={xLerp:0,yLerp:0,zLerp:0,x:0,y:0},this.targetRotationOnMouseDown={x:0,y:0},this.currentRotation={x:0,y:0},this.targetRotation={x:0,y:0},this.currentMove={x:0,y:0},this.mouseOnMouseDown={x:0,y:0},this.finalRotationY=0,this.isPointerDown=!1,this.pointer={x:innerWidth/2,y:innerHeight/2}}addEvents(){const e={passive:!0},t="ontouchmove"in window?"touchstart":"mousedown",n="ontouchmove"in window?"touchmove":"mousemove",i="ontouchmove"in window?"touchend":"mouseup";window.addEventListener(t,this.onMouseDown,e),window.addEventListener(n,this.onMouseMove,e),window.addEventListener(i,this.onMouseUp)}removeEvents(){const e="ontouchmove"in window?"touchstart":"mousedown",t="ontouchmove"in window?"touchmove":"mousemove",n="ontouchmove"in window?"touchend":"mouseup";window.removeEventListener(e,this.onMouseDown),window.removeEventListener(t,this.onMouseMove),window.removeEventListener(n,this.onMouseUp)}onMouseDown(e){this.isPointerDown||(this.isPointerDown=!0,this.pointer.x=e.touches?e.touches[0].clientX:e.clientX,this.pointer.y=e.touches?e.touches[0].clientY:e.clientY,this.targetRotationOnMouseDown.x=this.targetRotation.x,this.targetRotationOnMouseDown.y=this.targetRotation.y)}onMouseMove(e){if(!this.isPointerDown)return;const t=e.touches?e.touches[0].clientX:e.clientX,n=e.touches?e.touches[0].clientY:e.clientY;this.currentMove.x=t-this.pointer.x,this.currentMove.y=n-this.pointer.y,this.targetRotation.y=this.targetRotationOnMouseDown.y+(this.currentMove.y-this.mouseOnMouseDown.y)*.01,this.targetRotation.x=this.targetRotationOnMouseDown.x+(this.currentMove.x+this.mouseOnMouseDown.x)*.01}onMouseUp(){this.isPointerDown=!1}update(e){if(this.enabled){const{horizontal:t,vertical:n}=this.params;if(t){const i=this.targetRotation.x;this.rotation.y=Yi(this.rotation.y,i,this.params.dampingFactor,e)}if(n){const i=this.targetRotation.y;this.rotation.x=Yi(this.rotation.x,i,this.params.dampingFactor,e)}}}}class eD extends rt{constructor(e){super(e),this.gl=e,this.cameraPanGroup=new rt,this.mouse=new Q(.5,.5),this.settings={size:.0065,scale:.125},this.rotatableMesh=new Q1({horizontal:!0,vertical:!1}),this.init(),this.scale.set(this.settings.scale,this.settings.scale,this.settings.scale),this.rotatableMesh.add(this),this.cameraPanGroup.add(this.rotatableMesh),e.scene.add(this.cameraPanGroup)}async init(){await this.getModel()}async getModel(){const e=await Xt.characterModel;this.modelTextured=e.scene.children[0],this.position.set(0,-.05,0),this.add(this.modelTextured)}resize(e,t,n){Pe.w>=Le.BREAKPOINTS.LG?this.settings.scale=.145:this.settings.scale=.085,this.scale.set(this.settings.scale,this.settings.scale,this.settings.scale)}update(e,t,n){this.rotatingActive||this.rotatableMesh.update(t),this.mouse.x=zn(this.mouse.x,Pe.mouse.normalized.x,.1),this.mouse.y=zn(this.mouse.y,Pe.mouse.normalized.y,.1),this.cameraPanGroup.rotation.x=bo(zn(this.cameraPanGroup.rotation.x,-this.mouse.y+.5,2*t),-.15,.3),this.rotation.y+=t*1}}class tD extends Iu{async init(){super.init(),await Xt.thumbsReady,this.backgroundColor=new ye("black").convertLinearToSRGB(),this.scene.background=this.backgroundColor,this.lights=this.add(J1),this.character=this.add(eD)}setRenderManager(){this.renderManager=new K1(this.renderer,this.scene,this.camera)}setCameraControllerSettings(){}setCameraController(){}resize(e,t,n){super.resize(t,t,n)}update(e,t,n,i){super.update(e,t,n,i)}}class nD{constructor(){this.scenes=[],this.id="CANVAS",this.initPromise=new Promise(e=>{this.initResolve=e})}async init(){Xt.initLoaders(),this.canvasEl=document.querySelector(".gl"),this.renderer=new qw(this.canvasEl),this.anisotropy=this.renderer.capabilities.getMaxAnisotropy(),this.update=this.update.bind(this),this.addEvents(),this.skyScene=new V1(this),this.workScene=new p1(this),this.workThumbScene=new T1(this),this.mainScene=new U1(this),this.wavvesScene=new k1(this),this.mediaScene=new $1(this),this.characterScene=new tD(this),this.addScene(this.skyScene,"sky"),this.addScene(this.mediaScene,"media"),this.addScene(this.workScene,"work"),this.addScene(this.mainScene,"main"),this.addScene(this.workThumbScene,"workthumb"),this.addScene(this.wavvesScene,"wavves"),this.addScene(this.characterScene,"character"),pe.emit(xe.RESIZE),await fn(100),this.mainScene.renderManager.compositeMaterial.uniforms.tWork.value=this.workScene.renderManager.renderTargetComposite.texture,this.mainScene.renderManager.compositeMaterial.uniforms.tMedia.value=this.mediaScene.renderManager.renderTargetComposite.texture,this.mainScene.renderManager.compositeMaterial.uniforms.tMouseSim.value=this.workScene.renderManager.mouseSimulation.bufferSim.output.texture;const e=this.skyScene.renderManager.renderTargetComposite.texture;e.wrapS=e.wrapT=ci,this.workScene.env.material.customUniforms.tSky.value=e,Qe.debug&&Qe.debug.initPerf(this.renderer),pe.emit(xe.RESIZE),this.start(),this.initResolve()}async animateIn(){await this.initPromise,await Xt.blueNoise,await Xt.floorNormal,await Xt.perlin1,await Xt.perlin2,oe.fromTo(this.canvasEl,{opacity:0},{opacity:1,duration:.5,ease:"none"})}start(){Bt.add(this.update,this.id)}addEvents(){pe.on(xe.RESIZE,this.resize)}removeEvents(){pe.off(xe.RESIZE,this.resize)}update({time:e,delta:t,frame:n,fps:i}){if(Qe.debug&&Qe.debug.begin(n),this.scenes.length)for(let r=0;r<this.scenes.length;r++)this.scenes[r].instance.update(e,t,n,i);Qe.debug&&Qe.debug.end(n)}resize=()=>{const{w:e,h:t,dpr:n}=Pe;if(this.renderer.resize(e,t,n),this.scenes.length<1)return!1;for(let i=0;i<this.scenes.length;i++)this.scenes[i].instance.resize(e,t,n)};addScene(e,t){return this.scenes.push({id:t,instance:e}),e}removeScene(e){const t=this.scenes.findIndex(n=>n.id===e);t<0||(this.scenes.splice(t,1),this.scenes.length<=0&&this.stop())}}const J=new nD;class Sg extends Ht{constructor({content:e,page:t,title:n,wrapper:i}){super(i.lastElementChild,t,ga("view"),"View",!1),this._contentString=e.outerHTML,this._DOM=null,this.title=n,this.wrapper=i}onEnter(){}onEnterCompleted(){}onLeave(){}onLeaveCompleted(){}update(){document.title=this.title,this.wrapper.appendChild(this._DOM.firstElementChild),this.el=this.wrapper.lastElementChild,this._DOM=null}createDom(){this._DOM||(this._DOM=document.createElement("div"),this._DOM.innerHTML=this._contentString)}remove(){this.wrapper.firstElementChild.remove()}enter(e,t){return new Promise(n=>{this.init(),this.addEvents(),e.enter({trigger:t,to:this.el}).then(()=>{this.onEnterCompleted(),n()})})}leave(e,t,n){return new Promise(i=>{this.onLeave(),e.leave({trigger:t,from:this.el}).then(()=>{n&&this.remove(),this.onLeaveCompleted(),this.destroy(),i()})})}}class nl{constructor({wrapper:e}){this.wrapper=e}leave(e){return new Promise(t=>{this.onLeave({...e,done:t})})}enter(e){return new Promise(t=>{this.onEnter({...e,done:t})})}onLeave({from:e,trigger:t,done:n}){n()}onEnter({to:e,trigger:t,done:n}){n()}}function Xn(s){const e=new URL(s,window.location.origin),t=e.hash.length?s.replace(e.hash,""):null;return{hasHash:e.hash.length>0,pathname:e.pathname,host:e.host,raw:s,href:t||e.href}}class ha{static init({views:e={default:Sg},transitions:t={default:nl}}){this.views=e,this.transitions=t,this.defaultView=this.views.default,this.defaultTransition=this.transitions.default,this.cache=new Map,this.isTransitioning=!1,this.currentCacheEntry=null,this.wrapper=document.querySelector("main"),this.removeOldContent=!0,this.allowInterruption=!1,this.bypassCache=!1,this.isPopping=!1,this.active=!0,this.attachEvents("a:not([target]):not([href^=\\#]):not([data-router-ignore])"),this.currentLocation=Xn(window.location.href),this.cache.set(this.currentLocation.href,this.createCacheEntry(document.cloneNode(!0))),this.currentCacheEntry=this.cache.get(this.currentLocation.href),this.currentCacheEntry.view.init(),this.currentCacheEntry.view.addEvents()}static destroy(){pe.off("click","a:not([target]):not([href^=\\#]):not([data-router-ignore])",this.onClick),pe.off("popstate",window,this.onPopstate)}static setDefaultView(e){this.defaultView=this.views[e]}static setDefaultTransition(e){this.defaultTransition=this.transitions[e]}static preload(e,t=!1){return e=Xn(e).href,this.cache.has(e)?Promise.resolve():this.fetch(e,!1).then(async n=>{this.cache.set(e,this.createCacheEntry(n)),t&&this.cache.get(e).view.createDom()})}static updateCache(e){const t=Xn(e||window.location.href).href;this.cache.has(t)&&this.cache.delete(t),this.cache.set(t,this.createCacheEntry(document.cloneNode(!0)))}static clearCache(e){const t=Xn(e||window.location.href).href;this.cache.has(t)&&this.cache.delete(t)}static navigateTo(e,t=!1,n=!1){return new Promise((i,r)=>{if(!this.allowInterruption&&this.isTransitioning){r();return}this.isTransitioning=!0,this.isPopping=!0,this.targetLocation=Xn(e),this.popTarget=window.location.href;const o=new(this.chooseTransition(t))({wrapper:this.wrapper});let a;if(this.bypassCache||!this.cache.has(this.targetLocation.href)||this.cache.get(this.targetLocation.href).skipCache){const c=this.fetch(this.targetLocation.raw).then(u=>{this.cache.set(this.targetLocation.href,this.createCacheEntry(u)),this.cache.get(this.targetLocation.href).view.createDom()});a=this.beforeFetch(this.targetLocation,o,n).then(async()=>c.then(async u=>await this.afterFetch(this.targetLocation,o,this.cache.get(this.targetLocation.href),n)))}else this.cache.get(this.targetLocation.href).view.createDom(),a=this.beforeFetch(this.targetLocation,o,n).then(async()=>await this.afterFetch(this.targetLocation,o,this.cache.get(this.targetLocation.href),n));a.then(()=>{i()})})}static on(e,t){pe.on(e,t)}static off(e,t){pe.off(e,t)}static beforeFetch(e,t,n){return pe.emit(xe.NAVIGATE_OUT,{from:this.currentCacheEntry,trigger:n}),new Promise(i=>{this.currentCacheEntry.view.leave(t,n,this.removeOldContent).then(()=>{n!=="popstate"&&window.history.pushState({},"",e.raw),i()})})}static afterFetch(e,t,n,i){return this.currentLocation=e,this.popTarget=this.currentLocation.href,new Promise(r=>{n.view.update(),pe.emit(xe.NAVIGATE_IN,{from:this.currentCacheEntry,to:n,trigger:i}),n.view.enter(t,i).then(()=>{pe.emit(xe.NAVIGATE_END,{from:this.currentCacheEntry,to:n,trigger:i}),this.currentCacheEntry=n,this.isTransitioning=!1,this.isPopping=!1,r()})})}static attachEvents(e){pe.delegate("click",e,this.onClick),pe.on("popstate",window,this.onPopstate)}static onClick=e=>{if(this.active&&!(e.metaKey||e.ctrlKey)){const t=Xn(e.currentTarget.href);if(this.currentLocation=Xn(window.location.href),this.currentLocation.host!==t.host)return;if(this.currentLocation.href!==t.href||this.currentLocation.hasHash&&!t.hasHash){e.preventDefault(),this.navigateTo(t.raw,e.currentTarget.dataset.transition||!1,e.currentTarget).catch(n=>console.warn(n));return}!this.currentLocation.hasHash&&!t.hasHash&&e.preventDefault()}};static onPopstate=()=>{if(window.location.pathname===this.currentLocation.pathname&&!this.isPopping)return!1;if(!this.allowInterruption&&(this.isTransitioning||this.isPopping))return window.history.pushState({},"",this.popTarget),!1;this.isPopping||(this.popTarget=window.location.href),this.isPopping=!0,this.navigateTo(window.location.href,!1,"popstate")};static async fetch(e,t=!0){try{const n=await fetch(e,{mode:"same-origin",method:"GET",headers:{"X-Requested-With":"rdb"},credentials:"same-origin"});if(!n.ok)throw new Error(n.statusText);const i=await n.text();return N0(i)}catch(n){throw t&&(window.location.href=e),n}}static chooseTransition(e){if(e)return this.transitions[e];const t=this.router?.findMatch(this.currentLocation,this.targetLocation);return t?this.transitions[t]:this.defaultTransition}static createCacheEntry(e){const t=e.querySelector("[data-view]"),n=t.dataset.view.length&&this.views[t.dataset.view]!==void 0?this.views[t.dataset.view]:this.views.default;return n||console.warn(`"${t.dataset.view}" not found.`),{page:e,content:t,skipCache:t.hasAttribute("data-view-nocache"),title:e.title,view:new n({wrapper:this.wrapper,title:e.title,content:t,page:e})}}}class Ki{static init(){this.id="header",this.el=document.querySelector(".ui-header"),this.headerVersion=this.el.querySelector(".ui-header-version > a"),this.headerName=this.el.querySelectorAll(".ui-header-name .ui-header-part-inner"),this.headerDescription=this.el.querySelectorAll(".ui-header-description .ui-header-part-inner"),this.headerAvailibility=this.el.querySelector(".ui-header-availability .ui-header-part-inner"),this.params={duration:1800,ease:"expoOut",stagger:60}}static setPointerEvents(e){this.el.querySelector(".ui-header-name").style.pointerEvents=e}static animateVersionIn(){oe.fromTo(this.headerVersion,{y:"130%"},{y:0,duration:1.8,ease:"expo.out"})}static animateNameIn(){oe.fromTo(this.headerName,{y:"130%",opacity:0},{y:0,delay:.1,opacity:1,duration:1.8,ease:"expo.out"})}static animateDescriptionIn(){this.headerDescriptionOutTl&&this.headerDescriptionOutTl.kill(),this.headerDescriptionInTl=oe.fromTo(this.headerDescription,{y:"130%",opacity:0},{y:0,opacity:1,duration:1.8,ease:"expo.out"})}static animateAvailibilityIn(){this.headerAvailibilityOutTl&&this.headerAvailibilityOutTl.kill(),this.headerAvailibilityInTl=oe.fromTo(this.headerAvailibility,{y:"130%",opacity:0},{y:0,opacity:1,duration:1.8,ease:"expo.out"})}static animateDescriptionOut(){this.headerDescriptionInTl&&this.headerDescriptionInTl.kill(),this.headerDescriptionOutTl=oe.to(this.headerDescription,{opacity:0,duration:.5,ease:"none"})}static animateAvailibilityOut(){this.headerAvailibilityInTl&&this.headerAvailibilityInTl.kill(),this.headerAvailibilityOutTl=oe.to(this.headerAvailibility,{opacity:0,duration:.5,ease:"none"})}}class Tr{static init(){this.id="nav",this.el=document.querySelector(".ui-nav"),this.menuLinks=this.el.querySelectorAll(".ui-nav-a"),this.navItemsInner=this.el.querySelectorAll(".ui-nav-a-inner"),this.setPointerEvents("none"),this.addEvents()}static animateIn(){this.setPointerEvents("all"),oe.to(this.navItemsInner,{y:0,opacity:1,duration:1.8,stagger:.01,ease:"expo.out"})}static animateOut(){this.setPointerEvents("none"),oe.to(this.navItemsInner,{opacity:0,duration:.5,ease:"none"})}static addEvents(){this.updateNavActive(),this.menuLinks.forEach(e=>{e.addEventListener("mouseenter",t=>{ln.playHover()}),e.addEventListener("click",t=>{ln.playClick(),this.clear(),this.setActive(e.dataset.slug)})})}static setPointerEvents(e){this.el.querySelectorAll(".ui-nav-a").forEach(n=>{n.style.pointerEvents=e})}static clear(){this.el.querySelectorAll(".ui-nav-a").forEach(t=>{t.classList.remove("is-active")})}static setActive(e){this.el.querySelectorAll(".ui-nav-a").forEach(n=>{n.dataset.slug===e&&!n.classList.contains("is-active")&&n.classList.add("is-active")})}static updateNavActive(){this.el.querySelectorAll(".ui-nav-a").forEach(t=>{const i=window.location.href.split("?")[0],r=Xn(t.href);Xn(i).raw===r.raw?t.classList.add("is-active"):t.classList.remove("is-active")})}}class Ar{static init(){this.id="navMobile",this.el=document.querySelector(".ui-nav-mobile"),this.menuLinks=this.el.querySelectorAll(".ui-nav-mobile-a"),this.navItemsInner=this.el.querySelectorAll(".ui-nav-mobile-a-inner"),this.toggle=this.el.querySelector(".ui-nav-mobile-toggle"),this.addEvents()}static animateIn(){oe.fromTo(this.el,{opacity:0},{opacity:1,duration:.5,ease:"linear"})}static animateOut(){oe.to(this.el,{opacity:0,duration:.5,ease:"none"})}static addEvents(){this.updateNavActive(),this.toggle.addEventListener("click",()=>{this.el.classList.toggle("is-active"),document.documentElement.classList.toggle("is-nav-mobile-open")}),this.menuLinks.forEach(e=>{e.addEventListener("click",async t=>{await fn(300),this.setActive(e.dataset.slug),this.clear()})})}static clear(){this.el.querySelectorAll(".ui-nav-mobile-a"),this.el.classList.remove("is-active"),document.documentElement.classList.remove("is-nav-mobile-open")}static setActive(e){this.el.querySelectorAll(".ui-nav-mobile-a").forEach(n=>{n.dataset.slug===e&&n.classList.add("is-active")})}static updateNavActive(){this.el.querySelectorAll(".ui-nav-mobile-a").forEach(t=>{const i=window.location.href.split("?")[0],r=Xn(t.href);Xn(i).raw===r.raw?t.classList.add("is-active"):t.classList.remove("is-active")})}}class iD extends Ht{static init(){this.onCtaClick=this.onCtaClick.bind(this),this.onCta2Click=this.onCta2Click.bind(this),this.onLoadProgress=this.onLoadProgress.bind(this),this.onLoadComplete=this.onLoadComplete.bind(this),this.progress=0,this.textAnimationIsPaused=!1,this.textAnimationInterval=400,this.el=document.querySelector(".preloader"),this.progressContainer=document.querySelector(".preloader-progress"),this.progressCircles=document.querySelector(".preloader-progress-circles"),this.progressCircle=document.querySelector(".preloader-progress-circle"),this.progressCircleR=this.progressCircle.r.baseVal.value,this.progressCircleOutline=document.querySelector(".preloader-progress-outline"),this.progressCircleOutlineR=this.progressCircleOutline.r.baseVal.value,this.progressTextInner=document.querySelector(".preloader-progress-text-inner"),this.progressText=document.querySelector(".preloader-progress-text-percent"),this.textDots=document.querySelector(".preloader-footer-text-dots"),this.cta=document.querySelector(".preloader-cta"),this.cta2=document.querySelector(".preloader-cta-2"),this.ctaTextInner=document.querySelector(".preloader-cta-text-inner"),this.ctaTextInner2=document.querySelector(".preloader-cta-text-2-inner"),this.footerTextInner=document.querySelector(".preloader-footer-text-inner"),this.setProgressCircle(0),document.body.style="",this.initLoader()}static async initLoader(){pe.on(xe.LOAD_PROGRESS,this.onLoadProgress),pe.on(xe.LOAD_COMPLETE,this.onLoadComplete),await fn(100),Ki.animateVersionIn(),Ki.animateNameIn(),J.animateIn(),Xt.preloadThumbs(),pe.emit(xe.LOAD_START),this.animateIn(),this.loadingTextAnimation()}static async onLoadComplete(){this.rotationAnimation.pause();const e=135-this.rotation%360+360;oe.to(this.progressCircles,{rotate:`+=${e}deg`,duration:2,ease:"expo.out"});const t={progress:0,ease:"expo.out",duration:2};oe.to(this.progressContainer,{translateY:"-.75rem",duration:t.duration,ease:t.ease}),oe.fromTo(this.ctaTextInner,{translateY:"-102%",opacity:0},{translateY:"0",opacity:1,duration:1.2,ease:"expo.out"}),oe.fromTo(this.progressTextInner,{translateY:"0"},{translateY:"102%",duration:1.2,ease:"expo.out"}),oe.to(this.progressTextInner,{opacity:0,duration:.2,ease:"none"}),oe.to(this,{progressCircleR:120,duration:t.duration,ease:t.ease,onUpdate:()=>{this.progressCircle.setAttribute("r",this.progressCircleR)}}),oe.to(this,{progressCircleOutlineR:115,duration:t.duration,ease:t.ease,onUpdate:()=>{this.progressCircleOutline.setAttribute("r",this.progressCircleOutlineR)}}),oe.to(t,{progress:100,duration:t.duration,ease:t.ease,onUpdate:()=>{this.setProgressCircleToIntro(t.progress)}}),oe.fromTo(this.footerTextInner,{translateY:"0",opacity:1},{translateY:"102%",opacity:0,duration:1,ease:"expo.out"}),oe.fromTo(this.ctaTextInner2,{translateY:"102%",opacity:0},{translateY:"0",opacity:1,duration:2,delay:.2,ease:t.ease}),await fn(1e3),this.cta.classList.add("is-active"),this.cta2.classList.add("is-active"),this.cta.addEventListener("click",this.onCtaClick),this.cta2.addEventListener("click",this.onCta2Click)}static onCtaClick(e){Qe.isMobile||(ln.initSounds(),ln.toggleSound(),ln.playClick()),pe.emit(xe.LOAD_END),pe.emit(xe.ANIMATE_IN),this.animateGlobalComponentsIn(),this.animateOut()}static onCta2Click(e){Qe.isMobile||ln.initSounds(),pe.emit(xe.LOAD_END),pe.emit(xe.ANIMATE_IN),this.animateGlobalComponentsIn(),this.animateOut()}static animateGlobalComponentsIn(){ln.showSoundButton(),document.body.querySelector("[data-view]").dataset.view!=="error"&&(Tr.animateIn(),Ar.animateIn())}static animateOut(){this.el.style.pointerEvents="none",this.cta.style.pointerEvents="none",this.cta2.style.pointerEvents="none",oe.to(this.progressContainer,{scale:1.2,opacity:0,duration:1,ease:"expo.out",onComplete:()=>{this.el.remove()}})}static onLoadProgress(e){this.animateProgressCircle(e),this.setProgressText(e)}static animateProgressCircle(e){oe.to(this,{progress:e,duration:1,ease:"power4.out",onUpdate:()=>{this.setProgressCircle(this.progress)}})}static async animateIn(){this.rotation=0,oe.fromTo(this.progressContainer,{scale:.9,opacity:0},{scale:1,opacity:1,duration:3,ease:"power4.out"}),oe.fromTo(this.footerTextInner,{opacity:0,translateY:"110%"},{opacity:1,translateY:"0",duration:1.8,delay:.02,ease:"expo.out"}),this.rotationAnimation=oe.to(this,{rotation:360,duration:6,ease:"none",repeat:-1,onUpdate:()=>{this.progressCircles.style.transform=`rotate(${this.rotation}deg)`}})}static async setProgressText(e){this.progressText.innerHTML=Math.floor(e)}static setProgressCircle(e=0){const t=this.progressCircle.r.baseVal.value,n=Math.PI*t*2,i=n-n*e/100;this.progressCircle.style.strokeDasharray=n,this.progressCircle.style.strokeDashoffset=i}static loadingTextAnimation(e=""){if(this.textAnimationIsPaused){setTimeout(()=>this.loadingTextAnimation(e),this.textAnimationInterval);return}this.textDots.innerText=e,e=e.length<3?e+".":"",setTimeout(()=>this.loadingTextAnimation(e),this.textAnimationInterval)}static setProgressCircleToIntro(e=100){const t=this.progressCircle.r.baseVal.value,n=this.progressCircle.r.baseVal.value*.95,i=Math.PI*(t*2),r=Math.PI*(n*2),o=.05*(e/100),a=1e-4*(e/100),c=i*(.5-o),u=i*o,d=r*(.5-a),l=r*a;this.progressCircle.style.setProperty("--circle-dash-array-static",`${c} ${u}`),this.progressCircle.style.setProperty("--circle-dash-offset-static",c),this.progressCircle.style.setProperty("--circle-dash-array-hover",`${d} ${l}`),this.progressCircle.style.setProperty("--circle-dash-offset-hover",d),this.progressCircle.style.setProperty("--circle-r1-hover",`${n}px`),this.progressCircleOutline.style.setProperty("--circle-r2-hover",`${n*1.075}px`),this.progressCircle.style.strokeDasharray="",this.progressCircle.style.strokeDashoffset=""}}class sD{static reset(){this.isLoaded=!1,this.progress=0,this.loaded=0}static init(){pe.on(xe.LOAD_START,this.load.bind(this))}static async load(){this.reset(),this.isLoaded=!1,this.progress=0,pe.emit(xe.LOAD_PROGRESS,this.progress),Ym.onProgress=(e,t,n)=>{if(this.isLoaded)return!1;this.loaded++,setTimeout(()=>{this.progress=Math.floor(t/n*100),pe.emit(xe.LOAD_PROGRESS,this.progress),this.progress===100&&(this.isLoaded=!0,setTimeout(()=>{pe.emit(xe.LOAD_COMPLETE)},1e3))},150*this.loaded)}}}function $c(s,e,t){var n,i,r,o,a;e==null&&(e=100);function c(){var d=Date.now()-o;d<e&&d>=0?n=setTimeout(c,e-d):(n=null,t||(a=s.apply(r,i),r=i=null))}var u=function(){r=this,i=arguments,o=Date.now();var d=t&&!n;return n||(n=setTimeout(c,e)),d&&(a=s.apply(r,i),r=i=null),a};return u.clear=function(){n&&(clearTimeout(n),n=null)},u.flush=function(){n&&(a=s.apply(r,i),r=i=null,clearTimeout(n),n=null)},u}$c.debounce=$c;var rD=$c;const Af=u_(rD);function Df(s,e){let t={classWord:"word",classWords:"words",classLine:"line",classLetter:"letter",splitLetters:!1};Object.assign(t,e);const n=s.querySelectorAll("p"),i=[];n.length?n.forEach(o=>{r(o),s.removeChild(o)}):r(s);function r(o){const c=o.innerHTML.split("<br>");o.innerHTML="",c.forEach(u=>{if(u==="")return!1;const d=document.createElement("div");d.innerHTML=u,d.classList.add(`${t.classLine}-inner`);const l=document.createElement("div");l.innerHTML=d.outerHTML,l.classList.add(t.classLine),t.splitLetters&&oD(l,{setClassName:function(){return"char"}}),i.push(l)}),i.forEach(u=>{s.appendChild(u)})}}function Cf(s,e={}){let t={debug:!1,classLine:"line",ignoreClass:".colored-text"};Object.assign(t,e);function n(r){const o=r.children;let a="";const c=[],u=r.querySelectorAll(t.ignoreClass);let d="";for(let g=0;g<u.length;g++){const v=u[g];v.innerHTML=v.textContent.replace(/\S+/g,"<n>$&</n>");const m=v.querySelectorAll("n");for(let p=0;p<m.length;p++)c.push({color:d,part:m[p].innerHTML,matched:!1})}const h=r.textContent.replace(/\S+/g,"<n>$&</n>").replace("-","</n><n>-</n><n>");r.innerHTML=h;let f=-1e5;for(let g=0;g<o.length;g++){const v=o[g],m=v.offsetTop;let p=i(v.innerHTML,c);p===void 0&&(p=v.innerHTML),f<m&&(a+=`</span></span><span class="${t.classLine}"><span class="${t.classLine}-inner">`),f=m,a+=`${p!=","&&p!="-"?" ":""}${p}`}r.innerHTML=a+="</span></span>"}function i(r,o){for(let a=0;a<o.length;a++)if(!o[a].matched&&o[a].part===r)return o[a].matched=!0,`<span class="${o[a].color}"> ${r}</span>`}n(s)}function oD(s,{tagName:e="span",split:t,setClassName:n=i=>"char"+i}={}){s.normalize();let i=1;function r(a){const c=a.parentNode,u=a.nodeValue,d=t?t(u):u.split(""),l=document.createDocumentFragment();d.forEach(h=>{const f=document.createElement(e),g=n(i++,h);g&&(f.className=g),h===" "&&(h=" "),f.textContent=h,f.setAttribute("data-char",h),f.setAttribute("aria-hidden","true"),l.appendChild(f)}),c.insertBefore(l,a),c.removeChild(a)}function o(a){if(a.nodeType===3)return r(a);const c=a.childNodes,u=c.length;if(u===1&&c[0].nodeType===3)return r(c[0]);for(let d=0;d<u;d++)o(c[d])}o(s)}/*!
 * strings: 3.12.5
 * https://gsap.com
 *
 * Copyright 2008-2024, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license or for
 * Club GSAP members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
*/const aD=/([\uD800-\uDBFF][\uDC00-\uDFFF](?:[\u200D\uFE0F][\uD800-\uDBFF][\uDC00-\uDFFF]){2,}|\uD83D\uDC69(?:\u200D(?:(?:\uD83D\uDC69\u200D)?\uD83D\uDC67|(?:\uD83D\uDC69\u200D)?\uD83D\uDC66)|\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC69\u200D(?:\uD83D\uDC69\u200D)?\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D(?:\uD83D\uDC69\u200D)?\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]\uFE0F|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC6F\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3C-\uDD3E\uDDD6-\uDDDF])\u200D[\u2640\u2642]\uFE0F|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF6\uD83C\uDDE6|\uD83C\uDDF4\uD83C\uDDF2|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F\u200D[\u2640\u2642]|(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642])\uFE0F|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2695\u2696\u2708]|\uD83D\uDC69\u200D[\u2695\u2696\u2708]|\uD83D\uDC68(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708]))\uFE0F|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83D\uDC69\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69]))|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|[#\*0-9]\uFE0F\u20E3|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67)\uDB40\uDC7F|\uD83D\uDC68(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC66\u200D\uD83D\uDC66|(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92])|(?:\uD83C[\uDFFB-\uDFFF])\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]))|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270A-\u270D]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC70\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD74\uDD7A\uDD90\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD36\uDDD1-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC68(?:\u200D(?:(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC67|(?:(?:\uD83D[\uDC68\uDC69])\u200D)?\uD83D\uDC66)|\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC69\uDC6E\uDC70-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD18-\uDD1C\uDD1E\uDD1F\uDD26\uDD30-\uDD39\uDD3D\uDD3E\uDDD1-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])?|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDEEB\uDEEC\uDEF4-\uDEF8]|\uD83E[\uDD10-\uDD3A\uDD3C-\uDD3E\uDD40-\uDD45\uDD47-\uDD4C\uDD50-\uDD6B\uDD80-\uDD97\uDDC0\uDDD0-\uDDE6])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u2660\u2663\u2665\u2666\u2668\u267B\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEF8]|\uD83E[\uDD10-\uDD3A\uDD3C-\uDD3E\uDD40-\uDD45\uDD47-\uDD4C\uDD50-\uDD6B\uDD80-\uDD97\uDDC0\uDDD0-\uDDE6])\uFE0F)/;function bg(s){let e=s.nodeType,t="";if(e===1||e===9||e===11){if(typeof s.textContent=="string")return s.textContent;for(s=s.firstChild;s;s=s.nextSibling)t+=bg(s)}else if(e===3||e===4)return s.nodeValue;return t}/*!
 * SplitText: 3.12.5
 * https://gsap.com
 *
 * @license Copyright 2008-2024, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license or for
 * Club GSAP members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
*/let ir,qc,Mg,Zr,Eg,il,lD=/(?:\r|\n|\t\t)/g,cD=/(?:\s\s+)/g,uD=String.fromCharCode(160),wg=s=>{ir=document,qc=window,Zr=Zr||s||qc.gsap||console.warn("Please gsap.registerPlugin(SplitText)"),Zr&&(il=Zr.utils.toArray,Eg=Zr.core.context||function(){},Mg=1)},Tg=s=>qc.getComputedStyle(s),Fu=s=>s.position==="absolute"||s.absolute===!0,hD=(s,e)=>{let t=e.length,n;for(;--t>-1;)if(n=e[t],s.substr(0,n.length)===n)return n.length},dD=" style='position:relative;display:inline-block;'",Rf=(s="",e)=>{let t=~s.indexOf("++"),n=1;return t&&(s=s.split("++").join("")),()=>"<"+e+dD+(s?" class='"+s+(t?n++:"")+"'>":">")},Nu=(s,e,t)=>{let n=s.nodeType;if(n===1||n===9||n===11)for(s=s.firstChild;s;s=s.nextSibling)Nu(s,e,t);else(n===3||n===4)&&(s.nodeValue=s.nodeValue.split(e).join(t))},hc=(s,e)=>{let t=e.length;for(;--t>-1;)s.push(e[t])},Pf=(s,e,t)=>{let n;for(;s&&s!==e;){if(n=s._next||s.nextSibling,n)return n.textContent.charAt(0)===t;s=s.parentNode||s._parent}},Ag=s=>{let e=il(s.childNodes),t=e.length,n,i;for(n=0;n<t;n++)i=e[n],i._isSplit?Ag(i):n&&i.previousSibling&&i.previousSibling.nodeType===3?(i.previousSibling.nodeValue+=i.nodeType===3?i.nodeValue:i.firstChild.nodeValue,s.removeChild(i)):i.nodeType!==3&&(s.insertBefore(i.firstChild,i),s.removeChild(i))},Jn=(s,e)=>parseFloat(e[s])||0,fD=(s,e,t,n,i,r,o)=>{let a=Tg(s),c=Jn("paddingLeft",a),u=-999,d=Jn("borderBottomWidth",a)+Jn("borderTopWidth",a),l=Jn("borderLeftWidth",a)+Jn("borderRightWidth",a),h=Jn("paddingTop",a)+Jn("paddingBottom",a),f=Jn("paddingLeft",a)+Jn("paddingRight",a),g=Jn("fontSize",a)*(e.lineThreshold||.2),v=a.textAlign,m=[],p=[],x=[],_=e.wordDelimiter||" ",S=e.tag?e.tag:e.span?"span":"div",M=e.type||e.split||"chars,words,lines",E=i&&~M.indexOf("lines")?[]:null,w=~M.indexOf("words"),C=~M.indexOf("chars"),y=Fu(e),b=e.linesClass,U=~(b||"").indexOf("++"),z=[],P=a.display==="flex",O=s.style.display,F,k,j,D,K,q,te,ve,re,N,Y,ae;for(U&&(b=b.split("++").join("")),P&&(s.style.display="block"),k=s.getElementsByTagName("*"),j=k.length,K=[],F=0;F<j;F++)K[F]=k[F];if(E||y)for(F=0;F<j;F++)D=K[F],q=D.parentNode===s,(q||y||C&&!w)&&(ae=D.offsetTop,E&&q&&Math.abs(ae-u)>g&&(D.nodeName!=="BR"||F===0)&&(te=[],E.push(te),u=ae),y&&(D._x=D.offsetLeft,D._y=ae,D._w=D.offsetWidth,D._h=D.offsetHeight),E&&((D._isSplit&&q||!C&&q||w&&q||!w&&D.parentNode.parentNode===s&&!D.parentNode._isSplit)&&(te.push(D),D._x-=c,Pf(D,s,_)&&(D._wordEnd=!0)),D.nodeName==="BR"&&(D.nextSibling&&D.nextSibling.nodeName==="BR"||F===0)&&E.push([])));for(F=0;F<j;F++){if(D=K[F],q=D.parentNode===s,D.nodeName==="BR"){E||y?(D.parentNode&&D.parentNode.removeChild(D),K.splice(F--,1),j--):w||s.appendChild(D);continue}if(y&&(re=D.style,!w&&!q&&(D._x+=D.parentNode._x,D._y+=D.parentNode._y),re.left=D._x+"px",re.top=D._y+"px",re.position="absolute",re.display="block",re.width=D._w+1+"px",re.height=D._h+"px"),!w&&C)if(D._isSplit)for(D._next=k=D.nextSibling,D.parentNode.appendChild(D);k&&k.nodeType===3&&k.textContent===" ";)D._next=k.nextSibling,D.parentNode.appendChild(k),k=k.nextSibling;else D.parentNode._isSplit?(D._parent=D.parentNode,!D.previousSibling&&D.firstChild&&(D.firstChild._isFirst=!0),D.nextSibling&&D.nextSibling.textContent===" "&&!D.nextSibling.nextSibling&&z.push(D.nextSibling),D._next=D.nextSibling&&D.nextSibling._isFirst?null:D.nextSibling,D.parentNode.removeChild(D),K.splice(F--,1),j--):q||(ae=!D.nextSibling&&Pf(D.parentNode,s,_),D.parentNode._parent&&D.parentNode._parent.appendChild(D),ae&&D.parentNode.appendChild(ir.createTextNode(" ")),S==="span"&&(D.style.display="inline"),m.push(D));else D.parentNode._isSplit&&!D._isSplit&&D.innerHTML!==""?p.push(D):C&&!D._isSplit&&(S==="span"&&(D.style.display="inline"),m.push(D))}for(F=z.length;--F>-1;)z[F].parentNode.removeChild(z[F]);if(E){for(y&&(N=ir.createElement(S),s.appendChild(N),Y=N.offsetWidth+"px",ae=N.offsetParent===s?0:s.offsetLeft,s.removeChild(N)),re=s.style.cssText,s.style.cssText="display:none;";s.firstChild;)s.removeChild(s.firstChild);for(ve=_===" "&&(!y||!w&&!C),F=0;F<E.length;F++){for(te=E[F],N=ir.createElement(S),N.style.cssText="display:block;text-align:"+v+";position:"+(y?"absolute;":"relative;"),b&&(N.className=b+(U?F+1:"")),x.push(N),j=te.length,k=0;k<j;k++)te[k].nodeName!=="BR"&&(D=te[k],N.appendChild(D),ve&&D._wordEnd&&N.appendChild(ir.createTextNode(" ")),y&&(k===0&&(N.style.top=D._y+"px",N.style.left=c+ae+"px"),D.style.top="0px",ae&&(D.style.left=D._x-ae+"px")));j===0?N.innerHTML="&nbsp;":!w&&!C&&(Ag(N),Nu(N,String.fromCharCode(160)," ")),y&&(N.style.width=Y,N.style.height=D._h+"px"),s.appendChild(N)}s.style.cssText=re}y&&(o>s.clientHeight&&(s.style.height=o-h+"px",s.clientHeight<o&&(s.style.height=o+d+"px")),r>s.clientWidth&&(s.style.width=r-f+"px",s.clientWidth<r&&(s.style.width=r+l+"px"))),P&&(O?s.style.display=O:s.style.removeProperty("display")),hc(t,m),w&&hc(n,p),hc(i,x)},pD=(s,e,t,n)=>{let i=e.tag?e.tag:e.span?"span":"div",r=e.type||e.split||"chars,words,lines",o=~r.indexOf("chars"),a=Fu(e),c=e.wordDelimiter||" ",u=C=>C===c||C===uD&&c===" ",d=c!==" "?"":a?"&#173; ":" ",l="</"+i+">",h=1,f=e.specialChars?typeof e.specialChars=="function"?e.specialChars:hD:null,g,v,m,p,x,_,S,M,E=ir.createElement("div"),w=s.parentNode;for(w.insertBefore(E,s),E.textContent=s.nodeValue,w.removeChild(s),s=E,g=bg(s),S=g.indexOf("<")!==-1,e.reduceWhiteSpace!==!1&&(g=g.replace(cD," ").replace(lD,"")),S&&(g=g.split("<").join("{{LT}}")),x=g.length,v=(g.charAt(0)===" "?d:"")+t(),m=0;m<x;m++)if(_=g.charAt(m),f&&(M=f(g.substr(m),e.specialChars)))_=g.substr(m,M||1),v+=o&&_!==" "?n()+_+"</"+i+">":_,m+=M-1;else if(u(_)&&!u(g.charAt(m-1))&&m){for(v+=h?l:"",h=0;u(g.charAt(m+1));)v+=d,m++;m===x-1?v+=d:g.charAt(m+1)!==")"&&(v+=d+t(),h=1)}else _==="{"&&g.substr(m,6)==="{{LT}}"?(v+=o?n()+"{{LT}}</"+i+">":"{{LT}}",m+=5):_.charCodeAt(0)>=55296&&_.charCodeAt(0)<=56319||g.charCodeAt(m+1)>=65024&&g.charCodeAt(m+1)<=65039?(p=((g.substr(m,12).split(aD)||[])[1]||"").length||2,v+=o&&_!==" "?n()+g.substr(m,p)+"</"+i+">":g.substr(m,p),m+=p-1):v+=o&&_!==" "?n()+_+"</"+i+">":_;s.outerHTML=v+(h?l:""),S&&Nu(w,"{{LT}}","<")},Dg=(s,e,t,n)=>{let i=il(s.childNodes),r=i.length,o=Fu(e),a,c;if(s.nodeType!==3||r>1){for(e.absolute=!1,a=0;a<r;a++)c=i[a],c._next=c._isFirst=c._parent=c._wordEnd=null,(c.nodeType!==3||/\S+/.test(c.nodeValue))&&(o&&c.nodeType!==3&&Tg(c).display==="inline"&&(c.style.display="inline-block",c.style.position="relative"),c._isSplit=!0,Dg(c,e,t,n));e.absolute=o,s._isSplit=!0;return}pD(s,e,t,n)};class Nr{constructor(e,t){Mg||wg(),this.elements=il(e),this.chars=[],this.words=[],this.lines=[],this._originals=[],this.vars=t||{},Eg(this),this.split(t)}split(e){this.isSplit&&this.revert(),this.vars=e=e||this.vars,this._originals.length=this.chars.length=this.words.length=this.lines.length=0;let t=this.elements.length,n=e.tag?e.tag:e.span?"span":"div",i=Rf(e.wordsClass,n),r=Rf(e.charsClass,n),o,a,c;for(;--t>-1;)c=this.elements[t],this._originals[t]={html:c.innerHTML,style:c.getAttribute("style")},o=c.clientHeight,a=c.clientWidth,Dg(c,e,i,r),fD(c,e,this.chars,this.words,this.lines,a,o);return this.chars.reverse(),this.words.reverse(),this.lines.reverse(),this.isSplit=!0,this}revert(){let e=this._originals;if(!e)throw"revert() call wasn't scoped properly.";return this.elements.forEach((t,n)=>{t.innerHTML=e[n].html,t.setAttribute("style",e[n].style)}),this.chars=[],this.words=[],this.lines=[],this.isSplit=!1,this}static create(e,t){return new Nr(e,t)}}Nr.version="3.12.5";Nr.register=wg;class mD extends Ht{init(){super.init(),this.onResize=this.onResize.bind(this),this.formatElements(),this.splitLines(this.splitElements.splitLines),this.splitArticles(this.splitElements.splitArticles),this.splitTitles(this.splitElements.splitTitles),this.splitCharacters(this.splitElements.splitCharacters)}addEvents(){super.addEvents(),addEventListener("resize",Af(this.onResize,100),{passive:!0})}removeEvents(){super.removeEvents(),removeEventListener("resize",Af(this.onResize,100),{passive:!0})}async reset(){this.restoreElements(this.splitElements.splitLines),this.restoreElements(this.splitElements.splitArticles),this.restoreElements(this.splitElements.splitTitles),this.restoreElements(this.splitElements.splitCharacters),await fn(),this.splitLines(this.splitElements.splitLines),this.splitArticles(this.splitElements.splitArticles),this.splitTitles(this.splitElements.splitTitles),this.splitCharacters(this.splitElements.splitCharacters)}onResize(){this.reset()}restoreElements(e){for(let t=0;t<e.length;t++){const n=e[t];n.resize&&(n.el.innerHTML=n.cache,n.splitted=!1)}}formatElement(e){const t=[];return e.forEach(n=>{t.push({el:n,resize:n.dataset.splitResize===void 0||n.dataset.splitResize==="true",cache:n.innerHTML,splitted:!1})}),t}formatElements(){const e=this.getAll("[data-split-lines]"),t=this.getAll("[data-split-articles]"),n=this.getAll("[data-split-titles]"),i=this.getAll("[data-split-chars]");this.splitElements={splitLines:this.formatElement(e),splitArticles:this.formatElement(t),splitTitles:this.formatElement(n),splitCharacters:this.formatElement(i)}}splitLines(e){e.length&&e.forEach(t=>{t.splitted||(Df(t.el),t.splitted=!0)})}splitArticles(e){e.length&&e.forEach(t=>{if(t.splitted)return;const n=t.el.querySelectorAll("h2, h3"),i=t.el.querySelectorAll("p");n.forEach(r=>Cf(r)),i.forEach(r=>{new Nr(r,{type:"lines"}).lines.forEach(function(a){const c=document.createElement("div");c.className="line";const u=document.createElement("div");for(u.className="line-inner";a.firstChild;)u.appendChild(a.firstChild);c.appendChild(u),a.parentNode.replaceChild(c,a)})}),t.splitted=!0})}splitTitles(e){e.length&&e.forEach(t=>{if(t.splitted)return;t.el.querySelectorAll("h1, h2, h3, h4, h4").forEach(i=>Cf(i)),t.splitted=!0})}splitCharacters(e){e.length&&e.forEach(t=>{t.splitted||(Df(t.el,{classWord:"word",classWords:"words",classLine:"line",classLetter:"letter",splitLetters:!0}),t.splitted=!0)})}}class sl extends Sg{async init(){document.documentElement.classList.add(`is-${this.el.dataset.view}`),this.add("[data-sound]",lm,this.el,"AudioItem"),this.splitTexts=new mD(this.el),await Qe.promise,this.onEnter(),this.onLoaderDone=this.onLoaderDone.bind(this),this.animateIn=this.animateIn.bind(this),pe.on(xe.ANIMATE_IN,this.animateIn)}destroy(){super.destroy(),document.documentElement.classList.remove(`is-${this.el.dataset.view}`),pe.off(xe.ANIMATE_IN,this.animateIn)}animateIn(){document.body.style="",Ki.setPointerEvents("all"),oe.to(this.el,{opacity:1,duration:.5,ease:"linear"}),this.components.forEach(e=>{e.animateIn&&e.animateIn(),e.observe&&e.observe()})}onLeave(){oe.to(this.el,{opacity:0,duration:.5,ease:"linear"}),this.components.forEach(e=>{e.animateOut&&e.animateOut()})}async onLoaderDone(){this.animateIn()}onEnter(){super.onEnter()}}class gD extends Ht{async init(){super.init(),this.cta=this.el.querySelector(".c-button"),this.ctaTextInner=this.el.querySelector(".c-button-text-inner"),this.ctaEl=this.el.querySelector(".c-button-bg"),this.magnetArea=this.el.querySelector(".ui-work-cta"),this.x=0,this.y=0,this.xLerp=0,this.yLerp=0,this.mouseF=1,this.formatButton(),this.onProjectActive=this.onProjectActive.bind(this),this.onMouseMove=this.onMouseMove.bind(this),this.onMouseLeave=this.onMouseLeave.bind(this),this.onMouseEnter=this.onMouseEnter.bind(this),this.onRaf=this.onRaf.bind(this),this.formatButton=this.formatButton.bind(this),this.onClick=this.onClick.bind(this)}formatButton(){const e=this.ctaEl.offsetHeight,t=this.ctaEl.offsetWidth;this.svg=this.ctaEl.querySelector("svg"),this.rect=this.svg.querySelector(".c-button-bg-static"),this.rectHover=this.svg.querySelector(".c-button-bg-hover"),this.line=this.svg.querySelector("line"),this.svg.setAttribute("width",t),this.svg.setAttribute("height",e),this.svg.setAttribute("viewBox",`0 0 ${t} ${e}`),this.rect.setAttribute("width",t),this.rect.setAttribute("height",e),this.rectHover.setAttribute("width",t),this.rectHover.setAttribute("height",e),this.rect.setAttribute("height",e-2),this.rectHover.setAttribute("height",e-2)}async addEvents(){super.addEvents(),this.magnetArea.addEventListener("click",this.onClick),pe.on(xe.PROJECT_ACTIVE,this.onProjectActive),pe.on(xe.RESIZE,this.formatButton),Bt.add(this.onRaf,this.id)}destroy(){super.destroy(),this.magnetArea.removeEventListener("click",this.onClick),pe.off(xe.PROJECT_ACTIVE,this.onProjectActive),pe.off(xe.RESIZE,this.formatButton),Bt.remove(this.id)}onClick(e){e.preventDefault(),ln.playClick()}onMouseLeave(){this.x=0,this.y=0,this.mouseF=J.workScene.mouseF,oe.to(this,{mouseF:1,duration:3,ease:"none",onUpdate:()=>J.workScene.setMouseFactor(this.mouseF)})}onMouseEnter(){this.mouseF=J.workScene.mouseF,oe.to(this,{mouseF:.25,duration:3,ease:"none",onUpdate:()=>J.workScene.setMouseFactor(this.mouseF)})}onMouseMove({clientX:e,clientY:t}){const n=this.magnetArea.getBoundingClientRect(),i=(e-n.left-n.width/2)*.5,r=(t-n.top-n.height/2)*.35;this.x=i,this.y=r}onRaf({time:e,delta:t,frame:n,fps:i}){this.xLerp=yf(this.xLerp,this.x,2.5,t),this.yLerp=yf(this.yLerp,this.y,2.5,t),this.transform(this.xLerp,this.yLerp)}transform(e,t){this.cta.style.transform=`translate3d(${e}px, ${t}px, 0)`}onProjectActive(e){}animateOut(){this.animateTl&&this.animateTl.kill(),oe.to(this.cta,{opacity:0,duration:.3,ease:"none"})}animateIn(){this.animateTl=oe.timeline({delay:.5}),this.animateTl.fromTo(this.cta,{opacity:0},{opacity:1,duration:.3,ease:"none"}),this.animateTl.fromTo(this.ctaTextInner,{opacity:0,y:"102%"},{opacity:1,y:0,duration:1.6,ease:"expo.out"},0)}}class vD extends Ht{async init(){super.init(),this.links=this.getAll(".ui-work-a"),this.listItems=this.getAll(".ui-work-ul > li"),this.listItemsInner=this.getAll(".ui-work-a > span"),this.ctas=[],this.onProjectActive=this.onProjectActive.bind(this),this.onListItemClick=this.onListItemClick.bind(this),this.addCtas()}addCtas(){this.listItems.forEach(e=>{const t=new gD(e,this.el);this.ctas.push(t)})}async addEvents(){super.addEvents(),pe.on(xe.PROJECT_ACTIVE,this.onProjectActive),this.links.forEach(e=>{e.addEventListener("click",this.onListItemClick),Qe.isMobile&&e.addEventListener("touchstart",this.onListItemClick)})}onListItemClick(e){e.preventDefault();const t=e.target.offsetParent.dataset.slug;pe.emit(xe.NAV_CLICK,{slug:t}),ln.playClick(),this.onProjectActive(t)}onProjectActive(e){this.listItems.forEach((t,n)=>{t.dataset.slug===e?(t.classList.add("is-active"),this.ctas[n].animateIn()):(t.classList.remove("is-active"),this.ctas[n].animateOut())})}destroy(){super.destroy(),this.links.forEach(e=>{e.removeEventListener("click",this.onListItemClick),Qe.isMobile&&e.removeEventListener("touchstart",this.onListItemClick)}),this.ctas.forEach(e=>{e.destroy()}),pe.off(xe.PROJECT_ACTIVE,this.onProjectActive)}animateIn(){oe.fromTo(this.listItemsInner,{y:"102%",opacity:0},{y:0,opacity:1,duration:1.8,stagger:.03,ease:"expo.out"})}}class _D extends Ht{async init(){super.init(),this.listItems=this.getAll(".ui-progressbar-item"),this.onProjectActive=this.onProjectActive.bind(this),this.onListItemClick=this.onListItemClick.bind(this)}async addEvents(){super.addEvents(),pe.on(xe.PROJECT_ACTIVE,this.onProjectActive),this.listItems.forEach(e=>{e.addEventListener("click",this.onListItemClick),Qe.isMobile&&e.addEventListener("touchstart",this.onListItemClick)})}onListItemClick(e){e.preventDefault(),pe.emit(xe.NAV_CLICK,{slug:e.currentTarget.dataset.slug}),this.onProjectActive(e.currentTarget.dataset.slug)}onProjectActive(e){this.listItems.forEach((t,n)=>{t.dataset.slug===e?t.classList.add("is-active"):t.classList.remove("is-active")})}destroy(){super.destroy(),this.listItems.forEach(e=>{e.removeEventListener("click",this.onListItemClick),Qe.isMobile&&e.removeEventListener("touchstart",this.onListItemClick)}),pe.off(xe.PROJECT_ACTIVE,this.onProjectActive)}animateIn(){}}function sr(s){const e=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(s);return e?{r:parseInt(e[1],16)/255,g:parseInt(e[2],16)/255,b:parseInt(e[3],16)/255}:null}class Se{static init(){this.settings={contrast:xt.contrast,darken:xt.darken,saturation:xt.saturation,mainColor:{r:0,g:0,b:0},ambientColor:{r:0,g:0,b:0},ambientIntensity:xt.ambient,sceneReveal:0,envRotation:0,revealSpread:0,fluidStrength:0,directionalLight:{intensity:0},directionalLight2:{intensity:0},spotLight:{intensity:0},media:{background:{r:0,g:0,b:0},opacity:0},thumb:{darknessIntensity:0,darknessColor:{r:0,g:0,b:0},saturation:1,mouseLightness:1}},this.html=document.documentElement,this.setMainColor(xt.colors.primary,0)}static setDirectionalLightIntensity=(e,t=1.6,n="expo.out")=>{this.directionalLightAnim&&this.directionalLightAnim.kill(),this.directionalLightAnim=oe.to(this.settings.directionalLight,{intensity:e,ease:n,duration:t,onUpdate:()=>{J.workScene.directionalLight.intensity=this.settings.directionalLight.intensity}})};static setDirectionalLight2Intensity=(e,t=1.6,n="expo.out")=>{this.directionalLight2Anim&&this.directionalLight2Anim.kill(),this.directionalLight2Anim=oe.to(this.settings.directionalLight2,{intensity:e,ease:n,duration:t,onUpdate:()=>{J.workScene.directionalLight2.intensity=this.settings.directionalLight2.intensity}})};static setFluidStrength=(e,t=.5)=>{t===0?J.mainScene.renderManager.compositeMaterial.uniforms.uFluidStrength.value=this.settings.fluidStrength=e:oe.to(this.settings,{fluidStrength:e,duration:t,ease:"none",onUpdate:()=>{J.mainScene.renderManager.compositeMaterial.uniforms.uFluidStrength.value=this.settings.fluidStrength}})};static setRevealSpread=(e,t=1.6,n="power4.out")=>{this.revealSpreadAnim&&this.revealSpreadAnim.kill(),this.revealSpreadAnim=oe.to(this.settings,{revealSpread:e,duration:t,ease:n,onUpdate:()=>{J.workScene.blocks.forEach((i,r)=>{i.instance.material.customUniforms.uRevealSpread.value=this.settings.revealSpread})}})};static hideWorkScene=()=>{J.workScene.blocks.forEach((e,t)=>{oe.to(e.instance.material.customUniforms.uRevealProject,{value:0,ease:"power3.in",duration:.5})})};static setEnvRotation=(e,t=5.6)=>{this.envRotationAnim&&this.envRotationAnim.kill(),t===0?J.workScene.sceneWrap.rotation.x=this.settings.envRotation=e:this.envRotationAnim=oe.to(this.settings,{envRotation:e,duration:t,ease:"expo.inOut",onUpdate:()=>{J.workScene.sceneWrap.rotation.x=this.settings.envRotation}})};static setSpotLightIntensity=(e,t=1.6,n="expo.out")=>{this.spotlightAnim&&this.spotlightAnim.kill(),this.spotlightAnim=oe.to(this.settings.spotLight,{intensity:e,ease:n,duration:t,onUpdate:()=>{J.workScene.spotLight.intensity=this.settings.spotLight.intensity}})};static setAmbientColor(e,t=1.6){const n=this.formatColor(e);oe.to(J.workScene.ambientLight.color,{r:n.r,g:n.g,b:n.b,ease:"expo.out",duration:t,onUpdate:()=>{J.workScene.env.material.customUniforms.uDarkenColor.value.set(J.workScene.ambientLight.color.r,J.workScene.ambientLight.color.g,J.workScene.ambientLight.color.b)}})}static setBlocksColor(e,t=1.6){const n=this.formatColor(e);J.workScene.blocks.forEach(i=>{oe.to(i.instance.material.emissive,{r:n.r,g:n.g,b:n.b,ease:"expo.out",duration:t})})}static setAmbientIntensity(e,t=1.6){oe.to(J.workScene.ambientLight,{intensity:e,ease:"expo.out",duration:t})}static setAmbientLight=(e,t=.5,n=1.6)=>{this.setAmbientColor(e,n),this.setAmbientIntensity(t,n)};static setSaturation=(e,t=1.6)=>{t===0?J.workScene.renderManager.compositeMaterial.uniforms.uSaturation.value=this.settings.saturation=e:oe.to(this.settings,{saturation:e,duration:t,ease:"expo.out",onUpdate:()=>{J.workScene.renderManager.compositeMaterial.uniforms.uSaturation.value=this.settings.saturation}})};static setDarken=(e=.25,t=.5)=>{t===0?J.workScene.renderManager.compositeMaterial.uniforms.uDarken.value=this.settings.darken=e:oe.to(this.settings,{darken:e,duration:.5,ease:"none",onUpdate:()=>{J.workScene.renderManager.compositeMaterial.uniforms.uDarken.value=this.settings.darken}})};static setThumbSaturation=(e,t=1.6)=>{t===0?J.workThumbScene.renderManager.compositeMaterial.uniforms.uSaturation.value=this.settings.thumb.saturation=e:oe.to(this.settings.thumb,{saturation:e,duration:t,ease:"expo.out",onUpdate:()=>{J.workThumbScene.renderManager.compositeMaterial.uniforms.uSaturation.value=this.settings.thumb.saturation}})};static setThumbMouseLightness=(e,t=1.6)=>{t===0?J.workScene.blocks.forEach(n=>{n.instance.material.customUniforms.uMouseLightness.value=this.settings.thumb.mouseLightness=e}):oe.to(this.settings.thumb,{mouseLightness:e,duration:t,ease:"expo.out",onUpdate:()=>{J.workScene.blocks.forEach(n=>{n.instance.material.customUniforms.uMouseLightness.value=this.settings.thumb.mouseLightness})}})};static showScene=(e,t=1.6)=>{oe.to(this.settings,{sceneReveal:1,duration:t,ease:"expo.out",onUpdate:()=>{J.mainScene.renderManager.compositeMaterial.uniforms.uReveal.value=this.settings.sceneReveal}})};static formatColor=e=>(typeof e=="string"&&(e.includes("rgba")?(e=e.replace("rgba(","").replace(")","").split(",").map(t=>parseInt(t)),e={r:e[0]/255,g:e[1]/255,b:e[2]/255}):e=sr(e)),e);static setMainColor=(e,t=1.6)=>{const n=this.formatColor(e),i=document.querySelectorAll(".c-color");if(t===0){const{r,g:o,b:a}=n;this.settings.mainColor={r,g:o,b:a},i.forEach(c=>{c.style.color=`rgb(${Fn(r*255,2)}, ${Fn(o*255,2)}, ${Fn(a*255,2)})`})}else oe.to(this.settings.mainColor,{r:n.r,g:n.g,b:n.b,duration:t,ease:"expo.out",onUpdate:()=>{const{r,g:o,b:a}=this.settings.mainColor;for(let c=0;c<i.length;c++){const u=i[c];u.style.color=`rgb(${Fn(r*255,0)}, ${Fn(o*255,0)}, ${Fn(a*255,0)})`}}})};static setThumbDarknessIntensity=(e,t=1.6)=>{t===0?J.workThumbScene.renderManager.compositeMaterial.uniforms.uDarkenIntensity.value=this.settings.thumb.darknessIntensity=e:oe.to(this.settings.thumb,{darknessIntensity:e,duration:t,ease:"expo.out",onUpdate:()=>{J.workThumbScene.renderManager.compositeMaterial.uniforms.uDarkenIntensity.value=this.settings.thumb.darknessIntensity}})};static setThumbDarknessColor=(e,t=1.6)=>{if(typeof e=="string"&&(e=sr(e)),t===0){const{r:n,g:i,b:r}=e;J.workThumbScene.renderManager.compositeMaterial.uniforms.uDarkenColor.value.set(n,i,r),this.settings.thumb.darknessColor=e}else oe.to(this.settings.thumb.darknessColor,{r:e.r,g:e.g,b:e.b,duration:t,ease:"expo.out",onUpdate:()=>{const{r:n,g:i,b:r}=this.settings.thumb.darknessColor;J.workThumbScene.renderManager.compositeMaterial.uniforms.uDarkenColor.value.set(n,i,r)}})};static setCameraControllerSettings=(e=new L(0,0,0),t=new Q(.25,.25),n=10)=>{J.workScene.setCameraControllerSettings(e,t,n)};static mediaAnimateIn=()=>{this.setMediaOpacity(1),J.mediaScene.mediaItems.items.forEach(e=>{oe.to(e.instance.translation,{y:0,duration:1.6,delay:.25,ease:"expo.out",onUpdate:()=>{e.instance.update()}})})};static setContrast=(e,t=1.6)=>{t===0?J.mainScene.renderManager.compositeMaterial.uniforms.uContrast.value=this.settings.contrast=e:oe.to(this.settings,{contrast:e,duration:t,ease:"expo.out",onUpdate:()=>{J.mainScene.renderManager.compositeMaterial.uniforms.uContrast.value=this.settings.contrast}})};static setMediaOpacity=(e,t=1.6,n="expo.out",i=.25)=>{oe.to(this.settings.media,{opacity:e,duration:t,ease:n,delay:i,onUpdate:()=>{J.mainScene.renderManager.compositeMaterial.uniforms.uMediaReveal.value=this.settings.media.opacity}})};static setMediaBackground=(e,t=1.6)=>{const n=this.formatColor(e);t===0?(this.settings.media.background=n,J.mediaScene.mediaItems.backgroundColor.set(n.r,n.g,n.b)):oe.to(this.settings.media.background,{r:n.r,g:n.g,b:n.b,duration:t,ease:"expo.out",onUpdate:()=>{const{r:i,g:r,b:o}=this.settings.media.background;J.mediaScene.mediaItems.backgroundColor.set(i,r,o)}})}}let xD=class{constructor(){this.events={}}emit(e,...t){let n=this.events[e]||[];for(let i=0,r=n.length;i<r;i++)n[i](...t)}on(e,t){return this.events[e]?.push(t)||(this.events[e]=[t]),()=>{this.events[e]=this.events[e]?.filter(n=>t!==n)}}off(e,t){this.events[e]=this.events[e]?.filter(n=>t!==n)}destroy(){this.events={}}};function Lf(s,e,t){return Math.max(s,Math.min(e,t))}let Cg=class{constructor(e,{wheelMultiplier:t=1,touchMultiplier:n=2,normalizeWheel:i=!1}){this.element=e,this.wheelMultiplier=t,this.touchMultiplier=n,this.normalizeWheel=i,this.pointer={active:!1},this.touchStart={x:null,y:null},this.lastDelta={x:0,y:0},this.emitter=new xD,this.element.addEventListener("wheel",this.onWheel,{passive:!1}),"ontouchstart"in window?(this.element.addEventListener("touchstart",this.onTouchStart,{passive:!1}),this.element.addEventListener("touchmove",this.onTouchMove,{passive:!1}),this.element.addEventListener("touchend",this.onTouchEnd,{passive:!1})):(this.element.addEventListener("mousedown",this.onTouchStart,{passive:!1}),this.element.addEventListener("mousemove",this.onTouchMove,{passive:!1}),this.element.addEventListener("mouseup",this.onTouchEnd,{passive:!1}))}on(e,t){return this.emitter.on(e,t)}destroy(){this.emitter.destroy(),this.element.removeEventListener("wheel",this.onWheel,{passive:!1}),"ontouchstart"in window?(this.element.removeEventListener("touchstart",this.onTouchStart,{passive:!1}),this.element.removeEventListener("touchmove",this.onTouchMove,{passive:!1}),this.element.removeEventListener("touchend",this.onTouchEnd,{passive:!1})):(this.element.removeEventListener("mousedown",this.onTouchStart,{passive:!1}),this.element.removeEventListener("mousemove",this.onTouchMove,{passive:!1}),this.element.removeEventListener("mouseup",this.onTouchEnd,{passive:!1}))}onTouchStart=e=>{if(this.pointer.active)return;this.pointer.active=!0;const{clientX:t,clientY:n}=e.targetTouches?e.targetTouches[0]:e;this.touchStart.x=t,this.touchStart.y=n,this.lastDelta={x:0,y:0},this.emitter.emit("scroll",{deltaX:0,deltaY:0,event:e})};onTouchMove=e=>{if(!this.pointer.active)return;const{clientX:t,clientY:n}=e.targetTouches?e.targetTouches[0]:e,i=-(t-this.touchStart.x)*this.touchMultiplier,r=-(n-this.touchStart.y)*this.touchMultiplier;this.touchStart.x=t,this.touchStart.y=n,this.lastDelta={x:i,y:r},this.emitter.emit("scroll",{deltaX:i,deltaY:r,event:e})};onTouchEnd=e=>{this.pointer.active=!1,this.lastDelta={x:0,y:0},this.emitter.emit("scroll",{deltaX:this.lastDelta.x,deltaY:this.lastDelta.y,event:e})};onWheel=e=>{let{deltaX:t,deltaY:n}=e;this.normalizeWheel&&(t=Lf(-100,t,100),n=Lf(-100,n,100)),t*=this.wheelMultiplier,n*=this.wheelMultiplier,this.emitter.emit("scroll",{deltaX:t,deltaY:n,event:e})}};class yD extends Ht{async init(){super.init(),this.container=this.el.querySelector(".ui-work-container"),this.virtualScroll=new Cg(window,{touchMultiplier:1,wheelMultiplier:1,normalizeWheel:!1}),this.projects=is.getProjects(),this.mouseF=0,this.checkActive=!1,this.activeColor=sr(this.projects[0].data.colors.primary),this.onRaf=this.onRaf.bind(this),this.onNavClick=this.onNavClick.bind(this),this.onVirtualScroll=this.onVirtualScroll.bind(this),this.onKeyDown=this.onKeyDown.bind(this),this.onWorkGalleryOut=this.onWorkGalleryOut.bind(this),this.onMouseDown=this.onMouseDown.bind(this),this.activeHook=0,this.targetHook=0,this.sceneRotation=0,this.zoom=0,this.isTransitioning=!1,this.totalItems=this.projects.length-1,this.index={current:0,prev:this.totalItems,next:1},this.scroll={virtual:this.projects.length*1e5,target:this.projects.length*1e5,animated:this.projects.length*1e5,current:0,progress:0,limit:this.projects.length*1e3,velocity:0,diff:0,remainder:0,step:1e3,offset:0,active:!1},Qe.workState&&(this.scroll=Qe.workState.scroll,this.index=Qe.workState.index,this.activeProject=Qe.workState.activeProject,this.activeHook=Qe.workState.activeHook,this.targetHook=Qe.workState.targetHook,this.sceneRotation=Qe.workState.sceneRotation),this.rotation=0,this.onProjectActive=this.onProjectActive.bind(this)}async animateIn(){J.workScene.setMouseFactor(0),Se.setCameraControllerSettings(new L(0,0,0),new Q(1,.5),20),ln.playPlucks(),oe.to(this,{mouseF:1,duration:3,ease:"none",onUpdate:()=>{J.workScene.setMouseFactor(this.mouseF)}}),this.projects.forEach((e,t)=>{J.workScene.blocks[t].instance.material.customUniforms.uReveal.value=0,oe.to(J.workScene.blocks[t].instance.material.customUniforms.uRevealProject,{value:1,ease:"none",duration:.5})}),Qe.currentProject!==null?this.onProjectActive(Qe.currentProject):this.onProjectActive(this.projects[0].id),this.scroll.active=!0}async addEvents(){super.addEvents(),this.virtualScroll.on("scroll",this.onVirtualScroll),pe.on(xe.NAV_CLICK,this.onNavClick),pe.on(xe.WORK_GALLERY_OUT,this.onWorkGalleryOut),addEventListener("keydown",this.onKeyDown),addEventListener("mousedown",this.onMouseDown),Bt.add(this.onRaf,this.id),this.calcScrollHooks(),await J.initPromise,J.workScene.sceneWrap.rotation.y=_a.degToRad(this.scroll.progress*360+180)}destroy(){super.destroy(),Qe.workState={scroll:this.scroll,index:this.index,activeProject:this.activeProject,activeHook:this.activeHook,targetHook:this.targetHook,sceneRotation:this.sceneRotation},this.virtualScroll.destroy(),pe.off(xe.NAV_CLICK,this.onNavClick),pe.off(xe.WORK_GALLERY_OUT,this.onWorkGalleryOut),removeEventListener("keydown",this.onKeyDown),removeEventListener("mousedown",this.onMouseDown),Bt.remove(this.id)}finalScrollPosition(e){const t=this.index.current,i=this.projects.length/2,o=Math.abs(t-e)<=i,a=t>i;if(o)return this.projectsObjects[e].hook+this.scroll.remainder;if(a&&!o)return this.projectsObjects[e].hook+this.scroll.remainder+this.scroll.limit;if(!a&&!o)return this.projectsObjects[e].hook+this.scroll.remainder-(this.scroll.virtual>this.scroll.target?0:this.scroll.limit)}onNavClick({slug:e}){clearTimeout(this.navClickTimeOut),this.isTransitioning=!0;const t=this.projects.findIndex(i=>i.id===e),n=this.finalScrollPosition(t);this.scrollTo(n),this.setProjectActive(t),this.navClickTimeOut=setTimeout(()=>{this.isTransitioning=!1},1200)}scrollTo(e){this.scroll.virtual=e,this.scrollToAnimation?.kill(),this.scrollToAnimation=oe.to(this.scroll,{target:e,duration:1.6,ease:"expo.out"})}next(){this.nextTransitioning=!0,this.scrollTo(this.scroll.virtual+this.scroll.step),this.nextTimeOut=setTimeout(()=>{this.nextTransitioning=!1},800),this.prevTransitioning}prev(){this.prevTransitioning=!0,this.scrollTo(this.scroll.virtual-this.scroll.step),this.prevTimeOut=setTimeout(()=>{this.prevTransitioning=!1},800),this.nextTransitioning}onVirtualScroll({deltaX:e,deltaY:t,event:n}){this.scroll.active&&(this.nextTransitioning||this.prevTransitioning||(this.snapTimeOut&&clearTimeout(this.snapTimeOut),this.snap=!0,this.delta=Math.abs(t)>Math.abs(e)?t:e,this.scroll.diff+=this.delta,this.delta>15?this.next():this.delta<-15&&this.prev(),this.snapTimeOut=setTimeout(()=>{this.snap=!0},100)))}checkSpeed(){Math.abs(this.virtualScroll.lastDelta.x)+Math.abs(this.virtualScroll.lastDelta.y)*.001>.2&&this.virtualScroll.pointer.active?this.deactivatePointerEvents():this.activatePointerEvents()}deactivatePointerEvents(){this.clickable&&(this.el.classList.add("is-dragging"),this.clickable=!1)}activatePointerEvents(){this.clickable||(this.el.classList.remove("is-dragging"),this.clickable=!0)}calcScrollHooks(){this.projectsObjects=[],this.projects.forEach((e,t)=>{const n={id:e.id,hook:t*this.scroll.step};this.projectsObjects.push(n)})}async onProjectActive(e){this.activeProject=e,this.inAnimation?.kill(),this.inAnimation=oe.timeline();const t=is.getProjectById(e),n=this.projects.findIndex(a=>a.id===e),i=t.data.ambient||.5;let r=sr(t.data.colors.secondary);i<0&&t.data.colors.invert&&(r=sr(t.data.colors.invert)),Se.setSpotLightIntensity(t.data.spotlight||J.workScene.maxSpotLightIntensity,1),Se.setRevealSpread(0),ln.playWoosh(),J.workScene.blocks.forEach((a,c)=>{c!==n&&this.inAnimation.to(a.instance.material.customUniforms.uReveal,{value:0,ease:"power4.out",duration:1.6},0)}),this.inAnimation.to(J.workScene.blocks[n].instance.material.customUniforms.uReveal,{value:1,delay:.2,ease:"power4.out",duration:4},0);const o=sr(t.data.colors.primary);Se.setAmbientLight(r,i),Se.setMainColor(o),Se.setDarken(t.data.darkenOverview||.1),Se.setSaturation(t.data.saturation||1),Se.setContrast(t.data.contrast||1.15),Se.setThumbDarknessIntensity(t.data.thumbnail.darkness||0),Se.setThumbDarknessColor(t.data.thumbnail.darknessColor||"#000000"),Se.setThumbSaturation(t.data.thumbnail.saturation||1),Se.setThumbMouseLightness(t.data.thumbnail.mouseLightness||1),Se.setBlocksColor(t.data.colors.blocks||"#000000"),Se.setDirectionalLightIntensity(1.5)}onRaf({time:e,delta:t,frame:n,fps:i}){this.scroll.velocity=this.scroll.target-this.scroll.animated,this.checkSpeed(),this.snap&&(this.scroll.diff=Yi(this.scroll.diff,0,5,t)),this.scroll.targetPlusDiff=this.scroll.target+this.scroll.diff,this.scroll.remainder=this.scroll.target-this.scroll.target%this.scroll.limit,this.scroll.animated=Yi(this.scroll.animated,this.scroll.targetPlusDiff,5,t),this.scroll.current=LT(this.scroll.animated,this.scroll.limit),this.scroll.progress=this.scroll.current/this.scroll.limit,this.isTransitioning||this.setActiveItemOnScroll(),this.updateScene(t)}setActiveItemOnScroll(){if(!this.scroll.active)return;let e=Fn(Math.abs(this.scroll.current%this.scroll.limit/this.scroll.step),0);this.scroll.current>this.scroll.limit-this.scroll.step/2&&(e=0),this.activeHook=this.projectsObjects[e].hook+this.scroll.remainder,this.projects[e]&&this.setProjectActive(e)}setProjectActive(e){const t=this.projects[e];t.id!==this.activeProject&&(this.updateIndex(e),this.onProjectActive(t.id),this.targetHook=this.projectsObjects[e].hook+this.scroll.remainder,pe.emit(xe.PROJECT_ACTIVE,t.id),Qe.currentProject=t.id)}updateIndex(e){this.index.current=e,this.index.current<0?this.index.current=this.totalItems:this.index.current>this.totalItems&&(this.index.current=0),this.index.prev=this.index.current===0?this.totalItems:this.index.current-1,this.index.next=this.index.current===this.totalItems?0:this.index.current+1}updateScene(e){if(!this.scroll.active)return;J.workScene.sceneWrap.rotation.y=_a.degToRad(this.scroll.progress*360+180),J.mainScene.renderManager.compositeMaterial.uniforms.uTransformX.value=this.scroll.progress*1,J.workThumbScene.thumbs.updateGalleryProgress(-this.scroll.progress);const t=4,n=bo(this.scroll.velocity*-.015,-t,t);this.sceneRotation=Yi(this.sceneRotation,n,5,e),J.workScene.scene.rotation.z=_a.degToRad(this.sceneRotation);const i=1,r=bo(Math.abs(this.scroll.velocity*.0015),0,i);this.zoom=Yi(this.zoom,r,5,e),J.workScene.scene.position.z=J.workScene.scene.rotation.z-this.zoom}onMouseDown(e){e.preventDefault()}onKeyDown(e){switch(e=e||window.event,e.code){case"ArrowDown":this.next();break;case"ArrowRight":this.next();break;case"ArrowLeft":this.prev();break;case"ArrowUp":this.prev();break}}async onWorkGalleryOut(){this.inAnimation?.kill(),ln.playSoftWoosh(),Se.setRevealSpread(1,.65,"power3.in"),Se.setSpotLightIntensity(0,1,"none"),J.workScene.blocks.forEach((e,t)=>{oe.to(e.instance.material.customUniforms.uRevealProject,{value:0,ease:"none",duration:.5})})}}class Rg extends Ht{async init(){super.init(),this.inner=this.el.querySelector(".ui-title-inner")}animateIn(){oe.fromTo(this.inner,{y:"102%"},{y:0,duration:1.8,stagger:.01,ease:"expo.out"})}}class Ou extends Ht{async init(){super.init(),this.socials=this.el.querySelectorAll(".social-a > span"),this.contact=this.el.querySelector(".ui-footer-contact a > span"),this.onResize=this.onResize.bind(this)}async addEvents(){super.addEvents(),addEventListener("resize",this.onResize),await fn(200),this.onResize()}destroy(){super.destroy(),removeEventListener("resize",this.onResize)}onResize(){this.text=Pe.w>=Le.BREAKPOINTS.LG?"hello@rogierdeboeve.com":"E-mail",this.text.toUpperCase()!==this.contact.innerText&&(this.contact.innerText=this.text)}animateIn(){oe.fromTo(this.socials,{y:"102%"},{y:0,duration:1.8,delay:.4,stagger:.06,ease:"expo.out"}),oe.fromTo(this.contact,{y:"102%"},{y:0,duration:1.8,delay:.5,stagger:.06,ease:"expo.out"})}}class SD extends sl{async init(){super.init(),this.add(".ui-footer",Ou,this.el,"PageFooter"),this.add(".ui-work-ul",vD,this.el,"WorkNav"),this.add(".ui-title",Rg,this.el,"PageTitle"),this.add(".ui-work-content",yD,this.el,"WorkGallery"),this.add(".ui-progressbar",_D,this.el,"WorkProgressbar"),await J.initPromise,J.workScene.spotLight.map=J.workThumbScene.renderManager.renderTargetComposite.texture,J.workScene.spotLight.position.set(0,0,3.7),J.workScene.spotLight.target.position.set(0,0,-8),J.workScene.spotLight.intensity=220,pe.emit(xe.RESIZE)}destroy(){super.destroy()}animateIn(){if(super.animateIn(),Qe.currentProject!==null)pe.emit(xe.PROJECT_ACTIVE,Qe.currentProject);else{const e=is.getProjects();pe.emit(xe.PROJECT_ACTIVE,e[0].id)}Ki.animateDescriptionIn(),Ki.animateAvailibilityIn(),Se.showScene()}onLeave(){super.onLeave(),Ki.animateDescriptionOut(),Ki.animateAvailibilityOut()}}function Pg(s,e,t){return Math.max(s,Math.min(e,t))}class bD{advance(e){if(!this.isRunning)return;let t=!1;if(this.lerp)this.value=function(i,r,o,a){return function(u,d,l){return(1-l)*u+l*d}(i,r,1-Math.exp(-o*a))}(this.value,this.to,60*this.lerp,e),Math.round(this.value)===this.to&&(this.value=this.to,t=!0);else{this.currentTime+=e;const n=Pg(0,this.currentTime/this.duration,1);t=n>=1;const i=t?1:this.easing(n);this.value=this.from+(this.to-this.from)*i}t&&this.stop(),this.onUpdate?.(this.value,t)}stop(){this.isRunning=!1}fromTo(e,t,{lerp:n=.1,duration:i=1,easing:r=c=>c,onStart:o,onUpdate:a}){this.from=this.value=e,this.to=t,this.lerp=n,this.duration=i,this.easing=r,this.currentTime=0,this.isRunning=!0,o?.(),this.onUpdate=a}}class MD{constructor({wrapper:e,content:t,autoResize:n=!0,debounce:i=250}={}){this.wrapper=e,this.content=t,n&&(this.debouncedResize=function(o,a){let c;return function(){let u=arguments,d=this;clearTimeout(c),c=setTimeout(function(){o.apply(d,u)},a)}}(this.resize,i),this.wrapper===window?window.addEventListener("resize",this.debouncedResize,!1):(this.wrapperResizeObserver=new ResizeObserver(this.debouncedResize),this.wrapperResizeObserver.observe(this.wrapper)),this.contentResizeObserver=new ResizeObserver(this.debouncedResize),this.contentResizeObserver.observe(this.content)),this.resize()}destroy(){this.wrapperResizeObserver?.disconnect(),this.contentResizeObserver?.disconnect(),window.removeEventListener("resize",this.debouncedResize,!1)}resize=()=>{this.onWrapperResize(),this.onContentResize()};onWrapperResize=()=>{this.wrapper===window?(this.width=window.innerWidth,this.height=window.innerHeight):(this.width=this.wrapper.clientWidth,this.height=this.wrapper.clientHeight)};onContentResize=()=>{this.wrapper===window?(this.scrollHeight=this.content.scrollHeight,this.scrollWidth=this.content.scrollWidth):(this.scrollHeight=this.wrapper.scrollHeight,this.scrollWidth=this.wrapper.scrollWidth)};get limit(){return{x:this.scrollWidth-this.width,y:this.scrollHeight-this.height}}}class Lg{constructor(){this.events={}}emit(e,...t){let n=this.events[e]||[];for(let i=0,r=n.length;i<r;i++)n[i](...t)}on(e,t){return this.events[e]?.push(t)||(this.events[e]=[t]),()=>{this.events[e]=this.events[e]?.filter(n=>t!==n)}}off(e,t){this.events[e]=this.events[e]?.filter(n=>t!==n)}destroy(){this.events={}}}const If=100/6;class ED{constructor(e,{wheelMultiplier:t=1,touchMultiplier:n=1}){this.element=e,this.wheelMultiplier=t,this.touchMultiplier=n,this.touchStart={x:null,y:null},this.emitter=new Lg,window.addEventListener("resize",this.onWindowResize,!1),this.onWindowResize(),this.element.addEventListener("wheel",this.onWheel,{passive:!1}),this.element.addEventListener("touchstart",this.onTouchStart,{passive:!1}),this.element.addEventListener("touchmove",this.onTouchMove,{passive:!1}),this.element.addEventListener("touchend",this.onTouchEnd,{passive:!1})}on(e,t){return this.emitter.on(e,t)}destroy(){this.emitter.destroy(),window.removeEventListener("resize",this.onWindowResize,!1),this.element.removeEventListener("wheel",this.onWheel,{passive:!1}),this.element.removeEventListener("touchstart",this.onTouchStart,{passive:!1}),this.element.removeEventListener("touchmove",this.onTouchMove,{passive:!1}),this.element.removeEventListener("touchend",this.onTouchEnd,{passive:!1})}onTouchStart=e=>{const{clientX:t,clientY:n}=e.targetTouches?e.targetTouches[0]:e;this.touchStart.x=t,this.touchStart.y=n,this.lastDelta={x:0,y:0},this.emitter.emit("scroll",{deltaX:0,deltaY:0,event:e})};onTouchMove=e=>{const{clientX:t,clientY:n}=e.targetTouches?e.targetTouches[0]:e,i=-(t-this.touchStart.x)*this.touchMultiplier,r=-(n-this.touchStart.y)*this.touchMultiplier;this.touchStart.x=t,this.touchStart.y=n,this.lastDelta={x:i,y:r},this.emitter.emit("scroll",{deltaX:i,deltaY:r,event:e})};onTouchEnd=e=>{this.emitter.emit("scroll",{deltaX:this.lastDelta.x,deltaY:this.lastDelta.y,event:e})};onWheel=e=>{let{deltaX:t,deltaY:n,deltaMode:i}=e;t*=i===1?If:i===2?this.windowWidth:1,n*=i===1?If:i===2?this.windowHeight:1,t*=this.wheelMultiplier,n*=this.wheelMultiplier,this.emitter.emit("scroll",{deltaX:t,deltaY:n,event:e})};onWindowResize=()=>{this.windowWidth=window.innerWidth,this.windowHeight=window.innerHeight}}class Ig{constructor({wrapper:e=window,content:t=document.documentElement,wheelEventsTarget:n=e,eventsTarget:i=n,smoothWheel:r=!0,syncTouch:o=!1,syncTouchLerp:a=.075,touchInertiaMultiplier:c=35,duration:u,easing:d=S=>Math.min(1,1.001-Math.pow(2,-10*S)),lerp:l=!u&&.1,infinite:h=!1,orientation:f="vertical",gestureOrientation:g="vertical",touchMultiplier:v=1,wheelMultiplier:m=1,autoResize:p=!0,prevent:x=!1,__experimental__naiveDimensions:_=!1}={}){this.__isScrolling=!1,this.__isStopped=!1,this.__isLocked=!1,this.onVirtualScroll=({deltaX:S,deltaY:M,event:E})=>{if(E.ctrlKey)return;const w=E.type.includes("touch"),C=E.type.includes("wheel");if(this.isTouching=E.type==="touchstart"||E.type==="touchmove",this.options.syncTouch&&w&&E.type==="touchstart"&&!this.isStopped&&!this.isLocked)return void this.reset();const y=S===0&&M===0,b=this.options.gestureOrientation==="vertical"&&M===0||this.options.gestureOrientation==="horizontal"&&S===0;if(y||b)return;let U=E.composedPath();U=U.slice(0,U.indexOf(this.rootElement));const z=this.options.prevent;if(U.find(k=>{var j,D,K,q,te;return(typeof z=="function"?z?.(k):z)||((j=k.hasAttribute)===null||j===void 0?void 0:j.call(k,"data-lenis-prevent"))||w&&((D=k.hasAttribute)===null||D===void 0?void 0:D.call(k,"data-lenis-prevent-touch"))||C&&((K=k.hasAttribute)===null||K===void 0?void 0:K.call(k,"data-lenis-prevent-wheel"))||((q=k.classList)===null||q===void 0?void 0:q.contains("lenis"))&&!(!((te=k.classList)===null||te===void 0)&&te.contains("lenis-stopped"))}))return;if(this.isStopped||this.isLocked)return void E.preventDefault();if(!(this.options.syncTouch&&w||this.options.smoothWheel&&C))return this.isScrolling="native",void this.animate.stop();E.preventDefault();let P=M;this.options.gestureOrientation==="both"?P=Math.abs(M)>Math.abs(S)?M:S:this.options.gestureOrientation==="horizontal"&&(P=S);const O=w&&this.options.syncTouch,F=w&&E.type==="touchend"&&Math.abs(P)>5;F&&(P=this.velocity*this.options.touchInertiaMultiplier),this.scrollTo(this.targetScroll+P,Object.assign({programmatic:!1},O?{lerp:F?this.options.syncTouchLerp:1}:{lerp:this.options.lerp,duration:this.options.duration,easing:this.options.easing}))},this.onNativeScroll=()=>{if(clearTimeout(this.__resetVelocityTimeout),delete this.__resetVelocityTimeout,this.__preventNextNativeScrollEvent)delete this.__preventNextNativeScrollEvent;else if(this.isScrolling===!1||this.isScrolling==="native"){const S=this.animatedScroll;this.animatedScroll=this.targetScroll=this.actualScroll,this.lastVelocity=this.velocity,this.velocity=this.animatedScroll-S,this.direction=Math.sign(this.animatedScroll-S),this.isScrolling=!!this.hasScrolled&&"native",this.emit(),this.velocity!==0&&(this.__resetVelocityTimeout=setTimeout(()=>{this.lastVelocity=this.velocity,this.velocity=0,this.isScrolling=!1,this.emit()},400))}},window.lenisVersion="1.1.1",e!==document.documentElement&&e!==document.body||(e=window),this.options={wrapper:e,content:t,wheelEventsTarget:n,eventsTarget:i,smoothWheel:r,syncTouch:o,syncTouchLerp:a,touchInertiaMultiplier:c,duration:u,easing:d,lerp:l,infinite:h,gestureOrientation:g,orientation:f,touchMultiplier:v,wheelMultiplier:m,autoResize:p,prevent:x,__experimental__naiveDimensions:_},this.animate=new bD,this.emitter=new Lg,this.dimensions=new MD({wrapper:e,content:t,autoResize:p}),this.updateClassName(),this.userData={},this.time=0,this.velocity=this.lastVelocity=0,this.isLocked=!1,this.isStopped=!1,this.isScrolling=!1,this.targetScroll=this.animatedScroll=this.actualScroll,this.options.wrapper.addEventListener("scroll",this.onNativeScroll,!1),this.virtualScroll=new ED(i,{touchMultiplier:v,wheelMultiplier:m}),this.virtualScroll.on("scroll",this.onVirtualScroll)}destroy(){this.emitter.destroy(),this.options.wrapper.removeEventListener("scroll",this.onNativeScroll,!1),this.virtualScroll.destroy(),this.dimensions.destroy(),this.cleanUpClassName()}on(e,t){return this.emitter.on(e,t)}off(e,t){return this.emitter.off(e,t)}setScroll(e){this.isHorizontal?this.rootElement.scrollLeft=e:this.rootElement.scrollTop=e}resize(){this.dimensions.resize()}emit({userData:e={}}={}){this.userData=e,this.emitter.emit("scroll",this),this.userData={}}reset(){this.isLocked=!1,this.isScrolling=!1,this.animatedScroll=this.targetScroll=this.actualScroll,this.lastVelocity=this.velocity=0,this.animate.stop()}start(){this.isStopped&&(this.isStopped=!1,this.reset())}stop(){this.isStopped||(this.isStopped=!0,this.animate.stop(),this.reset())}raf(e){const t=e-(this.time||e);this.time=e,this.animate.advance(.001*t)}scrollTo(e,{offset:t=0,immediate:n=!1,lock:i=!1,duration:r=this.options.duration,easing:o=this.options.easing,lerp:a=!r&&this.options.lerp,onStart:c,onComplete:u,force:d=!1,programmatic:l=!0,userData:h={}}={}){if(!this.isStopped&&!this.isLocked||d){if(["top","left","start"].includes(e))e=0;else if(["bottom","right","end"].includes(e))e=this.limit;else{let f;if(typeof e=="string"?f=document.querySelector(e):e?.nodeType&&(f=e),f){if(this.options.wrapper!==window){const v=this.options.wrapper.getBoundingClientRect();t-=this.isHorizontal?v.left:v.top}const g=f.getBoundingClientRect();e=(this.isHorizontal?g.left:g.top)+this.animatedScroll}}if(typeof e=="number"){if(e+=t,e=Math.round(e),this.options.infinite?l&&(this.targetScroll=this.animatedScroll=this.scroll):e=Pg(0,e,this.limit),n)return this.animatedScroll=this.targetScroll=e,this.setScroll(this.scroll),this.reset(),void(u==null||u(this));e!==this.targetScroll&&(l||(this.targetScroll=e),this.animate.fromTo(this.animatedScroll,e,{duration:r,easing:o,lerp:a,onStart:()=>{i&&(this.isLocked=!0),this.isScrolling="smooth",c?.(this)},onUpdate:(f,g)=>{this.isScrolling="smooth",this.lastVelocity=this.velocity,this.velocity=f-this.animatedScroll,this.direction=Math.sign(this.velocity),this.animatedScroll=f,this.setScroll(this.scroll),l&&(this.targetScroll=f),g||this.emit({userData:h}),g&&(this.reset(),this.emit({userData:h}),u?.(this),this.__preventNextNativeScrollEvent=!0)}}))}}}get rootElement(){return this.options.wrapper===window?document.documentElement:this.options.wrapper}get limit(){return this.options.__experimental__naiveDimensions?this.isHorizontal?this.rootElement.scrollWidth-this.rootElement.clientWidth:this.rootElement.scrollHeight-this.rootElement.clientHeight:this.dimensions.limit[this.isHorizontal?"x":"y"]}get isHorizontal(){return this.options.orientation==="horizontal"}get actualScroll(){return this.isHorizontal?this.rootElement.scrollLeft:this.rootElement.scrollTop}get scroll(){return this.options.infinite?function(t,n){return(t%n+n)%n}(this.animatedScroll,this.limit):this.animatedScroll}get progress(){return this.limit===0?1:this.scroll/this.limit}get isScrolling(){return this.__isScrolling}set isScrolling(e){this.__isScrolling!==e&&(this.__isScrolling=e,this.updateClassName())}get isStopped(){return this.__isStopped}set isStopped(e){this.__isStopped!==e&&(this.__isStopped=e,this.updateClassName())}get isLocked(){return this.__isLocked}set isLocked(e){this.__isLocked!==e&&(this.__isLocked=e,this.updateClassName())}get isSmooth(){return this.isScrolling==="smooth"}get className(){let e="lenis";return this.isStopped&&(e+=" lenis-stopped"),this.isLocked&&(e+=" lenis-locked"),this.isScrolling&&(e+=" lenis-scrolling"),this.isScrolling==="smooth"&&(e+=" lenis-smooth"),e}updateClassName(){this.cleanUpClassName(),this.rootElement.className=`${this.rootElement.className} ${this.className}`.trim()}cleanUpClassName(){this.rootElement.className=this.rootElement.className.replace(/lenis(-\w+)?/g,"").trim()}}class wD extends Ht{init(){super.init(),this.thumbRef=this.el.querySelector(".ui-scrollbar-thumb"),this.onPointerDown=this.onPointerDown.bind(this),this.onPointerMove=this.onPointerMove.bind(this),this.onPointerUp=this.onPointerUp.bind(this),this.onScroll=this.onScroll.bind(this),this.onResize=this.onResize.bind(this),this.updateBounds()}async addEvents(){super.addEvents(),await this.page.scrollPromise,this.page.scroll&&(this.el.style.opacity=1,this.el.addEventListener("pointerdown",this.onPointerDown),addEventListener("pointermove",this.onPointerMove),addEventListener("pointerup",this.onPointerUp),this.page.scroll.on("scroll",this.onScroll),addEventListener("resize",this.onResize),this.onResize())}destroy(){super.destroy(),this.el.removeEventListener("pointerdown",this.onPointerDown),removeEventListener("pointermove",this.onPointerMove),removeEventListener("pointerup",this.onPointerUp),removeEventListener("resize",this.onResize),this.onResize()}onResize(){this.updateBounds(),this.page.scroll&&(this.page.scroll.limit>window.innerHeight?this.el.style.opacity=1:this.el.style.opacity=0)}updateBounds(){this.thumbHeight=this.thumbRef.offsetHeight,this.innerHeight=this.el.offsetHeight}onPointerDown(e){this.start=e.clientY}onPointerMove(e){if(!this.start)return;e.preventDefault();const t=Cs(e.clientY,this.start,this.innerHeight-(this.thumbHeight-this.start),0,this.page.scroll.limit);this.page.scroll.scrollTo(t,{immediate:!0})}onPointerUp(e){this.start=null}onScroll({scroll:e,limit:t}){const n=e/t;this.thumbRef.style.transform=`translate3d(0,${n*(this.innerHeight-this.thumbHeight)}px,0)`}}class Ug extends sl{async init(){super.init(),this.setScrollSettings(),this.scrollPromise=new Promise(e=>{this.scrollResolve=e}),this.add(".ui-scrollbar",wD,this.el,"Scrollbar"),this.onRaf=this.onRaf.bind(this),this.onScroll=this.onScroll.bind(this)}setScrollSettings(){this.scrollSettings={}}async initScroll(){await J.initPromise,this.scroll=new Ig(this.scrollSettings),Bt.add(this.onRaf,this.id),Bt.moveToFirst(this.id),this.scrollResolve(),this.scroll.on("scroll",this.onScroll)}onRaf({frame:e}){this.scroll.raf(e)}onScroll(){this.scroll.scroll>20?document.documentElement.classList.add("is-scrolled"):document.documentElement.classList.remove("is-scrolled")}destroy(){super.destroy(),this.scroll?.destroy(),Bt.remove(this.id),document.documentElement.classList.remove("is-scrolled")}resetScroll(){window.scrollTo(0,0),document.body.scrollTop=0,history.scrollRestoration&&(history.scrollRestoration="manual")}async onLoaderEnd(){super.onLoaderEnd(),this.resetScroll(),this.initScroll()}onEnter(){super.onEnter(),this.resetScroll(),this.initScroll()}}class TD extends Ht{async init(){this.onScroll=this.onScroll.bind(this),this.onRaf=this.onRaf.bind(this),super.init()}async addEvents(){super.addEvents(),await this.page.scrollPromise,await J.initPromise,Se.setSpotLightIntensity(0,0),J.workScene.aboutBlocks.track=this.el,J.workScene.aboutBlocks.visible=!0,J.workScene.spotLightParallax=!1,await fn(100),Bt.add(this.onRaf,"aboutVisual"),J.workScene.spotLight.map=J.characterScene.renderManager.renderTargetComposite.texture,J.characterScene.character.rotatableMesh.addEvents(),pe.emit(xe.FORCE_RESIZE),await fn(200),this.onScroll()}destroy(){super.destroy(),Bt.remove("aboutVisual"),J.workScene.aboutBlocks.track=null,J.workScene.aboutBlocks.visible=!1,J.workScene.spotLightParallax=!0,J.characterScene.character.rotatableMesh.removeEvents()}updateSpotLight(){J.workScene.spotLight.position.set(J.workScene.aboutBlocks.position.x-.5,J.workScene.aboutBlocks.position.y,J.workScene.aboutBlocks.position.z+4.2),J.workScene.spotLight.target.position.set(J.workScene.aboutBlocks.position.x+1.5,J.workScene.aboutBlocks.position.y,J.workScene.aboutBlocks.position.z-8)}onRaf(){this.onScroll()}onScroll(){const e=this.page.scroll.scroll;this.updateSpotLight();const t=Cs(e,0,Pe.h*.25,1,0,!0);Pe.w>=Le.BREAKPOINTS.LG?J.workScene.aboutBlocks.material.customUniforms.uScrollOpacity.value=1:J.workScene.aboutBlocks.material.customUniforms.uScrollOpacity.value=t}animateOut(){this.outAnim&&this.outAnim.kill(),this.outAnim=oe.timeline(),this.outAnim.to(J.workScene.aboutBlocks.material.customUniforms.uReveal,{value:0,ease:"expo.out",duration:1,onComplete:()=>{J.workScene.aboutBlocks.visible=!1}}),this.outAnim.to(J.workScene.aboutBlocks.material.customUniforms.uRevealSpread,{value:1,ease:"none",duration:1},0),Se.setSpotLightIntensity(0)}animateIn(){this.inAnim&&this.inAnim.kill(),this.inAnim=oe.timeline(),this.inAnim.to(J.workScene.aboutBlocks.material.customUniforms.uReveal,{value:1,delay:.3,ease:"expo.out",duration:1.6,onStart:()=>{Se.setSpotLightIntensity(270)}}),this.inAnim.to(J.workScene.aboutBlocks.material.customUniforms.uRevealSpread,{value:0,ease:"expo.out",duration:1.6},0)}}class Fg extends Ht{async addEvents(){await J.initPromise,super.addEvents(),this.translation=.005,this.onRaf=this.onRaf.bind(this),Bt.add(this.onRaf,"FloatingBlocks update")}destroy(){super.destroy(),Bt.remove("FloatingBlocks update")}onRaf(e){J.workScene.floatingBlocks.update(e),this.page.scroll&&(J.workScene.floatingBlocks.translationZ+=this.translation*Math.abs(this.page.scroll.velocity))}animateOut(){this.outAnim&&this.outAnim.kill(),this.outAnim=oe.timeline(),this.outAnim.to(J.workScene.floatingBlocks.material.customUniforms.uReveal,{value:0,ease:"expo.out",duration:1,onComplete:()=>{J.workScene.floatingBlocks.visible=!1}}),this.outAnim.to(J.workScene.floatingBlocks.material.customUniforms.uRevealSpread,{value:0,ease:"none",duration:1},0)}animateIn(){this.outAnim&&this.outAnim.kill(),this.inAnim&&this.inAnim.kill(),this.inAnim=oe.timeline(),this.inAnim.to(J.workScene.floatingBlocks.material.customUniforms.uReveal,{value:1,ease:"expo.out",duration:1.6,onStart:()=>{J.workScene.floatingBlocks.visible=!0}}),this.inAnim.to(J.workScene.floatingBlocks.material.customUniforms.uRevealSpread,{value:1,ease:"none",duration:1.6},0)}}class AD extends Ht{init(){super.init(),this.page.el.appendChild(this.el),this.delay={enter:0,leave:300},this.triggers=this.getAll(`[data-modal-trigger='${this.el.dataset.modal}']`,this.page.el),this.closeButton=this.get(".c-modal-close"),this.bg=this.get(".c-modal-outer"),this.inner=this.get(".c-modal-inner"),this.onRaf=this.onRaf.bind(this),this.onKeyDown=this.onKeyDown.bind(this),this.el.style.opacity=0,this.el.style.pointerEvents="none"}addEvents(){super.addEvents(),pe.on(xe.MODAL_SHOW,this.showModal.bind(this)),this.triggers&&this.triggers.forEach(e=>e.addEventListener("click",this.onClick.bind(this))),this.closeButton&&this.closeButton.addEventListener("click",this.onClose.bind(this)),document.addEventListener("keydown",this.onKeyDown)}destroy(){super.destroy(),pe.off(xe.MODAL_SHOW,this.showModal.bind(this)),this.triggers&&this.triggers.forEach(e=>e.removeEventListener("click",this.onClick.bind(this))),this.closeButton&&this.closeButton.removeEventListener("click",this.onClose.bind(this)),document.removeEventListener("keydown",this.onKeyDown)}onKeyDown(e){e.keyCode===27&&this.hideModal()}onClick(e){e.preventDefault(),this.showModal()}onClose(e){e.preventDefault(),this.hideModal()}showModal(e=null){e&&e!==this.el.dataset.modal||(this.el.style.pointerEvents="all",this.el.style.display="block",this.page.scroll.stop(),this.scroll=new Ig({wrapper:this.el,content:this.get(".c-modal-outer")}),Bt.add(this.onRaf,this.id),oe.fromTo(this.el,{opacity:0},{opacity:1,duration:.5,ease:"none"}),pe.emit(xe.MODAL_OPEN,this.id))}onRaf({frame:e}){this.scroll.raf(e)}hideModal(){this.el.style.pointerEvents="none",this.page.scroll.start(),this.scroll?.destroy(),Bt.remove(this.id),oe.to(this.el,{opacity:0,duration:.5,ease:"none",onComplete:()=>{this.el.style.display="none"}})}}class DD extends Ug{async init(){super.init(),this.add(".ui-footer",Ou,this.el,"PageFooter"),this.add(".ui-title",Rg,this.el,"PageTitle"),this.add(".ui-about-hero-visual",TD,this.el,"AboutVisual"),this.add(".ui-about-hero",Fg,this.el,"FloatingBlocksComponent"),this.add("[data-modal]",AD,this.el,"Modal",!0),this.introTitle=this.el.querySelector(".ui-about-intro .ts-1"),this.introText=this.el.querySelectorAll(".ui-about-intro .ts-p"),await J.initPromise,pe.emit(xe.RESIZE),Se.setMainColor(xt.colors.primary),Se.setDarken(xt.darken),Se.setSaturation(xt.saturation),Se.setContrast(xt.contrast),Se.setMediaBackground(xt.colors.primary),Se.setAmbientLight("#000000",xt.ambient),Se.setDirectionalLightIntensity(5)}destroy(){super.destroy()}animateIn(){super.animateIn(),oe.fromTo(this.introTitle.querySelectorAll(".line-inner"),{opacity:0,y:"80%"},{opacity:1,y:0,duration:1.8,stagger:.05,ease:"expo.out"}),this.introText.forEach((e,t)=>{oe.fromTo(e.querySelectorAll(".line-inner"),{y:"80%",opacity:0},{y:0,opacity:1,duration:1.8,delay:.3+t*.1,stagger:.05,ease:"expo.out"})})}}class Ng extends Ht{async init(){super.init(),this.bg=this.el.querySelector(".c-button-bg"),this.textInner=this.el.querySelector(".c-button-text-inner"),this.formatButton=this.formatButton.bind(this),this.formatButton()}formatButton(){const e=this.bg.offsetHeight,t=this.bg.offsetWidth;this.svg=this.get("svg"),this.rect=this.svg.querySelector(".c-button-bg-static"),this.rectHover=this.svg.querySelector(".c-button-bg-hover"),this.line=this.svg.querySelector("line"),this.svg.setAttribute("width",t),this.svg.setAttribute("height",e),this.svg.setAttribute("viewBox",`0 0 ${t} ${e}`),this.rect.setAttribute("width",t),this.rect.setAttribute("height",e),this.rectHover.setAttribute("width",t),this.rectHover.setAttribute("height",e),this.rect.setAttribute("height",e-2),this.rectHover.setAttribute("height",e-2)}async addEvents(){super.addEvents(),pe.on(xe.RESIZE,this.formatButton)}destroy(){super.destroy(),pe.off(xe.RESIZE,this.formatButton)}animateIn(){this.animateTL=oe.timeline({delay:0}),this.animateTL.fromTo(this.el,{opacity:0},{opacity:1,duration:.3,ease:"none"}),this.animateTL.fromTo(this.textInner,{opacity:0,y:"102%"},{opacity:1,y:0,duration:1.6,ease:"expo.out"},0)}}class CD extends Ht{async init(){super.init(),this.project=this.page.project,this.nextProject=is.getProjectById(this.el.dataset.projectSlug),this.nextActive=!1,this.settings={color:this.project.data.colors.primary,ambientColor:this.project.data.colors.secondary,ambientIntensity:this.project.data.ambient||.5,mediaBackground:this.project.data.colors.media||this.project.data.colors.primary,saturation:this.project.data.saturation||1,contrast:this.project.data.contrast||1.15,from:{color:this.project.data.colors.primary,ambientColor:this.project.data.colors.secondary,ambientIntensity:this.project.data.ambient||.5,mediaBackground:this.project.data.colors.media||this.project.data.colors.primary,saturation:this.project.data.saturation||1,contrast:this.project.data.contrast||1.15},to:{color:this.nextProject.data.colors.primary,ambientColor:this.nextProject.data.colors.secondary,ambientIntensity:this.nextProject.data.ambient||.5,mediaBackground:this.nextProject.data.colors.media||this.nextProject.data.colors.primary,saturation:this.nextProject.data.saturation||1,contrast:this.nextProject.data.contrast||1.15}},this.colorTl=oe.timeline(),this.settings.from&&this.settings.from.ambientIntensity<0&&this.project.data.colors.invert&&(this.settings.from.ambientColor=this.project.data.colors.invert),this.settings.to.ambientIntensity<0&&this.nextProject.data.colors.invert&&(this.settings.to.ambientColor=this.nextProject.data.colors.invert),this.colorTl.fromTo(this.settings,{color:this.settings.from.color,ambientColor:this.settings.from.ambientColor,ambientIntensity:this.settings.from.ambientIntensity,mediaBackground:this.settings.from.mediaBackground,saturation:this.settings.from.saturation,contrast:this.settings.from.contrast},{color:this.settings.to.color,ambientColor:this.settings.to.ambientColor,ambientIntensity:this.settings.to.ambientIntensity,mediaBackground:this.settings.to.mediaBackground,saturation:this.settings.to.saturation,contrast:this.settings.to.contrast,duration:1,ease:"none"}),this.onScroll=this.onScroll.bind(this)}async addEvents(){super.addEvents(),await this.page.scrollPromise,this.page.scroll.on("scroll",this.onScroll),window.addEventListener("resize",this.onResize),this.onResize()}destroy(){super.destroy(),this.page.scroll.off("scroll",this.onScroll),window.removeEventListener("resize",this.onResize)}onResize(){this.height=this.el?this.el.clientHeight:0,this.innerHeight=innerHeight}onScroll(e){const{scrollHeight:t}=e.dimensions,n=t-this.innerHeight;Cs(e.animatedScroll,n-this.height/2,n,0,1,!0)>=.01?this.nextActive||(this.nextActive=!0,Se.setAmbientLight(this.settings.to.ambientColor,this.settings.to.ambientIntensity),Se.setMainColor(this.settings.to.color),Se.setMediaBackground(this.settings.to.mediaBackground),Se.setSaturation(this.settings.to.saturation),Se.setContrast(this.settings.to.contrast)):this.nextActive&&(this.nextActive=!1,Se.setAmbientLight(this.settings.from.ambientColor,this.settings.from.ambientIntensity),Se.setMainColor(this.settings.from.color),Se.setMediaBackground(this.settings.from.mediaBackground),Se.setSaturation(this.settings.from.saturation),Se.setContrast(this.settings.from.contrast))}}class RD extends Ht{async init(){super.init(),this.active=!0,this.onScroll=this.onScroll.bind(this),this.onResize=this.onResize.bind(this)}async addEvents(){super.addEvents(),await this.page.scrollPromise,this.page.scroll.on("scroll",this.onScroll),window.addEventListener("resize",this.onResize),this.onResize()}destroy(){super.destroy(),this.page.scroll.off("scroll",this.onScroll),window.removeEventListener("resize",this.onResize)}onResize(){this.height=this.el?this.el.clientHeight:0,Pe.w>=Le.BREAKPOINTS.LG?this.active=!0:(this.active=!1,this.el.style.opacity=1,this.el.style.transform="translate3d(0, 0, 0)")}onScroll(e){const t=this.page.scroll.scroll,n=Cs(t,0,this.height,1,0),i=Cs(t,0,this.height,0,25);this.active&&(this.el.style.opacity=n,this.el.style.transform=`translate3d(0, ${i}px, 0)`)}animateIn(){const e=this.getAll(".ui-project-text .line-inner");if(Pe.w<Le.BREAKPOINTS.LG)return;oe.fromTo(e,{y:"70%",opacity:0},{y:0,opacity:1,duration:1.8,stagger:.03,ease:"expo.out"});const t=this.getAll(".ts-2 > span");oe.fromTo(t,{y:"70%",opacity:0},{y:0,opacity:1,duration:1.8,stagger:.03,ease:"expo.out"});const n=this.getAll(".ui-project-info-items");oe.fromTo(n,{y:"70%",opacity:0},{y:0,opacity:1,duration:1.8,ease:"expo.out"});const i=this.getAll(".ui-project-links");oe.fromTo(i,{y:"70%",opacity:0},{y:0,opacity:1,duration:1.8,ease:"expo.out"}),this.getAll(".ui-project-info-item").forEach((o,a)=>{oe.fromTo(o.querySelectorAll("span"),{y:"102%",opacity:0},{y:0,delay:.1*a,opacity:1,duration:1.8,stagger:.03,ease:"expo.out"})})}}class PD extends Ht{init(){super.init(),this.sectionViewed=!1,this.lastViewed=!1,this.inView=this.inView.bind(this),this.animateIn=this.animateIn.bind(this),this.animateOut=this.animateOut.bind(this)}observe(){this.observer=new IntersectionObserver(this.inView,{threshold:0,rootMargin:"0% 0% 0% 0%"}),this.observer.observe(this.el)}unobserve(){this.observer.unobserve(this.el)}onEnter(){}onLeave(){}animateIn(){}animateOut(){}animateInOnScroll(){}inView(e){e.forEach(t=>{const{isIntersecting:n,target:i}=t;if(this.isIntersecting=n,i===this.el&&(n?this.onEnter():this.onLeave()),n)if(i===this.el){if(this.sectionViewed)return;this.animateInOnScroll(),this.sectionViewed=!0}else{if(this.lastViewed)return;this.lastViewed=!0}})}}const LD=`
precision highp float;

${fg}
vec4 coverTexture(sampler2D tex, vec2 imgSize, vec2 ouv, vec2 size) {
  vec2 s = size;
  vec2 i = imgSize;
  float rs = s.x / s.y;
  float ri = i.x / i.y;
  vec2 new = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
  vec2 newOffset = (rs < ri ? vec2((new.x - s.x) / 2.0, 0.0) : vec2(0.0, (new.y - s.y) / 2.0)) / new;
  vec2 uv = ouv * s / new + newOffset;

  return texture2D(tex, uv);
}

uniform sampler2D tMap;
uniform vec2 uMapSize;
uniform vec2 uContainerSize;
uniform float uCameraDistance;
uniform float uRadius;
uniform vec3 uBackgroundColor;
uniform float uReveal;

in vec2 vUv;
// in vec3 vCameraPosition;
out vec4 FragColor;

float udRoundBox( vec2 p, vec2 b, float r ) {
  return length(max(abs(p)-b+r,0.0))-r;
}

void main() {
  float parallax = uCameraDistance * 0.0001;  // Adjust the factor to control the strength of the parallax effect
  vec2 uv = vUv;
  
  uv.y -= parallax;

  // vec4 color = texture(tMap, uv);
  vec4 color = coverTexture(tMap, uMapSize, uv, uContainerSize);
  color.rgb = blendLighten(color.rgb, vec3(.02));

  vec2 res = uContainerSize;
  vec2 halfRes = 0.5 * res;
  float b = udRoundBox(vUv.xy * res - halfRes, halfRes, uRadius);    
  vec3 a = mix(vec3(1.0,0.0,0.0), vec3(0.0,0.0,0.0), smoothstep(0.0, 1.0, b));


  color.rgb = mix(color.rgb, uBackgroundColor, 1. - uReveal);

  color.a = a.x;
  FragColor = color;
}
`,ID=`
precision highp float;

uniform float uCircleRotation;
out vec2 vUv;
out vec3 vDir;
// out vec3 vCameraPosition;
void main() {
  vUv = uv;
  
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  // vCameraPosition = worldPosition.xyz - cameraPosition;
  vec4 mvPosition = viewMatrix * worldPosition;
  gl_Position = projectionMatrix * mvPosition;
}
`;class UD extends Cn{constructor(){super({glslVersion:lt,toneMapped:!1,uniforms:{tMap:new I(null),uContainerSize:new I(new Q),uMapSize:new I(new Q),uCameraDistance:new I,uRadius:new I,uBackgroundColor:new I(new L),uReveal:new I(0)},vertexShader:ID,fragmentShader:LD,transparent:!0,depthWrite:!1,depthTest:!1})}}class FD extends rt{constructor({track:e,material:t=new UD,geometry:n=new Rn(1,1),scaleWidth:i=!0,offsetParent:r=null}){super(),this.track=e,this.active=!1,this.bounds=this.track.getBoundingClientRect(),this.offset=new Q,this.translation=new Q(0,-100),this.offsetParent=r,this.parallaxTop=this.track.dataset.mediaParallax==="top",this.scroll=window.scrollY,this.scrollParent=null,this.scaleWidth=i,this.geometry=n,this.material=t,this.planeMesh=new at(this.geometry,this.material),this.add(this.planeMesh)}updateBackground(){this.material.uniforms.uBackgroundColor.value=this.backgroundColor}getTrack(e){this.track=document.body.querySelector(e)}updateScroll(e){}update(e=window.scrollY){this.position.x=this.offset.x+this.translation.x,this.position.y=this.offset.y+this.translation.y+e,this.material.uniforms.uCameraDistance.value=J.mediaScene.camera.position.y-this.position.y,this.parallaxTop&&(this.material.uniforms.uCameraDistance.value=-e)}resize(e=this.track.offsetWidth,t=this.track.offsetHeight){const n=this.track.getBoundingClientRect();this.bounds={width:n.width,height:n.height,top:n.top+window.scrollY,left:n.left};const i=window.getComputedStyle(this.track),r=parseFloat(i.borderRadius);r>0&&(this.material.uniforms.uRadius.value=r),this.offset.set(-e/2+this.bounds.width/2+this.bounds.left,t/2-this.bounds.height/2-this.bounds.top),this.scale.set(this.bounds.width,this.bounds.height,1),this.material.uniforms.uContainerSize.value.set(this.bounds.width,this.bounds.height)}}class ND extends PD{async init(){super.init(),this.mediaItemInstance=new FD({track:this.el}),this.mediaSrc=this.el.getAttribute("data-media-src"),this.mediaType=this.mediaSrc.split(".").pop(),await J.initPromise;const e=this.el.getAttribute("data-media-width"),t=this.el.getAttribute("data-media-height");this.mediaItemInstance.planeMesh.material.uniforms.uMapSize.value.set(e,t),J.mediaScene.mediaItems.add(this.mediaItemInstance),this.onScroll(0),this.onScroll=this.onScroll.bind(this),this.onResize=this.onResize.bind(this)}animateInOnScroll(){this.mediaType==="mp4"||this.mediaType==="mov"?this.loadVideo(this.mediaSrc):this.loadImage(this.mediaSrc)}showMedia(){oe.fromTo(this.mediaItemInstance.planeMesh.material.uniforms.uReveal,{value:0},{value:1,duration:.5,ease:"none"})}async onEnter(){await this.loadPromise,this.video&&this.video.play()}async onLeave(){await this.loadPromise,this.video&&this.video.pause()}async loadImage(e){let t=e;Qe.imageWorker.addEventListener("message",n=>{if(n.data.src!==e)return;const i=e.split(".").pop();Le.WEBP||(t=e.replace(i,"jpg"));const r=new Ut(n.data.bitmap);r.needsUpdate=!0,this.mediaItemInstance.planeMesh.material.uniforms.tMap.value=r,this.showMedia()}),Qe.imageWorker.postMessage(t)}async loadVideo(e){this.video=Object.assign(document.createElement("video"),{crossOrigin:"Anonymous",muted:!0,loop:!0,start:!0,playsInline:!0}),this.video.addEventListener("loadedmetadata",()=>{this.mediaItemInstance.planeMesh.material.uniforms.uMapSize.value.set(this.video.videoWidth,this.video.videoHeight),this.showMedia()}),this.video.onended=function(){URL.revokeObjectURL(e)},Qe.videoWorker.addEventListener("message",t=>{if(t.data.src!==e)return;this.video.src=t.data.videoURL;const n=new Xm(this.video);this.mediaItemInstance.planeMesh.material.uniforms.tMap.value=n}),Qe.videoWorker.postMessage(e)}async addEvents(){super.addEvents(),await this.page.scrollPromise,pe.emit(xe.FORCE_RESIZE),pe.on(xe.RESIZE,this.onResize),this.page.scroll.on("scroll",this.onScroll),this.onScroll(0)}onResize(){Pe.w>=Le.BREAKPOINTS.LG?this.mediaItemInstance.planeMesh.visible=!0:this.mediaItemInstance.planeMesh.visible=!1,this.mediaItemInstance.update(this.page.scroll.scroll)}destroy(){super.destroy(),pe.off(xe.RESIZE,this.onResize),this.video&&this.video.pause(),this.video&&this.video.remove(),this.video=null}onScroll(e=this.page.scroll.scroll||0){this.mediaItemInstance.update(this.page.scroll.scroll)}}class OD extends Ug{async init(){super.init(),this.project=is.getProjectById(this.el.dataset.project),this.add(".c-button",Ng,this.el,"Button"),Se.setMainColor(this.project.data.colors.primary),await J.initPromise,this.add(".ui-footer",Ou,this.el,"PageFooter"),this.add("[data-media]",ND,this.el,"ProjectMedia"),this.add(".ui-project-next",CD,this.el,"ProjectNext"),this.add(".ui-project-content-header",RD,this.el,"ProjectHeader"),Se.setMediaOpacity(0,0,"none",0),Se.setDarken(this.project.data.darkenDetail||.25),Se.setSaturation(this.project.data.saturation||1),Se.setContrast(this.project.data.contrast||1.15),Se.setMediaBackground(this.project.data.colors.media||this.project.data.colors.primary),this.ambientColor=this.project.data.colors.secondary,this.ambientIntensity=this.project.data.ambient||.5,this.darkenDetail=this.project.data.darkenDetail||.25,this.project.data.ambient<0&&this.project.data.colors.invert&&(this.ambientColor=this.project.data.colors.invert),Se.setAmbientLight(this.ambientColor,this.ambientIntensity),Se.setFluidStrength(1),pe.emit(xe.RESIZE),Tr.setActive("home"),Ar.setActive("home")}destroy(){super.destroy()}animateIn(){super.animateIn(),pe.emit(xe.FORCE_RESIZE),Se.setMainColor(this.project.data.colors.primary),Se.setDarken(this.darkenDetail),Se.setAmbientLight(this.ambientColor,this.ambientIntensity),Se.mediaAnimateIn()}onLeave(){super.onLeave(),Se.setMediaOpacity(0,.5,"none",0),Se.setFluidStrength(.5)}}class kD extends sl{async init(){this.mouseDownActive=!1,this.translation=.01,this.translation2=0,this.delta=0,await J.initPromise,this.add(".c-button",Ng,this.el,"Button"),this.add(".ui-error-main",Fg,this.el,"FloatingBlocksComponent"),Se.setMainColor(xt.colors.primary),Se.setDarken(xt.darken),Se.setSaturation(xt.saturation),Se.setContrast(xt.contrast),Se.setMediaBackground(xt.colors.primary),Se.setAmbientLight("#000000",xt.ambient),Se.setDirectionalLightIntensity(5),this.animateIn=this.animateIn.bind(this),pe.on(xe.ANIMATE_IN,this.animateIn)}addEvents(){super.addEvents(),this.virtualScroll=new Cg(window,{touchMultiplier:1,wheelMultiplier:1,normalizeWheel:!1}),this.onMouseDown=this.onMouseDown.bind(this),this.onMouseUp=this.onMouseUp.bind(this),this.onTick=this.onTick.bind(this),this.onVirtualScroll=this.onVirtualScroll.bind(this),Bt.add(this.onTick,"errorPage"),this.el.addEventListener("mousedown",this.onMouseDown),this.el.addEventListener("mouseup",this.onMouseUp),this.virtualScroll.on("scroll",this.onVirtualScroll)}destroy(){super.destroy(),Bt.remove("errorPage"),this.virtualScroll.destroy(),this.el.removeEventListener("mousedown",this.onMouseDown),this.el.removeEventListener("mouseup",this.onMouseUp)}onMouseUp(){this.mouseDownAnimation?.kill(),this.mouseDownAnimation=oe.timeline(),this.mouseDownActive=!1,this.mouseDownAnimation.to(this,{translation2:0,duration:2,ease:"expo.out"})}onMouseDown(){this.mouseDownAnimation?.kill(),this.mouseDownAnimation=oe.timeline(),this.mouseDownActive=!0,this.mouseDownAnimation.to(this,{translation2:2.5,duration:2,ease:"expo.out"})}onVirtualScroll({deltaX:e,deltaY:t,event:n}){this.delta=Math.abs(Math.abs(t)>Math.abs(e)?t:e)}onTick(){J.workScene.floatingBlocks.translationZ+=this.translation2,this.delta>=.5&&(this.delta-=.5),J.workScene.floatingBlocks&&(J.workScene.floatingBlocks.translationZ+=this.translation*this.delta)}animateIn(){super.animateIn(),Tr.animateOut(),Ar.animateOut()}onLeave(){super.onLeave(),Tr.animateIn(),Ar.animateIn()}}class BD extends nl{async onLeave({from:e,trigger:t,done:n}){e.getAttribute("data-view")==="home"&&pe.emit(xe.WORK_GALLERY_OUT),await fn(500),n()}async onEnter({to:e,trigger:t,done:n}){Tr.updateNavActive(),Ar.updateNavActive(),await fn(100),pe.emit(xe.ANIMATE_IN),n()}}class zD extends nl{async onLeave({from:e,trigger:t,done:n}){pe.emit(xe.WORK_GALLERY_OUT),await fn(500),n()}async onEnter({to:e,trigger:t,done:n}){await fn(100),pe.emit(xe.ANIMATE_IN),n()}}class HD extends nl{async onLeave({from:e,trigger:t,done:n}){await fn(500),n()}async onEnter({to:e,trigger:t,done:n}){await fn(100),pe.emit(xe.ANIMATE_IN),n()}}function dc(s,e,t,n){return new(t||(t=Promise))(function(i,r){function o(u){try{c(n.next(u))}catch(d){r(d)}}function a(u){try{c(n.throw(u))}catch(d){r(d)}}function c(u){var d;u.done?i(u.value):(d=u.value,d instanceof t?d:new t(function(l){l(d)})).then(o,a)}c((n=n.apply(s,e||[])).next())})}const VD=["geforce 320m","geforce 8600","geforce 8600m gt","geforce 8800 gs","geforce 8800 gt","geforce 9400","geforce 9400m g","geforce 9400m","geforce 9600m gt","geforce 9600m","geforce fx go5200","geforce gt 120","geforce gt 130","geforce gt 330m","geforce gtx 285","google swiftshader","intel g41","intel g45","intel gma 4500mhd","intel gma x3100","intel hd 3000","intel q45","legacy","mali-2","mali-3","mali-4","quadro fx 1500","quadro fx 4","quadro fx 5","radeon hd 2400","radeon hd 2600","radeon hd 4670","radeon hd 4850","radeon hd 4870","radeon hd 5670","radeon hd 5750","radeon hd 6290","radeon hd 6300","radeon hd 6310","radeon hd 6320","radeon hd 6490m","radeon hd 6630m","radeon hd 6750m","radeon hd 6770m","radeon hd 6970m","sgx 543","sgx543"];function Uf(s){return s=s.toLowerCase().replace(/.*angle ?\((.+)\)(?: on vulkan [0-9.]+)?$/i,"$1").replace(/\s(\d{1,2}gb|direct3d.+$)|\(r\)| \([^)]+\)$/g,"").replace(/(?:vulkan|opengl) \d+\.\d+(?:\.\d+)?(?: \((.*)\))?/,"$1")}const Og=typeof window>"u",ei=(()=>{if(Og)return;const{userAgent:s,platform:e,maxTouchPoints:t}=window.navigator,n=/(iphone|ipod|ipad)/i.test(s),i=e==="iPad"||e==="MacIntel"&&t>0&&!window.MSStream;return{isIpad:i,isMobile:/android/i.test(s)||n||i,isSafari12:/Version\/12.+Safari/.test(s),isFirefox:/Firefox/.test(s)}})();function GD(s,e,t){if(!t)return[e];const n=function(u){const d=`
    precision highp float;
    attribute vec3 aPosition;
    varying float vvv;
    void main() {
      vvv = 0.31622776601683794;
      gl_Position = vec4(aPosition, 1.0);
    }
  `,l=`
    precision highp float;
    varying float vvv;
    void main() {
      vec4 enc = vec4(1.0, 255.0, 65025.0, 16581375.0) * vvv;
      enc = fract(enc);
      enc -= enc.yzww * vec4(1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0, 0.0);
      gl_FragColor = enc;
    }
  `,h=u.createShader(35633),f=u.createShader(35632),g=u.createProgram();if(!(f&&h&&g))return;u.shaderSource(h,d),u.shaderSource(f,l),u.compileShader(h),u.compileShader(f),u.attachShader(g,h),u.attachShader(g,f),u.linkProgram(g),u.detachShader(g,h),u.detachShader(g,f),u.deleteShader(h),u.deleteShader(f),u.useProgram(g);const v=u.createBuffer();u.bindBuffer(34962,v),u.bufferData(34962,new Float32Array([-1,-1,0,3,-1,0,-1,3,0]),35044);const m=u.getAttribLocation(g,"aPosition");u.vertexAttribPointer(m,3,5126,!1,0,0),u.enableVertexAttribArray(m),u.clearColor(1,1,1,1),u.clear(16384),u.viewport(0,0,1,1),u.drawArrays(4,0,3);const p=new Uint8Array(4);return u.readPixels(0,0,1,1,6408,5121,p),u.deleteProgram(g),u.deleteBuffer(v),p.join("")}(s),i="801621810",r="8016218135",o="80162181161",a=ei?.isIpad?[["a7",o,12],["a8",r,15],["a8x",r,15],["a9",r,15],["a9x",r,15],["a10",r,15],["a10x",r,15],["a12",i,15],["a12x",i,15],["a12z",i,15],["a14",i,15],["m1",i,15]]:[["a7",o,12],["a8",r,12],["a9",r,15],["a10",r,15],["a11",i,15],["a12",i,15],["a13",i,15],["a14",i,15],["a15",i,15],["a16",i,15],["a17",i,15]];let c;return n==="80162181255"?c=a.filter(([,,u])=>u>=14):(c=a.filter(([,u])=>u===n),c.length||(c=a)),c.map(([u])=>`apple ${u} gpu`)}class Ff extends Error{constructor(e){super(e),Object.setPrototypeOf(this,new.target.prototype)}}const fc=[],Nf=[];function WD(s,e){if(s===e)return 0;const t=s;s.length>e.length&&(s=e,e=t);let n=s.length,i=e.length;for(;n>0&&s.charCodeAt(~-n)===e.charCodeAt(~-i);)n--,i--;let r,o=0;for(;o<n&&s.charCodeAt(o)===e.charCodeAt(o);)o++;if(n-=o,i-=o,n===0)return i;let a,c,u=0,d=0,l=0;for(;d<n;)Nf[d]=s.charCodeAt(o+d),fc[d]=++d;for(;l<i;)for(r=e.charCodeAt(o+l),a=l++,u=l,d=0;d<n;d++)c=r===Nf[d]?a:a+1,a=fc[d],u=fc[d]=a>u?c>u?u+1:c:c>a?a+1:c;return u}function jD(s){return s!=null}const XD=({mobileTiers:s=[0,15,30,60],desktopTiers:e=[0,15,30,60],override:t={},glContext:n,failIfMajorPerformanceCaveat:i=!1,benchmarksURL:r="/vendor/detect-gpu/benchmarks"}={})=>dc(void 0,void 0,void 0,function*(){const o={};if(Og)return{tier:0,type:"SSR"};const{isIpad:a=!!ei?.isIpad,isMobile:c=!!ei?.isMobile,screenSize:u=window.screen,loadBenchmarks:d=M=>dc(void 0,void 0,void 0,function*(){const E=yield fetch(`${r}/${M}`).then(w=>w.json());if(parseInt(E.shift().split(".")[0],10)<4)throw new Ff("Detect GPU benchmark data is out of date. Please update to version 4x");return E})}=t;let{renderer:l}=t;const h=(M,E,w,C,y)=>({device:y,fps:C,gpu:w,isMobile:c,tier:M,type:E});let f,g="";if(l)l=Uf(l),f=[l];else{const M=n||function(w,C=!1){const y={alpha:!1,antialias:!1,depth:!1,failIfMajorPerformanceCaveat:C,powerPreference:"high-performance",stencil:!1};w&&delete y.powerPreference;const b=window.document.createElement("canvas"),U=b.getContext("webgl",y)||b.getContext("experimental-webgl",y);return U??void 0}(ei?.isSafari12,i);if(!M)return h(0,"WEBGL_UNSUPPORTED");const E=ei?.isFirefox?null:M.getExtension("WEBGL_debug_renderer_info");if(l=E?M.getParameter(E.UNMASKED_RENDERER_WEBGL):M.getParameter(M.RENDERER),!l)return h(1,"FALLBACK");g=l,l=Uf(l),f=function(w,C,y){return C==="apple gpu"?GD(w,C,y):[C]}(M,l,c)}const v=(yield Promise.all(f.map(function(M){var E;return dc(this,void 0,void 0,function*(){const w=(re=>{const N=c?["adreno","apple","mali-t","mali","nvidia","powervr","samsung"]:["intel","apple","amd","radeon","nvidia","geforce","adreno"];for(const Y of N)if(re.includes(Y))return Y})(M);if(!w)return;const C=`${c?"m":"d"}-${w}${a?"-ipad":""}.json`,y=o[C]=(E=o[C])!==null&&E!==void 0?E:d(C);let b;try{b=yield y}catch(re){if(re instanceof Ff)throw re;return}const U=function(re){var N;const Y=(re=re.replace(/\([^)]+\)/,"")).match(/\d+/)||re.match(/(\W|^)([A-Za-z]{1,3})(\W|$)/g);return(N=Y?.join("").replace(/\W|amd/g,""))!==null&&N!==void 0?N:""}(M);let z=b.filter(([,re])=>re===U);z.length||(z=b.filter(([re])=>re.includes(M)));const P=z.length;if(P===0)return;const O=M.split(/[.,()\[\]/\s]/g).sort().filter((re,N,Y)=>N===0||re!==Y[N-1]).join(" ");let F,[k,,,,j]=P>1?z.map(re=>[re,WD(O,re[2])]).sort(([,re],[,N])=>re-N)[0][0]:z[0],D=Number.MAX_VALUE;const{devicePixelRatio:K}=window,q=u.width*K*u.height*K;for(const re of j){const[N,Y]=re,ae=N*Y,le=Math.abs(q-ae);le<D&&(D=le,F=re)}if(!F)return;const[,,te,ve]=F;return[D,te,k,ve]})}))).filter(jD).sort(([M=Number.MAX_VALUE,E],[w=Number.MAX_VALUE,C])=>M===w?E-C:M-w);if(!v.length){const M=VD.find(E=>l.includes(E));return M?h(0,"BLOCKLISTED",M):h(1,"FALLBACK",`${l} (${g})`)}const[,m,p,x]=v[0];if(m===-1)return h(0,"BLOCKLISTED",p,m,x);const _=c?s:e;let S=0;for(let M=0;M<_.length;M++)m>=_[M]&&(S=M);return h(S,"BENCHMARK",p,m,x)});oe.registerPlugin(Nr);class Qe{static async init(){this.registerSw(),this.isMobile=cm(),this.isSafari=um,this.isSafari&&document.documentElement.classList.add("is-safari"),this.isMobile&&document.documentElement.classList.add("is-mobile"),await O0(),await document.fonts.ready,await this.gpuCheck().catch(()=>{Le.GPU_TIER=3}),this.projects=await gc("projects"),await k0("lossy").then(()=>{Le.WEBP=!0}).catch(()=>{Le.WEBP=!1}),this.promise=new Promise(e=>{this.resolve=e}),Le.DEBUG&&Le.DEV&&Rt(()=>import("../_astro/Debug.23725532.js"),[]).then(e=>{this.debug=new e.Debug(this)}),Le.STUDIO&&Le.DEV&&Rt(()=>import("../_astro/Studio.edc9a5c1.js"),[]).then(e=>{this.studio=new e.Studio(this)}),sD.init(),Se.init(),Xt.init(),Bt.init(),ln.init(),ha.init({views:{default:sl,home:SD,about:DD,project:OD,error:kD},transitions:{default:BD,project:zD,work:HD}}),Tr.init(),Ar.init(),Ki.init(),Pe.init(),iD.init(),J.init(),Le.DEBUG&&Le.DEV&&(window.canvasInstance=J),this.resolve(),this.preload(),pe.emit(xe.APP_READY)}static currentProject=null;static workState=null;static imageWorker=new Worker("/workers/image-loader.js");static videoWorker=new Worker("/workers/video-loader.js");static async preload(){ha.preload("/"),ha.preload("/about/"),(await gc("projects")).forEach(t=>{ha.preload(`/${t.id}/`)})}static registerSw(){}static async gpuCheck(){try{const e=await XD();Le.GPU_TIER=e.tier}catch(e){console.error("Error fetching GPU tier:",e)}Le.LOW_RES=Le.GPU_TIER<3}}Qe.init();export{Se as A,pe as E,St as O,xe as a,xt as d};
