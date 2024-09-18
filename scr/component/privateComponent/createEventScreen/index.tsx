import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    TextInput,
    Image,
    ScrollView,
    ToastAndroid,
    Alert,
    Modal,
    TouchableWithoutFeedback,
    PermissionsAndroid,
    Platform,
    Linking
} from 'react-native';
import { Colors } from '../../../common/Styles/color';

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Dropdown } from "react-native-element-dropdown";
import { Calendar } from 'react-native-calendars';
import Icon from "react-native-vector-icons/MaterialIcons";
import Files from "react-native-vector-icons/FontAwesome6";
import SoundPlayer from "react-native-sound-player";
import DocumentPicker from "react-native-document-picker"

import { fetchCreateEvent, fetchEventAssets, fetchLogoUpload, fetchAudioUpload } from "./helperApi";
import Header from "../../../common/Header/index";
import Loader from "../../../common/Loader";
import CustomDropDown from '../../../common/DropDown/dropDown'
import { useNavigation } from "@react-navigation/native";


const imgUpload = "../../../../assets/image/icons/imageUplaod.png"

const CreateEvent: React.FC = () => {
    const { secondary, error, background } = Colors // get color component value

    const navigation = useNavigation();

    const headerName = "Create Event";

    // token id
    const [tokenId, setTokenId] = useState<string>("");

    //loader
    const [loading, setLoading] = useState(false); // loading indicator
    const [showLoader, setShowLoader] = useState(false); // loader visibility

    // input ref
    const input1Ref = useRef<TextInput | null>(null);
    const input2Ref = useRef<TextInput | null>(null);

    // bad input or error msg
    const [errName, setErrName] = useState<boolean>(false);
    const [errPlace, setErrPlace] = useState<boolean>(false);
    const [errVideo, setErrVideo] = useState<boolean>(false);
    const [errImage, setErrImage] = useState<boolean>(false);
    const [errImageType, setErrImageType] = useState<boolean>(false);
    const [errImageSize, setErrImageSize] = useState<boolean>(false);
    const [errAudio, setErrAudio] = useState<boolean>(false);
    const [errAudioDuration, setErrAudioDuration] = useState<boolean>(false);
    const [errDate, setErrDate] = useState<boolean>(false);

    //event name and place
    const [eventName, setEventName] = useState<string>('');
    const [eventPlace, setEventPlace] = useState<string>('');

    //event logo
    const [logos, setLogos] = useState<any>([]);
    const [logoUrl, setLogoUrl] = useState<string>('');
    const [selectedLogo, setSelectedLogo] = useState<any>(null);
    const [showLogoUploadFile, setShowLogoUploadFile] = useState<boolean>(false);
    const [logoName, setLogoName] = useState<any>(null);
    const [logoSize, setLogoSize] = useState<any>(null);
    const [logoType, setLogoType] = useState<any>(null);

    const handleLogo = async () => {
        try {

            if (Platform.OS === 'android') {
                // Requesting the READ_EXTERNAL_STORAGE permission
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    {
                        title: 'Storage Permission Required',
                        message: 'This app needs access to your storage to pick files.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    },
                );

                if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
                    // User selected 'Never ask again' or 'Denied' without 'Ask Me Later'
                    Alert.alert(
                        'Permission Required',
                        'Storage permission is required to pick files. Please enable it in the app settings.',
                        [
                            // {
                            //     text: 'Go to Settings',
                            //     onPress: () => {
                            //         Linking.openSettings();
                            //     },
                            // },
                            {
                                text: 'Cancel',
                                style: 'cancel',
                            },
                        ],
                    );
                    return; // Exit the function if permission is denied
                } else if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('Storage permission denied');
                    return; // Exit the function if permission is denied
                }
            }


            const logoDoc = await DocumentPicker.pick({
                type: [DocumentPicker.types.images]
            })
            const name: any = logoDoc[0].name;
            const uri: any = logoDoc[0].uri;
            const size: any = logoDoc[0].size;
            const type: any = logoDoc[0].type;
            console.log("upload logo...", logoDoc[0])
            if (type !== "image/png") {
                setErrImageType(true)
                setErrImage(false);
                setErrImageSize(false);
                setSelectedLogo(null);
                setLogoType(null);
                setLogoUrl('');
                setShowLogoUploadFile(false);
                ToastAndroid.show("Please select a PNG file.", ToastAndroid.SHORT);
                return;
            }

            setErrImage(false);
            setErrImageType(false);
            setErrImageSize(false);
            setShowLogoUploadFile(true);
            setLogoName(name);
            // setSelectedLogo(name);
            setLogoType(type)
            setLogoUrl(uri);
            checkSizeCondition(size);
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                console.log("User cancel the upload", err);
            } else {
                console.log(err);
            }
        }
    };

    const checkSizeCondition = (size: any) => {
        if (size <= 1048576) {
            setShowLogoUploadFile(true);
            setLogoSize(formateBytes(size));
            setErrImageSize(false);
            setErrImageType(false);
        } else {
            setShowLogoUploadFile(false);
            setSelectedLogo(null);
            setLogoSize(null);
            setLogoUrl('');
            setErrImageSize(true)
            setErrImageType(false);
        }
    }

    const handleUploadLogo = async () => {
        const formData = new FormData();

        formData.append('logo', {
            uri: logoUrl,
            type: logoType,
            name: logoName,
        });

        setLoading(true); // Show loading indicator
        setShowLoader(true); // Show loader with delay

        // loader timeout
        const loaderTimeout = setTimeout(() => {
            if (!loading) {
                setShowLoader(false); // Hide loader if loading is fast
            }
        }, 5000);

        try {
            const response = await fetchLogoUpload(formData, tokenId);

            // Show a success message
            ToastAndroid.show(response.data.message, ToastAndroid.SHORT);
            console.log("api logoupload...", response.data)
            // Perform additional actions after successful upload
            setSelectedLogo(response.data.data.logo.logoName)
            uploadData();
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                console.error('Axios Error:', error.message);
                console.error('Error Config:', error.config);
                console.error('Error Response:', error.response?.data);
            } else {
                console.error('Unexpected Error:', error);
            }
        } finally {
            clearTimeout(loaderTimeout); // Clear the loader timeout
            setLoading(false); // Hide loading indicator
            setShowLoader(false); // Hide loader
        }
    };


    //event video duration
    const [video, setVideo] = useState<any>([]);
    const [selectedVideoDuration, setSelectedVideoDuration] = useState<any>(null);



    // event audio
    const [audio, setAudio] = useState<any>([]);;
    const [selectedAudio, setSelectedAudio] = useState<any>(null);
    const [audioUrl, setAudioUrl] = useState<string>("");
    const [showAudioUploadFile, setShowAudioUploadFile] = useState<boolean>(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [audioDurations, setAudioDurations] = useState<any>(null);
    const [currentPlayingUrl, setCurrentPlayingUrl] = useState<string | null>(null);
    const [remainingDuration, setRemainingDuration] = useState<number | null>(null);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isPlaying) {
            interval = setInterval(async () => {
                try {
                    const info = await SoundPlayer.getInfo();
                    const currentTime = info.currentTime;
                    const duration = info.duration;
                    const newRemainingDuration = duration - currentTime;
                    setRemainingDuration(duration - currentTime);

                    if (newRemainingDuration <= 0) {
                        stopAudio(audioUrl);
                    }
                } catch (error) {
                    console.error('Error getting audio info:', error);
                }
            }, 1000);
        } else {
            if (interval) clearInterval(interval);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPlaying]);

    const handleAudio = async () => {
        try {
            if (Platform.OS === 'android') {
                // Requesting the READ_EXTERNAL_STORAGE permission
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    {
                        title: 'Storage Permission Required',
                        message: 'This app needs access to your storage to pick files.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    },
                );

                if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
                    // User selected 'Never ask again' or 'Denied' without 'Ask Me Later'
                    Alert.alert(
                        'Permission Required',
                        'Storage permission is required to pick files. Please enable it in the app settings.',
                        [
                            {
                                text: 'Go to Settings',
                                onPress: () => {
                                    Linking.openSettings();
                                },
                            },
                            {
                                text: 'Cancel',
                                style: 'cancel',
                            },
                        ],
                    );
                    return; // Exit the function if permission is denied
                } else if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('Storage permission denied');
                    return; // Exit the function if permission is denied
                }
            }

            const AudioDoc = await DocumentPicker.pick({
                type: [DocumentPicker.types.audio]
            })
            const name: any = AudioDoc[0].name;
            const uri: any = AudioDoc[0].uri;
            setErrAudio(false);
            setErrAudioDuration(false);
            setShowAudioUploadFile(true);
            setSelectedAudio(name);
            setAudioUrl(uri);
            await fetchAudioDuration(uri, name);
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                console.log("User cancel the upload", err);
            } else {
                console.log(err);
            }
        }
    }



    //fetch upload audio duration
    const fetchAudioDuration = async (uri: string, name: string) => {
        try {
            await SoundPlayer.loadUrl(uri);  // Load the audio URL
            const info = await SoundPlayer.getInfo();  // Get the duration info

            if (info.duration <= 30) {
                const duration = info.duration;
                setAudioDurations(duration);
                setRemainingDuration(duration);
                setErrAudioDuration(false)
            } else {
                setSelectedAudio(null)
                setShowAudioUploadFile(false)
                setErrAudioDuration(true)
            }
        } catch (error) {
            console.error(`Error fetching duration for ${name}:`, error);
        }
    };

    //Fetch default audio duration
    const fetchAudioDurations = async (audioList: any[]) => {
        const durations: { [key: string]: number } = {};
        for (const audio of audioList) {
            try {
                await SoundPlayer.loadUrl(audio.songUrl);
                const info = await SoundPlayer.getInfo();
                setAudioDurations(info.duration)
            } catch (error) {
                console.error(`Error fetching duration for ${audio.songName}:`, error);
            }
        }
        setAudioDurations(durations);
    };


    const formatDuration = (durationInSeconds: any) => {
        const minutes = Math.floor(durationInSeconds / 60);
        const seconds = Math.floor(durationInSeconds % 60);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };


    const togglePlayPause = (url: string) => {
        if (currentPlayingUrl === url) {
            // Pause or resume the current audio
            if (isPlaying) {
                SoundPlayer.pause();
                setIsPlaying(false);
            } else {
                SoundPlayer.play();
                setIsPlaying(true);
            }
        } else {
            // Stop any currently playing audio and play the new one
            SoundPlayer.stop();
            SoundPlayer.playUrl(url);
            setCurrentPlayingUrl(url);
            setIsPlaying(true);
        }
    }

    const stopAudio = (url: string) => {
        SoundPlayer.stop();
        setIsPlaying(false);
        setCurrentPlayingUrl(null);
        setRemainingDuration(null);
    }

    //fetch api audio upload
    const handleUploadAudio = async () => {
        const formData = new FormData();

        formData.append('song', {
            name: selectedAudio,
            uri: audioUrl,
            type: 'audio/mpeg',
        });


        setLoading(true); // Show loading indicator
        setShowLoader(true); // Show loader with delay

        // loader timeout
        const loaderTimeout = setTimeout(() => {
            if (!loading) {
                setShowLoader(false); // Hide loader if login is fast
            }
        }, 5000);

        try {
            const response = await fetchAudioUpload(formData, tokenId)
            
            ToastAndroid.show(response.data.message, ToastAndroid.SHORT);
            uploadData();
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                console.error('Axios Error:', error.message);
                console.error('Error Config:', error.config);
                console.error('Error Response:', error.response?.data);
            } else {
                console.error('Unexpected Error:', error);
            }
        } finally {
            clearTimeout(loaderTimeout); // Clear the loader timeout
            setLoading(false); // Hide loading indicator
            setShowLoader(false); // Hide loader
        }
    }


    const uploadData = () => {
        fetchData();
    }


    // Date
    const [selectedDate, setSelectedDate] = useState<any>(null);
    const [showCalendar, setShowCalendar] = useState<boolean>(false);
    //min date
    const today = new Date().toISOString().split('T')[0];


    //convert size into mb formate
    function formateBytes(bytes: any) {
        if (bytes >= 1073741824) {
            bytes = (bytes / 1073741824).toFixed(2) + " GB";
        } else if (bytes >= 1048576) {
            bytes = (bytes / 1048576).toFixed(2) + " MB";
        } else if (bytes >= 1024) {
            bytes = (bytes / 1024).toFixed(2) + " KB";
        } else if (bytes > 1) {
            bytes = bytes + "bytes";
        } else if (bytes == 1) {
            bytes = bytes + "byte";
        } else {
            bytes = "0 bytes";
        }
        return bytes;
    }



    // handle submit
    const checkCondition = () => {

        if (eventName === '' || eventPlace === '' || selectedLogo === null || selectedAudio === null || selectedVideoDuration === null || selectedDate === null) {

            if (!eventName) {
                setErrName(true)
            } else {
                setErrName(false)
            }

            if (!eventPlace) {
                setErrPlace(true)
            } else {
                setErrPlace(false)
            }

            if (!selectedLogo) {
                setErrImage(true)
            } else {
                setErrImage(false)
            }

            if (!selectedVideoDuration) {
                setErrVideo(true)
            } else {
                setErrVideo(false)
            }

            if (!selectedAudio) {
                setErrAudio(true)
            } else {
                setErrAudio(false)
            }

            if (!selectedDate) {
                setErrDate(true)
            } else {
                setErrDate(false)
            }

            // ToastAndroid.show("Fill out all required fields", ToastAndroid.SHORT);

        } else {
            Submit()
        }
    }


    const Submit = async () => {

        const createData: any = {
            eventName: eventName,
            place: eventPlace,
            product: selectedLogo,
            videoDuration: selectedVideoDuration,
            song: selectedAudio,
            eventDate: selectedDate
        }

        setLoading(true); // Show loading indicator
        setShowLoader(true); // Show loader with delay

        // loader timeout
        const loaderTimeout = setTimeout(() => {
            if (!loading) {
                setShowLoader(false); // Hide loader if login is fast
            }
        }, 5000);


        try {
            const response = await fetchCreateEvent(createData, tokenId)
            if (response.status === 201) {
                const createdData: any = response.data
                navigation.navigate('Home', { refresh: true });
                setEventName('');
                setEventPlace('');
                setSelectedLogo(null);
                setVideo(null);
                setSelectedAudio(null);
                setSelectedDate(null);
                SoundPlayer.stop();
                setIsPlaying(false);
                setCurrentPlayingUrl(null);
                setRemainingDuration(null);
                ToastAndroid.show("Event Created Successfully", ToastAndroid.SHORT);
            }
        } catch (error: any) {
            if (error.response.status === 500) {
                ToastAndroid.show(error.response.data.message, ToastAndroid.SHORT);
            } else {
                ToastAndroid.show('An unexpected error occurred', ToastAndroid.SHORT);
            }
        } finally {
            clearTimeout(loaderTimeout); // Clear the loader timeout
            setLoading(false); // Hide loading indicator
            setShowLoader(false); // Hide loader
        }
    }

    // api data
    const fetchData = async () => {
        if (tokenId) {
            setLoading(true); // Show loading indicator
            setShowLoader(true); // Show loader with delay

            // loader timeout
            const loaderTimeout = setTimeout(() => {
                if (!loading) {
                    setShowLoader(false); // Hide loader if login is fast
                }
            }, 5000);

            try {
                const getData = await fetchEventAssets(tokenId)
                setLogos(getData.data.data.logo);
                setAudio(getData.data.data.song);
                setVideo(getData.data.data.videoDuration);
                fetchAudioDurations(getData.data.data.song)
            } catch (error: any) {
                ToastAndroid.show("API Error:", error);
            } finally {
                clearTimeout(loaderTimeout); // Clear the loader timeout
                setLoading(false); // Hide loading indicator
                setShowLoader(false); // Hide loader
            }
        }
    };

    //get api data
    useEffect(() => {

        const getDatas = async () => {
            try {
                const apiValue = await AsyncStorage.getItem('token');
                if (apiValue) {
                    setTokenId(apiValue);
                    fetchData();
                }
            } catch (error: any) {
                ToastAndroid.show('Failed to fetch the data from storage', error);
            }
        };

        getDatas();
    }, [tokenId]);


    return (
        <View className="flex-1 bg-[#171628]">

            <StatusBar backgroundColor={Colors.primary} barStyle={'light-content'} />

            <Header value={headerName} />


            {/* loader */}
            {
                showLoader && (
                    <View style={{ backgroundColor: "rgba(0,0,0,0.3)" }} className="absolute left-0 right-0 top-0 bottom-0 justify-center items-center z-20">
                        <View className={`h-20 w-20 justify-center items-center bg-[${background}]`}>
                            <Loader />
                        </View>
                    </View>
                )
            }

            <View className={`flex-[10] rounded-t-[30px] bg-white`}>

                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View className="flex-[4] rounded-t-[30px]">

                        {/* event info */}
                        <View className={`flex-[3] p-[20px] bg-white rounded-t-[30px]`}>

                            {/* event name */}
                            <View className="p-[10px] w-full">
                                <View className="w-[70%]">
                                    <Text className="text-black text-[14px] font-customssemibold">Event Name</Text>
                                </View>
                                <View className={`w-full h-[40px] rounded-[10px] mt-[1%] ${errName ? 'border-red-600 border' : 'border-black border-0.5'}`}>
                                    <TextInput
                                        ref={input1Ref}
                                        returnKeyType="next"
                                        onSubmitEditing={() => {
                                            input2Ref.current?.focus()
                                            setEventName(eventName.trim())
                                        }}
                                        blurOnSubmit={false}
                                        value={eventName}
                                        placeholder="enter event name"
                                        cursorColor={'#171628'}
                                        placeholderTextColor={Colors.placeholder}
                                        onChangeText={(txt) => {
                                            setEventName(txt);
                                            if (!txt) {
                                                setErrName(true)
                                            } else {
                                                setErrName(false)
                                            }
                                        }}
                                        className={`bg-[${background}] text-[14px] text-black rounded-[10px] pl-[10px] ${eventName === '' ? 'font-customsregular' : 'font-customssemibold'}`}
                                    />
                                </View>
                                <View>
                                    {
                                        errName === true && (
                                            <Text className={`font-customsregular`} style={{ color: error }}>event name is required</Text>
                                        )
                                    }
                                </View>
                            </View>

                            {/* event place */}
                            <View className="p-[10px] w-full">
                                <View className="w-[70%]">
                                    <Text className="text-black text-[14px] font-customssemibold">Event Place</Text>
                                </View>
                                <View className={`w-full h-[40px] rounded-[10px] mt-[1%] ${errPlace ? 'border-red-600 border' : 'border-black border-0.5'}`}>
                                    <TextInput
                                        ref={input2Ref}
                                        returnKeyType="none"
                                        onSubmitEditing={() => {
                                            setEventPlace(eventPlace.trim())
                                        }}
                                        blurOnSubmit={false}
                                        value={eventPlace}
                                        placeholder="enter event place"
                                        cursorColor={'#171628'}
                                        placeholderTextColor={Colors.placeholder}
                                        onChangeText={(txt) => {
                                            setEventPlace(txt);
                                            if (!txt) {
                                                setErrPlace(true)
                                            } else {
                                                setErrPlace(false)
                                            }
                                        }}
                                        className={`bg-[${background}] text-[14px] text-black rounded-[10px] pl-[10px] ${eventPlace === '' ? 'font-customsregular' : 'font-customssemibold'}`}
                                    />
                                </View>
                                <View>
                                    {
                                        errPlace === true && (
                                            <Text className={`font-customsregular`} style={{ color: error }}>event place is required</Text>
                                        )
                                    }
                                </View>
                            </View>

                            {/* logo */}
                            <View className="p-[10px] w-full">
                                <View className="w-[70%]">
                                    <Text className="text-black text-[14px] font-customssemibold">Logo</Text>
                                </View>

                                <View className="flex-row w-full justify-between">
                                    <View className={`h-[40px] w-[83%] justify-center rounded-[10px] ${errImage || errImageSize || errImageType ? 'border-red-600 border' : 'border-black border-0.5'}`}>
                                        <Dropdown
                                            data={logos.map((logo: any) => ({ label: logo.logoUrl, value: logo.logoName }))}
                                            labelField="value"
                                            valueField="value"
                                            value={selectedLogo}
                                            placeholder="select logo"
                                            containerStyle={{ borderRadius: 5, padding: 5, height: 200 }}
                                            placeholderStyle={{ left: 10, color: Colors.placeholder, fontFamily: 'Manrope-Regular.ttf', fontSize: 14 }}
                                            iconColor="black"
                                            activeColor="silver"
                                            showsVerticalScrollIndicator={false}
                                            iconStyle={{ width: 30 }}
                                            selectedTextStyle={{ color: 'black', marginLeft: 10, fontFamily: 'Manrope-SemiBold.ttf', width: '50%' }}
                                            style={{ justifyContent: 'center', alignItems: 'center', marginRight: 10 }}
                                            onChange={(item) => {
                                                setSelectedLogo(item.value);
                                                setLogoUrl(item.label);
                                                setErrImageType(false);
                                                setErrImage(false);
                                                setErrImageSize(false);
                                            }}
                                            renderItem={({ label, value }) => (
                                                <View className="flex-row items-center justify-between mb-[10px] mt-[10px]">
                                                    <View className="h-full w-[20%] items-center">
                                                        <Image
                                                            source={{ uri: label }}
                                                            className="h-[40px] w-[40px] rounded-xl p-[10%] ml-[10px] resize"
                                                        />
                                                    </View>

                                                    <View className="w-[75%]">
                                                        <Text numberOfLines={1} className="text-[12px] font-customsregular ml-[3%] text-black">{value}</Text>
                                                    </View>
                                                </View>
                                            )}

                                        />

                                        {
                                            selectedLogo && (
                                                <View className={`absolute w-[80%] h-full items-center bg-white rounded-[10px] flex-row pl-[10px]`}>
                                                    <Image
                                                        source={{ uri: logoUrl }}
                                                        className="h-[25px] w-[25px] rounded-[5px]"
                                                    />
                                                    <Text numberOfLines={1} className="ml-[10px] w-[90%] font-customssemibold text-black">{selectedLogo}</Text>
                                                </View>
                                            )
                                        }

                                        {/* <CustomDropDown
                                        data={logos.map((logo:any) => ({ label: logo.logoUrl, value: logo.logoName }))}
                                        labelField="value"
                                        valueField="label"
                                        value={selectedLogo}
                                        placeholder="select logo"
                                        onChange={(item:any) => {
                                            setSelectedLogo(item.value);
                                            setErrImage(false);
                                        }}
                                        renderItem={({ label, value }:any) => (
                                            <View className="flex-row items-center flex-1 mt-[10px] mb-[10px]">
                                                <Image
                                                    source={{ uri: label }}
                                                    className="h-[100%] w-[20%] rounded-xl p-[10%] ml-[10px]"
                                                    onError={(e) => console.log("Image Load Error:", e.nativeEvent.error)}
                                                />
                                                <Text className="text-[12px] font-customsregular ml-[3%] text-black w-[75%]">
                                                    {value}
                                                </Text>
                                            </View>
                                        )}
                                    /> */}
                                    </View>

                                    <View className={`h-[40px] w-[15%] justify-center items-center rounded-[10px] ${errImage || errImageSize || errImageType ? 'border-red-600 border' : 'border-black border-0.5'}`}>
                                        <TouchableOpacity onPress={handleLogo}>
                                            <Files name="file-image" size={30} color={"black"} />
                                        </TouchableOpacity>


                                        {/* open logo modal */}
                                        <Modal
                                            transparent={true}
                                            visible={showLogoUploadFile}
                                            onRequestClose={() => setShowLogoUploadFile(false)}
                                        >
                                            <TouchableWithoutFeedback onPress={() => [setShowLogoUploadFile(false), setSelectedLogo(null), setErrImage(true)]}>
                                                <View style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} className="flex-1 justify-center items-center">
                                                    <TouchableWithoutFeedback>
                                                        <View className={`bg-[${background}] w-[90%] h-[50%] rounded-[20px] overflow-hidden`}>
                                                            <View className="w-full h-full">
                                                                <TouchableOpacity onPress={() => [setShowLogoUploadFile(false), setSelectedLogo(null), setErrImage(true)]} className="items-end mr-[20px] mt-[10px]">
                                                                    <Text className="text-[16px] font-customsbold text-black">X</Text>
                                                                </TouchableOpacity>

                                                                <View className="justify-center items-center mt-[5%]">
                                                                    <Image
                                                                        source={{ uri: logoUrl }}
                                                                        className="h-[140px] w-[110px] rounded-[10px]"
                                                                    />
                                                                </View>


                                                                <View className="justify-center items-center h-[50%] mt[10%]">
                                                                    <Text numberOfLines={1} className="text-black text-[18px] font-customsbold">{logoName}</Text>

                                                                    <Text className={`text-red-600 text-[18px] font-customsbold mt-[5%]`}>{logoSize}</Text>

                                                                    <View className="justify-center items-center mt-[5%]">
                                                                        <TouchableOpacity onPress={() => [setShowLogoUploadFile(false), setErrImage(false), handleUploadLogo()]} className={`bg-[${Colors.secondary}] h-[43px] w-[200px] justify-center items-center rounded-xl border-[0.5]`}>
                                                                            <Text className={`text-[#fff] text-lg font-customsbold items-center`}>Upload</Text>
                                                                        </TouchableOpacity>
                                                                    </View>
                                                                </View>
                                                            </View>
                                                        </View>
                                                    </TouchableWithoutFeedback>
                                                </View>
                                            </TouchableWithoutFeedback>
                                        </Modal>

                                    </View>


                                </View>

                                <View>
                                    {
                                        errImage ? (
                                            <Text className={`font-customsregular`} style={{ color: error }}>logo is required</Text>
                                        ) : errImageType ? (
                                            <Text className={`font-customsregular`} style={{ color: error }}>please select a PNG file</Text>
                                        ) : errImageSize ? (
                                            <Text className={`font-customsregular`} style={{ color: error }}>The selected file is larger than the allotted 1 MB.</Text>
                                        ) : null
                                    }
                                </View>
                            </View>


                            {/* video duration */}
                            <View className="p-[10px] w-full">
                                <View className="w-[70%]">
                                    <Text className="text-black text-[14px] font-customssemibold">Video Duration</Text>
                                </View>

                                <View className={`h-[40px] w-full justify-center rounded-[10px] ${errVideo ? 'border-red-600 border' : 'border-black border-0.5'}`}>
                                    {/* {video && video.length > 0 ? ( */}
                                    <Dropdown
                                        data={video.map((videos: any, index: any) => ({ label: JSON.stringify(videos.vd), value: JSON.stringify(videos.vd) }))}
                                        labelField="label"
                                        valueField="value"
                                        value={selectedVideoDuration}
                                        placeholder="select video duration"
                                        containerStyle={{ borderRadius: 5, padding: 5 }}
                                        placeholderStyle={{ left: 10, color: Colors.placeholder, fontFamily: 'Manrope-Regular.ttf', fontSize: 14 }}
                                        iconColor="black"
                                        activeColor="silver"
                                        iconStyle={{ width: 30 }}
                                        selectedTextStyle={{ color: 'black', marginLeft: 10, fontFamily: 'Manrope-SemiBold.ttf' }}
                                        style={{ justifyContent: 'center', alignItems: 'center', marginRight: 10 }}
                                        onChange={item => {
                                            setSelectedVideoDuration(item.label);
                                            setErrVideo(false);
                                        }}
                                        renderItem={({ label }) => (
                                            <View className="flex-row items-center mb-[10px]">
                                                <Text className="text-[16px] font-customsregular ml-[3%] text-black">{label} sec</Text>
                                            </View>
                                        )}
                                    />
                                    {/* ) : (
                                        null
                                    )} */}

                                    {
                                        selectedVideoDuration && (
                                            <View className={`absolute w-[70%] h-full justify-center bg-white rounded-[10px]`}>
                                                <Text className="ml-[10px] w-full font-customssemibold text-black">{selectedVideoDuration}</Text>
                                            </View>
                                        )
                                    }
                                </View>

                                <View>
                                    {errVideo === true && (
                                        <Text className={`font-customsregular`} style={{ color: error }}>video duration is required</Text>
                                    )}
                                </View>

                            </View>



                            {/* select audio */}
                            <View className="p-[10px]">
                                <View className="w-[70%]">
                                    <Text className="text-black text-[14px] font-customssemibold">Audio</Text>
                                </View>

                                <View className="flex-row w-full justify-between">
                                    <View className={`h-[40px] w-[83%] justify-center rounded-[10px] ${errAudio || errAudioDuration ? 'border-red-600 border' : 'border-black border-0.5'}`}>
                                        <Dropdown
                                            data={audio.map((audios: any) => ({ label: audios.songUrl, value: audios.songName }))}
                                            labelField="value"
                                            valueField="value"
                                            value={selectedAudio}
                                            containerStyle={{ borderRadius: 5, padding: 5, height: 200 }}
                                            placeholder="select audio"
                                            placeholderStyle={{ left: 10, fontFamily: 'Manrope-Regular', color: Colors.placeholder, fontSize: 14 }}
                                            iconColor="black"
                                            activeColor="silver"
                                            iconStyle={{ width: 30 }}
                                            showsVerticalScrollIndicator={false}
                                            selectedTextStyle={{ color: 'black', marginLeft: 10, fontWeight: '600', width: '50%' }}
                                            style={{ justifyContent: 'center', alignItems: 'center', marginRight: 10 }}
                                            onChange={item => {
                                                setSelectedAudio(item.value);
                                                setAudioUrl(item.label);
                                                setErrAudioDuration(false);
                                                setErrAudio(false);
                                                SoundPlayer.stop();
                                                setIsPlaying(false);
                                                setCurrentPlayingUrl(null);
                                                setRemainingDuration(null);
                                            }}
                                            onFocus={() => {
                                                if (selectedAudio && audioUrl) {
                                                    togglePlayPause(audioUrl);
                                                }
                                            }}
                                            onBlur={() => {
                                                stopAudio(audioUrl);
                                            }}
                                            renderItem={({ value, label }) => (
                                                <View className="flex-1 mt-[10px] mb-[10px] justify-center">
                                                    <View className="flex-row items-center justify-between h-full w-full p-[5px]">
                                                        <Text numberOfLines={1} className="text-[16px] font-customsregular w-[80%] h-full text-black">{value}</Text>
                                                        <View className="border-black border-[2px] mr-[10px] justify-center items-center rounded-[30px] h-full w-[20%]">
                                                            <TouchableOpacity onPress={() => togglePlayPause(label)} className="h-full w-full justify-center items-center">
                                                                <Icon name={isPlaying && currentPlayingUrl === label ? "pause" : "play-arrow"} size={20} color="black" />
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                </View>
                                            )}
                                        />

                                        {
                                            selectedAudio && (
                                                <View className={`absolute w-[85%] h-full justify-center bg-white rounded-[10px]`}>
                                                    <Text numberOfLines={1} className="ml-[10px] w-full font-customssemibold text-black">{selectedAudio}</Text>
                                                </View>
                                            )
                                        }
                                    </View>

                                    <View className={`h-[40px] w-[15%] justify-center items-center rounded-[10px] ${errAudio || errAudioDuration ? 'border-red-600 border' : 'border-black border-0.5'}`}>
                                        <TouchableOpacity onPress={handleAudio}>
                                            <Files name="file-audio" size={30} color={"black"} />
                                        </TouchableOpacity>


                                        {/* open audio modal */}
                                        <Modal
                                            transparent={true}
                                            visible={showAudioUploadFile}
                                            onRequestClose={() => setShowAudioUploadFile(false)}
                                        >
                                            <TouchableWithoutFeedback onPress={() => [setShowAudioUploadFile(false), setSelectedAudio(null), setErrAudio(true), stopAudio(audioUrl), setIsPlaying(false)]}>
                                                <View style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} className="flex-1 justify-center items-center">
                                                    <TouchableWithoutFeedback>
                                                        <View className={`bg-[${Colors.background}] w-[90%] h-[50%] rounded-[20px] overflow-hidden`}>
                                                            <View className="w-full h-full">
                                                                <TouchableOpacity onPress={() => [setShowAudioUploadFile(false), setSelectedAudio(null), setErrAudio(true), stopAudio(audioUrl), setIsPlaying(false)]} className="items-end mr-[20px] mt-[10px]">
                                                                    <Text className="text-[16px] font-customsbold text-black">X</Text>
                                                                </TouchableOpacity>

                                                                <View className="justify-center items-center mt-[5%]">
                                                                    <Icon name="upload-file" size={50} color={"black"} />
                                                                </View>

                                                                <View className="justify-center items-center h-[50%] mt[10%]">
                                                                    <Text numberOfLines={1} className="text-black text-[18px] font-customsbold">{selectedAudio}</Text>

                                                                    <Text className={`text-red-600 text-[18px] font-customsbold mt-[5%]`}>{formatDuration(remainingDuration)}</Text>

                                                                    <View className="rounded-[30px] border-[2px] border-black mt-[5%]">
                                                                        <TouchableOpacity onPress={() => togglePlayPause(audioUrl)}>
                                                                            <Icon name={isPlaying ? "pause" : "play-arrow"} size={40} color="black" />
                                                                        </TouchableOpacity>
                                                                    </View>

                                                                    <View className="justify-center items-center mt-[5%]">
                                                                        <TouchableOpacity onPress={() => [setShowAudioUploadFile(false), setErrAudio(false), handleUploadAudio()]} className={`bg-[${secondary}] h-[43px] w-[200px] justify-center items-center rounded-xl border-[0.5]`}>
                                                                            <Text className={`text-[#fff] text-lg font-customsbold items-center`}>Upload</Text>
                                                                        </TouchableOpacity>
                                                                    </View>
                                                                </View>
                                                            </View>
                                                        </View>
                                                    </TouchableWithoutFeedback>
                                                </View>
                                            </TouchableWithoutFeedback>
                                        </Modal>

                                    </View>
                                </View>

                                <View>
                                    {
                                        errAudio ? (
                                            <Text className={`font-customsregular`} style={{ color: error }}>audio is required</Text>
                                        ) : errAudioDuration && (
                                            <Text className={`font-customsregular`} style={{ color: error }}>audio selection lasts longer than 30 seconds</Text>
                                        )
                                    }
                                </View>
                            </View>



                            {/* date */}
                            <View className="p-[10px] w-full">
                                <View>
                                    <View className="w-[70%]">
                                        <Text className="text-black text-[14px] font-customssemibold">Date</Text>
                                    </View>

                                    <View className={`h-[40px] w-full justify-center rounded-[10px] ${errDate ? 'border-red-600 border' : 'border-black border-0.5'}`}>
                                        <TouchableOpacity className="justify-between flex-row h-full w-full items-center" onPress={() => setShowCalendar(!showCalendar)}>
                                            <View className="w-[85%]">
                                                <Text className={`bg-white text-[14px] rounded-[10px] pl-[10px] ${selectedDate === null ? `font-customsregular text-[#7D7C7C]` : `font-customssemibold text-black`}`}>{selectedDate === null ? "choose date" : selectedDate}</Text>
                                            </View>

                                            <TouchableOpacity className="w-[15%] justify-center items-center" onPress={() => setShowCalendar(!showCalendar)}>
                                                <Icon name="calendar-month" size={30} color={'black'} />
                                            </TouchableOpacity>
                                        </TouchableOpacity>
                                    </View>

                                    <Modal
                                        transparent={true}
                                        visible={showCalendar}
                                        onRequestClose={() => setShowCalendar(false)}
                                    >
                                        <TouchableWithoutFeedback onPress={() => setShowCalendar(false)}>
                                            <View style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} className="flex-1 justify-center items-center">
                                                <TouchableWithoutFeedback>
                                                    <View className={`bg-[${background}] w-[90%] rounded-[20px] overflow-hidden`}>
                                                        <Calendar
                                                            onDayPress={(day: any) => {
                                                                setSelectedDate(day.dateString);
                                                                setShowCalendar(false)
                                                                setErrDate(false)
                                                            }}
                                                            markedDates={{
                                                                [selectedDate]: {
                                                                    selected: true,
                                                                    disableTouchEvent: true,
                                                                    selectedDotColor: 'orange',
                                                                },
                                                            }}
                                                            theme={{
                                                                textSectionTitleColor: '#3282B8',
                                                                textDisabledColor: '#d9e',
                                                                backgroundColor: '#ffffff',
                                                                calendarBackground: '#ffffff',
                                                                selectedDayBackgroundColor: '#F0997D',
                                                                selectedDayTextColor: '#ffffff',
                                                                todayTextColor: '#FF2E63',
                                                                dayTextColor: 'black',
                                                            }}
                                                            minDate={today}
                                                        />
                                                    </View>
                                                </TouchableWithoutFeedback>
                                            </View>
                                        </TouchableWithoutFeedback>
                                    </Modal>
                                </View>

                                <View>
                                    {
                                        errDate && (
                                            <Text className={`font-customsregular`} style={{ color: error }}>date is required</Text>
                                        )
                                    }
                                </View>
                            </View>
                        </View>

                    </View>

                    <View className="items-center justify-center flex-1 bottom-[10px]">
                        <TouchableOpacity onPress={checkCondition} className={`bg-[${secondary}] w-[200px] h-[43px] justify-center items-center rounded-[10px]`}>
                            <Text className="text-[16px] text-[#ffffff] font-customsbold">Submit</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View >
        </View >
    );
}

export default CreateEvent;
