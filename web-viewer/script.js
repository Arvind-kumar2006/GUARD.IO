// Version 1.1.0 - Debugging Fix
const firebaseConfig = {
      apiKey: "AIzaSyBBJUuBH5aCmHTVWemGBDEtzP-GUDt4fA4",
      authDomain: "guardio-f6f26.firebaseapp.com",
      projectId: "guardio-f6f26",
      storageBucket: "guardio-f6f26.firebasestorage.app",
      messagingSenderId: "905975977884",
      appId: "1:905975977884:web:2ec3de1c754cf74f035a59"
};

// Debug Logger
const debugEl = document.getElementById('debug-logs');
function log(msg) {
      console.log(msg);
      if (debugEl) {
            const div = document.createElement('div');
            div.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
            debugEl.appendChild(div);
            debugEl.scrollTop = debugEl.scrollHeight;
      }
}

log("Starting App Version 1.1.0");
log("Waiting for Firebase scripts to load...");

// Expose initialization function so index.html can call it when Firebase loads
window.initTrackingApp = function () {
      if (typeof firebase === 'undefined' || !firebase.app) {
            log("Firebase still not available, waiting...");
            setTimeout(() => window.initTrackingApp(), 200);
            return;
      }
      startApp();
};

// Wait for Firebase to be available (handles browser blocking)
function waitForFirebase(callback, maxAttempts = 150) {
      if (window.firebaseReady && typeof firebase !== 'undefined' && firebase.app) {
            log("✅ Firebase scripts loaded!");
            callback();
      } else if (typeof firebase !== 'undefined' && firebase.app) {
            log("✅ Firebase scripts loaded!");
            callback();
      } else if (maxAttempts > 0) {
            setTimeout(() => waitForFirebase(callback, maxAttempts - 1), 100);
      } else {
            log("❌ Firebase scripts timeout after 15 seconds.");
            showFirebaseError();
      }
}

function startApp() {
      waitForFirebase(() => {
            initializeTracking();
      });
}

// Start waiting immediately
waitForFirebase(() => {
      initializeTracking();
});

function showFirebaseError() {
      const errorCard = document.getElementById('error-card');
      const waitingCard = document.getElementById('waiting-card');
      if (errorCard && waitingCard) {
            waitingCard.style.display = 'none';
            const errorText = errorCard.querySelector('.error-text');
            if (errorText) {
                  errorText.innerHTML = "Firebase blocked by browser.<br><br>" +
                        "🔧 <strong>Solution:</strong><br>" +
                        "1. Use <strong>Google Chrome</strong> or <strong>Safari</strong><br>" +
                        "2. OR disable <strong>Brave Shields</strong> (orange lion icon)";
            }
            errorCard.style.display = 'block';
      }
}

function initializeTracking() {
      log("Initializing Firebase (compat)...");

      // Initialize Firebase using compat SDK to avoid module loading issues
      try {
            const app = firebase.apps.length === 0 ? firebase.initializeApp(firebaseConfig) : firebase.app();
            const db = firebase.firestore(app);
            log("Firebase initialized.");

            // UI Elements
            const mapEl = document.getElementById('map');
            const waitingCard = document.getElementById('waiting-card');
            const errorCard = document.getElementById('error-card');
            const endedCard = document.getElementById('ended-card');
            const liveBadge = document.getElementById('live-badge');
            const bottomInfo = document.getElementById('bottom-info');
            const lastUpdatedEl = document.getElementById('last-updated');
            const routeCard = document.getElementById('route-card');
            const routeDistanceEl = document.getElementById('route-distance');
            const routeDurationEl = document.getElementById('route-duration');
            const routeStatusEl = document.getElementById('route-status');
            const requestLocationBtn = document.getElementById('request-location');
            const openGoogleNavBtn = document.getElementById('open-google-nav');

            // Map State
            let map;
            let marker;
            let polyline;
            let routeLine;
            let pathHistory = [];
            let isFirstUpdate = true;
            let lastTimestamp = null;
            let lastLatLng = null;

            // Viewer State
            let viewerLocation = null;
            let viewerMarker = null;
            let viewerWatchId = null;
            let routingInProgress = false;

            if (routeCard) {
                  routeCard.style.display = 'flex';
            }

            if (requestLocationBtn) {
                  requestLocationBtn.addEventListener('click', () => {
                        requestViewerLocation(true);
                  });
            }

            if (openGoogleNavBtn) {
                  openGoogleNavBtn.addEventListener('click', () => {
                        if (viewerLocation && lastLatLng) {
                              const url = `https://www.google.com/maps/dir/?api=1&origin=${viewerLocation.lat},${viewerLocation.lng}&destination=${lastLatLng[0]},${lastLatLng[1]}&travelmode=driving`;
                              window.open(url, '_blank');
                        }
                  });
                  openGoogleNavBtn.disabled = true;
            }

            // Initialize Map (India Center)
            function initMap() {
                  log("Initializing Map...");
                  map = L.map('map', {
                        zoomControl: false,
                        attributionControl: false
                  }).setView([20.5937, 78.9629], 4);

                  // Google Maps Tile Layer
                  L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
                        maxZoom: 20,
                        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
                        attribution: '&copy; Google Maps'
                  }).addTo(map);

                  // Polyline
                  polyline = L.polyline([], {
                        color: '#007AFF',
                        weight: 4,
                        opacity: 0.7,
                        lineJoin: 'round'
                  }).addTo(map);
                  log("Map initialized.");
            }

            initMap();

            // Extract Session ID
            const urlParams = new URLSearchParams(window.location.search);
            const sessionId = urlParams.get('sessionId');

            if (!sessionId) {
                  log("❌ No sessionId found in URL");
                  waitingCard.style.display = 'none';
                  errorCard.querySelector('.error-text').textContent = "Missing Session ID";
                  errorCard.style.display = 'block';
            } else {
                  log(`✅ Session ID: ${sessionId}`);
                  log("Connecting to Firestore...");

                  // Connect to Firestore
                  const docRef = db.collection("liveLocations").doc(sessionId);

                  docRef.onSnapshot((docSnap) => {
                        log("📩 Snapshot received");

                        // Safely check if document exists
                        // Handles both Modular (function) and Compat (property) SDKs
                        let exists = false;
                        try {
                              if (docSnap) {
                                    if (typeof docSnap.exists === 'function') {
                                          exists = docSnap.exists();
                                    } else {
                                          exists = !!docSnap.exists;
                                    }
                              }
                        } catch (e) {
                              log(`⚠️ Error checking existence: ${e.message}`);
                              exists = false;
                        }

                        if (exists) {
                              const data = docSnap.data();
                              log(`Data: ${JSON.stringify(data)}`);

                              // Check if sharing is active
                              if (data.isActive === false) {
                                    log("🛑 isActive is false");
                                    handleTrackingEnded();
                                    return;
                              }

                              const { latitude, longitude, timestamp } = data;

                              if (latitude && longitude) {
                                    log(`📍 Update: ${latitude}, ${longitude}`);
                                    const latLng = [latitude, longitude];
                                    lastLatLng = latLng;
                                    lastTimestamp = timestamp;

                                    // First Update Actions
                                    if (isFirstUpdate) {
                                          log("🚀 First update - Showing Map");
                                          waitingCard.style.display = 'none';
                                          mapEl.classList.add('visible');
                                          liveBadge.style.display = 'flex';
                                          bottomInfo.style.display = 'block';

                                          map.setView(latLng, 17); // Zoom to 17
                                          isFirstUpdate = false;
                                    }

                                    // Update Marker
                                    if (!marker) {
                                          const customIcon = L.divIcon({
                                                className: 'custom-marker',
                                                html: '<div class="marker-pin"></div><div class="marker-pulse"></div>',
                                                iconSize: [40, 40],
                                                iconAnchor: [20, 20]
                                          });
                                          marker = L.marker(latLng, { icon: customIcon }).addTo(map);
                                    } else {
                                          marker.setLatLng(latLng);
                                    }

                                    // Center / Fit Map
                                    if (viewerLocation) {
                                          fitMapToEntities();
                                    } else {
                                          map.panTo(latLng);
                                    }

                                    // Update History
                                    pathHistory.push(latLng);
                                    polyline.setLatLngs(pathHistory);

                                    // Update Time
                                    updateTimeAgo();

                                    // Update Route if we know viewer
                                    if (viewerLocation && !routingInProgress) {
                                          updateRoute();
                                    }
                              }
                        } else {
                              log("⚠️ Document does not exist - Session ended or invalid");
                              handleTrackingEnded();
                        }
                  }, (error) => {
                        log(`❌ Firestore Error: ${error.message}`);
                        waitingCard.style.display = 'none';
                        errorCard.querySelector('.error-text').textContent = "Error: " + error.message;
                        errorCard.style.display = 'block';
                  });
            }

            function handleTrackingEnded() {
                  if (!isFirstUpdate) {
                        mapEl.classList.remove('visible');
                        liveBadge.style.display = 'none';
                        bottomInfo.style.display = 'none';
                        endedCard.style.display = 'block';
                  } else {
                        waitingCard.style.display = 'none';
                        endedCard.style.display = 'block';
                  }
            }

            function updateTimeAgo() {
                  if (!lastTimestamp) return;
                  const diff = Math.floor((Date.now() - lastTimestamp) / 1000);
                  if (diff < 5) lastUpdatedEl.textContent = "Last updated: Just now";
                  else if (diff < 60) lastUpdatedEl.textContent = `Last updated: ${diff} sec ago`;
                  else lastUpdatedEl.textContent = `Last updated: ${Math.floor(diff / 60)} min ago`;
            }

            setInterval(updateTimeAgo, 1000);

            function requestViewerLocation(force = false) {
                  if (!navigator.geolocation) {
                        setRouteStatus("Geolocation not supported on this device.");
                        return;
                  }
                  if (viewerWatchId !== null && !force) return;
                  setRouteStatus("Locating you...");
                  if (requestLocationBtn) {
                        requestLocationBtn.disabled = true;
                  }
                  viewerWatchId = navigator.geolocation.watchPosition(handleViewerLocation, handleViewerLocationError, {
                        enableHighAccuracy: true,
                        maximumAge: 5000,
                        timeout: 15000
                  });
            }

            function handleViewerLocation(position) {
                  const { latitude, longitude } = position.coords;
                  viewerLocation = { lat: latitude, lng: longitude };

                  if (!viewerMarker) {
                        const viewerIcon = L.divIcon({
                              className: 'viewer-marker',
                              iconSize: [16, 16],
                              iconAnchor: [8, 8]
                        });
                        viewerMarker = L.marker([latitude, longitude], { icon: viewerIcon }).addTo(map);
                        // viewerMarker.bindTooltip("You", { permanent: true, direction: 'bottom', offset: [0, 12] });
                  } else {
                        viewerMarker.setLatLng([latitude, longitude]);
                  }

                  setRouteStatus("Route ready");
                  if (requestLocationBtn) {
                        requestLocationBtn.textContent = "Location shared";
                        requestLocationBtn.disabled = true;
                  }

                  if (lastLatLng) {
                        if (openGoogleNavBtn) openGoogleNavBtn.disabled = false;
                        updateRoute();
                  }

                  fitMapToEntities();
            }

            function handleViewerLocationError(error) {
                  log(`⚠️ Viewer location error: ${error.message}`);
                  setRouteStatus("Could not access your location.");
                  if (requestLocationBtn) {
                        requestLocationBtn.disabled = false;
                        requestLocationBtn.textContent = "Share location";
                  }
            }

            function fitMapToEntities() {
                  const bounds = L.latLngBounds([]);
                  if (marker && marker.getLatLng) bounds.extend(marker.getLatLng());
                  if (viewerMarker && viewerMarker.getLatLng) bounds.extend(viewerMarker.getLatLng());

                  if (bounds.isValid() && bounds.getNorth() !== bounds.getSouth()) {
                        map.fitBounds(bounds, { padding: [80, 80] });
                  } else if (marker) {
                        map.panTo(marker.getLatLng());
                  }
            }

            async function updateRoute() {
                  if (!viewerLocation || !lastLatLng) return;
                  routingInProgress = true;
                  setRouteStatus("Fetching best route…");

                  try {
                        const url = `https://router.project-osrm.org/route/v1/driving/${viewerLocation.lng},${viewerLocation.lat};${lastLatLng[1]},${lastLatLng[0]}?overview=full&geometries=geojson`;
                        const response = await fetch(url);
                        if (!response.ok) throw new Error("Route service unavailable");
                        const data = await response.json();
                        if (!data.routes || !data.routes.length) throw new Error("No route found");
                        const route = data.routes[0];
                        const coords = route.geometry.coordinates.map(([lon, lat]) => [lat, lon]);

                        if (!routeLine) {
                              routeLine = L.polyline(coords, {
                                    color: '#4285F4', // Google Maps Blue
                                    weight: 6,
                                    opacity: 0.8,
                                    dashArray: '10, 15', // Dashed Line
                                    lineJoin: 'round',
                                    lineCap: 'round'
                              }).addTo(map);
                        } else {
                              routeLine.setLatLngs(coords);
                        }

                        // Calculate Midpoint for ETA Label
                        const midIndex = Math.floor(coords.length / 2);
                        const midPoint = coords[midIndex];

                        const durationText = formatDuration(route.duration);
                        const labelHtml = `<div>🚘 ${durationText}</div>`;

                        if (!window.etaLabel) {
                              const labelIcon = L.divIcon({
                                    className: 'route-label',
                                    html: labelHtml,
                                    iconSize: [null, null], // Auto size
                                    iconAnchor: [40, 40] // Approximate center
                              });
                              window.etaLabel = L.marker(midPoint, { icon: labelIcon, zIndexOffset: 1000 }).addTo(map);
                        } else {
                              window.etaLabel.setLatLng(midPoint);
                              // Update content if needed (requires re-creating icon or DOM manipulation, simpler to just replace icon)
                              const labelIcon = L.divIcon({
                                    className: 'route-label',
                                    html: labelHtml,
                                    iconSize: [null, null],
                                    iconAnchor: [40, 40]
                              });
                              window.etaLabel.setIcon(labelIcon);
                        }

                        setRouteDistance(formatDistance(route.distance));
                        setRouteDuration(formatDuration(route.duration));
                        setRouteStatus("Route updated");
                        if (openGoogleNavBtn) openGoogleNavBtn.disabled = false;
                        fitMapToEntities();
                  } catch (error) {
                        setRouteStatus("Unable to calculate route.");
                        if (openGoogleNavBtn) openGoogleNavBtn.disabled = true;
                        log(`⚠️ Routing error: ${error.message}`);
                  } finally {
                        routingInProgress = false;
                  }
            }

            function formatDistance(meters) {
                  if (meters < 1000) return `${meters.toFixed(0)} m`;
                  return `${(meters / 1000).toFixed(1)} km`;
            }

            function formatDuration(seconds) {
                  const minutes = Math.round(seconds / 60);
                  if (minutes < 60) return `${minutes} min`;
                  const hours = Math.floor(minutes / 60);
                  const rem = minutes % 60;
                  return `${hours}h ${rem}m`;
            }

            function setRouteStatus(text) {
                  if (routeStatusEl) routeStatusEl.textContent = text;
            }

            function setRouteDistance(text) {
                  if (routeDistanceEl) routeDistanceEl.textContent = text;
            }

            function setRouteDuration(text) {
                  if (routeDurationEl) routeDurationEl.textContent = text;
            }

            // Try requesting viewer location on load (will fail silently if blocked)
            setTimeout(() => requestViewerLocation(false), 500);

            window.addEventListener('beforeunload', () => {
                  if (viewerWatchId !== null && navigator.geolocation) {
                        navigator.geolocation.clearWatch(viewerWatchId);
                  }
            });

      } catch (e) {
            log(`❌ Critical Error: ${e.message}`);
      }
}
