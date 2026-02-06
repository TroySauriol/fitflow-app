# 📍 GPS Tracking Guide

## Overview

Your FitFlow app now includes **automatic GPS tracking** using the browser's Geolocation API. This enables real-time distance and pace tracking without manual input.

---

## ✅ What's Already Implemented

### GPS Features:
- ✅ **Automatic Distance Tracking** - Uses GPS coordinates to calculate distance
- ✅ **Real-Time Speed** - Live speed from GPS sensor
- ✅ **Route Recording** - Saves GPS coordinates for each session
- ✅ **High Accuracy Mode** - Requests best possible GPS accuracy
- ✅ **Error Handling** - Graceful fallback if GPS unavailable
- ✅ **Permission Management** - Requests location permission when needed
- ✅ **Battery Efficient** - Only tracks when activity is running

### How It Works:
1. User enables "📍 Use GPS Tracking" toggle
2. App requests location permission (one-time)
3. When user starts activity, GPS begins tracking
4. Distance automatically updates as user moves
5. Speed shows real-time from GPS sensor
6. Route coordinates saved with session

---

## 🚀 Current Implementation

### Browser Geolocation API

**What's Used:**
```javascript
navigator.geolocation.watchPosition(
  successCallback,
  errorCallback,
  {
    enableHighAccuracy: true,  // Best GPS accuracy
    timeout: 5000,              // 5 second timeout
    maximumAge: 0               // No cached positions
  }
)
```

**Features:**
- ✅ Works on all modern browsers
- ✅ Works on iOS Safari (iPhone/iPad)
- ✅ Works on Android Chrome
- ✅ Works on desktop browsers
- ✅ No additional libraries needed
- ✅ Part of web standards

### Distance Calculation

**Haversine Formula:**
```javascript
// Calculates distance between two GPS coordinates
// Accounts for Earth's curvature
// Returns distance in kilometers
const distance = calculateDistance(lat1, lon1, lat2, lon2)
```

**Accuracy Filtering:**
- Only uses GPS points with accuracy < 50 meters
- Filters out unrealistic jumps (> 100m between points)
- Smooths out GPS noise

### Route Recording

**Data Saved:**
```javascript
{
  lat: latitude,
  lng: longitude,
  timestamp: milliseconds,
  accuracy: meters,
  speed: meters/second
}
```

---

## 📱 Mobile Support

### iOS (iPhone/iPad):

**Safari:**
- ✅ Full GPS support
- ✅ Works as PWA (installed app)
- ✅ Background tracking (limited)
- ⚠️ Requires HTTPS (your Amplify URL is HTTPS)
- ⚠️ User must grant location permission

**How to Enable on iPhone:**
1. Open FitFlow in Safari
2. Tap "Share" button
3. Tap "Add to Home Screen"
4. Open app from home screen
5. Enable GPS toggle
6. Grant location permission when prompted

**iOS Permissions:**
- Settings → Safari → Location → Allow
- Settings → Privacy → Location Services → Safari → While Using

### Android:

**Chrome:**
- ✅ Full GPS support
- ✅ Works as PWA
- ✅ Background tracking
- ✅ Better GPS accuracy than iOS
- ⚠️ Requires location permission

**How to Enable on Android:**
1. Open FitFlow in Chrome
2. Tap menu → "Install app" or "Add to Home screen"
3. Open app
4. Enable GPS toggle
5. Grant location permission when prompted

**Android Permissions:**
- Settings → Apps → FitFlow → Permissions → Location → Allow

---

## 🎯 User Experience

### GPS Toggle:
```
📍 Use GPS Tracking
[✓] Enabled

GPS will automatically track distance and pace
```

**When Running:**
```
📍 Use GPS Tracking ● Live
```

**If Error:**
```
⚠️ GPS permission denied. Please enable location access.
```

### Distance Display:

**Without GPS:**
- Manual input field
- User enters distance
- Pace calculated from time/distance

**With GPS:**
- Automatic distance display
- Updates in real-time
- No manual input needed

### Session History:

**GPS-Tracked Sessions:**
```
🏃 Run 📍 GPS
5.2 km | 28:45 | 5:32/km
```

**Manual Sessions:**
```
🏃 Run
5.0 km | 30:00 | 6:00/km
```

---

## 🔧 Technical Details

### GPS Accuracy:

**Factors Affecting Accuracy:**
- ✅ Clear sky view (best)
- ⚠️ Buildings/trees (reduced accuracy)
- ⚠️ Indoor (no GPS)
- ⚠️ Tunnels (no GPS)
- ✅ Phone GPS quality

**Typical Accuracy:**
- **Outdoor, clear sky:** 5-10 meters
- **Urban areas:** 10-30 meters
- **Heavy tree cover:** 30-50 meters
- **Indoor:** No signal

### Battery Impact:

**GPS Usage:**
- Only active when tracking
- Paused when activity paused
- Stopped when activity finished
- High accuracy mode uses more battery

**Battery Life Estimates:**
- **1 hour run:** ~5-10% battery
- **30 min run:** ~3-5% battery
- **Background tracking:** Minimal impact

### Data Storage:

**Route Data:**
```javascript
session: {
  gpsTracked: true,
  route: [
    { lat: 40.7128, lng: -74.0060, timestamp: 1234567890, accuracy: 10, speed: 2.5 },
    { lat: 40.7129, lng: -74.0061, timestamp: 1234567900, accuracy: 8, speed: 2.7 },
    ...
  ]
}
```

**Storage Size:**
- ~100 bytes per GPS point
- ~1 point per second
- 1 hour run = ~360 KB
- Stored in localStorage

---

## 🚀 Future Enhancements

### What Can Be Added:

#### 1. Route Visualization 🗺️
**Using Leaflet or Mapbox:**
```javascript
import L from 'leaflet'

// Display route on map
const map = L.map('map')
const polyline = L.polyline(route, {color: 'blue'})
polyline.addTo(map)
```

**Benefits:**
- See your running route
- Identify fastest/slowest sections
- Share routes with friends
- Discover new routes

#### 2. Live Map Tracking 📍
**Real-time position on map:**
```javascript
// Update marker as user moves
const marker = L.marker([lat, lng])
marker.setLatLng([newLat, newLng])
```

**Benefits:**
- See current position
- Track progress on route
- Navigate back to start

#### 3. Elevation Tracking ⛰️
**Using GPS altitude:**
```javascript
const elevation = position.coords.altitude
const elevationGain = calculateElevationGain(route)
```

**Benefits:**
- Track hills climbed
- Adjust pace for elevation
- Calculate elevation gain/loss

#### 4. Auto-Pause Detection ⏸️
**Detect when user stops:**
```javascript
if (speed < 0.5) { // Less than 0.5 m/s
  autoPause()
}
```

**Benefits:**
- Pause at traffic lights
- Pause for water breaks
- More accurate time/pace

#### 5. Lap Auto-Detection 🔄
**Detect when user returns to start:**
```javascript
if (distanceFromStart < 50) { // Within 50m
  recordLap()
}
```

**Benefits:**
- Track loops automatically
- Compare lap times
- Interval training

#### 6. Voice Announcements 🔊
**Audio feedback during run:**
```javascript
const speech = new SpeechSynthesisUtterance(
  "1 kilometer completed. Pace: 5 minutes 30 seconds"
)
speechSynthesis.speak(speech)
```

**Benefits:**
- No need to look at phone
- Stay motivated
- Track progress by ear

#### 7. Offline Maps 🗺️
**Cache map tiles:**
```javascript
// Service worker caches map tiles
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('tile')) {
    event.respondWith(caches.match(event.request))
  }
})
```

**Benefits:**
- Works without internet
- Faster map loading
- Lower data usage

#### 8. Heart Rate Integration ❤️
**Bluetooth heart rate monitors:**
```javascript
const device = await navigator.bluetooth.requestDevice({
  filters: [{ services: ['heart_rate'] }]
})
```

**Benefits:**
- Track heart rate zones
- Optimize training intensity
- Monitor fitness improvements

---

## 📋 Implementation Checklist

### Already Done: ✅
- [x] GPS permission request
- [x] Real-time position tracking
- [x] Distance calculation (Haversine)
- [x] Speed from GPS sensor
- [x] Route recording
- [x] Accuracy filtering
- [x] Error handling
- [x] GPS toggle UI
- [x] Session storage with GPS data
- [x] GPS badge on sessions

### Easy to Add: 🟡
- [ ] Route visualization (Leaflet/Mapbox)
- [ ] Live map tracking
- [ ] Auto-pause detection
- [ ] Voice announcements
- [ ] Elevation tracking

### More Complex: 🔴
- [ ] Offline maps
- [ ] Heart rate integration
- [ ] Lap auto-detection
- [ ] Advanced analytics

---

## 🛠️ How to Add Route Visualization

### Option 1: Leaflet (Free, Open Source)

**Install:**
```bash
npm install leaflet
```

**Usage:**
```javascript
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Create map
const map = L.map('map').setView([lat, lng], 13)

// Add tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

// Draw route
const polyline = L.polyline(route.map(p => [p.lat, p.lng]), {
  color: 'blue',
  weight: 4
}).addTo(map)

// Fit map to route
map.fitBounds(polyline.getBounds())
```

**Pros:**
- ✅ Free and open source
- ✅ No API key needed
- ✅ Lightweight
- ✅ Good documentation

**Cons:**
- ⚠️ Basic styling
- ⚠️ Limited features

### Option 2: Mapbox (Free Tier Available)

**Install:**
```bash
npm install mapbox-gl
```

**Usage:**
```javascript
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = 'YOUR_TOKEN'

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [lng, lat],
  zoom: 13
})

// Add route
map.on('load', () => {
  map.addSource('route', {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: route.map(p => [p.lng, p.lat])
      }
    }
  })

  map.addLayer({
    id: 'route',
    type: 'line',
    source: 'route',
    paint: {
      'line-color': '#4CAF50',
      'line-width': 4
    }
  })
})
```

**Pros:**
- ✅ Beautiful maps
- ✅ Advanced features
- ✅ 3D terrain
- ✅ Satellite imagery

**Cons:**
- ⚠️ Requires API key
- ⚠️ Free tier limits (50k loads/month)
- ⚠️ Larger bundle size

### Option 3: Google Maps (Paid)

**Pros:**
- ✅ Familiar interface
- ✅ Excellent coverage
- ✅ Street View

**Cons:**
- ❌ Requires API key
- ❌ Paid (after free tier)
- ❌ More expensive

---

## 🎯 Recommended Next Steps

### Phase 1: Basic Route Visualization
1. Add Leaflet library
2. Create map component
3. Display route after session
4. Show start/end markers

### Phase 2: Live Tracking
1. Add live map view
2. Update marker in real-time
3. Center map on user
4. Show breadcrumb trail

### Phase 3: Advanced Features
1. Auto-pause detection
2. Voice announcements
3. Elevation tracking
4. Lap auto-detection

---

## 🔒 Privacy & Security

### Data Storage:
- ✅ All GPS data stored locally
- ✅ Never sent to external servers
- ✅ User controls all data
- ✅ Can delete sessions anytime

### Permissions:
- ✅ Location permission required
- ✅ User must explicitly grant
- ✅ Can revoke anytime
- ✅ Only used during tracking

### Best Practices:
- ✅ Clear permission prompts
- ✅ Explain why GPS needed
- ✅ Respect user privacy
- ✅ Secure HTTPS connection

---

## 📊 Testing GPS

### Desktop Testing:
1. Open Chrome DevTools
2. Press Ctrl+Shift+P (Cmd+Shift+P on Mac)
3. Type "sensors"
4. Select "Show Sensors"
5. Set custom location
6. Test GPS tracking

### Mobile Testing:
1. Deploy to Amplify (HTTPS required)
2. Open on phone
3. Grant location permission
4. Go outside for best signal
5. Start tracking
6. Walk/run to test

### Troubleshooting:
- **No GPS signal:** Go outside
- **Permission denied:** Check browser settings
- **Inaccurate:** Wait for GPS lock (30-60 seconds)
- **Not working:** Check HTTPS (required for GPS)

---

## 🎉 Summary

**What You Have Now:**
- ✅ Automatic GPS distance tracking
- ✅ Real-time speed from GPS
- ✅ Route recording
- ✅ High accuracy mode
- ✅ Works on iOS and Android
- ✅ Battery efficient
- ✅ Privacy-focused (local storage)

**What You Can Add:**
- 🗺️ Route visualization (Leaflet/Mapbox)
- 📍 Live map tracking
- ⛰️ Elevation tracking
- ⏸️ Auto-pause detection
- 🔊 Voice announcements
- ❤️ Heart rate integration

**Your app is ready for real GPS tracking!** 🏃‍♂️📍

Test it on your phone after Amplify deployment completes!
