import { O } from "ts-toolbelt";

import { EventDetail } from "./eventDetail";
import { EventStore } from "./eventStore";

export const buildMockEventsFn =
  <E extends EventStore>(
    aggregateIdMock: string
  ): ((
    ...partialDetails: (E["_types"]["eventDetails"] extends infer U
      ? U extends EventDetail
        ? O.Optional<
            Pick<
              U,
              "aggregateId" | "version" | "type" | "timestamp" | "payload"
            >,
            "aggregateId",
            "flat"
          >
        : never
      : never)[]
  ) => E["_types"]["eventDetails"][]) =>
  (
    ...partialEvents: (E["_types"]["eventDetails"] extends infer U
      ? U extends EventDetail
        ? O.Optional<
            Pick<
              U,
              "aggregateId" | "version" | "type" | "timestamp" | "payload"
            >,
            "aggregateId",
            "flat"
          >
        : never
      : never)[]
  ): E["_types"]["eventDetails"][] =>
    partialEvents.map((partialEvent) =>
      Object.assign({ aggregateId: aggregateIdMock }, partialEvent)
    );
