"use strict";(self.webpackChunk_castore_docs=self.webpackChunk_castore_docs||[]).push([[820],{1339:(e,t,r)=>{r.r(t),r.d(t,{default:()=>F});var n=r(35594),o=r(92358),i=r(27378),a=r(13127),s=r(80859),c=r(58981),u=r(12380),v=r(91205),d=r.n(v),p=r(85220),l=function(){for(var e=arguments.length,t=new Array(e),r=0;r<e;r++)t[r]=arguments[r];return t},f=(0,s.Z)((function e(t){var r=this,n=t.commandId,o=t.requiredEventStores,i=t.eventAlreadyExistsRetries,s=void 0===i?2:i,v=t.onEventAlreadyExists,l=void 0===v?(0,a.Z)(d().mark((function e(){return d().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",new Promise((function(e){return e()})));case 1:case"end":return e.stop()}}),e)}))):v,f=t.handler;(0,c.Z)(this,e),(0,u.Z)(this,"_types",void 0),(0,u.Z)(this,"commandId",void 0),(0,u.Z)(this,"requiredEventStores",void 0),(0,u.Z)(this,"eventAlreadyExistsRetries",void 0),(0,u.Z)(this,"onEventAlreadyExists",void 0),(0,u.Z)(this,"handler",void 0),this.commandId=n,this.requiredEventStores=o,this.eventAlreadyExistsRetries=s,this.onEventAlreadyExists=l,this.handler=function(){var e=(0,a.Z)(d().mark((function e(t,n){var o,i,a,s,c,u,v=arguments;return d().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:for(o=r.eventAlreadyExistsRetries,i=1,a=v.length,s=new Array(a>2?a-2:0),c=2;c<a;c++)s[c-2]=v[c];case 3:if(!(o>=0)){e.next=23;break}return e.prev=4,e.next=7,f.apply(void 0,[t,n].concat(s));case 7:return u=e.sent,e.abrupt("return",u);case 11:if(e.prev=11,e.t0=e.catch(4),(0,p._)(e.t0)){e.next=15;break}throw e.t0;case 15:return e.next=17,r.onEventAlreadyExists(e.t0,{attemptNumber:i,retriesLeft:o});case 17:if(0!==o){e.next=19;break}throw e.t0;case 19:o-=1,i+=1;case 21:e.next=3;break;case 23:throw new Error("Handler failed to execute");case 24:case"end":return e.stop()}}),e,null,[[4,11]])})));return function(t,r){return e.apply(this,arguments)}}()})),g=r(68814),h=r(66484),m=r(45609),y=r(5712),S=r(39373),E=r(37112);function Z(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var r,n=(0,S.Z)(e);if(t){var o=(0,S.Z)(this).constructor;r=Reflect.construct(n,arguments,o)}else r=n.apply(this,arguments);return(0,y.Z)(this,r)}}var x=function(e){(0,m.Z)(r,e);var t=Z(r);function r(e){var n=e.aggregateId,o=e.eventStoreId;return(0,c.Z)(this,r),t.call(this,"Unable to find aggregate ".concat(n," in event store ").concat(o,"."))}return(0,s.Z)(r)}((0,E.Z)(Error)),I=r(42235);function b(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var r,n=(0,S.Z)(e);if(t){var o=(0,S.Z)(this).constructor;r=Reflect.construct(n,arguments,o)}else r=n.apply(this,arguments);return(0,y.Z)(this,r)}}var w=function(e){(0,m.Z)(r,e);var t=b(r);function r(e){var n,o=e.eventStoreId;return(0,c.Z)(this,r),n=t.call(this,"Storage Adapter undefined for event store ".concat(o," ")),(0,u.Z)((0,I.Z)(n),"eventStoreId",void 0),n.eventStoreId=o,n}return(0,s.Z)(r)}((0,E.Z)(Error)),A=["aggregate","lastEvent"];function j(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function O(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?j(Object(r),!0).forEach((function(t){(0,u.Z)(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):j(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}var P=(0,s.Z)((function e(t){var r=this,n=t.eventStoreId,o=t.eventStoreEvents,i=t.reduce,s=t.simulateSideEffect,v=void 0===s?function(e,t){return O(O({},e),{},(0,u.Z)({},t.version,t))}:s,p=t.storageAdapter;(0,c.Z)(this,e),(0,u.Z)(this,"_types",void 0),(0,u.Z)(this,"eventStoreId",void 0),(0,u.Z)(this,"eventStoreEvents",void 0),(0,u.Z)(this,"reduce",void 0),(0,u.Z)(this,"simulateSideEffect",void 0),(0,u.Z)(this,"getEvents",void 0),(0,u.Z)(this,"pushEvent",void 0),(0,u.Z)(this,"onEventPushed",void 0),(0,u.Z)(this,"groupEvent",void 0),(0,u.Z)(this,"listAggregateIds",void 0),(0,u.Z)(this,"buildAggregate",void 0),(0,u.Z)(this,"getAggregate",void 0),(0,u.Z)(this,"getExistingAggregate",void 0),(0,u.Z)(this,"simulateAggregate",void 0),(0,u.Z)(this,"storageAdapter",void 0),(0,u.Z)(this,"getStorageAdapter",void 0),this.eventStoreId=n,this.eventStoreEvents=o,this.reduce=i,this.simulateSideEffect=v,this.storageAdapter=p,this.getStorageAdapter=function(){if(!r.storageAdapter)throw new w({eventStoreId:r.eventStoreId});return r.storageAdapter},this.getEvents=function(e,t){return r.getStorageAdapter().getEvents(e,{eventStoreId:r.eventStoreId},t)},this.pushEvent=function(){var e=(0,a.Z)(d().mark((function e(t){var n,o,i,a,s,c,u,v,p,l=arguments;return d().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return o=(n=l.length>1&&void 0!==l[1]?l[1]:{}).prevAggregate,i=n.force,a=void 0!==i&&i,s=r.getStorageAdapter(),e.next=4,s.pushEvent(t,{eventStoreId:r.eventStoreId,force:a});case 4:if(c=e.sent,u=c.event,v=void 0,(o||1===u.version)&&(v=r.reduce(o,u)),p=O({event:u},v?{nextAggregate:v}:{}),void 0===r.onEventPushed){e.next=12;break}return e.next=12,r.onEventPushed(p);case 12:return e.abrupt("return",p);case 13:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),this.groupEvent=function(e){var t=(arguments.length>1&&void 0!==arguments[1]?arguments[1]:{}).prevAggregate,n=r.getStorageAdapter().groupEvent(e);return n.eventStore=r,n.context={eventStoreId:r.eventStoreId},void 0!==t&&(n.prevAggregate=t),n},this.listAggregateIds=function(e){return r.getStorageAdapter().listAggregateIds({eventStoreId:r.eventStoreId},e)},this.buildAggregate=function(e,t){return e.reduce(r.reduce,t)},this.getAggregate=function(){var e=(0,a.Z)(d().mark((function e(t){var n,o,i,a,s,c=arguments;return d().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return n=(c.length>1&&void 0!==c[1]?c[1]:{}).maxVersion,e.next=3,r.getEvents(t,{maxVersion:n});case 3:return o=e.sent,i=o.events,a=r.buildAggregate(i,void 0),s=i[i.length-1],e.abrupt("return",{aggregate:a,events:i,lastEvent:s});case 8:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),this.getExistingAggregate=function(){var e=(0,a.Z)(d().mark((function e(t,n){var o,i,a,s;return d().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,r.getAggregate(t,n);case 2:if(o=e.sent,i=o.aggregate,a=o.lastEvent,s=(0,h.Z)(o,A),void 0!==i&&void 0!==a){e.next=8;break}throw new x({aggregateId:t,eventStoreId:r.eventStoreId});case 8:return e.abrupt("return",O({aggregate:i,lastEvent:a},s));case 9:case"end":return e.stop()}}),e)})));return function(t,r){return e.apply(this,arguments)}}(),this.simulateAggregate=function(e){var t=(arguments.length>1&&void 0!==arguments[1]?arguments[1]:{}).simulationDate,n=Object.values(e.reduce(r.simulateSideEffect,{}));void 0!==t&&(n=n.filter((function(e){return e.timestamp<=t})));var o=n.sort((function(e,t){return e.timestamp<t.timestamp?-1:1})).map((function(e,t){return O(O({},e),{},{version:t+1})}));return r.buildAggregate(o)}}));(0,u.Z)(P,"pushEventGroup",(0,a.Z)(d().mark((function e(){var t,r,n,o,i,a,s,c,u,v=arguments;return d().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:for(r=v.length,n=new Array(r),o=0;o<r;o++)n[o]=v[o];return i=n[0],a=n.slice(1),e.next=4,(t=i.eventStorageAdapter).pushEventGroup.apply(t,[i].concat((0,g.Z)(a)));case 4:return s=e.sent,c=s.eventGroup,u=c.map((function(e,t){var r=e.event,o=n[t],i=void 0,a=null==o?void 0:o.prevAggregate;return!a&&1!==r.version||void 0===(null==o?void 0:o.eventStore)||(i=o.eventStore.reduce(a,r)),O({event:r},i?{nextAggregate:i}:{})})),e.next=9,Promise.all(n.map((function(e,t){var r=e.eventStore,n=u[t];return void 0!==n&&void 0!==(null==r?void 0:r.onEventPushed)?r.onEventPushed(n):null})));case 9:return e.abrupt("return",{eventGroup:u});case 10:case"end":return e.stop()}}),e)}))));var k=(0,s.Z)((function e(t){var r=t.type,n=t.payloadSchema,o=t.metadataSchema;(0,c.Z)(this,e),(0,u.Z)(this,"_types",void 0),(0,u.Z)(this,"type",void 0),(0,u.Z)(this,"payloadSchema",void 0),(0,u.Z)(this,"metadataSchema",void 0),this.type=r,this.payloadSchema=n,this.metadataSchema=o})),R=new k({type:"APPEARED",payloadSchema:{type:"object",properties:{name:{type:"string"},level:{type:"number"}},required:["name","level"],additionalProperties:!1},metadataSchema:{type:"object",properties:{trigger:{enum:["random","scripted"]}},additionalProperties:!1}}),B=new k({type:"CAUGHT_BY_TRAINER",payloadSchema:{type:"object",properties:{trainerId:{type:"string"}},required:["trainerId"],additionalProperties:!1}}),N=new k({type:"LEVELLED_UP"});function D(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function T(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?D(Object(r),!0).forEach((function(t){(0,u.Z)(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):D(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}var _=new P({eventStoreId:"POKEMONS",eventStoreEvents:[R,B,N],reduce:function(e,t){var r=t.version,n=t.aggregateId;switch(t.type){case"APPEARED":var o=t.payload,i=o.name,a=o.level;return{aggregateId:n,version:t.version,name:i,level:a,status:"wild"};case"CAUGHT_BY_TRAINER":var s=t.payload.trainerId;return T(T({},e),{},{version:r,status:"caught",trainerId:s});case"LEVELLED_UP":return T(T({},e),{},{version:r,level:e.level+1})}}}),C=new k({type:"GAME_STARTED",payloadSchema:{type:"object",properties:{trainerName:{type:"string"}},required:["trainerName"],additionalProperties:!1}}),L=new k({type:"POKEMON_CAUGHT",payloadSchema:{type:"object",properties:{pokemonId:{type:"string",format:"uuid"}},required:["pokemonId"],additionalProperties:!1}});function M(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function q(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?M(Object(r),!0).forEach((function(t){(0,u.Z)(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):M(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}var G=new P({eventStoreId:"TRAINERS",eventStoreEvents:[C,L],reduce:function(e,t){var r=t.version,n=t.aggregateId;switch(t.type){case"GAME_STARTED":var o=t.payload.trainerName;return{aggregateId:n,version:t.version,name:o,caughtPokemonIds:[],caughtPokemonsCount:0};case"POKEMON_CAUGHT":var i=t.payload.pokemonId;return q(q({},e),{},{version:r,caughtPokemonIds:[].concat((0,g.Z)(e.caughtPokemonIds),[i]),caughtPokemonsCount:e.caughtPokemonsCount+1})}}}),U=r(79341);function K(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var r,n=(0,S.Z)(e);if(t){var o=(0,S.Z)(this).constructor;r=Reflect.construct(n,arguments,o)}else r=n.apply(this,arguments);return(0,y.Z)(this,r)}}var V,H=function(e){(0,m.Z)(r,e);var t=K(r);function r(e){var n,o=e.commandId,i=e.requiredEventStores,a=e.eventAlreadyExistsRetries,s=e.onEventAlreadyExists,v=e.handler,d=e.inputSchema,p=e.outputSchema;return(0,c.Z)(this,r),n=t.call(this,{commandId:o,requiredEventStores:i,eventAlreadyExistsRetries:a,onEventAlreadyExists:s,handler:v}),(0,u.Z)((0,I.Z)(n),"inputSchema",void 0),(0,u.Z)((0,I.Z)(n),"outputSchema",void 0),void 0!==d&&(n.inputSchema=d),void 0!==p&&(n.outputSchema=p),n}return(0,s.Z)(r)}(f),Y=new H({commandId:"START_POKEMON_GAME",requiredEventStores:l(G),inputSchema:{type:"object",properties:{trainerName:{type:"string"}},required:["trainerName"],additionalProperties:!1},outputSchema:{type:"object",properties:{trainerId:{type:"string"}},required:["trainerId"],additionalProperties:!1},handler:(V=(0,a.Z)(d().mark((function e(t,r,n){var o,i,a,s,c;return d().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return o=n.generateUuid,i=t.trainerName,a=(0,U.Z)(r,1),s=a[0],c=o(),e.next=6,s.pushEvent({aggregateId:c,version:1,type:"GAME_STARTED",payload:{trainerName:i}});case 6:return e.abrupt("return",{trainerId:c});case 7:case"end":return e.stop()}}),e)}))),function(e,t,r){return V.apply(this,arguments)})}),J=new H({commandId:"WILD_POKEMON_APPEAR",requiredEventStores:l(_),inputSchema:{type:"object",properties:{pokemonName:{type:"string"},pokemonLevel:{type:"number"}},required:["pokemonName","pokemonLevel"],additionalProperties:!1},outputSchema:{type:"object",properties:{pokemonId:{type:"string"}},required:["pokemonId"],additionalProperties:!1},handler:function(){var e=(0,a.Z)(d().mark((function e(t,r,n){var o,i,a,s,c,u;return d().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return o=n.generateUuid,i=t.pokemonName,a=t.pokemonLevel,s=(0,U.Z)(r,1),c=s[0],u=o(),e.next=6,c.pushEvent({aggregateId:u,version:1,type:"APPEARED",payload:{name:i,level:a},metadata:{trigger:"random"}});case 6:return e.abrupt("return",{pokemonId:u});case 7:case"end":return e.stop()}}),e)})));return function(t,r,n){return e.apply(this,arguments)}}()}),W=new H({commandId:"CATCH_POKEMON",requiredEventStores:l(_,G),inputSchema:{type:"object",properties:{pokemonId:{type:"string"},trainerId:{type:"string"}},required:["pokemonId","trainerId"],additionalProperties:!1},handler:function(){var e=(0,a.Z)(d().mark((function e(t,r){var n,o,i,a,s,c,u,v,p,l,f;return d().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return n=t.pokemonId,o=t.trainerId,i=(0,U.Z)(r,2),a=i[0],s=i[1],e.next=4,Promise.all([a.getAggregate(n),s.getAggregate(o)]);case 4:if(c=e.sent,u=(0,U.Z)(c,2),v=u[0].aggregate,p=u[1].aggregate,void 0!==v){e.next=10;break}throw new Error("Pokemon not found");case 10:if(void 0!==p){e.next=12;break}throw new Error("Trainer not found");case 12:if(l=v.version,"caught"!==v.status){e.next=15;break}throw new Error("Pokemon already caught");case 15:return f=p.version,e.next=18,P.pushEventGroup(a.groupEvent({aggregateId:n,version:l+1,type:"CAUGHT_BY_TRAINER",payload:{trainerId:o}}),s.groupEvent({aggregateId:o,version:f+1,type:"POKEMON_CAUGHT",payload:{pokemonId:n}}));case 18:case"end":return e.stop()}}),e)})));return function(t,r){return e.apply(this,arguments)}}()}),z=new H({commandId:"LEVEL_UP_POKEMON",requiredEventStores:l(_),inputSchema:{type:"object",properties:{pokemonId:{type:"string"}},required:["pokemonId"],additionalProperties:!1},outputSchema:{type:"object",properties:{nextLevel:{type:"number"}},required:["nextLevel"],additionalProperties:!1},handler:function(){var e=(0,a.Z)(d().mark((function e(t,r){var n,o,i,a,s,c,u,v;return d().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return n=t.pokemonId,o=(0,U.Z)(r,1),i=o[0],e.next=4,i.getAggregate(n);case 4:if(a=e.sent,void 0!==(s=a.aggregate)){e.next=8;break}throw new Error("Pokemon not found");case 8:if(c=s.version,99!==s.level){e.next=11;break}throw new Error("Pokemon level maxed out");case 11:return e.next=13,i.pushEvent({aggregateId:n,version:c+1,type:"LEVELLED_UP"},{prevAggregate:s});case 13:if(u=e.sent,v=u.nextAggregate){e.next=17;break}throw new Error;case 17:return e.abrupt("return",{nextLevel:v.level});case 18:case"end":return e.stop()}}),e)})));return function(t,r){return e.apply(this,arguments)}}()});const F=()=>i.createElement(o.Z,{title:"Visualizer",description:"Castore is a TypeScript library that makes Event Sourcing easy, a powerful paradigm that saves changes to your application state rather than the state itself."},i.createElement(n.Z,null,(()=>{const e=r(80339).YA,t=r(338).v4;return i.createElement(e,{eventStores:[_,G],commands:l(Y,J,W,z),contextsByCommandId:{START_POKEMON_GAME:[{generateUuid:t}],WILD_POKEMON_APPEAR:[{generateUuid:t}]}})})))},85220:(e,t,r)=>{r.d(t,{P:()=>o,_:()=>i});var n=r(34923),o="EventAlreadyExistsError",i=function(e){return"object"===(0,n.Z)(e)&&null!==e&&"code"in e&&e.code===o}},80339:(e,t,r)=>{r.d(t,{YA:()=>Re});var n=r(11848),o=r(86597),i=r(27378),a=r(34412),s=r(27680),c=r(66484),u=r(68814),v=r(13127),d=r(80859),p=r(58981),l=r(12380),f=r(91205),g=r.n(f),h=(0,d.Z)((function e(t){var r=t.event,n=t.context,o=t.prevAggregate,i=t.eventStorageAdapter,a=t.eventStore;(0,p.Z)(this,e),(0,l.Z)(this,"_types",void 0),(0,l.Z)(this,"event",void 0),(0,l.Z)(this,"context",void 0),(0,l.Z)(this,"prevAggregate",void 0),(0,l.Z)(this,"eventStorageAdapter",void 0),(0,l.Z)(this,"eventStore",void 0),this.event=r,void 0!==n&&(this.context=n),void 0!==o&&(this.prevAggregate=o),this.eventStorageAdapter=i,void 0!==a&&(this.eventStore=a)})),m=r(42235),y=r(45609),S=r(5712),E=r(39373),Z=r(37112);function x(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var r,n=(0,E.Z)(e);if(t){var o=(0,E.Z)(this).constructor;r=Reflect.construct(n,arguments,o)}else r=n.apply(this,arguments);return(0,S.Z)(this,r)}}var I=function(e){(0,y.Z)(r,e);var t=x(r);function r(e){var n,o=e.eventStoreSliceName;return(0,p.Z)(this,r),n=t.call(this,"Unable to find redux slice at path ".concat(o)),(0,l.Z)((0,m.Z)(n),"eventStoreSliceName",void 0),n.eventStoreSliceName=o,n}return(0,d.Z)(r)}((0,Z.Z)(Error)),b=r(85220);function w(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var r,n=(0,E.Z)(e);if(t){var o=(0,E.Z)(this).constructor;r=Reflect.construct(n,arguments,o)}else r=n.apply(this,arguments);return(0,S.Z)(this,r)}}var A=function(e){(0,y.Z)(r,e);var t=w(r);function r(e){var n,o=e.eventStoreId,i=void 0===o?"":o,a=e.aggregateId,s=e.version;return(0,p.Z)(this,r),n=t.call(this,"Event already exists for ".concat(i," aggregate ").concat(a," and version ").concat(s)),(0,l.Z)((0,m.Z)(n),"code",void 0),(0,l.Z)((0,m.Z)(n),"eventStoreId",void 0),(0,l.Z)((0,m.Z)(n),"aggregateId",void 0),(0,l.Z)((0,m.Z)(n),"version",void 0),n.code=b.P,i&&(n.eventStoreId=i),n.aggregateId=a,n.version=s,n}return(0,d.Z)(r)}((0,Z.Z)(Error)),j="@castore",O=function(e){var t=e.prefix;return[void 0===t?j:t,e.eventStoreId].join("_")},P=function(e){var t,r,n,o,i=e.inputOptions,a=e.inputPageToken,s={};if("string"==typeof a)try{s=JSON.parse(a)}catch(c){throw new Error("Invalid page token")}return{limit:null!==(t=null==i?void 0:i.limit)&&void 0!==t?t:s.limit,initialEventAfter:null!==(r=null==i?void 0:i.initialEventAfter)&&void 0!==r?r:s.initialEventAfter,initialEventBefore:null!==(n=null==i?void 0:i.initialEventBefore)&&void 0!==n?n:s.initialEventBefore,reverse:null!==(o=null==i?void 0:i.reverse)&&void 0!==o?o:s.reverse,exclusiveStartKey:s.lastEvaluatedKey}},k=["pageToken"];function R(e,t){var r="undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(!r){if(Array.isArray(e)||(r=function(e,t){if(!e)return;if("string"==typeof e)return B(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);"Object"===r&&e.constructor&&(r=e.constructor.name);if("Map"===r||"Set"===r)return Array.from(e);if("Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return B(e,t)}(e))||t&&e&&"number"==typeof e.length){r&&(e=r);var n=0,o=function(){};return{s:o,n:function(){return n>=e.length?{done:!0}:{done:!1,value:e[n++]}},e:function(e){throw e},f:o}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var i,a=!0,s=!1;return{s:function(){r=r.call(e)},n:function(){var e=r.next();return a=e.done,e},e:function(e){s=!0,i=e},f:function(){try{a||null==r.return||r.return()}finally{if(s)throw i}}}}function B(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}function N(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function D(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?N(Object(r),!0).forEach((function(t){(0,l.Z)(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):N(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}var T,_=function(){for(var e,t=[],r=arguments.length,n=new Array(r),o=0;o<r;o++)n[o]=arguments[o];if(n.forEach((function(r,n){if(!function(e){return e.eventStorageAdapter instanceof C}(r))throw new Error("Event group event #".concat(n," is not connected to a ReduxEventStorageAdapter"));if(!function(e){return void 0!==e.context}(r))throw new Error("Event group event #".concat(n," misses context"));void 0!==r.event.timestamp&&void 0!==e&&(e={timestamp:r.event.timestamp,groupedEventIndex:n}),t.push(r)})),void 0!==e){var i=e;t.forEach((function(e,t){if(void 0===e.event.timestamp)e.event.timestamp=i.timestamp;else if(e.event.timestamp!==i.timestamp)throw new Error("Event group events #".concat(t," and #").concat(i.groupedEventIndex," have different timestamps"))}))}return D({groupedEvents:t},void 0!==e?{timestamp:e.timestamp}:{})},C=(0,d.Z)((function e(t){var r=this,n=t.store,o=t.eventStoreId,i=t.prefix;(0,p.Z)(this,e),(0,l.Z)(this,"getEvents",void 0),(0,l.Z)(this,"pushEventSync",void 0),(0,l.Z)(this,"pushEvent",void 0),(0,l.Z)(this,"pushEventGroup",void 0),(0,l.Z)(this,"groupEvent",void 0),(0,l.Z)(this,"listAggregateIds",void 0),(0,l.Z)(this,"putSnapshot",void 0),(0,l.Z)(this,"getLastSnapshot",void 0),(0,l.Z)(this,"listSnapshots",void 0),(0,l.Z)(this,"store",void 0),(0,l.Z)(this,"eventStoreId",void 0),(0,l.Z)(this,"eventStoreSliceName",void 0),(0,l.Z)(this,"getEventStoreState",void 0),this.store=n,this.eventStoreId=o,this.eventStoreSliceName=O({eventStoreId:o,prefix:i}),this.getEventStoreState=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:r.eventStoreSliceName,t=r.store.getState()[e];if(void 0===t)throw new I({eventStoreSliceName:e});return t},this.pushEventSync=function(e,t){var n,o,i=e.aggregateId,a=null!==(n=t.force)&&void 0!==n&&n,s=null!==(o=r.getEventStoreState().eventsByAggregateId[i])&&void 0!==o?o:[];if(!a&&s.some((function(t){return t.version===e.version})))throw new A({eventStoreId:r.eventStoreId,aggregateId:e.aggregateId,version:e.version});return r.store.dispatch({type:"".concat(r.eventStoreSliceName,"/eventPushed"),payload:e}),{event:e}},this.pushEvent=function(){var e=(0,v.Z)(g().mark((function e(t,n){return g().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",new Promise((function(e){var o=(new Date).toISOString();e(r.pushEventSync(D({timestamp:o},t),n))})));case 1:case"end":return e.stop()}}),e)})));return function(t,r){return e.apply(this,arguments)}}(),this.pushEventGroup=(0,v.Z)(g().mark((function e(){var t,r,n,o=arguments;return g().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:for(t=o.length,r=new Array(t),n=0;n<t;n++)r[n]=o[n];return e.abrupt("return",new Promise((function(e){var t,n=_.apply(void 0,r),o=n.groupedEvents,i=n.timestamp,a=void 0===i?(new Date).toISOString():i,s=[],c=R(o);try{for(c.s();!(t=c.n()).done;){var v=t.value,d=v.eventStorageAdapter,p=v.event,l=v.context;try{var f=d.pushEventSync(D({timestamp:a},p),l);s.push(f)}catch(g){throw(0,u.Z)(o).slice(0,s.length).reverse().forEach((function(e){var t=e.eventStorageAdapter,r=e.event,n=r.aggregateId,o=r.version;t.store.dispatch({type:"".concat(t.eventStoreSliceName,"/eventReverted"),payload:{aggregateId:n,version:o}})})),g}}}catch(h){c.e(h)}finally{c.f()}e({eventGroup:s})})));case 2:case"end":return e.stop()}}),e)}))),this.groupEvent=function(e){return new h({event:e,eventStorageAdapter:r})},this.getEvents=function(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},o=n.minVersion,i=n.maxVersion,a=n.reverse,s=n.limit;return new Promise((function(t){var n,c=null!==(n=r.getEventStoreState().eventsByAggregateId[e])&&void 0!==n?n:[];void 0!==o&&(c=c.filter((function(e){return e.version>=o}))),void 0!==i&&(c=c.filter((function(e){return e.version<=i}))),!0===a&&(c=c.reverse()),void 0!==s&&(c=c.slice(0,s)),t({events:c})}))},this.listAggregateIds=function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=t.pageToken,o=(0,c.Z)(t,k);return new Promise((function(e){var t=r.getEventStoreState(),i=P({inputPageToken:n,inputOptions:o}),a=i.limit,s=i.initialEventAfter,c=i.initialEventBefore,v=i.reverse,d=i.exclusiveStartKey,p=(0,u.Z)(t.aggregateIds).sort((function(e,t){return e.initialEventTimestamp>t.initialEventTimestamp?1:-1}));void 0!==s&&(p=p.filter((function(e){var t=e.initialEventTimestamp;return s<=t}))),void 0!==c&&(p=p.filter((function(e){return e.initialEventTimestamp<=c})));var l=p.map((function(e){return e.aggregateId}));if(!0===v&&(l=l.reverse()),void 0!==d){var f=l.findIndex((function(e){return e===d}));l=l.slice(f+1)}var g=l.length;void 0!==a&&(l=l.slice(0,a));var h=void 0!==a&&g>a,m={limit:a,initialEventAfter:s,initialEventBefore:c,reverse:v,lastEvaluatedKey:l[l.length-1]};e(D({aggregateIds:l},h?{nextPageToken:JSON.stringify(m)}:{}))}))},this.putSnapshot=function(){return new Promise((function(e){return e()}))},this.getLastSnapshot=function(){return new Promise((function(e){return e({snapshot:void 0})}))},this.listSnapshots=function(){return new Promise((function(e){return e({snapshots:[]})}))}})),L=function(e){var t=e.eventStores,r=e.prefix,n=void 0===r?j:r,o=function(e){var t=e.prefix,r=void 0===t?j:t,n=e.eventStores,o={};return n.forEach((function(e){var t=e.eventStoreId,n=O({prefix:r,eventStoreId:t}),i=(0,s.oM)({name:n,initialState:{eventsByAggregateId:{},aggregateIds:[]},reducers:{eventPushed:function(e,t){var r=t.payload,n=r.aggregateId,o=r.timestamp,i=e.eventsByAggregateId[n];void 0===i?(e.eventsByAggregateId[n]=[r],e.aggregateIds.push({aggregateId:n,initialEventTimestamp:o})):i.push(r)},eventReverted:function(e,t){var r=t.payload,n=r.aggregateId,o=r.version,i=e.eventsByAggregateId[n],a=null==i?void 0:i.pop();if((null==a?void 0:a.version)!==o)throw void 0!==a&&(null==i||i.push(a)),new Error("Unable to revert partially pushed event group.");1===a.version&&(delete e.eventsByAggregateId[n],e.aggregateIds=e.aggregateIds.filter((function(e){return e.aggregateId!==n})))}}}).reducer;o[n]=i})),o}({eventStores:t,prefix:n}),i=(0,s.xC)({reducer:o});return t.forEach((function(e){e.storageAdapter=new C({store:i,eventStoreId:e.eventStoreId,prefix:n})})),i},M=r(79341),q=r(91282),G=r(57676),U=r(88659),K=r(29485),V=r(25283),H=r(5805),Y=r(10212),J=r(91223),W=r(2750),z=r(95048),F=r(54602),$=r(28016).ZP,Q=r(24246),X=function(e){var t=e.command,r=e.eventStoresById,n=e.contextsByCommandId,o=t.commandId,i=t.inputSchema,a=t.requiredEventStores,s=t.handler,c=a.map((function(e){var t=e.eventStoreId;return r[t]})),d=n[o],p=function(){var e=(0,v.Z)(g().mark((function e(t){var r,n;return g().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return r=t.formData,e.prev=1,e.next=4,s.apply(void 0,[r,c].concat((0,u.Z)(null!=d?d:[])));case 4:n=e.sent,console.log(n),e.next=11;break;case 8:e.prev=8,e.t0=e.catch(1),console.error(e.t0);case 11:case"end":return e.stop()}}),e,null,[[1,8]])})));return function(t){return e.apply(this,arguments)}}();return(0,Q.jsxs)(Y.Z,{children:[(0,Q.jsx)(J.Z,{expandIcon:T||(T=(0,Q.jsx)(H.Z,{})),"aria-controls":"panel1a-content",id:"panel1a-header",children:(0,Q.jsx)(W.Z,{children:o})}),(0,Q.jsx)(z.Z,{children:(0,Q.jsx)(V.Z,{spacing:2,children:void 0!==i&&(0,Q.jsx)($,{schema:i,validator:F.Z,onSubmit:function(e){p(e)},noHtml5Validate:!0})})})]})},ee=function(e){var t=e.commands,r=e.eventStoresById,n=e.contextsByCommandId;return(0,Q.jsx)(V.Z,{spacing:2,children:t.map((function(e){return(0,Q.jsx)(X,{command:e,eventStoresById:r,contextsByCommandId:n},e.commandId)}))})};function te(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var r,n=(0,E.Z)(e);if(t){var o=(0,E.Z)(this).constructor;r=Reflect.construct(n,arguments,o)}else r=n.apply(this,arguments);return(0,S.Z)(this,r)}}var re=function(e){(0,y.Z)(r,e);var t=te(r);function r(e){var n,o=e.eventStoreId;return(0,p.Z)(this,r),n=t.call(this,"Unable to find ReduxEventStorageAdapter for event store ".concat(o)),(0,l.Z)((0,m.Z)(n),"eventStoreId",void 0),n.eventStoreId=o,n}return(0,d.Z)(r)}((0,Z.Z)(Error)),ne=["pageToken"];function oe(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}var ie,ae,se,ce,ue,ve=function(e){var t,r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=r.pageToken,o=(0,c.Z)(r,ne),i=null!==(t=(0,a.v9)((function(t){var r=e.getStorageAdapter();if(!(r instanceof C))throw new re({eventStoreId:e.eventStoreId});var n=r.eventStoreSliceName,o=t[n];if(!o)throw new I({eventStoreSliceName:n});return o.aggregateIds})))&&void 0!==t?t:[],s=P({inputPageToken:n,inputOptions:o}),v=s.limit,d=s.initialEventAfter,p=s.initialEventBefore,f=s.reverse,g=s.exclusiveStartKey,h=(0,u.Z)(i).sort((function(e,t){return e.initialEventTimestamp>t.initialEventTimestamp?1:-1}));void 0!==d&&(h=h.filter((function(e){var t=e.initialEventTimestamp;return d<=t}))),void 0!==p&&(h=h.filter((function(e){return e.initialEventTimestamp<=p})));var m=h.map((function(e){return e.aggregateId}));if(!0===f&&(m=m.reverse()),void 0!==g){var y=m.findIndex((function(e){return e===g}));m=m.slice(y+1)}var S=m.length;void 0!==v&&(m=m.slice(0,v));var E=void 0!==v&&S>v,Z={limit:v,initialEventAfter:d,initialEventBefore:p,reverse:f,lastEvaluatedKey:m[m.length-1]};return function(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?oe(Object(r),!0).forEach((function(t){(0,l.Z)(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):oe(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}({aggregateIds:m},E?{nextPageToken:JSON.stringify(Z)}:{})},de=r(70920),pe=r(49106),le=r(90047),fe=r(66443),ge=r(34923),he=r(51366),me=r.n(he),ye=function(e){var t=e.src;return(0,Q.jsx)(me(),{src:"object"===(0,ge.Z)(t)&&null!==t?t:{src:t}})},Se=function(e){var t=new Date(e);return[t.toLocaleDateString(),t.toLocaleTimeString()].join(" - ")},Ee=function(e){var t,r=e.eventStore,n=e.aggregateId,o=function(e,t){var r,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},o=n.minVersion,i=n.maxVersion,s=n.reverse,c=n.limit,u=null!==(r=(0,a.v9)((function(r){var n=e.getStorageAdapter();if(!(n instanceof C))throw new re({eventStoreId:e.eventStoreId});var o=n.eventStoreSliceName,i=r[o];if(!i)throw new I({eventStoreSliceName:o});return i.eventsByAggregateId[t]})))&&void 0!==r?r:[];return void 0!==o&&(u=u.filter((function(e){return e.version>=o}))),void 0!==i&&(u=u.filter((function(e){return e.version<=i}))),!0===s&&(u=u.reverse()),void 0!==c&&(u=u.slice(0,c)),{events:u}}(r,n),s=o.events,c=null==(t=s[0])?void 0:t.timestamp,v=s.length,d=(0,i.useState)(s.length),p=(0,M.Z)(d,2),l=p[0],f=p[1],g=r.buildAggregate(s.filter((function(e){return e.version<=l})));return(0,Q.jsx)(de.Z,{elevation:2,children:(0,Q.jsx)(pe.Z,{children:(0,Q.jsx)(le.Z,{children:(0,Q.jsxs)(V.Z,{spacing:2,children:[(0,Q.jsx)(W.Z,{variant:"h5",component:"div",children:n}),(0,Q.jsx)(W.Z,{color:"text.secondary",children:void 0!==c?Se(c):void 0}),(0,Q.jsx)(fe.Z,{page:l,count:v,variant:"outlined",shape:"rounded",onChange:function(e,t){return f(t)}}),(0,Q.jsx)(ye,{src:g}),(0,Q.jsxs)(Y.Z,{variant:"outlined",sx:{backgroundColor:"#f9f9f9"},children:[ie||(ie=(0,Q.jsx)(J.Z,{expandIcon:(0,Q.jsx)(H.Z,{}),"aria-controls":"panel1a-content",id:"panel1a-header",children:(0,Q.jsx)(W.Z,{children:"Events"})})),(0,Q.jsx)(z.Z,{children:(0,Q.jsx)(V.Z,{spacing:2,children:(0,u.Z)(s).sort((function(e,t){return e.timestamp<t.timestamp?-1:1})).map((function(e,t){var r=e.type,o=e.payload,i=e.timestamp,a=e.version;return(0,Q.jsxs)(Y.Z,{variant:"outlined",children:[(0,Q.jsx)(J.Z,{expandIcon:ae||(ae=(0,Q.jsx)(H.Z,{})),"aria-controls":"panel1a-content",id:"panel1a-header",children:(0,Q.jsx)(W.Z,{children:[a,r,Se(i)].join(" - ")})}),(0,Q.jsx)(z.Z,{children:(0,Q.jsx)(ye,{src:o})})]},"".concat(n,"_").concat(t))}))})})]})]})})})})},Ze=function(e){var t=e.eventStore,r=ve(t).aggregateIds;return(0,Q.jsx)(V.Z,{spacing:2,children:r.map((function(e){return(0,Q.jsx)(Ee,{aggregateId:e,eventStore:t},e)}))})},xe=function(e){var t=e.eventStoreIds,r=e.eventStoresById,n=(0,i.useState)(t[0]),o=(0,M.Z)(n,2),a=o[0],s=o[1];return void 0===a?se||(se=(0,Q.jsx)(Q.Fragment,{})):(0,Q.jsxs)(q.ZP,{value:a,children:[(0,Q.jsx)(G.Z,{onChange:function(e,t){s(t)},"aria-label":"Event-store section",centered:!0,children:t.map((function(e){return(0,Q.jsx)(K.Z,{label:e,value:e},e)}))}),t.map((function(e){var t=r[e];return void 0===t?ce||(ce=(0,Q.jsx)(Q.Fragment,{})):(0,Q.jsx)(U.Z,{value:e,children:(0,Q.jsx)(Ze,{eventStore:t})},e)}))]})};!function(e){e.COMMANDS="COMMANDS",e.DB="DB"}(ue||(ue={}));var Ie,be=ue.COMMANDS,we=ue.DB,Ae=be,je=[be,we],Oe=function(e){var t=e.commands,r=e.eventStoreIds,n=e.eventStoresById,o=e.contextsByCommandId,a=(0,i.useState)(Ae),s=(0,M.Z)(a,2),c=s[0],u=s[1];return(0,Q.jsxs)(q.ZP,{value:c,children:[(0,Q.jsx)(G.Z,{onChange:function(e,t){return u(t)},"aria-label":"Event Sourcing section",centered:!0,variant:"fullWidth",sx:{padding:"0 20%",backgroundColor:"#dddddd",boxShadow:"0px 3px 5px rgba(0,0,0,0.2)"},children:je.map((function(e){return(0,Q.jsx)(K.Z,{label:e,value:e},e)}))}),(0,Q.jsx)(U.Z,{value:be,children:(0,Q.jsx)(ee,{commands:t,eventStoresById:n,contextsByCommandId:o})}),(0,Q.jsx)(U.Z,{value:we,children:(0,Q.jsx)(xe,{eventStoreIds:r,eventStoresById:n})})]})},Pe=function(e){var t=e.commands,r=e.eventStores,n=e.contextsByCommandId,o=L({eventStores:r}),i={},s=[];return r.forEach((function(e){s.push(e.eventStoreId),i[e.eventStoreId]=e})),(0,Q.jsx)(a.zt,{store:o,children:(0,Q.jsx)(Oe,{commands:t,eventStoreIds:s,eventStoresById:i,contextsByCommandId:n})})},ke=(0,r(71608).Z)({palette:{background:{default:"#efefef"}}}),Re=function(e){var t=e.commands,r=e.eventStores,i=e.contextsByCommandId;return(0,Q.jsxs)(n.Z,{theme:ke,children:[Ie||(Ie=(0,Q.jsx)(o.ZP,{})),(0,Q.jsx)(Pe,{commands:t,eventStores:r,contextsByCommandId:i})]})}}}]);