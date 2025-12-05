import { Dimensions, StyleSheet } from 'react-native';
import colors from './colors';

const { width } = Dimensions.get('window');
const baseWidth = 375;
const scale = width / baseWidth;

export const conditionStyles = StyleSheet.create({
    ratingContainer: {
        backgroundColor: colors.blue,
        paddingHorizontal: 10,
        paddingVertical: 4,
        alignSelf: 'flex-start',
        borderRadius: 12,
    },
    ratingText: {
        color: colors.black,
        fontSize: 12 * scale,
        fontWeight: '600',
    },
});