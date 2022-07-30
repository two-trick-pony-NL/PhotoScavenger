![icon](https://user-images.githubusercontent.com/71013416/179624009-d72ba019-3639-438d-8857-dbc061f675a3.png)


# Photo Scavenger
This is the repo for the React Native apps that
support my Photo Scavenger app. From react it should be possible to compile both iOS and Android apps. 

Here is the project page: https://photoscavenger.petervandoorn.com

Here is a in-game clip of the basic idea: <br>

![ezgif com-gif-maker](https://user-images.githubusercontent.com/71013416/178448499-3f547173-43ab-41b2-967a-a1f9ae8dd9a0.gif)




# How to run: 
If you use expo check my profile here
Use Expo, I published the app here: https://expo.dev/@petervandoorn/ScanGameApps?serviceType=classic&distribution=expo-go


# What does it do:
- When you open the app, you're given the assignment to photograph an object (e.g: 'a person')
- You go running through your house until you find someone and take a photo of this person
- If the photo does contain a person ==> You progress to the next level and get a new assignment (e.g. photograph a plant)
- If the photo does not contain a person you get a penalty
- The levels get increasingly harder as it's much harder to photograph a Horse or Aeroplane than a potted plant. ]
- I'm considering adding functionalty to have assignments where 2 objects must be present to progress (e.g. take a photo of a plant and a person).

# How does it work: 
The app are built using react-native and Expo. Images are taken with the Expo-Camera module. From there they are sent to the backend as form-data in a request. 
The response from the server is processed and stored as a state object from where we can render the objects detected in the UI.

# Wishlist: 
- I'm currently struggling to get the basic request/reponse working with the backend
- after that I intend to add game logic ==> keeping track of score and level and perhaps setting a timelimit, or calculating score on how fast you're able to take photos
- If that succeeds I want to do a leaderboard + userprofile but that adds a lot of complexity whereas the AI model now is 1 fairly simple endpoint. 

# Backend repo: 
- This app is supported by a FastAPI backend written in Python. It takes post requests with images and uses Machine Learning to detect the objects in the photo. Check the code here: https://github.com/two-trick-pony-NL/PhotoScavengerBackend 
