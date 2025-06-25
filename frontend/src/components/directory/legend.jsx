import React from 'react';
import styled from 'styled-components';

const LegendContainer = styled.div`
    // display
    display: flex;
    align-items: center;
    justify-content: center;
    // box
    gap: 15px;
`;

const LegendItem = styled.div`
    // display
    display: flex;
    align-items: center;
    // box
    margin-bottom: 0px;
`;

const ColorBox = styled.div`
    // color block
    background-color: ${props => props.color};
    // box
    width: 12px;
    height: 12px;
    margin-right: 5px;
`;

const Label = styled.div`
    // font
    color: var(--brown);
    font-family: Regular;
    font-size: 12px;
`;

const Legend = ({ data }) => {
  
    return (
    <LegendContainer>
      {data.map((input, index) => (
        <LegendItem key={index}>
          <ColorBox color={input[1]} />
          <Label>{input[0]}</Label>
        </LegendItem>
      ))}
    </LegendContainer>
  );
};

export default Legend;