import React, { useState } from "react";

import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Image,
    ActivityIndicator,
} from "react-native";

import * as ImagePicker from "expo-image-picker";


// =====================================================
// RENDER BACKEND
// =====================================================

const SERVER_URL = "https://helper-buddy.onrender.com";


// =====================================================
// SCREEN
// =====================================================

export default function HelperRegisterScreen({
    navigation,
    route,
}) {

    const params = route?.params || {};

    const user = params.user || null;
    const token = params.token || null;


    // =====================================================
    // USER ID
    // =====================================================

    const userId =
        user?.id ||
        user?._id ||
        user?.userId ||
        null;


    // =====================================================
    // STATE
    // =====================================================

    const [name, setName] = useState(
        user?.name || ""
    );

    const [profession, setProfession] = useState("");

    const [city, setCity] = useState("");

    const [phone, setPhone] = useState("");

    const [experience, setExperience] = useState("");

    const [description, setDescription] = useState("");

    const [photo, setPhoto] = useState(null);

    const [loading, setLoading] = useState(false);


    // =====================================================
    // PICK PHOTO FROM GALLERY
    // =====================================================

    const pickPhoto = async () => {

        try {

            const permission =
                await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permission.granted) {

                Alert.alert(
                    "Permission Required",
                    "Please allow LocalHelper to access your photos."
                );

                return;
            }


            const result =
                await ImagePicker.launchImageLibraryAsync({

                    mediaTypes: ["images"],

                    allowsEditing: true,

                    aspect: [1, 1],

                    quality: 0.7,

                });


            if (
                !result.canceled &&
                result.assets &&
                result.assets.length > 0
            ) {

                setPhoto(result.assets[0]);

            }

        } catch (error) {

            console.log(
                "GALLERY ERROR:",
                error
            );

            Alert.alert(
                "Error",
                error?.message ||
                "Could not open gallery."
            );

        }

    };


    // =====================================================
    // TAKE PHOTO
    // =====================================================

    const takePhoto = async () => {

        try {

            const permission =
                await ImagePicker.requestCameraPermissionsAsync();

            if (!permission.granted) {

                Alert.alert(
                    "Permission Required",
                    "Please allow LocalHelper to use your camera."
                );

                return;
            }


            const result =
                await ImagePicker.launchCameraAsync({

                    allowsEditing: true,

                    aspect: [1, 1],

                    quality: 0.7,

                });


            if (
                !result.canceled &&
                result.assets &&
                result.assets.length > 0
            ) {

                setPhoto(result.assets[0]);

            }

        } catch (error) {

            console.log(
                "CAMERA ERROR:",
                error
            );

            Alert.alert(
                "Error",
                error?.message ||
                "Could not open camera."
            );

        }

    };


    // =====================================================
    // PHOTO MENU
    // =====================================================

    const choosePhoto = () => {

        Alert.alert(
            "Profile Photo",
            "Choose an option",

            [
                {
                    text: "Gallery",
                    onPress: pickPhoto,
                },

                {
                    text: "Camera",
                    onPress: takePhoto,
                },

                {
                    text: "Cancel",
                    style: "cancel",
                },
            ]
        );

    };


    // =====================================================
    // CREATE HELPER PROFILE
    // =====================================================

    const createProfile = async () => {

        // =================================================
        // USER CHECK
        // =================================================

        if (!userId) {

            Alert.alert(
                "Login Error",
                "User information is missing. Please logout and login again."
            );

            return;
        }


        // =================================================
        // VALIDATION
        // =================================================

        if (!name.trim()) {

            Alert.alert(
                "Missing Information",
                "Please enter your name."
            );

            return;
        }


        if (!profession.trim()) {

            Alert.alert(
                "Missing Information",
                "Please enter your profession."
            );

            return;
        }


        if (!city.trim()) {

            Alert.alert(
                "Missing Information",
                "Please enter your city."
            );

            return;
        }


        if (!phone.trim()) {

            Alert.alert(
                "Missing Information",
                "Please enter your phone number."
            );

            return;
        }


        if (!experience.trim()) {

            Alert.alert(
                "Missing Information",
                "Please enter your experience."
            );

            return;
        }


        if (!photo?.uri) {

            Alert.alert(
                "Profile Photo Required",
                "Please add a profile photo."
            );

            return;
        }


        // =================================================
        // START
        // =================================================

        try {

            setLoading(true);


            console.log(
                "================================"
            );

            console.log(
                "CREATING HELPER PROFILE"
            );

            console.log(
                "SERVER:",
                SERVER_URL
            );

            console.log(
                "USER ID:",
                userId
            );

            console.log(
                "PHOTO URI:",
                photo.uri
            );


            // =================================================
            // CREATE FORMDATA
            // =================================================

            const formData = new FormData();


            formData.append(
                "userId",
                String(userId)
            );


            formData.append(
                "name",
                name.trim()
            );


            formData.append(
                "profession",
                profession.trim()
            );


            formData.append(
                "city",
                city.trim()
            );


            formData.append(
                "phone",
                phone.trim()
            );


            formData.append(
                "experience",
                experience.trim()
            );


            formData.append(
                "description",
                description.trim()
            );


            // =================================================
            // PHOTO
            // =================================================

            const uri = photo.uri;


            const extension =
                uri
                    .split(".")
                    .pop()
                    ?.split("?")[0]
                    ?.toLowerCase() || "jpg";


            let mimeType = "image/jpeg";


            if (extension === "png") {

                mimeType = "image/png";

            } else if (extension === "webp") {

                mimeType = "image/webp";

            }


            const fileName =
                photo.fileName ||
                `helper-${Date.now()}.${extension}`;


            formData.append(
                "photo",
                {
                    uri: uri,
                    name: fileName,
                    type: mimeType,
                }
            );


            console.log(
                "FILE NAME:",
                fileName
            );

            console.log(
                "FILE TYPE:",
                mimeType
            );


            // =================================================
            // REQUEST
            // =================================================

            const url =
                `${SERVER_URL}/api/helpers/create`;


            console.log(
                "REQUEST URL:",
                url
            );


            const headers = {

                Accept: "application/json",

            };


            if (token) {

                headers.Authorization =
                    `Bearer ${token}`;

            }


            // IMPORTANT:
            // Do NOT manually set Content-Type.
            // React Native must generate the multipart
            // boundary automatically.

            const response =
                await fetch(
                    url,
                    {
                        method: "POST",

                        headers: headers,

                        body: formData,
                    }
                );


            console.log(
                "SERVER STATUS:",
                response.status
            );


            // =================================================
            // READ RESPONSE
            // =================================================

            const responseText =
                await response.text();


            console.log(
                "SERVER RESPONSE:",
                responseText
            );


            let data = null;


            try {

                data =
                    JSON.parse(responseText);

            } catch {

                data = {
                    message:
                        responseText ||
                        "Server returned an invalid response."
                };

            }


            // =================================================
            // SERVER ERROR
            // =================================================

            if (!response.ok) {

                Alert.alert(
                    "Profile Creation Failed",

                    data?.message ||
                    `Server returned error ${response.status}.`
                );

                return;
            }


            // =================================================
            // SUCCESS
            // =================================================

            console.log(
                "HELPER PROFILE CREATED SUCCESSFULLY"
            );


            Alert.alert(
                "Success 🎉",

                data?.message ||
                "Your helper profile has been created successfully.",

                [
                    {
                        text: "Continue",

                        onPress: () => {

                            navigation.replace(
                                "HelperHome",
                                {
                                    user: user,
                                    token: token,
                                }
                            );

                        },
                    },
                ]
            );


        } catch (error) {

            console.log(
                "================================"
            );

            console.log(
                "CREATE PROFILE ERROR"
            );

            console.log(
                "ERROR NAME:",
                error?.name
            );

            console.log(
                "ERROR MESSAGE:",
                error?.message
            );

            console.log(
                "ERROR:",
                error
            );

            console.log(
                "================================"
            );


            Alert.alert(
                "Connection Error",

                error?.message ||
                "Unable to connect to the LocalHelper server."
            );

        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // UI
    // =====================================================

    return (

        <ScrollView
            style={styles.container}

            contentContainerStyle={
                styles.content
            }

            showsVerticalScrollIndicator={false}
        >

            {/* HEADER */}

            <View style={styles.header}>

                <TouchableOpacity
                    onPress={() =>
                        navigation.goBack()
                    }

                    disabled={loading}
                >

                    <Text style={styles.back}>
                        ‹
                    </Text>

                </TouchableOpacity>


                <Text style={styles.headerTitle}>
                    Become a Helper
                </Text>


                <View
                    style={{
                        width: 30
                    }}
                />

            </View>


            {/* TITLE */}

            <Text style={styles.title}>
                Create Your Helper Profile
            </Text>


            <Text style={styles.subtitle}>
                Add your information so customers can find you.
            </Text>


            {/* PHOTO */}

            <Text style={styles.sectionTitle}>
                Profile Photo *
            </Text>


            <TouchableOpacity
                style={styles.photoContainer}

                onPress={choosePhoto}

                disabled={loading}
            >

                {photo?.uri ? (

                    <Image
                        source={{
                            uri: photo.uri
                        }}

                        style={
                            styles.profilePhoto
                        }
                    />

                ) : (

                    <View
                        style={
                            styles.photoPlaceholder
                        }
                    >

                        <Text
                            style={
                                styles.cameraIcon
                            }
                        >
                            📷
                        </Text>


                        <Text
                            style={
                                styles.photoText
                            }
                        >
                            Add Your Photo
                        </Text>


                        <Text
                            style={
                                styles.photoSubText
                            }
                        >
                            Tap to choose
                        </Text>

                    </View>

                )}

            </TouchableOpacity>


            {photo?.uri && (

                <TouchableOpacity
                    onPress={choosePhoto}

                    disabled={loading}
                >

                    <Text
                        style={
                            styles.changePhotoText
                        }
                    >
                        Change Photo
                    </Text>

                </TouchableOpacity>

            )}


            {/* NAME */}

            <Text style={styles.label}>
                Full Name *
            </Text>


            <TextInput
                style={styles.input}

                placeholder="Enter your full name"

                value={name}

                onChangeText={setName}

                editable={!loading}

                autoCapitalize="words"
            />


            {/* PROFESSION */}

            <Text style={styles.label}>
                Profession *
            </Text>


            <TextInput
                style={styles.input}

                placeholder="Example: Plumber"

                value={profession}

                onChangeText={setProfession}

                editable={!loading}

                autoCapitalize="words"
            />


            {/* CITY */}

            <Text style={styles.label}>
                City *
            </Text>


            <TextInput
                style={styles.input}

                placeholder="Example: Mumbai"

                value={city}

                onChangeText={setCity}

                editable={!loading}

                autoCapitalize="words"
            />


            {/* PHONE */}

            <Text style={styles.label}>
                Phone Number *
            </Text>


            <TextInput
                style={styles.input}

                placeholder="Enter phone number"

                keyboardType="phone-pad"

                value={phone}

                onChangeText={setPhone}

                editable={!loading}
            />


            {/* EXPERIENCE */}

            <Text style={styles.label}>
                Experience *
            </Text>


            <TextInput
                style={styles.input}

                placeholder="Example: 5 years"

                value={experience}

                onChangeText={setExperience}

                editable={!loading}
            />


            {/* DESCRIPTION */}

            <Text style={styles.label}>
                About You
            </Text>


            <TextInput
                style={[
                    styles.input,
                    styles.description
                ]}

                placeholder="Tell customers about your experience and services..."

                multiline

                textAlignVertical="top"

                value={description}

                onChangeText={setDescription}

                editable={!loading}
            />


            {/* BUTTON */}

            <TouchableOpacity
                style={[
                    styles.button,

                    loading &&
                    styles.disabled
                ]}

                onPress={createProfile}

                disabled={loading}
            >

                {loading ? (

                    <View
                        style={
                            styles.loadingRow
                        }
                    >

                        <ActivityIndicator
                            color="#fff"
                        />


                        <Text
                            style={
                                styles.loadingText
                            }
                        >
                            Creating profile...
                        </Text>

                    </View>

                ) : (

                    <Text
                        style={
                            styles.buttonText
                        }
                    >
                        Create Helper Profile
                    </Text>

                )}

            </TouchableOpacity>


            <View
                style={{
                    height: 50
                }}
            />

        </ScrollView>

    );

}


// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#f7f8fa",
    },

    content: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },

    header: {
        marginTop: 45,
        height: 55,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    back: {
        fontSize: 40,
        color: "#222",
    },

    headerTitle: {
        fontSize: 21,
        fontWeight: "bold",
    },

    title: {
        fontSize: 27,
        fontWeight: "bold",
        marginTop: 20,
    },

    subtitle: {
        color: "#777",
        marginTop: 7,
        marginBottom: 25,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 12,
    },

    photoContainer: {
        alignSelf: "center",
        width: 150,
        height: 150,
        borderRadius: 75,
        overflow: "hidden",
        marginBottom: 10,
    },

    photoPlaceholder: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: "#e9f2ff",
        borderWidth: 2,
        borderColor: "#007BFF",
        borderStyle: "dashed",
        justifyContent: "center",
        alignItems: "center",
    },

    profilePhoto: {
        width: 150,
        height: 150,
    },

    cameraIcon: {
        fontSize: 35,
    },

    photoText: {
        color: "#007BFF",
        fontWeight: "bold",
        marginTop: 5,
    },

    photoSubText: {
        color: "#777",
        fontSize: 11,
        marginTop: 3,
    },

    changePhotoText: {
        textAlign: "center",
        color: "#007BFF",
        fontWeight: "bold",
        marginBottom: 20,
    },

    label: {
        fontSize: 15,
        fontWeight: "600",
        color: "#333",
        marginTop: 12,
        marginBottom: 7,
    },

    input: {
        minHeight: 52,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        backgroundColor: "#fff",
        paddingHorizontal: 15,
        fontSize: 15,
    },

    description: {
        height: 120,
        paddingTop: 15,
    },

    button: {
        height: 55,
        borderRadius: 10,
        backgroundColor: "#007BFF",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 30,
    },

    disabled: {
        opacity: 0.7,
    },

    buttonText: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "bold",
    },

    loadingRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    loadingText: {
        color: "#fff",
        marginLeft: 10,
        fontSize: 16,
    },

});