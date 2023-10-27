"use strict";(self.webpackChunk_castore_docs=self.webpackChunk_castore_docs||[]).push([[367],{50900:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>i,default:()=>g,frontMatter:()=>o,metadata:()=>p,toc:()=>l});var a=n(52685),r=(n(27378),n(35318));const o={sidebar_position:1},i="From v1 to v2",p={unversionedId:"migration-guides/v1-to-v2",id:"migration-guides/v1-to-v2",title:"From v1 to v2",description:"This pages summarizes the breaking changes from the v1 to the v2:",source:"@site/docs/5-migration-guides/1-v1-to-v2.md",sourceDirName:"5-migration-guides",slug:"/migration-guides/v1-to-v2",permalink:"/castore/docs/migration-guides/v1-to-v2",draft:!1,tags:[],version:"current",sidebarPosition:1,frontMatter:{sidebar_position:1},sidebar:"tutorialSidebar",previous:{title:"Packages",permalink:"/castore/docs/packages"}},s={},l=[{value:"<code>@castore/core</code>",id:"castorecore",level:2},{value:"Renamings",id:"renamings",level:3},{value:"<code>listAggregateIds</code>",id:"listaggregateids",level:3},{value:"<code>pushEventGroup</code>",id:"pusheventgroup",level:3},{value:"Packages",id:"packages",level:2},{value:"DynamoDBEventStorageAdapter",id:"dynamodbeventstorageadapter",level:3}],m={toc:l},d="wrapper";function g(e){let{components:t,...n}=e;return(0,r.kt)(d,(0,a.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"from-v1-to-v2"},"From v1 to v2"),(0,r.kt)("p",null,"This pages summarizes the breaking changes from the ",(0,r.kt)("strong",{parentName:"p"},"v1")," to the ",(0,r.kt)("strong",{parentName:"p"},"v2"),":"),(0,r.kt)("h2",{id:"castorecore"},(0,r.kt)("inlineCode",{parentName:"h2"},"@castore/core")),(0,r.kt)("h3",{id:"renamings"},"Renamings"),(0,r.kt)("p",null,"The ",(0,r.kt)("inlineCode",{parentName:"p"},"EventStore")," class ",(0,r.kt)("inlineCode",{parentName:"p"},"eventStoreEvents"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"reduce")," and ",(0,r.kt)("inlineCode",{parentName:"p"},"storageAdapter")," properties have respectively been renamed ",(0,r.kt)("inlineCode",{parentName:"p"},"eventTypes"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"reducer")," and ",(0,r.kt)("inlineCode",{parentName:"p"},"eventStorageAdapter")," for more consistency and clarity (including in the constructor). The ",(0,r.kt)("inlineCode",{parentName:"p"},"getStorageAdapter")," method has also been renamed ",(0,r.kt)("inlineCode",{parentName:"p"},"getEventStorageAdapter"),"."),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"const pokemonsEventStore = new EventStore({\n  eventStoreId: 'POKEMONS',\n  eventTypes: [\n    pokemonAppearedEventType,\n    pokemonCaughtEventType,\n    pokemonLeveledUpEventType,\n    ...\n  ],\n  reducer: pokemonsReducer,\n  eventStorageAdapter: mySuperEventStorageAdapter,\n});\n")),(0,r.kt)("p",null,"Similarly, the ",(0,r.kt)("inlineCode",{parentName:"p"},"StorageAdapter")," interface has been renamed to ",(0,r.kt)("inlineCode",{parentName:"p"},"EventStorageAdapter"),", and the ",(0,r.kt)("inlineCode",{parentName:"p"},"UndefinedStorageAdapterError")," class has been renamed to ",(0,r.kt)("inlineCode",{parentName:"p"},"UndefinedEventStorageAdapterError"),"."),(0,r.kt)("p",null,"Finally, the ",(0,r.kt)("inlineCode",{parentName:"p"},"EventStoreEventsDetails"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"EventTypesDetails")," and ",(0,r.kt)("inlineCode",{parentName:"p"},"EventStoreEventsTypes")," utility types have respectively been corrected to ",(0,r.kt)("inlineCode",{parentName:"p"},"EventStoreEventDetails"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"EventTypeDetails")," and ",(0,r.kt)("inlineCode",{parentName:"p"},"EventStoreEventTypes")),(0,r.kt)("h3",{id:"listaggregateids"},(0,r.kt)("inlineCode",{parentName:"h3"},"listAggregateIds")),(0,r.kt)("p",null,"The ",(0,r.kt)("inlineCode",{parentName:"p"},"listAggregateIds")," method now returns an array of objects (instead of an array of strings) containing both the ",(0,r.kt)("inlineCode",{parentName:"p"},"aggregateId")," and its ",(0,r.kt)("inlineCode",{parentName:"p"},"initialEventTimestamp"),'. This is useful to return more metadata about first/last processed aggregates when "pouring" data with ',(0,r.kt)("inlineCode",{parentName:"p"},"dam"),":"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"const { aggregateIds } = await pokemonsEventStore.listAggregateIds();\n\nfor (const { aggregateId, initialEventTimestamp } of aggregateIds) {\n  // ...do something with aggregateId/initialEventTimestamp\n}\n")),(0,r.kt)("p",null,"The ",(0,r.kt)("inlineCode",{parentName:"p"},"AggregateExistsMessage")," now also contains the ",(0,r.kt)("inlineCode",{parentName:"p"},"initialEventTimestamp")," property:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"await myAggregateExistsMessageQueue.publishMessage({\n  eventStoreId: 'POKEMONS',\n  aggregateId: 'pikachu1',\n  initialEventTimestamp: '2020-01-01T00:00:00.000Z',\n});\n")),(0,r.kt)("h3",{id:"pusheventgroup"},(0,r.kt)("inlineCode",{parentName:"h3"},"pushEventGroup")),(0,r.kt)("p",null,"The ",(0,r.kt)("inlineCode",{parentName:"p"}," EventStore")," static ",(0,r.kt)("inlineCode",{parentName:"p"},"pushEventGroup")," method now accepts options as a first argument:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"await EventStore.pushEventGroup(\n  // You can now pass options as a first argument\n  { force: true },\n  pokemonsEventStore.groupEvent({\n    ...\n  }),\n  ...\n);\n\nawait EventStore.pushEventGroup(\n  // ...but direclty using events still work\n  pokemonsEventStore.groupEvent({\n    ...\n  }),\n  trainersEventStore.groupEvent({\n    ...\n  }),\n);\n")),(0,r.kt)("p",null,"This is not a breaking change on the ",(0,r.kt)("inlineCode",{parentName:"p"},"EventStore")," interface. However, any implementation of the ",(0,r.kt)("inlineCode",{parentName:"p"},"EventStorageAdapter")," interface ",(0,r.kt)("strong",{parentName:"p"},"MUST")," now accept an option object as a first argument."),(0,r.kt)("p",null,"The ",(0,r.kt)("inlineCode",{parentName:"p"},"EventStorageAdapter")," interface has also been stripped of its legacy (or rather previous work-in-progress) ",(0,r.kt)("inlineCode",{parentName:"p"},"putSnapshot"),", ",(0,r.kt)("inlineCode",{parentName:"p"},"getLastSnapshot")," and ",(0,r.kt)("inlineCode",{parentName:"p"},"listSnapshots")," methods."),(0,r.kt)("h2",{id:"packages"},"Packages"),(0,r.kt)("p",null,"All packages have been renamed to allow for a clearer folder structure inside the repository, as well as simpler enforcing of import rules (e.g. preventing imports from ",(0,r.kt)("inlineCode",{parentName:"p"},"@castore/core")," to ",(0,r.kt)("inlineCode",{parentName:"p"},"@castore/lib-foobar"),")."),(0,r.kt)("p",null,"The new package name rules are the following:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"@castore/core")," stays the same \ud83d\ude05"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"Event type extensions"),": ",(0,r.kt)("inlineCode",{parentName:"li"},"event-type-<VALIDATOR>")," ",(0,r.kt)("em",{parentName:"li"},"(e.g. ",(0,r.kt)("inlineCode",{parentName:"em"},"event-type-zod"),")")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"Command extensions"),": ",(0,r.kt)("inlineCode",{parentName:"li"},"command-<VALIDATOR>")," ",(0,r.kt)("em",{parentName:"li"},"(e.g. ",(0,r.kt)("inlineCode",{parentName:"em"},"command-zod"),")")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"Event storage adapters"),": ",(0,r.kt)("inlineCode",{parentName:"li"},"event-storage-adapter-<SOLUTION>")," ",(0,r.kt)("em",{parentName:"li"},"(e.g. ",(0,r.kt)("inlineCode",{parentName:"em"},"event-storage-adapter-dynamodb"),")")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"Message bus adapters"),": ",(0,r.kt)("inlineCode",{parentName:"li"},"message-bus-adapter-<SOLUTION>")," ",(0,r.kt)("em",{parentName:"li"},"(e.g. ",(0,r.kt)("inlineCode",{parentName:"em"},"message-bus-adapter-event-bridge"),")")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"Message queue adapters"),": ",(0,r.kt)("inlineCode",{parentName:"li"},"message-queue-adapter-<SOLUTION>")," ",(0,r.kt)("em",{parentName:"li"},"(e.g. ",(0,r.kt)("inlineCode",{parentName:"em"},"message-queue-adapter-sqs"),")")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("strong",{parentName:"li"},"Utility libraries"),": ",(0,r.kt)("inlineCode",{parentName:"li"},"lib-<LIBRARY_NAME>")," ",(0,r.kt)("em",{parentName:"li"},"(e.g. ",(0,r.kt)("inlineCode",{parentName:"em"},"lib-dam"),")"))),(0,r.kt)("p",null,"Check out the ",(0,r.kt)("a",{parentName:"p",href:"/castore/docs/packages"},"packages page")," to find your new adapter package name."),(0,r.kt)("h3",{id:"dynamodbeventstorageadapter"},"DynamoDBEventStorageAdapter"),(0,r.kt)("p",null,"The ",(0,r.kt)("inlineCode",{parentName:"p"},"DynamoDbEventStorageAdapter")," of the ",(0,r.kt)("inlineCode",{parentName:"p"},"event-storage-adapter-dynamodb"),"package has been deprecated and renamed ",(0,r.kt)("inlineCode",{parentName:"p"},"LegacyDynamoDBEventStorageAdapter"),", in favor of the ",(0,r.kt)("inlineCode",{parentName:"p"},"DynamoDBSingleTableEventStorageAdapter"),". It will be removed in the ",(0,r.kt)("inlineCode",{parentName:"p"},"v3"),"."),(0,r.kt)("p",null,"You can migrate your current data by:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"/castore/docs/reacting-to-events/messages"},"Reacting to your current db events")," to forward them to the new db"),(0,r.kt)("li",{parentName:"ul"},'"Pouring" your previous events with ',(0,r.kt)("inlineCode",{parentName:"li"},"lib-dam")," from one event store to another with the new adapter:")),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"import { EventStore } from '@castore/core';\nimport {\n  LegacyDynamoDBEventStorageAdapter,\n  DynamoDBSingleTableEventStorageAdapter,\n} from '@castore/event-storage-adapter-dynamodb';\nimport { pourEventStoreEvents } from '@castore/lib-dam';\nimport { InMemoryMessageQueueAdapter } from '@castore/message-queue-adapter-in-memory';\n\nconst eventStoreA = new EventStore({\n  ...\n  eventStorageAdpater: new LegacyDynamoDBEventStorageAdapter(...),\n});\n\n// \ud83d\udc47 Same definition\nconst eventStoreB = new EventStore({\n  ...\n  eventStorageAdater: new DynamoDBSingleTableEventStorageAdapter(...),\n});\n// You can also use the same one and override the adapter\n// ...but ONLY IF read & write execution contexts are different\n\n// \ud83d\udc47 Example with an InMemoryMessageQueueAdapter:\nconst migrationMessageQueue = new NotificationMessageQueue({\n  sourceEventStores: [eventStoreA],\n});\n\nInMemoryMessageQueueAdapter.attachTo(migrationMessageQueue, {\n  worker: async (message, context) => {\n    const { event } = message;\n    const { replay } = context\n    // \ud83d\udc47 Forward event in eventStoreB\n    await eventStoreB.pushEvent(event, { force: true, replay });\n  },\n});\n\n// \ud83d\udc47 Pour eventStoreA events\nawait pourEventStoreEvents({\n  eventStore: eventStoreA,\n  messageChannel: migrationMessageQueue,\n  rateLimit: 100,\n});\n")))}g.isMDXComponent=!0},35318:(e,t,n)=>{n.d(t,{Zo:()=>m,kt:()=>u});var a=n(27378);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function p(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},o=Object.keys(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var s=a.createContext({}),l=function(e){var t=a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},m=function(e){var t=l(e.components);return a.createElement(s.Provider,{value:t},e.children)},d="mdxType",g={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},c=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,s=e.parentName,m=p(e,["components","mdxType","originalType","parentName"]),d=l(n),c=r,u=d["".concat(s,".").concat(c)]||d[c]||g[c]||o;return n?a.createElement(u,i(i({ref:t},m),{},{components:n})):a.createElement(u,i({ref:t},m))}));function u(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,i=new Array(o);i[0]=c;var p={};for(var s in t)hasOwnProperty.call(t,s)&&(p[s]=t[s]);p.originalType=e,p[d]="string"==typeof e?e:r,i[1]=p;for(var l=2;l<o;l++)i[l]=n[l];return a.createElement.apply(null,i)}return a.createElement.apply(null,n)}c.displayName="MDXCreateElement"}}]);