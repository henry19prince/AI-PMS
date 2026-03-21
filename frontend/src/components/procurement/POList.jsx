// frontend/src/components/procurement/POList.jsx
import { useEffect, useState } from "react";
import { Box, Button, Card, CardContent, Chip, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import axios from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import DownloadReportButton from "../common/DownloadReportButton";

const POList = () => {
    const [pos, setPOs] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user, authReady } = useAuth();

    const fetchPOs = () => {
        setLoading(true);
        axios.get("/procurement/po/").then((res) => setPOs(res.data.results || res.data))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchPOs();
    }, []);

    const updatePOStatus = async (poId, newStatus) => {
        if (!window.confirm(`Change PO status to ${newStatus}?`)) return;

        setLoading(true);
        try {
            await axios.patch(`/procurement/po/${poId}/status/`, { status: newStatus });
            fetchPOs(); // Refresh list
        } catch (err) {
            alert("Failed to update status: " + (err.response?.data?.error || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    

    // Split sections
    const pendingPOs = pos.filter(po => po.status === "CREATED");
    const processedPOs = pos.filter(po => po.status !== "CREATED");

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>Purchase Orders</Typography>
            <DownloadReportButton title="Purchase Order Report" />

            {/* ==================== PENDING SECTION ==================== */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Pending Purchase Orders</Typography>
                    {pendingPOs.length === 0 ? (
                        <Typography color="text.secondary">No pending POs</Typography>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>PO ID</TableCell>
                                    <TableCell>PR ID</TableCell>
                                    <TableCell>Items</TableCell>
                                    <TableCell>Vendor</TableCell>
                                    <TableCell>Final Cost</TableCell>
                                    <TableCell align="right">Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pendingPOs.map((po) => {
                                    const items = po.purchase_request_items || po.items || [];
                                    return (
                                        <TableRow key={po.id}>
                                            <TableCell>#{po.id}</TableCell>
                                            <TableCell>#{po.purchase_request}</TableCell>
                                            <TableCell>
                                                {items.length === 0 ? "No items" : items.map(item => (
                                                    <div key={item.id}>{item.item_name} x {item.quantity}</div>
                                                ))}
                                            </TableCell>
                                            <TableCell>{po.supplier_name || "N/A"}</TableCell>
                                            <TableCell>₹ {po.final_cost}</TableCell>
                                            <TableCell align="right">
                                              <Button
                                                  variant="contained"
                                                  color="success"
                                                  onClick={() => updatePOStatus(po.id, "PURCHASED")}
                                                  disabled={loading}
                                                  sx={{ mr: 1 }}
                                              >
                                                  Mark as Purchased
                                              </Button>
                                              <Button
                                                  variant="contained"
                                                  color="error"
                                                  onClick={() => updatePOStatus(po.id, "CANCELLED")}
                                                  disabled={loading}
                                              >
                                                  Cancel
                                              </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* ==================== PROCESSED SECTION ==================== */}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Processed Purchase Orders</Typography>
                    {processedPOs.length === 0 ? (
                        <Typography color="text.secondary">No processed POs yet</Typography>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>PO ID</TableCell>
                                    <TableCell>PR ID</TableCell>
                                    <TableCell>Items</TableCell>
                                    <TableCell>Vendor</TableCell>
                                    <TableCell>Final Cost</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {processedPOs.map((po) => {
                                    const items = po.purchase_request_items || po.items || [];
                                    return (
                                        <TableRow key={po.id}>
                                            <TableCell>#{po.id}</TableCell>
                                            <TableCell>#{po.purchase_request}</TableCell>
                                            <TableCell>
                                                {items.length === 0 ? "No items" : items.map(item => (
                                                    <div key={item.id}>{item.item_name} x {item.quantity}</div>
                                                ))}
                                            </TableCell>
                                            <TableCell>{po.supplier_name || "N/A"}</TableCell>
                                            <TableCell>₹ {po.final_cost}</TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={po.status} 
                                                    color={po.status === "PURCHASED" ? "success" : "error"} 
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default POList;