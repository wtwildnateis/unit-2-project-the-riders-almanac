import { useState } from "react";
import MapComponent from "./Map";
import Button from "../Button/Button";

const filterConfig = {
    "Bike Shops": {
        keyword: "bike shop",
        type: "bicycle_store",
    },
    "Bike Trails": {
        keyword: ["bike trail", "Tower Grove Park", "Creve Coeur Lake", "Bike Path"],
        placeId: "ChIJycR4kUa12IcRqpSybQLFJ50",
    },
    "Skateparks": {
        keyword: "skatepark"
    },
    "Mountain Bike Trails": {
        keyword: ["mountain bike trails", "mountain bike park", "Castlewood state park"],
    },
    "Air Pumps": {
        keyword: ["gas station", "air pump"],
        type: "gas_station",
    }
};


// lets you filter map pins based on keywords sent to Maps api
const MapWrapper = () => {
    const [selectedType, setSelectedType] = useState("All");

    const categories = ["All", ...Object.keys(filterConfig)];

    const combinedFilterConfig = Object.values(filterConfig)

    return (
        <>
            <div className="mapbuttonscontainer">
            <div className="filter-buttons">
                {categories.map((type) => (
                    <Button key={type}
                        onClick={() => setSelectedType(type)}
                        className={type === selectedType ? "selected-filter" : ""}
                    >
                        {type}
                    </Button>
                ))}
            </div>
        </div >
            <MapComponent
                selectedType={selectedType}
                filterConfig={filterConfig}
            />
        </>
    );
};

export default MapWrapper;