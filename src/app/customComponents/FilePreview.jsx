'use client';

import { useEffect, useState } from 'react';

const FileContentViewer = ({ fileUrl, fileType }) => {
  const [dimensions, setDimensions] = useState({
    width: '100%',
    height: '600px',
  });

  useEffect(() => {
    const type = fileType?.toLowerCase();

    if (type === 'image') {
      setDimensions({
        width: 'auto',
        height: 'auto',
        maxWidth: '100%',
        maxHeight: '70vh',
      });
    } else if (type === 'video') {
      setDimensions({
        width: '800px',
        height: '450px',
        maxWidth: '100%',
      });
    }
  }, [fileType]);

  const renderContent = () => {
    const type = fileType?.toLowerCase();

    switch (type) {
      case 'image':
        return (
          <div className="flex justify-center">
            <img
              src={fileUrl}
              alt="Preview"
              style={dimensions}
              className="object-contain"
            />
          </div>
        );

      case 'pdf':
        return (
          <iframe
            src={`${fileUrl}#view=FitH`}
            style={dimensions}
            className="border-0 w-full"
            title="PDF document"
          />
        );

      case 'video':
        return (
          <div className="flex justify-center">
            <video controls autoPlay style={dimensions} className="bg-black">
              <source src={fileUrl} type={`video/${fileUrl.split('.').pop()}`} />
              Your browser does not support the video tag.
            </video>
          </div>
        );

      case 'audio':
        return (
          <div className="flex justify-center">
            <audio controls autoPlay className="w-full max-w-md">
              <source src={fileUrl} type={`audio/${fileUrl.split('.').pop()}`} />
              Your browser does not support the audio element.
            </audio>
          </div>
        );

      case 'document':
      case 'spreadsheet':
      case 'presentation':
        return (
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
            style={dimensions}
            className="border-0 w-full"
            title="Office Document"
          />
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center p-8">
            <iframe
              src={fileUrl}
              style={dimensions}
              className="border-0 w-full"
              title="File preview"
            />
            <p className="mt-4 text-gray-500">
              For best results, download and view the file directly.
            </p>
          </div>
        );
    }
  };

  return renderContent();
};

export default FileContentViewer;
