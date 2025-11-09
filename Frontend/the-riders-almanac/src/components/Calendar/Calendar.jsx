import { useState, useEffect, useRef } from "react";
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import AddEventModal from "./EventModal";
import { enUS } from "date-fns/locale/en-US";
import ViewEventModal from "./ViewEventModal";
import CustomToolbar from "./CustomToolbar";
import { addMonths, subMonths, startOfToday } from 'date-fns';

const locales = {
    'en-US': enUS
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,

});

const EventCalendar = () => {
    const [events, setEvents] = useState([]);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [viewModalPosition, setViewModalPosition] = useState({ top: 0, left: 0 })
    const [showModal, setShowModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const [editingEvent, setEditingEvent] = useState(null);
    const [eventTypeFilter, setEventTypeFilter] = useState("All");
    const [currentDate, setCurrentDate] = useState(new Date());

    const userIdRef = useRef(null);


    // my fave feature, generates and stores a unique id to users and ties it to their created events and stores it with event data in JSON to local storage
    if (!userIdRef.current) {
        let storedId = localStorage.getItem('userId');
        if (!storedId) {
            storedId = crypto.randomUUID();
            localStorage.setItem('userId', storedId);
        }
        userIdRef.current = storedId;

    }

    const userId = userIdRef.current;

    const getNextDate = (action, current) => {
        switch (action) {
            case 'TODAY':
                return startOfToday();
            case 'PREV':
                return subMonths(current, 1);
            case 'NEXT':
                return addMonths(current, 1);
            default:
                return current;
        }
    };


    const filteredEvents = eventTypeFilter === "All"
        ? events
        : events.filter(e => e.type === eventTypeFilter);


// this breaks my calendar styling a ton, but without it the popup displays all crazy, going to revisit with more time and solve it hopefully but this locks eventmodal to date cell
    const CustomDateCellWrapper = ({ value, children }) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const date = new Date(value);
        date.setHours(0, 0, 0, 0);

        const isPast = date < today;
        const stringDate = date.toISOString();

        return (
            <div className={`rbc-day-bg ${isPast ? 'rbc-day-disabled' : ''}`}
                data-date={stringDate}
                style={{ height: '100%' }}
            >
                {children}
            </div>
        );
    };

    //prevents users from adding events to past days cause i mean like why would you anyways?
    const handleDateClick = (slotInfo, e) => {
        const selected = new Date(slotInfo.start);
        const today = new Date();

        selected.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (selected < today) {
            alert("You can't add events to past dates.");
            return;
        }

        const allCells = document.querySelectorAll('.rbc-day-bg');
        const clickedDate = slotInfo.start;

        let foundCell = null;
        allCells.forEach(cell => {
            const cellDate = cell.getAttribute('data-date');
            if (cellDate) {
                const cellTime = new Date(cellDate).toDateString();
                if (cellTime === new Date(clickedDate).toDateString()) {
                    foundCell = cell;
                }
            }
        });

        if (foundCell) {
            const rect = foundCell.getBoundingClientRect();
            const modalWidth = 400;
            const modalHeight = 300;

            const left = Math.min(window.innerWidth - modalWidth - 20, rect.left + window.scrollX);
            const top = Math.min(window.innerHeight - modalHeight - 20, rect.top + window.scrollY);

            const calendarContainer = document.querySelector('.calendarcontainer');
            const containerRect = calendarContainer.getBoundingClientRect();

            setModalPosition({
                top: rect.top - containerRect.top,
                left: rect.left - containerRect.left
            });
        }

        setSelectedDate(slotInfo.start);
        setShowModal(true);


    };

    //adds events to calendar by storing event info in json format, has to convert dates to strings and back because RBC doesn't like strings..
    const handleAddEvent = (newEvent) => {
        const eventWithDates = {
            ...newEvent,
            id: Date.now(),
            start: new Date(newEvent.start),
            end: new Date(newEvent.end),
            createdBy: userId,
        };
        setEvents(prev => [...prev, eventWithDates]);
        setShowModal(false);
    };

    useEffect(() => {
        const storedEvents = localStorage.getItem("bikingEvents");
        if (storedEvents) {
            try {
                const parsed = JSON.parse(storedEvents);
                const converted = parsed.map(ev => ({
                    ...ev,
                    start: new Date(ev.start),
                    end: new Date(ev.end)
                }));

                setEvents(converted);
            } catch (err) {
            }
        }
        setHasLoaded(true);
    }, []);

    useEffect(() => {
        if (hasLoaded) {
            localStorage.setItem("bikingEvents", JSON.stringify(events));
        }
    }, [events, hasLoaded]);

    const handleSelectedEvent = (event) => {
        const allCells = document.querySelectorAll('.rbc-event');
        let foundEvent = null;

        for (const el of allCells) {
            if (el.innerText.trim().includes(event.title)) {
                foundEvent = el;
                break;
            }
        }

        if (foundEvent) {
            const rect = foundEvent.getBoundingClientRect();
            const container = document.querySelector('.calendarcontainer');
            const containerRect = container.getBoundingClientRect();

            setViewModalPosition({
                top: rect.top - containerRect.top,
                left: rect.left - containerRect.left
            });

            setSelectedEvent(event);
        }
    };

    // with the unique id given to each user, this prevents them from tampering with other user created events.
    const handleEditRequest = (eventData) => {
        if (eventData.createdBy !== userId) {
            alert("Sorry you can't edit someone else's event!");
            return;
        }
        setSelectedEvent(null);
        setEditingEvent(eventData);
    };

    const handleDeleteEvent = (id) => {
        const eventToDelete = events.find(ev => ev.id === id);
        if (eventToDelete?.createdBy !== userId) {
            alert("Sorry you can't delete someone else's event!");
            return;
        }
        setEvents(prev => prev.filter(ev => ev.id !== id));
        setSelectedEvent(null);
    };

    const handleEditEvent = (updatedEvent) => {
        setEvents(prev =>
            prev.map(ev =>
                ev.id === updatedEvent.id
                    ? { ...updatedEvent, createdBy: ev.createdBy }
                    : ev
            )
        );
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
                style={{ height: '600px', width: '100%' }}
                selectable
                onSelectSlot={handleDateClick}
                onSelectEvent={handleSelectedEvent}
                dayPropGetter={(date) => {
                    const now = new Date();
                    now.setHours(0, 0, 0, 0);
                    date.setHours(0, 0, 0, 0);

                    if (date < now) {
                        return {
                            className: 'rbc-day-disabled',
                        };
                    };
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
                    )
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
                    onSave={(eventData) => {
                        if (editingEvent) {
                            handleEditEvent({ ...eventData, id: editingEvent.id });
                            setEditingEvent(null);
                        } else {
                            handleAddEvent(eventData);
                            setShowModal(false);
                        }
                    }}

                    position={editingEvent ? viewModalPosition : modalPosition}
                    mode={editingEvent ? "edit" : "add"}
                />
            )}

            {selectedEvent && selectedEvent.start && (
                <ViewEventModal
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                    onEditRequest={handleEditRequest}
                    onDelete={handleDeleteEvent}
                    position={viewModalPosition}
                />
            )}
        </div>
    );
};

export default EventCalendar;
