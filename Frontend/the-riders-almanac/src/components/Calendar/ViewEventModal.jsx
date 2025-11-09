import { useState, useEffect, useRef } from 'react';
import './EventModal.css';
import Button from '../Button/Button';

const ViewEventModal = ({ event, onClose, onDelete, onEditRequest, position }) => {
    const modalRef = useRef();
    const [showFullFlyer, setShowFullFlyer] = useState(false);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <>
            <div className="modalcontainer">
                <div
                    className="modalstyle"
                    ref={modalRef}
                    style={{
                        top: `${position.top || 0}px`,
                        left: `${position.left || 0}px`,
                        position: 'absolute'
                    }}
                >
                    {/* Flyer Preview! */}
                    {event.flyer && (
                        <div
                            className="flyer-preview"
                            onClick={() => setShowFullFlyer(true)}
                        >
                            <img
                                src={event.flyer}
                                alt="Event Flyer"
                                style={{
                                    width: '100%',
                                    maxHeight: '250px',
                                    objectFit: 'contain',
                                    objectPosition: 'center',
                                    display: 'block',
                                    cursor: 'pointer'
                                }} />
                        </div>
                    )}
                    {/* Event Title */}
                    <h2 className="view-event-title">{event.title}</h2>
                    <hr />
                    {/* Event Details */}
                    <ul className="event-details">
                        <div className="event-details-label">Type of Event:</div> <li>{event.type}</li>
                        <div className="event-details-label">Start Time:</div> <li>{new Date(event.start).toLocaleString()}</li>
                        <div className="event-details-label">End Time:</div> <li>{new Date(event.end).toLocaleString()}</li>
                        <div className="event-details-label">Address:</div> <li><div className="address">{event.location}</div></li>
                        {event.description?.trim() && (
                        <><div className="event-details-label">Description:</div><li>{event.description}</li></>
                        )}
                </ul>

                    <div className="modal-button">
                        <Button onClick={() => onEditRequest(event)}>Edit</Button>
                        <Button onClick={() => onDelete(event.id)}>Delete</Button>
                        <Button onClick={onClose}>Close</Button>
                    </div>
                </div>

                {showFullFlyer && (
                    <div className="flyer-fullscreen" onClick={() => setShowFullFlyer(false)}>
                        <img src={event.flyer} alt="Flyer Full" className="flyer-expanded" />
                    </div>
                )
                }
            </div >
        </>
    );
};

export default ViewEventModal;