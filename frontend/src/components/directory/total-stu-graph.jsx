import React, { useRef, useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import TotalStuGraphZoom from './total-stu-graph-zoom.jsx';

const BarChartContainer = styled.div`
  // display
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  // text
  cursor: pointer;
  // box
  margin-top: 20px;
  }
`;

const BarTitle = styled.div`
  // font
  color: var(--brown);
  font-family: Medium;
  font-size: 16px;
  // box
  margin-bottom: 15px;
`;

const Chart = styled.div`
  // display
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  // box
  width: 80%;
  height: 90px;
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
  font-size: 12px;
  text-align: center;
  white-space: nowrap;
  // box
  position: absolute;
  bottom: -35px;
  left: 200%;
  transform: translateX(-50%) rotate(320deg);
`;

const parser = (name, index) => {
  if (index % 4 === 0)
    return name
  else
    return ""
}

const getBarMargin = (index) => {
  if (index % 4 === 0) {
    return '0 0 0 5px';
  }
  else if (index % 4 === 3) {
    return '0 5px 0 0';
  } else if (index % 4 === 1 || index % 4 === 2) {
    return '0 0';
  }
  return '0 10px';
}

const TotalStuGraph = ({ data, dataGiven }) => {

  // Set color
  const getBarColor = (category) => {
    const colors = ['var(--coffee)', 'var(--coffeeli)', 'var(--orange)', 'var(--orangeli)'];
    const index = percentageData.findIndex(item => item.category === category);
    return colors[index % colors.length];
  }
  // Change order
  const reorder = (input) => {
    for (let i = 0; i < input.length - 1; i += 1) {
      if (i + 1 < input.length && i % 4 === 1) {
          [input[i], input[i + 1]] = [input[i + 1], input[i]];
      }
    }
    return input;
  };
  // Calculate the height
  const forTotal = (data) => {
    return data.flatMap(entry => {
      const allCounts = data.flatMap(entry =>
        Object.values(entry).filter(value => typeof value === 'number')
      );
      const highestCount = Math.max(...allCounts);
      const name = entry.grade_name;
      return Object.entries(entry).filter(([key, value]) => key !== 'grade_name').map(([key, count]) => ({
        name: name,
        category: key,
        count: count,
        percentage: (count / highestCount) * 100
      }));
    });
  }
  const percentageData = reorder(forTotal(data))
  const percentageDataGiven = reorder(forTotal(dataGiven))

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
  
  // Pop up
  const [showPopup, setShowPopup] = useState(false);
  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  return (
    <>
    <BarChartContainer ref={chartRef} onClick={togglePopup}>
      <BarTitle>Further Study by Grade and Gender</BarTitle>
      <Chart>
        {percentageData.map(({ name, category, count, percentage }, index) => (
          <Bar
            key={index}
            color={getBarColor(category)}
            style={{ height: isVisible ? `${percentage}%` : '0%' }}
            margin={getBarMargin(index)}
          >
            <BarText>{parser(name, index)}</BarText>
          </Bar>
        ))}
      </Chart>
    </BarChartContainer>
    <TotalStuGraphZoom percentageData={percentageData} percentageDataGiven={percentageDataGiven}
                       showPopup={showPopup} togglePopup={togglePopup}/>
    </>
  );
};
  
export default TotalStuGraph;