import colors from './colors';
export default{
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      },
      preview: {
        alignSelf: 'stretch',
        flex: 1,
        height: 250,
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
        bottom: 120,   
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
        bottom: 10,
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
      },
      EmojiAssignment: {
        fontSize: 120,
        bottom: 240,
        
      },
      CameraIcon: {
        fontSize: 30,
        justifyContent: 'center',
        alignItems: 'center' 
      },
      HighScore: {
        color: colors.white,
        position: 'absolute',
        top: 50,
        right: 20,
        fontSize: 25,
      },
      CallToAction: {
        color: colors.white,
        fontSize: 40,
        position: 'absolute',
        top: 120
      },
      Response: {
        backgroundColor: colors.grey,
        color: colors.black,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 40, 
        margin: 20,
        padding: 10,
        margin: 20,

      }, 
      ObjectsFoundLabel: {
        backgroundColor: colors.secondary,
        color: colors.black,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 40, 
        padding: 10,
        margin: 1,

      }, 
      ObjectsFoundContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignContent: 'center',
        margin: 20,

      },
      Results: {
      color: colors.white,
      fontSize: 40,
      position: 'absolute',
      top: 120
      },
      LoadingScreen: {
      backgroundColor: colors.primary
      },
      ScoreCalculation: {
        height: 500,
      },    
      SaveOrDiscard: {
        backgroundColor: colors.grey,
        color: colors.black,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10, 
        padding: 20,
        margin: 1,
        margin: 5,
        fontSize: 30,
        borderColor: colors.black,
        borderWidth: 2,
        flexDirection: "row",
        flex: 1
      }, 
      TakeAnotherPhotoButton: {
        backgroundColor: colors.primary,
        color: colors.black,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10, 
        padding: 20,
        margin: 5,
        fontSize: 30,
        borderColor: colors.black,
        borderWidth: 2,
        flexDirection: "row",
        flex: 2,
        fontWeight: "bold",
        
      }, 
      ButtonAreaScoreView: {
        
        flexDirection:"row",
        justifyContent: "space-around",
        width: 350,
        height: 75,
        margin: 5,
      }, 
      
      tableBold: {
        fontWeight: "bold",
      },
      tableGood: {
        fontWeight: "bold",
        color: "green",
      },
      tableBad: {
        fontWeight: "bold",
        color: "red",
      },
      ResultsHeading: {
        fontWeight: "bold",
        color: colors.primary,
        fontSize: 40,

        },
    }