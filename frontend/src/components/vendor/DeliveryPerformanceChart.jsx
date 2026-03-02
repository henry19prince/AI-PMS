import { Card, CardContent, Typography } from "@mui/material";
import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";

const COLORS = ["#4caf50", "#f44336"];

const DeliveryPerformanceChart = ({ vendor }) => {

  const data = [
    { name: "On-Time", value: vendor.on_time_deliveries },
    { name: "Late", value: vendor.total_orders - vendor.on_time_deliveries }
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Delivery Performance
        </Typography>

        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              outerRadius={80}
              label={({ percent }) => `${(percent * 100).toFixed(2)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>

            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>

      </CardContent>
    </Card>
  );
};

export default DeliveryPerformanceChart;
