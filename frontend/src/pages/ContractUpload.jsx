import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  CircularProgress,
} from "@mui/material";
import { uploadContract } from "../services/contractService";

export default function ContractUpload() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [contractId, setContractId] = useState(null);

  const handleSubmit = async () => {
    if (!title || !file) return alert("Please provide all fields");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("document", file);

    try {
      setLoading(true);
      const res = await uploadContract(formData);
      alert("Uploaded & Processing Started");
      setContractId(res.data.id);
    } catch (err) {
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" mt={5}>
      <Card sx={{ width: 500, p: 2 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Contract Intelligence Upload
          </Typography>

          <TextField
            fullWidth
            label="Contract Title"
            margin="normal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Button variant="outlined" component="label" fullWidth>
            Upload Document
            <input
              type="file"
              hidden
              onChange={(e) => setFile(e.target.files[0])}
            />
          </Button>

          {file && (
            <Typography mt={1} variant="body2">
              Selected: {file.name}
            </Typography>
          )}

          <Box mt={3}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Upload & Analyze"}
            </Button>
          </Box>

          {contractId && (
            <Typography mt={2} color="green">
              Contract ID: {contractId}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}