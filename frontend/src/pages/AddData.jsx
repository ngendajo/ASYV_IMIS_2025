import React, { useState, useEffect } from "react";
import "./AddData.css";
import baseUrl from "../api/baseUrl";
import axios from "../api/axios";
import GradeForm from "../components/AddData/addGradeData";
import GradeList from "../components/AddData/listGradeData";
import AddStudents from "../components/AddData/addKidData";
import AddStaff from "../components/AddData/addStaffData";
import CombinationForm from "../components/AddData/addCombination";
import LeapForm from "../components/AddData/addLeap";
import LeapList from "../components/AddData/listLeap";
import CombinationList from "../components/AddData/listCombination";
import useAuth from "../hooks/useAuth";

const AddData = () => {
  const { auth } = useAuth();
  const dataSections = [
    {
      key: "leap",
      title: "Add Leaps",
      FormComponent: LeapForm,
      ListComponent: LeapList,
      apiEndpoint: "/leaps",
    },
    {
      key: "combination",
      title: "Add Combinations",
      FormComponent: CombinationForm,
      ListComponent: CombinationList,
      apiEndpoint: "/combinations",
    },
    {
      key: "grade",
      title: "Add Grade & Families",
      FormComponent: GradeForm,
      ListComponent: GradeList,
      apiEndpoint: "/grades",
      requireSuperuser: true,
    },
    {
      key: "students",
      title: "Add Students",
      FormComponent: AddStudents,
      // You can add ListComponent if you have one
      apiEndpoint: "/kids",
      requireSuperuser: true,
    },
    {
      key: "staff",
      title: "Add Staff Account",
      FormComponent: AddStaff,
      apiEndpoint: "/users",
      requireSuperuser: true,
    },
    // Add more sections here as needed
  ];
  const [expanded, setExpanded] = useState(null);
  const [dataItems, setDataItems] = useState({}); // e.g. { grade: [], students: [], staff: [] }
  const [editingItem, setEditingItem] = useState(null);

  const toggleSection = (key) => {
    if (expanded === key) {
      setExpanded(null);
      setEditingItem(null);
    } else {
      setExpanded(key);
      fetchDataForSection(key);
    }
  };
  
  const fetchDataForSection = async (key) => {
    try {
      const section = dataSections.find((s) => s.key === key);
      if (!section) return;
  
      const response = await axios.get(`${baseUrl}${section.apiEndpoint}/`);
      setDataItems((prev) => ({
        ...prev,
        [key]: response.data,
      }));
    } catch (error) {
      console.error(`Error fetching ${key} data:`, error);
    }
  };
  
  return (
    <div className="add-data-container">
      <h1 className="page-title">Add Data</h1>
  
      {dataSections
        .filter(section => !section.requireSuperuser || auth.user?.is_superuser)
        .map(({ key, title, FormComponent, ListComponent }) => (
        <div className="white-card" key={key}>
          <div className="section-header" onClick={() => toggleSection(key)}>
            <h2>{title}</h2>
            <span>{expanded === key ? "▲" : "▼"}</span>
          </div>
  
          {expanded === key && (
            <>
              <FormComponent
                item={editingItem && editingItem.section === key ? editingItem.data : null}
                onSuccess={() => {
                  fetchDataForSection(key);
                  setEditingItem(null);
                }}
                onCancel={() => setEditingItem(null)}
              />
  
              {ListComponent && (
                <ListComponent
                  items={dataItems[key] || []}
                  onEdit={(item) => setEditingItem({ section: key, data: item })}
                  onDelete={async (id) => {
                    try {
                      await axios.delete(`${baseUrl}${dataSections.find(s => s.key === key).apiEndpoint}/${id}/`);
                      fetchDataForSection(key);
                    } catch (error) {
                      console.error(`Delete error in ${key}:`, error);
                    }
                  }}
                />
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
};  


export default AddData;

