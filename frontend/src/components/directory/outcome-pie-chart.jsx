import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#F44336']; // Customize as needed

const OutcomePieChart = ({ summary }) => {
  const data = [
    {
      name: 'Employed Only',
      value: summary.employed_without_further_education_pct,
    },
    {
      name: 'Further Ed Only',
      value: summary.further_education_without_employment_pct,
    },
    {
      name: 'Both',
      value: summary.both_employed_and_further_education_pct,
    },
    {
      name: 'Neither',
      value: summary.neither_employed_nor_further_education_pct,
    },
  ];

  return (
    <div className="outcome-pie-container">
      <h3 className="outcome-pie-title">Alumni Outcome Distribution</h3>
      <PieChart width={400} height={300}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
};

export default OutcomePieChart;
