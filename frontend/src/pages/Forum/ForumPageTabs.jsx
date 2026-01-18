const ForumPageTabs = ({ activeCategory, setActiveCategory }) => {
  return (
    <div className="tabs tabs-boxed mb-6">
      <a
        className={`tab ${activeCategory === "All" ? "tab-active" : ""}`}
        onClick={() => setActiveCategory("All")}
      >
        Vse Objave
      </a>
      <a
        className={`tab ${activeCategory === "Hike" ? "tab-active" : ""}`}
        onClick={() => setActiveCategory("Hike")}
      >
        Pohodi
      </a>
      <a
        className={`tab ${
          activeCategory === "Achievement" ? "tab-active" : ""
        }`}
        onClick={() => setActiveCategory("Achievement")}
      >
        Dosežki
      </a>
    </div>
  );
};

export default ForumPageTabs;
