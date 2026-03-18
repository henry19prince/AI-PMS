import { Button } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

const DownloadReportButton = ({ title = "Report" }) => {
  const handleDownload = () => {
    // Temporary title for PDF
    const originalTitle = document.title;
    document.title = `${title} - AI Procurement Management System`;

    // Trigger print
    window.print();

    // Restore original title after printing
    setTimeout(() => {
      document.title = originalTitle;
    }, 500);
  };

  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<DownloadIcon />}
      onClick={handleDownload}
      sx={{ mb: 3 }}
    >
      Download Report as PDF
    </Button>
  );
};

export default DownloadReportButton;