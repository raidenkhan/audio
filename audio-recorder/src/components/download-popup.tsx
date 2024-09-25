"use client"

import { useState, useEffect, useMemo } from "react"
import Button from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog"
import { ArrowDownTrayIcon, XMarkIcon, PlayIcon, TrashIcon } from '@heroicons/react/24/solid'

interface Recording {
  _id: string
  name: string
  duration: number
  filename: string
}

interface DownloadPopupProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  recordings: (Blob | null)[];
  uploadedAudios: (File | null)[];
}

export default function DownloadPopup({ isOpen, onOpenChange, recordings, uploadedAudios }: DownloadPopupProps) {
  const [serverRecordings, setServerRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchRecordings();
    }
  }, [isOpen]);

  const fetchRecordings = async () => {
    setIsLoading(true);
    setError(null);
    try {
        console.log(`fetching recordings ${process.env.NEXT_PUBLIC_API_BASE_URL}/api/recordings`)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/recordings`);
      if (!response.ok) {
        throw new Error('Failed to fetch recordings');
      }
      const data = await response.json();
      setServerRecordings(data);
    } catch (error) {
      setError('Error fetching recordings');
      console.error('Error fetching recordings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/recordings/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete recording');
      }
      setServerRecordings(serverRecordings.filter(rec => rec._id !== id));
    } catch (error) {
      console.error('Error deleting recording:', error);
      // Optionally, show an error message to the user
    }
  };

  const handleDownload = (filename: string, name: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://audio-2-qp7v.onrender.com';
    const downloadUrl = `${apiUrl}/api/recordings/download/${encodeURIComponent(filename)}`;
    window.open(downloadUrl, '_blank');
  };

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const allRecordings = useMemo(() => {
    const localRecordings = recordings
      .filter((rec): rec is Blob => rec !== null)
      .map((blob, index) => ({
        _id: `local_${index}`,
        name: `Recording ${index + 1}`,
        duration: 0, // You might want to calculate this
        filename: `recording_${index + 1}.webm`
      }));

    const uploadedRecordings = uploadedAudios
      .filter((file): file is File => file !== null)
      .map((file, index) => ({
        _id: `uploaded_${index}`,
        name: file.name,
        duration: 0, // You might want to calculate this
        filename: file.name
      }));

    return [...serverRecordings, ...localRecordings, ...uploadedRecordings];
  }, [serverRecordings, recordings, uploadedAudios]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] bg-[#1c1919] text-white border-[#3a3131]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">Your Recordings</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 text-white hover:bg-[#3a3131]"
            onClick={() => onOpenChange(false)}
          >
            <XMarkIcon className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>
        <div className="mt-4 overflow-y-auto max-h-[60vh] rounded-md border border-[#3a3131] p-4">
          {isLoading ? (
            <p>Loading recordings...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : allRecordings.length === 0 ? (
            <p>No recordings found.</p>
          ) : (
            <ul className="space-y-4">
              {allRecordings.map((recording) => (
                <li key={recording._id} className="flex items-center justify-between bg-[#2a2424] p-4 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-[#3a3131] rounded-md flex items-center justify-center">
                      <PlayIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white text-lg">{recording.name}</h3>
                      <p className="text-sm text-gray-400">{formatDuration(recording.duration)}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-[#3a3131]"
                      onClick={() => handleDownload(recording.filename, recording.name)}
                    >
                      <ArrowDownTrayIcon className="h-5 w-5" />
                      <span className="sr-only">Download {recording.name}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-[#3a3131]"
                      onClick={() => handleDelete(recording._id)}
                    >
                      <TrashIcon className="h-5 w-5" />
                      <span className="sr-only">Delete {recording.name}</span>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
