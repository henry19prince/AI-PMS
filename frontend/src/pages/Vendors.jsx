import { useEffect, useState } from "react";
import {
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  LinearProgress,
  TextField,
  Box
} from "@mui/material";
import { getVendors, calculateScore } from "../api/vendorApi";
import { useNavigate } from "react-router-dom";


const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);


  const navigate = useNavigate();

  const openVendor = (id) => {
    navigate(`/vendors/${id}`);
  };

  useEffect(() => {
    loadVendors();
  }, [page, search]);

  const loadVendors = async () => {
    const response = await getVendors(page, search);
    setVendors(response.data.results);
    setNext(response.data.next);
    setPrevious(response.data.previous);
  };

  // const handleScore = async (id) => {
  //   await calculateScore(id);
  //   loadVendors();
  // };

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Vendor Management
      </Typography>

      {/* 🔎 SEARCH BOX */}
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Search vendors..."
          variant="outlined"
          fullWidth
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Reliability Score</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {vendors.map((vendor) => (
            <TableRow key={vendor.id}>
              <TableCell>{vendor.name}</TableCell>
              <TableCell>{vendor.email}</TableCell>
              <TableCell>
                {vendor.reliability_score}
                <LinearProgress
                  variant="determinate"
                  value={vendor.reliability_score}
                />
              </TableCell>
              <TableCell>
                {/* <Button
                  variant="contained"
                  onClick={() => handleScore(vendor.id)}
                >
                  Calculate AI Score
                </Button> */}
                <Button onClick={() => openVendor(vendor.id)}>
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* 📄 PAGINATION BUTTONS */}
      <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
        <Button
          disabled={!previous}
          variant="outlined"
          onClick={() => setPage(page - 1)}
        >
          Previous
        </Button>

        <Button
          disabled={!next}
          variant="outlined"
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </Box>
    </>
  );
};

export default Vendors;
