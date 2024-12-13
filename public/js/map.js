mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: "mapbox://styles/mapbox/streets-v12",
    center: listing.geometry.coordinates, // starting position [lng, lat]
    zoom: 9 // starting zoom
});


const marker = new mapboxgl.Marker({color: "red"})      // For Map Marker
.setLngLat(listing.geometry.coordinates)         // Listing.geometry.coordinates
.setPopup(new mapboxgl.Popup({ offset: 25, maxWidth: "none" })
    .setHTML(`<h5>${listing.title}</h5>
        <p>Exact loaction provided after booking</p>`))
.addTo(map);