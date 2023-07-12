"use strict";(self.webpackChunk_castore_docs_docusaurus=self.webpackChunk_castore_docs_docusaurus||[]).push([[598],{17836:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>u,contentTitle:()=>s,default:()=>l,frontMatter:()=>o,metadata:()=>i,toc:()=>d});var n=r(28427),a=(r(2784),r(30876));const o={sidebar_position:6},s="Redux Event Storage Adapter",i={unversionedId:"resources/redux-event-storage-adapter",id:"resources/redux-event-storage-adapter",title:"Redux Event Storage Adapter",description:"DRY Castore EventStorageAdapter implementation using a Redux store.",source:"@site/docs/5-resources/6-redux-event-storage-adapter.md",sourceDirName:"5-resources",slug:"/resources/redux-event-storage-adapter",permalink:"/castore/docs/resources/redux-event-storage-adapter",draft:!1,editUrl:"https://github.com/castor-dev/docusaurus/tree/main/packages/create-docusaurus/templates/shared/docs/5-resources/6-redux-event-storage-adapter.md",tags:[],version:"current",sidebarPosition:6,frontMatter:{sidebar_position:6},sidebar:"tutorialSidebar",previous:{title:"DynamoDB Event Storage Adapter",permalink:"/castore/docs/resources/dynamodb-event-storage-adapter"},next:{title:"In Memory Event Storage Adapter",permalink:"/castore/docs/resources/inmemory-event-storage-adapter"}},u={},d=[{value:"\ud83d\udce5 Installation",id:"-installation",level:2},{value:"\ud83d\udc69\u200d\ud83d\udcbb Usage",id:"-usage",level:2},{value:"Direct usage",id:"direct-usage",level:3},{value:"Hooks",id:"hooks",level:3},{value:"Configure with another store",id:"configure-with-another-store",level:3}],p={toc:d},c="wrapper";function l(e){let{components:t,...r}=e;return(0,a.kt)(c,(0,n.Z)({},p,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"redux-event-storage-adapter"},"Redux Event Storage Adapter"),(0,a.kt)("p",null,"DRY Castore ",(0,a.kt)("a",{parentName:"p",href:"https://castore-dev.github.io/castore/docs/the-basics/#eventstorageadapter"},(0,a.kt)("inlineCode",{parentName:"a"},"EventStorageAdapter"))," implementation using a Redux store."),(0,a.kt)("h2",{id:"-installation"},"\ud83d\udce5 Installation"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-bash"},"# npm\nnpm install @castore/redux-event-storage-adapter\n\n# yarn\nyarn add @castore/redux-event-storage-adapter\n")),(0,a.kt)("p",null,"This package has ",(0,a.kt)("inlineCode",{parentName:"p"},"@castore/core"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"@reduxjs/toolkit")," (above v1.9) and ",(0,a.kt)("inlineCode",{parentName:"p"},"react-redux")," (above v8) as peer dependencies, so you will have to install them as well:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-bash"},"# npm\nnpm install @castore/core @reduxjs/toolkit react-redux\n\n# yarn\nyarn add @castore/core @reduxjs/toolkit react-redux\n")),(0,a.kt)("h2",{id:"-usage"},"\ud83d\udc69\u200d\ud83d\udcbb Usage"),(0,a.kt)("h3",{id:"direct-usage"},"Direct usage"),(0,a.kt)("p",null,"If you do not already use Redux in your app, you can simply use the ",(0,a.kt)("inlineCode",{parentName:"p"},"configureCastore")," util:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-tsx"},"import { Provider } from 'react-redux';\n\nimport { configureCastore } from '@castore/redux-event-storage-adapter';\n\nconst store = configureCastore({\n  eventStores: [pokemonsEventStore, trainersEventStore],\n});\n\nconst MyReactApp = () => (\n  <Provider store={store}>\n    <App />\n  </Provider>\n);\n")),(0,a.kt)("p",null,"And that's it \ud83d\ude4c ",(0,a.kt)("inlineCode",{parentName:"p"},"configureCastore")," not only configures the Redux store but also connects it to the event stores by replacing their ",(0,a.kt)("inlineCode",{parentName:"p"},"storageAdapter"),"."),(0,a.kt)("p",null,"You can use the ",(0,a.kt)("inlineCode",{parentName:"p"},"pushEvent")," method as usual:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-tsx"},"const CatchPokemonButton = ({ pokemonId }) => (\n  <Button\n    onClick={async () => {\n      await pokemonsEventStore.pushEvent({\n        aggregateId: pokemonId,\n        type: 'POKEMON_CAUGHT',\n        version: currentPokemonVersion + 1,\n      });\n    }}\n  />\n);\n")),(0,a.kt)("p",null,"You can also use the other methods, but it's simpler to use the following built-in hooks."),(0,a.kt)("h3",{id:"hooks"},"Hooks"),(0,a.kt)("p",null,"You can use the ",(0,a.kt)("inlineCode",{parentName:"p"},"useAggregateEvents"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"useAggregate"),", ",(0,a.kt)("inlineCode",{parentName:"p"},"useExistingAggregate")," and ",(0,a.kt)("inlineCode",{parentName:"p"},"useAggregateIds")," hooks to read data from the store. Their interface is the same as the event store methods, but synchronous."),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-tsx"},"import { useAggregateIds } from '@castore/redux-event-storage-adapter';\n\nconst AggregateIdsList = () => {\n  // \ud83d\ude4c Will synchronously return the store data, as well as hook the component to it\n  const { aggregateIds } = useAggregateIds(pokemonsEventStore, { limit: 20 });\n\n  return aggregateIds.map(aggregateId => (\n    <Aggregate key={aggregateId} aggregateId={aggregateId} />\n  ));\n};\n\nconst Aggregate = ({ aggregateId }) => {\n  const { aggregate } = useExistingAggregate(pokemonsEventStore, aggregateId);\n\n  // \ud83d\ude4c aggregate is correctly typed\n  return <p>{aggregate.name}</p>;\n};\n")),(0,a.kt)("p",null,"Thanks to the magic of Redux, pushing a new event to an aggregate will only trigger re-renders of components hooked to the said aggregate. The same goes when listing aggregate ids: Only creating a new aggregate will trigger a re-render."),(0,a.kt)("h3",{id:"configure-with-another-store"},"Configure with another store"),(0,a.kt)("p",null,"If you already use Redux, you can merge the Castore Redux store with your own."),(0,a.kt)("p",null,'First, know that event stores events are stored as Redux "slices". Their name is their ',(0,a.kt)("inlineCode",{parentName:"p"},"eventStoreId"),", prefixed by a customizable string (",(0,a.kt)("inlineCode",{parentName:"p"},"@castore")," by default)."),(0,a.kt)("p",null,"You can use the ",(0,a.kt)("inlineCode",{parentName:"p"},"getCastoreReducers")," util to generate the Castore Redux reducers, and merge them with your own:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-tsx"},"import { Provider } from 'react-redux';\n\nimport {\n  ReduxEventStorageAdapter,\n  getCastoreReducers,\n} from '@castore/redux-event-storage-adapter';\n\nconst castoreReducers = getCastoreReducers({\n  eventStores: [pokemonsEventStore, trainersEventStore],\n  // \ud83d\udc47 Optional\n  prefix: 'customPrefix',\n});\n\nconst store = configureStore({\n  reducer: {\n    ...castoreReducers,\n    customReducer,\n  },\n});\n\n// \ud83d\udc47 Connect the event stores to the store\neventStores.forEach(eventStore => {\n  eventStore.storageAdapter = new ReduxEventStorageAdapter({\n    store,\n    eventStoreId: eventStore.eventStoreId,\n    // \ud83d\udc47 Don't forget the prefix if one has been provided\n    prefix: 'customPrefix',\n  });\n});\n\nconst MyReactApp = () => (\n  <Provider store={store}>\n    <App />\n  </Provider>\n);\n")))}l.isMDXComponent=!0},30876:(e,t,r)=>{r.d(t,{Zo:()=>p,kt:()=>m});var n=r(2784);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function s(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function i(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var u=n.createContext({}),d=function(e){var t=n.useContext(u),r=t;return e&&(r="function"==typeof e?e(t):s(s({},t),e)),r},p=function(e){var t=d(e.components);return n.createElement(u.Provider,{value:t},e.children)},c="mdxType",l={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},g=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,o=e.originalType,u=e.parentName,p=i(e,["components","mdxType","originalType","parentName"]),c=d(r),g=a,m=c["".concat(u,".").concat(g)]||c[g]||l[g]||o;return r?n.createElement(m,s(s({ref:t},p),{},{components:r})):n.createElement(m,s({ref:t},p))}));function m(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=r.length,s=new Array(o);s[0]=g;var i={};for(var u in t)hasOwnProperty.call(t,u)&&(i[u]=t[u]);i.originalType=e,i[c]="string"==typeof e?e:a,s[1]=i;for(var d=2;d<o;d++)s[d]=r[d];return n.createElement.apply(null,s)}return n.createElement.apply(null,r)}g.displayName="MDXCreateElement"}}]);