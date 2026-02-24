import { useState, useRef, useEffect } from "react";
import { RiArrowDownSLine, RiCloseLine } from "@remixicon/react";

export default function FilterDropdown({
  label,
  options,
  selected = [],
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggleOption = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const clearAll = (e) => {
    e.stopPropagation();
    onChange([]);
  };

  const hasSelection = selected.length > 0;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
          hasSelection
            ? "bg-blue-50 border-blue-200 text-blue-700"
            : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
        }`}
      >
        <span>{label}</span>
        {hasSelection && (
          <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-4.5 text-center">
            {selected.length}
          </span>
        )}
        <RiArrowDownSLine
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full mt-1 right-0 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1 max-h-64 overflow-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
            <span className="text-xs font-medium text-gray-500">
              {label}: {hasSelection ? `${selected.length} selected` : "All"}
            </span>
            {hasSelection && (
              <button
                onClick={clearAll}
                className="text-[10px] text-red-500 hover:text-red-700"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Options */}
          {options.map((option) => (
            <label
              key={option}
              className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => toggleOption(option)}
                className="w-3.5 h-3.5 rounded border-gray-300 text-blue-500 focus:ring-blue-500 focus:ring-1"
              />
              <span className="text-xs text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
