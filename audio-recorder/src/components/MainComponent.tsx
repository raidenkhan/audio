"use client"
import React, { useState, useMemo } from 'react'
import AudioRecorder from '@/components/RecordingSection'
import AudioPlayer from '@/components/AudioPlayer'
import DownloadPopup from '@/components/download-popup'
import Button from "@/components/ui/button"
import { Recording } from '../app/types/Recording';

const MainComponent = () => {
    const [recordings, setRecordings] = useState<(Blob | null)[]>([null, null, null, null]);
    const [uploadedAudios, setUploadedAudios] = useState<(File | null)[]>([null, null, null, null]);
    const [currentSlot, setCurrentSlot] = useState<number>(0);
    const [isDownloadPopupOpen, setIsDownloadPopupOpen] = useState(false);
    const [selectedServerRecording, setSelectedServerRecording] = useState<Recording | null>(null);
    const [recordingNames, setRecordingNames] = useState<string[]>(['', '', '', '']);
    const [recordingDurations, setRecordingDurations] = useState<number[]>([0, 0, 0, 0]);

    const nextSlot = () => {
        setRecordingNames(prevNames => {
            const newNames = [...prevNames];
            const emptyIndex = newNames.findIndex(name => name === '');
            if (emptyIndex !== -1) {
                newNames[emptyIndex] = `Recording ${emptyIndex + 1}`;
            }
            return newNames;
        });
        setCurrentSlot((prev) => (prev + 1) % 4);
    };

    const prevSlot = () => {
        setCurrentSlot((prev) => (prev - 1 + 4) % 4);
    };
//fix this part
    const clearRecording = async (slot: number) => {
        const recording = recordings[slot];
        if (recording) {
            

                setRecordings((prev) => {
                    const newRecordings = [...prev];
                    newRecordings[slot] = null;
                    return newRecordings;
                });
                setUploadedAudios((prev) => {
                    const newUploadedAudios = [...prev];
                    newUploadedAudios[slot] = null;
                    return newUploadedAudios;
                });
                setRecordingDurations((prev) => {
                    const newDurations = [...prev];
                    newDurations[slot] = 0;
                    return newDurations;
                });
          
        }
    };

    // Calculate activeRecordings
    const activeRecordings = useMemo(() => {
        return recordings.map(recording => recording !== null);
    }, [recordings]);

    const handleSelectRecording = (recording: Recording) => {
        setSelectedServerRecording(recording);
        // Optionally, you might want to set the current slot to a specific value or a new "server" slot
        // setCurrentSlot(4); // Assuming 4 is a new slot for server recordings
    };

    // const setRecordingName = (slot: number, name: string) => {
    //     setRecordingNames(prev => {
    //         const newNames = [...prev];
    //         newNames[slot] = name;
    //         return newNames;
    //     });
    // };

    return (
        <div className="bg-[#1E1717] min-h-screen p-2 sm:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl sm:text-3xl font-bold text-white">Audio Recorder</h1>
                <Button 
                    variant="outline" 
                    className="bg-[#3a3131] text-white hover:bg-[#4a4141]"
                    onClick={() => setIsDownloadPopupOpen(true)}
                >
                    View Recordings
                </Button>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <AudioRecorder 
                    recordings={recordings} 
                    setRecordings={setRecordings} 
                    uploadedAudios={uploadedAudios}
                    setUploadedAudios={setUploadedAudios}
                    currentSlot={currentSlot}
                    nextSlot={nextSlot}
                    prevSlot={prevSlot}
                    activeRecordings={activeRecordings}
                    clearRecording={clearRecording}
                    //setRecordingName={setRecordingName}
                    recordingDurations={recordingDurations}
                    setRecordingDurations={setRecordingDurations}
                />
                <AudioPlayer 
                    recordings={recordings} 
                    uploadedAudios={uploadedAudios} 
                    currentSlot={currentSlot}
                    nextSlot={nextSlot}
                    prevSlot={prevSlot}
                    clearRecording={clearRecording}
                    selectedServerRecording={selectedServerRecording}
                    recordingNames={recordingNames}
                    recordingDurations={recordingDurations}
                />
            </div>
            <DownloadPopup 
                isOpen={isDownloadPopupOpen} 
                onOpenChange={setIsDownloadPopupOpen}
                recordings={recordings}
                uploadedAudios={uploadedAudios}
                onSelectRecording={(recording: Recording) => handleSelectRecording(recording)}
            />
        </div>
    )
}

export default MainComponent