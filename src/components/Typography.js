import styled from 'styled-components';

const Typography = styled.span`
  font-family: 'Roboto';
  font-size: ${props => props.size || 16};
  color: 'LightGrey';
`

export default Typography;
