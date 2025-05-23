import { addDocumentHistory } from "@/services/documentHistoryApi";

export interface FieldChange {
  name: string;
  oldValue: string;
  newValue: string;
}

/**
 * Logs a document being opened
 */
export const logDocumentOpened = async (documentId: string) => {
  if (!documentId) return null;
  return addDocumentHistory(documentId, "Opened the document");
};

/**
 * Logs a document being downloaded
 */
export const logDocumentDownloaded = async (documentId: string) => {
  if (!documentId) return null;
  return addDocumentHistory(documentId, "Downloaded the document");
};

/**
 * Logs a document being scanned
 */
export const logDocumentScanned = async (documentId: string) => {
  if (!documentId) return null;
  return addDocumentHistory(documentId, "Scanned new document");
};

/**
 * Logs a document being uploaded
 */
export const logDocumentUploaded = async (documentId: string) => {
  if (!documentId) return null;
  return addDocumentHistory(documentId, "Uploaded new document");
};

/**
 * Logs when a document is submitted to another role
 */
export const logDocumentSubmitted = async (documentId: string, targetRole: string) => {
  if (!documentId) return null;
  return addDocumentHistory(documentId, `Submitted document for ${targetRole}`);
};

/**
 * Logs when a document fields are changed
 */
export const logFieldChanges = async (documentId: string, changedFields: FieldChange[]) => {
  if (!documentId || changedFields.length === 0) return null;
  
  const changeDescription = changedFields.length === 1
    ? `Changed the ${changedFields[0].name} field`
    : `Changed ${changedFields.length} fields`;
    
  const detailedChanges = changedFields.map(field => 
    `${field.name}: changed from "${field.oldValue || ''}" to "${field.newValue}"`
  ).join('\n');
    
  return addDocumentHistory(documentId, changeDescription, detailedChanges);
};

/**
 * Logs when a document is published
 */
export const logDocumentPublished = async (documentId: string) => {
  if (!documentId) return null;
  return addDocumentHistory(documentId, "Published the document");
};

/**
 * Logs when a document is saved as draft
 */
export const logDocumentSavedAsDraft = async (documentId: string) => {
  if (!documentId) return null;
  return addDocumentHistory(documentId, "Saved document as draft");
};

/**
 * Logs when a document is shared
 */
export const logDocumentShared = async (documentId: string) => {
  if (!documentId) return null;
  return addDocumentHistory(documentId, "Shared the document");
};

/**
 * Logs when a document is rescanned
 */
export const logDocumentRescanned = async (documentId: string) => {
  if (!documentId) return null;
  return addDocumentHistory(documentId, "Rescanned the document");
};

/**
 * Logs when a report is created for a document
 */
export const logReportCreated = async (documentId: string) => {
  if (!documentId) return null;
  return addDocumentHistory(documentId, "Created the Report");
};
