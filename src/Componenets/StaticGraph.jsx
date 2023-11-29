import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StaticGraph = ({ staticFragment }) => {
  const ext = staticFragment || 'Default Value';
  console.log(ext, 'STATIC');

  const initialData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        name: 'Sales of the week',
        data: [6, 3, 9, 8, 2, 4, 6, 3, 9, 8, 2, 4, 6, 3, 9, 8, 2, 4],
      },
    ],
  };

  const [sdata, setsData] = useState(initialData);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 6 }); // Initial visible range
  const [progressbar, setProgressbar] = useState(0); // Progress for the range input

  const handleProgressChange = (event) => {
    const progressValue = parseInt(event.target.value, 10);
    const newStart = progressValue;
    const newEnd = Math.min(initialData.labels.length - 1, progressValue + 6);
    updateVisibleRange(newStart, newEnd);
    setProgressbar(progressValue);
  };

  const updateVisibleRange = (start, end) => {
    setVisibleRange({ start, end });
    const newData = {
      labels: initialData.labels.slice(start, end + 1),
      datasets: [
        {
          name: initialData.datasets[0].name,
          data: initialData.datasets[0].data.slice(start, end + 1),
        },
      ],
    };
    setsData(newData);
  };

  return (
    <div>
      <h1>Chart</h1>
      <div className='w-[1200px] h-[600px]'>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sdata.labels.map((label, index) => ({ name: label, [sdata.datasets[0].name]: sdata.datasets[0].data[index] }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={sdata.datasets[0].name} stroke="aqua" fill="aqua" />
          </LineChart>
        </ResponsiveContainer>
        <div className='text-center'>
          <input
            type="range"
            min="0"
            max={initialData.labels.length - 6}
            value={progressbar}
            onChange={handleProgressChange}
          />
        </div>
      </div>
    </div>
  );
};

export default StaticGraph;
