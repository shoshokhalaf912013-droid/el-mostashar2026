import { useState } from "react";
import { motion } from "framer-motion";
import VideoUploader from "./VideoUploader";
import PdfUploader from "./PdfUploader";
import "./LessonFlowBuilder.css";

const FLOW_TYPES = [
  { type: "video", label: "فيديو" },
  { type: "pdf", label: "PDF" },
  { type: "text", label: "نص" },
];

export default function LessonFlowBuilder({ initialFlow = [], onChange }) {
  const [flow, setFlow] = useState(initialFlow);
  const [dragIndex, setDragIndex] = useState(null);

  const updateFlow = (newFlow) => {
    setFlow(newFlow);
    onChange?.(newFlow);
  };

  const addFlowItem = (type) => {
    const nextOrder = flow.length + 1;
    updateFlow([
      ...flow,
      { order: nextOrder, type },
    ]);
  };

  const handleDrop = (dropIndex) => {
    if (dragIndex === null || dragIndex === dropIndex) return;

    const updated = [...flow];
    const draggedItem = updated[dragIndex];

    updated.splice(dragIndex, 1);
    updated.splice(dropIndex, 0, draggedItem);

    const reordered = updated.map((item, i) => ({
      ...item,
      order: i + 1,
    }));

    updateFlow(reordered);
    setDragIndex(null);
  };

  const updateItem = (index, data) => {
    const updated = [...flow];
    updated[index] = { ...updated[index], ...data };
    updateFlow(updated);
  };

  return (
    <div className="flow-builder-card">
      <h3 className="flow-title">🧩 محتوى الدرس (Flow)</h3>

      <div className="flow-items">
        {flow.map((item, index) => (
          <motion.div
            key={item.order}
            className="flow-item"
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(index)}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flow-order">{item.order}</div>

            <div className="flow-body">
              <span className="flow-type">
                {item.type.toUpperCase()}
              </span>

              {/* 🎬 VIDEO */}
              {item.type === "video" && (
                <VideoUploader
                  onChange={(url) =>
                    updateItem(index, { videoUrl: url })
                  }
                />
              )}

              {/* 📄 PDF */}
              {item.type === "pdf" && (
                <PdfUploader
                  onChange={(url) =>
                    updateItem(index, { pdfUrl: url })
                  }
                />
              )}

              {/* 📝 TEXT */}
              {item.type === "text" && (
                <textarea
                  className="flow-textarea"
                  placeholder="اكتب نص الشرح هنا..."
                  value={item.text || ""}
                  onChange={(e) =>
                    updateItem(index, { text: e.target.value })
                  }
                />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flow-actions">
        {FLOW_TYPES.map((t) => (
          <button
            key={t.type}
            onClick={() => addFlowItem(t.type)}
            className="flow-add-btn"
          >
            ➕ {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
