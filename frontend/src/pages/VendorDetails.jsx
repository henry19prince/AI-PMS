import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Typography, Card, CardContent, Grid, Box, Chip} from "@mui/material";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import axios from "../api/axios";
import ScoreChip from "../components/common/ScoreChip";
import DeliveryPerformanceChart from "../components/vendor/DeliveryPerformanceChart";
import VendorMonthlyDeliveryChart from "../components/charts/VendorMonthlyDeliveryChart";
import VendorRadarChart from "../components/charts/VendorRadarChart";
import { buildVendorRadarMetrics } from "../components/utils/vendorRadarMetrics";
import DownloadReportButton from "../components/common/DownloadReportButton";

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
      try {
          // Force fresh data (cache buster)
        const res = await axios.get(`/vendors/${id}/?t=${Date.now()}`);
          
          console.log("🔍 API Response from Backend:", res.data);   // ←←← DEBUG LINE
          
          setVendor(res.data);
      } catch (err) {
          console.error("Failed to load vendor", err);
      }
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

      <DownloadReportButton title={vendor.name} />   {/* ← ADD THIS */}

      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Card>
            <CardContent>
              <Typography>Email: {vendor.email}</Typography>
              <Typography>Phone: {vendor.phone}</Typography>
              <Typography>Total Orders: {vendor.total_orders}</Typography>
              <Typography>Average Delivery Days: {vendor.avg_delivery_days}</Typography>
              <Typography>Average Rating: {vendor.avg_rating}</Typography>
              {/* New: AI Risk Score (placeholder for AI integration) */}
              <Typography sx={{ mt: 1 }}>
                AI Risk Score: {vendor.ai_risk_score || 0}/100
              </Typography>
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
       {/* AI Risk Explanation - Pretty Version */}
        <Grid item xs={12}>
          <Card sx={{ mt: 2, bgcolor: "background.paper" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="error.main" sx={{ fontWeight: "bold" }}>
                Risk Explanation
              </Typography>

              {/* Big Risk Score */}
              <Typography variant="h3" sx={{ mb: 2, fontWeight: "bold", color: "#d32f2f" }}>
                {vendor.ai_risk_score || 0}
                <span style={{ fontSize: "0.55em", color: "#666", marginLeft: "4px" }}>/100</span>
              </Typography>

              {/* Risk Level Badge */}
              <Box sx={{ mb: 3 }}>
                {vendor.ai_risk_score >= 75 ? (
                  <Chip label="HIGH RISK" color="error" sx={{ fontWeight: "bold", fontSize: "0.9rem" }} />
                ) : vendor.ai_risk_score >= 50 ? (
                  <Chip label="MEDIUM RISK" color="warning" sx={{ fontWeight: "bold", fontSize: "0.9rem" }} />
                ) : (
                  <Chip label="LOW RISK" color="success" sx={{ fontWeight: "bold", fontSize: "0.9rem" }} />
                )}
              </Box>

              {/* SHAP AI Explanation - Clean Bullets */}
              <Typography variant="subtitle2" sx={{ mb: 1, color: "#666", fontWeight: "bold" }}>
                AI Analysis:
              </Typography>

              {vendor.ai_explanation && vendor.ai_explanation.includes("SHAP AI Analysis:") ? (
                <Box sx={{ pl: 2 }}>
                  {vendor.ai_explanation
                    .replace("**SHAP AI Analysis:** ", "")
                    .split(" • ")
                    .map((point, i) => (
                      <Typography
                        key={i}
                        variant="body2"
                        sx={{ mb: 1, display: "flex", alignItems: "flex-start" }}
                      >
                        • {point.trim()}
                      </Typography>
                    ))}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {vendor.ai_explanation || "No risk explanation available yet."}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default VendorDetails;