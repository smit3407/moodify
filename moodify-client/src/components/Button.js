import React from 'react';

export default function Button({ onClick, text, color }) {
    return (
        <button className="button" style={color} type="button" onClick={onClick}>
            {text}
        </button>
    );
}