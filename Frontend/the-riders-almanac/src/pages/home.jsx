import { useLocation } from "react-router-dom";
import { useEffect, useState } from 'react';
import city_riders from '../assets/city_riders.jpg';

const Home = () => {
    const location = useLocation();
    const [fadeClass, setFadeClass] = useState("");

    useEffect(() => {
        if (location.state?.fromTitle) {
            setFadeClass("fade-in");
        }
    }, [location.state]);

    return (
        <>
            <div className={`${fadeClass}`} style={{display: "flex"}}>
                <div className="homepagecontainer">

                    <div style={{ fontWeight: "bold", float: "left", fontSize: "2.5rem", lineHeight: "1.5", marginInlineEnd: "2px", marginBottom: "25px", textAlign: "center"}}> Welcome to The Rider’s Almanac!</div> <hr /> <div style={{ lineHeight: "1.5", marginLeft: "-10px", marginTop: "15px" }}>We’re <span className="textstrong">stoked</span> to have you here!
                        Whether you're rolling through a new city or cruising familiar streets, The Rider’s Almanac is your <span className="textstrong">go-to guide</span> for all things cycling. Our mission is simple: to empower riders with the tools, connections, and <span className="textstrong">inspiration</span> they need to make every ride smooth, exciting, and unforgettable.

                        <div style={{ lineHeight: "1" }}>
                            <img src={city_riders} alt="City Riders" style={{
                                width: "50%", float: "right", marginLeft: "15px", marginBottom: "-2px", marginTop: "15px", marginRight: "20px"
                            }} />
                        </div> Looking for upcoming bike events or local races? We’ve got you covered. Need to find the closest bike shop, skatepark, or trail system? We’ve already mapped it out. Just want to tap into the local <span className="textstrong">ride culture</span>? You’re in the right place. Around here, it’s not just about where you’re headed — it’s about how you get there.

                        A little about me: I'm Nate. I’ve been riding bikes almost as long as I’ve been able to stand. I’ve spent over 15 years riding BMX at a professional level and even ran my own BMX company — so when I say I live and breathe bikes, I mean it. I built this app to be the ultimate hub for riders like you and me — a place to find everything you need to hit the streets, trails, or parks and connect with others who share the same passion.

                        So clip in, gear up, and let The Rider’s Almanac <span className="textstrong">guide your next adventure</span>.</div>
                </div>
            </div>
        </>
    );
};

export default Home;