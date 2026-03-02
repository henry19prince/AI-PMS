import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Typography, Card, CardContent, Grid } from "@mui/material";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import axios from "../api/axios";
import ScoreChip from "../components/common/ScoreChip";
import DeliveryPerformanceChart from "../components/vendor/DeliveryPerformanceChart";
import VendorMonthlyDeliveryChart from "../components/charts/VendorMonthlyDeliveryChart"
import VendorRadarChart from "../components/charts/VendorRadarChart";
import { buildVendorRadarMetrics } from "../components/utils/vendorRadarMetrics";


const VendorDetails = () => {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);

  const [vendors, setVendors] = useState([]);
  const [comparisonVendor, setComparisonVendor] = useState(null);

  const vendorAData = vendor ? buildVendorRadarMetrics(vendor) : null;
  const vendorBData = comparisonVendor
    ? buildVendorRadarMetrics(comparisonVendor)
    : null;

  useEffect(() => {
    loadVendor(id);
  }, [id]);

  const loadVendor = async () => {
    const res = await axios.get(`/vendors/${id}/`);
    setVendor(res.data);
  };
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await axios.get("/vendors/all/");
        setVendors(res.data);
      } catch (err) {
        console.error("Failed to load vendors", err);
      }
    };

  fetchVendors();
}, []);

  if (!vendor) return <Typography>Loading...</Typography>;

  return (
    <>
      <Typography variant="h4" gutterBottom>
        {vendor.name}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Card>
            <CardContent>
              <Typography>Email: {vendor.email}</Typography>
              <Typography>Phone: {vendor.phone}</Typography>
              <Typography>Total Orders: {vendor.total_orders}</Typography>
              <Typography>Average Delivery Days: {vendor.avg_delivery_days}</Typography>
              <Typography>Average Rating: {vendor.avg_rating}</Typography>
              <ScoreChip score={vendor.reliability_score} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4} sx={{width:300}}>
          <DeliveryPerformanceChart vendor={vendor} />
        </Grid>

        <Grid item xs={12} md={4} sx={{width:400  }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                  Delivery Performance
              </Typography>
              <VendorMonthlyDeliveryChart vendorId={vendor.id} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4} sx={{width:450  }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                  Vendor Comparison
              </Typography>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Compare Vendor</InputLabel>

                <Select
                  label="Compare Vendor"
                  value={comparisonVendor?.id || ""}
                  onChange={(e) => {
                    const selectedVendor = vendors.find(
                      v => v.id === Number(e.target.value)
                    );
                    setComparisonVendor(selectedVendor || null);
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300   // 🔥 scroll appears automatically
                      }
                    }
                  }}
                >
                  <MenuItem value="">None</MenuItem>

                  {vendors
                    .filter(v => v.id !== vendor?.id)
                    .map(v => (
                      <MenuItem key={v.id} value={v.id}>
                        {v.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              {vendorAData && (
                <VendorRadarChart vendorA={vendorAData} vendorB={vendorBData} />
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card sx={{ mt: 2, background: "#f8fafc" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                AI Performance Insight
              </Typography>

              {Array.isArray(vendor.ai_explanation) ? (
                vendor.ai_explanation.map((text, i) => (
                  <Typography
                    key={i}
                    variant="body2"
                    sx={{
                      mb: 1,
                      display: "flex",
                      alignItems: "center"
                    }}
                  >
                    • {text}
                  </Typography>
                ))
              ) : (
                <Typography variant="body2">{vendor.ai_explanation}</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default VendorDetails;
