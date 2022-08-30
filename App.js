import { StatusBar } from 'expo-status-bar';
import { Alert, Modal,forceUpdate, Pressable, ScrollView, ActivityIndicator, Text, View, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Camera } from 'expo-camera';
import { DataTable } from 'react-native-paper';
import ConfettiCannon from 'react-native-confetti-cannon';
import { FontAwesome } from '@expo/vector-icons'; 
import * as MediaLibrary from 'expo-media-library';
import styles from './app/config/styles';
import colors from './app/config/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProgressCircle from 'react-native-progress-circle'
import { FlatGrid } from 'react-native-super-grid';


export default function App() {
  //Setting all the states the app can have. Here we store the score, whether we are loading the data from API's and the photo's we take
  const [Loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [data, setData] = useState([{'none':'none'}]);
  const [assignment, setAssignment] = useState([]);
  const [PercentageObjectsSeen, setPercentageObjectsSeen] = useState([]);
  const [EmojiSeen, setEmojiSeen] = useState([]);
  const [numberrefresh, setNumberrefresh] = useState(-1);//initializing at -1 so that when we get the initial instruction we end up at 0
  const [score, setScore] = useState(0); //setting to 1 so on the initial fetch for an instruction we end up at 0 points
  const [hasCameraPermission, setHasCameraPermission] = useState();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState();
  const [photo, setPhoto] = useState();

  //Extracting some pictures from API response
  var emoji = assignment[Object.keys(assignment)[0]]; 
  const DetectorParameter = Object.keys(assignment)[0]

// Function to store data and list of objects seen on the device 


const GetPercentageObjectsSeen = async () => {
  let keys = []
  try {
    keys = await AsyncStorage.getAllKeys()
  } catch(e) {
    // read key error
  }
  console.log(keys)
  console.log(keys.length -1)
  setPercentageObjectsSeen(Math.round((((keys.length-1)/80)*100)))
  setEmojiSeen(keys)
  };


const saveScore = async() => {
  try{
    await AsyncStorage.setItem("score", JSON.stringify(score-(numberrefresh*10)));
    console.log("Saved score to device")
    console.log(score-(numberrefresh*10))
  } catch (err){
    alert(err);
  }
};
const SaveObjectSeen = async(ObjectSeen) => {
  try{
    await AsyncStorage.setItem(JSON.stringify(ObjectSeen), JSON.stringify(ObjectSeen));
    console.log("Saved Emoji to device")
    console.log("Added this emoji to the store")
    console.log(ObjectSeen)
    GetPercentageObjectsSeen()
  } catch (err){
    alert(err);
  }
};
// retrieving score from device memory
const retrieveSavedScore = async() => {
  try{
    let storedscore = await AsyncStorage.getItem("score");
    if (storedscore !== null) {
      setScore(JSON.parse(storedscore));
      console.log("retrieved score from storage")
      console.log(storedscore)
      
    }
  } catch (err){
    alert(err);
  }
};

const removeScore = async () => {
  try {
    await AsyncStorage.removeItem("score");
  } catch (err) {
    alert(err);
  } finally {
    setScore(0);
    console.log("Reset score for this user to 0")
  }
}

const createTwoButtonAlert = () =>
    Alert.alert(
      "Alert Title",
      "My Alert Msg",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "OK", onPress: () => console.log("OK Pressed") }
      ]
    );

function CountRefresh() {
  setNumberrefresh(numberrefresh + 1)
}

function NextLevel(){
  SaveObjectSeen(emoji)
  setScore((score + 250)+ (data.OtherObjectsDetected.length * 100));
  setNumberrefresh(0)
  console.log("Reset function ran");
  // setScore((score - 250-(numberrefresh*35)))
  setPhoto(undefined);
  FreeCallAssignmentAPI();
  
}

// Here starts the part where we take the picture
  let cameraRef = useRef();

  

  let CallAssignmentAPI = async () => {
    fetch('https://photoscavenger.vdotvo9a4e2a6.eu-central-1.cs.amazonlightsail.com/v2/newassignment/'+score)
    .then((response) => response.json())
    .then((json) => setAssignment(json))
    .catch((error) => console.error(error))
    CountRefresh();
    //saveScore();
  };
  let FreeCallAssignmentAPI = async () => {
    saveScore();
    fetch('https://photoscavenger.vdotvo9a4e2a6.eu-central-1.cs.amazonlightsail.com/v2/newassignment/'+score)
    .then((response) => response.json())
    .then((json) => setAssignment(json))
    .catch((error) => console.error(error))
  };
// This use effect is used 1x on app load, to get the first asignment and fetch camera permissions if we don't have them. 
    useEffect(() => {
      GetPercentageObjectsSeen()
      setNumberrefresh(0);
      retrieveSavedScore();
      CallAssignmentAPI();
      setModalVisible(!modalVisible);
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
      saveScore();
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
              <ConfettiCannon count={200} fallspeed={2000} origin={{x: -50, y: -50}} fadeOut={true} autoStartDelay={500}/>
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
              <Text style={styles.HelperText}>💡 You can help the AI to better detect objects if you make sure that the lighting is good, you're close enough to the object and that you hold the camera steady.</Text>
            
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

        <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                  Alert.alert("Modal has been closed.");
                  setModalVisible(!modalVisible);
                }}
              >
            
                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                  <ScrollView>

         
                    <Text style={styles.ProfileHeading}>Photo Scavenger</Text>
                    <Text style={styles.modalText}>Find, Photograph, Score!</Text>

                    <Text style={styles.ProfileSubHeading}>How to play</Text>
                    <Text style={styles.modalText}>Playing is easy; Simply photograph the object to earn points. The more objects you fit in a picture the more points you score. Try to photograph all 80 objects in the game to earn a 100% score.</Text>
                    <Text style={styles.modalText}>If you cannot find the object nearby, then use 10 points to get another target. Hit the refresh button to refresh the target.</Text>
                    
                    <Pressable
                      style={[styles.button, styles.TakeAnotherPhotoButton]}
                      onPress={() => setModalVisible(!modalVisible)}
                    >
                      <Text style={styles.textStyle}>Let's play </Text>
                    </Pressable> 

                    <Text style={styles.ProfileHeading}>Statistics</Text>
                    <Text style={styles.ProfileSubHeading}>Progress</Text>
                    <Text style={styles.modalText}>Find all unique objects to get to 100%</Text>
                    <View styles={styles.ProgressBar}>
                    <ProgressCircle 
                          style= {styles.ProgressBar}
                          percent={PercentageObjectsSeen}
                          radius={50}
                          borderWidth={8}
                          color={colors.primary}
                          shadowColor="#999"
                          bgColor="#fff"
                      >
                          <Text style={{ fontSize: 18 }}>{PercentageObjectsSeen}%</Text>
                          
                      </ProgressCircle>  

                      <Text style={styles.ProfileSubHeading}>Your score</Text>
                      <Text style={styles.modalText}>So far you have earned {score -(numberrefresh*10)} points in Photo Scavenger</Text>    

                      <Text style={styles.ProfileSubHeading}>Objects found so far</Text>
                      <Text style={styles.modalText}>These are the objects you have seen at least once in Photo Scavenger!</Text>                
                      <FlatGrid
                        itemDimension={50}
                        data={EmojiSeen}
                        renderItem={({ item }) => (<Text style={styles.EmojiGrid}> {item} </Text>)}
                      />
                    </View>
                  
                    <Text style={styles.ProfileSubHeading}>About</Text>
                    <Text style={styles.modalText}>Photo Scavenger is made with ♥️ by Peter van Doorn. The app uses no ads, has no tracking stores no data, and all your photos are deleted after processing. If you're interested in reading the source code of this app, check out my GitHub page: https://github.com/two-trick-pony-NL/PhotoScavenger </Text>

                    <Text style={styles.ProfileSubHeading}>Reset game</Text>
                    <Text style={styles.modalText}>Tapping the buttons below will set your score back to 0 and clear all the objects you have collected so far.  </Text>
                                  
                 
                    <TouchableOpacity style={styles.SaveOrDiscard}>
                        <FontAwesome  name="trash"  size={24} color="black" onPress={removeScore}/>
                      </TouchableOpacity>
                    </ScrollView>

                    
                  </View>

                 
                </View>
                
              </Modal>
        
          <Text style={styles.HighScore}> ⭐️ {score -(numberrefresh*10)}</Text>
          <Text style={styles.CallToAction}> Find a {Object.keys(assignment)[0]} </Text>
          <Text style={styles.EmojiAssignment}> {emoji} </Text>


        <View style={styles.NavigationBar}>  
              <TouchableOpacity
                  onPress={CallAssignmentAPI}
                  style={styles.NavigationButton}>
                  <FontAwesome name="refresh" size={24} color="black" />
                  
                </TouchableOpacity>
                

                <TouchableOpacity
                  onPress={takePic}
                  
                  style={styles.CameraButton}>
                 <FontAwesome name="camera" size={44} color="black" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setModalVisible(!modalVisible)}
                  style={styles.NavigationButton}>
                  <FontAwesome name="bars" size={32} color="black" />
                  
                </TouchableOpacity>

        
        </View>
        <StatusBar style="auto" />
      </Camera>
    );
    }