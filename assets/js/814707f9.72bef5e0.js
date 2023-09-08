"use strict";(self.webpackChunk_castore_docs=self.webpackChunk_castore_docs||[]).push([[569],{48750:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>s,default:()=>d,frontMatter:()=>a,metadata:()=>i,toc:()=>p});var o=n(52685),r=(n(27378),n(35318));const a={sidebar_position:4},s="\ud83d\udd0c Connected Event Store",i={unversionedId:"reacting-to-events/connected-event-store",id:"reacting-to-events/connected-event-store",title:"\ud83d\udd0c Connected Event Store",description:"If your storage solution exposes data streaming capabilities (such as DynamoDB streams), you can leverage them to push your freshly written events to a message bus or queue.",source:"@site/docs/4-reacting-to-events/4-connected-event-store.md",sourceDirName:"4-reacting-to-events",slug:"/reacting-to-events/connected-event-store",permalink:"/castore/docs/reacting-to-events/connected-event-store",draft:!1,tags:[],version:"current",sidebarPosition:4,frontMatter:{sidebar_position:4},sidebar:"tutorialSidebar",previous:{title:"\ud83d\ude8c Message Buses",permalink:"/castore/docs/reacting-to-events/message-buses"},next:{title:"\ud83d\udcf8 Snapshots",permalink:"/castore/docs/reacting-to-events/snapshots"}},c={},p=[],l={toc:p},u="wrapper";function d(e){let{components:t,...a}=e;return(0,r.kt)(u,(0,o.Z)({},l,a,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"-connected-event-store"},"\ud83d\udd0c Connected Event Store"),(0,r.kt)("p",null,"If your storage solution exposes data streaming capabilities (such as ",(0,r.kt)("a",{parentName:"p",href:"https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html"},"DynamoDB streams"),"), you can leverage them to push your freshly written events to a message bus or queue."),(0,r.kt)("p",null,"You can also use the ",(0,r.kt)("inlineCode",{parentName:"p"},"ConnectedEventStore")," class. Its interface matches the ",(0,r.kt)("inlineCode",{parentName:"p"},"EventStore")," one, but successfully pushing a new event will automatically forward it to a message queue/bus, and pushing an event group will also automatically forward the events to their respective message queues/buses:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"import { ConnectedEventStore } from '@castore/core';\n\nconst connectedPokemonsEventStore = new ConnectedEventStore(\n  // \ud83d\udc47 Original event store\n  pokemonsEventStore,\n  // \ud83d\udc47 Type-safe (appMessageBus MUST be able to carry pokemon events)\n  appMessageBus,\n);\n\n// Will push the event in the event store\n// ...AND publish it to the message bus if it succeeds \ud83d\ude4c\nawait connectedPokemonsEventStore.pushEvent({\n  aggregateId: pokemonId,\n  version: 2,\n  type: 'POKEMON_LEVELED_UP',\n  ...\n});\n")),(0,r.kt)("admonition",{type:"info"},(0,r.kt)("p",{parentName:"admonition"},"Note that setting a connected event store ",(0,r.kt)("inlineCode",{parentName:"p"},"storageAdapter")," and ",(0,r.kt)("inlineCode",{parentName:"p"},"onEventPushed")," properties will override those of the original event store instead.")),(0,r.kt)("p",null,"If the message bus or queue is a state-carrying one, the ",(0,r.kt)("inlineCode",{parentName:"p"},"pushEvent")," method will re-fetch the aggregate to append it to the message before publishing it. You can reduce this overhead by providing the previous aggregate as an option:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"await connectedPokemonsEventStore.pushEvent(\n  {\n    aggregateId: pokemonId,\n    version: 2,\n    ...\n  },\n  // \ud83d\udc47 Aggregate at version 1\n  { prevAggregate: pokemonAggregate },\n  // Removes the need to re-fetch \ud83d\ude4c\n);\n")),(0,r.kt)("p",null,"Compared to data streams, connected event stores have the advantage of simplicity, performances and costs. However, they ",(0,r.kt)("strong",{parentName:"p"},"strongly decouple your storage and messaging solutions"),": Make sure to anticipate any issue that might arise (consistency, non-caught errors etc.)."),(0,r.kt)("p",null,(0,r.kt)("img",{alt:"Connected Event Store",src:n(43434).Z,width:"2870",height:"1085"})),(0,r.kt)("blockquote",null,(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("b",null,"\ud83d\udd27 Reference")),(0,r.kt)("p",null),(0,r.kt)("p",{parentName:"blockquote"},(0,r.kt)("strong",{parentName:"p"},"Constructor:")),(0,r.kt)("ul",{parentName:"blockquote"},(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"eventStore ",(0,r.kt)("i",null,"(EventStore)")),": The event store to connect"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"messageChannel ",(0,r.kt)("i",null,"(MessageBus | MessageQueue)")),": A message bus or queue to forward events to")),(0,r.kt)("p",{parentName:"blockquote"},(0,r.kt)("strong",{parentName:"p"},"Properties:")),(0,r.kt)("p",{parentName:"blockquote"},"A ",(0,r.kt)("inlineCode",{parentName:"p"},"ConnectedEventStore")," will implement the interface of its original ",(0,r.kt)("inlineCode",{parentName:"p"},"EventStore"),", and extend it with two additional properties:"),(0,r.kt)("ul",{parentName:"blockquote"},(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"eventStore ",(0,r.kt)("i",null,"(EventStore)")),": The original event store")),(0,r.kt)("pre",{parentName:"blockquote"},(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"const eventStore = connectedPokemonsEventStore.eventStore;\n// => pokemonsEventStore\n")),(0,r.kt)("ul",{parentName:"blockquote"},(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"messageChannel ",(0,r.kt)("i",null,"(MessageBus | MessageQueue)")),": The provided message bus or queue")),(0,r.kt)("pre",{parentName:"blockquote"},(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"const messageChannel = connectedPokemonsEventStore.messageChannel;\n// => appMessageBus\n")),(0,r.kt)("p",{parentName:"blockquote"},"Note that the ",(0,r.kt)("inlineCode",{parentName:"p"},"storageAdapter")," property will act as a pointer toward the original event store ",(0,r.kt)("inlineCode",{parentName:"p"},"storageAdapter"),":"),(0,r.kt)("pre",{parentName:"blockquote"},(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"originalEventStore.storageAdapter = myStorageAdapter;\nconnectedEventStore.storageAdapter; // => myStorageAdapter\n\nconnectedEventStore.storageAdapter = anotherStorageAdapter;\noriginalEventStore.storageAdapter; // => anotherStorageAdapter\n")))))}d.isMDXComponent=!0},35318:(e,t,n)=>{n.d(t,{Zo:()=>l,kt:()=>g});var o=n(27378);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,o)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function i(e,t){if(null==e)return{};var n,o,r=function(e,t){if(null==e)return{};var n,o,r={},a=Object.keys(e);for(o=0;o<a.length;o++)n=a[o],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(o=0;o<a.length;o++)n=a[o],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var c=o.createContext({}),p=function(e){var t=o.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):s(s({},t),e)),n},l=function(e){var t=p(e.components);return o.createElement(c.Provider,{value:t},e.children)},u="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return o.createElement(o.Fragment,{},t)}},m=o.forwardRef((function(e,t){var n=e.components,r=e.mdxType,a=e.originalType,c=e.parentName,l=i(e,["components","mdxType","originalType","parentName"]),u=p(n),m=r,g=u["".concat(c,".").concat(m)]||u[m]||d[m]||a;return n?o.createElement(g,s(s({ref:t},l),{},{components:n})):o.createElement(g,s({ref:t},l))}));function g(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var a=n.length,s=new Array(a);s[0]=m;var i={};for(var c in t)hasOwnProperty.call(t,c)&&(i[c]=t[c]);i.originalType=e,i[u]="string"==typeof e?e:r,s[1]=i;for(var p=2;p<a;p++)s[p]=n[p];return o.createElement.apply(null,s)}return o.createElement.apply(null,n)}m.displayName="MDXCreateElement"},43434:(e,t,n)=>{n.d(t,{Z:()=>o});const o=n.p+"assets/images/connectedEventStore-20889dd0f1a0c6bba3a413e188761d0e.png"}}]);