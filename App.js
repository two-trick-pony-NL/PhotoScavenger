import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Entypo, ActivityIndicator, Text, View, FlatList, SafeAreaView, TouchableOpacity, Button, Image } from 'react-native';
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
      fetch('https://scangamebackend.herokuapp.com/exampleresponse')
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
      console.log(data);      
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

      //This function is a bit of a mess, but it loops over the array of objects that the AI model detected in an image
      //The reason we have to try/catch is because when the screen is loaded the 'data' object is not available yet, and thus the 
      // function fails. after a second the data is available and all is fine. Not quite sure how to clean this up
      let GetObjectsDetected = (data) => {
        try {
          return data.map(x=>
            <View style={styles.ObjectsFoundLabel}>
              <Text>{x}</Text>
            </View>
            );
        } catch (error) {
          console.error(error);
        }
      };





    // This is what is shown after taking a photos
      return (
        <SafeAreaView style={styles.container}>
          <Image style={styles.preview} source={{ uri: "data:image/jpg;base64," + photo.base64 }} />
          <Text> Was the correct object found?</Text>
          <View style={styles.Response}>
          
          <Text> {data.Wasfound} </Text>
          </View>
          <Text> File location</Text>
          <View style={styles.Response}>
         
          <Text> {data.file_url} </Text>
          </View>
          <Text> Take a picture of a:</Text>
          <View style={styles.Response}>
          
          <Text> {data.Searchedfor} </Text>
          </View>
          <Text> Your picture contained these objects:</Text>
          <View style={styles.ObjectsFoundContainer}>
          {GetObjectsDetected(data.OtherObjectsDetected)}
          </View>



  
          
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