import React, { useState, useEffect } from 'react';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Text, View, Button, Image, TextInput } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
    });

    if (!result.canceled) {
        return result.assets[0].uri;
    }

    return null;
};

const saveImageToLocal = async (imageUri: string) => {
    const fileName = imageUri.split('/').pop(); // Get file name from uri
    const localUri = `${FileSystem.documentDirectory}${fileName}`; // Specify local storage path
  
    try {
        await FileSystem.copyAsync({
            from: imageUri,
            to: localUri,
        });
        // Save image path in AsyncStorage
        await AsyncStorage.setItem('savedImageUri', localUri);
        return localUri; // return the saved local path
    } catch (error) {
        console.log('Error saving the image:', error);
        return null;
    }
};

const loadImageFromLocal = async () => {
    try {
        const savedUri = await AsyncStorage.getItem('savedImageUri');
        return savedUri;
    } catch (error) {
        console.log('Error loading the image:', error);
        return null;
    }
};

const loadTextColorFromLocal = async () => {
    try {
        const savedColor = await AsyncStorage.getItem('textColor');
        return savedColor;
    } catch (error) {
        console.log('Error loading the text color:', error);
        return null;
    }
};

const loadInputTextFromLocal = async () => {
    try {
        const savedText = await AsyncStorage.getItem('inputText');
        return savedText;
    } catch (error) {
        console.log('Error loading input text:', error);
        return null;
    }
};

export default function Index() {

    const [imageUri, setImageUri] = useState<string | null>(null);
    const [localImageUri, setLocalImageUri] = useState<string | null>(null);
    const [textColor, setTextColor] = useState('black'); // Default text color is black
    const [inputText, setInputText] = useState('');

    useEffect(() => {
        const loadImage = async () => {
            const loadedImageUri = await loadImageFromLocal();
            const savedColor = await loadTextColorFromLocal();
            const savedInputText = await loadInputTextFromLocal();
            if (loadedImageUri) {
                setLocalImageUri(loadedImageUri);
            }
            if (savedColor) {
                setTextColor(savedColor);
            }
            if (savedInputText) {
                setInputText(savedInputText);
            }
        };
        loadImage();
    }, []);

    const handlePickImage = async () => {
        const selectedImage = await pickImage();
        if (selectedImage) {
            setImageUri(selectedImage);
            const savedImage = await saveImageToLocal(selectedImage);
            setLocalImageUri(savedImage); // Set local image URI
        }
    };

    const handleInputChange = async (text: string) => {
        setInputText(text);
        await AsyncStorage.setItem('inputText', text); // Save the input text to AsyncStorage
    };

    const toggleTextColor = async () => {
        const newColor = textColor === 'black' ? 'red' : 'black'; // Toggle between black and red
        setTextColor(newColor);
        await AsyncStorage.setItem('textColor', newColor); // Save the new color in AsyncStorage
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Button title="Pick an Image" onPress={handlePickImage} />
            <Button title="Toggle Text Color" onPress={toggleTextColor} />
            <TextInput
                style={{
                    height: 40,
                    borderColor: 'gray',
                    borderWidth: 1,
                    paddingHorizontal: 10,
                    width: '80%',
                    marginVertical: 10,
                    color: textColor,
                }}
                placeholder="Enter text..."
                value={inputText}
                onChangeText={handleInputChange}
            />
            {imageUri && <Text style={{ color: textColor }}>Picked Image: {imageUri}</Text>}
            {localImageUri && (
                <>
                    <Text style={{ color: textColor }}>Saved Image: {localImageUri}</Text>
                    <Image source={{ uri: localImageUri }} style={{ width: 200, height: 200 }} />
                </>
            )}
        </View>
    );
}
