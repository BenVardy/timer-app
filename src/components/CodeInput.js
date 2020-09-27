import React, {useState} from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const Input = styled.input`
  border: none;
  outline: none;
  border-bottom: 1px solid black;
`;

const CodeInput = props => {
  let [value, setValue] = useState('');

  const handleChange = e => {
    let {value} = e.target;

    setValue(value);
  };

  const handleSubmit = e => {
    e.preventDefault();

    props.handleSubmit(value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input placeholder="Enter a timer code" value={value} onChange={handleChange}></Input>
    </form>
  );
};

CodeInput.propTypes = {
  handleSubmit: PropTypes.func.isRequired
};

export default CodeInput;
