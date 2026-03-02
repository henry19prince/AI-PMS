import { useEffect, useState } from "react";
import axios from "../../api/axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from "recharts";
import { useParams } from "react-router-dom";
import MonthlyDeliveryTooltip from '../tooltip/MonthlyDeliveryTooltip'

const VendorMonthlyDeliveryChart = ({ vendorId }) => {
  const { id } = useParams();
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`/vendors/${id}/`);
        // Convert backend keys → chart-friendly keys
        const formatted = res.data.monthly_delivery_stats.map(item => ({
          month: item.month,
          total: item.total,
          onTime: item.onTime,
          late: item.late
        }));

        setData(formatted);
      } catch (err) {
        console.error("Failed to load monthly delivery stats", err);
      }
    };

    fetchStats();
  }, [id]);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 10 }} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
          dataKey="month"
          label={{ value: "Month", position: "insideBottom", offset: -2}}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={40}
        />

        <YAxis
          label={{ value: "Orders", angle: -90, position: "insideLeft" }}
          width={60} allowDecimals={false}
        />

        <Tooltip content={<MonthlyDeliveryTooltip />}/>
        <Legend verticalAlign="bottom" />

        <Bar dataKey="onTime" name="On-Time Deliveries" fill="#4CAF50" />
        <Bar dataKey="late" name="Late Deliveries" fill="#F44336" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default VendorMonthlyDeliveryChart;