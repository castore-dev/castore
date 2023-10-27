"use strict";(self.webpackChunk_castore_docs=self.webpackChunk_castore_docs||[]).push([[550],{21378:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>s,contentTitle:()=>l,default:()=>d,frontMatter:()=>o,metadata:()=>i,toc:()=>p});var a=n(52685),r=(n(27378),n(35318));const o={sidebar_position:3},l="\ud83d\udcd9 Event Store",i={unversionedId:"event-sourcing/event-stores",id:"event-sourcing/event-stores",title:"\ud83d\udcd9 Event Store",description:"Once you've defined your event types and how to aggregate them, you can bundle them together in an EventStore class. Each event store in your application represents a business entity.",source:"@site/docs/2-event-sourcing/3-event-stores.md",sourceDirName:"2-event-sourcing",slug:"/event-sourcing/event-stores",permalink:"/castore/docs/event-sourcing/event-stores",draft:!1,tags:[],version:"current",sidebarPosition:3,frontMatter:{sidebar_position:3},sidebar:"tutorialSidebar",previous:{title:"\ud83d\udd27 Aggregates / Reducers",permalink:"/castore/docs/event-sourcing/aggregates-reducers"},next:{title:"\ud83d\uded2 Fetching events",permalink:"/castore/docs/event-sourcing/fetching-events"}},s={},p=[],u={toc:p},g="wrapper";function d(e){let{components:t,...o}=e;return(0,r.kt)(g,(0,a.Z)({},u,o,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("h1",{id:"-event-store"},"\ud83d\udcd9 Event Store"),(0,r.kt)("p",null,"Once you've defined your ",(0,r.kt)("a",{parentName:"p",href:"/castore/docs/event-sourcing/events"},"event types")," and how to ",(0,r.kt)("a",{parentName:"p",href:"/castore/docs/event-sourcing/aggregates-reducers"},"aggregate")," them, you can bundle them together in an ",(0,r.kt)("inlineCode",{parentName:"p"},"EventStore")," class. Each event store in your application represents a business entity."),(0,r.kt)("admonition",{type:"note"},(0,r.kt)("p",{parentName:"admonition"},"Think of event stores as ",(0,r.kt)("em",{parentName:"p"},'"what tables would be in CRUD"'),", except that instead of directly updating data, you just append new events to it!")),(0,r.kt)("p",null,(0,r.kt)("img",{alt:"Event Store",src:n(55998).Z,width:"3580",height:"1378"})),(0,r.kt)("p",null,"In Castore, ",(0,r.kt)("inlineCode",{parentName:"p"},"EventStore")," classes are NOT responsible for actually storing data (this will come with ",(0,r.kt)("a",{parentName:"p",href:"/castore/docs/event-sourcing/fetching-events"},"event storage adapters"),"). But rather to provide a boilerplate-free and type-safe interface to perform many actions such as:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"Listing aggregate ids"),(0,r.kt)("li",{parentName:"ul"},"Accessing events of an aggregate"),(0,r.kt)("li",{parentName:"ul"},"Building an aggregate with the reducer"),(0,r.kt)("li",{parentName:"ul"},"Pushing new events etc.")),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"import { EventStore } from '@castore/core';\n\nconst pokemonsEventStore = new EventStore({\n  eventStoreId: 'POKEMONS',\n  eventTypes: [\n    pokemonAppearedEventType,\n    pokemonCaughtEventType,\n    pokemonLeveledUpEventType,\n    ...\n  ],\n  reducer: pokemonsReducer,\n});\n// ...and that's it \ud83e\udd73\n")),(0,r.kt)("admonition",{type:"info"},(0,r.kt)("p",{parentName:"admonition"},"\u261d\ufe0f The ",(0,r.kt)("inlineCode",{parentName:"p"},"EventStore")," class is the heart of Castore, it even gave it its name!")),(0,r.kt)("details",null,(0,r.kt)("summary",null,(0,r.kt)("b",null,"\ud83d\udd27 Reference")),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},"Constructor:")),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"eventStoreId ",(0,r.kt)("i",null,"(string)")),": A string identifying the event store"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"eventTypes ",(0,r.kt)("i",null,"(EventType[])")),": The list of event types in the event store"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"reduce ",(0,r.kt)("i",null,"(EventType[])")),": A ",(0,r.kt)("a",{href:"../aggregates-reducers"},"reducer function")," that can be applied to the store event types"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"onEventPushed ",(0,r.kt)("i",null,"(?(pushEventResponse: PushEventResponse) => Promise<void>)")),": To run a callback after events are pushed (input is exactly the return value of the ",(0,r.kt)("code",null,"pushEvent")," method)"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"eventStorageAdapter ",(0,r.kt)("i",null,"(?EventStorageAdapter)")),": See ",(0,r.kt)("a",{href:"../fetching-events"},"fetching events"))),(0,r.kt)("blockquote",null,(0,r.kt)("p",{parentName:"blockquote"},"\u261d\ufe0f The return type of the ",(0,r.kt)("inlineCode",{parentName:"p"},"reducer")," is used to infer the ",(0,r.kt)("inlineCode",{parentName:"p"},"Aggregate")," type of the ",(0,r.kt)("inlineCode",{parentName:"p"},"EventStore"),", so it is important to type it explicitely.")),(0,r.kt)("hr",null),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},"Properties:")),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"eventStoreId ",(0,r.kt)("i",null,"(string)")))),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"const pokemonsEventStoreId = pokemonsEventStore.eventStoreId;\n// => 'POKEMONS'\n")),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"eventTypes ",(0,r.kt)("i",null,"(EventType[])")))),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"const pokemonsEventTypes = pokemonsEventStore.eventTypes;\n// => [pokemonAppearedEventType, pokemonCaughtEventType...]\n")),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"reduce ",(0,r.kt)("i",null,"((Aggregate, EventType) => Aggregate)")))),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"const reducer = pokemonsEventStore.reduce;\n// => pokemonsReducer\n")),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"onEventPushed ",(0,r.kt)("i",null,"(?(pushEventResponse: PushEventResponse) => Promise<void>)")),": Callback to run after events are pushed")),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"const onEventPushed = pokemonsEventStore.onEventPushed;\n// => undefined (we did not provide one in this example)\n")),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"eventStorageAdapter ",(0,r.kt)("i",null,"(?EventStorageAdapter)")),": See ",(0,r.kt)("a",{href:"../fetching-events"},"fetching events"))),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"const eventStorageAdapter = pokemonsEventStore.eventStorageAdapter;\n// => undefined (we did not provide one in this example)\n")),(0,r.kt)("blockquote",null,(0,r.kt)("p",{parentName:"blockquote"},"\u261d\ufe0f The ",(0,r.kt)("inlineCode",{parentName:"p"},"eventStorageAdapter")," is not read-only so you do not have to provide it right away.")),(0,r.kt)("hr",null),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},"Sync Methods:")),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"getEventStorageAdapter ",(0,r.kt)("i",null,"(() => EventStorageAdapter)")),": Returns the event store event storage adapter if it exists. Throws an ",(0,r.kt)("code",null,"UndefinedEventStorageAdapterError")," if it doesn't.")),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"import { UndefinedEventStorageAdapterError } from '@castore/core';\n\nexpect(() => pokemonsEventStore.getEventStorageAdapter()).toThrow(\n  new UndefinedEventStorageAdapterError({ eventStoreId: 'POKEMONS' }),\n);\n// => true\n")),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"buildAggregate ",(0,r.kt)("i",null,"((eventDetails: EventDetail[], initialAggregate?: Aggregate) => Aggregate | undefined)")),": Applies the event store reducer to a serie of events.")),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"const myPikachuAggregate = pokemonsEventStore.buildAggregate(myPikachuEvents);\n")),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"groupEvent ",(0,r.kt)("i",null,"((eventDetail: EventDetail, opt?: OptionsObj) => GroupedEvent)")),": See ",(0,r.kt)("a",{href:"../joining-data"},"joining data"),".")),(0,r.kt)("hr",null),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},"Async Methods:")),(0,r.kt)("p",null,"The following methods interact with the data layer of your event store through its ",(0,r.kt)("a",{parentName:"p",href:"/castore/docs/event-sourcing/fetching-events"},(0,r.kt)("inlineCode",{parentName:"a"},"EventStorageAdapter")),". They will throw an ",(0,r.kt)("inlineCode",{parentName:"p"},"UndefinedEventStorageAdapterError")," if you did not provide one."),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"getEvents ",(0,r.kt)("i",null,"((aggregateId: string, opt?: OptionsObj) => Promise<ResponseObj>)")),": Retrieves the events of an aggregate, ordered by ",(0,r.kt)("code",null,"version"),". Returns an empty array if no event is found for this ",(0,r.kt)("code",null,"aggregateId"),".",(0,r.kt)("p",{parentName:"li"},(0,r.kt)("inlineCode",{parentName:"p"},"OptionsObj")," contains the following properties:"),(0,r.kt)("ul",{parentName:"li"},(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"minVersion ",(0,r.kt)("i",null,"(?number)")),": To retrieve events above a certain version"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"maxVersion ",(0,r.kt)("i",null,"(?number)")),": To retrieve events below a certain version"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"limit ",(0,r.kt)("i",null,"(?number)")),": Maximum number of events to retrieve"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"reverse ",(0,r.kt)("i",null,"(?boolean = false)")),": To retrieve events in reverse order (does not require to swap ",(0,r.kt)("code",null,"minVersion")," and ",(0,r.kt)("code",null,"maxVersion"),")")),(0,r.kt)("p",{parentName:"li"},(0,r.kt)("inlineCode",{parentName:"p"},"ResponseObj")," contains the following properties:"),(0,r.kt)("ul",{parentName:"li"},(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"events ",(0,r.kt)("i",null,"(EventDetail[])")),": The aggregate events (possibly empty)")))),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"const { events: allEvents } = await pokemonsEventStore.getEvents(myPikachuId);\n// => typed as PokemonEventDetail[] \ud83d\ude4c\n\n// \ud83d\udc47 Retrieve a range of events\nconst { events: rangedEvents } = await pokemonsEventStore.getEvents(\n  myPikachuId,\n  {\n    minVersion: 2,\n    maxVersion: 5,\n  },\n);\n\n// \ud83d\udc47 Retrieve the last event of the aggregate\nconst { events: onlyLastEvent } = await pokemonsEventStore.getEvents(\n  myPikachuId,\n  {\n    reverse: true,\n    limit: 1,\n  },\n);\n")),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"getAggregate ",(0,r.kt)("i",null,"((aggregateId: string, opt?: OptionsObj) => Promise<ResponseObj>)")),": Retrieves the events of an aggregate and build it.",(0,r.kt)("p",{parentName:"li"},(0,r.kt)("inlineCode",{parentName:"p"},"OptionsObj")," contains the following properties:"),(0,r.kt)("ul",{parentName:"li"},(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"maxVersion ",(0,r.kt)("i",null,"(?number)")),": To retrieve aggregate below a certain version")),(0,r.kt)("p",{parentName:"li"},(0,r.kt)("inlineCode",{parentName:"p"},"ResponseObj")," contains the following properties:"),(0,r.kt)("ul",{parentName:"li"},(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"aggregate ",(0,r.kt)("i",null,"(?Aggregate)")),": The aggregate (possibly ",(0,r.kt)("code",null,"undefined"),")"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"events ",(0,r.kt)("i",null,"(EventDetail[])")),": The aggregate events (possibly empty)"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"lastEvent ",(0,r.kt)("i",null,"(?EventDetail)")),": The last event (possibly ",(0,r.kt)("code",null,"undefined"),")")))),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"const { aggregate: myPikachu } = await pokemonsEventStore.getAggregate(\n  myPikachuId,\n);\n// => typed as PokemonAggregate | undefined \ud83d\ude4c\n\n// \ud83d\udc47 Retrieve an aggregate below a certain version\nconst { aggregate: pikachuBelowVersion5 } =\n  await pokemonsEventStore.getAggregate(myPikachuId, { maxVersion: 5 });\n\n// \ud83d\udc47 Returns the events if you need them\nconst { aggregate, events } = await pokemonsEventStore.getAggregate(\n  myPikachuId,\n);\n")),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"getExistingAggregate ",(0,r.kt)("i",null,"((aggregateId: string, opt?: OptionsObj) => Promise<ResponseObj>)")),": Same as ",(0,r.kt)("code",null,"getAggregate")," method, but ensures that the aggregate exists. Throws an ",(0,r.kt)("code",null,"AggregateNotFoundError")," if no event is found for this ",(0,r.kt)("code",null,"aggregateId"),".")),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"import { AggregateNotFoundError } from '@castore/core';\n\nexpect(async () =>\n  pokemonsEventStore.getExistingAggregate(unexistingId),\n).resolves.toThrow(\n  new AggregateNotFoundError({\n    eventStoreId: 'POKEMONS',\n    aggregateId: unexistingId,\n  }),\n);\n// true\n\nconst { aggregate } = await pokemonsEventStore.getExistingAggregate(\n  aggregateId,\n);\n// => 'aggregate' and 'lastEvent' are always defined \ud83d\ude4c\n")),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"pushEvent ",(0,r.kt)("i",null,"((eventDetail: EventDetail, opt?: OptionsObj) => Promise<ResponseObj>)")),": Pushes a new event to the event store. The ",(0,r.kt)("code",null,"timestamp")," is optional (we keep it available as it can be useful in tests & migrations). If not provided, it is automatically set as ",(0,r.kt)("code",null,"new Date().toISOString()"),". Throws an ",(0,r.kt)("code",null,"EventAlreadyExistsError")," if an event already exists for the corresponding ",(0,r.kt)("code",null,"aggregateId")," and ",(0,r.kt)("code",null,"version")," (see section on ",(0,r.kt)("a",{href:"../pushing-events"},"race conditions"),").",(0,r.kt)("p",{parentName:"li"},(0,r.kt)("inlineCode",{parentName:"p"},"OptionsObj")," contains the following properties:"),(0,r.kt)("ul",{parentName:"li"},(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"prevAggregate ",(0,r.kt)("i",null,"(?Aggregate)")),": The aggregate at the current version, i.e. before having pushed the event. Can be useful in some cases like when using the ",(0,r.kt)("a",{href:"../../reacting-to-events/connected-event-store"},"ConnectedEventStore class")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"force ",(0,r.kt)("i",null,"(?boolean)")),": To force push the event even if one already exists for the corresponding ",(0,r.kt)("code",null,"aggregateId")," and ",(0,r.kt)("code",null,"version"),". Any existing event will be overridden, so use with extra care, mainly in ",(0,r.kt)("a",{href:"https://www.npmjs.com/package/@castore/lib-dam"},"data migrations"),".")),(0,r.kt)("p",{parentName:"li"},(0,r.kt)("inlineCode",{parentName:"p"},"ResponseObj")," contains the following properties:"),(0,r.kt)("ul",{parentName:"li"},(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"event ",(0,r.kt)("i",null,"(EventDetail)")),": The complete event (includes the ",(0,r.kt)("code",null,"timestamp"),")"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"nextAggregate ",(0,r.kt)("i",null,"(?Aggregate)")),": The aggregate at the new version, i.e. after having pushed the event. Returned only if the event is an initial event, if the ",(0,r.kt)("code",null,"prevAggregate")," option was provided, or when using a ",(0,r.kt)("a",{href:"../../reacting-to-events/connected-event-store"},"ConnectedEventStore class")," connected to a ",(0,r.kt)("a",{href:"../../reacting-to-events/messages"},"state-carrying message bus or queue"))))),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"const { event: completeEvent, nextAggregate } =\n  await pokemonsEventStore.pushEvent(\n    {\n      aggregateId: myPikachuId,\n      version: lastVersion + 1,\n      type: 'POKEMON_LEVELED_UP', // <= event type is correctly typed \ud83d\ude4c\n      payload, // <= payload is typed according to the provided event type \ud83d\ude4c\n      metadata, // <= same goes for metadata \ud83d\ude4c\n      // timestamp is optional\n    },\n    // Not required - Can be useful in some cases\n    { prevAggregate },\n  );\n")),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"listAggregateIds ",(0,r.kt)("i",null,"((opt?: OptionsObj) => Promise<ResponseObj>)")),": Retrieves the list of ",(0,r.kt)("code",null,"aggregateId")," of an event store, ordered by the ",(0,r.kt)("code",null,"timestamp")," of their initial event. Returns an empty array if no aggregate is found.",(0,r.kt)("p",{parentName:"li"},(0,r.kt)("inlineCode",{parentName:"p"},"OptionsObj")," contains the following properties:"),(0,r.kt)("ul",{parentName:"li"},(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"limit ",(0,r.kt)("i",null,"(?number)")),": Maximum number of aggregate ids to retrieve"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"initialEventAfter ",(0,r.kt)("i",null,"(?string)")),": To retrieve aggregate ids that appeared after a certain timestamp"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"initialEventBefore ",(0,r.kt)("i",null,"(?string)")),": To retrieve aggregate ids that appeared before a certain timestamp"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"reverse ",(0,r.kt)("i",null,"(?boolean)")),": To retrieve the aggregate ids in reverse order"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"pageToken ",(0,r.kt)("i",null,"(?string)")),": To retrieve a paginated result of aggregate ids")),(0,r.kt)("p",{parentName:"li"},(0,r.kt)("inlineCode",{parentName:"p"},"ResponseObj")," contains the following properties:"),(0,r.kt)("ul",{parentName:"li"},(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"aggregateIds ",(0,r.kt)("i",null,"(string[])")),": The list of aggregate ids"),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("code",null,"nextPageToken ",(0,r.kt)("i",null,"(?string)")),": A token for the next page of aggregate ids if one exists. The nextPageToken carries the previously used options, so you do not have to provide them again (though you can still do it to override them).")))),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"const accAggregateIds: string = [];\n\nconst { aggregateIds: firstPage, nextPageToken } =\n  await pokemonsEventStore.listAggregateIds({ limit: 20 });\n\naccAggregateIds.push(...firstPage);\n\nif (nextPageToken) {\n  const { aggregateIds: secondPage } =\n    await pokemonsEventStore.listAggregateIds({\n      // \ud83d\udc47 Previous limit of 20 is passed through the page token\n      pageToken: nextPageToken,\n    });\n  accAggregateIds.push(...secondPage);\n}\n")),(0,r.kt)("hr",null),(0,r.kt)("p",null,(0,r.kt)("strong",{parentName:"p"},"Type Helpers:")),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"EventStoreId"),": Returns the ",(0,r.kt)("inlineCode",{parentName:"li"},"EventStore")," id")),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"import type { EventStoreId } from '@castore/core';\n\ntype PokemonsEventStoreId = EventStoreId<typeof pokemonsEventStore>;\n// => 'POKEMONS'\n")),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"EventStoreEventTypes"),": Returns the ",(0,r.kt)("inlineCode",{parentName:"li"},"EventStore")," list of events types")),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"import type { EventStoreEventTypes } from '@castore/core';\n\ntype PokemonEventTypes = EventStoreEventTypes<typeof pokemonsEventStore>;\n// => [typeof pokemonAppearedEventType, typeof pokemonCaughtEventType...]\n")),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"EventStoreEventDetails"),": Returns the union of all the ",(0,r.kt)("inlineCode",{parentName:"li"},"EventStore")," possible events details")),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"import type { EventStoreEventDetails } from '@castore/core';\n\ntype PokemonEventDetails = EventStoreEventDetails<typeof pokemonsEventStore>;\n// => EventTypeDetail<typeof pokemonAppearedEventType>\n// | EventTypeDetail<typeof pokemonCaughtEventType>\n// | ...\n")),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"EventStoreReducer"),": Returns the ",(0,r.kt)("inlineCode",{parentName:"li"},"EventStore")," reducer")),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"import type { EventStoreReducer } from '@castore/core';\n\ntype PokemonsReducer = EventStoreReducer<typeof pokemonsEventStore>;\n// => Reducer<PokemonAggregate, PokemonEventDetails>\n")),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("inlineCode",{parentName:"li"},"EventStoreAggregate"),": Returns the ",(0,r.kt)("inlineCode",{parentName:"li"},"EventStore")," aggregate")),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-ts"},"import type { EventStoreAggregate } from '@castore/core';\n\ntype SomeAggregate = EventStoreAggregate<typeof pokemonsEventStore>;\n// => PokemonAggregate\n"))))}d.isMDXComponent=!0},35318:(e,t,n)=>{n.d(t,{Zo:()=>u,kt:()=>k});var a=n(27378);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function i(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},o=Object.keys(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var s=a.createContext({}),p=function(e){var t=a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},u=function(e){var t=p(e.components);return a.createElement(s.Provider,{value:t},e.children)},g="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},c=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,s=e.parentName,u=i(e,["components","mdxType","originalType","parentName"]),g=p(n),c=r,k=g["".concat(s,".").concat(c)]||g[c]||d[c]||o;return n?a.createElement(k,l(l({ref:t},u),{},{components:n})):a.createElement(k,l({ref:t},u))}));function k(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,l=new Array(o);l[0]=c;var i={};for(var s in t)hasOwnProperty.call(t,s)&&(i[s]=t[s]);i.originalType=e,i[g]="string"==typeof e?e:r,l[1]=i;for(var p=2;p<o;p++)l[p]=n[p];return a.createElement.apply(null,l)}return a.createElement.apply(null,n)}c.displayName="MDXCreateElement"},55998:(e,t,n)=>{n.d(t,{Z:()=>a});const a=n.p+"assets/images/eventStore-03b7f1a66b58bedf12366148fc281365.png"}}]);