// DynamicTable.js
import React, { useState, useEffect } from 'react';
import './DynamicTable.css';
import { FaSearch } from 'react-icons/fa';

const DynamicTable = ({ mockdata }) => {
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [selectedItemsPerPage, setSelectedItemsPerPage] = useState(itemsPerPage);
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    setFilteredData(mockdata);
  }, [mockdata]);

  const handleSort = (key) => {
    const sortedData = [...filteredData].sort((a, b) => (a[key] > b[key] ? 1 : -1));
    setFilteredData(sortedData);
  };

  const handleFilter = (searchTerm) => {
    const filteredData = mockdata.filter((item) =>
      Object.values(item).some(
        (value) =>
          value !== null &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredData(filteredData);
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(filteredData.length / itemsPerPage)) {
      setCurrentPage(pageNumber);
    }
  };

  const handleItemsPerPageChange = (event) => {
    const newItemsPerPage = parseInt(event.target.value, 10);
    setItemsPerPage(newItemsPerPage);
    setSelectedItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleRowSelection = (rowKey) => {
    const selectedIndex = selectedRows.indexOf(rowKey);
    let newSelectedRows = [];

    if (selectedIndex === -1) {
      newSelectedRows = [...selectedRows, rowKey];
    } else {
      newSelectedRows = selectedRows.filter((key) => key !== rowKey);
    }
    setSelectedRows(newSelectedRows);
  };

  const handleSelectAllRows = () => {
    if (selectedRows.length === filteredData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredData.map((item, index) => index.toString()));
    }
  };

  const renderTableHeaders = () => {
    const firstDataObject = filteredData.length > 0 ? filteredData[0] : {};
    const headerKeys = Object.keys(firstDataObject);

    return (
      <>
        <th key="select-all">
          <input
            type="checkbox"
            checked={selectedRows.length === filteredData.length}
            onChange={handleSelectAllRows}
          />
        </th>
        {headerKeys.map((header) => (
          <th key={header} onClick={() => handleSort(header)}>
            {header}
          </th>
        ))}
      </>
    );
  };

  const renderTableRows = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = filteredData.slice(startIndex, endIndex);

    return currentData.map((item, index) => (
      <tr key={index}>
        <td>
          <input
            type="checkbox"
            checked={selectedRows.includes(index.toString())}
            onChange={() => handleRowSelection(index.toString())}
          />
        </td>
        {Object.keys(item).map((header) => (
          <td key={header} className={item[header] === "Not yet Returned" ? 'invalid' : ''}>
            {item[header]}
          </td>
        ))}
      </tr>
    ));
  };

  return (
    <div className="table-container">
      <div className="input-wrapper filter-container">
        <FaSearch id="search-icon" />
        <input
          type="text"
          placeholder="Search..."
          onChange={(e) => handleFilter(e.target.value)}
        />
      </div>
      <div className="custom-select-container">
        <label>Items Per Page:</label>
        <select
          className="custom-select"
          value={selectedItemsPerPage}
          onChange={handleItemsPerPageChange}
        >
          <option value="50">50</option>
          <option value="100">100</option>
          <option value="200">200</option>
        </select>
      </div>

      <table className="responsive-table">
        <thead>
          <tr>{renderTableHeaders()}</tr>
        </thead>
        <tbody>{renderTableRows()}</tbody>
      </table>
      <div>
        <button
          className="prenext"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="pageno">
          pag. {currentPage} of {Math.ceil(filteredData.length / itemsPerPage)}
        </span>
        <button
          className="prenext"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={
            filteredData.length === 0 ||
            currentPage === Math.ceil(filteredData.length / itemsPerPage)
          }
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DynamicTable;
