import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Card,
  CardContent,
  Pagination,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

import { EventDetail, EventStore } from '@castore/event-store';

import { JsonView } from 'components/JsonView';

import { formatDate } from '../../libs/utils';

export const AggregateCard = ({
  eventStore,
  aggregateId,
  events,
}: {
  aggregateId: string;
  eventStore: EventStore;
  events: EventDetail[];
}): JSX.Element => {
  const firstEventDate = events[0]?.timestamp as string | undefined;
  const maxVersion = events.length;

  const [aggregateTargetVersion, setAggregateTargetVersion] = useState(
    events.length,
  );

  const aggregate = eventStore.buildAggregate(
    events.filter(({ version }) => version <= aggregateTargetVersion),
  );

  return (
    <Paper elevation={2}>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h5" component="div">
              {aggregateId}
            </Typography>
            <Typography color="text.secondary">
              {firstEventDate !== undefined
                ? formatDate(firstEventDate)
                : undefined}
            </Typography>
            <Pagination
              page={aggregateTargetVersion}
              count={maxVersion}
              variant="outlined"
              shape="rounded"
              onChange={(_, version) => setAggregateTargetVersion(version)}
            />
            <JsonView src={aggregate} />
            <Accordion variant="outlined" sx={{ backgroundColor: '#f9f9f9' }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography>Events</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {events
                    .sort((eventA, eventB) =>
                      eventA.timestamp < eventB.timestamp ? -1 : 1,
                    )
                    .map(({ type, payload, timestamp, version }, index) => (
                      <Accordion
                        key={`${aggregateId}_${index}`}
                        variant="outlined"
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls="panel1a-content"
                          id="panel1a-header"
                        >
                          <Typography>
                            {[version, type, formatDate(timestamp)].join(' - ')}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <JsonView src={payload} />
                        </AccordionDetails>
                      </Accordion>
                    ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Stack>
        </CardContent>
      </Card>
    </Paper>
  );
};
