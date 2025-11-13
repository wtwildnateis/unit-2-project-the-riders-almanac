import { useEffect, useMemo, useState } from "react";
import Button from "../Button/Button";
import "./calendar-theme.css"

const DEFAULT_TYPES = [
    "Group Ride",
    "Bike Race",
    "BMX Jam",
    "Meet Ups",
    "Other",
];

export default function CustomToolbar({
    label,
    onNavigate,
    onTypeFilterChange,   
    currentType = "All",
    availableTypes = DEFAULT_TYPES,
    activeTypes,
    onMultiTypeChange,    
}) {
    const go = (a) => onNavigate && onNavigate(a);

    // parse "October 2025" -> {month:"October", year:"2025"}
    const [month, year] = (label || "").split(" ");

    // Drawer state
    const [open, setOpen] = useState(false);

    // Checked filter state
    const [checked, setChecked] = useState(() =>
        Array.isArray(activeTypes) && activeTypes.length
            ? new Set(activeTypes)
            : currentType && currentType !== "All"
                ? new Set([currentType])
                : new Set()
    );
    useEffect(() => {
        if (Array.isArray(activeTypes)) setChecked(new Set(activeTypes));
    }, [activeTypes]);

    // esc closes drawer
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        if (open) document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open]);

    const emit = (set) => {
        const arr = Array.from(set);
        if (onMultiTypeChange) return onMultiTypeChange(arr);
        if (onTypeFilterChange) return onTypeFilterChange(arr.length === 1 ? arr[0] : "All");
    };

    const toggle = (t) => {
        const next = new Set(checked);
        next.has(t) ? next.delete(t) : next.add(t);
        setChecked(next);
        emit(next);
    };

    const selectAll = () => {
        const next = new Set(availableTypes);
        setChecked(next);
        emit(next);
    };
    const clearAll = () => {
        const next = new Set();
        setChecked(next);
        emit(next);
    };

    return (
        <div className="rbc-toolbar px-2 py-2 relative">
            {/* LEFT GROUP: Filter, Back, Today, Next */}
            <div className="rbc-btn-group">
                {/* Filter / settings pill */}
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="ra-pillbtn ra-pillbtn--icon"
                    title="Filters"
                    aria-label="Filters"
                >
                    {/* settings/funnel icon */}
                    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                        <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            {/* top rail */}
                            <path d="M3 7h18" />
                            {/* top knob */}
                            <circle cx="9" cy="7" r="2" fill="currentColor" stroke="none" />
                            {/* bottom rail */}
                            <path d="M3 17h18" />
                            {/* bottom knob */}
                            <circle cx="15" cy="17" r="2" fill="currentColor" stroke="none" />
                        </g>
                    </svg>
                </button>


                {/* Today */}
                <Button className="ra-pillbtn ra-pillbtn--wide" onClick={() => go("TODAY")}>Today</Button>

                {/* Back */}
                <button
                    type="button"
                    className="ra-pillbtn ra-pillbtn--tall"
                    onClick={() => go("PREV")}
                    aria-label="Previous"
                    title="Previous"
                >
                    ‹
                </button>
            </div>

            {/* Month / Year */}
            <span className="rbc-toolbar-label ra-label">
                <strong className="ra-label-month">{month}</strong>{" "}
                <span className="ra-label-year">{year}</span>
            </span>

            {/* Next arrow */}
            <div className="rbc-btn-group">
                <button
                    type="button"
                    className="ra-pillbtn ra-pillbtn--tall" onClick={() => go("NEXT")}
                    aria-label="Next"
                    title="Next"
                >
                    ›
                </button>
            </div>

            {open && (
                <>
                    <div
                        className="ra-filter-scrim"
                        onClick={() => setOpen(false)}
                        aria-hidden="true"
                    />
                    <aside
                        className="ra-filter-drawer"
                        role="dialog"
                        aria-label="Event filters"
                        onMouseDown={(e) => e.stopPropagation()}  
                        onClick={(e) => e.stopPropagation()}      
                    >
                        <div className="ra-filter-header">
                            <strong>Filters</strong>
                            <button
                                type="button"
                                className="ra-filter-close"
                                onClick={() => setOpen(false)}
                                aria-label="Close filters"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="ra-filter-actions">
                            <button type="button" className="ra-chip" onClick={selectAll}>Select all</button>
                            <button type="button" className="ra-chip" onClick={clearAll}>Clear</button>
                        </div>

                        <ul className="ra-filter-list">
                            {availableTypes.map((t) => (
                                <li key={t}>
                                    <label className="ra-filter-row">
                                        <input
                                            type="checkbox"
                                            checked={checked.has(t)}
                                            onChange={() => toggle(t)}
                                        />
                                        <span>{t}</span>
                                    </label>
                                </li>
                            ))}
                        </ul>

                        <div className="ra-filter-foot">
                            <span className="ra-filter-hint">
                                {checked.size === 0 || checked.size === availableTypes.length
                                    ? "Showing all events"
                                    : `Showing: ${Array.from(checked).join(", ")}`}
                            </span>
                            <button type="button" className="ra-chip" onClick={() => setOpen(false)}>Done</button>
                        </div>
                    </aside>
                </>
            )}
        </div>
    );
}