import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Alert, Entypo, ActivityIndicator, Text, View, FlatList, SafeAreaView, TouchableOpacity, Button, Image } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Camera } from 'expo-camera';
import { DataTable } from 'react-native-paper';
import { shareAsync } from 'expo-sharing';
import Ionicons from '@expo/vector-icons/Ionicons';
import ConfettiCannon from 'react-native-confetti-cannon';
import { FontAwesome } from '@expo/vector-icons'; 
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import styles from './app/config/styles';
import colors from './app/config/colors';



export default function App() {
  const [Loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [assignment, setAssignment] = useState([]);
  var emoji = assignment[Object.keys(assignment)[0]]; 
  const DetectorParameter = Object.keys(assignment)[0]

    // Here starts the part where we take the picture
  let cameraRef = useRef();
  const [hasCameraPermission, setHasCameraPermission] = useState();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState();
  const [photo, setPhoto] = useState();

  let CallAssignmentAPI = async () => {
    fetch('https://scangamebackend.herokuapp.com/newassignment')
    .then((response) => response.json())
    .then((json) => setAssignment(json))
    .catch((error) => console.error(error))
    console.log('Printing the new assignment')
    console.log(assignment);
  };
// This use effect is used 1x on app load, to get the first asignment and fetch camera permissions if we don't have them. 
    useEffect(() => {
      CallAssignmentAPI();
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

    let HowToPlay = () => {
      //function to make simple alert
      console.log('User tapped how to play button')
      Alert.alert('How to play:',' 👋🏻 Hi! Welcome to ScanGame! Playing is easy; Simply photograph the object to earn points.\nPhotos of incorrect objects will lead to a penalty. \n \n If you cannot find the object nearby, then use 50 points to get another target. Hit the 🔄  button to refresh the target. This will cost 50 Points \n\n What is your Highscore? 🥇 ',
      [
        { text: 'Let\'s play! 📸 ', onPress: () => console.log('user closed the how to play') },
      ],);
    };

    let CallDetectionAPI = async (image) => {
      var formdata = new FormData();
      formdata.append('file', {uri: image.uri, name: 'picture.jpg', type: 'image/jpg'});
      //console.log(formdata)
      fetch('https://scangamebackend.herokuapp.com/uploadfile/cow'+DetectorParameter, {
        method: 'POST',
        body: formdata
        })
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
      setData("")
      let newPhoto = await cameraRef.current.takePictureAsync(options);
      setPhoto(newPhoto);
      setLoading(true);
      CallDetectionAPI(newPhoto);   
    };

    if (photo) {
      

      let savePhoto = () => {
        MediaLibrary.saveToLibraryAsync(photo.uri).then(() => {
          setPhoto(undefined);
        });
      };

      //This function is a bit of a mess, but it loops over the array of objects that the AI model detected in an image
      //The reason we have to try/catch is because when the screen is loaded the 'data' object is not available yet, and thus the 
      // function fails. after a second the data is available and all is fine. Not quite sure how to clean this up
      let GetObjectsDetected = (data1) => {
        try {
          console.log('Printing the objects found in the picture')
          console.log(data1);
          return data1.map(x=>
            <DataTable.Row>
            <DataTable.Cell> 🌟 Bonus item  </DataTable.Cell>
            <DataTable.Cell> 
              {x} </DataTable.Cell>
            <DataTable.Cell numeric>
              <Text style={styles.tableGood}>
                + 120
              </Text>
            </DataTable.Cell>
          </DataTable.Row>
            );
        } catch (error) {
          //console.error(error);
        }
      };

      let CorrectAnswerGiven = () => {
        return data.Wasfound
      };




    // This is what is shown after taking a photos
      return (
        <SafeAreaView style={styles.container}>
        {Loading ? ( //Setting a spinner while waiting for the API call to return the results. Read as a IF statement. So if Loading is true, then do this else render template
        <View styles={styles.background}>       
          <ActivityIndicator
            //visibility of Overlay Loading Spinner
            visible={Loading}
            //Text with the Spinner
            textContent={'Loading...'}
            size='large'
            color= {colors.grey}
            //Text style of the Spinner Text
            //textStyle={styles.spinnerTextStyle}
          />
        <Text></Text>
        <Text>🔎 Looking for a {Object.keys(assignment)[0]} in your picture... </Text>
        </View>
        ) : ( //this bit we render if the app is not loading
        <>
          <Image style={styles.preview} source={{ uri: "data:image/jpg;base64," + photo.base64 }} />
          <ConfettiCannon count={200} origin={{x: -10, y: 0}} fadeOut={false} />
          <Text style={styles.ResultsHeading}>Your Score</Text>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title></DataTable.Title>
                  <DataTable.Title>  </DataTable.Title>
                  <DataTable.Title numeric>Points</DataTable.Title>
                </DataTable.Header>

                <DataTable.Row>
                  <DataTable.Cell> 🎯 Target</DataTable.Cell>
                  <DataTable.Cell>
                      
                        {Object.keys(assignment)[0]}           
                     
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                  <Text style={styles.tableGood}>
                      + 470
                    </Text>
                  </DataTable.Cell>
                </DataTable.Row>

                {GetObjectsDetected(data.OtherObjectsDetected)}
                
                <DataTable.Row>
                  <DataTable.Cell> ❗️ Penalty</DataTable.Cell>
                  <DataTable.Cell>1x refresh</DataTable.Cell>
                  <DataTable.Cell numeric>
                    <Text style={styles.tableBad}>
                        - 35
                      </Text>
                  </DataTable.Cell>
                </DataTable.Row>

                <DataTable.Row>
                  <DataTable.Cell>
                  
                    </DataTable.Cell>
                  <DataTable.Cell></DataTable.Cell>
                  <DataTable.Cell numeric></DataTable.Cell>

                </DataTable.Row>

                
                <DataTable.Row style={styles.tableBold}>
                  <DataTable.Cell>
                      😎 points previous round
                    </DataTable.Cell>
                 
                  <DataTable.Cell numeric>
                      200
                      </DataTable.Cell>
                </DataTable.Row>

       



                <DataTable.Row style={styles.tableBold}>
                  <DataTable.Cell>
                    <Text style={styles.tableBold}>
                      Total
                    </Text>
                    </DataTable.Cell>
                  <DataTable.Cell></DataTable.Cell>
                  <DataTable.Cell numeric>
                    <Text style={styles.tableBold}>
                      435
                    </Text></DataTable.Cell>
                </DataTable.Row>
              </DataTable>
  

            
            <View style={styles.ButtonAreaScoreView}>
              <TouchableOpacity style={styles.SaveOrDiscard} onPress={savePhoto}>
                <FontAwesome  name="save"  size={24} color="black" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.TakeAnotherPhotoButton} onPress={() => setPhoto(undefined)} >
                <Text>Take another Photo!</Text>
              </TouchableOpacity>
            </View>

          </>
          )}
        </SafeAreaView>
      );
    }
    // This is the main camera view
    return (
      <Camera style={styles.container} ref={cameraRef}>
        <Ionicons name="scan-outline" size={300} color="white" />
          <Text style={styles.HighScore}> ⭐️ Your score: 933</Text>
          <Text style={styles.CallToAction}> Take a picture of a {Object.keys(assignment)[0]} </Text>
          <Text style={styles.EmojiAssignment}> {emoji} </Text>
          


        <View style={styles.NavigationBar}>  
              <TouchableOpacity
                  onPress={CallAssignmentAPI}
                  style={styles.NavigationButton}>
                  <FontAwesome name="refresh" size={24} color="black" />
                  <Text>refresh</Text>
                </TouchableOpacity>
                

                <TouchableOpacity
                  onPress={takePic}
                  
                  style={styles.CameraButton}>
                 <FontAwesome name="camera" size={44} color="black" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={HowToPlay}
                  style={styles.NavigationButton}>
                  <FontAwesome name="lightbulb-o" size={32} color="black" />
                  <Text>rules</Text>
                </TouchableOpacity>
        </View>
        <StatusBar style="auto" />
      </Camera>
    );
    }