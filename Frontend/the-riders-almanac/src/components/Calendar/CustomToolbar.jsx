import Button from "../Button/Button";

const CustomToolbar = ({ label, onNavigate, onTypeFilterChange, currentType }) => {
    const handleNavigate = (action) => {
        if (onNavigate) onNavigate(action);
    };

    return (
        <div className="toolbarcontainer">
            <div className="rbc-toolbar">
                <div className="nav-left">
                    <Button className="calendarbutton" onClick={() => handleNavigate('TODAY')}>Today</Button>
                    <Button className="calendarbutton" onClick={() => handleNavigate('PREV')}>Back</Button>
                    <Button className="calendarbutton" onClick={() => handleNavigate('NEXT')}>Next</Button>
                </div>
                <div className="nav-center">
                    <span>{label}</span>
                </div>

                <div className="nav-right">
                    <label htmlFor="eventTypeSelect" className="sort-label">Sort Events:</label>
                    <select
                        id="eventTypeSelect"
                        value={currentType}
                        onChange={(e) => onTypeFilterChange(e.target.value)}
                        className="sort-select"
                    >
                        <option value="All">All Events</option>
                        <option value="Bike Race">Bike Races</option>
                        <option value="BMX Jam">BMX Jams</option>
                        <option value="Group Ride">Group Rides</option>
                        <option value="Meet Ups">Meet Ups</option>
                        <option value="Other">Everything Else</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default CustomToolbar;