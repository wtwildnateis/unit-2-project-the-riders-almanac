import { useState, useCallback, useEffect, useRef } from "react";
import './InfoWindow.css';
import {
    GoogleMap,
    useLoadScript,
    Marker,
    InfoWindow,
} from "@react-google-maps/api";

const libraries = ["places"];
const mapContainerStyle = {
    width: "100%",
    height: "600px",
};

const MapComponent = ({ selectedType, filterConfig }) => {
    const [markers, setMarkers] = useState([]);
    const [center, setCenter] = useState({ lat: 38.6270, lng: -90.1994 });
    const mapRef = useRef(null);
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [selectedPlaceId, setSelectedPlaceId] = useState(null);
    const [placeDetails, setPlaceDetails] = useState(null);

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries,
    });


    const onMapLoad = useCallback((map) => {
        mapRef.current = map;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const userLoc = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                setCenter(userLoc);
                map.panTo(userLoc);
            });
        }
    }, []);


    // with an array of keywords, duped pins populated like crazy, this merges them into one to spare the user from my pain...
    const mergeDuplicatedPins = (arrays) => {
        const seen = new Set();
        const merged = [];

        let allMapResults = [];
        arrays.forEach((arr => {
            allMapResults = allMapResults.concat(arr);
        }));

        allMapResults.forEach((place) => {

            const key = place.place_id || (place.name + place.vicinity);

            if (!seen.has(key)) {
                seen.add(key);
                merged.push(place); // should avoid duplicated pins 
            } else {
            }
        });

        return merged;
    };

    useEffect(() => {
        if (!selectedPlaceId || !mapRef.current) return;
        const service = new window.google.maps.places.PlacesService(mapRef.current);
        service.getDetails({ placeId: selectedPlaceId }, (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                setPlaceDetails(place);
            } else {
                console.error("Failed to load place Details:", status);
                setPlaceDetails(null);
            }
        });
    }, [selectedPlaceId]);

    useEffect(() => {
        if (!mapRef.current || !selectedType) return;

        const service = new window.google.maps.places.PlacesService(mapRef.current);

        let filtersToSearch = [];
        if (selectedType === "All") {
            filtersToSearch = Object.values(filterConfig);
        } else {
            const filter = filterConfig[selectedType];
            if (filter) filtersToSearch = [filter];
        }

        const allPromises = [];

        filtersToSearch.forEach((filter) => {
            if (!filter) return;


            const keywordList = Array.isArray(filter.keyword)
                ? filter.keyword
                : [filter.keyword];

            keywordList.forEach((keyword) => {
                const request = {
                    location: center,
                    radius: 30000, // this is in meters
                    keyword,
                    type: filter.type,
                };

                allPromises.push(
                    new Promise((resolve) => {
                        service.nearbySearch(request, (results, status) => {
                            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                                resolve(results);
                            } else {
                                resolve([]);
                            }
                        });
                    })
                );
            });




            if (filter.placeId) {
                allPromises.push(
                    new Promise((resolve) => {
                        service.getDetails(
                            {
                                placeId: filter.placeId,
                                fields: ["geometry", "name"],
                            },
                            (place, status) => {
                                if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                                    resolve([
                                        {
                                            geometry: place.geometry,
                                            name: place.name,
                                            place_id: place.place_id,
                                        }
                                    ]);
                                } else {
                                    console.warn("Place ID getDetails failed:", status);
                                    resolve([]);
                                }
                            }
                        );
                    })

                );
            }

        });


        Promise.all(allPromises).then((resultsArray) => {
            const allMapResults = mergeDuplicatedPins(resultsArray);
            const newMarkers = allMapResults.map((place) => ({
                position: {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                },
                name: place.name,
                place_id: place.place_id,
            }));
            setMarkers(newMarkers);
        });
    }, [selectedType, center, filterConfig]);


    if (loadError) return <div className="map-error">Error loading map</div>
    if (!isLoaded) return <div className="map-loading">Loading map...</div>

    return (
        <div className="themapcontainer">
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={11}
            center={center}
            onLoad={onMapLoad}
            onClick={() => {

                setSelectedMarker(null);
                setPlaceDetails(null);
                setSelectedPlaceId(null);
            }}
        >
            {markers.map((marker, idx) => (
                <Marker
                    key={idx}
                    position={marker.position}
                    title={marker.name}
                    onClick={() => {
                        setSelectedMarker(marker);
                        setSelectedPlaceId(marker.place_id);

                        if (mapRef.current) {
                            const map = mapRef.current;
                            map.panTo(marker.position);
                            map.panBy(0, -100);
                        }
                    }}
                />
            ))}

{/* google maps info window pop up with lots of useful info, planning on revisiting this to polish better */}
            {selectedMarker && (
                <InfoWindow
                    position={selectedMarker.position}
                    onCloseClick={() => {
                        setSelectedMarker(null);
                        setPlaceDetails(null);
                        setSelectedPlaceId(null);
                    }}
                >
                    <div className="infowindow">
                        {placeDetails?.photos?.[0] && (
                            <img
                                src={placeDetails.photos[0].getUrl({ maxWidth: 200 })}
                                alt="Place"
                                className="infowindowimage"
                            />
                        )}

                        <h2 className="infowindowtitle">{placeDetails?.name || selectedMarker.name}</h2>
                        <hr />
                        {placeDetails?.formatted_address && (
                            <p className="infowindowaddress">{placeDetails.formatted_address}</p>
                        )}

                        {placeDetails?.rating && (
                            <p className="infowindowrating">Rating: {placeDetails.rating} &#x2605;</p>
                        )}

                        {placeDetails?.opening_hours?.weekday_text && (
                            <details className="infowindowhours">
                                <summary>Opening Hours</summary>
                                <ul>
                                    {placeDetails.opening_hours.weekday_text.map((line, idx) => (
                                        <li key={idx}>{line}</li>
                                    ))}
                                </ul>
                            </details>
                        )}

                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${selectedMarker.position.lat},${selectedMarker.position.lng}&query_place_id=${selectedPlaceId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            View on Google Maps
                        </a>
                    </div>

                </InfoWindow>
            )}
        </GoogleMap>
        </div>
    );
};

export default MapComponent;