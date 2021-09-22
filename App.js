import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import { useForm, Controller } from "react-hook-form";
import RNPickerSelect from 'react-native-picker-select';

import { withAuthenticator } from 'aws-amplify-react-native';

import recipe from "./recipe.json"
import NetInfo from "@react-native-community/netinfo";

// import Amplify from '@aws-amplify/core';
import config from './src/aws-exports';


import API, { graphqlOperation } from '@aws-amplify/api';
import * as mutations from './src/graphql/mutations';
import * as queries from './src/graphql/queries';
import Amplify, {Auth,Hub,DataStore,SortDirection,Predicates} from "aws-amplify";
import AWSAppSyncClient, { AUTH_TYPE } from 'aws-appsync';
import gql from 'graphql-tag';
import { listItems,listUserRecipes,listUsers } from './src/graphql/queries';
import {   Item,UserRecipe,User,IngredientItem,IngredientGroupItem,StepItem} from './src/models'
import React from "react";
import {FlatList,Image,ImageBackground,ActivityIndicator,Alert,SafeAreaView,ScrollView,
  TouchableOpacity,StyleSheet,View,StatusBar} from "react-native";
import { Icon,Input,Button,SearchBar,SocialIcon,ListItem,Avatar,Rating } from 'react-native-elements';

import { Ionicons,Entypo } from '@expo/vector-icons';
import { DefaultTheme, Provider as PaperProvider,TextInput,
Text,Divider,List,useTheme } from 'react-native-paper';

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState,useEffect ,useRef,useContext,createContext} from 'react';
import recipe_json from "./recipe.json";

import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { ConsoleLogger } from '@aws-amplify/core';
import { setAutoLogAppEventsEnabledAsync } from 'expo-facebook';
import { Colors } from 'react-native/Libraries/NewAppScreen';

export const AuthContext = createContext();


Amplify.configure(config);


const COLOR = {
  lightRed:"#F2DBD5",
  red:"#EB594C",
  white:"#F1E5E0",
  green:"#334429",
  brown:"#C99C3A",
  grey:"#A59495",
  green:"#C9C18E"
}

const newRecipe_json = recipe_json.map(item=> {

  return {...item,caseInsensitiveName:item.name.toLowerCase(),
  tag:item.tag.map(item=>{return item.toLowerCase()})
  }
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


let redirectUrl = Linking.makeUrl();
const expoScheme = "recipeapp://";

if (redirectUrl.startsWith('exp://1')) {
  redirectUrl = redirectUrl + '/--/';
} else
if (redirectUrl === expoScheme) {
  // no change required
} else {
  // for expo client
  redirectUrl = redirectUrl + '/'
}
const updatedConfig = {
  ...config,
    "oauth":{
      ...config.oauth,
      redirectSignIn:redirectUrl,
      redirectSignOut:redirectUrl,
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
        } else if (route.name === 'Create') {
          iconName = focused ? 'create' : 'create-outline';
        } else if (route.name ==="Profile") {
          iconName = focused ? "person":"person-outline";
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: 'tomato',
      tabBarInactiveTintColor: 'gray',
      gestureEnabled: false,
    })}
    > 
   <Tab.Screen name="Feed" component={Feed}/>
    <Tab.Screen name="Create" component={Create}/>
    
     <Tab.Screen name="Profile" component={Profile}/>
    </Tab.Navigator>
    </AuthContext.Provider >
    
  );
};

function CreateStep(props) {
  const [editable,setEditable] = useState(true);
  const [step,setStep] = useState('');
  const [error,setError] = useState(false);

  function handleStep(){
    if (!editable) {
      setEditable(true);
      return;
    } 
    if (step=="") {
      setError(true);
    } else {
      setEditable(false);
      setError(false);
      props.handleStep({description:step},props.index)
    }
  }
  return (
    <View style={{flexDirection:"row"}}>
      <View style={{width:"80%",flexDirection:"column"}}>
      <TextInput multiline 
      onChangeText={setStep}
      value={step}
      placeholder={"Step "+(props.index+1)}
      disabled={!editable}
      style={{backgroundColor:"white"}}
      // style={editable?styles.input:styles.disabledInput}
      >
      </TextInput>
      {error?<Text>This field is required</Text>:null}
      </View>
      
      <TouchableOpacity style={{padding:5}} onPress={()=>handleStep()}>
    <Ionicons
    name={editable?'checkmark':"pencil"}
    size={24}
    color={COLOR.red} />
    </TouchableOpacity>
      
    </View>
  )
}


function CreateIngredient(props) {
  const object = props.route.params;
  const index = object.index
  const navigation = props.navigation
 const [name,setName] = useState(object.ingredient.name);
 const [amount,setAmount] = useState(object.ingredient.amount);
 const [unit,setUnit] = useState(object.ingredient.unit);
  const [error,setError] = useState(false);

  function handleIngredient() {
    
      setError(false);
      navigation.navigate("Create",{index:index,
        ingredient:
        {unit:unit,name:name,amount:amount}});
      // props.handleIngredient({name:name,amount:amount,unit:unit},props.index)
    
  }
return (
  <SafeAreaView>
    <View style={{flexDirection:"column"}}>
      <TextInput
      onChangeText={setName}
      value={name}
      style={{backgroundColor:"white"}}
      placeholder={"Ingredient "+(index+1)}
      // style={editable?styles.input:styles.disabledInput}
      >
      </TextInput>
      {error?<Text>This field is required</Text>:null}

    </View>
    <View>
     
    <TextInput
      onChangeText={setAmount}
      value={amount}
      right={<TextInput.Affix text="e.g. 10"/>}
      placeholder="Amount"
      style={{backgroundColor:"white"}}

      // style={editable?styles.input:styles.disabledInput}

      >
      </TextInput>
    </View>
    <View>
    <TextInput
      onChangeText={setUnit}
      right={<TextInput.Affix text="e.g. gram"/>}
      value={unit}
      placeholder="Unit"
      style={{backgroundColor:"white"}}

      // style={editable?styles.input:styles.disabledInput}

      >
      </TextInput>
    </View>
    
      
    
    <TouchableOpacity style={{padding:5}} onPress={()=>handleIngredient()}>
 <Ionicons
name={"checkmark"}
size={24}
color={COLOR.red} />
 </TouchableOpacity>
  </SafeAreaView>
)

}
function Create(props) {
  const [authState,setAuthState] = useContext(AuthContext);  
  const [submitted,setSubmitted] = useState(false);
  const { control, handleSubmit, reset,formState: { errors } } = useForm();
  const [image,setImage] = useState("");
  const [ingredients,setIngredients] = useState([{
    name:'',amount:'',unit:''
  }]);

  useEffect(() => {
    if (props.route.params?.ingredient) {
      ingredients[props.route.params.index] = props.route.params.ingredient;
      setIngredients([...ingredients]);
    }
  }, [props.route.params?.ingredient]);



  const [steps,setSteps] = useState([
    {description:"",image:""}
  ])

  function submitAnother() {
    setImage("");
    setSubmitted(false);
    setIngredients([{
      name:'',amount:'',unit:''
    }]);
    setSteps([
      {description:"",image:""}
    ]);
    reset();
    
  }

  const onSubmit = async(data) => {
    if (!authState.signedIn) {
      Alert.alert("Sign in first");
      return;
    }
    const user = await createUser(authState);
    const newData = {...data,
      caseInsensitiveName:data.name.toLowerCase(),
      tag:data.tag!=undefined?data.tag.toLowerCase().split(","):[],
      ingredient:ingredients,
      step:steps,
      image:image,
      creator:user.id,
    };
    try {
      // const saved = await DataStore.save(new Item(
      //   newData
      // ));

      const saved = await API.graphql(graphqlOperation(mutations.createItem, {input: newData})); 

    } catch(e) {
      console.log(e);
    }
    setSubmitted(true);
    

  };
  function handleImage(url) {
    setImage(url);
  }
  function handleStep(step,index) {
    steps[index] = step;
    setSteps([...steps]);
  }
  function handleIngredient(res,index) {
    
    ingredients[index] = res;
    console.log(ingredients);
    setIngredients([...ingredients]);
  }
  function addStepInput() {
    const length = steps.length;
    steps.push("");
    setSteps([...steps]);
  }

  function addIngredientInput() {
    const length = ingredients.length;
    ingredients.push({
      name:'',amount:'',unit:''
    });
    setIngredients([...ingredients]);
  }
  function deleteStep(index) {
    if (steps.length==1) {
      Alert.alert("Cannot delete");
      return;
    }
    setSteps([...steps.slice(0, index), ...steps.slice(index + 1)])
  }
  function deleteIngredient(index) {
    
    setIngredients([...ingredients.slice(0, index), ...ingredients.slice(index + 1)])
  }
  if (submitted) {
    return (<SafeAreaView>
      <Button title="Submit Another Recipe" onPress={()=>submitAnother()}></Button>
    </SafeAreaView>)
  }
  return (
    <SafeAreaView>
      <ScrollView>
      <Controller
        control={control}
        rules={{
         required: true,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
          style={{backgroundColor:"white"}}
          placeholder="Unnamed Recipe"
          label="Recipe Title"
            // style={styles.input}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
        name="name"
        defaultValue=""
      />
      {errors.name && <Text>This is required.</Text>}

      <Controller
        control={control}
        rules={{
         maxLength: 100,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
          multiline={true}
          style={{backgroundColor:"white"}}

          label="Description"
            // style={styles.input}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
        name="description"
        defaultValue=""
      />
            <Controller
        control={control}
        rules={{
         maxLength: 100,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
          style={{backgroundColor:"white"}}
          multiline={true}
          placeholder="Tags (separate with comma)"
            // style={styles.input}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
        name="tag"
        defaultValue=""
      />
       <View>
         <Text>Ingredients</Text>
        {ingredients.map((item,index)=> {
          return(
            <View key={index} >

        <ListItem.Swipeable key={index} bottomDivider
              rightContent={
                <Button
                  title="Delete"
                  icon={{ name: 'delete', color: 'white' }}
                  buttonStyle={{ minHeight: '100%', backgroundColor: 'red' }}
                  onPress={()=>deleteIngredient(index)}
                />
              }
              leftContent={
                <Button title="Edit" onPress={()=>props.navigation.navigate("Ingredient",
              {index:index,ingredient:ingredients[index]})}
              icon={{ name: 'create', color: 'white' }}
                buttonStyle={{ minHeight: '100%'}}
              ></Button>
              }>
                
                
        <ListItem.Content>
          
          <ListItem.Title style={{
            color:theme.colors.placeholder,
            height:23
                      }}>{item.name==""?"Swipe right to edit":item.name + " * " + item.amount + " " +item.unit}</ListItem.Title>
        </ListItem.Content>
      </ListItem.Swipeable>
      </View>)

            
        })}
      </View>
      <TouchableOpacity style={{padding:5}} onPress={()=>addIngredientInput()}>
 <Ionicons
name={'add-circle'}
size={24}
color={COLOR.red} />
 </TouchableOpacity>
     
     <View key="step-area">
       {steps.map((item,index)=> {
         return(
           <View key={index} style={{flexDirection:"row"}}>
               <CreateStep index={index} handleStep={handleStep}></CreateStep>
               <TouchableOpacity style={{padding:5}} onPress={()=>deleteStep(index)}>
                  <Ionicons
                  name={'trash-sharp'}
                  size={24}
                  color={COLOR.red} />
                  </TouchableOpacity>
             </View>
         
       )
       })}
       <TouchableOpacity style={{padding:5}} onPress={()=>addStepInput()}>
 <Ionicons
name={'add-circle'}
size={24}
color={COLOR.red} />
 </TouchableOpacity>


     </View>
     
     <CreateImage handleImage={handleImage}></CreateImage>

      <Button title="Submit" onPress={handleSubmit(onSubmit)} />
      </ScrollView>
    </SafeAreaView>
  );
}

function CreateImage(props) {
  const [image,setImage] = useState("");
  const [url,setUrl] = useState("");
  const [imageComponent,setImageComponent] = useState(
    null
  )
    
  function handleImage(e) {
    setImage(e);
    try {
       URL = new URL(e);
      setUrl(e);
      props.handleImage(e);
    } catch (_) {
      console.log(_);
    }
  }
  return(
    <View>
<TextInput
      style={{backgroundColor:"white"}}
    onChangeText={(e)=>handleImage(e)}
    value={image}
    // style={styles.input}
    placeholder="image url"
    ></TextInput>
    {url!=""?<Image source={{uri:url}} style={styles.image}/>:null}
    
    
    </View>
    
  )
}

// function Create(props) {

//   const [name,setName] = useState("");
//   const [time,setTime] = useState('');
//   const [ingredient,setIngredient] = useState("");
//   const [amount,setAmount] = useState("");
//   const [unit,setUnit] = useState("");


//   const [ingredients,setIngredients] = useState([])
//   const [steps,setSteps] = useState([])
//   function handleIngredient () {
//     if (ingredient=="") {
//     Alert.alert("Can't be empty")
//     } else {
//       ingredients.push({
//         ingredient:ingredient,
//         amount:amount,
//         unit:unit
//       });
//       setIngredients(ingredients);
//       setIngredient("");
//       setAmount("");
//       setUnit("");
//     }
    
//   }

  
//   return (
//     <SafeAreaView>
//       <ScrollView>
//       <Button
//   title="Upload from website"
//   type="clear"
// />
// <TextInput
//         style={styles.input}
//         onChangeText={value=>setName(value)}
//         value={name}
//         placeholder="Recipe name"
//       />
//       <TextInput
//         style={styles.input}
//         onChangeText={value=>setTime(value)}
//         value={time}
//         placeholder="Time"
//         keyboardType="numeric"
//       />
      
//       <ListItem bottomDivider >
//     <ListItem.Content style={{flexDirection:"row"}}>

// <View style={{flex:3,justifyContent:"flex-start",alignItems:"flex-start",textAlign:"center"}}>
// <ListItem.Input placeholder="Ingredient" value={ingredient}
//       onChangeText={value=>setIngredient(value)}></ListItem.Input>
// </View>
// <View style={{flex:2}}>
// <ListItem.Input placeholder="Amount" value={amount}
//       onChangeText={value=>setAmount(value)}></ListItem.Input>
// </View>
// <View style={{flex:1}}>
// <ListItem.Input placeholder="Unit" value={unit}
//       onChangeText={value=>setUnit(value)}></ListItem.Input>

// </View>
     
        
      
     
//     </ListItem.Content>
//   </ListItem>
//   <TouchableOpacity style={{padding:5}} onPress={()=>handleIngredient()}>
//       <Ionicons
//   name='add-circle'
//   size={24}
//   color={COLOR.red} />
//       </TouchableOpacity>


//       </ScrollView>


//     </SafeAreaView>
//   )

// }

async function addRecipes(recipe_file) {

  try {
    // await deleteDataStoreItem();
    // const recipes = await DataStore.query(Item);
    
    // const recipeNames = recipes.map(item=>item.name);
    for (let i = 0; i < recipe_file.length; i++) {
      const item = recipe_file[i];
      const newItem = await API.graphql({ query: mutations.createItem, variables: {input: item}});
    }

  } catch(e) {console.log(e)}
}

async function deleteDataStoreItem() {
  
  try {
    const deleted = await DataStore.delete(Item, Predicates.ALL);
    const deleted1 = await DataStore.delete(UserRecipe, Predicates.ALL);
    const deleted2 = await DataStore.delete(User, Predicates.ALL);

    await DataStore.clear();
  console.log("Deleted All Items");
  } catch(e) {console.log(e)}

}

async function createUser(userItem)

{
  try {
    const provider = userItem.username.split("_")[0]
    
    const user = {id:userItem.username,email:userItem.email,username:userItem.username,
    provider:provider
  };
  const originalUser = await API.graphql({ query: queries.getUser, variables: { id: userItem.username }});
  if (originalUser.data.getUser) {
    return originalUser.data.getUser;
  } else {
    const newUser = await API.graphql(graphqlOperation(mutations.createUser, {input: user}));
    return newUser.data.createUser;
  }

  } catch(e) {console.log(e)
  
  }

}
function UserStatus (props){
  const [authState,setAuthState] = useContext(AuthContext);  
  const isMountedRef = useRef(null);  
  const [phone,setPhone] = useState("")
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
    {
      title: "Created Recipes",
      icon: 'create',
      link:true,
      navigation:"Created"
    },
    
  ]


    if (authState.signedIn==false) {
      return(<View style={{paddingTop:"40%"}}>
        <SocialIcon
  title='Sign In With Facebook'
  button
  type='facebook'  
  onPress={() => Auth.federatedSignIn({provider:"Facebook"})}/>
   <SocialIcon
  title='Sign In With Google'
  button
  type='google'  
  onPress={() => Auth.federatedSignIn({provider:"Google"})}/>

<SocialIcon style={{backgroundColor:"black"}}
fontStyle={{color:"white"}}
  title='Sign In With Username'
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
  button onPress={()=>Auth.signOut()} title="Sign Out"/>
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
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function Explore({route,navigation}) {

  
  const [myTag,changeTag] = useState("");
  useEffect(()=> {
    changeTag(route.params.tag);
  })
  if (myTag=="") {

    return (

      <View>

        <Text>Explore</Text>
      </View>
    )
  }
  return (
    <View>
      <HomeFlatList_ key={"tag"+myTag} nav={navigation} saved={false} created={false} searchKey={"tag:"+myTag}></HomeFlatList_>
    </View>
  )

}
function DetailsScreen({route,navigation}) {

  function handleTag(tagItem) {
    navigation.navigate("Explore",{
      tag:tagItem
    })
  }
try {
  const {recipe} = route.params;
  
  return (
    <View key={recipe.id}>
       <ScrollView>
        <Image 
        source={{uri:recipe.image?recipe.image:null}} 
        defaultSource={require("./default_food_img.jpg")} 
        resizeMode="cover" style={styles.image}>
      
      </Image>
      
      
      <Text style={styles.recipeTitle}>{recipe.name}</Text>
      <View className="tags" style={styles.tagList}>
        {recipe.tag.map(
          (item,index)=>{
            return (<TouchableOpacity style={styles.tag} key={index}
              onPress={()=>handleTag(item)}
            >
              <Text style={styles.recipeTagText}>{capitalizeFirstLetter(item)}</Text>
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



function Feed({route,navigation}) {
  const [authState,setAuthState] = useContext(AuthContext);

  return (
    // <HomeFlatlist nav={navigation}/>
    <AuthContext.Provider value={[authState,setAuthState]}>
    <HomeFlatList_ nav={navigation} saved={false} created={false} searchKey={""}/>
    </AuthContext.Provider>
  )
}

function Created({navigation}) {
  const [authState,setAuthState] = useContext(AuthContext);

  return (
    <AuthContext.Provider value={[authState,setAuthState]}>
    <HomeFlatList_ nav={navigation} saved={false} created={true} searchKey={""}/>
    </AuthContext.Provider>
  )
  
}
function Liked({navigation}) {

  const [authState,setAuthState] = useContext(AuthContext);

  return (
    <AuthContext.Provider value={[authState,setAuthState]}>
    <HomeFlatList_ nav={navigation} saved={true} created={false} searchKey={""}/>
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
  const [created,setCreated] = useState([]);
  const [data,setData] = useState([]);
  const [savedKeys,setSavedKeys] = useState([]);
const [isRefreshing,setRefreshing] = useState(false);
const isMountedRef = useRef(true);
const [search,setSearch] = useState(props.searchKey);
// useEffect(()=> {
//   isMountedRef.current = true;
//   updateSearch(search);
//   console.log(search);
//   return()=>isMountedRef.current=false
// })
function updateSearch(search) {
  if(search==="") {
    fetchRecipesDataStore(authState);
    
  } else {
    queryRecipes(search.trim().toLowerCase());
  }
  setSearch(search);
}
async function queryRecipes(string) {
  if(!isMountedRef.current) {
    return;
  }

  if ((props.saved==false)&&(props.created==false))
  
  {
     try{
      
      if (string.startsWith("tag:")) {
        const tag_string = string.split(":")[1]
        
        const { data: { listItems: { items: tagContains, nextToken } } }
         = await API.graphql({query:listItems,variables:{
          filter:{tag:{contains:tag_string}}
        }});
        

        await fetchLiked(authState,tagContains);

      } else {
        const { data: { listItems: { items: recipesBeginWith, nextToken1 } } }
         = await API.graphql({query:listItems,variables:{
          filter:{caseInsensitiveName:{beginsWith:string}}
        }});
        const { data: { listItems: { items: recipesContain, nextToken2 } } }
         = await API.graphql({query:listItems,variables:{
          filter:{caseInsensitiveName:{contains:string}}
        }});
        

        // const recipesBeginWith = await DataStore.query(Item,c=>c.caseInsensitiveName("beginsWith",string),{
        //   page: 0,
        //   limit: 100
        // });
        // const recipesContain = await DataStore.query(Item,c=>c.caseInsensitiveName("contains",string),{
        //   page: 0,
        //   limit: 100
        // });
        const beginKeys = recipesBeginWith.map(item=>item.id);
        const recipesFinal = recipesContain.filter(item=>!beginKeys.includes(item.id));
        const recipesTotal = recipesBeginWith.concat(recipesFinal);
        setData(recipesTotal);
        await fetchLiked(authState,recipesTotal);

      }
      
  }catch(e) {console.log(e)}
}

   else if (props.saved==true) {

    try {
      
        const  savedStartsWith= saved.filter(
          item=>item.caseInsensitiveName.startsWith(string)
        )
        const savedContains = saved.filter(
          item=>item.caseInsensitiveName.includes(string)
        )
  
       
  
        
        const beginKeys = savedStartsWith.map(item=>item.id);
        const recipesFinal = savedContains.filter(item=>!beginKeys.includes(item.id));
        var recipesTotal = savedStartsWith.concat(recipesFinal);
        await fetchLiked(authState,recipesTotal);

      
      
    }

    catch(e) {console.log(e)} 
  } else if (props.created==true) {
    const  savedStartsWith= created.filter(
      item=>item.caseInsensitiveName.startsWith(string)
    )
    const savedContains = created.filter(
      item=>item.caseInsensitiveName.includes(string)
    )

   

    
    const beginKeys = savedStartsWith.map(item=>item.id);
    const recipesFinal = savedContains.filter(item=>!beginKeys.includes(item.id));
    var recipesTotal = savedStartsWith.concat(recipesFinal);
    await fetchCreated(authState,recipesTotal);

  
  
    
  }
    
}
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
    .then(user => 
      { setAuthState({
      username:user.signInUserSession.accessToken.payload.username,
      email:user.signInUserSession.idToken.payload.email,
      signedIn:true
    });

  }
    ).catch((e)=>console.log("Not signed in"));
    
    if (search=="") {
      fetchRecipesDataStore(authState);

    } else {
      queryRecipes(search.trim().toLowerCase());
    }
    return()=> isMountedRef.current = false;
  },[]);

  useEffect(()=> {
    isMountedRef.current = true;
if (search=="") {
  fetchRecipesDataStore(authState);
} else {
  updateSearch(search);
}
return()=> isMountedRef.current = false;
  },[authState])

onRefresh = async() => {
  if(!isMountedRef.current) {
    return;
  }

    if (loading) {
      Alert.alert("Try Again Later")
      
             } else {
              setRefreshing(true);

              if(authState.signedIn) {
                search==""?fetchRecipesDataStore(authState):updateSearch(search);

              } 

             setRefreshing(false);

             }
  }

  async function fetchCreated(auth,data=data) {
    if(!isMountedRef.current) {
      return;
    }
    try {
      const keys = data.map(item=>item.id);
      const { data: { listItems: { items: createdItems, nextToken } } }
         = await API.graphql({query:listItems,variables:{
          filter:{creator:{eq:auth.username}}  
        }});
      // const createdItems = (await DataStore.query(Item)).filter(
      //   pe=>(pe.creator===user.id)
      // );
      
      const newCreated = createdItems.filter(i=>keys.includes(i.id)&&i._deleted!=true);
      setCreated(newCreated);
    } catch(e) {console.log(e)}
  }
  async function fetchLiked(auth,data=data) {
    if(!isMountedRef.current) {
      return;
    }
try {
  // const { data: { listItems: { items: likedItems, nextToken } } }
  //        = await API.graphql(graphqlOperation(queries.listUserRecipes,{
  //         filter:{and:
  //         [
  //           {userID:{eq:auth.username}},
  //           {liked:{eq:true}}
  //         ]}
  //       }));
         const { data: { listUserRecipes: { items: likedUserRecipes, nextToken } } }
         = await API.graphql({query:queries.listUserRecipes,variables:{
          filter:{and:
          [
            {userID:{eq:auth.username}},
            {liked:{eq:true}}
          ]}
        }});
    //   const likedItems = (await DataStore.query(UserRecipe)).filter(
    //     pe => (pe.user.username===auth.username)&&(pe.liked===true)
    // ).map(pe => pe.recipes);    
    const keys = likedUserRecipes.map(item=>item.recipeID);
    setSavedKeys(keys);
    const newSaved = data.filter(i=>keys.includes(i.id));
    setSaved(newSaved);
    const newData = data.map(item=>{
      if (keys.includes(item.id)) {
        return {...item,favorited:true}
      } else {
        return {...item,favorited:false}
      }
    })
    setData(newData);
} catch(e) {console.log(e)}
    
  }
  async function fetchRecipesDataStore (auth) {
    if(!isMountedRef.current) {
      return;
    }
    
    try {
      

      if (auth.signedIn===false) {
        const { data: { listItems: { items: mess, nextToken } } }
         = await API.graphql({query:listItems})
        if (mess.length===0) {
          console.log("NO recipes in the cloud")
          //if there is internet,
          try {
            addRecipes(newRecipe_json);
          } catch(e) {console.log(e);
            setData(newRecipe_json);}
          
        } else {
          setData(mess);
        }
      return;
      } else {
        const { data: { listItems: { items: mess, nextToken } } }
         = await API.graphql({query:listItems})
        setData(mess);
        fetchLiked(authState,mess);
        fetchCreated(authState,mess);
      }
    //   
      setLoading(false);
    } catch(e) {console.log(e)}
    

  }
  
  likeItem = async(recipe_id) => {
    if(!isMountedRef.current) {
      return;
    }
    isMountedRef.current = true;
    if (authState.signedIn==false) {
      Alert.alert("Sign in first");
      return()=>isMountedRef.currnet = false
    }
    const newData = data.map(item=>{
      if(item.id ===recipe_id) {
        return {...item,favorited:!item.favorited}
      } return item;
    }
      )
    setData(newData); 
    try {
      
      const userItem = await createUser(authState);
      
      
      const recipeItem = await API.graphql(graphqlOperation(queries.getItem, { id: recipe_id }));
      // const recipeItem = await DataStore.query(Item,recipe_id);
      const { data: { listUserRecipes: { items: originalItems, nextToken } } }
      = await API.graphql({query:queries.listUserRecipes,variables:{
       filter:{and:
       [
         {userID:{eq:authState.username}},
         {recipeID:{eq:recipe_id}}
       ]}
     }});

    // const originalItems = (await DataStore.query(UserRecipe)).filter(
    //     pe => (pe.user.username===authState.username)&&(pe.recipes.id===recipe_id));
        let originalItem;
        const detail = {
          userID:userItem.id,
          recipeID:recipe_id,
          liked:true
        };

        if (originalItems.length===0) {
          
          const originalItem= await API.graphql(graphqlOperation(mutations.createUserRecipe, {input: detail})); // equivalent to above example
        

        } else {
          originalItem = originalItems[0];
          const detail = {id:originalItem.id,
            recipeID:originalItem.recipeID,
            userID:originalItem.userID,
            _version:originalItem._version,
            liked:!originalItem.liked}
          if (!originalItem.liked) {

            const newData = data.map(item=>{
              if(item.id ===recipe_id) {
                return {...item,favorited:true}
              } return item;
            }
              )
            setData(newData);
          } else {
            const newData = data.map(item=>{
              if(item.id ===recipe_id) {
                return {...item,favorited:false}
              } return item;
            }
              )
            setData(newData);
          }
          const updatedItem = await API.graphql({ query: mutations.updateUserRecipe, variables: {input: detail}});


          
        }
     
    } 
    catch(e) {console.log(e)}

    return ()=> isMountedRef.current = false
  }


  async function removeItem(item) {
    if(!isMountedRef.current) {
      return;
    }
    if (props.saved) {
      const newSaved = saved.filter(i=>i.id!=item.id);
    setSaved(newSaved);
    setSavedKeys(newSaved.map(item=>item.id));
    try {
      const { data: { listUserRecipes: { items: originalItems, nextToken } } }
      = await API.graphql({query:queries.listUserRecipes,variables:{
       filter:{and:
       [
         {userID:{eq:authState.username}},
         {recipeID:{eq:item.id}}
       ]}
     }});
     const originalItem = originalItems[0]
     const detail = {id:originalItem.id,
    userID:originalItem.userID,
  recipeID:originalItem.recipeID,
  _version:originalItem._version,
liked:false}
      const updatedItem = await API.graphql({ query: mutations.updateUserRecipe, variables: {input: detail
      }});
      Alert.alert("Unliking this item");
    } catch(e) {console.log(e)}
    } else if (props.created) {
      const newCreated = created.filter(i=>i.id!=item.id);
      setCreated(newCreated);

      try {
        const deletedItem = await API.graphql({query:mutations.deleteItem,variables:{input:
          {id:item.id,
          _version:item._version}}})
        Alert.alert("Deleted this item");
     } catch(e) {console.log(e)}
    }
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
        source={{uri:item.image?item.image:null}} resizeMode="cover" style={styles.imageBackground}>
      
      <View style={styles.gradient}>
      <TouchableOpacity style={styles.heart} onPress={()=>removeItem(item)}> 
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
    source={{uri:item.image?item.image:null}} resizeMode="cover" style={styles.imageBackground}>
  
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

  if (!isMountedRef.current) {
    return(<Text>Loading</Text>)
  }
  if (props.created) {
    return (
      <View><FlatList
    ListHeaderComponent={<SearchBar
      placeholder="Type Here..."
      onChangeText={updateSearch}
      value={search}
      lightTheme={true}
    />}
    refreshing={isRefreshing}
    onRefresh={()=>onRefresh()}
    data={created}
    renderItem={({item}) => renderSavedItem(item)}
    >
      </FlatList></View>
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

 
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    backgroundColor:"white",
    primary: COLOR.red,
    accent: 'yellow',
  },
};


const App =(props) => {


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
  initialParams={{ recipe: newRecipe_json[0] }}
/>

<Stack.Screen name="Explore" component={Explore} initialParams={{tag:""}}/>

<Stack.Screen
  name="Liked"
  component={Liked}
/>
<Stack.Screen
  name="Created"
  component={Created}
/>
<Stack.Screen
  name="Ingredient"
  component={CreateIngredient}
  initialParams={{index:1}}
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
  ingredientBubble: {borderWidth:1,borderRadius:18,backgroundColor:COLOR.lightRed,borderColor:COLOR.brown,
    fontSize:20,padding:5},

  card: {
    marginBottom:10,
  },
  disabledInput: {
    height: 40,
    margin: 5,
    padding: 5,
  },
  input: {
    height: 40,
    margin: 5,
    borderBottomWidth: 1,
    padding: 5,
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
export default function AppOuter() {
  return (
  <PaperProvider theme={theme}>
      <App />
    </PaperProvider>)
}

