# 🖐 The 5 Rules of Event Sourcing

## 1 - Do not use read models to validate your commands

Read models are only for read, not for write. They are like cache: Thrashable, re-computable. The events are your source of truth: Use them when you want to validate a command input.

## 2 - Write only at present tense

You MUST NOT write events in the past. Instead, you should write a real-time event, with the current timestamp, that contains information on the future or past events.

You can use the entity [simulator](#⏰-timeline) to simulate the side-effects of such event on the aggregate.

## 3 - Do not write several events on the same aggregate in one command

Say that you have `ORDER_CREATED` and `PRODUCT_ATTACHED_TO_ORDER` events already, and you now want an "order" to be automatically created when a user selects a "product". You may be tempted to re-use those events in your command, on a new "order" aggregate:

- 1: `ORDER_CREATED` (2022-01-01T00:00:00.000Z)
- 2: `PRODUCT_ATTACHED_TO_ORDER` (2022-01-01T00:00:00.000Z)

However, this is not recommended. Depending on your system, your projectors and reactions down the line may not be able to process your events correctly, or in the correct order, which could lead to bugs.

You should rather modify your `ORDER_CREATED` event to optionally contain a `attachedProductId`, or create a new event entirely.

## 4 - Write relations on all sides

In general, creating a relation in one way, say from an "order" to many "products", is easy to do: Simply write the "order" id on the "product" first event. However, in the context of a command (remember that you can't use read models, that can easily re-index), the other way around is tricky: Depending on your implementation (especially in NoSQL), there may not be an easy way to find all the "products" of an "order".

The solution is to write an attachment event on the "order" at the same time that the "product" is created, containing only its order id. This way, you can easily find the order products ids in its aggregate. However, make sure to use transactions: Either all events are written, either none of them is written.

## 5 - Think of re-playability ! In projections, [don't cross the streams](https://www.youtube.com/watch?v=wyKQe_i9yyo)

Events should easily be re-played to re-compute projections.

Crossing aggregates in your projection is ❌ dangerous ❌ It makes re-playability so much harder, because you won't be able to replay an aggregate in isolation!

If you need to display data from several aggregates in a page, simply use several read models, but DO NOT CROSS entities in your projector (you'll notice that it is not doable in this prototype, by design).

For the same reason:

- DO NOT project events from several aggregates, even from the same entity, on the same read model (keep a 1-to-1 mapping and not a N-to-1).
- DO NOT use the data from read models other than the one being updated. And, to avoid race conditions, keep your read model updates as single-transactions (for instance, using `append` operators, or `conditions`) instead of getting and re-pushing.

# ⏰ Timeline

The second rule states that you should always write event at present tense. However, certain events may have side-effects in time. For instance:

- Your event may mean that another event should have been recorded in the past (retroactive event)
- Your event may mean that an event will probably appear at a given date in the future (like an offer expiry).

However, you can, theoretically, already know from the recorded events if such "side-effect" events are allowed or not ! Wouldn't that be neat to disallow them from the get-go, in the command ?

Well, now you can 🥳 That's the goal of the `simulator` property of entities.

A simulator is a reducer: It takes a dictionnary of events (indexed by the index of your choice) and a recorded event, and outputs another dictionnary of events. The default simulators simply adds the recorded event to the dictionary, indexing it by its version.

Simulators are used by the `simulateAggregate` method exposed in the entities states. The logic for simulating the aggregate is the following:

- Apply the simulator to the aggregate events, starting with an empty object.
- Get the resulting events, sort them by timestamp and filter out the events that are after the provided `simulationDate`
- Replace the event versions by their index in the resulting simulated history
- Apply the entity reducer to the simulated event history

You can find an implementation of this in this project (example stack):

- A `/plan-counter-removal` command will add `COUNTER_REMOVAL_PLANNED` event to the counter event history
- In the simulator, this event will add a simulated `COUNTER_REMOVED` event to the aggregate history at a future date (index by its version concatenated with `#1`)
- This fictional event will also be removed by the simulator from the simulated aggregate history by any `COUNTER_REMOVED` events that is actually the result of this planification (to prevent having 2 `COUNTER_REMOVED` events in the simulated history once the date is past)
- When planning another removal, or an increment, the `simulateAggregate` method is used to prevent the planification if the aggregate is projected to have a `REMOVED` status at this date 🥳
