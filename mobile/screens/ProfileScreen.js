import React, { useEffect, useState } from "react";

import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    ActivityIndicator,
    Alert,
} from "react-native";

import * as ImagePicker from "expo-image-picker";


const SERVER_URL =
    "https://helper-buddy.onrender.com";


export default function ProfileScreen({
    navigation,
    route
}) {

    const params =
        route?.params || {};


    const user =
        params.user || null;


    const token =
        params.token || null;


    // ==========================================
    // USER ID
    // ==========================================

    const userId =
        user?.id ||
        user?._id ||
        user?.userId ||
        null;


    // ==========================================
    // STATE
    // ==========================================

    const [helper, setHelper] =
        useState(null);

    const [name, setName] =
        useState("");

    const [profession, setProfession] =
        useState("");

    const [city, setCity] =
        useState("");

    const [phone, setPhone] =
        useState("");

    const [experience, setExperience] =
        useState("");

    const [description, setDescription] =
        useState("");

    const [photo, setPhoto] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);


    // ==========================================
    // LOAD PROFILE
    // ==========================================

    useEffect(() => {

        loadProfile();

    }, []);


    const loadProfile = async () => {

        if (!userId) {

            setLoading(false);

            Alert.alert(
                "Login Error",
                "User information is missing. Please logout and login again."
            );

            return;
        }


        try {

            const response =
                await fetch(
                    `${SERVER_URL}/api/helpers/user/${userId}`
                );


            const text =
                await response.text();


            let data = {};


            try {

                data =
                    JSON.parse(text);

            } catch {

                data = {};

            }


            console.log(
                "PROFILE:",
                data
            );


            if (!response.ok) {

                Alert.alert(
                    "Profile Error",
                    data.message ||
                    "Could not load helper profile."
                );

                return;
            }


            setHelper(data);

            setName(
                data.name || ""
            );

            setProfession(
                data.profession || ""
            );

            setCity(
                data.city || ""
            );

            setPhone(
                data.phone || ""
            );

            setExperience(
                data.experience
                    ? String(data.experience)
                    : ""
            );

            setDescription(
                data.description || ""
            );


            if (data.photo) {

                setPhoto({
                    uri:
                        `${SERVER_URL}/uploads/${data.photo}`
                });

            }

        } catch (error) {

            console.log(
                "LOAD PROFILE ERROR:",
                error
            );


            Alert.alert(
                "Connection Error",
                "Could not connect to LocalHelper server."
            );

        } finally {

            setLoading(false);

        }

    };


    // ==========================================
    // PICK PHOTO
    // ==========================================

    const pickPhoto = async () => {

        try {

            const permission =
                await ImagePicker.requestMediaLibraryPermissionsAsync();


            if (!permission.granted) {

                Alert.alert(
                    "Permission Required",
                    "Please allow photo access."
                );

                return;
            }


            const result =
                await ImagePicker.launchImageLibraryAsync({

                    mediaTypes:
                        ImagePicker.MediaTypeOptions.Images,

                    allowsEditing: true,

                    aspect: [1, 1],

                    quality: 0.7,

                });


            if (
                !result.canceled &&
                result.assets?.length
            ) {

                setPhoto(
                    result.assets[0]
                );

            }

        } catch (error) {

            console.log(
                "PHOTO ERROR:",
                error
            );

            Alert.alert(
                "Error",
                "Could not select photo."
            );

        }

    };


    // ==========================================
    // SAVE
    // ==========================================

    const saveProfile = async () => {

        if (!userId) {

            Alert.alert(
                "Login Error",
                "User information is missing. Please login again."
            );

            return;
        }


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


        try {

            setSaving(true);


            const formData =
                new FormData();


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


            // ======================================
            // NEW PHOTO
            // ======================================

            if (
                photo?.uri &&
                !photo.uri.includes("/uploads/")
            ) {

                const uri =
                    photo.uri;


                let fileName =
                    photo.fileName ||
                    uri.split("/").pop() ||
                    `profile-${Date.now()}.jpg`;


                if (!fileName.includes(".")) {

                    fileName += ".jpg";

                }


                const mimeType =
                    photo.mimeType ||
                    "image/jpeg";


                formData.append(
                    "photo",
                    {
                        uri,
                        name: fileName,
                        type: mimeType,
                    }
                );

            }


            const response =
                await fetch(
                    `${SERVER_URL}/api/helpers/user/${userId}`,
                    {

                        method: "PUT",

                        headers: {

                            Accept:
                                "application/json",

                            ...(token
                                ? {
                                    Authorization:
                                        `Bearer ${token}`,
                                }
                                : {}),

                        },

                        body: formData,

                    }
                );


            const text =
                await response.text();


            let data = {};


            try {

                data =
                    JSON.parse(text);

            } catch {

                data = {
                    message:
                        text ||
                        "Invalid server response."
                };

            }


            console.log(
                "SAVE PROFILE:",
                data
            );


            if (!response.ok) {

                Alert.alert(
                    "Update Failed",
                    data.message ||
                    "Could not update profile."
                );

                return;
            }


            setHelper(
                data.helper
            );


            if (data.helper?.photo) {

                setPhoto({

                    uri:
                        `${SERVER_URL}/uploads/${data.helper.photo}?t=${Date.now()}`

                });

            }


            Alert.alert(
                "Success 🎉",
                "Your profile has been updated successfully."
            );


        } catch (error) {

            console.log(
                "SAVE PROFILE ERROR:",
                error
            );


            Alert.alert(
                "Connection Error",
                "Could not connect to LocalHelper server."
            );

        } finally {

            setSaving(false);

        }

    };


    // ==========================================
    // LOGOUT
    // ==========================================

    const logout = () => {

        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",

            [
                {
                    text: "Cancel",
                    style: "cancel",
                },

                {
                    text: "Logout",

                    style: "destructive",

                    onPress: () => {

                        navigation.reset({

                            index: 0,

                            routes: [
                                {
                                    name: "Login"
                                }
                            ],

                        });

                    },

                },

            ]

        );

    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <View
                style={
                    styles.loadingContainer
                }
            >

                <ActivityIndicator
                    size="large"
                    color="#007BFF"
                />

                <Text
                    style={
                        styles.loadingText
                    }
                >
                    Loading profile...
                </Text>

            </View>

        );

    }


    // ==========================================
    // SCREEN
    // ==========================================

    return (

        <ScrollView
            style={styles.container}
            contentContainerStyle={
                styles.content
            }
        >

            {/* HEADER */}

            <View style={styles.header}>

                <TouchableOpacity
                    onPress={() =>
                        navigation.goBack()
                    }
                >

                    <Text
                        style={styles.back}
                    >
                        ‹
                    </Text>

                </TouchableOpacity>


                <Text
                    style={styles.headerTitle}
                >
                    My Profile
                </Text>


                <View
                    style={{
                        width: 30
                    }}
                />

            </View>


            {/* PHOTO */}

            <View
                style={
                    styles.photoSection
                }
            >

                <TouchableOpacity
                    onPress={pickPhoto}
                    disabled={saving}
                >

                    {photo?.uri ? (

                        <Image
                            source={{
                                uri: photo.uri
                            }}
                            style={
                                styles.profileImage
                            }
                        />

                    ) : (

                        <View
                            style={
                                styles.defaultPhoto
                            }
                        >

                            <Text
                                style={
                                    styles.defaultPhotoText
                                }
                            >
                                {name
                                    ? name
                                        .charAt(0)
                                        .toUpperCase()
                                    : "👤"}
                            </Text>

                        </View>

                    )}

                </TouchableOpacity>


                <Text
                    style={
                        styles.photoTitle
                    }
                >
                    Profile Photo
                </Text>


                <TouchableOpacity
                    onPress={pickPhoto}
                    disabled={saving}
                >

                    <Text
                        style={
                            styles.changePhoto
                        }
                    >
                        Change Photo
                    </Text>

                </TouchableOpacity>

            </View>


            {/* INFORMATION */}

            <Text
                style={
                    styles.sectionTitle
                }
            >
                Personal Information
            </Text>


            <View style={styles.card}>

                <Text style={styles.label}>
                    Full Name
                </Text>

                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                />


                <Text style={styles.label}>
                    Profession
                </Text>

                <TextInput
                    style={styles.input}
                    value={profession}
                    onChangeText={setProfession}
                />


                <Text style={styles.label}>
                    City
                </Text>

                <TextInput
                    style={styles.input}
                    value={city}
                    onChangeText={setCity}
                />


                <Text style={styles.label}>
                    Phone Number
                </Text>

                <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                />


                <Text style={styles.label}>
                    Experience
                </Text>

                <TextInput
                    style={styles.input}
                    value={experience}
                    onChangeText={setExperience}
                    keyboardType="numeric"
                />


                <Text style={styles.label}>
                    About You
                </Text>

                <TextInput
                    style={[
                        styles.input,
                        styles.description
                    ]}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    textAlignVertical="top"
                />

            </View>


            {/* SAVE */}

            <TouchableOpacity
                style={styles.saveButton}
                onPress={saveProfile}
                disabled={saving}
            >

                {saving ? (

                    <ActivityIndicator
                        color="#fff"
                    />

                ) : (

                    <Text
                        style={
                            styles.saveText
                        }
                    >
                        Save Profile
                    </Text>

                )}

            </TouchableOpacity>


            {/* LOGOUT */}

            <TouchableOpacity
                style={
                    styles.logoutButton
                }
                onPress={logout}
            >

                <Text
                    style={
                        styles.logoutText
                    }
                >
                    Logout
                </Text>

            </TouchableOpacity>


            <View
                style={{
                    height: 50
                }}
            />

        </ScrollView>

    );

}


// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#f7f8fa",
    },

    content: {
        paddingHorizontal: 20,
    },

    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    loadingText: {
        marginTop: 10,
        color: "#666",
    },

    header: {
        marginTop: 35,
        height: 60,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    back: {
        fontSize: 40,
    },

    headerTitle: {
        fontSize: 22,
        fontWeight: "bold",
    },

    photoSection: {
        alignItems: "center",
        marginVertical: 20,
    },

    profileImage: {
        width: 140,
        height: 140,
        borderRadius: 70,
    },

    defaultPhoto: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: "#007BFF",
        justifyContent: "center",
        alignItems: "center",
    },

    defaultPhotoText: {
        color: "#fff",
        fontSize: 50,
        fontWeight: "bold",
    },

    photoTitle: {
        fontSize: 17,
        fontWeight: "bold",
        marginTop: 12,
    },

    changePhoto: {
        color: "#007BFF",
        fontWeight: "bold",
        marginTop: 6,
    },

    sectionTitle: {
        fontSize: 21,
        fontWeight: "bold",
        marginBottom: 12,
    },

    card: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 18,
    },

    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 6,
    },

    input: {
        height: 50,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        paddingHorizontal: 14,
        marginBottom: 15,
        backgroundColor: "#fafafa",
    },

    description: {
        height: 110,
        paddingTop: 14,
    },

    saveButton: {
        height: 55,
        borderRadius: 12,
        backgroundColor: "#007BFF",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
    },

    saveText: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "bold",
    },

    logoutButton: {
        height: 52,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 12,
        backgroundColor: "#fff",
    },

    logoutText: {
        fontSize: 16,
        fontWeight: "bold",
    },

});