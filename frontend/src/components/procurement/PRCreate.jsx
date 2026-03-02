// frontend/src/components/procurement/PRCreate.jsx (Fixed label overlap, made vendor required)
import { useEffect, useState } from "react";
import { Box, Button, Card, CardContent, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import axios from "../../api/axios";

const PRCreate = ({ onCreated }) => {  // Add prop for callback
  const [department, setDepartment] = useState("");
  const [inventory, setInventory] = useState([]);
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState([]);  
  const [vendorId, setVendorId] = useState("");  

  const total = quantity && price ? (Number(quantity) * Number(price)).toFixed(2) : "0.00";

  useEffect(() => {
    axios.get("/inventory/items/").then((res) => setInventory(res.data));
    axios.get("/vendors/all/").then((res) => setVendors(res.data.results || res.data));  // Changed to /vendors/ if /vendors/all/ was causing issues
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!department || !itemId || !quantity || !price || !vendorId) return;
    setLoading(true);
    axios.post("/procurement/", { department, suggested_vendor: vendorId ? Number(vendorId) : null, items: [{ item: Number(itemId), quantity: Number(quantity), estimated_price: Number(price) }] })
      .then(() => {
        setDepartment(""); setItemId(""); setQuantity(""); setPrice("");
        if (onCreated) onCreated();  // Call to refresh list
      })
      .catch((err) => {
        console.error(err);
        alert(err.response?.data?.error || 'Creation failed');
      })
      .finally(() => setLoading(false));
  };

  return (
    <Card sx={{ maxWidth: 600, mx: "auto", p: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>Create Purchase Request</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} fullWidth required />
          <FormControl fullWidth>
            <InputLabel id="item-label" required >Item</InputLabel>
            <Select labelId="item-label" value={itemId} onChange={(e) => setItemId(e.target.value)} label="Item" required>
              <MenuItem value="">Select an item</MenuItem>
              {inventory.map((item) => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="vendor-label" required>Select Vendor</InputLabel>
            <Select labelId="vendor-label" value={vendorId} onChange={(e) => setVendorId(e.target.value)} label="Select Vendor" required
              MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300   // 🔥 scroll appears automatically
                      }
                    }
                  }}
            >
              <MenuItem value="">-- Select --</MenuItem>
              {vendors.map((vendor) => <MenuItem key={vendor.id} value={vendor.id}>{vendor.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField type="number" label="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} fullWidth required />
          <TextField type="number" label="Estimated Price (₹)" value={price} onChange={(e) => setPrice(e.target.value)} fullWidth required />
          <Card variant="outlined" sx={{ p: 2, bgcolor: "info.light" }}>
            <Typography variant="h6">Total Estimated Cost: ₹ {total}</Typography>
          </Card>
          <Button type="submit" variant="contained" disabled={loading} fullWidth>{loading ? "Creating..." : "Create"}</Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PRCreate;