import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Button, Image } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { Camera } from 'expo-camera';
import { shareAsync } from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import colors from './app/config/colors';

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

    return (
      <SafeAreaView style={styles.container}>
        <Image style={styles.preview} source={{ uri: "data:image/jpg;base64," + photo.base64 }} />
        <Button title="Share" onPress={sharePic} />
        {hasMediaLibraryPermission ? <Button title="Save" onPress={savePhoto} /> : undefined}
        <Button title="Discard" onPress={() => setPhoto(undefined)} />
      </SafeAreaView>
    );
  }

  return (
    <Camera style={styles.container} ref={cameraRef}>
      <View style={styles.buttonContainer}>
      </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    backgroundColor: '#fff',
    alignSelf: 'flex-end'
  },
  preview: {
    alignSelf: 'stretch',
    flex: 1
  },
  background: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 50 
  },
  loginButton: {
      width: '50%',
      height: 70,
      backgroundColor: colors.secondary,
      alignItems: 'center',
      justifyContent: 'center'
  },
  NavigationBar: { //This is the bar that the buttons reside in
    width: '100%',
    height: 100,
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'space-evenly',
    position: 'absolute',
    bottom: 10,

    
  }, 
  CameraButton: { //This is the red button
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    backgroundColor: colors.primary,
    borderColor: colors.black,
    borderWidth: 2,
    marginBottom: 160,
  },
  NavigationButton: { //These are the two buttons on the side
    width: 75,
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    backgroundColor: colors.grey,
    borderColor: colors.black,
    borderWidth: 2,
    marginBottom: 120,
    
  },
});