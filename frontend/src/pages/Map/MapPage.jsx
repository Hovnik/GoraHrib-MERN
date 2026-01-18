import {
  useEffect,
  useState,
  useRef,
  useMemo,
  useDeferredValue,
  useCallback,
} from "react";
import toast from "react-hot-toast";
import api from "../../config/axios";
import { Search, X } from "lucide-react";
import PeakMap from "./PeakMap.jsx";

const MapPage = () => {
  const [peaks, setPeaks] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [friendsPeaksData, setFriendsPeaksData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const fuseRef = useRef(null);
  const [suppressSearchOpen, setSuppressSearchOpen] = useState(false);
  const [selectedPeak, setSelectedPeak] = useState(null);
  const [openPopupForPeakId, setOpenPopupForPeakId] = useState(null);
  const searchRef = useRef(null);
  const resultsRef = useRef(null);
  const inputRef = useRef(null);
  const suppressTimeoutRef = useRef(null);
  const popupTimeoutRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const [peaksRes, checklistRes, friendsPeaksRes] = await Promise.all([
          api.get("/peaks"),
          token
            ? api
                .get("/api/checklist")
                .catch(() => ({ data: { checklist: [] } }))
            : Promise.resolve({ data: { checklist: [] } }),
          token
            ? api
                .get("/api/friends/peaks-visited")
                .catch(() => ({ data: { peakData: {} } }))
            : Promise.resolve({ data: { peakData: {} } }),
        ]);

        // Precompute lowercase fields to avoid calling toLowerCase on every keystroke
        const processedPeaks = (peaksRes.data.peaks || []).map((p) => ({
          ...p,
          _lcName: (p.name || "").toLowerCase(),
          _lcRange: (p.mountainRange || "").toLowerCase(),
        }));
        setPeaks(processedPeaks);
        setChecklist(checklistRes.data.checklist);
        setFriendsPeaksData(friendsPeaksRes.data.peakData || {});
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load peaks");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Detect mobile screen size
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle clicks outside search dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
        // collapse mobile-expanded search when clicking outside
        if (isMobile && searchExpanded) setSearchExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // focus input when mobile search expands
  useEffect(() => {
    if (searchExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchExpanded]);

  const handleAddToChecklist = useCallback(async (peakId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please sign in to add peaks to checklist");
        return;
      }

      await api.post(`/api/checklist/${peakId}`);

      // Refresh checklist
      const checklistRes = await api.get("/checklist");
      setChecklist(checklistRes.data.checklist);
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to add peak to checklist");
      }
    }
  }, []);

  // Memoized filtered peaks - only recalculates when searchQuery or peaks change
  // Use deferred searchQuery to keep input responsive while expensive filtering runs
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const filteredPeaks = useMemo(() => {
    const q = (deferredSearchQuery || "").trim();
    if (q.length < 2) return [];

    // Use Fuse.js if available for fuzzy search
    if (fuseRef.current) {
      return fuseRef.current
        .search(q)
        .slice(0, 5)
        .map((r) => r.item);
    }

    const query = q.toLowerCase();
    return peaks
      .filter(
        (peak) =>
          peak._lcName?.includes(query) || peak._lcRange?.includes(query),
      )
      .slice(0, 5);
  }, [deferredSearchQuery, peaks]);

  // Update search results and visibility when filtered results change
  useEffect(() => {
    setSearchResults(filteredPeaks);
    // If a peak was just selected, suppress reopening the dropdown briefly
    if (suppressSearchOpen) {
      setShowSearchResults(false);
      return;
    }

    const shouldShow = filteredPeaks.length > 0 && searchQuery.length >= 2;
    setShowSearchResults(shouldShow);

    // Reset highlighted index when results change / dropdown opens
    setHighlightedIndex(shouldShow && filteredPeaks.length > 0 ? 0 : -1);
  }, [filteredPeaks, searchQuery]);

  // Scroll highlighted result into view when it changes
  useEffect(() => {
    if (resultsRef.current && highlightedIndex >= 0) {
      const child = resultsRef.current.children[highlightedIndex];
      if (child && typeof child.scrollIntoView === "function") {
        child.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex]);

  // Handle peak selection from search
  const handlePeakSelect = (peak) => {
    if (peak.location?.coordinates?.length === 2) {
      // Close any active popups first
      setOpenPopupForPeakId(null);

      // Clear any pending timeouts from previous selections
      if (suppressTimeoutRef.current) clearTimeout(suppressTimeoutRef.current);
      if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);

      const [longitude, latitude] = peak.location.coordinates;

      // Calculate distance from current map center to target peak
      let distance = 2.0; // Default to max distance if map not ready
      if (mapRef.current) {
        const currentCenter = mapRef.current.getCenter();
        const currentLat = currentCenter.lat;
        const currentLng = currentCenter.lng;
        const latDiff = Math.abs(latitude - currentLat);
        const lngDiff = Math.abs(longitude - currentLng);
        distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
      }

      // Scale duration based on distance: 1s min, 3s max
      // Distance ~0 = 1s, Distance ~2 (across Slovenia) = 3s
      const duration = Math.min(Math.max(1.0 + distance * 1.0, 1.0), 3.0);
      const popupDelay = duration * 1000 + 100; // Wait for animation + 100ms buffer

      // Use lower zoom on mobile to prevent tile loading issues
      const targetZoom = isMobile ? 14 : 16;
      setSelectedPeak({
        center: [latitude, longitude],
        zoom: targetZoom,
        duration,
      });
      setSearchQuery(peak.name);
      // prevent the search-results effect from re-opening the dropdown
      setSuppressSearchOpen(true);
      setShowSearchResults(false);
      // Collapse search on mobile when peak is selected
      if (isMobile) {
        setSearchExpanded(false);
      }
      // Clear suppression after the map flyTo and cluster expansion settle
      suppressTimeoutRef.current = setTimeout(
        () => setSuppressSearchOpen(false),
        popupDelay,
      );
      // Trigger popup to open for this peak after a delay to ensure map has moved and markers uncluster
      popupTimeoutRef.current = setTimeout(() => {
        setOpenPopupForPeakId(peak._id);
      }, popupDelay);
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
    setSelectedPeak(null);
    setOpenPopupForPeakId(null);
  };

  return (
    <div className="fixed top-16 left-0 md:left-20 right-0 bottom-0 md:bottom-0 pb-16 md:pb-0">
      {/* Style popup close button to match modal X button */}
      <style>{`
        .leaflet-popup-close-button {
          width: 2rem !important;
          height: 2rem !important;
          top: 0.5rem !important;
          right: 0.5rem !important;
          padding: 0 !important;
          border-radius: 9999px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 1.25rem !important;
          font-weight: 400 !important;
          line-height: 1 !important;
          color: currentColor !important;
          background-color: transparent !important;
          transition: background-color 0.2s ease !important;
        }
        
        .leaflet-popup-close-button:hover {
          background-color: rgba(0, 0, 0, 0.05) !important;
        }
        
        .leaflet-popup-close-button:active {
          background-color: rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>

      {/* Search Bar */}
      {/* Mobile circular button when search is collapsed */}
      {isMobile && !searchExpanded && (
        <button
          onClick={() => setSearchExpanded(true)}
          className="absolute top-4 right-4 z-[1100] bg-white p-3 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all duration-200 flex items-center justify-center"
          aria-label="Open search"
        >
          <Search className="w-5 h-5 text-gray-600" />
        </button>
      )}

      <div
        ref={searchRef}
        className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] transition-all duration-300 ${
          isMobile && !searchExpanded
            ? "opacity-0 pointer-events-none scale-95"
            : "opacity-100 w-11/12 md:w-96"
        }`}
      >
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            ref={inputRef}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() =>
              searchResults.length > 0 && setShowSearchResults(true)
            }
            onKeyDown={(e) => {
              // Arrow navigation and selection
              if (!showSearchResults || searchResults.length === 0) return;
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlightedIndex((idx) =>
                  Math.min(idx + 1 < 0 ? 0 : idx + 1, searchResults.length - 1),
                );
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlightedIndex((idx) => Math.max(idx - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                if (
                  highlightedIndex >= 0 &&
                  highlightedIndex < searchResults.length
                ) {
                  handlePeakSelect(searchResults[highlightedIndex]);
                }
              } else if (e.key === "Escape") {
                setShowSearchResults(false);
                if (isMobile) setSearchExpanded(false);
              }
            }}
            placeholder="Išči vrh..."
            className="w-full pl-10 pr-10 py-3 rounded-lg shadow-lg border-2 border-gray-300 focus:border-green-500 focus:outline-none bg-white"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          {/* Smart close button: on mobile collapses search, on desktop just clears */}
          {(searchQuery || (isMobile && searchExpanded)) && (
            <button
              onClick={() => {
                if (searchQuery) {
                  // If there's text, clear it first
                  handleClearSearch();
                } else if (isMobile && searchExpanded) {
                  // If no text on mobile, collapse the search
                  setSearchExpanded(false);
                }
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={searchQuery ? "Clear search" : "Close search"}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && searchResults.length > 0 && (
          <div
            ref={resultsRef}
            className="absolute w-full mt-2 bg-white rounded-lg shadow-xl border-2 border-gray-200 max-h-96 overflow-y-auto"
          >
            {searchResults.map((peak, index) => (
              <div
                key={peak._id}
                onClick={() => handlePeakSelect(peak)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                  index === highlightedIndex ? "bg-gray-200" : ""
                }`}
              >
                <div className="font-semibold text-gray-800">{peak.name}</div>
                <div className="text-sm text-gray-600">
                  {peak.elevation}m • {peak.mountainRange}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results message */}
        {showSearchResults &&
          searchQuery.length >= 2 &&
          searchResults.length === 0 && (
            <div className="absolute w-full mt-2 bg-white rounded-lg shadow-xl border-2 border-gray-200 px-4 py-3">
              <div className="text-gray-500 text-center">
                Ni bilo najdenega vrha
              </div>
            </div>
          )}
      </div>

      <PeakMap
        peaks={peaks}
        checklist={checklist}
        friendsPeaksData={friendsPeaksData}
        loading={loading}
        isMobile={isMobile}
        selectedPeak={selectedPeak}
        openPopupForPeakId={openPopupForPeakId}
        onAddToChecklist={handleAddToChecklist}
        setOpenPopupForPeakId={setOpenPopupForPeakId}
        mapRef={mapRef}
      />
    </div>
  );
};

export default MapPage;
