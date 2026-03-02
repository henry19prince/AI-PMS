const MonthlyDeliveryTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div style={{
        background: "#fff",
        padding: "10px",
        border: "1px solid #ccc"
      }}>
        <p><strong>{label}</strong></p>
        <p>Total Deliveries: {data.total}</p>
        <p style={{ color: "#4CAF50" }}>On-Time: {data.onTime}</p>
        <p style={{ color: "#F44336" }}>Late: {data.late}</p>
      </div>
    );
  }
  return null;
};
export default MonthlyDeliveryTooltip 