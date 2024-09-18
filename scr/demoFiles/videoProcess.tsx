import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, FlatList, TextInput, ScrollView, Modal, Keyboard } from 'react-native';

const cartIcon = require("C:/Users/Yogesh/Desktop/project/Yummy/Icons/cart.png");

const rice = { uri: 'https://thumbs.dreamstime.com/b/delicious-spicy-chicken-fried-rice-homemade-cast-iron-wok-94297571.jpg' };
const noodles = { uri: 'https://i.pinimg.com/736x/36/de/e7/36dee7c9799efe8ac6fb8db9e297df66.jpg' };
const shawarma = { uri: 'https://thumbs.dreamstime.com/b/chicken-shawarma-wrap-cut-half-showing-filling-created-generative-ai-303373041.jpg' };
const briyani = { uri: 'https://vismaifood.com/storage/app/uploads/public/914/f47/fa9/thumb__700_0_0_0_auto.jpg' };
const roast = { uri: 'https://www.inspiredtaste.net/wp-content/uploads/2017/10/Roasted-Chicken-with-Lemon-Recipe-1200.jpg' };

const NonVeg = () => {
    const [food, setFood] = useState([
        { "id": 1, "Name": "Chicken Rice", "Price": 100, quantity: 1 },
        { "id": 2, "Name": "Chicken Noodles", "Price": 100, quantity: 1 },
        { "id": 3, "Name": "Chicken Shawarma", "Price": 80, quantity: 1 },
        { "id": 4, "Name": "Chicken Biryani", "Price": 120, quantity: 1 },
        { "id": 5, "Name": "Roast Chicken", "Price": 150, quantity: 1 }
    ]);
    const [filterFood, setFilterFood] = useState(food);
    const [cartItems, setCartItems] = useState([]);

    const [menus, setMenus] = useState(false);

    const toggleMenu = () => {
        setMenus(!menus)
    }


    const getImage = (id) => {
        if (id == 1) return rice;
        if (id == 2) return noodles;
        if (id == 3) return shawarma;
        if (id == 4) return briyani;
        if (id == 5) return roast;
    };

    const searchFood = (keyword) => {
        const lowerCasekeyboard = keyword.toLowerCase();

        const result = food.filter(food => {
            return food.name.toLowerCase().includes(lowerCasekeyboard)
        })

        setFilterFood(result)
    }

    const addToCart = (item) => {
        const newCart = [...cartItems, item];
        setCartItems(newCart);
        CalculateAmount(newCart);
    };

    const increaseItem = (index) => {
        const newCart = [...cartItems];
        newCart[index].quantity += 1;
        setCartItems(newCart);
        CalculateAmount(newCart);
    };

    const decreaseItem = (index) => {
        const newCart = [...cartItems];
        if (newCart[index].quantity > 1) {
            newCart[index].quantity -= 1;
            setCartItems(newCart);
            CalculateAmount(newCart);
        }
    };


    const removeToCart = (productId) => {
        const updateCart = cartItems.filter((item) => item.id !== productId);
        setCartItems(updateCart);
        CalculateAmount(updateCart)
    };

    const [totalAmount, setTotalAmount] = useState(0);

    const CalculateAmount = (cart) => {
        let total = 0;
        cart.forEach((item) => {
            total += item.Price * item.quantity;
        });
        setTotalAmount(total);
    };

    const message = () => {
        return Alert.alert("Bill Amount", "Your Order Is Successfully Completed...")
    }

    const renderCartItem = ({ item, index }) => (
        <View style={styles.ModalBody}>

            <View style={styles.modelInfoView}>
                <Text style={styles.ModalTxt}>{item.Name}</Text>
            </View>


            <View style={styles.IncDecView}>

                <Text style={styles.ModalTxt}>1  Plate  Rs.<Text style={{ color: '#FD0D1A' }}>{item.Price * item.quantity}</Text></Text>
                <TouchableOpacity style={styles.decBtn} onPress={() => decreaseItem(index)}>
                    <Text style={styles.incdecTxt}>-</Text>
                </TouchableOpacity>

                <Text style={styles.qtyTxt}>{item.quantity}</Text>

                <TouchableOpacity style={styles.incBtn} onPress={() => increaseItem(index)}>
                    <Text style={styles.incdecTxt}>+</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.removeBtn} onPress={() => removeToCart(item.id)}>
                <Text style={styles.ModalRemoveTxt}>Remove From Cart</Text>
            </TouchableOpacity>
        </View>
    );


    return (
        <SafeAreaView style={styles.safearea}>
            <View style={styles.body}>

                <View style={styles.searchBody}>
                    <View style={styles.searchView}>
                        <TextInput
                            style={styles.searchbar}
                            placeholder='Search....'
                            onChangeText={(text) => searchFood(text)}
                            placeholderTextColor={'black'}
                        />

                        <View style={styles.searchImgView}>
                            <Image
                                style={styles.searchImg}
                                resizeMode='contain'
                                source={require('C:/Users/Yogesh/Desktop/project/Yummy/Icons/search.png')}
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.listView}>

                    <View style={styles.headcart}>
                        <Text style={styles.heading}>Select Your Food</Text>

                        <TouchableOpacity style={{
                            width: 60,
                            justifyContent: 'center',
                            flexDirection: 'row'
                        }}
                            onPress={toggleMenu}
                        >
                            <Image style={{
                                alignItems: 'center',
                                width: 30,
                                height: 40,
                                left: 50
                            }}
                                resizeMode='contain'
                                source={cartIcon}
                            />

                            <Text style={{
                                color: 'blue',
                                fontSize: 30,
                                left: 50,
                                fontWeight: 'bold'
                            }}
                            >Cart
                            </Text>
                        </TouchableOpacity>

                    </View>



                    <Modal animationType='slide'
                        visible={menus}
                        onRequestClose={() => setMenus(false)}
                        transparent={true}>
                        <View style={styles.modalMainBody}>
                            <Text style={styles.cartHeading}>My Cart</Text>

                            <TouchableOpacity onPress={toggleMenu} style={styles.clsBtn}>
                                <Text style={styles.closeBtnTxt}>X</Text>
                            </TouchableOpacity>

                            <FlatList
                                data={cartItems}
                                keyExtractor={(item) => item.id}
                                renderItem={renderCartItem}
                            />

                            <View style={styles.totalView}>
                                <Text style={styles.totalTxt}>Total</Text>
                                <Text style={styles.totalAmount}>Totals  :  Rs.<Text style={{ color: 'green' }}>{totalAmount}</Text></Text>
                            </View>

                            <TouchableOpacity style={styles.checkbtn} onPress={message}>
                                <Text style={styles.checkbtnTxt}>Bills</Text>
                            </TouchableOpacity>
                        </View>
                    </Modal>




                    <ScrollView style={styles.scrollsection}>
                        {
                            filterFood.map((food) => {
                                return (
                                    <View style={styles.infoArea} key={food.id}>
                                        <View style={styles.infoView}>
                                            <Text style={styles.infoName}>{food.Name}</Text>
                                            <Text style={styles.infoPrice}>
                                                <Text style={styles.infoSubPrice}>1 Plate  Rs:</Text>{food.Price}
                                            </Text>

                                            <View style={styles.imgView}>
                                                <Image style={styles.foodImg}
                                                    resizeMode='contain'
                                                    source={getImage(food.id)}
                                                />
                                                <TouchableOpacity style={styles.btnAdd} onPress={() => addToCart(food)}>
                                                    <Text style={styles.btnAddTxt}>Add to cart</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })
                        }
                    </ScrollView>
                </View>

            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safearea: {
        flex: 1,
        justifyContent: 'center'
    },

    body: {
        height: '100%',
        backgroundColor: 'white'
    },

    searchBody: {
        marginTop: 15,
        paddingLeft: 15,
        paddingRight: 15,
        justifyContent: 'center',
        shadowColor: 'black',
        elevation: 15,
        shadowOpacity: 20,
        shadowRadius: 30,
        borderBlockStartColor: 'black',
        borderBlockBottomColor: 'black'
    },

    searchView: {
        paddingLeft: 10,
        paddingRight: 10,
        flexDirection: 'row',
        width: '100%',
        height: 40,
        backgroundColor: 'white',
        borderRadius: 8,
        shadowColor: 'black',
        elevation: 20,
        shadowOpacity: 10,
        shadowRadius: 30
    },

    searchbar: {
        width: 245,
        height: 40,
        backgroundColor: 'white',
        color: 'black'
    },

    searchImgView: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 30,
        height: 30,
        top: 5
    },

    searchImg: {
        width: 24,
        height: 28,
        marginRight: -90
    },

    listView: {
        marginTop: 10,
        backgroundColor: 'white'
    },

    headcart: {
        flexDirection: 'row',
    },

    heading: {
        fontSize: 30,
        fontWeight: 'bold',
        color: 'black',
        backgroundColor: 'white'
    },

    cartHeading: {
        fontSize: 50,
        color: 'black',
        textAlign: 'left',
        top: 30,
        fontWeight: 'bold'
    },

    clsBtn: {
        bottom: 20,
        width: 40,
        left: '85%',
    },

    closeBtnTxt: {
        fontSize: 30,
        color: 'white',
        backgroundColor: 'red',
        fontWeight: 'bold',
        justifyContent: 'center',
        textAlign: 'center'
    },

    modalMainBody: {
        position: 'absolute',
        backgroundColor: 'white',
        width: '100%',
        height: '100%'
    },

    ModalBody: {
        backgroundColor: 'silver',
        marginBottom: 10,
        height: 150,
        borderRadius: 20,
        justifyContent: 'center'
    },

    modelInfoView: {
        flexDirection: 'row'
    },

    ModalTxt: {
        color: 'black',
        textAlign: 'center',
        fontSize: 25,
        marginLeft: 10,
        fontWeight: 'bold'
    },

    IncDecView: {
        flexDirection: 'row',
        marginLeft: 15,
        alignSelf: 'center'
    },

    incBtn: {
        backgroundColor: '#0D33FD',
        width: 40,
        height: 40,
        alignSelf: 'center',
        borderRadius: 40,
    },

    decBtn: {
        backgroundColor: '#0D33FD',
        width: 40,
        height: 40,
        alignSelf: 'center',
        borderRadius: 40,
    },

    incdecTxt: {
        color: 'black',
        fontSize: 30,
        textAlign: 'center'
    },

    qtyTxt: {
        color: 'black',
        alignSelf: 'center',
        textAlign: 'center',
        fontSize: 30,
        fontWeight: 'bold'
    },

    removeBtn: {
        borderRadius: 70,
        height: 30,
        justifyContent: 'center',
        backgroundColor: 'yellow',
        marginTop: 10
    },

    ModalRemoveTxt: {
        color: 'black',
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
    },

    totalView: {
        height: 100,
        backgroundColor: 'white',
        flexDirection: 'row',
        justifyContent: 'space-between',
        top: 30
    },

    totalTxt: {
        fontSize: 25,
        textAlign: 'center',
        textDecorationLine: 'underline',
        color: 'black',
        fontWeight: 'bold',
    },

    totalAmount: {
        fontWeight: 'bold',
        color: 'black',
        fontSize: 25,
        marginRight: 20
    },

    checkbtn: {
        backgroundColor: 'green',
        height: 50,
        bottom: 30,
        alignItems: 'center',
        borderRadius: 50
    },

    checkbtnTxt: {
        color: 'white',
        justifyContent: 'center',
        fontSize: 35,
        fontWeight: 'bold'
    },

    cartIcon: {
        width: 60,
        height: 50,
        borderRadius: 50,
        marginLeft: '39%'
    },

    scrollsection: {
        marginLeft: -15,
        height: 620,
        width: '105%',
        paddingLeft: 15,
    },

    infoArea: {
        height: 150,
        padding: 15,
        borderRadius: 30,
        marginBottom: 13,
        flexDirection: 'row',
        shadowColor: 'black',
        shadowRadius: 50,
        elevation: 10,
        shadowOpacity: 5,
        backgroundColor: 'silver'
    },

    infoView: {
        flex: 1,
    },

    infoName: {
        color: 'black',
        fontSize: 20,
        top: 10,
        marginLeft: 20,
        fontWeight: 'bold'
    },

    infoPrice: {
        color: '#FD0D1A',
        top: 20,
        fontWeight: 'bold',
        marginLeft: 20,
        fontSize: 20
    },

    infoSubPrice: {
        color: 'black',
    },

    imgView: {
        flex: 1,
        bottom: 50,
    },

    foodImg: {
        position: 'absolute',
        height: '140%',
        width: '160%',
        borderRadius: 30,
    },

    btnAdd: {
        position: 'absolute',
        backgroundColor: 'yellow',
        height: 30,
        borderRadius: 50,
        alignItems: 'center',
        top: 80,
        width: '100%'
    },

    btnAddTxt: {
        textAlign: 'center',
        color: 'black',
        fontSize: 20,
        fontWeight: 'bold',
        alignItems: 'center'
    },
});

export default NonVeg;