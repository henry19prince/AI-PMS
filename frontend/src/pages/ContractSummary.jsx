import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { getContractSummary } from "../services/contractService";

const SummaryCard = ({ title, content }) => (
  <Card sx={{ height: "100%" }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2">
        {content || "Not Found"}
      </Typography>
    </CardContent>
  </Card>
);

export default function ContractSummary() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getContractSummary(id);
      setData(res.data);
    };
    fetchData();
  }, [id]);

  if (!data)
    return (
      <Box textAlign="center" mt={5}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Contract Summary
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <SummaryCard title="Payment Terms" content={data.payment_terms} />
        </Grid>
        <Grid item xs={12} md={6}>
          <SummaryCard title="Penalty Clauses" content={data.penalty_clauses} />
        </Grid>
        <Grid item xs={12} md={6}>
          <SummaryCard title="Delivery Schedule" content={data.delivery_schedule} />
        </Grid>
        <Grid item xs={12} md={6}>
          <SummaryCard title="Contract Duration" content={data.contract_duration} />
        </Grid>
        <Grid item xs={12}>
          <SummaryCard
            title="Compliance Obligations"
            content={data.compliance_obligations}
          />
        </Grid>
        <Grid item xs={12}>
          <SummaryCard title="Full Summary" content={data.full_summary} />
        </Grid>
      </Grid>
    </Box>
  );
}