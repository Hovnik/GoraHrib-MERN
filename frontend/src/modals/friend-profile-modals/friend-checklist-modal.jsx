import { X } from "lucide-react";

const FriendChecklistModal = ({
  isOpen,
  onClose,
  checklistPeaks: friendChecklistPeaks,
}) => {
  // Use the checklist peaks prop directly
  const checklistPeaks = friendChecklistPeaks || [];

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl max-h-[90vh] relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-2xl">Seznam Vrhov</h3>
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
                </tr>
              </thead>
              <tbody>
                {checklistPeaks.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-8 text-gray-500">
                      Nima vrhov na seznamu.
                    </td>
                  </tr>
                ) : (
                  checklistPeaks.map((peak) => (
                    <tr key={`${peak.peakId?._id || peak.peakId}`}>
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

export default FriendChecklistModal;
