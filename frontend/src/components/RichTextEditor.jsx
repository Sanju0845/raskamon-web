import React, { useState, useRef, useEffect } from "react";
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaHeading,
  FaListUl,
  FaListOl,
  FaQuoteLeft,
  FaAlignLeft,
  FaAlignCenter,
  FaLink,
  FaAlignRight,
  FaAlignJustify,
  FaImage,
  FaSpinner,
} from "react-icons/fa";

const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Write your content here...",
  onImageUpload,
}) => {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formatState, setFormatState] = useState({
    bold: false,
    italic: false,
    underline: false,
    heading: null,
    list: null,
    align: null,
  });
  const [cursorPosition, setCursorPosition] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const updateTimeoutRef = useRef(null);
  const resizingImageRef = useRef(null);
  const initialSizeRef = useRef({ width: 0, height: 0 });
  const initialPositionRef = useRef({ x: 0, y: 0 });

  // Save cursor position
  const saveCursorPosition = () => {
    if (editorRef.current && window.getSelection) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        setCursorPosition({
          startContainer: range.startContainer,
          startOffset: range.startOffset,
          endContainer: range.endContainer,
          endOffset: range.endOffset,
        });
      }
    }
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const isLinkActive = () => {
    if (!editorRef.current) return false;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    const node = selection.anchorNode;
    return (
      node?.parentElement?.tagName === "A" ||
      document.queryCommandState("createLink")
    );
  };

  const handleLinkClick = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    saveCursorPosition();

    // Get selected text
    const selectedText = selection.toString();
    setLinkText(selectedText);

    // Check if selection is already a link
    const parentAnchor = selection.anchorNode?.parentElement?.closest("a");
    if (parentAnchor) {
      setLinkUrl(parentAnchor.href);
    } else {
      setLinkUrl("");
    }

    setShowLinkModal(true);
  };

  const insertLink = () => {
    if (!linkUrl) return;

    // Ensure the URL has a protocol
    let finalUrl = linkUrl.trim();
    if (!finalUrl.match(/^[a-zA-Z]+:\/\//i)) {
      finalUrl = `https://${finalUrl}`;
    }

    // Validate URL
    if (!isValidUrl(finalUrl)) {
      alert("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    restoreCursorPosition();

    const selection = window.getSelection();
    const hasSelection = selection && !selection.isCollapsed;

    if (hasSelection) {
      document.execCommand("createLink", false, finalUrl);

      // Set attributes for the newly created link
      const anchor = selection.anchorNode.parentElement.closest("a");
      if (anchor) {
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        anchor.style.color = "#3b82f6"; // Blue color
        anchor.style.textDecoration = "underline";
      }
    } else {
      const link = document.createElement("a");
      link.href = finalUrl;
      link.textContent = linkText || finalUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.style.color = "#3b82f6"; // Blue color
      link.style.textDecoration = "underline";

      const range = selection.getRangeAt(0);
      range.insertNode(link);

      const newRange = document.createRange();
      newRange.setStartAfter(link);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }

    setShowLinkModal(false);
    setLinkUrl("");
    setLinkText("");
    editorRef.current?.focus();
    updateContent();
  };

  const removeLink = () => {
    document.execCommand("unlink");
    setShowLinkModal(false);
    editorRef.current?.focus();
    updateContent();
  };

  // Restore cursor position
  const restoreCursorPosition = () => {
    if (cursorPosition && window.getSelection) {
      const selection = window.getSelection();
      const range = document.createRange();

      try {
        range.setStart(
          cursorPosition.startContainer,
          cursorPosition.startOffset
        );
        range.setEnd(cursorPosition.endContainer, cursorPosition.endOffset);
        selection.removeAllRanges();
        selection.addRange(range);
      } catch (error) {
        const editor = editorRef.current;
        if (editor) {
          const range = document.createRange();
          range.selectNodeContents(editor);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }
  };

  // Debounced content update
  const debouncedUpdateContent = () => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      if (editorRef.current) {
        const content = editorRef.current.innerHTML;
        onChange(content);
      }
    }, 100);
  };

  useEffect(() => {
    if (editorRef.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
        editorRef.current.style.direction = "ltr";
        editorRef.current.style.textAlign = "left";
        editorRef.current.style.unicodeBidi = "normal";
      }
    }

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [value]);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      saveCursorPosition();
      const content = editorRef.current.innerHTML;
      onChange(content);
      updateFormatState();
      setTimeout(restoreCursorPosition, 0);
    }
  };

  const updateFormatState = () => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const node = selection.anchorNode;
    const parentElement = node?.parentElement;

    // Check heading level
    let currentHeading = null;
    if (parentElement) {
      const headingTags = ["H1", "H2", "H3", "H4", "H5"];
      for (let i = 0; i < headingTags.length; i++) {
        if (parentElement.tagName === headingTags[i]) {
          currentHeading = `h${i + 1}`;
          break;
        }
      }
    }

    // Check list type
    let currentList = null;
    if (parentElement) {
      let current = parentElement;
      while (current) {
        if (current.tagName === "UL") {
          currentList = "ul";
          break;
        } else if (current.tagName === "OL") {
          currentList = "ol";
          break;
        }
        current = current.parentElement;
      }
    }

    // Check alignment
    let align = null;
    if (parentElement) {
      const alignments = ["left", "center", "right", "justify"];
      let current = parentElement;
      while (current) {
        if (
          current.style &&
          current.style.textAlign &&
          alignments.includes(current.style.textAlign)
        ) {
          align = current.style.textAlign;
          break;
        }
        current = current.parentElement;
      }
    }

    // Check inline styles
    let bold = false;
    let italic = false;
    let underline = false;

    if (range && !range.collapsed) {
      const commonAncestor = range.commonAncestorContainer;
      if (commonAncestor.nodeType === Node.ELEMENT_NODE) {
        const element = commonAncestor;
        bold =
          element.style.fontWeight === "bold" ||
          document.queryCommandState("bold");
        italic =
          element.style.fontStyle === "italic" ||
          document.queryCommandState("italic");
        underline =
          element.style.textDecoration.includes("underline") ||
          document.queryCommandState("underline");
      }
    } else {
      bold = document.queryCommandState("bold");
      italic = document.queryCommandState("italic");
      underline = document.queryCommandState("underline");

      if (node && node.nodeType === Node.TEXT_NODE && parentElement) {
        const computedStyle = window.getComputedStyle(parentElement);
        bold =
          bold ||
          computedStyle.fontWeight === "700" ||
          computedStyle.fontWeight === "bold";
        italic = italic || computedStyle.fontStyle === "italic";
        underline =
          underline || computedStyle.textDecoration.includes("underline");
      }
    }

    setFormatState({
      bold,
      italic,
      underline,
      heading: currentHeading,
      list: currentList,
      align,
    });
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case "k":
          e.preventDefault();
          handleLinkClick();
          break;
        case "b":
          e.preventDefault();
          execCommand("bold");
          break;
        case "i":
          e.preventDefault();
          execCommand("italic");
          break;
        case "u":
          e.preventDefault();
          execCommand("underline");
          break;
        case "z":
          if (e.shiftKey) {
            e.preventDefault();
            execCommand("redo");
          } else {
            e.preventDefault();
            execCommand("undo");
          }
          break;
      }
    }

    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      execCommand("insertLineBreak");
    }
  };

  // Image handling functions
  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await handleImageUpload(file);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setIsUploadingImage(true);

    try {
      let imageUrl;

      if (onImageUpload) {
        imageUrl = await onImageUpload(file);
      } else {
        imageUrl = URL.createObjectURL(file);
      }

      if (!imageUrl) {
        throw new Error("Failed to get image URL");
      }

      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);

        const imgElement = document.createElement("img");
        imgElement.src = imageUrl;
        imgElement.alt = "Uploaded image";
        imgElement.className = "editor-image";
        imgElement.style.maxWidth = "100%";
        imgElement.style.height = "auto";
        imgElement.style.maxHeight = "480px";
        imgElement.style.objectFit = "contain";
        imgElement.style.borderRadius = "0.5rem";
        imgElement.style.margin = "1rem 0";
        imgElement.style.display = "block";
        imgElement.style.position = "relative";

        const resizeHandles = document.createElement("div");
        resizeHandles.className = "resize-handles";
        resizeHandles.style.position = "absolute";
        resizeHandles.style.bottom = "0";
        resizeHandles.style.right = "0";
        resizeHandles.style.width = "16px";
        resizeHandles.style.height = "16px";
        resizeHandles.style.backgroundColor = "rgba(0,0,0,0.5)";
        resizeHandles.style.cursor = "nwse-resize";
        resizeHandles.style.borderRadius = "2px 0 0 0";

        resizeHandles.addEventListener("mousedown", (e) => {
          e.stopPropagation();
          startResizing(imgElement, e);
        });

        imgElement.appendChild(resizeHandles);

        imgElement.onerror = () => {
          console.error("Failed to load image:", imageUrl);
          alert("Failed to load image. Please try again.");
        };

        range.deleteContents();
        range.insertNode(imgElement);

        const br = document.createElement("br");
        range.setStartAfter(imgElement);
        range.insertNode(br);

        range.setStartAfter(br);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);

        editorRef.current?.focus();
        updateContent();
      } else {
        const imgElement = document.createElement("img");
        imgElement.src = imageUrl;
        imgElement.alt = "Uploaded image";
        imgElement.className = "editor-image";
        imgElement.style.maxWidth = "100%";
        imgElement.style.height = "auto";
        imgElement.style.maxHeight = "480px";
        imgElement.style.objectFit = "contain";
        imgElement.style.borderRadius = "0.5rem";
        imgElement.style.margin = "1rem 0";
        imgElement.style.display = "block";
        imgElement.style.position = "relative";

        const resizeHandles = document.createElement("div");
        resizeHandles.className = "resize-handles";
        resizeHandles.style.position = "absolute";
        resizeHandles.style.bottom = "0";
        resizeHandles.style.right = "0";
        resizeHandles.style.width = "16px";
        resizeHandles.style.height = "16px";
        resizeHandles.style.backgroundColor = "rgba(0,0,0,0.5)";
        resizeHandles.style.cursor = "nwse-resize";
        resizeHandles.style.borderRadius = "2px 0 0 0";

        resizeHandles.addEventListener("mousedown", (e) => {
          e.stopPropagation();
          startResizing(imgElement, e);
        });

        imgElement.appendChild(resizeHandles);

        imgElement.onerror = () => {
          console.error("Failed to load image:", imageUrl);
          alert("Failed to load image. Please try again.");
        };

        editorRef.current?.appendChild(imgElement);
        editorRef.current?.appendChild(document.createElement("br"));
        updateContent();
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const startResizing = (imgElement, e) => {
    e.preventDefault();
    resizingImageRef.current = imgElement;
    initialSizeRef.current = {
      width: imgElement.offsetWidth,
      height: imgElement.offsetHeight,
    };
    initialPositionRef.current = {
      x: e.clientX,
      y: e.clientY,
    };

    document.addEventListener("mousemove", handleResize);
    document.addEventListener("mouseup", stopResizing);
  };

  const handleResize = (e) => {
    if (!resizingImageRef.current) return;

    const deltaX = e.clientX - initialPositionRef.current.x;
    const deltaY = e.clientY - initialPositionRef.current.y;

    const newWidth = initialSizeRef.current.width + deltaX;
    const newHeight = initialSizeRef.current.height + deltaY;

    const minSize = 50;
    const finalWidth = Math.max(minSize, newWidth);
    const finalHeight = Math.max(minSize, newHeight);

    resizingImageRef.current.style.width = `${finalWidth}px`;
    resizingImageRef.current.style.height = `${finalHeight}px`;
    resizingImageRef.current.style.maxWidth = "none";
    resizingImageRef.current.style.objectFit = "contain";

    updateContent();
  };

  const stopResizing = () => {
    resizingImageRef.current = null;
    document.removeEventListener("mousemove", handleResize);
    document.removeEventListener("mouseup", stopResizing);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  const ToolbarButton = ({ icon: Icon, onClick, title, isActive = false }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded-md transition-colors ${
        isActive
          ? "bg-purple-100 text-purple-700 border border-purple-200"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  const ToolbarSeparator = () => (
    <div className="w-px h-6 bg-gray-300 mx-1"></div>
  );

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex items-center gap-1 flex-wrap flex-shrink-0 sticky top-0 z-10">
        {/* Text Formatting */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={FaBold}
            onClick={() => execCommand("bold")}
            title="Bold (Ctrl+B)"
            isActive={formatState.bold}
          />
          <ToolbarButton
            icon={FaItalic}
            onClick={() => execCommand("italic")}
            title="Italic (Ctrl+I)"
            isActive={formatState.italic}
          />
          <ToolbarButton
            icon={FaUnderline}
            onClick={() => execCommand("underline")}
            title="Underline (Ctrl+U)"
            isActive={formatState.underline}
          />
        </div>

        <ToolbarSeparator />

        {/* Links */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={FaLink}
            onClick={handleLinkClick}
            title="Insert/Edit Link (Ctrl+K)"
            isActive={isLinkActive()}
          />
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={FaHeading}
            onClick={() => execCommand("formatBlock", "<h1>")}
            title="Heading 1"
            isActive={formatState.heading === "h1"}
          />
          <ToolbarButton
            icon={() => <span className="text-xs font-bold">H2</span>}
            onClick={() => execCommand("formatBlock", "<h2>")}
            title="Heading 2"
            isActive={formatState.heading === "h2"}
          />
          <ToolbarButton
            icon={() => <span className="text-xs font-bold">H3</span>}
            onClick={() => execCommand("formatBlock", "<h3>")}
            title="Heading 3"
            isActive={formatState.heading === "h3"}
          />
          <ToolbarButton
            icon={() => <span className="text-xs font-bold">H4</span>}
            onClick={() => execCommand("formatBlock", "<h4>")}
            title="Heading 4"
            isActive={formatState.heading === "h4"}
          />
          <ToolbarButton
            icon={() => <span className="text-xs font-bold">H5</span>}
            onClick={() => execCommand("formatBlock", "<h5>")}
            title="Heading 5"
            isActive={formatState.heading === "h5"}
          />
        </div>

        <ToolbarSeparator />

        {/* Lists */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={FaListUl}
            onClick={() => execCommand("insertUnorderedList")}
            title="Bullet List"
            isActive={formatState.list === "ul"}
          />
          <ToolbarButton
            icon={FaListOl}
            onClick={() => execCommand("insertOrderedList")}
            title="Numbered List"
            isActive={formatState.list === "ol"}
          />
        </div>

        <ToolbarSeparator />

        {/* Block Quote */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={FaQuoteLeft}
            onClick={() => execCommand("formatBlock", "<blockquote>")}
            title="Block Quote"
          />
        </div>

        <ToolbarSeparator />

        {/* Image Upload */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={isUploadingImage ? FaSpinner : FaImage}
            onClick={() => fileInputRef.current?.click()}
            title="Insert Image"
            isActive={isUploadingImage}
          />
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        <ToolbarSeparator />

        {/* Text Alignment */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={FaAlignLeft}
            onClick={() => execCommand("justifyLeft")}
            title="Align Left"
            isActive={formatState.align === "left"}
          />
          <ToolbarButton
            icon={FaAlignCenter}
            onClick={() => execCommand("justifyCenter")}
            title="Align Center"
            isActive={formatState.align === "center"}
          />
          <ToolbarButton
            icon={FaAlignRight}
            onClick={() => execCommand("justifyRight")}
            title="Align Right"
            isActive={formatState.align === "right"}
          />
          <ToolbarButton
            icon={FaAlignJustify}
            onClick={() => execCommand("justifyFull")}
            title="Justify"
            isActive={formatState.align === "justify"}
          />
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        dir="ltr"
        onInput={() => {
          updateFormatState();
          saveCursorPosition();
          debouncedUpdateContent();
        }}
        onBlur={() => {
          setIsFocused(false);
          if (editorRef.current) {
            const content = editorRef.current.innerHTML;
            onChange(content);
          }
        }}
        onPaste={handlePaste}
        onMouseUp={updateFormatState}
        onKeyUp={updateFormatState}
        onKeyDown={(e) => {
          saveCursorPosition();
          handleKeyDown(e);
          setTimeout(updateFormatState, 0);
        }}
        onClick={updateFormatState}
        onFocus={() => {
          setIsFocused(true);
          setTimeout(updateFormatState, 50);
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex-1 p-4 focus:outline-none transition-colors overflow-auto ${
          isFocused ? "ring-2 ring-purple-500 ring-inset" : ""
        }`}
        style={{
          fontFamily: "inherit",
          fontSize: "inherit",
          lineHeight: "1.6",
          direction: "ltr",
          textAlign: "left",
          unicodeBidi: "normal",
        }}
        data-placeholder={placeholder}
      />

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-4">
            <h3 className="text-lg font-semibold mb-3">Insert link</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Text</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Link text"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">URL</label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-3 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowLinkModal(false)}
                >
                  Cancel
                </button>
                {isLinkActive() && (
                  <button
                    type="button"
                    className="px-3 py-2 text-sm rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                    onClick={removeLink}
                  >
                    Remove link
                  </button>
                )}
              </div>
              <button
                type="button"
                className="px-3 py-2 text-sm rounded-md bg-purple-600 text-white hover:bg-purple-700"
                onClick={insertLink}
              >
                {isLinkActive() ? "Update link" : "Insert link"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS for the editor */}
      <style jsx>{`
        [contenteditable="true"] {
          min-height: 150px;
        }
        [contenteditable="true"]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          display: block;
        }
        .editor-image {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
          display: block;
        }
        [contenteditable="true"] h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
        }
        [contenteditable="true"] h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.83em 0;
        }
        [contenteditable="true"] h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 1em 0;
        }
        [contenteditable="true"] h4 {
          font-size: 1em;
          font-weight: bold;
          margin: 1.33em 0;
        }
        [contenteditable="true"] h5 {
          font-size: 0.83em;
          font-weight: bold;
          margin: 1.67em 0;
        }
        [contenteditable="true"] ul,
        [contenteditable="true"] ol {
          padding-left: 2em;
          margin: 1em 0;
        }
        [contenteditable="true"] blockquote {
          border-left: 3px solid #ddd;
          padding-left: 1em;
          margin: 1em 0;
          color: #666;
          font-style: italic;
        }
        .resize-handles {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 16px;
          height: 16px;
          background-color: rgba(0, 0, 0, 0.5);
          cursor: nwse-resize;
          border-radius: 2px 0 0 0;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .resize-handles:hover {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
