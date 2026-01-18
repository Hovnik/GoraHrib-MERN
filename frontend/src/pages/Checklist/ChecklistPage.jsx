import { useState } from "react";
import ChecklistHeader from "./ChecklistHeader.jsx";
import ChecklistTabs from "./ChecklistTabs.jsx";
import ChecklistTable from "./ChecklistTable.jsx";

const ChecklistPage = () => {
  const [activeTab, setActiveTab] = useState("wishlist");

  return (
    <div className="p-2">
      <ChecklistHeader />
      <ChecklistTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <ChecklistTable activeTab={activeTab} />
    </div>
  );
};

export default ChecklistPage;
