import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Button, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions } from 'expo-camera';

// API endpoint - adjust this to match your setup
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000' // For iOS simulator
  : 'http://YOUR_COMPUTER_IP:3000'; // For physical device - replace with your computer's IP

export default function HomeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [lastCaptureTime, setLastCaptureTime] = useState(0);
  const cameraRef = useRef<CameraView>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (showCamera && !permission?.granted) {
      requestPermission();
    }
  }, [showCamera, permission, requestPermission]);

  // Start/stop periodic detection when camera is shown/hidden
  useEffect(() => {
    if (showCamera && permission?.granted) {
      // Sample frames every 800ms for detection
      detectionIntervalRef.current = setInterval(() => {
        checkForNotebook();
      }, 800);
    } else {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [showCamera, permission?.granted]);

  const checkForNotebook = async () => {
    if (!cameraRef.current || isProcessing || isDetecting) return;
    
    setIsDetecting(true);
    try {
      // Take a low-res preview frame for detection (fast, non-blocking)
      const preview = await cameraRef.current.takePictureAsync({
        quality: 0.2, // Very low quality for speed
        base64: true,
        skipProcessing: true,
      });

      if (!preview.base64) return;

      // Send to API for detection (async, doesn't block camera)
      const isNotebook = await detectNotebookPage(preview.base64);
      
      if (isNotebook) {
        // Prevent rapid-fire captures (wait at least 2 seconds between captures)
        const now = Date.now();
        if (now - lastCaptureTime > 2000) {
          await handleAutoCapture();
          setLastCaptureTime(now);
        }
      }
    } catch (error) {
      // Silently fail - don't spam errors in console
      console.debug('Detection check failed:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  const detectNotebookPage = async (base64Image: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/detect-notebook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image }),
      });
      
      if (!response.ok) {
        return false;
      }
      
      const result = await response.json();
      // API should return { isNotebook: true/false, confidence: 0.0-1.0 }
      return result.isNotebook && result.confidence > 0.7;
    } catch (error) {
      console.debug('Detection API error:', error);
      return false;
    }
  };

  const handleAutoCapture = async () => {
    if (!cameraRef.current || isProcessing) return;
    
    setIsProcessing(true);
    try {
      // Take high-quality photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
      });
      
      console.log('Auto-captured notebook page:', photo.uri);
      // TODO: Process the captured photo (save, upload, etc.)
      
      // Optional: Show brief feedback
      // Alert.alert('Page Captured!', 'Notebook page detected and captured.');
    } catch (error) {
      console.error('Error capturing photo:', error);
      Alert.alert('Error', 'Failed to capture photo');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualPhoto = async () => {
    await handleAutoCapture();
  };

  if (showCamera) {
    if (!permission) {
      return (
        <View style={styles.container}>
          <Text>Requesting camera permission...</Text>
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Camera permission required</Text>
          <Button title="Grant Permission" onPress={requestPermission} />
          <Button title="Back" onPress={() => setShowCamera(false)} />
        </View>
      );
    }

    return (
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
        />
        {isDetecting && (
          <View style={styles.detectionIndicator}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.detectionText}>Detecting...</Text>
          </View>
        )}
        <View style={styles.cameraControls}>
          <TouchableOpacity
            style={[styles.captureButton, isProcessing && styles.captureButtonDisabled]}
            onPress={handleManualPhoto}
            disabled={isProcessing}
          />
          <Button title="Close" onPress={() => setShowCamera(false)} />
        </View>
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Lox</Text>
      <Text style={styles.subtitle}>Rocketbook replacement</Text>
      <Button title="Open Camera" onPress={() => setShowCamera(true)} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
  button: {
    marginTop: 20,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 20,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: '#000',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  detectionIndicator: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
  },
  detectionText: {
    color: '#fff',
    fontSize: 14,
  },
});
