import { Dimensions, StyleSheet } from 'react-native';
import colors from '../constants/colors';

const { width } = Dimensions.get('window');
const baseWidth = 375;
const scale = width / baseWidth;

export const buttonsStyles = StyleSheet.create({
    buttonForm: {
        backgroundColor: colors.red,
        width: '50%',
        borderRadius: 15 * scale,
        paddingVertical: 10 * scale,
        alignSelf: 'center',
        alignItems: 'center',
        marginTop: 10 * scale,
    },
    buttonFormText: {
        color: colors.white,
        fontSize: 20 * scale,
        fontWeight: 'bold'
    },
    
    //botões com width alongado, como nas tela de Escambos Feitos
    longButton: {
        width: '100%',
        backgroundColor: colors.blue,
        marginTop: 10 * scale,
        borderRadius: 8 * scale,
        paddingVertical: 10 * scale,
        alignItems: 'center',
    },
    
    longButtonText: {
        color: colors.white,
        fontSize: 16 * scale,
        fontWeight: 'bold'
    },
});

