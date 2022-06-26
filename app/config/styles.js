import colors from './colors';
export default{
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
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
        bottom: 20
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
        fontSize: 100,
        
      },
      HighScore: {
        color: colors.white,
        position: 'absolute',
        top: 50,
        left: 10,
        fontSize: 15,
      },
      UserScore: {
        color: colors.white,
        position: 'absolute',
        top: 75,
        left: 10,
        fontSize: 15,
      },
      TimeRemaining: {
        color: colors.white,
        position: 'absolute',
        top: 50,
        right: 10,
        fontSize: 15,
      },
      CallToAction: {
        color: colors.white,
        fontSize: 50,
        position: 'absolute',
        top: 120
      },
    }