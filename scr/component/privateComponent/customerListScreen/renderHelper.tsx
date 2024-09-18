import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity
} from "react-native";
import { Colors } from "../../../common/Styles/color";

import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";

const customerHelper = ({ item, setShowScanner, fetchQrData }: any) => {

    const [date, setDate] = useState<any>(item.createdAt);
    const [eventName, setEventName] = useState<string>("");

    //formate date
    const formatDate = (date: any) => {
        return date ? moment(date).format('ddd, MMM DD') : '';
    };

    const getData = async () => {
        try {
            const apiValue = await AsyncStorage.getItem('eventName');
            if (apiValue) {
                setEventName(apiValue);
            }
        } catch (error) {
            console.log('Failed to fetch the data from storage');
        }
    }


    useEffect(() => {
        getData();
    }, []);

    return (
        <View className={`h-fit w-full shadow-md bg-white shadow-black rounded-[10px] justify-center items-center`}>

            <TouchableOpacity style={{ elevation: 4 }} className={`rounded-lg bg-white p-[10px] w-[99%]`} onPress={() => [setShowScanner(true), fetchQrData]}>

                <View className="flex-row justify-between">
                    <Text className={`text-[${Colors.secondary}] text-[16px] font-customssemibold`}>{formatDate(date)}</Text>
                    <Text className={`text-[${Colors.secondary}] text-[16px] font-customsbold`}>Tokan no: {item.queue}</Text>
                </View>

                <View>
                    <Text className="text-[#120D26] font-customsbold text-[14px]">Name: <Text className={`text-[${Colors.secondary}] font-customssemibold`}>{item.name}</Text></Text>
                    <Text className="text-[#120D26] font-customsbold text-[14px]">Event: <Text className={`text-[${Colors.secondary}] font-customssemibold`}>{eventName}</Text></Text>
                    <Text className="text-[#120D26] font-customsbold text-[14px]">Location: <Text className={`text-[${Colors.secondary}] font-customssemibold`}>{item.place}</Text></Text>
                </View>

            </TouchableOpacity>

        </View>
    );
}

export default customerHelper;