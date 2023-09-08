"use strict";(self.webpackChunk_castore_docs=self.webpackChunk_castore_docs||[]).push([[164],{53838:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>g,contentTitle:()=>o,default:()=>u,frontMatter:()=>s,metadata:()=>i,toc:()=>c});var r=n(52685),a=(n(27378),n(35318));const s={sidebar_position:1},o="\u2709\ufe0f Messages",i={unversionedId:"reacting-to-events/messages",id:"reacting-to-events/messages",title:"\u2709\ufe0f Messages",description:"Event Sourcing integrates very well with event-driven architectures. In a traditional architecture, you would need to design your system events (or messages for clarity) separately from your data. With Event Sourcing, they can simply broadcast the business events you already designed.",source:"@site/docs/4-reacting-to-events/1-messages.md",sourceDirName:"4-reacting-to-events",slug:"/reacting-to-events/messages",permalink:"/castore/docs/reacting-to-events/messages",draft:!1,tags:[],version:"current",sidebarPosition:1,frontMatter:{sidebar_position:1},sidebar:"tutorialSidebar",previous:{title:"\ud83d\udd17 Joining data",permalink:"/castore/docs/event-sourcing/joining-data"},next:{title:"\ud83d\udce8 Message Queues",permalink:"/castore/docs/reacting-to-events/message-queues"}},g={},c=[],l={toc:c},p="wrapper";function u(e){let{components:t,...s}=e;return(0,a.kt)(p,(0,r.Z)({},l,s,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"\ufe0f-messages"},"\u2709\ufe0f Messages"),(0,a.kt)("p",null,"Event Sourcing integrates very well with ",(0,a.kt)("a",{parentName:"p",href:"https://en.wikipedia.org/wiki/Event-driven_architecture"},"event-driven architectures"),". In a traditional architecture, you would need to design your system events (or ",(0,a.kt)("strong",{parentName:"p"},"messages")," for clarity) separately from your data. With Event Sourcing, they can simply ",(0,a.kt)("strong",{parentName:"p"},"broadcast the business events you already designed"),"."),(0,a.kt)("p",null,"In Castore, we distinguish three types of message:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},"AggregateExists messages")," which only carry aggregate ids (mainly for maintenance purposes)"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},"Notification messages")," which also carry event details"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("strong",{parentName:"li"},"State-carrying messages")," which also carry their corresponding aggregates")),(0,a.kt)("p",null,(0,a.kt)("img",{alt:"Messages Types",src:n(80454).Z,width:"1133",height:"488"})),(0,a.kt)("p",null,"In Castore, they are implemented by the ",(0,a.kt)("inlineCode",{parentName:"p"},"AggregateExistsMessage"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"NotificationMessage")," and ",(0,a.kt)("inlineCode",{parentName:"p"},"StateCarryingMessage")," TS types:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-ts"},"// AggregateExistsMessage\nimport type {\n  AggregateExistsMessage,\n  EventStoreAggregateExistsMessage,\n} from '@castore/core';\n\ntype PokemonAggregateExistsMessage = AggregateExistsMessage<'POKEMONS'>;\n\n// \ud83d\udc47 Equivalent to:\ntype PokemonAggregateExistsMessage = {\n  eventStoreId: 'POKEMONS';\n  aggregateId: string;\n};\n\n// // \ud83d\udc47 Also equivalent to:\ntype PokemonAggregateExistsMessage = EventStoreAggregateExistsMessage<\n  typeof pokemonsEventStore\n>;\n")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-ts"},"// NotificationMessage\nimport type {\n  NotificationMessage,\n  EventStoreNotificationMessage,\n} from '@castore/core';\n\ntype PokemonEventNotificationMessage = NotificationMessage<\n  'POKEMONS',\n  PokemonEventDetails\n>;\n\n// \ud83d\udc47 Equivalent to:\ntype PokemonEventNotificationMessage = {\n  eventStoreId: 'POKEMONS';\n  event: PokemonEventDetails;\n};\n\n// \ud83d\udc47 Also equivalent to:\ntype PokemonEventNotificationMessage = EventStoreNotificationMessage<\n  typeof pokemonsEventStore\n>;\n")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-ts"},"// StateCarryingMessage\nimport type {\n  StateCarryingMessage,\n  EventStoreStateCarryingMessage,\n} from '@castore/core';\n\ntype PokemonEventStateCarryingMessage = StateCarryingMessage<\n  'POKEMONS',\n  PokemonEventDetails,\n  PokemonAggregate\n>;\n\n// \ud83d\udc47 Equivalent to:\ntype PokemonEventStateCarryingMessage = {\n  eventStoreId: 'POKEMONS';\n  event: PokemonEventDetails;\n  aggregate: PokemonAggregate\n};\n\n// \ud83d\udc47 Also equivalent to:\ntype PokemonEventStateCarryingMessage = EventStoreStateCarryingMessage<\n  typeof pokemonsEventStore\n>;\n")),(0,a.kt)("p",null,"All types of message can be published through message channels, i.e. ",(0,a.kt)("a",{parentName:"p",href:"#messagequeue"},"Message Queues")," or ",(0,a.kt)("a",{parentName:"p",href:"#messagebus"},"Message Buses"),"."))}u.isMDXComponent=!0},35318:(e,t,n)=>{n.d(t,{Zo:()=>l,kt:()=>y});var r=n(27378);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function s(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?s(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):s(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function i(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},s=Object.keys(e);for(r=0;r<s.length;r++)n=s[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(r=0;r<s.length;r++)n=s[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var g=r.createContext({}),c=function(e){var t=r.useContext(g),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},l=function(e){var t=c(e.components);return r.createElement(g.Provider,{value:t},e.children)},p="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},m=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,s=e.originalType,g=e.parentName,l=i(e,["components","mdxType","originalType","parentName"]),p=c(n),m=a,y=p["".concat(g,".").concat(m)]||p[m]||u[m]||s;return n?r.createElement(y,o(o({ref:t},l),{},{components:n})):r.createElement(y,o({ref:t},l))}));function y(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var s=n.length,o=new Array(s);o[0]=m;var i={};for(var g in t)hasOwnProperty.call(t,g)&&(i[g]=t[g]);i.originalType=e,i[p]="string"==typeof e?e:a,o[1]=i;for(var c=2;c<s;c++)o[c]=n[c];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},80454:(e,t,n)=>{n.d(t,{Z:()=>r});const r=n.p+"assets/images/messageTypes-b6a28db0c33e166141c5f5d4fd936b60.png"}}]);