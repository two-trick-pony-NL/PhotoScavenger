import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Alert, Entypo, ScrollView, ActivityIndicator, forceUpdate, Text, View, FlatList, SafeAreaView, TouchableOpacity, Button, Image } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Camera } from 'expo-camera';
import { DataTable } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { shareAsync } from 'expo-sharing';
import Ionicons from '@expo/vector-icons/Ionicons';
import ConfettiCannon from 'react-native-confetti-cannon';
import { FontAwesome } from '@expo/vector-icons'; 
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import styles from './app/config/styles';
import colors from './app/config/colors';
import ScoreTable from './ScoreTable';



export default function App() {
  //Setting all the states the app can have. Here we store the score, whether we are loading the data from API's and the photo's we take
  const [Loading, setLoading] = useState(false);
  const [data, setData] = useState([{'none':'none'}]);
  const [assignment, setAssignment] = useState([]);
  const [numberrefresh, setNumberrefresh] = useState(-1);//initializing at -1 so that when we get the initial instruction we end up at 0
  const [score, setScore] = useState(0); //setting to 1 so on the initial fetch for an instruction we end up at 0 points
  const [hasCameraPermission, setHasCameraPermission] = useState();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState();
  const [photo, setPhoto] = useState();

  //Extracting some pictures from API response
  var emoji = assignment[Object.keys(assignment)[0]]; 
  const DetectorParameter = Object.keys(assignment)[0]

// Function to store data on the device 
const storeData = async (value) => {
  try {
    await AsyncStorage.setItem('score', value)
  } catch (e) {
    // saving error
  }
}
// Function to retrieve data on the device 

const getData = async () => {
  try {
    const value = await AsyncStorage.getItem('score')
    if(value !== null) {
      setScore(0);
      // value previously stored
    }
  } catch(e) {
    // error reading value
  }
}




function CountRefresh() {
  setNumberrefresh(numberrefresh + 1)
}

function NextLevel(){
  setNumberrefresh(0)
  console.log("Reset function ran");
  FreeCallAssignmentAPI();
  // setScore((score - 250-(numberrefresh*35)))
  setScore((score + 250)+ (data.OtherObjectsDetected.length * 100));
  setPhoto(undefined);
  
}

// Here starts the part where we take the picture
  let cameraRef = useRef();
  

  let CallAssignmentAPI = async () => {
    fetch('https://photoscavenger.vdotvo9a4e2a6.eu-central-1.cs.amazonlightsail.com/v2/newassignment/'+score)
    .then((response) => response.json())
    .then((json) => setAssignment(json))
    .catch((error) => console.error(error))
    CountRefresh();
  };
  let FreeCallAssignmentAPI = async () => {
    fetch('https://photoscavenger.vdotvo9a4e2a6.eu-central-1.cs.amazonlightsail.com/v2/newassignment/'+score)
    .then((response) => response.json())
    .then((json) => setAssignment(json))
    .catch((error) => console.error(error))
  };
// This use effect is used 1x on app load, to get the first asignment and fetch camera permissions if we don't have them. 
    useEffect(() => {
      CallAssignmentAPI();
      console.log(assignment);
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
      Alert.alert('How to play:',' 👋🏻 Hi! Welcome to Photo Scavenger! Playing is easy; Simply photograph the object to earn points.\nThe more objects you fit in a picture the more points you score. \n \n If you cannot find the object nearby, then use 10 points to get another target. Hit the 🔄  button to refresh the target.  \n\n What is your Highscore? 🥇 ',
      [
        { text: 'Let\'s play! 📸 ', onPress: () => console.log('user closed the how to play') },
      ],);
    };

    let CallDetectionAPI =  (image) => {
      var formdata = new FormData();
      formdata.append('file', {uri: image.uri, name: 'picture.jpg', type: 'image/jpg'});
      //console.log(formdata)
      fetch('https://photoscavenger.vdotvo9a4e2a6.eu-central-1.cs.amazonlightsail.com/v2/uploadfile/'+DetectorParameter, {
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

      let newPhoto = await cameraRef.current.takePictureAsync(options);
      setPhoto(newPhoto);
      setLoading(true);
      CallDetectionAPI(newPhoto);
      WasAssignmentFound(data);
       
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
              <DataTable.Cell>- {x}</DataTable.Cell>
            <DataTable.Cell numeric>
              <Text style={styles.tableGood}>
                + 100
              </Text>
            </DataTable.Cell>
          </DataTable.Row>
            );
        } catch (error) {
          //console.error(error);
        }
      };

      function WasAssignmentFound() {
      try {
          foundItem = data.OtherObjectsDetected.includes(DetectorParameter)
          console.log('Result of calculation');
          console.log(foundItem);
          console.log("All items detected:");
          console.log(data.OtherObjectsDetected);
          console.log("Searched for:");
          console.log(DetectorParameter);
          if (foundItem === true) {
            console.log('✅ Photofound is equal to true');
            return (
              <>
              <ConfettiCannon count={250} fallspeed={2000} origin={{x: -10, y: 0}} fadeOut={true} autoStartDelay={500}/>
              <ScrollView>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title style={styles.tableBold}></DataTable.Title>
                  <DataTable.Title>  </DataTable.Title>
                  <DataTable.Title numeric>Points</DataTable.Title>
                </DataTable.Header>

                <DataTable.Row>
                  <DataTable.Cell > 
                   <Text>
                   {emoji} {Object.keys(assignment)[0]} found 
                   </Text> 
                   
                   </DataTable.Cell>
                  
                  <DataTable.Cell numeric>
                  <Text style={styles.tableGood}>
                      + 250
                    </Text>
                  </DataTable.Cell>
                  
                </DataTable.Row>


                <DataTable.Row>
                  <DataTable.Cell>
                    <Text > All items in your picture: </Text>
                  </DataTable.Cell>
                </DataTable.Row>
                
                {GetObjectsDetected(data.OtherObjectsDetected)}
                
                
                <DataTable.Row>
                  <DataTable.Cell>{numberrefresh}x refreshed</DataTable.Cell>
                  
                  <DataTable.Cell numeric>
                    <Text style={styles.tableBad}>
                        - {numberrefresh*10}
                      </Text>
                  </DataTable.Cell>
                </DataTable.Row>
                
                
                <DataTable.Row>

                  <DataTable.Cell></DataTable.Cell>
                  <DataTable.Cell numeric></DataTable.Cell>
                </DataTable.Row>








                <DataTable.Row style={styles.tableBold}>
                  <DataTable.Cell>
                    <Text style={styles.tableBold}>
                    New Score :
                    </Text>
                    </DataTable.Cell>
                  <DataTable.Cell></DataTable.Cell>
                  <DataTable.Cell numeric>
                    <Text style={styles.tableBold}>
                       {(score + 250 + (data.OtherObjectsDetected.length * 100) - (numberrefresh * 10))}
                    </Text>
                    </DataTable.Cell>
                </DataTable.Row>
              </DataTable> 

              </ScrollView>
            <View style={styles.ButtonAreaScoreView}>
              <TouchableOpacity style={styles.SaveOrDiscard} onPress={savePhoto}>
                <FontAwesome  name="save"  size={24} color="black" />
              </TouchableOpacity>
  

              <TouchableOpacity style={styles.TakeNextPhotoButton} onPress={() => NextLevel()} >
                <Text>Next!</Text>
              </TouchableOpacity>
            </View>


            
            
            <ConfettiCannon count={250} fallspeed={3000} origin={{x: -10, y: -10}} fadeOut={true} autoStartDelay={500}/>
              </>
            )
          } else {
            console.log('⛔️ Photofound is not equal to true');
            return (
              <>
              <ScrollView>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title></DataTable.Title>
                  <DataTable.Title>  </DataTable.Title>
                  <DataTable.Title numeric></DataTable.Title>
                </DataTable.Header>

                <DataTable.Row>
                <DataTable.Cell > 
                   <Text style={styles.tableBold}>
                   ⛔️ {Object.keys(assignment)[0]} not found 
                   </Text> 
                   </DataTable.Cell>
                  <DataTable.Cell numeric>
                  <Text style={styles.tableBad}>
                      
                    </Text>
                  </DataTable.Cell>
                </DataTable.Row>
              

                <DataTable.Row style={styles.tableBold}>
                  <DataTable.Cell>
                    <Text style={styles.tableBold}>

                    </Text>
                    </DataTable.Cell>
                  
                  <DataTable.Cell numeric>
                    <Text style={styles.tableBold}>
                    
                    Current Score:     {score-(numberrefresh*10)}

                    </Text></DataTable.Cell>
                </DataTable.Row>
              </DataTable> 
              </ScrollView>
            <View style={styles.ButtonAreaScoreView}>
              <TouchableOpacity style={styles.SaveOrDiscard} onPress={savePhoto}>
                <FontAwesome  name="save"  size={24} color="black" />
              </TouchableOpacity>
  

              <TouchableOpacity style={styles.TakeAnotherPhotoButton} onPress={() => setPhoto(undefined)} >
                <Text>Retry</Text>
              </TouchableOpacity>

            </View>

              </>)
        }
        } catch (error) {
          //console.error(error);
        }
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
          
          <View style={styles.tableview}>
          <Text style={styles.ResultsHeading}>Summary</Text>
          <Text> Your assignment was to photograph a {Object.keys(assignment)[0]}</Text>

            {WasAssignmentFound(data)}
      
          </View>
          </>
          )}


          
        </SafeAreaView>
      );
    }
    // This is the main camera view
    return (
      <Camera style={styles.container} ref={cameraRef}>
        
          <Text style={styles.HighScore}> ⭐️ {score -(numberrefresh*10)}</Text>
          <Text style={styles.CallToAction}> Find a {Object.keys(assignment)[0]} </Text>
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