import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { ZONE_COLORS } from '../config/constants';

const { width, height } = Dimensions.get('window');

export default function Panel({
  currentZoning,
  status,
  onUseLocation,
  chatMessage,
  onChatMessageChange,
  onSendMessage,
  aiResponse,
  showChat,
}) {
  const getStatusColor = () => {
    switch (status.type) {
      case 'ready':
        return '#10B981';
      case 'error':
        return '#EC4899';
      case 'loading':
        return '#F59E0B';
      default:
        return '#F59E0B';
    }
  };

  const getZoneColor = () => {
    if (!currentZoning) return '#999999';
    return ZONE_COLORS[currentZoning.zoneName] || '#999999';
  };

  const isMobile = width < 768;

  return (
    <View style={[styles.panel, isMobile && styles.panelMobile]}>
      {/* Panel Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={[styles.ring, styles.ring1]} />
          <View style={[styles.ring, styles.ring2]} />
          <View style={[styles.ring, styles.ring3]} />
          <Text style={styles.logoText}>🌌</Text>
        </View>
        <Text style={styles.title}>TerraNebular</Text>

        <View style={styles.headerControls}>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={onUseLocation}
          >
            <Text style={styles.locationButtonText}>📍 Use My Location</Text>
          </TouchableOpacity>
          <View style={styles.statusIndicator}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor() },
              ]}
            />
            <Text style={styles.statusText}>{status.text}</Text>
          </View>
        </View>
      </View>

      {/* Panel Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {!currentZoning && (
          <View style={styles.initialGuidance}>
            <Text style={styles.guidanceText}>
              Tap anywhere on the map or use "Use My Location" and ask AI about
              zoning to get insights.
            </Text>
          </View>
        )}

        {currentZoning && (
          <View style={styles.locationHeader}>
            <View
              style={[
                styles.zoneColorIndicator,
                { backgroundColor: getZoneColor() },
              ]}
            />
            <View style={styles.zoneInfo}>
              <Text style={styles.zoneName}>{currentZoning.zoneName}</Text>
              <Text style={styles.zoneDescription}>
                {currentZoning.properties?.phase ||
                  `${currentZoning.properties?.level_1 || ''} - ${currentZoning.properties?.level_2 || ''}` ||
                  'Development zone per Kigali master plan'}
              </Text>
            </View>
          </View>
        )}

        {showChat && (
          <View style={styles.chatContainer}>
            <View style={styles.aiResponse}>
              <Text style={styles.aiResponseText}>{aiResponse}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Chat Input */}
      <View style={styles.chatInputContainer}>
        <TextInput
          style={styles.chatInput}
          value={chatMessage}
          onChangeText={onChatMessageChange}
          placeholder="Ask about zoning, permits, building regulations..."
          placeholderTextColor="#94A3B8"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={onSendMessage}
          disabled={!chatMessage.trim()}
        >
          <Text style={styles.sendButtonText}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: width < 768 ? width : width * 0.4,
    minWidth: width < 768 ? width : 300,
    maxWidth: width < 768 ? width : 400,
    height: width < 768 ? height * 0.4 : undefined,
    maxHeight: width < 768 ? height * 0.5 : undefined,
    backgroundColor: '#F8FAFC',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 10,
    flexDirection: 'column',
  },
  panelMobile: {
    width: width,
  },
  header: {
    backgroundColor: '#0F172A',
    padding: 20,
    paddingBottom: 16,
  },
  logoContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
    borderRadius: 999,
  },
  ring1: {
    width: 40,
    height: 40,
    borderColor: '#6366F1',
  },
  ring2: {
    width: 50,
    height: 50,
    borderColor: '#EC4899',
  },
  ring3: {
    width: 60,
    height: 60,
    borderColor: '#F59E0B',
  },
  logoText: {
    fontSize: 24,
    zIndex: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 16,
  },
  headerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  locationButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    flex: 1,
  },
  locationButtonText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: '#F8FAFC',
    fontSize: 11,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  initialGuidance: {
    backgroundColor: '#E2E8F0',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  guidanceText: {
    color: '#1E3A8A',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 2,
  },
  zoneColorIndicator: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#F8FAFC',
  },
  zoneInfo: {
    flex: 1,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  zoneDescription: {
    fontSize: 13,
    color: '#1E3A8A',
    lineHeight: 18,
  },
  chatContainer: {
    marginTop: 12,
  },
  aiResponse: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  aiResponseText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#0F172A',
  },
  chatInputContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  chatInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    fontSize: 13,
    maxHeight: 100,
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#F8FAFC',
    fontSize: 16,
  },
});

