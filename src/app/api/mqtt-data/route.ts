import { NextResponse } from 'next/server';
import { SensorData, HistoricalEntry } from '@/types/sensor';
import { logger } from '@/lib/logger';

// In-memory storage for the latest sensor data
const latestData: SensorData = {
  temperature: null,
  humidity: null,
  light: null,
  ph: null,
  ec: null,
  waterTemp: null,
  lastUpdate: null,
  status: 'connecting'
};

// Historical data storage (in production, use a database)
const historicalData: HistoricalEntry[] = [];

// Share historical data globally for export functionality
declare global {
  var historicalDataMQTT: HistoricalEntry[];
}

// Initialize global variable
if (!global.historicalDataMQTT) {
  global.historicalDataMQTT = [];
}

let mqttClient: import('mqtt').MqttClient | null = null;
let isConnecting = false;
let lastMessageTime: number = 0;
let connectionCheckInterval: NodeJS.Timeout | null = null;

const connectToMQTT = async (): Promise<void> => {
  if (isConnecting || (mqttClient && mqttClient.connected)) {
    return;
  }

  isConnecting = true;

  try {
    logger.info('Connecting to MQTT broker...');

    // Dynamic import for server-side
    const mqtt = await import('mqtt');

    const brokerUrl = process.env.NEXT_PUBLIC_MQTT_BROKER_URL || 'mqtt://192.168.0.8:1883';
    const username = process.env.NEXT_PUBLIC_MQTT_USERNAME;
    const password = process.env.NEXT_PUBLIC_MQTT_PASSWORD;

    mqttClient = mqtt.default.connect(brokerUrl, {
      clientId: `onefarmer_api_${Math.random().toString(16).slice(3)}`,
      keepalive: 30,
      reconnectPeriod: 5000,
      connectTimeout: 10000,
      username,
      password,
    });

    mqttClient.on('connect', () => {
      logger.info('Connected to MQTT broker');
      latestData.status = 'connected';
      latestData.error = undefined;
      lastMessageTime = Date.now();

      // Start connection monitoring
      if (connectionCheckInterval) {
        clearInterval(connectionCheckInterval);
      }
      connectionCheckInterval = setInterval(checkConnectionHealth, 30000); // Check every 30 seconds

      // Subscribe to sensor topics
      if (mqttClient) {
        mqttClient.subscribe([
          'hydroponic/sensors/rose/temperature',
          'hydroponic/sensors/rose/humidity',
          'hydroponic/sensors/rose/light',
          'hydroponic/sensors/rose/ph',
          'hydroponic/sensors/rose/ec',
          'hydroponic/sensors/rose/water_temp'
        ], (err: Error | null) => {
          if (err) {
            logger.error('Subscription error:', err);
            latestData.status = 'error';
            latestData.error = 'Failed to subscribe to topics';
          }
        });
      }
    });

    mqttClient.on('message', (topic: string, message: Buffer) => {
      try {
        const value = parseFloat(message.toString());
        const now = new Date().toISOString();
        lastMessageTime = Date.now();

        logger.info(`Received ${topic}: ${value}`);

        // Update connection status to connected since we're receiving data
        if (latestData.status !== 'connected') {
          latestData.status = 'connected';
          latestData.error = undefined;
        }

        switch (topic) {
          case 'hydroponic/sensors/rose/temperature':
            latestData.temperature = value;
            break;
          case 'hydroponic/sensors/rose/humidity':
            latestData.humidity = value;
            break;
          case 'hydroponic/sensors/rose/light':
            latestData.light = value;
            break;
          case 'hydroponic/sensors/rose/ph':
            latestData.ph = value;
            break;
          case 'hydroponic/sensors/rose/ec':
            latestData.ec = value;
            break;
          case 'hydroponic/sensors/rose/water_temp':
            latestData.waterTemp = value;
            break;
        }

        latestData.lastUpdate = now;

        // Store historical data (keep last 1000 entries)
        const historyEntry: HistoricalEntry = {
          timestamp: now,
          temperature: latestData.temperature,
          humidity: latestData.humidity,
          light: latestData.light,
          ph: latestData.ph,
          ec: latestData.ec,
          waterTemp: latestData.waterTemp
        };

        historicalData.push(historyEntry);
        global.historicalDataMQTT.push(historyEntry);

        // Keep only last 1000 entries in both arrays
        if (historicalData.length > 1000) {
          historicalData.shift();
        }
        if (global.historicalDataMQTT.length > 1000) {
          global.historicalDataMQTT.shift();
        }
      } catch (error) {
        logger.error('Error parsing message:', error);
      }
    });

    mqttClient.on('error', (error: Error) => {
      logger.error('MQTT error:', error);
      latestData.status = 'error';
      latestData.error = error.message || 'Connection failed';
    });

    mqttClient.on('close', () => {
      logger.warn('MQTT connection closed');
      latestData.status = 'error';
      latestData.error = 'Connection closed';
      if (connectionCheckInterval) {
        clearInterval(connectionCheckInterval);
        connectionCheckInterval = null;
      }
    });

    mqttClient.on('disconnect', () => {
      logger.warn('MQTT client disconnected');
      latestData.status = 'error';
      latestData.error = 'Disconnected from broker';
    });

    mqttClient.on('offline', () => {
      logger.warn('MQTT client is offline');
      latestData.status = 'error';
      latestData.error = 'Client is offline';
    });

  } catch (error) {
    logger.error('Failed to connect to MQTT:', error);
    latestData.status = 'error';
    latestData.error = 'Failed to connect to broker';
  } finally {
    isConnecting = false;
  }
};

// Check connection health based on message frequency
const checkConnectionHealth = (): void => {
  const now = Date.now();
  const timeSinceLastMessage = now - lastMessageTime;

  // If no message received in 2 minutes, consider connection unhealthy
  if (timeSinceLastMessage > 120000) {
    logger.warn('No MQTT messages received in 2 minutes, marking as disconnected');
    latestData.status = 'error';
    latestData.error = 'No data received - connection may be lost';
  }

  // If MQTT client exists but shows as disconnected
  if (mqttClient && !mqttClient.connected) {
    logger.warn('MQTT client shows as disconnected');
    latestData.status = 'error';
    latestData.error = 'MQTT client disconnected';
  }
};

// Initialize MQTT connection when the API route is first accessed
let initialized = false;

export async function GET() {
  // Initialize MQTT connection on first request
  if (!initialized) {
    initialized = true;
    connectToMQTT();
  }

  // Check connection health
  checkConnectionHealth();

  // Try to reconnect if not connected
  if (!mqttClient || !mqttClient.connected) {
    if (latestData.status !== 'connecting') {
      latestData.status = 'connecting';
      latestData.error = 'Attempting to reconnect...';
    }
    connectToMQTT();
  }

  // Return the latest data
  const responseData = {
    ...latestData,
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(responseData, {
    headers: {
      'Cache-Control': 'no-cache, no-store, max-age=0',
    },
  });
}