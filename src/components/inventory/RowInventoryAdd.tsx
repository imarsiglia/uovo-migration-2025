import * as React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";
import Icon from "react-native-fontawesome-pro";

type Props = {
    
}

const RowInventoryAdd = ({
    item,
    onCheck,
    onAddItem }) => {

    const [loading, setLoading] = React.useState(false);
    const [loaded, setLoaded] = React.useState(true);

    const check = () => {
        setLoading(true);
        onCheck();
        setTimeout(function () {
            setLoading(false);
        }, 3000)
    }

    const addItem = () => {
        onAddItem();
    }

    return (
        <View style={styles.container}>

            <View style={[styles.containerColumn, {width: "15%"}]}>
                <Text style={[styles.column]}>{item.inventory_id}</Text>
            </View>

            <View style={styles.containerColumn}>
                <Text style={[styles.column]}>{item.client_ref_id}</Text>
            </View>

            <View style={styles.containerColumn}>
                <Text style={[styles.column]}>{item.artist_name}</Text>
            </View>

            <View style={[styles.containerColumn, {width: "25%"}]}>
                <Text style={[styles.column]}>{item.title}</Text>
            </View>

            <View style={styles.containerColumn}>
                <TouchableOpacity style={styles.buttonAdd} onPress={() => addItem()}>
                        <Icon name="plus" type="regular" color="white" size={11}/>
                        <Text style={styles.textAdd}>Add</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

RowInventoryAdd.propTypes = {
    checked: PropTypes.bool,
}

const styles = StyleSheet.create({
    container: {
        borderTopWidth: 0.3,
        borderTopColor: "#d0d0d0",
        flexDirection: "row",
        height: 35,
        width: "100%",
    },
    column: {
        textAlign: "center",
        fontSize: 12,
        opacity: 0.66,
        color: "#000000",
        justifyContent: "space-around",
        flexDirection: "row",
        alignItems: "center"
    },
    containerColumn: {
        borderRightWidth: 0.3,
        borderRightColor: "#d9d9d9",
        alignItems: "center",
        justifyContent: "center",
        width: "20%",
    },
    columnCheckBox: {
        textAlign: "center",
        fontSize: 12,
        color: "#464646",
        textAlignVertical: "center",
        borderRightWidth: 0.3,
        borderRightColor: "#d9d9d9",
        height: "100%",
        justifyContent: "center"
    },
    columnLocation: {
        textAlign: "center",
        fontSize: 10,
        color: "#464646",
        textAlignVertical: "center",
    },
    buttonAdd: {
        backgroundColor: "#00D3ED",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 2
        
    },
    textAdd: {
        color: "white",
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 5
    }
})

export default RowInventoryAdd;