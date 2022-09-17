import { StatusBar } from 'expo-status-bar';
import { Alert, Modal,Linking, Pressable, ScrollView, ActivityIndicator, Text, View, SafeAreaView, TouchableOpacity, Image } from 'react-native';
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


const GetPercentageObjectsSeen = async () => {
  //This is an empty list "keys" where we get all the values from Asyncstorage
  let keys = []
  try {
    keys = await AsyncStorage.getAllKeys()
  } catch(e) {
    // read key error
  }
  // That list of keys above contains more than just emoji's and also has ugly quotation marks around each key
  //THerefor we remove the first and last character of each key. 
  var justemoji = []
  keys.forEach((item) => justemoji.push(item.slice(1, item.length-1)));
  for( var i = 0; i < justemoji.length; i++){ 
         // the key "score" is also part of "all keys", so this is a very ugly way to pop that one out the list too.                           
    if ( justemoji[i] === 'cor') { 
        justemoji.splice(i, 1); 
        i--; 
    }
} // finally, if the emoji is empty we remove it from the list as well, so the gridview ends up nice and pretty. 
  for( var i = 0; i < justemoji.length; i++){                                 
    if ( justemoji[i] === '') { 
        justemoji.splice(i, 1); 
        i--; 
    }
  }
  // We calculate the progress based on the keys list not emoji list. Because some assignments have no emoji but you do want to count them. 
  setPercentageObjectsSeen(Math.round((((keys.length)/80)*100)))
  //The list of emoji's is passed to the function that renders the grid with observed emojis in the settings view. 
  setEmojiSeen(justemoji)
  };


  let RenderGrid = () => {
    if (EmojiSeen == 0) {
      
      return <View>
          <Text style={styles.ProfileSubHeading}>🤳 How to play</Text>
          <Text style={styles.modalText}>Photograph objects to earn points. The more things you fit in a picture the more points you score.</Text>
          <Text style={styles.modalText}>If you cannot find the object then you can refresh <FontAwesome name="refresh" size={12} color="black" /> your assignment for a 50 point penalty.</Text> 
          <Text style={styles.modalText}>Good lighting, getting up close and sharp pictures photos greatly improve your chances of detecting the correct object.</Text>
          <Pressable
                      style={[styles.button, styles.TakeAnotherPhotoButton]}
                      onPress={() => setModalVisible(!modalVisible)}
                    >
                      <Text style={styles.textStyle}> Play </Text>
                    </Pressable> 
      </View>
    } else { 
      
      return  <View>
        <View style={{alignItems: 'center', padding: 20}}>
                  <ProgressCircle 
                          style= {styles.ProgressBar}
                          percent={PercentageObjectsSeen}
                          radius={75}
                          borderWidth={8}
                          color={colors.primary}
                          shadowColor={colors.grey}
                          bgColor={colors.white}
                      >
                          <Text style={{ fontSize: 30,fontWeight: "bold" }}>{PercentageObjectsSeen}%</Text>
                          <Text style={{ fontSize: 15,fontWeight: "bold" }}>found</Text>
                          <Text style={{ fontSize: 15,fontWeight: "bold" }}>{score -(numberrefresh*50)} points</Text>
                      </ProgressCircle>  
                      </View>
                    <Text style={styles.ProfileSubHeading}> 🏆 Your progress</Text>
                    <Text>
                      <Text style={styles.modalText}>You have earned</Text>
                      <Text style={{fontWeight: "bold"}}> {score -(numberrefresh*50)}</Text>
                      <Text style={styles.modalText}> points so far and found</Text>
                      <Text style={{fontWeight: "bold"}}> {PercentageObjectsSeen}%</Text>
                    <Text style={styles.modalText}> of all objects in the game.</Text> 
                    </Text>  
          <Text style={styles.ProfileSubHeading}>🤳 Did you know</Text>
          <Text style={styles.modalText}>That you get 100 extra points for each additional object in a picture</Text>
          
        <Text style={styles.ProfileSubHeading}>👀 Objects found so far</Text>
        <Text style={styles.modalText}>These are the objects you have seen at least once in Photo Scavenger!</Text> 
        <FlatGrid
          itemDimension={50}
          data={EmojiSeen}
          renderItem={({ item }) => (<Text style={styles.EmojiGrid}> {item} </Text>)}
      />
      <Pressable
                      style={[styles.button, styles.TakeAnotherPhotoButton]}
                      onPress={() => setModalVisible(!modalVisible)}
                    >
                      <Text style={styles.textStyle}>Find {80-EmojiSeen.length} more objects</Text>
                    </Pressable> 
    </View> 
    }
  };


const saveScore = async() => {
  try{
    await AsyncStorage.setItem("score", JSON.stringify(score-(numberrefresh*50)));
    console.log("Saved score to device")
    console.log(score-(numberrefresh*50))
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
      return <View style={{alignItems: 'center',flex: 1,justifyContent: 'center'}}>
      <Image source={require('./app/assets/AppIcon.png')} style={styles.logo} />
    
      <Text style={styles.ProfileHeading}>Oops</Text>
      <Text style={styles.ProfileSubHeading}>⚠️ Permission for camera not granted ⚠️ </Text>
      <Text>Please grant permission  in the settings</Text></View>
    }


    let CallDetectionAPI =  (image) => {
      var formdata = new FormData();
      formdata.append('file', {uri: image.uri, name: 'picture.jpg', type: 'image/jpg'});
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
      let GetObjectsDetected = (items_to_render) => {
        try {
          console.log('Printing the objects found in the picture')
          console.log(items_to_render);
          return items_to_render.map(x=>
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
          if (foundItem === true) {
            console.log('✅ Photofound is equal to true');
            return (
              <>
              
              <ConfettiCannon count={200} fallspeed={2000} origin={{x: -50, y: -50}} fadeOut={true} autoStartDelay={500}/>
              <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
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
                        - {numberrefresh*50}
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
                       {(score + 250 + (data.OtherObjectsDetected.length * 100) - (numberrefresh * 50))}
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
              </>
            )
          } else {
            console.log('⛔️ Photofound is not equal to true');
            return (
              <>
              <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
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
       
                </DataTable.Row>              

                <DataTable.Row style={styles.tableBold}>
                  <DataTable.Cell>
                    <Text style={styles.tableBold}>

                    </Text>
                    </DataTable.Cell>
                  
                  <DataTable.Cell numeric>
                    <Text style={styles.tableBold}>
                    
                    Current Score:     {score-(numberrefresh*50)}

                    </Text></DataTable.Cell>
                </DataTable.Row>
              </DataTable> 

              
              </ScrollView>
              
            
            
              <View style={styles.ButtonAreaScoreView}>
            <Text style={styles.HelperText} >💡 If you struggle detecting objects. Try to take another picture with good lighting conditions, from close up to the object and holding the camera steady.</Text>
            </View>
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
          <Text style={styles.ResultsHeading}>Results</Text>
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
                  <TouchableOpacity name="close" onPress={() => setModalVisible(!modalVisible)} style={{
                    position: 'absolute',
                    right: -10,
                    top: -10,
                    width: 75,
                    height: 75
                    
                  }}>
                  <FontAwesome name="close" size={24} color="black"style={{
                    position: 'absolute',
                    right: 25,
                    top: 20
                  }}/>
                  </TouchableOpacity>
                  
                  <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
                  <View style={{alignItems: 'center'}}>
                    <Image source={require('./app/assets/AppIcon.png')} style={styles.logo} />
                  </View>
                    <Text style={styles.ProfileHeading}>Photo Scavenger</Text>
                    <Text style={styles.modalText}>Find, Photograph, Score!</Text>
                      {RenderGrid()}                             
                    <Text style={{alignItems: 'center', padding: 20}}>
        
                    <Text style={styles.modalTextMuted}>This app is made with by Peter van Doorn. The app is very friendly towards your privacy. There are no ads, there is no tracking and all your photos are deleted directly after processing. The app is open source too, so if you're interested in seeing how the app was built then check out my</Text>
                    <Text onPress={() => Linking.openURL('https://github.com/two-trick-pony-NL/PhotoScavenger')}> GitHub</Text>
                    <Text style={styles.modalTextMuted}> page.</Text>
                    </Text>
                    
                    </ScrollView>

                    
                  </View>

                 
                </View>
                
              </Modal>
        
          
          <Text style={styles.CallToAction}> Find a {Object.keys(assignment)[0]} </Text>
          <Text style={styles.EmojiAssignment}> {emoji} </Text>
          <Text style={styles.HighScore}> {score -(numberrefresh*50)} </Text>
          <View style={styles.ProgressScore}>
                  <ProgressCircle 
                          style= {styles.ProgressBar}
                          percent={PercentageObjectsSeen}
                          radius={30}
                          borderWidth={4}
                          color={colors.primary}
                          shadowColor={colors.grey}
                          bgColor={colors.white}
                      > 
                          <Text style={{ fontSize: 15, color:colors.black, fontWeight: "bold"}}>{PercentageObjectsSeen}%</Text>
                          <Text style={{ fontSize: 8, color:colors.black, fontWeight: "bold"}}>found</Text>
              
          </ProgressCircle>  
          </View>


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