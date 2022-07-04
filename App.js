import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Entypo, ActivityIndicator, Text, View, SafeAreaView, TouchableOpacity, Button, Image } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Camera } from 'expo-camera';
import { shareAsync } from 'expo-sharing';
import Ionicons from '@expo/vector-icons/Ionicons';
import { FontAwesome } from '@expo/vector-icons'; 
import { MaterialCommunityIcons } from '@expo/vector-icons';

import * as MediaLibrary from 'expo-media-library';
import styles from './app/config/styles';


export default function App() {
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  console.log(data);

    // Here starts the part where we take the picture
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

    let CallAPI = async () => {
      fetch('https://62bacc4b573ca8f8328ba64b.mockapi.io/detector')
          .then((response) => response.json())
          .then((json) => setData(json))
          .catch((error) => console.error(error))
          .finally(() => setLoading(false));
    };

    let takePic = async () => {
      let options = {
        quality: 1,
        base64: true,
        exif: false,
      };
      let newPhoto = await cameraRef.current.takePictureAsync(options);
      setPhoto(newPhoto);
      CallAPI();
      await console.log(data.OtherObjectsDetected);
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
          <Text> {data.Wasfound}  and more</Text>
          <Button title="Share" onPress={sharePic} />
          {hasMediaLibraryPermission ? <Button title="Save" onPress={savePhoto} /> : undefined}
          <Button title="Discard" onPress={() => setPhoto(undefined)} />
        </SafeAreaView>
      );
    }
    // This is the main camera view
    return (
      <Camera style={styles.container} ref={cameraRef}>
        <Ionicons name="scan-outline" size={300} color="white" />
          <Text style={styles.HighScore}> ⭐️ Level: 9</Text>
          <Text style={styles.CallToAction}> Take a picture of a</Text>
          <Text style={styles.EmojiAssignment}> 🪴 </Text>
          


        <View style={styles.NavigationBar}>  
              <TouchableOpacity
                  onPress={CallAPI}
                  style={styles.NavigationButton}>
                  <FontAwesome name="life-buoy" size={24} color="black" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={takePic}
                  
                  style={styles.CameraButton}>
                 <FontAwesome name="camera" size={44} color="black" />
                </TouchableOpacity>

                <TouchableOpacity

                  style={styles.NavigationButton}>
                  <FontAwesome name="user-circle-o" size={24} color="black" />
                </TouchableOpacity>
        </View>
        <StatusBar style="auto" />
      </Camera>
    );
    }