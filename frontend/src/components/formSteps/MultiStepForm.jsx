import {useState, useEffect} from "react";
import { useForm, useStep } from "react-hooks-helper";

import BirthInfo from "./BirthInfo";
import PlaceOfBirth from "./PlaceOfBirth";
import ASYVInfo from "./ASYVInfo";
import Marks from "./Marks";
import NationalExam from "./NationalExam";
import Address from "./Address";
import AddressMoreInfo from "./AddressMoreInfo";
import Review from "./Review";
import Submit from "./Submit";
import { useParams } from 'react-router';

import "./style.css";

const steps = [
  { id: "birthinfo" },
  { id: "placeofbirth" },
  { id: "asyvinfo" },
  { id: "marks" },
  { id: "nationalexam" },
  { id: "address" },
  { id: "addressmoreinfo" },
  { id: "review" },
  { id: "submit" }
];



const MultiStepForm = () => {
  
  const params = useParams();
  
  const currentDate = new Date('2023-05-15');
  const defaultDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
  const defaultData = {
    user: params.id,
    date_of_birth: defaultDate,
    gender: "",
    father: "NN",
    mother: "NN",
    did_you_born_in_rwanda: "Yes",
    place_of_birth_district_or_country: "",
    place_of_birth_sector_or_city: "",
    family: "",
    combination: "",
    eps: "",
    s4marks: 0.0,
    s5marks: 0.0,
    s6marks: 0.0,
    ne: 0.0,
    maxforne: 0.0,
    decision: "fail",
    life_status: "Alive",
    marital_status: "Single",
    currresidence_in_rwanda: "Yes",
    currresidence_district_or_country: "Ruh",
    currresidence_sector_or_city: "NN",
    kids: "No"
  };
  const [formData, setForm] = useForm(defaultData);
  const { step, navigation } = useStep({ initialStep: 0, steps });
  const { id } = step;

  const props = { formData, setForm, navigation };

  switch (id) {
    case "birthinfo":
      return <BirthInfo {...props} />;
    case "placeofbirth":
      return <PlaceOfBirth {...props} />;
    case "asyvinfo":
      return <ASYVInfo {...props} />;
    case "marks":
      return <Marks {...props} />;
    case "nationalexam":
      return <NationalExam {...props} />;
    case "address":
      return <Address {...props} />;
      case "addressmoreinfo":
        return <AddressMoreInfo {...props} />;
    case "review":
      return <Review {...props} />;
    case "submit":
      return <Submit {...props} />;
    default:
      return null;
  }
};

export default MultiStepForm;