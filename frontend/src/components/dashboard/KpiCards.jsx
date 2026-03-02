import { Grid, Card, CardContent, Typography } from "@mui/material";

const KpiCards = ({ vendors }) => {
  const safeVendors = Array.isArray(vendors) ? vendors : [];
  const total = safeVendors.length;

  const avgScore =
    safeVendors.length === 0
      ? 0
      : (
          safeVendors.reduce((sum, v) => sum + v.reliability_score, 0) /
            safeVendors.length
        ).toFixed(2);

  const highRisk = safeVendors.filter(v => v.reliability_score < 50).length;

  const cards = [
    { label: "Total Vendors", value: total },
    { label: "Average Reliability Score", value: avgScore },
    { label: "High Risk Vendors", value: highRisk },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 2 }}>
      {cards.map((card, i) => (
        <Grid item xs={12} md={4} key={i}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                {card.label}
              </Typography>
              <Typography variant="h4">
                {card.value}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default KpiCards;
