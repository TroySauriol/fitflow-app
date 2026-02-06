// Heart Rate Monitor Service using Web Bluetooth API
// Supports any Bluetooth Low Energy (BLE) heart rate monitor
// Compatible with: Polar H10, Wahoo TICKR, Garmin HRM-Dual, etc.

export class HeartRateMonitor {
  constructor() {
    this.device = null
    this.server = null
    this.characteristic = null
    this.onHeartRateChange = null
    this.onConnectionChange = null
    this.isConnected = false
    this.deviceName = ''
  }

  // Check if Web Bluetooth is supported
  isSupported() {
    if (!('bluetooth' in navigator)) {
      return { supported: false, reason: 'Web Bluetooth not supported in this browser' }
    }
    return { supported: true }
  }

  // Connect to heart rate monitor
  async connect() {
    try {
      console.log('Requesting Bluetooth device...')
      
      // Request device with heart rate service
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['battery_service', 'device_information']
      })

      this.deviceName = this.device.name || 'Heart Rate Monitor'
      console.log('Device selected:', this.deviceName)

      // Listen for disconnection
      this.device.addEventListener('gattserverdisconnected', () => {
        console.log('Device disconnected')
        this.isConnected = false
        if (this.onConnectionChange) {
          this.onConnectionChange(false)
        }
      })

      // Connect to GATT server
      console.log('Connecting to GATT server...')
      this.server = await this.device.gatt.connect()

      // Get heart rate service
      console.log('Getting heart rate service...')
      const service = await this.server.getPrimaryService('heart_rate')

      // Get heart rate measurement characteristic
      console.log('Getting heart rate characteristic...')
      this.characteristic = await service.getCharacteristic('heart_rate_measurement')

      // Start notifications
      console.log('Starting notifications...')
      await this.characteristic.startNotifications()

      // Listen for heart rate changes
      this.characteristic.addEventListener('characteristicvaluechanged', (event) => {
        const heartRate = this.parseHeartRate(event.target.value)
        if (this.onHeartRateChange) {
          this.onHeartRateChange(heartRate)
        }
      })

      this.isConnected = true
      if (this.onConnectionChange) {
        this.onConnectionChange(true)
      }

      console.log('Heart rate monitor connected successfully!')
      return { success: true, deviceName: this.deviceName }
    } catch (error) {
      console.error('Bluetooth connection failed:', error)
      this.isConnected = false
      
      let errorMessage = 'Failed to connect to heart rate monitor'
      if (error.name === 'NotFoundError') {
        errorMessage = 'No device selected'
      } else if (error.name === 'SecurityError') {
        errorMessage = 'Bluetooth access denied. Please enable Bluetooth permissions.'
      } else if (error.name === 'NetworkError') {
        errorMessage = 'Device connection failed. Make sure the device is turned on and in range.'
      }
      
      return { success: false, error: errorMessage }
    }
  }

  // Parse heart rate data from Bluetooth characteristic
  parseHeartRate(value) {
    // Heart Rate Measurement format:
    // Byte 0: Flags
    //   Bit 0: Heart Rate Value Format (0 = uint8, 1 = uint16)
    //   Bit 1-2: Sensor Contact Status
    //   Bit 3: Energy Expended Status
    //   Bit 4: RR-Interval
    // Byte 1+: Heart Rate Value
    
    const flags = value.getUint8(0)
    const rate16Bits = flags & 0x1
    let heartRate

    if (rate16Bits) {
      // Heart rate is 16-bit value
      heartRate = value.getUint16(1, true) // little-endian
    } else {
      // Heart rate is 8-bit value
      heartRate = value.getUint8(1)
    }

    // Validate heart rate (20-220 BPM is reasonable range)
    if (heartRate < 20 || heartRate > 220) {
      console.warn('Invalid heart rate reading:', heartRate)
      return null
    }

    return heartRate
  }

  // Disconnect from device
  async disconnect() {
    try {
      if (this.characteristic) {
        await this.characteristic.stopNotifications()
      }
      
      if (this.device && this.device.gatt.connected) {
        await this.device.gatt.disconnect()
      }
      
      this.isConnected = false
      this.device = null
      this.server = null
      this.characteristic = null
      
      if (this.onConnectionChange) {
        this.onConnectionChange(false)
      }
      
      console.log('Heart rate monitor disconnected')
      return { success: true }
    } catch (error) {
      console.error('Disconnect error:', error)
      return { success: false, error: error.message }
    }
  }

  // Get battery level (if supported)
  async getBatteryLevel() {
    try {
      if (!this.server) return null
      
      const service = await this.server.getPrimaryService('battery_service')
      const characteristic = await service.getCharacteristic('battery_level')
      const value = await characteristic.readValue()
      return value.getUint8(0)
    } catch (error) {
      console.log('Battery level not available')
      return null
    }
  }

  // Get device information (if supported)
  async getDeviceInfo() {
    try {
      if (!this.server) return null
      
      const service = await this.server.getPrimaryService('device_information')
      
      const info = {}
      
      try {
        const manufacturer = await service.getCharacteristic('manufacturer_name_string')
        const value = await manufacturer.readValue()
        info.manufacturer = new TextDecoder().decode(value)
      } catch (e) {
        // Not available
      }
      
      try {
        const model = await service.getCharacteristic('model_number_string')
        const value = await model.readValue()
        info.model = new TextDecoder().decode(value)
      } catch (e) {
        // Not available
      }
      
      return Object.keys(info).length > 0 ? info : null
    } catch (error) {
      console.log('Device info not available')
      return null
    }
  }

  // Reconnect to previously connected device
  async reconnect() {
    if (!this.device) {
      return { success: false, error: 'No device to reconnect to' }
    }
    
    try {
      if (this.device.gatt.connected) {
        return { success: true, message: 'Already connected' }
      }
      
      return await this.connect()
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

export default HeartRateMonitor
