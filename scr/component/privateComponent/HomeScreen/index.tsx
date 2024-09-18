import { useIsFocused, useNavigation } from "@react-navigation/native";
import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    Image,
    BackHandler,
    Alert,
    FlatList,
} from "react-native";
import { Colors } from "../../../common/Styles/color";

import AsyncStorage from "@react-native-async-storage/async-storage";
import RunningList from "../HomeScreen/runningEvent";
import { fetchEvents, fetchTotalEvents } from "./helperApi";

const HomeScreen = ({ route }: { route: any }) => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    // pass api data
    const [tokenId, setTokenId] = useState<string>("");
    const [name, setName] = useState<any>(null);


    //states
    const [runningEvent, setRunningEvent] = useState<any[]>([]);
    const [upComingEvents, setUpComingEvents] = useState<any[]>([]);


    const fetchData = async () => {
        if (tokenId) {
            try {
                const getDatas = await fetchEvents(tokenId);
                
                const totalCount = getDatas.data.totalCount;

                const getData = await fetchTotalEvents(tokenId, totalCount);

                if (getData.data.code === 200) {
                    const today = new Date();
                    const todayDateString = today.toISOString().split('T')[0];

                    //filter today event or running event
                    const filteredEvents = getData.data.data.filter((event: any) => {
                        const eventDateString = new Date(event.eventDate).toISOString().split('T')[0];
                        return eventDateString === todayDateString;
                    });
                    setRunningEvent(filteredEvents)

                    //filer upcoming event
                    const upcomingEvent = getData.data.data.filter((event: any) => {
                        const eventDateString = new Date(event.eventDate).toISOString().split('T')[0];
                        return eventDateString > todayDateString;
                    })
                    setUpComingEvents(upcomingEvent)
                }

            } catch (error) {
                console.log("API Error:", error);
            }
        }
    }

    // const name = apiData.name;
    const getData = async () => {
        try {
            const apiValue = await AsyncStorage.getItem('name');
            const apiTokenId = await AsyncStorage.getItem('token');
            if (apiValue && apiTokenId) {
                setName(apiValue);
                setTokenId(apiTokenId);
                await fetchData();
            }
        } catch (error) {
            console.log('Failed to fetch the data from storage');
        }
    }

    useFocusEffect(
        useCallback(() => {
            if (route.params?.refresh) {
                fetchData();
            }
        }, [route.params?.refresh])
    );

    //back handler exit app
    useEffect(() => {
        const handleBackPress = () => {
            if (isFocused) {
                Alert.alert('Exit App', 'Are you sure you want to exit?', [
                    {
                        text: 'Cancel',
                        onPress: () => null,
                        style: 'cancel',
                    },
                    { text: 'YES', onPress: () => BackHandler.exitApp() },
                ]);
                return true;
            } else {
                navigation.goBack();
                return true;
            }
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

        return () => backHandler.remove();
    }, [isFocused]);

    //logout condition
    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    onPress: () => null,
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    onPress: () => {
                        AsyncStorage.removeItem('name'); // Example of clearing AsyncStorage
                        navigation.navigate('login');
                    },
                },
            ],
            { cancelable: true }
        );
    };

    //fetch api
    useEffect(() => {
        getData();
    }, [name, tokenId]);

    return (
        <View className={`flex-1 bg-[${Colors.primary}]`}>
            <StatusBar backgroundColor={Colors.primary} barStyle={'light-content'} />

            <View className={`flex-1 justify-around items-center flex-row bg-[${Colors.primary}]`}>
                <View className={`bg-[${Colors.primary}]`}>
                    <TouchableOpacity>
                        <Image
                            className="w-7 h-7"
                            source={require('../../../../assets/image/icons/NavigationDrawer.png')}
                        />
                    </TouchableOpacity>
                </View>

                <View>
                    <Text className={`text-lg font-customssemibold text-[${Colors.text}]`}>Event organization</Text>
                </View>

                <View className={`bg-[${Colors.primary}]`}>
                    <TouchableOpacity onPress={handleLogout}>
                        <Image
                            source={require('../../../../assets/image/icons/Logout.png')}
                            className="w-7 h-7"
                        />
                    </TouchableOpacity>
                </View>
            </View>


            {/* body */}
            <View className="flex-[9] rounded-t-3xl w-full bg-white">
                <Image
                    source={require('../../../../assets/image/login/logins.png')}
                    className="absolute h-full w-full"
                />

                <View className="p-3">
                    <View className="mt-2 ml-2">
                        <Text className="text-base font-customsbold text-black">Hi, {name}...</Text>
                    </View>

                    <View className="flex-row justify-around items-center">
                        <TouchableOpacity onPress={() => navigation.navigate("eventList")} className={`bg-white w-[141] h-[127] rounded-xl justify-center items-center mt-[10] shadow-md shadow-black`}>
                            <Image
                                className="w-[45] h-[41]"
                                source={require('../../../../assets/image/icons/EventList.png')}
                            />
                            <Text className="text-black text-sm font-customsbold mt-1">Event List</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate("createEvent")} className={`bg-white w-[141] h-[127] rounded-xl justify-center items-center mt-[10] shadow-md shadow-black`}>
                            <Image
                                source={require('../../../../assets/image/icons/CreateEvent.png')}
                                className="w-[45] h-[39]"
                            />
                            <Text className="text-black text-sm font-customsbold mt-1">Create Event</Text>
                        </TouchableOpacity>
                    </View>

                    {
                        runningEvent.length > 0 && (
                            <View className="mt-[20px]">
                                <View>
                                    <Text className="text-[#454450] text-[16px] font-customsbold">Running Events</Text>
                                </View>

                                <View className="h-[200px]">
                                    <View className="flex-row justify-center h-full">
                                        <FlatList
                                            data={runningEvent}
                                            horizontal={true}
                                            showsHorizontalScrollIndicator={false}
                                            renderItem={({ item, index }) => (
                                                <RunningList item={item} />
                                            )}
                                            contentContainerStyle={{ justifyContent: 'center' }}
                                            className="h-full w-full"
                                            overScrollMode="never"
                                        />
                                    </View>
                                </View>
                            </View>
                        )
                    }

                    {
                        upComingEvents.length > 0 && (
                            <View className={`${(runningEvent.length > 0 ? 'mt-[5px]' : 'mt-[20px]')}`}>
                                <View>
                                    <Text className="text-[#454450] text-[16px] font-customsbold">Upcoming Events</Text>
                                </View>

                                <View className="h-[200px] rounded-10px">
                                    <View className="flex-row justify-center h-full">
                                        <FlatList
                                            data={upComingEvents}
                                            horizontal={true}
                                            showsHorizontalScrollIndicator={false}
                                            renderItem={({ item, index }) => (
                                                <RunningList item={item} />
                                            )}
                                            contentContainerStyle={{ justifyContent: 'center' }}
                                            className="h-full w-full"
                                            overScrollMode="never"
                                        />
                                    </View>
                                </View>
                            </View>
                        )
                    }

                </View>
            </View>
        </View>
    );
};


export default HomeScreen;