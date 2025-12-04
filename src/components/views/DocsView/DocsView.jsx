import { useState, useEffect, useRef } from 'react';
import './DocsView.css';

/**
 * DocsView Component
 *
 * Document management with:
 * - Document list sidebar
 * - Markdown editor/viewer
 * - Mermaid diagram support
 * - Upload functionality
 *
 * @param {Object} props
 * @param {Object} props.snapshot - Current workspace snapshot
 * @param {Function} props.onCreateDoc - Handler to create new document
 * @param {Function} props.onUploadDoc - Handler to upload document
 */
export function DocsView({ snapshot = {}, onCreateDoc, onUploadDoc }) {
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [docsSplitWidth, setDocsSplitWidth] = useState(260);
  const [splitDrag, setSplitDrag] = useState({
    active: false,
    startX: 0,
    startWidth: 260
  });

  const docsContentRef = useRef(null);

  // Extract data from snapshot
  const docs = snapshot.docs || [];

  // Select first document by default
  const selectedDoc = docs.length === 0
    ? null
    : docs.find((d) => d.id === selectedDocId) || docs[0];

  useEffect(() => {
    if (docs.length > 0 && !selectedDocId) {
      setSelectedDocId(docs[0].id);
    }
  }, [docs, selectedDocId]);

  // Render Mermaid diagrams in docs
  useEffect(() => {
    if (!docsContentRef.current) return;
    if (typeof window.mermaid === 'undefined') return;

    setTimeout(() => {
      const mermaidBlocks = docsContentRef.current.querySelectorAll('pre code.language-mermaid');
      if (mermaidBlocks.length === 0) return;

      mermaidBlocks.forEach((block) => {
        const code = block.textContent;
        const container = document.createElement('div');
        container.className = 'mermaid';
        container.textContent = code;

        const pre = block.parentElement;
        if (pre && pre.tagName === 'PRE') {
          pre.parentElement.replaceChild(container, pre);
        }
      });

      try {
        const elements = docsContentRef.current.querySelectorAll('.mermaid');
        if (elements.length > 0) {
          window.mermaid.run({ nodes: elements });
        }
      } catch (e) {
        console.error('Mermaid rendering error:', e);
      }
    }, 100);
  }, [selectedDocId, selectedDoc]);

  // Split panel drag handlers
  const startSplitDrag = (event) => {
    event.preventDefault();
    setSplitDrag({
      active: true,
      startX: event.clientX,
      startWidth: docsSplitWidth
    });
  };

  const handleSplitMouseMove = (event) => {
    if (!splitDrag.active) return;
    const delta = event.clientX - splitDrag.startX;
    let next = splitDrag.startWidth + delta;
    if (next < 180) next = 180;
    if (next > 480) next = 480;
    setDocsSplitWidth(next);
  };

  const endSplitDrag = () => {
    if (!splitDrag.active) return;
    setSplitDrag((prev) => ({ ...prev, active: false }));
  };

  const handleUploadFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const fileName = file.name.replace(/\.(md|markdown)$/i, '');
      const today = new Date().toISOString().slice(0, 10);

      if (onUploadDoc) {
        onUploadDoc({
          title: fileName,
          content,
          date: today
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (docs.length === 0) {
    return (
      <div className="docs-view">
        <div className="docs-empty">
          No docs configured in this demo snapshot.
        </div>
      </div>
    );
  }

  return (
    <div
      className="docs-view"
      onMouseMove={handleSplitMouseMove}
      onMouseUp={endSplitDrag}
      onMouseLeave={endSplitDrag}
    >
      <div className="docs-layout">
        <div className="docs-list" style={{ width: docsSplitWidth }}>
          <div className="docs-list__header">
            <div className="docs-list__title">Documents</div>
            <div className="docs-list__count">{docs.length}</div>
          </div>
          {docs.map((doc) => {
            const active = selectedDoc && selectedDoc.id === doc.id;
            return (
              <div
                key={doc.id}
                className={`docs-list-item ${
                  active ? 'docs-list-item--active' : ''
                }`}
                onClick={() => setSelectedDocId(doc.id)}
              >
                <div className="docs-list-item-title">{doc.title}</div>
                <div className="docs-list-item-meta">
                  {doc.owner} · updated {doc.updated}
                </div>
              </div>
            );
          })}
        </div>
        <div
          className={`splitter-vertical ${
            splitDrag.active ? 'splitter-vertical--active' : ''
          }`}
          onMouseDown={startSplitDrag}
        />
        {selectedDoc ? (
          <div className="docs-detail">
            <div className="docs-detail-header">
              <div>
                <div className="docs-detail-title">{selectedDoc.title}</div>
                <div className="docs-detail-meta">
                  Owner: {selectedDoc.owner} · Last updated {selectedDoc.updated}
                </div>
              </div>
              <div className="docs-detail-actions">
                <label
                  className="docs-detail-button"
                  style={{ cursor: 'pointer', margin: 0 }}
                >
                  Upload .md file
                  <input
                    type="file"
                    accept=".md,.markdown"
                    style={{ display: 'none' }}
                    onChange={handleUploadFile}
                  />
                </label>
                <button
                  className="docs-detail-button"
                  type="button"
                  onClick={() => {
                    if (onCreateDoc) onCreateDoc();
                  }}
                >
                  New doc (demo)
                </button>
              </div>
            </div>
            <div
              ref={docsContentRef}
              className="docs-detail-body markdown-content"
              dangerouslySetInnerHTML={{
                __html:
                  typeof window.marked !== 'undefined' && selectedDoc.summary
                    ? window.marked.parse(selectedDoc.summary)
                    : selectedDoc.summary
              }}
            />
          </div>
        ) : (
          <div className="docs-placeholder">No document selected.</div>
        )}
      </div>
    </div>
  );
}
