import { Plus } from "lucide-react";
import { useState } from "react";
import AddPeakToChecklistModal from "../../modals/checklist-modals/add-peak-to-checklist-modal";

const ChecklistHeader = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Moj Seznam Vrhov</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary gap-2"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden md:inline">Dodaj vrh</span>
        </button>
      </div>

      <AddPeakToChecklistModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
};

export default ChecklistHeader;
