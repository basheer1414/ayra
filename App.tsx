/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import { generateEditedImage, generateFilteredImage, generateAdjustedImage, generateRemovedBackground } from './services/geminiService';
import Header from './components/Header';
import Spinner from './components/Spinner';
import FilterPanel from './components/FilterPanel';
import AdjustmentPanel from './components/AdjustmentPanel';
import CropPanel from './components/CropPanel';
import RetouchPanel from './components/RetouchPanel';
import { UndoIcon, RedoIcon, EyeIcon, FunnelIcon, CropIcon, UploadIcon, ChevronLeftIcon, LibraryIcon, RetouchIcon, AdjustIcon, TuneIcon } from './components/icons';
import type { Tab } from './types';

// Helper to convert a data URL string to a File object
const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    if (arr.length < 2) throw new Error("Invalid data URL");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) throw new Error("Could not parse MIME type from data URL");

    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
}

// Helper hook to manage object URLs for thumbnails
const useObjectURLs = (files: File[]) => {
  const [urls, setUrls] = useState<string[]>([]);
  
  useEffect(() => {
    const newUrls = files.map(file => URL.createObjectURL(file));
    setUrls(newUrls);
    
    return () => {
      newUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [files]);
  
  return urls;
};


interface LibraryPanelProps {
  onImageUpload: (files: FileList) => void;
  onImageSelect: (file: File) => void;
  libraryImages: File[];
  isLoading: boolean;
}

const LibraryPanel: React.FC<LibraryPanelProps> = ({ onImageUpload, onImageSelect, libraryImages, isLoading }) => {
  const thumbnailUrls = useObjectURLs(libraryImages);

  return (
    <div className="w-full flex flex-col gap-6 h-full">
      {/* Upload Area */}
      <div className="flex-shrink-0">
        <label htmlFor="library-upload" className="w-full h-32 bg-gray-800 rounded-lg group relative transition-all duration-300 hover:shadow-2xl hover:shadow-sky-500/40 flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-700 hover:border-sky-500">
            <div className="text-center text-gray-400 group-hover:text-sky-400 transition-colors duration-300">
                <UploadIcon className="w-8 h-8 mx-auto" />
                <span className="text-sm font-semibold mt-2 block">Upload Image(s)</span>
            </div>
            <input
                id="library-upload"
                type="file"
                className="hidden"
                accept="image/*"
                multiple // Enable multiple file selection
                onChange={(e) => {
                    if (e.target.files) {
                        onImageUpload(e.target.files);
                    }
                }}
                disabled={isLoading}
            />
        </label>
      </div>

      {/* Thumbnails */}
      <div className="flex-grow min-h-0 overflow-y-auto pr-2 -mr-4">
        {libraryImages.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {libraryImages.map((file, index) => (
              <button
                key={`${file.name}-${index}`}
                onClick={() => onImageSelect(file)}
                className="aspect-square bg-gray-800 rounded-md overflow-hidden group relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-sky-500"
                aria-label={`Select image ${file.name}`}
              >
                <img
                  src={thumbnailUrls[index]}
                  alt={file.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <p className="text-white text-xs font-semibold px-2 text-center break-words">{file.name}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-center text-gray-500">
            <p>Your uploaded images will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [history, setHistory] = useState<File[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [libraryImages, setLibraryImages] = useState<File[]>([]);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('library');
  
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>();
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const currentImage = history[historyIndex] ?? null;
  const originalImage = history[0] ?? null;

  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);

  // Effect to create and revoke object URLs safely for the current image
  useEffect(() => {
    if (currentImage) {
      const url = URL.createObjectURL(currentImage);
      setCurrentImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setCurrentImageUrl(null);
    }
  }, [currentImage]);
  
  // Effect to create and revoke object URLs safely for the original image
  useEffect(() => {
    if (originalImage) {
      const url = URL.createObjectURL(originalImage);
      setOriginalImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setOriginalImageUrl(null);
    }
  }, [originalImage]);


  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const addImageToHistory = useCallback((newImageFile: File) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newImageFile);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    // Reset transient states after an action
    setCrop(undefined);
    setCompletedCrop(undefined);
  }, [history, historyIndex]);

  const handleLibraryUpload = useCallback((files: FileList) => {
    setError(null);
    const newFiles = Array.from(files);
    if (newFiles.length === 0) return;

    setLibraryImages(prev => [...prev, ...newFiles]);

    // Only auto-load the first image if the canvas is empty
    if (!currentImage) {
        const firstFile = newFiles[0];
        setHistory([firstFile]);
        setHistoryIndex(0);
        setActiveTab('retouch');
        setCrop(undefined);
        setCompletedCrop(undefined);
    }
  }, [currentImage]);

  const handleSelectImageFromLibrary = useCallback((file: File) => {
      setError(null);
      setHistory([file]);
      setHistoryIndex(0);
      setActiveTab('retouch');
      setCrop(undefined);
      setCompletedCrop(undefined);
      setIsSidebarOpen(false); // Close sidebar on mobile after selection
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!currentImage) {
      setError('No image loaded to edit.');
      return;
    }
    
    if (!prompt.trim()) {
        setError('Please enter a description for your edit.');
        return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
        const editedImageUrl = await generateEditedImage(currentImage, prompt);
        const newImageFile = dataURLtoFile(editedImageUrl, `edited-${Date.now()}.png`);
        addImageToHistory(newImageFile);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to generate the image. ${errorMessage}`);
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  }, [currentImage, prompt, addImageToHistory]);
  
  const handleApplyFilter = useCallback(async (filterPrompt: string) => {
    if (!currentImage) {
      setError('No image loaded to apply a filter to.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
        const filteredImageUrl = await generateFilteredImage(currentImage, filterPrompt);
        const newImageFile = dataURLtoFile(filteredImageUrl, `filtered-${Date.now()}.png`);
        addImageToHistory(newImageFile);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to apply the filter. ${errorMessage}`);
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  }, [currentImage, addImageToHistory]);
  
  const handleApplyAdjustment = useCallback(async (adjustmentPrompt: string) => {
    if (!currentImage) {
      setError('No image loaded to apply an adjustment to.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
        const adjustedImageUrl = await generateAdjustedImage(currentImage, adjustmentPrompt);
        const newImageFile = dataURLtoFile(adjustedImageUrl, `adjusted-${Date.now()}.png`);
        addImageToHistory(newImageFile);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to apply the adjustment. ${errorMessage}`);
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  }, [currentImage, addImageToHistory]);

  const handleAutoEnhance = useCallback(async () => {
    if (!currentImage) {
      setError('No image loaded to enhance.');
      return;
    }

    const autoEnhancePrompt = "Perform a general, tasteful auto-enhancement of the image. Improve the overall quality by adjusting color balance, contrast, sharpness, vibrance, and saturation. The result should look natural and professional.";
    
    setIsLoading(true);
    setError(null);
    
    try {
        const adjustedImageUrl = await generateAdjustedImage(currentImage, autoEnhancePrompt);
        const newImageFile = dataURLtoFile(adjustedImageUrl, `enhanced-${Date.now()}.png`);
        addImageToHistory(newImageFile);
    // FIX: Corrected catch block syntax from `catch (err) =>` to `catch (err)`.
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to auto-enhance image. ${errorMessage}`);
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  }, [currentImage, addImageToHistory]);

  const handleApplyCrop = useCallback(() => {
    if (!completedCrop || !imgRef.current) {
        setError('Please select an area to crop.');
        return;
    }

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        setError('Could not process the crop.');
        return;
    }

    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = completedCrop.width * pixelRatio;
    canvas.height = completedCrop.height * pixelRatio;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height,
    );
    
    const croppedImageUrl = canvas.toDataURL('image/png');
    const newImageFile = dataURLtoFile(croppedImageUrl, `cropped-${Date.now()}.png`);
    addImageToHistory(newImageFile);

  }, [completedCrop, addImageToHistory]);

  const handleRemoveBackground = useCallback(async () => {
    if (!currentImage) {
      setError('No image loaded to remove background from.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
        const removedBgImageUrl = await generateRemovedBackground(currentImage);
        const newImageFile = dataURLtoFile(removedBgImageUrl, `bg-removed-${Date.now()}.png`);
        addImageToHistory(newImageFile);
    // FIX: Corrected catch block syntax from `catch (err) =>` to `catch (err)`.
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to remove background. ${errorMessage}`);
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  }, [currentImage, addImageToHistory]);

  const handleUndo = useCallback(() => {
    if (canUndo) {
      setHistoryIndex(historyIndex - 1);
    }
  }, [canUndo, historyIndex]);
  
  const handleRedo = useCallback(() => {
    if (canRedo) {
      setHistoryIndex(historyIndex + 1);
    }
  }, [canRedo, historyIndex]);

  const handleUploadNew = useCallback(() => {
      setHistory([]);
      setHistoryIndex(-1);
      setError(null);
      setPrompt('');
      setLibraryImages([]);
      setActiveTab('library');
  }, []);

  const handleDownload = useCallback(() => {
      if (currentImage) {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(currentImage);
          link.download = `edited-${currentImage.name}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
      }
  }, [currentImage]);
  
  const UploaderPlaceholder = (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 bg-black/20 rounded-xl border-2 border-gray-700/80 border-dashed">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 text-gray-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <h2 className="text-2xl font-semibold text-slate-300">Welcome to AYRA</h2>
      <p className="mt-2 text-md">Open the library panel to start editing.</p>
    </div>
  );

  const errorContent = (
    <div className="text-center bg-red-900/50 border border-red-500/30 p-8 rounded-lg max-w-lg mx-auto flex flex-col items-center gap-4">
     <h2 className="text-2xl font-bold text-red-200">An Error Occurred</h2>
     <p className="text-md text-red-300">{error}</p>
     <button
         onClick={() => setError(null)}
         className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg text-md transition-all duration-300 hover:shadow-lg hover:shadow-red-500/40"
       >
         Try Again
     </button>
   </div>
 );

  const canvasContent = (
    <div className="relative w-full h-full flex items-center justify-center">
        {isLoading && (
            <div className="absolute inset-0 bg-black/80 z-30 flex flex-col items-center justify-center gap-4">
                <Spinner />
                <p className="text-slate-200 text-lg">AI is working its magic...</p>
            </div>
        )}
        
        {!currentImageUrl ? (
          UploaderPlaceholder
        ) : (
          <>
            {activeTab === 'crop' ? (
              <ReactCrop 
                crop={crop} 
                onChange={c => setCrop(c)} 
                onComplete={c => setCompletedCrop(c)}
                aspect={aspect}
                className="max-h-full"
              >
                <img 
                  ref={imgRef}
                  key={`crop-${currentImageUrl}`}
                  src={currentImageUrl} 
                  alt="Crop this image"
                  className="w-full h-auto object-contain max-h-[85vh] md:max-h-[80vh] rounded-xl shadow-2xl shadow-black/50"
                />
              </ReactCrop>
            ) : (
              <div className="relative grid grid-cols-1 grid-rows-1 place-items-center">
                  {/* Original image: shown during compare */}
                  {originalImageUrl && (
                      <img
                          key={`compare-${originalImageUrl}`}
                          src={originalImageUrl}
                          alt="Original"
                          className={`w-full h-auto object-contain max-h-[85vh] md:max-h-[80vh] rounded-xl pointer-events-none shadow-2xl shadow-black/50 col-start-1 row-start-1 transition-opacity duration-200 ease-in-out ${isComparing ? 'opacity-100' : 'opacity-0'}`}
                      />
                  )}
                  
                  {/* Current image: shown by default */}
                  <img
                      ref={imgRef}
                      key={currentImageUrl}
                      src={currentImageUrl}
                      alt="Current"
                      className={`w-full h-auto object-contain max-h-[85vh] md:max-h-[80vh] rounded-xl shadow-2xl shadow-black/50 col-start-1 row-start-1 transition-opacity duration-200 ease-in-out ${isComparing ? 'opacity-0' : 'opacity-100'}`}
                  />
              </div>
            )}
          </>
        )}
    </div>
  );
  
  const baseToolbarButtonClasses = "flex flex-col items-center justify-center text-center font-medium p-3 rounded-lg transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const inactiveToolbarButtonClasses = "bg-gray-800 border border-gray-700 text-slate-300 hover:bg-gray-700 hover:text-white hover:shadow-lg hover:shadow-sky-500/40";
  const activeToolbarButtonClasses = "bg-sky-600 text-white border-transparent";
  
  const sidebarPanel = (
    <div className="flex-grow flex flex-col min-h-0">
      {activeTab === 'library' && <LibraryPanel onImageUpload={handleLibraryUpload} onImageSelect={handleSelectImageFromLibrary} libraryImages={libraryImages} isLoading={isLoading} />}
      {activeTab === 'crop' && <CropPanel onSetAspect={setAspect} disabled={!currentImage} />}
      {activeTab === 'adjust' && <AdjustmentPanel onApplyAdjustment={handleApplyAdjustment} isLoading={isLoading} disabled={!currentImage} />}
      {activeTab === 'filters' && <FilterPanel onApplyFilter={handleApplyFilter} isLoading={isLoading} disabled={!currentImage} />}
      {activeTab === 'retouch' && (
        <RetouchPanel
          onPromptChange={setPrompt}
          onGenerate={handleGenerate}
          prompt={prompt}
          isLoading={isLoading}
          disabled={!currentImage}
          hasImage={!!currentImage}
        />
      )}
    </div>
  );
  
  const mobileSidebarNavButton = (tab: Tab, icon: React.ReactNode, label: string) => (
    <button
      key={tab}
      onClick={() => setActiveTab(tab)}
      disabled={tab !== 'library' && !currentImage}
      className={`flex flex-col items-center gap-1 p-1.5 rounded-lg transition-all duration-300 text-xs border border-transparent ${
        activeTab === tab 
          ? 'text-sky-300 bg-sky-500/20 border-sky-500/30'
          : 'text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20 disabled:opacity-40'
      }`}
    >
      {icon}
      <span className="capitalize font-medium">{label}</span>
    </button>
  );

  const sidebarTabs: { tab: Tab, icon: React.ReactNode, label: string }[] = [
    { tab: 'library', icon: <LibraryIcon className="w-5 h-5" />, label: 'Library' },
    { tab: 'retouch', icon: <RetouchIcon className="w-5 h-5" />, label: 'Retouch' },
    { tab: 'adjust', icon: <AdjustIcon className="w-5 h-5" />, label: 'Adjust' },
  ];

  return (
    <div className="min-h-screen text-slate-100 flex flex-col bg-gray-900">
      <Header 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        imageLoaded={!!currentImage}
        onUploadNew={handleUploadNew}
        onDownload={handleDownload}
        onAutoEnhance={handleAutoEnhance}
        onRemoveBackground={handleRemoveBackground}
        isLoading={isLoading}
      />
      <div className="flex flex-grow" style={{ height: 'calc(100vh - 65px)'}}>
        
        {/* --- Desktop Sidebar --- */}
        <aside className="w-96 bg-[#1E1E1E] border-r border-gray-700/60 p-6 flex-col hidden md:flex">
          {sidebarPanel}
        </aside>

        {/* --- Mobile Sidebar --- */}
        {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-30 md:hidden" />}
        <aside className={`fixed top-0 left-0 h-full w-72 bg-[#1E1E1E]/80 backdrop-blur-xl border-r border-gray-700/60 p-4 flex flex-col z-40 transition-transform duration-300 ease-in-out md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Tools</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-full hover:bg-white/10">
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
          </div>
          <nav className="grid grid-cols-3 gap-2 mb-4">
            {sidebarTabs.map(item => mobileSidebarNavButton(item.tab, item.icon, item.label))}
          </nav>
          <div className="flex-grow min-h-0">
            {sidebarPanel}
          </div>
        </aside>

        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-1/2 -translate-y-1/2 left-0 z-20 bg-black/30 backdrop-blur-md text-slate-200 hover:text-white p-2.5 rounded-r-lg shadow-lg border-y border-r border-white/10 md:hidden"
            aria-label="Open tools sidebar"
          >
            <TuneIcon className="w-5 h-5" />
          </button>
        )}

        {/* --- Vertical Toolbar (Desktop) --- */}
        {currentImage && (
            <div className="w-20 flex-shrink-0 bg-[#1E1E1E] border-r border-gray-700/60 hidden md:flex flex-col items-center justify-center py-4 gap-4">
                <button title="Undo" onClick={handleUndo} disabled={!canUndo} className={`${baseToolbarButtonClasses} ${inactiveToolbarButtonClasses}`} aria-label="Undo last action">
                    <UndoIcon className="w-6 h-6" />
                </button>
                <button title="Compare" onMouseDown={() => setIsComparing(true)} onMouseUp={() => setIsComparing(false)} onMouseLeave={() => setIsComparing(false)} onTouchStart={() => setIsComparing(true)} onTouchEnd={() => setIsComparing(false)} disabled={!canUndo} className={`${baseToolbarButtonClasses} ${inactiveToolbarButtonClasses}`} aria-label="Press and hold to see original image">
                    <EyeIcon className="w-6 h-6" />
                </button>
                <button title="Redo" onClick={handleRedo} disabled={!canRedo} className={`${baseToolbarButtonClasses} ${inactiveToolbarButtonClasses}`} aria-label="Redo last action">
                    <RedoIcon className="w-6 h-6" />
                </button>
                <div className="w-3/4 border-t border-gray-700 my-2"></div>
                <button title="Crop" onClick={() => setActiveTab('crop')} className={`${baseToolbarButtonClasses} ${activeTab === 'crop' ? activeToolbarButtonClasses : inactiveToolbarButtonClasses}`}>
                    <CropIcon className="w-6 h-6" />
                </button>
                <button title="Filters" onClick={() => setActiveTab('filters')} className={`${baseToolbarButtonClasses} ${activeTab === 'filters' ? activeToolbarButtonClasses : inactiveToolbarButtonClasses}`}>
                    <FunnelIcon className="w-6 h-6" />
                </button>
            </div>
        )}

        {/* --- Main Canvas --- */}
        <main className="relative flex-grow p-4 bg-[#121212] flex flex-col justify-center items-center">
          <div className="flex-grow w-full flex justify-center items-center">
            {error ? errorContent : canvasContent}
          </div>
          {currentImage && activeTab === 'crop' && (
            <div className="flex-shrink-0 pt-6 flex justify-center items-center gap-3">
              <button
                onClick={handleApplyCrop}
                disabled={isLoading || !completedCrop?.width || completedCrop.width <= 0}
                className="flex items-center justify-center bg-sky-600 text-white font-bold py-3 px-5 rounded-lg transition-all duration-300 ease-in-out hover:bg-sky-500 hover:shadow-[0_0_20px_theme(colors.sky.500)] active:scale-95 text-base disabled:bg-sky-800/80 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                Apply Crop
              </button>
            </div>
          )}
        </main>
        
        {/* --- Bottom Toolbar (Mobile) --- */}
        {currentImage && (
            <div className="fixed bottom-0 left-0 right-0 bg-[#1E1E1E]/90 backdrop-blur-lg border-t border-gray-700/60 z-20 md:hidden flex justify-around items-center py-1.5 px-1">
                <button
                    title="Undo"
                    onClick={handleUndo}
                    disabled={!canUndo}
                    className="flex flex-col items-center gap-1 p-1 w-16 rounded-md disabled:opacity-50 transition-colors duration-200 text-slate-300 hover:text-sky-400 active:text-sky-400"
                >
                    <UndoIcon className="w-5 h-5" />
                    <span className="text-xs font-medium">Undo</span>
                </button>
                <button
                    title="Compare"
                    onMouseDown={() => setIsComparing(true)}
                    onMouseUp={() => setIsComparing(false)}
                    onMouseLeave={() => setIsComparing(false)}
                    onTouchStart={() => setIsComparing(true)}
                    onTouchEnd={() => setIsComparing(false)}
                    disabled={!canUndo}
                    className="flex flex-col items-center gap-1 p-1 w-16 rounded-md disabled:opacity-50 transition-colors duration-200 text-slate-300 hover:text-sky-400 active:text-sky-400"
                >
                    <EyeIcon className="w-5 h-5" />
                    <span className="text-xs font-medium">Compare</span>
                </button>
                <button
                    title="Redo"
                    onClick={handleRedo}
                    disabled={!canRedo}
                    className="flex flex-col items-center gap-1 p-1 w-16 rounded-md disabled:opacity-50 transition-colors duration-200 text-slate-300 hover:text-sky-400 active:text-sky-400"
                >
                    <RedoIcon className="w-5 h-5" />
                    <span className="text-xs font-medium">Redo</span>
                </button>
                <button
                    title="Crop"
                    onClick={() => setActiveTab('crop')}
                    disabled={isLoading || !currentImage}
                    className={`flex flex-col items-center gap-1 p-1 w-16 rounded-md disabled:opacity-50 transition-colors duration-200 ${
                        activeTab === 'crop'
                        ? 'text-sky-400 bg-sky-500/10'
                        : 'text-slate-300 hover:text-sky-400 hover:bg-sky-500/10'
                    }`}
                >
                    <CropIcon className="w-5 h-5" />
                    <span className="text-xs font-medium">Crop</span>
                </button>
                <button
                    title="Filters"
                    onClick={() => setActiveTab('filters')}
                    disabled={isLoading || !currentImage}
                    className={`flex flex-col items-center gap-1 p-1 w-16 rounded-md disabled:opacity-50 transition-colors duration-200 ${
                        activeTab === 'filters'
                        ? 'text-sky-400 bg-sky-500/10'
                        : 'text-slate-300 hover:text-sky-400 hover:bg-sky-500/10'
                    }`}
                >
                    <FunnelIcon className="w-5 h-5" />
                    <span className="text-xs font-medium">Filters</span>
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default App;