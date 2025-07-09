import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios'; // make sure axios is installed
import baseUrl from '../../api/baseUrl';

// Styled Components
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
    margin-bottom: -50px;
`;

const Chart = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    width: 800px;
    height: 300px;
    padding: 0 50px;
    border-bottom: 2px solid var(--brown);
    transition: height 0.5s ease;
`;

const Bar = styled.div`
    background-color: ${props => props.color || 'var(--black)'};
    position: relative;
    width: 500px;
    height: 100%;
    margin: 0 20px;
    transition: height 1s ease;
`;

const BarText = styled.span`
    color: var(--brown);
    font-family: Medium;
    font-size: 18px;
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

const GenderChart = () => {
    const [females, setFemales] = useState(0);
    const [males, setMales] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const chartRef = useRef(null);

    useEffect(() => {
        // Fetch data from backend
        axios.get(baseUrl +'/gender-distribution/') 
            .then((res) => {
                setFemales(res.data.females || 0);
                setMales(res.data.males || 0);
            })
            .catch((err) => console.error('Failed to fetch gender data', err));
    }, []);

    useEffect(() => {
        const chartElement = chartRef.current;
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.8 }
        );

        if (chartElement) observer.observe(chartElement);
        return () => chartElement && observer.unobserve(chartElement);
    }, []);

    const total = females + males;
    const femalePercentage = total ? (females / total) * 100 : 0;
    const malePercentage = total ? (males / total) * 100 : 0;

    return (
        <BarChartContainer ref={chartRef}>
            <BarTitle>Gender Distribution</BarTitle>
            <Chart>
                <Bar color="var(--green)" style={{ height: isVisible ? `${femalePercentage}%` : '0%' }}>
                    <BarText>Females</BarText>
                    <BarNumber>{females}</BarNumber>
                </Bar>
                <Bar color="var(--orange)" style={{ height: isVisible ? `${malePercentage}%` : '0%' }}>
                    <BarText>Males</BarText>
                    <BarNumber>{males}</BarNumber>
                </Bar>
                <Bar color="var(--brown)" style={{ height: isVisible ? `100%` : '0%' }}>
                    <BarText>Total</BarText>
                    <BarNumber>{total}</BarNumber>
                </Bar>
            </Chart>
        </BarChartContainer>
    );
};

export default GenderChart;
