import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useRbac } from "../hooks/use-rbac";
import UploadDialog from "./UploadDialog.tsx";


// Download helper function for direct file download using blob (fetch)
async function downloadFile(url: string, filename?: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    if (filename) link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    alert('Failed to download file.');
  }
}

// Download helper function for blob content (generated in browser)
function downloadBlob(content: string, filename: string) {
  const blob = new Blob([content], { type: 'application/octet-stream' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export interface MaterialItem {
  id: string;
  title: string;
  description: string;
  fileName: string;
  uploadedAt: string;
  linkUrl?: string;
  storagePath?: string;
  videoLink?: string;
}

interface SubjectSectionProps {
  title: string;
  items: MaterialItem[];
  subjectId: string;
  sectionKey: string;
  onEdit?: (item: MaterialItem, sectionKey: string) => void;
  onDelete?: (item: MaterialItem, sectionKey: string) => void;
  onReload?: () => void;
}

const SubjectSection = ({ title, items, subjectId, sectionKey, onEdit, onDelete, onReload }: SubjectSectionProps) => {
  const { hasRole } = useRbac();
  const canEdit = hasRole(["admin", "super_admin"]);

  return (
    <section className="glass-card p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="section-title">{title}</h3>
          <p className="text-sm text-white/60">Resources listed in order.</p>
        </div>
        {canEdit && (
          <UploadDialog subjectId={subjectId} sectionKey={sectionKey} onUploaded={onReload} />
        )}
      </div>
      <div className="mt-4">
        {items.length === 0 ? (
          <div className="text-sm text-white/60">
            No materials yet. {canEdit ? "Upload the first resource." : ""}
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {items.map((item) => (
              <div key={item.id} className="flex items-start gap-3 py-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-neon-blue" aria-label="Book">
                  📖
                </span>
                <div className="flex-1">
                  {item.title ? <h4 className="font-medium">{item.title}</h4> : null}
                  {item.description ? (
                    <p className="text-sm text-white/60">{item.description}</p>
                  ) : null}
                  <p className="text-xs text-white/40">Last update {item.uploadedAt}</p>
                </div>
                <div className="flex items-center gap-2">
                  {/* View Button: open file in new tab if storagePath or linkUrl exists */}
                  {item.storagePath || item.linkUrl ? (
                    <Button asChild variant="info" size="sm">
                      <a
                        href={item.linkUrl || `/uploads/${item.storagePath}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </a>
                    </Button>
                  ) : (
                    <Button variant="info" size="sm" disabled>
                      View
                    </Button>
                  )}
                  {/* Download Button: use JS function to trigger download as blob */}
                  {item.storagePath || item.linkUrl ? (
                    <Button
                      variant="download"
                      size="sm"
                      onClick={() => downloadFile(item.linkUrl || `/uploads/${item.storagePath}`, item.fileName)}
                    >
                      Download
                    </Button>
                  ) : (
                    <Button variant="download" size="sm" disabled>
                      Download
                    </Button>
                  )}
                  {canEdit && (
                    <>
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => onEdit?.(item, sectionKey)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onDelete?.(item, sectionKey)}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-end">
        <Button asChild variant="back" className="w-full sm:w-auto">
          <Link to="/">Back to Dashboard</Link>
        </Button>
      </div>
    </section>
  );
};

export default SubjectSection;
