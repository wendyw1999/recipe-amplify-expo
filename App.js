import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from "@react-navigation/native-stack";

import { withAuthenticator } from 'aws-amplify-react-native';

import recipe from "./recipe.json"
import NetInfo from "@react-native-community/netinfo";

// import Amplify from '@aws-amplify/core';
import config from './src/aws-exports';

import API, { graphqlOperation } from '@aws-amplify/api';
import * as mutations from './src/graphql/mutations';
import * as queries from './src/graphql/queries';
import Amplify, {Auth,Hub,DataStore} from "aws-amplify";
import {SortDirection,Predicates} from "@aws-amplify/datastore";
import AWSAppSyncClient, { AUTH_TYPE } from 'aws-appsync';
import gql from 'graphql-tag';
import { listItems } from './src/graphql/queries';
import {   Item,UserRecipe,User,IngredientItem,IngredientGroupItem,StepItem} from './src/models'
import React from "react";
import {FlatList,Image,ImageBackground,ActivityIndicator,Alert,SafeAreaView,ScrollView,Button,
  TouchableOpacity,StyleSheet,View,Text,StatusBar} from "react-native";
import { SearchBar,SocialIcon,ListItem,Avatar,Rating } from 'react-native-elements';

import { Ionicons,Entypo } from '@expo/vector-icons';

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState,useEffect ,useRef,useContext,createContext} from 'react';
import recipe_json from "./recipe.json";

import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { ConsoleLogger } from '@aws-amplify/core';

export const AuthContext = createContext();


const COLOR = {

  red:"#EB594C",
  white:"#F1E5E0",
  green:"#334429",
  brown:"#C99C3A",
  grey:"#A59495",
  green:"#C9C18E"
}

const newRecipe_json = recipe_json.map(item=> {

  return {...item,caseInsensitiveName:item.name.toLowerCase()}
})
/**Amplify documentation has this example */
const urlOpenerExpo = async (url, redirectUrl) => {
console.log(">>>>>>>>> in urlOpener")
//    // On Expo, use WebBrowser.openAuthSessionAsync to open the Hosted UI pages.
  const { type, url: newUrl } = await WebBrowser.openAuthSessionAsync(url, redirectUrl);

   
   if (type === 'success') {
      WebBrowser.dismissBrowser();
      if (Platform.OS === 'ios') {
        return Linking.openURL(newUrl);
      }
   }
 return Linking.openURL(newUrl);

 };



// const [
//   simulatorSignin,
//   expoSignin,
// ] = config.oauth.redirectSignIn.split(",");

// const [
//   simulatorSignout,
//   expoSignout,
// ] = config.oauth.redirectSignOut.split(",");


// let redirectUrl = Linking.makeUrl();
// var isExpo = false;

// if (redirectUrl.endsWith('19000')) {
//   isExpo = true
// }
// const expoScheme = "recipeapp://";
// const lanIP = "exp://192.168.1.70:19000/--/";
// const localhost = "https://localhost:3000/"
// const updatedAwsConfig = {
//   ...config,
//   oauth: {
//     ...config.oauth,
//     redirectSignIn: localhost,
//     redirectSignOut: localhost,
//     urlOpener:urlOpenerExpo
//   },
// };
// console.log(redirectUrl);
const updatedConfig = {
  ...config,
    "oauth":{
      ...config.oauth,
      urlOpener:urlOpenerExpo

    }
}
Amplify.configure(updatedConfig);
Auth.configure(updatedConfig);

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const SettingsStack = createNativeStackNavigator();

function Home(props) {
  const navigation = props.navigation; 
  const [authState,setAuthState] = useContext(AuthContext);
  return (
    <AuthContext.Provider value={[authState,setAuthState]}>
      <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'Feed') {
          iconName = focused
            ? 'home'
            : 'home-outline';
        } else if (route.name === 'Explore') {
          iconName = focused ? 'search' : 'search-outline';
        } else if (route.name ==="Profile") {
          iconName = focused ? "person":"person-outline";
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: 'tomato',
      tabBarInactiveTintColor: 'gray',
    })}
    > 
    <Tab.Screen name="Feed" component={Feed}/>
    <Tab.Screen name="Explore" component={Explore} />
     <Tab.Screen name="Profile" component={Profile}/>
    </Tab.Navigator>
    </AuthContext.Provider >
    
  );
};


function Explore ({navigation}) {
  const [search,setSearch] = useState("");
  function updateSearch(search) {
    setSearch(search);
  }
  return (
    <ScrollView>
     <SearchBar
        placeholder="Type Here..."
        onChangeText={updateSearch}
        value={search}
        lightTheme={true}
      />
    </ScrollView>
  )
}
async function addRecipes(recipe_file) {

  try {
    await deleteDataStoreItem();
    const recipes = await DataStore.query(Item);
    const recipeNames = recipes.map(item=>item.name);
    await recipe_file.map((item,i)=> {
      if (item.name in recipeNames) {

      } else {
        DataStore.save(
          new Item(item)
        )
      }
    })

  } catch(e) {console.log(e)}
}

async function deleteDataStoreItem() {
  
  const deleted = await DataStore.delete(Item, Predicates.ALL);
  console.log("Deleted All Items");
}

async function createUser(userItem)

{
  try {
    const user = DataStore.query(User,c=>c.username("eq",userItem.username))
    if (user.length===0) {
  const newUser = await DataStore.save(
    new User(
      {
        username:userItem.username,
        email:userItem.email,
        provider:userItem.username.startsWith("facebook")?"facebook":"cognito",
      }
    )
  )
}
return user;

  } catch(e) {console.log(e)
  
  }



}
function UserStatus (props){
  const [authState,setAuthState] = useContext(AuthContext);  
  const isMountedRef = useRef(null);  
const navigation = props.nav;
  useEffect(()=>{
    Hub.listen("auth", (data) => {
      isMountedRef.current = true;
      if(data!=null) {        
        try {
          var event = data.payload.event
          var data = data.payload.data;
          switch (event) {
            case "signIn":
              setAuthState({
                username:data.signInUserSession.accessToken.payload.username,
                email:data.signInUserSession.idToken.payload.email,
                signedIn:true
              });
              
              break;
            case "signOut":
              setAuthState({
                username:"",
                email:"",
                signedIn:false
              })
              break;
            case "customOAuthState":
              setAuthState({
                username:data.signInUserSession.accessToken.payload.username,
                email:data.signInUserSession.idToken.payload.email,
                signedIn:true
              })
          }
        }
        catch(e) {
          console.log(e);}
        
      }
      
      
    });
    Auth.currentAuthenticatedUser()
    .then(user => 
      { setAuthState({
      username:user.signInUserSession.accessToken.payload.username,
      email:user.signInUserSession.idToken.payload.email,
      signedIn:true
    });
    createUser({
      username:user.signInUserSession.accessToken.payload.username,
      email:user.signInUserSession.idToken.payload.email,
      signedIn:true
    });
  }
    )

      return ()=> isMountedRef.current=false;
  },[]);

  const list = [
    {
      title: authState.email,
      icon: "mail-outline",
      link:false
    },
    {
      title: authState.username,
      icon: 'person-outline',
      link:false
    },
    {
      title: "Liked Recipes",
      icon: 'heart',
      link:true,
      navigation:"Liked"
    },
    
  ]


    if (authState.signedIn==false) {
      return(<View style={{paddingTop:"40%"}}>
        <SocialIcon
  title='Sign In With Facebook'
  button
  type='facebook'  
  onPress={() => Auth.federatedSignIn({provider:"Facebook"})}/>

<SocialIcon style={{backgroundColor:"black"}}
fontStyle={{color:"white"}}
  title='Sign In With Email'
  button onPress={() => Auth.federatedSignIn()}/>

      </View>)
    }
    return (
      <View>
      <View style={{paddingTop:5}}>
  {
    list.map((item, i) => (
      <ListItem key={i} bottomDivider onPress={()=>item.navigation?navigation.navigate(item.navigation):{}}>
        <Ionicons name={item.icon} size={20} />
        <ListItem.Content>
          <ListItem.Title>{item.title}</ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron style={{display:item.link?{}:"none"}}     
        />
      </ListItem>
    ))
  }
</View>

      <SocialIcon style={{backgroundColor:COLOR.grey}}
  button onPress={()=>Auth.signOut({global:true})} title="Sign Out"/>

      <Button title="Test" onPress={()=>addRecipes(newRecipe_json)}></Button>
      </View>
   
    ) 
}
function Profile(props) {

  const navigation = props.navigation;
  const [authState,setAuthState] = useContext(AuthContext);  
  return (<View>
    <AuthContext.Provider value={[authState,setAuthState]} >
    <UserStatus nav={navigation}/>
    </AuthContext.Provider>
  </View>)


}
function DetailsScreen({route,navigation}) {
try {
  const {recipe} = route.params;
  console.log(recipe.caseInsensitiveName);

  return (
    <View key={recipe.id}>
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
            return (<TouchableOpacity style={styles.tag} key={index}>
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
            return (<View key={index}>
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
            return (<View key={index}>
              <Text style={styles.recipeStep}>
                <Text style={styles.recipeStepIndex}>{index+1}. </Text>{item.description} 
              </Text></View>)
          }
        
        )}
      </View>
      
      
      </ScrollView>

    </View>
  )
} catch (e) {
  console.log(e);
  return (
    <View><Text>Error</Text></View>
  )
}


  
};



function Feed({navigation}) {
  const [authState,setAuthState] = useContext(AuthContext);

  return (
    // <HomeFlatlist nav={navigation}/>
    <AuthContext.Provider value={[authState,setAuthState]}>
    <HomeFlatList_ nav={navigation} />
    </AuthContext.Provider>
  )
}
function Liked({navigation}) {

  const [authState,setAuthState] = useContext(AuthContext);

  return (
    <AuthContext.Provider value={[authState,setAuthState]}>
    <HomeFlatList_ nav={navigation} saved={true}/>
    </AuthContext.Provider>
  )
}

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



function HomeFlatList_ (props) {

  const [authState,setAuthState] = useContext(AuthContext);

 const [loading,setLoading] = useState(false);
  const [saved,setSaved] = useState([]);
  const [data,setData] = useState([]);
  const [savedKeys,setSavedKeys] = useState([]);
const [isRefreshing,setRefreshing] = useState(false);
const isMountedRef = useRef(null);
const [search,setSearch] = useState("");
function updateSearch(search) {
  if(search==="") {
    fetchRecipesDataStore(authState);
  } else {
    
    queryRecipes(search.trim().toLowerCase())
  }
  setSearch(search);
}
async function queryRecipes(string) {
  
  if (props.saved==false ){
    try{

      const recipesBeginWith = await DataStore.query(Item,c=>c.caseInsensitiveName("beginsWith",string),{
        page: 0,
        limit: 100
      });
      const recipesContain = await DataStore.query(Item,c=>c.caseInsensitiveName("contains",string),{
        page: 0,
        limit: 100
      });
      const beginKeys = recipesBeginWith.map(item=>item.id);
      const recipesFinal = recipesContain.filter(item=>!beginKeys.includes(item.id));
      const recipesTotal = recipesBeginWith.concat(recipesFinal);
      setData(recipesTotal);
  }catch(e) {console.log(e)}
}

   else {

    const savedStartsWith = saved.filter(
      item=>item.caseInsensitiveName.startsWith(string)
    )
    const savedContains = saved.filter(
      item=>item.caseInsensitiveName.includes(string)
    )
    const beginKeys = savedStartsWith.map(item=>item.id);
    const recipesFinal = savedContains.filter(item=>!beginKeys.includes(item.id));
    const recipesTotal = recipesBeginWith.concat(recipesFinal);
    setSaved(recipesTotal);  }
}
  
   
 




  // useEffect(() => {
  //   isMountedRef.current = true;
  //   fetchRecipesDataStore();


  //   return () => isMountedRef.current = false;
  // },[]);

  useEffect(() => {
    Hub.listen("auth", (data) => {
      isMountedRef.current = true;
      if(data!=null) {        
        try {
          var event = data.payload.event
          var data = data.payload.data;
          switch (event) {
            case "signIn":
              setAuthState({
                username:data.signInUserSession.accessToken.payload.username,
                email:data.signInUserSession.idToken.payload.email,
                signedIn:true
              });
              
              break;
            case "signOut":
              setAuthState({
                username:"",
                email:"",
                signedIn:false
              })
              break;
            case "customOAuthState":
              setAuthState({
                username:data.signInUserSession.accessToken.payload.username,
                email:data.signInUserSession.idToken.payload.email,
                signedIn:true
              })
          }
        }
        catch(e) {
          console.log(e);}
        
      }
      
      
    });
    Auth.currentAuthenticatedUser()
    .then(user => 
      { setAuthState({
      username:user.signInUserSession.accessToken.payload.username,
      email:user.signInUserSession.idToken.payload.email,
      signedIn:true
    });
    createUser({
      username:user.signInUserSession.accessToken.payload.username,
      email:user.signInUserSession.idToken.payload.email,
      signedIn:true
    });
    fetchRecipesDataStore(
      {
        username:user.signInUserSession.accessToken.payload.username,
        email:user.signInUserSession.idToken.payload.email,
        signedIn:true
      }
    )

  }
    ).catch((e)=>console.log("Not signed in"))
    fetchRecipesDataStore({signedIn:false})

  },[]);

  useEffect(()=> {
fetchRecipesDataStore(authState);
  },[authState])

onRefresh = async() => {

    if (loading) {
      Alert.alert("Try Again Later")
      
             } else {
              setRefreshing(true);

              if(authState.signedIn) {
                fetchRecipesDataStore(authState);

              } 

             setRefreshing(false);

             }
  }
  async function fetchRecipesDataStore (auth) {
    
    try {
      

      if (auth.signedIn===false) {
        const mess = await DataStore.query(Item);
        setData(mess);
      return;
      } else {
        const mess = await DataStore.query(Item);
        setData(mess);
        const likedItems = (await DataStore.query(UserRecipe)).filter(
              pe => (pe.user.username===auth.username)&&(pe.liked===true)
          ).map(pe => pe.recipes);
          setSaved(likedItems);
          const keys = likedItems.map(item=>item.id)
          setSavedKeys(keys);
          const newData = mess.map(item=>{
            if (keys.includes(item.id)) {
              return {...item,favorited:true}
            } else {
              return {...item,favorited:false}
            }
          })
          setData(newData);
      }
    //   
      setLoading(false);
    } catch(e) {console.log(e)}
    

  }
  
  likeItem = async(recipe_id) => {
    if (authState.signedIn==false) {
      Alert.alert("Sign in first");
      return;
    }
    try {
      const userItems = await DataStore.query(User,c=>c.username("eq",authState.username));
      
      const recipeItem = await DataStore.query(Item,recipe_id);
    const originalItems = (await DataStore.query(UserRecipe)).filter(
        pe => (pe.user.username===authState.username)&&(pe.recipes.id===recipe_id));
        let originalItem;
        if (originalItems.length===0) {

          originalItem = await DataStore.save(
            new UserRecipe ({
            user:userItems[0],
            recipes:recipeItem,
            liked:true,
          }));
        // saved.push(recipeItem);
        // setSaved(saved);
        // setSavedKeys(saved.map(item=>item.id));
        console.log(originalItem.liked);
        const newData = data.map(item=>{
          if(item.id ===recipe_id) {
            return {...item,favorited:true}
          } return item;
        }
          )
        setData(newData);

        } else {
          originalItem = originalItems[0];
          const updatedItem = await DataStore.save(
            UserRecipe.copyOf(originalItem, updated => {
              updated.liked = !originalItem.liked;
            })
          );
          console.log(originalItem.liked);

          if (updatedItem.liked) {
            // saved.push(recipeItem);
            // setSaved(saved);
            // setSavedKeys(saved.map(item=>item.id));
            const newData = data.map(item=>{
              if(item.id ===recipe_id) {
                return {...item,favorited:true}
              } return item;
            }
              )
            setData(newData);
          } else {
            // const newSaved = saved.filter(item=>item.id!=recipeItem.id);
            // setSaved(newSaved);
            // setSavedKeys(newSaved.map(item=>item.id));
            const newData = data.map(item=>{
              if(item.id ===recipe_id) {
                return {...item,favorited:false}
              } return item;
            }
              )
            setData(newData);


          }
        }
     
    } 
    catch(e) {console.log(e)}

    setLoading(false);

  }


  async function removeItem(item) {

    const newSaved = saved.filter(i=>i.id!=item.id);
    setSaved(newSaved);
    setSavedKeys(newSaved.map(item=>item.id));
    try {
      const originalItems = (await DataStore.query(UserRecipe)).filter(
        pe => (pe.user.username===authState.username)&&(pe.recipes.id===item.id));
      if (originalItems.length===0) {
        console.log("Already removed")
      } else {
  
        const originalItem = originalItems[0];
        const updatedItem = await DataStore.save(
          UserRecipe.copyOf(originalItem, updated => {
            updated.liked = false;
          })
        );
        console.log("Removed Item");
      }
      
      
      Alert.alert("Removed");
    } catch(e) {console.log(e)}
    }
    
  function renderSavedItem(item) {

    return (<View style={styles.card}>
      <TouchableOpacity onPress={
        ()=>props.nav.navigate("Details",{
          recipe:item
        })
      }>
      <View style={{flexDirection:"row"}}>
        <View  style={styles.container}>
        <ImageBackground 
        source={{uri:item.image}} resizeMode="cover" style={styles.imageBackground}>
      
      <View style={styles.gradient}>
      {/* <TouchableOpacity style={styles.heart} onPress={()=>removeItem(item)}> 
        <Ionicons name="trash-outline" size={20} 
        color="white"></Ionicons>
      </TouchableOpacity> */}
      <Text style={styles.text}>{item.name}</Text>
    
      </View>
    
     
     
    </ImageBackground>
        </View>
    
      </View>
      </TouchableOpacity>
    </View>
    )
  }

  function renderItem(item,index) {
    // console.log(state.saved);
    // const savedIDs = state.saved.map(item=>item.id);
    return (<View style={styles.card}>
  <TouchableOpacity onPress={
    ()=>props.nav.navigate("Details",{
      recipe:item
    })
  }>
  <View style={{flexDirection:"row"}}>
    <View  style={styles.container}>
    <ImageBackground 
    source={{uri:item.image}} resizeMode="cover" style={styles.imageBackground}>
  
  <View style={styles.gradient}>
  <TouchableOpacity style={styles.heart} onPress={()=>likeItem(item.id)}> 
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
)
  }
  if (props.saved==true) {
    return (<View><FlatList
    ListHeaderComponent={<SearchBar
      placeholder="Type Here..."
      onChangeText={updateSearch}
      value={search}
      lightTheme={true}
    />}
    refreshing={isRefreshing}
    onRefresh={()=>onRefresh()}
    data={saved}
    renderItem={({item}) => renderSavedItem(item)}
    >
      </FlatList></View>)
  }
  return(
    <View>
<FlatList 
 ListHeaderComponent={<SearchBar
  placeholder="Type Here..."
  onChangeText={updateSearch}
  value={search}
  lightTheme={true}
/>}
refreshing={isRefreshing}
onRefresh={()=>onRefresh()}
data={data} renderItem={({item}) => renderItem(item)} />
       </View>
  )

}

 

const App =() => {


  const [authState,setAuthState] = useState({
    id:"",
    username:"",
    signedIn:false
  });

  const isMountedRef = useRef(null);  

  useEffect(() => {
    isMountedRef.current = true;
    Hub.listen("auth", (data) => {
      if(data!=null) {        
        try {
          var event = data.payload.event
          var data = data.payload.data;
          switch (event) {
            case "signIn":
              setAuthState({
                username:data.signInUserSession.accessToken.payload.username,
                email:data.signInUserSession.idToken.payload.email,
                signedIn:true
              });
              
              break;
            case "signOut":
              setAuthState({
                username:"",
                email:"",
                signedIn:false
              })
              break;
            case "customOAuthState":
              setAuthState({
                username:data.signInUserSession.accessToken.payload.username,
                email:data.signInUserSession.idToken.payload.email,
                signedIn:true
              })
          }
        }
        catch(e) {
          console.log(e);}
        
      }
      
      
    });
    Auth.currentAuthenticatedUser()
    .then((user) => 
      { 
        setAuthState({
      username:user.signInUserSession.accessToken.payload.username,
      email:user.signInUserSession.idToken.payload.email,
      signedIn:true
    });
    createUser({
      username:user.signInUserSession.accessToken.payload.username,
      email:user.signInUserSession.idToken.payload.email,
      signedIn:true
    });
  }
    )
    .catch(() => 
    console.log("Not signed in")
    );
    
    return ()=> isMountedRef.current=false;
  },[])

  return (
    <NavigationContainer>
      <AuthContext.Provider value={[authState,setAuthState]}>
      <Stack.Navigator>
        
        <Stack.Screen
          name="Home"
          options={{ headerShown: false }} component={Home}
        >
        </Stack.Screen>
         <Stack.Screen
  name="Details"
  component={DetailsScreen}
  initialParams={{ recipe: recipe[0] }}
/>
<Stack.Screen
  name="Liked"
  component={Liked}
/>
      </Stack.Navigator>
     
      </AuthContext.Provider >
      
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

