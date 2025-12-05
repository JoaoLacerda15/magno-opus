import { Dimensions, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import { useFonts, Baloo2_400Regular, Baloo2_700Bold } from '@expo-google-fonts/baloo-2';

const { width } = Dimensions.get('window');
const baseWidth = 375;
const scale = width / baseWidth;



export const popupStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        backgroundColor: 'white',
        borderRadius: 20 * scale,
        padding: 25 * scale,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        minHeight: 200 * scale, 
        width: 300 * scale,
        justifyContent: 'space-between', 
    },
    modalText: {
        fontFamily: 'Baloo2_700Bold',
        marginBottom: 20 * scale,
        textAlign: 'center',
        fontSize: 22 * scale,
        flexShrink: 1
    },
    modalButtons: {
        flexDirection: 'row',
        width: 110 * scale,
        justifyContent: 'center',
        marginBottom: 10,
    },
    modalButton: {
        borderRadius: 15 * scale,
        padding: 7,
        elevation: 2,
        minWidth: 120,
        alignItems: 'center',
    },
    noButton: {
        backgroundColor: colors.blue,
        marginRight: 10,
    },
    yesButton: {
        backgroundColor: colors.blue,
    },
    noButtonText: {
        color: colors.white,
        fontFamily: 'Baloo2_700Bold',
        fontSize: 20 * scale,
    },
    yesButtonText: {
        fontFamily: 'Baloo2_700Bold',
        color: colors.blue,
        fontSize: 20 * scale,
    },
    okButton: {
        backgroundColor: colors.blue,
    },
    okButtonText: {
        fontFamily: 'Baloo2_700Bold',
        color: colors.blue,
        fontSize: 20 * scale
    },
});

