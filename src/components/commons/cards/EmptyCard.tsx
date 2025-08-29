import {Text, View} from 'react-native';

export const EmptyCard = ({text}: {text: string}) => {
  return (
    <View
      style={{
        backgroundColor: 'transparent',
        padding: 10,
        width: '100%',
        marginTop: 0,
        marginBottom: 0,
        gap: 10,
        justifyContent: "center",
        alignItems: "center",
        minHeight: 80
      }}>
        <Text style={{color: "#9E9E9E", fontSize: 23, fontWeight: "600", opacity: 0.6, textAlign: "center"}}>{text}</Text>
      </View>
  );
};
