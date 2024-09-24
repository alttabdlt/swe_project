import React from 'react';
import { Chart } from 'react-google-charts';

interface GanttChartProps {
  data: Array<[string, string, Date, Date, number | null, number, string | null]>;
}

export function GanttChart({ data }: GanttChartProps) {
  return (
    <Chart
      width={'100%'}
      height={'400px'}
      chartType="Gantt"
      loader={<div>Loading Chart</div>}
      data={[
        [
          { type: 'string', label: 'Task ID' },
          { type: 'string', label: 'Task Name' },
          { type: 'date', label: 'Start Date' },
          { type: 'date', label: 'End Date' },
          { type: 'number', label: 'Duration' },
          { type: 'number', label: 'Percent Complete' },
          { type: 'string', label: 'Dependencies' },
        ],
        ...data,
      ]}
      options={{
        height: 400,
        gantt: {
          trackHeight: 30,
        },
      }}
    />
  );
}