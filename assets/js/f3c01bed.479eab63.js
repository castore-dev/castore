"use strict";(self.webpackChunk_castore_docs_docusaurus=self.webpackChunk_castore_docs_docusaurus||[]).push([[777],{32798:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>o,default:()=>c,frontMatter:()=>s,metadata:()=>i,toc:()=>p});var a=n(28427),r=(n(2784),n(30876));const s={sidebar_position:12},o="In Memory Message Bus Adapter",i={unversionedId:"resources/in-memory-message-bus-adapter",id:"resources/in-memory-message-bus-adapter",title:"In Memory Message Bus Adapter",description:"DRY Castore MessageBus definition using Event Emitters.",source:"@site/docs/5-resources/12-in-memory-message-bus-adapter.md",sourceDirName:"5-resources",slug:"/resources/in-memory-message-bus-adapter",permalink:"/castore/docs/resources/in-memory-message-bus-adapter",draft:!1,editUrl:"https://github.com/castor-dev/docusaurus/tree/main/packages/create-docusaurus/templates/shared/docs/5-resources/12-in-memory-message-bus-adapter.md",tags:[],version:"current",sidebarPosition:12,frontMatter:{sidebar_position:12},sidebar:"tutorialSidebar",previous:{title:"EventBridge Message Bus Adapter",permalink:"/castore/docs/resources/event-bridge-message-bus-adapter"}},l={},p=[{value:"\ud83d\udce5 Installation",id:"-installation",level:2},{value:"\ud83d\udc69\u200d\ud83d\udcbb Usage",id:"-usage",level:2},{value:"\ud83d\udc42 Add listeners",id:"-add-listeners",level:2},{value:"\u267b\ufe0f Retry policy",id:"\ufe0f-retry-policy",level:2}],u={toc:p},m="wrapper";function c(e){let{components:t,...n}=e;return(0,r.kt)(m,(0,a.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"in-memory-message-bus-adapter"},"In Memory Message Bus Adapter"),(0,r.kt)("p",null,"DRY Castore ",(0,r.kt)("a",{parentName:"p",href:"https://github.com/castore-dev/castore/#--messagebus"},(0,r.kt)("inlineCode",{parentName:"a"},"MessageBus"))," definition using ",(0,r.kt)("a",{parentName:"p",href:"https://nodejs.org/api/events.html#events"},"Event Emitters"),"."),(0,r.kt)("h2",{id:"-installation"},"\ud83d\udce5 Installation"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"# npm\nnpm install @castore/in-memory-message-bus-adapter\n\n# yarn\nyarn add @castore/in-memory-message-bus-adapter\n")),(0,r.kt)("p",null,"This package has ",(0,r.kt)("inlineCode",{parentName:"p"},"@castore/core")," as peer dependency, so you will have to install it as well:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-bash"},"# npm\nnpm install @castore/core\n\n# yarn\nyarn add @castore/core\n")),(0,r.kt)("h2",{id:"-usage"},"\ud83d\udc69\u200d\ud83d\udcbb Usage"),(0,r.kt)("p",null,"The simplest way to use this adapter is to use the ",(0,r.kt)("inlineCode",{parentName:"p"},"attachTo")," static method:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"// \ud83d\udc47 Note: EventEmitter is a native NodeJS library\n// Outside of NodeJS (like browsers) you can use the event-emitter package\nimport { EventEmitter } from 'events';\n\nimport { InMemoryMessageBusAdapter } from '@castore/in-memory-message-bus-adapter';\n\nconst eventEmitter = new EventEmitter();\n\nconst messageBusAdapter = InMemoryMessageBusAdapter.attachTo(\n  appMessageBus,\n  { eventEmitter }, // <= Constructor arguments\n);\n")),(0,r.kt)("p",null,"This will make your ",(0,r.kt)("inlineCode",{parentName:"p"},"messageBusAdapter")," inherit from your ",(0,r.kt)("inlineCode",{parentName:"p"},"appMessageBus")," types while plugging them together \ud83d\ude4c"),(0,r.kt)("p",null,"You can also instanciate one on its own, but notice the code duplication:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"import type { MessageBusMessage } from '@castore/core';\nimport { InMemoryMessageBusAdapter } from '@castore/in-memory-message-bus-adapter';\n\nconst messageBusAdapter = new InMemoryMessageBusAdapter<\n  MessageBusMessage<typeof appMessageBus>\n>({ eventEmitter });\n\nappMessageBus.messageBusAdapter = messageBusAdapter;\n")),(0,r.kt)("h2",{id:"-add-listeners"},"\ud83d\udc42 Add listeners"),(0,r.kt)("p",null,"Similarly to event emitters, the ",(0,r.kt)("inlineCode",{parentName:"p"},"inMemoryMessageBusAdapter")," exposes an ",(0,r.kt)("inlineCode",{parentName:"p"},"on")," method that takes two arguments:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"A filter patterns to optionally specify an ",(0,r.kt)("inlineCode",{parentName:"li"},"eventStoreId")," and an event ",(0,r.kt)("inlineCode",{parentName:"li"},"type")," to listen to (",(0,r.kt)("inlineCode",{parentName:"li"},"NotificationEventBus")," and ",(0,r.kt)("inlineCode",{parentName:"li"},"StateCarryingEventBus")," only)"),(0,r.kt)("li",{parentName:"ul"},"An async callback to execute if the message matches the filter pattern")),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"// \ud83d\udc47 Listen to all messages\nmessageBusAdapter.on({}, async message => {\n  // \ud83d\ude4c Correctly typed!\n  const { eventStoreId, event } = message;\n});\n\n// \ud83d\udc47 Listen only to pokemons messages\nmessageBusAdapter.on({ eventStoreId: 'POKEMONS' }, async message => {\n  // \ud83d\ude4c Correctly typed!\n  const { eventStoreId, event } = message;\n});\n\n// \ud83d\udc47 Listen only to POKEMON_APPEARED created messages\nmessageBusAdapter.on(\n  { eventStoreId: 'POKEMONS', eventType: 'POKEMON_APPEARED' },\n  async message => {\n    // \ud83d\ude4c Correctly typed!\n    const { eventStoreId, event } = message;\n  },\n);\n")),(0,r.kt)("p",null,"The same callback can be re-used with different filter patterns. If a message matches several of them, it will still be triggered once:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"const logSomething = async () => {\n  console.log('Received message!');\n};\n\nmessageBusAdapter.on({ eventStoreId: 'POKEMONS' }, logSomething);\nmessageBusAdapter.on(\n  { eventStoreId: 'POKEMONS', eventType: 'POKEMON_APPEARED' },\n  logSomething,\n);\n\nawait appMessageBus.publishMessage(pokemonAppearedEvent);\n\n// \ud83d\udc47 Console output (only once):\n// \"Received message!\"\n")),(0,r.kt)("blockquote",null,(0,r.kt)("p",{parentName:"blockquote"},"Listeners cannot be removed for now.")),(0,r.kt)("h2",{id:"\ufe0f-retry-policy"},"\u267b\ufe0f Retry policy"),(0,r.kt)("p",null,"This adapter will retry failed messages handling on a per listener basis. You can specify a different retry policy than the default one via its constructor arguments:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"retryAttempts ",(0,r.kt)("i",null,"(?number = 2)")),": The maximum number of retry attempts for a message in case of listener execution failure. If all the retries fail, the error is logged with `console.error`, and the message ignored."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"retryDelayInMs ",(0,r.kt)("i",null,"(?number = 30000)")),": The minimum delay in milliseconds between a listener execution failure and its first retry."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"retryBackoffRate ",(0,r.kt)("i",null,"(?number = 2)")),": A factor applied to the `retryDelayInMs` at each subsequent retry.")),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"const messageBusAdapter = InMemoryMessageBusAdapter.attachTo(appMessageBus, {\n  eventEmitter,\n  retryAttempts: 3,\n  retryDelayInMs: 10000,\n  retryBackoffRate: 1.5,\n});\n\n// \ud83d\udc47 Alternatively\nconst messageBusAdapter = new InMemoryMessageBusAdapter<\n  MessageBusMessage<typeof appMessageBus>\n>({\n  eventEmitter,\n  retryAttempts: 3,\n  retryDelayInMs: 10000,\n  retryBackoffRate: 1.5,\n});\n")),(0,r.kt)("p",null,"For instance, if a message is listened by two listeners A and B, with listener A continously failing, the sequence of code execution (with the default retry policy) will look like this:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"Listener A execution: \u274c Failure"),(0,r.kt)("li",{parentName:"ul"},"Listener B execution: \u2705 Success"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("em",{parentName:"li"},"30 seconds of delay")),(0,r.kt)("li",{parentName:"ul"},"Listener A execution: \u274c Failure"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("em",{parentName:"li"},"60 seconds of delay (30x2)")),(0,r.kt)("li",{parentName:"ul"},"Listener A execution: \u274c Failure"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("em",{parentName:"li"},"No more retry attempt, error is logged"))))}c.isMDXComponent=!0},30876:(e,t,n)=>{n.d(t,{Zo:()=>u,kt:()=>g});var a=n(2784);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function s(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?s(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):s(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function i(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},s=Object.keys(e);for(a=0;a<s.length;a++)n=s[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(a=0;a<s.length;a++)n=s[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var l=a.createContext({}),p=function(e){var t=a.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},u=function(e){var t=p(e.components);return a.createElement(l.Provider,{value:t},e.children)},m="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},d=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,s=e.originalType,l=e.parentName,u=i(e,["components","mdxType","originalType","parentName"]),m=p(n),d=r,g=m["".concat(l,".").concat(d)]||m[d]||c[d]||s;return n?a.createElement(g,o(o({ref:t},u),{},{components:n})):a.createElement(g,o({ref:t},u))}));function g(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var s=n.length,o=new Array(s);o[0]=d;var i={};for(var l in t)hasOwnProperty.call(t,l)&&(i[l]=t[l]);i.originalType=e,i[m]="string"==typeof e?e:r,o[1]=i;for(var p=2;p<s;p++)o[p]=n[p];return a.createElement.apply(null,o)}return a.createElement.apply(null,n)}d.displayName="MDXCreateElement"}}]);