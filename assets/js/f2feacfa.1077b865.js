"use strict";(self.webpackChunk_castore_docs=self.webpackChunk_castore_docs||[]).push([[455],{5986:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>p,contentTitle:()=>o,default:()=>d,frontMatter:()=>s,metadata:()=>i,toc:()=>l});var n=a(52685),r=(a(27378),a(35318));const s={sidebar_position:5},o="Packages",i={unversionedId:"packages",id:"packages",title:"Packages",description:"\ud83c\udfaf Test Tools",source:"@site/docs/5-packages.md",sourceDirName:".",slug:"/packages",permalink:"/castore/docs/packages",draft:!1,tags:[],version:"current",sidebarPosition:5,frontMatter:{sidebar_position:5},sidebar:"tutorialSidebar",previous:{title:"\ud83d\udcd6 Read Models",permalink:"/castore/docs/reacting-to-events/read-models"}},p={},l=[{value:"\ud83c\udfaf Test Tools",id:"-test-tools",level:2},{value:"\ud83c\udf0a Dam",id:"-dam",level:2},{value:"\ud83c\udf08 React Visualizer",id:"-react-visualizer",level:2},{value:"\ud83d\udcc5 Event Types",id:"-event-types",level:2},{value:"\ud83d\udcbe Event Storage Adapters",id:"-event-storage-adapters",level:2},{value:"\ud83c\udfcb\ufe0f\u200d\u2642\ufe0f Commands",id:"\ufe0f\ufe0f-commands",level:2},{value:"\ud83d\udce8 Message Queue Adapters",id:"-message-queue-adapters",level:2},{value:"\ud83d\ude8c Message Buses Adapters",id:"-message-buses-adapters",level:2}],m={toc:l},c="wrapper";function d(e){let{components:t,...a}=e;return(0,r.kt)(c,(0,n.Z)({},m,a,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"packages"},"Packages"),(0,r.kt)("h2",{id:"-test-tools"},"\ud83c\udfaf Test Tools"),(0,r.kt)("p",null,"The official ",(0,r.kt)("a",{parentName:"p",href:"https://www.npmjs.com/package/@castore/test-tools"},"test tools package")," facilitates the writing of unit tests: It allows mocking event stores, populating them with an initial state and resetting them to it in a boilerplate-free and type-safe way:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"import { mockEventStore } from '@castore/test-tools';\n\ndescribe('My awesome test', () => {\n  const mockedPokemonsEventStore = mockEventStore(pokemonsEventStore, [\n    // \ud83d\udc47 Provide initial state (list of event details) in a type-safe way\n    {\n      aggregateId: 'pikachu1',\n      version: 1,\n      type: 'POKEMON_APPEARED',\n      // ...\n    },\n  ]);\n\n  beforeEach(() => {\n    // \ud83d\udc47 Reset to initial state\n    mockedPokemonsEventStore.reset();\n  });\n});\n")),(0,r.kt)("h2",{id:"-dam"},"\ud83c\udf0a Dam"),(0,r.kt)("p",null,(0,r.kt)("a",{parentName:"p",href:"https://www.npmjs.com/package/@castore/dam"},"Dam")," is a suite of utils that facilitates data migration and maintenance operations with Castore (for instance, dispatching all the events of an event store - ordered by their timestamps - to a message queue):"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"import { pourEventStoreEvents } from '@castore/dam';\n\nconst maintenanceMessageQueue = new NotificationMessageQueue({\n  sourceEventStores: [pokemonEventStore],\n  ...\n});\n\nawait pourEventStoreEvents({\n  eventStore: pokemonEventStore,\n  messageChannel: maintenanceMessageQueue,\n  // \ud83d\udc47 Optional `timestamp` filters\n  filters: {\n    from: '2020-01-01T00:00:00.000Z',\n    to: '2023-01-01T00:00:00.000Z',\n  },\n  // \ud83d\udc47 Optional rate limit (messages/second)\n  rateLimit: 100,\n});\n")),(0,r.kt)("h2",{id:"-react-visualizer"},"\ud83c\udf08 React Visualizer"),(0,r.kt)("p",null,"The ",(0,r.kt)("a",{parentName:"p",href:"https://www.npmjs.com/package/@castore/react-visualizer"},"React Visualizer")," package exposes a React component to visualize, design and manually test Castore event stores and commands."),(0,r.kt)("p",null,"Here is a ",(0,r.kt)("a",{parentName:"p",href:"https://castore-dev.github.io/castore/visualizer/"},"hosted example"),", based on this documentation code snippets about pokemons and trainers. You can find the related source code (commands & event stores) in the ",(0,r.kt)("a",{parentName:"p",href:"https://github.com/castore-dev/castore/tree/main/demo/blueprint/src"},"demo package"),"."),(0,r.kt)("h2",{id:"-event-types"},"\ud83d\udcc5 Event Types"),(0,r.kt)("p",null,"To add run-time validation to your event types:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"https://www.npmjs.com/package/@castore/json-schema-event"},"JSON Schema Event Type"),": DRY ",(0,r.kt)("inlineCode",{parentName:"li"},"EventType")," definition using ",(0,r.kt)("a",{parentName:"li",href:"http://json-schema.org/understanding-json-schema/reference/index.html"},"JSON Schemas")," and ",(0,r.kt)("a",{parentName:"li",href:"https://github.com/ThomasAribart/json-schema-to-ts"},(0,r.kt)("inlineCode",{parentName:"a"},"json-schema-to-ts"))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"https://www.npmjs.com/package/@castore/zod-event"},"Zod Event Type"),": DRY ",(0,r.kt)("inlineCode",{parentName:"li"},"EventType")," definition using ",(0,r.kt)("a",{parentName:"li",href:"https://github.com/colinhacks/zod"},(0,r.kt)("inlineCode",{parentName:"a"},"zod")))),(0,r.kt)("h2",{id:"-event-storage-adapters"},"\ud83d\udcbe Event Storage Adapters"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"https://www.npmjs.com/package/@castore/dynamodb-event-storage-adapter"},"DynamoDB Event Storage Adapter"),": Implementation of the ",(0,r.kt)("inlineCode",{parentName:"li"},"EventStorageAdapter")," interface based on DynamoDB."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"https://www.npmjs.com/package/@castore/redux-event-storage-adapter"},"Redux Event Storage Adapter"),": Implementation of the ",(0,r.kt)("inlineCode",{parentName:"li"},"EventStorageAdapter")," interface based on a Redux store, along with tooling to configure the store and hooks to read from it efficiently."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"https://www.npmjs.com/package/@castore/inmemory-event-storage-adapter"},"In-Memory Event Storage Adapter"),": Implementation of the ",(0,r.kt)("inlineCode",{parentName:"li"},"EventStorageAdapter")," interface using a local Node/JS object. To be used in manual or unit tests.")),(0,r.kt)("h2",{id:"\ufe0f\ufe0f-commands"},"\ud83c\udfcb\ufe0f\u200d\u2642\ufe0f Commands"),(0,r.kt)("p",null,"To add run-time validation to your commands:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"https://www.npmjs.com/package/@castore/json-schema-command"},"JSON Schema Command"),": DRY ",(0,r.kt)("inlineCode",{parentName:"li"},"Command")," definition using ",(0,r.kt)("a",{parentName:"li",href:"http://json-schema.org/understanding-json-schema/reference/index.html"},"JSON Schemas")," and ",(0,r.kt)("a",{parentName:"li",href:"https://github.com/ThomasAribart/json-schema-to-ts"},(0,r.kt)("inlineCode",{parentName:"a"},"json-schema-to-ts")))),(0,r.kt)("h2",{id:"-message-queue-adapters"},"\ud83d\udce8 Message Queue Adapters"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"https://www.npmjs.com/package/@castore/sqs-message-queue-adapter"},"SQS Message Queue Adapter"),": Implementation of the ",(0,r.kt)("inlineCode",{parentName:"li"},"MessageQueueAdapter")," interface based on AWS SQS."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"https://www.npmjs.com/package/@castore/in-memory-message-queue-adapter"},"In-Memory Message Queue Adapter"),": Implementation of the ",(0,r.kt)("inlineCode",{parentName:"li"},"MessageQueueAdapter")," interface using a local Node/JS queue. To be used in manual or unit tests.")),(0,r.kt)("h2",{id:"-message-buses-adapters"},"\ud83d\ude8c Message Buses Adapters"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"https://www.npmjs.com/package/@castore/event-bridge-message-bus-adapter"},"EventBridge Message Bus Adapter"),": Implementation of the ",(0,r.kt)("inlineCode",{parentName:"li"},"MessageBusAdapter")," interface based on AWS EventBridge."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"https://www.npmjs.com/package/@castore/event-bridge-s3-message-bus-adapter/README.md"},"EventBridge + S3 Message Bus Adapter"),": Implementation of the ",(0,r.kt)("inlineCode",{parentName:"li"},"MessageBusAdapter")," interface based on AWS EventBridge and S3."),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"https://www.npmjs.com/package/@castore/in-memory-message-bus-adapter"},"In-Memory Message Bus Adapter"),": Implementation of the ",(0,r.kt)("inlineCode",{parentName:"li"},"MessageBusAdapter")," interface using a local Node/JS event emitter. To be used in manual or unit tests.")))}d.isMDXComponent=!0},35318:(e,t,a)=>{a.d(t,{Zo:()=>m,kt:()=>g});var n=a(27378);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function s(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function o(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?s(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):s(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function i(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},s=Object.keys(e);for(n=0;n<s.length;n++)a=s[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(n=0;n<s.length;n++)a=s[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var p=n.createContext({}),l=function(e){var t=n.useContext(p),a=t;return e&&(a="function"==typeof e?e(t):o(o({},t),e)),a},m=function(e){var t=l(e.components);return n.createElement(p.Provider,{value:t},e.children)},c="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},u=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,s=e.originalType,p=e.parentName,m=i(e,["components","mdxType","originalType","parentName"]),c=l(a),u=r,g=c["".concat(p,".").concat(u)]||c[u]||d[u]||s;return a?n.createElement(g,o(o({ref:t},m),{},{components:a})):n.createElement(g,o({ref:t},m))}));function g(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var s=a.length,o=new Array(s);o[0]=u;var i={};for(var p in t)hasOwnProperty.call(t,p)&&(i[p]=t[p]);i.originalType=e,i[c]="string"==typeof e?e:r,o[1]=i;for(var l=2;l<s;l++)o[l]=a[l];return n.createElement.apply(null,o)}return n.createElement.apply(null,a)}u.displayName="MDXCreateElement"}}]);