import { Chip } from "@mui/material";

const ScoreChip = ({ score }) => {
  let color = "default";

  if (score >= 75) color = "success";
  else if (score >= 50) color = "warning";
  else color = "error";

  return (
    <Chip
      label={`Score: ${score}`}
      color={color}
      variant="filled"
    />
  );
};

export default ScoreChip;
