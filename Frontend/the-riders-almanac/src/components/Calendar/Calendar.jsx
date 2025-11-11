import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";
import AddEventModal from "./EventModal";
import { enUS } from "date-fns/locale/en-US";
import ViewEventModal from "./ViewEventModal";
import CustomToolbar from "./CustomToolbar";
import { addMonths, subMonths, startOfToday, startOfMonth, endOfMonth } from "date-fns";
import { useAuthStore } from "../../stores/auth";
import { canEditEvent, canDeleteEvent } from "./CalendarAuth";

import { listEvents, createEvent, updateEvent, deleteEvent } from "../../lib/eventsApi";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const EventCalendar = () => {
    const { user, hasAnyRole } = useAuthStore(); // permission checks
    const [events, setEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [viewModalPosition, setViewModalPosition] = useState({ top: 0, left: 0 });
    const [showModal, setShowModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const [editingEvent, setEditingEvent] = useState(null);
    const [eventTypeFilter, setEventTypeFilter] = useState("All");
    const [currentDate, setCurrentDate] = useState(new Date());
    const [loading, setLoading] = useState(false);

    const [refreshKey, setRefreshKey] = useState(0);
    const refresh = useCallback(() => setRefreshKey(k => k + 1), []);


    // Sets date range for current month
    const { from, toDate } = useMemo(() => {
        return {
            from: startOfMonth(currentDate),
            toDate: endOfMonth(currentDate),
        };
    }, [currentDate]);

    const getNextDate = (action, current) => {
        switch (action) {
            case "TODAY":
                return startOfToday();
            case "PREV":
                return subMonths(current, 1);
            case "NEXT":
                return addMonths(current, 1);
            default:
                return current;
        }
    };

    // Fetch events for the current month and map to RBC objects
    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const data = await listEvents({ from: from.toISOString(), to: toDate.toISOString() });
            // Expects backend EventResponse with fields: id,title,type,flyer,start,end,street,city,state,zip,description
            const mapped = (data || []).map((e) => ({
                ...e,
                start: new Date(e.start),
                end: new Date(e.end),
                location:
                    e.location ||
                    [e.street, e.city, e.state, e.zip].filter(Boolean).join(", "),
            }));
            setEvents(mapped);
        } catch (err) {
            console.error("Failed to load events:", err);
        } finally {
            setLoading(false);
        }
    }, [from, toDate]);

    const lastRangeRef = useRef("");
    useEffect(() => {
        const key = `${from.toISOString()}_${toDate.toISOString()}`;
        if (lastRangeRef.current === key) return;
        lastRangeRef.current = key;
        fetchEvents();
    }, [from, toDate, refreshKey, fetchEvents]);

    const filteredEvents =
        eventTypeFilter === "All" ? events : events.filter((e) => e.type === eventTypeFilter);

    // Currently keeps add event modal positioning locked to the clicked day, going to change this on polishing
    const CustomDateCellWrapper = ({ value, children }) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const date = new Date(value);
        date.setHours(0, 0, 0, 0);
        const isPast = date < today;
        const stringDate = date.toISOString();

        return (
            <div
                className={`rbc-day-bg ${isPast ? "rbc-day-disabled" : ""}`}
                data-date={stringDate}
                style={{ height: "100%" }}
            >
                {children}
            </div>
        );
    };

    // Prevents adding events to past days
    const handleDateClick = (slotInfo) => {
        const selected = new Date(slotInfo.start);
        const today = new Date();
        selected.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        if (selected < today) {
            alert("You can't add events to past dates.");
            return;
        }

        const allCells = document.querySelectorAll(".rbc-day-bg");
        const clickedDate = slotInfo.start;
        let foundCell = null;
        allCells.forEach((cell) => {
            const cellDate = cell.getAttribute("data-date");
            if (cellDate) {
                const cellTime = new Date(cellDate).toDateString();
                if (cellTime === new Date(clickedDate).toDateString()) {
                    foundCell = cell;
                }
            }
        });

        if (foundCell) {
            const rect = foundCell.getBoundingClientRect();
            const calendarContainer = document.querySelector(".calendarcontainer");
            const containerRect = calendarContainer.getBoundingClientRect();
            setModalPosition({
                top: rect.top - containerRect.top,
                left: rect.left - containerRect.left,
            });
        }

        setSelectedDate(slotInfo.start);
        setShowModal(true);
    };

    // Add's event to calendar (calls backend then refetches)
    const handleAddEvent = async (newEvent) => {
        try {
            // Backend expects: title,type,flyer,start,end,street,city,state,zip,description
            await createEvent({
                ...newEvent,
                start: new Date(newEvent.start).toISOString(),
                end: new Date(newEvent.end).toISOString(),
            });
            setShowModal(false);
            await fetchEvents();
        } catch (e) {
            console.error(e);
            alert("Failed to create event.");
        }
    };

    //  Opens view modal anchored to the event element, soon to change this to
    const handleSelectedEvent = (event) => {
        const allCells = document.querySelectorAll(".rbc-event");
        let foundEvent = null;
        for (const el of allCells) {
            if (el.innerText.trim().includes(event.title)) {
                foundEvent = el;
                break;
            }
        }
        if (foundEvent) {
            const rect = foundEvent.getBoundingClientRect();
            const container = document.querySelector(".calendarcontainer");
            const containerRect = container.getBoundingClientRect();
            setViewModalPosition({
                top: rect.top - containerRect.top,
                left: rect.left - containerRect.left,
            });
            setSelectedEvent(event);
        }
    };

    // Edit request, opens AddEventModal in edit mode
    const handleEditRequest = (eventData) => {
        // checks client-side permissions here. Server will 403 if not allowed.
        if (!canEditEvent(eventData, user)) {
            alert("You don't have permission to edit this event.");
            return;
        }
        setSelectedEvent(null);
        setEditingEvent(eventData);
    };

    // Delete (calls backend then refetches)
    const handleDeleteEvent = async (id) => {
        try {
            await deleteEvent(id);
            setSelectedEvent(null);
            await fetchEvents();
        } catch (e) {
            console.error(e);
            alert("Failed to delete event.");
        }
    };

    // Save edit (PUT → refetch)
    const handleEditEvent = async (updatedEvent) => {
        try {
            await updateEvent(updatedEvent.id, {
                ...updatedEvent,
                start: new Date(updatedEvent.start).toISOString(),
                end: new Date(updatedEvent.end).toISOString(),
            });
            setEditingEvent(null);
            await fetchEvents();
        } catch (e) {
            console.error(e);
            alert("Failed to update event.");
        }
    };


    return (
        <div className="calendarcontainer" style={{ position: "relative" }}>
            <Calendar
                localizer={localizer}
                events={filteredEvents}
                startAccessor="start"
                endAccessor="end"
                date={currentDate}
                onNavigate={(newDate) => setCurrentDate(newDate)}
                style={{ height: "600px", width: "100%" }}
                selectable
                onSelectSlot={handleDateClick}
                onSelectEvent={handleSelectedEvent}
                dayPropGetter={(d) => {
                    const now = new Date(); now.setHours(0, 0, 0, 0);
                    const cell = new Date(d); cell.setHours(0, 0, 0, 0);
                    if (cell < now) return { className: "rbc-day-disabled" };
                    return {};
                }}
                components={{
                    dateCellWrapper: CustomDateCellWrapper,
                    toolbar: (toolbarProps) => (
                        <CustomToolbar
                            {...toolbarProps}
                            onNavigate={(action) => {
                                const newDate = getNextDate(action, currentDate);
                                setCurrentDate(newDate);
                            }}
                            onTypeFilterChange={setEventTypeFilter}
                            currentType={eventTypeFilter}
                        />
                    ),
                }}
            />

            {(showModal || editingEvent) && (
                <AddEventModal
                    date={editingEvent?.start || selectedDate}
                    initialEvent={editingEvent || null}
                    onClose={() => {
                        setShowModal(false);
                        setEditingEvent(null);
                    }}
                    onSave={async (eventData) => {
                        if (editingEvent) {
                            await handleEditEvent({ ...eventData, id: editingEvent.id });
                        } else {
                            await handleAddEvent(eventData);
                        }
                    }}
                    position={editingEvent ? viewModalPosition : modalPosition}
                    mode={editingEvent ? "edit" : "add"}
                />
            )}

            {selectedEvent && selectedEvent.start && (
                <ViewEventModal
                    event={selectedEvent}
                    canEdit={canEditEvent(selectedEvent, user)}
                    canDelete={canDeleteEvent(selectedEvent, user, hasAnyRole)}
                    onClose={() => setSelectedEvent(null)}
                    onEditRequest={handleEditRequest}
                    onDelete={handleDeleteEvent}
                    position={viewModalPosition}
                />
            )}

            {loading && (
                <div
                    style={{
                        position: "absolute",
                        right: 8,
                        bottom: 8,
                        padding: "6px 10px",
                        fontSize: 12,
                        background: "rgba(0,0,0,0.6)",
                        color: "white",
                        borderRadius: 6,
                    }}
                >
                    Loading events…
                </div>
            )}
        </div>
    );
};

export default EventCalendar;