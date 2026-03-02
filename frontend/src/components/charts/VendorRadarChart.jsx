import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  Tooltip,
} from "recharts";
import { ResponsiveContainer } from "recharts";

export default function VendorRadarChart({ vendorA, vendorB }) {
  const data = vendorA.map((item, i) => ({
    metric: item.metric,
    A: item.value,
    B: vendorB ? vendorB[i].value : null,
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="metric" />
        <PolarRadiusAxis domain={[0, 100]} />

        <Radar
          name={vendorA[0]?.vendorName || "Selected Vendor"}
          dataKey="A"
          stroke="#2563eb"
          fill="#2563eb"
          fillOpacity={0.3}
        />

        {vendorB && (
          <Radar
            name={vendorB[0]?.vendorName || "Comparison Vendor"}
            dataKey="B"
            stroke="#dc2626"
            fill="#dc2626"
            fillOpacity={0.4}
          />
        )}

        <Tooltip />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
}