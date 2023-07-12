"use strict";(self.webpackChunk_castore_docs_docusaurus=self.webpackChunk_castore_docs_docusaurus||[]).push([[857],{40125:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>c,contentTitle:()=>s,default:()=>d,frontMatter:()=>o,metadata:()=>i,toc:()=>p});var n=r(28427),a=(r(2784),r(30876));const o={sidebar_position:7},s="In Memory Event Storage Adapter",i={unversionedId:"resources/inmemory-event-storage-adapter",id:"resources/inmemory-event-storage-adapter",title:"In Memory Event Storage Adapter",description:"DRY Castore EventStorageAdapter implementation using a JS object.",source:"@site/docs/5-resources/7-inmemory-event-storage-adapter.md",sourceDirName:"5-resources",slug:"/resources/inmemory-event-storage-adapter",permalink:"/castore/docs/resources/inmemory-event-storage-adapter",draft:!1,editUrl:"https://github.com/castor-dev/docusaurus/tree/main/packages/create-docusaurus/templates/shared/docs/5-resources/7-inmemory-event-storage-adapter.md",tags:[],version:"current",sidebarPosition:7,frontMatter:{sidebar_position:7},sidebar:"tutorialSidebar",previous:{title:"Redux Event Storage Adapter",permalink:"/castore/docs/resources/redux-event-storage-adapter"},next:{title:"JSON Schema Command",permalink:"/castore/docs/resources/json-schema-command"}},c={},p=[{value:"\ud83d\udce5 Installation",id:"-installation",level:2},{value:"\ud83d\udc69\u200d\ud83d\udcbb Usage",id:"-usage",level:2},{value:"\ud83e\udd14 How it works",id:"-how-it-works",level:2}],l={toc:p},u="wrapper";function d(e){let{components:t,...r}=e;return(0,a.kt)(u,(0,n.Z)({},l,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"in-memory-event-storage-adapter"},"In Memory Event Storage Adapter"),(0,a.kt)("p",null,"DRY Castore ",(0,a.kt)("a",{parentName:"p",href:"https://castore-dev.github.io/castore/docs/the-basics/#eventstorageadapter"},(0,a.kt)("inlineCode",{parentName:"a"},"EventStorageAdapter"))," implementation using a JS object."),(0,a.kt)("p",null,"This class is mainly useful for manual and unit tests. It is obviously not recommended for production uses \ud83d\ude42"),(0,a.kt)("h2",{id:"-installation"},"\ud83d\udce5 Installation"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-bash"},"# npm\nnpm install @castore/inmemory-event-storage-adapter\n\n# yarn\nyarn add @castore/inmemory-event-storage-adapter\n")),(0,a.kt)("p",null,"This package has ",(0,a.kt)("inlineCode",{parentName:"p"},"@castore/core")," as peer dependency, so you will have to install it as well:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-bash"},"# npm\nnpm install @castore/core\n\n# yarn\nyarn add @castore/core\n")),(0,a.kt)("h2",{id:"-usage"},"\ud83d\udc69\u200d\ud83d\udcbb Usage"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-ts"},"import { InMemoryStorageAdapter } from '@castore/inmemory-event-storage-adapter';\n\nconst pokemonsEventsStorageAdapter = new InMemoryStorageAdapter({\n  // \ud83d\udc47 You can specify an initial state for your event store\n  initialEvents: [\n    {\n      aggregateId: '123',\n      ...\n    },\n  ],\n});\n\nconst pokemonsEventStore = new EventStore({\n  // ...\n  storageAdapter: pokemonsEventsStorageAdapter,\n});\n")),(0,a.kt)("h2",{id:"-how-it-works"},"\ud83e\udd14 How it works"),(0,a.kt)("p",null,"This adapter simply persists events in a local dictionary. You can retrieve it at all time through the ",(0,a.kt)("inlineCode",{parentName:"p"},"eventStore")," property:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-ts"},"const eventStore = pokemonsEventStore.eventStore;\n// => { [aggregateId: string]: EventDetail[] }\n")))}d.isMDXComponent=!0},30876:(e,t,r)=>{r.d(t,{Zo:()=>l,kt:()=>g});var n=r(2784);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function s(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function i(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var c=n.createContext({}),p=function(e){var t=n.useContext(c),r=t;return e&&(r="function"==typeof e?e(t):s(s({},t),e)),r},l=function(e){var t=p(e.components);return n.createElement(c.Provider,{value:t},e.children)},u="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},m=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,o=e.originalType,c=e.parentName,l=i(e,["components","mdxType","originalType","parentName"]),u=p(r),m=a,g=u["".concat(c,".").concat(m)]||u[m]||d[m]||o;return r?n.createElement(g,s(s({ref:t},l),{},{components:r})):n.createElement(g,s({ref:t},l))}));function g(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=r.length,s=new Array(o);s[0]=m;var i={};for(var c in t)hasOwnProperty.call(t,c)&&(i[c]=t[c]);i.originalType=e,i[u]="string"==typeof e?e:a,s[1]=i;for(var p=2;p<o;p++)s[p]=r[p];return n.createElement.apply(null,s)}return n.createElement.apply(null,r)}m.displayName="MDXCreateElement"}}]);