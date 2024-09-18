import React, { useEffect, useState } from "react";
import { View, FlatList, ActivityIndicator, StatusBar, Image, Text } from "react-native";
import { Colors } from '../../../common/Styles/color';
import AsyncStorage from "@react-native-async-storage/async-storage";

import Header from "../../../common/Header/index";
import Loader from "../../../common/Loader/index";
import List from "../eventListScreen/eventListHelper";
import { RefreshControl } from "react-native-gesture-handler";

import { fetchEventsList } from "./helperApi";

const search = require("../../../../assets/image/icons/search.png");

const App = () => {
    const eventList = "Event List";
    const searchInputName = "Search event name";

    const { background, loader, primary } = Colors

    const [tokenId, setTokenId] = useState<string>('');

    //loader
    const [loading, setLoading] = useState<boolean>(false); // loading indicator
    const [showLoader, setShowLoader] = useState<boolean>(false); // loader visibility
    const [isLoading, setIsLoading] = useState<boolean>(false);// footerLoader
    const [refreshing, setRefreshing] = useState<boolean>(false);// Refreshing

    const [users, setUsers] = useState<any>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalData, setTotalData] = useState<any>(null);
    const [searchOption, setSearchOption] = useState<boolean>(false);
    const [filterData, setFilterData] = useState<any>(users);
    const [searchKeyword, setSearchKeyword] = useState<string>('');

    //search function
    const searchList = (keyword: any) => {
        setSearchKeyword(keyword)
        const lowerCasekeyboard = keyword.toLowerCase();
        const result = users.filter((data: any) => {
            return data.eventName.toLowerCase().includes(lowerCasekeyboard)
        })
        setFilterData(result);
    }

    const onRefresh = () => {
        setRefreshing(true);
        setCurrentPage(0);
        setTotalData(null);
        setUsers([]); // Clear existing data
        getUsers();
        setRefreshing(false);
    };

    const getUsers = () => {
        if (!totalData) {
            setLoading(true);
            setShowLoader(true);
        } else {
            setIsLoading(true);
        }

        //api call
        fetchEventsList(currentPage, tokenId)
            .then(res => {
                if (res.data.code === 200) {
                    const newUsers = res.data.data;
                    const updatedUsers = [...users, ...newUsers].reduce((acc, current) => {
                        const x = acc.find((item: any) => item.id === current.id); // Use a unique key like 'id'
                        if (!x) {
                            return acc.concat([current]);
                        }
                        return acc;
                    }, []);

                    setUsers(updatedUsers);
                    const totalCount = res.data.totalCount
                    setTotalData(totalCount);

                    setIsLoading(false);
                }
            }).catch((err) => {
                console.log(err)
            }).finally(() => {
                setLoading(false); // Hide loading indicator
                setShowLoader(false); // Hide loader
            })
    };

    const renderLoader = () => {
        return (
            totalData !== users.length ? (
                <View className="items-center my-[16px] h-[20px]">
                    {
                        isLoading && !showLoader && <ActivityIndicator size="large" color={loader} />
                    }
                </View>
            ) : null
        );
    };

    const loadMoreItem = () => {
        setCurrentPage(currentPage + 1);
    };

    useEffect(() => {
        getUsers();
    }, [currentPage, tokenId]);


    useEffect(() => {
        const getDatas = async () => {
            try {
                const apiValue = await AsyncStorage.getItem('token');
                if (apiValue) {
                    setTokenId(apiValue);
                }
            } catch (error) {
                console.log('Failed to fetch the data from storage', error);
            }
        };

        getDatas();
    }, []);

    return (
        <View className={`flex-1 bg-[${primary}]`}>
            <StatusBar backgroundColor={primary} barStyle={'light-content'} />

            <Header value={eventList} search={search} setSearchOption={setSearchOption} searchOption={searchOption} searchList={searchList} placeholder={searchInputName}/>

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

            <View style={{ flex: searchOption ? 7 : 9, backgroundColor: background, borderTopEndRadius: 30, borderTopStartRadius: 30, padding: 10 }}>
                {
                    users.length === 0 ? (
                        <View className={`h-full w-full justify-center items-center bg-[${background}]`}>
                            {
                                !showLoader && !users && (
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
                            data={filterData.length ? filterData : users}
                            renderItem={({ item, index }) => (
                                <List item={item} />
                            )}
                            showsVerticalScrollIndicator={false}
                            keyExtractor={item => item.email}
                            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={loader} />}
                            ListFooterComponent={renderLoader}
                            onEndReached={loadMoreItem}
                            onEndReachedThreshold={0}
                            contentContainerStyle={{ gap: 10 }}
                            className="mt-3"
                        />

                    )
                }
            </View>
        </View>
    );
};

export default App;