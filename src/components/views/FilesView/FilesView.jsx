import { useState, useEffect } from 'react';
import './FilesView.css';

/**
 * FilesView Component
 *
 * File management with:
 * - File list grid
 * - File type icons
 * - Upload area
 * - File details panel
 *
 * @param {Object} props
 * @param {Object} props.snapshot - Current workspace snapshot
 * @param {Function} props.onCreateFile - Handler to create new file
 */
export function FilesView({ snapshot = {}, onCreateFile }) {
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [filesSplitWidth, setFilesSplitWidth] = useState(260);
  const [splitDrag, setSplitDrag] = useState({
    active: false,
    startX: 0,
    startWidth: 260
  });

  // Extract data from snapshot
  const files = snapshot.files || [];

  // Select first file by default
  const selectedFile = files.length === 0
    ? null
    : files.find((f) => f.id === selectedFileId) || files[0];

  useEffect(() => {
    if (files.length > 0 && !selectedFileId) {
      setSelectedFileId(files[0].id);
    }
  }, [files, selectedFileId]);

  // Get file icon based on type
  const getFileIcon = (type) => {
    const icons = {
      'PDF': '📄',
      'DOCX': '📝',
      'XLSX': '📊',
      'PPTX': '📽️',
      'TXT': '📋',
      'MD': '📓',
      'IMAGE': '🖼️',
      'ZIP': '🗜️',
      'default': '📁'
    };
    return icons[type] || icons.default;
  };

  // Split panel drag handlers
  const startSplitDrag = (event) => {
    event.preventDefault();
    setSplitDrag({
      active: true,
      startX: event.clientX,
      startWidth: filesSplitWidth
    });
  };

  const handleSplitMouseMove = (event) => {
    if (!splitDrag.active) return;
    const delta = event.clientX - splitDrag.startX;
    let next = splitDrag.startWidth + delta;
    if (next < 180) next = 180;
    if (next > 480) next = 480;
    setFilesSplitWidth(next);
  };

  const endSplitDrag = () => {
    if (!splitDrag.active) return;
    setSplitDrag((prev) => ({ ...prev, active: false }));
  };

  if (files.length === 0) {
    return (
      <div className="files-view">
        <div className="files-empty">
          No files configured in this demo snapshot.
        </div>
      </div>
    );
  }

  return (
    <div
      className="files-view"
      onMouseMove={handleSplitMouseMove}
      onMouseUp={endSplitDrag}
      onMouseLeave={endSplitDrag}
    >
      <div className="files-layout">
        <div className="files-list" style={{ width: filesSplitWidth }}>
          <div className="files-list__header">
            <div className="files-list__title">Files</div>
            <div className="files-list__count">{files.length}</div>
          </div>
          <table className="files-table">
            <thead>
              <tr>
                <th className="files-table__th">Name</th>
                <th className="files-table__th">Type</th>
                <th className="files-table__th">Size</th>
                <th className="files-table__th">Owner</th>
                <th className="files-table__th">Updated</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => {
                const active = selectedFile && selectedFile.id === file.id;
                return (
                  <tr
                    key={file.id}
                    className={`files-row ${active ? 'files-row--active' : ''}`}
                    onClick={() => setSelectedFileId(file.id)}
                  >
                    <td className="files-table__td files-table__td--name">
                      <span className="file-icon">{getFileIcon(file.type)}</span>
                      <span className="file-name">{file.name}</span>
                    </td>
                    <td className="files-table__td">{file.type}</td>
                    <td className="files-table__td">{file.size}</td>
                    <td className="files-table__td">{file.owner}</td>
                    <td className="files-table__td">{file.updated}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div
          className={`splitter-vertical ${
            splitDrag.active ? 'splitter-vertical--active' : ''
          }`}
          onMouseDown={startSplitDrag}
        />
        {selectedFile ? (
          <div className="files-detail">
            <div className="files-detail-header">
              <div className="files-detail-info">
                <div className="file-icon-large">{getFileIcon(selectedFile.type)}</div>
                <div>
                  <div className="files-detail-title">{selectedFile.name}</div>
                  <div className="files-detail-meta">
                    {selectedFile.type} · {selectedFile.size} · {selectedFile.owner}
                  </div>
                </div>
              </div>
              <div className="files-detail-actions">
                <button
                  className="files-detail-button"
                  type="button"
                  disabled
                >
                  Open (demo)
                </button>
                <button
                  className="files-detail-button files-detail-button--primary"
                  type="button"
                  onClick={() => {
                    if (onCreateFile) onCreateFile();
                  }}
                >
                  Upload (demo)
                </button>
              </div>
            </div>
            <div className="files-detail-body">
              <div className="files-detail-section">
                <div className="files-detail-section__title">File Information</div>
                <div className="files-detail-property">
                  <span className="files-detail-property__label">Name:</span>
                  <span className="files-detail-property__value">{selectedFile.name}</span>
                </div>
                <div className="files-detail-property">
                  <span className="files-detail-property__label">Type:</span>
                  <span className="files-detail-property__value">{selectedFile.type}</span>
                </div>
                <div className="files-detail-property">
                  <span className="files-detail-property__label">Size:</span>
                  <span className="files-detail-property__value">{selectedFile.size}</span>
                </div>
                <div className="files-detail-property">
                  <span className="files-detail-property__label">Owner:</span>
                  <span className="files-detail-property__value">{selectedFile.owner}</span>
                </div>
                <div className="files-detail-property">
                  <span className="files-detail-property__label">Last Updated:</span>
                  <span className="files-detail-property__value">{selectedFile.updated}</span>
                </div>
              </div>
              <div className="files-detail-preview">
                <div className="files-detail-section__title">Preview</div>
                <div className="files-preview-placeholder">
                  <div className="file-icon-preview">{getFileIcon(selectedFile.type)}</div>
                  <div className="files-preview-text">
                    In a real build this panel would show a preview or metadata for the selected file.
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="files-placeholder">No file selected.</div>
        )}
      </div>
    </div>
  );
}
