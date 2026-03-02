// src/components/procurement/PRList.jsx (Fixed hook order for conditional return)
import { useEffect, useState } from "react";
import { Box, Button, Card, CardContent, Chip, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import axios from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const PRList = () => {
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, authReady } = useAuth();  // Hooks called first, unconditionally

  const fetchPRs = () => {
    setLoading(true);
    axios.get("/procurement/").then((res) => setPrs(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPRs();
  }, []);

  const approvePR = (id) => {
    setLoading(true);
    axios.patch(`/procurement/approve/${id}/`)
      .then(() => fetchPRs())
      .catch((err) => alert(err.response?.data?.error || "Approval failed"))
      .finally(() => setLoading(false));
  };

  const declinePR = (id) => {
    if (!window.confirm("Decline this PR?")) return;
    setLoading(true);
    axios.patch(`/procurement/decline/${id}/`)
      .then(() => fetchPRs())
      .catch((err) => alert(err.response?.data?.error || "Decline failed"))
      .finally(() => setLoading(false));
  };

  // Split into two sections
  const pendingPrs = prs.filter(pr => pr.status === "PENDING");
  const otherPrs   = prs.filter(pr => pr.status !== "PENDING");

  if (!authReady) return <Typography>Loading user permissions...</Typography>;  // Moved after hooks

  const isManagerOrAdmin = user && ["admin", "procurement_manager"].includes(user.role);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>Purchase Requests</Typography>

      {/* ==================== PENDING SECTION ==================== */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Pending Requests</Typography>
          {pendingPrs.length === 0 ? (
            <Typography color="text.secondary">No pending requests</Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow><TableCell>ID</TableCell><TableCell>Department</TableCell><TableCell>Items</TableCell><TableCell>Vendor</TableCell><TableCell>Total Cost</TableCell><TableCell align="right">Action</TableCell></TableRow>
              </TableHead>
              <TableBody>
                {pendingPrs.map((pr) => (
                  <TableRow key={pr.id}><TableCell>#{pr.id}</TableCell><TableCell>{pr.department}</TableCell><TableCell>{pr.items.map((item) => <Typography key={item.id} variant="body2">{item.item_name} x {item.quantity} (@ ₹{item.estimated_price})</Typography>)}</TableCell><TableCell>{pr.suggested_vendor_name || "N/A"}</TableCell><TableCell>₹ {pr.total_estimated_cost}</TableCell><TableCell align="right">{isManagerOrAdmin ? (<><Button variant="contained" color="success" onClick={() => approvePR(pr.id)} disabled={loading} sx={{ mr: 1 }}>Approve</Button><Button variant="contained" color="error" onClick={() => declinePR(pr.id)} disabled={loading}>Decline</Button></>) : (<Typography color="text.secondary">Staff cannot approve</Typography>)}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ==================== APPROVED / DECLINED SECTION ==================== */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Processed Requests</Typography>
          {otherPrs.length === 0 ? (
            <Typography color="text.secondary">No processed requests yet</Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow><TableCell>ID</TableCell><TableCell>Department</TableCell><TableCell>Items</TableCell><TableCell>Vendor</TableCell><TableCell>Status</TableCell><TableCell>Total Cost</TableCell></TableRow>  
              </TableHead>
              <TableBody>
                {otherPrs.map((pr) => (
                  <TableRow key={pr.id}><TableCell>#{pr.id}</TableCell><TableCell>{pr.department}</TableCell><TableCell>{pr.items.map((item) => <Typography key={item.id} variant="body2">{item.item_name} x {item.quantity} (@ ₹{item.estimated_price})</Typography>)}</TableCell><TableCell>{pr.suggested_vendor_name || "N/A"}</TableCell><TableCell><Chip label={pr.status} color={pr.status === "APPROVED" ? "success" : "warning"} /></TableCell><TableCell>₹ {pr.total_estimated_cost}</TableCell></TableRow>  
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PRList;