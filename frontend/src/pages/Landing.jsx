import { Box, Button, Typography, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  return (
    <Container maxWidth="md" sx={{ mt: 15, textAlign: "center" }}>
      <Typography variant="h3" gutterBottom>
        AI Procurement Management System
      </Typography>

      <Typography variant="h6" color="text.secondary" sx={{ mb: 5 }}>
        Vendor intelligence • Risk scoring • Procurement automation
      </Typography>

      <Box>
        {token ? (
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </Button>
        ) : (
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/login")}
          >
            Login to System
          </Button>
        )}
      </Box>
    </Container>
  );
};

export default Landing;
