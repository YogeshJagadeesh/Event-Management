import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

const CustomDropdown = ({ data, value, onChange, placeholder, renderItem, labelField, ValueField }: any) => {

    return (
        <Dropdown
            style={{ justifyContent: 'center', alignItems: 'center', marginRight: 10 }}
            data={data}
            labelField={labelField}
            valueField={ValueField}
            placeholder={placeholder}
            placeholderStyle={{ left: 10, fontFamily: 'Manrope-Regular.ttf', color: '#7D7C7C' }}
            selectedTextStyle={{ color: 'black', marginLeft: 10, fontFamily: 'Manrope-SemiBold.ttf' }}
            iconColor="black"
            activeColor="silver"
            iconStyle={{ width: 30 }}
            value={value}
            onChange={onChange}
            renderItem={renderItem}
        />
    );
};

export default CustomDropdown;
