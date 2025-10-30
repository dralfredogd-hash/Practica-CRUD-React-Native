import React from 'react';
import {Text} from 'react-native';

const Greeting = (props) => {
    return (
        <Text>Hello, {props.name}! {props.message}</Text>
    );
};

export default Greeting;