import { Dimensions, StyleSheet } from 'react-native';
import colors from '../constants/colors';

const { width } = Dimensions.get('window');
const baseWidth = 375;
const scale = width / baseWidth;


export const headerStyles = StyleSheet.create({

    header: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 10 * scale,
        paddingBottom: 10 * scale,
        paddingHorizontal: 15 * scale,
        backgroundColor: colors.blue
    },

    backButton: {
        width: 40 * scale,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },

    headerTitle: {
        fontSize: 22 * scale,
        fontWeight: 'bold',
        color: colors.blue,
        textAlign: 'center',
        flex: 1,
    }
});

