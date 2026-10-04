import React, { useState, useMemo } from 'react';
import {
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  File,
  Download,
  Search,
  Upload,
  Plus,
  X,
  Eye,
  Calendar,
  User,
  Shield,
  Filter,
  CheckCircle2,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';
import { AppointmentDocument, UserRole } from '../../types.ts';
import { getApiUrl } from '../../lib/api.ts';

interface ChatMediaGalleryProps {
  documents: AppointmentDocument[];
  onUpload: (file: File, label: string, documentDate: string) => Promise<void>;
  isUploading?: boolean;
  canUpload?: boolean;
  currentUserRole?: UserRole;
  roomTitle?: string;
  onSelectDocForChat?: (doc: AppointmentDocument) => void;
}

type CategoryFilter = 'all' | 'images' | 'documents' | 'spreadsheets';

export default function ChatMediaGallery({
  documents,
  onUpload,
  isUploading = false,
  canUpload = true,
  currentUserRole = 'customer',
  roomTitle,
  onSelectDocForChat,
}: ChatMediaGalleryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Lightbox modal state for full-screen image inspection
  const [activeLightboxDoc, setActiveLightboxDoc] = useState<AppointmentDocument | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState(1);

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLabel, setUploadLabel] = useState('');
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Helper to categorize documents
  const getDocCategory = (doc: AppointmentDocument): 'images' | 'documents' | 'spreadsheets' | 'other' => {
    const fn = doc.fileName.toLowerCase();
    const mime = (doc.mimeType || doc.fileType || '').toLowerCase();

    if (doc.isImage || mime.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(fn)) {
      return 'images';
    }
    if (mime.includes('spreadsheet') || mime.includes('excel') || mime.includes('csv') || /\.(xlsx?|csv)$/i.test(fn)) {
      return 'spreadsheets';
    }
    if (mime.includes('pdf') || mime.includes('word') || /\.(pdf|docx?|txt)$/i.test(fn)) {
      return 'documents';
    }
    return 'other';
  };

  // Filtered documents calculation
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      // Category filter
      const category = getDocCategory(doc);
      if (activeCategory === 'images' && category !== 'images') return false;
      if (activeCategory === 'documents' && category !== 'documents') return false;
      if (activeCategory === 'spreadsheets' && category !== 'spreadsheets') return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = doc.fileName.toLowerCase().includes(q);
        const matchLabel = doc.label.toLowerCase().includes(q);
        const matchUploader = (doc.uploaderName || '').toLowerCase().includes(q);
        const matchDate = (doc.documentDate || '').includes(q);
        return matchName || matchLabel || matchUploader || matchDate;
      }
      return true;
    });
  }, [documents, activeCategory, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: documents.length,
      images: documents.filter((d) => getDocCategory(d) === 'images').length,
      documents: documents.filter((d) => getDocCategory(d) === 'documents').length,
      spreadsheets: documents.filter((d) => getDocCategory(d) === 'spreadsheets').length,
    };
  }, [documents]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Bitte wählen Sie eine Datei aus.');
      return;
    }

    if (uploadFile.size > 15 * 1024 * 1024) {
      setUploadError('Die Datei überschreitet die maximale Größe von 15 MB.');
      return;
    }

    setUploadError(null);
    try {
      await onUpload(uploadFile, uploadLabel.trim() || uploadFile.name, uploadDate);
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadLabel('');
    } catch (err: any) {
      setUploadError(err.message || 'Upload fehlgeschlagen.');
    }
  };

  const getFileIcon = (doc: AppointmentDocument) => {
    const category = getDocCategory(doc);
    switch (category) {
      case 'images':
        return <ImageIcon className="w-5 h-5 text-purple-600" />;
      case 'spreadsheets':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
      case 'documents':
        return <FileText className="w-5 h-5 text-blue-600" />;
      default:
        return <File className="w-5 h-5 text-slate-500" />;
    }
  };

  const presetLabels = ['Steuerbescheid', 'Beleg / Quittung', 'Ausweisdokument', 'Vertrag / Vereinbarung', 'Jahresabschluss', 'Sonstiges'];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Top Header & Search Bar */}
      <div className="p-4 sm:p-5 bg-white border-b border-slate-200 space-y-3 shrink-0 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 font-serif flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                <span>Dokumenten- & Mediengalerie</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200">
                {documents.length} {documents.length === 1 ? 'Datei' : 'Dateien'}
              </span>
              <span className="hidden md:flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
                <Shield className="w-3 h-3" /> DATEV & SSL-geschützt
              </span>
            </div>
            {roomTitle && (
              <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-md">
                Kanal: <span className="font-semibold text-slate-700">{roomTitle}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {canUpload && (
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Unterlagen hochladen</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Alle ({counts.all})
            </button>
            <button
              onClick={() => setActiveCategory('images')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer flex items-center gap-1 ${
                activeCategory === 'images'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Bilder & Scans ({counts.images})</span>
            </button>
            <button
              onClick={() => setActiveCategory('documents')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer flex items-center gap-1 ${
                activeCategory === 'documents'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDFs & Bescheide ({counts.documents})</span>
            </button>
            <button
              onClick={() => setActiveCategory('spreadsheets')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer flex items-center gap-1 ${
                activeCategory === 'spreadsheets'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Tabellen & Belege ({counts.spreadsheets})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Dokumente durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Gallery Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {filteredDocs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-300 shadow-2xs">
              <ImageIcon className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Keine Dokumente vorhanden</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                {searchQuery
                  ? 'Keine Suchergebnisse gefunden. Bitte prüfen Sie Ihre Suchbegriffe.'
                  : 'Laden Sie Belege, Steuerbescheide oder Ausweisdokumente direkt für Kanzleiinhaber Abdul Sattar hoch.'}
              </p>
            </div>
            {canUpload && !searchQuery && (
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Erstes Dokument hochladen
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDocs.map((doc) => {
              const isImg = getDocCategory(doc) === 'images';
              const fileDownloadUrl = getApiUrl(doc.fileUrl);

              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col overflow-hidden group"
                >
                  {/* Card Media Preview Header */}
                  {isImg ? (
                    <div
                      onClick={() => {
                        setActiveLightboxDoc(doc);
                        setLightboxZoom(1);
                      }}
                      className="h-40 bg-slate-100 relative cursor-pointer overflow-hidden flex items-center justify-center group/img"
                    >
                      <img
                        src={fileDownloadUrl}
                        alt={doc.label || doc.fileName}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <span className="p-2 bg-white/90 rounded-xl text-slate-900 shadow-xs flex items-center gap-1 text-xs font-bold">
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Vergrößern</span>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-28 bg-gradient-to-br from-slate-50 to-slate-100/80 p-4 flex flex-col justify-between border-b border-slate-100">
                      <div className="flex items-start justify-between">
                        <div className="p-2 rounded-xl bg-white shadow-2xs border border-slate-200">
                          {getFileIcon(doc)}
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                          {doc.fileSize}
                        </span>
                      </div>
                      <div className="text-[11px] font-bold text-slate-700 truncate">
                        {doc.label || 'Dokument'}
                      </div>
                    </div>
                  )}

                  {/* Card Details Body */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {doc.label}
                        </span>
                        {isImg && (
                          <span className="text-[10px] text-slate-500 font-mono shrink-0">
                            {doc.fileSize}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate font-mono">
                        {doc.fileName}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{doc.documentDate || 'Kein Datum'}</span>
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">
                          {doc.uploaderRole === 'admin' || doc.uploaderRole === 'advisor'
                            ? 'Kanzlei'
                            : 'Mandant'}
                        </span>
                      </div>

                      {/* Action Links */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <a
                          href={fileDownloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={doc.fileName}
                          className="flex-1 py-1.5 px-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-center text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Herunterladen</span>
                        </a>

                        {isImg && (
                          <button
                            onClick={() => {
                              setActiveLightboxDoc(doc);
                              setLightboxZoom(1);
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                            title="Vorschau"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {activeLightboxDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex flex-col">
          {/* Lightbox Topbar */}
          <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-800">
                <ImageIcon className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white truncate max-w-md">
                  {activeLightboxDoc.label}
                </h4>
                <p className="text-xs text-slate-400 font-mono">
                  {activeLightboxDoc.fileName} • {activeLightboxDoc.fileSize}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setLightboxZoom((z) => Math.max(0.5, z - 0.25))}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Verkleinern"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-slate-400 px-1">
                {Math.round(lightboxZoom * 100)}%
              </span>
              <button
                onClick={() => setLightboxZoom((z) => Math.min(3, z + 0.25))}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Vergrößern"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <a
                href={getApiUrl(activeLightboxDoc.fileUrl)}
                download={activeLightboxDoc.fileName}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors ml-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Herunterladen</span>
              </a>

              <button
                onClick={() => setActiveLightboxDoc(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white transition-colors ml-2 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Content Viewer */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-6">
            <img
              src={getApiUrl(activeLightboxDoc.fileUrl)}
              alt={activeLightboxDoc.label}
              style={{ transform: `scale(${lightboxZoom})`, transition: 'transform 0.2s ease-out' }}
              className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-2xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-950 font-serif">
                  Dokument oder Beleg hochladen
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Wird verschlüsselt gespeichert und der Kanzlei sofort zur Verfügung gestellt.
                </p>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              {/* File Input Box */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Datei auswählen (PDF, PNG, JPG, WEBP, DOCX, XLSX - Max 15 MB) *
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.docx,.doc,.xlsx,.xls,.txt,.csv"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setUploadFile(f);
                    if (f && !uploadLabel) {
                      setUploadLabel(f.name.replace(/\.[^/.]+$/, ''));
                    }
                  }}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer bg-slate-50 p-2 rounded-2xl border border-slate-200"
                />
              </div>

              {/* Label Preset Chips */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Art / Bezeichnung der Unterlage *
                </label>
                <input
                  type="text"
                  required
                  placeholder="z.B. Steuerbescheid 2023, Personalausweis, Quittung..."
                  value={uploadLabel}
                  onChange={(e) => setUploadLabel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-colors"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {presetLabels.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setUploadLabel(preset)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Document Date */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Datum des Dokuments / Belegs
                </label>
                <input
                  type="date"
                  value={uploadDate}
                  onChange={(e) => setUploadDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-slate-900 outline-none transition-colors"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !uploadFile}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer shadow-xs transition-colors flex items-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Wird übertragen...' : 'Unterlage hochladen'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
