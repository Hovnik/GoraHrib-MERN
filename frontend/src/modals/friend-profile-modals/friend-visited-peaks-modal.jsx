import { X } from "lucide-react";

const FriendVisitedPeaksModal = ({
  isOpen,
  onClose,
  visitedPeaks: friendVisitedPeaks,
}) => {
  // Transform friendVisitedPeaks to checklist format
  const checklist = (friendVisitedPeaks || []).map((vp) => ({
    peakId: vp.peakId,
    status: "Visited",
    visitedDate: vp.visitedDate,
    photos: vp.photos,
  }));
  const visitedPeaks = checklist;

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl max-h-[90vh] relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-2xl">Osvojeni Vrhovi</h3>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="h-80 overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Vrh</th>
                  <th>Višina</th>
                  <th>Datum</th>
                </tr>
              </thead>
              <tbody>
                {visitedPeaks.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-8 text-gray-500">
                      Nima še obiskanih vrhov.
                    </td>
                  </tr>
                ) : (
                  visitedPeaks.map((peak) => (
                    <tr key={peak._id}>
                      <td>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {peak.peakId?.name}
                          </p>
                        </div>
                      </td>
                      <td className="text-gray-600">
                        {peak.peakId?.elevation
                          ? `${peak.peakId.elevation} m`
                          : "-"}
                      </td>
                      <td className="text-gray-600">
                        {peak.visitedDate
                          ? new Date(peak.visitedDate).toLocaleDateString(
                              "sl-SI",
                              {
                                day: "numeric",
                                month: "numeric",
                                year: "numeric",
                              }
                            )
                          : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendVisitedPeaksModal;
