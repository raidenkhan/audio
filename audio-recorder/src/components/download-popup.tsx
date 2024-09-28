"use client"

import { useState, useEffect } from "react"
import Button from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog"
import { ArrowDownTrayIcon, XMarkIcon, PlayIcon, TrashIcon } from '@heroicons/react/24/solid'
import { base64ToBlob } from '@/app/utils/audioUtils'; 

//import { Recording } from '@/app/types/Recording';

import { ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

interface Recording {
  id: string;
  filename: string;
  duration: number;
  audioData: string;
  url: string;
  createdAt: Date ;
}
interface DownloadPopupProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  recordings: (Blob | null)[];
  uploadedAudios: (File | null)[];
  onSelectRecording: (recording: Recording) => void;
}

export default function DownloadPopup({ isOpen, onOpenChange, recordings, uploadedAudios, onSelectRecording }: DownloadPopupProps) {
 
  const [serverRecordings, setServerRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allRecordings, setAllRecordings] = useState<Recording[]>([]);
 

  useEffect(() => {
    if (isOpen) {
      fetchRecordings();
    }
  }, [isOpen]);

  const fetchRecordings = async () => {
    setIsLoading(true);
    setError(null);
    try {
        //console.log(`fetching recordings ${process.env.NEXT_PUBLIC_API_BASE_URL}/api/recordings`)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/recordings`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch recordings');
      }
      const data = await response.json();
      setServerRecordings(data);
      console.log(data)
      setAllRecordings(data);
   
      updateAllRecordings(data);
    } catch (error) {
      setError('Error fetching recordings');
      console.error('Error fetching recordings:', error);
    } finally {
      setIsLoading(false);
      
     // setAllRecordings(serverRecordings);
      //console.log(allRecordings)
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
      // Remove the deleted recording from the serverRecordings state
      setServerRecordings(prevRecordings => prevRecordings.filter(rec => rec.id !== id));
      // Remove the deleted recording from the allRecordings list
      const updatedAllRecordings = allRecordings.filter(rec => rec.id !== id);
      // Update the state that's used to render the list
      setAllRecordings(updatedAllRecordings);
      
      // Add toast notification for successful deletion
      toast.success('Recording deleted successfully');
    } catch (error) {
      console.error('Error deleting recording:', error);
      // Optionally, show an error message to the user
      toast.error('Failed to delete recording. Please try again.');
    }
  };

  const handleDownload = async (filename: string, audioData: string) => {
    try {
      // Convert base64 to Blob
      const blob = base64ToBlob(audioData, 'audio/ogg');
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename.replace(/\.[^/.]+$/, "") + '.ogg'; // Ensure .ogg extension
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      toast.success("Download started")
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      // Optionally, show an error message to the user
    }
  };

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlay = (recording: Recording) => {
    //console.log(recording)
    onSelectRecording(recording);
    onOpenChange(false);
  };

  const updateAllRecordings = (serverRecs: Recording[]) => {
    const localRecordings = recordings
      .filter((rec): rec is Blob => rec !== null)
      .map((blob, index) => ({
        id: `local_${index}`,
        filename: `Recording ${index + 1}`,
        duration: 0,
        audioData: '',
        url: URL.createObjectURL(blob),
        createdAt: new Date()
      }));

    const uploadedRecordings = uploadedAudios
      .filter((file): file is File => file !== null)
      .map((file, index) => ({
        id: `uploaded_${index}`,
        filename: file.name,
        duration: 0,
        audioData: '',
        url: URL.createObjectURL(file),
        createdAt: new Date()
      }));

    setAllRecordings([...serverRecs, ...localRecordings, ...uploadedRecordings]);
  };

  return (
    <>
      <Toaster position="top-right" />
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
              <div className="flex justify-center items-center h-40">
                <ArrowPathIcon className="h-8 w-8 text-white animate-spin" />
              </div>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : allRecordings.length === 0  ? (
              <p>No recordings found.</p>
            ) : (
              
              <ul className="space-y-4">
              
                {allRecordings.map((recording) => (
                  <li key={recording.id} className="flex items-center justify-between bg-[#2a2424] p-4 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-[#3a3131] rounded-md flex items-center justify-center">
                        <PlayIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white text-lg">{recording.filename}</h3>
                        <p className="text-sm text-gray-400">{formatDuration(recording.duration)}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-[#3a3131]"
                        onClick={() => handlePlay(recording as Recording)}
                      >
                        <PlayIcon className="h-5 w-5" />
                        <span className="sr-only">Play {recording.filename}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-[#3a3131]"
                        onClick={() => handleDownload(recording.filename, recording.audioData)}
                      >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                        <span className="sr-only">Download {recording.filename}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-[#3a3131]"
                        onClick={() => handleDelete(recording.id)}
                      >
                        <TrashIcon className="h-5 w-5" />
                        <span className="sr-only">Delete {recording.filename}</span>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
