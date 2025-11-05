<img src="https://user-images.githubusercontent.com/71013416/183674037-eca7cc9b-4a19-494c-a449-af638fdd869c.png" width="250">


# Photo Scavenger
This is the repo for the React Native app that
support my Photo Scavenger app. From react it should be possible to compile both iOS and Android apps. 

Here is the project page: https://photoscavenger.petervandoorn.com

Here is a in-game clip of the basic idea: <br>

<img src="https://raw.githubusercontent.com/two-trick-pony-NL/PhotoScavenger/refs/heads/master/docs/assets/screenshot/1.png" width="250">

<img src="https://raw.githubusercontent.com/two-trick-pony-NL/PhotoScavenger/refs/heads/master/docs/assets/screenshot/sofa.png" width="250">



# How to run: 

##### From your phone
Download from iOS appstore
```
https://apps.apple.com/nl/app/photo-scavenger/id1637234234?l=en
```

# What does it do:
- When you open the app, you're given the assignment to photograph an object (e.g: 'a person')
- You go running through your house until you find someone and take a photo of this person
- If the photo does contain a person ==> You progress to the next level and get a new assignment (e.g. photograph a plant)
- If the photo does not contain a person you get a penalty
- The levels get increasingly harder as it's much harder to photograph a Horse or Aeroplane than a potted plant. ]
- I'm considering adding functionalty to have assignments where 2 objects must be present to progress (e.g. take a photo of a plant and a person).

# Backend repo: 
- This app is supported by a FastAPI backend written in Python. It takes post requests with images and uses Machine Learning to detect the objects in the photo. Check the code here: https://github.com/two-trick-pony-NL/PhotoScavengerBackend 
