import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import baseUrl from '../../api/baseUrl';

const BarChartContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 150px;
`;

const BarTitle = styled.div`
  color: var(--brown);
  font-family: Bold;
  font-size: 24px;
  letter-spacing: 0.9px;
  margin-bottom: 20px;
`;

const Chart = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  width: 1000px;
  height: 500px;
  padding: 0 50px;
  border-bottom: 2px solid var(--brown);
`;

const Bar = styled.div`
  background-color: ${(props) => props.color || 'var(--black)'};
  position: relative;
  width: 80px;
  margin: 0 12px;
  transition: height 1s ease;
  height: ${(props) => props.height};
  min-height: 5px;
`;

const BarShort = styled.span`
  color: var(--brown);
  font-family: Medium;
  font-size: 18px;
  text-align: center;
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
`;

const BarNumber = styled.span`
  color: var(--brown);
  font-family: Regular;
  font-size: 16px;
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
`;

const colors = ['var(--green)', 'var(--brown)', 'var(--orange)', 'var(--coffee)', 'var(--yellow)'];

const CombinationChart = () => {
  const [data, setData] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const chartRef = useRef(null);

  // Fetch data from API
  useEffect(() => {
    fetch(baseUrl + '/combination-counts')  
      .then((res) => res.json())
      .then((apiData) => {
        const transformed = apiData.reduce((acc, item) => {
          acc[item.combination__abbreviation] = item.alumni_count;
          return acc;
        }, {});
        setData(transformed);
      })
      .catch((err) => {
        console.error('Failed to fetch data:', err);
      });
  }, []);

  // Intersection observer for animation
  useEffect(() => {
    const chartElement = chartRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.8 }
    );
    if (chartElement) observer.observe(chartElement);

    return () => {
      if (chartElement) observer.unobserve(chartElement);
    };
  }, []);

  const totalCount = Object.values(data).reduce((acc, count) => acc + count, 0);
  const percentageData = Object.entries(data).map(([combination, count]) => ({
    combination,
    count,
    percentage: totalCount ? (count / totalCount) * 100 : 0,
  }));

  const getBarColor = (index) => colors[index % colors.length];

  return (
    <BarChartContainer ref={chartRef}>
      <BarTitle>Combination Distribution</BarTitle>
      <Chart>
        {percentageData.length > 0 ? (
          percentageData.map(({ combination, count, percentage }, index) => (
            <Bar
              key={combination}
              color={getBarColor(index)}
              height={isVisible ? `${percentage}%` : '0%'}
              title={`${combination}: ${count}`}
            >
              <BarShort>{combination}</BarShort>
              <BarNumber>{count}</BarNumber>
            </Bar>
          ))
        ) : (
          <div>Loading data...</div>
        )}
      </Chart>
    </BarChartContainer>
  );
};

export default CombinationChart;
