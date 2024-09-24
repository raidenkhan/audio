"use client"
import React, { useState, useMemo } from 'react'
import AudioRecorder from '@/components/RecordingSection'
import AudioPlayer from '@/components/AudioPlayer'



const MainComponent = () => {
    const [recordings, setRecordings] = useState<(Blob | null)[]>([null, null, null, null]);
    const [uploadedAudios, setUploadedAudios] = useState<(File | null)[]>([null, null, null, null]);
    const [currentSlot, setCurrentSlot] = useState<number>(0);

    const nextSlot = () => {
        setCurrentSlot((prev) => (prev + 1) % 4);
    };

    const prevSlot = () => {
        setCurrentSlot((prev) => (prev - 1 + 4) % 4);
    };

    const clearRecording = (slot: number) => {
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
    };

    // Calculate activeRecordings
    const activeRecordings = useMemo(() => {
        return recordings.map(recording => recording !== null);
    }, [recordings]);

    return (
        <div className="bg-[#1E1717] min-h-screen">
        
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 p-8'>
                <AudioRecorder 
                    recordings={recordings} 
                    setRecordings={setRecordings} 
                    uploadedAudios={uploadedAudios}
                    setUploadedAudios={setUploadedAudios}
                    currentSlot={currentSlot}
                    setCurrentSlot={setCurrentSlot}
                    nextSlot={nextSlot}
                    prevSlot={prevSlot}
                    activeRecordings={activeRecordings}
                    clearRecording={clearRecording}
                />
                <AudioPlayer 
                    recordings={recordings} 
                    uploadedAudios={uploadedAudios} 
                    currentSlot={currentSlot}
                    nextSlot={nextSlot}
                    prevSlot={prevSlot}
                    clearRecording={clearRecording}
                />
            </div>
        </div>
    )
}

export default MainComponent