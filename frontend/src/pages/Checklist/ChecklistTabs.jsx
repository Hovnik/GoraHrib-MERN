const ChecklistTabs = ({ activeTab, setActiveTab }) => (
  <div className="tabs tabs-boxed mb-6">
    <a
      className={`tab ${activeTab === "wishlist" ? "tab-active" : ""}`}
      onClick={() => setActiveTab("wishlist")}
    >
      Želim Osvojiti
    </a>
    <a
      className={`tab ${activeTab === "visited" ? "tab-active" : ""}`}
      onClick={() => setActiveTab("visited")}
    >
      Osvojeni Vrhovi
    </a>
  </div>
);

export default ChecklistTabs;
