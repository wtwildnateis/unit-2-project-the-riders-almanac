import EventCalendar from "../components/Calendar/Calendar";
import UpcomingSidebar from "../components/Calendar/UpcomingSidebar";
import "../components/Calendar/calendar-theme.css"; 

function EventsPage() {
    return (
        <div className="newmapscontainer">

            <div className="resources-page">
                <h1 className="page-title">Events Calendar</h1>

                <div className="resources-layout">
                    {/* LEFT: calendar */}
                    <section className="map-card ra-calendar-card">
                        <div className="cal-shell">
                            <EventCalendar />
                        </div>
                    </section>

                    {/* RIGHT: upcoming list */}
                    <aside className="sidebar">
                        <div className="sidebar__inner">
                            <div className="sidebar__title">UPCOMING</div>
                            <UpcomingSidebar />
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

export default EventsPage;
