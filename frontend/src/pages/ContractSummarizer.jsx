import { useState } from "react";
import { 
  Typography, Box, Card, CardContent, Grid, Button, 
  CircularProgress, Alert, Chip, Divider 
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";   // ← Added
import axios from "../api/axios";
import DownloadReportButton from "../components/common/DownloadReportButton";


const ContractSummarizer = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError("");
    } else {
      setError("Please upload a valid PDF file only");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("/contracts/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to process the contract");
    } finally {
      setUploading(false);
    }
  };

  // Clean bullet points for summary
  const summaryPoints = result?.summary 
    ? result.summary
        .replace(/□/g, "•")
        .replace(/\.\s+/g, "• ")
        .split("•")
        .map(s => s.trim())
        .filter(s => s.length > 8)
    : [];

  // Download as PDF
  const downloadAsPDF = () => {
    document.title = `Contract Summary - ${result?.title || "AI Analysis"}`;
    window.print();
    setTimeout(() => document.title = "AI Procurement Management", 800);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Intelligent Contract Summarization</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Upload any supplier contract PDF • AI will extract and structure key clauses
      </Typography>

      {/* Upload Area */}
      <Card sx={{ maxWidth: 720, mx: "auto", mb: 5 }}>
        <CardContent sx={{ textAlign: "center", py: 6 }}>
          <CloudUploadIcon sx={{ fontSize: 90, color: "#1976d2", mb: 3 }} />
          <Typography variant="h6" gutterBottom>Drop your contract PDF here</Typography>

          <input type="file" accept="application/pdf" onChange={handleFileChange} style={{ display: "none" }} id="contract-upload" />
          <label htmlFor="contract-upload">
            <Button variant="contained" component="span" sx={{ mt: 2 }}>
              Choose PDF File
            </Button>
          </label>

          {file && <Typography sx={{ mt: 2, color: "success.main" }}>Selected: {file.name}</Typography>}

          <Button
            variant="contained"
            color="success"
            size="large"
            onClick={handleUpload}
            disabled={!file || uploading}
            sx={{ mt: 2 }}
            startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {uploading ? "AI is Analyzing Contract..." : "Summarize Contract"}
          </Button>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

      {result && (
        <>
          {/* Download Button */}
          <Box sx={{ textAlign: "center", my: 4 }}>
            <DownloadReportButton title={`Contract Summary - ${result.title || file?.name || "Analysis"}`} />
          </Box>
          {/* Contract Summary - Clean Bullet Points */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Contract Summary</Typography>
              
              <Box sx={{ pl: 3, mt: 1 }}>
                {summaryPoints.length > 0 ? (
                  summaryPoints.map((point, i) => (
                    <Typography key={i} variant="body2" sx={{ mb: 1.8, lineHeight: 1.85 }}>
                      • {point}
                    </Typography>
                  ))
                ) : (
                  <Typography variant="body2">{result.summary}</Typography>
                )}
              </Box>

              <Chip label={`AI Confidence: ${result.confidence}%`} color="primary" sx={{ mt: 3 }} />
            </CardContent>
          </Card>

          {/* Key Clauses */}
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>Extracted Key Clauses</Typography>
          <Grid container spacing={3}>
            {Object.entries(result.key_clauses).map(([clause, text]) => (
              <Grid item xs={12} md={6} key={clause}>
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="subtitle1" color="primary" sx={{ fontWeight: "bold", textTransform: "uppercase", mb: 1.5 }}>
                      {clause.replace("_", " ")}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                      {text || "Not explicitly mentioned in the document."}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default ContractSummarizer;