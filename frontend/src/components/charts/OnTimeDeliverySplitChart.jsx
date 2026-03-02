import { Card, CardContent, Typography } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#2e7d32", "#f9a825", "#c62828"]; 
// green, yellow, red

const OnTimeDeliverySplitChart = ({ vendors }) => {
  if (!Array.isArray(vendors)) return null;

  const getRate = (v) =>
    v.total_orders > 0
      ? (v.on_time_deliveries / v.total_orders) * 100
      : 0;

  const excellent = vendors.filter(v => getRate(v) >= 90).length;
  const acceptable = vendors.filter(v => {
    const r = getRate(v);
    return r >= 65 && r < 90;
  }).length;
  const poor = vendors.filter(v => getRate(v) < 65).length;

  const data = [
    { name: "Excellent (≥90%)", value: excellent },
    { name: "Acceptable (65–89%)", value: acceptable },
    { name: "Poor (<65%)", value: poor },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          On-Time Delivery Performance Split
        </Typography>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              label
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>

            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default OnTimeDeliverySplitChart;