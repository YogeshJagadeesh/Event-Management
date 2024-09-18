import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ToastAndroid,
    ActivityIndicator,
    RefreshControl,
    StatusBar,
    FlatList,
    Image,
    StyleSheet,
    LayoutChangeEvent
} from "react-native";
import { Colors } from '../../../common/Styles/color';

import { Camera, Point, useCameraDevice, useCameraFormat, useCameraPermission, useCodeScanner, CodeScannerFrame, Code } from "react-native-vision-camera";
import Flash from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { useSharedValue, useAnimatedProps, interpolate, Extrapolation, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler'

import { fetchCustomerList, customerValidation } from "../../../component/privateComponent/customerListScreen/helperApi";
import CustomerHelper from "../../../component/privateComponent/customerListScreen/renderHelper";
import Header from "../../../common/Header/index";
import Loader from '../../../common/Loader/index';

Animated.addWhitelistedNativeProps({
    zoom: true,
})

const ReanimatedCamera = Animated.createAnimatedComponent(Camera)

const search = require('../../../../assets/image/icons/search.png');
const qrcode = require('../../../../assets/image/icons/QRCode.png');


const Cameras = ({ route }: { route: any }) => {
    const { primary, background, loader } = Colors // get color component value
    const { videoDuration } = route.params;
    
    const navigation = useNavigation();

    const header = "Customer Info";
    const searchInputName = "Search customer name"

    // token id
    const [tokenId, setTokenId] = useState<string>("");
    const cameraRef = useRef<Camera>(null);

    //loader
    const [loading, setLoading] = useState<boolean>(false); // loading indicator
    const [showLoader, setShowLoader] = useState<boolean>(false); // loader visibility
    const [isLoading, setIsLoading] = useState<boolean>(false);// footerLoader
    const [refreshing, setRefreshing] = useState<boolean>(false);// Refreshing

    const device: any = useCameraDevice('back')

    //states
    const [datas, setDatas] = useState<any[]>([]);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [qrData, setQrData] = useState<string | null>(null);
    const [showScanner, setShowScanner] = useState<boolean>(false);
    const [onFlash, setOnFlash] = useState<any>('off');
    const [eventId, setEventId] = useState<string>("");
    const [uniqueCodes, setUniqueCodes] = useState<string[]>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalData, setTotalData] = useState<any>(null);
    const [searchOption, setSearchOption] = useState<boolean>(false);
    const [filterData, setFilterData] = useState<any>(datas);
    const [searchKeyword, setSearchKeyword] = useState<string>('');

    const [cameraViewDimensions, setCameraViewDimensions] = useState<{ width: number, height: number } | null>(null);

    //search function
    const searchList = (keyword: any) => {
        setSearchKeyword(keyword)
        const lowerCasekeyboard = keyword.toLowerCase();
        const result = datas.filter((data: any) => {
            return data.name.toLowerCase().includes(lowerCasekeyboard) ||
                data.unique_code.toLowerCase().includes(lowerCasekeyboard)
        })
        setFilterData(result);
    }

    // Open QR Code Scanner
    const openQrcode = (data: string) => {
        setQrData(data);
        qrCondition()
    };

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
    Gesture.Tap()
        .onEnd(({ x, y }: any) => {
            runOnJS(focus)({ x, y })
        })

    const animatedProps = useAnimatedProps(() => ({ zoom: zoom.value }), [zoom]);

    const onLayout = (event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setCameraViewDimensions({ width, height });
    };

    const codeScanner = useCodeScanner({
        codeTypes: [
            'qr',
            'ean-13',
            'code-128',
            'code-39',
            'code-93',
            'codabar',
            'ean-8',
            'itf',
            'upc-e',
            'upc-a',
            'pdf-417',
            'aztec',
            'data-matrix'
        ],
        onCodeScanned: (codes: Code[], frame: CodeScannerFrame) => {
            if (codes.length !== 1) {
                return;
            }

            const frameLongSide = Math.max(frame.width, frame.height);
            const frameShortSide = Math.min(frame.width, frame.height);

            // Grabbing the min and max values for the x and y  corner value
            const xValues = codes[0].corners?.map(p => p.x) || [];
            const yValues = codes[0].corners?.map(p => p.y) || [];
            const minX = Math.min(...xValues);
            const maxX = Math.max(...xValues);
            const minY = Math.min(...yValues);
            const maxY = Math.max(...yValues);

            if (!cameraViewDimensions) return;

            const { width: windowWidth, height: windowHeight } = cameraViewDimensions;

            const heightRatio = windowHeight / frameLongSide;
            const widthRatio = windowWidth / frameShortSide;

            const scanArea = {
                top: windowHeight * 0.35, // 35% top
                bottom: windowHeight * 0.65, // 65% bottom
                left: windowWidth * 0.1, // 10% left
                right: windowWidth * 0.9, // 90% right
            };

            const scannedXMin = minX * widthRatio;
            const scannedXMax = maxX * widthRatio;
            const scannedYMin = minY * heightRatio;
            const scannedYMax = maxY * heightRatio;

            if (
                scannedXMin > scanArea.left &&
                scannedXMax < scanArea.right &&
                scannedYMin > scanArea.top &&
                scannedYMax < scanArea.bottom
            ) {
                const scannedCode: any = codes[0];
                const scannedValue = scannedCode?.data || scannedCode?.value || "No value found";
                setQrData(scannedValue)
                openQrcode(scannedValue);
            }
        }
    })

    const onRefresh = () => {
        setRefreshing(true);
        setCurrentPage(1);
        setTotalData(null);
        setDatas([]);
        setQrCode(null);
        setEventId("")
        setQrData(null);
        setUniqueCodes([]);
        setRefreshing(false);
        fetchData();
    }

    const format: any = useCameraFormat(device, [
        { fps: 240 },
        { videoResolution: 'max' }
    ])
    const fps = format.maxFps

    // QR Code Validation
    const qrCondition = () => {
        if (qrData !== null) {
            if (qrCode && uniqueCodes.length > 0) {
                // Check if the scanned QR code is in the list of unique codes
                // if (uniqueCodes.includes(qrData)) {
                    const passData = {
                        id: eventId,
                        uuid: qrData
                    };
                    navigation.navigate("cameraPage", { passData, videoDuration });
                    setQrData(null);
                    setQrCode(null);
                    setShowScanner(false);
                // }
            }else{
                fetchQrData()
            }
        }
    };

    // Fetch QR Code Data
    const fetchQrData = useCallback(async () => {
        if (!tokenId || !qrData) return;

        try {
            const response = await customerValidation(qrData, tokenId)

            if (response?.data?.code === 200) {
                setQrCode(qrData);  // Set the QR code if validation is successful
            }
        } catch (error: any) {
            if (error.response?.data?.code === 400) {
                ToastAndroid.show(error.response.data.message, 3000);
            } else if (error.response?.data?.code === 404) {
                ToastAndroid.show(error.response.data.message, 3000);
            } else {
                console.error("API Error: ", error.message);
                ToastAndroid.show("Invalid Customer.", 3000);
            }
        }
    }, [tokenId, qrData]);

    // Fetch Customer Event Data
    const fetchData = async () => {
        if (!totalData) {
            setLoading(true);
            setShowLoader(true);
        } else {
            setIsLoading(true);
        }

        if (tokenId && eventId) {
            fetchCustomerList(eventId, currentPage, tokenId).then((res: any) => {
                if (res.data.code === 200) {
                    if (Array.isArray(res.data.data)) {
                        const uniqueCodes = res.data.data
                            .map((item: any) => item.unique_code)
                            .filter((code: any) => code);
                        const newUsers = res.data.data;
                        const updatedUsers = [...datas, ...newUsers].reduce((acc, current) => {
                            const x = acc.find((item: any) => item.id === current.id); // Use a unique key like 'id'
                            if (!x) {
                                return acc.concat([current]);
                            }
                            return acc;
                        }, []);

                        setDatas(updatedUsers);
                        setUniqueCodes(uniqueCodes);
                        const totalCount = res.data.totalCount
                        setTotalData(totalCount);
                        setIsLoading(false);
                    } else {
                        console.error("Expected an array but got:", res.data);
                        setUniqueCodes([]);
                    }
                }
            }).catch((err: any) => {
                console.log("Api Error : ", err)
            }).finally(() => {
                setLoading(false); // Hide loading indicator
                setShowLoader(false); // Hide loader
            })

        }

    };

    // Get Data from AsyncStorage and Fetch API Data
    const getDatas = async () => {
        try {
            const apiTokenId = await AsyncStorage.getItem('token');
            const apiEventId = await AsyncStorage.getItem('event_Id');
            if (apiTokenId && apiEventId) {
                setTokenId(apiTokenId);
                setEventId(apiEventId);
                await fetchData(); // Fetch data once tokens are set
            }
        } catch (error) {
            console.log('Failed to fetch the data from storage', error);
        }
    };

    // footer loader
    const renderLoader = () => {
        return (
            totalData !== datas.length ? (
                <View className="items-center my-[16px] h-[20px]">
                    {
                        isLoading && !showLoader && <ActivityIndicator size="large" color={loader} />
                    }
                </View>
            ) : null
        );
    };

    // load more Data
    const loadMoreItem = () => {
        setCurrentPage(currentPage + 1);
    };

    const applyMaskFrameStyle = () => ({
        backgroundColor: "#000",
        opacity: 0.5,
        flex: 1,
    });

    useFocusEffect(
        useCallback(() => {
            if (route.params?.refresh) {
                fetchData();
            }
        }, [route.params?.refresh])
    );

    useEffect(() => {
        fetchData();
    }, [currentPage])

    useEffect(() => {
        getDatas();
    }, [tokenId, eventId]);

    useEffect(() => {
        if (qrData) {
            fetchQrData();
        }
    }, [qrData, fetchQrData]);

    const { hasPermission, requestPermission } = useCameraPermission()

    if (device == null) return <ActivityIndicator />

    useEffect(() => {
        if (!hasPermission) {
            requestPermission();
        }
        getDatas();
    }, [hasPermission, tokenId])

    return (

        <View className={`flex-1 bg-[${primary}]`}>

            <StatusBar backgroundColor={primary} barStyle={'light-content'} />

            <Header value={header} search={search} setSearchOption={setSearchOption} searchOption={searchOption} searchList={searchList} qrcode={qrcode} setShowScanner={setShowScanner} showScanner={showScanner} placeholder={searchInputName} />

            {/* Loader */}
            {
                showLoader && (
                    <View style={{ backgroundColor: "rgba(0,0,0,0.3)" }} className="absolute left-0 right-0 top-0 bottom-0 justify-center items-center z-20">
                        <View className={`h-20 w-20 justify-center items-center bg-[${background}]`}>
                            <Loader />
                        </View>
                    </View>
                )
            }

            <View className={`${searchOption ? 'flex-[7]' : 'flex-[9]'} bg-white rounded-t-[30px] p-5`}>
                {
                    datas.length === 0 ? (
                        <View className={`h-full w-full justify-center items-center bg-[${background}]`}>
                            {
                                !showLoader && (
                                    <Image
                                        source={!isLoading && require('../../../../assets/image/icons/NoDataFound.png')}
                                        className="h-[80%] w-[80%]"
                                        resizeMode="contain"
                                    />
                                )
                            }
                        </View>
                    ) : filterData.length === 0 && searchKeyword !== '' ? (
                        <View className={`h-full w-full justify-center items-center mt-3 bg-[${background}] rounded-[30px]`}>
                            {/* Display No Data for search results */}
                            <Text className="text-black font-customssemibold text-lg">No data found</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={filterData.length ? filterData : datas}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) =>
                                <CustomerHelper item={item} setShowScanner={setShowScanner} fetchQrData={fetchQrData} />
                            }
                            keyExtractor={item => item.id}
                            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.loader} />}
                            ListFooterComponent={renderLoader}
                            onEndReached={loadMoreItem}
                            onEndReachedThreshold={0}
                            contentContainerStyle={{ gap: 10 }}
                            className="mt-3"
                        />
                    )
                }
            </View>
            {
                showScanner && (
                    <>
                        <ReanimatedCamera
                            ref={cameraRef}
                            device={device}
                            isActive={true}
                            className="absolute h-[100%] w-[100%]"
                            format={format}
                            fps={fps}
                            video={true}
                            torch={onFlash}
                            codeScanner={codeScanner}
                            animatedProps={animatedProps}
                            onLayout={onLayout}
                        />

                        <GestureDetector gesture={gesture}>
                            <View style={styles.maskOuter}>
                                <View style={[styles.maskRow, applyMaskFrameStyle()]} />
                                <View style={[{ height: 200 }, styles.maskCenter]}>
                                    <View style={applyMaskFrameStyle()} />
                                    <View style={[styles.maskInner, { width: 200, height: 400 }]} />
                                    <View style={applyMaskFrameStyle()} />
                                </View>
                                <View style={[styles.maskRow, applyMaskFrameStyle()]} />
                            </View>
                        </GestureDetector>

                        {/* Flash Toggle */}
                        <View className="absolute bg-[#171628] w-full h-[100px] justify-center items-center bottom-0">
                            <TouchableOpacity
                                onPress={() => setOnFlash((currentVal: any) => (currentVal === 'off' ? 'on' : 'off'))}
                                className="border-[1px] border-white rounded-[10px]"
                            >
                                <Flash name={onFlash === 'off' ? "flash-on" : "flash-off"} color="white" size={30} />
                            </TouchableOpacity>
                        </View>

                        {/* Close Scanner */}
                        <View className="absolute h-[100px] w-full bg-[#171628] justify-center items-end">
                            <TouchableOpacity
                                onPress={() => setShowScanner(false)}
                                className="right-3 border-[1px] h-[30px] w-[30px] justify-center items-center border-white rounded-[10px]"
                            >
                                <Text className="text-white font-customsbold text-[16px]">X</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
        </View>

    );
}

const styles = StyleSheet.create({
    maskOuter: {
        position: "absolute",
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        alignItems: "center",
        justifyContent: "space-around",
    },
    maskInner: {
        backgroundColor: "transparent",
    },
    maskRow: {
        width: "100%",
    },
    maskCenter: {
        display: "flex",
        flexDirection: "row",
    },
})

export default Cameras;