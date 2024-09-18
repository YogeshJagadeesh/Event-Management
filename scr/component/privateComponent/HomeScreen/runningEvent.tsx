import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    Modal,
    PermissionsAndroid,
    Platform,
    Alert,
    TouchableWithoutFeedback,
    ActivityIndicator
} from "react-native";
import { Colors } from "../../../common/Styles/color";

import Qrcode from 'react-native-vector-icons/MaterialCommunityIcons';
import Loc from 'react-native-vector-icons/FontAwesome6';
import moment from "moment";
import RNFetchBlob from "rn-fetch-blob";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const list = ({ item }: any) => {

    const navigation = useNavigation();

    //open qr code
    const [openQr, setOpenQr] = useState<boolean>(false);
    const [isDownloading, setIsDownloading] = useState<boolean>(false);

    //formate date
    const formatDate = (date: any) => {
        return date ? moment(date).format('ddd, MMM DD  YYYY') : '';
    };
    
    // handle click
    const handleClick = async () => {
        const eventId: any = item.id;
        const eventName: string = item.eventName;
        const videoDuration: any = item.videoDuration
        await saveStorage(eventId, eventName);
        navigation.navigate("customerPage", { videoDuration })
    }

    // save storage
    const saveStorage = async (eventid: any, eventname: any) => {
        try {
            await AsyncStorage.setItem('event_Id', JSON.stringify(eventid));
            await AsyncStorage.setItem('eventName', eventname);
        } catch (error: any) {
            console.log(error)
        }
    }

    // download logic
    const checkPermission = async () => {
        if (Platform.OS === "android") {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: 'Storage Permission Required',
                        message: 'App needs access to your storage to download photos.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    downloadImage();
                } else {
                    Alert.alert("Permission Denied", "Storage permission is required to download images.");
                }
            } catch (error: any) {
                Alert.alert("Error", error.message);
            }
        } else {
            downloadImage();
        }
    };

    const downloadImage = () => {
        let date = new Date();
        let imageUrl = item.eventQrUrl;
        let ext = getExtension(imageUrl);
        ext = '.' + ext;

        const { config, fs } = RNFetchBlob;
        let pictureDir = fs.dirs.PictureDir;
        let options = {
            fileCache: true,
            addAndroidDownloads: {
                useDownloadManager: true,
                notification: true,
                path: `${pictureDir}/image_${Math.floor(date.getTime() + date.getSeconds() / 2)}${ext}`,
                description: 'Image',
            }
        };

        setIsDownloading(true);

        config(options)
            .fetch('GET', imageUrl)
            .then(res => {
                setIsDownloading(false);
                Alert.alert("Download", "Image downloaded successfully.", [
                    { text: 'Ok', onPress: () => setOpenQr(false) },
                ]);
            })
            .catch(error => {
                setIsDownloading(false);
                Alert.alert("Download Error", error.message);
            });
    };

    const getExtension = (filename: string) => {
        return filename.split('.').pop();
    };


    return (
        <View className="h-[200px] overflow-hidden ml-[10px]">
            <View className={`p-2 bg-white justify-center h-full w-full`}>
                <TouchableOpacity onPress={handleClick} className={`mb-1 h-[170px] w-[170px] rounded-2xl bg-white shadow-md shadow-black p-2`}>

                    <View className="h-[60%] w-full items-center">
                        <Image
                            source={{ uri: item.eventImageUrl }}
                            className="h-full w-full rounded-md"
                        />
                    </View>

                    <View className="flex-row w-full justify-between mt-[2px]">
                        <View className="w-[78%] items-center">
                            <Text numberOfLines={1} className="w-full text-[14px] font-customsbold text-[#021526]">{item.eventName}</Text>
                            <View className="justify-between flex-row items-center w-full mt-[2px]">
                                <Loc name="location-dot" size={12} color={'#03346E'} className="w-[7%]" />
                                <Text className="text-[#134B70] w-[88%] font-customssemibold text-[12px]">{item.place}</Text>
                            </View>
                            <Text className="text-[#134B70] mt-[2px] font-customssemibold text-[12px] w-full">{formatDate(item.eventDate)}</Text>
                        </View>

                        <View className="w-[20%] justify-center items-center">
                            <TouchableOpacity className="w-full items-center justify-center" onPress={() => setOpenQr(!openQr)}>
                                <Qrcode name="qrcode-scan" size={24} color={'black'} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>


                {/* Qr Code open modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={openQr}
                    onRequestClose={() => {
                        setOpenQr(!openQr)
                    }}
                >
                    <TouchableWithoutFeedback onPress={() => setOpenQr(false)}>
                        <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', }} className="flex-1 justify-center items-center">
                            <TouchableWithoutFeedback>
                                <View className={`bg-white h-[50%] w-[80%] rounded-[20px]`}>
                                    <View className="flex-1 ">
                                        <TouchableOpacity onPress={() => setOpenQr(!openQr)}>
                                            <Text className="text-black text-[14px] font-customsbold self-end mr-[20px] mt-[10px]">X</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View className="flex-[8] justify-center items-center">
                                        <Image
                                            source={{ uri: item.eventQrUrl }}
                                            className="h-[80%] w-[80%]"
                                        />
                                        <Text className="text-[#372168] font-customssemibold text-xs">{formatDate(item.eventDate)}</Text>
                                        <Text className="text-black text-[14px] font-customsbold">Event: <Text className="text-[#372168]">{item.eventName}</Text></Text>
                                    </View>

                                    <View className="flex-[3] justify-center items-center">
                                        {
                                            isDownloading ? (
                                                <View className="flex-1 justify-center items-center">
                                                    <ActivityIndicator size="large" color={Colors.loader} />
                                                </View>
                                            ) : (
                                                <TouchableOpacity onPress={checkPermission} className={`bg-[${Colors.secondary}] w-[137px] h-[29px] justify-center items-center rounded-[6px]`}>
                                                    <Text className={`text-[${Colors.text}] text-[16px] font-customsbold`}>Download</Text>
                                                </TouchableOpacity>
                                            )
                                        }
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            </View>
        </View>
    );
};

export default list;