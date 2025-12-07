// GUARD.IO Web Viewer - Simplified

const CONFIG = {
      firebase: {
            apiKey: "AIzaSyBBJUuBH5aCmHTVWemGBDEtzP-GUDt4fA4",
            authDomain: "guardio-f6f26.firebaseapp.com",
            projectId: "guardio-f6f26",
      },
      map: {
            tileLayer: 'http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            routeColor: '#4285F4',
            pathColor: '#007AFF'
      }
};

// Application State
const state = {
      map: null,
      markers: { sender: null, viewer: null },
      lines: { path: null, route: null },
      data: { history: [], lastLoc: null, viewerLoc: null },
      elements: {}
};

// -- Entry Point --
window.onload = () => {
      cacheDomElements();
      if (!setupFirebase()) return renderError("Service Unavailable");

      const sessionId = new URLSearchParams(window.location.search).get('sessionId');
      if (!sessionId) return renderError("No Session ID Found");

      initMap();
      startTracking(sessionId);
      setupInteraction();
};

// -- Setup & Init --
function cacheDomElements() {
      const ids = ['status-card', 'spinner', 'status-icon', 'status-text', 'status-subtext', 'live-badge', 'route-panel', 'btn-share-loc', 'btn-google-maps', 'metric-dist', 'metric-time'];
      ids.forEach(id => state.elements[id] = document.getElementById(id));
}

function setupFirebase() {
      if (typeof firebase === 'undefined') return false;
      if (!firebase.apps.length) firebase.initializeApp(CONFIG.firebase);
      return true;
}

function initMap() {
      state.map = L.map('map', { zoomControl: false }).setView([20.5937, 78.9629], 5);
      L.tileLayer(CONFIG.map.tileLayer, { subdomains: CONFIG.map.subdomains, maxZoom: 20 }).addTo(state.map);
      state.lines.path = L.polyline([], { color: CONFIG.map.pathColor, weight: 4 }).addTo(state.map);
}

// -- Core Logic --
function startTracking(sessionId) {
      const db = firebase.firestore();
      db.collection("liveLocations").doc(sessionId).onSnapshot(
            doc => handleData(doc),
            err => renderError("Connection Lost")
      );
}

function handleData(doc) {
      if (!doc.exists) return renderError("Invalid Session Link");

      const data = doc.data();
      if (data.isActive === false) return renderEnded();

      const { latitude, longitude } = data;
      if (latitude && longitude) {
            updateSenderLocation(latitude, longitude);
            renderActive();
      }
}

function updateSenderLocation(lat, lng) {
      const latLng = [lat, lng];
      state.data.lastLoc = latLng;
      state.data.history.push(latLng);

      // Update Map Elements
      if (!state.markers.sender) {
            const icon = L.divIcon({ className: 'custom-marker', html: '<div class="pin-wrapper"><div class="pin"></div><div class="pin-pulse"></div></div>', iconSize: [40, 40] });
            state.markers.sender = L.marker(latLng, { icon }).addTo(state.map);
            state.map.setView(latLng, 16); // Zoom on first update
      } else {
            state.markers.sender.setLatLng(latLng);
      }

      state.lines.path.setLatLngs(state.data.history);

      // Refresh route if we know where the viewer is
      if (state.data.viewerLoc) fetchRoute();
      updateMapBounds();
}

// -- Viewer Interaction --
function setupInteraction() {
      state.elements['btn-share-loc'].onclick = () => {
            state.elements['btn-share-loc'].innerText = "Locating...";
            navigator.geolocation.watchPosition(
                  pos => updateViewerLocation(pos.coords.latitude, pos.coords.longitude),
                  err => alert("Could not access location"),
                  { enableHighAccuracy: true }
            );
      };

      state.elements['btn-google-maps'].onclick = () => {
            const [dLat, dLng] = state.data.lastLoc;
            const [sLat, sLng] = [state.data.viewerLoc.lat, state.data.viewerLoc.lng];
            window.open(`https://www.google.com/maps/dir/?api=1&origin=${sLat},${sLng}&destination=${dLat},${dLng}&travelmode=driving`, '_blank');
      };
}

function updateViewerLocation(lat, lng) {
      state.data.viewerLoc = { lat, lng };

      if (!state.markers.viewer) {
            state.markers.viewer = L.marker([lat, lng], { icon: L.divIcon({ className: 'dot-marker', iconSize: [16, 16] }) }).addTo(state.map);
      } else {
            state.markers.viewer.setLatLng([lat, lng]);
      }

      state.elements['btn-share-loc'].innerText = "Location Shared";
      state.elements['btn-share-loc'].disabled = true;
      state.elements['btn-google-maps'].disabled = false;

      fetchRoute();
}

async function fetchRoute() {
      if (!state.data.viewerLoc || !state.data.lastLoc) return;

      const start = `${state.data.viewerLoc.lng},${state.data.viewerLoc.lat}`;
      const end = `${state.data.lastLoc[1]},${state.data.lastLoc[0]}`;

      try {
            const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`);
            const json = await res.json();

            if (json.routes && json.routes.length) {
                  const route = json.routes[0];
                  const coords = route.geometry.coordinates.map(c => [c[1], c[0]]); // Swap to LatLng

                  if (!state.lines.route) {
                        state.lines.route = L.polyline(coords, { color: CONFIG.map.routeColor, dashArray: '10, 10', opacity: 0.7 }).addTo(state.map);
                  } else {
                        state.lines.route.setLatLngs(coords);
                  }

                  state.elements['metric-dist'].innerText = (route.distance / 1000).toFixed(1) + " km";
                  state.elements['metric-time'].innerText = Math.round(route.duration / 60) + " min";
            }
      } catch (e) { console.error("Route Error", e); }
}

function updateMapBounds() {
      const featureGroup = L.featureGroup([state.markers.sender, state.markers.viewer].filter(Boolean));
      if (featureGroup.getLayers().length > 1) {
            state.map.fitBounds(featureGroup.getBounds(), { padding: [50, 50] });
      } else if (state.markers.sender && !state.data.viewerLoc) {
            state.map.panTo(state.markers.sender.getLatLng());
      }
}

// -- UI Renders --
function renderActive() {
      toggleDisplay('status-card', false);
      toggleDisplay('live-badge', true);
      toggleDisplay('route-panel', true);
}

function renderError(msg) {
      toggleDisplay('spinner', false);
      const card = state.elements['status-card'];
      card.style.display = 'block';
      state.elements['status-icon'].innerText = "⚠️";
      state.elements['status-icon'].style.display = 'block';
      state.elements['status-text'].innerText = msg;
}

function renderEnded() {
      toggleDisplay('live-badge', false);
      toggleDisplay('route-panel', false);
      toggleDisplay('spinner', false);

      const card = state.elements['status-card'];
      card.style.display = 'block';
      state.elements['status-icon'].innerText = "🛑";
      state.elements['status-icon'].style.display = 'block';
      state.elements['status-text'].innerText = "Tracking Ended";
      state.elements['status-subtext'].innerText = "The sender has stopped sharing location.";
      state.elements['status-subtext'].style.display = 'block';
}

function toggleDisplay(id, show) {
      if (state.elements[id]) state.elements[id].style.display = show ? (id === 'live-badge' ? 'flex' : 'block') : 'none';
}
