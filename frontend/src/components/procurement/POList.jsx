// src/components/procurement/POList.jsx (Compact JSX to fix hydration)
import { useEffect, useState } from "react";
import { Box, Card, CardContent, Chip, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import axios from "../../api/axios";

const POList = () => {
  const [pos, setPOs] = useState([]);

  useEffect(() => {
    axios.get("/procurement/po/").then((res) => {
      setPOs(res.data.results || res.data);
      // console.log("PO API response:", res.data);
    });
  }, []);
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>Purchase Orders</Typography>
      {pos.length === 0 ? (
        <Card><CardContent><Typography color="text.secondary">No Purchase Orders found.</Typography></CardContent></Card>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>All Orders</Typography>
            <Table>
              <TableHead>
                <TableRow><TableCell>PO ID</TableCell><TableCell>PR ID</TableCell><TableCell>Items</TableCell><TableCell>Vendor</TableCell><TableCell>Final Cost</TableCell><TableCell>Status</TableCell></TableRow>  
              </TableHead>
              <TableBody>
                {pos.map((po) => {
                  const items = po.purchase_request_items || po.items || [];

                  return (
                    <TableRow key={po.id}>
                      <TableCell>#{po.id}</TableCell>
                      <TableCell>#{po.purchase_request}</TableCell>

                      <TableCell>
                        {items.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            No items
                          </Typography>
                        ) : (
                          items.map((item) => (
                            <Typography key={item.id} variant="body2">
                              {item.item_name} x {item.quantity} (@ ₹{item.estimated_price})
                            </Typography>
                          ))
                        )}
                      </TableCell>

                      <TableCell>{po.supplier_name || "N/A"}</TableCell>
                      <TableCell>₹ {po.final_cost}</TableCell>

                      <TableCell>
                        <Chip
                          label={po.status}
                          color={
                            po.status === "COMPLETED"
                              ? "success"
                              : po.status === "CANCELLED"
                              ? "error"
                              : "warning"
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default POList;