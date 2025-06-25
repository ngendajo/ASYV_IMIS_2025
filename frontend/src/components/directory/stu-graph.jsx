import React, { useRef, useState, useEffect } from 'react';
import styled, { css } from 'styled-components';

const BarChartContainer = styled.div`
  // display
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  // box
  margin-top: 20px;
`;

const BarTitle = styled.div`
  // font
  color: var(--brown);
  font-family: Medium;
  font-size: 16px;
  // box
  margin-bottom: 25px;
`;

const Chart = styled.div`
  // display
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  // box
  width: 80%;
  height: 100px;
  padding: 0 20px;
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
  left: 105%;
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

const parser = (name) => {
  if (name === "stumale")
    return "With Further Study"
  else if (name === "stufemale")
    return ""
  else if (name === "nstumale")
    return "Without Further Study"
  else if (name === "nstufemale")
    return ""
}

const getBarMargin = (index) => {
  if (index === 1) {
    return '0 20px 0 5px';
  } else if (index === 2) {
    return '0 5px 0 20px';
  } else if (index === 0 || index === 3) {
    return '0 0';
  }
  return '0 10px';
}

const StuGraph = ({ data }) => {

  // Set color
  const getBarColor = (category) => {
    const colors = ['var(--coffee)', 'var(--orange)'];
    const index = percentageData.findIndex(item => item.category === category);
    return colors[index % colors.length];
  }
  // Calculate the height
  const counts = Object.values(data);
  const highestCount = Math.max(...counts);
  const percentageData = Object.entries(data).map(([key, count]) => ({
    category: key,
    count: count,
    percentage: (count / highestCount) * 100
  }));
  
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
      threshold: 0
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
  console.log(percentageData)

  return (
    <BarChartContainer ref={chartRef}>
      <BarTitle>Further Study by Gender</BarTitle>
      <Chart>
        {percentageData.map(({ category, count, percentage }, index) => (
          <Bar
            key={category}
            color={getBarColor(category)}
            style={{ height: isVisible ? `${percentage}%` : '0%' }}
            margin={getBarMargin(index)}
          >
            <BarText>{parser(category)}</BarText>
            <BarNumber>{count}</BarNumber>
          </Bar>
        ))}
      </Chart>
    </BarChartContainer>
  );
};
  
export default StuGraph;