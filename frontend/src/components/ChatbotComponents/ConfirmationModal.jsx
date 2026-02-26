import React, { useState, useEffect } from "react";
import { AlertTriangle, Share2, Loader2, Download } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  messages,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);

  // 🔄 Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsExporting(false);
      setPdfFile(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Step 1: Prepare PDF (no auto share)
  const preparePDF = async () => {
    try {
      setIsExporting(true);

      const chatDiv = document.createElement("div");
      chatDiv.style.width = "700px";
      chatDiv.style.backgroundColor = "white";
      chatDiv.style.padding = "16px";
      chatDiv.style.fontFamily = "'Inter', sans-serif";
      chatDiv.style.lineHeight = "1.4";

      // Header
      const header = document.createElement("div");
      header.innerHTML = `
        <div style="display:flex;align-items:center;margin-bottom:12px;border-bottom:1px solid #eee;padding-bottom:10px;">
          <img src="/raskabot.jpg" style="width:42px;height:42px;border-radius:50%;margin-right:10px;" />
          <div>
            <h2 style="font-size:18px;font-weight:600;margin:0;color:#111;">Raska Chat History</h2>
            <p style="margin:0;font-size:12px;color:#666;">Exported on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      `;
      chatDiv.appendChild(header);

      // Messages
      messages.forEach((msg) => {
        const msgWrapper = document.createElement("div");
        msgWrapper.style.display = "flex";
        msgWrapper.style.marginBottom = "8px";
        msgWrapper.style.justifyContent =
          msg.sender === "user" ? "flex-end" : "flex-start";
        msgWrapper.style.width = "100%"; // Ensure wrapper takes full width

        const bubble = document.createElement("div");
        bubble.style.padding = "8px 12px";
        bubble.style.borderRadius = "10px";
        bubble.style.maxWidth = "70%";
        bubble.style.width = "fit-content"; // Make width fit to content
        bubble.style.fontSize = "13px";
        bubble.style.wordBreak = "break-word";
        bubble.style.whiteSpace = "pre-wrap";
        bubble.style.display = "inline-block"; // Helps with content-based sizing
        bubble.style.minHeight = "0"; // Allow shrinking to content
        bubble.style.boxSizing = "border-box"; // Include padding in size calculations

        if (msg.sender === "user") {
          bubble.style.background = "linear-gradient(135deg, #9333ea, #ec4899)";
          bubble.style.color = "white";
        } else {
          bubble.style.background = "#f3f4f6";
          bubble.style.color = "#1f2937";
        }

        // Create message content div with proper sizing
        const messageContent = document.createElement("div");
        messageContent.style.margin = "0";
        messageContent.style.padding = "0";
        messageContent.style.lineHeight = "1.4";
        messageContent.style.whiteSpace = "pre-wrap";
        messageContent.textContent = msg.content;

        // Create timestamp div
        const timestamp = document.createElement("div");
        timestamp.style.fontSize = "10px";
        timestamp.style.opacity = "0.7";
        timestamp.style.textAlign = "right";
        timestamp.style.marginTop = "2px";
        timestamp.style.lineHeight = "1";
        timestamp.textContent = new Date(msg.timestamp).toLocaleTimeString([], { 
          hour: "2-digit", 
          minute: "2-digit" 
        });

        // Append content and timestamp to bubble
        bubble.appendChild(messageContent);
        bubble.appendChild(timestamp);

        msgWrapper.appendChild(bubble);
        chatDiv.appendChild(msgWrapper);
      });

      document.body.appendChild(chatDiv);

      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      let yOffset = 20;

      // First add the header
      const headerNode = chatDiv.querySelector("div");
      const headerCanvas = await html2canvas(headerNode, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: "#fff",
      });
      const headerImgData = headerCanvas.toDataURL("image/jpeg", 0.8);
      const headerHeight = (headerCanvas.height * (pdfWidth - 40)) / headerCanvas.width;
      pdf.addImage(headerImgData, "JPEG", 20, yOffset, pdfWidth - 40, headerHeight);
      yOffset += headerHeight + 20;

      // Then process each message wrapper separately
      const messageWrappers = chatDiv.querySelectorAll("div[style*='display: flex']");
      for (const wrapper of messageWrappers) {
        // Get natural dimensions of the message
        const rect = wrapper.getBoundingClientRect();
        const canvas = await html2canvas(wrapper, {
          scale: 2, // Higher scale for better quality
          useCORS: true,
          backgroundColor: "#fff",
          height: rect.height,
          width: rect.width,
          windowWidth: rect.width,
          windowHeight: rect.height,
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.9);
        // Calculate height while maintaining aspect ratio
        const imgHeight = (canvas.height * (pdfWidth - 40)) / canvas.width;
        const scaledHeight = Math.min(imgHeight, rect.height * 1.2); // Limit maximum height

        // If message doesn't fit on current page, start a new page
        if (yOffset + scaledHeight > pdfHeight - 20) {
          pdf.addPage();
          yOffset = 20; // Reset position for new page
        }

        // Add the message bubble
        pdf.addImage(imgData, "JPEG", 20, yOffset, pdfWidth - 40, scaledHeight);
        yOffset += scaledHeight + 10; // Add space between messages
      }

      document.body.removeChild(chatDiv);

      const blob = pdf.output("blob");
      const file = new File([blob], "raska-chat-history.pdf", {
        type: "application/pdf",
      });
      setPdfFile(file);
    } catch (err) {
      console.error("Error preparing PDF:", err);
      alert("Error preparing PDF");
    } finally {
      setIsExporting(false);
    }
  };

  // Step 2: Manual share/download
  const handleSharePDF = async () => {
    if (!pdfFile) return alert("Please prepare PDF first!");

    try {
      if (navigator.share && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          files: [pdfFile],
          title: "Raska Chat History",
          text: "My chat history with Raska",
        });
      } else {
        const url = URL.createObjectURL(pdfFile);
        const a = document.createElement("a");
        a.href = url;
        a.download = pdfFile.name;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-lg max-w-md w-full p-6 transform animate-slide-up">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-pink-600" />
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {title || "Are you sure?"}
          </h3>
          <p className="text-gray-600 mb-6">
            {message || "This action cannot be undone."}
          </p>

          <div className="flex flex-col gap-3 w-full">
            {/* Show only one button at a time */}
            {!pdfFile ? (
              <button
                onClick={preparePDF}
                disabled={isExporting}
                className="w-full px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Preparing PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Prepare Chat PDF
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleSharePDF}
                className="w-full px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share or Download PDF
              </button>
            )}

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={onConfirm}
                className="flex-1 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium text-sm"
              >
                Yes, delete chat
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
