import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ToastAndroid,
    Image,
    ActivityIndicator,
    Dimensions
} from "react-native";
import { Colors } from '../../../common/Styles/color';

import { fetchVideoProcess } from "./helperApi";

import { Camera, Point, useCameraDevice, useCameraFormat, useCameraPermission } from "react-native-vision-camera";
import Flash from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Animated, { useSharedValue, useAnimatedProps, interpolate, Extrapolation, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler'

Animated.addWhitelistedNativeProps({
    zoom: true,
})

const { width, height } = Dimensions.get('window');

const ReanimatedCamera = Animated.createAnimatedComponent(Camera)

const Cameras = () => {

    const { background, loader, text } = Colors

    const navigation = useNavigation();

    // token id
    const [tokenId, setTokenId] = useState<string>("");

    //loader
    const [loading, setLoading] = useState<boolean>(false); // loading indicator
    const [showLoader, setShowLoader] = useState<boolean>(false); // loader visibility
    const [loadingPercentage, setLoadingPercentage] = useState<any>(0);

    //route data
    const route = useRoute();
    const { passData }: any = route.params || {}
    const { videoDuration } = route.params as { videoDuration: number }

    const eventId: any = passData.id;
    const uniqueId: any = passData.uuid;

    //states
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTimer, setRecordingTimer] = useState(5);
    const [currentTimer, setCurrentTimer] = useState(5);
    const [onFlash, setOnFlash] = useState<any>('off');

    const cameraRef = useRef<Camera>(null);
    const device: any = useCameraDevice('back')

    const zoom = useSharedValue(device?.neutralZoom || 1);
    const zoomOffset = useSharedValue(0);

    const focus = useCallback((point: Point) => {
        const c = cameraRef.current
        if (c == null) return
        c.focus(point)
    }, [])

    const gesture = Gesture.Pinch()
        .onBegin(() => {
            zoomOffset.value = zoom.value
        })
        .onUpdate(event => {
            const z = zoomOffset.value * event.scale
            zoom.value = interpolate(
                z,
                [1, 10],
                [device.minZoom, device.maxZoom],
                Extrapolation.CLAMP,
            )
        })
        .onEnd(({ x, y }: any) => {
            runOnJS(focus)({ x, y })
        })

    const handleTouch = (event: any) => {
        const { locationX, locationY } = event.nativeEvent;
        const focusPoint = {
            x: locationX / width,
            y: locationY / height,
        };
        focus(focusPoint);
        console.log(focusPoint)
    };

    const animatedProps = useAnimatedProps(() => ({ zoom: zoom.value }), [zoom]);

    const format: any = useCameraFormat(device, [
        { fps: 240 }
    ])
    const fps = format.maxFps

    //formate timer
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const startRecording = async () => {
        if (cameraRef.current) {
            try {
                setIsRecording(true);
                setCurrentTimer(recordingTimer);

                // Ensure the camera is ready
                const camera = cameraRef.current;
                if (!camera) {
                    throw new Error('Camera reference is not available');
                }

                camera.startRecording({
                    onRecordingFinished: async (video: any) => {
                        await submit(video.path)
                    },
                    onRecordingError: (error) => {
                        console.error('Recording failed: ', error)
                        setIsRecording(false)
                    }
                });

                //set timer
                const timerInterval = setInterval(() => {
                    setCurrentTimer((prev) => {
                        if (prev === 1) {
                            clearInterval(timerInterval);
                            stopRecording();
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);

            } catch (error) {
                setIsRecording(false);
            }
        } else {
            // if (cameraRef.current) {
            //     await cameraRef.current.stopRecording();
            // }
            console.warn('Camera reference is not available for starting recording.');
        }
    };

    const stopRecording: any = async () => {
        if (cameraRef.current) {
            await cameraRef.current.stopRecording();
            setIsRecording(false);
        }
    };

    const submit = async (video: any) => {
        console.log("submit")

        const formData = new FormData();

        formData.append('id', eventId)
        formData.append('video', {
            uri: `file:///${video}`,
            type: 'video/quicktime',
            name: 'song',
        },
        )
        formData.append('uuid', uniqueId)

        setLoading(true); // Show loading indicator
        setShowLoader(true); // Show loader with delay

        try {
            const response = await fetchVideoProcess(formData, tokenId, (progress: number) => {
                setLoadingPercentage(progress); // Update loading percentage
                if (progress === 100) {
                    ToastAndroid.show("Video sent successfully", 3000);
                    setShowLoader(false);
                    setLoading(false);
                    navigation.navigate('customerPage', { refresh: true }); // Navigate after upload completes
                }
            });
            // navigation.navigate('customerPage', { refresh: true });
            console.log("video responce...", response)

        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Axios Error:', error.message);
                console.error('Error Config:', error.config);
                console.error('Error Response:', error.response?.data);
            } else {
                console.error('Unexpected Error:', error);
            }
            setLoading(false); // Hide loading indicator on error
            setShowLoader(false); // Hide loader on error
        }

    }


    const getDatas = async () => {
        try {
            const apiValue = await AsyncStorage.getItem('token');
            if (apiValue) {
                setTokenId(apiValue);
            }
        } catch (error: any) {
            ToastAndroid.show('Failed to fetch the data from storage', error);
        }
    };

    const { hasPermission, requestPermission } = useCameraPermission()

    if (device == null) return <ActivityIndicator />

    useEffect(() => {
        if (!hasPermission) {
            requestPermission();
        }
        getDatas();
    }, [hasPermission, tokenId])

    return (
        <View className={`flex-1 justify-center items-center bg-[${background}]`}>

            {/* loader */}
            {
                showLoader && (
                    <View style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }} className="absolute left-0 right-0 top-0 bottom-0 justify-center items-center z-20">
                        <View className="h-20 w-20 justify-center items-center ">
                            <ActivityIndicator size="large" color={loader} className="bg-transparent" />
                            <Text style={{ color: "#ffffff", marginTop: 10 }}>{loadingPercentage}%</Text>
                        </View>
                    </View>
                )
            }

            <GestureDetector gesture={gesture}>
                <ReanimatedCamera
                    ref={cameraRef}
                    device={device}
                    isActive={true}
                    className="absolute h-[100%] w-[100%]"
                    format={format}
                    fps={fps}
                    video={true}
                    torch={onFlash}
                    animatedProps={animatedProps}
                />
            </GestureDetector>

            {
                !showLoader && (
                    <>
                        <TouchableOpacity
                            className="absolute h-full w-full flex-1 justify-center items-center"
                            onPress={handleTouch}  // Handles touch for focusing
                            activeOpacity={1}  // Ensures full screen touch area
                        >
                            <View className="absolute left-3 top-5 border-[1px] border-white rounded-[10px]">
                                <Flash
                                    onPress={() => setOnFlash((currentVal: any) => (currentVal === 'off' ? 'on' : 'off'))}
                                    name={onFlash === 'off' ? "flash-on" : "flash-off"}
                                    color={"white"}
                                    size={30}
                                />
                            </View>

                            <TouchableOpacity onPress={() => navigation.goBack()} className="absolute right-3 top-5 border-[1px] h-[30px] w-[30px] justify-center items-center border-white rounded-[10px]">
                                <Text className={`text-[${text}] font-customsbold text-[16px]`}>X</Text>
                            </TouchableOpacity>

                            <View className="absolute bottom-20">
                                <Text className={`text-[${text}] font-customsbold text-[24px]`}>{formatTime(currentTimer)}</Text>
                            </View>

                            <View className={`absolute h-[60px] w-[60px] justify-center rounded-[30px] items-center ${isRecording ? 'bg-red-500  border-white border-[2px]' : 'bg-white border-white border-[2px]'} bottom-5`}>
                                <TouchableOpacity onPress={startRecording} disabled={isRecording} className="h-[90%] w-[90%] border-black border-[1px] rounded-[50px]"></TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </>
                )
            }
        </View>
    );
}

export default Cameras;