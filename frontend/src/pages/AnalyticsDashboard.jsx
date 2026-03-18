import { useEffect, useState } from "react";
import { Typography, Grid, Card, CardContent, Box } from "@mui/material";
import DownloadReportButton from "../components/common/DownloadReportButton";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar 
} from "recharts";
import axios from "../api/axios";

const AnalyticsDashboard = () => {
  const [trends, setTrends] = useState({ labels: [], spend: [] });
  const [forecast, setForecast] = useState({ forecast_months: [], forecast_values: [] });
  const [outliers, setOutliers] = useState([]);

  useEffect(() => {
    axios.get("/reports/trends/").then(res => setTrends(res.data.data));
    axios.get("/reports/forecast/").then(res => setForecast(res.data));
    axios.get("/reports/outliers/").then(res => setOutliers(res.data.outliers || []));
  }, []);

  // Prepare data for charts
  const trendData = trends.labels.map((label, i) => ({
    month: label,
    spend: trends.spend[i] || 0
  }));

  const forecastData = forecast.forecast_months.map((month, i) => ({
    month: month,
    value: forecast.forecast_values[i] || 0
  }));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Analytics & Decision Intelligence</Typography>

      <DownloadReportButton title="Analytics Report" />   {/* ← ADD THIS */}
      <Grid container spacing={3}>
        
        {/* 1. Monthly Spend Trend */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Monthly Spend Trend</Typography>
              {trendData.length > 0 ? (
                <LineChart width={700} height={300} data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="spend" stroke="#1976d2" strokeWidth={3} />
                </LineChart>
              ) : (
                <Typography color="text.secondary">No sufficient data for trend chart yet.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 2. Spend Forecast */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Spend Forecast (Next 3 Months)</Typography>
              {forecastData.length > 0 ? (
                <BarChart width={350} height={300} data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#4caf50" />
                </BarChart>
              ) : (
                <Typography color="text.secondary">Forecast not available yet.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 3. Outliers */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>High-Cost Outliers Detected</Typography>
              {outliers.length === 0 ? (
                <Typography>No outliers detected.</Typography>
              ) : (
                outliers.map((o, i) => (
                  <Typography key={i} sx={{ mb: 1, color: "error.main" }}>
                    PO #{o.po_id} — ₹{o.cost.toLocaleString()} (High Cost)
                  </Typography>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard;