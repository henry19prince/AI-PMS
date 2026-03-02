import { useState } from "react";
import PRCreate from "../components/procurement/PRCreate";
import PRList from "../components/procurement/PRList";

const PRPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreated = () => {
    setRefreshKey((prev) => prev + 1);  // Trigger re-fetch in PRList
  };

  return (
    <>
      <PRCreate onCreated={handleCreated} />
      <PRList key={refreshKey} />  {/* Re-render on create */}
    </>
  );
};

export default PRPage;