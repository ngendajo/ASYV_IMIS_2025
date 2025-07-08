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
      title: "Leaps",
      FormComponent: LeapForm,
      ListComponent: LeapList,
      apiEndpoint: "/leaps",
    },
    {
      key: "combination",
      title: "Combinations",
      FormComponent: CombinationForm,
      ListComponent: CombinationList,
      apiEndpoint: "/combinations",
    },
    {
      key: "grade",
      title: "Grade & Families",
      FormComponent: GradeForm,
      ListComponent: GradeList,
      apiEndpoint: "/grades",
      requireSuperuser: true,
    },
    {
      key: "students",
      title: "Students",
      FormComponent: AddStudents,
      apiEndpoint: "/kids",
      requireSuperuser: true,
    },
    {
      key: "staff",
      title: "Staff Account",
      FormComponent: AddStaff,
      apiEndpoint: "/users",
      requireSuperuser: true,
    },
  ];

  const [activeSection, setActiveSection] = useState(null); // which key is expanded
  const [viewMode, setViewMode] = useState(null); // 'form' or 'list'
  const [dataItems, setDataItems] = useState({});
  const [editingItem, setEditingItem] = useState(null);

  const openSection = (key, mode) => {
    if (activeSection === key && viewMode === mode) {
      setActiveSection(null);
      setViewMode(null);
      setEditingItem(null);
    } else {
      setActiveSection(key);
      setViewMode(mode);
      if (mode === "list") fetchDataForSection(key);
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
        .filter((section) => !section.requireSuperuser || auth.user?.is_superuser)
        .map(({ key, title, FormComponent, ListComponent }) => (
          <div className="white-card" key={key}>
            <div className="section-header with-controls">
              <h2>{title}</h2>
              <div className="section-controls">
                <button onClick={() => openSection(key, "form")}>
                  {activeSection === key && viewMode === "form" ? "Close Form" : "Add"}
                </button>
                {ListComponent && (
                  <button onClick={() => openSection(key, "list")}>
                    {activeSection === key && viewMode === "list" ? "Close List" : "View"}
                  </button>
                )}
              </div>
            </div>

            {activeSection === key && (
              <div className="section-content">
                {viewMode === "form" && (
                  <>
                    <FormComponent
                      item={editingItem?.section === key ? editingItem.data : null}
                      onSuccess={() => {
                        fetchDataForSection(key);
                        setEditingItem(null);
                      }}
                      onCancel={() => setEditingItem(null)}
                    />
                    {ListComponent && (
                      <button
                        className="view-bottom-button"
                        onClick={() => openSection(key, "list")}
                      >
                        View Existing Entries →
                      </button>
                    )}
                  </>
                )}

                {viewMode === "list" && ListComponent && (
                  <>
                    <ListComponent
                      items={dataItems[key] || []}
                      onEdit={(item) => {
                        setEditingItem({ section: key, data: item });
                        setViewMode("form");
                      }}
                      onDelete={async (id) => {
                        try {
                          await axios.delete(`${baseUrl}${dataSections.find((s) => s.key === key).apiEndpoint}/${id}/`);
                          fetchDataForSection(key);
                        } catch (error) {
                          console.error(`Delete error in ${key}:`, error);
                        }
                      }}
                    />
                    <button
                      className="view-bottom-button"
                      onClick={() => openSection(key, "form")}
                    >
                      Add New Entry →
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
    </div>
  );
};

export default AddData;
