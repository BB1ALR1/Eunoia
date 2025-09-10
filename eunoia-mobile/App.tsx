import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { WebView } from 'react-native-webview';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Your deployed website URL - update this when you deploy to Vercel
  const websiteUrl = 'https://eunoia-e86srktbw-eunoia-ai.vercel.app'; // Your actual Vercel URL
  
  // For local testing, you can use your local IP
  // const websiteUrl = 'http://192.168.68.66:5000';
  
  // Demo URL for testing (works without backend)
  // const websiteUrl = 'https://eunoia-demo.vercel.app';

  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error: ', nativeEvent);
    setError(true);
    setLoading(false);
    Alert.alert(
      'Connection Error',
      'Unable to load Eunoia. Please check your internet connection and try again.',
      [{ text: 'Retry', onPress: () => setError(false) }]
    );
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      )}
      
      <WebView
        source={{ uri: websiteUrl }}
        style={styles.webview}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="compatibility"
        thirdPartyCookiesEnabled={true}
        allowsBackForwardNavigationGestures={true}
        onMessage={(event) => {
          // Handle messages from the web app if needed
          console.log('Message from web app:', event.nativeEvent.data);
        }}
      />
      
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    zIndex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
});
