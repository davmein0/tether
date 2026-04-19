import { useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";
import type { CustomStrategyRecord, UserRole } from "../types";
import "./StrategyManager.css";
import "./StrategyManager.css";

type Props = {
  relationshipId: string;
  userId: string;
  userRole: UserRole;
  strategies: CustomStrategyRecord[];
};

type Category =
  | "coping"
  | "motivation"
  | "accountability"
  | "celebration"
  | "other";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "coping", label: "Coping Strategies" },
  { value: "motivation", label: "Motivation Boosters" },
  { value: "accountability", label: "Accountability Tactics" },
  { value: "celebration", label: "Celebration Methods" },
  { value: "other", label: "Other" },
];

export default function StrategyManager({
  relationshipId,
  userId,
  strategies,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("coping");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddStrategy = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Strategy name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "customStrategies"), {
        relationshipId,
        name: name.trim(),
        description: description.trim(),
        category,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setName("");
      setDescription("");
      setCategory("coping");
    } catch (error) {
      console.error("Error adding strategy:", error);
      alert("Failed to add strategy");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStrategy = async (strategyId: string) => {
    if (!confirm("Delete this strategy?")) return;

    try {
      await deleteDoc(doc(db, "customStrategies", strategyId));
    } catch (error) {
      console.error("Error deleting strategy:", error);
      alert("Failed to delete strategy");
    }
  };

  const groupedStrategies = CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat.value] = strategies.filter((s) => s.category === cat.value);
      return acc;
    },
    {} as Record<Category, CustomStrategyRecord[]>,
  );

  return (
    <div className="strategy-manager">
      <form className="strategy-form" onSubmit={handleAddStrategy}>
        <h3 className="form-title">Add New Strategy</h3>

        <div className="form-group">
          <label className="form-label" htmlFor="strategy-name">
            Strategy Name
          </label>
          <input
            id="strategy-name"
            className="form-input"
            type="text"
            placeholder="e.g., 10-minute walk break"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="strategy-desc">
            Description
          </label>
          <textarea
            id="strategy-desc"
            className="form-textarea"
            placeholder="How does this strategy work? When should it be used?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            rows={3}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="strategy-category">
            Category
          </label>
          <select
            id="strategy-category"
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            disabled={isSubmitting}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <button className="form-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Strategy"}
        </button>
      </form>

      <div className="strategies-list">
        {CATEGORIES.map((category) => {
          const categoryStrategies = groupedStrategies[category.value];

          if (categoryStrategies.length === 0) return null;

          return (
            <div key={category.value} className="strategy-category">
              <h4 className="category-title">{category.label}</h4>
              <div className="category-items">
                {categoryStrategies.map((strategy) => (
                  <div className="strategy-item" key={strategy.id}>
                    <div className="strategy-info">
                      <p className="strategy-item-name">{strategy.name}</p>
                      {strategy.description && (
                        <p className="strategy-item-desc">
                          {strategy.description}
                        </p>
                      )}
                    </div>
                    <button
                      className="strategy-delete"
                      onClick={() => handleDeleteStrategy(strategy.id)}
                      title="Delete strategy"
                      type="button"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {strategies.length === 0 && (
          <p className="no-strategies">
            No custom strategies yet. Add one to get started!
          </p>
        )}
      </div>
    </div>
  );
}
