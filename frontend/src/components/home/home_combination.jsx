import React, { useRef, useState, useEffect } from 'react';
// npm install styled-components
import styled from 'styled-components';

const BarChartContainer = styled.div`
    // display
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    // box
    margin-top: 150px;
`;

const BarTitle = styled.div`
    // font
    color: var(--brown);
    font-family: Bold;
    font-size: 24px;
    letter-spacing: 0.9px;
    // box
    margin-bottom: -250px;
`;

const Chart = styled.div`
    // display
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    // box
    width: 1000px;
    height: 500px;
    padding: 0 50px;
    border-bottom: 2px solid var(--brown);
    transition: height 0.5s ease;
`;

const Bar = styled.div`
    // color block
    background-color: ${props => props.color || 'var(--black)'};
    position: relative;
    // box
    width: 500px;
    height: 100%;
    margin: 0 12px;
    transition: height 1s ease;
`;

const BarShort = styled.span`
    // font
    color: var(--brown);
    font-family: Medium;
    font-size: 18px;
    text-align: center;
    // box
    position: absolute;
    bottom: -40px;
    left: 50%;
    transform: translateX(-50%);
`;

const BarFull = styled.span`
    // font
    color: var(--brown);
    font-family: Regular;
    font-size: 14px;
    text-align: center;
    // box
    position: absolute;
    bottom: -105px;
    left: 50%;
    transform: translateX(-50%);
`;

const BarNumber = styled.span`
    // font
    color: var(--brown);
    font-family: Regular;
    font-size: 16px;
    // box
    position: absolute;
    top: -25px;
    left: 50%;
    transform: translateX(-50%);
`;  

const CombinationChart = ({ data }) => {

    // Set color
    const getBarColor = (combination) => {
        const colors = ['var(--green)', 'var(--brown)', 'var(--orange)', 'var(--coffee)', 'var(--yellow)'];
        const index = percentageData.findIndex(item => item.combination === combination);
        return colors[index % colors.length];
    }

    // Change name
    const regexS = /\(([^)]+)\)/;
    const getShort = (combination) => {
        const match = regexS.exec(combination);
        return match ? match[1] : 'N/A';
    };
    const regexF = /^([\w\s-]+)\s+\([^)]+\)$/;
    const getFull = (combination) => {
        const match = regexF.exec(combination);
        if (!match) return combination;
        const noDash = match[1].replace(/-/g, ' ');
        const noSci = noDash.replace(/\s+Science/g, '');
        const noEng = noSci.replace(/\s+in\s+English/g, '');
        return noEng;
    };
    
    // Calculate the height
    const totalCount = Object.values(data).reduce((acc, count) => acc + count, 0);
    const percentageData = Object.entries(data).map(([key, count]) => ({
      combination: key,
      count: count,
      percentage: (count / totalCount) * 100
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
        threshold: 0.8 // Trigger when 80% of the element is in view
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
      <BarChartContainer ref={chartRef}>
        <BarTitle>Combination Distribution</BarTitle>
        <Chart>
          {percentageData.map(({ combination, count, percentage }) => (
            <Bar key={combination} color={getBarColor(combination)} style={{ height: isVisible ? `${percentage}%` : '0%' }}>
              <BarShort>{getShort(combination)}</BarShort>
              <BarFull>{getFull(combination)}</BarFull>
              <BarNumber>{count}</BarNumber>
            </Bar>
          ))}
        </Chart>
      </BarChartContainer>
    );
  };
  
  export default CombinationChart;