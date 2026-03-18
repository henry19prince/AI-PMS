import { Grid, Card, CardContent, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { getVendors } from "../api/vendorApi";
import ScoreDistributionChart from "../components/charts/ScoreDistributionChart";
import TopVendorsChart from "../components/charts/TopVendorsChart";
import KpiCards from "../components/dashboard/KpiCards";
import OnTimeDeliverySplitChart from "../components/charts/OnTimeDeliverySplitChart";
import axios from "../api/axios";
import DownloadReportButton from "../components/common/DownloadReportButton";



const Dashboard = () => {
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const res = await axios.get("/vendors/all/");
    setVendors(Array.isArray(res.data) ? res.data : res.data.results || []);
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <DownloadReportButton title="Dashboard Report" />   {/* ← ADD THIS */}
      <KpiCards vendors={vendors} />
      <Grid container spacing={3}>
        <Grid item xs={12}  md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Supplier Score Distribution
              </Typography>
              <ScoreDistributionChart vendors={vendors} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <TopVendorsChart vendors={vendors} />
        </Grid>
        <Grid item xs={12} md={6}>
          <OnTimeDeliverySplitChart vendors={vendors} />
        </Grid>
      </Grid>
    </>
  );
};


export default Dashboard;
