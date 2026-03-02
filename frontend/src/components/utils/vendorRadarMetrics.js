export function buildVendorRadarMetrics(vendor) {
    if (!vendor) return [];
    const round2 = (num) => Number(num.toFixed(2));
  const onTimeRate =
    vendor.total_orders > 0
      ? (vendor.on_time_deliveries / vendor.total_orders) * 100
      : 0;

  return [
    {
      metric: "Reliability",
      value: round2(vendor.reliability_score),
      vendorName: vendor.name
    },
    {
      metric: "On-time %",
      value: round2(Math.round(onTimeRate)),
      vendorName: vendor.name
    },
    {
      metric: "Speed",
      value: round2(Math.max(0, Math.min(100, (30 - vendor.avg_delivery_days) * 3))),
      vendorName: vendor.name
    },
    {
      metric: "Quality",
      value: round2(vendor.avg_rating * 10), // convert 1-10 → 0-100
      vendorName: vendor.name
    },
    {
      metric: "Experience",
      value: round2(Math.min(vendor.total_orders * (5/4), 100)),
      vendorName: vendor.name
    },
  ];
}