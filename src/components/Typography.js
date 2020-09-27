import styled from 'styled-components';

const Typography = styled.div`
  font-family: 'Roboto';
  font-size: ${props => props.size || '16px'};
  color: #888888;
`;

export default Typography;
