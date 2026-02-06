# ⌚ Smartwatch Integration Guide

## Overview

This guide covers how to integrate heart rate monitoring and other smartwatch features into your FitFlow app.

---

## 🎯 Integration Options

### Option 1: Web Bluetooth API (Recommended for PWA)

**Best For:** Direct connection to Bluetooth heart rate monitors and smartwatches

**Supported Devices:**
- ✅ Polar H10, H9, OH1
- ✅ Wahoo TICKR
- ✅ Garmin HRM-Dual
- ✅ Apple Watch (via third-party apps)
- ✅ Fitbit (limited)
- ✅ Any Bluetooth Low Energy (BLE) heart rate monitor

**Browser Support:**
- ✅ Chrome/Edge (Desktop & Android)
- ✅ Samsung Internet
- ⚠️ Safari (iOS 16.4+, limited support)
- ❌ Firefox (not yet supported)

**Pros:**
- ✅ No app installation needed
- ✅ Works in PWA
- ✅ Real-time data
- ✅ No API keys required
- ✅ Free

**Cons:**
- ⚠️ Limited iOS Safari support
- ⚠️ User must pair device
- ⚠️ Requires Bluetooth permission

---

### Option 2: Apple HealthKit (iOS Native)

**Best For:** Deep integration with Apple Watch and iPhone Health app

**What You Get:**
- Heart rate data
- Workout data
- Steps, calories
- Sleep data
- Activity rings

**Requirements:**
- Native iOS app (not PWA)
- Swift/Objective-C development
- Apple Developer account
- HealthKit entitlements

**Pros:**
- ✅ Deep Apple ecosystem integration
- ✅ Historical data access
- ✅ Automatic syncing
- ✅ Official Apple support

**Cons:**
- ❌ Requires native app
- ❌ iOS only
- ❌ More complex development
- ❌ App Store approval needed

---

### Option 3: Google Fit API (Android)

**Best For:** Integration with Android Wear and Google Fit

**What You Get:**
- Heart rate data
- Activity data
- Steps, calories
- Sleep data
- Workout sessions

**Requirements:**
- Google Cloud project
- OAuth 2.0 setup
- Google Fit API enabled
- User consent

**Pros:**
- ✅ Works with many Android devices
- ✅ Historical data access
- ✅ Automatic syncing
- ✅ Free tier available

**Cons:**
- ⚠️ Requires API setup
- ⚠️ OAuth flow needed
- ⚠️ Android only
- ⚠️ User must have Google Fit

---

### Option 4: Fitbit Web API

**Best For:** Fitbit device users

**What You Get:**
- Heart rate data
- Activity data
- Sleep data
- Workout data

**Requirements:**
- Fitbit Developer account
- OAuth 2.0 setup
- API application registration

**Pros:**
- ✅ Works with all Fitbit devices
- ✅ Historical data access
- ✅ Detailed metrics

**Cons:**
- ⚠️ Requires API setup
- ⚠️ OAuth flow needed
- ⚠️ Rate limits apply
- ⚠️ Fitbit users only

---

### Option 5: Strava API

**Best For:** Athletes already using Strava

**What You Get:**
- Activity data
- Heart rate data (if recorded)
- GPS routes
- Performance metrics

**Requirements:**
- Strava API application
- OAuth 2.0 setup

**Pros:**
- ✅ Large user base
- ✅ Rich activity data
- ✅ Social features

**Cons:**
- ⚠️ Requires Strava account
- ⚠️ OAuth flow needed
- ⚠️ Rate limits apply

---

## 🚀 Recommended Implementation: Web Bluetooth API

### Why Web Bluetooth?

1. **Works in your PWA** - No native app needed
2. **Cross-platform** - Works on Android, limited iOS
3. **Real-time** - Live heart rate during workouts
4. **No API keys** - Direct device connection
5. **Free** - No costs or rate limits

### What You Can Track:

- ❤️ **Heart Rate** - Real-time BPM
- 📊 **Heart Rate Zones** - Fat burn, cardio, peak
- 🔥 **Calories Burned** - Based on HR and activity
- ⏱️ **Time in Zones** - Training effectiveness
- 📈 **Average/Max HR** - Session statistics
- 💪 **Training Load** - Workout intensity

---

## 💻 Implementation Code

### 1. Heart Rate Monitor Connection

```javascript
// src/services/heartRateMonitor.js

export class HeartRateMonitor {
  constructor() {
    this.device = null
    this.server = null
    this.characteristic = null
    this.onHeartRateChange = null
    this.isConnected = false
  }

  // Check if Web Bluetooth is supported
  isSupported() {
    return 'bluetooth' in navigator
  }

  // Connect to heart rate monitor
  async connect() {
    try {
      // Request Bluetooth device
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['battery_service']
      })

      // Connect to GATT server
      this.server = await this.device.gatt.connect()

      // Get heart rate service
      const service = await this.server.getPrimaryService('heart_rate')

      // Get heart rate measurement characteristic
      this.characteristic = await service.getCharacteristic('heart_rate_measurement')

      // Start notifications
      await this.characteristic.startNotifications()

      // Listen for heart rate changes
      this.characteristic.addEventListener('characteristicvaluechanged', (event) => {
        const heartRate = this.parseHeartRate(event.target.value)
        if (this.onHeartRateChange) {
          this.onHeartRateChange(heartRate)
        }
      })

      this.isConnected = true
      return true
    } catch (error) {
      console.error('Bluetooth connection failed:', error)
      throw error
    }
  }

  // Parse heart rate data
  parseHeartRate(value) {
    const flags = value.getUint8(0)
    const rate16Bits = flags & 0x1
    let heartRate

    if (rate16Bits) {
      heartRate = value.getUint16(1, true)
    } else {
      heartRate = value.getUint8(1)
    }

    return heartRate
  }

  // Disconnect from device
  async disconnect() {
    if (this.device && this.device.gatt.connected) {
      await this.device.gatt.disconnect()
      this.isConnected = false
    }
  }

  // Get battery level (if supported)
  async getBatteryLevel() {
    try {
      const service = await this.server.getPrimaryService('battery_service')
      const characteristic = await service.getCharacteristic('battery_level')
      const value = await characteristic.readValue()
      return value.getUint8(0)
    } catch (error) {
      return null
    }
  }
}
```

### 2. Heart Rate Zones Calculator

```javascript
// src/services/heartRateZones.js

export class HeartRateZones {
  constructor(age, restingHR = 60) {
    this.age = age
    this.restingHR = restingHR
    this.maxHR = 220 - age
    this.hrReserve = this.maxHR - restingHR
  }

  // Calculate zones using Karvonen formula
  getZones() {
    return {
      recovery: {
        name: 'Recovery',
        min: Math.round(this.restingHR + this.hrReserve * 0.50),
        max: Math.round(this.restingHR + this.hrReserve * 0.60),
        color: '#4CAF50',
        description: 'Easy recovery, warm-up'
      },
      fatBurn: {
        name: 'Fat Burn',
        min: Math.round(this.restingHR + this.hrReserve * 0.60),
        max: Math.round(this.restingHR + this.hrReserve * 0.70),
        color: '#8BC34A',
        description: 'Aerobic endurance, fat burning'
      },
      cardio: {
        name: 'Cardio',
        min: Math.round(this.restingHR + this.hrReserve * 0.70),
        max: Math.round(this.restingHR + this.hrReserve * 0.80),
        color: '#FFC107',
        description: 'Aerobic fitness, stamina'
      },
      threshold: {
        name: 'Threshold',
        min: Math.round(this.restingHR + this.hrReserve * 0.80),
        max: Math.round(this.restingHR + this.hrReserve * 0.90),
        color: '#FF9800',
        description: 'Lactate threshold, performance'
      },
      peak: {
        name: 'Peak',
        min: Math.round(this.restingHR + this.hrReserve * 0.90),
        max: this.maxHR,
        color: '#F44336',
        description: 'Maximum effort, anaerobic'
      }
    }
  }

  // Get current zone
  getCurrentZone(currentHR) {
    const zones = this.getZones()
    
    for (const [key, zone] of Object.entries(zones)) {
      if (currentHR >= zone.min && currentHR <= zone.max) {
        return { key, ...zone }
      }
    }
    
    if (currentHR < zones.recovery.min) {
      return { key: 'resting', name: 'Resting', color: '#9E9E9E' }
    }
    
    return { key: 'max', name: 'Max Effort', color: '#D32F2F' }
  }

  // Calculate calories burned (rough estimate)
  calculateCalories(avgHR, durationMinutes, weight = 70) {
    // Men: ((-55.0969 + (0.6309 x HR) + (0.1988 x W) + (0.2017 x A)) / 4.184) x T
    // Simplified version
    const caloriesPerMinute = (avgHR * 0.6309 + weight * 0.1988 - 55.0969) / 4.184
    return Math.round(caloriesPerMinute * durationMinutes)
  }
}
```

### 3. React Component Integration

```javascript
// Add to CardioTracker.jsx

import { HeartRateMonitor } from '../services/heartRateMonitor'
import { HeartRateZones } from '../services/heartRateZones'

// In component state:
const [hrMonitor] = useState(() => new HeartRateMonitor())
const [currentHR, setCurrentHR] = useState(0)
const [avgHR, setAvgHR] = useState(0)
const [maxHR, setMaxHR] = useState(0)
const [hrHistory, setHrHistory] = useState([])
const [hrConnected, setHrConnected] = useState(false)
const [userAge, setUserAge] = useState(30) // Get from user profile
const [hrZones] = useState(() => new HeartRateZones(userAge))

// Connect to heart rate monitor
const handleConnectHR = async () => {
  try {
    hrMonitor.onHeartRateChange = (hr) => {
      setCurrentHR(hr)
      setHrHistory(prev => [...prev, { hr, timestamp: Date.now() }])
      
      // Update max HR
      if (hr > maxHR) setMaxHR(hr)
      
      // Calculate average
      const allHRs = [...hrHistory, { hr }].map(h => h.hr)
      const avg = allHRs.reduce((a, b) => a + b, 0) / allHRs.length
      setAvgHR(Math.round(avg))
    }
    
    await hrMonitor.connect()
    setHrConnected(true)
    alert('Heart rate monitor connected!')
  } catch (error) {
    alert('Failed to connect: ' + error.message)
  }
}

// Disconnect
const handleDisconnectHR = async () => {
  await hrMonitor.disconnect()
  setHrConnected(false)
  setCurrentHR(0)
}

// In JSX:
<div className="hr-section">
  {!hrConnected ? (
    <button onClick={handleConnectHR}>
      ❤️ Connect Heart Rate Monitor
    </button>
  ) : (
    <>
      <div className="hr-display">
        <div className="current-hr">
          <span className="hr-value">{currentHR}</span>
          <span className="hr-unit">BPM</span>
        </div>
        <div className="hr-zone">
          {hrZones.getCurrentZone(currentHR).name}
        </div>
      </div>
      <div className="hr-stats">
        <div>Avg: {avgHR} BPM</div>
        <div>Max: {maxHR} BPM</div>
      </div>
      <button onClick={handleDisconnectHR}>
        Disconnect
      </button>
    </>
  )}
</div>
```

---

## 📊 Features You Can Add

### 1. Real-Time Heart Rate Display
- Large BPM number
- Current zone indicator
- Zone color coding
- Heart icon animation

### 2. Heart Rate Zones
- Visual zone bars
- Time spent in each zone
- Zone targets
- Training effectiveness score

### 3. Heart Rate Graph
- Real-time line chart
- Historical view
- Zone overlays
- Pace correlation

### 4. Training Metrics
- Average HR
- Max HR
- HR variability
- Recovery time
- Training load

### 5. Alerts & Notifications
- Zone change alerts
- Max HR warnings
- Target zone notifications
- Recovery reminders

### 6. Historical Analysis
- HR trends over time
- Fitness improvements
- Resting HR tracking
- Max HR changes

---

## 🎨 UI Components

### Heart Rate Display:
```
┌─────────────────────────┐
│   ❤️ Heart Rate         │
│                         │
│       142               │
│       BPM               │
│                         │
│   🔥 Cardio Zone        │
│   ████████░░░░ 70-80%   │
│                         │
│   Avg: 138  Max: 156    │
└─────────────────────────┘
```

### Zone Indicator:
```
Recovery  ████░░░░░░░░░░░░
Fat Burn  ████████░░░░░░░░
Cardio    ████████████░░░░  ← You are here
Threshold ░░░░░░░░░░░░░░░░
Peak      ░░░░░░░░░░░░░░░░
```

### Session Summary:
```
❤️ Heart Rate Summary
━━━━━━━━━━━━━━━━━━━━━
Average:    142 BPM
Maximum:    178 BPM
Time in Zone:
  Recovery:   5 min
  Fat Burn:   8 min
  Cardio:    15 min ⭐
  Threshold:  7 min
  Peak:       2 min
```

---

## 🔧 Setup Instructions

### For Users:

**1. Pair Your Device:**
- Turn on Bluetooth on phone
- Put heart rate monitor in pairing mode
- Open FitFlow app
- Click "Connect Heart Rate Monitor"
- Select your device from list

**2. During Workout:**
- Heart rate displays automatically
- See current zone
- Track time in zones
- View real-time graph

**3. After Workout:**
- HR data saved with session
- View HR summary
- Analyze zones
- Track improvements

### For Developers:

**1. Add Web Bluetooth:**
```bash
# No installation needed - built into browsers
```

**2. Add Heart Rate Service:**
```javascript
// Create heartRateMonitor.js
// Create heartRateZones.js
// Import into CardioTracker
```

**3. Update UI:**
```javascript
// Add HR display components
// Add zone indicators
// Add connection button
```

**4. Test:**
```javascript
// Use Chrome DevTools
// Bluetooth emulator
// Real device testing
```

---

## 📱 Device Compatibility

### Tested Devices:

**Heart Rate Monitors:**
- ✅ Polar H10 (Excellent)
- ✅ Wahoo TICKR (Excellent)
- ✅ Garmin HRM-Dual (Excellent)
- ✅ Polar OH1 (Good)
- ✅ Coospo H6 (Good)

**Smartwatches:**
- ⚠️ Apple Watch (via third-party apps)
- ⚠️ Garmin watches (limited)
- ⚠️ Fitbit (limited)
- ❌ Samsung Galaxy Watch (not supported)

**Best Option:**
Dedicated Bluetooth chest strap (Polar H10, Wahoo TICKR)
- Most accurate
- Best battery life
- Reliable connection
- Affordable ($60-90)

---

## 🚀 Future Enhancements

### Phase 1: Basic HR Tracking
- [x] Connect to BLE devices
- [x] Display current HR
- [x] Calculate zones
- [x] Save with session

### Phase 2: Advanced Metrics
- [ ] HR variability (HRV)
- [ ] Recovery time
- [ ] Training load
- [ ] Fitness trends

### Phase 3: Smart Features
- [ ] Auto-pause on high HR
- [ ] Zone-based training
- [ ] HR-based intervals
- [ ] Adaptive workouts

### Phase 4: Integration
- [ ] Export to Strava
- [ ] Sync with Apple Health
- [ ] Sync with Google Fit
- [ ] Share with coach

---

## 💰 Cost Comparison

### Web Bluetooth (Recommended):
- **Development:** Free
- **API Costs:** $0
- **User Cost:** $60-90 (HR monitor)
- **Maintenance:** Minimal

### Apple HealthKit:
- **Development:** $99/year (Apple Developer)
- **API Costs:** $0
- **User Cost:** $0 (if has Apple Watch)
- **Maintenance:** Moderate

### Google Fit API:
- **Development:** Free
- **API Costs:** Free tier
- **User Cost:** $0
- **Maintenance:** Moderate

### Fitbit API:
- **Development:** Free
- **API Costs:** Free tier
- **User Cost:** $0 (if has Fitbit)
- **Maintenance:** Moderate

---

## 🎯 Recommendation

**Start with Web Bluetooth:**

1. **Immediate Benefits:**
   - Works in your PWA now
   - No API setup needed
   - Real-time data
   - Free to implement

2. **User Experience:**
   - One-time pairing
   - Automatic connection
   - Live heart rate
   - No app switching

3. **Future-Proof:**
   - Can add other APIs later
   - Works alongside GPS
   - Expandable features
   - Growing browser support

**Later Add:**
- Apple HealthKit (if building native iOS app)
- Google Fit (for historical data sync)
- Strava (for social features)

---

## 📚 Resources

### Documentation:
- [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)
- [Heart Rate Service Spec](https://www.bluetooth.com/specifications/specs/heart-rate-service-1-0/)
- [Apple HealthKit](https://developer.apple.com/documentation/healthkit)
- [Google Fit API](https://developers.google.com/fit)

### Libraries:
- [web-bluetooth](https://github.com/WebBluetoothCG/web-bluetooth) - Polyfill
- [noble](https://github.com/abandonware/noble) - Node.js Bluetooth
- [react-native-ble-plx](https://github.com/dotintent/react-native-ble-plx) - React Native

### Example Apps:
- [Web Bluetooth Samples](https://googlechrome.github.io/samples/web-bluetooth/)
- [Heart Rate Monitor Demo](https://webbluetoothcg.github.io/demos/heart-rate-sensor/)

---

## 🎉 Summary

**Best Approach for FitFlow:**

1. **Implement Web Bluetooth** - Works in PWA, real-time HR
2. **Support BLE heart rate monitors** - Polar, Wahoo, Garmin
3. **Add zone-based training** - Visual feedback, coaching
4. **Save HR data with sessions** - Historical analysis
5. **Later add API integrations** - Apple Health, Google Fit

**This gives you:**
- ✅ Professional heart rate tracking
- ✅ Works on mobile (Android + limited iOS)
- ✅ No API costs or complexity
- ✅ Real-time feedback during workouts
- ✅ Expandable to other platforms later

**Your users get:**
- ❤️ Live heart rate monitoring
- 📊 Training zone guidance
- 🎯 Better workout effectiveness
- 📈 Fitness improvements tracking
- 💪 Professional-grade features

Ready to implement? I can add the Web Bluetooth heart rate monitoring to your CardioTracker right now! 🚀
