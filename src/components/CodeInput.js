import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const Input = styled.input`
  border: none;
  outline: none;
  border-bottom: 2px solid #888;
  font-size: 16px;
`;

const CodeInput = props => {
  let [value, setValue] = useState('');
  let [style, setStyle] = useState({
    borderColor: '#888',
  });

  const handleChange = e => {
    let { value } = e.target;

    setValue(value);
  };

  const handleSubmit = e => {
    e.preventDefault();

    props.handleSubmit(value);
  };

  const handleFocus = () => {
    setStyle({
      borderColor: 'black',
    });
  };

  const handleBlur = () => {
    setStyle({
      borderColor: '#888',
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        style={style}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Enter a timer code"
        value={value}
        onChange={handleChange}
      ></Input>
    </form>
  );
};

CodeInput.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
};

export default CodeInput;
