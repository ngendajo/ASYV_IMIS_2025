import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './MyDropzone.css'; 

const MyDropzone = ({ onDrop }) => {
  const [previewSrc, setPreviewSrc] = useState(null);
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      onDrop(acceptedFiles);
      const file = acceptedFiles[0];
      const previewUrl = URL.createObjectURL(file);
      setPreviewSrc(previewUrl);
    },
  });

  return (
    <div {...getRootProps()} className="dropzone">
      <input {...getInputProps()} />
      {previewSrc ? (
        <img src={previewSrc} alt="preview" className="preview-image" />
      ) : (
        <p>Click to select image file or drag image here</p>
      )}
    </div>
  );
};

export default MyDropzone;
