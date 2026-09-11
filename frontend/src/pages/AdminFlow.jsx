import { useEffect, useState } from "react";
import { collection, doc, getDoc, setDoc, updateDoc, deleteField } from "firebase/firestore";
import { db } from "../firebase";

export default function AdminFlowManager() {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newStep, setNewStep] = useState({ title: "", description: "" });

  useEffect(() => {
    async function loadFlow() {
      const ref = doc(db, "Flow", "studentLessons");
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setSteps(snap.data().steps || []);
      }
      setLoading(false);
    }
    loadFlow();
  }, []);

  const saveFlow = async (updatedSteps) => {
    const ref = doc(db, "Flow", "studentLessons");
    await setDoc(ref, { steps: updatedSteps });
    setSteps(updatedSteps);
  };

  const addStep = async () => {
    if (!newStep.title.trim()) return;
    const updated = [...steps, newStep];
    await saveFlow(updated);
    setNewStep({ title: "", description: "" });
  };

  const updateStep = async (index, field, value) => {
    const updated = [...steps];
    updated[index][field] = value;
    await saveFlow(updated);
  };

  const deleteStep = async (index) => {
    const updated = steps.filter((_, i) => i !== index);
    await saveFlow(updated);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin – Manage Student Flow</h1>

      <div className="bg-gray-800 p-4 rounded mb-6">
        <h2 className="text-xl mb-2">Add New Step</h2>
        <input
          className="w-full p-2 mb-2 rounded bg-gray-700"
          placeholder="Title"
          value={newStep.title}
          onChange={(e) => setNewStep({ ...newStep, title: e.target.value })}
        />
        <textarea
          className="w-full p-2 mb-2 rounded bg-gray-700"
          placeholder="Description"
          value={newStep.description}
          onChange={(e) => setNewStep({ ...newStep, description: e.target.value })}
        />
        <button
          onClick={addStep}
          className="bg-blue-500 px-4 py-2 rounded text-white"
        >Add Step</button>
      </div>

      <h2 className="text-xl mb-2">Current Steps</h2>

      {steps.map((step, index) => (
        <div key={index} className="bg-gray-900 p-4 mb-4 rounded">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold">Step {index + 1}</h3>
            <button
              onClick={() => deleteStep(index)}
              className="bg-red-600 px-3 py-1 rounded"
            >Delete</button>
          </div>

          <input
            className="w-full p-2 mb-2 rounded bg-gray-700"
            value={step.title}
            onChange={(e) => updateStep(index, "title", e.target.value)}
          />

          <textarea
            className="w-full p-2 rounded bg-gray-700"
            value={step.description}
            onChange={(e) => updateStep(index, "description", e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
