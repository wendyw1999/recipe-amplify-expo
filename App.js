import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from "@react-navigation/native-stack";


import recipe from "./recipe.json"
import NetInfo from "@react-native-community/netinfo";

import Amplify from '@aws-amplify/core';
import config from './src/aws-exports';
Amplify.configure(config);

import API, { graphqlOperation } from '@aws-amplify/api';
import * as mutations from './src/graphql/mutations';
import * as queries from './src/graphql/queries';
import AWSAppSyncClient, { AUTH_TYPE } from 'aws-appsync';
import gql from 'graphql-tag';
import { listItems } from './src/graphql/queries';

import React from "react";
import {FlatList,Image,ImageBackground,ActivityIndicator,Alert,SafeAreaView,ScrollView,Button,
  TouchableOpacity,StyleSheet,View,Text,StatusBar} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useState,useEffect } from 'react';


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const SettingsStack = createNativeStackNavigator();

function Home({navigation}) {
  return (
    <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Feed') {
          iconName = focused
            ? 'home'
            : 'home-outline';
        } else if (route.name === 'Saved') {
          iconName = focused ? 'bookmark' : 'bookmark-outline';
        }

        // You can return any component that you like here!
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: 'tomato',
      tabBarInactiveTintColor: 'gray',
    })}
    >
      <Tab.Screen name="Feed" component={Feed} />
      <Tab.Screen name="Saved" component={Saved} />

    </Tab.Navigator>
  );
};

function DetailsScreen({route,navigation}) {

const {recipe} = route.params;
  return (
    <View>
       <ScrollView>
        <Image 
        source={{uri:recipe.image}} 
        defaultSource={require("./default_food_img.jpg")} 
        resizeMode="cover" style={styles.image}>
      
      </Image>
      
      
      <Text style={styles.recipeTitle}>{recipe.name}</Text>
      <View className="tags" style={styles.tagList}>
        {recipe.tag.map(
          (item,index)=>{
            return (<TouchableOpacity style={styles.tag}>
              <Text style={styles.recipeTagText}>{item}</Text>
            </TouchableOpacity>)
          }
        
        )}
      </View>
      <Text style={styles.recipeDescription}>
       {recipe.description}
      </Text>
      <Text style={styles.recipeSubtitle}>
        Ingredients
      </Text>
      <View className="ingredients" >
        {recipe.ingredient.map(
          (item,index)=>{
            return (<View>
              <Text style={styles.recipeIngredient}>{item.name} {item.preparation}
              <Text style={styles.recipeUnit}> {item.amount} {item.unit} </Text>
</Text>
              </View>)
          }
        )}
      </View>
      <Text style={styles.recipeSubtitle}>
        Steps
      </Text>
      <View className="steps" >
        {recipe.step.map(
          (item,index)=>{
            return (<View>
              <Text style={styles.recipeStep}>
                <Text style={styles.recipeStepIndex}>{index+1}. </Text>{item.description} 
              </Text></View>)
          }
        
        )}
      </View>
      
      
      </ScrollView>

    </View>
  )
};



function Feed({navigation}) {


  return (
    <HomeFlatlist nav={navigation}/>
  )
};
function Saved({navigation}) {


  return (
    <SavedFlatlist nav={navigation}/>
  )
};

async function removeObject(key) {
  try {
    await AsyncStorage.removeItem(key)
  } catch(e) {
    // remove error
  }

  console.log('removed: ' + key)
}
async function getMyObject(key) {
  try {
    
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? jsonValue : false
  } catch(e) {
    // read error
  }

  console.log('Retrieved: '+key)

}

async function setObjectValue(key,value) {
  try {
    const jsonValue = JSON.stringify(value)
    await AsyncStorage.setItem(key, jsonValue)
  } catch(e) {
    // save error
  }

  console.log('Stored.')
}

const client = new AWSAppSyncClient({
  url: config.aws_appsync_graphqlEndpoint,
  region: config.aws_appsync_region,
  auth: {
    type: AUTH_TYPE.API_KEY, // or type: awsconfig.aws_appsync_authenticationType,
    apiKey: config.aws_appsync_apiKey,
  },
  disableOffline:true,
});

class HomeFlatlist extends React.Component {

  constructor(props) {
     super(props)
     this.state = {
       loadingDatastore: false,
       loadingAsyncStorage:false,
       isRefreshing:false,
       datastore: [],
       saved:[],
       savedKeys:[],
       };
     };
     onRefresh = async() => {
       if (this.state.loadingDatastore||this.state.loadingAsyncStorage) {
Alert.alert("Try Again Later")

       } else {
       this.setState({isRefreshing:true})
       await this.fetchAsyncStore();
       await this.fetchDatastore();
       this.setState({isRefreshing:false});
       }

     };

     componentDidMount() {
      this.fetchAsyncStore().then(this.fetchDatastore());
  }
     
  
     addRecipes = async () => {
       this.setState({loadingDatastore:true});
       for (const [index,value] of recipe.entries()) {
         try
       {const newItem = await API.graphql({ query: mutations.createItem, variables: {input: value}});
       }
       catch (e) {console.log(e)}
       }
       this.setState({loadingDatastore:false});
     };
     

     fetchAsyncStore = async() => {
      try {
        this.setState({loadingAsyncStorage:true});

        const keys = await AsyncStorage.getAllKeys();
        const result = await AsyncStorage.multiGet(keys);
        let currAsyncStore = result.map(req => {
          var key = req[0];
          var value = JSON.parse(req[1]);
          return (value)
          

        });
        this.setState({savedKeys:keys})
        this.setState({saved:currAsyncStore})
        this.setState({loadingAsyncStorage:false})
        

    
      } catch (error) {
        console.error(error)
      }
    };


 fetchDatastore = async () => { 
  try {
    this.setState({loadingDatastore:true});

  client.query({
    query: gql(listItems)
  }).then(({ data: { listItems } }) => {
    this.setState({datastore:
      listItems.items.map(
        item => {
          item.favorited = this.state.savedKeys.includes(item.id);
        return item;}
      )
    });
  });
  this.setState({loadingDatastore:false});  

} catch (e) {
  console.log(e);
} 


};

selectItem = async(item) => {


  item.favorited = !item.favorited;
  if (!item.favorited) {
    await removeObject(item.id);
  } else {
    await setObjectValue(item.id,item);
  }
  const index = this.state.datastore.findIndex(
   i => item.id === i.id
  );
  
  this.state.datastore[index] = item;
  
  this.setState({
   datastore: this.state.datastore,
  });
  };


renderItem = (item) => 
    <View style={styles.card}>
      <TouchableOpacity onPress={
        ()=>this.props.nav.navigate("Details",{
          recipe:item
        })
      }>
      <View style={{flexDirection:"row"}}>
        <View  style={styles.container}>
        <ImageBackground 
        source={{uri:item.image}} resizeMode="cover" style={styles.imageBackground}>
      
      <View style={styles.gradient}>
      <TouchableOpacity style={styles.heart} onPress={()=>this.selectItem(item)}> 
        <Ionicons name={item.favorited?"heart":"heart-outline"} size={20} 
        color={item.favorited?"tomato":"#F1E5E0"}></Ionicons>
      </TouchableOpacity>
      <Text style={styles.text}>{item.name}</Text>

      </View>

     
     
    </ImageBackground>
        </View>

      </View>
      </TouchableOpacity>
    </View>

     
       
  
       render() {
       
       return (
       
<FlatList 
onRefresh={()=>this.onRefresh()}
refreshing={this.state.isRefreshing}
data={this.state.datastore} renderItem={({item}) => this.renderItem(item)} />


      
      )
       }
       
 }


 class SavedFlatlist extends React.Component {



  constructor(props) {
    super(props)
    this.state = {
      isRefreshing:false,
      loadingAsyncStorage:false,
      datastore: [],
      saved:[],
      savedKeys:[],
      };
    };
    onRefresh = async() => {
      this.setState({isRefreshing:true})
       await this.fetchAsyncStore();
       this.setState({isRefreshing:false});

    }
    
    
    componentDidMount () {
      this.fetchAsyncStore();
    };

    fetchAsyncStore = async() => {
      try {
        this.setState({loadingAsyncStorage:true});

        const keys = await AsyncStorage.getAllKeys();
        const result = await AsyncStorage.multiGet(keys);
        let currAsyncStore = result.map(req => {
          var key = req[0];
          var value = JSON.parse(req[1]);
          return (value)
        });
        this.setState({savedKeys:keys})
        this.setState({saved:currAsyncStore})
        this.setState({loadingAsyncStorage:false})


      } catch (error) {
        console.error(error)
      }
    };;

    removeItem = async(item) => {


      this.setState({loadingAsyncStorage:true});
      try {
        const removed = await removeObject(item.id);
      } catch (e) {
        console.log(e)
      }
      const index = this.state.saved.findIndex(
        i => item.id === i.id
       );
       const removed = this.state.saved.splice(index,1);
       this.setState({saved:this.state.saved});
      this.setState({loadingAsyncStorage:false});
      Alert.alert("Removed");
    }
    
    renderItem = (item) => 
    <View style={styles.card}>
      <TouchableOpacity onPress={
        ()=>this.props.nav.navigate("Details",{
          recipe:item
        })
      }>
      <View style={{flexDirection:"row"}}>
        <View  style={styles.container}>
        <ImageBackground 
        source={{uri:item.image}} resizeMode="cover" style={styles.imageBackground}>
      
      <View style={styles.gradient}>
      <TouchableOpacity style={styles.heart} onPress={()=>this.removeItem(item)}> 
        <Ionicons name="trash-outline" size={20} 
        color="white"></Ionicons>
      </TouchableOpacity>
      <Text style={styles.text}>{item.name}</Text>

      </View>

     
     
    </ImageBackground>
        </View>

      </View>
      </TouchableOpacity>
    </View>
    render () {


      return (
        <FlatList
        onRefresh={()=>this.onRefresh()}
        refreshing = {this.state.isRefreshing}
        data={this.state.saved}
        keyExtractor={item=>item.id}
        renderItem={({item}) => this.renderItem(item)}
        ></FlatList>
      )
    }
 }


 
function App() {

  const [isOffline, setOfflineStatus] = useState(false);
  
  useEffect(() => {
    const removeNetInfoSubscription = NetInfo.addEventListener((state) => {
      const offline = !(state.isConnected && state.isInternetReachable);
      setOfflineStatus(offline);
    })
    return () => {
      removeNetInfoSubscription();
    }
  },[]);

  if (isOffline) {

    return (<NavigationContainer>
      <Stack.Navigator>

        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>)
    
  }
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const themeColorBlack =  "#111127";
const themeColorRed = "#EB594C";
const themeColorWhite = "#F1E5E0";
const themeColorGrey = "#A59495";
const styles = StyleSheet.create({
  card: {
    marginBottom:10,
  },
 container: {
   flex: 1,
 },
 imageBackground: {
   flex: 1,
   justifyContent: "flex-end",
   alignContent:"flex-end",
   width:"100%",
   height:120,
 },
 image: {
   width:"100%",
   height:180,
 },
 heart:{

   backgroundColor:"#000000b0",
   borderRadius:17,
   borderColor:"#F1E5E0",
   borderWidth:1,
   width:34,
   height:34,
   justifyContent:"center",
   alignItems:"center",
   margin:10,

 },
 gradient: {

   height:120,
   backgroundColor: "#00000080",
   justifyContent:"flex-start",
   alignItems:"flex-end"
 },
 text: {
   textAlign:"left",
   alignSelf:"flex-start",
   color:themeColorWhite,
 },
 recipeTitle: {
   paddingTop:10,
  fontFamily: "Helvetica",
  fontSize: 18,
  color: themeColorGrey,
  lineHeight:24,
  textAlign:"center",
  
 },
 recipeText: {

   padding:10,
  fontFamily: "Helvetica",
  fontSize: 15,
  color: themeColorBlack,
  lineHeight:15,
  textAlign:"left",
 },

 recipeDescription: {
  padding:10,
  fontFamily: "Helvetica",
  fontSize: 15,
  color:themeColorBlack,
  lineHeight:15,
  textAlign:"left",

 },
 recipeUnit: {
   paddingHorizontal:10,
  fontFamily: "Helvetica",
  fontSize: 15,
  color: themeColorGrey,
  lineHeight:15,
  textAlign:"left",
 },
 recipeSubtitle: {
   paddingTop:20,
   paddingHorizontal:10,
  fontFamily: "Helvetica",
  fontSize: 19,
  color: themeColorGrey,
  lineHeight:19,
  textAlign:"left",
 },
 recipeIngredient: {
   paddingTop:5,
  paddingHorizontal:10,
 fontFamily: "Helvetica",
 fontSize: 15,
 color: themeColorBlack,
 lineHeight:15,
 textAlign:"left",
},
recipeStep: {
padding:10,
fontFamily: "Helvetica",
 fontSize: 15,
 color: themeColorBlack,
 lineHeight:15,
 textAlign:"left",
},
recipeStepIndex: {
  color:themeColorGrey,

},
recipeTagText: {
color:themeColorWhite,
},
tag: {
  shadowColor: "#000",
shadowOffset: {
	width: 0,
	height: 2,
},
padding:10,
alignSelf:"center",
alignItems:"center",
backgroundColor: themeColorRed,
color:themeColorWhite,
borderWidth:1,
borderColor:"#EDD2CB",
borderRadius:21.5,
shadowOpacity: 0.25,
shadowRadius: 3.84,
elevation: 5,
borderRadius: 15,
},
tagList: {
flexDirection:"row",
alignItems:"center",
alignSelf:"center",
},
});
export default App;
