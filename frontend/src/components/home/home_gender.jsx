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
    margin-bottom: -50px;
`;

const Chart = styled.div`
    // display
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    // box
    width: 800px;
    height: 300px;
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
    margin: 0 20px;
    transition: height 1s ease;
`;

const BarText = styled.span`
    // font
    color: var(--brown);
    font-family: Medium;
    font-size: 18px;
    // box
    position: absolute;
    bottom: -40px;
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

const GenderChart = ({ females, males }) => {
    const total = females + males;
    const femalePercentage = (females / total) * 100;
    const malePercentage = (males / total) * 100;

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
            <BarTitle>Gender Distribution</BarTitle>
            <Chart ref={chartRef}>
                <Bar color="var(--green)" style={{ height: isVisible ? `${femalePercentage}%` : '0%' }}>
                    <BarText>Females</BarText>
                    <BarNumber>{females}</BarNumber>
                </Bar>
                <Bar color="var(--orange)" style={{ height: isVisible ? `${malePercentage}%` : '0%' }}>
                    <BarText>Males</BarText>
                    <BarNumber>{males}</BarNumber>
                </Bar>
                <Bar color="var(--orange)" style={{ height: isVisible ? `${100}%` : '0%' }}>
                    <BarText>Total</BarText>
                    <BarNumber>{total}</BarNumber>
                </Bar>
            </Chart>
        </BarChartContainer>
        
    );
};

export default GenderChart;