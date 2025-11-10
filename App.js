import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import SplashScreen from './components/SplashScreen';
import Panel from './components/Panel';
import { API_BASE_URL, ZONE_COLORS } from './config/constants';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentZoning, setCurrentZoning] = useState(null);
  const [backendConnected, setBackendConnected] = useState(false);
  const [status, setStatus] = useState({ type: 'loading', text: 'Loading...' });
  const [chatMessage, setChatMessage] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [sessionId] = useState(() => 'mobile_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9));
  
  const mapRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      if (data.status === 'healthy') {
        setBackendConnected(true);
        updateStatus('ready', 'Connected to spatial intelligence');
      } else {
        setBackendConnected(false);
        updateStatus('error', 'Unable to connect to backend');
      }
    } catch (error) {
      console.error('Backend health check failed:', error);
      setBackendConnected(false);
      updateStatus('error', 'Backend offline');
    }
  };

  const updateStatus = (type, text) => {
    setStatus({ type, text });
  };

  const enterApplication = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    setShowSplash(false);
  };

  const handleMapPress = async (event) => {
    if (!backendConnected) {
      showOfflineMessage();
      return;
    }

    const { latitude, longitude } = event.nativeEvent.coordinate;
    const location = { latitude, longitude };
    setCurrentLocation(location);

    const zoningResult = await fetchZoningForLocation(latitude, longitude);
    
    if (zoningResult) {
      setCurrentZoning(zoningResult);
      displayLocationInfo(zoningResult);
      updateStatus('ready', `Found: ${zoningResult.zoneName}`);
    } else {
      showNoDataMessage();
      updateStatus('ready', 'No zoning data found');
    }
  };

  const fetchZoningForLocation = async (lat, lng) => {
    try {
      updateStatus('loading', 'Querying spatial database...');
      
      const response = await fetch(`${API_BASE_URL}/zoning/location?lat=${lat}&lng=${lng}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data && data.data.zoneData) {
        return {
          zoneName: data.data.zoneData.zone_name,
          properties: data.data.zoneData,
          source: 'backend_database',
          distance: data.data.zoneData.distance ? `${Math.round(data.data.zoneData.distance)}m` : null,
          area: data.data.zoneData.area ? `${Math.round(data.data.zoneData.area)} m²` : null
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching zoning data:', error);
      updateStatus('error', 'Database query failed');
      return null;
    }
  };

  const useCurrentLocation = async () => {
    try {
      updateStatus('loading', 'Getting your location...');
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'TerraNebular needs access to your location. Please allow location access and try again.'
        );
        updateStatus('ready', 'Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;

      if (latitude < -2.2 || latitude > -1.7 || longitude < 29.8 || longitude > 30.3) {
        Alert.alert(
          'Location Outside Area',
          'Your location is outside the Kigali area.\n\nTerraNebular is currently optimized for Kigali\'s zoning data.'
        );
        updateStatus('ready', 'Location outside Kigali area');
        return;
      }

      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      }

      const locationObj = { latitude, longitude };
      setCurrentLocation(locationObj);
      
      const zoningResult = await fetchZoningForLocation(latitude, longitude);
      
      if (zoningResult) {
        setCurrentZoning(zoningResult);
        displayLocationInfo(zoningResult);
        updateStatus('ready', `Found: ${zoningResult.zoneName}`);
      } else {
        showNoDataMessage();
        updateStatus('ready', 'No zoning data found');
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Unable to detect your position. Please try clicking on the map instead.');
      updateStatus('ready', 'Location error');
    }
  };

  const askClaudeAI = async (question, lat, lng) => {
    try {
      updateStatus('loading', 'Consulting TerraNebular AI...');
      
      const response = await fetch(`${API_BASE_URL}/ai/question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: question,
          lat: lat,
          lng: lng,
          sessionId: sessionId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        return {
          response: data.data.response,
          metadata: data.data.metadata,
          cached: data.data.cached || false
        };
      } else {
        throw new Error(data.error || 'Unknown API error');
      }
    } catch (error) {
      console.error('Error calling AI API:', error);
      updateStatus('error', 'AI consultation failed');
      
      return {
        response: `❌ TerraNebular AI is temporarily offline.\n\nPlease try again or contact City of Kigali directly:\n📞 +250 788 000 000\n🌐 kigalicity.gov.rw\n\nError: ${error.message}`,
        metadata: { fallback: true, error: error.message },
        cached: false
      };
    }
  };

  const sendMessage = async () => {
    if (!chatMessage.trim() || !currentZoning || !currentLocation) {
      if (!backendConnected) {
        showOfflineMessage();
        return;
      }
      if (!currentZoning) {
        Alert.alert('No Location Selected', 'Please select a location on the map first.');
        return;
      }
      return;
    }

    const question = chatMessage.trim();
    setChatMessage('');
    setAiResponse('TerraNebular AI is analyzing your question...');
    setShowChat(true);

    try {
      const result = await askClaudeAI(
        question,
        currentLocation.latitude,
        currentLocation.longitude
      );
      
      setAiResponse(result.response);
      
      setConversationHistory(prev => {
        const newHistory = [...prev, { question, response: result.response }];
        return newHistory.length > 10 ? newHistory.slice(1) : newHistory;
      });
      
      updateStatus('ready', 'AI response received');
    } catch (error) {
      console.error('Chat error:', error);
      setAiResponse(`❌ Sorry, I couldn't process your question right now.\n\nError: ${error.message}\n\nPlease try again or contact City of Kigali directly.`);
      updateStatus('ready', 'Error occurred');
    }
  };

  const displayLocationInfo = (zoning) => {
    const welcomeMessage = `Welcome to TerraNebular - your spatial intelligence assistant.

📍 You have selected: ${zoning.zoneName}

✨ Ask me anything about development regulations, building permissions, investment potential, or permit processes for this location.`;
    
    setAiResponse(welcomeMessage);
    setShowChat(true);
  };

  const showNoDataMessage = () => {
    const message = `No zoning data found for this location.

This could mean:
• The location is outside the mapped zoning areas
• The coordinates fall between zone boundaries
• Network connectivity issues

Please try:
• Selecting a different location within Kigali
• Checking your internet connection
• Contacting City of Kigali for the latest zoning information

📞 City of Kigali Planning: +250 788 000 000
🌐 More info: kigalicity.gov.rw`;
    
    setAiResponse(message);
    setShowChat(true);
  };

  const showOfflineMessage = () => {
    const message = `TerraNebular backend is currently offline.

Please:
• Check your internet connection
• Ensure the backend server is running
• Contact the system administrator

While offline, you can still explore the map, but spatial queries and AI assistance are unavailable.

📞 For urgent zoning questions, contact City of Kigali directly:
+250 788 000 000`;
    
    setAiResponse(message);
    setShowChat(true);
  };

  if (showSplash) {
    return <SplashScreen onEnter={enterApplication} />;
  }

  const isMobile = width < 768;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.appContainer, { opacity: fadeAnim }, isMobile && styles.appContainerMobile]}>
        {!isMobile && (
          <Panel
            currentZoning={currentZoning}
            status={status}
            onUseLocation={useCurrentLocation}
            chatMessage={chatMessage}
            onChatMessageChange={setChatMessage}
            onSendMessage={sendMessage}
            aiResponse={aiResponse}
            showChat={showChat}
          />
        )}
        
        <View style={[styles.mapContainer, isMobile && styles.mapContainerMobile]}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: -1.9441,
              longitude: 30.0619,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
            onPress={handleMapPress}
            mapType="hybrid"
          >
            {currentLocation && (
              <Marker
                coordinate={currentLocation}
                pinColor="#EC4899"
              />
            )}
          </MapView>
        </View>

        {isMobile && (
          <Panel
            currentZoning={currentZoning}
            status={status}
            onUseLocation={useCurrentLocation}
            chatMessage={chatMessage}
            onChatMessageChange={setChatMessage}
            onSendMessage={sendMessage}
            aiResponse={aiResponse}
            showChat={showChat}
          />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  appContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  appContainerMobile: {
    flexDirection: 'column',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  mapContainerMobile: {
    flex: 1,
    minHeight: height * 0.5,
  },
  map: {
    flex: 1,
  },
});

