import styled from 'styled-components';

const Typography = styled.span`
  font-family: 'Roboto';
  font-size: ${props => props.size || '16px'};
  color: #888888;
`;

export default Typography;
