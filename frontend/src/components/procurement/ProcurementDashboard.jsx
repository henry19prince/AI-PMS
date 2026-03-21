// frontend/src/components/procurement/ProcurementDashboard.jsx
import { useEffect, useState } from "react";
import { Grid, Card, CardContent, Typography } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import axios from "../../api/axios";
import DownloadReportButton from "../common/DownloadReportButton";

const ProcurementDashboard = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        axios.get("/procurement/dashboard/").then((res) => setData(res.data));
    }, []);

    if (!data) return <Typography variant="h6" align="center">Loading dashboard...</Typography>;

    const chartData = [
        { name: "Total PR", value: data.total_pr, fill: "#3B82F6" },
        { name: "Approved PR", value: data.approved_pr, fill: "#10B981" },
        { name: "Total PO", value: data.total_po, fill: "#8B5CF6" },
        { name: "Purchased PO", value: data.purchased_po || 0, fill: "#4caf50" },
        { name: "Cancelled PO", value: data.cancelled_po || 0, fill: "#f44336" },
    ];

    return (
        <>
            <Typography variant="h4" gutterBottom>Procurement Dashboard</Typography>
            <DownloadReportButton title="Procurement Report" />

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4}><StatCard title="Total PRs" value={data.total_pr} color="primary" /></Grid>
                <Grid item xs={12} sm={6} md={4}><StatCard title="Pending PRs" value={data.pending_pr} color="warning" /></Grid>
                <Grid item xs={12} sm={6} md={4}><StatCard title="Approved PRs" value={data.approved_pr} color="success" /></Grid>
                <Grid item xs={12} sm={6} md={4}><StatCard title="Total POs" value={data.total_po} color="secondary" /></Grid>
                <Grid item xs={12} sm={6} md={4}><StatCard title="Purchased POs" value={data.purchased_po || 0} color="success" /></Grid>
                <Grid item xs={12} sm={6} md={4}><StatCard title="Cancelled POs" value={data.cancelled_po || 0} color="error" /></Grid>
                <Grid item xs={12} sm={6} md={4}><StatCard title="Total Value" value={`₹ ${data.total_value}`} color="info" /></Grid>
            </Grid>

            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Procurement Overview</Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </>
    );
};

const StatCard = ({ title, value, color }) => (
    <Card>
        <CardContent>
            <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
            <Typography variant="h4" color={color}>{value}</Typography>
        </CardContent>
    </Card>
);

export default ProcurementDashboard;