import React, { useState, useEffect } from "react";
import { 
  View,
  PermissionsAndroid,
  Platform,
  LogBox
} from "react-native"

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AsyncStorage from "@react-native-async-storage/async-storage";
import Loader from "./scr/common/Loader/index"
import {Colors} from './scr/common/Styles/color'

import Login from './scr/component/publicComponent/Login/index';
import Home from './scr/component/privateComponent/HomeScreen/index';
import CreateEvent from './scr/component/privateComponent/createEventScreen/index';
import CreateEvents from './scr/component/privateComponent/createEventScreen/createEvent'
import EventList from './scr/component/privateComponent/eventListScreen/index';
import CustomerPage from './scr/component/privateComponent/customerListScreen/index';
import CameraPage from "./scr/component/privateComponent/cameraScreen";
import VideoProcess from './scr/demoFiles/videoProcess'

const Stack = createNativeStackNavigator();

const App = () => {

  LogBox.ignoreAllLogs()
  const [initialRoute, setInitialRoute] = useState<string | any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const storedName = await AsyncStorage.getItem('name');
        setInitialRoute(storedName ? 'Home' : 'login');
      } catch (error) {
        console.error('Failed to check login status:', error);
        setInitialRoute('login');
      } finally {
        setIsLoading(false);
      }
    };
    checkLoginStatus();
  }, []);

  if (isLoading) {
    return (
      <View style={{ backgroundColor: "rgba(0,0,0,0.3)" }} className="absolute left-0 right-0 top-0 bottom-0 justify-center items-center z-20">
        <View className={`h-20 w-20 justify-center items-center bg-white`}>
          <Loader />
        </View>
      </View>
    );
  };

  return (
    <GestureHandlerRootView className="flex-1">
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{
          headerShown: false
        }}>
          <Stack.Screen name="login" component={Login} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="createEvent" component={CreateEvent} />
          {/* <Stack.Screen name="createEvents" component={CreateEvents} /> */}
          <Stack.Screen name="eventList" component={EventList} />
          <Stack.Screen name="customerPage" component={CustomerPage} />
          {/* <Stack.Screen name="videoPage" component={VideoProcess} /> */}
          <Stack.Screen name="cameraPage" component={CameraPage} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};
export default App;
