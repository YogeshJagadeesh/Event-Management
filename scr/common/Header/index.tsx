import { useNavigation } from "@react-navigation/native";
import React, {useState} from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    TextInput
} from "react-native";
import { Colors } from '../Styles/color'

import Icon from "react-native-vector-icons/MaterialIcons"

const header = ({ value, search, qrcode, setShowScanner, showScanner, setSearchOption, searchOption, searchList, placeholder }: any) => {
    const navigation = useNavigation();
    
    const [searchText, setSearchText] = useState<string>("");

    const handleClearSearch = () => {
        setSearchText("");           // Clear the input value
        searchList("");              // Reset the search result
        setSearchOption(false);      // Optionally close the search bar
    };

    return (
        <View className={`flex-1 items-center justify-center bg-[${Colors.primary}]`}>
            <View className="w-full flex-row justify-center items-center p-[5px]">
                {
                    searchOption ? (
                        <View className="h-[40px] w-full rounded-[10px] flex-row items-center justify-between ml-[10px]">
                            <View className="h-[40px] w-[84%] rounded-[10px] justify-between flex-row bg-white shadow-md shadow-black">
                                <TextInput 
                                    placeholder={placeholder}
                                    cursorColor={'#171628'}
                                    value={searchText}
                                    onChangeText={(txt: any) => {
                                        searchList(txt); 
                                        setSearchText(txt);
                                    }} 
                                    placeholderTextColor={"#7D7C7C"} 
                                    className="ml-3 text-black font-customssemibold w-[85%] text-[12px]" 
                                />
                                <TouchableOpacity className="justify-center items-center mr-3" onPress={handleClearSearch}>
                                    <Text className="text-black font-customsbold">X</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity onPress={() => setSearchOption(!searchOption)} className="h-[40] w-[15%] justify-center items-center">
                                <Image
                                    source={search}
                                    className="w-[25px] h-[25px]"
                                />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <TouchableOpacity className="w-[20%] " onPress={() => navigation.goBack()}>
                                <Icon name="arrow-back" size={25} color={"#ffffff"} />
                            </TouchableOpacity>

                            <View className="w-[60%]">
                                <Text className={`text-[${Colors.text}] text-center text-[15px] font-customsbold`}>{value}</Text>
                            </View>

                            <View className="w-[20%] justify-around items-center flex-row">
                                <TouchableOpacity onPress={() => setShowScanner(!showScanner)}>
                                    <Image
                                        tintColor={'white'}
                                        source={qrcode}
                                        className="w-[25px] h-[25px] rounded-[10px]"
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setSearchOption(!searchOption)}>
                                    <Image
                                        source={search}
                                        className="w-[25px] h-[25px]"
                                    />
                                </TouchableOpacity>
                            </View>
                        </>
                    )
                }


            </View>
        </View>
    );
}

export default header;