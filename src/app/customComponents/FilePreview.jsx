'use client';

import { useEffect, useState } from 'react';

const FileContentViewer = ({ fileUrl, fileType }) => {
    const [dimensions, setDimensions] = useState({
        width: '100%',
        height: '600px',
    });

    // Get file extension from URL
    const fileExtension = fileUrl?.split('.').pop()?.toLowerCase();

    useEffect(() => {
        const type = fileType.toString()?.toLowerCase() || getTypeFromExtension(fileExtension);

        if (type === 'image' || isImageType(fileExtension)) {
            setDimensions({
                width: 'auto',
                height: 'auto',
                maxWidth: '100%',
                maxHeight: '70vh',
            });
        } else if (type === 'video' || isVideoType(fileExtension)) {
            setDimensions({
                width: '800px',
                height: '450px',
                maxWidth: '100%',
            });
        } else if (type === 'audio' || isAudioType(fileExtension)) {
            setDimensions({
                width: '100%',
                height: 'auto',
                maxWidth: '800px',
            });
        }
    }, [fileType, fileExtension]);

    // Helper functions to determine file types
    const isImageType = (ext) => ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext);
    const isVideoType = (ext) => ['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(ext);
    const isAudioType = (ext) => ['mp3', 'wav', 'ogg', 'm4a'].includes(ext);
    const isDocumentType = (ext) => ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext);
    const isTextType = (ext) => ['txt', 'csv', 'json', 'xml'].includes(ext);
    const isArchiveType = (ext) => ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext);

    const getTypeFromExtension = (ext) => {
        if (isImageType(ext)) return 'image';
        if (isVideoType(ext)) return 'video';
        if (isAudioType(ext)) return 'audio';
        if (ext === 'pdf') return 'pdf';
        if (isDocumentType(ext)) return 'document';
        if (ext === 'csv') return 'csv';
        if (isTextType(ext)) return 'text';
        if (isArchiveType(ext)) return 'archive';
        return 'unknown';
    };

    const renderContent = () => {
        const type = fileType.toString()?.toLowerCase() || getTypeFromExtension(fileExtension);

        if (!fileUrl || typeof fileUrl !== "string" || !fileUrl.startsWith("http")) {
            return (
                <div className="flex flex-col items-center justify-center p-8">
                    <div className="text-6xl mb-4">❌</div>
                    <h3 className="text-xl font-semibold">File Not Found</h3>
                    <p className="mt-2 text-gray-500">
                        The file link appears broken or private.
                    </p>
                </div>
            );
        }

        switch (type) {
            case 'image':
                return (
                    <div className="flex justify-center">
                        <img
                            src={fileUrl}
                            alt="Preview"
                            style={dimensions}
                            className="object-contain"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/file-placeholder.png';
                            }}
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
                            <source src={fileUrl} type={`video/${fileExtension}`} />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                );

            case 'audio':
                return (
                    <div className="flex justify-center">
                        <audio controls autoPlay className="w-full max-w-md">
                            <source src={fileUrl} type={`audio/${fileExtension}`} />
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                );

            case 'document':
            case 'spreadsheet':
            case 'presentation':
                // Only use Office Online Viewer for actual Office documents
                if (isDocumentType(fileExtension)) {
                    return (
                        <iframe
                            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
                            style={dimensions}
                            className="border-0 w-full"
                            title="Office Document"
                        />
                    );
                }
            // Fall through to default case for non-Office files

            case 'csv':
            case 'text':
            case 'archive':
            default:
                return (
                    <div className="flex flex-col items-center justify-center p-8">
                        <div className="text-6xl mb-4">📄</div>
                        <h3 className="text-xl font-semibold">File Preview Not Available</h3>
                        <p className="mt-2 text-gray-500">
                            For best results, download and view the file directly
                        </p>
                        <a
                            href={fileUrl}
                            download
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Download {fileExtension?.toUpperCase() || 'File'}
                        </a>
                    </div>
                );

            case 'svg':
                return (
                    <div className="flex justify-center">
                        <object
                            data={fileUrl}
                            type="image/svg+xml"
                            style={dimensions}
                            className="object-contain"
                        >
                            <img src={fileUrl} alt="SVG preview" />
                        </object>
                    </div>
                );
        }
    };

    return renderContent();
};

export default FileContentViewer;