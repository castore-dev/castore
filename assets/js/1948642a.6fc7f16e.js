"use strict";(self.webpackChunk_castore_docs=self.webpackChunk_castore_docs||[]).push([[936],{71283:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>i,contentTitle:()=>p,default:()=>m,frontMatter:()=>o,metadata:()=>l,toc:()=>s});var a=n(52685),r=(n(27378),n(35318));const o={sidebar_position:1},p="\ud83d\udcc5 Events",l={unversionedId:"event-sourcing/events",id:"event-sourcing/events",title:"\ud83d\udcc5 Events",description:"Event Sourcing is all about saving changes in your application state. Such changes are represented by events, and needless to say, they are quite important \ud83d\ude43",source:"@site/docs/3-event-sourcing/1-events.md",sourceDirName:"3-event-sourcing",slug:"/event-sourcing/events",permalink:"/castore/docs/event-sourcing/events",draft:!1,tags:[],version:"current",sidebarPosition:1,frontMatter:{sidebar_position:1},sidebar:"tutorialSidebar",previous:{title:"Installation",permalink:"/castore/docs/installation"},next:{title:"\ud83d\udd27 Aggregates / Reducers",permalink:"/castore/docs/event-sourcing/aggregates-reducers"}},i={},s=[],c={toc:s},u="wrapper";function m(e){let{components:t,...o}=e;return(0,r.kt)(u,(0,a.Z)({},c,o,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"-events"},"\ud83d\udcc5 Events"),(0,r.kt)("p",null,"Event Sourcing is all about ",(0,r.kt)("strong",{parentName:"p"},"saving changes in your application state"),". Such changes are represented by ",(0,r.kt)("strong",{parentName:"p"},"events"),", and needless to say, they are quite important \ud83d\ude43"),(0,r.kt)("p",null,"Events that concern the same entity (like a ",(0,r.kt)("inlineCode",{parentName:"p"},"Pokemon"),") are aggregated through a common id called ",(0,r.kt)("inlineCode",{parentName:"p"},"aggregateId")," (and vice versa, events that have the same ",(0,r.kt)("inlineCode",{parentName:"p"},"aggregateId")," represent changes of the same entity). The index of an event in such a serie of events is called its ",(0,r.kt)("inlineCode",{parentName:"p"},"version"),"."),(0,r.kt)("p",null,(0,r.kt)("img",{alt:"Events",src:n(94989).Z,width:"3023",height:"944"})),(0,r.kt)("p",null,"In Castore, stored events (also called ",(0,r.kt)("strong",{parentName:"p"},"event details"),") always have exactly the following properties:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"aggregateId ",(0,r.kt)("i",null,"(string)"))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"version ",(0,r.kt)("i",null,"(integer \u2265 1)"))),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"timestamp ",(0,r.kt)("i",null,"(string)")),": A date in ISO 8601 format"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"type ",(0,r.kt)("i",null,"(string)")),": A string identifying the business meaning of the event"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"payload ",(0,r.kt)("i",null,"(?any = never)")),": A payload of any type"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"metadata ",(0,r.kt)("i",null,"(?any = never)")),": Some metadata of any type")),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"import type { EventDetail } from '@castore/core';\n\ntype PokemonAppearedEventDetail = EventDetail<\n  'POKEMON_APPEARED',\n  { name: string; level: number },\n  { trigger?: 'random' | 'scripted' }\n>;\n\n// \ud83d\udc47 Equivalent to:\ntype PokemonAppearedEventDetail = {\n  aggregateId: string;\n  version: number;\n  timestamp: string;\n  type: 'POKEMON_APPEARED';\n  payload: { name: string; level: number };\n  metadata: { trigger?: 'random' | 'scripted' };\n};\n")),(0,r.kt)("p",null,"Events are generally classified in ",(0,r.kt)("strong",{parentName:"p"},"events types")," (not to confuse with TS types). Castore lets you declare them via the ",(0,r.kt)("inlineCode",{parentName:"p"},"EventType")," class:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"import { EventType } from '@castore/core';\n\nconst pokemonAppearedEventType = new EventType<\n  'POKEMON_APPEARED',\n  { name: string; level: number },\n  { trigger?: 'random' | 'scripted' }\n>({ type: 'POKEMON_APPEARED' });\n")),(0,r.kt)("admonition",{type:"info"},(0,r.kt)("p",{parentName:"admonition"},"Note that we only provided TS types for ",(0,r.kt)("inlineCode",{parentName:"p"},"payload")," and ",(0,r.kt)("inlineCode",{parentName:"p"},"metadata")," properties. That is because, as stated in the ",(0,r.kt)("a",{parentName:"p",href:"/docs/introduction#-core-design"},"core design"),", ",(0,r.kt)("strong",{parentName:"p"},"Castore is meant to be as flexible as possible"),", and that includes the validation library you want to use (if any): The ",(0,r.kt)("inlineCode",{parentName:"p"},"EventType")," class can be used directly if no validation is required, or implemented by ",(0,r.kt)("a",{parentName:"p",href:"/castore/docs/resources"},"other classes")," which will add run-time validation methods to it \ud83d\udc4d")),(0,r.kt)("blockquote",null,(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("b",null,"\ud83d\udd27 Reference")),(0,r.kt)("p",null),(0,r.kt)("p",{parentName:"blockquote"},(0,r.kt)("strong",{parentName:"p"},"Constructor:")),(0,r.kt)("ul",{parentName:"blockquote"},(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"type ",(0,r.kt)("i",null,"(string)")),": The event type")),(0,r.kt)("pre",{parentName:"blockquote"},(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"import { EventType } from '@castore/core';\n\nconst pokemonAppearedEventType = new EventType({ type: 'POKEMON_APPEARED' });\n")),(0,r.kt)("p",{parentName:"blockquote"},(0,r.kt)("strong",{parentName:"p"},"Properties:")),(0,r.kt)("ul",{parentName:"blockquote"},(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"type ",(0,r.kt)("i",null,"(string)")),": The event type")),(0,r.kt)("pre",{parentName:"blockquote"},(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"const eventType = pokemonAppearedEventType.type;\n// => 'POKEMON_APPEARED'\n")),(0,r.kt)("p",{parentName:"blockquote"},(0,r.kt)("strong",{parentName:"p"},"Type Helpers:")),(0,r.kt)("ul",{parentName:"blockquote"},(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"EventTypeDetail"),": Returns the event detail TS type of an ",(0,r.kt)("code",null,"EventType"))),(0,r.kt)("pre",{parentName:"blockquote"},(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"import type { EventTypeDetail } from '@castore/core';\n\ntype PokemonAppearedEventTypeDetail = EventTypeDetail<\n  typeof pokemonAppearedEventType\n>;\n\n// \ud83d\udc47 Equivalent to:\ntype PokemonCaughtEventTypeDetail = {\n  aggregateId: string;\n  version: number;\n  timestamp: string;\n  type: 'POKEMON_APPEARED';\n  payload: { name: string; level: number };\n  metadata: { trigger?: 'random' | 'scripted' };\n};\n")),(0,r.kt)("ul",{parentName:"blockquote"},(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"EventTypesDetails"),": Return the events details of a list of ",(0,r.kt)("code",null,"EventType"))),(0,r.kt)("pre",{parentName:"blockquote"},(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"import type { EventTypesDetails } from '@castore/core';\n\ntype PokemonEventTypeDetails = EventTypesDetails<\n  [typeof pokemonAppearedEventType, typeof pokemonCaughtEventType]\n>;\n// => EventTypeDetail<typeof pokemonAppearedEventType>\n// | EventTypeDetail<typeof pokemonCaughtEventType>\n")))))}m.isMDXComponent=!0},35318:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>y});var a=n(27378);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function p(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},o=Object.keys(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var i=a.createContext({}),s=function(e){var t=a.useContext(i),n=t;return e&&(n="function"==typeof e?e(t):p(p({},t),e)),n},c=function(e){var t=s(e.components);return a.createElement(i.Provider,{value:t},e.children)},u="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},d=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,i=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),u=s(n),d=r,y=u["".concat(i,".").concat(d)]||u[d]||m[d]||o;return n?a.createElement(y,p(p({ref:t},c),{},{components:n})):a.createElement(y,p({ref:t},c))}));function y(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,p=new Array(o);p[0]=d;var l={};for(var i in t)hasOwnProperty.call(t,i)&&(l[i]=t[i]);l.originalType=e,l[u]="string"==typeof e?e:r,p[1]=l;for(var s=2;s<o;s++)p[s]=n[s];return a.createElement.apply(null,p)}return a.createElement.apply(null,n)}d.displayName="MDXCreateElement"},94989:(e,t,n)=>{n.d(t,{Z:()=>a});const a=n.p+"assets/images/events-d741b94c2d155521294b5e634f08b3f0.png"}}]);