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
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import recipe from "./recipe.json"

import NetInfo from "@react-native-community/netinfo";

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
       datastore: [],
       saved:[],
       savedKeys:[],
       };
     };
     

     componentDidMount() {
      this.fetchAsyncStore().then(this.fetchDatastore());
      console.log(this.props.nav)
  }
     
  
     addRecipes = async () => {
       this.setState({loadingDatastore:true});
       for (const [index,value] of recipe.entries()) {
         try
       {const newItem = await API.graphql({ query: mutations.createItem, variables: {input: value}});
       console.log(newItem);
       }
       catch (e) {console.log(e)}
       }
       this.setState({loadingDatastore:false});
     };
     

     fetchAsyncStore = async() => {
      this.setState({loadingAsyncStorage:true});
      try {
        const keys = await AsyncStorage.getAllKeys();
        const result = await AsyncStorage.multiGet(keys);
        let currAsyncStore = result.map(req => {
          var key = req[0];
          var value = JSON.parse(req[1]);
          return (value)
        });
        this.setState({savedKeys:keys})
        this.setState({saved:currAsyncStore})

    
      } catch (error) {
        console.error(error)
      }
      this.setState({loadingAsyncStorage:false})
    };


 fetchDatastore = async () => { 
  this.setState({loadingDatastore:true});
  try {
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
} catch (e) {
  console.log(e);
} 

this.setState({loadingDatastore:false});  

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
        source={{uri:item.image}} resizeMode="cover" style={styles.image}>
      
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
       if (this.state.loadingDatasotre||this.state.loadingAsyncStorage) { //if loading not finished yet, simply return a activity indicator
       return (

<Text>Loading</Text>        )
       } 
       return (
       
<FlatList data={this.state.datastore} renderItem={({item}) => this.renderItem(item)} />


      
      )
       }
       
 }


 class SavedFlatlist extends React.Component {



  constructor(props) {
    super(props)
    this.state = {
      loadingAsyncStorage:false,
      datastore: [],
      saved:[],
      savedKeys:[],
      };
    }
    
    
    componentDidMount () {
      this.fetchAsyncStore();
    };

    fetchAsyncStore = async() => {
      this.setState({loadingAsyncStorage:true});
      try {
        const keys = await AsyncStorage.getAllKeys();
        const result = await AsyncStorage.multiGet(keys);
        let currAsyncStore = result.map(req => {
          var key = req[0];
          var value = JSON.parse(req[1]);
          return (value)
        });
        this.setState({savedKeys:keys})
        this.setState({saved:currAsyncStore})

      } catch (error) {
        console.error(error)
      }
      this.setState({loadingAsyncStorage:false})
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
    <TouchableOpacity>
      <View style={{flexDirection:"row"}}>
      <View className="recipe-title" style={{flex:1}}>
      <Text>{item.name}</Text>
      </View>
      <View className="remove-recipe-button" style={{flex:1}}>
        <TouchableOpacity className="remove-button" onPress={()=>this.removeItem(item)}>
          <Text>Remove</Text>
        </TouchableOpacity>
      </View>
      </View>
    </TouchableOpacity>
    render () {


      return (
        <FlatList
        data={this.state.saved}
        keyExtractor={item=>item.id}
        renderItem={({item}) => this.renderItem(item)}
        ></FlatList>
      )
    }
 }



 function DetailsScreen({route,navigation}) {
  const { recipe } = route.params;
  return (
    <SafeAreaView>
      <Text>Detail {recipe.id}</Text>
    </SafeAreaView>
  );
};






function HomeScreen({ navigation }) {
  
  return (
     
      <HomeFlatlist  nav={navigation} screen="home"/>

  );
}

function SavedScreen({ navigation }) {

  return (
    <SavedFlatlist  nav={navigation} screen="saved"/>
  )
}

const HomeStack = createStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="Details" component={DetailsScreen} />
    </HomeStack.Navigator>
  );
}

const SavedStack = createStackNavigator();

function SavedStackScreen() {
  return (
    <SavedStack.Navigator>
      <SavedStack.Screen name="Saved" component={SavedScreen} />
      <SavedStack.Screen name="Details" component={DetailsScreen} />
    </SavedStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();


 export default function App() {

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


  
 

    if (!isOffline) {
      return (
        <NavigationContainer>
         <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
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
        <Tab.Screen name="Home" component={HomeStackScreen} />
        <Tab.Screen name="Saved" component={SavedStackScreen} />


      </Tab.Navigator>
        </NavigationContainer>
        )
    } else {
      return (<SafeAreaView>
        <SavedFlatlist/>
      </SafeAreaView>)
    }
  

 }
 const styles = StyleSheet.create({
   card: {
     marginBottom:10,
   },
  container: {
    flex: 1,
  },
  image: {
    flex: 1,
    justifyContent: "flex-end",
    alignContent:"flex-end",
    width:"100%",
    height:120,
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
    color:"white"
  }
});
