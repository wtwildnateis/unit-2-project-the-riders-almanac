import { useState, useEffect, useRef } from 'react';
import './EventModal.css';
import Button from '../Button/Button';
import StateForm from './StateDropdownForm';
import { handleValidation, clearValidation } from '../FormValidationMessage/formValidation';

// allows users to add events to calendar, location info, flyer links etc
const AddEventModal = ({ date, onClose, onSave, position, initialEvent, mode = "add" }) => {
    const [formData, setFormData] = useState({
        title: '',
        type: '',
        flyer: '',
        start: date || new Date(),
        end: date || new Date(),
        street: '',
        city: '',
        state: '',
        zip: '',
        description: '',
    });

    useEffect(() => {
        if (initialEvent) {
            setFormData({
                title: initialEvent.title || '',
                type: initialEvent.type || '',
                flyer: initialEvent.flyer || '',
                start: initialEvent.start ? new Date(initialEvent.start) : date || new Date(),
                end: initialEvent.end ? new Date(initialEvent.end) : date || new Date(),
                street: initialEvent.street || '',
                city: initialEvent.city || '',
                state: initialEvent.state || '',
                zip: initialEvent.zip || '',
                description: initialEvent.description || '',

            });
        }
    }, [initialEvent, date]);

    const modalRef = useRef();
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                onClose();
            }

        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);

        };
    }, []);

    function formatDateTimeLocal(date) {
        if (!date) return '';

        const d = (date instanceof Date) ? date : new Date(date);
        if (isNaN(d.getTime())) return '';

        const pad = (n) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;


    }

    const handleChange = (e) => {
        const { name, value } = e.target;

        const parsedValue = (name === 'start' || name === 'end')
            ? new Date(value)
            : value;

        setFormData(prev => ({
            ...prev,
            [name]: parsedValue

        }));

    };

    useEffect(() => {
        if (modalRef.current) {
            modalRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'nearest'
            });
        }
    }, [position]);


    const handleSubmit = (e) => {
        e.preventDefault();

        const { street, city, state, zip, ...rest } = formData;

        const location = `${street}, ${city}, ${state} ${zip}`.trim();

        const eventData = {
            ...rest,
            location,
            street,
            city,
            state,
            zip,
        };

        onSave(eventData);
    };

    return (
        <div className="modalcontainer">

            <div className="modalstyle"
                ref={modalRef}
                style={{
                    position: "absolute",
                    top: `${position.top || 0}px`,
                    left: `${position.left || 0}px`,
                    marginBottom: '50px', 
                    zIndex: 1000
                    
                }}
            >
                <h3>{mode === "edit" ? "Edit Event Details" : "Add New Biking Event"}</h3>
                <hr />
                <form onSubmit={handleSubmit}>
                    <label>
                        Event Name:
                        <input
                            type="text"
                            name="title"
                            placeholder="Please enter your event name"
                            value={formData.title}
                            required
                            onChange={(e) => {
                                setFormData({ ...formData, title: e.target.value });
                                clearValidation(e);
                            }}
                            onInvalid={(e) => handleValidation(e, "Please enter the event name.")}

                        />
                    </label>

                    <label>
                        Type of Event:
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            required>
                            <option value="">Select Type</option>
                            <option value="Bike Race">Bike Race</option>
                            <option value="BMX Jam">BMX Jam</option>
                            <option value="Group Ride">Group Ride</option>
                            <option value="Meet Ups">Meet Ups</option>
                            <option value="Other">Other</option>
                        </select>
                    </label>

                    <label>
                        Start Time:
                        <input
                            type="datetime-local"
                            name="start"
                            onChange={handleChange}
                            required
                            value={formatDateTimeLocal(formData.start)}
                        />
                    </label>

                    <label>
                        End Time:
                        <input
                            type="datetime-local"
                            name="end"
                            onChange={handleChange}
                            required
                            value={formatDateTimeLocal(formData.end)}
                        />
                    </label>

                    <div className="address-section">
                        <label>
                            Street Address:
                            <input
                                type="text"
                                name="street"
                                placeholder="123 Main St"
                                value={formData.street}
                                required
                                onChange={(e) => {
                                    setFormData({ ...formData, street: e.target.value });
                                    clearValidation(e);
                                }}
                                onInvalid={(e) => handleValidation(e, "Please enter a valid street address.")}

                            />
                        </label>

                        <label>
                            City:
                            <input
                                type="text"
                                name="city"
                                placeholder="Anytown"
                                value={formData.city}
                                required
                                onChange={(e) => {
                                    setFormData({ ...formData, city: e.target.value });
                                    clearValidation(e);
                                }}
                                onInvalid={(e) => handleValidation(e, "Please enter a valid city name.")}

                            />
                        </label>

                        <StateForm
                            value={formData.state}
                            onChange={(newState) => setFormData({ ...formData, state: newState })}
                        />

                        <label>
                            Zip Code:
                            <input
                                type="text"
                                name="zipcode"
                                placeholder="12345"
                                value={formData.zip}
                                required
                                onChange={(e) => {
                                    setFormData({ ...formData, zip: e.target.value });
                                    clearValidation(e);
                                }}
                                onInvalid={(e) => handleValidation(e, "Please enter a valid zip code.")}

                            />

                        </label>
                    </div>
                    <label>
                        Additional Info:
                        <textarea
                            name="description"
                            placeholder="Additional Info"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </label>

                    <label>
                        Upload Flyer URL (Optional):
                        <input
                            type="text"
                            name="flyer"
                            placeholder="Paste direct link to image"
                            value={formData.flyer}
                            onChange={handleChange}
                        />
                    </label>


                    <div className="modal-button">
                        <Button type="submit">{mode === "edit" ? "Save Changes" : "Add Event"}</Button>
                        <Button type="button" onClick={onClose}>Cancel</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEventModal;