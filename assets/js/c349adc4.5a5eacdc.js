"use strict";(self.webpackChunk_castore_docs=self.webpackChunk_castore_docs||[]).push([[7614],{64722:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>i,default:()=>p,frontMatter:()=>r,metadata:()=>l,toc:()=>u});var a=n(52685),o=(n(27378),n(35318));const r={},i="\ud83d\udd90 The 5 Rules of Event Sourcing",l={unversionedId:"the-five-rules-of-event-sourcing",id:"the-five-rules-of-event-sourcing",title:"\ud83d\udd90 The 5 Rules of Event Sourcing",description:"1 - Do not use read models to validate your commands",source:"@site/docs/the-five-rules-of-event-sourcing.md",sourceDirName:".",slug:"/the-five-rules-of-event-sourcing",permalink:"/castore/docs/the-five-rules-of-event-sourcing",draft:!1,editUrl:"https://github.com/castor-dev/docusaurus/tree/main/packages/create-docusaurus/templates/shared/docs/the-five-rules-of-event-sourcing.md",tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"Building your own EventStorageAdapter",permalink:"/castore/docs/building-your-own-event-storage-adapter"}},s={},u=[{value:"1 - Do not use read models to validate your commands",id:"1---do-not-use-read-models-to-validate-your-commands",level:2},{value:"2 - Write only at present tense",id:"2---write-only-at-present-tense",level:2},{value:"3 - Do not write several events on the same aggregate in one command",id:"3---do-not-write-several-events-on-the-same-aggregate-in-one-command",level:2},{value:"4 - Write relations on all sides",id:"4---write-relations-on-all-sides",level:2},{value:"5 - Think of re-playability ! In projections, don&#39;t cross the streams",id:"5---think-of-re-playability--in-projections-dont-cross-the-streams",level:2}],d={toc:u},c="wrapper";function p(e){let{components:t,...n}=e;return(0,o.kt)(c,(0,a.Z)({},d,n,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"-the-5-rules-of-event-sourcing"},"\ud83d\udd90 The 5 Rules of Event Sourcing"),(0,o.kt)("h2",{id:"1---do-not-use-read-models-to-validate-your-commands"},"1 - Do not use read models to validate your commands"),(0,o.kt)("p",null,"Read models are only for read, not for write. They are like cache: Thrashable, re-computable. The events are your source of truth: Use them when you want to validate a command input."),(0,o.kt)("h2",{id:"2---write-only-at-present-tense"},"2 - Write only at present tense"),(0,o.kt)("p",null,"You MUST NOT write events in the past. Instead, you should write a real-time event, with the current timestamp, that contains information on the future or past events."),(0,o.kt)("p",null,"You can use the entity ",(0,o.kt)("a",{parentName:"p",href:"#%E2%8F%B0-timeline"},"simulator")," to simulate the side-effects of such event on the aggregate."),(0,o.kt)("h2",{id:"3---do-not-write-several-events-on-the-same-aggregate-in-one-command"},"3 - Do not write several events on the same aggregate in one command"),(0,o.kt)("p",null,"Say that you have ",(0,o.kt)("inlineCode",{parentName:"p"},"ORDER_CREATED")," and ",(0,o.kt)("inlineCode",{parentName:"p"},"PRODUCT_ATTACHED_TO_ORDER"),' events already, and you now want an "order" to be automatically created when a user selects a "product". You may be tempted to re-use those events in your command, on a new "order" aggregate:'),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"1: ",(0,o.kt)("inlineCode",{parentName:"li"},"ORDER_CREATED")," (2022-01-01T00:00:00.000Z)"),(0,o.kt)("li",{parentName:"ul"},"2: ",(0,o.kt)("inlineCode",{parentName:"li"},"PRODUCT_ATTACHED_TO_ORDER")," (2022-01-01T00:00:00.000Z)")),(0,o.kt)("p",null,"However, this is not recommended. Depending on your system, your projectors and reactions down the line may not be able to process your events correctly, or in the correct order, which could lead to bugs."),(0,o.kt)("p",null,"You should rather modify your ",(0,o.kt)("inlineCode",{parentName:"p"},"ORDER_CREATED")," event to optionally contain a ",(0,o.kt)("inlineCode",{parentName:"p"},"attachedProductId"),", or create a new event entirely."),(0,o.kt)("h2",{id:"4---write-relations-on-all-sides"},"4 - Write relations on all sides"),(0,o.kt)("p",null,'In general, creating a relation in one way, say from an "order" to many "products", is easy to do: Simply write the "order" id on the "product" initial event. However, in the context of a command (remember that you can\'t use read models, that can easily re-index), the other way around is tricky: Depending on your implementation (especially in NoSQL), there may not be an easy way to find all the "products" of an "order".'),(0,o.kt)("p",null,'The solution is to write an attachment event on the "order" at the same time that the "product" is created, containing only its order id. This way, you can easily find the order products ids in its aggregate. However, make sure to use transactions: Either all events are written, either none of them is written.'),(0,o.kt)("h2",{id:"5---think-of-re-playability--in-projections-dont-cross-the-streams"},"5 - Think of re-playability ! In projections, ",(0,o.kt)("a",{parentName:"h2",href:"https://www.youtube.com/watch?v=wyKQe_i9yyo"},"don't cross the streams")),(0,o.kt)("p",null,"Events should easily be re-played to re-compute projections."),(0,o.kt)("p",null,"Crossing aggregates in your projection is \u274c dangerous \u274c It makes re-playability so much harder, because you won't be able to replay an aggregate in isolation!"),(0,o.kt)("p",null,"If you need to display data from several aggregates in a page, simply use several read models, but DO NOT CROSS entities in your projector (you'll notice that it is not doable in this prototype, by design)."),(0,o.kt)("p",null,"For the same reason:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"DO NOT project events from several aggregates, even from the same entity, on the same read model (keep a 1-to-1 mapping and not a N-to-1)."),(0,o.kt)("li",{parentName:"ul"},"DO NOT use the data from read models other than the one being updated. And, to avoid race conditions, keep your read model updates as single-transactions (for instance, using ",(0,o.kt)("inlineCode",{parentName:"li"},"append")," operators, or ",(0,o.kt)("inlineCode",{parentName:"li"},"conditions"),") instead of getting and re-pushing.")),(0,o.kt)("h1",{id:"-timeline"},"\u23f0 Timeline"),(0,o.kt)("p",null,"The second rule states that you should always write event at present tense. However, certain events may have side-effects in time. For instance:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"Your event may mean that another event should have been recorded in the past (retroactive event)"),(0,o.kt)("li",{parentName:"ul"},"Your event may mean that an event will probably appear at a given date in the future (like an offer expiry).")),(0,o.kt)("p",null,'However, you can, theoretically, already know from the recorded events if such "side-effect" events are allowed or not ! Wouldn\'t that be neat to disallow them from the get-go, in the command ?'),(0,o.kt)("p",null,"Well, now you can \ud83e\udd73 That's the goal of the ",(0,o.kt)("inlineCode",{parentName:"p"},"simulator")," property of entities."),(0,o.kt)("p",null,"A simulator is a reducer: It takes a dictionnary of events (indexed by the index of your choice) and a recorded event, and outputs another dictionnary of events. The default simulators simply adds the recorded event to the dictionary, indexing it by its version."),(0,o.kt)("p",null,"Simulators are used by the ",(0,o.kt)("inlineCode",{parentName:"p"},"simulateAggregate")," method exposed in the entities states. The logic for simulating the aggregate is the following:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"Apply the simulator to the aggregate events, starting with an empty object."),(0,o.kt)("li",{parentName:"ul"},"Get the resulting events, sort them by timestamp and filter out the events that are after the provided ",(0,o.kt)("inlineCode",{parentName:"li"},"simulationDate")),(0,o.kt)("li",{parentName:"ul"},"Replace the event versions by their index in the resulting simulated history"),(0,o.kt)("li",{parentName:"ul"},"Apply the entity reducer to the simulated event history")),(0,o.kt)("p",null,"You can find an implementation of this in this project (example stack):"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"A ",(0,o.kt)("inlineCode",{parentName:"li"},"/plan-counter-removal")," command will add ",(0,o.kt)("inlineCode",{parentName:"li"},"COUNTER_REMOVAL_PLANNED")," event to the counter event history"),(0,o.kt)("li",{parentName:"ul"},"In the simulator, this event will add a simulated ",(0,o.kt)("inlineCode",{parentName:"li"},"COUNTER_REMOVED")," event to the aggregate history at a future date (index by its version concatenated with ",(0,o.kt)("inlineCode",{parentName:"li"},"#1"),")"),(0,o.kt)("li",{parentName:"ul"},"This fictional event will also be removed by the simulator from the simulated aggregate history by any ",(0,o.kt)("inlineCode",{parentName:"li"},"COUNTER_REMOVED")," events that is actually the result of this planification (to prevent having 2 ",(0,o.kt)("inlineCode",{parentName:"li"},"COUNTER_REMOVED")," events in the simulated history once the date is past)"),(0,o.kt)("li",{parentName:"ul"},"When planning another removal, or an increment, the ",(0,o.kt)("inlineCode",{parentName:"li"},"simulateAggregate")," method is used to prevent the planification if the aggregate is projected to have a ",(0,o.kt)("inlineCode",{parentName:"li"},"REMOVED")," status at this date \ud83e\udd73")))}p.isMDXComponent=!0},35318:(e,t,n)=>{n.d(t,{Zo:()=>d,kt:()=>h});var a=n(27378);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,a,o=function(e,t){if(null==e)return{};var n,a,o={},r=Object.keys(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var s=a.createContext({}),u=function(e){var t=a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},d=function(e){var t=u(e.components);return a.createElement(s.Provider,{value:t},e.children)},c="mdxType",p={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},m=a.forwardRef((function(e,t){var n=e.components,o=e.mdxType,r=e.originalType,s=e.parentName,d=l(e,["components","mdxType","originalType","parentName"]),c=u(n),m=o,h=c["".concat(s,".").concat(m)]||c[m]||p[m]||r;return n?a.createElement(h,i(i({ref:t},d),{},{components:n})):a.createElement(h,i({ref:t},d))}));function h(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var r=n.length,i=new Array(r);i[0]=m;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l[c]="string"==typeof e?e:o,i[1]=l;for(var u=2;u<r;u++)i[u]=n[u];return a.createElement.apply(null,i)}return a.createElement.apply(null,n)}m.displayName="MDXCreateElement"}}]);