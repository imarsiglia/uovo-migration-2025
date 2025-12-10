import React, { Component } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';

export default class ZoomView extends Component {
    onGesturePinch = ({ nativeEvent }) => {
        this.props.onPinchProgress(nativeEvent.scale);
    }

    onPinchHandlerStateChange = event => {
        if (event.nativeEvent.state === State.END) {
            this.props.onPinchEnd();
        }
        else if (event.nativeEvent.oldState === State.BEGAN && event.nativeEvent.state === State.ACTIVE) {
            this.props.onPinchStart();
        }
    };

    render() {
        return (
            <PinchGestureHandler
                onGestureEvent={this.onGesturePinch}
                onHandlerStateChange={this.onPinchHandlerStateChange}>
                {this.props.children}
            </PinchGestureHandler>
        )
    }
}

ZoomView.defaultProps = {
    onPinchProgress: (p) => { },
    onPinchStart: () => { },
    onPinchEnd: () => { },
}

const styles = StyleSheet.create({
    preview: {
        height: Dimensions.get('window').height,
        width: "100%"
    },
})