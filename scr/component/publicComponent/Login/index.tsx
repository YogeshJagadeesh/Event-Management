import React, { useState, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StatusBar,
    Image,
    ToastAndroid,
    ScrollView,
    Modal
} from "react-native";
import { Colors } from '../../../common/Styles/color';

import User from "react-native-vector-icons/FontAwesome";
import EyeIcon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { fetchLogin } from "./helperAPi";
import Loader from "../../../common/Loader/index";

const img = require('../../../../assets/image/login/login.png');
const back = require('../../../../assets/image/icons/Back.png');
const logo = require('../../../../assets/image/pvkLogos/PoorvikaaLogo.png')

const Login = () => {
    const { primary, secondary, background, text, error, placeholder } = Colors // get color component value

    const navigation = useNavigation();

    const input1Ref = useRef<TextInput | null>(null);
    const input2Ref = useRef<TextInput | null>(null);

    const [loading, setLoading] = useState(false); // loading indicator
    const [showLoader, setShowLoader] = useState(false); // loader visibility

    const [userMail, setUserMail] = useState<string>("");
    const [userPassword, setUserPassword] = useState<string>("");
    const [secureTextEntry, setSecureTextEntry] = useState<boolean>(true);

    const [errorMessage, setErrorMessage] = useState('');
    const [showError, setShowError] = useState(false);
    const [errorPassword, setErrorPassword] = useState('');

    // forget password state
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [forgetPassword, setForgetPassword] = useState<string>("");

    // forget logic
    const forget = () => {
        if(forgetPassword){
            console.warn("forget password")
        }else{
            ToastAndroid.show("Enter Email or Mobile number",ToastAndroid.SHORT)
        }
    }

    const validateEmail = (userMail: any) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(userMail);
    };

    const handleEmailChange = (email: any) => {
        setUserMail(email);
        setShowError(false);
    };

    const checkCondition = () => {

        setShowError(true);
        let valid = true;

        if (userMail === "" || userPassword === "") {

            if (!userMail) {
                setErrorMessage('email is required');
                valid = false;
            } else if (!validateEmail(userMail)) {
                setErrorMessage('email is invalid');
                valid = false;
            } else {
                setErrorMessage('');
            }

            if (!userPassword) {
                setErrorPassword('password is required');
                valid = false;
            } else {
                setErrorPassword('');
            }

        } else {
            handleLogin();
        }

        if (!valid) return;
    }

    const handleLogin = async () => {

        const formData: any = {
            email: userMail,
            password: userPassword
        }

        setLoading(true); // Show loading indicator
        setShowLoader(true); // Show loader with delay

        const loaderTimeout = setTimeout(() => {
            if (!loading) {
                setShowLoader(false); // Hide loader if login is fast
            }
        }, 5000);

        try {
            const response = await fetchLogin(formData);
            if (response.status === 200) {
                const data: any = response.data.data;
                const name: string = data.name;
                const tokenId: string = data.tokenAccess;
                setUserMail("");
                setUserPassword("");
                setErrorMessage("");
                setErrorPassword("");
                setShowError(false)
                await saveStorage(name, tokenId);
                navigation.navigate("Home");
            }
        } catch (error: any) {
            if (error.response?.status === 401) {
                ToastAndroid.show(error.response.data.message, ToastAndroid.SHORT);
            } else {
                ToastAndroid.show('An unexpected error occurred', ToastAndroid.SHORT);
            }
        } finally {
            clearTimeout(loaderTimeout); // Clear the loader timeout
            setLoading(false); // Hide loading indicator
            setShowLoader(false); // Hide loader
        }
    };

    const saveStorage = async (name: string, token: string) => {
        try {
            await AsyncStorage.setItem('name', name)
            await AsyncStorage.setItem('token', token)
        } catch (error: any) {
            console.log(error)
        }
    }

    return (
        <View className="flex-1">
            <StatusBar backgroundColor={primary} barStyle={'light-content'} />

            <Image
                source={require('../../../../assets/image/login/logins.png')}
                className="absolute h-full w-full"
            />

            {/* loader */}
            {
                showLoader && (
                    <View style={{ backgroundColor: "rgba(0,0,0,0.3)" }} className="absolute left-0 right-0 top-0 bottom-0 justify-center items-center z-20">
                        <View className={`h-20 w-20 justify-center items-center bg-[#fff]`}>
                            <Loader />
                        </View>
                    </View>
                )
            }

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                <View className={`flex-1 bg-[${primary}] justify-center items-center rounded-br-[30px] rounded-bl-[30px]`}>
                    <Image
                        source={img}
                        resizeMode="contain"
                        className="flex-2 bottom-5 w-fit h-fit"
                    />
                    <Text className={`text-[${text}] text-xl bottom-1 font-customsbold`}>Event organization</Text>
                </View>

                <View className="p-5 flex-1">
                    <Text className={`text-[${secondary}] font-customssemibold text-[14] mt-5`}>Let's Get You Logged In...</Text>

                    <View className="mt-5">
                        <Text className="text-[#454450] text-sm font-customssemibold leading-4">Email Id</Text>
                        <View className={`rounded w-full h-10 flex-row mt-3 items-center justify-center ${(showError && !validateEmail(userMail)) || (showError && !userMail) ? 'border-red-600 border' : 'border-[#171628] border-0.5'}`}>
                            <TextInput
                                ref={input1Ref}
                                returnKeyType="next"
                                blurOnSubmit={false}
                                onSubmitEditing={() => input2Ref.current?.focus()}
                                value={userMail}
                                keyboardType="email-address"
                                placeholder="enter email id"
                                cursorColor={'#171628'}
                                placeholderTextColor={placeholder}
                                onChangeText={handleEmailChange}
                                className={`w-5/6 h-full rounded-xl text-black text-[13] ${userMail === '' ? 'font-customsregular' : 'font-customssemibold'}`}
                            />
                            <View className="w-10 h-full justify-center items-center">
                                <User name="user" size={20} color="#171628" />
                            </View>
                        </View>

                        {showError && !validateEmail(userMail) && errorMessage ? <Text className={`text-[14px] font-customsregular`} style={{color:error}}>{errorMessage}</Text> : null}
                    </View>

                    <View className="mt-5">
                        <Text className="text-[#454450] text-sm font-customssemibold leading-4">Password</Text>
                        <View className={`rounded w-full h-10 flex-row mt-3 items-center justify-center ${errorPassword && !userPassword ? 'border-red-600 border' : 'border-[#171628] border-0.5'}`}>
                            <TextInput
                                ref={input2Ref}
                                returnKeyType="done"
                                blurOnSubmit={false}
                                onSubmitEditing={handleLogin}
                                secureTextEntry={secureTextEntry}
                                value={userPassword}
                                placeholder="enter password"
                                cursorColor={'#171628'}
                                placeholderTextColor={placeholder}
                                onChangeText={(txt) => {
                                    setUserPassword(txt);
                                    if (!txt) {
                                        setErrorPassword('password is required');
                                    } else {
                                        setErrorPassword('');
                                    }
                                }}
                                className={`w-5/6 h-full rounded-xl text-black text-[13] ${userPassword === '' ? 'font-customsregular' : 'font-customssemibold'}`}
                            />
                            <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)} className="w-10 h-full justify-center items-center">
                                <EyeIcon name={secureTextEntry ? "eye-off" : "eye"} size={20} color="#171628" />
                            </TouchableOpacity>
                        </View>

                        <View className={`${errorPassword ? 'justify-between' : 'justify-end'} flex-row w-full`}>
                            {errorPassword ?
                                (<Text className={`text-[14px] font-customsregular`} style={{color:error}}>password is required</Text>) : ('')
                            }

                            <TouchableOpacity className="mt-2" onPress={()=>setOpenModal(!openModal)}>
                                <Text className="text-black font-customsbold underline">Forgot Password?</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="justify-center items-center h-[30%] mt-4">
                        <TouchableOpacity onPress={checkCondition} className={`bg-[#372168] h-[43px] w-[200px] justify-center items-center rounded-xl border-[0.5]`}>
                            <Text className={`text-[${text}] text-lg font-customsbold items-center`}>Log In</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* open modal */}
            {/* forget design */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={openModal}
                onRequestClose={()=>{
                    setOpenModal(!openModal)
                }}
            >
                <View className="bg-white h-[100%] w-[100%] items-center">
                    <TouchableOpacity className="h-[40px] w-full mt-[30px] ml-[30px]" onPress={()=>setOpenModal(!openModal)}>
                        <Image
                            source={back}
                            className="w-[40px] h-[40px]"
                            tintColor={"black"}
                        />
                    </TouchableOpacity>

                    <View className="mt-[6%] justify-center items-center h-[100px] w-full">
                        <Image
                            source={logo}
                            className="h-[100px] w-[100px]"
                        />
                    </View>

                    <View className="justify-center items-center mt-[10px]">
                        <Text className="text-black font-customsbold text-[16px]">Forget Password</Text>
                    </View>

                    <View className="h-[60px] w-[90%] flex-row justify-center items-center mt-[50px] rounded-[20px] border-black border-[1px]">
                        <View className="w-[15%] h-full justify-center items-center">
                            <User name="user" size={24} color={"black"}/>
                        </View>

                        <View className="w-[85%] h-full justify-center items-center">
                            <TextInput 
                                placeholder="Email/Mobile number" 
                                placeholderTextColor={placeholder} 
                                className="w-full h-full rounded-[20px] font-customsbold text-[14px] text-black"
                                cursorColor={'#171628'}
                                onChangeText={(txt:any)=>{
                                    setForgetPassword(txt);
                                }}
                            />
                        </View>
                    </View>

                    <View className="mt-[10%]">
                        <TouchableOpacity onPress={forget} className={`bg-[#372168] h-[43px] w-[200px] justify-center items-center rounded-xl border-[0.5]`}>
                            <Text className={`text-[${text}] text-lg font-customsbold items-center`}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default Login;

