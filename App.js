import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Button, Image } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { Camera } from 'expo-camera';
import { shareAsync } from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import styles from './app/config/styles';

export default function App() {
  let cameraRef = useRef();
  const [hasCameraPermission, setHasCameraPermission] = useState();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState();
  const [photo, setPhoto] = useState();

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
      setHasCameraPermission(cameraPermission.status === "granted");
      setHasMediaLibraryPermission(mediaLibraryPermission.status === "granted");
    })();
  }, []);
// IF no permission is given to access the camera this text is shown

  if (hasCameraPermission === undefined) {
    return <Text>Requesting permissions...</Text>
  } else if (!hasCameraPermission) {
    return <Text>Permission for camera not granted. Please change this in settings.</Text>
  }

  let takePic = async () => {
    let options = {
      quality: 1,
      base64: true,
      exif: false
    };

    let newPhoto = await cameraRef.current.takePictureAsync(options);
    setPhoto(newPhoto);
  };

  if (photo) {
    let sharePic = () => {
      shareAsync(photo.uri).then(() => {
        setPhoto(undefined);
      });
    };

    let savePhoto = () => {
      MediaLibrary.saveToLibraryAsync(photo.uri).then(() => {
        setPhoto(undefined);
      });
    };
// This is what is shown after taking a photos
    return (
      <SafeAreaView style={styles.container}>
        <Image style={styles.preview} source={{ uri: "data:image/jpg;base64," + photo.base64 }} />
        <Button title="Share" onPress={sharePic} />
        {hasMediaLibraryPermission ? <Button title="Save" onPress={savePhoto} /> : undefined}
        <Button title="Discard" onPress={() => setPhoto(undefined)} />
      </SafeAreaView>
    );
  }
// This is the main camera view
  return (
    <Camera style={styles.container} ref={cameraRef}>
        <Text style={styles.HighScore}> ⭐️ Highscore: 250</Text>
        <Text style={styles.UserScore}> 📸 Your score: 50</Text>
        <Text style={styles.TimeRemaining}>  ⏱Time remaining: 2:00</Text>
        <Text style={styles.CallToAction}> Photograph a</Text>
        <Text style={styles.EmojiAssignment}> 🚲 </Text>

      <View style={styles.NavigationBar}>  
            <TouchableOpacity

                style={styles.NavigationButton}>
                <Text>i</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={takePic}
                style={styles.CameraButton}>
                <Text>Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity

                style={styles.NavigationButton}>
                <Text>P</Text>
              </TouchableOpacity>
      </View>
      <StatusBar style="auto" />
    </Camera>
  );
}
