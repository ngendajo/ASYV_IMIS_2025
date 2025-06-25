import React, { useRef, useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import Legend from './legend.jsx';

const BarChartContainer = styled.div`
  // display
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  // box
  margin-top: 20px;
  }
`;

const BarTitle = styled.div`
  // font
  color: var(--brown);
  font-family: Medium;
  font-size: 18px;
  // box
  margin-bottom: 10px;
`;

const Chart = styled.div`
  // display
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  // box
  width: 90%;
  height: 110px;
  padding: 0 20px;
  margin-top: 30px;
  border-bottom: 2px solid var(--brown);
  transition: height 0.5s ease;
`;

const Bar = styled.div`
  // color block
  background-color: ${props => props.color || 'var(--black)'};
  position: relative;
  // box
  width: 100%;
  height: 100%;
  ${props => props.margin && css`margin: ${props.margin};`}
  transition: height 1s ease;
`;

const BarText = styled.span`
  // font
  color: var(--brown);
  font-family: Regular;
  font-size: 14px;
  text-align: center;
  white-space: nowrap;
  // box
  position: absolute;
  bottom: -30px;
  left: 220%;
  transform: translateX(-50%);
`;

const BarNumber = styled.span`
  // font
  color: var(--brown);
  font-family: Regular;
  font-size: 12px;
  // box
  position: absolute;
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
`; 

const parser = (name, index) => {
  if (index % 4 === 0)
    return name
  else
    return ""
}

const getBarMargin = (index) => {
  if (index % 4 === 0) {
    return '0 1px 0 8px';
  }
  else if (index % 4 === 3) {
    return '0 8px 0 1px';
  } else if (index % 4 === 1 || index % 4 === 2) {
    return '0 1px';
  }
  return '0 10px';
}

const TotalEmpGraphZoom = ({ percentageData, percentageDataGiven, showPopup, togglePopup }) => {
  // Set color
  const getBarColor = (category) => {
    const colors = ['var(--coffee)', 'var(--coffeeli)', 'var(--orange)', 'var(--orangeli)'];
    const index = percentageData.findIndex(item => item.category === category);
    return colors[index % colors.length];
  }
  const getBarColorGiven = (category) => {
    const colors = ['var(--coffee)', 'var(--coffeeli)', 'var(--orange)', 'var(--orangeli)'];
    const index = percentageDataGiven.findIndex(item => item.category === category);
    return colors[index % colors.length];
  }
  // Growing effect
  const [isVisible, setIsVisible] = useState(false);
  const chartRef = useRef(null);
  useEffect(() => {
    const chartElement = chartRef.current;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target); // Stop observing once visible
        }
      });
    }, {
      threshold: 0.8
    });
    if (chartElement) {
      observer.observe(chartElement);
    }
    return () => {
      if (chartElement) {
        observer.unobserve(chartElement);
      }
    };
  }, []);
  
  return (
    <>
    {showPopup && (
      <div className="lockScreen">
        <div className="zoomedInContainer">
          <div className="zoomedIn">
            <BarChartContainer ref={chartRef}>
              <button className="CloseButton" onClick={togglePopup}>x</button>
              <BarTitle>Employment History (by Grade and Gender)</BarTitle>
              <Legend data={[
                          ["Employed Male", "var(--coffee)"],
                          ["Unemployed Male", "var(--coffeeli)"],
                          ["Employed Female", "var(--orange)"],
                          ["Unemployed Female", "var(--orangeli)"]]}
              />
              <Chart>
                {percentageData.map(({ name, category, count, percentage }, index) => (
                  <Bar
                    key={index}
                    color={getBarColor(category)}
                    style={{ height: `${percentage}%` }}
                    margin={getBarMargin(index)}
                  >
                    <BarText>{parser(name, index)}</BarText>
                    <BarNumber>{count}</BarNumber>
                  </Bar>
                ))}
              </Chart>
            </BarChartContainer>
            <div className="big-space"></div>
            <BarChartContainer ref={chartRef}>
              <button className="CloseButton" onClick={togglePopup}>x</button>
              <BarTitle>Employment History of Alumni with Further Study (by Grade and Gender)</BarTitle>
              <Legend data={[
                          ["Employed Male with Study", "var(--coffee)"],
                          ["Unemployed Male with Study", "var(--coffeeli)"],
                          ["Employed Female with Study", "var(--orange)"],
                          ["Unemployed Female with Study", "var(--orangeli)"]]}
              />
              <Chart>
                {percentageDataGiven.map(({ name, category, count, percentage }, index) => (
                  <Bar
                    key={index}
                    color={getBarColorGiven(category)}
                    style={{ height: `${percentage}%` }}
                    margin={getBarMargin(index)}
                  >
                    <BarText>{parser(name, index)}</BarText>
                    <BarNumber>{count}</BarNumber>
                  </Bar>
                ))}
              </Chart>
            </BarChartContainer>
          </div>
        </div>
      </div>
    )}
    </>
  );
};
  
export default TotalEmpGraphZoom;