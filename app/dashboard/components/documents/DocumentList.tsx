// app/dashboard/components/documents/DocumentList.tsx
"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import DocumentCard from "./DocumentCard";
import { DocumentWithCategory } from "@/app/types/document";

// สร้าง interface สำหรับ document ที่ผ่านการแปลงเป็น serialized แล้ว
interface SerializedDocument extends Omit<DocumentWithCategory, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

interface DocumentListProps {
  documents: SerializedDocument[];
  deleteAction: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export default function DocumentList({ 
  documents, 
  deleteAction 
}: DocumentListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("ยืนยันการลบเอกสาร?")) return;

    setDeletingId(id);
    try {
      const result = await deleteAction(id.toString());
      if (result.success) {
        toast.success("ลบเอกสารสำเร็จ");
      } else {
        toast.error(result.error || "ไม่สามารถลบเอกสารได้");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("เกิดข้อผิดพลาดในการลบเอกสาร");
    } finally {
      setDeletingId(null);
    }
  };

  if (!documents || documents.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-gray-500">ยังไม่มีเอกสารในระบบ</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {documents.map((document) => (
        <DocumentCard
          key={`doc-${document.id}`}
          document={document}
          onDelete={() => handleDelete(document.id)}
          isDeleting={deletingId === document.id}
        />
      ))}
    </div>
  );
}