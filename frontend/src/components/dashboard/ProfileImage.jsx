import React, { useState } from 'react';
import styled from 'styled-components';
import baseUrlforImg from '../../api/baseUrlforImg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import Dropzone from 'react-dropzone';
import useAuth from '../../hooks/useAuth';

const EditIcon = styled(FontAwesomeIcon)`
  position: absolute;
  bottom: 0;
  right: 0;
  color: var(--orange);
  cursor: pointer;
`;

const SubmitButton = styled.button`
  margin-top: 10px;
  padding: 8px 16px;
  font-size: 16px;
  background-color: var(--orange);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:disabled {
    background-color: gray;
    cursor: not-allowed;
  }
`;

const ProfileImage = ({ user, onEdit }) => {
  const [isDropzoneOpen, setIsDropzoneOpen] = useState(false);
  const current = new Date();
  const { auth } = useAuth();

  const onDrop = (files) => {
    const fileSize = files[0].size; // size in bytes
    const maxSize = 1024 * 200; // 200 in bytes

    if (fileSize > maxSize) {
      alert("File size exceeds 200k. Please choose a smaller file.");
      return;
    }
    if (files.length > 0) {
      const imgname = `${auth.user.id}_${current.getTime()}.${files[0].name.split('.').pop()}`;

      const formData = new FormData();
      formData.append("image_url", files[0], imgname);;
        // Call the parent component's onEdit function to handle the upload
        onEdit(formData);
        setIsDropzoneOpen(!isDropzoneOpen);
      }
  };

  const handleEditClick = () => {
    setIsDropzoneOpen(!isDropzoneOpen);
  }; 
//console.log("imeage", auth.user)
  return (
    <div className="profile-container" style={{ position: 'relative' }}>
      <img
        src={baseUrlforImg + user[0]?.image_url}
        //alt={`${user[0].first_name} ${user[0].last_name}`}
        className="profile-image"
      />
      <EditIcon icon={faEdit} onClick={handleEditClick} />
      {isDropzoneOpen && (
        <div>
          <Dropzone onDrop={onDrop} multiple={false}>
            {({ getRootProps, getInputProps }) => (
              <section>
                <div {...getRootProps({ className: "dropzone" })}>
                  <input {...getInputProps()} />
                    "Drag and drop an image here, or click to select it"
                </div>
              </section>
            )}
          </Dropzone>
        </div>
      )}
    </div>
  );
};

export default ProfileImage;
