import React from "react";
import {
    View,
    ActivityIndicator
} from 'react-native';
import {Colors} from '../Styles/color'


const loader = () => {

    const { loader } = Colors // get color component value

    return(
        <View className="flex-1 justify-center items-center bg-transparent">
            <ActivityIndicator size="large" color={loader} className="bg-transparent"/>
        </View>
    );
};

export default loader;