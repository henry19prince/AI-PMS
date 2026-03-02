import { Card, CardContent, Typography } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

const TopVendorsChart = ({ vendors }) => {

  // sort by score and take top 5
  const top = [...vendors]
    .sort((a, b) => b.reliability_score - a.reliability_score)
    .slice(0, 5);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Top Vendors by Reliability Score
        </Typography>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={top} layout="vertical" margin={{ left: 30 }}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis type="number" domain={[0, 100]} />
            <YAxis dataKey="name" type="category" width={70} />

            <Tooltip />

            <Bar
              dataKey="reliability_score"
              fill="#1976d2"
              radius={[0, 6, 6, 0]}
              barSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default TopVendorsChart;
