import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Alert, Entypo, ActivityIndicator, Text, View, FlatList, SafeAreaView, TouchableOpacity, Button, Image } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';

import { DataTable } from 'react-native-paper';

import styles from './app/config/styles';


export default function ScoreTable() {

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

    function WasAssignmentFound(props) {
        try {
          foundItem = props.data.OtherObjectsDetected.includes(DetectorParameter)
          console.log('Result of calculation');
          console.log(foundItem);
          console.log("Other items detected:");
          console.log(this.props.data.OtherObjectsDetected);
          console.log("Searched for:");
          console.log(DetectorParameter);
          if (foundItem === true) {
            console.log('✅ Photofound is equal to true');
            console.log("Incrementing points")
            //increaseScore(250)
            return ' ✅'
          } else {
            console.log('⛔️ Photofound is not equal to true');
            console.log("Decreasing score")
            //decreaseScore(100)
            return '⛔️'
        }
        } catch (error) {
          //console.error(error);
        }
      };
    
    return(
        <DataTable>
                <DataTable.Header>
                  <DataTable.Title></DataTable.Title>
                  <DataTable.Title>  </DataTable.Title>
                  <DataTable.Title numeric>Points</DataTable.Title>
                </DataTable.Header>

                <DataTable.Row>
                  <DataTable.Cell > 
                   <Text style={styles.tableBold}>
                      Target found
                   </Text> 
                   </DataTable.Cell>
                  <DataTable.Cell>
                      <Text style={styles.tableBold}>
                         {WasAssignmentFound()} 
                      </Text> 
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
    )
} 