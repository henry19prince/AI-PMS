import { Button } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

const DownloadReportButton = ({ title = "Report" }) => {
  const handleDownload = () => {
    // Temporary hide sidebar/navbar
    const sidebar = document.querySelector('.MuiDrawer-root');
    const navbar = document.querySelector('.MuiAppBar-root');
    if (sidebar) sidebar.style.display = 'none';
    if (navbar) navbar.style.display = 'none';

    document.title = `${title} - AI Procurement Management`;
    window.print();

    // Restore (optional, but good practice)
    setTimeout(() => {
      if (sidebar) sidebar.style.display = '';
      if (navbar) navbar.style.display = '';
      document.title = "AI Procurement Management";
    }, 1000);
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