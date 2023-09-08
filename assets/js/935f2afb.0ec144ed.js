"use strict";(self.webpackChunk_castore_docs=self.webpackChunk_castore_docs||[]).push([[53],{1109:e=>{e.exports=JSON.parse('{"pluginId":"default","version":"current","label":"Next","banner":null,"badge":false,"noIndex":false,"className":"docs-version-current","isLast":true,"docsSidebars":{"tutorialSidebar":[{"type":"link","label":"Introduction","href":"/castore/docs/introduction","docId":"introduction"},{"type":"link","label":"Installation","href":"/castore/docs/installation","docId":"installation"},{"type":"category","label":"Event Sourcing concepts","collapsible":true,"collapsed":true,"items":[{"type":"link","label":"\ud83d\udcc5 Events","href":"/castore/docs/event-sourcing/events","docId":"event-sourcing/events"},{"type":"link","label":"\ud83d\udd27 Aggregates / Reducers","href":"/castore/docs/event-sourcing/aggregates-reducers","docId":"event-sourcing/aggregates-reducers"},{"type":"link","label":"\ud83d\udcd9 Event Store","href":"/castore/docs/event-sourcing/event-stores","docId":"event-sourcing/event-stores"},{"type":"link","label":"\ud83d\uded2 Fetching events","href":"/castore/docs/event-sourcing/fetching-events","docId":"event-sourcing/fetching-events"},{"type":"link","label":"\u270d\ufe0f Pushing events","href":"/castore/docs/event-sourcing/pushing-events","docId":"event-sourcing/pushing-events"},{"type":"link","label":"\ud83d\udd17 Joining data","href":"/castore/docs/event-sourcing/joining-data","docId":"event-sourcing/joining-data"}]},{"type":"category","label":"Reacting to events","collapsible":true,"collapsed":true,"items":[{"type":"link","label":"\u2709\ufe0f Messages","href":"/castore/docs/reacting-to-events/messages","docId":"reacting-to-events/messages"},{"type":"link","label":"\ud83d\udce8 Message Queues","href":"/castore/docs/reacting-to-events/message-queues","docId":"reacting-to-events/message-queues"},{"type":"link","label":"\ud83d\ude8c Message Buses","href":"/castore/docs/reacting-to-events/message-buses","docId":"reacting-to-events/message-buses"},{"type":"link","label":"\ud83d\udd0c Connected Event Store","href":"/castore/docs/reacting-to-events/connected-event-store","docId":"reacting-to-events/connected-event-store"},{"type":"link","label":"\ud83d\udcf8 Snapshots","href":"/castore/docs/reacting-to-events/snapshots","docId":"reacting-to-events/snapshots"},{"type":"link","label":"\ud83d\udcd6 Read Models","href":"/castore/docs/reacting-to-events/read-models","docId":"reacting-to-events/read-models"}]},{"type":"link","label":"Packages","href":"/castore/docs/packages","docId":"packages"}]},"docs":{"event-sourcing/aggregates-reducers":{"id":"event-sourcing/aggregates-reducers","title":"\ud83d\udd27 Aggregates / Reducers","description":"Eventhough entities are stored as series of events, we still want to use a simpler and stable interface to represent their states at a point in time rather than directly using events. In Castore, it is implemented by a TS type called Aggregate.","sidebar":"tutorialSidebar"},"event-sourcing/event-stores":{"id":"event-sourcing/event-stores","title":"\ud83d\udcd9 Event Store","description":"Once you\'ve defined your event types and how to aggregate them, you can bundle them together in an EventStore class. Each event store in your application represents a business entity.","sidebar":"tutorialSidebar"},"event-sourcing/events":{"id":"event-sourcing/events","title":"\ud83d\udcc5 Events","description":"Event Sourcing is all about saving changes in your application state. Such changes are represented by events, and needless to say, they are quite important \ud83d\ude43","sidebar":"tutorialSidebar"},"event-sourcing/fetching-events":{"id":"event-sourcing/fetching-events","title":"\ud83d\uded2 Fetching events","description":"For the moment, we didn\'t provide any actual way to store our events data. This is the responsibility of the EventStorageAdapter class.","sidebar":"tutorialSidebar"},"event-sourcing/joining-data":{"id":"event-sourcing/joining-data","title":"\ud83d\udd17 Joining data","description":"Some commands can have an effect on several event stores, or on several aggregates of the same event store. For instance, the CATCHPOKEMON command could write both a CAUGHTBYTRAINER event on a pokemon aggregate (changing its status to \'caught\') and a POKEMONCAUGHT event on a trainer aggregate (appending the pokemonId to its pokedex).","sidebar":"tutorialSidebar"},"event-sourcing/pushing-events":{"id":"event-sourcing/pushing-events","title":"\u270d\ufe0f Pushing events","description":"Modifying the state of your application (i.e. pushing new events to your event stores) is done by executing commands. They typically consist in:","sidebar":"tutorialSidebar"},"installation":{"id":"installation","title":"Installation","description":"Castore is not a single package, but a collection of packages revolving around a core package. This is made so every line of code added to your project is opt-in, wether you use tree-shaking or not.","sidebar":"tutorialSidebar"},"introduction":{"id":"introduction","title":"Introduction","description":"Event Sourcing is a data storage paradigm that saves changes in your application state rather than the state itself.","sidebar":"tutorialSidebar"},"packages":{"id":"packages","title":"Packages","description":"\ud83c\udfaf Test Tools","sidebar":"tutorialSidebar"},"reacting-to-events/connected-event-store":{"id":"reacting-to-events/connected-event-store","title":"\ud83d\udd0c Connected Event Store","description":"If your storage solution exposes data streaming capabilities (such as DynamoDB streams), you can leverage them to push your freshly written events to a message bus or queue.","sidebar":"tutorialSidebar"},"reacting-to-events/message-buses":{"id":"reacting-to-events/message-buses","title":"\ud83d\ude8c Message Buses","description":"Message Buses are used to spread messages to multiple listeners. Contrary to message queues, they do not store the message or wait for the listeners to respond. Often, filter patterns can also be used to trigger listeners or not based on the message content.","sidebar":"tutorialSidebar"},"reacting-to-events/message-queues":{"id":"reacting-to-events/message-queues","title":"\ud83d\udce8 Message Queues","description":"Message Queues store the published messages until they are handled by a worker. The worker is unique and predictible. It consumes all messages indifferently of their content.","sidebar":"tutorialSidebar"},"reacting-to-events/messages":{"id":"reacting-to-events/messages","title":"\u2709\ufe0f Messages","description":"Event Sourcing integrates very well with event-driven architectures. In a traditional architecture, you would need to design your system events (or messages for clarity) separately from your data. With Event Sourcing, they can simply broadcast the business events you already designed.","sidebar":"tutorialSidebar"},"reacting-to-events/read-models":{"id":"reacting-to-events/read-models","title":"\ud83d\udcd6 Read Models","description":"Even with snapshots, using the event store for querying needs (like displaying data in a web page) would be slow and inefficient, if not impossible depending on the access pattern.","sidebar":"tutorialSidebar"},"reacting-to-events/snapshots":{"id":"reacting-to-events/snapshots","title":"\ud83d\udcf8 Snapshots","description":"As events pile up in your event stores, the performances and costs of your commands can become an issue.","sidebar":"tutorialSidebar"}}}')}}]);