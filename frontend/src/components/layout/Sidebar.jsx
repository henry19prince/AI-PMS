// src/components/layout/Sidebar.jsx (Merged with your existing, added procurement links)
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BusinessIcon from "@mui/icons-material/Business";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { useNavigate } from "react-router-dom";

const drawerWidth = 240;

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
    >
      <Toolbar />
      <List>
        <ListItemButton onClick={() => navigate("/dashboard")}>
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>
        <ListItemButton onClick={() => navigate("/vendors")}>
          <ListItemIcon><BusinessIcon /></ListItemIcon>
          <ListItemText primary="Vendors" />
        </ListItemButton>
        <ListItemButton onClick={() => navigate("/procurement/dashboard")}>
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Procurement Dashboard" />
        </ListItemButton>
        <ListItemButton onClick={() => navigate("/procurement/pr")}>
          <ListItemIcon><ShoppingCartIcon /></ListItemIcon>
          <ListItemText primary="Purchase Requests" />
        </ListItemButton>
        <ListItemButton onClick={() => navigate("/procurement/po")}>
          <ListItemIcon><ReceiptIcon /></ListItemIcon>
          <ListItemText primary="Purchase Orders" />
        </ListItemButton>
      </List>
    </Drawer>
  );
};

export default Sidebar;